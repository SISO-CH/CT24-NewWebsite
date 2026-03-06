import { NextRequest, NextResponse } from "next/server";
import { fetchVehicles } from "@/lib/as24";
import type { Vehicle } from "@/lib/vehicles";

// ── KV abstraction (Vercel KV → in-memory fallback) ─────────────────────────

const memoryStore = new Map<string, unknown>();

async function getKv() {
  try {
    const mod = await import("@vercel/kv");
    return mod.kv;
  } catch {
    return null;
  }
}

async function kvGet<T>(key: string): Promise<T | null> {
  const kv = await getKv();
  if (kv) return kv.get<T>(key);
  return (memoryStore.get(key) as T) ?? null;
}

async function kvSet(key: string, value: unknown): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.set(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && auth === `Bearer ${secret}`);
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vehicles = await fetchVehicles();
    const currentIds = vehicles.map((v) => String(v.id));

    // Load previous snapshot
    const previousIds = (await kvGet<string[]>("vehicle-snapshot")) ?? [];

    // Determine diffs
    const previousSet = new Set(previousIds);
    const currentSet = new Set(currentIds);
    const removedIds = previousIds.filter((id) => !currentSet.has(id));
    const newIds = currentIds.filter((id) => !previousSet.has(id));

    // Store full data for every currently live vehicle
    await Promise.all(
      vehicles.map((v) => kvSet(`vehicle-live:${v.id}`, v)),
    );

    // Archive removed vehicles (sold)
    let archived = 0;
    for (const id of removedIds) {
      const liveData = await kvGet<Vehicle>(`vehicle-live:${id}`);
      if (liveData) {
        await kvSet(`archive:${id}`, {
          ...liveData,
          archivedAt: new Date().toISOString(),
          status: "sold",
        });
        archived++;
      }
    }

    // Webhook for new vehicles
    let webhooksSent = 0;
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (webhookUrl && newIds.length > 0) {
      for (const id of newIds) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: `https://cartrade24.ch/autos/${id}`,
            }),
          });
          webhooksSent++;
        } catch (err) {
          console.error(`Webhook error for vehicle ${id}:`, err);
        }
      }
    }

    // Update snapshot
    await kvSet("vehicle-snapshot", currentIds);

    return NextResponse.json({
      active: currentIds.length,
      archived,
      newVehicles: newIds.length,
      webhooksSent,
    });
  } catch (err) {
    console.error("archive-vehicles cron error:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
