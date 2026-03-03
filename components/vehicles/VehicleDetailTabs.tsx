"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface TechSpec {
  label: string;
  value: string;
}

interface Props {
  description?: string;
  equipment?: string[];
  techSpecs: TechSpec[];
}

type TabKey = "specs" | "description" | "equipment";

export default function VehicleDetailTabs({ description, equipment, techSpecs }: Props) {
  const tabs: { key: TabKey; label: string; available: boolean }[] = [
    { key: "specs",       label: "Technische Daten", available: techSpecs.length > 0 },
    { key: "description", label: "Beschreibung",     available: !!description },
    { key: "equipment",   label: "Ausstattung",      available: !!equipment && equipment.length > 0 },
  ];

  const availableTabs = tabs.filter((t) => t.available);
  const [active, setActive] = useState<TabKey>(availableTabs[0]?.key ?? "specs");

  if (availableTabs.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#f0f0f0] overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-2 p-3 bg-ct-light border-b border-[#f0f0f0]">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              active === tab.key
                ? "bg-ct-cyan text-white shadow-sm"
                : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:border-ct-cyan hover:text-ct-cyan"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {active === "specs" && (
          <div className="divide-y divide-[#f8f8f8] -mx-6 -mt-6 -mb-6">
            {techSpecs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between px-6 py-3 hover:bg-[#fafafa] transition-colors"
              >
                <span className="text-sm text-[#9ca3af]">{spec.label}</span>
                <span className="text-sm font-semibold text-ct-dark">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {active === "description" && description && (
          <p className="text-sm text-[#4b5563] leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}

        {active === "equipment" && equipment && equipment.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {equipment.map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm text-[#4b5563]">
                <CheckCircle2 size={13} className="shrink-0 text-ct-green" />
                {item}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
