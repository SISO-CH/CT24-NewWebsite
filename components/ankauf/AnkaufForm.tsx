"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const fieldClass =
  "w-full px-4 py-3 text-sm border border-[#e5e7eb] bg-white text-ct-text placeholder:text-[#9ca3af]" +
  " focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors rounded-sm";

const MAKES = ["Audi","BMW","Citroën","Dacia","Fiat","Ford","Honda","Hyundai",
  "Kia","Mazda","Mercedes-Benz","Nissan","Opel","Peugeot","Renault",
  "Seat","Skoda","Suzuki","Tesla","Toyota","Volkswagen","Volvo","Andere"];

export default function AnkaufForm() {
  const [form, setForm] = useState({
    marke: "", modell: "", jahr: "", kilometer: "",
    name: "", email: "", phone: "", bemerkung: "",
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
        `Fahrzeug: ${form.marke} ${form.modell}`,
        `Jahrgang: ${form.jahr || "–"}`,
        `Kilometerstand: ${form.kilometer ? form.kilometer + " km" : "–"}`,
        form.bemerkung ? `\nBemerkungen: ${form.bemerkung}` : "",
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: "Fahrzeugankauf",
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unbekannter Fehler");
      }
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
          Bewertungsanfrage gesendet!
        </h3>
        <p className="text-[#6b7280] text-sm max-w-sm">
          Wir melden uns innerhalb von 24 Stunden mit einer Bewertung Ihres Fahrzeugs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Marke *</label>
          <select required value={form.marke}
            onChange={(e) => setForm({ ...form, marke: e.target.value })}
            className={fieldClass}>
            <option value="">Marke wählen</option>
            {MAKES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Modell *</label>
          <input type="text" required value={form.modell}
            onChange={(e) => setForm({ ...form, modell: e.target.value })}
            placeholder="z.B. Golf, Corolla" className={fieldClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Jahrgang</label>
          <input type="number" min="1990" max="2026" value={form.jahr}
            onChange={(e) => setForm({ ...form, jahr: e.target.value })}
            placeholder="z.B. 2019" className={fieldClass} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Kilometerstand</label>
          <input type="number" min="0" value={form.kilometer}
            onChange={(e) => setForm({ ...form, kilometer: e.target.value })}
            placeholder="z.B. 85000" className={fieldClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Ihr Name *</label>
          <input type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Max Mustermann" className={fieldClass} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Telefon</label>
          <input type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+41 79 000 00 00" className={fieldClass} />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">E-Mail *</label>
        <input type="email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="max@beispiel.ch" className={fieldClass} />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Bemerkungen (optional)</label>
        <textarea rows={3} value={form.bemerkung}
          onChange={(e) => setForm({ ...form, bemerkung: e.target.value })}
          placeholder="Unfallhistorie, Ausstattung, bekannte Mängel…"
          className={`${fieldClass} resize-none`} />
      </div>
      <button type="submit" disabled={loading}
        className="flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-sm
                   disabled:opacity-60 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--ct-cyan)" }}>
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Wird gesendet…</>
        ) : (
          <><Send size={15} />Bewertung anfragen</>
        )}
      </button>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </form>
  );
}
