"use client";

import { useEffect, useState } from "react";
import { hasConsent, CONSENT_EVENT, type ConsentPreferences } from "@/lib/consent";

/**
 * Returns true once the user has granted consent for the given category.
 * Listens for consent changes so scripts load immediately after opt-in.
 */
export function useConsentGate(category: keyof ConsentPreferences): boolean {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (hasConsent(category)) {
      setGranted(true);
      return;
    }
    const handler = () => {
      if (hasConsent(category)) setGranted(true);
    };
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return granted;
}
