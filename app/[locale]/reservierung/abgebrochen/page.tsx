import Link from "next/link";
import { XCircle } from "lucide-react";

export default function ReservierungAbgebrochenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ct-light px-4">
      <div className="max-w-md w-full text-center py-16">
        <XCircle size={56} className="text-ct-magenta mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-ct-dark mb-3">
          Reservierung abgebrochen
        </h1>
        <p className="text-[#6b7280] text-base leading-relaxed mb-8">
          Der Vorgang wurde abgebrochen. Es wurde nichts belastet. Sie können
          das Fahrzeug jederzeit erneut reservieren.
        </p>
        <Link
          href="/autos"
          className="inline-block px-6 py-3 rounded-xl bg-ct-cyan text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Zurück zur Übersicht
        </Link>
      </div>
    </main>
  );
}
