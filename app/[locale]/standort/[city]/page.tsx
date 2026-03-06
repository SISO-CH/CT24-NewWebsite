import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { locations, getLocation } from "@/lib/locations";
import { getLocationContent } from "@/lib/location-content";
import { fetchVehicles } from "@/lib/as24";
import VehicleCard from "@/components/vehicles/VehicleCard";

export const revalidate = 3600;

/* ── Params type (Next.js 16: Promise-based) ──────────────── */
interface Props {
  params: Promise<{ locale: string; city: string }>;
}

/* ── Static params ─────────────────────────────────────────── */
export async function generateStaticParams() {
  return locations.map((l) => ({ city: l.slug }));
}

/* ── Metadata ──────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const location = getLocation(city);
  if (!location) return {};

  const content = getLocationContent(city);
  const title = content?.title ?? `Occasion kaufen in ${location.name} — Car Trade24`;
  const description =
    content?.description ??
    `Gepruefte Occasionen und Neuwagen in ${location.name} (${location.kanton}). Car Trade24, Wohlen AG.`;

  return {
    title,
    description,
    alternates: { canonical: `https://cartrade24.ch/autos-in-${city}` },
  };
}

/* ── FAQ parser ────────────────────────────────────────────── */
interface FaqItem {
  question: string;
  answer: string;
}

function parseFaq(body: string): { intro: string; faqs: FaqItem[] } {
  const parts = body.split("## Häufige Fragen");
  // Also try ASCII variant used by generator
  const parts2 = body.split("## Haeufige Fragen");
  const splitParts = parts.length > 1 ? parts : parts2;

  const intro = (splitParts[0] ?? "").trim();
  const faqSection = (splitParts[1] ?? "").trim();

  const faqs: FaqItem[] = [];
  // Split on ### headings
  const headingSections = faqSection.split(/^### /m).filter(Boolean);
  for (const section of headingSections) {
    const lines = section.split("\n");
    const question = (lines[0] ?? "").trim();
    const answer = lines
      .slice(1)
      .join("\n")
      .trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return { intro, faqs };
}

/* ── Safe JSON-LD helper ───────────────────────────────────── */
// JSON.stringify output is safe for script[type=application/ld+json] —
// it escapes quotes and special chars. Extra escaping for </script> as defense-in-depth.
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/<!--/g, "<\\!--");
}

/* ── Simple text paragraph renderer ────────────────────────── */
function IntroParagraphs({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => p.replace(/\n/g, " ").trim());

  return (
    <div className="prose max-w-3xl mb-10 text-gray-700 leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default async function LocationPage({ params }: Props) {
  const { city } = await params;
  const location = getLocation(city);
  if (!location) notFound();

  const content = getLocationContent(city);

  const { intro, faqs } = content
    ? parseFaq(content.body)
    : {
        intro: `Geprüfte Occasionen und Neuwagen nahe ${location.name}. Car Trade24 in Wohlen AG — Ihr Autohändler im Freiamt.`,
        faqs: [] as FaqItem[],
      };

  const vehicles = await fetchVehicles().catch(() => []);
  const displayVehicles = vehicles.slice(0, 12);

  /* ── JSON-LD: AutoDealer ── */
  const dealerSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "Car Trade24",
    url: "https://cartrade24.ch",
    telephone: "+41566185544",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ringstrasse 26",
      addressLocality: "Wohlen",
      postalCode: "5610",
      addressRegion: "AG",
      addressCountry: "CH",
    },
    areaServed: {
      "@type": "City",
      name: location.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: `Kanton ${location.kanton}`,
      },
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 47.3522,
      longitude: 8.2786,
    },
  };

  /* ── JSON-LD: FAQPage ── */
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {/* JSON-LD: safe because JSON.stringify escapes all special chars */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(dealerSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* ── H1 ── */}
        <h1
          className="text-3xl md:text-4xl font-bold mb-6"
          style={{ color: "var(--ct-dark)" }}
        >
          {content?.h1 ?? `Occasion kaufen in ${location.name}`}
        </h1>

        {/* ── Intro text ── */}
        {intro && <IntroParagraphs text={intro} />}

        {/* ── Vehicle grid ── */}
        {displayVehicles.length > 0 && (
          <section className="mb-12">
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: "var(--ct-dark)" }}
            >
              Aktuelle Fahrzeuge bei Car Trade24
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayVehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>

            {vehicles.length > 12 && (
              <div className="mt-8 text-center">
                <Link
                  href="/autos"
                  className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                  style={{ backgroundColor: "var(--ct-cyan)" }}
                >
                  Alle {vehicles.length} Fahrzeuge anzeigen
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ── FAQ accordion ── */}
        {faqs.length > 0 && (
          <section className="mb-12 max-w-3xl">
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: "var(--ct-dark)" }}
            >
              Häufige Fragen
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-gray-200 overflow-hidden"
                  style={{ backgroundColor: "var(--ct-light)" }}
                >
                  <summary className="cursor-pointer px-5 py-4 font-medium text-gray-900 flex items-center justify-between">
                    {faq.question}
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">
                      &#9662;
                    </span>
                  </summary>
                  <div className="px-5 pb-4 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA with distance info ── */}
        <section
          className="rounded-xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, var(--ct-cyan), #0080b3)",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">
            {location.distanceKm === 0
              ? `Besuchen Sie uns direkt in ${location.name}`
              : `Nur ${location.distanceKm} km von ${location.name} entfernt`}
          </h2>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            Car Trade24 in Wohlen AG — Ihr Spezialist für geprüfte Occasionen
            und Neuwagen.{" "}
            {location.distanceKm > 0 &&
              `Die Fahrt von ${location.name} dauert ca. ${Math.round(location.distanceKm * 1.2)} Minuten.`}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/kontakt"
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: "white",
                color: "var(--ct-cyan)",
              }}
            >
              Kontakt aufnehmen
            </Link>
            <Link
              href="/autos"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white border-2 border-white/50 hover:bg-white/10 transition-colors"
            >
              Fahrzeuge entdecken
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
