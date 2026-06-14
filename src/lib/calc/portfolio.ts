import { getAsset } from "@/lib/assets";
import { MY_PORTFOLIO, PF_SHAPE } from "@/data/portfolio";
import type { Holding, PortfolioComputed, Allocation } from "@/lib/types";

/** Default holdings (a fresh copy of the seed portfolio). */
export function defaultHoldings(): Holding[] {
  return MY_PORTFOLIO.holdings.map((h) => ({ ...h }));
}

/**
 * Compute live portfolio value, P/L and allocation breakdowns from holdings.
 * Ported verbatim from the prototype's `pfCompute`.
 */
export function pfCompute(holdings: Holding[]): PortfolioComputed {
  let val = 0;
  let inv = 0;
  const byCat: Record<string, number> = {};
  const bySector: Record<string, number> = {};
  const byCurrency: Record<string, number> = {};
  const byRegion: Record<string, number> = {};

  const rows = holdings.map((h) => {
    const a = getAsset(h.sym) || ({} as ReturnType<typeof getAsset> & Record<string, never>);
    const price = (a && a.price) || h.avg;
    const mv = price * h.units;
    const cost = h.avg * h.units;
    val += mv;
    inv += cost;
    byCat[h.cat] = (byCat[h.cat] || 0) + mv;
    const sec = (a && a.sector) || h.cat;
    bySector[sec] = (bySector[sec] || 0) + mv;
    const cur = (a && a.currency) || (h.cat === "Krypto" ? "Krypto" : "EUR");
    byCurrency[cur] = (byCurrency[cur] || 0) + mv;
    const reg =
      a && a.region && a.region.indexOf("USA") >= 0
        ? "USA"
        : a && a.region && (a.region.indexOf("Eurozóna") >= 0 || a.region.indexOf("rozvinuté") >= 0)
          ? "Evropa/DM"
          : h.cat === "Krypto"
            ? "Globální (krypto)"
            : (a && a.region) || "Svět";
    byRegion[reg] = (byRegion[reg] || 0) + mv;
    return {
      sym: h.sym,
      name: (a && a.name) || h.sym,
      cat: h.cat,
      units: h.units,
      avg: h.avg,
      price,
      mv,
      cost,
      pl: mv - cost,
      plPct: ((mv - cost) / cost) * 100,
      chg: (a && a.chg) || 0,
    };
  });

  const toAlloc = (o: Record<string, number>): Allocation => {
    const arr = Object.keys(o)
      .map((k) => [k, (o[k] / val) * 100] as [string, number])
      .filter((x) => x[1] > 0.5)
      .sort((a, b) => b[1] - a[1])
      .map((x) => [x[0], Math.round(x[1])] as [string, number]);
    const diff = 100 - arr.reduce((s, a) => s + a[1], 0);
    if (arr.length) arr[0][1] += diff;
    return arr;
  };

  return {
    rows,
    val,
    inv,
    pl: val - inv,
    plPct: ((val - inv) / inv) * 100,
    allocCat: toAlloc(byCat),
    allocSector: toAlloc(bySector),
    allocCurrency: toAlloc(byCurrency),
    allocRegion: toAlloc(byRegion),
  };
}

/** 12-month value history scaled to end on the live computed value. */
export function pfHistory(currentVal: number): { m: string; v: number }[] {
  const endF = PF_SHAPE[PF_SHAPE.length - 1].f;
  const scale = currentVal / endF;
  return PF_SHAPE.slice(1).map((s) => ({ m: s.m, v: Math.round(s.f * scale) }));
}
