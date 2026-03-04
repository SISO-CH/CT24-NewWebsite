"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed, type RecentVehicle } from "@/lib/recently-viewed";

export default function RecentlyViewedFlyout() {
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState<RecentVehicle[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVehicles(getRecentlyViewed());
  }, []);

  // Refresh list when flyout opens (user may have visited new vehicles)
  useEffect(() => {
    if (open) setVehicles(getRecentlyViewed());
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (vehicles.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-ct-light transition-colors text-[#374151]"
        aria-label="Zuletzt angesehen"
      >
        <Clock size={18} />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-ct-cyan
                         text-white text-[9px] font-bold flex items-center justify-center">
          {vehicles.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl
                        shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#e5e7eb]
                        z-50 overflow-hidden">
          <p className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#9ca3af]
                        border-b border-[#f0f0f0]">
            Zuletzt angesehen
          </p>
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/autos/${v.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-ct-light transition-colors"
            >
              <div className="relative w-14 h-10 rounded-md overflow-hidden bg-[#f8f8f8] shrink-0">
                <Image
                  src={v.image || "/images/placeholder.webp"}
                  alt={`${v.make} ${v.model}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ct-dark truncate">
                  {v.make} {v.model}
                </p>
                <p className="text-xs text-[#6b7280]">
                  CHF {v.price.toLocaleString("de-CH")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
