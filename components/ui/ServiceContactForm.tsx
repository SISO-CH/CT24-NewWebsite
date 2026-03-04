"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

interface Props {
  subject: string;
  fields?: string[];
}

export default function ServiceContactForm({ subject, fields = [] }: Props) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");
  const [extras,  setExtras]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      setError("Bitte E-Mail oder Telefon angeben.");
      return;
    }
    setLoading(true);
    setError(null);

    const extraText   = Object.entries(extras).map(([k, v]) => `${k}: ${v}`).join("\n");
    const fullMessage = extraText ? `${extraText}\n\n${message}` : message;
    if (!fullMessage.trim()) {
      setLoading(false);
      setError("Bitte eine Nachricht oder die Felder oben ausfüllen.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, phone, subject, message: fullMessage }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Fehler");
      }
      trackEvent({
        event: "lead_form_submit",
        form_type: "service",
        value: 50,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-ct-light border border-[#e5e7eb] p-8 text-center">
        <p className="text-2xl mb-2">✓</p>
        <p className="font-semibold text-ct-dark">Anfrage erhalten!</p>
        <p className="text-sm text-[#6b7280] mt-1">Wir melden uns so schnell wie möglich bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg">
      {fields.map((label) => (
        <div key={label}>
          <label className="block text-sm font-semibold text-ct-dark mb-1.5">{label}</label>
          <input
            type="text"
            value={extras[label] ?? ""}
            onChange={(e) => setExtras((x) => ({ ...x, [label]: e.target.value }))}
            className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-ct-cyan/30 focus:border-ct-cyan"
          />
        </div>
      ))}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-ct-dark mb-1.5">Name *</label>
          <input
            required type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-ct-cyan/30 focus:border-ct-cyan"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ct-dark mb-1.5">E-Mail</label>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-ct-cyan/30 focus:border-ct-cyan"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-ct-dark mb-1.5">Telefon <span className="text-[#9ca3af] font-normal">(E-Mail oder Telefon erforderlich)</span></label>
        <input
          type="tel" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ct-cyan/30 focus:border-ct-cyan"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ct-dark mb-1.5">Nachricht</label>
        <textarea
          rows={4} value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-ct-cyan/30 focus:border-ct-cyan"
        />
      </div>
      {error && <p className="text-ct-magenta text-sm">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-ct-cyan text-white font-semibold text-sm
                   hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Senden..." : <><span>Anfrage senden</span><ArrowRight size={15} /></>}
      </button>
    </form>
  );
}
