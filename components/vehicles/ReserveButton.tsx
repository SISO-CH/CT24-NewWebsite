"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

interface Props {
  vehicleId: number;
  vehicleLabel: string;
  locale?: string;
}

export default function ReserveButton({ vehicleId, vehicleLabel, locale }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReserve() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, vehicleLabel, locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Fehler bei der Reservierung. Bitte versuchen Sie es erneut.");
        setLoading(false);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleReserve}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                   bg-ct-dark text-white font-semibold text-sm
                   hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        <Lock size={14} />
        {loading ? "Weiterleitung…" : "Jetzt reservieren (CHF 200)"}
      </button>
      {error && (
        <p className="mt-1.5 text-xs text-ct-magenta text-center">{error}</p>
      )}
      <p className="mt-1 text-[10px] text-[#9ca3af] text-center">
        Reservierungsgebühr wird auf den Kaufpreis angerechnet
      </p>
    </div>
  );
}
