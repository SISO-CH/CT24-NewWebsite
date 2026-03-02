"use client";

import dynamic from "next/dynamic";

// react-pannellum has no SSR support — types provided via types/react-pannellum.d.ts
const ReactPannellum = dynamic(() => import("react-pannellum"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-xl bg-ct-light animate-pulse flex items-center justify-center"
      style={{ height: 400 }}
    >
      <p className="text-[#9ca3af] text-sm">360°-Ansicht wird geladen...</p>
    </div>
  ),
});

interface Props {
  src: string;
  alt?: string;
}

export default function View360({ src, alt }: Props) {
  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ height: 400 }} aria-label={alt ?? "360°-Fahrzeugansicht"} role="img">
      <ReactPannellum
        id="view360"
        sceneId="mainScene"
        imageSource={src}
        style={{ width: "100%", height: "100%" }}
        config={{ autoLoad: true, showControls: true, hfov: 100 }}
      />
    </div>
  );
}
