import { NextRequest, NextResponse } from "next/server";
import { getValuation } from "@/lib/eurotax";

export async function POST(req: NextRequest) {
  const { plate, km, condition } = await req.json();

  if (!plate || !km || !condition) {
    return NextResponse.json({ error: "plate, km und condition sind erforderlich" }, { status: 400 });
  }

  try {
    const result = await getValuation(String(plate), Number(km), String(condition));
    return NextResponse.json(result);
  } catch (err) {
    console.error("trade-in valuate error:", err);
    return NextResponse.json({ error: "Bewertungsfehler" }, { status: 500 });
  }
}
