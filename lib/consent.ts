// lib/consent.ts

export interface ConsentPreferences {
  analytics: boolean;    // GA4, Clarity
  marketing: boolean;    // GTM marketing tags, Matelso
  errorTracking: boolean; // Sentry
}

const CONSENT_KEY = "ct24_consent";
const CONSENT_EVENT = "ct24_consent_changed";

const ALL_GRANTED: ConsentPreferences = { analytics: true, marketing: true, errorTracking: true };
const ALL_DENIED: ConsentPreferences = { analytics: false, marketing: false, errorTracking: false };

/** Read stored preferences. Returns null if user hasn't decided yet. */
export function getConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CONSENT_KEY);
  if (!raw) return null;

  // Migrate legacy binary value
  if (raw === "accepted") return ALL_GRANTED;
  if (raw === "declined") return ALL_DENIED;

  try {
    return JSON.parse(raw) as ConsentPreferences;
  } catch {
    return null;
  }
}

/** Persist preferences and notify listeners. */
export function setConsent(prefs: ConsentPreferences): void {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Accept all categories. */
export function acceptAll(): void {
  setConsent(ALL_GRANTED);
}

/** Decline all optional categories. */
export function declineAll(): void {
  setConsent(ALL_DENIED);
}

/** Check if a specific category is granted. */
export function hasConsent(category: keyof ConsentPreferences): boolean {
  const prefs = getConsent();
  return prefs?.[category] ?? false;
}

export { CONSENT_EVENT, ALL_GRANTED, ALL_DENIED };
