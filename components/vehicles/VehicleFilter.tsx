"use client";

import { useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import type { Vehicle, VehicleBody } from "@/lib/vehicles";

export interface FilterState {
  search: string;
  make: string;
  priceMax: string;
  body: VehicleBody | "";
  sort: "default" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc";
}

interface VehicleFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
  vehicles: Vehicle[];
}

const PRICE_OPTIONS = [
  { label: "Alle Preise", value: "" },
  { label: "bis CHF 25'000", value: "25000" },
  { label: "bis CHF 30'000", value: "30000" },
  { label: "bis CHF 40'000", value: "40000" },
  { label: "bis CHF 50'000", value: "50000" },
];

const SORT_OPTIONS = [
  { label: "Empfohlen", value: "default" },
  { label: "Preis aufsteigend", value: "price_asc" },
  { label: "Preis absteigend", value: "price_desc" },
  { label: "Wenigste km", value: "mileage_asc" },
  { label: "Neuestes Baujahr", value: "year_desc" },
];

const selectClass =
  "h-9 px-3 text-sm border border-[#e5e7eb] bg-white text-[#374151] rounded-lg" +
  " focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20" +
  " transition-colors cursor-pointer appearance-none pr-7";

export default function VehicleFilter({ filters, onChange, resultCount, vehicles }: VehicleFilterProps) {
  const makes = useMemo(
    () => ["Alle Marken", ...Array.from(new Set(vehicles.map((v) => v.make))).sort()],
    [vehicles]
  );
  const bodies = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.body).filter(Boolean))).sort() as VehicleBody[],
    [vehicles]
  );

  const activeFilters: { label: string; key: keyof FilterState }[] = [
    ...(filters.search ? [{ label: `"${filters.search}"`, key: "search" as const }] : []),
    ...(filters.make !== "Alle Marken" && filters.make ? [{ label: filters.make, key: "make" as const }] : []),
    ...(filters.body ? [{ label: filters.body, key: "body" as const }] : []),
    ...(filters.priceMax ? [{ label: `bis CHF ${parseInt(filters.priceMax).toLocaleString("de-CH")}`, key: "priceMax" as const }] : []),
  ];

  const hasFilters = activeFilters.length > 0;
  const reset = () => onChange({ search: "", make: "Alle Marken", priceMax: "", body: "", sort: filters.sort });
  const removeFilter = (key: keyof FilterState) => {
    const defaults: FilterState = { search: "", make: "Alle Marken", priceMax: "", body: "", sort: filters.sort };
    onChange({ ...filters, [key]: defaults[key] });
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-8 overflow-hidden">
      <div className="flex flex-wrap gap-2.5 items-center p-4">
        <div className="flex items-center gap-1.5 mr-1">
          <SlidersHorizontal size={14} className="text-ct-cyan" />
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#374151]">Filter</span>
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
          <input
            type="text"
            placeholder="Marke, Modell suchen…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-9 w-full pl-8 pr-3 text-sm border border-[#e5e7eb] bg-white text-[#374151] rounded-lg
                       focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
          />
        </div>

        <div className="relative">
          <select value={filters.make} onChange={(e) => onChange({ ...filters, make: e.target.value })} className={selectClass}>
            {makes.map((m) => <option key={m}>{m}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
        </div>

        <div className="relative">
          <select value={filters.body} onChange={(e) => onChange({ ...filters, body: e.target.value as VehicleBody | "" })} className={selectClass}>
            <option value="">Karosserie</option>
            {bodies.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
        </div>

        <div className="relative">
          <select value={filters.priceMax} onChange={(e) => onChange({ ...filters, priceMax: e.target.value })} className={selectClass}>
            {PRICE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
        </div>

        <div className="relative ml-auto">
          <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
          <select value={filters.sort} onChange={(e) => onChange({ ...filters, sort: e.target.value as FilterState["sort"] })} className={`${selectClass} pl-7`}>
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 border-t border-[#f5f5f5] pt-3">
        <span className={`text-xs font-semibold ${resultCount === 0 ? "text-ct-magenta" : "text-ct-cyan"}`}>
          {resultCount} Fahrzeug{resultCount !== 1 ? "e" : ""}
        </span>
        {activeFilters.map((f) => (
          <button type="button" key={f.key} onClick={() => removeFilter(f.key)}
            aria-label={`Filter "${f.label}" entfernen`}
            className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-xs font-medium
                       bg-ct-cyan/10 text-ct-cyan hover:bg-ct-cyan/20 transition-colors">
            {f.label}<X size={10} />
          </button>
        ))}
        {hasFilters && (
          <button type="button" onClick={reset} className="text-xs text-[#9ca3af] hover:text-ct-magenta transition-colors ml-1">
            Alle zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
