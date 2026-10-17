import { NextResponse } from "next/server";
import { ASSETS } from "@/data/assets";

export const runtime = "nodejs";

/** List the market asset universe (lightweight rows for lists/search). */
export async function GET() {
  return NextResponse.json({ assets: ASSETS });
}
