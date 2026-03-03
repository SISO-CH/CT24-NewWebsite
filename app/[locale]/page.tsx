import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Star, MapPin, Phone, Mail, Car, Truck, FileText, Search } from "lucide-react";
import { fetchVehicles } from "@/lib/as24";
import VehicleCard from "@/components/vehicles/VehicleCard";
import FadeIn from "@/components/ui/FadeIn";
import HeroSearch from "@/components/home/HeroSearch";
import RecentlyViewed from "@/components/vehicles/RecentlyViewed";

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
    date: "Jan. 2026",
  },
  {
    text: "Haben uns das perfekte Fahrzeug gefunden. Heimlieferung hat super geklappt – alles wie versprochen!",
    name: "Sandra M.",
    initials: "SM",
    stars: 5,
    date: "Dez. 2025",
  },
  {
    text: "Tolle Auswahl, ehrliche Beratung ohne Verkaufsdruck. Kommen gerne wieder.",
    name: "Marco B.",
    initials: "MB",
    stars: 5,
    date: "Nov. 2025",
  },
];

// TODO: Replace with real data from Google Business Profile
// Set NEXT_PUBLIC_GOOGLE_PLACE_ID in .env.local for live reviews
const googleRating = { average: 4.9, count: 47 };
const GOOGLE_MAPS_URL = "https://maps.google.com/?q=Car+Trade24+GmbH+Wohlen";

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
export default async function HomePage() {
  const allVehicles = await fetchVehicles();

  // 4 neueste Fahrzeuge, je Modell (make+model) nur 1x
  const seen = new Set<string>();
  const featured: typeof allVehicles = [];
  for (const v of allVehicles) {
    const key = `${v.make} ${v.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    featured.push(v);
    if (featured.length >= 4) break;
  }

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
            {featured.map((vehicle, i) => (
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

      {/* Services-Teaser */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-ct-dark mb-2 text-center">Unsere Services</h2>
          <p className="text-center text-[#6b7280] text-sm mb-10">
            Alles rund um Ihren Fahrzeugkauf — digital und bequem.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { href: "/probefahrt",        Icon: Car,      title: "Probefahrt",        desc: "Kostenlos und unverbindlich" },
              { href: "/home-delivery",     Icon: Truck,    title: "Home Delivery",     desc: "Lieferung zu Ihnen" },
              { href: "/zulassungsservice", Icon: FileText, title: "Zulassungsservice", desc: "Wir erledigen alles" },
              { href: "/fahrzeug-sourcing", Icon: Search,   title: "Fahrzeug-Sourcing", desc: "Wir beschaffen Ihr Wunschauto" },
            ] as { href: string; Icon: (props: { size?: number; className?: string }) => React.ReactElement | null; title: string; desc: string }[]).map(({ href, Icon, title, desc }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-ct-light
                           border border-[#e5e7eb] hover:border-ct-cyan hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-ct-cyan/10 flex items-center justify-center mb-3
                                group-hover:bg-ct-cyan/20 transition-colors">
                  <Icon size={22} className="text-ct-cyan" />
                </div>
                <p className="font-semibold text-ct-dark text-sm">{title}</p>
                <p className="text-[#6b7280] text-xs mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inzahlungnahme Teaser ── */}
      <section className="py-14 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
                 style={{ background: "linear-gradient(135deg, #141414 60%, #1a1a2e 100%)" }}>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-3"
                   style={{ color: "var(--ct-cyan)" }}>
                  Digitale Inzahlungnahme
                </p>
                <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
                  Ihr altes Fahrzeug clever verwerten
                </h2>
                <p className="text-[#9ca3af] text-sm leading-relaxed mb-6 max-w-sm">
                  Sofortschätzung in 60 Sekunden — verbindliches Kaufangebot innert 24 Stunden.
                  Den Betrag direkt auf Ihr neues Fahrzeug anrechnen lassen.
                </p>
                <Link
                  href="/inzahlungnahme"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 self-start"
                  style={{ backgroundColor: "var(--ct-cyan)" }}
                >
                  Fahrzeug bewerten <ArrowRight size={15} />
                </Link>
              </div>
              <div className="hidden lg:flex items-center justify-center p-12">
                <div className="grid grid-cols-3 gap-6 text-center">
                  {[
                    { step: "01", label: "Daten eingeben" },
                    { step: "02", label: "Schätzung erhalten" },
                    { step: "03", label: "Angebot in 24h" },
                  ].map((s) => (
                    <div key={s.step}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-black"
                           style={{ backgroundColor: "var(--ct-cyan)", color: "#fff" }}>
                        {s.step}
                      </div>
                      <p className="text-[#9ca3af] text-xs leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Google Reviews */}
      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                   style={{ color: "var(--ct-cyan)" }}>
                  Kundenstimmen
                </p>
                <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                  Das sagen unsere Kunden
                </h2>
              </div>

              {/* Google Badge */}
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-xl border border-[#e5e7eb] px-4 py-3
                           hover:shadow-md transition-shadow shrink-0"
              >
                {/* Google G logo */}
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < Math.round(googleRating.average) ? "#FBBC05" : "none"} color="#FBBC05" />
                    ))}
                    <span className="text-sm font-bold ml-1" style={{ color: "var(--ct-dark)" }}>
                      {googleRating.average}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#9ca3af]">{googleRating.count} Google-Bewertungen</p>
                </div>
              </a>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((r, i) => (
              <FadeIn key={r.name} delay={i * 80}>
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: r.stars }).map((_, j) => (
                      <Star key={j} size={13} fill="#FBBC05" color="#FBBC05" />
                    ))}
                  </div>
                  <p className="text-sm text-[#4b5563] leading-relaxed flex-1 italic">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-[#f5f5f5]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                         style={{ backgroundColor: "var(--ct-cyan)" }}>
                      {r.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--ct-dark)" }}>{r.name}</p>
                      <p className="text-[10px] text-[#9ca3af]">{r.date}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mt-6 text-center">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: "var(--ct-cyan)" }}
              >
                Alle Bewertungen auf Google ansehen <ArrowRight size={13} />
              </a>
            </div>
          </FadeIn>
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

      {/* Recently viewed — client-side, renders only when localStorage has entries */}
      <RecentlyViewed allVehicles={allVehicles} />
    </>
  );
}
