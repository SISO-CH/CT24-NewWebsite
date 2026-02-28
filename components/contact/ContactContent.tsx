"use client";

import { useState } from "react";
import { Send, CheckCircle2, MapPin, Phone, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  name: string; email: string; phone: string; subject: string; message: string;
}

const SUBJECTS = [
  "Fahrzeuganfrage", "Probefahrt vereinbaren",
  "Eintausch / Ankauf", "Finanzierung / Leasing", "Allgemeine Anfrage",
];

const fieldClass =
  "w-full px-4 py-3 text-sm border border-[#e5e7eb] bg-white text-ct-text placeholder:text-[#9ca3af]" +
  " focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors rounded-sm";

export default function ContactContent() {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", subject: "Fahrzeuganfrage", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { name, email, phone, subject, message } = form;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
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

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Form ── */}
        <div className="lg:col-span-2">
          <div className="border border-[#e5e7eb] p-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--ct-text)" }}>
              Nachricht senden
            </h2>
            <p className="text-[#6b7280] text-sm mb-7">Wir antworten innerhalb von 24 Stunden.</p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 size={48} className="mb-4" style={{ color: "var(--ct-cyan)" }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--ct-text)" }}>
                  Nachricht gesendet!
                </h3>
                <p className="text-[#6b7280] text-sm max-w-sm">
                  Vielen Dank. Wir melden uns innerhalb von 24 Stunden.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "Fahrzeuganfrage", message: "" });
                  }}
                  className="mt-6 text-sm font-semibold transition-colors"
                  style={{ color: "var(--ct-cyan)" }}
                >
                  Neue Nachricht senden
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                      Name *
                    </label>
                    <input type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Max Mustermann" className={fieldClass} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                      E-Mail *
                    </label>
                    <input type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="max@beispiel.ch" className={fieldClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                      Telefon
                    </label>
                    <input type="tel" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+41 79 000 00 00" className={fieldClass} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                      Betreff
                    </label>
                    <select value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className={fieldClass}>
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                    Nachricht *
                  </label>
                  <textarea required rows={5} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Ihre Nachricht an uns…"
                    className={cn(fieldClass, "resize-none")} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-sm disabled:opacity-60 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--ct-cyan)" }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Wird gesendet…
                    </>
                  ) : (
                    <><Send size={15} />Nachricht senden</>
                  )}
                </button>
                {error && (
                  <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Contact info */}
          <div className="border border-[#e5e7eb] p-6">
            <h3 className="font-bold mb-5" style={{ color: "var(--ct-text)" }}>Kontaktdaten</h3>
            <ul className="space-y-4">
              {[
                { icon: MapPin, label: "Adresse",  content: <>Ringstrasse 26<br />5610 Wohlen (Aargau)</> },
                { icon: Phone,  label: "Telefon",  content: <a href="tel:+41566185544" className="hover:text-ct-text transition-colors">+41 56 618 55 44</a> },
                { icon: Mail,   label: "E-Mail",   content: <a href="mailto:info@cartrade24.ch" className="hover:text-ct-text transition-colors">info@cartrade24.ch</a> },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: "var(--ct-light)" }}
                  >
                    <item.icon size={14} style={{ color: "var(--ct-cyan)" }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{item.label}</p>
                    <div className="text-sm text-[#6b7280] mt-0.5">{item.content}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div className="border border-[#e5e7eb] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--ct-text)" }}>
              <Clock size={15} style={{ color: "var(--ct-cyan)" }} />
              Öffnungszeiten
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium" style={{ color: "var(--ct-text)" }}>Mo – Fr</span>
                <div className="text-right text-[#6b7280]">
                  <p>08:30 – 12:00</p>
                  <p>13:00 – 18:30</p>
                </div>
              </div>
              <div className="flex justify-between border-t border-[#f4f4f4] pt-3">
                <span className="font-medium" style={{ color: "var(--ct-text)" }}>Samstag</span>
                <span className="text-[#6b7280]">09:00 – 16:00</span>
              </div>
              <div className="flex justify-between border-t border-[#f4f4f4] pt-3">
                <span className="text-[#9ca3af]">Sonntag</span>
                <span className="text-[#9ca3af]">Geschlossen</span>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="border border-[#e5e7eb] overflow-hidden">
            <div
              className="aspect-[4/3] flex flex-col items-center justify-center gap-3 text-center p-6"
              style={{ backgroundColor: "var(--ct-light)" }}
            >
              <MapPin size={28} style={{ color: "var(--ct-cyan)" }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--ct-text)" }}>Car Trade24 GmbH</p>
                <p className="text-[#6b7280] text-xs mt-0.5">Ringstrasse 26, 5610 Wohlen</p>
              </div>
              <a
                href="https://maps.google.com/?q=Ringstrasse+26,+5610+Wohlen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-white px-4 py-1.5 rounded-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Google Maps öffnen
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Matelso Terminbuchung */}
      <div className="mt-10 pt-10 border-t border-[#e5e7eb]">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-3 text-ct-cyan">
          Termin buchen
        </p>
        <h2 className="text-2xl font-extrabold mb-4 text-ct-dark">
          Direkt einen Termin vereinbaren
        </h2>
        {/* Matelso Widget — Embed-Code aus Matelso-Dashboard einfügen */}
        <div id="matelso-booking-widget" data-matelso-widget="booking" />
      </div>

      {/* Team */}
      <div className="mt-14 pt-10 border-t border-[#e5e7eb]">
        <div className="text-center mb-10">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] mb-2 text-ct-cyan">
            Ihr Ansprechpartner
          </p>
          <h2 className="text-2xl font-bold text-ct-dark">Unser Team</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { code: "VB", name: "Verkaufsberatung", role: "Fahrzeug & Finanzierung",
              desc: "Kompetente Beratung bei Fahrzeugwahl und Finanzierungslösung." },
            { code: "OH", name: "Occasionshandel",  role: "Eintausch & Ankauf",
              desc: "Faire und transparente Bewertung Ihres Fahrzeugs." },
            { code: "KD", name: "Kundendienst",     role: "Service & After-Sales",
              desc: "Persönliche Betreuung auch nach dem Fahrzeugkauf." },
          ].map((m) => (
            <div
              key={m.name}
              className="border border-[#e5e7eb] p-6 text-center hover:border-ct-cyan transition-colors"
            >
              <div
                className="w-14 h-14 mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                {m.code}
              </div>
              <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--ct-text)" }}>
                {m.name}
              </h3>
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--ct-magenta)" }}>
                {m.role}
              </p>
              <p className="text-[#6b7280] text-xs leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
