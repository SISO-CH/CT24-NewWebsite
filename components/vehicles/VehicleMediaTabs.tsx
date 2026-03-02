"use client";

import { useState } from "react";
import { Images, RotateCcw } from "lucide-react";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import View360 from "@/components/vehicles/View360";

interface Props {
  images:       string[];
  imageUrl360?: string;
  alt:          string;
}

export default function VehicleMediaTabs({ images, imageUrl360, alt }: Props) {
  const [tab, setTab] = useState<"gallery" | "360">("gallery");

  return (
    <div>
      {imageUrl360 && (
        <div className="flex gap-1 mb-3">
          {([
            { key: "gallery" as const, label: "Fotos",        Icon: Images    },
            { key: "360"     as const, label: "360°-Ansicht", Icon: RotateCcw },
          ]).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === key
                  ? "bg-ct-cyan text-white"
                  : "bg-ct-light text-[#6b7280] hover:bg-[#e5e7eb]"
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
    </div>
  );
}
