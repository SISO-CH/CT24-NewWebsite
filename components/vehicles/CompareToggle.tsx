"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { GitCompare } from "lucide-react";
import { getCompareIds, buildCompareUrl, MAX_COMPARE } from "@/lib/compare-store";

interface Props {
  vehicleId: number;
}

function CompareToggleInner({ vehicleId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ids = getCompareIds(searchParams);
  const isSelected = ids.includes(vehicleId);
  const isDisabled = !isSelected && ids.length >= MAX_COMPARE;

  function toggle() {
    const next = isSelected
      ? ids.filter((id) => id !== vehicleId)
      : [...ids, vehicleId];
    router.push(`${pathname}${buildCompareUrl(next, searchParams.toString())}`, { scroll: false });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isDisabled}
      title={
        isDisabled
          ? "Maximal 3 Fahrzeuge vergleichbar"
          : isSelected
          ? "Aus Vergleich entfernen"
          : "Zum Vergleich hinzufügen"
      }
      className={`w-7 h-7 rounded-full flex items-center justify-center
                  transition-all border text-xs font-bold shadow-sm
                  ${
                    isSelected
                      ? "bg-[var(--ct-cyan)] border-[var(--ct-cyan)] text-white"
                      : isDisabled
                      ? "bg-white/60 border-[#e5e7eb] text-[#d1d5db] cursor-not-allowed"
                      : "bg-white border-[#e5e7eb] text-[#6b7280] hover:border-[var(--ct-cyan)] hover:text-[var(--ct-cyan)]"
                  }`}
      aria-pressed={isSelected}
      aria-label={isSelected ? "Aus Vergleich entfernen" : "Zum Vergleich hinzufügen"}
    >
      <GitCompare size={13} />
    </button>
  );
}

export default function CompareToggle({ vehicleId }: Props) {
  return (
    <Suspense fallback={null}>
      <CompareToggleInner vehicleId={vehicleId} />
    </Suspense>
  );
}
