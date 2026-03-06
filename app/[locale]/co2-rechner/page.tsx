import type { Metadata } from "next";
import { fetchVehicles } from "@/lib/as24";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import Co2Calculator from "@/components/tools/Co2Calculator";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "CO2-Straf-Rechner für Händler | Car Trade24",
  description:
    "Berechnen Sie die ASTRA CO2-Sanktion für Ihre Fahrzeugflotte und sehen Sie, wie emissionsarme Fahrzeuge von Car Trade24 Ihre Strafe senken.",
};

export default async function Co2RechnerPage() {
  const vehicles = await fetchVehicles();

  /* Filter vehicles with valid CO2 data, sort ascending */
  const lowEmissionVehicles = vehicles
    .filter((v) => v.co2 != null && v.co2 > 0)
    .sort((a, b) => (a.co2 ?? 999) - (b.co2 ?? 999));

  return (
    <>
      <BreadcrumbSchema
        crumbs={[
          { name: "Home", href: "/" },
          { name: "CO2-Rechner", href: "/co2-rechner" },
        ]}
      />

      {/* ── Hero ── */}
      <section
        className="pt-24 pb-14"
        style={{
          background: "linear-gradient(135deg, var(--ct-dark) 0%, #0d2d3e 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
            style={{ color: "var(--ct-cyan)" }}
          >
            Händler-Tool
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-white">
            CO2-Straf-Rechner
            <br />
            <span style={{ color: "var(--ct-cyan)" }}>für Schweizer Händler</span>
          </h1>
          <p className="text-[#9ca3af] max-w-xl text-lg leading-relaxed">
            Berechnen Sie die ASTRA CO2-Sanktion für Ihre importierte Fahrzeugflotte
            und sehen Sie, wie emissionsarme Fahrzeuge aus unserem Bestand Ihre Strafe
            reduzieren.
          </p>
        </div>
      </section>

      {/* ── Calculator ── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Co2Calculator lowEmissionVehicles={lowEmissionVehicles} />
        </div>
      </section>

      {/* ── Info ── */}
      <section className="py-12 md:py-16 bg-ct-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-extrabold mb-4"
            style={{ color: "var(--ct-dark)" }}
          >
            Wie funktioniert die CO2-Sanktion?
          </h2>
          <div className="prose prose-sm max-w-none text-[#4b5563] leading-relaxed space-y-3">
            <p>
              Seit 2012 erhebt die Schweiz (ASTRA) CO2-Emissionsvorschriften für neu
              zugelassene Personenwagen. Importeure und Grosshändler, die den
              Flottendurchschnitt überschreiten, zahlen eine Sanktion pro Gramm
              CO2/km über dem Zielwert — für jedes importierte Fahrzeug.
            </p>
            <p>
              <strong>Zielwert 2025:</strong> 118 g CO2/km (WLTP).
              <br />
              <strong>Sanktion:</strong> CHF 108 pro g/km Überschreitung, pro
              Fahrzeug.
            </p>
            <p>
              Durch den gezielten Einkauf emissionsarmer Fahrzeuge können Sie Ihren
              Flottendurchschnitt senken und so die Sanktion erheblich reduzieren oder
              sogar ganz vermeiden.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
