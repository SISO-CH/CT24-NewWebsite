"use client";
import Script from "next/script";
import { useConsentGate } from "@/lib/useConsentGate";

export default function MatelsoScript() {
  const ready = useConsentGate("marketing");

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
