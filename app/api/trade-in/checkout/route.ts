import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");

const TRADEIN_FEE_CHF = Number(process.env.TRADEIN_FEE_CHF ?? "20");
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cartrade24.ch";

export async function POST(req: NextRequest) {
  const { plate, km, condition, locale } = await req.json();

  if (!plate || !km || !condition) {
    return NextResponse.json({ error: "plate, km und condition sind erforderlich" }, { status: 400 });
  }

  const localePrefix = locale && locale !== "de" ? `/${locale}` : "";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "chf",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "chf",
            unit_amount: TRADEIN_FEE_CHF * 100,
            product_data: {
              name: "Verbindliche Fahrzeugbewertung",
              description: `Kennzeichen: ${plate} · ${km.toLocaleString("de-CH")} km · ${condition}`,
            },
          },
        },
      ],
      metadata: { plate: String(plate), km: String(km), condition: String(condition) },
      success_url: `${BASE_URL}${localePrefix}/inzahlungnahme/bestaetigung`,
      cancel_url: `${BASE_URL}${localePrefix}/inzahlungnahme`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("trade-in checkout error:", err);
    return NextResponse.json({ error: "Stripe-Fehler" }, { status: 500 });
  }
}
