"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { getAsset, sig, catColor, catEmoji, onColor, assetNews } from "@/lib/assets";
import { NEWS_IMG } from "@/data/assetNews";
import { tfSeries } from "@/lib/calc/series";
import { TFS } from "@/data/misc";
import { price } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { RichText } from "@/components/ui/RichText";
import { AreaChart, CandleChart } from "@/components/charts/Charts";
import type { AssetDetail, AssetKind, AssetCategory } from "@/lib/types";
import type { ReactNode } from "react";

/** Format a price: big numbers rounded with cs-CZ grouping, else 2dp. */
const fmtPr = (v: number) => "€" + price(v);

/** Nullable number → readable string (>=100 rounded+grouped, else 2dp). */
function fmtN(n: number | string | null | undefined): string | null {
  if (n == null) return null;
  if (typeof n === "number") return Math.abs(n) >= 100 ? Math.round(n).toLocaleString("cs-CZ") : n.toFixed(2);
  return n;
}

/** Single label/value fundamentals row; renders nothing when value is empty. */
function Frow({ label, val, help }: { label: string; val: ReactNode; help?: string }) {
  if (val == null || val === "") return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontSize: 12.5, color: "var(--ink2)" }}>
        {label}
        {help && (
          <span style={{ color: "var(--ink3)", cursor: "help" }} title={help}>
            {" "}ⓘ
          </span>
        )}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 700, textAlign: "right" }}>{val}</span>
    </div>
  );
}

/** Card section wrapper; renders nothing when there are no visible rows. */
function Sect({ emo, title, children }: { emo: string; title: string; children: ReactNode }) {
  const rows = Array.isArray(children) ? children : [children];
  if (!rows.some((r) => r)) return null;
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 17 }}>{emo}</span>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/** Colored signed percentage span. */
function pctVal(v: number | null | undefined): ReactNode {
  if (v == null) return null;
  return (
    <span style={{ color: v >= 0 ? "var(--limedeep)" : "var(--coral)", fontWeight: 800 }}>
      {v >= 0 ? "+" : ""}
      {v} %
    </span>
  );
}

function assetKind(a: AssetDetail): AssetKind {
  if (a.kind) return a.kind;
  if (a.cat === "Krypto") return "crypto";
  if (a.cat.indexOf("ETF") >= 0 || a.cat === "Komodity") return "etf";
  return "stock";
}

export function AssetDetailScreen({ sym }: { sym: string }) {
  const tf = useFolioStore((s) => s.tf);
  const chartMode = useFolioStore((s) => s.chartMode);
  const maOn = useFolioStore((s) => s.maOn);
  const setTf = useFolioStore((s) => s.setTf);
  const setChart = useFolioStore((s) => s.setChart);
  const toggleMA = useFolioStore((s) => s.toggleMA);
  const closeAsset = useFolioStore((s) => s.closeAsset);
  const askAI = useFolioStore((s) => s.askAI);
  const pfAdd = useFolioStore((s) => s.pfAdd);

  const a = getAsset(sym);
  if (!a) {
    return (
      <div className="fade" style={{ maxWidth: 980, margin: "0 auto" }}>
        <button
          onClick={() => closeAsset()}
          className="pressable"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--ink2)", marginBottom: 14 }}
        >
          <Icon name="chevL" size={16} color="var(--ink2)" /> Zpět na data aktiv
        </button>
        <div className="card" style={{ padding: "36px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Aktivum nenalezeno</div>
        </div>
      </div>
    );
  }

  const [lab, col] = sig(a.score);
  const cc = catColor(a.cat as AssetCategory);
  const kind = assetKind(a);

  const tfData = tfSeries(sym, tf);
  const up = tfData.change >= 0;
  const tfLabel = (TFS.find((t) => t[0] === tf) || ["", ""])[1];

  const closes = tfData.series.map((b) => b.close);
  const pHigh = closes.length ? Math.max(...closes) : 0;
  const pLow = closes.length ? Math.min(...closes) : 0;
  const pAvg = closes.length ? closes.reduce((s, v) => s + v, 0) / closes.length : 0;

  // 52-week range gadget position
  const lo = a.low52;
  const hi = a.high52;
  const posPct = Math.max(2, Math.min(98, ((a.price - lo) / (hi - lo || 1)) * 100));

  // performance chips
  const rets: [string, number][] = ([["YTD", a.ytd], ["1 rok", a.r1y], ["3 roky", a.r3y], ["5 let", a.r5y]] as [string, number | null | undefined][]).filter(
    (x): x is [string, number] => x[1] != null
  );

  // news
  const news = assetNews(sym);

  return (
    <div className="fade" style={{ maxWidth: 980, margin: "0 auto" }}>
      <button
        onClick={() => closeAsset()}
        className="pressable"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--ink2)", marginBottom: 14 }}
      >
        <Icon name="chevL" size={16} color="var(--ink2)" /> Zpět na data aktiv
      </button>

      {/* colorful hero header */}
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", marginBottom: 18, background: `linear-gradient(135deg,${cc} 0%,${cc}cc 100%)`, color: "#fff", padding: "22px 24px" }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 170, height: 170, borderRadius: "50%", background: "rgba(255,255,255,.16)" }} />
        <div style={{ position: "absolute", bottom: -50, right: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.10)" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LogoTile sym={a.sym} size={60} radius={17} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <span className="fd" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{a.sym}</span>
                <span className="chip" style={{ background: "rgba(255,255,255,.25)", color: "#fff" }}>{a.cat}</span>
              </div>
              <div style={{ fontSize: 14, opacity: 0.92, marginTop: 3 }}>{a.name}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="fd" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1 }}>€{price(a.price)}</div>
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4 }}>
              {a.chg >= 0 ? "▲ +" : "▼ "}
              {Math.abs(a.chg).toFixed(2)}% dnes
            </div>
            <div style={{ width: 120, height: 34, marginTop: 6, opacity: 0.95 }}>
              <AreaChart vals={tfSeries(sym, "1M").series.map((b) => b.close)} />
            </div>
          </div>
        </div>
      </div>

      {/* chart card with timeframe selector */}
      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Vývoj ceny · {tfLabel}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink2)", marginTop: 2 }}>
              Za období:{" "}
              <span style={{ fontWeight: 800, color: up ? "var(--limedeep)" : "var(--coral)" }}>
                {up ? "+" : ""}
                {tfData.change.toFixed(2)} %
              </span>{" "}
              · z €{price(tfData.start)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {chartMode === "line" && (
              <button
                onClick={() => toggleMA()}
                className="pressable"
                style={{ padding: "6px 11px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: maOn ? "var(--purple)" : "var(--surface2)", color: maOn ? "#fff" : "var(--ink2)", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                〜 MA{maOn ? " ✓" : ""}
              </button>
            )}
            <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 10, padding: 3 }}>
              <button
                onClick={() => setChart("line")}
                className="pressable"
                style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, background: chartMode === "line" ? cc : "transparent", color: chartMode === "line" ? onColor(cc) : "var(--ink2)" }}
              >
                📈 Čára
              </button>
              <button
                onClick={() => setChart("candle")}
                className="pressable"
                style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, background: chartMode === "candle" ? cc : "transparent", color: chartMode === "candle" ? onColor(cc) : "var(--ink2)" }}
              >
                📊 Svíčky
              </button>
            </div>
          </div>
        </div>
        <div style={{ height: 250 }}>
          {chartMode === "candle" ? <CandleChart bars={tfData.series} /> : <AreaChart vals={closes} />}
        </div>
        {chartMode === "line" && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, fontSize: 11, color: "var(--ink2)" }}>
            {maOn && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 0, borderTop: "2px dashed var(--purple)" }} />
                Klouzavý průměr
              </span>
            )}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: "rgba(127,176,0,.5)" }} />
              Objem obchodů
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: 4, background: "var(--surface2)", borderRadius: 11, padding: 4, marginTop: 14 }}>
          {TFS.map((t) => (
            <button key={t[0]} className={`tfbtn${tf === t[0] ? " on" : ""}`} onClick={() => setTf(t[0])}>
              {t[0]}
            </button>
          ))}
        </div>
        {/* period stats */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {([["Max", pHigh], ["Průměr", pAvg], ["Min", pLow]] as [string, number][]).map(([k, v]) => (
            <div key={k} style={{ flex: 1, background: "var(--surface2)", borderRadius: 11, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink3)" }}>{k}</div>
              <div className="fd" style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{fmtPr(v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI score panel */}
      <div style={{ background: "var(--panel)", color: "var(--panelink)", borderRadius: 20, padding: 22, position: "relative", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="sparkles" size={16} color="var(--lime)" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--lime)" }}>Folio AI skóre</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
            <div className="fd" style={{ fontSize: 50, fontWeight: 600, color: col, lineHeight: 1 }}>{a.score}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: col }}>{lab}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Riziko: {a.risk}</div>
            </div>
          </div>
          <RichText html={a.why} style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,.88)" }} />
          <div>
            <button
              onClick={() => askAI(`Vysvětli skóre ${a.sym}`)}
              className="pressable"
              style={{ marginTop: 14, background: "var(--lime)", color: "var(--inkfix)", fontSize: 12.5, fontWeight: 700, padding: "9px 14px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Icon name="chat" size={13} color="var(--inkfix)" stroke={2.3} /> Probrat s Folio AI
            </button>
          </div>
        </div>
      </div>

      {/* about / description */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 17 }}>📖</span>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Co to je</span>
        </div>
        <RichText html={a.desc || a.why} style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink2)" }} />
      </div>

      {/* add to portfolio CTA */}
      <button
        onClick={() => pfAdd(a.sym)}
        className="pressable"
        style={{ width: "100%", background: cc, color: onColor(cc), fontSize: 14, fontWeight: 800, padding: "13px 16px", borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 18 }}
      >
        <Icon name="plus" size={16} color={onColor(cc)} stroke={2.3} /> Přidat do portfolia
      </button>

      {/* gadgets: score gauge + 52w range */}
      <div className="grid two" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 78, height: 78, borderRadius: "50%", background: `conic-gradient(${col} ${a.score * 3.6}deg,var(--surface2) 0)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div className="fd" style={{ fontSize: 24, fontWeight: 700, color: col, lineHeight: 1 }}>{a.score}</div>
              <div style={{ fontSize: 8, color: "var(--ink3)", fontWeight: 700 }}>/100</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink3)" }}>Folio AI skóre</div>
            <div className="fd" style={{ fontSize: 19, fontWeight: 600, color: col, margin: "2px 0" }}>{lab}</div>
            <div style={{ fontSize: 12, color: "var(--ink2)" }}>
              Riziko: <b>{a.risk}</b>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 17 }}>📏</span>
            <span style={{ fontWeight: 800, fontSize: 14 }}>52týdenní rozpětí</span>
          </div>
          <div style={{ position: "relative", height: 10, borderRadius: 6, background: `linear-gradient(to right,var(--coral)55,var(--amber)55,var(--limedeep)55)`, margin: "18px 0 6px" }}>
            <div style={{ position: "absolute", top: "50%", left: `${posPct}%`, transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: cc, border: "3px solid var(--surface)", boxShadow: "0 2px 8px rgba(0,0,0,.25)" }} />
            <div style={{ position: "absolute", top: -22, left: `${posPct}%`, transform: "translateX(-50%)", fontSize: 11, fontWeight: 800, color: cc, whiteSpace: "nowrap" }}>€{price(a.price)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink2)", fontWeight: 600 }}>
            <span>min €{fmtN(lo)}</span>
            <span>max €{fmtN(hi)}</span>
          </div>
        </div>
      </div>

      {/* performance chips */}
      {rets.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 17 }}>🗓️</span>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Výkonnost</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {rets.map(([k, v]) => {
                const pos = v >= 0;
                return (
                  <div key={k} style={{ flex: 1, minWidth: 64, background: pos ? "var(--limesoft)" : "var(--coralsoft)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div>
                    <div className="fd" style={{ fontSize: 17, fontWeight: 600, marginTop: 2, color: pos ? "var(--limedeep)" : "var(--coral)" }}>
                      {pos ? "+" : ""}
                      {v}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* fundamentals sections */}
      <div className="h2" style={{ fontSize: 20, margin: "4px 0 12px" }}>Kompletní fundamenty</div>
      <div className="grid two" style={{ alignItems: "start", marginBottom: 18 }}>
        {/* valuation */}
        <Sect emo="💰" title="Ocenění">
          <Frow label={kind === "etf" || kind === "etc" ? "Velikost fondu (AUM)" : "Tržní kapitalizace"} val={a.aum || a.mcap} />
          {kind === "stock" && <Frow label="P/E (Price/Earnings)" val={fmtN(a.pe)} help="Cena ku zisku — kolik se platí za 1 € ročního zisku" />}
          {kind === "stock" && a.fwdPe != null && <Frow label="Forward P/E" val={fmtN(a.fwdPe)} help="Očekávané P/E z příštích zisků" />}
          {kind === "stock" && <Frow label="P/S (Price/Sales)" val={fmtN(a.ps)} help="Cena ku tržbám" />}
          {kind === "stock" && a.pb != null && <Frow label="P/B (Price/Book)" val={fmtN(a.pb)} help="Cena ku účetní hodnotě" />}
          {kind === "stock" && a.evEbitda != null && <Frow label="EV/EBITDA" val={fmtN(a.evEbitda)} help="Hodnota podniku ku provoznímu zisku" />}
          {kind === "stock" && a.eps != null && <Frow label="Zisk na akcii (EPS)" val={"€" + fmtN(a.eps)} />}
        </Sect>

        {/* profitability & growth (stocks) */}
        {kind === "stock" && (
          <Sect emo="📈" title="Ziskovost a růst">
            <Frow label="ROE" val={a.roe != null ? a.roe.toFixed(1) + " %" : null} help="Návratnost vlastního kapitálu" />
            <Frow label="Hrubá marže" val={a.grossM != null ? a.grossM + " %" : null} />
            <Frow label="Provozní marže" val={a.opM != null ? a.opM + " %" : null} />
            <Frow label="Čistá marže" val={a.netM != null ? a.netM + " %" : null} />
            <Frow label="Růst tržeb (r/r)" val={pctVal(a.revG)} />
            <Frow label="FCF yield" val={a.fcfY != null ? a.fcfY + " %" : null} help="Volný cash flow ku tržní kapitalizaci" />
          </Sect>
        )}

        {/* dividend (stocks) */}
        {kind === "stock" && (
          <Sect emo="💸" title="Dividenda">
            <Frow label="Dividendový výnos" val={a.divY != null ? a.divY + " %" : null} />
            <Frow label="Výplatní poměr" val={a.payout != null ? a.payout + " %" : null} help="Podíl zisku vyplácený na dividendách" />
            <Frow label="Historie dividend" val={a.divStreak} />
          </Sect>
        )}

        {/* risk & trading */}
        <Sect emo="🛡️" title="Riziko a obchodování">
          <Frow label="Beta" val={a.beta != null ? fmtN(a.beta) : null} help="Citlivost na pohyby trhu (1 = jako trh)" />
          <Frow label="Volatilita (1R)" val={a.vol1y} />
          <Frow label="Max. pokles" val={a.maxdd} help="Největší historický propad od vrcholu" />
          <Frow label="52týdenní rozpětí" val={"€" + fmtN(a.low52) + " – €" + fmtN(a.high52)} />
          {a.duration && <Frow label="Durace" val={a.duration} help="Citlivost dluhopisů na změnu sazeb" />}
          {a.ytm && <Frow label="Výnos do splatnosti (YTM)" val={a.ytm} />}
          {a.credit && <Frow label="Úvěrová kvalita" val={a.credit} />}
          {(a.ter || a.ongoing) && <Frow label="Roční poplatek (TER)" val={a.ter || a.ongoing} />}
        </Sect>

        {/* about (kind-specific) */}
        {kind === "stock" ? (
          <Sect emo="🏢" title="O firmě">
            <Frow label="Sektor" val={a.sector} />
            <Frow label="Odvětví" val={a.industry} />
            <Frow label="Sídlo" val={a.region} />
            <Frow label="Založeno" val={a.founded} />
            <Frow label="CEO" val={a.ceo} />
            <Frow label="Zaměstnanci" val={a.employees} />
            <Frow label="Burza" val={a.exchange} />
            <Frow label="ISIN" val={a.isin} />
          </Sect>
        ) : kind === "crypto" ? (
          <Sect emo="⚙️" title="O kryptoaktivu">
            <Frow label="Typ" val={a.sector} />
            <Frow label="Max. nabídka" val={a.supply} />
            <Frow label="V oběhu" val={a.circ} />
            <Frow label="Konsensus" val={a.consensus} />
            {a.dominance && <Frow label="Dominance trhu" val={a.dominance} />}
            {a.staking && <Frow label="Staking odměna" val={a.staking} />}
            <Frow label="Spuštěno" val={a.inception} />
          </Sect>
        ) : (
          <Sect emo="🧩" title="O fondu">
            <Frow label="Zaměření" val={a.sector} />
            <Frow label="Region" val={a.region} />
            <Frow label="Počet pozic" val={a.holdings} />
            <Frow label="Replikace" val={a.replication} />
            <Frow label="Distribuce" val={a.dist || a.backing} />
            <Frow label="Měna" val={a.currency} />
            <Frow label="Burza" val={a.exchange} />
            <Frow label="ISIN" val={a.isin} />
            <Frow label="Spuštěno" val={a.inception} />
            {a.top && a.top.length > 0 && (
              <div style={{ padding: "10px 0 2px" }}>
                <div style={{ fontSize: 12.5, color: "var(--ink2)", marginBottom: 8 }}>Největší pozice</div>
                {a.top.map((t) => (
                  <div key={t[0]} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}>
                    <span>{t[0]}</span>
                    <span style={{ fontWeight: 700, color: cc }}>{t[1]}</span>
                  </div>
                ))}
              </div>
            )}
          </Sect>
        )}
      </div>

      {/* per-asset news */}
      <div className="h2" style={{ fontSize: 20, margin: "4px 0 12px" }}>📰 Novinky k {a.sym}</div>
      <div className="stagger">
        {news.map((n, i) => {
          const img = NEWS_IMG[i % NEWS_IMG.length];
          return (
            <div key={n[1] + i} className="card lift" style={{ padding: 0, overflow: "hidden", display: "flex", gap: 0, alignItems: "stretch", marginBottom: 10 }}>
              <div style={{ width: 96, flexShrink: 0, background: "var(--panel)", position: "relative", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://images.unsplash.com/${img}?w=240&q=70&auto=format&fit=crop`}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <span className="chip" style={{ background: cc + "1f", color: cc, padding: "2px 8px", fontSize: 9.5 }}>{n[0]}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink3)", fontWeight: 600 }}>{n[3]}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.25, marginBottom: 3 }}>{n[1]}</div>
                <div style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.45 }}>{n[2]}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="disc" style={{ textAlign: "center", marginTop: 18 }}>
        Tržní data, fundamenty i novinky jsou pro toto demo simulované. Není to investiční poradenství.
      </div>
    </div>
  );
}
