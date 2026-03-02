import type { Metadata } from "next";
import ServicePageLayout from "@/components/ui/ServicePageLayout";

export const metadata: Metadata = {
  title: "Home Delivery — Car Trade24",
  description: "Ihr neues Auto wird direkt zu Ihnen geliefert. Bis 50 km kostenlos — schweizweit möglich.",
};

const usps  = ["Bis 50 km ab Wohlen kostenlos", "Terminwahl nach Ihren Wünschen", "Vollversichertes Fahrzeug bei Lieferung"];
const steps = [
  { num: "01", title: "Fahrzeug wählen",           desc: "Wählen Sie Ihr Traumauto aus unserem Bestand aus." },
  { num: "02", title: "Termin vereinbaren",         desc: "Wir stimmen Lieferdatum und -ort mit Ihnen ab." },
  { num: "03", title: "Lieferung entgegennehmen",   desc: "Wir bringen das Fahrzeug direkt vor Ihre Haustür." },
];

export default function HomeDeliveryPage() {
  return (
    <ServicePageLayout
      badge="Home Delivery"
      heading={<>Ihr neues Auto.<br />Direkt zu Ihnen.</>}
      lead="Wir liefern Ihr Fahrzeug direkt an Ihre Adresse — bis 50 km kostenlos, schweizweit möglich."
      usps={usps}
      processEyebrow="So läuft's ab"
      processHeading="In 3 Schritten zu Ihrer Lieferung"
      steps={steps}
      formEyebrow="Lieferanfrage"
      formHeading="Lieferung anfragen"
      formNote="Wir antworten innert 24 Stunden mit einem Liefertermin."
      formSubject="Home-Delivery-Anfrage"
      formFields={["Fahrzeug / Inserat-Nr.", "Lieferadresse"]}
    />
  );
}
