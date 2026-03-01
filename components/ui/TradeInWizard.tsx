"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { formatCHF } from "@/lib/utils";

type Step = 1 | 2 | 3;
type Condition = "Sehr gut" | "Gut" | "Gebraucht";

interface Valuation {
  min: number;
  max: number;
  currency: string;
}

interface Props {
  locale?: string;
}

export default function TradeInWizard({ locale }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [plate, setPlate] = useState("");
  const [km, setKm] = useState("");
  const [condition, setCondition] = useState<Condition>("Gut");
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEstimate() {
    if (!plate.trim() || !km) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trade-in/valuate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: plate.trim(), km: Number(km), condition }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler");
      setValuation(data);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bewertungsfehler");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trade-in/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: plate.trim(), km: Number(km), condition, locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Stripe-Fehler. Bitte versuchen Sie es erneut.");
        setLoading(false);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s
                  ? "bg-ct-cyan text-white"
                  : step > s
                  ? "bg-ct-green text-white"
                  : "bg-[#f0f0f0] text-[#9ca3af]"
              }`}
            >
              {s}
            </div>
            {i < 2 && <ChevronRight size={14} className="text-[#d1d5db]" />}
          </div>
        ))}
        <span className="ml-2 text-sm text-[#6b7280]">
          {step === 1 && "Fahrzeugdaten"}
          {step === 2 && "Sofortschätzung"}
          {step === 3 && "Verbindliche Bewertung"}
        </span>
      </div>

      {/* Step 1: Vehicle data */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ct-dark mb-1.5">
              Kontrollschild
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="z. B. AG 12345"
              className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-ct-cyan/30 focus:border-ct-cyan"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ct-dark mb-1.5">
              Kilometerstand
            </label>
            <input
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="z. B. 85000"
              min={0}
              className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-ct-cyan/30 focus:border-ct-cyan"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ct-dark mb-1.5">
              Zustand
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Sehr gut", "Gut", "Gebraucht"] as Condition[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    condition === c
                      ? "border-ct-cyan bg-ct-cyan/10 text-ct-cyan"
                      : "border-[#e5e7eb] text-[#6b7280] hover:border-ct-cyan"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-ct-magenta text-sm">{error}</p>}
          <button
            type="button"
            onClick={handleEstimate}
            disabled={loading || !plate.trim() || !km}
            className="w-full py-3.5 rounded-xl bg-ct-cyan text-white font-semibold text-sm
                       flex items-center justify-center gap-2
                       hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Berechne…" : <>Sofortschätzung anzeigen <ArrowRight size={15} /></>}
          </button>
        </div>
      )}

      {/* Step 2: Valuation result */}
      {step === 2 && valuation && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e5e7eb] p-6 text-center">
            <p className="text-sm text-[#6b7280] mb-1">Geschätzter Marktwert</p>
            <p className="text-4xl font-black text-ct-dark mb-1">
              CHF {formatCHF(valuation.min)} – {formatCHF(valuation.max)}
            </p>
            <p className="text-xs text-[#9ca3af]">
              {plate} · {Number(km).toLocaleString("de-CH")} km · {condition}
            </p>
            <p className="text-[11px] text-[#9ca3af] mt-3">
              * Sofortschätzung basierend auf Marktdaten. Kein verbindliches Angebot.
            </p>
          </div>

          <div className="rounded-xl bg-ct-light border border-[#e5e7eb] p-5">
            <p className="font-semibold text-ct-dark mb-1">
              Verbindliches Angebot erhalten
            </p>
            <p className="text-sm text-[#6b7280] mb-4">
              Für CHF 20 erstellen wir eine verbindliche Bewertung. Wir melden uns
              innert 24 Stunden mit einem konkreten Kaufangebot.
            </p>
            {error && <p className="text-ct-magenta text-sm mb-3">{error}</p>}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-ct-dark text-white font-semibold text-sm
                         flex items-center justify-center gap-2
                         hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Weiterleitung…" : <>Jetzt verbindlich bewerten – CHF 20 <ArrowRight size={15} /></>}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-[#9ca3af] hover:text-ct-cyan transition-colors"
          >
            ← Angaben ändern
          </button>
        </div>
      )}
    </div>
  );
}
