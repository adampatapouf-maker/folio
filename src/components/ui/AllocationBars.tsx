import { catColor } from "@/lib/assets";
import { DRIFT_BAND, type DriftRow } from "@/lib/insights/rebalance";

const STATUS = {
  under: { label: "pod cílem", fg: "var(--blue)", bg: "var(--bluesoft)" },
  over: { label: "nad cílem", fg: "var(--coral)", bg: "var(--coralsoft)" },
  ok: { label: "v cíli", fg: "var(--limedeep)", bg: "var(--limesoft)" },
} as const;

const n = (v: number) => Math.round(v).toLocaleString("cs-CZ");

/**
 * Actual vs. target weight per asset class. The bar is the actual weight, the
 * dark tick is the target, and the faint band around it is the ±tolerance.
 */
export function AllocationBars({ rows, compact = false }: { rows: DriftRow[]; compact?: boolean }) {
  const scale = Math.max(60, ...rows.map((r) => Math.max(r.actual, r.target + DRIFT_BAND))) * 1.05;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 13 }}>
      {rows.map((r) => {
        const st = STATUS[r.status];
        const color = catColor(r.cat);
        const lo = Math.max(0, r.target - DRIFT_BAND);
        const hi = r.target + DRIFT_BAND;
        return (
          <div key={r.cat}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.cat}</span>
              <span className="nowrapnum" style={{ fontSize: 12, color: "var(--ink2)" }}>
                <b style={{ color: "var(--ink)" }}>{n(r.actual)} %</b> / {r.target} %
              </span>
              {!compact && (
                <span className="chip" style={{ background: st.bg, color: st.fg, padding: "2px 7px", fontSize: 9.5 }}>
                  {st.label}
                </span>
              )}
            </div>
            <div
              role="img"
              aria-label={`${r.cat}: ${n(r.actual)} % z cílových ${r.target} %, ${st.label}`}
              style={{ position: "relative", height: compact ? 6 : 8, borderRadius: 4, background: "var(--surface2)" }}
            >
              <div style={{ position: "absolute", left: `${(lo / scale) * 100}%`, width: `${((hi - lo) / scale) * 100}%`, top: 0, bottom: 0, background: "var(--line)", borderRadius: 4 }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(100, (r.actual / scale) * 100)}%`, background: color, borderRadius: 4, opacity: r.status === "ok" ? 0.85 : 1 }} />
              <div style={{ position: "absolute", left: `calc(${(r.target / scale) * 100}% - 1px)`, top: -3, bottom: -3, width: 2, borderRadius: 1, background: "var(--ink)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
