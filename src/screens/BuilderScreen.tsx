"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { QZ } from "@/data/builder";
import { computeBuilder } from "@/lib/calc/builder";
import { catColor, sig } from "@/lib/assets";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { Donut, DonutPal, palColor } from "@/components/charts/Charts";
import type { Allocation } from "@/lib/types";

export function BuilderScreen() {
  const builder = useFolioStore((s) => s.builder);
  if (builder.done) return <BuilderResult />;
  return <BuilderQuiz />;
}

function BuilderQuiz() {
  const builder = useFolioStore((s) => s.builder);
  const builderAnswer = useFolioStore((s) => s.builderAnswer);
  const builderBack = useFolioStore((s) => s.builderBack);
  const go = useFolioStore((s) => s.go);

  const total = QZ.length;
  const step = Math.min(builder.step, total - 1);
  const q = QZ[step];
  const prog = Math.round((step / total) * 100);

  return (
    <div className="fade" style={{ maxWidth: 620, margin: "0 auto" }}>
      <button onClick={() => (step > 0 ? builderBack() : go("dashboard"))} className="pressable" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--ink2)", marginBottom: 14 }}>
        <Icon name="chevL" size={16} color="var(--ink2)" /> {step > 0 ? "Zpět" : "Zrušit"}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Icon name="sparkles" size={16} color="var(--limedeep)" />
        <span className="sub" style={{ margin: 0 }}>
          Folio AI · dotazník · krok {step + 1}/{total}
        </span>
      </div>
      <div style={{ height: 8, background: "var(--surface2)", borderRadius: 5, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${prog}%`, background: "var(--grad-lime)", borderRadius: 5, transition: "width .3s" }} />
      </div>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{q.emoji}</div>
      <div className="fd" style={{ fontSize: 27, fontWeight: 500, lineHeight: 1.25, marginBottom: 22 }}>
        {q.q}
      </div>
      {q.opts.map((o, i) => (
        <button key={i} onClick={() => builderAnswer(q.id, i)} className="card lift" style={{ width: "100%", textAlign: "left", padding: "16px 18px", marginBottom: 11, display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 600 }}>
          <span style={{ color: builder.answers[q.id] === i ? "var(--limedeep)" : "var(--ink3)", fontSize: 18 }}>
            {builder.answers[q.id] === i ? "●" : "○"}
          </span>
          <span>{o[0]}</span>
        </button>
      ))}
      <div className="disc" style={{ textAlign: "center", marginTop: 16 }}>
        Odpovědi slouží k sestavení modelového portfolia. Není to investiční poradenství.
      </div>
    </div>
  );
}

/** Donut + legend for one breakdown of the model portfolio. */
function BreakdownBlock({ title, emo, data }: { title: string; emo: string; data: Allocation }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{emo}</span>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{title}</span>
      </div>
      <div className="mrow" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 118, height: 118, flexShrink: 0 }}>
          <DonutPal data={data} inner={0.6} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.map((a, i) => (
            <div key={a[0]} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: palColor(i) }} />
              <span style={{ fontSize: 12, flex: 1 }}>{a[0]}</span>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{a[1]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuilderResult() {
  const answers = useFolioStore((s) => s.builder.answers);
  const startBuilder = useFolioStore((s) => s.startBuilder);
  const openAsset = useFolioStore((s) => s.openAsset);
  const askAI = useFolioStore((s) => s.askAI);
  const go = useFolioStore((s) => s.go);
  const strategy = useFolioStore((s) => s.strategy);
  const adoptBuilderResult = useFolioStore((s) => s.adoptBuilderResult);
  const setReportTab = useFolioStore((s) => s.setReportTab);
  const r = computeBuilder(answers);
  const active = strategy.name === r.name && JSON.stringify(strategy.alloc) === JSON.stringify(r.alloc);
  const showPlan = () => {
    setReportTab("monthly");
    go("report");
  };


  return (
    <div className="fade" style={{ maxWidth: 880, margin: "0 auto" }}>
      <button onClick={startBuilder} className="pressable" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--ink2)", marginBottom: 14 }}>
        <Icon name="chevL" size={16} color="var(--ink2)" /> Vyplnit znovu
      </button>
      <div style={{ background: "var(--grad-hero)", color: "var(--panelink)", borderRadius: 24, padding: 26, position: "relative", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 170, height: 170, borderRadius: "50%", background: "var(--lime)", opacity: 0.18 }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="sparkles" size={16} color="var(--lime)" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--lime)" }}>
              Folio AI sestavila tvé portfolio
            </span>
          </div>
          <div className="fd" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.1, marginBottom: 6 }}>
            Profil: {r.name}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.75)", maxWidth: 520, lineHeight: 1.55 }}>
            Na základě tvých odpovědí AI vybrala alokaci s rizikovým skóre <b style={{ color: "var(--lime)" }}>{r.score}/100</b>. Níže vidíš rozdělení, důvody i konkrétní nástroje z databáze.
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.14)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 800, textTransform: "uppercase" }}>Výnos p.a.</div>
              <div className="fd" style={{ fontSize: 22, color: "var(--lime)" }}>{r.ret}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 800, textTransform: "uppercase" }}>Volatilita</div>
              <div className="fd" style={{ fontSize: 22 }}>±{r.vol}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 800, textTransform: "uppercase" }}>Riziko</div>
              <div className="fd" style={{ fontSize: 22 }}>{r.risk}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 18, display: "flex", alignItems: "center", gap: 12, border: active ? "1px solid var(--lime)" : undefined }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: active ? "var(--lime)" : "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
          {active ? "✓" : "🎯"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>{active ? `${r.name} je tvoje strategie` : `Nastavit ${r.name} jako moji strategii`}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.45 }}>
            {active
              ? "Report, plán příkupu i Folio AI s ní teď počítají."
              : `Teď máš „${strategy.name}". Report a plán příkupu se přepočítají podle nové alokace.`}
          </div>
        </div>
        {active ? (
          <button onClick={showPlan} className="pressable" style={{ background: "var(--panel)", color: "var(--lime)", fontWeight: 800, fontSize: 12.5, padding: "10px 12px", borderRadius: 11, flexShrink: 0 }}>
            Plán →
          </button>
        ) : (
          <button onClick={adoptBuilderResult} className="pressable" style={{ background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 12.5, padding: "10px 12px", borderRadius: 11, flexShrink: 0 }}>
            Nastavit
          </button>
        )}
      </div>

      <div className="grid two" style={{ alignItems: "start", marginBottom: 18 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Doporučená alokace</div>
          <div className="mrow" style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <div className="cwrap" style={{ width: 150, height: 150, flexShrink: 0 }}>
              <Donut data={r.alloc} inner={0.6} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              {r.alloc.map((a) => (
                <div key={a[0]} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: catColor(a[0] as never), flexShrink: 0 }} />
                  <span style={{ fontSize: 13, flex: 1 }}>{a[0]}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--limedeep)" }}>{a[1]} %</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Proč právě takhle</div>
          <ul style={{ listStyle: "none" }}>
            {r.reasons.map((x, i) => (
              <li key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.55, marginBottom: 9 }}>
                <span style={{ color: "var(--limedeep)", marginTop: 1, flexShrink: 0 }}>✓</span>
                <span dangerouslySetInnerHTML={{ __html: x }} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h2" style={{ fontSize: 20, margin: "4px 0 12px" }}>
        Konkrétní nástroje z databáze
      </div>
      <div className="stagger">
        {r.picks.map((p) => {
          const [, col] = sig(p.score);
          return (
            <button key={p.sym} onClick={() => openAsset(p.sym)} className="card lift" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 13, textAlign: "left", marginBottom: 9 }}>
              <LogoTile sym={p.sym} size={40} radius={12} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>
                  {p.sym} · {p.pct} %
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.cat} · {p.name}
                </div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: col }}>{p.score}</span>
            </button>
          );
        })}
      </div>

      <div className="h2" style={{ fontSize: 20, margin: "22px 0 12px" }}>
        Rozpad portfolia
      </div>
      <div className="grid two" style={{ alignItems: "start", marginBottom: 8 }}>
        <BreakdownBlock title="Původ aktiv" emo="🌍" data={r.originAlloc} />
        <BreakdownBlock title="Měny" emo="💱" data={r.currencyAlloc} />
        <BreakdownBlock title="Sektory" emo="🏭" data={r.sectorAlloc} />
        <BreakdownBlock title="Konkrétní aktiva" emo="🎯" data={r.specificAlloc} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        <button onClick={() => askAI("Probrat moje portfolio")} className="pressable" style={{ flex: 1, minWidth: 180, background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Icon name="chat" size={16} color="var(--inkfix)" stroke={2.3} /> Probrat s Folio AI
        </button>
        <button onClick={() => go("calc")} className="pressable" style={{ flex: 1, minWidth: 180, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 700, fontSize: 14, padding: 14, borderRadius: 13 }}>
          Spočítat budoucí hodnotu →
        </button>
      </div>
      <div className="disc" style={{ textAlign: "center", marginTop: 18 }}>
        Modelové portfolio je informační a vzdělávací — Folio neprovádí obchody ani neposkytuje personalizované poradenství. Demo.
      </div>
    </div>
  );
}
