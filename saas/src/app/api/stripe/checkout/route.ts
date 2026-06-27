import { NextResponse } from "next/server";
import { localDevAuthEnabled } from "@/lib/auth-config";
import { getPlanAmount, isBillingCycle, isPlan, type BillingCycle, type SubscriptionPlan } from "@/lib/billing-plans";
import { normalizePromoCode, recordPromoRedemption, validatePromoCode } from "@/lib/promo";
import { updateUserProfileByUserId } from "@/lib/profile-update";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getPriceId, getStripe } from "@/lib/stripe";

type CheckoutMode = "subscription" | "promptpay_period";
type CheckoutLanguage = "th" | "en";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
}

function cleanLanguage(value: FormDataEntryValue | null): CheckoutLanguage {
  return String(value ?? "").toLowerCase().startsWith("en") ? "en" : "th";
}

function setupRequiredUrl(request: Request, plan: SubscriptionPlan, billingCycle: BillingCycle, reason: string) {
  const url = new URL("/billing", request.url);
  url.searchParams.set("checkout", "setup-required");
  url.searchParams.set("plan", plan);
  url.searchParams.set("billingCycle", billingCycle);
  url.searchParams.set("reason", reason);
  return url;
}

function paymentUnavailableUrl(request: Request, paymentMode: CheckoutMode, plan: SubscriptionPlan, billingCycle: BillingCycle, reason: string) {
  const url = new URL("/billing", request.url);
  url.searchParams.set("checkout", "payment-unavailable");
  url.searchParams.set("paymentMode", paymentMode);
  url.searchParams.set("plan", plan);
  url.searchParams.set("billingCycle", billingCycle);
  url.searchParams.set("reason", reason);
  return url;
}

function isCheckoutMode(value: string): value is CheckoutMode {
  return value === "subscription" || value === "promptpay_period";
}

function productionStripeIsInTestMode() {
  return process.env.VERCEL_ENV === "production" && process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }

  const planValue = String(formData.get("plan") ?? "");
  const billingCycleValue = String(formData.get("billingCycle") ?? "");
  const checkoutModeValue = String(formData.get("paymentMode") ?? "subscription");
  const language = cleanLanguage(formData.get("language"));
  const promoCode = normalizePromoCode(String(formData.get("promoCode") ?? ""));

  if (!isPlan(planValue) || !isBillingCycle(billingCycleValue)) {
    return new Response("Invalid plan", { status: 400 });
  }

  if (!isCheckoutMode(checkoutModeValue)) {
    return new Response("Invalid payment mode", { status: 400 });
  }

  if (localDevAuthEnabled()) {
    return NextResponse.redirect(new URL(`/billing?checkout=demo&plan=${planValue}&billingCycle=${billingCycleValue}&paymentMode=${checkoutModeValue}`, request.url), 303);
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.redirect(setupRequiredUrl(request, planValue, billingCycleValue, "stripe-secret"), 303);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.redirect(setupRequiredUrl(request, planValue, billingCycleValue, "supabase-service-role"), 303);
  }

  if (productionStripeIsInTestMode()) {
    console.error("Production Stripe checkout blocked because STRIPE_SECRET_KEY is a test key");
    return NextResponse.redirect(paymentUnavailableUrl(request, checkoutModeValue, planValue, billingCycleValue, "stripe-test-mode"), 303);
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe is not configured", error);
    return NextResponse.redirect(setupRequiredUrl(request, planValue, billingCycleValue, "stripe-secret"), 303);
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user?.email) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const admin = createAdminClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userData.user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData.user.email,
      name: profile?.display_name ?? undefined,
      metadata: {
        user_id: userData.user.id,
      },
    });
    customerId = customer.id;

    await admin
      .from("user_profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", userData.user.id);
  }

  const amount = getPlanAmount(planValue, billingCycleValue);
  const promo = promoCode
    ? await validatePromoCode({
        amount,
        billingCycle: billingCycleValue,
        code: promoCode,
        plan: planValue,
        supabase: admin,
      })
    : null;

  if (promo && !promo.valid) {
    const url = setupRequiredUrl(request, planValue, billingCycleValue, `promo-${promo.reason}`);
    url.searchParams.set("promoCode", promoCode);
    return NextResponse.redirect(url, 303);
  }

  if (promo?.valid && promo.type === "access") {
    const startsAt = new Date();
    const endsAt = promo.code.access_lifetime
      ? null
      : new Date(new Date(startsAt).setMonth(startsAt.getMonth() + Number(promo.code.access_months ?? 1))).toISOString();

    await updateUserProfileByUserId(admin, userData.user.id, {
      billing_cycle: billingCycleValue,
      subscription_ends_at: endsAt,
      subscription_plan: planValue,
      subscription_started_at: startsAt.toISOString(),
      subscription_status: "active",
      subscription_payment_source: "access_code",
      updated_at: new Date().toISOString(),
    });

    await recordPromoRedemption({
      accessEndsAt: endsAt,
      accessStartsAt: startsAt.toISOString(),
      code: promo.code,
      supabase: admin,
      userId: userData.user.id,
    });

    return NextResponse.redirect(new URL("/billing?checkout=access-success", request.url), 303);
  }

  const finalAmount = promo?.valid ? promo.finalAmount : amount;
  if (finalAmount <= 0) {
    return NextResponse.redirect(setupRequiredUrl(request, planValue, billingCycleValue, "invalid-amount"), 303);
  }

  let priceId: string;
  try {
    priceId = getPriceId(planValue, billingCycleValue);
  } catch (error) {
    console.error("Missing Stripe price id", error);
    return NextResponse.redirect(setupRequiredUrl(request, planValue, billingCycleValue, "stripe-price"), 303);
  }

  const discounts = promo?.valid && promo.code.stripe_coupon_id
    ? [{ coupon: promo.code.stripe_coupon_id }]
    : undefined;

  if (promo?.valid && promo.discountAmount > 0 && !discounts) {
    const url = setupRequiredUrl(request, planValue, billingCycleValue, "promo-stripe-coupon");
    url.searchParams.set("promoCode", promoCode);
    return NextResponse.redirect(url, 303);
  }

  if (checkoutModeValue === "promptpay_period") {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        client_reference_id: userData.user.id,
        payment_method_types: ["promptpay"],
        locale: language === "en" ? "en" : "th",
        submit_type: "pay",
        line_items: [
          {
            price_data: {
              currency: "thb",
              product_data: {
                name: `3D PrintCost Studio ${planValue === "maker" ? "Maker" : "Studio"} ${billingCycleValue === "monthly" ? "Monthly" : "Yearly"}`,
              },
              unit_amount: finalAmount * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          billing_cycle: billingCycleValue,
          original_amount: String(amount),
          payment_mode: "promptpay_period",
          payment_type: "promptpay_one_time",
          plan: planValue,
          promo_code_id: promo?.valid ? promo.code.id : "",
          promo_discount_amount: promo?.valid ? String(promo.discountAmount) : "0",
          user_id: userData.user.id,
        },
        payment_intent_data: {
          metadata: {
            billing_cycle: billingCycleValue,
            original_amount: String(amount),
            payment_mode: "promptpay_period",
            payment_type: "promptpay_one_time",
            plan: planValue,
            promo_code_id: promo?.valid ? promo.code.id : "",
            promo_discount_amount: promo?.valid ? String(promo.discountAmount) : "0",
            user_id: userData.user.id,
          },
        },
        success_url: `${appUrl()}/billing?checkout=success&paymentMode=promptpay_period&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl()}/pricing?lang=${language}&checkout=cancelled`,
      });

      if (!session.url) {
        return NextResponse.redirect(paymentUnavailableUrl(request, "promptpay_period", planValue, billingCycleValue, "missing-checkout-url"), 303);
      }

      return NextResponse.redirect(session.url, 303);
    } catch (error) {
      console.error("Unable to create Stripe PromptPay Checkout Session", error);
      return NextResponse.redirect(paymentUnavailableUrl(request, "promptpay_period", planValue, billingCycleValue, "promptpay-unavailable"), 303);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: userData.user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    discounts,
    metadata: {
      billing_cycle: billingCycleValue,
      payment_mode: "subscription",
      plan: planValue,
      promo_code_id: promo?.valid ? promo.code.id : "",
      user_id: userData.user.id,
    },
    success_url: `${appUrl()}/billing?checkout=success&paymentMode=subscription&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/pricing?lang=${language}&checkout=cancelled`,
    subscription_data: {
      metadata: {
        user_id: userData.user.id,
        plan: planValue,
        billing_cycle: billingCycleValue,
        payment_mode: "subscription",
        promo_code_id: promo?.valid ? promo.code.id : "",
      },
    },
  });

  return NextResponse.redirect(session.url!, 303);
}