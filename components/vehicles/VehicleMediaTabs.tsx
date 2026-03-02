"use client";

import { useState, useEffect } from "react";
import { Images, RotateCcw, Play } from "lucide-react";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import View360 from "@/components/vehicles/View360";
import VideoWalkaround from "@/components/vehicles/VideoWalkaround";

interface Props {
  images:       string[];
  imageUrl360?: string;
  videoUrl?:    string;
  alt:          string;
}

export default function VehicleMediaTabs({ images, imageUrl360, videoUrl, alt }: Props) {
  const [tab, setTab] = useState<"gallery" | "360" | "video">("gallery");

  useEffect(() => {
    // Use functional form so `tab` is read inside the setter, not as a dep
    setTab((current) => {
      if (!imageUrl360 && current === "360")   return "gallery";
      if (!videoUrl    && current === "video") return "gallery";
      return current;
    });
  }, [imageUrl360, videoUrl]);

  const tabs = [
    { key: "gallery" as const, label: "Fotos",        Icon: Images    },
    ...(imageUrl360 ? [{ key: "360"   as const, label: "360°-Ansicht", Icon: RotateCcw }] : []),
    ...(videoUrl    ? [{ key: "video" as const, label: "Video",        Icon: Play      }] : []),
  ];

  return (
    <div>
      {(imageUrl360 || videoUrl) && (
        <div className="flex gap-1 mb-3">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === key
                  ? "bg-ct-cyan text-white"
                  : "bg-ct-light text-ct-gray hover:bg-ct-border"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      )}
      {tab === "gallery" && <VehicleGallery images={images} alt={alt} />}
      {tab === "360"     && imageUrl360 && <View360 src={imageUrl360} alt={alt} />}
      {tab === "video"   && videoUrl    && <VideoWalkaround url={videoUrl} />}
    </div>
  );
}
