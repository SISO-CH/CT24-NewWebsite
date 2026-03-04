"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle, Calendar } from "lucide-react";
import TestDriveModal from "@/components/vehicles/TestDriveModal";
import { trackEvent } from "@/lib/tracking";

const PHONE = "+41566185544";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "41791234567";
const cellClass = "flex flex-col items-center justify-center py-3 gap-1 text-white text-[10px] font-semibold hover:opacity-90 transition-opacity";

export default function MobileCTABar() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  const isVDP = pathname.startsWith("/autos/");

  // Extract vehicle label from URL for modal — falls back to generic label
  // The VDP page passes the vehicle label via data attribute if needed,
  // but for simplicity we use a generic label here; specific label is in the VDP modal trigger.
  const vehicleLabel = "dieses Fahrzeug";

  return (
    <>
      {/* Bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden
                      bg-white border-t border-[#e5e7eb] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-3 divide-x divide-[#e5e7eb]">
          {/* Anrufen */}
          <a
            href={`tel:${PHONE}`}
            className={cellClass}
            style={{ backgroundColor: "var(--ct-dark)" }}
            onClick={() => trackEvent({ event: "phone_click", source_page: pathname, value: 50 })}
          >
            <Phone size={18} aria-hidden="true" />
            Anrufen
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cellClass}
            style={{ backgroundColor: "#25D366" }}
            onClick={() => trackEvent({ event: "whatsapp_click", source_page: pathname, value: 50 })}
          >
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp
          </a>

          {/* Probefahrt or Termin */}
          {isVDP ? (
            <button
              type="button"
              onClick={() => {
                trackEvent({ event: "cta_click", cta_type: "test_drive", source_page: pathname });
                setModalOpen(true);
              }}
              className={cellClass}
              style={{ backgroundColor: "var(--ct-cyan)" }}
            >
              <Calendar size={18} aria-hidden="true" />
              Probefahrt
            </button>
          ) : (
            <a
              href="/kontakt"
              className={cellClass}
              style={{ backgroundColor: "var(--ct-cyan)" }}
              onClick={() => trackEvent({ event: "cta_click", cta_type: "appointment", source_page: pathname })}
            >
              <Calendar size={18} aria-hidden="true" />
              Termin
            </a>
          )}
        </div>
      </div>

      {/* Modal (only rendered when open) */}
      {modalOpen && (
        <TestDriveModal vehicleLabel={vehicleLabel} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
