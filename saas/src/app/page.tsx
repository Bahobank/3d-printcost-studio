import { redirect } from "next/navigation";

type HomeSearchParams = {
  code?: string;
  next?: string;
  lang?: string;
  token_hash?: string;
  type?: string;
  error?: string;
  error_description?: string;
};

const CALLBACK_PARAM_KEYS: (keyof HomeSearchParams)[] = [
  "code",
  "lang",
  "token_hash",
  "type",
  "error",
  "error_description",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>;
}) {
  const params = searchParams ? await searchParams : undefined;

  if (params?.code || params?.token_hash || params?.error || params?.error_description) {
    const callbackParams = new URLSearchParams();

    CALLBACK_PARAM_KEYS.forEach((key) => {
      const value = params[key];
      if (value) callbackParams.set(key, value);
    });

    if (params.next?.startsWith("/") && !params.next.startsWith("//")) {
      callbackParams.set("next", params.next);
    }

    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  redirect("/login");
}