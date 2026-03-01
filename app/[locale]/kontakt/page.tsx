import type { Metadata } from "next";
import ContactContent from "@/components/contact/ContactContent";
import MatelsoBookingWidget, { isMatelsoConfigured } from "@/components/ui/MatelsoBookingWidget";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie Car Trade24 GmbH in Wohlen (Aargau).",
};

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div style={{ backgroundColor: "var(--ct-light)" }} className="border-b border-[#e5e7eb] pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <p
            className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] mb-2"
            style={{ color: "var(--ct-cyan)" }}
          >
            Car Trade24 GmbH
          </p>
          <h1 className="text-4xl font-bold" style={{ color: "var(--ct-text)" }}>
            Kontakt
          </h1>
          <p className="text-[#6b7280] text-sm mt-2">
            Wir freuen uns auf Ihre Nachricht.
          </p>
        </div>
      </div>
      {/* Probefahrt buchen */}
      <section className="py-12 bg-[var(--ct-light)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-[var(--ct-cyan)]">
            Probefahrt
          </p>
          <h2 className="text-2xl font-extrabold text-[var(--ct-dark)] mb-2">
            Probefahrt buchen
          </h2>
          <p className="text-sm text-[#6b7280] mb-6">
            Buchen Sie Ihre kostenlose Probefahrt direkt online.
          </p>
          {isMatelsoConfigured ? (
            <MatelsoBookingWidget height={600} />
          ) : (
            <p className="text-sm text-[#9ca3af] italic">
              Online-Buchung wird in Kürze verfügbar sein. Bitte kontaktieren Sie uns telefonisch unter +41 56 618 55 44.
            </p>
          )}
        </div>
      </section>
      <ContactContent />
    </div>
  );
}
