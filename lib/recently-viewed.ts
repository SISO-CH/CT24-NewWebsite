// lib/recently-viewed.ts
const KEY = "ct24_rv";
const MAX = 5;

export interface RecentVehicle {
  id: number;
  make: string;
  model: string;
  price: number;
  image: string;
}

export function addRecentlyViewed(vehicle: RecentVehicle): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const items: RecentVehicle[] = raw ? JSON.parse(raw) : [];
    // Filter out legacy number entries and duplicates
    const clean = items.filter(
      (v): v is RecentVehicle => typeof v === "object" && v !== null && v.id !== vehicle.id
    );
    const next = [vehicle, ...clean].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* ignore localStorage errors */ }
}

export function getRecentlyViewed(): RecentVehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Handle legacy format (array of numbers)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "number") return [];
    return (parsed as RecentVehicle[]).filter(
      (v): v is RecentVehicle => typeof v === "object" && v !== null && typeof v.id === "number"
    );
  } catch {
    return [];
  }
}

// Backward compat: get just IDs
export function getRecentlyViewedIds(): number[] {
  return getRecentlyViewed().map((v) => v.id);
}
