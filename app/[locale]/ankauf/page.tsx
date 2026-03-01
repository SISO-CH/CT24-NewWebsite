// app/[locale]/ankauf/page.tsx
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AnkaufForm from "@/components/ankauf/AnkaufForm";

export const metadata: Metadata = {
  title: "Fahrzeug verkaufen – Ankauf & Eintausch",
  description:
    "Verkaufen Sie Ihr Auto fair und unkompliziert. Car Trade24 bewertet Ihr Fahrzeug kostenlos und unverbindlich — schweizweit.",
};

const steps = [
  { step: "01", title: "Formular ausfüllen", desc: "Marke, Modell, Kilometer, Kontakt — dauert 2 Minuten." },
  { step: "02", title: "Bewertung erhalten", desc: "Wir melden uns innert 24 Stunden mit einem schriftlichen Angebot." },
  { step: "03", title: "Auszahlung erhalten", desc: "Fahrzeug abgeben, Geld erhalten — direkt, fair, ohne Umweg." },
];

const trusts = ["Kostenlose Bewertung", "Kein Verkaufsrisiko", "Sofortige Auszahlung", "Schweizweit möglich"];

export default function AnkaufPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Fahrzeug verkaufen</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>Ihr Auto fair bewertet.</h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Wir kaufen Ihr Fahrzeug direkt an — transparent, ohne Kommission und ohne Wartezeit.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {trusts.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-[#4b5563]">
                <CheckCircle2 size={14} style={{ color: "var(--ct-green)" }} />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <FadeIn key={s.step} delay={i * 80}>
                <div className="text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
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

      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
               style={{ color: "var(--ct-cyan)" }}>Kostenlose Bewertung</p>
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--ct-dark)" }}>
              Fahrzeug zur Bewertung anmelden
            </h2>
            <p className="text-[#6b7280] text-sm mb-8">
              Unverbindlich und kostenlos — wir melden uns innert 24 Stunden.
            </p>
          </FadeIn>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <AnkaufForm />
          </div>
        </div>
      </section>
    </>
  );
}
