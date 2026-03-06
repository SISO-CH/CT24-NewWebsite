import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Spracherkennung nicht verfügbar" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const formData = await req.formData();
  const audio = formData.get("audio");
  if (!audio || !(audio instanceof Blob)) {
    return new Response(
      JSON.stringify({ error: "Kein Audio empfangen" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = new FormData();
  body.append("audio", audio, "recording.webm");
  body.append("model_id", "scribe_v1");
  body.append("language_code", "deu");

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: "Transkription fehlgeschlagen", detail }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const data = (await res.json()) as { text?: string };
  return new Response(
    JSON.stringify({ text: data.text ?? "" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
