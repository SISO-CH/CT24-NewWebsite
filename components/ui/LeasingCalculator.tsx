"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatCHF, calcMonthlyRate } from "@/lib/utils";

interface LeasingCalculatorProps {
  /** If provided, price slider is hidden and this value is used */
  fixedPrice?: number;
  /** Show link to /finanzierung — use true for VDP widget */
  showLink?: boolean;
}

const TERM_OPTIONS = [24, 36, 48, 60] as const;
const KM_OPTIONS = [10000, 15000, 20000, 30000] as const;
const DOWN_DEFAULT = 10;

function toggleBtnClass(active: boolean) {
  return `h-8 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
    active ? "bg-ct-cyan text-white" : "bg-ct-light text-[#6b7280] hover:bg-[#e8eaec]"
  }`;
}

export default function LeasingCalculator({ fixedPrice, showLink = false }: LeasingCalculatorProps) {
  const [price, setPrice] = useState(fixedPrice ?? 35000);
  const [down, setDown] = useState(DOWN_DEFAULT);
  const [months, setMonths] = useState<(typeof TERM_OPTIONS)[number]>(48);
  const [km, setKm] = useState<(typeof KM_OPTIONS)[number]>(15000);

  const rate = useMemo(
    () => calcMonthlyRate(fixedPrice ?? price, down, months),
    [fixedPrice, price, down, months]
  );

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
              {formatCHF(k)}
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
          3.9% p.a., {down}% Anzahlung, {months} Monate, {formatCHF(km)} km/J.
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
