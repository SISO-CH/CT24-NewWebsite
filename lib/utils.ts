import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCHF(amount: number): string {
  return amount.toLocaleString("de-CH");
}

/** Returns the URL locale prefix (e.g. "/fr") for non-default locales, "" for DE. */
export function buildLocalePrefix(locale: string): string {
  return locale && locale !== "de" ? `/${locale}` : "";
}
