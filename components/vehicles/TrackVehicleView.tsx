"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";
import { trackEvent } from "@/lib/tracking";

interface Props {
  vehicleId: number;
  make: string;
  model: string;
  price: number;
  image: string;
}

export default function TrackVehicleView({ vehicleId, make, model, price, image }: Props) {
  useEffect(() => {
    addRecentlyViewed({ id: vehicleId, make, model, price, image });
    trackEvent({
      event: "vehicle_view",
      vehicle_id: vehicleId,
      vehicle_make: make,
      vehicle_model: model,
      vehicle_price: price,
    });
    // Increment view counter
    fetch("/api/vehicle-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: vehicleId }),
    }).catch(() => {});
  }, [vehicleId, make, model, price, image]);

  return null;
}
