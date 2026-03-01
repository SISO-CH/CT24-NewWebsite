import type { Metadata } from "next";
import ContactContent from "@/components/contact/ContactContent";

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
      <ContactContent />
    </div>
  );
}
