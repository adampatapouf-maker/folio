import { getAsset, topAsset } from "@/lib/assets";
import type { AssetCategory, PortfolioComputed, Strategy } from "@/lib/types";

/** Tolerance band (percentage points) before a class counts as off-target. */
export const DRIFT_BAND = 5;

export type DriftStatus = "under" | "ok" | "over";

export interface DriftRow {
  cat: AssetCategory;
  /** Actual weight in %, unrounded. */
  actual: number;
  /** Target weight in %. */
  target: number;
  /** actual − target, in percentage points. */
  drift: number;
  value: number;
  status: DriftStatus;
}

/** Exact (unrounded) market value per asset class. */
function valueByCat(p: PortfolioComputed): Map<AssetCategory, number> {
  const m = new Map<AssetCategory, number>();
  p.rows.forEach((r) => m.set(r.cat, (m.get(r.cat) || 0) + r.mv));
  return m;
}

/** Compare the portfolio's class weights with the target strategy. */
export function allocationDrift(p: PortfolioComputed, strategy: Strategy): DriftRow[] {
  const byCat = valueByCat(p);
  const cats = new Set<AssetCategory>([
    ...strategy.alloc.map((a) => a[0] as AssetCategory),
    ...byCat.keys(),
  ]);
  const rows: DriftRow[] = [];
  cats.forEach((cat) => {
    const value = byCat.get(cat) || 0;
    const actual = p.val > 0 ? (value / p.val) * 100 : 0;
    const target = strategy.alloc.find((a) => a[0] === cat)?.[1] ?? 0;
    if (actual === 0 && target === 0) return;
    const drift = actual - target;
    const status: DriftStatus = drift > DRIFT_BAND ? "over" : drift < -DRIFT_BAND ? "under" : "ok";
    rows.push({ cat, actual, target, drift, value, status });
  });
  return rows.sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
}

export interface PlanLine {
  cat: AssetCategory;
  amount: number;
  sym: string;
  name: string;
  /** True when the instrument is one the user already holds. */
  held: boolean;
}

export interface ContributionPlan {
  monthly: number;
  lines: PlanLine[];
  /** Rough number of monthly contributions until every class is within the band. */
  monthsToBalance: number;
  /** Total € still missing in underweight classes (before this contribution). */
  gap: number;
}

/** Instrument for a class: the user's largest holding there, else the top-scored asset. */
function instrumentFor(p: PortfolioComputed, cat: AssetCategory): { sym: string; name: string; held: boolean } {
  const held = p.rows.filter((r) => r.cat === cat).sort((a, b) => b.mv - a.mv)[0];
  if (held) return { sym: held.sym, name: held.name, held: true };
  const top = topAsset(cat);
  return top ? { sym: top.sym, name: top.name, held: false } : { sym: "", name: cat, held: false };
}

/**
 * Buy-only rebalancing: split the monthly contribution across underweight
 * classes in proportion to how far they are below target. Nothing is sold —
 * that keeps the investor calm and, in CZ, avoids triggering capital-gains tax
 * on positions held < 3 years.
 */
export function contributionPlan(p: PortfolioComputed, strategy: Strategy, monthly: number): ContributionPlan {
  const amount = Math.max(0, Math.round(monthly));
  const byCat = valueByCat(p);
  const newTotal = p.val + amount;
  const targets = strategy.alloc.filter((a) => a[1] > 0);

  const gaps = targets.map(([cat, t]) => {
    const cur = byCat.get(cat as AssetCategory) || 0;
    return { cat: cat as AssetCategory, t, gap: Math.max(0, (t / 100) * newTotal - cur) };
  });
  const sumGap = gaps.reduce((s, g) => s + g.gap, 0);

  let raw: { cat: AssetCategory; amount: number }[];
  if (sumGap <= 0) {
    raw = gaps.map((g) => ({ cat: g.cat, amount: (amount * g.t) / 100 }));
  } else if (sumGap >= amount) {
    raw = gaps.map((g) => ({ cat: g.cat, amount: (amount * g.gap) / sumGap }));
  } else {
    const rest = amount - sumGap;
    raw = gaps.map((g) => ({ cat: g.cat, amount: g.gap + (rest * g.t) / 100 }));
  }

  // Whole euros; push the rounding remainder onto the biggest line.
  const lines = raw
    .map((r) => ({ ...r, amount: Math.round(r.amount) }))
    .filter((r) => r.amount >= 1)
    .sort((a, b) => b.amount - a.amount);
  const diff = amount - lines.reduce((s, l) => s + l.amount, 0);
  if (lines.length) lines[0].amount += diff;

  const currentGap = targets.reduce((s, [cat, t]) => {
    const cur = byCat.get(cat as AssetCategory) || 0;
    return s + Math.max(0, (t / 100) * p.val - cur);
  }, 0);

  return {
    monthly: amount,
    lines: lines.map((l) => ({ ...l, ...instrumentFor(p, l.cat) })),
    monthsToBalance: amount > 0 ? Math.ceil(currentGap / amount) : 0,
    gap: currentGap,
  };
}

export interface RiskMetrics {
  beta: number;
  /** Annualised volatility estimate in % (assumes ρ = 0.5 between holdings). */
  vol: number;
  maxDrawdown: number;
  largest: { sym: string; weight: number };
  /** 1 / Σw² — how many equally-sized positions the portfolio behaves like. */
  effectivePositions: number;
  positions: number;
  cryptoShare: number;
  defensiveShare: number;
}

const pctNum = (s: string | undefined): number | null => {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^\d,.\-−]/g, "").replace("−", "-").replace(",", "."));
  return isNaN(n) ? null : Math.abs(n);
};

/** Portfolio risk figures computed from holdings + per-asset fundamentals. */
export function riskMetrics(p: PortfolioComputed): RiskMetrics {
  const w = p.rows.map((r) => {
    const a = getAsset(r.sym);
    return {
      sym: r.sym,
      cat: r.cat,
      w: p.val > 0 ? r.mv / p.val : 0,
      beta: a?.beta ?? 1,
      vol: pctNum(a?.vol1y) ?? 20,
      dd: pctNum(a?.maxdd) ?? 30,
    };
  });
  const RHO = 0.5;
  let variance = 0;
  w.forEach((i) =>
    w.forEach((j) => {
      variance += i.w * j.w * i.vol * j.vol * (i.sym === j.sym ? 1 : RHO);
    })
  );
  const largest = [...w].sort((a, b) => b.w - a.w)[0] ?? { sym: "—", w: 0 };
  const sumSq = w.reduce((s, i) => s + i.w * i.w, 0);
  const defensive: AssetCategory[] = ["Dluhopisové ETF", "Konzervativní akcie", "Komodity"];
  return {
    beta: w.reduce((s, i) => s + i.w * i.beta, 0),
    vol: Math.sqrt(variance),
    maxDrawdown: w.reduce((s, i) => s + i.w * i.dd, 0),
    largest: { sym: largest.sym, weight: largest.w * 100 },
    effectivePositions: sumSq > 0 ? 1 / sumSq : 0,
    positions: w.length,
    cryptoShare: w.filter((i) => i.cat === "Krypto").reduce((s, i) => s + i.w, 0) * 100,
    defensiveShare: w.filter((i) => defensive.includes(i.cat)).reduce((s, i) => s + i.w, 0) * 100,
  };
}
