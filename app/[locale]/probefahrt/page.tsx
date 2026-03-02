import type { Metadata } from "next";
import { Car } from "lucide-react";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title:       "Probefahrt buchen — Car Trade24",
  description: "Buchen Sie online eine kostenlose Probefahrt bei Car Trade24 in Wohlen.",
};

export default function ProbefahrtPage() {
  return (
    <main className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-ct-cyan/10 flex items-center justify-center">
            <Car size={22} className="text-ct-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ct-dark">Probefahrt buchen</h1>
            <p className="text-[#6b7280] text-sm">Kostenlos, unverbindlich, direkt bei uns</p>
          </div>
        </div>
        <ul className="text-sm text-[#374151] space-y-1 mb-8 list-disc list-inside">
          <li>Keine Verpflichtung zum Kauf</li>
          <li>Mo–Fr 08:30–18:30, Sa 09:00–16:00</li>
          <li>Direkt bei uns: Ringstrasse 26, 5610 Wohlen</li>
        </ul>
        <ServiceContactForm subject="Probefahrtanfrage" fields={["Gewünschtes Fahrzeug"]} />
      </div>
    </main>
  );
}
