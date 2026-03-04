"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";
import { trackEvent } from "@/lib/tracking";

interface Props {
  vehicleId: number;
  make: string;
  model: string;
  price: number;
}

export default function TrackVehicleView({ vehicleId, make, model, price }: Props) {
  useEffect(() => {
    addRecentlyViewed(vehicleId);
    trackEvent({
      event: "vehicle_view",
      vehicle_id: vehicleId,
      vehicle_make: make,
      vehicle_model: model,
      vehicle_price: price,
    });
  }, [vehicleId, make, model, price]);

  return null;
}
