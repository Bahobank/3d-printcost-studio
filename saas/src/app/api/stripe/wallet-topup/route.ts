import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { localDevAuthEnabled } from "@/lib/auth-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const presetAmounts = new Set([100, 300, 500, 1000, 2000]);

type TopUpMethod = "auto" | "promptpay";
type CheckoutLanguage = "th" | "en";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
}

function cleanTopUpAmount(value: FormDataEntryValue | null) {
  const amount = Math.round(Number(value ?? 0));
  if (presetAmounts.has(amount)) return amount;
  if (amount >= 50 && amount <= 50000) return amount;
  return null;
}

function cleanLanguage(value: FormDataEntryValue | null): CheckoutLanguage {
  return String(value ?? "").toLowerCase().startsWith("en") ? "en" : "th";
}

function cleanMethod(value: FormDataEntryValue | null): TopUpMethod | null {
  const method = String(value ?? "auto");
  if (method === "auto" || method === "promptpay") return method;
  return null;
}

function productionStripeIsInTestMode() {
  return process.env.VERCEL_ENV === "production" && process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
}

function paymentUnavailableUrl(request: Request, reason: string) {
  const url = new URL("/billing", request.url);
  url.searchParams.set("checkout", "payment-unavailable");
  url.searchParams.set("paymentMode", "wallet_topup");
  url.searchParams.set("reason", reason);
  return url;
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }

  const amount = cleanTopUpAmount(formData.get("amount"));
  const method = cleanMethod(formData.get("method"));
  const language = cleanLanguage(formData.get("language"));

  if (!amount) {
    return new Response("Invalid amount", { status: 400 });
  }

  if (!method) {
    return new Response("Invalid payment method", { status: 400 });
  }

  if (localDevAuthEnabled()) {
    return NextResponse.redirect(new URL(`/billing?checkout=demo-wallet-topup&amount=${amount}`, request.url), 303);
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  if (productionStripeIsInTestMode()) {
    console.error("Production Stripe wallet top-up blocked because STRIPE_SECRET_KEY is a test key");
    return NextResponse.redirect(paymentUnavailableUrl(request, "stripe-test-mode"), 303);
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe is not configured for wallet top-up", error);
    return NextResponse.redirect(paymentUnavailableUrl(request, "stripe-secret"), 303);
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("display_name,stripe_customer_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

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

  try {
    const metadata = {
      amount: String(amount),
      language,
      payment_method: method,
      payment_mode: "wallet_topup",
      payment_type: method === "promptpay" ? "wallet_topup_promptpay" : "wallet_topup_card",
      user_id: userData.user.id,
    };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      customer: customerId,
      client_reference_id: userData.user.id,
      locale: method === "promptpay" ? (language === "en" ? "en" : "th") : "auto",
      submit_type: "pay",
      payment_method_types: method === "promptpay" ? ["promptpay"] : ["card"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: "3D PrintCost Studio Wallet top-up",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata,
      payment_intent_data: {
        metadata,
      },
      success_url: `${appUrl()}/dashboard?checkout=wallet-topup-success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/pricing?lang=${language}&checkout=cancelled`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return NextResponse.redirect(paymentUnavailableUrl(request, "missing-checkout-url"), 303);
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Unable to create Stripe Wallet top-up Checkout Session", error);
    return NextResponse.redirect(paymentUnavailableUrl(request, method === "promptpay" ? "promptpay-unavailable" : "stripe-checkout-unavailable"), 303);
  }
}