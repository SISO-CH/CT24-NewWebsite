"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent } from "@/lib/consent";

export default function MatelsoScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasConsent()) { setReady(true); return; }
    const handler = () => { if (hasConsent()) setReady(true); };
    window.addEventListener("ct24_consent_changed", handler);
    return () => window.removeEventListener("ct24_consent_changed", handler);
  }, []);

  const matelsoId = process.env.NEXT_PUBLIC_MATELSO_ID;
  if (!ready || !matelsoId) return null;

  // Script-URL + data-Attribute ggf. laut Matelso-Dashboard anpassen
  return (
    <Script
      id="matelso-dni"
      src="https://t.matelso.com/js/matelso.min.js"
      data-matelso-id={matelsoId}
      strategy="afterInteractive"
    />
  );
}
