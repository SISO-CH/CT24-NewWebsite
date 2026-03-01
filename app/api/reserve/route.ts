import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { buildLocalePrefix } from "@/lib/utils";

const AMOUNT_CHF = Number(process.env.RESERVATION_AMOUNT_CHF ?? "200");
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cartrade24.ch";

export async function POST(req: NextRequest) {
  const { vehicleId, vehicleLabel, locale } = await req.json();

  if (!vehicleId) {
    return NextResponse.json({ error: "vehicleId fehlt" }, { status: 400 });
  }

  const localePrefix = buildLocalePrefix(locale ?? "");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "chf",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "chf",
            unit_amount: AMOUNT_CHF * 100,
            product_data: {
              name: `Reservierung: ${vehicleLabel ?? `Fahrzeug #${vehicleId}`}`,
              description: "Reservierungsgebühr – wird auf den Kaufpreis angerechnet",
            },
          },
        },
      ],
      metadata: { vehicleId: String(vehicleId), type: "reservation" },
      success_url: `${BASE_URL}${localePrefix}/reservierung/bestaetigung?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}${localePrefix}/reservierung/abgebrochen`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("reserve error:", err);
    return NextResponse.json({ error: "Stripe-Fehler" }, { status: 500 });
  }
}
