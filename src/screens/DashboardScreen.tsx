"use client";
import { useState } from "react";
import { useFolioStore } from "@/store/useFolioStore";
import { usePortfolioInsights, useReport } from "@/hooks/useInsights";
import { pfHistory } from "@/lib/calc/portfolio";
import { computeCompound } from "@/lib/calc/compound";
import { catColor } from "@/lib/assets";
import { FEED } from "@/data/social";
import { fmt } from "@/lib/format";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { Sparkline } from "@/components/charts/Charts";
import type { ActionKind } from "@/lib/insights/report";
import type { ViewId } from "@/lib/types";

const DAYS = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"];
const MONTHS_GEN = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];

function greeting(d: Date) {
  const h = d.getHours();
  return h < 5 ? "Dobrou noc" : h < 10 ? "Dobré ráno" : h < 12 ? "Dobré dopoledne" : h < 18 ? "Dobré odpoledne" : "Dobrý večer";
}

const KIND_DOT: Record<ActionKind, string> = {
  buy: "var(--limedeep)",
  pause: "var(--coral)",
  hold: "var(--purple)",
  watch: "var(--amber)",
};

const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1).replace(".", ",")} %`;

function SectionHead({ title, cta, onCta }: { title: string; cta?: string; onCta?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 0 10px" }}>
      <div className="h2" style={{ fontSize: 18 }}>{title}</div>
      {cta && (
        <button onClick={onCta} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>
          {cta}
        </button>
      )}
    </div>
  );
}

const TOOLS: [ViewId, string, IconName, string, string][] = [
  ["data", "Trh", "data", "var(--bluesoft)", "var(--blue)"],
  ["calendar", "Kalendář", "calendar", "var(--purplesoft)", "var(--purple)"],
  ["tax", "Daně", "dollar", "var(--limesoft)", "var(--limedeep)"],
  ["calc", "Kalkulačka", "calc", "var(--tealsoft)", "var(--teal)"],
  ["academy", "Akademie", "academy", "var(--ambersoft)", "var(--amber)"],
  ["discuss", "Diskuze", "hash", "var(--coralsoft)", "var(--coral)"],
];

export function DashboardScreen() {
  const { p, strategy, plan } = usePortfolioInsights();
  const week = useReport("weekly");
  const calc = useFolioStore((s) => s.calc);
  const isPrem = useFolioStore((s) => s.plan) === "premium";
  const builderDone = useFolioStore((s) => s.builder.done);
  const go = useFolioStore((s) => s.go);
  const startBuilder = useFolioStore((s) => s.startBuilder);
  const openAsset = useFolioStore((s) => s.openAsset);
  const askAI = useFolioStore((s) => s.askAI);
  const setReportTab = useFolioStore((s) => s.setReportTab);

  // AppShell renders screens only after client-side rehydration, so reading
  // the clock here can't cause a server/client markup mismatch.
  const [now] = useState(() => new Date());

  const plUp = p.pl >= 0;
  const hist = pfHistory(p.val);
  const future = computeCompound(p.val, calc.monthly, calc.rate, calc.years);
  const offCount = week.drift.filter((d) => d.status !== "ok").length;

  const openReport = (tab: "weekly" | "monthly") => {
    setReportTab(tab);
    go("report");
  };

  return (
    <div className="fade" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="sub" style={{ minHeight: 13 }}>{now ? `${DAYS[now.getDay()]} ${now.getDate()}. ${MONTHS_GEN[now.getMonth()]}` : ""}</div>
      <div className="h1" style={{ marginBottom: 14, minHeight: 31 }}>{now ? greeting(now) : ""}</div>

      {/* Activation: no personal strategy yet */}
      {!builderDone && (
        <button onClick={startBuilder} className="card lift" style={{ width: "100%", textAlign: "left", padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--lime)", background: "var(--limesoft)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--lime)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="sparkles" size={19} color="var(--inkfix)" stroke={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>Nastav si vlastní strategii</div>
            <div style={{ fontSize: 12.5, color: "var(--ink2)" }}>6 otázek, minuta času. Teď počítáme s výchozí „{strategy.name}“.</div>
          </div>
          <Icon name="chevR" size={17} color="var(--limedeep)" />
        </button>
      )}

      {/* Portfolio hero */}
      <button onClick={() => go("portfolio")} className="lift" style={{ width: "100%", textAlign: "left", background: "var(--grad-hero)", color: "var(--panelink)", borderRadius: 24, padding: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -50, width: 180, height: 180, borderRadius: "50%", background: "var(--lime)", opacity: 0.12 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--panelsub)" }}>Moje portfolio</span>
            <span className="chip" style={{ background: "rgba(255,255,255,.1)", color: "var(--panelink)", fontSize: 10 }}>🎯 {strategy.name}</span>
          </div>
          <div className="fd hero-num" style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.05, marginTop: 8 }}>{fmt(p.val)}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12.5, fontWeight: 700, flexWrap: "wrap" }}>
            <span style={{ color: plUp ? "var(--lime)" : "var(--coral)" }}>
              {plUp ? "▲" : "▼"} {fmt(Math.abs(p.pl))} ({signed(p.plPct)}) celkem
            </span>
            <span style={{ color: week.change >= 0 ? "var(--lime)" : "var(--coral)" }}>{signed(week.change)} tento týden</span>
          </div>
          <div style={{ height: 54, marginTop: 12 }}>
            <Sparkline data={hist.map((x) => x.v)} up={plUp} />
          </div>
        </div>
      </button>

      {/* This week */}
      <SectionHead title="Tento týden" cta="Celý report →" onCta={() => openReport("weekly")} />
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.55, marginBottom: 12 }}>
          {offCount
            ? <>Portfolio se odchyluje od strategie ve <b>{offCount} {offCount === 1 ? "třídě" : "třídách"}</b>. Tady je, co z toho plyne:</>
            : <>Portfolio sedí na strategii <b>{strategy.name}</b>. Žádný zásah není potřeba.</>}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {week.actions.slice(0, 3).map((a, i) => (
            <button
              key={a.id}
              onClick={() => openReport("weekly")}
              className="pressable"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none", textAlign: "left" }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: KIND_DOT[a.kind], flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 800 }}>{a.title}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--ink2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.text}</span>
              </span>
              <Icon name="chevR" size={15} color="var(--ink3)" />
            </button>
          ))}
        </div>
      </div>

      {/* Monthly plan */}
      <SectionHead title="Plán příkupu" cta={isPrem ? "Detail →" : undefined} onCta={() => openReport("monthly")} />
      <button onClick={() => openReport("monthly")} className="card lift" style={{ width: "100%", textAlign: "left", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "var(--ink2)" }}>Měsíční vklad</span>
          <span className="fd" style={{ fontSize: 20, fontWeight: 600 }}>{fmt(plan.monthly)}</span>
        </div>
        {/* stacked allocation of the contribution */}
        <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", gap: 2, marginBottom: 12 }} aria-hidden>
          {plan.lines.map((l) => (
            <div key={l.cat} style={{ flex: l.amount, background: catColor(l.cat) }} />
          ))}
        </div>
        <div style={isPrem ? undefined : { filter: "blur(5px)", userSelect: "none" }} aria-hidden={!isPrem}>
          {plan.lines.slice(0, 3).map((l) => (
            <div key={l.cat} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
              <LogoTile sym={l.sym} size={26} radius={8} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>
                {l.sym} <span style={{ fontWeight: 500, color: "var(--ink2)" }}>· {l.cat}</span>
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 800 }}>{fmt(l.amount)}</span>
            </div>
          ))}
        </div>
        {!isPrem && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, color: "var(--limedeep)" }}>
            <Icon name="lock" size={13} color="var(--limedeep)" stroke={2.4} /> Konkrétní částky a nástroje v Premiu
          </div>
        )}
      </button>

      {/* AI + future value */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        <button onClick={() => askAI("Jak je na tom moje portfolio?")} className="card lift" style={{ padding: 14, textAlign: "left" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <Icon name="sparkles" size={17} color="var(--lime)" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Folio AI</div>
          <div style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.4, marginTop: 2 }}>„Jak je na tom moje portfolio?“</div>
        </button>
        <button onClick={() => go("calc")} className="card lift" style={{ padding: 14, textAlign: "left" }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink3)" }}>Za {calc.years} let</div>
          <div className="fd" style={{ fontSize: 22, fontWeight: 600, color: "var(--limedeep)", marginTop: 4, whiteSpace: "nowrap" }}>{fmt(future.final)}</div>
          <div style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.4, marginTop: 2 }}>
            při {fmt(calc.monthly)}/měs. a {String(calc.rate).replace(".", ",")} % p.a.
          </div>
        </button>
      </div>

      {/* News */}
      <SectionHead title="Novinky" cta="Vše →" onCta={() => go("news")} />
      <div className="hscroll" style={{ display: "flex", gap: 12, overflowX: "auto" }}>
        {FEED.slice(0, 5).map((f, i) => (
          <button
            key={f.title}
            onClick={() => (f.sym ? openAsset(f.sym) : go("news"))}
            className="card lift"
            style={{ flex: "0 0 220px", padding: 0, overflow: "hidden", textAlign: "left" }}
          >
            <div style={{ position: "relative", height: 110, background: "var(--panel)", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://images.unsplash.com/${f.img}?w=440&q=70&auto=format&fit=crop`} alt="" loading={i > 1 ? "lazy" : undefined} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(13,17,23,.05) 40%,rgba(13,17,23,.8) 100%)" }} />
              <span className="chip" style={{ position: "absolute", top: 9, left: 9, background: "rgba(13,17,23,.55)", color: "#fff", fontSize: 9 }}>{f.tag}</span>
              {f.sym && (
                <span style={{ position: "absolute", bottom: 9, left: 9, display: "inline-flex" }}>
                  <LogoTile sym={f.sym} size={24} radius={7} />
                </span>
              )}
            </div>
            <div style={{ padding: "10px 12px 12px" }}>
              <div className="fd" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 600, marginTop: 6 }}>{f.time}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tools */}
      <SectionHead title="Nástroje" />
      <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {TOOLS.map(([view, label, icon, bg, fg]) => (
          <button key={view} onClick={() => go(view)} className="pressable" style={{ background: bg, borderRadius: 16, padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: fg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={icon} size={17} color="#fff" stroke={2.3} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>
          </button>
        ))}
      </div>

      <div className="disc" style={{ textAlign: "center", marginTop: 24 }}>
        Folio je informační a vzdělávací nástroj. Neprovádí obchody ani neposkytuje personalizované investiční poradenství. Tržní data jsou demo. Kapitál je v riziku.
      </div>
    </div>
  );
}
