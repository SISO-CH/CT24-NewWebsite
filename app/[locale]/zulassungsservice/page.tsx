import type { Metadata } from "next";
import { FileText } from "lucide-react";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title:       "Zulassungsservice — Car Trade24",
  description: "Wir übernehmen die Zulassung Ihres neuen Fahrzeugs für Sie.",
};

export default function ZulassungsservicePage() {
  return (
    <main className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-ct-cyan/10 flex items-center justify-center">
            <FileText size={22} className="text-ct-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ct-dark">Zulassungsservice</h1>
            <p className="text-[#6b7280] text-sm">Wir erledigen den Papierkram für Sie</p>
          </div>
        </div>
        <ul className="text-sm text-[#374151] space-y-1 mb-8 list-disc list-inside">
          <li>Zulassung im Kanton Aargau und weiteren Kantonen</li>
          <li>Wir informieren Sie über anfallende Kosten im Voraus</li>
          <li>Inkl. Versicherungsnachweis und Schilderbestellung</li>
        </ul>
        <ServiceContactForm subject="Zulassungsservice" fields={["Fahrzeug / Kaufvertrag"]} />
      </div>
    </main>
  );
}
