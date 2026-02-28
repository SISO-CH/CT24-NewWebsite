import Anthropic from "@anthropic-ai/sdk";
import type { Vehicle } from "@/lib/vehicles";

// Lazy singleton — instantiated only after ANTHROPIC_API_KEY is confirmed present,
// so importing this module never crashes in envs without the key set.
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

// Strip newlines to prevent prompt structure breakage from malicious data
function s(value: string | undefined | null, maxLen = 80): string {
  if (!value) return "";
  return value.replace(/[\r\n]+/g, " ").slice(0, maxLen);
}

export async function generateSalespitch(
  vehicle: Vehicle
): Promise<string | undefined> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return undefined;
  }

  const {
    make,
    model,
    variant,
    year,
    mileage,
    power,
    transmission,
    fuel,
    price,
    leasingPrice,
    body,
    color,
    drivetrain,
    energyLabel,
    equipment,
  } = vehicle;

  const safeEquipment = equipment
    ?.slice(0, 5)
    .map((e) => s(e, 40))
    .filter(Boolean);

  const userMessage = `Schreibe einen persönlichen, ehrlichen Verkäufertext über dieses Fahrzeug.
Länge: 3–4 kurze Sätze. Ton: direkt, freundlich, überzeugend.
Erwähne konkrete Stärken aus den Daten (z.B. tiefe Km, neues Baujahr, Ausstattung, Energie-Effizienz).

Fahrzeug: ${s(make)} ${s(model)}${variant ? " " + s(variant) : ""}, ${year ?? ""}
Km: ${mileage?.toLocaleString("de-CH") ?? "–"} km, Leistung: ${power ?? "–"} PS, ${s(transmission)}, ${s(fuel)}
Preis: CHF ${price?.toLocaleString("de-CH") ?? "–"}${leasingPrice ? ", Leasing: CHF " + leasingPrice + "/Mt." : ""}
${body ? "Karosserie: " + s(body) + "\n" : ""}${color ? "Farbe: " + s(color) + "\n" : ""}${drivetrain ? "Antrieb: " + s(drivetrain) + "\n" : ""}${energyLabel ? "Energieeffizienz: " + s(energyLabel) + "\n" : ""}${safeEquipment && safeEquipment.length > 0 ? "Ausstattung: " + safeEquipment.join(", ") + "\n" : ""}`;

  try {
    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system:
        "Du bist ein erfahrener Autoberater bei Car Trade24 GmbH in Wohlen, Schweiz. Antworte nur mit dem Verkäufertext — keine Anrede, kein Abschluss, keine Formatierung.",
      messages: [{ role: "user", content: userMessage }],
    });

    const first = response.content[0];
    if (first.type === "text") {
      return first.text.trim();
    }
    return undefined;
  } catch {
    return undefined;
  }
}
