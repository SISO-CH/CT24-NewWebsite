import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { resend } from "@/lib/resend";
import { v4 as uuidv4 } from "uuid";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, filtersJson } = body as { email?: string; filtersJson?: string };

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
    }

    let filters: Record<string, unknown> = {};
    if (filtersJson) {
      try {
        filters = JSON.parse(filtersJson);
      } catch {
        // ignore malformed filters — default to empty
      }
    }

    const id = uuidv4();
    await kv.set(`alert:${id}`, { email, filters, createdAt: Date.now(), locale: "de" });
    await kv.sadd("alerts", id);

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "noreply@cartrade24.ch",
      to: email,
      subject: "Preisalarm aktiviert – Car Trade24",
      html: `
        <p>Guten Tag</p>
        <p>Ihr Preisalarm wurde erfolgreich aktiviert.</p>
        <p>Wir benachrichtigen Sie, sobald ein passendes Fahrzeug verfügbar ist.</p>
        <p>Mit freundlichen Grüssen<br/>Car Trade24 GmbH</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("price-alert error:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
