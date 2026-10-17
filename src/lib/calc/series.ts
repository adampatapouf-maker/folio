import { getAsset, ASSETS } from "@/lib/assets";

export interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Deterministic OHLC walk ending at the current price. Ported from `priceSeries`. */
export function priceSeries(sym: string, bars = 60): Bar[] {
  const a = ASSETS.find((x) => x.sym === sym);
  if (!a) return [];
  let seed = 0;
  for (let i = 0; i < sym.length; i++) seed = seed * 31 + sym.charCodeAt(i);
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out: Bar[] = [];
  const end = a.price;
  const vol = Math.max(0.005, (Math.abs(a.chg) / 100) * 0.8);
  let prev = end * (1 - (rng() - 0.5) * 0.15);
  for (let i = 0; i < bars; i++) {
    const drift = ((end - prev) / (bars - i)) * 0.15;
    const noise = (rng() - 0.5) * vol * prev * 2;
    const open = prev;
    const close = Math.max(0.01, prev + drift + noise);
    const high = Math.max(open, close) * (1 + rng() * vol * 0.6);
    const low = Math.min(open, close) * (1 - rng() * vol * 0.6);
    out.push({ open, high, low, close });
    prev = close;
  }
  out[out.length - 1].close = end;
  return out;
}

export interface TfResult {
  series: Bar[];
  change: number;
  start: number;
}

/**
 * Timeframe-aware deterministic series. The end equals the current price and
 * the start is derived from the asset's approximate period return so the %
 * matches the label. Ported verbatim from `tfSeries`.
 */
export function tfSeries(sym: string, tf: string): TfResult {
  const a = getAsset(sym);
  if (!a) return { series: [], change: 0, start: 0 };
  const cfg =
    (
      {
        "1D": { bars: 26 },
        "1T": { bars: 28 },
        "1M": { bars: 30 },
        "6M": { bars: 26 },
        "1R": { bars: 52 },
        Max: { bars: 60 },
      } as Record<string, { bars: number }>
    )[tf] || { bars: 30 };
  const bars = cfg.bars;
  const end = a.price;
  const rec = a as unknown as Record<string, number | undefined>;
  const pr = (k: string, d: number) => (rec[k] != null ? (rec[k] as number) : d);
  let period: number;
  if (tf === "1D") period = a.chg;
  else if (tf === "1T") period = a.chg * 2.0;
  else if (tf === "1M") period = pr("ytd", a.chg * 4) * 0.35;
  else if (tf === "6M") period = pr("r1y", 8) * 0.55;
  else if (tf === "1R") period = pr("r1y", 12);
  else period = pr("r5y", pr("r1y", 40) * 2);
  if (tf === "Max") period = Math.max(period, pr("r3y", period));
  const start = end / (1 + period / 100);

  let seed = 0;
  const key = sym + tf;
  for (let i = 0; i < key.length; i++) seed = seed * 31 + key.charCodeAt(i);
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const vol = Math.max(
    0.004,
    (Math.abs(a.chg) / 100) * 0.6 + (tf === "1D" ? 0.003 : tf === "Max" ? 0.02 : 0.01)
  );
  const out: Bar[] = [];
  let prev = start;
  for (let i = 0; i < bars; i++) {
    const t = i / (bars - 1);
    const target = start + (end - start) * t;
    const drift = (target - prev) * 0.5;
    const noise = (rng() - 0.5) * vol * prev * 2 * (1 - Math.abs(t - 0.5));
    const open = prev;
    const close = Math.max(0.0001, prev + drift + noise);
    const high = Math.max(open, close) * (1 + rng() * vol * 0.5);
    const low = Math.min(open, close) * (1 - rng() * vol * 0.5);
    const moveMag = Math.abs(close - open) / (prev || 1);
    const volume = Math.round((0.6 + rng() * 0.8 + moveMag * 12) * 100);
    out.push({ open, high, low, close, volume });
    prev = close;
  }
  out[0].open = start;
  out[out.length - 1].close = end;
  return { series: out, change: ((end - start) / start) * 100, start };
}

/** Simple moving average over closes. Ported from `movingAvg`. */
export function movingAvg(closes: number[], window: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const s = Math.max(0, i - window + 1);
    let sum = 0;
    let c = 0;
    for (let j = s; j <= i; j++) {
      sum += closes[j];
      c++;
    }
    out.push(sum / c);
  }
  return out;
}
