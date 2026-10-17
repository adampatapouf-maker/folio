import { describe, expect, it } from "vitest";
import { computeCompound, projectSeries } from "./compound";
import { taxComputeCZ } from "./tax";
import { computeBuilder } from "./builder";
import { pfCompute } from "./portfolio";
import { aiReply } from "@/lib/ai/engine";
import { buildAiContext } from "@/lib/ai/context";
import { defaultHoldings } from "./portfolio";
import { STRAT } from "@/data/portfolio";

describe("computeCompound", () => {
  it("with 0 % return equals the sum of contributions", () => {
    const r = computeCompound(1000, 100, 0, 2);
    expect(r.final).toBe(1000 + 100 * 24);
    expect(r.interest).toBe(0);
    expect(r.total).toHaveLength(3);
  });

  it("matches the closed-form future value of an annuity", () => {
    const r = computeCompound(0, 100, 12, 1);
    const i = 0.01;
    expect(r.final).toBeCloseTo((100 * ((1 + i) ** 12 - 1)) / i, 6);
  });

  it("projectSeries agrees with computeCompound", () => {
    expect(projectSeries(5000, 500, 7, 20).at(-1)).toBeCloseTo(computeCompound(5000, 500, 7, 20).final, 6);
  });
});

describe("taxComputeCZ", () => {
  it("exempts after 36 months (time test)", () => {
    const r = taxComputeCZ(100000, 300000, 36, 0);
    expect(r.exempt).toBe(true);
    expect(r.tax).toBe(0);
  });

  it("exempts sales up to 100 000 Kč (value test)", () => {
    expect(taxComputeCZ(10000, 100000, 1, 0).exempt).toBe(true);
    expect(taxComputeCZ(10000, 100001, 1, 0).exempt).toBe(false);
  });

  it("taxes the gain at 15 % otherwise, never a loss", () => {
    expect(taxComputeCZ(100000, 200000, 12, 0).tax).toBe(15000);
    expect(taxComputeCZ(300000, 200000, 12, 0).tax).toBe(0);
  });

  it("caps the DIP deduction at 48 000 Kč", () => {
    const r = taxComputeCZ(0, 0, 0, 60000);
    expect(r.dipDeduct).toBe(48000);
    expect(r.dipSaving).toBe(7200);
  });
});

describe("computeBuilder", () => {
  const all = (i: number) => ({ goal: i, horizon: i, drop: i, exp: Math.min(i, 2), amount: i, crypto: 1 });

  it("maps cautious answers to the conservative profile and bold ones to dynamic", () => {
    expect(computeBuilder(all(0)).name).toBe("Konzervativní");
    expect(computeBuilder(all(3)).name).toBe("Dynamická");
  });

  it("always allocates 100 %", () => {
    for (let i = 0; i <= 3; i++) {
      for (const crypto of [0, 1, 2]) {
        const r = computeBuilder({ ...all(i), crypto });
        expect(r.alloc.reduce((s, a) => s + a[1], 0)).toBe(100);
      }
    }
  });

  it("removes crypto entirely when the user does not want it", () => {
    expect(computeBuilder({ ...all(3), crypto: 0 }).alloc.some((a) => a[0] === "Krypto")).toBe(false);
  });
});

describe("pfCompute", () => {
  it("handles an empty portfolio without NaN", () => {
    const p = pfCompute([]);
    expect(p.val).toBe(0);
    expect(p.plPct).toBe(0);
  });
});

describe("aiReply", () => {
  const ctx = buildAiContext(defaultHoldings(), STRAT, 500);

  it("refuses to give buy/sell advice", () => {
    expect(aiReply("Mám koupit NVDA?").t).toContain("Nemůžu ti říct");
  });

  it("answers about the user's own portfolio from context", () => {
    const t = aiReply("Jak je na tom moje portfolio?", null, ctx).t;
    expect(t).toContain(STRAT.name);
    expect(t).toContain("Krypto");
  });

  it("still builds the model portfolio widget on request", () => {
    expect(aiReply("Postav mi modelové portfolio", null, ctx).widget).toBe("portfolio");
  });
});
