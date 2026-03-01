import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function InzahlungnahmeBestaetigungPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ct-light px-4">
      <div className="max-w-md w-full text-center py-16">
        <CheckCircle2 size={56} className="text-ct-green mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-ct-dark mb-3">
          Bewertung bestellt!
        </h1>
        <p className="text-[#6b7280] text-base leading-relaxed mb-8">
          Ihre Zahlung wurde erfolgreich verarbeitet. Wir melden uns innert
          24 Stunden mit einem verbindlichen Kaufangebot für Ihr Fahrzeug.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/autos"
            className="px-6 py-3 rounded-xl bg-ct-cyan text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Fahrzeuge entdecken
          </Link>
          <Link
            href="/kontakt"
            className="px-6 py-3 rounded-xl border border-[#e5e7eb] text-ct-dark font-semibold text-sm hover:bg-white transition-colors"
          >
            Kontakt aufnehmen
          </Link>
        </div>
      </div>
    </main>
  );
}
