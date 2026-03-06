import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSoldVehicles } from "@/lib/sold-vehicles";
import { formatCHF } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fahrzeug-Archiv — Verkaufte Fahrzeuge | Car Trade24",
  description:
    "Bereits verkaufte Fahrzeuge von Car Trade24. Ähnliches Fahrzeug gesucht? Kontaktieren Sie uns.",
};

export const revalidate = 3600;

export default async function FahrzeugArchivPage() {
  const vehicles = await getSoldVehicles();

  return (
    <>
      {/* Hero */}
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
            Archiv
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-ct-dark">
            Fahrzeug-Archiv
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Diese Fahrzeuge wurden bereits verkauft. Sie suchen etwas
            Ähnliches? Wir helfen Ihnen gerne weiter.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {vehicles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6b7280] text-lg mb-6">
              Noch keine archivierten Fahrzeuge.
            </p>
            <Link
              href="/autos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors duration-200"
              style={{ backgroundColor: "var(--ct-cyan)" }}
            >
              Aktuelle Fahrzeuge ansehen
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <Link
                  key={v.id}
                  href={`/fahrzeug-archiv/${v.id}`}
                  className="group bg-white border border-[#ebebeb] rounded-2xl overflow-hidden flex flex-col
                             shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]
                             transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f6f8]">
                    <Image
                      src={v.image}
                      alt={`${v.make} ${v.model}`}
                      fill
                      className="object-cover opacity-75"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Verkauft badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[0.68rem] rounded-full text-white uppercase tracking-wide font-bold shadow-sm bg-[#6b7280]">
                      Verkauft
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-ct-dark text-[0.95rem] leading-tight">
                      {v.make} {v.model}
                      {v.variant ? ` ${v.variant}` : ""}
                    </h3>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[0.78rem] text-[#6b7280]">
                      <span>{v.year}</span>
                      <span>{formatCHF(v.mileage)} km</span>
                      {v.fuel && <span>{v.fuel}</span>}
                    </div>

                    <p className="mt-3 text-[0.9rem] font-bold text-[#6b7280] line-through">
                      CHF {formatCHF(v.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-12 py-8 px-6 bg-ct-light rounded-2xl">
              <p className="text-lg font-semibold text-ct-dark mb-2">
                Ähnliches Fahrzeug gesucht?
              </p>
              <p className="text-[#6b7280] mb-5">
                Kontaktieren Sie uns — wir finden Ihr Wunschfahrzeug.
              </p>
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors duration-200"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  );
}
