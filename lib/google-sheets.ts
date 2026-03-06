import { cache } from "react";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

interface SheetRow {
  [key: string]: string;
}

export const fetchSheet = cache(async function fetchSheetImpl(
  sheetName: string
): Promise<SheetRow[]> {
  if (!SPREADSHEET_ID || !API_KEY) {
    console.warn("[Google Sheets] Missing env vars");
    return [];
  }
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`[Google Sheets] ${res.status}`);
      return [];
    }
    const data = await res.json();
    const rows: string[][] = data.values ?? [];
    if (rows.length < 2) return [];
    const headers = rows[0].map((h: string) => h.trim().toLowerCase());
    return rows.slice(1).map((row: string[]) => {
      const obj: SheetRow = {};
      headers.forEach((h: string, i: number) => {
        obj[h] = row[i]?.trim() ?? "";
      });
      return obj;
    });
  } catch (err) {
    console.error("[Google Sheets] Fetch error:", err);
    return [];
  }
});
