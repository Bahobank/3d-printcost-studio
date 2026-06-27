import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getWalletBalance } from "@/lib/wallet";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ balance: 0 }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const balance = await getWalletBalance(admin, userData.user.id);
    return NextResponse.json({ balance, currency: "thb" });
  } catch (error) {
    console.error("[wallet] Unable to load balance", error);
    return NextResponse.json({ balance: 0, currency: "thb", unavailable: true });
  }
}
