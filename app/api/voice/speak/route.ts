import { NextRequest } from "next/server";

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Sprachsynthese nicht verfügbar" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const { text } = (await req.json()) as { text?: string };
  if (!text || typeof text !== "string") {
    return new Response(
      JSON.stringify({ error: "Kein Text angegeben" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: "Sprachsynthese fehlgeschlagen", detail }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const buffer = await res.arrayBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.byteLength),
    },
  });
}
