"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  WISHLIST_EVENT,
  type WishlistVehicle,
} from "@/lib/wishlist";

export function useWishlist() {
  const [items, setItems] = useState<WishlistVehicle[]>([]);

  useEffect(() => {
    setItems(getWishlist());
    const handler = () => setItems(getWishlist());
    window.addEventListener(WISHLIST_EVENT, handler);
    return () => window.removeEventListener(WISHLIST_EVENT, handler);
  }, []);

  const toggle = useCallback((vehicle: WishlistVehicle) => {
    if (isInWishlist(vehicle.id)) {
      removeFromWishlist(vehicle.id);
    } else {
      addToWishlist(vehicle);
    }
  }, []);

  const isInList = useCallback(
    (id: number) => items.some((v) => v.id === id),
    [items],
  );

  return { items, toggle, isInWishlist: isInList };
}
