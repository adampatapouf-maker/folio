/** Formatting helpers (Czech locale), ported from the prototype. */

/** Euro amount, rounded, cs-CZ grouping: `€1 234`. */
export const fmt = (n: number): string =>
  "€" + Math.round(n).toLocaleString("cs-CZ");

/** Czech koruna amount: `1 234 Kč`. */
export const kc = (n: number): string =>
  Math.round(n).toLocaleString("cs-CZ") + " Kč";

/** Price formatting matching the prototype: big numbers rounded, else 2dp. */
export const price = (n: number): string =>
  n >= 1000 ? Math.round(n).toLocaleString("cs-CZ") : n.toFixed(2);

/** Signed percent, 1 decimal: `+1.2%`. */
export const pct = (n: number, dp = 1): string =>
  (n >= 0 ? "+" : "") + n.toFixed(dp) + "%";
