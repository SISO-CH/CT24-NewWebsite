"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

interface Props {
  vehicleId: number;
  threshold?: number;
}

export default function ViewCounter({ vehicleId, threshold = 3 }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`/api/vehicle-views?ids=${vehicleId}`)
      .then((r) => r.json())
      .then((data) => setCount(data[String(vehicleId)] ?? 0))
      .catch(() => {});
  }, [vehicleId]);

  if (count < threshold) return null;

  return (
    <p className="flex items-center gap-1 text-xs text-[#6b7280]">
      <Eye size={12} className="text-[var(--ct-cyan)]" />
      {count}&times; angesehen heute
    </p>
  );
}
