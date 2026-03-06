// lib/wishlist.ts
const KEY = "ct24_wishlist";
const MAX = 20;
const WISHLIST_EVENT = "ct24_wishlist_changed";

export interface WishlistVehicle {
  id: number;
  make: string;
  model: string;
  price: number;
  image: string;
}

export function getWishlist(): WishlistVehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WishlistVehicle[]) : [];
  } catch { return []; }
}

export function addToWishlist(vehicle: WishlistVehicle): void {
  if (typeof window === "undefined") return;
  const items = getWishlist();
  if (items.some((v) => v.id === vehicle.id)) return;
  const next = [vehicle, ...items].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function removeFromWishlist(id: number): void {
  if (typeof window === "undefined") return;
  const items = getWishlist().filter((v) => v.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function isInWishlist(id: number): boolean {
  return getWishlist().some((v) => v.id === id);
}

export { WISHLIST_EVENT };
