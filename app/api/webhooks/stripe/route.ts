import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { kv } from "@vercel/kv";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");
const resend = new Resend(process.env.RESEND_API_KEY);

const RESERVATION_HOURS = Number(process.env.RESERVATION_HOURS ?? "48");

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
    const vehicleId = session.metadata?.vehicleId;
    const customerEmail = session.customer_details?.email ?? "";

    if (vehicleId) {
      const until = Date.now() + RESERVATION_HOURS * 60 * 60 * 1000;
      await kv.set(
        `reserved:${vehicleId}`,
        { until, sessionId: session.id, email: customerEmail },
        { exat: Math.floor(until / 1000) }
      );

      // Notify customer
      if (customerEmail) {
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "noreply@cartrade24.ch",
          to: customerEmail,
          subject: `Reservierungsbestätigung – Fahrzeug #${vehicleId}`,
          html: `
            <p>Guten Tag</p>
            <p>Ihre Reservierung wurde erfolgreich durchgeführt.</p>
            <p>Das Fahrzeug ist für Sie für <strong>${RESERVATION_HOURS} Stunden</strong> reserviert.</p>
            <p>Wir melden uns in Kürze bei Ihnen.</p>
            <p>Mit freundlichen Grüssen<br/>Car Trade24 GmbH</p>
          `,
        });
      }

      // Notify dealer
      const dealerEmail = process.env.RESEND_FROM ?? "noreply@cartrade24.ch";
      await resend.emails.send({
        from: dealerEmail,
        to: dealerEmail,
        subject: `Neue Reservierung: Fahrzeug #${vehicleId}`,
        html: `
          <p>Neue Reservierung eingegangen.</p>
          <p>Fahrzeug-ID: <strong>${vehicleId}</strong></p>
          <p>Kunde: ${customerEmail || "unbekannt"}</p>
          <p>Stripe Session: ${session.id}</p>
          <p>Reserviert bis: ${new Date(until).toLocaleString("de-CH")}</p>
        `,
      });
    }
  }

  return NextResponse.json({ received: true });
}
