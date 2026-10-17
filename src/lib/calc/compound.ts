import type { CompoundResult } from "@/lib/types";

/**
 * Compound interest with monthly contributions, sampled yearly.
 * Ported verbatim from the prototype's `computeCompound`.
 */
export function computeCompound(
  initial: number,
  monthly: number,
  rate: number,
  years: number
): CompoundResult {
  const r = rate / 100 / 12;
  const principal: number[] = [];
  const total: number[] = [];
  for (let y = 0; y <= years; y++) {
    let b = initial;
    let p = initial;
    for (let m = 0; m < y * 12; m++) {
      b = b * (1 + r) + monthly;
      p += monthly;
    }
    principal.push(p);
    total.push(b);
  }
  const final = total[total.length - 1];
  const contributed = principal[principal.length - 1];
  return { principal, total, final, contributed, interest: final - contributed };
}

/** Project a yearly balance series for any annual rate (monthly compounding). */
export function projectSeries(
  initial: number,
  monthly: number,
  annualRate: number,
  years: number
): number[] {
  const r = annualRate / 100 / 12;
  const out: number[] = [];
  for (let y = 0; y <= years; y++) {
    let b = initial;
    for (let m = 0; m < y * 12; m++) b = b * (1 + r) + monthly;
    out.push(b);
  }
  return out;
}

/**
 * DIP (dlouhodobý investiční produkt): same market return, but contributions
 * get a simplified ~15% effective boost from the tax deduction. Demo model.
 */
export function projectDIP(
  initial: number,
  monthly: number,
  annualRate: number,
  years: number
): number[] {
  const bonusMonthly = monthly * 1.15;
  return projectSeries(initial, bonusMonthly, annualRate, years);
}
