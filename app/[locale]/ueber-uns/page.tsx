// app/[locale]/ueber-uns/page.tsx
import type { Metadata } from "next";
import { Award, Users, MapPin, CalendarCheck } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SALES_TEAM } from "@/lib/team";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Car Trade24 GmbH – Ihr vertrauenswürdiger Autohandel in Wohlen (Aargau) seit über 26 Jahren.",
};

const stats = [
  { icon: CalendarCheck, value: "26+",    label: "Jahre Erfahrung"      },
  { icon: Users,         value: "5000+",  label: "Zufriedene Kunden"    },
  { icon: Award,         value: "7",      label: "Jahre Garantie"        },
  { icon: MapPin,        value: "50–80",  label: "Fahrzeuge an Lager"   },
];

const values = [
  {
    title: "Transparenz",
    desc:  "Ehrliche Preise, keine versteckten Kosten. Was Sie sehen, ist was Sie zahlen.",
  },
  {
    title: "Qualität",
    desc:  "Jedes Fahrzeug wird von unseren Experten gründlich geprüft bevor es den Hof verlässt.",
  },
  {
    title: "Nähe",
    desc:  "Persönliche Beratung in Wohlen oder schweizweite Lieferung direkt zu Ihnen.",
  },
];

export default function UeberUnsPage() {
  return (
    <>
      {/* Hero band */}
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>
            Wer wir sind
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>
            Über uns
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Car Trade24 GmbH – Ihr fairer Autohandel in Wohlen (Aargau) seit über 26 Jahren.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white py-12 border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <FadeIn key={s.label}>
                <div className="text-center">
                  <s.icon size={28} className="mx-auto mb-3" style={{ color: "var(--ct-cyan)" }} />
                  <p className="text-3xl font-black" style={{ color: "var(--ct-dark)" }}>{s.value}</p>
                  <p className="text-sm text-[#6b7280] mt-1">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Unsere Geschichte</p>
              <h2 className="text-3xl font-extrabold mb-5" style={{ color: "var(--ct-dark)" }}>
                Seit 1998 in Wohlen
              </h2>
              <div className="space-y-4 text-[#4b5563] leading-relaxed text-sm">
                <p>
                  Car Trade24 GmbH wurde mit einer klaren Vision gegründet: Fahrzeugkauf soll fair,
                  transparent und ohne Druck ablaufen. Aus einem kleinen Betrieb in Wohlen ist über
                  die Jahre einer der verlässlichsten Occasionshändler im Aargau entstanden.
                </p>
                <p>
                  Heute bieten wir 50 bis 80 geprüfte Fahrzeuge – Occasionen und Neuwagen – aus
                  allen Segmenten. Jedes Auto wird von unserem Team eingehend geprüft, aufbereitet
                  und mit bis zu 7 Jahren Garantie ausgeliefert.
                </p>
                <p>
                  Wir liefern schweizweit – bis zu 50 km kostenlos – und nehmen Ihr Altfahrzeug
                  zu fairen Konditionen in Zahlung.
                </p>
              </div>
              <Link
                href="/kontakt"
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white
                           text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Kontakt aufnehmen <ArrowRight size={15} />
              </Link>
            </FadeIn>

            {/* Values */}
            <FadeIn delay={150}>
              <div className="space-y-5">
                {values.map((v) => (
                  <div key={v.title}
                       className="flex gap-4 p-5 rounded-xl border border-[#f0f0f0]
                                  shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <div className="w-2 rounded-full flex-shrink-0"
                         style={{ backgroundColor: "var(--ct-cyan)" }} />
                    <div>
                      <h3 className="font-bold text-sm mb-1" style={{ color: "var(--ct-dark)" }}>
                        {v.title}
                      </h3>
                      <p className="text-[#6b7280] text-sm leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ASTRA-Zulassung */}
      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Zertifizierung</p>
              <h2 className="text-3xl font-extrabold mb-5" style={{ color: "var(--ct-dark)" }}>
                ASTRA-Grossimporteur
              </h2>
              <div className="space-y-4 text-[#4b5563] leading-relaxed text-sm">
                <p>
                  Car Trade24 ist vom Bundesamt für Strassen (ASTRA) als Grossimporteur zugelassen.
                  Diese Zulassung erfordert strenge Qualitätsstandards bei Fahrzeugherkunft,
                  Zustandsbeschreibung und Kundenkommunikation.
                </p>
                <p>
                  Regelmässige Kontrollen stellen sicher, dass unsere Prozesse den gesetzlichen
                  Anforderungen entsprechen. Für Sie: vollständige Transparenz bei jedem Fahrzeug.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "100%", label: "Transparente Herkunft" },
                  { value: "ASTRA", label: "Staatlich zugelassen" },
                  { value: "Jährlich", label: "Kontrolliert" },
                  { value: "CH", label: "Schweizer Recht" },
                ].map((item) => (
                  <div key={item.label}
                       className="p-5 rounded-xl bg-white border border-[#e5e7eb] text-center
                                  shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-2xl font-black mb-1" style={{ color: "var(--ct-cyan)" }}>
                      {item.value}
                    </p>
                    <p className="text-xs text-[#6b7280]">{item.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 bg-white border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Unser Team</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                Die Menschen hinter Car Trade24
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SALES_TEAM.map((member, i) => (
              <FadeIn key={member.name} delay={i * 80}>
                <div className="flex flex-col items-center text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[var(--ct-cyan)] transition-colors">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold mb-4"
                    style={{ backgroundColor: "var(--ct-cyan)" }}
                  >
                    {member.initials}
                  </div>
                  <p className="font-bold text-sm mb-1" style={{ color: "var(--ct-dark)" }}>
                    {member.name}
                  </p>
                  <p className="text-xs text-[#9ca3af] uppercase tracking-wider">
                    {member.role}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Qualitätsprozess */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Unser Versprechen</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                Jedes Fahrzeug geprüft
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Technische Prüfung",
                desc: "Motor, Getriebe, Elektronik, Bremsen und Fahrwerk werden vollständig geprüft und dokumentiert.",
              },
              {
                step: "02",
                title: "Aufbereitung",
                desc: "Innenraum und Karosserie werden professionell aufbereitet. Mängel werden behoben bevor das Fahrzeug auf den Hof kommt.",
              },
              {
                step: "03",
                title: "Zertifizierung",
                desc: "Jedes Fahrzeug erhält einen vollständigen Prüfbericht. Sie wissen vor dem Kauf exakt, was Sie erhalten.",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 100}>
                <div className="p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <p className="text-4xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {item.step}
                  </p>
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--ct-dark)" }}>
                    {item.title}
                  </h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
