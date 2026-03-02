// components/vehicles/SimilarVehicles.tsx
import VehicleCard from "@/components/vehicles/VehicleCard";
import type { Vehicle } from "@/lib/vehicles";

interface Props {
  vehicle:     Vehicle;
  allVehicles: Vehicle[];
}

export default function SimilarVehicles({ vehicle, allVehicles }: Props) {
  const similar = allVehicles
    .filter((v) => {
      if (v.id === vehicle.id) return false;
      const sameBody = vehicle.body && v.body === vehicle.body;
      const sameFuel = vehicle.fuel && v.fuel === vehicle.fuel;
      const inRange  = Math.abs(v.price - vehicle.price) / vehicle.price <= 0.3;
      return (sameBody || sameFuel) && inRange;
    })
    .slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold text-ct-dark mb-5">Ähnliche Fahrzeuge</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {similar.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
    </div>
  );
}
