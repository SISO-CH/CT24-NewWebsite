import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchVehicles } from "@/lib/as24";
import {
  ArrowLeft,
  Fuel,
  Gauge,
  Zap,
  Settings2,
  CheckCircle2,
  ArrowRight,
  Quote,
  Shield,
  ExternalLink,
  PhoneCall,
  Phone,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import EnergyLabel from "@/components/vehicles/EnergyLabel";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import { formatCHF } from "@/lib/utils";
import { getSalesperson } from "@/lib/team";
import TestDriveTrigger from "@/components/vehicles/TestDriveTrigger";
import VDPContactForm from "@/components/vehicles/VDPContactForm";
import LeasingCalculator from "@/components/ui/LeasingCalculator";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicles = await fetchVehicles();
  const v = vehicles.find((v) => v.id === Number(id));
  if (!v) return { title: "Fahrzeug nicht gefunden" };
  return {
    title: `${v.make} ${v.model}${v.variant ? " " + v.variant : ""}`,
    description: `${v.year} · ${v.mileage.toLocaleString("de-CH")} km · CHF ${formatCHF(v.price)} — Occasion bei Car Trade24 GmbH, Wohlen`,
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicles = await fetchVehicles();
  const vehicle = vehicles.find((v) => v.id === Number(id));
  if (!vehicle) notFound();

  const allImages = vehicle.images?.length ? vehicle.images : [vehicle.image];

  const techSpecs = [
    { label: "Kilometerstand", value: `${vehicle.mileage.toLocaleString("de-CH")} km` },
    { label: "Leistung",       value: `${vehicle.power} PS` },
    { label: "Baujahr",        value: String(vehicle.year) },
    { label: "Getriebe",       value: vehicle.transmission },
    vehicle.fuel       ? { label: "Kraftstoff",  value: vehicle.fuel }              : null,
    vehicle.body       ? { label: "Karosserie",  value: vehicle.body }              : null,
    vehicle.doors      ? { label: "Türen",       value: String(vehicle.doors) }     : null,
    vehicle.seats      ? { label: "Sitze",       value: String(vehicle.seats) }     : null,
    vehicle.color      ? { label: "Farbe",       value: vehicle.color }             : null,
    vehicle.drivetrain ? { label: "Antrieb",     value: vehicle.drivetrain }        : null,
    vehicle.emission   ? { label: "Abgasnorm",   value: vehicle.emission }          : null,
    vehicle.co2        ? { label: "CO₂",         value: `${vehicle.co2} g/km` }    : null,
    vehicle.condition  ? { label: "Zustand",     value: vehicle.condition }         : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const related = vehicles.filter((v) => v.id !== vehicle.id).slice(0, 3);
  const salesperson = getSalesperson(vehicle.id);
  const vehicleLabel = `${vehicle.make} ${vehicle.model}${vehicle.variant ? " " + vehicle.variant : ""}`;

  return (
    <>
      {/* Header */}
      <section className="pt-24 pb-6 bg-ct-light border-b border-[#e5e7eb]">
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
              <h1 className="text-3xl lg:text-4xl font-extrabold text-ct-dark">
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
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

            {/* Left: Gallery + Details */}
            <div className="space-y-8">
              <FadeIn>
                <VehicleGallery
                  images={allImages}
                  alt={`${vehicle.make} ${vehicle.model}`}
                />
              </FadeIn>

              {/* Quick specs */}
              <FadeIn delay={60}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      icon: Gauge,
                      label: "Kilometerstand",
                      value: `${vehicle.mileage.toLocaleString("de-CH")} km`,
                    },
                    {
                      icon: Zap,
                      label: "Leistung",
                      value: `${vehicle.power} PS`,
                    },
                    {
                      icon: Settings2,
                      label: "Getriebe",
                      value: vehicle.transmission,
                    },
                    {
                      icon: Fuel,
                      label: "Kraftstoff",
                      value: vehicle.fuel ?? "–",
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

              {/* Salesperson pitch */}
              {vehicle.salespitch && (
                <FadeIn delay={70}>
                  <div className="rounded-xl bg-ct-light border-l-4 border-ct-cyan p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-ct-cyan flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {salesperson.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ct-dark">{salesperson.name}</p>
                        <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Car Trade24 Berater</p>
                      </div>
                      <Quote size={18} className="ml-auto text-ct-cyan/40" />
                    </div>
                    <p className="text-sm text-[#4b5563] leading-relaxed italic">
                      &ldquo;{vehicle.salespitch}&rdquo;
                    </p>
                  </div>
                </FadeIn>
              )}

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

                  {/* Leasingrechner-Widget */}
                  <div className="mb-5 pb-5 border-b border-[#f0f0f0]">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#9ca3af] mb-3">
                      Rate berechnen
                    </p>
                    <LeasingCalculator fixedPrice={vehicle.price} showLink={true} />
                  </div>

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

                  <div className="space-y-2.5">
                    <Link
                      href={`/kontakt?betreff=Fahrzeuganfrage&modell=${encodeURIComponent(
                        `${vehicle.make} ${vehicle.model}`
                      )}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                                 text-white font-semibold text-sm hover:opacity-90 transition-opacity bg-ct-cyan"
                    >
                      Jetzt anfragen <ArrowRight size={15} />
                    </Link>

                    <TestDriveTrigger vehicleLabel={vehicleLabel} />

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "41791234567"}?text=${encodeURIComponent(
                        `Guten Tag, ich interessiere mich für den ${vehicleLabel} (CHF ${formatCHF(vehicle.price)}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                                 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>

                    <a
                      href="tel:+41566185544"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                                 text-sm text-[#6b7280] hover:text-ct-cyan transition-colors"
                    >
                      📞 +41 56 618 55 44
                    </a>

                    {/* Direkt anfragen */}
                    <details className="group">
                      <summary className="list-none cursor-pointer flex items-center justify-between py-2 text-xs font-semibold text-[#6b7280] hover:text-ct-cyan transition-colors">
                        Direkt anfragen
                        <span className="text-[10px] group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      <div className="pt-3">
                        <VDPContactForm vehicleLabel={vehicleLabel} />
                      </div>
                    </details>
                  </div>
                </div>

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

                {/* Matelso Rückruf */}
                <div className="rounded-xl overflow-hidden border border-[#e5e7eb]">
                  <div className="px-5 pt-5 pb-4 bg-ct-dark">
                    <div className="flex items-center gap-2 mb-2">
                      <PhoneCall size={14} className="text-ct-cyan shrink-0" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-ct-cyan">
                        Persönliche Beratung
                      </p>
                    </div>
                    <p className="text-white font-extrabold text-base leading-snug">
                      Lassen Sie sich zu diesem {vehicle.make} {vehicle.model} beraten
                    </p>
                    <p className="text-[#9ca3af] text-xs mt-2 leading-relaxed">
                      Unser Team ruft Sie kostenlos &amp; unverbindlich zurück —
                      meist innerhalb von 30 Minuten.
                    </p>
                  </div>
                  <div className="px-5 py-4 bg-white">
                    {/* Matelso füllt diesen Container mit dem Rückruf-Formular */}
                    <div
                      id="matelso-callback-widget"
                      data-matelso-widget="callback"
                    />
                    <a
                      href="tel:+41566185544"
                      className="flex items-center justify-center gap-1.5 mt-4 text-xs
                                 text-[#9ca3af] hover:text-ct-cyan transition-colors"
                    >
                      <Phone size={11} />
                      Direkt anrufen: +41 56 618 55 44
                    </a>
                  </div>
                </div>

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

      {/* Related vehicles */}
      {related.length > 0 && (
        <section className="py-12 bg-ct-light border-t border-[#e5e7eb]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] mb-1 text-ct-cyan">
                    Entdecken Sie mehr
                  </p>
                  <h2 className="text-2xl font-bold text-ct-dark">
                    Weitere Fahrzeuge
                  </h2>
                </div>
                <Link
                  href="/autos"
                  className="text-sm font-semibold flex items-center gap-1 transition-colors text-ct-cyan"
                >
                  Alle <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((v) => (
                <FadeIn key={v.id} delay={v.id * 60}>
                  <VehicleCard vehicle={v} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
