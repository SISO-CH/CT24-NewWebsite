// app/finanzierung/page.tsx
import type { Metadata } from "next";
import { CreditCard, TrendingUp, Banknote, ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leasing & Finanzierung",
  description:
    "Flexible Leasing- und Finanzierungslösungen für Ihre Occasion bei Car Trade24 in Wohlen. Günstige Konditionen, schnelle Abwicklung.",
};

const options = [
  {
    icon: Banknote,
    title: "Barkauf",
    tag: "Einfach",
    highlight: false,
    pros: ["Kein Zins, kein Aufwand", "Sofortige Eigentumsübertragung", "Maximaler Verhandlungsspielraum"],
    cons: ["Kapital gebunden"],
  },
  {
    icon: CreditCard,
    title: "Leasing",
    tag: "Beliebt",
    highlight: true,
    pros: ["Tiefe Monatsraten", "Fahrzeugwechsel nach Laufzeit", "Steuerlich absetzbar (Firma)"],
    cons: ["Kilometerabhängig", "Fahrzeug bleibt Leasingbank"],
  },
  {
    icon: TrendingUp,
    title: "Kredit",
    tag: "Flexibel",
    highlight: false,
    pros: ["Sofort Eigentümer", "Feste Monatsrate", "Laufzeit wählbar"],
    cons: ["Zinsen", "Bonitätsprüfung nötig"],
  },
];

const leasingExamples = [
  { model: "VW Golf Variant",       price: "CHF 29'500", rate: "CHF 299", duration: "48 Mt.", km: "15'000 km/J." },
  { model: "Hyundai Kona EV",       price: "CHF 37'900", rate: "CHF 399", duration: "48 Mt.", km: "15'000 km/J." },
  { model: "Land Rover Evoque",     price: "CHF 44'900", rate: "CHF 489", duration: "48 Mt.", km: "10'000 km/J." },
];

export default function FinanzierungPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Leasing & Finanzierung</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>
            Flexibel finanzieren.<br />Sofort fahren.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Attraktive Leasing- und Finanzierungslösungen mit direktem Bankzugang —
            schnell, transparent, auf Sie zugeschnitten.
          </p>
        </div>
      </section>

      {/* 3 Optionen */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Ihre Optionen</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                3 Wege zum Traumauto
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt, i) => (
              <FadeIn key={opt.title} delay={i * 80}>
                <div className={`h-full flex flex-col p-6 rounded-xl border ${
                  opt.highlight
                    ? "border-[var(--ct-cyan)] shadow-[0_4px_24px_rgba(0,160,227,0.15)]"
                    : "border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <opt.icon size={24} style={{ color: "var(--ct-cyan)" }} />
                    <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      opt.highlight ? "text-white bg-ct-cyan" : "text-[#6b7280] bg-ct-light"
                    }`}>{opt.tag}</span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-4" style={{ color: "var(--ct-dark)" }}>
                    {opt.title}
                  </h3>
                  <ul className="space-y-1.5 flex-1">
                    {opt.pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-[#4b5563]">
                        <span className="mt-0.5" style={{ color: "var(--ct-green)" }}>✓</span> {p}
                      </li>
                    ))}
                    {opt.cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                        <span className="mt-0.5">–</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Leasing-Tabelle */}
      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Beispielrechnungen</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                Leasing im Detail
              </h2>
              <p className="text-[#6b7280] text-sm mt-2">
                Unverbindliche Richtwerte — individuelle Offerte auf Anfrage.
              </p>
            </div>
          </FadeIn>
          <div className="overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-wider text-[#9ca3af]">
                  <th className="text-left px-6 py-3 font-semibold">Fahrzeug</th>
                  <th className="text-left px-6 py-3 font-semibold">Kaufpreis</th>
                  <th className="text-left px-6 py-3 font-semibold">Laufzeit</th>
                  <th className="text-left px-6 py-3 font-semibold">Kilometer</th>
                  <th className="text-left px-6 py-3 font-semibold">Rate/Mt.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {leasingExamples.map((ex) => (
                  <tr key={ex.model} className="hover:bg-ct-light transition-colors">
                    <td className="px-6 py-4 font-semibold" style={{ color: "var(--ct-dark)" }}>{ex.model}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{ex.price}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{ex.duration}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{ex.km}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "var(--ct-magenta)" }}>{ex.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[#9ca3af] text-xs mt-3">
            * Alle Angaben inkl. MwSt., vorbehaltlich Bonitätsprüfung durch die Leasingbank.
          </p>
        </div>
      </section>

      {/* B2B-Teaser */}
      <FadeIn>
        <section className="py-12 md:py-16" style={{ backgroundColor: "var(--ct-dark)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                   style={{ color: "var(--ct-cyan)" }}>Firmenkunden</p>
                <h2 className="text-2xl font-extrabold text-white">
                  Spezialkonditionen für Unternehmen
                </h2>
                <p className="text-[#9ca3af] text-sm mt-2 max-w-lg">
                  Flottenrabatte, MwSt-Rückerstattung und direkter Ansprechpartner.
                </p>
              </div>
              <Link
                href="/firmenkunden"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg
                           text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Mehr erfahren <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-2xl font-extrabold mb-3" style={{ color: "var(--ct-dark)" }}>
              Persönliche Offerte anfragen
            </h2>
            <p className="text-[#6b7280] text-sm mb-6 max-w-md mx-auto">
              Wir berechnen Ihre individuelle Rate — kostenlos und unverbindlich.
            </p>
            <Link href="/kontakt"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white
                         font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ct-cyan)" }}>
              Jetzt anfragen <ArrowRight size={15} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
