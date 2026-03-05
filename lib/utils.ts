import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCHF(amount: number): string {
  return amount.toLocaleString("de-CH");
}

/** Annuity formula for indicative monthly leasing rate. */
const LEASING_ANNUAL_RATE = 0.039;
const LEASING_DEFAULT_MONTHS = 60;

export function calcMonthlyRate(
  price: number,
  downPct = 0,
  months = LEASING_DEFAULT_MONTHS,
  residualPct = 0,
): number {
  const residualAmount = price * (residualPct / 100);
  const financed = price * (1 - downPct / 100) - residualAmount;
  const r = LEASING_ANNUAL_RATE / 12;
  if (r === 0) return financed / months;
  return financed * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** Returns the URL locale prefix (e.g. "/fr") for non-default locales, "" for DE. */
export function buildLocalePrefix(locale: string): string {
  return locale && locale !== "de" ? `/${locale}` : "";
}
