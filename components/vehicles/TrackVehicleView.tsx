// components/vehicles/TrackVehicleView.tsx
"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";

export default function TrackVehicleView({ vehicleId }: { vehicleId: number }) {
  useEffect(() => { addRecentlyViewed(vehicleId); }, [vehicleId]);
  return null;
}
