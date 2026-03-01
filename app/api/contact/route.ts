import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Fix 4: Move transporter to module scope so the connection is reused across requests
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Fix 2: Minimal HTML-escape helper to prevent XSS in the email body
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, subject, message } = body;

  const hasContact = email?.trim() || phone?.trim();
  if (!name?.trim() || !hasContact || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, Kontakt und Nachricht sind Pflichtfelder." },
      { status: 400 }
    );
  }

  // Validate email format only when an email address is provided
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email?.trim() && !emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine gültige E-Mail-Adresse an." },
      { status: 400 }
    );
  }

  // Fix 1: Wrap sendMail in try/catch so SMTP errors return structured JSON
  try {
    await transporter.sendMail({
      from:    `"Car Trade24 Website" <${process.env.SMTP_USER}>`,
      to:      process.env.CONTACT_TO,
      replyTo: email,
      subject: `Kontaktanfrage: ${subject ?? "Allgemein"} – ${name}`,
      text: [
        `Name:    ${name}`,
        `E-Mail:  ${email}`,
        `Telefon: ${phone || "–"}`,
        `Betreff: ${subject || "–"}`,
        "",
        message,
      ].join("\n"),
      // Fix 2: All user-supplied values are HTML-escaped; message newlines converted after escaping
      html: `
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>E-Mail:</strong> ${esc(email)}</p>
        <p><strong>Telefon:</strong> ${esc(phone || "–")}</p>
        <p><strong>Betreff:</strong> ${esc(subject || "–")}</p>
        <hr/>
        <p>${esc(message).replace(/\n/g, "<br/>")}</p>
      `,
    });
  } catch (err) {
    console.error("SMTP error:", err);
    return NextResponse.json(
      { error: "E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
