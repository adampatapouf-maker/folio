"use client";
import { useState } from "react";
import { useFolioStore } from "@/store/useFolioStore";
import { pfCompute, defaultHoldings, pfHistory } from "@/lib/calc/portfolio";
import { STRAT } from "@/data/portfolio";
import { CALENDAR, CAL_META, BANK_LOGO } from "@/data/calendar";
import { CAT_COLOR } from "@/lib/assets";
import { fmt } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { Donut, AreaChart } from "@/components/charts/Charts";
import type { AssetCategory, CalendarType } from "@/lib/types";

interface Move {
  label: string;
  color: string;
  bg: string;
  asset: string;
  text: string;
  why: string[];
}

const REPORT_MOVES: Move[] = [
  { label: "Zvážit navýšení", color: "var(--inkfix)", bg: "var(--lime)", asset: "Globální akciové ETF (VWCE)", text: "Pod cílovou váhou s pozitivním trendovým signálem. Většina měsíčního příkupu míří sem.", why: ["Kategorie je 8 % pod cílovou váhou", "Skóre aktiva: 78/100 (pozitivní)", "Cena nad SMA50 i SMA200"] },
  { label: "Držet dle strategie", color: "#fff", bg: "var(--purple)", asset: "Dluhopisové ETF (AGGH)", text: "Neutrální trend, ale stabilizační role. Držet na strategické váze, nenavyšovat.", why: ["Na cílové váze", "Skóre: 55/100 (neutrální)", "Snižuje celkovou volatilitu portfolia"] },
  { label: "Sledovat", color: "var(--inkfix)", bg: "var(--amber)", asset: "NVIDIA", text: "Zvýšená volatilita. Model nenavrhuje změnu, dokud se trh neustálí.", why: ["Implikovaná volatilita na 6měsíčním maximu", "Skóre: 72/100 (pozitivní)", "Vyšší riziko v krátkém období"] },
  { label: "Nenavyšovat", color: "#fff", bg: "var(--coral)", asset: "Bitcoin", text: "Již na 3% limitu krypta pro vyváženou strategii. Model nepřidává nad limit.", why: ["Na limitu strategie pro krypto (3 %)", "Skóre: 35/100 (zvýšené riziko)", "Vysoký drawdown vůči ostatním kategoriím"] },
];

const MONTHLY_MOVES: Move[] = [
  { label: "Rebalancovat ↑", color: "var(--inkfix)", bg: "var(--lime)", asset: "Akciová ETF — doplnit do cíle", text: "Po růstu trhu i tak zůstává akciová složka mírně pod 50% cílem. Měsíční příkup míří primárně sem.", why: ["Aktuální váha 46 % vs. cíl 50 %", "Dlouhodobé jádro portfolia", "Příkup levnější než prodej kvůli daním a poplatkům"] },
  { label: "Rebalancovat ↓", color: "var(--inkfix)", bg: "var(--amber)", asset: "Růstové akcie — zafixovat zisk", text: "Růstová složka po silných měsících přerostla cíl. Model navrhuje nové příkupy sem nesměřovat.", why: ["Váha 13 % vs. cíl 10 %", "Po rebalancování klesá koncentrace rizika", "Zisk se „přelévá“ do podvážených tříd"] },
  { label: "Plán příkupu", color: "#fff", bg: "var(--purple)", asset: "Pravidelná investice (DCA)", text: "Měsíční částku rozděl podle cílové strategie — viz plán rozdělení níže. Investuj bez ohledu na zprávy.", why: ["DCA dlouhodobě poráží časování trhu", "Automatické rozdělení drží disciplínu", "Snižuje riziko špatného načasování"] },
  { label: "Horizont", color: "#fff", bg: "var(--coral)", asset: "Dlouhodobý pohled", text: "Měsíční pohled ignoruje denní šum. Klíčové je dodržet strategii a nechat složené úročení pracovat.", why: ["1 měsíc = šum, 10 let = signál", "Drž se zvolené alokace", "Přehodnocuj strategii max. 1–2× ročně"] },
];

/** Central bank logo chip (mirrors the prototype's bankLogo). */
function BankLogo({ bank, size = 36 }: { bank: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const domain = BANK_LOGO[bank];
  const fs = Math.round(size * 0.42);
  if (domain && !failed) {
    return (
      <div style={{ width: size, height: size, borderRadius: 13, background: "#fff", border: "1px solid rgba(0,0,0,.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", boxShadow: "0 3px 9px rgba(0,0,0,.1)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://logo.clearbit.com/${domain}?size=80`} alt="" style={{ width: "72%", height: "72%", objectFit: "contain" }} onError={() => setFailed(true)} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 13, background: "linear-gradient(135deg,#7B61FF,#7B61FFcc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs, flexShrink: 0 }}>
      🏦
    </div>
  );
}

function PremiumTeaser() {
  const setPlan = useFolioStore((s) => s.setPlan);
  const chips = ["💼 Dopad na portfolio", "🛡️ Rizikový profil", "🏭 Sektory", "📅 Co sledovat", "🤖 AI komentář"];
  return (
    <button onClick={() => setPlan("premium")} className="card lift" style={{ width: "100%", textAlign: "left", padding: 24, marginTop: 18, position: "relative", overflow: "hidden", background: "var(--panel)", color: "var(--panelink)" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Icon name="sparkles" size={16} color="var(--lime)" stroke={2.3} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--lime)" }}>Premium report</span>
        </div>
        <div className="fd" style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Odemkni celý report</div>
        <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.7)", lineHeight: 1.6, marginBottom: 16 }}>
          Měsíční plán příkupu, dopad na <b>tvé</b> portfolio, rizikové metriky, sektorový výhled a dlouhý komentář Folio AI.
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
          {chips.map((x) => (
            <span key={x} className="chip" style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}>{x}</span>
          ))}
        </div>
        <span style={{ background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 13.5, padding: "12px 22px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>✦ Odemknout Premium</span>
      </div>
    </button>
  );
}

function ReportExtras({ monthly }: { monthly: boolean }) {
  const go = useFolioStore((s) => s.go);
  const askAI = useFolioStore((s) => s.askAI);
  const holdings = useFolioStore((s) => s.holdings) ?? defaultHoldings();
  const p = pfCompute(holdings);
  const ph = pfHistory(p.val);

  const movers = [...p.rows].sort((a, b) => b.chg - a.chg);
  const best = movers[0];
  const worst = movers[movers.length - 1];

  const metrics: [string, string, string][] = [
    ["Volatilita (ann.)", "11,2 %", "#3D7BFF"],
    ["Sharpe ratio", "1,34", "#CCFF00"],
    ["Max. pokles", "−14 %", "#FF5A4E"],
    ["Beta vs. trh", "0,92", "#7B61FF"],
    ["Diverzifikace", "8 pozic", "#16C7C0"],
    ["Cash buffer", "6 %", "#FF9F1C"],
  ];

  const sectors: [string, string, string, string][] = [
    ["Technologie", "Pozitivní", "var(--limedeep)", "AI a cloud táhnou růst, valuace ale napjaté."],
    ["Spotřební zboží", "Neutrální", "var(--amber)", "Defenzivní, stabilní marže, pomalejší růst."],
    ["Finance", "Pozitivní", "var(--limedeep)", "Vyšší sazby podporují ziskovost bank."],
    ["Dluhopisy", "Zlepšující se", "var(--blue)", "Očekávané snižování sazeb zvedá ceny."],
  ];

  const upcoming = CALENDAR.slice(0, 4);

  const commentary = monthly
    ? "Z měsíčního pohledu zůstává prostředí konstruktivní. Akciová jádra portfolia těží ze silných výsledků technologického sektoru, zatímco dluhopisová složka začíná opět plnit roli stabilizátoru, jak se trh přiklání k očekávání nižších sazeb. Doporučený postup je disciplinovaný: pokračovat v pravidelném příkupu podle plánu výše, vrátit přerostlé třídy k cílovým vahám a nereagovat na denní šum. Hlavní riziko měsíce představují rozhodnutí tří centrálních bank — případný jestřábí tón by mohl krátkodobě zvýšit volatilitu napříč třídami."
    : "Tento týden potvrdil sílu širokého trhu — růst nebyl tažen jen úzkou skupinou titulů. Tvé portfolio z toho profitovalo zejména přes akciová ETF a růstovou složku. Krátkodobě sleduj zvýšenou volatilitu kolem výsledků NVIDIA a zasedání centrálních bank. Strategie se nemění: jádro drží, krypto zůstává na limitu, a případné nové prostředky míří do podvážených tříd.";

  return (
    <>
      {/* 1) portfolio impact */}
      <div className="card" style={{ padding: 22, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>💼</span>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Dopad na tvé portfolio</div>
        </div>
        <div style={{ fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 16 }}>
          Jak se {monthly ? "měsíc" : "týden"} propsal do tvých skutečných pozic. Hodnota portfolia je <b style={{ color: "var(--ink)" }}>{fmt(p.val)}</b> ({p.pl >= 0 ? "+" : ""}{p.plPct.toFixed(1)} %).
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ height: 130, flex: 1, minWidth: 220 }}>
            <AreaChart vals={ph.map((x) => x.v)} labels={ph.map((x) => x.m)} />
          </div>
          <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 220 }}>
            <div style={{ flex: 1, background: "var(--limesoft)", borderRadius: 13, padding: 13 }}>
              <LogoTile sym={best.sym} size={30} radius={9} />
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ink2)", textTransform: "uppercase", marginTop: 8 }}>Nejlepší</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{best.sym}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--limedeep)" }}>+{best.chg.toFixed(1)}%</div>
            </div>
            <div style={{ flex: 1, background: "var(--coralsoft)", borderRadius: 13, padding: 13 }}>
              <LogoTile sym={worst.sym} size={30} radius={9} />
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ink2)", textTransform: "uppercase", marginTop: 8 }}>Nejslabší</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{worst.sym}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--coral)" }}>{worst.chg.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2) risk metrics dashboard */}
      <div className="card" style={{ padding: 22, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>🛡️</span>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Rizikový profil portfolia</div>
        </div>
        <div className="grid three">
          {metrics.map((m) => (
            <div key={m[0]} style={{ background: "var(--surface2)", borderRadius: 13, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".04em" }}>{m[0]}</div>
              <div className="fd" style={{ fontSize: 21, fontWeight: 600, marginTop: 3 }}>{m[1]}</div>
              <div style={{ height: 4, background: "var(--line)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "70%", background: m[2], borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3) sector outlook */}
      <div className="card" style={{ padding: 22, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>🏭</span>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Sektorový výhled</div>
        </div>
        {sectors.map((s) => (
          <div key={s[0]} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{s[0]}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink2)" }}>{s[3]}</div>
            </div>
            <span className="chip" style={{ background: `color-mix(in srgb, ${s[2]} 12%, transparent)`, color: s[2] }}>{s[1]}</span>
          </div>
        ))}
      </div>

      {/* 4) calendar ahead */}
      <div className="card" style={{ padding: 22, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📅</span>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Co sledovat příště</div>
          </div>
          <button onClick={() => go("calendar")} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>Celý kalendář →</button>
        </div>
        {upcoming.map((e) => {
          const m = CAL_META[e.type as CalendarType];
          return (
            <div key={e.title} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
              {e.type === "rate" && e.bank ? (
                <BankLogo bank={e.bank} size={36} />
              ) : e.sym ? (
                <LogoTile sym={e.sym} size={36} radius={10} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 10, background: m.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.emoji}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: "var(--ink2)" }}>{e.date} · {m.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5) AI commentary */}
      <div style={{ background: "var(--panel)", color: "var(--panelink)", borderRadius: 20, padding: 24, marginTop: 18, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="sparkles" size={16} color="var(--lime)" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--lime)" }}>Komentář Folio AI</span>
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.7, color: "rgba(255,255,255,.9)" }}>{commentary}</div>
          <button onClick={() => askAI("Vysvětli mi tento report")} className="pressable" style={{ marginTop: 16, background: "var(--lime)", color: "var(--inkfix)", fontSize: 12.5, fontWeight: 800, padding: "10px 16px", borderRadius: 11, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="chat" size={13} color="var(--inkfix)" stroke={2.3} /> Zeptat se na detaily
          </button>
        </div>
      </div>
    </>
  );
}

export function ReportScreen() {
  const plan = useFolioStore((s) => s.plan);
  const reportTab = useFolioStore((s) => s.reportTab);
  const reportWhy = useFolioStore((s) => s.reportWhy);
  const setReportTab = useFolioStore((s) => s.setReportTab);
  const toggleReportWhy = useFolioStore((s) => s.toggleReportWhy);
  const setPlan = useFolioStore((s) => s.setPlan);
  const go = useFolioStore((s) => s.go);
  const calcMonthly = useFolioStore((s) => s.calc.monthly);

  const isPrem = plan === "premium";
  const tab = isPrem ? reportTab || "weekly" : "weekly";
  const monthly = tab === "monthly";

  const sub = monthly ? "Folio AI · Duben 2025" : "Folio AI · 15.–21. 4.";
  const title = monthly ? "Měsíční plán" : "Týdenní report";
  const moves = monthly ? MONTHLY_MOVES : REPORT_MOVES;
  const summary: [string, string][] = monthly
    ? [["S&P 500", "+3,8 %"], ["STOXX", "+2,6 %"], ["Zlato", "+4,1 %"], ["BTC", "−7,5 %"]]
    : [["S&P 500", "+1,4 %"], ["STOXX", "+0,9 %"], ["Zlato", "+0,6 %"], ["BTC", "−2,1 %"]];
  const sumLabel = monthly ? "Vývoj za měsíc" : "Vývoj za týden";
  const summaryText = monthly
    ? "V dubnu akciové trhy pokračovaly v růstu, tažené technologiemi a zdravou šíří trhu. Zlato přidalo přes 4 % na nižší inflaci a slabším dolaru. Dluhopisy se stabilizovaly, krypto korigovalo. Z pohledu měsíce zůstává trend pozitivní — měsíční plán se proto soustředí na disciplinovaný příkup a návrat alokace k cílům."
    : "Akcie měly silný týden, tažené globálními a US large-cap firmami. Dluhopisová ETF stagnovala při setrvalých výnosech. Zlato vzrostlo na nižší inflaci. Krypto zůstalo volatilní.";

  const tabs: [string, string][] = [["weekly", "Týdenní"], ["monthly", "Měsíční plán"]];
  const amt = calcMonthly || 500;

  return (
    <div className="fade" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div className="sub">{sub}</div>
          <div className="h1">{title}</div>
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--surface2)", borderRadius: 11, padding: 4 }}>
          {tabs.map((t) => {
            const lockedTab = !isPrem && t[0] === "monthly";
            const active = tab === t[0];
            return (
              <button
                key={t[0]}
                onClick={() => (lockedTab ? setPlan("premium") : setReportTab(t[0]))}
                className="pressable"
                style={{ padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, background: active ? "var(--panel)" : "transparent", color: active ? "var(--lime)" : "var(--ink2)", display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                {t[1]}
                {lockedTab && <Icon name="lock" size={12} color="var(--ink3)" stroke={2.4} />}
              </button>
            );
          })}
        </div>
      </div>

      {!isPrem && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--limesoft)", border: "1px solid var(--lime)", borderRadius: 14, padding: "12px 15px", marginBottom: 16 }}>
          <Icon name="sparkles" size={17} color="var(--limedeep)" stroke={2.3} />
          <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.45 }}>
            <b>Ukázka týdenního reportu zdarma.</b> Měsíční plán, dopad na tvé portfolio a hloubková analýza jsou v Premiu.
          </div>
        </div>
      )}

      <div style={{ background: "var(--panel)", borderRadius: 20, padding: 22, marginBottom: 18, color: "var(--panelink)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: monthly ? "var(--purple)" : "var(--lime)", opacity: 0.18 }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--lime)", marginBottom: 10 }}>{monthly ? "Shrnutí měsíce" : "Shrnutí trhu"}</div>
          <div style={{ fontSize: 15.5, lineHeight: 1.6, opacity: 0.92, maxWidth: 560 }}>{summaryText}</div>
          <div style={{ fontSize: 9.5, opacity: 0.55, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 16 }}>{sumLabel}</div>
          <div style={{ display: "flex", gap: 22, marginTop: 8, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.12)", flexWrap: "wrap" }}>
            {summary.map((s) => (
              <div key={s[0]}>
                <div style={{ fontSize: 9.5, opacity: 0.55, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{s[0]}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, color: s[1][0] === "−" ? "var(--coral)" : "var(--lime)" }}>{s[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid two">
        {moves.map((m, i) => {
          const open = reportWhy === i;
          const dotBg = m.bg === "var(--lime)" ? "var(--limedeep)" : m.bg;
          return (
            <div key={m.asset} className="card" style={{ padding: 18 }}>
              <span className="tag" style={{ background: m.bg, color: m.color }}>{m.label}</span>
              <div className="fd" style={{ fontSize: 18, fontWeight: 500, margin: "10px 0 6px" }}>{m.asset}</div>
              <div style={{ fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.5, marginBottom: 12 }}>{m.text}</div>
              <button onClick={() => toggleReportWhy(i)} className="pressable" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 9, padding: "8px 12px", fontSize: 12.5, fontWeight: 700 }}>
                <Icon name="help" size={13} color="var(--ink)" /> Proč? <Icon name="chevD" size={13} color="var(--ink)" />
              </button>
              {open && (
                <div style={{ marginTop: 12, padding: 14, background: "var(--bg)", borderRadius: 12 }}>
                  {m.why.map((w, wi) => (
                    <div key={w} style={{ display: "flex", gap: 8, marginBottom: wi < m.why.length - 1 ? 7 : 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotBg, marginTop: 7, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, lineHeight: 1.4 }}>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {monthly && (
        <div className="card" style={{ padding: 22, marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Icon name="pie" size={17} color="var(--limedeep)" />
            <div style={{ fontWeight: 800, fontSize: 15 }}>Plán měsíčního příkupu</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 14 }}>
            Jak rozdělit tvůj měsíční vklad <b>{fmt(amt)}</b> podle cílové strategie <b>{STRAT.name}</b>.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div className="cwrap" style={{ width: 150, height: 150, flexShrink: 0 }}>
              <Donut data={STRAT.alloc} inner={0.62} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              {STRAT.alloc.map((a) => (
                <div key={a[0]} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: CAT_COLOR[a[0] as AssetCategory], flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, flex: 1 }}>{a[0]}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink2)" }}>{a[1]} %</span>
                  <span style={{ fontSize: 13, fontWeight: 800, minWidth: 60, textAlign: "right" }}>{fmt((amt * a[1]) / 100)}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => go("calc")} className="pressable" style={{ marginTop: 14, background: "var(--panel)", color: "var(--lime)", fontWeight: 700, fontSize: 13, padding: "10px 16px", borderRadius: 11 }}>
            Změnit částku v kalkulačce →
          </button>
        </div>
      )}

      {monthly ? (
        <div style={{ background: "var(--purplesoft)", border: "1px solid rgba(123,97,255,.2)", borderRadius: 18, padding: 18, marginTop: 18 }}>
          <div className="h2" style={{ marginBottom: 10 }}>Měsíční checklist</div>
          <div style={{ fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.7 }}>
            ✓ Poslat pravidelný vklad a rozdělit dle plánu výše.<br />
            ✓ Zkontrolovat, zda žádná třída nepřerostla cíl o více než 5 %.<br />
            ✓ Nereagovat na denní výkyvy — držet horizont.<br />
            ✓ Strategii přehodnotit jen při velké životní změně.
          </div>
        </div>
      ) : (
        <div style={{ background: "var(--coralsoft)", border: "1px solid rgba(255,90,78,.2)", borderRadius: 18, padding: 18, marginTop: 18 }}>
          <div className="h2" style={{ marginBottom: 10 }}>Co nenavyšovat</div>
          <div style={{ fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.6 }}>
            Krypto je na limitu strategie (3 %) — model nepřidává. Růstové akcie se zvýšenou volatilitou se drží, nenavyšují. Technologická expozice je už dostatečná.
          </div>
        </div>
      )}

      {isPrem ? <ReportExtras monthly={monthly} /> : <PremiumTeaser />}

      <div className="disc" style={{ textAlign: "center", marginTop: 18 }}>
        Tento report je generován z tržních dat a tvé strategie. Je pouze informační a není to personalizované investiční poradenství. Demo.
      </div>
    </div>
  );
}
