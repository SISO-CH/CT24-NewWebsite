import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchVehicles, fetchVehicleDetail } from "@/lib/as24";
import { generateVehicleMeta } from "@/lib/ai";
import { kv } from "@vercel/kv";
import {
  ArrowLeft,
  CalendarDays,
  Gauge,
  GitMerge,
  Zap,
  CheckCircle2,
  ArrowRight,
  Shield,
  ExternalLink,
  Phone,
  MessageCircle,
  Lock,
} from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import EnergyLabel from "@/components/vehicles/EnergyLabel";
import VehicleMediaTabs from "@/components/vehicles/VehicleMediaTabs";
import { formatCHF } from "@/lib/utils";

import TestDriveTrigger from "@/components/vehicles/TestDriveTrigger";
import LeasingCalculator from "@/components/ui/LeasingCalculator";
import PriceAlertForm from "@/components/ui/PriceAlertForm";
import ReserveButton from "@/components/vehicles/ReserveButton";
import PriceComparison from "@/components/vehicles/PriceComparison";
import TrackVehicleView from "@/components/vehicles/TrackVehicleView";
import SimilarVehicles  from "@/components/vehicles/SimilarVehicles";

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

// Sicherer JSON-LD-String: verhindert "</script>"-Injection
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/<!--/g, "<\\!--");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicles = await fetchVehicles();
  const v = vehicles.find((v) => v.id === Number(id));
  if (!v) return { title: "Fahrzeug nicht gefunden" };

  const { description, keywords } = await generateVehicleMeta(v);
  return {
    title:       `${v.make} ${v.model}${v.variant ? " " + v.variant : ""}`,
    description,
    keywords:    keywords.join(", "),
    openGraph: {
      title:       `${v.make} ${v.model} — Car Trade24`,
      description,
      images:      v.images?.[0] ? [{ url: v.images[0] }] : [],
    },
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const [vehicles, reservedData] = await Promise.all([
    fetchVehicles(),
    kv.get<{ until: number }>(`reserved:${id}`).catch(() => null),
  ]);
  const baseVehicle = vehicles.find((v) => v.id === Number(id));
  if (!baseVehicle) notFound();

  // Detail-Daten nachladen (Farben, Hubraum, Verbrauch, etc.)
  const vehicle = await fetchVehicleDetail(baseVehicle);

  const isReserved = reservedData ? reservedData.until > Date.now() : false;

  const allImages = vehicle.images?.length ? vehicle.images : [vehicle.image];

  const techSpecs = [
    { label: "Kilometerstand",  value: `${formatCHF(vehicle.mileage)} km` },
    { label: "Leistung",        value: `${vehicle.power} PS` },
    { label: "Baujahr",         value: String(vehicle.year) },
    { label: "Getriebe",        value: vehicle.transmission },
    vehicle.fuel           ? { label: "Kraftstoff",     value: vehicle.fuel }                        : null,
    vehicle.body           ? { label: "Karosserie",     value: vehicle.body }                        : null,
    vehicle.drivetrain     ? { label: "Antrieb",        value: vehicle.drivetrain }                   : null,
    vehicle.cubicCapacity  ? { label: "Hubraum",        value: `${formatCHF(vehicle.cubicCapacity)} cm³` } : null,
    vehicle.cylinders      ? { label: "Zylinder",       value: String(vehicle.cylinders) }            : null,
    vehicle.doors          ? { label: "Türen",          value: String(vehicle.doors) }                : null,
    vehicle.seats          ? { label: "Sitze",          value: String(vehicle.seats) }                : null,
    vehicle.color          ? { label: "Aussenfarbe",    value: vehicle.color }                        : null,
    vehicle.interiorColor  ? { label: "Innenfarbe",     value: vehicle.interiorColor }                : null,
    vehicle.consumption    ? { label: "Verbrauch",      value: `${vehicle.consumption} l/100km` }     : null,
    vehicle.co2            ? { label: "CO₂",            value: `${vehicle.co2} g/km` }               : null,
    vehicle.energyLabel    ? { label: "Energieeffizienz",value: vehicle.energyLabel }                  : null,
    vehicle.emission       ? { label: "Abgasnorm",      value: vehicle.emission }                     : null,
    vehicle.weightCurb     ? { label: "Leergewicht",    value: `${formatCHF(vehicle.weightCurb)} kg` } : null,
    vehicle.towingCapacity ? { label: "Anhängelast",    value: `${formatCHF(vehicle.towingCapacity)} kg` } : null,
    vehicle.condition      ? { label: "Zustand",        value: vehicle.condition }                    : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const vehicleLabel = `${vehicle.make} ${vehicle.model}${vehicle.variant ? " " + vehicle.variant : ""}`;

  return (
    <>
      {/* JSON-LD Structured Data — sicher via safeJsonLd() */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type":    "Product",
            "name":     `${vehicle.make} ${vehicle.model}${vehicle.variant ? " " + vehicle.variant : ""}`,
            "description": vehicle.description,
            "image":    vehicle.images ?? [vehicle.image],
            "brand":    { "@type": "Brand", "name": vehicle.make },
            "offers": {
              "@type":         "Offer",
              "price":         vehicle.price,
              "priceCurrency": "CHF",
              "availability":  isReserved
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
              "seller": { "@type": "AutoDealer", "name": "Car Trade24 GmbH" },
            },
            ...(vehicle.vin ? { "vehicleIdentificationNumber": vehicle.vin } : {}),
          }),
        }}
      />

      <TrackVehicleView vehicleId={vehicle.id} />

      {/* Header */}
      <section className="pt-24 pb-6 bg-ct-light border-b border-[#e5e7eb] overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/autos"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-ct-cyan transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Zurück zur Übersicht
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-1 text-ct-cyan">
                {vehicle.condition ?? "Occasion"} · {vehicle.year}
                {vehicle.body ? ` · ${vehicle.body}` : ""}
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-ct-dark break-words">
                {vehicle.make} {vehicle.model}
                {vehicle.variant ? ` ${vehicle.variant}` : ""}
              </h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {vehicle.energyLabel && (
                <EnergyLabel label={vehicle.energyLabel} />
              )}
              {vehicle.badge && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    vehicle.badge.startsWith("-")
                      ? "bg-ct-magenta"
                      : "bg-ct-cyan"
                  }`}
                >
                  {vehicle.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-8 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

            {/* Left: Gallery + Details */}
            <div className="space-y-8 min-w-0">
              <FadeIn>
                <VehicleMediaTabs
                  images={allImages}
                  imageUrl360={vehicle.imageUrl360}
                  videoUrl={vehicle.videoUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                />
              </FadeIn>

              {/* Quick specs */}
              <FadeIn delay={60}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      icon: CalendarDays,
                      label: "Baujahr",
                      value: String(vehicle.year),
                    },
                    {
                      icon: Gauge,
                      label: "Kilometerstand",
                      value: `${formatCHF(vehicle.mileage)} km`,
                    },
                    {
                      icon: Zap,
                      label: "Leistung",
                      value: `${vehicle.power} PS`,
                    },
                    {
                      icon: GitMerge,
                      label: "Antrieb",
                      value: vehicle.drivetrain ?? "–",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col items-center p-4 rounded-xl bg-ct-light text-center"
                    >
                      <s.icon size={18} className="mb-1.5 text-ct-cyan" />
                      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-0.5">
                        {s.label}
                      </p>
                      <p className="text-sm font-semibold text-ct-dark">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              {/* Description */}
              {vehicle.description && (
                <FadeIn delay={80}>
                  <div className="rounded-xl border border-[#f0f0f0] p-6">
                    <h2 className="font-extrabold text-lg mb-3 text-ct-dark">
                      Beschreibung
                    </h2>
                    <p className="text-sm text-[#4b5563] leading-relaxed whitespace-pre-line">
                      {vehicle.description}
                    </p>
                  </div>
                </FadeIn>
              )}

              {/* Equipment */}
              {vehicle.equipment && vehicle.equipment.length > 0 && (
                <FadeIn delay={100}>
                  <div className="rounded-xl border border-[#f0f0f0] p-6">
                    <h2 className="font-extrabold text-lg mb-4 text-ct-dark">
                      Ausstattung
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                      {vehicle.equipment.map((item) => (
                        <p
                          key={item}
                          className="flex items-center gap-2 text-sm text-[#4b5563]"
                        >
                          <CheckCircle2
                            size={13}
                            className="shrink-0 text-ct-green"
                          />
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Tech specs table */}
              <FadeIn delay={120}>
                <div className="rounded-xl border border-[#f0f0f0] overflow-hidden">
                  <div className="bg-ct-light px-6 py-4 border-b border-[#f0f0f0]">
                    <h2 className="font-extrabold text-base text-ct-dark">
                      Technische Daten
                    </h2>
                  </div>
                  <div className="divide-y divide-[#f8f8f8]">
                    {techSpecs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex justify-between px-6 py-3 hover:bg-[#fafafa] transition-colors"
                      >
                        <span className="text-sm text-[#9ca3af]">
                          {spec.label}
                        </span>
                        <span className="text-sm font-semibold text-ct-dark">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right: Sticky price card */}
            <FadeIn delay={80} className="sticky top-20">
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#e5e7eb] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                  {vehicle.leasingPrice > 0 && (
                    <div className="mb-5 pb-5 border-b border-[#f0f0f0]">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#9ca3af] mb-1">
                        Leasing ab
                      </p>
                      <p className="text-4xl font-black leading-none text-ct-magenta">
                        CHF {formatCHF(vehicle.leasingPrice)}
                        <span className="text-base font-normal text-[#9ca3af]">
                          /Mt.
                        </span>
                      </p>
                      <p className="text-xs text-[#9ca3af] mt-1">
                        inkl. MwSt., vorbehaltlich Bonitätsprüfung
                      </p>
                    </div>
                  )}

                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#9ca3af] mb-1">
                    Kaufpreis
                  </p>
                  <div className="mb-5">
                    <p className="text-2xl font-extrabold text-ct-dark">
                      CHF {formatCHF(vehicle.price)}
                    </p>
                    <p className="text-[10px] text-[#9ca3af] mt-0.5">
                      inkl. 8.1% MwSt.
                      {vehicle.condition === "Occasion" && (
                        <> · Margenbesteuerung (fikt. Vorsteuerabzug)</>
                      )}
                    </p>
                  </div>

                  {/* Marktpreisvergleich */}
                  <div className="mb-5">
                    <PriceComparison vehicle={vehicle} />
                  </div>

                  {/* USP checkmarks */}
                  <div className="space-y-2 mb-6">
                    {[
                      "Kostenlose Probefahrt möglich",
                      "Bis zu 7 Jahre Garantie",
                      "Schweizweite Lieferung",
                    ].map((t) => (
                      <p
                        key={t}
                        className="flex items-center gap-2 text-sm text-[#4b5563]"
                      >
                        <CheckCircle2
                          size={14}
                          className="shrink-0 text-ct-green"
                        />
                        {t}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-2.5 mb-5">
                    {/* Primary CTA */}
                    <Link
                      href={`/kontakt?betreff=Fahrzeuganfrage&modell=${encodeURIComponent(
                        `${vehicle.make} ${vehicle.model}`
                      )}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                                 text-white font-semibold text-sm hover:opacity-90 transition-opacity bg-ct-cyan"
                    >
                      Jetzt anfragen <ArrowRight size={15} />
                    </Link>

                    {/* Secondary: Probefahrt + WhatsApp side by side */}
                    <div className="grid grid-cols-2 gap-2">
                      <TestDriveTrigger vehicleLabel={vehicleLabel} />
                      <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "41791234567"}?text=${encodeURIComponent(
                          `Guten Tag, ich interessiere mich für den ${vehicleLabel} (CHF ${formatCHF(vehicle.price)}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: "#25D366" }}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </div>

                    {/* Reserve */}
                    {isReserved ? (
                      <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#f3f4f6] text-[#9ca3af] text-sm font-semibold">
                        <Lock size={14} /> Aktuell reserviert
                      </div>
                    ) : (
                      <ReserveButton vehicleId={vehicle.id} vehicleLabel={vehicleLabel} locale={locale} />
                    )}

                    {/* Cardossier link if available */}
                    {vehicle.cardossierUrl && (
                      <a
                        href={vehicle.cardossierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                                   border border-[#e5e7eb] text-sm font-semibold text-ct-dark
                                   hover:border-ct-cyan hover:text-ct-cyan transition-colors"
                      >
                        <ExternalLink size={14} />
                        Cardossier ansehen
                      </a>
                    )}

                    {/* Phone as text link */}
                    <a
                      href="tel:+41566185544"
                      className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-[#9ca3af] hover:text-ct-cyan transition-colors"
                    >
                      <Phone size={13} /> +41 56 618 55 44
                    </a>
                  </div>

                  {/* Leasingrechner-Widget — collapsible */}
                  <details className="group border-t border-[#f0f0f0] pt-4 mb-4">
                    <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-semibold text-[#6b7280] hover:text-ct-cyan transition-colors mb-3">
                      Monatsrate berechnen
                      <span className="text-[10px] group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <LeasingCalculator fixedPrice={vehicle.price} showLink={true} />
                  </details>
                </div>

                <PriceAlertForm filtersJson={JSON.stringify({ make: vehicle.make })} />

                {/* CarVertical — nur für Occasionen */}
                {vehicle.condition !== "Neuwagen" && (
                  <div className="rounded-xl border border-[#e5e7eb] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={15} className="text-ct-green shrink-0" />
                      <p className="text-xs font-bold text-ct-dark uppercase tracking-wider">
                        Fahrzeughistorie
                      </p>
                    </div>
                    <div className="space-y-2 mb-4">
                      {[
                        "Unfallhistorie prüfbar",
                        "Kilometerstand verifizierbar",
                        "Vorbesitzer transparent",
                      ].map((item) => (
                        <p key={item} className="flex items-center gap-2 text-xs text-[#4b5563]">
                          <CheckCircle2 size={12} className="shrink-0 text-ct-green" />
                          {item}
                        </p>
                      ))}
                    </div>
                    <a
                      href={
                        vehicle.vin
                          ? `https://www.carvertical.com/de/search?vin=${vehicle.vin}`
                          : "https://www.carvertical.com/de"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg
                                 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#0b3d2e" }}
                    >
                      <ExternalLink size={12} />
                      Bericht prüfen via carVertical
                    </a>
                  </div>
                )}

                {vehicle.as24Id && (
                  <p className="text-center text-xs text-[#d1d5db]">
                    Ref: AS24-{vehicle.as24Id}
                  </p>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Similar vehicles */}
      <section className="bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SimilarVehicles vehicle={vehicle} allVehicles={vehicles} />
        </div>
      </section>
    </>
  );
}
