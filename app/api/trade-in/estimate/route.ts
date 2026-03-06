import { NextRequest, NextResponse } from "next/server";
import { fetchVehicles } from "@/lib/as24";

const CONDITION_FACTOR: Record<string, number> = {
  "Sehr gut": 0.80,
  "Gut": 0.75,
  "Befriedigend": 0.65,
  "Beschädigt": 0.50,
};

export async function POST(req: NextRequest) {
  try {
    const { make, model, year, mileage, condition } = await req.json();

    const allVehicles = await fetchVehicles();
    const similar = allVehicles.filter(
      (v) =>
        v.make.toLowerCase() === make.toLowerCase() &&
        v.model.toLowerCase().includes(model.toLowerCase()) &&
        Math.abs(v.year - Number(year)) <= 2 &&
        Math.abs(v.mileage - Number(mileage)) < 30000
    );

    let estimate: number;
    let method: "market" | "ai";

    if (similar.length >= 2) {
      const avgPrice =
        similar.reduce((s, v) => s + v.price, 0) / similar.length;
      estimate = Math.round(avgPrice * (CONDITION_FACTOR[condition] ?? 0.7));
      method = "market";
    } else {
      // Fallback: Claude AI
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic();
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `Schätze den Inzahlungnahme-Wert in CHF für ein Fahrzeug in der Schweiz: ${make} ${model}, Jahrgang ${year}, ${mileage} km, Zustand: ${condition}. Antworte NUR mit einer Zahl (CHF-Betrag, ohne Text, ohne Währungszeichen).`,
          },
        ],
      });
      const text =
        msg.content[0].type === "text" ? msg.content[0].text.trim() : "0";
      estimate = parseInt(text.replace(/[^\d]/g, ""), 10) || 0;
      method = "ai";
    }

    return NextResponse.json({
      estimate,
      method,
      similarCount: similar.length,
    });
  } catch (err) {
    console.error("trade-in estimate error:", err);
    return NextResponse.json(
      { estimate: 0, method: "error", similarCount: 0 },
      { status: 500 }
    );
  }
}
