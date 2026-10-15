"use client";
import { useMemo } from "react";
import { useFolioStore } from "@/store/useFolioStore";
import { useReport } from "@/hooks/useInsights";
import { CAL_META } from "@/data/calendar";
import { catColor } from "@/lib/assets";
import { DRIFT_BAND, type DriftRow } from "@/lib/insights/rebalance";
import type { ActionKind, Report, ReportAction } from "@/lib/insights/report";
import { fmt } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { LogoTile, BankTile } from "@/components/ui/LogoTile";
import { AllocationBars } from "@/components/ui/AllocationBars";
import type { CalendarType } from "@/lib/types";

const KIND: Record<ActionKind, { label: string; bg: string; fg: string }> = {
  buy: { label: "Doplnit", bg: "var(--lime)", fg: "var(--inkfix)" },
  pause: { label: "Nenavyšovat", bg: "var(--coral)", fg: "#fff" },
  hold: { label: "Držet", bg: "var(--purple)", fg: "#fff" },
  watch: { label: "Sledovat", bg: "var(--amber)", fg: "var(--inkfix)" },
};

const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1).replace(".", ",")} %`;
const dec = (n: number, dp = 1) => n.toFixed(dp).replace(".", ",");

function SectionTitle({ icon, children, action }: { icon: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "22px 0 10px" }}>
      <div className="h2" style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden style={{ fontSize: 16 }}>{icon}</span>
        {children}
      </div>
      {action}
    </div>
  );
}

function ActionCard({ a }: { a: ReportAction }) {
  const reportWhy = useFolioStore((s) => s.reportWhy);
  const toggleReportWhy = useFolioStore((s) => s.toggleReportWhy);
  const openAsset = useFolioStore((s) => s.openAsset);
  const k = KIND[a.kind];
  const open = reportWhy === a.id;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span className="tag" style={{ background: k.bg, color: k.fg }}>{k.label}</span>
        {a.sym && (
          <button onClick={() => openAsset(a.sym!)} className="pressable" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "var(--ink2)" }}>
            <LogoTile sym={a.sym} size={22} radius={6} /> {a.sym} <Icon name="chevR" size={13} color="var(--ink3)" />
          </button>
        )}
      </div>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{a.subject}</div>
      <div style={{ fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.5 }}>{a.text}</div>
      <button
        onClick={() => toggleReportWhy(a.id)}
        aria-expanded={open}
        className="pressable"
        style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "var(--ink2)" }}
      >
        <Icon name="help" size={13} color="var(--ink2)" /> Proč?
        <Icon name="chevD" size={13} color="var(--ink2)" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .2s" }} />
      </button>
      {open && (
        <ul style={{ listStyle: "none", marginTop: 10, padding: 12, background: "var(--bg)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 7 }}>
          {a.why.map((w) => (
            <li key={w} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.45 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ink3)", marginTop: 7, flexShrink: 0 }} />
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Hero({ r, eyebrow, title, children }: { r: Report; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--grad-hero)", color: "var(--panelink)", borderRadius: 22, padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "var(--lime)", opacity: 0.14 }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--lime)", marginBottom: 8 }}>{eyebrow}</div>
        <div className="fd" style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--panelsub)", marginTop: 8 }}>{r.commentary}</div>
        {children}
      </div>
    </div>
  );
}

function MarketStrip({ r }: { r: Report }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.12)" }}>
      {r.market.map((m) => (
        <div key={m.label} style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9.5, opacity: 0.6, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</div>
          <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2, color: m.change >= 0 ? "var(--lime)" : "var(--coral)" }}>{signed(m.change)}</div>
        </div>
      ))}
    </div>
  );
}

function RiskCard({ r }: { r: Report }) {
  const k = r.risk;
  const items: [string, string, string][] = [
    ["Volatilita", `${dec(k.vol)} %`, "odhad ročního kolísání"],
    ["Možný propad", `−${dec(k.maxDrawdown, 0)} %`, "vážený historický max."],
    ["Beta", dec(k.beta, 2), "citlivost na trh"],
    ["Největší pozice", `${k.largest.sym} ${dec(k.largest.weight, 0)} %`, "koncentrace"],
    ["Krypto", `${dec(k.cryptoShare)} %`, `cíl ${r.drift.find((d) => d.cat === "Krypto")?.target ?? 0} %`],
    ["Efektivní pozice", dec(k.effectivePositions), `z ${k.positions} držených`],
  ];
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {items.map(([label, v, sub]) => (
          <div key={label} style={{ background: "var(--surface2)", borderRadius: 12, padding: 12, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
            <div className="fd" style={{ fontSize: 19, fontWeight: 600, marginTop: 2, whiteSpace: "nowrap" }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--ink3)" }}>{sub}</div>
          </div>
        ))}
      </div>
      <div className="disc" style={{ marginTop: 10 }}>Odhad z historické volatility jednotlivých aktiv při korelaci 0,5. Není to předpověď.</div>
    </div>
  );
}

function Watchlist({ r }: { r: Report }) {
  const go = useFolioStore((s) => s.go);
  return (
    <>
      <SectionTitle icon="📅" action={<button onClick={() => go("calendar")} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>Kalendář →</button>}>
        Co sledovat
      </SectionTitle>
      <div className="card" style={{ padding: "4px 16px" }}>
        {r.watch.map((e, i) => {
          const m = CAL_META[e.type as CalendarType];
          return (
            <div key={e.title} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
              {e.type === "rate" && e.bank ? <BankTile bank={e.bank} size={34} radius={10} /> : e.sym ? <LogoTile sym={e.sym} size={34} radius={10} /> : <span style={{ fontSize: 22 }}>{m.emoji}</span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink2)" }}>
                  {e.date} · {m.label}
                  {e.sym && r.portfolio.rows.some((x) => x.sym === e.sym) ? " · držíš" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Class weights after this month's contribution is invested per the plan. */
function driftAfterPlan(r: Report): DriftRow[] {
  const total = r.portfolio.val + r.plan.monthly;
  return r.drift
    .map((d) => {
      const value = d.value + (r.plan.lines.find((l) => l.cat === d.cat)?.amount ?? 0);
      const actual = total > 0 ? (value / total) * 100 : 0;
      const drift = actual - d.target;
      return { ...d, value, actual, drift, status: drift > DRIFT_BAND ? "over" : drift < -DRIFT_BAND ? "under" : "ok" } as DriftRow;
    })
    .sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
}

function PlanList({ r }: { r: Report }) {
  const openAsset = useFolioStore((s) => s.openAsset);
  return (
    <div className="card" style={{ padding: "6px 16px" }}>
      {r.plan.lines.map((l, i) => (
        <button
          key={l.cat}
          onClick={() => l.sym && openAsset(l.sym)}
          className="pressable"
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none", textAlign: "left" }}
        >
          <LogoTile sym={l.sym} size={38} radius={11} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>
              {l.sym} {!l.held && <span className="chip" style={{ background: "var(--surface2)", color: "var(--ink2)", padding: "1px 6px", fontSize: 9, marginLeft: 4 }}>nové</span>}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink2)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: catColor(l.cat) }} />
              {l.cat}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="fd" style={{ fontSize: 17, fontWeight: 600 }}>{fmt(l.amount)}</div>
            <div style={{ fontSize: 11, color: "var(--ink3)" }}>{Math.round((l.amount / Math.max(1, r.plan.monthly)) * 100)} % vkladu</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function Weekly({ r, isPrem }: { r: Report; isPrem: boolean }) {
  const strategy = useFolioStore((s) => s.strategy);
  const startBuilder = useFolioStore((s) => s.startBuilder);
  const setReportTab = useFolioStore((s) => s.setReportTab);
  const offCount = r.drift.filter((d) => d.status !== "ok").length;
  return (
    <>
      <Hero r={r} eyebrow={`Týden ${r.period}`} title={r.headline}>
        <MarketStrip r={r} />
      </Hero>

      <SectionTitle icon="🧭">Co z toho plyne</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {r.actions.map((a) => (
          <ActionCard key={a.id} a={a} />
        ))}
      </div>

      <SectionTitle
        icon="🎯"
        action={<button onClick={startBuilder} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)" }}>Změnit →</button>}
      >
        Vs. strategie {strategy.name}
      </SectionTitle>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 12.5, color: "var(--ink2)", marginBottom: 14 }}>
          {offCount ? `${offCount} ${offCount === 1 ? "třída je" : offCount < 5 ? "třídy jsou" : "tříd je"} mimo toleranci ±${DRIFT_BAND} p.b.` : "Vše v toleranci — portfolio sedí na strategii."} Čárka = cíl, šedé pásmo = tolerance.
        </div>
        <AllocationBars rows={r.drift} />
      </div>

      <SectionTitle icon="📈">Tvé pozice za týden</SectionTitle>
      <div className="grid two" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {[
          { label: "Nejlepší", m: r.movers.best, bg: "var(--limesoft)", fg: "var(--limedeep)" },
          { label: "Nejslabší", m: r.movers.worst, bg: "var(--coralsoft)", fg: "var(--coral)" },
        ].map(({ label, m, bg, fg }) => (
          <div key={label} style={{ background: bg, borderRadius: 16, padding: 14 }}>
            <LogoTile sym={m.sym} size={30} radius={9} />
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ink2)", textTransform: "uppercase", marginTop: 8 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{m.sym}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: fg }}>{signed(m.change)}</div>
          </div>
        ))}
      </div>

      <Watchlist r={r} />

      {isPrem ? (
        <>
          <SectionTitle icon="🛡️">Rizikový profil</SectionTitle>
          <RiskCard r={r} />
        </>
      ) : (
        <button onClick={() => setReportTab("monthly")} className="card lift" style={{ width: "100%", textAlign: "left", padding: 18, marginTop: 18, display: "flex", alignItems: "center", gap: 12, background: "var(--panel)", color: "var(--panelink)", border: "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--grad-lime)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="pie" size={19} color="var(--inkfix)" stroke={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>Tvůj plán příkupu je připravený</div>
            <div style={{ fontSize: 12.5, color: "var(--panelsub)" }}>
              {r.plan.lines.length} {r.plan.lines.length === 1 ? "nákup" : r.plan.lines.length < 5 ? "nákupy" : "nákupů"} za {fmt(r.plan.monthly)} · rizikový profil · Premium
            </div>
          </div>
          <Icon name="chevR" size={18} color="var(--lime)" />
        </button>
      )}
    </>
  );
}

function Monthly({ r, isPrem }: { r: Report; isPrem: boolean }) {
  const setCalc = useFolioStore((s) => s.setCalc);
  const setPlan = useFolioStore((s) => s.setPlan);
  const askAI = useFolioStore((s) => s.askAI);
  const after = useMemo(() => driftAfterPlan(r), [r]);
  const months = r.plan.monthsToBalance;

  return (
    <>
      <Hero r={r} eyebrow={`Plán · ${r.period}`} title={`Rozděl ${fmt(r.plan.monthly)} do ${r.plan.lines.length} ${r.plan.lines.length === 1 ? "nákupu" : "nákupů"}`}>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <label htmlFor="monthly" style={{ fontSize: 12, fontWeight: 700, color: "var(--panelsub)" }}>Měsíční vklad</label>
            <span className="fd" style={{ fontSize: 18, fontWeight: 600, color: "var(--lime)" }}>{fmt(r.plan.monthly)}</span>
          </div>
          <input id="monthly" type="range" className="lime" min={50} max={3000} step={50} value={Math.min(3000, Math.max(50, r.plan.monthly))} onChange={(e) => setCalc("monthly", Number(e.target.value))} />
        </div>
      </Hero>

      <SectionTitle icon="🛒">Kam poslat tento vklad</SectionTitle>
      <div style={{ position: "relative", minHeight: isPrem ? undefined : 250 }}>
        <div style={isPrem ? undefined : { filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }} aria-hidden={!isPrem}>
          <PlanList r={r} />
        </div>
        {!isPrem && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div className="card" style={{ padding: 18, textAlign: "center", maxWidth: 300, boxShadow: "var(--shadow-lg)" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>🔒</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Konkrétní plán je v Premiu</div>
              <div style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5, marginBottom: 12 }}>Částky a nástroje pro každou třídu, přepočítané z tvého portfolia každý měsíc.</div>
              <button onClick={() => setPlan("premium")} className="pressable" style={{ background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 13.5, padding: "11px 18px", borderRadius: 12 }}>
                ✦ Odemknout · 12,90 €/měs
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--limesoft)", borderRadius: 16, padding: 14, marginTop: 12 }}>
        <span aria-hidden style={{ fontSize: 18 }}>🧘</span>
        <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
          <b>Jen nákupy, nic neprodáváš.</b> Váhy srovnáváš tím, kam posíláš nové peníze — bez daně z prodeje (časový test 3 roky) a bez poplatků za obchody navíc.
          {months > 0 ? ` Do tolerance se portfolio dostane zhruba za ${months} ${months === 1 ? "měsíc" : months < 5 ? "měsíce" : "měsíců"}.` : " Portfolio už je v toleranci."}
        </div>
      </div>

      <SectionTitle icon="🎯">Po tomto vkladu</SectionTitle>
      <div className="card" style={{ padding: 16, ...(isPrem ? {} : { filter: "blur(5px)", pointerEvents: "none" }) }} aria-hidden={!isPrem}>
        <AllocationBars rows={after} />
      </div>

      {isPrem && (
        <>
          <SectionTitle icon="🛡️">Rizikový profil</SectionTitle>
          <RiskCard r={r} />
        </>
      )}

      <SectionTitle icon="✅">Měsíční checklist</SectionTitle>
      <div className="card" style={{ padding: 16, fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.8 }}>
        ✓ Pošli vklad a rozděl ho podle plánu.
        <br />✓ Nereaguj na denní výkyvy — horizont je roky.
        <br />✓ Strategii měň jen při velké životní změně.
      </div>

      <button onClick={() => askAI("Kam poslat měsíční vklad?")} className="card lift" style={{ width: "100%", textAlign: "left", padding: 14, marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="chat" size={18} color="var(--lime)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Probrat plán s Folio AI</div>
          <div style={{ fontSize: 12, color: "var(--ink2)" }}>Zná tvé portfolio i strategii.</div>
        </div>
        <Icon name="chevR" size={16} color="var(--ink3)" />
      </button>
    </>
  );
}

export function ReportScreen() {
  const plan = useFolioStore((s) => s.plan);
  const reportTab = useFolioStore((s) => s.reportTab);
  const setReportTab = useFolioStore((s) => s.setReportTab);
  const isPrem = plan === "premium";
  const kind = reportTab === "monthly" ? "monthly" : "weekly";
  const r = useReport(kind);

  return (
    <div className="fade" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="sub">Folio report · {r.period}</div>
      <div className="h1" style={{ marginBottom: 14 }}>{kind === "monthly" ? "Měsíční plán" : "Týdenní report"}</div>

      <div role="tablist" style={{ display: "flex", gap: 4, background: "var(--surface2)", borderRadius: 12, padding: 4, marginBottom: 16 }}>
        {(
          [
            ["weekly", "Týden"],
            ["monthly", "Plán na měsíc"],
          ] as const
        ).map(([id, label]) => {
          const active = kind === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setReportTab(id)}
              className="pressable"
              style={{ flex: 1, padding: "9px 10px", borderRadius: 9, fontSize: 13, fontWeight: 800, background: active ? "var(--surface)" : "transparent", color: active ? "var(--ink)" : "var(--ink2)", boxShadow: active ? "var(--shadow)" : "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}
            >
              {label}
              {id === "monthly" && !isPrem && <Icon name="lock" size={12} color="var(--ink3)" stroke={2.4} />}
            </button>
          );
        })}
      </div>

      {kind === "monthly" ? <Monthly r={r} isPrem={isPrem} /> : <Weekly r={r} isPrem={isPrem} />}

      <div className="disc" style={{ textAlign: "center", marginTop: 20 }}>
        Report je spočítaný z tvých pozic a zvolené strategie. Je informační a vzdělávací — není to investiční doporučení. Tržní data jsou demo.
      </div>
    </div>
  );
}
