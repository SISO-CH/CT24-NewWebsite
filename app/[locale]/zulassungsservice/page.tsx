import type { Metadata } from "next";
import ServicePageLayout from "@/components/ui/ServicePageLayout";

export const metadata: Metadata = {
  title: "Zulassungsservice — Car Trade24",
  description: "Wir erledigen die Fahrzeugzulassung vollständig für Sie. Kein Behördengang, schnell und schweizweit.",
};

const usps  = ["Kein Behördengang nötig", "Schnell und unkompliziert", "Schweizweit möglich"];
const steps = [
  { num: "01", title: "Daten übermitteln",       desc: "Senden Sie uns Ihre Fahrzeug- und Personendaten via Formular." },
  { num: "02", title: "Wir erledigen alles",     desc: "Wir kümmern uns um alle Formalitäten mit dem Strassenverkehrsamt." },
  { num: "03", title: "Fahrzeug ist zugelassen", desc: "Sie erhalten Ihre Schilder und Dokumente direkt zugestellt." },
];

export default function ZulassungsservicePage() {
  return (
    <ServicePageLayout
      badge="Zulassungsservice"
      heading={<>Zulassung?<br />Erledigen wir für Sie.</>}
      lead="Kein Strassenverkehrsamt, kein Papierkram — wir übernehmen die komplette Zulassung Ihres Fahrzeugs."
      usps={usps}
      processEyebrow="Ablauf"
      processHeading="In 3 Schritten zugelassen"
      steps={steps}
      formEyebrow="Anfrage"
      formHeading="Zulassung beauftragen"
      formNote="Wir antworten innert 24 Stunden."
      formSubject="Zulassungsservice-Anfrage"
      formFields={["Fahrzeug / Inserat-Nr.", "Kanton"]}
    />
  );
}
