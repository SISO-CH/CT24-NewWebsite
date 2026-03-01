import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ReservierungBestaetigungPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ct-light px-4">
      <div className="max-w-md w-full text-center py-16">
        <CheckCircle2 size={56} className="text-ct-green mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-ct-dark mb-3">
          Reservierung bestätigt!
        </h1>
        <p className="text-[#6b7280] text-base leading-relaxed mb-8">
          Ihre Reservierungsgebühr wurde erfolgreich verarbeitet. Das Fahrzeug
          ist für 48 Stunden für Sie reserviert. Wir melden uns in Kürze bei Ihnen.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/autos"
            className="px-6 py-3 rounded-xl bg-ct-cyan text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Weitere Fahrzeuge
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
