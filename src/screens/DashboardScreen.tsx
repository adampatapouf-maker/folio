"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { pfCompute, defaultHoldings, pfHistory } from "@/lib/calc/portfolio";
import { computeCompound } from "@/lib/calc/compound";
import { taxComputeCZ } from "@/lib/calc/tax";
import { STRAT, PF_RANKING } from "@/data/portfolio";
import { FEED } from "@/data/social";
import { fmt, kc } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { Sparkline, GrowthChart } from "@/components/charts/Charts";
import type { ViewId } from "@/lib/types";

function QuickCard({ view, title, desc, bg, accent, icon }: { view: ViewId; title: string; desc: string; bg: string; accent: string; icon: string }) {
  const go = useFolioStore((s) => s.go);
  return (
    <button onClick={() => go(view)} className="card" style={{ padding: 16, textAlign: "left", background: bg, border: "none" }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon name={icon} size={17} color="#fff" stroke={2.3} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink2)", lineHeight: 1.45 }}>{desc}</div>
    </button>
  );
}

export function DashboardScreen() {
  const holdings = useFolioStore((s) => s.holdings) ?? defaultHoldings();
  const p = pfCompute(holdings);
  const calc = useFolioStore((s) => s.calc);
  const tax = useFolioStore((s) => s.tax);
  const isPrem = useFolioStore((s) => s.plan) === "premium";
  const go = useFolioStore((s) => s.go);
  const startBuilder = useFolioStore((s) => s.startBuilder);
  const openAsset = useFolioStore((s) => s.openAsset);
  const setCalc = useFolioStore((s) => s.setCalc);

  const plUp = p.pl >= 0;
  const myRank = PF_RANKING.findIndex((r) => r.you) + 1;
  const hist = pfHistory(p.val);

  const res = computeCompound(calc.initial, calc.monthly, calc.rate, calc.years);
  const R = taxComputeCZ(tax.buy, tax.sell, tax.months, tax.dip);

  return (
    <div className="fade" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="sub">Dobré ráno</div>
      <div className="h1" style={{ marginBottom: 6 }}>
        Vítej zpět
      </div>
      <div style={{ fontSize: 13.5, color: "var(--ink2)", marginBottom: 20 }}>
        Folio ti každý týden i měsíc pošle report, sestaví portfolio a vysvětlí trhy přes AI.
      </div>

      {/* ===== PILLAR 1 — REPORTS (hero) ===== */}
      <div style={{ background: "var(--panel)", borderRadius: 24, padding: 22, color: "var(--panelink)", position: "relative", overflow: "hidden", marginBottom: 14 }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 190, height: 190, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
            <Icon name="report" size={15} color="var(--lime)" stroke={2.2} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--lime)" }}>Tvůj report · jádro Folia</span>
          </div>
          <div className="fd hero-num" style={{ fontSize: 25, fontWeight: 500, lineHeight: 1.25, marginBottom: 8 }}>Každý týden a měsíc ti pošleme přehledný report.</div>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.72)", lineHeight: 1.6, marginBottom: 8 }}>
            Co se děje na trzích, jak si vede tvé portfolio a kam směřovat další vklad — srozumitelně a bez tlaku.
          </div>
          <div style={{ display: "flex", gap: 10, margin: "14px 0" }}>
            <button onClick={() => go("report")} className="pressable" style={{ flex: 1, textAlign: "left", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, padding: 13 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--lime)" }}>Týdenní</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3, color: "#fff" }}>Co se hýbe</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 1 }}>taktické kroky</div>
            </button>
            <button onClick={() => go("report")} className="pressable" style={{ flex: 1, textAlign: "left", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, padding: 13 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--purple)" }}>Měsíční</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3, color: "#fff" }}>Plán příkupu</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 1 }}>strategie + rebalanc</div>
            </button>
          </div>
          <button onClick={() => go("report")} className="pressable" style={{ width: "100%", background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 14, padding: 13, borderRadius: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Icon name="report" size={16} color="var(--inkfix)" stroke={2.3} /> Otevřít tento týden
            {!isPrem && <span style={{ fontWeight: 700, opacity: 0.65 }}> · ukázka zdarma</span>}
          </button>
        </div>
      </div>

      {/* ===== PILLARS 2 & 3 — Folio AI + Portfolio builder ===== */}
      <div className="grid two" style={{ marginBottom: 14 }}>
        <button onClick={() => go("ai")} className="card lift" style={{ padding: 18, textAlign: "left", position: "relative", overflow: "hidden" }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--grad-lime)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: "0 4px 14px rgba(204,255,0,.4)" }}>
            <Icon name="chat" size={22} color="var(--inkfix)" stroke={2.3} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 3 }}>Folio AI</div>
          <div style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5 }}>Zeptej se na trhy, své pozice a investování. Vysvětlí, neporadí co koupit.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--limedeep)", fontWeight: 800, marginTop: 10 }}>
            Zeptat se <Icon name="chevR" size={14} color="var(--limedeep)" stroke={2.6} />
          </div>
        </button>
        <button onClick={() => startBuilder()} className="card lift" style={{ padding: 18, textAlign: "left", position: "relative", overflow: "hidden" }}>
          {!isPrem && (
            <span className="chip" style={{ position: "absolute", top: 14, right: 14, background: "var(--lime)", color: "var(--inkfix)", padding: "2px 8px", fontSize: 9 }}>
              PREMIUM
            </span>
          )}
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Icon name="sparkles" size={22} color="var(--lime)" stroke={2.3} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 3 }}>Sestavit portfolio</div>
          <div style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5 }}>6 otázek a AI ti navrhne portfolio na míru s konkrétními nástroji.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--limedeep)", fontWeight: 800, marginTop: 10 }}>
            {isPrem ? "Spustit dotazník " : "Odemknout "}
            <Icon name="chevR" size={14} color="var(--limedeep)" stroke={2.6} />
          </div>
        </button>
      </div>

      {/* AI daily market line */}
      <button onClick={() => go("ai")} className="card lift" style={{ width: "100%", textAlign: "left", padding: "15px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="sparkles" size={17} color="var(--lime)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--limedeep)" }}>Folio AI · dnešní trh</div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginTop: 2 }}>Akciová ETF vedou, dluhopisy stagnují, zlato roste na nižší inflaci.</div>
        </div>
        <Icon name="chevR" size={16} color="var(--ink3)" />
      </button>

      {/* ===== PORTFOLIO SNAPSHOT ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="h2" style={{ fontSize: 18 }}>Moje portfolio</div>
        <button onClick={() => go("portfolio")} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>Detail →</button>
      </div>
      <button onClick={() => go("portfolio")} className="card lift" style={{ width: "100%", padding: 20, textAlign: "left", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div className="sub" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name="wallet" size={13} color="var(--limedeep)" stroke={2} /> Hodnota
            </div>
            <div className="fd hero-num" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1, marginTop: 2 }}>{fmt(p.val)}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: plUp ? "var(--limedeep)" : "var(--coral)", marginTop: 3 }}>
              {plUp ? "▲ +" : "▼ "}
              {p.plPct.toFixed(1)}% · {plUp ? "+" : ""}
              {fmt(Math.abs(p.pl))}
            </div>
          </div>
          <span className="tag" style={{ background: "var(--limesoft)", color: "var(--ink)" }}>{STRAT.risk}</span>
        </div>
        <div style={{ height: 46 }}>
          <Sparkline data={hist.map((x) => x.v)} up={p.pl >= 0} />
        </div>
      </button>

      {/* ranking */}
      <button onClick={() => go("portfolio")} className="card lift" style={{ width: "100%", padding: 18, textAlign: "left", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 700, fontSize: 14 }}>
            <Icon name="trophy" size={17} color="var(--gold)" stroke={2} /> Žebříček portfolií
          </div>
          <span className="chip" style={{ background: "var(--limesoft)", color: "var(--ink)" }}>
            Jsi {myRank}. z {PF_RANKING.length}
          </span>
        </div>
      </button>

      {/* ===== CALCULATOR widget ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="h2" style={{ fontSize: 18 }}>Kalkulačka</div>
        <button onClick={() => go("calc")} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>Rozšířená →</button>
      </div>
      <div className="card lift" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 11, color: "var(--ink2)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Hodnota za {calc.years} let</div>
            <div className="fd hero-num" style={{ fontSize: 32, fontWeight: 600, color: "var(--limedeep)", lineHeight: 1, marginTop: 3 }}>{fmt(res.final)}</div>
            <div style={{ fontSize: 12, color: "var(--ink2)", marginTop: 3 }}>
              z toho úroky <b style={{ color: "var(--limedeep)" }}>{fmt(res.interest)}</b>
            </div>
          </div>
          <div style={{ width: 130, height: 64, flexShrink: 0 }}>
            <GrowthChart principal={res.principal} total={res.total} mode="line" />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink2)" }}>Měsíční vklad</span>
            <span className="fd" style={{ fontSize: 17, fontWeight: 600 }}>€{calc.monthly.toLocaleString("cs-CZ")}</span>
          </div>
          <input type="range" className="lime" min={0} max={2000} step={25} value={Math.min(calc.monthly, 2000)} onChange={(e) => setCalc("monthly", Number(e.target.value))} />
        </div>
        <button onClick={() => go("calc")} className="pressable" style={{ width: "100%", marginTop: 14, background: "var(--surface2)", color: "var(--ink)", fontWeight: 700, fontSize: 13, padding: 11, borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon name="calc" size={15} color="var(--ink)" stroke={2.2} /> Porovnat s dluhopisy, spořákem &amp; DIP
        </button>
      </div>

      {/* ===== DAŇOVÝ PORADCE widget ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="h2" style={{ fontSize: 18 }}>Daňový poradce</div>
        <button onClick={() => go("tax")} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>Spočítat →</button>
      </div>
      <button onClick={() => go("tax")} className="card lift" style={{ width: "100%", textAlign: "left", padding: 20, marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -26, right: -26, width: 96, height: 96, borderRadius: "50%", background: R.exempt ? "var(--limesoft)" : "var(--coralsoft)", opacity: 0.7 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="dollar" size={17} color="var(--limedeep)" stroke={2.3} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink3)" }}>Daň z prodeje akcií · ČR</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div className="fd" style={{ fontSize: 30, fontWeight: 600, color: R.exempt ? "var(--limedeep)" : "var(--coral)", lineHeight: 1 }}>
              {R.exempt ? "0 Kč" : kc(R.tax)}
            </div>
            <span className="chip" style={{ background: R.exempt ? "var(--limesoft)" : "var(--coralsoft)", color: R.exempt ? "var(--limedeep)" : "var(--coral)" }}>
              {R.exempt ? "✓ Osvobozeno" : "Daní se 15 %"}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5, marginTop: 8 }}>
            {R.exempt ? (
              R.timeTest ? (
                <>Splňuješ <b>časový test</b> (3+ roky držby).</>
              ) : (
                <>Splňuješ <b>hodnotový test</b> (prodej do 100 000 Kč).</>
              )
            ) : (
              <>Nesplňuješ časový ani hodnotový test — zisk {kc(R.gain)} podléhá dani.</>
            )}
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
            <span className="chip" style={{ background: R.timeTest ? "var(--limesoft)" : "var(--surface2)", color: R.timeTest ? "var(--limedeep)" : "var(--ink3)" }}>
              {R.timeTest ? "✓" : "○"} Časový test (3 roky)
            </span>
            <span className="chip" style={{ background: R.valueTest ? "var(--limesoft)" : "var(--surface2)", color: R.valueTest ? "var(--limedeep)" : "var(--ink3)" }}>
              {R.valueTest ? "✓" : "○"} Hodnotový test (100k)
            </span>
          </div>
        </div>
      </button>

      {/* ===== NOVINKY ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="h2" style={{ fontSize: 18 }}>Novinky</div>
        <button onClick={() => go("news")} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>Vše →</button>
      </div>
      <div className="hscroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, marginBottom: 24, scrollSnapType: "x mandatory" }}>
        {FEED.slice(0, 5).map((f, i) => (
            <button
              key={f.sym ?? `news-${i}`}
              onClick={() => (f.sym ? openAsset(f.sym) : go("news"))}
              className="card lift"
              style={{ flex: "0 0 230px", padding: 0, overflow: "hidden", textAlign: "left", scrollSnapAlign: "start" }}
            >
              <div style={{ position: "relative", height: 120, background: "var(--panel)", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://images.unsplash.com/${f.img}?w=460&q=70&auto=format&fit=crop`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(13,17,23,.1) 40%,rgba(13,17,23,.82) 100%)" }} />
                <span className="chip" style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,.22)", color: "#fff", backdropFilter: "blur(6px)", fontSize: 9 }}>{f.tag}</span>
                {f.sym && (
                  <span style={{ position: "absolute", bottom: 10, left: 10, display: "inline-flex" }}>
                    <LogoTile sym={f.sym} size={26} radius={8} />
                  </span>
                )}
              </div>
              <div style={{ padding: "12px 13px" }}>
                <div className="fd" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{f.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 11, color: "var(--ink3)", fontWeight: 600 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <Icon name="heart" size={11} color="var(--coral)" stroke={2.2} /> {f.likes}
                  </span>
                  <span>· {f.time}</span>
                </div>
              </div>
            </button>
        ))}
      </div>

      {/* ===== SECONDARY — Také v Foliu ===== */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink3)" }}>Také v Foliu</span>
        <div style={{ height: 1, flex: 1, background: "var(--line)" }} />
      </div>
      <div className="grid four">
        <QuickCard view="data" title="Trh" desc="Data aktiv, grafy a AI skóre." bg="var(--bluesoft)" accent="var(--blue)" icon="data" />
        <QuickCard view="calendar" title="Kalendář" desc="Výsledky, dividendy, sazby." bg="var(--purplesoft)" accent="var(--purple)" icon="calendar" />
        <QuickCard view="tax" title="Daně" desc="Spočítej daň z investic." bg="var(--limesoft)" accent="var(--limedeep)" icon="dollar" />
        <QuickCard view="academy" title="Akademie" desc="Nauč se investovat." bg="var(--ambersoft)" accent="var(--amber)" icon="academy" />
        <QuickCard view="discuss" title="Diskuze" desc="Názory komunity." bg="var(--tealsoft)" accent="var(--teal)" icon="hash" />
      </div>
      <div className="disc" style={{ textAlign: "center", marginTop: 24 }}>
        Folio je informační a vzdělávací nástroj. Neprovádí obchody ani neposkytuje personalizované investiční poradenství. Demo data. Kapitál je v riziku.
      </div>
    </div>
  );
}
