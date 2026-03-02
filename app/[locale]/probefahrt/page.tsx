import type { Metadata } from "next";
import ServicePageLayout from "@/components/ui/ServicePageLayout";

export const metadata: Metadata = {
  title: "Probefahrt buchen — Car Trade24",
  description: "Buchen Sie online eine kostenlose Probefahrt bei Car Trade24 in Wohlen. Unverbindlich, kein Kaufzwang.",
};

const usps  = ["Kostenlos und unverbindlich", "Kein Kaufzwang", "Wunschfahrzeug wählbar"];
const steps = [
  { num: "01", title: "Fahrzeug angeben",     desc: "Teilen Sie uns mit, welches Fahrzeug Sie probefahren möchten." },
  { num: "02", title: "Termin bestätigen",    desc: "Wir melden uns innert 24h und bestätigen Ihren Wunschtermin." },
  { num: "03", title: "Probefahrt geniessen", desc: "Einfach vorbeikommen — Ringstrasse 26, 5610 Wohlen." },
];

export default function ProbefahrtPage() {
  return (
    <ServicePageLayout
      badge="Kostenlos & unverbindlich"
      heading="Probefahrt buchen."
      lead="Erleben Sie Ihr Wunschfahrzeug auf der Strasse — kostenlos, ohne Druck, direkt bei uns in Wohlen."
      usps={usps}
      processEyebrow="So einfach geht's"
      processHeading="In 3 Schritten zur Probefahrt"
      steps={steps}
      formEyebrow="Anfrage"
      formHeading="Jetzt Termin anfragen"
      formNote="Wir antworten innert 24 Stunden."
      formSubject="Probefahrtanfrage"
      formFields={["Gewünschtes Fahrzeug"]}
    />
  );
}
