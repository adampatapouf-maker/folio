import { NextRequest, NextResponse } from "next/server";
import { pfCompute, defaultHoldings, pfHistory } from "@/lib/calc/portfolio";
import type { Holding } from "@/lib/types";

export const runtime = "nodejs";

/** Computed portfolio for the seed (demo) holdings. */
export async function GET() {
  const computed = pfCompute(defaultHoldings());
  return NextResponse.json({ computed, history: pfHistory(computed.val) });
}

/** Compute a portfolio for client-supplied holdings (e.g. after edits). */
export async function POST(req: NextRequest) {
  let holdings: Holding[];
  try {
    const body = (await req.json()) as { holdings?: Holding[] };
    holdings = Array.isArray(body.holdings) && body.holdings.length ? body.holdings : defaultHoldings();
  } catch {
    holdings = defaultHoldings();
  }
  const computed = pfCompute(holdings);
  return NextResponse.json({ computed, history: pfHistory(computed.val) });
}
