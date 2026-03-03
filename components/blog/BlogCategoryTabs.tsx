"use client";

import { cn } from "@/lib/utils";

const TABS = [
  { key: "all",      label: "Alle" },
  { key: "ratgeber", label: "Ratgeber" },
  { key: "news",     label: "News & Aktionen" },
] as const;

export type BlogTab = (typeof TABS)[number]["key"];

export default function BlogCategoryTabs({
  active,
  onChange,
}: {
  active: BlogTab;
  onChange: (tab: BlogTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all",
            active === tab.key
              ? "bg-ct-cyan text-white shadow-sm"
              : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:border-ct-cyan hover:text-ct-cyan",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
