import type { Metadata } from "next";
import TradeInWizard from "@/components/ui/TradeInWizard";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Fahrzeug in Zahlung geben",
  description:
    "Fahrzeug bewerten und direkt in Zahlung geben bei Car Trade24 GmbH. Sofortschätzung online — verbindliches Angebot innert 24 Stunden.",
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function InzahlungnahmePage({ params }: Props) {
  const { locale } = await params;

  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-12 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ct-cyan mb-2">
              Digitale Inzahlungnahme
            </p>
            <h1 className="text-4xl font-extrabold text-ct-dark mb-4">
              Ihr Fahrzeug clever verwerten
            </h1>
            <p className="text-[#6b7280] text-base max-w-lg mx-auto leading-relaxed">
              Sofortschätzung online — verbindliches Angebot innert 24 Stunden.
              Direkter Eintausch auf Ihr nächstes Fahrzeug möglich.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Wizard */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn delay={100}>
            <TradeInWizard locale={locale} />
          </FadeIn>
        </div>
      </section>

      {/* USPs */}
      <section className="py-12 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { title: "Sofortschätzung", desc: "In 60 Sekunden einen realistischen Marktwert online erhalten." },
              { title: "Verbindliches Angebot", desc: "Nach Bezahlung der CHF 20 Bewertungsgebühr melden wir uns innert 24h." },
              { title: "Direkt in Zahlung", desc: "Den Betrag auf Ihr neues Fahrzeug bei Car Trade24 anrechnen lassen." },
            ].map((usp) => (
              <div key={usp.title} className="p-5">
                <h3 className="font-bold text-ct-dark mb-2">{usp.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
