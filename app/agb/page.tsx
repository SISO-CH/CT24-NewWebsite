import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen der Car Trade24 GmbH.",
};

export default function AgbPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
            style={{ color: "var(--ct-cyan)" }}
          >
            Rechtliches
          </p>
          <h1 className="text-4xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
            Allgemeine Geschäftsbedingungen
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#6b7280] text-sm mb-8">
            Stand: Januar 2026 · Car Trade24 GmbH, Ringstrasse 26, 5610 Wohlen
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            1. Geltungsbereich
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
            Car Trade24 GmbH (nachfolgend „Verkäufer") und dem Käufer über den Kauf von
            Gebraucht- und Neufahrzeugen sowie damit zusammenhängende Dienstleistungen.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            2. Vertragsschluss
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Kaufangebote des Verkäufers sind freibleibend. Ein bindender Vertrag kommt erst
            mit der schriftlichen Auftragsbestätigung oder der Übergabe des Fahrzeugs zustande.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            3. Preise und Zahlung
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Alle Preisangaben sind in CHF inkl. MWST. Die vollständige Kaufsumme ist vor
            Fahrzeugübergabe zu begleichen – bar, per Banküberweisung oder Finanzierung.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            4. Garantie
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Gewährleistungsrechte richten sich nach dem schweizerischen Obligationenrecht (OR).
            Zusätzliche Garantieleistungen werden im Kaufvertrag schriftlich vereinbart.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            5. Gerichtsstand
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed">
            Gerichtsstand ist Wohlen (AG). Es gilt ausschliesslich schweizerisches Recht.
          </p>
        </div>
      </section>
    </>
  );
}
