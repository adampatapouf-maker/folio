import type { TaxResult } from "@/lib/types";

/**
 * Simplified Czech capital-gains tax estimate for securities (2024/2025).
 * Ported verbatim from the prototype's `taxComputeCZ`.
 *
 * Exemption if EITHER test passes:
 *  - time test: held > 36 months
 *  - value test: yearly gross sale proceeds ≤ 100 000 Kč
 * Otherwise 15% on the gain. DIP contributions deduct up to 48 000 Kč/yr.
 */
export function taxComputeCZ(
  buy: number,
  sell: number,
  months: number,
  dip: number
): TaxResult {
  const gain = Math.max(0, sell - buy);
  const timeTest = months >= 36;
  const valueTest = sell <= 100000;
  const exempt = timeTest || valueTest;
  const rate = 0.15;
  const taxable = exempt ? 0 : gain;
  const tax = Math.round(taxable * rate);
  const dipDeduct = Math.min(Math.max(0, dip), 48000);
  const dipSaving = Math.round(dipDeduct * 0.15);
  return { gain, exempt, timeTest, valueTest, rate, taxable, tax, dipDeduct, dipSaving, net: sell - tax };
}
