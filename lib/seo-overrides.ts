import { cache } from "react";
import { fetchSheet } from "@/lib/google-sheets";

export interface SeoOverride {
  page: string;
  keyword?: string;
  title?: string;
  description?: string;
  h1?: string;
}

export const getSeoOverrides = cache(async function (): Promise<
  Map<string, SeoOverride>
> {
  const rows = await fetchSheet("SEO Overrides");
  const map = new Map<string, SeoOverride>();
  for (const row of rows) {
    const page = row.seite?.trim();
    if (!page) continue;
    map.set(page, {
      page,
      keyword: row["fokus-keyword"] || undefined,
      title: row["meta-title"] || undefined,
      description: row["meta-description"] || undefined,
      h1: row["h1"] || undefined,
    });
  }
  return map;
});

export async function getSeoOverride(
  path: string
): Promise<SeoOverride | undefined> {
  const overrides = await getSeoOverrides();
  return overrides.get(path);
}
