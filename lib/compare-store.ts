export const MAX_COMPARE = 3;

export function getCompareIds(searchParams: URLSearchParams): number[] {
  const raw = searchParams.get("compare");
  if (!raw) return [];
  return raw.split(",").map(Number).filter((n) => !isNaN(n) && n > 0);
}

export function buildCompareUrl(ids: number[], baseSearch: string): string {
  const params = new URLSearchParams(baseSearch);
  if (ids.length === 0) {
    params.delete("compare");
  } else {
    params.set("compare", ids.join(","));
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}
