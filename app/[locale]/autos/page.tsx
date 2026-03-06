import type { Metadata } from "next";
import { fetchVehicles } from "@/lib/as24";
import { fetchPreorderVehicles } from "@/lib/preorder-vehicles";
import AutosContent from "@/components/vehicles/AutosContent";

export const metadata: Metadata = {
  title: "Fahrzeugübersicht",
  description: "Geprüfte Occasionen und Neuwagen bei Car Trade24 in Wohlen. Über 50 Fahrzeuge an Lager.",
};

// ISR: Seite stündlich neu generieren
export const revalidate = 3600;

export default async function AutosPage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; body?: string }>;
}) {
  const [{ make, body }, activeVehicles, preorderVehicles] = await Promise.all([
    searchParams,
    fetchVehicles(),
    fetchPreorderVehicles(),
  ]);
  const vehicles = [...activeVehicles, ...preorderVehicles];

  const VALID_BODIES = ["Cabriolet", "Coupé", "Kombi", "Limousine", "SUV", "Van"] as const;
  const initialMake = make ?? "";
  const initialBody =
    body && VALID_BODIES.includes(body as (typeof VALID_BODIES)[number])
      ? (body as (typeof VALID_BODIES)[number])
      : "";

  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
            Unser Angebot
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-ct-dark">Fahrzeuge</h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            {vehicles.length} geprüfte Occasionen und Neuwagen — direkt ab Hof in Wohlen.
          </p>
        </div>
      </section>
      <AutosContent
        vehicles={vehicles}
        initialMake={initialMake}
        initialBody={initialBody}
      />
    </>
  );
}
