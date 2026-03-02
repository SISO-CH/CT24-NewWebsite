// components/vehicles/RecentlyViewed.tsx
"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import VehicleCard from "@/components/vehicles/VehicleCard";
import type { Vehicle } from "@/lib/vehicles";

interface Props {
  allVehicles: Vehicle[];
}

export default function RecentlyViewed({ allVehicles }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const ids   = getRecentlyViewed();
    const found = ids
      .map((id) => allVehicles.find((v) => v.id === id))
      .filter((v): v is Vehicle => v !== undefined);
    setVehicles(found);
  }, [allVehicles]);

  if (vehicles.length === 0) return null;

  return (
    <section className="py-12 bg-ct-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-ct-dark mb-6">Zuletzt angesehen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      </div>
    </section>
  );
}
