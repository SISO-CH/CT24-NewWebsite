"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { X, GitCompare } from "lucide-react";
import { getCompareIds, buildCompareUrl } from "@/lib/compare-store";
import type { Vehicle } from "@/lib/vehicles";

interface Props {
  vehicles: Vehicle[];
}

function CompareBarInner({ vehicles }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ids = getCompareIds(searchParams);

  if (ids.length === 0) return null;

  const selected = ids
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is Vehicle => v !== undefined);

  function remove(id: number) {
    const next = ids.filter((i) => i !== id);
    router.push(`${pathname}${buildCompareUrl(next, searchParams.toString())}`, { scroll: false });
  }

  function clearAll() {
    router.push(`${pathname}${buildCompareUrl([], searchParams.toString())}`, { scroll: false });
  }

  // Build compare page URL — locale-aware
  const localeMatch = pathname.match(/^\/(fr|it|en)(?=\/|$)/);
  const localePrefix = localeMatch ? localeMatch[0] : "";
  const compareUrl = `${localePrefix}/vergleich?compare=${ids.join(",")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40
                    bg-[var(--ct-dark)] text-white
                    border-t-2 border-[var(--ct-cyan)]
                    shadow-[0_-8px_32px_rgba(0,0,0,0.25)]
                    md:bottom-0 pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap">
        <GitCompare size={16} className="text-[var(--ct-cyan)] shrink-0" />
        <div className="flex gap-2 flex-wrap flex-1 min-w-0">
          {selected.map((v) => (
            <span
              key={v.id}
              className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1 text-xs font-medium"
            >
              {v.make} {v.model}
              <button
                type="button"
                onClick={() => remove(v.id)}
                className="hover:text-[var(--ct-magenta)] transition-colors"
                aria-label={`${v.make} ${v.model} aus Vergleich entfernen`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-[#9ca3af] hover:text-white transition-colors"
          >
            Alle entfernen
          </button>
          <a
            href={compareUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold
                       hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--ct-cyan)" }}
          >
            Vergleich öffnen ({ids.length})
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CompareBar({ vehicles }: Props) {
  return (
    <Suspense fallback={null}>
      <CompareBarInner vehicles={vehicles} />
    </Suspense>
  );
}
