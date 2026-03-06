import { NextRequest, NextResponse } from "next/server";

// In-memory fallback when Vercel KV is not configured
const memoryStore = new Map<string, { count: number; expiresAt: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24h

function getKv() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return import("@vercel/kv").then((m) => m.kv);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    const key = `views:${id}`;
    const kv = await getKv();

    if (kv) {
      const count = await kv.incr(key);
      if (count === 1) await kv.expire(key, 86400);
      return NextResponse.json({ count });
    }

    // In-memory fallback
    const now = Date.now();
    const entry = memoryStore.get(key);
    if (entry && entry.expiresAt > now) {
      entry.count += 1;
      return NextResponse.json({ count: entry.count });
    }
    memoryStore.set(key, { count: 1, expiresAt: now + TTL });
    return NextResponse.json({ count: 1 });
  } catch (err) {
    console.error("vehicle-views POST error:", err);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
    if (ids.length === 0) return NextResponse.json({});

    const kv = await getKv();

    if (kv) {
      const keys = ids.map((id) => `views:${id}`);
      const values = await kv.mget<number[]>(...keys);
      const result: Record<string, number> = {};
      ids.forEach((id, i) => { result[id] = values[i] ?? 0; });
      return NextResponse.json(result);
    }

    // In-memory fallback
    const now = Date.now();
    const result: Record<string, number> = {};
    ids.forEach((id) => {
      const entry = memoryStore.get(`views:${id}`);
      result[id] = entry && entry.expiresAt > now ? entry.count : 0;
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("vehicle-views GET error:", err);
    return NextResponse.json({}, { status: 500 });
  }
}
