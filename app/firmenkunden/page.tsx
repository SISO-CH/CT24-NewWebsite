// app/firmenkunden/page.tsx
import type { Metadata } from "next";
import { Building2, Users, Receipt, UserCheck } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import FirmenkundenForm from "@/components/firmenkunden/FirmenkundenForm";

export const metadata: Metadata = {
  title: "Firmenkunden & Flottenservice",
  description:
    "Flottenfahrzeuge, Leasing und Finanzierung für Unternehmen. Car Trade24 bietet Spezialkonditionen für Firmenkunden in der ganzen Schweiz.",
};

const vorteile = [
  {
    icon: Building2,
    title: "Flottenrabatte",
    desc: "Ab dem ersten Fahrzeug erhalten Firmenkunden Sonderkonditionen — je grösser die Flotte, desto attraktiver der Preis.",
  },
  {
    icon: Receipt,
    title: "MwSt-Rückerstattung",
    desc: "Als vorsteuerabzugsberechtigtes Unternehmen können Sie die Mehrwertsteuer vollständig zurückfordern.",
  },
  {
    icon: UserCheck,
    title: "Persönlicher Ansprechpartner",
    desc: "Sie erhalten einen dedizierten Ansprechpartner — keine Warteschlangen, kein Callcenter.",
  },
  {
    icon: Users,
    title: "Direktabrechnung",
    desc: "Wir rechnen direkt mit Ihrer Buchhaltung ab. Auf Wunsch auch per Sammelrechnung.",
  },
];

const steps = [
  { step: "01", title: "Anfrage stellen", desc: "Füllen Sie das Formular aus. Wir melden uns innerhalb von 24 Stunden." },
  { step: "02", title: "Offerte erhalten", desc: "Persönliche Konditionen, abgestimmt auf Ihre Flottengrösse." },
  { step: "03", title: "Fahrzeug übernehmen", desc: "Abholung in Wohlen oder Lieferung schweizweit." },
];

export default function FirmenkundenPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Firmenkunden & Flottenservice</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>
            Mobilität für<br />Ihr Unternehmen.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Spezialkonditionen für Flotten, transparente Abrechnung und ein
            persönlicher Ansprechpartner — für Unternehmen jeder Grösse.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Warum Car Trade24</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                Ihre Vorteile als Firmenkunde
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vorteile.map((v, i) => (
              <FadeIn key={v.title} delay={i * 80}>
                <div className="flex gap-5 p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="w-11 h-11 flex items-center justify-center rounded-lg shrink-0"
                       style={{ backgroundColor: "var(--ct-light)" }}>
                    <v.icon size={20} style={{ color: "var(--ct-cyan)" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: "var(--ct-dark)" }}>{v.title}</h3>
                    <p className="text-[#6b7280] text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>So einfach geht's</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                In 3 Schritten zum Flottenfahrzeug
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <FadeIn key={s.step} delay={i * 100}>
                <div className="text-center p-6 rounded-xl bg-white border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-5xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {s.step}
                  </p>
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--ct-dark)" }}>{s.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
               style={{ color: "var(--ct-cyan)" }}>Unternehmensanfrage</p>
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--ct-dark)" }}>
              Jetzt Offerte anfragen
            </h2>
            <p className="text-[#6b7280] text-sm mb-8">
              Wir antworten innerhalb von 24 Stunden mit Ihrer persönlichen Firmenofferte.
            </p>
          </FadeIn>
          <FirmenkundenForm />
        </div>
      </section>
    </>
  );
}
