"use client";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import type { WishlistVehicle } from "@/lib/wishlist";

interface Props {
  vehicle: WishlistVehicle;
  size?: number;
  className?: string;
}

export default function WishlistHeart({ vehicle, size = 18, className = "" }: Props) {
  const { toggle, isInWishlist } = useWishlist();
  const active = isInWishlist(vehicle.id);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(vehicle); }}
      className={`p-2 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
        active ? "bg-white/90 text-[var(--ct-magenta)]" : "bg-black/30 text-white hover:bg-black/50"
      } ${className}`}
      aria-label={active ? "Von Merkliste entfernen" : "Zur Merkliste hinzufugen"}
    >
      <Heart size={size} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
