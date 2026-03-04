"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import type { Vehicle, VehicleBody } from "@/lib/vehicles";
import { trackEvent } from "@/lib/tracking";

export interface FilterState {
  // Existing
  search: string;
  make: string;
  priceMax: string;
  body: VehicleBody | "";
  sort: "default" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc";
  // New
  priceMin: string;       // e.g. "15000" — empty string = no lower bound
  yearMin: string;        // e.g. "2018"  — empty = no lower bound
  yearMax: string;        // e.g. "2024"  — empty = no upper bound
  kmMax: string;          // e.g. "50000" — empty = no limit
  fuel: string;           // "Elektro" | "Hybrid" | "Benzin" | "Diesel" | ""
  transmission: string;   // "Automatik" | "Manuell" | ""
  color: string;          // from available vehicle colors, "" = all
  drivetrain: string;     // "Frontantrieb" | "Allrad" | "Heckantrieb" | ""
  monthlyRateMax: string; // e.g. "500" — max leasing rate CHF/month, "" = no limit
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  make: "Alle Marken",
  priceMax: "",
  body: "",
  sort: "default",
  priceMin: "",
  yearMin: "",
  yearMax: "",
  kmMax: "",
  fuel: "",
  transmission: "",
  color: "",
  drivetrain: "",
  monthlyRateMax: "",
};

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

const PRICE_MIN_OPTIONS = [
  { label: "Preis ab", value: "" },
  { label: "ab CHF 10'000", value: "10000" },
  { label: "ab CHF 15'000", value: "15000" },
  { label: "ab CHF 20'000", value: "20000" },
  { label: "ab CHF 30'000", value: "30000" },
  { label: "ab CHF 40'000", value: "40000" },
];

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: String(year), value: String(year) };
});

const KM_OPTIONS = [
  { label: "km max", value: "" },
  { label: "bis 20'000 km", value: "20000" },
  { label: "bis 50'000 km", value: "50000" },
  { label: "bis 100'000 km", value: "100000" },
  { label: "bis 150'000 km", value: "150000" },
];

const FUEL_OPTIONS = [
  { label: "Treibstoff", value: "" },
  { label: "Benzin", value: "Benzin" },
  { label: "Diesel", value: "Diesel" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "Elektro", value: "Elektro" },
];

const TRANSMISSION_OPTIONS = [
  { label: "Getriebe", value: "" },
  { label: "Automatik", value: "Automatik" },
  { label: "Manuell", value: "Manuell" },
];

const MONTHLY_RATE_OPTIONS = [
  { label: "Rate max", value: "" },
  { label: "bis CHF 300/Mt.", value: "300" },
  { label: "bis CHF 400/Mt.", value: "400" },
  { label: "bis CHF 500/Mt.", value: "500" },
  { label: "bis CHF 700/Mt.", value: "700" },
];

const selectClass =
  "h-10 px-3 text-sm font-medium border border-[#e5e7eb] bg-white text-[#1f2937] rounded-lg" +
  " focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20" +
  " transition-colors cursor-pointer appearance-none pr-7";

const labelClass = "text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1";

export default function VehicleFilter({ filters, onChange, resultCount, vehicles }: VehicleFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(true);

  const makes = useMemo(
    () => ["Alle Marken", ...Array.from(new Set(vehicles.map((v) => v.make))).sort()],
    [vehicles]
  );
  const bodies = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.body).filter(Boolean))).sort() as VehicleBody[],
    [vehicles]
  );
  const colors = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.color).filter(Boolean))).sort() as string[],
    [vehicles]
  );
  const drivetrains = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.drivetrain).filter(Boolean))).sort() as string[],
    [vehicles]
  );

  const activeFilters = useMemo<{ label: string; key: keyof FilterState }[]>(() => [
    ...(filters.search       ? [{ label: `"${filters.search}"`,                                                     key: "search"         as const }] : []),
    ...(filters.make !== "Alle Marken" && filters.make
                             ? [{ label: filters.make,                                                               key: "make"           as const }] : []),
    ...(filters.body         ? [{ label: filters.body,                                                               key: "body"           as const }] : []),
    ...(filters.priceMin     ? [{ label: `ab CHF ${parseInt(filters.priceMin, 10).toLocaleString("de-CH")}`,         key: "priceMin"       as const }] : []),
    ...(filters.priceMax     ? [{ label: `bis CHF ${parseInt(filters.priceMax, 10).toLocaleString("de-CH")}`,        key: "priceMax"       as const }] : []),
    ...(filters.yearMin      ? [{ label: `ab ${filters.yearMin}`,                                                    key: "yearMin"        as const }] : []),
    ...(filters.yearMax      ? [{ label: `bis ${filters.yearMax}`,                                                   key: "yearMax"        as const }] : []),
    ...(filters.kmMax        ? [{ label: `bis ${parseInt(filters.kmMax, 10).toLocaleString("de-CH")} km`,            key: "kmMax"          as const }] : []),
    ...(filters.fuel         ? [{ label: filters.fuel,                                                               key: "fuel"           as const }] : []),
    ...(filters.transmission ? [{ label: filters.transmission,                                                       key: "transmission"   as const }] : []),
    ...(filters.color        ? [{ label: filters.color,                                                              key: "color"          as const }] : []),
    ...(filters.drivetrain   ? [{ label: filters.drivetrain,                                                         key: "drivetrain"     as const }] : []),
    ...(filters.monthlyRateMax ? [{ label: `Rate bis CHF ${filters.monthlyRateMax}/Mt.`,                             key: "monthlyRateMax" as const }] : []),
  ], [filters]);

  const hasFilters = activeFilters.length > 0;
  const reset = () => onChange({ ...DEFAULT_FILTERS });
  const removeFilter = (key: keyof FilterState) => {
    onChange({ ...filters, [key]: DEFAULT_FILTERS[key] });
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-8 overflow-hidden">
      <div className="flex flex-wrap gap-2.5 items-end p-4 max-sm:grid max-sm:grid-cols-2 max-sm:gap-3">
        <div className="flex items-center gap-1.5 mr-1 max-sm:col-span-2">
          <SlidersHorizontal size={14} className="text-ct-cyan" />
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#374151]">Filter</span>
        </div>

        <div className="flex flex-col flex-1 min-w-[180px] max-sm:col-span-2">
          <label className={labelClass}>Suche</label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
            <input
              type="text"
              placeholder="Marke, Modell suchen…"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              onBlur={(e) => {
                if (e.target.value) {
                  trackEvent({ event: "vehicle_list_filter", filter_type: "search", filter_value: e.target.value });
                }
              }}
              className="h-10 w-full pl-8 pr-3 text-sm font-medium border border-[#e5e7eb] bg-white text-[#1f2937] rounded-lg
                         focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className={labelClass}>Marke</label>
          <div className="relative">
            <select value={filters.make} onChange={(e) => {
              onChange({ ...filters, make: e.target.value });
              if (e.target.value && e.target.value !== "Alle Marken") {
                trackEvent({ event: "vehicle_list_filter", filter_type: "make", filter_value: e.target.value });
              }
            }} className={selectClass}>
              {makes.map((m) => <option key={m}>{m}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
          </div>
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className={labelClass}>Karosserie</label>
          <div className="relative">
            <select value={filters.body} onChange={(e) => {
              onChange({ ...filters, body: e.target.value as VehicleBody | "" });
              if (e.target.value) {
                trackEvent({ event: "vehicle_list_filter", filter_type: "body", filter_value: e.target.value });
              }
            }} className={selectClass}>
              <option value="">Karosserie</option>
              {bodies.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
          </div>
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className={labelClass}>Preis max</label>
          <div className="relative">
            <select value={filters.priceMax} onChange={(e) => {
              onChange({ ...filters, priceMax: e.target.value });
              if (e.target.value) {
                trackEvent({ event: "vehicle_list_filter", filter_type: "priceMax", filter_value: e.target.value });
              }
            }} className={selectClass}>
              {PRICE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
          </div>
        </div>

        <div className="flex flex-col min-w-[140px] ml-auto max-sm:ml-0">
          <label className={labelClass}>Sortierung</label>
          <div className="relative">
            <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
            <select value={filters.sort} onChange={(e) => {
              onChange({ ...filters, sort: e.target.value as FilterState["sort"] });
              if (e.target.value && e.target.value !== "default") {
                trackEvent({ event: "vehicle_list_filter", filter_type: "sort", filter_value: e.target.value });
              }
            }} className={`${selectClass} pl-7`}>
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
          </div>
        </div>
      </div>

      {/* Advanced filters toggle */}
      <div className="px-4 pb-2 border-t border-[#f5f5f5] pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b7280] hover:text-ct-cyan transition-colors"
        >
          <SlidersHorizontal size={12} />
          {showAdvanced ? "Weniger Filter" : "Mehr Filter"}
          <span className="text-[10px]">{showAdvanced ? "▴" : "▾"}</span>
        </button>
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap gap-2.5 items-end px-4 pb-3 border-t border-[#f5f5f5] pt-3 max-sm:grid max-sm:grid-cols-2 max-sm:gap-3">
          {/* Preis min */}
          <div className="flex flex-col min-w-[140px]">
            <label className={labelClass}>Preis min</label>
            <div className="relative">
              <select value={filters.priceMin} onChange={(e) => {
                onChange({ ...filters, priceMin: e.target.value });
                if (e.target.value) {
                  trackEvent({ event: "vehicle_list_filter", filter_type: "priceMin", filter_value: e.target.value });
                }
              }} className={selectClass}>
                {PRICE_MIN_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
            </div>
          </div>

          {/* Treibstoff */}
          <div className="flex flex-col min-w-[140px]">
            <label className={labelClass}>Treibstoff</label>
            <div className="relative">
              <select value={filters.fuel} onChange={(e) => {
                onChange({ ...filters, fuel: e.target.value });
                if (e.target.value) {
                  trackEvent({ event: "vehicle_list_filter", filter_type: "fuel", filter_value: e.target.value });
                }
              }} className={selectClass}>
                {FUEL_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
            </div>
          </div>

          {/* Getriebe */}
          <div className="flex flex-col min-w-[140px]">
            <label className={labelClass}>Getriebe</label>
            <div className="relative">
              <select value={filters.transmission} onChange={(e) => {
                onChange({ ...filters, transmission: e.target.value });
                if (e.target.value) {
                  trackEvent({ event: "vehicle_list_filter", filter_type: "transmission", filter_value: e.target.value });
                }
              }} className={selectClass}>
                {TRANSMISSION_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
            </div>
          </div>

          {/* Baujahr von */}
          <div className="flex flex-col min-w-[140px]">
            <label className={labelClass}>Jahr ab</label>
            <div className="relative">
              <select value={filters.yearMin} onChange={(e) => {
                onChange({ ...filters, yearMin: e.target.value });
                if (e.target.value) {
                  trackEvent({ event: "vehicle_list_filter", filter_type: "yearMin", filter_value: e.target.value });
                }
              }} className={selectClass}>
                <option value="">Jahr ab</option>
                {YEAR_OPTIONS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
            </div>
          </div>

          {/* Baujahr bis */}
          <div className="flex flex-col min-w-[140px]">
            <label className={labelClass}>Jahr bis</label>
            <div className="relative">
              <select value={filters.yearMax} onChange={(e) => {
                onChange({ ...filters, yearMax: e.target.value });
                if (e.target.value) {
                  trackEvent({ event: "vehicle_list_filter", filter_type: "yearMax", filter_value: e.target.value });
                }
              }} className={selectClass}>
                <option value="">Jahr bis</option>
                {YEAR_OPTIONS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
            </div>
          </div>

          {/* km max */}
          <div className="flex flex-col min-w-[140px]">
            <label className={labelClass}>km max</label>
            <div className="relative">
              <select value={filters.kmMax} onChange={(e) => {
                onChange({ ...filters, kmMax: e.target.value });
                if (e.target.value) {
                  trackEvent({ event: "vehicle_list_filter", filter_type: "kmMax", filter_value: e.target.value });
                }
              }} className={selectClass}>
                {KM_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
            </div>
          </div>

          {/* Farbe */}
          {colors.length > 0 && (
            <div className="flex flex-col min-w-[140px]">
              <label className={labelClass}>Farbe</label>
              <div className="relative">
                <select value={filters.color} onChange={(e) => {
                  onChange({ ...filters, color: e.target.value });
                  if (e.target.value) {
                    trackEvent({ event: "vehicle_list_filter", filter_type: "color", filter_value: e.target.value });
                  }
                }} className={selectClass}>
                  <option value="">Farbe</option>
                  {colors.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
              </div>
            </div>
          )}

          {/* Antrieb */}
          {drivetrains.length > 0 && (
            <div className="flex flex-col min-w-[140px]">
              <label className={labelClass}>Antrieb</label>
              <div className="relative">
                <select value={filters.drivetrain} onChange={(e) => {
                  onChange({ ...filters, drivetrain: e.target.value });
                  if (e.target.value) {
                    trackEvent({ event: "vehicle_list_filter", filter_type: "drivetrain", filter_value: e.target.value });
                  }
                }} className={selectClass}>
                  <option value="">Antrieb</option>
                  {drivetrains.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
              </div>
            </div>
          )}

          {/* Monatsrate max */}
          <div className="flex flex-col min-w-[140px]">
            <label className={labelClass}>Monatsrate max</label>
            <div className="relative">
              <select value={filters.monthlyRateMax} onChange={(e) => {
                onChange({ ...filters, monthlyRateMax: e.target.value });
                if (e.target.value) {
                  trackEvent({ event: "vehicle_list_filter", filter_type: "monthlyRateMax", filter_value: e.target.value });
                }
              }} className={selectClass}>
                {MONTHLY_RATE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 border-t border-[#f5f5f5] pt-3">
        <span className={`text-xs font-semibold ${resultCount === 0 ? "text-ct-magenta" : "text-ct-cyan"}`}>
          {resultCount} Fahrzeug{resultCount !== 1 ? "e" : ""}
        </span>
        {activeFilters.map((f) => (
          <button type="button" key={f.key} onClick={() => removeFilter(f.key)}
            aria-label={`Filter "${f.label}" entfernen`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-ct-cyan text-white text-xs font-semibold
                       hover:bg-ct-cyan/80 transition-colors">
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
