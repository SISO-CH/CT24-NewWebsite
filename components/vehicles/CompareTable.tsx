import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCHF } from "@/lib/utils";
import type { Vehicle } from "@/lib/vehicles";
import EnergyLabel from "./EnergyLabel";

interface Props {
  vehicles: Vehicle[];
}

type RowDef = {
  label: string;
  get: (v: Vehicle) => string | number | null | undefined;
  format?: (val: string | number) => string;
};

const ROWS: RowDef[] = [
  { label: "Kaufpreis",      get: (v) => v.price,        format: (val) => `CHF ${formatCHF(Number(val))}` },
  { label: "Baujahr",        get: (v) => v.year },
  { label: "Kilometerstand", get: (v) => v.mileage,      format: (val) => `${formatCHF(Number(val))} km` },
  { label: "Kraftstoff",     get: (v) => v.fuel },
  { label: "Getriebe",       get: (v) => v.transmission },
  { label: "Leistung",       get: (v) => v.power,        format: (val) => `${val} PS` },
  { label: "Karosserie",     get: (v) => v.body },
  { label: "Farbe",          get: (v) => v.color },
  { label: "Antrieb",        get: (v) => v.drivetrain },
  { label: "Türen",          get: (v) => v.doors },
  { label: "Sitze",          get: (v) => v.seats },
  { label: "Energielabel",   get: (v) => v.energyLabel },
];

function displayVal(row: RowDef, v: Vehicle): string {
  const raw = row.get(v);
  if (raw == null || raw === "") return "–";
  return row.format ? row.format(raw) : String(raw);
}

export default function CompareTable({ vehicles }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e5e7eb]">
      <table className="w-full border-collapse">
        {/* Header row */}
        <thead>
          <tr>
            <th className="w-36 min-w-[140px] bg-[var(--ct-light)] p-4 text-left text-[0.65rem] font-bold uppercase tracking-wider text-[#6b7280]">
              Fahrzeug
            </th>
            {vehicles.map((v) => (
              <th key={v.id} className="p-4 bg-[var(--ct-light)] border-l border-[#e5e7eb] min-w-[200px]">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-2 bg-[#f4f6f8]">
                  <Image
                    src={v.image}
                    alt={`${v.make} ${v.model}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--ct-cyan)]">{v.year}</p>
                <p className="text-sm font-extrabold text-[var(--ct-dark)] leading-snug">
                  {v.make} {v.model}
                </p>
                {v.variant && <p className="text-[11px] text-[#9ca3af]">{v.variant}</p>}
                {v.energyLabel && (
                  <div className="mt-1">
                    <EnergyLabel label={v.energyLabel} size="sm" />
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Data rows */}
        <tbody>
          {ROWS.map((row, i) => {
            const values = vehicles.map((v) => displayVal(row, v));
            const uniqueVals = new Set(values.filter((v) => v !== "–"));
            const allSame = uniqueVals.size <= 1;
            return (
              <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                <td className="p-4 text-[0.65rem] font-semibold text-[#6b7280] uppercase tracking-wider border-r border-[#f0f0f0]">
                  {row.label}
                </td>
                {values.map((val, vi) => (
                  <td
                    key={vehicles[vi].id}
                    className={`p-4 text-sm font-semibold border-l border-[#f0f0f0] text-center ${
                      !allSame && val !== "–"
                        ? "bg-[var(--ct-cyan)]/10 text-[var(--ct-dark)]"
                        : "text-[#374151]"
                    }`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>

        {/* CTA row */}
        <tfoot>
          <tr className="bg-[var(--ct-light)]">
            <td className="p-4" />
            {vehicles.map((v) => (
              <td key={v.id} className="p-4 border-l border-[#e5e7eb]">
                <Link
                  href={`/autos/${v.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3
                             text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "var(--ct-cyan)" }}
                >
                  Anfragen <ArrowRight size={12} />
                </Link>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
