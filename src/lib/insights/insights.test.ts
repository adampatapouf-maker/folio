import { describe, expect, it } from "vitest";
import { pfCompute, defaultHoldings } from "@/lib/calc/portfolio";
import { allocationDrift, contributionPlan, riskMetrics, DRIFT_BAND } from "./rebalance";
import { buildReport, periodLabel } from "./report";
import { STRAT } from "@/data/portfolio";
import { PROFILES } from "@/data/builder";
import type { Holding, Strategy } from "@/lib/types";

const seed = pfCompute(defaultHoldings());

describe("allocationDrift", () => {
  const drift = allocationDrift(seed, STRAT);

  it("covers every target class and actual weights sum to 100 %", () => {
    STRAT.alloc.forEach(([cat]) => expect(drift.some((d) => d.cat === cat)).toBe(true));
    expect(drift.reduce((s, d) => s + d.actual, 0)).toBeCloseTo(100, 6);
  });

  it("classifies status by the tolerance band", () => {
    drift.forEach((d) => {
      if (d.drift > DRIFT_BAND) expect(d.status).toBe("over");
      else if (d.drift < -DRIFT_BAND) expect(d.status).toBe("under");
      else expect(d.status).toBe("ok");
    });
  });

  it("flags the seed portfolio's real imbalances (crypto heavy, bonds light)", () => {
    expect(drift.find((d) => d.cat === "Krypto")?.status).toBe("over");
    expect(drift.find((d) => d.cat === "Dluhopisové ETF")?.status).toBe("under");
  });
});

describe("contributionPlan", () => {
  it.each([0, 1, 37, 500, 2500, 100000])("spends exactly the monthly amount (%i €)", (m) => {
    const plan = contributionPlan(seed, STRAT, m);
    expect(plan.lines.reduce((s, l) => s + l.amount, 0)).toBe(m);
    plan.lines.forEach((l) => expect(l.amount).toBeGreaterThan(0));
  });

  it("is buy-only: never sends money to an overweight class while gaps exceed the contribution", () => {
    const plan = contributionPlan(seed, STRAT, 500);
    const over = allocationDrift(seed, STRAT).filter((d) => d.status === "over").map((d) => d.cat);
    plan.lines.forEach((l) => expect(over).not.toContain(l.cat));
  });

  it("prefers instruments the user already holds", () => {
    const plan = contributionPlan(seed, STRAT, 500);
    const heldSyms = new Set(seed.rows.map((r) => r.sym));
    plan.lines.filter((l) => l.held).forEach((l) => expect(heldSyms.has(l.sym)).toBe(true));
    expect(plan.lines.find((l) => l.cat === "Dluhopisové ETF")?.sym).toBe("AGGH");
  });

  it("splits by target weights when the portfolio is already on target", () => {
    const empty = pfCompute([]);
    const plan = contributionPlan(empty, STRAT, 1000);
    STRAT.alloc.forEach(([cat, t]) => {
      expect(plan.lines.find((l) => l.cat === cat)?.amount ?? 0).toBeCloseTo((1000 * t) / 100, -1);
    });
  });
});

describe("riskMetrics", () => {
  it("returns sane, bounded figures", () => {
    const r = riskMetrics(seed);
    expect(r.positions).toBe(seed.rows.length);
    expect(r.effectivePositions).toBeGreaterThan(1);
    expect(r.effectivePositions).toBeLessThanOrEqual(r.positions);
    expect(r.vol).toBeGreaterThan(0);
    expect(r.cryptoShare).toBeGreaterThan(0);
    expect(r.largest.weight).toBeLessThanOrEqual(100);
  });

  it("handles an empty portfolio without NaN", () => {
    const r = riskMetrics(pfCompute([]));
    Object.values(r).forEach((v) => typeof v === "number" && expect(Number.isNaN(v)).toBe(false));
  });
});

describe("buildReport", () => {
  const now = new Date(2026, 9, 15); // Thu 15 Oct 2026

  it("never contradicts the drift: buy ⇒ under, pause ⇒ over", () => {
    for (const name of Object.keys(PROFILES)) {
      const p = PROFILES[name];
      const strategy: Strategy = { name, risk: p.risk, ret: p.ret, vol: p.vol, alloc: p.alloc };
      const r = buildReport(defaultHoldings(), strategy, 500, "weekly", now);
      r.actions.forEach((a) => {
        const cat = a.id.split("-").slice(1).join("-");
        if (a.kind === "buy") expect(r.drift.find((d) => d.cat === cat)?.status).toBe("under");
        if (a.kind === "pause") expect(r.drift.find((d) => d.cat === cat)?.status).toBe("over");
      });
    }
  });

  it("produces a coherent monthly plan and labels", () => {
    const r = buildReport(defaultHoldings(), STRAT, 500, "monthly", now);
    expect(r.period).toBe("Říjen 2026");
    expect(r.plan.monthly).toBe(500);
    expect(r.commentary).toContain(STRAT.name);
    expect(r.actions.length).toBeGreaterThan(0);
    expect(r.actions.length).toBeLessThanOrEqual(4);
  });

  it("works for a single-holding portfolio", () => {
    const one: Holding[] = [{ sym: "VWCE", units: 10, avg: 100, cat: "Akciové ETF" }];
    const r = buildReport(one, STRAT, 300, "weekly", now);
    expect(r.movers.best.sym).toBe("VWCE");
    expect(r.plan.lines.reduce((s, l) => s + l.amount, 0)).toBe(300);
  });
});

describe("periodLabel", () => {
  it("formats the Monday–Sunday week", () => {
    expect(periodLabel("weekly", new Date(2026, 9, 15))).toBe("12.–18. 10. 2026");
    expect(periodLabel("weekly", new Date(2026, 9, 1))).toBe("28. 9. – 4. 10. 2026");
  });
});
