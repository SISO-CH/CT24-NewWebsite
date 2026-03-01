// components/vehicles/VDPContactForm.tsx
"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

interface VDPContactFormProps {
  vehicleLabel: string; // e.g. "VW Golf Variant 1.5 eTSI"
}

export default function VDPContactForm({ vehicleLabel }: VDPContactFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState(
    `Guten Tag, ich interessiere mich für den ${vehicleLabel} und möchte weitere Informationen erhalten.`
  );
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
          email: contact,
          subject: `VDP-Direktanfrage: ${vehicleLabel}`,
          message,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 size={28} style={{ color: "var(--ct-green)" }} />
        <p className="text-sm font-semibold" style={{ color: "var(--ct-dark)" }}>Nachricht gesendet!</p>
        <p className="text-xs text-[#6b7280]">Wir melden uns in der Regel innerhalb von 30 Minuten.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        required
        type="text"
        placeholder="Ihr Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full h-9 px-3 text-sm border border-[#e5e7eb] rounded-lg
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <input
        required
        type="text"
        placeholder="Telefon oder E-Mail *"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        className="w-full h-9 px-3 text-sm border border-[#e5e7eb] rounded-lg
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg resize-none
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                   text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "var(--ct-cyan)" }}
      >
        {status === "loading" ? "Wird gesendet…" : <><Send size={14} /> Nachricht senden</>}
      </button>
      {status === "error" && (
        <p className="text-xs text-center" style={{ color: "var(--ct-magenta)" }}>
          Fehler beim Senden. Bitte rufen Sie uns an: +41 56 618 55 44
        </p>
      )}
    </form>
  );
}
