import { NextResponse } from "next/server";
import { CALENDAR } from "@/data/calendar";

export const runtime = "nodejs";

/** Economic calendar events (earnings, ex-div, dividend payouts, rate decisions). */
export async function GET() {
  return NextResponse.json({ events: CALENDAR });
}
