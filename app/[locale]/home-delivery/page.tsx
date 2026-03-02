import type { Metadata } from "next";
import { Truck } from "lucide-react";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title:       "Home Delivery — Car Trade24",
  description: "Wir liefern Ihr Fahrzeug direkt zu Ihnen nach Hause — schweizweit.",
};

export default function HomeDeliveryPage() {
  return (
    <main className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-ct-cyan/10 flex items-center justify-center">
            <Truck size={22} className="text-ct-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ct-dark">Home Delivery</h1>
            <p className="text-[#6b7280] text-sm">Ihr neues Auto kommt zu Ihnen</p>
          </div>
        </div>
        <ul className="text-sm text-[#374151] space-y-1 mb-8 list-disc list-inside">
          <li>Lieferung bis 50 km: kostenlos</li>
          <li>Schweizweit: Pauschale nach Vereinbarung</li>
          <li>Übergabe inkl. Fahrzeugeinweisung</li>
        </ul>
        <ServiceContactForm subject="Home Delivery" fields={["Lieferadresse / PLZ", "Gewünschtes Fahrzeug"]} />
      </div>
    </main>
  );
}
