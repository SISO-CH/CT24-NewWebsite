// lib/recently-viewed.ts
const KEY = "ct24_rv";
const MAX = 5;

export function addRecentlyViewed(id: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw  = localStorage.getItem(KEY);
    const ids  = raw ? (JSON.parse(raw) as number[]) : [];
    const next = [id, ...ids.filter((i) => i !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* ignoriere localStorage-Fehler */ }
}

export function getRecentlyViewed(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}
