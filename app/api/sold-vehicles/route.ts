import { NextResponse } from "next/server";
import { getSoldVehicles } from "@/lib/sold-vehicles";

export async function GET() {
  try {
    const vehicles = await getSoldVehicles();
    return NextResponse.json(vehicles);
  } catch (err) {
    console.error("sold-vehicles API error:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
