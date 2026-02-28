import VehicleCard from "./VehicleCard";
import type { Vehicle } from "@/lib/vehicles";

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export default function VehicleGrid({ vehicles }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20 border border-[#e5e7eb]">
        <p className="text-[#6b7280] font-medium">Keine Fahrzeuge gefunden.</p>
        <p className="text-[#9ca3af] text-sm mt-1">Bitte passen Sie die Filterkriterien an.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
