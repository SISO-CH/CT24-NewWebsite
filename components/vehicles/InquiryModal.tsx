"use client";

import { X, MessageCircle } from "lucide-react";
import VDPContactForm from "@/components/vehicles/VDPContactForm";

interface InquiryModalProps {
  vehicleLabel: string;
  vehiclePrice?: number;
  onClose: () => void;
}

export default function InquiryModal({ vehicleLabel, vehiclePrice, onClose }: InquiryModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 sm:inset-x-4 sm:inset-y-auto sm:top-1/2 sm:-translate-y-1/2
                   max-w-md sm:mx-auto bg-white sm:rounded-2xl shadow-2xl z-50 p-6
                   overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Fahrzeug anfragen"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle size={16} style={{ color: "var(--ct-cyan)" }} />
              <p className="text-[0.65rem] font-bold uppercase tracking-wider"
                 style={{ color: "var(--ct-cyan)" }}>
                Jetzt anfragen
              </p>
            </div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--ct-dark)" }}>
              {vehicleLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-ct-light transition-colors text-[#9ca3af]"
            aria-label="Schliessen"
          >
            <X size={18} />
          </button>
        </div>
        <VDPContactForm vehicleLabel={vehicleLabel} vehiclePrice={vehiclePrice} />
      </div>
    </>
  );
}
