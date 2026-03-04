"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent, CONSENT_EVENT } from "@/lib/consent";

export default function GTMScript() {
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

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!ready || !gtmId) return null;

  return (
    <>
      <Script id="gtm-script" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
