import type { Vehicle } from "@/lib/vehicles";

export interface ArchivedVehicle extends Vehicle {
  archivedAt: string;
  status: "sold";
}

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

// ── Public API ───────────────────────────────────────────────────────────────

export async function getSoldVehicles(): Promise<ArchivedVehicle[]> {
  const kv = await getKv();

  if (kv) {
    // Scan for all archive:* keys
    const keys: string[] = [];
    let done = false;
    let scanCursor = 0;
    while (!done) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [next, batch]: [any, string[]] = await kv.scan(scanCursor, {
        match: "archive:*",
        count: 100,
      });
      keys.push(...batch);
      scanCursor = Number(next);
      if (scanCursor === 0) done = true;
    }

    if (keys.length === 0) return [];

    const values = await kv.mget<ArchivedVehicle[]>(...keys);
    const vehicles = values.filter(Boolean) as ArchivedVehicle[];

    // Sort by archivedAt descending (newest first)
    return vehicles.sort(
      (a, b) =>
        new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
    );
  }

  // In-memory fallback
  const vehicles: ArchivedVehicle[] = [];
  for (const [key, value] of memoryStore.entries()) {
    if (key.startsWith("archive:")) {
      vehicles.push(value as ArchivedVehicle);
    }
  }
  return vehicles.sort(
    (a, b) =>
      new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
  );
}

export async function getSoldVehicle(
  id: string,
): Promise<ArchivedVehicle | null> {
  const kv = await getKv();

  if (kv) {
    return kv.get<ArchivedVehicle>(`archive:${id}`);
  }

  return (memoryStore.get(`archive:${id}`) as ArchivedVehicle) ?? null;
}
