"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import InquiryModal from "@/components/vehicles/InquiryModal";
import { trackEvent } from "@/lib/tracking";

interface InquiryTriggerProps {
  vehicleLabel: string;
  vehiclePrice?: number;
}

export default function InquiryTrigger({ vehicleLabel, vehiclePrice }: InquiryTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackEvent({ event: "cta_click", cta_type: "inquiry", source_page: window.location.pathname });
          setOpen(true);
        }}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                   text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "var(--ct-cyan)" }}
      >
        Jetzt anfragen <ArrowRight size={15} />
      </button>
      {open && (
        <InquiryModal
          vehicleLabel={vehicleLabel}
          vehiclePrice={vehiclePrice}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
