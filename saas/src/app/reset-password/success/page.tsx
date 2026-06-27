import { getAuthLanguage } from "@/lib/auth-i18n";
import { ResetPasswordSuccessClient } from "./success-client";

export default async function ResetPasswordSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const lang = getAuthLanguage(params?.lang);
  return <ResetPasswordSuccessClient lang={lang} />;
}