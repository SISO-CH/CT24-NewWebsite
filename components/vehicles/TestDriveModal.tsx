// components/vehicles/TestDriveModal.tsx
"use client";

import { useState } from "react";
import { X, Calendar, CheckCircle2 } from "lucide-react";

interface TestDriveModalProps {
  vehicleLabel: string;
  onClose: () => void;
}

export default function TestDriveModal({ vehicleLabel, onClose }: TestDriveModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: phone,
          subject: `[Probefahrt] ${vehicleLabel} – ${date}`,
          message: `Probefahrt-Anfrage für ${vehicleLabel}.\nWunschtermin: ${date}\nTelefon: ${phone}`,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto
                   bg-white rounded-2xl shadow-2xl z-50 p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Probefahrt buchen"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} style={{ color: "var(--ct-cyan)" }} />
              <p className="text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--ct-cyan)" }}>
                Probefahrt buchen
              </p>
            </div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--ct-dark)" }}>
              {vehicleLabel}
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

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={36} style={{ color: "var(--ct-green)" }} />
            <p className="text-base font-bold" style={{ color: "var(--ct-dark)" }}>
              Probefahrt angemeldet!
            </p>
            <p className="text-sm text-[#6b7280]">
              Wir bestätigen Ihren Wunschtermin am <strong>{date}</strong> telefonisch.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ct-cyan)" }}
            >
              Schliessen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required
              type="text"
              placeholder="Ihr Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg
                         focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
            />
            <input
              required
              type="tel"
              placeholder="Telefon *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg
                         focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
            />
            <div>
              <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5 block">
                Wunschtermin *
              </label>
              <input
                required
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg
                           focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                         text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
              style={{ backgroundColor: "var(--ct-cyan)" }}
            >
              {status === "loading" ? "Wird gesendet…" : "Probefahrt anfragen"}
            </button>
            {status === "error" && (
              <p className="text-xs text-center" style={{ color: "var(--ct-magenta)" }}>
                Fehler. Bitte anrufen: +41 56 618 55 44
              </p>
            )}
          </form>
        )}
      </div>
    </>
  );
}
