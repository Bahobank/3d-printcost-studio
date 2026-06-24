"use client";

import { Languages } from "lucide-react";

type LoginLanguageSelectProps = {
  current: string;
};

const options = [
  { value: "th", label: "ไทย" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

export function LoginLanguageSelect({ current }: LoginLanguageSelectProps) {
  return (
    <label className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">
      <Languages size={16} className="text-blue-600" />
      <select
        aria-label="Language"
        className="bg-transparent outline-none"
        defaultValue={current}
        onChange={(event) => {
          const url = new URL(window.location.href);
          url.searchParams.set("lang", event.target.value);
          window.location.href = url.toString();
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
