// app/api/signature/route.ts
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSignatureRequest } from "@/lib/skribble";
import { resend } from "@/lib/resend";

const MAX_PDF_B64_LENGTH = 20_000_000; // ~15 MB decoded

export async function POST(req: NextRequest) {
  // Secured with CRON_SECRET — only callable by the dealer backend
  const secret   = process.env.CRON_SECRET ?? "";
  const provided = req.headers.get("x-api-key") ?? "";
  const authorized =
    secret.length > 0 &&
    secret.length === provided.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  if (!authorized) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const {
      pdfBase64,
      pdfName,
      vehicleLabel,
      customerEmail,
      customerName,
    } = await req.json() as {
      pdfBase64:      string;
      pdfName?:       string;
      vehicleLabel?:  string;
      customerEmail:  string;
      customerName:   string;
    };

    if (!pdfBase64 || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "pdfBase64, customerEmail und customerName sind Pflicht" },
        { status: 400 }
      );
    }

    if (pdfBase64.length > MAX_PDF_B64_LENGTH) {
      return NextResponse.json({ error: "PDF zu gross (max. 15 MB)" }, { status: 400 });
    }

    if (!/^[A-Za-z0-9+/]+=*$/.test(pdfBase64)) {
      return NextResponse.json({ error: "pdfBase64 ist kein gültiges Base64" }, { status: 400 });
    }

    const result = await createSignatureRequest({
      title:       `Kaufvertrag ${vehicleLabel ?? ""} — Car Trade24`,
      message:     `Guten Tag ${customerName}, bitte unterzeichnen Sie den beiliegenden Kaufvertrag.`,
      pdfBase64,
      pdfName:     pdfName ?? "kaufvertrag.pdf",
      signerEmail: customerEmail,
      signerName:  customerName,
    });

    // Confirmation email to dealer
    await resend.emails.send({
      from:    process.env.RESEND_FROM ?? "noreply@cartrade24.ch",
      to:      process.env.DEALER_EMAIL ?? "info@cartrade24.ch",
      subject: `E-Signatur gesendet: ${customerName} — ${vehicleLabel ?? ""}`,
      html:    `<p>Signaturanfrage ${result.id} wurde an ${customerEmail} gesendet.</p>
                <p>Signing URL: ${result.signingUrl}</p>`,
    });

    return NextResponse.json({ id: result.id, signingUrl: result.signingUrl });
  } catch (err) {
    console.error("Skribble error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Interner Fehler" },
      { status: 500 }
    );
  }
}
