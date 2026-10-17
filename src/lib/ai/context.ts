import { pfCompute } from "@/lib/calc/portfolio";
import { allocationDrift, contributionPlan, riskMetrics } from "@/lib/insights/rebalance";
import type { Holding, Strategy } from "@/lib/types";

/**
 * Compact, serialisable snapshot of the user's situation that travels with
 * every AI request, so answers about "my portfolio" are grounded in real data.
 */
export interface AiContext {
  strategy: { name: string; risk: string; ret: string };
  value: number;
  invested: number;
  plPct: number;
  monthly: number;
  positions: { sym: string; cat: string; weight: number }[];
  drift: { cat: string; actual: number; target: number; status: "under" | "ok" | "over" }[];
  plan: { cat: string; amount: number; sym: string }[];
  monthsToBalance: number;
  risk: { vol: number; beta: number; cryptoShare: number; largest: string; largestWeight: number };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function buildAiContext(holdings: Holding[], strategy: Strategy, monthly: number): AiContext {
  const p = pfCompute(holdings);
  const plan = contributionPlan(p, strategy, monthly);
  const risk = riskMetrics(p);
  return {
    strategy: { name: strategy.name, risk: strategy.risk, ret: strategy.ret },
    value: Math.round(p.val),
    invested: Math.round(p.inv),
    plPct: r1(p.plPct),
    monthly: plan.monthly,
    positions: p.rows
      .map((r) => ({ sym: r.sym, cat: r.cat, weight: r1(p.val > 0 ? (r.mv / p.val) * 100 : 0) }))
      .sort((a, b) => b.weight - a.weight),
    drift: allocationDrift(p, strategy).map((d) => ({ cat: d.cat, actual: r1(d.actual), target: d.target, status: d.status })),
    plan: plan.lines.map((l) => ({ cat: l.cat, amount: l.amount, sym: l.sym })),
    monthsToBalance: plan.monthsToBalance,
    risk: {
      vol: r1(risk.vol),
      beta: Math.round(risk.beta * 100) / 100,
      cryptoShare: r1(risk.cryptoShare),
      largest: risk.largest.sym,
      largestWeight: r1(risk.largest.weight),
    },
  };
}

/** Plain-text rendering used inside the LLM prompt. */
export function contextToText(c: AiContext): string {
  return [
    `Strategie: ${c.strategy.name} (${c.strategy.risk}, očekávaný výnos ${c.strategy.ret} p.a.)`,
    `Hodnota portfolia: €${c.value} (vloženo €${c.invested}, ${c.plPct >= 0 ? "+" : ""}${c.plPct} %)`,
    `Měsíční vklad: €${c.monthly}`,
    `Pozice: ${c.positions.map((p) => `${p.sym} ${p.weight} %`).join(", ")}`,
    `Alokace vs. cíl: ${c.drift.map((d) => `${d.cat} ${d.actual} % / cíl ${d.target} %${d.status === "ok" ? "" : d.status === "over" ? " (nad)" : " (pod)"}`).join("; ")}`,
    `Plán příkupu (jen nákupy, bez prodeje): ${c.plan.map((l) => `${l.cat} €${l.amount}${l.sym ? ` (${l.sym})` : ""}`).join(", ") || "—"}`,
    `Návrat do tolerance cca za ${c.monthsToBalance} měs.`,
    `Riziko: odhad volatility ${c.risk.vol} % p.a., beta ${c.risk.beta}, krypto ${c.risk.cryptoShare} %, největší pozice ${c.risk.largest} ${c.risk.largestWeight} %`,
  ].join("\n");
}
