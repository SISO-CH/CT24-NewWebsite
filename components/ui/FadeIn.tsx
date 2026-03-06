"use client";
import { useInView } from "@/hooks/useInView";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none" | "scale";
}

const transforms: Record<string, string> = {
  up: "translateY(24px)",
  down: "translateY(-24px)",
  left: "translateX(-24px)",
  right: "translateX(24px)",
  scale: "scale(0.95)",
  none: "none",
};

export default function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: FadeInProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? direction === "scale" ? "scale(1)" : "translate(0)"
          : transforms[direction],
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
