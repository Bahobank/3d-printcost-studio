import { headers } from "next/headers";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, planFromPriceId } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    return new Response(`Webhook error: ${(error as Error).message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existing) {
    return Response.json({ received: true, duplicate: true });
  }

  await supabase.from("stripe_webhook_events").insert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await updateProfileFromCheckoutSession(session);
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    await updateProfileFromSubscription(subscription, event.type === "customer.subscription.deleted");
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    await updateProfileByCustomer(String(invoice.customer), { subscription_status: "past_due" });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    await updateProfileByCustomer(String(invoice.customer), { subscription_status: "active" });
  }

  return Response.json({ received: true });
}

async function updateProfileFromCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId) return;

  const supabase = createAdminClient();
  await supabase
    .from("user_profiles")
    .update({
      stripe_customer_id: String(session.customer),
      stripe_subscription_id: String(session.subscription),
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

async function updateProfileFromSubscription(subscription: Stripe.Subscription, deleted = false) {
  const supabase = createAdminClient();
  const item = subscription.items.data[0];
  const plan = planFromPriceId(item?.price.id);
  const userId = subscription.metadata.user_id;

  const update = {
    stripe_customer_id: String(subscription.customer),
    stripe_subscription_id: subscription.id,
    subscription_status: deleted ? "canceled" : subscription.status,
    subscription_plan: plan,
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    await supabase.from("user_profiles").update(update).eq("user_id", userId);
    return;
  }

  await supabase.from("user_profiles").update(update).eq("stripe_customer_id", String(subscription.customer));
}

async function updateProfileByCustomer(customerId: string, update: Record<string, unknown>) {
  const supabase = createAdminClient();
  await supabase
    .from("user_profiles")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId);
}
