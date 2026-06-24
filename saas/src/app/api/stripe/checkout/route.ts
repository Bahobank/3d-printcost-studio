import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPriceId, getStripe } from "@/lib/stripe";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const formData = await request.formData();
  const plan = String(formData.get("plan") ?? "");
  let priceId: string;

  try {
    priceId = getPriceId(plan);
  } catch {
    return new Response("Invalid plan", { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user?.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

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

    const admin = createAdminClient();
    await admin
      .from("user_profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", userData.user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: userData.user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl()}/billing?checkout=success`,
    cancel_url: `${appUrl()}/pricing?checkout=cancelled`,
    subscription_data: {
      metadata: {
        user_id: userData.user.id,
        plan,
      },
    },
  });

  return NextResponse.redirect(session.url!, 303);
}
