import type { Metadata } from "next";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "News",
  description: "Aktuelle News, neue Fahrzeuge und Angebote von Car Trade24 GmbH.",
};

const articles = [
  {
    date: "Februar 2026",
    category: "Neuzugang",
    title: "Hyundai Kona EV – frisch eingetroffen",
    excerpt:
      "Unser neuster Elektro-Zugang: der Hyundai Kona EV mit 65.4 kWh Batterie und über 450 km WLTP-Reichweite. Energieeffizienz A, nur 11'500 km, Toppreis.",
  },
  {
    date: "Januar 2026",
    category: "Angebot",
    title: "Winter-Aktion: 30% Rabatt auf den Range Rover Evoque",
    excerpt:
      "Nur für kurze Zeit: Der Land Rover Range Rover Evoque zum Sonderpreis von CHF 38'900. Gepflegt, Automatik, Benzin, Energieeffizienz E.",
  },
  {
    date: "Dezember 2025",
    category: "Unternehmen",
    title: "Car Trade24 feiert 26 Jahre – Danke für Ihr Vertrauen",
    excerpt:
      "Seit 1998 sind wir Ihr verlässlicher Partner für Occasionen in der Schweiz. Wir bedanken uns herzlich bei all unseren Kundinnen und Kunden.",
  },
];

export default function NewsPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
            style={{ color: "var(--ct-cyan)" }}
          >
            Aktuelles
          </p>
          <h1
            className="text-4xl lg:text-5xl font-extrabold mb-4"
            style={{ color: "var(--ct-dark)" }}
          >
            News & Angebote
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Neue Fahrzeuge, Aktionen und Neuigkeiten aus dem Car Trade24 Betrieb.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-8">
            {articles.map((a, i) => (
              <FadeIn key={a.title} delay={i * 80}>
                <article
                  className="border border-[#f0f0f0] rounded-xl p-6
                              shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="px-2.5 py-0.5 text-[0.7rem] font-semibold rounded
                                 uppercase tracking-wide text-white"
                      style={{ backgroundColor: "var(--ct-cyan)" }}
                    >
                      {a.category}
                    </span>
                    <span className="text-[#9ca3af] text-xs">{a.date}</span>
                  </div>
                  <h2
                    className="font-bold text-lg mb-2"
                    style={{ color: "var(--ct-dark)" }}
                  >
                    {a.title}
                  </h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{a.excerpt}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
