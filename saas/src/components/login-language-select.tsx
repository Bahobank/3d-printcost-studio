"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type LoginLanguageSelectProps = {
  current: string;
};

/**
 * Flags are drawn inline rather than written as emoji: Windows ships no flag
 * glyphs, so a flag emoji renders there as the plain letters "TH", "GB", and so on.
 */
function ThaiFlag() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 20 14">
      <rect fill="#a51931" height="14" width="20" />
      <rect fill="#f4f5f8" height="8" width="20" y="3" />
      <rect fill="#2d2a4a" height="4" width="20" y="5" />
    </svg>
  );
}

function UnitedKingdomFlag() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 20 14">
      <rect fill="#012169" height="14" width="20" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#fff" strokeWidth="3" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#c8102e" strokeWidth="1.4" />
      {/* the centre cross sits on top, white bordered then red */}
      <path d="M10 0v14M0 7h20" stroke="#fff" strokeWidth="4.4" />
      <path d="M10 0v14M0 7h20" stroke="#c8102e" strokeWidth="2.4" />
    </svg>
  );
}

/** A five-pointed star of radius 1 centred on the origin, ready to be scaled. */
const STAR_PATH =
  "M0-1 .225-.309.951-.309.363.118.588.809 0 .382-.588.809-.363.118-.951-.309-.225-.309Z";

function ChinaFlag() {
  const smallStars = [
    { x: 7.4, y: 1.7 },
    { x: 9.1, y: 3.2 },
    { x: 9.1, y: 5.3 },
    { x: 7.4, y: 6.7 },
  ];

  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 20 14">
      <rect fill="#ee1c25" height="14" width="20" />
      <g fill="#ffde00">
        <path d={STAR_PATH} transform="translate(3.6 4.2) scale(2.4)" />
        {smallStars.map((star) => (
          <path d={STAR_PATH} key={`${star.x}-${star.y}`} transform={`translate(${star.x} ${star.y}) scale(0.85)`} />
        ))}
      </g>
    </svg>
  );
}

function JapanFlag() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 20 14">
      <rect fill="#fff" height="14" width="20" />
      <circle cx="10" cy="7" fill="#bc002d" r="4.2" />
    </svg>
  );
}

function KoreaFlag() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 20 14">
      <rect fill="#fff" height="14" width="20" />
      <path d="M10 3.2a3.8 3.8 0 0 1 0 7.6 1.9 1.9 0 0 0 0-3.8 1.9 1.9 0 0 1 0-3.8z" fill="#cd2e3a" />
      <path d="M10 10.8a3.8 3.8 0 0 1 0-7.6 1.9 1.9 0 0 0 0 3.8 1.9 1.9 0 0 1 0 3.8z" fill="#0047a0" />
      {/* the four trigrams, three short bars each, angled toward the centre */}
      <g fill="#000">
        {[
          { x: 3.5, y: 3.5, rotate: -56 },
          { x: 16.5, y: 3.5, rotate: 56 },
          { x: 3.5, y: 10.5, rotate: 56 },
          { x: 16.5, y: 10.5, rotate: -56 },
        ].map((trigram) => (
          <g
            key={`${trigram.x}-${trigram.y}`}
            transform={`translate(${trigram.x} ${trigram.y}) rotate(${trigram.rotate})`}
          >
            <rect height="0.42" width="2.8" x="-1.4" y="-0.92" />
            <rect height="0.42" width="2.8" x="-1.4" y="-0.21" />
            <rect height="0.42" width="2.8" x="-1.4" y="0.5" />
          </g>
        ))}
      </g>
    </svg>
  );
}

const options = [
  { value: "th", label: "ไทย", Flag: ThaiFlag },
  { value: "en", label: "English", Flag: UnitedKingdomFlag },
  { value: "zh", label: "中文", Flag: ChinaFlag },
  { value: "ja", label: "日本語", Flag: JapanFlag },
  { value: "ko", label: "한국어", Flag: KoreaFlag },
];

export function LoginLanguageSelect({ current }: LoginLanguageSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = options.find((option) => option.value === current) ?? options[0];
  const ActiveFlag = active.Flag;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", value);
    window.location.href = url.toString();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Language"
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="h-3.5 w-5 overflow-hidden rounded-[2px] ring-1 ring-black/10">
          <ActiveFlag />
        </span>
        {active.label}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <ul
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
          role="listbox"
        >
          {options.map((option) => {
            const OptionFlag = option.Flag;
            const selected = option.value === active.value;
            return (
              <li key={option.value}>
                <button
                  aria-selected={selected}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold transition hover:bg-slate-50 ${
                    selected ? "text-blue-600" : "text-slate-700"
                  }`}
                  onClick={() => choose(option.value)}
                  role="option"
                  type="button"
                >
                  <span className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10">
                    <OptionFlag />
                  </span>
                  <span className="flex-1">{option.label}</span>
                  {selected ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
