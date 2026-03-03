import Anthropic from "@anthropic-ai/sdk";
import type { Vehicle } from "@/lib/vehicles";

let _client: Anthropic | null = null;
export function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export async function generateVehicleMeta(
  vehicle: Vehicle
): Promise<{ description: string; keywords: string[] }> {
  const fallback = {
    description: `${vehicle.make} ${vehicle.model}${vehicle.variant ? " " + vehicle.variant : ""}, ${vehicle.year}, ${vehicle.mileage.toLocaleString("de-CH")} km — CHF ${vehicle.price.toLocaleString("de-CH")} bei Car Trade24, Wohlen`,
    keywords:    [vehicle.make, vehicle.model, vehicle.fuel ?? "", vehicle.body ?? "", "Occasion Schweiz", "Car Trade24"].filter(Boolean),
  };

  if (!process.env.ANTHROPIC_API_KEY) return fallback;

  try {
    const response = await getClient().messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system:     "Antworte ausschliesslich mit validem JSON. Kein Markdown, kein Kommentar.",
      messages: [{
        role:    "user",
        content: `Erstelle fuer dieses Fahrzeug eine SEO-Meta-Description (max. 155 Zeichen, Deutsch) und 5 Keywords.
Fahrzeug: ${vehicle.make} ${vehicle.model}${vehicle.variant ? " " + vehicle.variant : ""}, ${vehicle.year}, ${vehicle.mileage} km, CHF ${vehicle.price}, ${vehicle.fuel ?? ""}, ${vehicle.body ?? ""}, Wohlen Schweiz
Format: {"description":"...","keywords":["...","...","...","...","..."]}`,
      }],
    });

    const first = response.content[0];
    if (first.type !== "text") return fallback;

    const parsed = JSON.parse(first.text.trim()) as typeof fallback;
    if (
      typeof parsed.description === "string" &&
      Array.isArray(parsed.keywords) &&
      parsed.keywords.every((k: unknown) => typeof k === "string")
    ) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
