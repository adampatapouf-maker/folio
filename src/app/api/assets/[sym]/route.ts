import { NextResponse } from "next/server";
import { getAsset } from "@/lib/assets";
import { assetNews } from "@/lib/assets";
import { tfSeries } from "@/lib/calc/series";

export const runtime = "nodejs";

/** Full asset detail: fundamentals + curated news + a default-timeframe series. */
export async function GET(_req: Request, { params }: { params: Promise<{ sym: string }> }) {
  const sym = (await params).sym.toUpperCase();
  const asset = getAsset(sym);
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
  return NextResponse.json({
    asset,
    news: assetNews(sym),
    series: tfSeries(sym, "1M"),
  });
}
