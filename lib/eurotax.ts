export interface ValuationResult {
  min: number;
  max: number;
  currency: "CHF";
}

export async function getValuation(
  plate: string,
  km: number,
  condition: string
): Promise<ValuationResult> {
  if (!process.env.EUROTAX_API_KEY) {
    // Demo fallback: plausible estimate based on km and condition
    const conditionFactor = condition === "Sehr gut" ? 1.1 : condition === "Gut" ? 1.0 : 0.85;
    const base = Math.max(5000, 35000 - km * 0.2) * conditionFactor;
    return { min: Math.round(base * 0.85), max: Math.round(base * 1.15), currency: "CHF" };
  }

  const apiUrl = process.env.EUROTAX_API_URL ?? "https://api.eurotax.ch/v1";
  const res = await fetch(`${apiUrl}/valuate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.EUROTAX_API_KEY}`,
    },
    body: JSON.stringify({ plate, km, condition }),
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Eurotax API error: ${res.status}`);
  }

  return res.json();
}
