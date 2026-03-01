import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import type Stripe from "stripe";

const RESERVATION_HOURS = Number(process.env.RESERVATION_HOURS ?? "48");
const FROM = process.env.RESEND_FROM ?? "noreply@cartrade24.ch";
const DEALER_EMAIL = process.env.DEALER_EMAIL ?? process.env.RESEND_FROM ?? "info@cartrade24.ch";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { type, vehicleId, plate, km, condition } = session.metadata ?? {};
    const customerEmail = session.customer_details?.email ?? "";

    if (type === "reservation" && vehicleId) {
      const until = Date.now() + RESERVATION_HOURS * 60 * 60 * 1000;
      await kv.set(
        `reserved:${vehicleId}`,
        { until, sessionId: session.id, email: customerEmail },
        { exat: Math.floor(until / 1000) }
      );

      await Promise.all([
        customerEmail
          ? resend.emails.send({
              from: FROM,
              to: customerEmail,
              subject: `Reservierungsbestätigung – Fahrzeug #${vehicleId}`,
              html: `
                <p>Guten Tag</p>
                <p>Ihre Reservierung wurde erfolgreich durchgeführt.</p>
                <p>Das Fahrzeug ist für Sie für <strong>${RESERVATION_HOURS} Stunden</strong> reserviert.</p>
                <p>Wir melden uns in Kürze bei Ihnen.</p>
                <p>Mit freundlichen Grüssen<br/>Car Trade24 GmbH</p>
              `,
            })
          : Promise.resolve(),
        resend.emails.send({
          from: FROM,
          to: DEALER_EMAIL,
          subject: `Neue Reservierung: Fahrzeug #${vehicleId}`,
          html: `
            <p>Neue Reservierung eingegangen.</p>
            <p>Fahrzeug-ID: <strong>${vehicleId}</strong></p>
            <p>Kunde: ${customerEmail || "unbekannt"}</p>
            <p>Stripe Session: ${session.id}</p>
            <p>Reserviert bis: ${new Date(until).toLocaleString("de-CH")}</p>
          `,
        }),
      ]);
    }

    if (type === "trade-in" && plate) {
      await Promise.all([
        customerEmail
          ? resend.emails.send({
              from: FROM,
              to: customerEmail,
              subject: "Fahrzeugbewertung bestellt – Car Trade24",
              html: `
                <p>Guten Tag</p>
                <p>Ihre Zahlung wurde erfolgreich verarbeitet.</p>
                <p>Wir melden uns innert 24 Stunden mit einem verbindlichen Kaufangebot für Ihr Fahrzeug
                   (<strong>${plate}</strong>, ${km} km, Zustand: ${condition}).</p>
                <p>Mit freundlichen Grüssen<br/>Car Trade24 GmbH</p>
              `,
            })
          : Promise.resolve(),
        resend.emails.send({
          from: FROM,
          to: DEALER_EMAIL,
          subject: `Neue Inzahlungnahme-Anfrage: ${plate}`,
          html: `
            <p>Neue verbindliche Bewertungsanfrage eingegangen.</p>
            <p>Kennzeichen: <strong>${plate}</strong></p>
            <p>Kilometerstand: ${km} km</p>
            <p>Zustand: ${condition}</p>
            <p>Kunde: ${customerEmail || "unbekannt"}</p>
            <p>Stripe Session: ${session.id}</p>
          `,
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
