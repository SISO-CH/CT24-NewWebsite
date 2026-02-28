// components/ui/LeasingCalculator.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCHF } from "@/lib/utils";

// Standard Swiss leasing rate: 3.9% p.a.
const ANNUAL_RATE = 0.039;

// Note: km/year (Jahreskilometer) is shown to the user for reference and
// displayed in the disclaimer, but does not alter the annuity calculation.
// A full model would factor in residual value based on km — this is an
// intentional simplification for indicative display purposes.
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
  /** Show link to /finanzierung — use true for VDP widget */
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
       ? "bg-ct-cyan text-white"
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
            <span>CHF 10&apos;000</span><span>CHF 100&apos;000</span>
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
          Detailrechner &amp; alle Optionen →
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
