export const LOCAL_DEV_AUTH_COOKIE = "printcost_dev_auth";

export const missingSupabaseConfigMessage = "ยังไม่ได้ตั้งค่า Supabase Auth ในไฟล์ .env.local";

export function appUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3002";
}

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const missing = [
    url ? null : "NEXT_PUBLIC_SUPABASE_URL",
    anonKey ? null : "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean) as string[];

  return {
    url,
    anonKey,
    configured: missing.length === 0,
    missing,
  };
}

export function supabaseAuthConfigured() {
  return supabaseConfig().configured;
}

export function requireSupabaseConfig() {
  const config = supabaseConfig();

  if (!config.configured) {
    throw new Error(`${missingSupabaseConfigMessage}: ${config.missing.join(", ")}`);
  }

  return config;
}

export function localDevAuthEnabled() {
  return process.env.ENABLE_LOCAL_DEV_AUTH === "true" && process.env.NODE_ENV !== "production";
}

export function encodeLocalDevSession(email: string) {
  return Buffer.from(JSON.stringify({ email, createdAt: new Date().toISOString() }), "utf8").toString("base64url");
}

export function decodeLocalDevSession(value?: string) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      email?: unknown;
      createdAt?: unknown;
    };

    if (typeof parsed.email !== "string" || !parsed.email.includes("@")) {
      return null;
    }

    return {
      email: parsed.email,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}