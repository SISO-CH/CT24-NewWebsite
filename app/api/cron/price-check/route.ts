import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { Resend } from "resend";
import { fetchVehicles } from "@/lib/as24";
import { formatCHF } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && auth === `Bearer ${secret}`);
}

const NOTIFY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

interface AlertData {
  email: string;
  filters: Record<string, string>;
  createdAt: number;
  lastNotifiedAt?: number;
  locale?: string;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alertIds = (await kv.smembers("alerts")) as string[];
    if (alertIds.length === 0) {
      return NextResponse.json({ checked: 0, matched: 0 });
    }

    const vehicles = await fetchVehicles();
    let matched = 0;

    for (const id of alertIds) {
      const alert = await kv.get<AlertData>(`alert:${id}`);
      if (!alert) continue;

      const matches = vehicles.filter((v) => {
        const f = alert.filters;
        if (f.make && v.make.toLowerCase() !== f.make.toLowerCase()) return false;
        if (f.model && !v.model.toLowerCase().includes(f.model.toLowerCase())) return false;
        if (f.priceMax && v.price > Number(f.priceMax)) return false;
        if (f.priceMin && v.price < Number(f.priceMin)) return false;
        return true;
      });

      if (matches.length > 0) {
        if (alert.lastNotifiedAt && Date.now() - alert.lastNotifiedAt < NOTIFY_COOLDOWN_MS) {
          continue;
        }

        const top = matches[0];
        const vehicleLabel = `${top.make} ${top.model}${top.variant ? " " + top.variant : ""}`;
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "noreply@cartrade24.ch",
          to: alert.email,
          subject: `Neues Fahrzeug: ${vehicleLabel} – CHF ${formatCHF(top.price)}`,
          html: `
            <p>Guten Tag</p>
            <p>Ein passendes Fahrzeug ist jetzt verfügbar:</p>
            <p>
              <strong>${vehicleLabel}</strong><br/>
              CHF ${formatCHF(top.price)} &middot; ${top.year} &middot; ${formatCHF(top.mileage)} km
            </p>
            <p><a href="https://cartrade24.ch/autos/${top.id}">Fahrzeug ansehen &rarr;</a></p>
            <p>Mit freundlichen Gr&uuml;ssen<br/>Car Trade24 GmbH</p>
          `,
        });
        await kv.set(`alert:${id}`, { ...alert, lastNotifiedAt: Date.now() });
        matched++;
      }
    }

    return NextResponse.json({ checked: alertIds.length, matched });
  } catch (err) {
    console.error("price-check cron error:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
