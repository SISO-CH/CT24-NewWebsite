"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

interface Props {
  filtersJson?: string;
}

export default function PriceAlertForm({ filtersJson }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/price-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), filtersJson }),
      });
      const ok = res.ok;
      if (ok) {
        trackEvent({
          event: "lead_form_submit",
          form_type: "price_alert",
          value: 50,
        });
      }
      setState(ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl border border-[var(--ct-cyan)]/30 bg-[var(--ct-light)] p-5 text-center">
        <Bell size={20} className="mx-auto mb-2 text-[var(--ct-cyan)]" />
        <p className="text-sm font-semibold text-[var(--ct-dark)]">Preisalarm aktiviert!</p>
        <p className="text-xs text-[#6b7280] mt-1">Sie erhalten eine Bestätigungs-E-Mail.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e5e7eb] p-5 bg-white">
      <div className="flex items-start gap-2 mb-3">
        <Bell size={16} className="text-[var(--ct-cyan)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[var(--ct-dark)]">Preisalarm</p>
          <p className="text-xs text-[#6b7280] leading-relaxed">
            Benachrichtigt werden, wenn ein passendes Fahrzeug verfügbar ist.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Ihre E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl
                     focus:outline-none focus:border-[var(--ct-cyan)] transition-colors"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="px-4 py-2 text-white text-sm font-semibold rounded-xl
                     hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "var(--ct-cyan)" }}
        >
          {state === "loading" ? "…" : "Aktivieren"}
        </button>
      </form>
      {state === "error" && (
        <p className="text-xs mt-2" style={{ color: "var(--ct-magenta)" }}>
          Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
        </p>
      )}
    </div>
  );
}
