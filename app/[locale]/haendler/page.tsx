// app/[locale]/haendler/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Car, Tag, Truck, UserCheck, ShieldCheck, Zap, Calculator } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import HaendlerForm from "@/components/haendler/HaendlerForm";

export const metadata: Metadata = {
  title: "Für Händler — B2B Fahrzeughandel",
  description:
    "Exklusive Fahrzeugangebote für Autohändler. Zugang zur Car Trade24 Händlerplattform anfragen.",
};

const vorteile = [
  {
    icon: Car,
    title: "Grosse Auswahl",
    desc: "Zugriff auf unser gesamtes Grosshandels-Inventar — ständig wechselnde Fahrzeuge aller Marken und Segmente.",
  },
  {
    icon: Tag,
    title: "Händlerpreise",
    desc: "Exklusive B2B-Konditionen deutlich unter Endkundenpreis. Transparente Kalkulation ohne versteckte Kosten.",
  },
  {
    icon: Truck,
    title: "Schnelle Abwicklung",
    desc: "Vom Angebot bis zur Übergabe in wenigen Tagen. Lieferung schweizweit oder Abholung in Wohlen.",
  },
  {
    icon: UserCheck,
    title: "Persönlicher Ansprechpartner",
    desc: "Ein fester Kontakt für alle Ihre Anfragen — keine Warteschlangen, schnelle Entscheidungen.",
  },
];

const steps = [
  {
    step: "01",
    title: "Account anfragen",
    desc: "Füllen Sie das Formular aus. Wir prüfen Ihre Händler-Berechtigung.",
  },
  {
    step: "02",
    title: "Zugang erhalten",
    desc: "Sie erhalten Ihre Zugangsdaten zur Händlerplattform mit allen Fahrzeugen und Preisen.",
  },
  {
    step: "03",
    title: "Fahrzeuge bestellen",
    desc: "Wählen Sie Fahrzeuge aus, bestellen Sie direkt und erhalten Sie schnelle Lieferung.",
  },
];

const services = [
  {
    icon: ShieldCheck,
    title: "Vermarktung",
    desc: "Professionelle Fahrzeugfotografie, Inserate auf allen Plattformen und Social-Media-Kampagnen für Ihr Autohaus.",
  },
  {
    icon: Zap,
    title: "Digitalisierung",
    desc: "Moderne Website, Online-Buchungssystem und digitale Verkaufsprozesse — massgeschneidert für Autohändler.",
  },
  {
    icon: Car,
    title: "KI-Lösungen",
    desc: "Automatisierte Fahrzeugbewertung, KI-gestützte Preisoptimierung und intelligente Lead-Qualifizierung.",
  },
];

export default function HaendlerPage() {
  return (
    <>
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
            B2B Fahrzeughandel
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-white">
            Fahrzeuge für Ihren Bestand
            <br />
            <span style={{ color: "var(--ct-cyan)" }}>direkt vom Grosshandel.</span>
          </h1>
          <p className="text-[#9ca3af] max-w-xl text-lg leading-relaxed">
            Exklusive Händlerpreise, grosse Auswahl und schnelle Abwicklung —
            werden Sie Teil unseres B2B-Netzwerks.
          </p>
        </div>
      </section>

      {/* ── Vorteile ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p
                className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                style={{ color: "var(--ct-cyan)" }}
              >
                Ihre Vorteile
              </p>
              <h2
                className="text-3xl font-extrabold"
                style={{ color: "var(--ct-dark)" }}
              >
                Warum Händler mit uns arbeiten
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vorteile.map((v, i) => (
              <FadeIn key={v.title} delay={i * 80}>
                <div className="flex gap-5 p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div
                    className="w-11 h-11 flex items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: "var(--ct-light)" }}
                  >
                    <v.icon size={20} style={{ color: "var(--ct-cyan)" }} />
                  </div>
                  <div>
                    <h3
                      className="font-bold text-sm mb-1"
                      style={{ color: "var(--ct-dark)" }}
                    >
                      {v.title}
                    </h3>
                    <p className="text-[#6b7280] text-sm leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── So funktioniert's ── */}
      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p
                className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                style={{ color: "var(--ct-cyan)" }}
              >
                So einfach geht&apos;s
              </p>
              <h2
                className="text-3xl font-extrabold"
                style={{ color: "var(--ct-dark)" }}
              >
                In 3 Schritten zur Händlerplattform
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <FadeIn key={s.step} delay={i * 100}>
                <div className="text-center p-6 rounded-xl bg-white border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p
                    className="text-5xl font-black mb-3"
                    style={{
                      color: "var(--ct-light)",
                      WebkitTextStroke: "2px var(--ct-cyan)",
                    }}
                  >
                    {s.step}
                  </p>
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: "var(--ct-dark)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p
                className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                style={{ color: "var(--ct-cyan)" }}
              >
                Zusätzliche Services
              </p>
              <h2
                className="text-3xl font-extrabold"
                style={{ color: "var(--ct-dark)" }}
              >
                Mehr als nur Fahrzeuge
              </h2>
              <p className="text-[#6b7280] text-sm mt-3 max-w-lg mx-auto leading-relaxed">
                Wir unterstützen Ihr Autohaus auch bei Vermarktung, Digitalisierung und
                KI-gestützten Prozessen.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <FadeIn key={s.title} delay={i * 80}>
                <div className="text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-lg mx-auto mb-4"
                    style={{ backgroundColor: "var(--ct-light)" }}
                  >
                    <s.icon size={22} style={{ color: "var(--ct-cyan)" }} />
                  </div>
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: "var(--ct-dark)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CO2-Rechner CTA ── */}
      <section className="py-12 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/co2-rechner"
            className="flex items-center gap-5 p-6 rounded-xl bg-white border border-[#e5e7eb]
                       shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow duration-200 group"
          >
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: "var(--ct-light)" }}
            >
              <Calculator size={22} style={{ color: "var(--ct-cyan)" }} />
            </div>
            <div className="flex-1">
              <h3
                className="font-bold text-base mb-1 group-hover:text-[var(--ct-cyan)] transition-colors"
                style={{ color: "var(--ct-dark)" }}
              >
                CO2-Flottenstrafe berechnen
              </h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">
                Sehen Sie, wie Sie durch emissionsarme Fahrzeuge aus unserem Bestand
                die ASTRA CO2-Sanktion reduzieren und bares Geld sparen.
              </p>
            </div>
            <span
              className="hidden sm:block text-sm font-semibold shrink-0"
              style={{ color: "var(--ct-cyan)" }}
            >
              Zum Rechner &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* ── Kontaktformular ── */}
      <section
        className="py-16 md:py-24"
        style={{
          background: "linear-gradient(135deg, var(--ct-dark) 0%, #0d2d3e 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p
              className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
              style={{ color: "var(--ct-cyan)" }}
            >
              Händler-Account
            </p>
            <h2 className="text-3xl font-extrabold mb-2 text-white">
              Jetzt Zugang anfragen
            </h2>
            <p className="text-[#9ca3af] text-sm mb-8">
              Füllen Sie das Formular aus — wir melden uns innerhalb von 24 Stunden
              mit Ihren Zugangsdaten.
            </p>
          </FadeIn>
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
            <HaendlerForm />
          </div>
        </div>
      </section>
    </>
  );
}
