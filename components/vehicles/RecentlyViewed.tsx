// components/vehicles/RecentlyViewed.tsx
"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed, type RecentVehicle } from "@/lib/recently-viewed";
import Link from "next/link";
import Image from "next/image";

export default function RecentlyViewed() {
  const [vehicles, setVehicles] = useState<RecentVehicle[]>([]);

  useEffect(() => {
    setVehicles(getRecentlyViewed());
  }, []);

  if (vehicles.length === 0) return null;

  return (
    <section className="py-12 bg-ct-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-ct-dark mb-6">Zuletzt angesehen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/autos/${v.id}`}
              className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={v.image || "/images/placeholder.webp"}
                  alt={`${v.make} ${v.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-ct-dark truncate">
                  {v.make} {v.model}
                </p>
                <p className="text-sm text-[#6b7280]">
                  CHF {v.price.toLocaleString("de-CH")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
