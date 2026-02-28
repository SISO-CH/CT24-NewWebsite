import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung der Car Trade24 GmbH gemäss revDSG.",
};

export default function DatenschutzPage() {
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
            Datenschutzerklärung
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#6b7280] text-sm mb-8">
            Stand: Januar 2026 · Gemäss revDSG (Schweiz)
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            1. Verantwortliche Stelle
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Car Trade24 GmbH, Ringstrasse 26, 5610 Wohlen · info@cartrade24.ch
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            2. Erhobene Daten
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Beim Ausfüllen des Kontaktformulars erheben wir: Name, E-Mail-Adresse, Telefonnummer
            (freiwillig) und den Nachrichtentext. Diese Daten werden ausschliesslich zur
            Bearbeitung Ihrer Anfrage verwendet.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            3. Datenweitergabe
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Ihre Daten werden nicht an Dritte weitergegeben. Es findet kein Verkauf von
            Personendaten statt.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            4. Aufbewahrung
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Kontaktanfragen werden nach vollständiger Bearbeitung gelöscht, spätestens
            nach 12 Monaten.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            5. Ihre Rechte
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed">
            Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten.
            Anfragen richten Sie bitte an info@cartrade24.ch.
          </p>
        </div>
      </section>
    </>
  );
}
