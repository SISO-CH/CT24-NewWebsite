import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title: "Zulassungsservice — Car Trade24",
  description: "Wir erledigen die Fahrzeugzulassung vollständig für Sie. Kein Behördengang, schnell und schweizweit.",
};

const usps = [
  "Kein Behördengang nötig",
  "Schnell und unkompliziert",
  "Schweizweit möglich",
];

const steps = [
  { num: "01", title: "Daten übermitteln",      desc: "Senden Sie uns Ihre Fahrzeug- und Personendaten via Formular." },
  { num: "02", title: "Wir erledigen alles",    desc: "Wir kümmern uns um alle Formalitäten mit dem Strassenverkehrsamt." },
  { num: "03", title: "Fahrzeug ist zugelassen", desc: "Sie erhalten Ihre Schilder und Dokumente direkt zugestellt." },
];

export default function ZulassungsservicePage() {
  return (
    <>
      {/* Header */}
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
            Zulassungsservice
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-ct-dark">
            Zulassung?<br />Erledigen wir für Sie.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Kein Strassenverkehrsamt, kein Papierkram — wir übernehmen die komplette Zulassung Ihres Fahrzeugs.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {usps.map((u) => (
              <span key={u} className="flex items-center gap-1.5 text-sm text-[#4b5563]">
                <CheckCircle2 size={14} className="text-ct-green shrink-0" />{u}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Prozessschritte */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">Ablauf</p>
              <h2 className="text-2xl font-extrabold text-ct-dark">In 3 Schritten zugelassen</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 100}>
                <div className="text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-5xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {s.num}
                  </p>
                  <h3 className="font-bold text-base mb-2 text-ct-dark">{s.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Formular */}
      <section className="py-14 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">Anfrage</p>
            <h2 className="text-3xl font-extrabold mb-2 text-ct-dark">Zulassung beauftragen</h2>
            <p className="text-[#6b7280] text-sm mb-8">Wir antworten innert 24 Stunden.</p>
          </FadeIn>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <ServiceContactForm subject="Zulassungsservice-Anfrage" fields={["Fahrzeug / Inserat-Nr.", "Kanton"]} />
          </div>
        </div>
      </section>
    </>
  );
}
