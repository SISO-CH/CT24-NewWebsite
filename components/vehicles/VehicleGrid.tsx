"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import VehicleCard from "./VehicleCard";
import type { Vehicle } from "@/lib/vehicles";

const PAGE_SIZE = 12;

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export default function VehicleGrid({ vehicles }: VehicleGridProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset when vehicles change (e.g. filter applied)
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [vehicles]);

  const loadMore = useCallback(() => {
    setVisible((prev) => Math.min(prev + PAGE_SIZE, vehicles.length));
  }, [vehicles.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20 border border-[#e5e7eb]">
        <p className="text-[#6b7280] font-medium">Keine Fahrzeuge gefunden.</p>
        <p className="text-[#9ca3af] text-sm mt-1">Bitte passen Sie die Filterkriterien an.</p>
      </div>
    );
  }

  const hasMore = visible < vehicles.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {vehicles.slice(0, visible).map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <button
            type="button"
            onClick={loadMore}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity bg-ct-cyan"
          >
            Weitere Fahrzeuge laden ({vehicles.length - visible} übrig)
          </button>
        </div>
      )}
    </>
  );
}
