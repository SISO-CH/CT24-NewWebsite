"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import TradeInModal from "./TradeInModal";

interface Props {
  targetVehicleLabel: string;
  targetVehicleId: number;
}

export default function TradeInTrigger({ targetVehicleLabel, targetVehicleId }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#e5e7eb] text-sm font-semibold text-[#374151] hover:bg-ct-light transition-colors"
      >
        <ArrowLeftRight size={15} />
        Inzahlungnahme
      </button>
      {open && (
        <TradeInModal
          targetVehicleLabel={targetVehicleLabel}
          targetVehicleId={targetVehicleId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
