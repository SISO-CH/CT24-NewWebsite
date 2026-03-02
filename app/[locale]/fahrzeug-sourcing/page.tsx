import type { Metadata } from "next";
import ServicePageLayout from "@/components/ui/ServicePageLayout";

export const metadata: Metadata = {
  title: "Fahrzeug-Sourcing — Car Trade24",
  description: "Wir beschaffen Ihr Wunschauto — alle Marken, Schweiz und Import, ohne Aufpreis.",
};

const usps  = ["Alle Marken und Modelle", "Schweiz und Import", "Kein Aufpreis auf Sourcing"];
const steps = [
  { num: "01", title: "Wunsch definieren",      desc: "Teilen Sie uns Marke, Modell, Budget und Ausstattungswünsche mit." },
  { num: "02", title: "Wir suchen für Sie",     desc: "Wir durchsuchen unser Netzwerk und finden passende Fahrzeuge." },
  { num: "03", title: "Fahrzeug präsentieren",  desc: "Wir stellen Ihnen Optionen vor — Sie entscheiden ohne Druck." },
];

export default function FahrzeugSourcingPage() {
  return (
    <ServicePageLayout
      badge="Fahrzeug-Sourcing"
      heading={<>Wir finden<br />Ihr Wunschauto.</>}
      lead="Nicht das Richtige im Bestand? Kein Problem — wir beschaffen Ihr Wunschfahrzeug aus unserem Netzwerk."
      usps={usps}
      processEyebrow="Ablauf"
      processHeading="In 3 Schritten zum Wunschauto"
      steps={steps}
      formEyebrow="Wunschauto anfragen"
      formHeading="Jetzt Wunsch mitteilen"
      formNote="Wir antworten innert 24 Stunden."
      formSubject="Fahrzeug-Sourcing-Anfrage"
      formFields={["Marke & Modell", "Budget (CHF)", "Wichtigste Ausstattung"]}
    />
  );
}
