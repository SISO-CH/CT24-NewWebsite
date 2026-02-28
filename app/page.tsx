import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Star, MapPin, Phone, Mail } from "lucide-react";
import { vehicles } from "@/lib/vehicles";
import VehicleCard from "@/components/vehicles/VehicleCard";
import FadeIn from "@/components/ui/FadeIn";
import HeroSearch from "@/components/home/HeroSearch";

const HERO_IMAGE =
  "https://images.autoscout24.ch/public/listing/106/20233106/376934348.png";

/* ── Data ──────────────────────────────────────────────────── */
const usps = [
  "Topkonditionen",
  "Schweizweite Heimlieferung",
  "Bis zu 7 Jahre Garantie",
  "Geprüfte Fahrzeuge",
  "Faire Eintauschbedingungen",
];

const steps = [
  {
    num: "01",
    title: "Fahrzeug wählen",
    desc: "Aus 50–80 geprüften Fahrzeugen genau das Modell finden, das zu Ihnen passt.",
  },
  {
    num: "02",
    title: "Kontakt aufnehmen",
    desc: "Persönliche Beratung ohne Druck – telefonisch, per Mail oder direkt vor Ort.",
  },
  {
    num: "03",
    title: "Traumauto fahren",
    desc: "Fahrzeug abholen oder Heimlieferung bis 50 km – ganz wie Sie möchten.",
  },
];

const reviews = [
  {
    text: "Sehr kompetente Beratung, faire Preise und schnelle Abwicklung. Sehr empfehlenswert!",
    name: "Thomas K.",
    initials: "TK",
    stars: 5,
  },
  {
    text: "Haben uns das perfekte Fahrzeug gefunden. Heimlieferung hat super geklappt – alles wie versprochen!",
    name: "Sandra M.",
    initials: "SM",
    stars: 5,
  },
  {
    text: "Tolle Auswahl, ehrliche Beratung ohne Verkaufsdruck. Kommen gerne wieder.",
    name: "Marco B.",
    initials: "MB",
    stars: 5,
  },
];

const trustBadges = [
  { code: "VFAS", label: "Verband freier Autohandel Schweiz" },
  { code: "EAIVT", label: "Europ. Automobilimporteur" },
  { code: "ASTRA", label: "Grossimporteur zugelassen" },
];

const teamMembers = [
  { code: "VB", name: "Verkaufsberatung",  role: "Fahrzeug & Finanzierung", color: "var(--ct-cyan)"    },
  { code: "OH", name: "Occasionshandel",   role: "Eintausch & Ankauf",      color: "var(--ct-magenta)" },
  { code: "KD", name: "Kundendienst",      role: "Service & After-Sales",   color: "var(--ct-green)"   },
  { code: "LD", name: "Lieferdienst",      role: "Heimlieferung CH-weit",   color: "#6366f1"           },
];

/* ── Page ──────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ════════════════════════════════════════════
          HERO — split layout, white bg
      ════════════════════════════════════════════ */}
      <section className="min-h-screen bg-white flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">

          {/* Left: text */}
          <div>
            {/* Trust badge */}
            <div
              className="hero-slide-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{
                backgroundColor: "rgba(0,160,227,0.08)",
                color: "var(--ct-cyan)",
                animationDelay: "0ms",
              }}
            >
              <span>✓</span>
              <span>ASTRA zugelassener Grossimporteur</span>
            </div>

            {/* Headline */}
            <h1
              className="hero-slide-up font-black leading-[1.08] mb-5"
              style={{
                fontSize: "clamp(2.5rem, 4.5vw, 3.75rem)",
                fontWeight: 900,
                color: "var(--ct-dark)",
                animationDelay: "80ms",
              }}
            >
              Ihr nächstes Auto.{" "}
              <span style={{ color: "var(--ct-cyan)" }}>Einfach besser.</span>
            </h1>

            {/* Subline */}
            <p
              className="hero-slide-up text-[#6b7280] text-[1.1rem] mb-8 max-w-lg leading-relaxed"
              style={{ animationDelay: "160ms" }}
            >
              50–80 geprüfte Fahrzeuge. Bis zu 7 Jahre Garantie. Schweizweit lieferbar.
            </p>

            {/* Search bar */}
            <div
              className="hero-slide-up mb-4"
              style={{ animationDelay: "240ms" }}
            >
              <HeroSearch />
            </div>

            {/* Mini stats */}
            <p
              className="hero-fade-in text-[#9ca3af] text-[0.85rem]"
              style={{ animationDelay: "400ms" }}
            >
              50–80 Fahrzeuge&nbsp;&nbsp;·&nbsp;&nbsp;Alle Marken&nbsp;&nbsp;·&nbsp;&nbsp;20 Jahre Erfahrung
            </p>
          </div>

          {/* Right: car image */}
          <div
            className="hero-fade-in relative flex items-center justify-center"
            style={{ animationDelay: "200ms" }}
          >
            {/* Soft glow behind image */}
            <div
              className="absolute inset-[10%] rounded-full blur-[80px] opacity-[0.12]"
              style={{ backgroundColor: "var(--ct-cyan)" }}
            />
            <Image
              src={HERO_IMAGE}
              alt="Aktuelles Highlight Fahrzeug – Car Trade24 Wohlen"
              width={720}
              height={480}
              priority
              className="relative w-full object-contain max-h-[500px] drop-shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          USP BAR
      ════════════════════════════════════════════ */}
      <section
        className="py-4 border-y border-[#e8eaed]"
        style={{ backgroundColor: "var(--ct-light)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-2">
            {usps.map((usp) => (
              <div key={usp} className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--ct-green)" }}
                >
                  <Check size={10} strokeWidth={3} color="white" />
                </span>
                <span
                  className="text-[0.9rem] font-medium"
                  style={{ color: "var(--ct-text)" }}
                >
                  {usp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          VEHICLE HIGHLIGHTS
      ════════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                  style={{ color: "var(--ct-cyan)" }}
                >
                  Aktuelle Highlights
                </p>
                <h2
                  className="text-3xl lg:text-4xl"
                  style={{ color: "var(--ct-dark)", fontWeight: 800 }}
                >
                  Handverlesene Fahrzeuge
                </h2>
              </div>
              <Link
                href="/autos"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={{ color: "var(--ct-cyan)" }}
              >
                Alle Fahrzeuge <ArrowRight size={15} />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {vehicles.map((vehicle, i) => (
              <FadeIn key={vehicle.id} delay={i * 100} className="flex flex-col">
                <VehicleCard vehicle={vehicle} className="flex-1" />
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <FadeIn>
              <Link
                href="/autos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-lg"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Alle Fahrzeuge <ArrowRight size={15} />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS — 3 steps
      ════════════════════════════════════════════ */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: "var(--ct-light)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <p
                className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                style={{ color: "var(--ct-cyan)" }}
              >
                So einfach geht&apos;s
              </p>
              <h2
                className="text-3xl lg:text-4xl"
                style={{ color: "var(--ct-dark)", fontWeight: 800 }}
              >
                Der einfachste Weg zum Auto
              </h2>
            </div>
          </FadeIn>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Dashed connector line (desktop only) */}
            <div
              className="absolute top-8 left-[calc(50%/3+2rem)] right-[calc(50%/3+2rem)] hidden md:block pointer-events-none"
              style={{
                height: "2px",
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(0,160,227,0.35) 0, rgba(0,160,227,0.35) 8px, transparent 8px, transparent 18px)",
              }}
            />

            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 150}>
                <div className="relative flex flex-col items-center text-center px-4">
                  {/* Number circle */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-lg text-white relative z-10 shadow-[0_4px_16px_rgba(0,160,227,0.35)]"
                    style={{ backgroundColor: "var(--ct-cyan)", fontWeight: 900 }}
                  >
                    {step.num}
                  </div>
                  <h3
                    className="text-lg mb-2"
                    style={{ color: "var(--ct-dark)", fontWeight: 700 }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed max-w-[230px]">
                    {step.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          REVIEWS — Google Bewertungen
      ════════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              {/* Google rating row */}
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
                ))}
                <span
                  className="ml-2 font-bold text-xl"
                  style={{ color: "var(--ct-dark)" }}
                >
                  4.8
                </span>
                <span className="text-[#6b7280] text-sm ml-1.5">
                  · Basierend auf Google Bewertungen
                </span>
              </div>
              <h2
                className="text-3xl lg:text-4xl"
                style={{ color: "var(--ct-dark)", fontWeight: 800 }}
              >
                Was unsere Kunden sagen
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <FadeIn key={review.name} delay={i * 100}>
                <div className="bg-white border border-[#f0f0f0] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(review.stars)].map((_, j) => (
                      <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-[#374151] text-sm leading-relaxed flex-1 mb-5">
                    &bdquo;{review.text}&ldquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: "var(--ct-cyan)" }}
                    >
                      {review.initials}
                    </div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--ct-dark)" }}
                    >
                      {review.name}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TRUST / ZERTIFIZIERUNGEN
      ════════════════════════════════════════════ */}
      <FadeIn direction="none">
        <section className="py-8 border-y border-[#f0f0f0] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">
                Ihr Vertrauen ist unser Antrieb
              </p>
              {trustBadges.map((badge) => (
                <div
                  key={badge.code}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-[#e5e7eb] bg-[#fafafa]"
                >
                  <span
                    className="text-xs tracking-wider"
                    style={{ color: "var(--ct-cyan)", fontWeight: 800 }}
                  >
                    {badge.code}
                  </span>
                  <span className="text-[#6b7280] text-xs hidden sm:block">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ════════════════════════════════════════════
          CONTACT — dark section
      ════════════════════════════════════════════ */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: "var(--ct-dark)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Left: address + hours */}
            <FadeIn>
              <div>
                <p
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-3"
                  style={{ color: "var(--ct-cyan)" }}
                >
                  Standort & Öffnungszeiten
                </p>
                <h2
                  className="text-3xl lg:text-4xl text-white mb-5"
                  style={{ fontWeight: 800 }}
                >
                  Besuchen Sie uns
                </h2>
                <p className="text-[#9ca3af] mb-8 text-sm leading-relaxed max-w-sm">
                  Unser Team berät Sie persönlich – von der Fahrzeugwahl bis zur Schlüsselübergabe.
                </p>

                {/* Opening hours */}
                <div className="space-y-2 mb-8">
                  {[
                    { day: "MO – FR", hours: "08:30 – 12:00 / 13:00 – 18:30 Uhr" },
                    { day: "SA",      hours: "09:00 – 16:00 Uhr" },
                  ].map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center gap-4 border border-[#2a2a2a] rounded-lg px-4 py-3"
                    >
                      <span
                        className="text-xs font-bold w-14 shrink-0 tracking-wider"
                        style={{ color: "var(--ct-cyan)" }}
                      >
                        {item.day}
                      </span>
                      <span className="text-[#9ca3af] text-sm">{item.hours}</span>
                    </div>
                  ))}
                </div>

                {/* Contact info */}
                <ul className="space-y-2.5 mb-8">
                  {[
                    { icon: MapPin, text: "Ringstrasse 26, 5610 Wohlen" },
                    { icon: Phone,  text: "+41 56 618 55 44", href: "tel:+41566185544" },
                    { icon: Mail,   text: "info@cartrade24.ch", href: "mailto:info@cartrade24.ch" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-2.5 text-sm text-[#9ca3af]">
                      <item.icon size={14} style={{ color: "var(--ct-cyan)" }} className="shrink-0" />
                      {item.href ? (
                        <a href={item.href} className="hover:text-white transition-colors">
                          {item.text}
                        </a>
                      ) : (
                        <span>{item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://maps.google.com/?q=Ringstrasse+26+5610+Wohlen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 text-white text-sm font-semibold hover:border-white/50 transition-colors"
                  >
                    Route berechnen
                  </a>
                  <Link
                    href="/kontakt"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--ct-cyan)" }}
                  >
                    Termin vereinbaren
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Right: Team card */}
            <FadeIn delay={200}>
              <div className="border border-[#2a2a2a] rounded-xl p-8">
                <h3 className="text-xl text-white mb-1" style={{ fontWeight: 700 }}>
                  Unser Team für Sie
                </h3>
                <p className="text-[#9ca3af] text-sm mb-8">
                  Persönliche Beratung auf Augenhöhe.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {teamMembers.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[#2a2a2a]"
                    >
                      <div
                        className="w-10 h-10 shrink-0 flex items-center justify-center text-xs text-white rounded-lg"
                        style={{ backgroundColor: m.color, fontWeight: 900 }}
                      >
                        {m.code}
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{m.name}</p>
                        <p className="text-[#9ca3af] text-[11px]">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/kontakt"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-white py-3 rounded-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--ct-cyan)" }}
                >
                  Kontakt aufnehmen <ArrowRight size={15} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
