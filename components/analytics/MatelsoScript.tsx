"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent, CONSENT_EVENT } from "@/lib/consent";

export default function MatelsoScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasConsent("marketing")) {
      setReady(true);
      return;
    }
    const handler = () => {
      if (hasConsent("marketing")) setReady(true);
    };
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  const matelsoId = process.env.NEXT_PUBLIC_MATELSO_ID;
  if (!ready || !matelsoId) return null;

  return (
    <Script
      id="matelso-dni"
      src="https://t.matelso.com/js/matelso.min.js"
      data-matelso-id={matelsoId}
      strategy="afterInteractive"
    />
  );
}
