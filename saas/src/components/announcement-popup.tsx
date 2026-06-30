"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import type { AnnouncementPayload } from "@/app/api/announcements/route";

type Lang = "th" | "en" | "zh" | "ja" | "ko";
const LANGS: Lang[] = ["th", "en", "zh", "ja", "ko"];

const NEW_BADGE: Record<Lang, string> = {
  th: "มีอัปเดตใหม่",
  en: "What's new",
  zh: "最新更新",
  ja: "新着情報",
  ko: "새 소식",
};
const CLOSE_LABEL: Record<Lang, string> = {
  th: "ปิด",
  en: "Close",
  zh: "关闭",
  ja: "閉じる",
  ko: "닫기",
};
const OK_LABEL: Record<Lang, string> = {
  th: "รับทราบ",
  en: "Got it",
  zh: "知道了",
  ja: "了解",
  ko: "확인",
};

function detectLang(): Lang {
  try {
    const raw = (window.localStorage.getItem("printCostLanguage") || window.localStorage.getItem("language") || document.documentElement.lang || navigator.language || "th").toLowerCase().split("-")[0];
    return (LANGS as string[]).includes(raw) ? (raw as Lang) : "th";
  } catch {
    return "th";
  }
}

export function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<AnnouncementPayload | null>(null);
  const [lang, setLang] = useState<Lang>("th");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setLang(detectLang());
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/announcements", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { announcement: AnnouncementPayload | null };
        if (!cancelled && data.announcement) {
          setAnnouncement(data.announcement);
          // next tick → trigger entrance transition
          requestAnimationFrame(() => setShown(true));
        }
      } catch {
        // ignore — announcements are non-critical
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!announcement) return null;

  // Pick the copy for the user's selected language; fall back en → th → base columns.
  const tr = announcement.translations ?? null;
  const picked = tr?.[lang] ?? tr?.en ?? tr?.th ?? null;
  const title = (picked?.title ?? announcement.title ?? "").trim();
  const body = (picked?.body ?? announcement.body ?? "").trim();
  const ctaLabel = (picked?.ctaLabel ?? announcement.ctaLabel ?? "").trim();

  const dismiss = (then?: () => void) => {
    setShown(false);
    const id = announcement.id;
    fetch("/api/announcements/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
    setTimeout(() => {
      setAnnouncement(null);
      then?.();
    }, 180);
  };

  const onCta = () => {
    const url = announcement.ctaUrl?.trim();
    if (url && /^https?:\/\//i.test(url)) {
      dismiss(() => window.open(url, "_blank", "noopener,noreferrer"));
    } else if (url && url.startsWith("/")) {
      dismiss(() => {
        window.location.href = url;
      });
    } else {
      dismiss();
    }
  };

  const hasCta = Boolean(ctaLabel);

  return (
    <div
      className={`fixed inset-0 z-[65] grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(2,6,23,0.45)] transition-all duration-200 ${shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"}`}
      >
        <button
          aria-label="close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-slate-500 shadow-sm backdrop-blur transition hover:bg-slate-100 hover:text-slate-700"
          onClick={() => dismiss()}
          type="button"
        >
          <X size={18} />
        </button>

        {announcement.imageUrl ? (
          <div className="aspect-[16/10] w-full bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={announcement.imageUrl} alt="" className="h-full w-full object-contain" />
          </div>
        ) : null}

        <div className="p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-blue-600">
            <Megaphone size={13} strokeWidth={2.75} />
            {NEW_BADGE[lang]}
          </span>
          <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">{title}</h2>
          <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">{body}</p>

          <div className="mt-6 flex items-center justify-end gap-3">
            {hasCta ? (
              <>
                <button
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100"
                  onClick={() => dismiss()}
                  type="button"
                >
                  {CLOSE_LABEL[lang]}
                </button>
                <button
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                  onClick={onCta}
                  type="button"
                >
                  {ctaLabel}
                </button>
              </>
            ) : (
              <button
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                onClick={() => dismiss()}
                type="button"
              >
                {OK_LABEL[lang]}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
