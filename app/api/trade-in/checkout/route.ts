import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { buildLocalePrefix, formatCHF } from "@/lib/utils";

const TRADEIN_FEE_CHF = Number(process.env.TRADEIN_FEE_CHF ?? "20");
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cartrade24.ch";

export async function POST(req: NextRequest) {
  const { plate, km, condition, locale } = await req.json();

  if (!plate || !km || !condition) {
    return NextResponse.json({ error: "plate, km und condition sind erforderlich" }, { status: 400 });
  }

  const localePrefix = buildLocalePrefix(locale ?? "");
  const kmNum = Number(km);

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
              description: `Kennzeichen: ${plate} · ${formatCHF(kmNum)} km · ${condition}`,
            },
          },
        },
      ],
      metadata: { plate: String(plate), km: String(km), condition: String(condition), type: "trade-in" },
      success_url: `${BASE_URL}${localePrefix}/inzahlungnahme/bestaetigung`,
      cancel_url: `${BASE_URL}${localePrefix}/inzahlungnahme`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("trade-in checkout error:", err);
    return NextResponse.json({ error: "Stripe-Fehler" }, { status: 500 });
  }
}
