import { NextRequest } from "next/server";
import { getClient } from "@/lib/ai";
import { fetchVehicles } from "@/lib/as24";

// Module-level inventory cache (60s TTL) — avoids fetching on every chat message
let _inventoryCache: { text: string; expiry: number } | null = null;

async function getCachedInventory(): Promise<string> {
  if (_inventoryCache && Date.now() < _inventoryCache.expiry) {
    return _inventoryCache.text;
  }
  const vehicles = await fetchVehicles().catch(() => []);
  const text = vehicles
    .slice(0, 20)
    .map((v) =>
      `- ${v.make} ${v.model}${v.variant ? " " + v.variant : ""}, ${v.year}, ` +
      `${v.mileage.toLocaleString("de-CH")} km, CHF ${v.price.toLocaleString("de-CH")}, ID: ${v.id}`
    )
    .join("\n");
  _inventoryCache = { text, expiry: Date.now() + 60_000 };
  return text;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Chat nicht verfuegbar" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every(
      (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )
  ) {
    return new Response(
      JSON.stringify({ error: "Ungueltige Anfrage" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Keep last 10 messages to bound token usage
  const trimmedMessages = messages.slice(-10);

  const inventoryText = await getCachedInventory();

  const systemPrompt = `Du bist ein freundlicher Kundenberater von Car Trade24 GmbH in Wohlen, Schweiz.
Antworte immer auf Deutsch, kurz und hilfreich (max. 3-4 Saetze).
Verwende kein Markdown. Keine Listen mit Bindestrichen.

Aktueller Fahrzeugbestand:
${inventoryText || "Kein Bestand verfuegbar."}

Kontakt: Ringstrasse 26, 5610 Wohlen | Tel: +41 56 618 55 44 | info@cartrade24.ch
Oeffnungszeiten: Mo-Fr 08:30-18:30, Sa 09:00-16:00
Services: Probefahrten, Fahrzeugreservierung (CHF 200), Inzahlungnahme, Home Delivery, Zulassungsservice.

Wenn ein Kunde ein Fahrzeug kaufen moechte, empfehle den Anruf oder das Kontaktformular.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = getClient().messages.stream({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system:     systemPrompt,
          messages:   trimmedMessages,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Verbindungsfehler" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
