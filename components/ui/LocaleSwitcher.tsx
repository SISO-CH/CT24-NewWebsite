"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "fr", label: "FR" },
  { code: "it", label: "IT" },
  { code: "en", label: "EN" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];
const PREFIXED: LocaleCode[] = ["fr", "it", "en"];

function buildLocalePath(currentPath: string, currentLocale: string, targetLocale: LocaleCode): string {
  // Strip current locale prefix if present
  let path = currentPath;
  if (PREFIXED.includes(currentLocale as LocaleCode)) {
    path = path.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "") || "/";
  }
  // Add target locale prefix
  if (PREFIXED.includes(targetLocale)) {
    return `/${targetLocale}${path === "/" ? "" : path}`;
  }
  return path || "/";
}

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-[#374151] hover:text-[var(--ct-cyan)] transition-colors"
        aria-label="Sprache wählen"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={14} />
        {locale.toUpperCase()}
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-lg py-1 min-w-[80px] z-50"
        >
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === locale}
              onClick={() => {
                setOpen(false);
                const target = buildLocalePath(pathname, locale, code);
                router.push(target);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
                code === locale
                  ? "text-[var(--ct-cyan)]"
                  : "text-[#374151] hover:text-[var(--ct-cyan)] hover:bg-[var(--ct-light)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
