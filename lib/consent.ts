// lib/consent.ts
export const CONSENT_KEY = "ct24_consent";
export type ConsentState = "accepted" | "declined" | null;

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(CONSENT_KEY) as ConsentState) ?? null;
}

export function setConsent(state: "accepted" | "declined"): void {
  localStorage.setItem(CONSENT_KEY, state);
  // Custom Event damit andere Komponenten reagieren können
  window.dispatchEvent(new Event("ct24_consent_changed"));
}

export function hasConsent(): boolean {
  return getConsent() === "accepted";
}
