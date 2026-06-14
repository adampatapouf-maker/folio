"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { computeCompound, projectSeries, projectDIP } from "@/lib/calc/compound";
import { CALC_COMPARE } from "@/data/calc";
import { STRAT } from "@/data/portfolio";
import { fmt } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { GrowthChart, CompareChart, type CompareSeries } from "@/components/charts/Charts";
import type { CalcInputs } from "@/lib/types";

function Slider({ label, k, min, max, step, val, suffix }: { label: string; k: keyof CalcInputs; min: number; max: number; step: number; val: number; suffix: string }) {
  const setCalc = useFolioStore((s) => s.setCalc);
  const isEuro = suffix === "€";
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)" }}>{label}</span>
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2, background: "var(--surface2)", borderRadius: 9, padding: "4px 9px" }}>
          {isEuro && <span className="fd" style={{ fontSize: 15, fontWeight: 600 }}>€</span>}
          <input
            className="fd calcnum"
            type="number"
            inputMode="decimal"
            min={min}
            value={val}
            onChange={(e) => setCalc(k, Number(e.target.value))}
            style={{ width: isEuro ? 92 : 56, border: "none", background: "none", fontSize: 18, fontWeight: 600, color: "var(--ink)", outline: "none", textAlign: "right", MozAppearance: "textfield" }}
          />
          {suffix && !isEuro && <span className="fd" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink2)" }}>{suffix.trim()}</span>}
        </span>
      </div>
      <input type="range" className="lime" min={min} max={max} step={step} value={Math.min(val, max)} onChange={(e) => setCalc(k, Number(e.target.value))} />
    </div>
  );
}

export function CalcScreen() {
  const { initial, monthly, rate, years } = useFolioStore((s) => s.calc);
  const chartType = useFolioStore((s) => s.calcChart);
  const cmp = useFolioStore((s) => s.calcCompare);
  const plan = useFolioStore((s) => s.plan);
  const setCalcChart = useFolioStore((s) => s.setCalcChart);
  const toggleCompare = useFolioStore((s) => s.toggleCompare);
  const setPlan = useFolioStore((s) => s.setPlan);
  const askAI = useFolioStore((s) => s.askAI);

  const res = computeCompound(initial, monthly, rate, years);
  const isPrem = plan === "premium";
  const active = Object.keys(CALC_COMPARE).filter((k) => cmp[k]);

  const realRate = Math.max(0.1, rate - 2.5);
  const realFinal = projectSeries(initial, monthly, realRate, years).slice(-1)[0];
  const passiveYr = res.final * 0.04;
  const passiveMo = passiveYr / 12;
  const multiple = res.contributed > 0 ? res.final / res.contributed : 0;

  const compareSeries: CompareSeries[] = [{ series: res.total, color: "var(--limedeep)", primary: true, label: "Tvá investice" }];
  active.forEach((k) => {
    const c = CALC_COMPARE[k];
    let s: number[];
    if (k === "dip") s = projectDIP(initial, monthly, rate, years);
    else if (k === "inflation") s = projectSeries(initial, monthly, -(c.rate ?? 0), years);
    else s = projectSeries(initial, monthly, c.rate ?? 0, years);
    compareSeries.push({ series: s, color: c.color, label: c.label, dashed: k === "inflation" });
  });

  const CtBtn = ({ t, emo, lbl }: { t: "line" | "bar"; emo: string; lbl: string }) => (
    <button onClick={() => setCalcChart(t)} className="pressable" style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 800, background: chartType === t ? "var(--lime)" : "transparent", color: chartType === t ? "var(--inkfix)" : "var(--ink2)" }}>
      {emo} {lbl}
    </button>
  );

  return (
    <div className="fade" style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="sub">Síla složeného úročení</div>
      <div className="h1" style={{ marginBottom: 4 }}>
        Investiční kalkulačka
      </div>
      <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 20 }}>
        Uprav hodnoty a sleduj, jak roste pravidelné investování v čase.
      </div>
      <div className="grid dash">
        <div className="card" style={{ padding: 24 }}>
          <Slider label="Počáteční investice" k="initial" min={0} max={1000000} step={500} val={initial} suffix="€" />
          <Slider label="Měsíční vklad" k="monthly" min={0} max={50000} step={25} val={monthly} suffix="€" />
          <Slider label="Očekávaný roční výnos" k="rate" min={0} max={30} step={0.1} val={rate} suffix=" %" />
          <Slider label="Doba investování" k="years" min={1} max={60} step={1} val={years} suffix=" let" />
          <div style={{ fontSize: 11, color: "var(--ink3)", lineHeight: 1.4, marginTop: -4 }}>
            Hodnoty můžeš i přepsat ručně — bez omezení posuvníku.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--panel)", borderRadius: 24, padding: 24, color: "var(--panelink)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
              Hodnota za {years} let
            </div>
            <div className="fd hero-num" style={{ fontSize: 40, fontWeight: 600, color: "var(--lime)", lineHeight: 1, marginTop: 6 }}>
              {fmt(res.final)}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.12)", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", fontWeight: 700, textTransform: "uppercase" }}>Vloženo</div>
                <div className="fd" style={{ fontSize: 20, marginTop: 2 }}>{fmt(res.contributed)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", fontWeight: 700, textTransform: "uppercase" }}>Úroky</div>
                <div className="fd" style={{ fontSize: 20, marginTop: 2, color: "var(--lime)" }}>{fmt(res.interest)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", fontWeight: 700, textTransform: "uppercase" }}>Násobek</div>
                <div className="fd" style={{ fontSize: 20, marginTop: 2, color: "var(--lime)" }}>{multiple.toFixed(1)}×</div>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Růst v čase</div>
              <div style={{ display: "flex", gap: 3, background: "var(--surface2)", borderRadius: 10, padding: 3 }}>
                <CtBtn t="line" emo="📈" lbl="Křivka" />
                <CtBtn t="bar" emo="📊" lbl="Sloupce" />
              </div>
            </div>
            <div style={{ height: 170 }}>
              {active.length ? <CompareChart series={compareSeries} mode={chartType} /> : <GrowthChart principal={res.principal} total={res.total} mode={chartType} />}
            </div>
            {active.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 12, height: 3, borderRadius: 2, background: "var(--limedeep)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink2)", fontWeight: 700 }}>Tvá investice</span>
                </div>
                {active.map((k) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 12, height: 3, borderRadius: 2, background: CALC_COMPARE[k].color }} />
                    <span style={{ fontSize: 11, color: "var(--ink2)" }}>{CALC_COMPARE[k].label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--limedeep)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink2)" }}>Celková hodnota</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(14,14,16,.4)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink2)" }}>Vložené peníze</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 20, background: "var(--bluesoft)", border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <Icon name="dollar" size={16} color="var(--blue)" stroke={2.2} />
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>Reálná hodnota (po inflaci)</div>
          </div>
          <div className="fd" style={{ fontSize: 26, fontWeight: 600, color: "var(--blue)" }}>{fmt(realFinal)}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink2)", lineHeight: 1.45, marginTop: 4 }}>
            Kupní síla v dnešních penězích při inflaci ~2,5 % ročně.
          </div>
        </div>
        <div className="card" style={{ padding: 20, background: "var(--limesoft)", border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <Icon name="wallet" size={16} color="var(--limedeep)" stroke={2.2} />
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>Pasivní příjem (pravidlo 4 %)</div>
          </div>
          <div className="fd" style={{ fontSize: 26, fontWeight: 600, color: "var(--limedeep)" }}>
            {fmt(passiveMo)}
            <span style={{ fontSize: 14, color: "var(--ink2)" }}>/měs</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink2)", lineHeight: 1.45, marginTop: 4 }}>
            Cca {fmt(passiveYr)} ročně, které bys mohl udržitelně vybírat.
          </div>
        </div>
      </div>

      {isPrem ? (
        <div className="card" style={{ padding: 22, marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Icon name="sparkles" size={16} color="var(--limedeep)" stroke={2.3} />
            <div style={{ fontWeight: 800, fontSize: 15 }}>Porovnej s alternativami</div>
            <span className="chip" style={{ background: "var(--lime)", color: "var(--inkfix)", marginLeft: "auto", padding: "2px 8px", fontSize: 9 }}>
              PREMIUM
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink2)", marginBottom: 14 }}>
            Zapni, co chceš porovnat — graf nahoře se hned překreslí.
          </div>
          {Object.keys(CALC_COMPARE).map((k) => {
            const c = CALC_COMPARE[k];
            const on = !!cmp[k];
            let s: number[];
            if (k === "dip") s = projectDIP(initial, monthly, rate, years);
            else if (k === "inflation") s = projectSeries(initial, monthly, -(c.rate ?? 0), years);
            else s = projectSeries(initial, monthly, c.rate ?? 0, years);
            const fin = s[s.length - 1];
            const diff = fin - res.final;
            const rlabel = k === "dip" ? `~${rate}% +daň` : k === "inflation" ? `−${c.rate}%` : `${c.rate}%`;
            return (
              <button key={k} onClick={() => toggleCompare(k)} className="pressable" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 13, borderRadius: 14, border: `1px solid ${on ? c.color : "var(--line)"}`, background: on ? c.color + "14" : "var(--surface)", marginBottom: 9, textAlign: "left" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>
                  {c.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    {c.label}
                    <span style={{ fontSize: 10, fontWeight: 800, color: c.color, background: c.color + "1f", padding: "1px 6px", borderRadius: 5 }}>{rlabel}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink2)", lineHeight: 1.4, marginTop: 2 }}>{c.desc}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="fd" style={{ fontSize: 14, fontWeight: 600 }}>{fmt(fin)}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: diff >= 0 ? "var(--limedeep)" : "var(--coral)" }}>
                    {diff >= 0 ? "+" : "−"}
                    {fmt(Math.abs(diff))}
                  </div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${on ? c.color : "var(--line)"}`, background: on ? c.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {on && <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <button onClick={() => setPlan("premium")} className="card lift" style={{ width: "100%", textAlign: "left", padding: 22, marginTop: 18, position: "relative", overflow: "hidden", background: "var(--panel)", color: "var(--panelink)" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Icon name="sparkles" size={16} color="var(--lime)" stroke={2.3} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--lime)" }}>Premium</span>
            </div>
            <div className="fd" style={{ fontSize: 21, fontWeight: 600, marginBottom: 6 }}>
              Porovnej s dluhopisy, spořákem &amp; DIP
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.55, marginBottom: 14 }}>
              Uvidíš, o kolik tě připraví spořicí účet, jak si vede DIP s daňovým odpočtem a co ti „sní&quot; inflace — vše v jednom grafu.
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
              {Object.keys(CALC_COMPARE).map((k) => (
                <span key={k} className="chip" style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}>
                  {CALC_COMPARE[k].emoji} {CALC_COMPARE[k].label}
                </span>
              ))}
            </div>
            <span style={{ background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 13.5, padding: "11px 20px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
              ✦ Odemknout porovnání
            </span>
          </div>
        </button>
      )}

      <div style={{ background: "var(--purplesoft)", borderRadius: 16, padding: 16, marginTop: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Icon name="sparkles" size={18} color="var(--purple)" />
        <div style={{ flex: 1, minWidth: 200, fontSize: 13.5, lineHeight: 1.5 }}>
          Kdybys těchto <b>{fmt(monthly)}/měsíc</b> investoval do strategie <b>Vyvážená</b> (očekávaný výnos {STRAT.ret}), model by sledoval tato aktiva. Chceš to probrat?
        </div>
        <button onClick={() => askAI(`Kolik vydělám za ${years} let?`)} className="pressable" style={{ background: "var(--purple)", color: "#fff", fontSize: 13, fontWeight: 700, padding: "10px 16px", borderRadius: 11 }}>
          Zeptat se Folio AI
        </button>
      </div>
      <div className="disc" style={{ textAlign: "center", marginTop: 18 }}>
        Výpočet je orientační a předpokládá konstantní výnos. Sazby u porovnání (spořák, dluhopisy, DIP, inflace) jsou ilustrativní. Skutečné výnosy kolísají. Není to investiční poradenství.
      </div>
    </div>
  );
}
