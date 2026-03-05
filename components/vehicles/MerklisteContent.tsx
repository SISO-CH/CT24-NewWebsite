"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/hooks/useWishlist";
import { removeFromWishlist } from "@/lib/wishlist";

export default function MerklisteContent() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-20">
        <Heart size={48} className="text-[#d1d5db] mb-4" />
        <h2 className="text-xl font-bold text-ct-dark mb-2">Noch keine Fahrzeuge gemerkt</h2>
        <p className="text-sm text-[#6b7280] mb-6">
          Klicken Sie auf das Herz-Symbol bei einem Fahrzeug, um es hier zu speichern.
        </p>
        <Link
          href="/autos"
          className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--ct-cyan)" }}
        >
          Fahrzeuge ansehen
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((v) => (
        <div key={v.id} className="rounded-xl border border-[#e5e7eb] overflow-hidden bg-white shadow-sm">
          <Link href={`/autos/${v.id}`}>
            <div className="relative aspect-[4/3] bg-[#f4f6f8]">
              <Image
                src={v.image || "/images/placeholder.webp"}
                alt={`${v.make} ${v.model}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </Link>
          <div className="p-4">
            <Link
              href={`/autos/${v.id}`}
              className="font-bold text-ct-dark hover:text-[var(--ct-cyan)] transition-colors"
            >
              {v.make} {v.model}
            </Link>
            <p className="text-lg font-black text-ct-dark mt-1">
              CHF {v.price.toLocaleString("de-CH")}
            </p>
            <button
              type="button"
              onClick={() => removeFromWishlist(v.id)}
              className="mt-3 text-xs text-[#9ca3af] hover:text-[var(--ct-magenta)] transition-colors"
            >
              Entfernen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
