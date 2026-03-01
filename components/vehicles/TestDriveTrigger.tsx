"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import TestDriveModal from "./TestDriveModal";

interface TestDriveTriggerProps {
  vehicleLabel: string;
}

export default function TestDriveTrigger({ vehicleLabel }: TestDriveTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                   border border-[#e5e7eb] text-sm font-semibold hover:bg-ct-light transition-colors text-ct-dark"
      >
        <Calendar size={14} /> Probefahrt buchen
      </button>
      {open && <TestDriveModal vehicleLabel={vehicleLabel} onClose={() => setOpen(false)} />}
    </>
  );
}
