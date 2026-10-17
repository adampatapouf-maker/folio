"use client";
import { useMemo } from "react";
import { useFolioStore } from "@/store/useFolioStore";
import { defaultHoldings, pfCompute } from "@/lib/calc/portfolio";
import { allocationDrift, contributionPlan, riskMetrics } from "@/lib/insights/rebalance";
import { buildReport, type ReportKind } from "@/lib/insights/report";

/** The user's holdings (seed portfolio until they edit it). */
export function useHoldings() {
  const holdings = useFolioStore((s) => s.holdings);
  return useMemo(() => holdings ?? defaultHoldings(), [holdings]);
}

/** Portfolio valuation + drift vs. strategy + this month's buy plan + risk. */
export function usePortfolioInsights() {
  const holdings = useHoldings();
  const strategy = useFolioStore((s) => s.strategy);
  const monthly = useFolioStore((s) => s.calc.monthly);
  return useMemo(() => {
    const p = pfCompute(holdings);
    return {
      p,
      strategy,
      drift: allocationDrift(p, strategy),
      plan: contributionPlan(p, strategy, monthly),
      risk: riskMetrics(p),
    };
  }, [holdings, strategy, monthly]);
}

/** Generated weekly report / monthly plan. */
export function useReport(kind: ReportKind) {
  const holdings = useHoldings();
  const strategy = useFolioStore((s) => s.strategy);
  const monthly = useFolioStore((s) => s.calc.monthly);
  return useMemo(() => buildReport(holdings, strategy, monthly, kind), [holdings, strategy, monthly, kind]);
}
