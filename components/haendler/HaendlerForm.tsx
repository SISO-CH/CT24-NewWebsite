"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

const fieldClass =
  "w-full px-4 py-3 text-sm border border-[#e5e7eb] bg-white text-ct-text placeholder:text-[#9ca3af]" +
  " focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors rounded-sm";

export default function HaendlerForm() {
  const [form, setForm] = useState({
    firma: "", name: "", email: "", phone: "", nachricht: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const message = [
        `Firma: ${form.firma}`,
        "",
        form.nachricht,
      ].join("\n");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: "Händler-Account-Anfrage",
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unbekannter Fehler");
      }
      trackEvent({
        event: "lead_form_submit",
        form_type: "b2b_haendler",
        value: 50,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Senden.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 size={48} className="mb-4" style={{ color: "var(--ct-cyan)" }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--ct-dark)" }}>
          Anfrage gesendet!
        </h3>
        <p className="text-[#6b7280] text-sm max-w-sm">
          Vielen Dank. Wir melden uns innerhalb von 24 Stunden mit Ihren Zugangsdaten.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
            Firma *
          </label>
          <input type="text" required value={form.firma}
            onChange={(e) => setForm({ ...form, firma: e.target.value })}
            placeholder="Autohaus Muster AG" className={fieldClass} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
            Ansprechpartner *
          </label>
          <input type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Max Mustermann" className={fieldClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
            E-Mail *
          </label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="anfrage@autohaus.ch" className={fieldClass} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
            Telefon
          </label>
          <input type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+41 79 000 00 00" className={fieldClass} />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
          Nachricht
        </label>
        <textarea rows={4} value={form.nachricht}
          onChange={(e) => setForm({ ...form, nachricht: e.target.value })}
          placeholder="Welche Fahrzeugtypen interessieren Sie? Wie viele Fahrzeuge kaufen Sie monatlich?"
          className={`${fieldClass} resize-none`} />
      </div>
      <button type="submit" disabled={loading}
        className="flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-sm
                   disabled:opacity-60 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--ct-cyan)" }}>
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Wird gesendet...</>
        ) : (
          <><Send size={15} />Account anfragen</>
        )}
      </button>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </form>
  );
}
