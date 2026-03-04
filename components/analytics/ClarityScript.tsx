"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent, CONSENT_EVENT } from "@/lib/consent";

export default function ClarityScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasConsent("analytics")) {
      setReady(true);
      return;
    }
    const handler = () => {
      if (hasConsent("analytics")) setReady(true);
    };
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!ready || !clarityId) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
    </Script>
  );
}
