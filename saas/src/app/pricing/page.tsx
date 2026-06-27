import { getSessionAndProfile } from "@/lib/subscription";
import { PricingPageClient } from "./pricing-page-client";

type PricingLanguage = "th" | "en" | "zh" | "ja" | "ko";

type PricingPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

const languageCodes = new Set<PricingLanguage>(["th", "en", "zh", "ja", "ko"]);

function normalizePricingLanguage(value: unknown): PricingLanguage {
  const text = String(value ?? "").toLowerCase();
  const shortCode = text.split("-")[0] as PricingLanguage;
  return languageCodes.has(shortCode) ? shortCode : "th";
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  await getSessionAndProfile();
  const params = searchParams ? await searchParams : undefined;
  const language = normalizePricingLanguage(firstParam(params?.lang));
  return <PricingPageClient language={language} />;
}