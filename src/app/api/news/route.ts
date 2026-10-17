import { NextResponse } from "next/server";
import { FEED } from "@/data/social";

export const runtime = "nodejs";

/** "For You" news feed. */
export async function GET() {
  return NextResponse.json({ feed: FEED });
}
