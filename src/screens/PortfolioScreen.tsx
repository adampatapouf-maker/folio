"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { pfCompute, defaultHoldings, pfHistory } from "@/lib/calc/portfolio";
import { PF_RANKING } from "@/data/portfolio";
import { CAT_COLOR } from "@/lib/assets";
import { fmt } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { Donut, DonutPal, AreaChart, palColor } from "@/components/charts/Charts";
import type { AssetCategory, Allocation, PortfolioComputed } from "@/lib/types";

const TABS: [string, string][] = [
  ["overview", "Přehled"],
  ["composition", "Složení"],
  ["ranking", "Žebříček"],
];

const units = (u: number) => (u % 1 === 0 ? String(u) : u.toFixed(2));

export function PortfolioScreen() {
  const holdings = useFolioStore((s) => s.holdings) ?? defaultHoldings();
  const tab = useFolioStore((s) => s.pfTab);
  const setPfTab = useFolioStore((s) => s.setPfTab);
  const go = useFolioStore((s) => s.go);
  const p = pfCompute(holdings);

  const hist = pfHistory(p.val);
  const plUp = p.pl >= 0;

  return (
    <div className="fade" style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="sub">Sledování mých pozic</div>
      <div className="h1" style={{ marginBottom: 4 }}>
        Moje portfolio
      </div>
      <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 8, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        <Icon name="wallet" size={15} color="var(--limedeep)" stroke={2} /> Tvé skutečné pozice a jejich vývoj.{" "}
        <span style={{ color: "var(--ink3)" }}>≠ Data aktiv (to je celý trh).</span>{" "}
        <button onClick={() => go("data")} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>
          Procházet trh →
        </button>
      </div>

      <div style={{ background: "var(--grad-hero)", borderRadius: 24, padding: 24, color: "var(--panelink)", position: "relative", overflow: "hidden", marginBottom: 16 }}>
        <div style={{ position: "absolute", top: -50, right: -40, width: 170, height: 170, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                Hodnota mého portfolia
              </div>
              <div className="fd" style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.05, marginTop: 2 }}>
                {fmt(p.val)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: plUp ? "var(--lime)" : "var(--coral)", marginTop: 4 }}>
                {plUp ? "▲ +" : "▼ "}
                {fmt(Math.abs(p.pl))} ({plUp ? "+" : ""}
                {p.plPct.toFixed(1)} %)
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 700, textTransform: "uppercase" }}>Vloženo</div>
              <div className="fd" style={{ fontSize: 20, marginTop: 2 }}>{fmt(p.inv)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 8, fontWeight: 700, textTransform: "uppercase" }}>Pozic</div>
              <div className="fd" style={{ fontSize: 20, marginTop: 2 }}>{p.rows.length}</div>
            </div>
          </div>
          <div style={{ height: 90, marginTop: 14 }}>
            <AreaChart vals={hist.map((x) => x.v)} labels={hist.map((x) => x.m)} />
          </div>
        </div>
      </div>

      <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {TABS.map((t) => {
          const on = tab === t[0];
          return (
            <button
              key={t[0]}
              onClick={() => setPfTab(t[0])}
              className="pressable"
              style={{
                padding: "8px 15px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                background: on ? "var(--lime)" : "var(--surface)",
                color: on ? "var(--inkfix)" : "var(--ink)",
                border: `1px solid ${on ? "var(--lime)" : "var(--line)"}`,
              }}
            >
              {t[1]}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <Overview p={p} />}
      {tab === "composition" && <Composition p={p} />}
      {tab === "ranking" && <Ranking />}

      <div className="disc" style={{ textAlign: "center", marginTop: 18 }}>
        Portfolio i žebříček jsou pro toto demo simulované. Folio neprovádí obchody ani neposkytuje personalizované poradenství.
      </div>
    </div>
  );
}

function Overview({ p }: { p: PortfolioComputed }) {
  const pfEdit = useFolioStore((s) => s.pfEdit);
  const togglePfEdit = useFolioStore((s) => s.togglePfEdit);
  const pfAdjust = useFolioStore((s) => s.pfAdjust);
  const pfRemove = useFolioStore((s) => s.pfRemove);
  const openAddAsset = useFolioStore((s) => s.openAddAsset);
  const openAsset = useFolioStore((s) => s.openAsset);

  return (
    <>
      <div className="grid two" style={{ alignItems: "start", marginBottom: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Rozložení podle tříd</div>
          <div className="mrow" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="cwrap" style={{ width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={p.allocCat} inner={0.62} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              {p.allocCat.map((a) => (
                <div key={a[0]} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: CAT_COLOR[a[0] as AssetCategory] }} />
                  <span style={{ fontSize: 12.5, flex: 1 }}>{a[0]}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 800 }}>{a[1]}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Největší pozice</span>
          </div>
          {[...p.rows]
            .sort((a, b) => b.mv - a.mv)
            .slice(0, 4)
            .map((r) => (
              <button
                key={r.sym}
                onClick={() => openAsset(r.sym)}
                className="pressable"
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid var(--line)", textAlign: "left" }}
              >
                <LogoTile sym={r.sym} size={38} radius={11} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{r.sym}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink2)" }}>{fmt(r.mv)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: r.pl >= 0 ? "var(--limedeep)" : "var(--coral)" }}>
                    {r.pl >= 0 ? "+" : ""}
                    {r.plPct.toFixed(1)}%
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {pfEdit ? (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button
              onClick={openAddAsset}
              className="pressable"
              style={{ flex: 1, background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 13.5, padding: 12, borderRadius: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}
            >
              <Icon name="plus" size={16} color="var(--inkfix)" stroke={2.4} /> Přidat akcii
            </button>
            <button onClick={togglePfEdit} className="pressable" style={{ background: "var(--surface2)", color: "var(--ink)", fontWeight: 800, fontSize: 13.5, padding: "12px 18px", borderRadius: 13 }}>
              Hotovo
            </button>
          </div>
          <div className="card" style={{ padding: "6px 0 8px" }}>
            {p.rows.length ? (
              p.rows.map((r) => (
                <div key={r.sym} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                  <LogoTile sym={r.sym} size={38} radius={11} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800 }}>{r.sym}</div>
                    <div style={{ fontSize: 11, color: "var(--ink2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => pfAdjust(r.sym, -1)} className="pressable" style={{ width: 30, height: 30, borderRadius: 9, background: "var(--surface2)", color: "var(--ink)", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      −
                    </button>
                    <span className="fd" style={{ minWidth: 42, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{units(r.units)}</span>
                    <button onClick={() => pfAdjust(r.sym, 1)} className="pressable" style={{ width: 30, height: 30, borderRadius: 9, background: "var(--surface2)", color: "var(--ink)", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      +
                    </button>
                  </div>
                  <button onClick={() => pfRemove(r.sym)} className="pressable" aria-label="Odebrat" style={{ width: 32, height: 32, borderRadius: 9, background: "var(--coralsoft)", color: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="trash" size={16} color="var(--coral)" stroke={2} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--ink2)", fontSize: 13.5 }}>Portfolio je prázdné. Přidej první akcii.</div>
            )}
          </div>
          <div className="disc" style={{ textAlign: "center", marginTop: 14 }}>Úpravy jsou jen pro toto demo a neukládají se po zavření aplikace.</div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--ink2)" }}>{p.rows.length} pozic v portfoliu</span>
            <button onClick={togglePfEdit} className="pressable" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "var(--limedeep)", background: "var(--limesoft)", padding: "8px 14px", borderRadius: 11 }}>
              <Icon name="edit" size={14} color="var(--limedeep)" stroke={2.2} /> Upravit
            </button>
          </div>
          <div className="card" style={{ padding: "6px 18px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 8px", borderBottom: "2px solid var(--line)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink3)" }}>
              <span>Aktivum</span>
              <span>Hodnota / Zisk</span>
            </div>
            {p.rows.length ? (
              p.rows.map((r) => (
                <button key={r.sym} onClick={() => openAsset(r.sym)} className="pressable" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                  <LogoTile sym={r.sym} size={40} radius={12} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{r.sym}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {units(r.units)} ks · ø {fmt(r.avg)}
                    </div>
                  </div>
                  <div className="nowrapnum" style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="fd" style={{ fontSize: 15, fontWeight: 600 }}>{fmt(r.mv)}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: r.pl >= 0 ? "var(--limedeep)" : "var(--coral)" }}>
                      {r.pl >= 0 ? "▲ " : "▼ "}
                      {Math.abs(r.plPct).toFixed(1)}%
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div style={{ padding: "28px 0", textAlign: "center", color: "var(--ink2)", fontSize: 13.5 }}>Žádné pozice. Klikni na „Upravit“ a přidej akcie.</div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function Composition({ p }: { p: PortfolioComputed }) {
  const Block = ({ title, emo, data, usePal }: { title: string; emo: string; data: Allocation; usePal: boolean }) => (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{emo}</span>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{title}</span>
      </div>
      <div className="mrow" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className="cwrap" style={{ width: 120, height: 120, flexShrink: 0 }}>
          {usePal ? <DonutPal data={data} inner={0.62} /> : <Donut data={data} inner={0.62} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.map((a, i) => (
            <div key={a[0]} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: usePal ? palColor(i) : CAT_COLOR[a[0] as AssetCategory] }} />
              <span style={{ fontSize: 12, flex: 1 }}>{a[0]}</span>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{a[1]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid two" style={{ alignItems: "start" }}>
      <Block title="Třídy aktiv" emo="🧩" data={p.allocCat} usePal={false} />
      <Block title="Sektory" emo="🏭" data={p.allocSector} usePal={true} />
      <Block title="Měny" emo="💱" data={p.allocCurrency} usePal={true} />
      <Block title="Region / původ" emo="🌍" data={p.allocRegion} usePal={true} />
    </div>
  );
}

function Ranking() {
  const max = Math.max(...PF_RANKING.map((r) => r.ytd));
  return (
    <>
      <div style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 14 }}>
        Porovnej výkonnost svého portfolia s komunitou (demo). Tvé portfolio je zvýrazněné.
      </div>
      {PF_RANKING.map((r, i) => (
        <div
          key={r.name}
          className={r.you ? "glow" : undefined}
          style={{ display: "flex", alignItems: "center", gap: 13, padding: 14, borderRadius: 16, marginBottom: 9, background: r.you ? "var(--limesoft)" : "var(--surface)", border: `1px solid ${r.you ? "var(--lime)" : "var(--line)"}` }}
        >
          <div className="fd" style={{ fontSize: 18, fontWeight: 700, width: 26, textAlign: "center", color: i < 3 ? "var(--limedeep)" : "var(--ink3)", flexShrink: 0 }}>
            {i + 1}
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: `linear-gradient(135deg,${r.color},${r.color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, boxShadow: `0 4px 12px ${r.color}55` }}>
            {r.badge}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14.5, fontWeight: 800 }}>{r.name}</span>
              {r.you && (
                <span className="chip" style={{ background: "var(--lime)", color: "var(--inkfix)", padding: "1px 7px", fontSize: 9 }}>
                  TY
                </span>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink2)" }}>
              Riziko: {r.risk}
              {r.you ? "" : ` · ${r.followers} sledujících`}
            </div>
            <div style={{ height: 5, background: "var(--surface2)", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(r.ytd / max) * 100}%`, background: r.color, borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className="fd" style={{ fontSize: 18, fontWeight: 600, color: "var(--limedeep)" }}>+{r.ytd.toFixed(1)}%</div>
            <div style={{ fontSize: 10, color: "var(--ink3)", fontWeight: 700 }}>YTD</div>
          </div>
        </div>
      ))}
      <div className="card" style={{ padding: 18, marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>💡</span>
        <div style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.5 }}>
          Žebříček porovnává <b>procentní výnos</b>, ne velikost portfolia — malý i velký investor soupeří férově.
        </div>
      </div>
    </>
  );
}
