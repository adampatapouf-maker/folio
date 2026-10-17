"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { ASSETS, sig, catColor, catEmoji, onColor } from "@/lib/assets";
import { tfSeries } from "@/lib/calc/series";
import { price } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { Sparkline } from "@/components/charts/Charts";
import { useHoldings } from "@/hooks/useInsights";
import type { AssetCategory } from "@/lib/types";

const CATS: string[] = ["Vše", "Akciové ETF", "Dluhopisové ETF", "Konzervativní akcie", "Růstové akcie", "Komodity", "Krypto"];
const LIME = "#CCFF00";

function resultsWord(n: number): string {
  if (n === 1) return "výsledek";
  if (n >= 2 && n <= 4) return "výsledky";
  return "výsledků";
}

export function DataScreen() {
  const dataFilter = useFolioStore((s) => s.dataFilter);
  const dataSearch = useFolioStore((s) => s.dataSearch);
  const setDataFilter = useFolioStore((s) => s.setDataFilter);
  const setDataSearch = useFolioStore((s) => s.setDataSearch);
  const openAsset = useFolioStore((s) => s.openAsset);
  const holdings = useHoldings();
  const heldSyms = new Set(holdings.map((h) => h.sym));

  // Store seeds dataFilter with "all"; treat it (and "Vše") as no category filter.
  const f = dataFilter === "all" ? "Vše" : dataFilter;
  const q = dataSearch.trim().toLowerCase();

  let list = f === "Vše" ? ASSETS : ASSETS.filter((a) => a.cat === f);
  if (q) {
    list = list.filter(
      (a) => a.sym.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q)
    );
  }
  const anyHeld = list.some((a) => heldSyms.has(a.sym));

  return (
    <div className="fade" style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="sub">Databáze aktiv</div>
      <div className="h1" style={{ marginBottom: 4 }}>
        Data aktiv
      </div>
      <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 16 }}>
        Tržní data, kompletní fundamenty, grafy a Folio AI skóre. Klikni na aktivum pro detail.
      </div>

      {/* search bar */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "inline-flex" }}>
          <Icon name="search" size={17} color="var(--ink3)" stroke={2} />
        </span>
        <input
          aria-label="Hledat aktivum"
          type="text"
          inputMode="search"
          autoComplete="off"
          placeholder="Hledat aktivum, ticker nebo kategorii…"
          value={dataSearch}
          onChange={(e) => setDataSearch(e.target.value)}
          style={{ width: "100%", padding: "13px 40px 13px 42px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: 16, outline: "none" }}
        />
        {q && (
          <button
            onClick={() => setDataSearch("")}
            className="pressable"
            aria-label="Vymazat hledání"
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", background: "var(--surface2)", color: "var(--ink2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* category filter pills */}
      <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 14 }}>
        {CATS.map((c) => {
          const on = f === c;
          const cc = c === "Vše" ? LIME : catColor(c as AssetCategory);
          return (
            <button
              key={c}
              onClick={() => setDataFilter(c)}
              className="pressable"
              style={{ padding: "8px 15px", borderRadius: 20, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", background: on ? cc : "var(--surface)", color: on ? onColor(cc) : "var(--ink)", border: `1px solid ${on ? cc : "var(--line)"}` }}
            >
              {c === "Vše" ? "✦ " : (catEmoji(c as AssetCategory) || "") + " "}
              {c}
            </button>
          );
        })}
      </div>

      {(q || anyHeld) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: 12, color: "var(--ink2)", marginBottom: 10 }}>
          <span>{q ? `${list.length} ${resultsWord(list.length)} pro „${dataSearch}“` : ""}</span>
          {anyHeld && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--lime)", boxShadow: "0 0 0 1px var(--line)" }} />
              máš v portfoliu
            </span>
          )}
        </div>
      )}

      <div className="stagger">
        {list.length ? (
          list.map((a) => {
            const [lab, col] = sig(a.score);
            const cc = catColor(a.cat);
            const series = tfSeries(a.sym, "1M").series.map((b) => b.close);
            const held = heldSyms.has(a.sym);
            return (
              <button
                key={a.sym}
                onClick={() => openAsset(a.sym)}
                className="card lift"
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 12px 14px", textAlign: "left", marginBottom: 10 }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <LogoTile sym={a.sym} size={42} radius={12} />
                  {held && (
                    <span
                      role="img"
                      aria-label="Máš v portfoliu"
                      title="Máš v portfoliu"
                      style={{ position: "absolute", right: -3, bottom: -3, width: 14, height: 14, borderRadius: "50%", background: "var(--lime)", border: "2px solid var(--surface)" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, flexShrink: 0 }}>{a.sym}</span>
                    <span
                      className="chip"
                      style={{ background: cc + "1f", color: cc, padding: "1px 7px", fontSize: 9.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}
                    >
                      {a.cat}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.3, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word" }}
                  >
                    {a.name}
                  </div>
                </div>
                <div style={{ width: 50, height: 28, flexShrink: 0 }}>
                  <Sparkline data={series} up={a.chg >= 0} />
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 66 }}>
                  <div className="fd" style={{ fontSize: 17, fontWeight: 600 }}>€{price(a.price)}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: a.chg >= 0 ? "var(--limedeep)" : "var(--coral)" }}>
                    {a.chg >= 0 ? "▲ " : "▼ "}
                    {Math.abs(a.chg).toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `conic-gradient(${col} ${a.score * 3.6}deg,var(--surface2) 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: col }} title={lab}>
                      {a.score}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="card" style={{ padding: "36px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Nic nenalezeno</div>
            <div style={{ fontSize: 13, color: "var(--ink2)" }}>Pro „{dataSearch}“ jsme nic nenašli. Zkus jiný ticker nebo název.</div>
          </div>
        )}
      </div>

      <div className="disc" style={{ textAlign: "center", marginTop: 16 }}>
        Demo data. Skóre nejsou doporučením k nákupu/prodeji.
      </div>
    </div>
  );
}
