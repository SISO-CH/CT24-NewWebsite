import Image from "next/image";
import Link from "next/link";
import { formatCHF, calcMonthlyRate } from "@/lib/utils";
import type { Vehicle } from "@/lib/vehicles";
import CompareToggle from "./CompareToggle";
import WishlistHeart from "@/components/vehicles/WishlistHeart";
import ViewCounter from "@/components/vehicles/ViewCounter";

const CONDITION_BADGE: Record<string, { label: string; bg: string }> = {
  Neuwagen:        { label: "Neuwagen",        bg: "var(--ct-green)" },
  Occasion:        { label: "Occasion",        bg: "var(--ct-cyan)" },
  Vorführfahrzeug: { label: "Vorführfahrzeug", bg: "var(--ct-dark)" },
};

export default function VehicleCard({ vehicle, className = "", reserved = false }: { vehicle: Vehicle; className?: string; reserved?: boolean }) {
  const condition = CONDITION_BADGE[vehicle.condition ?? "Occasion"] ?? CONDITION_BADGE.Occasion;
  const gearShort = vehicle.transmission === "Automat" ? "AT" : "MT";

  // Scarcity badges
  const isNew = vehicle.createdAt
    ? (Date.now() - new Date(vehicle.createdAt).getTime()) < 7 * 86400000
    : false;
  const isReduced = vehicle.previousPrice && vehicle.previousPrice > vehicle.price;
  const savingsPercent = isReduced
    ? Math.round(((vehicle.previousPrice! - vehicle.price) / vehicle.previousPrice!) * 100)
    : 0;

  const specs2Parts = [
    vehicle.power ? `${vehicle.power} PS` : null,
    vehicle.drivetrain ?? null,
  ].filter(Boolean);

  return (
    <Link href={`/autos/${vehicle.id}`} className={`group bg-white border border-[#ebebeb] rounded-2xl overflow-hidden flex flex-col
                        shadow-[0_2px_8px_rgba(0,0,0,0.05)]
                        hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1.5
                        transition-all duration-300 ease-out ${className}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f6f8]">
        <Image
          src={vehicle.image}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Top left: Condition or Reserved badge */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 text-[0.68rem] rounded-full text-white uppercase tracking-wide font-bold shadow-sm"
          style={{ backgroundColor: reserved ? "#6b7280" : condition.bg }}
        >
          {reserved ? "Reserviert" : condition.label}
        </span>

        {/* Preorder badge (top left, below condition) */}
        {vehicle.preorder && (
          <span className="absolute top-10 left-3 z-10 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Demnächst verfügbar
          </span>
        )}

        {/* Scarcity badge (top left, below condition) */}
        {!vehicle.preorder && isNew && (
          <span className="absolute top-10 left-3 px-2 py-0.5 text-[10px] rounded-full text-white font-bold shadow-sm"
                style={{ backgroundColor: "var(--ct-green)" }}>
            Neu eingetroffen
          </span>
        )}
        {!vehicle.preorder && isReduced && !isNew && (
          <span className="absolute top-10 left-3 px-2 py-0.5 text-[10px] rounded-full text-white font-bold shadow-sm"
                style={{ backgroundColor: "var(--ct-magenta)" }}>
            Preisreduziert
          </span>
        )}

        {/* Top right: Fuel badge */}
        {vehicle.fuel && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-[11px] font-medium rounded-full bg-white/90 text-[#374151] backdrop-blur-sm shadow-sm">
            {vehicle.fuel}
          </span>
        )}

        {/* Bottom left: Wishlist heart */}
        <div className="absolute bottom-2 left-2 z-10">
          <WishlistHeart
            vehicle={{ id: vehicle.id, make: vehicle.make, model: vehicle.model, price: vehicle.price, image: vehicle.images?.[0] ?? "" }}
            size={16}
          />
        </div>

        {/* Bottom right: Compare toggle */}
        <div className="absolute bottom-2.5 right-3">
          <CompareToggle vehicleId={vehicle.id} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-[1rem] font-extrabold leading-snug mb-1 text-ct-dark">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-xs text-[#6b7280] mb-0.5">
          {vehicle.year} · {formatCHF(vehicle.mileage)} km · {gearShort}
        </p>
        {specs2Parts.length > 0 && (
          <p className="text-xs text-[#6b7280]">
            {specs2Parts.join(" · ")}
          </p>
        )}

        <div className="mt-auto pt-3">
          {isReduced && (
            <p className="text-xs text-[#9ca3af] line-through">
              CHF {formatCHF(vehicle.previousPrice!)}
            </p>
          )}
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-extrabold text-ct-dark">
              CHF {formatCHF(vehicle.price)}
            </p>
            {isReduced && (
              <span className="text-xs font-bold" style={{ color: "var(--ct-magenta)" }}>
                &minus;{savingsPercent}%
              </span>
            )}
          </div>
          <p className="text-[0.6rem] text-[#9ca3af]">inkl. MwSt.</p>
          {vehicle.price > 0 && (
            <p className="text-xs font-semibold text-ct-magenta mt-0.5">
              ab CHF {formatCHF(Math.round(calcMonthlyRate(vehicle.price)))}/Mt.
            </p>
          )}
          <ViewCounter vehicleId={vehicle.id} />
        </div>
      </div>
    </Link>
  );
}
