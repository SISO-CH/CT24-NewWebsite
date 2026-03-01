// app/[locale]/faq/page.tsx
import type { Metadata } from "next";
import FadeIn from "@/components/ui/FadeIn";
import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import Script from "next/script";

export const metadata: Metadata = {
  title: "FAQ – Häufige Fragen",
  description:
    "Antworten auf die häufigsten Fragen zu Kauf, Leasing, Garantie, Lieferung und Fahrzeugankauf bei Car Trade24 GmbH.",
};

const categories: { title: string; items: AccordionItem[] }[] = [
  {
    title: "Kauf & Bezahlung",
    items: [
      {
        question: "Welche Zahlungsarten akzeptieren Sie?",
        answer: "Wir akzeptieren Barzahlung, Banküberweisung und Finanzierung über unsere Bankpartner. EC-Karte ist ebenfalls möglich.",
      },
      {
        question: "Kann ich ein Fahrzeug reservieren?",
        answer: "Ja, gegen eine Anzahlung von CHF 500 reservieren wir Ihr Wunschfahrzeug für bis zu 7 Tage. Die Anzahlung wird beim Kauf vollständig angerechnet.",
      },
      {
        question: "Ist eine Probefahrt möglich?",
        answer: "Selbstverständlich. Vereinbaren Sie einen Termin telefonisch oder per E-Mail. Bitte gültigen Führerschein mitbringen.",
      },
    ],
  },
  {
    title: "Lieferung & Abholung",
    items: [
      {
        question: "Liefern Sie Fahrzeuge schweizweit?",
        answer: "Ja, wir liefern in die ganze Schweiz. Bis 50 km Entfernung von Wohlen ist die Lieferung kostenlos.",
      },
      {
        question: "Wie lange dauert die Lieferung?",
        answer: "Nach Zahlungseingang organisieren wir die Lieferung innerhalb von 2–5 Werktagen.",
      },
    ],
  },
  {
    title: "Garantie & Service",
    items: [
      {
        question: "Wie lange gilt die Garantie?",
        answer: "Wir bieten optionale Garantielaufzeiten von 1 bis 7 Jahren. Die gesetzliche Gewährleistungspflicht nach OR beträgt 2 Jahre.",
      },
      {
        question: "Was muss ich im Garantiefall tun?",
        answer: "Kontaktieren Sie uns telefonisch oder per E-Mail. Wir koordinieren die Reparatur mit einer Partnerwerkstatt in Ihrer Nähe.",
      },
      {
        question: "Sind die Fahrzeuge MFK-geprüft?",
        answer: "Alle Fahrzeuge durchlaufen eine interne Prüfung. Viele besitzen zudem eine aktuelle MFK. Details im jeweiligen Inserat.",
      },
    ],
  },
  {
    title: "Finanzierung & Leasing",
    items: [
      {
        question: "Welche Voraussetzungen brauche ich für Leasing?",
        answer: "Gültiger Schweizer Wohnsitz, Führerschein und positive Bonitätsprüfung. Wir unterstützen Sie beim Prozess.",
      },
      {
        question: "Wie lange dauert die Leasingentscheidung?",
        answer: "In der Regel 24–48 Stunden. Wir reichen Ihren Antrag direkt ein und informieren Sie sofort.",
      },
    ],
  },
  {
    title: "Fahrzeugankauf",
    items: [
      {
        question: "Kaufen Sie auch Fahrzeuge mit hohem Kilometerstand?",
        answer: "Ja, wir bewerten jedes Fahrzeug individuell. Füllen Sie einfach das Formular auf unserer Ankauf-Seite aus.",
      },
      {
        question: "Wie schnell erhalte ich eine Bewertung?",
        answer: "Wir melden uns innerhalb von 24 Stunden mit einem schriftlichen Angebot. Gültig für 7 Tage, unverbindlich.",
      },
      {
        question: "Nehmen Sie Fahrzeuge in Zahlung?",
        answer: "Ja, Fahrzeugeintausch ist möglich. Der Eintauschwert wird fair bewertet und vom Kaufpreis Ihres neuen Fahrzeugs abgezogen.",
      },
    ],
  },
];

const allFaqItems = categories.flatMap((cat) => cat.items);

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {/* JSON-LD für Schema.org FAQPage — statische Daten, kein User-Input */}
      <Script id="faq-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Häufige Fragen</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>FAQ</h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Die häufigsten Fragen zu Kauf, Leasing, Garantie, Lieferung und Fahrzeugankauf.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {categories.map((cat, i) => (
            <FadeIn key={cat.title} delay={i * 60}>
              <div>
                <h2 className="text-lg font-extrabold mb-5 pb-3 border-b border-[#f0f0f0]"
                    style={{ color: "var(--ct-dark)" }}>
                  {cat.title}
                </h2>
                <Accordion items={cat.items} />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  );
}
