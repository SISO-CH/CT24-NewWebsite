/**
 * Shared KV abstraction: Vercel KV in production, in-memory fallback for local dev.
 */

const memoryStore = new Map<string, unknown>();

async function getKv(): Promise<import("@vercel/kv").VercelKV | null> {
  try {
    const mod = await import("@vercel/kv");
    return mod.kv;
  } catch {
    return null;
  }
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const kv = await getKv();
  if (kv) return kv.get<T>(key);
  return (memoryStore.get(key) as T) ?? null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.set(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

export async function kvScan(pattern: string): Promise<string[]> {
  const kv = await getKv();

  if (kv) {
    const keys: string[] = [];
    let cursor = 0;
    let done = false;
    while (!done) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [next, batch]: [any, string[]] = await kv.scan(cursor, {
        match: pattern,
        count: 100,
      });
      keys.push(...batch);
      cursor = Number(next);
      if (cursor === 0) done = true;
    }
    return keys;
  }

  // In-memory fallback: convert glob pattern "archive:*" to prefix match
  const prefix = pattern.replace(/\*$/, "");
  return Array.from(memoryStore.keys()).filter((k) => k.startsWith(prefix));
}

export async function kvMget<T>(...keys: string[]): Promise<(T | null)[]> {
  const kv = await getKv();

  if (kv) {
    return kv.mget<(T | null)[]>(...keys);
  }

  return keys.map((k) => (memoryStore.get(k) as T) ?? null);
}
