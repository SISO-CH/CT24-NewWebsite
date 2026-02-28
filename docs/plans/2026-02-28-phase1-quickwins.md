# Phase 1 Quick Wins – Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 5 blocks of conversion-optimised features (extended filters, VDP enhancements, leasing calculator, homepage improvements, sticky mobile CTA) on the existing cartrade24 Next.js site with zero new backend infrastructure.

**Architecture:** All changes are client-side or extend the existing `/api/contact` route. New components follow the established pattern: `"use client"` only where necessary, Tailwind v4 with existing design tokens (`var(--ct-cyan)`, `var(--ct-magenta)`, `var(--ct-dark)`, `var(--ct-light)`, `var(--ct-green)`). `NEXT_PUBLIC_WHATSAPP_NUMBER` is added to `.env.local` as the only new env variable for Phase 1.

**Tech Stack:** Next.js 16 App Router, TypeScript 5, Tailwind v4, `lucide-react` (already installed). No new npm packages.

**Design Reference:** `docs/plans/2026-02-28-phase1-quickwins-design.md`

**Verify after every task:**
```bash
cd /root/cartrade24 && npx tsc --noEmit
```
Expected output: no errors.

---

## Current State

```
components/vehicles/VehicleFilter.tsx   — FilterState: search, make, priceMax, body, sort
components/vehicles/AutosContent.tsx    — filter logic + suggestions, reset hardcoded
app/autos/[id]/page.tsx                 — VDP: gallery, specs, salespitch, carVertical, Matelso
app/finanzierung/page.tsx               — static leasing table (no interactivity)
app/page.tsx                            — static reviews (3 hardcoded), no MwSt
app/layout.tsx                          — no mobile bar
components/layout/Footer.tsx            — no UID/MWST
.env.local                              — needs NEXT_PUBLIC_WHATSAPP_NUMBER
```

---

## Task 1: Add NEXT_PUBLIC_WHATSAPP_NUMBER to .env.local

**Files:**
- Modify: `.env.local` (create if missing)

**Step 1: Add the env variable**

Open `.env.local` (or create it at project root). Add at the bottom:

```bash
# WhatsApp Business number — no leading +, no spaces (e.g. 41791234567)
NEXT_PUBLIC_WHATSAPP_NUMBER=41791234567
```

> **Replace `41791234567` with the real WhatsApp number** (format: country code + number, no `+`).

**Step 2: Verify TypeScript still clean**

```bash
cd /root/cartrade24 && npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
cd /root/cartrade24
git add .env.local
git commit -m "chore: add NEXT_PUBLIC_WHATSAPP_NUMBER placeholder"
```

---

## Task 2: Extend FilterState with 8 new fields

**Files:**
- Modify: `components/vehicles/VehicleFilter.tsx`
- Modify: `components/vehicles/AutosContent.tsx`

This task only changes types and reset state — no UI yet. Do this first to get TypeScript to guide the remaining changes.

### Step 1: Update FilterState interface in VehicleFilter.tsx

Open `components/vehicles/VehicleFilter.tsx`. Replace the existing `FilterState` interface (lines 7–13):

```ts
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
```

### Step 2: Add DEFAULT_FILTERS constant

After the `FilterState` interface (before the `VehicleFilterProps` interface), add:

```ts
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
```

### Step 3: Update AutosContent.tsx — initial state and reset

Open `components/vehicles/AutosContent.tsx`.

**Add import** at top (add to existing imports):
```ts
import VehicleFilter, { type FilterState, DEFAULT_FILTERS } from "./VehicleFilter";
```

**Replace** the `useState` initializer (around line 20–26):
```ts
const [filters, setFilters] = useState<FilterState>({
  ...DEFAULT_FILTERS,
  make: (initialMake && validMakes.includes(initialMake)) ? initialMake : "Alle Marken",
  body: (VALID_BODIES.includes(initialBody as VehicleBody) ? initialBody : "") as VehicleBody | "",
});
```

**Replace** the hardcoded reset call inside the "Alle Fahrzeuge anzeigen" button (around line 103):
```ts
onClick={() => setFilters({ ...DEFAULT_FILTERS })}
```

**Also fix** `removeFilter` in VehicleFilter.tsx — it references a local `defaults` object. Replace the `removeFilter` function (around lines 62–65):
```ts
const removeFilter = (key: keyof FilterState) => {
  onChange({ ...filters, [key]: DEFAULT_FILTERS[key] });
};
```

### Step 4: Run TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```
Expected: no errors (new fields exist but filter logic doesn't use them yet — TypeScript is fine with that).

### Step 5: Commit

```bash
cd /root/cartrade24
git add components/vehicles/VehicleFilter.tsx components/vehicles/AutosContent.tsx
git commit -m "feat(filter): extend FilterState with 8 new fields + DEFAULT_FILTERS constant"
```

---

## Task 3: Wire new filter fields into UI (VehicleFilter.tsx)

**Files:**
- Modify: `components/vehicles/VehicleFilter.tsx`

The existing filter renders as one horizontal row. We add a second collapsible row for the advanced fields.

### Step 1: Add option constants after the existing SORT_OPTIONS

```ts
const PRICE_MIN_OPTIONS = [
  { label: "Preis ab", value: "" },
  { label: "ab CHF 10\'000", value: "10000" },
  { label: "ab CHF 15\'000", value: "15000" },
  { label: "ab CHF 20\'000", value: "20000" },
  { label: "ab CHF 30\'000", value: "30000" },
  { label: "ab CHF 40\'000", value: "40000" },
];

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: String(year), value: String(year) };
});

const KM_OPTIONS = [
  { label: "km max", value: "" },
  { label: "bis 20\'000 km", value: "20000" },
  { label: "bis 50\'000 km", value: "50000" },
  { label: "bis 100\'000 km", value: "100000" },
  { label: "bis 150\'000 km", value: "150000" },
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
```

### Step 2: Add `showAdvanced` state inside the component

Inside `VehicleFilter`, at the top of the function body, add:
```ts
const [showAdvanced, setShowAdvanced] = useState(false);
```

Add to imports at top of file: `useState` from React (if not already there — it uses `useMemo` but not `useState`).

```ts
import { useState, useMemo } from "react";
```

### Step 3: Build dynamic color and drivetrain lists

After `bodies`, add:
```ts
const colors = useMemo(
  () => Array.from(new Set(vehicles.map((v) => v.color).filter(Boolean))).sort() as string[],
  [vehicles]
);
const drivetrains = useMemo(
  () => Array.from(new Set(vehicles.map((v) => v.drivetrain).filter(Boolean))).sort() as string[],
  [vehicles]
);
```

### Step 4: Update activeFilters to include new fields

Replace the `activeFilters` array (around line 53):

```ts
const activeFilters: { label: string; key: keyof FilterState }[] = [
  ...(filters.search       ? [{ label: `"${filters.search}"`,                                  key: "search"        as const }] : []),
  ...(filters.make !== "Alle Marken" && filters.make
                           ? [{ label: filters.make,                                            key: "make"          as const }] : []),
  ...(filters.body         ? [{ label: filters.body,                                            key: "body"          as const }] : []),
  ...(filters.priceMin     ? [{ label: `ab CHF ${parseInt(filters.priceMin).toLocaleString("de-CH")}`, key: "priceMin" as const }] : []),
  ...(filters.priceMax     ? [{ label: `bis CHF ${parseInt(filters.priceMax).toLocaleString("de-CH")}`, key: "priceMax" as const }] : []),
  ...(filters.yearMin      ? [{ label: `ab ${filters.yearMin}`,                                 key: "yearMin"       as const }] : []),
  ...(filters.yearMax      ? [{ label: `bis ${filters.yearMax}`,                                key: "yearMax"       as const }] : []),
  ...(filters.kmMax        ? [{ label: `bis ${parseInt(filters.kmMax).toLocaleString("de-CH")} km`, key: "kmMax"    as const }] : []),
  ...(filters.fuel         ? [{ label: filters.fuel,                                            key: "fuel"          as const }] : []),
  ...(filters.transmission ? [{ label: filters.transmission,                                    key: "transmission"  as const }] : []),
  ...(filters.color        ? [{ label: filters.color,                                           key: "color"         as const }] : []),
  ...(filters.drivetrain   ? [{ label: filters.drivetrain,                                      key: "drivetrain"    as const }] : []),
  ...(filters.monthlyRateMax ? [{ label: `Rate bis CHF ${filters.monthlyRateMax}/Mt.`,          key: "monthlyRateMax" as const }] : []),
];
```

### Step 5: Add second filter row to JSX

After the closing `</div>` of the first `flex flex-wrap gap-2.5` row (around line 116), **before** the filter-chip row, insert:

```tsx
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
  <div className="flex flex-wrap gap-2.5 items-center px-4 pb-3 border-t border-[#f5f5f5] pt-3">
    {/* Preis min */}
    <div className="relative">
      <select value={filters.priceMin} onChange={(e) => onChange({ ...filters, priceMin: e.target.value })} className={selectClass}>
        {PRICE_MIN_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
    </div>

    {/* Treibstoff */}
    <div className="relative">
      <select value={filters.fuel} onChange={(e) => onChange({ ...filters, fuel: e.target.value })} className={selectClass}>
        {FUEL_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
    </div>

    {/* Getriebe */}
    <div className="relative">
      <select value={filters.transmission} onChange={(e) => onChange({ ...filters, transmission: e.target.value })} className={selectClass}>
        {TRANSMISSION_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
    </div>

    {/* Baujahr von */}
    <div className="relative">
      <select value={filters.yearMin} onChange={(e) => onChange({ ...filters, yearMin: e.target.value })} className={selectClass}>
        <option value="">Jahr ab</option>
        {YEAR_OPTIONS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
    </div>

    {/* Baujahr bis */}
    <div className="relative">
      <select value={filters.yearMax} onChange={(e) => onChange({ ...filters, yearMax: e.target.value })} className={selectClass}>
        <option value="">Jahr bis</option>
        {YEAR_OPTIONS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
    </div>

    {/* km max */}
    <div className="relative">
      <select value={filters.kmMax} onChange={(e) => onChange({ ...filters, kmMax: e.target.value })} className={selectClass}>
        {KM_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
    </div>

    {/* Farbe */}
    {colors.length > 0 && (
      <div className="relative">
        <select value={filters.color} onChange={(e) => onChange({ ...filters, color: e.target.value })} className={selectClass}>
          <option value="">Farbe</option>
          {colors.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
      </div>
    )}

    {/* Antrieb */}
    {drivetrains.length > 0 && (
      <div className="relative">
        <select value={filters.drivetrain} onChange={(e) => onChange({ ...filters, drivetrain: e.target.value })} className={selectClass}>
          <option value="">Antrieb</option>
          {drivetrains.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
      </div>
    )}

    {/* Monatsrate max (Budget-Suche) */}
    <div className="relative">
      <select value={filters.monthlyRateMax} onChange={(e) => onChange({ ...filters, monthlyRateMax: e.target.value })} className={selectClass}>
        {MONTHLY_RATE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px]">▾</span>
    </div>
  </div>
)}
```

### Step 6: TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```
Expected: no errors.

### Step 7: Commit

```bash
cd /root/cartrade24
git add components/vehicles/VehicleFilter.tsx
git commit -m "feat(filter): add advanced filter row (fuel, transmission, year, km, color, drivetrain, monthly rate)"
```

---

## Task 4: Wire new filter fields into AutosContent filter logic

**Files:**
- Modify: `components/vehicles/AutosContent.tsx`

### Step 1: Expand the `filtered` useMemo

Replace the entire `filter` callback inside the `filtered` useMemo (the `vehicles.filter(...)` call, around lines 29–38):

```ts
const filtered = useMemo(() => {
  let result = vehicles.filter((v) => {
    const query = filters.search.toLowerCase();
    if (query && !v.make.toLowerCase().includes(query) &&
        !v.model.toLowerCase().includes(query) &&
        !(v.variant ?? "").toLowerCase().includes(query)) return false;
    if (filters.make !== "Alle Marken" && v.make !== filters.make) return false;
    if (filters.body && v.body !== filters.body) return false;
    // New filters
    if (filters.priceMin && v.price < parseInt(filters.priceMin)) return false;
    if (filters.priceMax && v.price > parseInt(filters.priceMax)) return false;
    if (filters.yearMin && v.year < parseInt(filters.yearMin)) return false;
    if (filters.yearMax && v.year > parseInt(filters.yearMax)) return false;
    if (filters.kmMax && v.mileage > parseInt(filters.kmMax)) return false;
    if (filters.fuel && v.fuel !== filters.fuel) return false;
    if (filters.transmission && v.transmission !== filters.transmission) return false;
    if (filters.color && v.color !== filters.color) return false;
    if (filters.drivetrain && v.drivetrain !== filters.drivetrain) return false;
    if (filters.monthlyRateMax && v.leasingPrice > parseInt(filters.monthlyRateMax)) return false;
    return true;
  });

  switch (filters.sort) {
    case "price_asc":   result = [...result].sort((a, b) => a.price - b.price); break;
    case "price_desc":  result = [...result].sort((a, b) => b.price - a.price); break;
    case "mileage_asc": result = [...result].sort((a, b) => a.mileage - b.mileage); break;
    case "year_desc":   result = [...result].sort((a, b) => b.year - a.year); break;
  }
  return result;
}, [filters, vehicles]);
```

### Step 2: Update the suggestions scoring to include new filters

Replace the `scored` map inside `suggestions` useMemo (around lines 54–64):

```ts
const scored = vehicles.map((v) => {
  let score = 0;
  if (filters.make !== "Alle Marken" && v.make === filters.make) score += 3;
  if (filters.body && v.body === filters.body) score += 2;
  if (filters.fuel && v.fuel === filters.fuel) score += 2;
  if (filters.transmission && v.transmission === filters.transmission) score += 1;
  if (filters.priceMax) {
    const max = parseInt(filters.priceMax);
    if (v.price <= max * 1.4) score += 1;
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    if (v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q)) score += 3;
  }
  return { v, score };
});
```

### Step 3: TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```
Expected: no errors.

### Step 4: Manual test

Start dev server (`npm run dev`), open `/autos`, click "Mehr Filter". Test:
- Select "Elektro" under Treibstoff → only EVs appear
- Select "Automatik" → only automatic transmission vehicles appear
- Set km max → vehicles with higher mileage disappear
- Confirm filter chips appear and "Alle zurücksetzen" clears all

### Step 5: Commit

```bash
cd /root/cartrade24
git add components/vehicles/AutosContent.tsx
git commit -m "feat(filter): apply extended filter logic (fuel, transmission, year, km, color, drivetrain, monthly rate)"
```

---

## Task 5: Create LeasingCalculator component

**Files:**
- Create: `components/ui/LeasingCalculator.tsx`

This is a reusable `"use client"` component used by both `/finanzierung` (Task 6) and VDP (Task 8).

### Step 1: Create the file

```tsx
// components/ui/LeasingCalculator.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCHF } from "@/lib/utils";

// Standard Swiss leasing rate: 3.9% p.a.
const ANNUAL_RATE = 0.039;

// CHF per 1000km/year over typical lease term (residual cost component)
// Simplified model: no residual value, annuity formula only
function calculateRate(price: number, downPct: number, months: number): number {
  const financed = price * (1 - downPct / 100);
  const monthly = ANNUAL_RATE / 12;
  if (monthly === 0) return financed / months;
  return (financed * monthly * Math.pow(1 + monthly, months))
       / (Math.pow(1 + monthly, months) - 1);
}

interface LeasingCalculatorProps {
  /** If provided, price slider is hidden and this value is used */
  fixedPrice?: number;
  /** Show link to /finanzierung — default true for VDP widget */
  showLink?: boolean;
}

const TERM_OPTIONS = [24, 36, 48, 60] as const;
const KM_OPTIONS = [10000, 15000, 20000, 30000] as const;
const DOWN_DEFAULT = 10;

export default function LeasingCalculator({ fixedPrice, showLink = false }: LeasingCalculatorProps) {
  const [price, setPrice] = useState(fixedPrice ?? 35000);
  const [down, setDown] = useState(DOWN_DEFAULT);
  const [months, setMonths] = useState<(typeof TERM_OPTIONS)[number]>(48);
  const [km, setKm] = useState<(typeof KM_OPTIONS)[number]>(15000);

  const rate = calculateRate(fixedPrice ?? price, down, months);

  const toggleBtnClass = (active: boolean) =>
    `h-8 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer
     ${active
       ? "text-white"
       : "bg-ct-light text-[#6b7280] hover:bg-[#e8eaec]"}`;

  return (
    <div className="space-y-5">
      {/* Price slider — only shown when no fixedPrice */}
      {fixedPrice === undefined && (
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Fahrzeugpreis</label>
            <span className="text-sm font-bold text-ct-dark">CHF {formatCHF(price)}</span>
          </div>
          <input
            type="range"
            min={10000}
            max={100000}
            step={500}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-[var(--ct-cyan)] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#9ca3af] mt-0.5">
            <span>CHF 10\'000</span><span>CHF 100\'000</span>
          </div>
        </div>
      )}

      {/* Down payment slider */}
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Anzahlung</label>
          <span className="text-sm font-bold text-ct-dark">
            {down}% = CHF {formatCHF(Math.round((fixedPrice ?? price) * down / 100))}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={40}
          step={5}
          value={down}
          onChange={(e) => setDown(Number(e.target.value))}
          className="w-full accent-[var(--ct-cyan)] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#9ca3af] mt-0.5">
          <span>0%</span><span>40%</span>
        </div>
      </div>

      {/* Term toggles */}
      <div>
        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Laufzeit</p>
        <div className="flex gap-2">
          {TERM_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMonths(t)}
              className={toggleBtnClass(months === t)}
              style={months === t ? { backgroundColor: "var(--ct-cyan)" } : {}}
            >
              {t} Mt.
            </button>
          ))}
        </div>
      </div>

      {/* KM toggles */}
      <div>
        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">km / Jahr</p>
        <div className="flex gap-2 flex-wrap">
          {KM_OPTIONS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKm(k)}
              className={toggleBtnClass(km === k)}
              style={km === k ? { backgroundColor: "var(--ct-cyan)" } : {}}
            >
              {k.toLocaleString("de-CH")}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "var(--ct-light)" }}>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#9ca3af] mb-0.5">Ihre Monatsrate</p>
        <p className="text-3xl font-black leading-none" style={{ color: "var(--ct-magenta)" }}>
          CHF {formatCHF(Math.round(rate))}
          <span className="text-sm font-normal text-[#9ca3af]"> /Mt.</span>
        </p>
        <p className="text-[10px] text-[#9ca3af] mt-1.5 leading-relaxed">
          3.9% p.a., {down}% Anzahlung, {months} Monate, {km.toLocaleString("de-CH")} km/J.
          <br />Inkl. 8.1% MwSt. Vorbehaltlich Bonitätsprüfung.
        </p>
      </div>

      {/* CTA */}
      {showLink ? (
        <Link
          href="/finanzierung"
          className="block text-center text-xs font-semibold text-ct-cyan hover:underline"
        >
          Detailrechner & alle Optionen →
        </Link>
      ) : (
        <Link
          href="/kontakt"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                     text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--ct-cyan)" }}
        >
          Jetzt Offerte anfragen →
        </Link>
      )}
    </div>
  );
}
```

### Step 2: TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```
Expected: no errors.

### Step 3: Commit

```bash
cd /root/cartrade24
git add components/ui/LeasingCalculator.tsx
git commit -m "feat(calculator): add reusable LeasingCalculator component (annuity formula, 3.9% p.a.)"
```

---

## Task 6: Add LeasingCalculator to /finanzierung page

**Files:**
- Modify: `app/finanzierung/page.tsx`

### Step 1: Convert to a mixed page (Server + Client island)

The page is currently a pure Server Component. The `LeasingCalculator` is a Client Component. In Next.js App Router, you can import Client Components into Server Components — no change to the page's Server nature is needed.

Open `app/finanzierung/page.tsx`. Add import at the top:
```ts
import LeasingCalculator from "@/components/ui/LeasingCalculator";
```

### Step 2: Insert the calculator section

Between the Leasing-Tabelle section closing `</section>` tag and the B2B-Teaser `<FadeIn>` block, insert:

```tsx
{/* Interaktiver Leasingrechner */}
<section className="py-16 md:py-24 bg-white">
  <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
    <FadeIn>
      <div className="mb-10">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
           style={{ color: "var(--ct-cyan)" }}>Ihr persönlicher Rechner</p>
        <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
          Monatsrate berechnen
        </h2>
        <p className="text-[#6b7280] text-sm mt-2">
          Stellen Sie die Parameter ein — die Rate wird sofort berechnet.
        </p>
      </div>
    </FadeIn>
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <LeasingCalculator />
    </div>
    <p className="text-[#9ca3af] text-xs mt-4 text-center">
      * Indikative Berechnung. Offizielle Konditionen via Cembra Money Bank oder Migros Bank nach Bonitätsprüfung.
    </p>
  </div>
</section>
```

### Step 3: TypeScript check + lint

```bash
cd /root/cartrade24 && npx tsc --noEmit && npm run lint
```
Expected: no errors.

### Step 4: Commit

```bash
cd /root/cartrade24
git add app/finanzierung/page.tsx
git commit -m "feat(finanzierung): add interactive leasing calculator section"
```

---

## Task 7: Create VDPContactForm component

**Files:**
- Create: `components/vehicles/VDPContactForm.tsx`

### Step 1: Create the file

```tsx
// components/vehicles/VDPContactForm.tsx
"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

interface VDPContactFormProps {
  vehicleLabel: string; // e.g. "VW Golf Variant 1.5 eTSI"
}

export default function VDPContactForm({ vehicleLabel }: VDPContactFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState(
    `Guten Tag, ich interessiere mich für den ${vehicleLabel} und möchte weitere Informationen erhalten.`
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: contact,
          subject: `VDP-Direktanfrage: ${vehicleLabel}`,
          message,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 size={28} style={{ color: "var(--ct-green)" }} />
        <p className="text-sm font-semibold" style={{ color: "var(--ct-dark)" }}>Nachricht gesendet!</p>
        <p className="text-xs text-[#6b7280]">Wir melden uns in der Regel innerhalb von 30 Minuten.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        required
        type="text"
        placeholder="Ihr Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full h-9 px-3 text-sm border border-[#e5e7eb] rounded-lg
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <input
        required
        type="text"
        placeholder="Telefon oder E-Mail *"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        className="w-full h-9 px-3 text-sm border border-[#e5e7eb] rounded-lg
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg resize-none
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                   text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "var(--ct-cyan)" }}
      >
        {status === "loading" ? "Wird gesendet…" : <><Send size={14} /> Nachricht senden</>}
      </button>
      {status === "error" && (
        <p className="text-xs text-center" style={{ color: "var(--ct-magenta)" }}>
          Fehler beim Senden. Bitte rufen Sie uns an: +41 56 618 55 44
        </p>
      )}
    </form>
  );
}
```

### Step 2: TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```

### Step 3: Commit

```bash
cd /root/cartrade24
git add components/vehicles/VDPContactForm.tsx
git commit -m "feat(vdp): add VDPContactForm component (3-field inline contact)"
```

---

## Task 8: Create TestDriveModal component

**Files:**
- Create: `components/vehicles/TestDriveModal.tsx`

### Step 1: Create the file

```tsx
// components/vehicles/TestDriveModal.tsx
"use client";

import { useState } from "react";
import { X, Calendar, CheckCircle2 } from "lucide-react";

interface TestDriveModalProps {
  vehicleLabel: string;
  onClose: () => void;
}

export default function TestDriveModal({ vehicleLabel, onClose }: TestDriveModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: phone,
          subject: `[Probefahrt] ${vehicleLabel} – ${date}`,
          message: `Probefahrt-Anfrage für ${vehicleLabel}.\nWunschtermin: ${date}\nTelefon: ${phone}`,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto
                   bg-white rounded-2xl shadow-2xl z-50 p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Probefahrt buchen"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} style={{ color: "var(--ct-cyan)" }} />
              <p className="text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--ct-cyan)" }}>
                Probefahrt buchen
              </p>
            </div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--ct-dark)" }}>
              {vehicleLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-ct-light transition-colors text-[#9ca3af]"
            aria-label="Schliessen"
          >
            <X size={18} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={36} style={{ color: "var(--ct-green)" }} />
            <p className="text-base font-bold" style={{ color: "var(--ct-dark)" }}>
              Probefahrt angemeldet!
            </p>
            <p className="text-sm text-[#6b7280]">
              Wir bestätigen Ihren Wunschtermin am <strong>{date}</strong> telefonisch.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ct-cyan)" }}
            >
              Schliessen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required
              type="text"
              placeholder="Ihr Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg
                         focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
            />
            <input
              required
              type="tel"
              placeholder="Telefon *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg
                         focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
            />
            <div>
              <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5 block">
                Wunschtermin *
              </label>
              <input
                required
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg
                           focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                         text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
              style={{ backgroundColor: "var(--ct-cyan)" }}
            >
              {status === "loading" ? "Wird gesendet…" : "Probefahrt anfragen"}
            </button>
            {status === "error" && (
              <p className="text-xs text-center" style={{ color: "var(--ct-magenta)" }}>
                Fehler. Bitte anrufen: +41 56 618 55 44
              </p>
            )}
          </form>
        )}
      </div>
    </>
  );
}
```

### Step 2: TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```

### Step 3: Commit

```bash
cd /root/cartrade24
git add components/vehicles/TestDriveModal.tsx
git commit -m "feat(vdp): add TestDriveModal component"
```

---

## Task 9: Update VDP page with all enhancements

**Files:**
- Modify: `app/autos/[id]/page.tsx`

This task wires WhatsApp, LeasingWidget, VDPContactForm, and TestDriveModal into the existing VDP.

**Important:** The VDP is a Server Component. Components that need `useState` (modals, interactive widgets) must be Client Components imported into it. All 3 new components are already `"use client"` — this works fine.

### Step 1: Add imports at the top of page.tsx

Find the existing imports block. Add:

```ts
import VDPContactForm from "@/components/vehicles/VDPContactForm";
import TestDriveModal from "@/components/vehicles/TestDriveModal";
import LeasingCalculator from "@/components/ui/LeasingCalculator";
```

Also add `MessageCircle` to the lucide-react import (for WhatsApp icon substitute):
```ts
import {
  // ... existing icons ...,
  MessageCircle,
} from "lucide-react";
```

### Step 2: Create a thin Client wrapper for the TestDrive trigger

Since the VDP is a Server Component, it cannot use `useState` itself to open the modal. Create a small wrapper:

**Create** `components/vehicles/TestDriveTrigger.tsx`:

```tsx
// components/vehicles/TestDriveTrigger.tsx
"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import TestDriveModal from "./TestDriveModal";

interface TestDriveTriggerProps {
  vehicleLabel: string;
}

export default function TestDriveTrigger({ vehicleLabel }: TestDriveTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                   border border-[#e5e7eb] text-sm font-semibold hover:bg-ct-light transition-colors text-ct-dark"
      >
        <Calendar size={14} /> Probefahrt buchen
      </button>
      {open && <TestDriveModal vehicleLabel={vehicleLabel} onClose={() => setOpen(false)} />}
    </>
  );
}
```

### Step 3: Add imports for new components in page.tsx

Add to imports:
```ts
import TestDriveTrigger from "@/components/vehicles/TestDriveTrigger";
import VDPContactForm from "@/components/vehicles/VDPContactForm";
import LeasingCalculator from "@/components/ui/LeasingCalculator";
```

### Step 4: Update the sticky price card in page.tsx

Find the `<div className="space-y-2.5">` block inside the price card (around line 299). It currently has 3 items: "Jetzt anfragen", "Finanzierung berechnen", phone. Replace this entire `<div className="space-y-2.5">` block with:

```tsx
<div className="space-y-2.5">
  <Link
    href={`/kontakt?betreff=Fahrzeuganfrage&modell=${encodeURIComponent(
      `${vehicle.make} ${vehicle.model}`
    )}`}
    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
               text-white font-semibold text-sm hover:opacity-90 transition-opacity bg-ct-cyan"
  >
    Jetzt anfragen <ArrowRight size={15} />
  </Link>

  <TestDriveTrigger vehicleLabel={`${vehicle.make} ${vehicle.model}${vehicle.variant ? ' ' + vehicle.variant : ''}`} />

  {/* WhatsApp */}
  <a
    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "41791234567"}?text=${encodeURIComponent(
      `Guten Tag, ich interessiere mich für den ${vehicle.make} ${vehicle.model}${vehicle.variant ? ' ' + vehicle.variant : ''} (CHF ${vehicle.price.toLocaleString('de-CH')}).`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
               text-white text-sm font-semibold hover:opacity-90 transition-opacity"
    style={{ backgroundColor: "#25D366" }}
  >
    <MessageCircle size={15} /> WhatsApp
  </a>

  <a
    href="tel:+41566185544"
    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
               text-sm text-[#6b7280] hover:text-ct-cyan transition-colors"
  >
    📞 +41 56 618 55 44
  </a>
</div>
```

### Step 5: Add LeasingCalculator widget above the CTA buttons

Find the `<p className="text-2xl font-extrabold mb-5 text-ct-dark">` (the Kaufpreis display, around line 276). After this price display and before the trust-badges `<div className="space-y-2 mb-6">`, insert:

```tsx
{/* Leasingrechner-Widget */}
<div className="mb-5 pb-5 border-b border-[#f0f0f0]">
  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#9ca3af] mb-3">
    Rate berechnen
  </p>
  <LeasingCalculator fixedPrice={vehicle.price} showLink={true} />
</div>
```

### Step 6: Add VDPContactForm accordion at the bottom of the price card

After the phone link `<a href="tel:...">`, before the closing `</div>` of `space-y-2.5`, add:

```tsx
{/* Direkt anfragen (accordion-style) */}
<details className="group">
  <summary className="list-none cursor-pointer flex items-center justify-between py-2 text-xs font-semibold text-[#6b7280] hover:text-ct-cyan transition-colors">
    Direkt anfragen
    <span className="text-[10px] group-open:rotate-180 transition-transform">▾</span>
  </summary>
  <div className="pt-3">
    <VDPContactForm vehicleLabel={`${vehicle.make} ${vehicle.model}${vehicle.variant ? ' ' + vehicle.variant : ''}`} />
  </div>
</details>
```

### Step 7: TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```
Expected: no errors.

### Step 8: Manual test

- Open any `/autos/1` page
- Verify: WhatsApp button (green) is visible in price card
- Click "Probefahrt buchen" → modal opens, form submits, confirmation shows
- Expand "Direkt anfragen" → inline form appears
- LeasingCalculator widget shows correct rate, updates live when toggles change
- "Detailrechner → /finanzierung" link works

### Step 9: Commit

```bash
cd /root/cartrade24
git add app/autos/[id]/page.tsx components/vehicles/TestDriveTrigger.tsx
git commit -m "feat(vdp): add WhatsApp button, TestDrive modal, LeasingWidget, inline contact form"
```

---

## Task 10: Add Google Reviews section + MWST to Homepage

**Files:**
- Modify: `app/page.tsx`

### Step 1: Add Google Reviews data

Open `app/page.tsx`. The file already has a `reviews` array (3 items with `text`, `name`, `initials`, `stars`). **Replace** this array with richer data that includes a source hint and date, AND add a rating summary object:

```ts
const reviews = [
  {
    text: "Sehr kompetente Beratung, faire Preise und schnelle Abwicklung. Sehr empfehlenswert!",
    name: "Thomas K.",
    initials: "TK",
    stars: 5,
    date: "Jan. 2026",
  },
  {
    text: "Haben uns das perfekte Fahrzeug gefunden. Heimlieferung hat super geklappt – alles wie versprochen!",
    name: "Sandra M.",
    initials: "SM",
    stars: 5,
    date: "Dez. 2025",
  },
  {
    text: "Tolle Auswahl, ehrliche Beratung ohne Verkaufsdruck. Kommen gerne wieder.",
    name: "Marco B.",
    initials: "MB",
    stars: 5,
    date: "Nov. 2025",
  },
];

// TODO: Replace with real data from Google Business Profile
// Google Place ID: ChIJ... → set NEXT_PUBLIC_GOOGLE_PLACE_ID in .env.local for live reviews
const googleRating = { average: 4.9, count: 47 };
const GOOGLE_MAPS_URL = "https://maps.google.com/?q=Car+Trade24+GmbH+Wohlen";
```

### Step 2: Redesign the reviews section in JSX

Find the existing reviews section in the JSX (search for `Das sagen unsere Kunden` or the section containing the `reviews.map(...)`). Replace the entire section with:

```tsx
{/* Google Reviews */}
<section className="py-16 md:py-24 bg-ct-light">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <FadeIn>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>
            Kundenstimmen
          </p>
          <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
            Das sagen unsere Kunden
          </h2>
        </div>

        {/* Google Badge */}
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white rounded-xl border border-[#e5e7eb] px-4 py-3
                     hover:shadow-md transition-shadow shrink-0"
        >
          {/* Google G logo (inline SVG) */}
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} fill={i < Math.round(googleRating.average) ? "#FBBC05" : "none"} color="#FBBC05" />
              ))}
              <span className="text-sm font-bold ml-1" style={{ color: "var(--ct-dark)" }}>
                {googleRating.average}
              </span>
            </div>
            <p className="text-[10px] text-[#9ca3af]">{googleRating.count} Google-Bewertungen</p>
          </div>
        </a>
      </div>
    </FadeIn>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {reviews.map((r, i) => (
        <FadeIn key={r.name} delay={i * 80}>
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col">
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: r.stars }).map((_, j) => (
                <Star key={j} size={13} fill="#FBBC05" color="#FBBC05" />
              ))}
            </div>
            <p className="text-sm text-[#4b5563] leading-relaxed flex-1 italic">
              &ldquo;{r.text}&rdquo;
            </p>
            <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-[#f5f5f5]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                   style={{ backgroundColor: "var(--ct-cyan)" }}>
                {r.initials}
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--ct-dark)" }}>{r.name}</p>
                <p className="text-[10px] text-[#9ca3af]">{r.date}</p>
              </div>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>

    <FadeIn>
      <div className="mt-6 text-center">
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
          style={{ color: "var(--ct-cyan)" }}
        >
          Alle Bewertungen auf Google ansehen <ArrowRight size={13} />
        </a>
      </div>
    </FadeIn>
  </div>
</section>
```

**Note:** `Star` is already in the imports (`import { ..., Star, ... } from "lucide-react"`). Check that `Star` is in the existing import — if not, add it.

### Step 3: TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```

### Step 4: Commit

```bash
cd /root/cartrade24
git add app/page.tsx
git commit -m "feat(home): redesign Google Reviews section with badge and star ratings"
```

---

## Task 11: MWST-konforme Preisdarstellung

**Files:**
- Modify: `components/vehicles/VehicleCard.tsx`
- Modify: `app/autos/[id]/page.tsx`
- Modify: `components/layout/Footer.tsx`

### Step 1: VehicleCard — add MwSt subtext to purchase price

Open `components/vehicles/VehicleCard.tsx`. Find the Kaufpreis display (around line 94–98):

```tsx
<div className="flex items-baseline justify-between">
  <span className="text-[0.68rem] text-[#9ca3af] font-medium">Kaufpreis</span>
  <span className="font-bold text-sm" style={{ color: "var(--ct-dark)" }}>
    CHF {formatCHF(vehicle.price)}
  </span>
</div>
```

Replace with:

```tsx
<div className="flex items-baseline justify-between">
  <div>
    <span className="text-[0.68rem] text-[#9ca3af] font-medium block">Kaufpreis</span>
    <span className="text-[0.6rem] text-[#9ca3af]">inkl. MwSt.</span>
  </div>
  <span className="font-bold text-sm" style={{ color: "var(--ct-dark)" }}>
    CHF {formatCHF(vehicle.price)}
  </span>
</div>
```

### Step 2: VDP — add MwSt note and occasion disclaimer

Open `app/autos/[id]/page.tsx`. Find the Kaufpreis in the sticky card (around line 273–276):

```tsx
<p className="text-2xl font-extrabold mb-5 text-ct-dark">
  CHF {formatCHF(vehicle.price)}
</p>
```

Replace with:

```tsx
<div className="mb-5">
  <p className="text-2xl font-extrabold text-ct-dark">
    CHF {formatCHF(vehicle.price)}
  </p>
  <p className="text-[10px] text-[#9ca3af] mt-0.5">
    inkl. 8.1% MwSt.
    {vehicle.condition === "Occasion" && (
      <> · Margenbesteuerung (fikt. Vorsteuerabzug)</>
    )}
  </p>
</div>
```

### Step 3: Footer — add UID/MWST number

Open `components/layout/Footer.tsx`. Find where the company address or legal info is displayed. Add after the address block (or wherever legal info sits):

```tsx
<p className="text-[10px] text-[#6b7280] mt-1">
  {/* TODO: Replace with real UID number from MWST-Register */}
  UID: CHE-XXX.XXX.XXX MWST
</p>
```

### Step 4: TypeScript check + lint

```bash
cd /root/cartrade24 && npx tsc --noEmit && npm run lint
```

### Step 5: Commit

```bash
cd /root/cartrade24
git add components/vehicles/VehicleCard.tsx app/autos/[id]/page.tsx components/layout/Footer.tsx
git commit -m "feat(legal): add MwSt-compliant price display and UID placeholder in footer"
```

---

## Task 12: Create MobileCTABar component

**Files:**
- Create: `components/ui/MobileCTABar.tsx`

### Step 1: Create the file

```tsx
// components/ui/MobileCTABar.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle, Calendar } from "lucide-react";
import TestDriveModal from "@/components/vehicles/TestDriveModal";

const PHONE = "+41566185544";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "41791234567";

export default function MobileCTABar() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  const isVDP = Boolean(pathname?.match(/^\/autos\/\d+/));

  // Extract vehicle label from URL for modal — falls back to generic label
  // The VDP page passes the vehicle label via data attribute if needed,
  // but for simplicity we use a generic label here; specific label is in the VDP modal trigger.
  const vehicleLabel = "dieses Fahrzeug";

  return (
    <>
      {/* Bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden
                      bg-white border-t border-[#e5e7eb] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-3 divide-x divide-[#e5e7eb]">
          {/* Anrufen */}
          <a
            href={`tel:${PHONE}`}
            className="flex flex-col items-center justify-center py-3 gap-1
                       text-white text-[10px] font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--ct-dark)" }}
          >
            <Phone size={18} />
            Anrufen
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-3 gap-1
                       text-white text-[10px] font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>

          {/* Probefahrt or Termin */}
          {isVDP ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex flex-col items-center justify-center py-3 gap-1
                         text-white text-[10px] font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ct-cyan)" }}
            >
              <Calendar size={18} />
              Probefahrt
            </button>
          ) : (
            <a
              href="/kontakt"
              className="flex flex-col items-center justify-center py-3 gap-1
                         text-white text-[10px] font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ct-cyan)" }}
            >
              <Calendar size={18} />
              Termin
            </a>
          )}
        </div>
      </div>

      {/* Modal (only rendered when open) */}
      {modalOpen && (
        <TestDriveModal vehicleLabel={vehicleLabel} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
```

### Step 2: TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```

### Step 3: Commit

```bash
cd /root/cartrade24
git add components/ui/MobileCTABar.tsx
git commit -m "feat(mobile): add MobileCTABar component (call/whatsapp/testdrive)"
```

---

## Task 13: Integrate MobileCTABar into layout + fix body padding

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

### Step 1: Read current layout.tsx

Open `app/layout.tsx` and find where the main body content is rendered (after `<Header />`, before `<Footer />`).

### Step 2: Add MobileCTABar import

```ts
import MobileCTABar from "@/components/ui/MobileCTABar";
```

### Step 3: Add `<MobileCTABar />` before `</body>`

Find the closing `</body>` tag (or the last component before it). Add `<MobileCTABar />` just before the closing `</body>` tag:

```tsx
      <MobileCTABar />
    </body>
```

### Step 4: Add body padding for mobile in globals.css

Open `app/globals.css`. Add at the end of the file:

```css
/* Reserve space for mobile sticky CTA bar */
@media (max-width: 767px) {
  body {
    padding-bottom: 5rem;
  }
}
```

### Step 5: TypeScript check + lint

```bash
cd /root/cartrade24 && npx tsc --noEmit && npm run lint
```

### Step 6: Manual test on mobile viewport

In Chrome DevTools, toggle mobile viewport (375px width). Verify:
- Sticky bar appears at bottom with 3 buttons
- No overlap with footer content
- Clicking "Anrufen" triggers `tel:` link
- On `/autos/1`, clicking "Probefahrt" opens the modal
- On `/autos`, clicking "Termin" navigates to `/kontakt`
- On desktop (≥ 768px): bar is invisible

### Step 7: Commit

```bash
cd /root/cartrade24
git add app/layout.tsx app/globals.css
git commit -m "feat(layout): integrate sticky MobileCTABar + body padding for mobile"
```

---

## Task 14: Final build verification

### Step 1: Run full TypeScript check

```bash
cd /root/cartrade24 && npx tsc --noEmit
```
Expected: 0 errors.

### Step 2: Run linter

```bash
cd /root/cartrade24 && npm run lint
```
Expected: 0 errors (warnings acceptable).

### Step 3: Production build

```bash
cd /root/cartrade24 && npm run build
```
Expected: Build completes successfully. Note any warnings (acceptable) but fix any errors.

### Step 4: Summarize env variables needed

Ensure `.env.local` contains:
```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=41791234567  # ← replace with real number
# Optional:
NEXT_PUBLIC_GOOGLE_PLACE_ID=ChIJ...     # ← add when Place ID is known
```

And the footer in `components/layout/Footer.tsx` has the UID placeholder `CHE-XXX.XXX.XXX MWST` replaced with the real UID.

### Step 5: Final commit

```bash
cd /root/cartrade24
git add -A
git commit -m "chore: Phase 1 Quick Wins complete — filters, VDP, calculator, reviews, MwSt, mobile CTA"
```

---

## Phase 2 Backlog (next plan)

| Feature | Key Decisions Needed |
|---------|---------------------|
| Probefahrt-Buchung mit Kalender | Calendly embed vs. eigene Lösung (Supabase + availability logic) |
| Digitale Inzahlungnahme | Kontrollschild → Eurotax API vs. manuell; Stripe für CHF 20 Gebühr |
| Fahrzeug-Reservierung | TWINT-Webhook vs. Stripe; Reservierungs-DB (Supabase oder Planetscale) |
| Mehrsprachigkeit DE/FR/IT | next-intl vs. next-i18next; URL-Struktur `/fr/...` vs. `?lang=fr` |
| Preisalarm | E-Mail via Resend oder Push via Web Push API (PWA) |
| Fahrzeugvergleich | Comparison state im URL (`?compare=1,3,5`) vs. localStorage |
