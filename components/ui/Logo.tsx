import Image from "next/image";

interface LogoProps {
  variant?: "dark" | "light";
  width?: number;
}

// Logo PNG dimensions: 510 × 122 → aspect ≈ 0.239
const ASPECT = 122 / 510;

export default function Logo({ variant = "dark", width = 160 }: LogoProps) {
  const height = Math.round(width * ASPECT);

  // On dark backgrounds the PNG (coloured on transparent) can be used as-is,
  // but the fine details are lost at small sizes. Render a crisp inline text
  // mark instead so both variants are always sharp and legible.
  if (variant === "light") {
    return (
      <div
        className="inline-flex items-center gap-2.5 select-none"
        style={{ height: Math.max(height, 28) }}
        aria-label="Car Trade24"
      >
        {/* Brand icon */}
        <svg
          width={Math.max(height, 28)}
          height={Math.max(height, 28)}
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <rect width="32" height="32" rx="4" fill="#00a0e3" />
          <path
            d="M5 22L8 13H24L27 22"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 22V24H9V22M23 22V24H27V22"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="10" cy="22.5" r="2.2" fill="white" />
          <circle cx="22" cy="22.5" r="2.2" fill="white" />
          <path
            d="M12 13L13.5 9H18.5L20 13"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Wordmark */}
        <span
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: `${Math.round(Math.max(height, 28) * 0.6)}px`,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          Car Trade<span style={{ color: "#e4007d" }}>24</span>
        </span>
      </div>
    );
  }

  // Dark variant: render the actual PNG logo
  return (
    <Image
      src="/logo.png"
      alt="Car Trade24"
      width={width}
      height={height}
      style={{ objectFit: "contain" }}
    />
  );
}
