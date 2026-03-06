"use client";

import { useState } from "react";
import { X, ArrowLeftRight, Send, CheckCircle2, Loader2 } from "lucide-react";
import { trackEvent, conversionValue } from "@/lib/tracking";

interface TradeInModalProps {
  targetVehicleLabel: string;
  targetVehicleId: number;
  onClose: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - i);

const CONDITIONS = ["Sehr gut", "Gut", "Befriedigend", "Beschädigt"] as const;

interface EstimateResult {
  estimate: number;
  method: "market" | "ai" | "error";
  similarCount: number;
}

function formatSwissCHF(n: number): string {
  return n.toLocaleString("de-CH");
}

export default function TradeInModal({
  targetVehicleLabel,
  targetVehicleId,
  onClose,
}: TradeInModalProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(CURRENT_YEAR - 3));
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState<string>("Gut");

  const [estimateStatus, setEstimateStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [result, setResult] = useState<EstimateResult | null>(null);

  // Contact form state (after estimate)
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [sendStatus, setSendStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleEstimate(e: React.FormEvent) {
    e.preventDefault();
    setEstimateStatus("loading");
    try {
      const res = await fetch("/api/trade-in/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model, year, mileage: Number(mileage), condition }),
      });
      if (!res.ok) throw new Error("API error");
      const data: EstimateResult = await res.json();
      setResult(data);
      setEstimateStatus("done");

      trackEvent({
        event: "lead_form_submit",
        form_type: "trade_in_estimate",
        vehicle_id: targetVehicleId,
        value: conversionValue(data.estimate),
      });
    } catch {
      setEstimateStatus("error");
    }
  }

  async function handleSendInquiry(e: React.FormEvent) {
    e.preventDefault();
    setSendStatus("loading");
    try {
      const tradeInInfo = `${make} ${model}, Jg. ${year}, ${Number(mileage).toLocaleString("de-CH")} km, Zustand: ${condition}`;
      const estimateInfo = result
        ? `Geschätzer Wert: CHF ${formatSwissCHF(result.estimate)}`
        : "";

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: contact,
          subject: `Inzahlungnahme-Anfrage: ${targetVehicleLabel}`,
          message: [
            `Zielfahrzeug: ${targetVehicleLabel}`,
            `Inzahlungnahme-Fahrzeug: ${tradeInInfo}`,
            estimateInfo,
            "",
            "Bitte kontaktieren Sie mich für ein verbindliches Angebot.",
          ].join("\n"),
        }),
      });
      setSendStatus(res.ok ? "success" : "error");
    } catch {
      setSendStatus("error");
    }
  }

  const inputClass =
    "w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors";
  const selectClass =
    "w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg bg-white focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 sm:inset-x-4 sm:inset-y-auto sm:top-1/2 sm:-translate-y-1/2
                   max-w-md sm:mx-auto bg-white sm:rounded-2xl shadow-2xl z-50 p-6
                   overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Inzahlungnahme"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ArrowLeftRight size={16} style={{ color: "var(--ct-cyan)" }} />
              <p
                className="text-[0.65rem] font-bold uppercase tracking-wider"
                style={{ color: "var(--ct-cyan)" }}
              >
                Inzahlungnahme
              </p>
            </div>
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--ct-dark)" }}
            >
              {targetVehicleLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-ct-light transition-colors text-[#9ca3af]"
            aria-label="Schliessen"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success state */}
        {sendStatus === "success" ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 size={28} style={{ color: "var(--ct-green)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--ct-dark)" }}>
              Anfrage gesendet!
            </p>
            <p className="text-xs text-[#6b7280]">
              Wir melden uns in der Regel innerhalb von 30 Minuten mit einem
              verbindlichen Angebot.
            </p>
          </div>
        ) : (
          <>
            {/* Estimate form */}
            {estimateStatus !== "done" && (
              <form onSubmit={handleEstimate} className="space-y-3">
                <p className="text-xs text-[#6b7280] mb-1">
                  Beschreiben Sie Ihr aktuelles Fahrzeug:
                </p>
                <input
                  required
                  type="text"
                  placeholder="Marke (z.B. VW, BMW) *"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className={inputClass}
                />
                <input
                  required
                  type="text"
                  placeholder="Modell (z.B. Golf, X1) *"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Jahrgang *
                    </option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    type="number"
                    placeholder="km-Stand *"
                    min={0}
                    max={500000}
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <select
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className={selectClass}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      Zustand: {c}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={estimateStatus === "loading"}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                             text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: "var(--ct-cyan)" }}
                >
                  {estimateStatus === "loading" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Wird geschätzt...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight size={14} />
                      Wert schätzen
                    </>
                  )}
                </button>

                {estimateStatus === "error" && (
                  <p
                    className="text-xs text-center"
                    style={{ color: "var(--ct-magenta)" }}
                  >
                    Fehler bei der Schätzung. Bitte versuchen Sie es erneut.
                  </p>
                )}
              </form>
            )}

            {/* Estimate result + contact form */}
            {estimateStatus === "done" && result && (
              <div className="space-y-4">
                {/* Estimate display */}
                <div className="rounded-xl bg-ct-light p-4 text-center">
                  <p className="text-xs text-[#6b7280] mb-1">
                    Geschätzter Inzahlungnahme-Wert
                  </p>
                  <p
                    className="text-3xl font-black"
                    style={{ color: "var(--ct-green)" }}
                  >
                    CHF {formatSwissCHF(result.estimate)}
                  </p>
                  <p className="text-[10px] text-[#9ca3af] mt-1">
                    (unverbindliche Schätzung basierend auf{" "}
                    {result.method === "market"
                      ? `${result.similarCount} aktuellen Marktdaten`
                      : "KI-Bewertung"}
                    )
                  </p>
                </div>

                {/* Trade-in vehicle summary */}
                <div className="text-xs text-[#6b7280] border-t border-[#f0f0f0] pt-3">
                  <p className="font-semibold text-ct-dark mb-1">
                    Ihr Fahrzeug:
                  </p>
                  <p>
                    {make} {model}, Jg. {year},{" "}
                    {Number(mileage).toLocaleString("de-CH")} km, {condition}
                  </p>
                </div>

                {/* Contact form to send inquiry */}
                <form onSubmit={handleSendInquiry} className="space-y-3">
                  <p className="text-xs text-[#6b7280]">
                    Für ein verbindliches Angebot:
                  </p>
                  <input
                    required
                    type="text"
                    placeholder="Ihr Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    required
                    type="text"
                    placeholder="Telefon oder E-Mail *"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={sendStatus === "loading"}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                               text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: "var(--ct-cyan)" }}
                  >
                    {sendStatus === "loading" ? (
                      "Wird gesendet..."
                    ) : (
                      <>
                        <Send size={14} />
                        Jetzt Anfrage senden
                      </>
                    )}
                  </button>
                  {sendStatus === "error" && (
                    <p
                      className="text-xs text-center"
                      style={{ color: "var(--ct-magenta)" }}
                    >
                      Fehler beim Senden. Bitte rufen Sie uns an: +41 56 618 55
                      44
                    </p>
                  )}
                </form>

                {/* Back button to re-estimate */}
                <button
                  type="button"
                  onClick={() => {
                    setEstimateStatus("idle");
                    setResult(null);
                  }}
                  className="w-full text-xs text-[#9ca3af] hover:text-ct-cyan transition-colors py-1"
                >
                  Andere Angaben eingeben
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
