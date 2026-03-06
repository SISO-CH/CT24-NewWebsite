import { NextRequest, NextResponse } from "next/server";

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Sprachsynthese nicht verfuegbar" },
      { status: 503 },
    );
  }

  const { text } = (await req.json()) as { text?: string };
  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Kein Text angegeben" },
      { status: 400 },
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
    return NextResponse.json(
      { error: "Sprachsynthese fehlgeschlagen", detail },
      { status: 502 },
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
