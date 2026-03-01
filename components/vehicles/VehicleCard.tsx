import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCHF } from "@/lib/utils";
import type { Vehicle } from "@/lib/vehicles";
import EnergyLabel from "./EnergyLabel";

function getBadgeStyle(badge: string): { bg: string } {
  if (badge.startsWith("-")) return { bg: "var(--ct-magenta)" };
  if (badge === "Neu") return { bg: "#374151" };
  return { bg: "var(--ct-cyan)" };
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center h-6 px-2 bg-[#f4f6f8] text-[#6b7280] text-[0.7rem] font-medium rounded-md">
      {label}
    </span>
  );
}

export default function VehicleCard({ vehicle, className = "" }: { vehicle: Vehicle; className?: string }) {
  const badgeStyle = vehicle.badge ? getBadgeStyle(vehicle.badge) : null;

  return (
    <article className={`group bg-white border border-[#ebebeb] rounded-2xl overflow-hidden flex flex-col
                        shadow-[0_2px_8px_rgba(0,0,0,0.05)]
                        hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1.5
                        transition-all duration-300 ease-out ${className}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f6f8]">
        <Image
          src={vehicle.image}
          alt={`${vehicle.make} ${vehicle.model} ${vehicle.variant}`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {vehicle.badge && badgeStyle && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[0.68rem] rounded-full text-white uppercase tracking-wide font-bold shadow-sm"
                style={{ backgroundColor: badgeStyle.bg }}>
            {vehicle.badge}
          </span>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {vehicle.fuel && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-white/90 text-[#374151] backdrop-blur-sm shadow-sm">
              {vehicle.fuel}
            </span>
          )}
          {vehicle.body && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-white/90 text-[#374151] backdrop-blur-sm shadow-sm">
              {vehicle.body}
            </span>
          )}
        </div>

        {vehicle.energyLabel && (
          <div className="absolute bottom-2.5 left-3">
            <EnergyLabel label={vehicle.energyLabel} size="sm" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] mb-0.5" style={{ color: "var(--ct-cyan)" }}>
          {vehicle.year}
        </p>
        <h3 className="text-[1rem] font-extrabold leading-snug mb-0.5" style={{ color: "var(--ct-dark)" }}>
          {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.variant && (
          <p className="text-[#9ca3af] text-xs mb-3 truncate">{vehicle.variant}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Chip label={`${formatCHF(vehicle.mileage)} km`} />
          <Chip label={`${vehicle.power} PS`} />
          <Chip label={vehicle.transmission} />
        </div>

        <div className="mt-auto rounded-xl bg-[#f9fafb] p-3 mb-3">
          {vehicle.leasingPrice > 0 && (
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[0.68rem] text-[#9ca3af] font-medium">Leasing ab</span>
              <span className="font-black text-lg leading-none" style={{ color: "var(--ct-magenta)" }}>
                CHF {formatCHF(vehicle.leasingPrice)}<span className="text-xs font-normal text-[#9ca3af]">/Mt.</span>
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[0.68rem] text-[#9ca3af] font-medium block">Kaufpreis</span>
              <span className="text-[0.6rem] text-[#9ca3af]">inkl. MwSt.</span>
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--ct-dark)" }}>
              CHF {formatCHF(vehicle.price)}
            </span>
          </div>
        </div>

        <Link
          href={`/autos/${vehicle.id}`}
          className="flex items-center justify-center gap-1.5 font-semibold text-sm text-white rounded-xl py-2.5
                     hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--ct-cyan)" }}
        >
          Fahrzeug ansehen <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
