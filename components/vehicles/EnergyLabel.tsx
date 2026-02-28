import type { EnergyLabel as EnergyLabelType } from "@/lib/vehicles";

interface EnergyLabelProps {
  label: EnergyLabelType;
  size?: "sm" | "md" | "lg";
}

const COLORS: Record<EnergyLabelType, { bg: string; text: string }> = {
  A: { bg: "var(--ee-a)", text: "#ffffff" },
  B: { bg: "var(--ee-b)", text: "#ffffff" },
  C: { bg: "var(--ee-c)", text: "#111111" },
  D: { bg: "var(--ee-d)", text: "#111111" },
  E: { bg: "var(--ee-e)", text: "#111111" },
  F: { bg: "var(--ee-f)", text: "#ffffff" },
  G: { bg: "var(--ee-g)", text: "#ffffff" },
};

const SIZES = {
  sm: { height: "20px", fontSize: "11px", paddingRight: "18px" },
  md: { height: "26px", fontSize: "13px", paddingRight: "22px" },
  lg: { height: "34px", fontSize: "16px", paddingRight: "28px" },
};

/**
 * EU energy-efficiency label badge.
 * Arrow (chevron-right) shape via clip-path — matches the official EU label design.
 */
export default function EnergyLabel({ label, size = "sm" }: EnergyLabelProps) {
  const { bg, text } = COLORS[label];
  const { height, fontSize, paddingRight } = SIZES[size];

  return (
    <span
      title={`Energieeffizienzklasse ${label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: bg,
        color: text,
        height,
        fontSize,
        fontWeight: 700,
        paddingLeft: "8px",
        paddingRight,
        clipPath:
          "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)",
        letterSpacing: "0.03em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
