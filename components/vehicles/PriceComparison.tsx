import { getValuation } from "@/lib/eurotax";
import type { Vehicle } from "@/lib/vehicles";

interface Props {
  vehicle: Vehicle;
}

function fmt(n: number): string {
  return n.toLocaleString("de-CH", { maximumFractionDigits: 0 });
}

export default async function PriceComparison({ vehicle }: Props) {
  let valuation: { min: number; max: number } | null = null;

  try {
    valuation = await getValuation(vehicle.vin ?? vehicle.make, vehicle.mileage, "Gut");
  } catch {
    return null;
  }

  if (!valuation) return null;

  const { min, max } = valuation;
  const marketMid = (min + max) / 2;
  const diff = vehicle.price - marketMid;
  const diffPct = marketMid > 0 ? Math.round((diff / marketMid) * 100) : 0;
  const rangeWidth = max - min;
  const clampedPos = Math.max(
    0,
    Math.min(100, rangeWidth > 0 ? ((vehicle.price - min) / rangeWidth) * 100 : 50)
  );

  const label =
    diffPct <= -5
      ? `${Math.abs(diffPct)} % unter Marktdurchschnitt`
      : diffPct >= 5
      ? `${diffPct} % über Marktdurchschnitt`
      : "Im Marktbereich";

  const labelColor =
    diffPct <= -5
      ? "text-ct-green"
      : diffPct >= 5
      ? "text-ct-magenta"
      : "text-[#6b7280]";

  return (
    <div className="rounded-xl border border-[#e5e7eb] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-3">
        Marktpreisvergleich
      </p>
      <div className="relative h-2 rounded-full bg-[#e5e7eb] mb-2">
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-ct-cyan border-2 border-white shadow"
          style={{ left: `${clampedPos}%`, top: "50%", transform: "translate(-50%, -50%)" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#9ca3af] mb-3">
        <span>CHF {fmt(min)}</span>
        <span>CHF {fmt(max)}</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ct-dark">Unser Preis: CHF {fmt(vehicle.price)}</p>
        <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
      </div>
      <p className="text-[10px] text-[#9ca3af] mt-1">
        * Marktschätzung basierend auf vergleichbaren Fahrzeugen. Kein verbindlicher Marktwert.
      </p>
    </div>
  );
}
