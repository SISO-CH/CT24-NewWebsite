"use client";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

interface Props {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({ target, duration = 1500, prefix = "", suffix = "", className = "" }: Props) {
  const { ref, inView } = useInView();
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView || done) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        setDone(true);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, done, target, duration]);

  return <span ref={ref} className={className}>{prefix}{count.toLocaleString("de-CH")}{suffix}</span>;
}
