import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSoldVehicle } from "@/lib/sold-vehicles";
import { fetchVehicles } from "@/lib/as24";
import { formatCHF } from "@/lib/utils";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

// JSON.stringify auto-escapes special characters, making this safe for JSON-LD.
// The additional replace guards against edge-case "</script>" in string values.
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/<!--/g, "<\\!--");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getSoldVehicle(id);
  if (!vehicle) return { title: "Fahrzeug nicht gefunden" };

  const name = `${vehicle.make} ${vehicle.model}${vehicle.variant ? " " + vehicle.variant : ""}`;
  return {
    title: `${name} (Verkauft) | Car Trade24`,
    description: `${name} — bereits verkauft. Ähnliches Fahrzeug gesucht? Kontaktieren Sie Car Trade24.`,
  };
}

export default async function SoldVehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getSoldVehicle(id);
  if (!vehicle) notFound();

  const name = `${vehicle.make} ${vehicle.model}${vehicle.variant ? " " + vehicle.variant : ""}`;

  // Find similar active vehicles (same make or body, max 3)
  let similar: Awaited<ReturnType<typeof fetchVehicles>> = [];
  try {
    const active = await fetchVehicles();
    similar = active
      .filter(
        (v) =>
          v.id !== vehicle.id &&
          (v.make === vehicle.make || (v.body && v.body === vehicle.body)),
      )
      .slice(0, 3);
  } catch {
    // ignore — similar vehicles are optional
  }

  // Structured data — JSON.stringify escapes all special chars, safe for injection
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: vehicle.image,
    description: `${name} — ${vehicle.year}, ${formatCHF(vehicle.mileage)} km`,
    brand: { "@type": "Brand", name: vehicle.make },
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "CHF",
      availability: "https://schema.org/SoldOut",
      seller: {
        "@type": "Organization",
        name: "Car Trade24 GmbH",
        url: "https://cartrade24.ch",
      },
    },
  };

  return (
    <>
      {/* JSON-LD structured data for SEO (server-rendered, no user input) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* Verkauft Banner */}
      <div className="bg-[#6b7280] text-white text-center py-3 font-semibold text-sm tracking-wide">
        Dieses Fahrzeug wurde verkauft
      </div>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/fahrzeug-archiv"
          className="inline-flex items-center gap-1 text-sm text-ct-cyan hover:underline mb-6"
        >
          &larr; Zurück zum Archiv
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f4f6f8]">
            <Image
              src={vehicle.image}
              alt={name}
              fill
              className="object-cover opacity-75"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <span className="absolute top-4 left-4 px-3 py-1.5 text-[0.75rem] rounded-full text-white uppercase tracking-wide font-bold bg-[#6b7280]">
              Verkauft
            </span>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-extrabold text-ct-dark mb-2">
              {name}
            </h1>

            <p className="text-2xl font-bold text-[#6b7280] line-through mb-6">
              CHF {formatCHF(vehicle.price)}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Jahrgang", value: String(vehicle.year) },
                {
                  label: "Kilometerstand",
                  value: `${formatCHF(vehicle.mileage)} km`,
                },
                { label: "Leistung", value: `${vehicle.power} PS` },
                { label: "Getriebe", value: vehicle.transmission },
                ...(vehicle.fuel
                  ? [{ label: "Treibstoff", value: vehicle.fuel }]
                  : []),
                ...(vehicle.drivetrain
                  ? [{ label: "Antrieb", value: vehicle.drivetrain }]
                  : []),
                ...(vehicle.color
                  ? [{ label: "Farbe", value: vehicle.color }]
                  : []),
                ...(vehicle.co2
                  ? [{ label: "CO2", value: `${vehicle.co2} g/km` }]
                  : []),
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="bg-ct-light rounded-xl p-3"
                >
                  <p className="text-[0.7rem] text-[#6b7280] uppercase tracking-wide font-semibold">
                    {spec.label}
                  </p>
                  <p className="text-ct-dark font-semibold text-[0.9rem]">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            {vehicle.archivedAt && (
              <p className="text-[0.78rem] text-[#9ca3af] mt-4">
                Verkauft am{" "}
                {new Date(vehicle.archivedAt).toLocaleDateString("de-CH", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            )}

            {/* CTA */}
            <div className="mt-8 p-5 bg-ct-light rounded-2xl">
              <p className="font-semibold text-ct-dark mb-2">
                Ähnliches Fahrzeug gesucht?
              </p>
              <p className="text-[#6b7280] text-sm mb-4">
                Kontaktieren Sie uns — wir finden Ihr Wunschfahrzeug.
              </p>
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-colors duration-200"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Active Vehicles */}
        {similar.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-ct-dark mb-6">
              Ähnliche verfügbare Fahrzeuge
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((v) => (
                <Link
                  key={v.id}
                  href={`/autos/${v.id}`}
                  className="group bg-white border border-[#ebebeb] rounded-2xl overflow-hidden flex flex-col
                             shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
                             hover:-translate-y-1.5 transition-all duration-300 ease-out"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f6f8]">
                    <Image
                      src={v.image}
                      alt={`${v.make} ${v.model}`}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-ct-dark text-[0.95rem]">
                      {v.make} {v.model}
                      {v.variant ? ` ${v.variant}` : ""}
                    </h3>
                    <div className="flex gap-3 mt-1 text-[0.78rem] text-[#6b7280]">
                      <span>{v.year}</span>
                      <span>{formatCHF(v.mileage)} km</span>
                    </div>
                    <p className="mt-2 font-bold text-ct-dark">
                      CHF {formatCHF(v.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
