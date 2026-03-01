import type { Metadata } from "next";
import { fetchVehicles } from "@/lib/as24";
import CompareTable from "@/components/vehicles/CompareTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Fahrzeugvergleich",
  description: "Vergleichen Sie bis zu 3 Fahrzeuge von Car Trade24 nebeneinander.",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ compare?: string }>;
}

export default async function VergleichPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { compare } = await searchParams;
  const ids = (compare ?? "")
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0)
    .slice(0, 3);

  const allVehicles = await fetchVehicles();
  const vehicles = ids
    .map((id) => allVehicles.find((v) => v.id === id))
    .filter((v): v is (typeof allVehicles)[number] => v !== undefined);

  return (
    <>
      <section className="pt-24 pb-6 bg-[var(--ct-light)] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/autos"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[var(--ct-cyan)] transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Zurück zur Übersicht
          </Link>
          <h1 className="text-3xl font-extrabold text-[var(--ct-dark)]">Fahrzeugvergleich</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {vehicles.length} {vehicles.length === 1 ? "Fahrzeug" : "Fahrzeuge"} im Vergleich
          </p>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {vehicles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#9ca3af] text-sm mb-4">
                Keine Fahrzeuge zum Vergleichen ausgewählt.
              </p>
              <Link
                href="/autos"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Zu den Fahrzeugen
              </Link>
            </div>
          ) : (
            <CompareTable vehicles={vehicles} locale={locale} />
          )}
        </div>
      </section>
    </>
  );
}
