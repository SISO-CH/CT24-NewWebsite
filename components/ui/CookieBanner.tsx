"use client";
import { useEffect, useState } from "react";
import { getConsent, setConsent, type ConsentState } from "@/lib/consent";

export default function CookieBanner() {
  const [consent, setConsentState] = useState<ConsentState>("accepted"); // optimistic: versteckt

  useEffect(() => {
    setConsentState(getConsent()); // null = noch nicht entschieden → Banner zeigen
  }, []);

  if (consent !== null) return null; // bereits entschieden

  const accept = () => {
    setConsent("accepted");
    setConsentState("accepted");
  };

  const decline = () => {
    setConsent("declined");
    setConsentState("declined");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-[#e5e7eb]
                    shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4
                      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-[#4b5563] max-w-2xl leading-relaxed">
          Wir verwenden Cookies für Analyse und Tracking (Google Analytics, Matelso).{" "}
          <a href="/datenschutz" className="underline hover:text-ct-cyan transition-colors">
            Datenschutzrichtlinie
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={decline}
            className="px-5 py-2 text-sm font-semibold border border-[#e5e7eb] rounded-lg
                       text-[#6b7280] hover:bg-ct-light transition-colors">
            Ablehnen
          </button>
          <button
            type="button"
            onClick={accept}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-ct-cyan
                       hover:opacity-90 transition-opacity">
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
