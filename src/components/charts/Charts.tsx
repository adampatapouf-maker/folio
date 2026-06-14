"use client";
import { useEffect, useRef } from "react";
import { PALETTE } from "@/data/assets";
import { CAT_COLOR } from "@/lib/assets";
import type { AssetCategory, Allocation } from "@/lib/types";

/** Read a CSS custom property off :root (so charts follow the active theme). */
function cssVar(name: string): string {
  if (typeof window === "undefined") return "#000";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#000";
}
function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const palColor = (i: number) => PALETTE[i % PALETTE.length];

/** Hi-DPI canvas hook: sizes the backing store and provides a 2D context. */
function useChart(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const r = window.devicePixelRatio || 1;
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    cv.width = w * r;
    cv.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

const fullStyle: React.CSSProperties = { width: "100%", height: "100%", display: "block" };

/** Category-colored donut (uses CAT_COLOR). */
export function Donut({ data, inner = 0.6 }: { data: Allocation; inner?: number }) {
  const ref = useChart(
    (ctx, w, h) => {
      const cx = w / 2,
        cy = h / 2,
        outer = Math.min(w, h) / 2 - 2,
        inr = outer * inner;
      let ang = -Math.PI / 2;
      const tot = data.reduce((s, a) => s + a[1], 0),
        gap = 0.04;
      data.forEach((a) => {
        const sl = (a[1] / tot) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, outer, ang + gap / 2, ang + sl - gap / 2);
        ctx.arc(cx, cy, inr, ang + sl - gap / 2, ang + gap / 2, true);
        ctx.closePath();
        ctx.fillStyle = CAT_COLOR[a[0] as AssetCategory] || palColor(0);
        ctx.fill();
        ang += sl;
      });
    },
    [JSON.stringify(data), inner]
  );
  return <canvas ref={ref} style={fullStyle} />;
}

/** Palette-colored donut (generic breakdowns). */
export function DonutPal({ data, inner = 0.62 }: { data: Allocation; inner?: number }) {
  const ref = useChart(
    (ctx, w, h) => {
      const cx = w / 2,
        cy = h / 2,
        outer = Math.min(w, h) / 2 - 2,
        inr = outer * inner;
      let ang = -Math.PI / 2;
      const tot = data.reduce((s, a) => s + a[1], 0),
        gap = 0.04;
      data.forEach((a, i) => {
        const sl = (a[1] / tot) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, outer, ang + gap / 2, ang + sl - gap / 2);
        ctx.arc(cx, cy, inr, ang + sl - gap / 2, ang + gap / 2, true);
        ctx.closePath();
        ctx.fillStyle = palColor(i);
        ctx.fill();
        ang += sl;
      });
    },
    [JSON.stringify(data), inner]
  );
  return <canvas ref={ref} style={fullStyle} />;
}

/** Filled area line chart with up/down coloring. */
export function AreaChart({ vals, labels }: { vals: number[]; labels?: string[] }) {
  const ref = useChart(
    (ctx, w, h) => {
      if (vals.length < 2) return;
      const mn = Math.min(...vals),
        mx = Math.max(...vals),
        padX = 6,
        padT = 12,
        padB = 18;
      const X = (i: number) => padX + (i / (vals.length - 1)) * (w - 2 * padX);
      const Y = (v: number) => h - padB - ((v - mn) / (mx - mn || 1)) * (h - padT - padB);
      const up = vals[vals.length - 1] >= vals[0];
      const [rr, gg, bb] = hexToRgb(up ? "#7FB000" : "#FF5A4E");
      ctx.strokeStyle = "rgba(128,128,140,.12)";
      ctx.lineWidth = 1;
      for (let gI = 0; gI < 4; gI++) {
        const gy = padT + ((h - padT - padB) * gI) / 3;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      ctx.beginPath();
      vals.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.lineTo(X(vals.length - 1), h - padB);
      ctx.lineTo(X(0), h - padB);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, `rgba(${rr},${gg},${bb},.32)`);
      g.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      vals.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.strokeStyle = up ? "#7FB000" : "#FF5A4E";
      ctx.lineWidth = 2.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
      if (labels) {
        ctx.fillStyle = "rgba(128,128,140,.7)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        for (let i = 0; i < labels.length; i += Math.ceil(labels.length / 6)) ctx.fillText(labels[i], X(i), h - 5);
      }
    },
    [JSON.stringify(vals), JSON.stringify(labels)]
  );
  return <canvas ref={ref} style={fullStyle} />;
}

function roundRectTop(ctx: CanvasRenderingContext2D, x: number, y: number, wd: number, ht: number, rad: number) {
  if (ht <= 0) return;
  rad = Math.min(rad, wd / 2, ht);
  ctx.beginPath();
  ctx.moveTo(x, y + ht);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.lineTo(x + wd - rad, y);
  ctx.quadraticCurveTo(x + wd, y, x + wd, y + rad);
  ctx.lineTo(x + wd, y + ht);
  ctx.closePath();
  ctx.fill();
}

/** Compound growth: principal (ink) + total (lime) areas, line or bars. */
export function GrowthChart({ principal, total, mode = "line" }: { principal: number[]; total: number[]; mode?: "line" | "bar" }) {
  const ref = useChart(
    (ctx, w, h) => {
      const limedeep = cssVar("--limedeep");
      const ink = cssVar("--ink");
      const mx = Math.max(...total);
      if (mode === "bar") {
        const padB = 6,
          padT = 6,
          n = total.length,
          slot = w / n,
          bw = Math.max(2, Math.min(slot * 0.62, 18));
        const Y = (v: number) => h - padB - (v / mx) * (h - padT - padB);
        const step = n > 22 ? Math.ceil(n / 22) : 1;
        for (let i = 0; i < n; i += step) {
          const cx = i * slot + slot / 2,
            yTot = Y(total[i]),
            yPr = Y(principal[i]),
            y0 = h - padB;
          ctx.fillStyle = limedeep;
          roundRectTop(ctx, cx - bw / 2, yTot, bw, yPr - yTot, 3);
          ctx.fillStyle = ink;
          roundRectTop(ctx, cx - bw / 2, yPr, bw, y0 - yPr, yPr - yTot < 1 ? 3 : 0);
        }
        return;
      }
      const pad = 6;
      const X = (i: number) => (i / (total.length - 1)) * w;
      const Y = (v: number) => h - pad - (v / mx) * (h - 2 * pad);
      ctx.beginPath();
      total.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(204,255,0,.55)");
      g.addColorStop(1, "rgba(204,255,0,0)");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      principal.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = "rgba(14,14,16,.12)";
      ctx.fill();
      ctx.beginPath();
      total.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.strokeStyle = limedeep;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.beginPath();
      principal.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();
    },
    [JSON.stringify(principal), JSON.stringify(total), mode]
  );
  return <canvas ref={ref} style={fullStyle} />;
}

export interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** OHLC candlestick chart. Ported from `drawCandles`. */
export function CandleChart({ bars }: { bars: Bar[] }) {
  const ref = useChart(
    (ctx, w, h) => {
      if (!bars.length) return;
      const limedeep = cssVar("--limedeep");
      const coral = cssVar("--coral");
      const all = bars.flatMap((b) => [b.high, b.low]);
      const mn = Math.min(...all),
        mx = Math.max(...all),
        pad = 12;
      const Y = (v: number) => h - pad - ((v - mn) / (mx - mn || 1)) * (h - 2 * pad);
      const bw = (w - 20) / bars.length;
      ctx.strokeStyle = "rgba(128,128,140,.12)";
      ctx.lineWidth = 1;
      for (let gI = 1; gI < 4; gI++) {
        const gy = pad + ((h - 2 * pad) * gI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      bars.forEach((b, i) => {
        const x = 10 + i * bw + bw / 2;
        const up = b.close >= b.open;
        const col = up ? limedeep : coral;
        ctx.strokeStyle = col;
        ctx.fillStyle = col;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, Y(b.high));
        ctx.lineTo(x, Y(b.low));
        ctx.stroke();
        const top = Y(Math.max(b.open, b.close)),
          bot = Y(Math.min(b.open, b.close));
        ctx.fillRect(x - bw * 0.3, top, bw * 0.6, Math.max(1.5, bot - top));
      });
    },
    [JSON.stringify(bars)]
  );
  return <canvas ref={ref} style={fullStyle} />;
}

/** Tiny inline sparkline for headers / list rows. */
export function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const ref = useChart(
    (ctx, w, h) => {
      if (data.length < 2) return;
      const limedeep = cssVar("--limedeep");
      const coral = cssVar("--coral");
      const mn = Math.min(...data),
        mx = Math.max(...data),
        pad = 3;
      const X = (i: number) => (i / (data.length - 1)) * w;
      const Y = (v: number) => h - pad - ((v - mn) / (mx - mn || 1)) * (h - 2 * pad);
      ctx.beginPath();
      data.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.strokeStyle = up ? limedeep : coral;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
    },
    [JSON.stringify(data), up]
  );
  return <canvas ref={ref} style={fullStyle} />;
}

export interface CompareSeries {
  series: number[];
  color: string;
  primary?: boolean;
  dashed?: boolean;
  label?: string;
}

/** Multi-series comparison, line or grouped bars. */
export function CompareChart({ series, mode }: { series: CompareSeries[]; mode: "line" | "bar" }) {
  const ref = useChart(
    (ctx, w, h) => {
      if (!series.length) return;
      let mx = 0;
      series.forEach((s) => s.series.forEach((v) => (v > mx ? (mx = v) : null)));
      mx = mx || 1;
      const padB = 6,
        padT = 8,
        len = series[0].series.length;
      const Y = (v: number) => h - padB - (v / mx) * (h - padT - padB);
      ctx.strokeStyle = "rgba(128,128,140,.12)";
      ctx.lineWidth = 1;
      for (let gI = 1; gI < 4; gI++) {
        const gy = padT + ((h - padT - padB) * gI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      if (mode === "bar") {
        const slot = w / len,
          k = series.length,
          groupW = Math.min(slot * 0.7, k * 9),
          bw = groupW / k,
          step = len > 22 ? Math.ceil(len / 22) : 1;
        for (let i = 0; i < len; i += step) {
          const gx = i * slot + slot / 2 - groupW / 2;
          series.forEach((s, si) => {
            const v = s.series[i],
              y = Y(v);
            ctx.fillStyle = s.color;
            roundRectTop(ctx, gx + si * bw, y, Math.max(1.5, bw - 1.5), h - padB - y, 2);
          });
        }
      } else {
        const X = (i: number) => (i / (len - 1)) * w;
        series.forEach((s) => {
          ctx.beginPath();
          s.series.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.primary ? 3 : 2;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.setLineDash(s.dashed ? [4, 4] : []);
          ctx.stroke();
          ctx.setLineDash([]);
          const lx = X(len - 1),
            ly = Y(s.series[len - 1]);
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(lx, ly, s.primary ? 3.5 : 2.6, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },
    [JSON.stringify(series), mode]
  );
  return <canvas ref={ref} style={fullStyle} />;
}
