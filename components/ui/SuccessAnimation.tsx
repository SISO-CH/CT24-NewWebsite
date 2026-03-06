"use client";

export default function SuccessAnimation({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52">
      <circle
        cx="26" cy="26" r="24"
        fill="none" stroke="var(--ct-green)" strokeWidth="2"
        style={{
          strokeDasharray: 166,
          strokeDashoffset: 166,
          animation: "circle-draw 0.6s ease-in-out forwards",
        }}
      />
      <path
        fill="none" stroke="var(--ct-green)" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round"
        d="M14 27l7 7 16-16"
        style={{
          strokeDasharray: 50,
          strokeDashoffset: 50,
          animation: "check-draw 0.3s 0.6s ease-in-out forwards",
        }}
      />
      <style>{`
        @keyframes circle-draw { to { stroke-dashoffset: 0; } }
        @keyframes check-draw { to { stroke-dashoffset: 0; } }
      `}</style>
    </svg>
  );
}
