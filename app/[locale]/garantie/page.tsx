// app/garantie/page.tsx
import type { Metadata } from "next";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import Accordion from "@/components/ui/Accordion";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Garantie",
  description:
    "Bis zu 7 Jahre Garantie auf alle Occasionen bei Car Trade24. Motor, Getriebe, Elektronik und mehr — transparent und fair.",
};

const coverage = [
  { category: "Antrieb",    items: ["Motor", "Getriebe", "Differential", "Antriebswellen"] },
  { category: "Elektronik", items: ["Steuergeräte", "Sensoren", "Bordcomputer"] },
  { category: "Fahrwerk",   items: ["Lenkung", "Federung", "Stossdämpfer"] },
  { category: "Klima",      items: ["Kompressor", "Kondensator", "Klimaanlage"] },
];

const durations = [
  { years: "1 Jahr",  desc: "Basisschutz", color: "#9ca3af" },
  { years: "2 Jahre", desc: "Standard",    color: "#00a0e3" },
  { years: "3 Jahre", desc: "Komfort",     color: "#00a0e3" },
  { years: "5 Jahre", desc: "Premium",     color: "#e4007d" },
  { years: "7 Jahre", desc: "Maximal",     color: "#e4007d" },
];

const faqItems = [
  {
    question: "Was ist im Garantiefall zu tun?",
    answer: "Melden Sie den Schaden telefonisch oder per E-Mail bei uns. Wir koordinieren die Reparatur mit einer unserer Partnerwerkstätten — schweizweit. Sie müssen nichts vorstrecken.",
  },
  {
    question: "Gilt die Garantie auch im Ausland?",
    answer: "Die Garantie gilt primär in der Schweiz. Für Pannen im europäischen Ausland empfehlen wir eine Pannenhilfe-Versicherung als Ergänzung.",
  },
  {
    question: "Kann ich die Garantie übertragen?",
    answer: "Ja. Beim Weiterverkauf kann die verbleibende Garantiedauer auf den neuen Eigentümer übertragen werden — das erhöht den Wiederverkaufswert.",
  },
  {
    question: "Was ist nicht abgedeckt?",
    answer: "Verschleissteile (Bremsbeläge, Reifen, Glühbirnen), Unfallschäden und Schäden durch unsachgemässen Betrieb sind ausgeschlossen.",
  },
  {
    question: "Wie lange gilt die gesetzliche Gewährleistung?",
    answer: "In der Schweiz beträgt die gesetzliche Gewährleistungspflicht nach OR 2 Jahre. Unsere optionale Garantie erweitert diese.",
  },
];

export default function GarantiePage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Garantie</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>Bis zu 7 Jahre Garantie.</h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Jede Occasion ab unserem Hof wird mit einer wählbaren Garantie geliefert — transparent, fair und schweizweit gültig.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Abdeckung</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>Was ist abgedeckt?</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coverage.map((cat, i) => (
              <FadeIn key={cat.category} delay={i * 60}>
                <div className="p-5 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={16} style={{ color: "var(--ct-cyan)" }} />
                    <h3 className="font-bold text-sm" style={{ color: "var(--ct-dark)" }}>{cat.category}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[#6b7280]">
                        <CheckCircle2 size={12} style={{ color: "var(--ct-green)" }} className="shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Laufzeiten</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>Sie wählen die Dauer</h2>
            </div>
          </FadeIn>
          <div className="flex flex-wrap gap-4">
            {durations.map((d, i) => (
              <FadeIn key={d.years} delay={i * 60}>
                <div className="flex flex-col items-center justify-center w-32 h-32 rounded-xl
                                bg-white border-2 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                     style={{ borderColor: d.color }}>
                  <p className="text-2xl font-black" style={{ color: d.color }}>{d.years}</p>
                  <p className="text-xs text-[#9ca3af] mt-1">{d.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-8">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Häufige Fragen</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>Garantie — FAQ</h2>
            </div>
          </FadeIn>
          <Accordion items={faqItems} />
        </div>
      </section>

      <section className="py-12 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <p className="text-[#6b7280] text-sm mb-4">Fragen zur Garantie? Wir beraten Sie gerne persönlich.</p>
            <Link href="/kontakt"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white
                         font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ct-cyan)" }}>
              Kontakt aufnehmen <ArrowRight size={15} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
