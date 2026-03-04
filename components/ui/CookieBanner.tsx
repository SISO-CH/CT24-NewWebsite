"use client";
import { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";
import {
  getConsent,
  acceptAll,
  declineAll,
  setConsent,
  type ConsentPreferences,
} from "@/lib/consent";

const CATEGORIES: { key: keyof ConsentPreferences; label: string; desc: string }[] = [
  { key: "analytics",     label: "Analyse",         desc: "Google Analytics, Microsoft Clarity — Besucherverhalten, Heatmaps" },
  { key: "marketing",     label: "Marketing",       desc: "Google Tag Manager, Matelso — Anruftracking, Kampagnen-Attribution" },
  { key: "errorTracking", label: "Fehler-Tracking",  desc: "Sentry — automatische Fehlererkennung für bessere Stabilität" },
];

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>({
    analytics: false,
    marketing: false,
    errorTracking: false,
  });

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const close = () => setVisible(false);

  const handleAcceptAll = () => {
    acceptAll();
    close();
  };

  const handleDeclineAll = () => {
    declineAll();
    close();
  };

  const handleSaveSettings = () => {
    setConsent(prefs);
    close();
  };

  const toggle = (key: keyof ConsentPreferences) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-[#e5e7eb]
                    shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-[#4b5563] max-w-2xl leading-relaxed">
            Wir verwenden Cookies und Tracking-Technologien, um Ihr Erlebnis zu verbessern und
            unsere Dienste zu optimieren.{" "}
            <a href="/datenschutz" className="underline hover:text-ct-cyan transition-colors">
              Datenschutzrichtlinie
            </a>
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDeclineAll}
              className="px-4 py-2 text-sm font-semibold border border-[#e5e7eb] rounded-lg
                         text-[#6b7280] hover:bg-ct-light transition-colors"
            >
              Nur notwendige
            </button>
            <button
              type="button"
              onClick={() => setShowSettings((s) => !s)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-[#e5e7eb]
                         rounded-lg text-[#6b7280] hover:bg-ct-light transition-colors"
            >
              {showSettings ? <X size={14} /> : <Settings size={14} />}
              Einstellungen
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-ct-cyan
                         hover:opacity-90 transition-opacity"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
            {/* Essential (always on) */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-ct-dark">Notwendig</p>
                <p className="text-xs text-[#9ca3af]">Website-Grundfunktionen — immer aktiv</p>
              </div>
              <div className="w-11 h-6 bg-ct-cyan rounded-full relative opacity-60 cursor-not-allowed">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
              </div>
            </div>

            {/* Toggleable categories */}
            {CATEGORIES.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-ct-dark">{label}</p>
                  <p className="text-xs text-[#9ca3af]">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    prefs[key] ? "bg-ct-cyan" : "bg-[#d1d5db]"
                  }`}
                  role="switch"
                  aria-checked={prefs[key]}
                  aria-label={label}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      prefs[key] ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}

            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-ct-dark
                           hover:opacity-90 transition-opacity"
              >
                Einstellungen speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
