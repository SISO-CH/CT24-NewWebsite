import type { Metadata } from "next";
import { Search } from "lucide-react";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title:       "Fahrzeug-Sourcing — Car Trade24",
  description: "Wunschauto nicht im Bestand? Wir beschaffen es für Sie.",
};

export default function FahrzeugSourcingPage() {
  return (
    <main className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-ct-cyan/10 flex items-center justify-center">
            <Search size={22} className="text-ct-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ct-dark">Fahrzeug-Sourcing</h1>
            <p className="text-[#6b7280] text-sm">Ihr Wunschauto — wir beschaffen es</p>
          </div>
        </div>
        <ul className="text-sm text-[#374151] space-y-1 mb-8 list-disc list-inside">
          <li>Konkrete Angaben zu Marke, Modell, Budget und Ausstattung</li>
          <li>Wir melden uns innert 2 Werktagen mit Optionen</li>
          <li>Keine versteckten Gebühren</li>
        </ul>
        <ServiceContactForm
          subject="Fahrzeug-Sourcing"
          fields={["Wunschfahrzeug (Marke, Modell)", "Budget (CHF)", "Wichtige Ausstattung"]}
        />
      </div>
    </main>
  );
}
