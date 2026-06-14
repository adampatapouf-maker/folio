"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { taxComputeCZ } from "@/lib/calc/tax";
import { kc } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import type { TaxInputs } from "@/lib/types";

function Slider({ label, k, min, max, step, val, unit }: { label: string; k: keyof TaxInputs; min: number; max: number; step: number; val: number; unit: string }) {
  const setTax = useFolioStore((s) => s.setTax);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)" }}>{label}</span>
        <span className="fd" style={{ fontSize: 18, fontWeight: 600 }}>
          {unit === "Kč" ? Math.round(val).toLocaleString("cs-CZ") + " Kč" : val + unit}
        </span>
      </div>
      <input type="range" className="lime" min={min} max={max} step={step} value={val} onChange={(e) => setTax(k, Number(e.target.value))} />
    </div>
  );
}

function TestRow({ ok, title, desc }: { ok: boolean; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: ok ? "var(--limesoft)" : "var(--surface2)", color: ok ? "var(--limedeep)" : "var(--ink3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
        {ok ? "✓" : "✕"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>
          {title}
          {ok && <span style={{ color: "var(--limedeep)" }}> splněn</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.45, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

export function TaxScreen() {
  const t = useFolioStore((s) => s.tax);
  const askAI = useFolioStore((s) => s.askAI);
  const R = taxComputeCZ(t.buy, t.sell, t.months, t.dip);
  const heroBg = R.exempt ? "linear-gradient(135deg,#16203A,#0D1117)" : "var(--panel)";

  return (
    <div className="fade" style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="sub">Daně z investic · ČR</div>
      <div className="h1" style={{ marginBottom: 4 }}>
        Daňový poradce
      </div>
      <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 20 }}>
        Spočítej orientačně daň z prodeje cenných papírů podle českých pravidel — časový a hodnotový test, sazba 15 % a odpočet za DIP.
      </div>
      <div className="grid dash">
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Tvůj obchod</div>
          <Slider label="Nákupní cena (pořízení)" k="buy" min={0} max={500000} step={1000} val={t.buy} unit="Kč" />
          <Slider label="Prodejní cena" k="sell" min={0} max={500000} step={1000} val={t.sell} unit="Kč" />
          <Slider label="Doba držby" k="months" min={0} max={60} step={1} val={t.months} unit=" měs." />
          <div style={{ height: 1, background: "var(--line)", margin: "6px 0 16px" }} />
          <Slider label="Roční vklad do DIP" k="dip" min={0} max={60000} step={1000} val={t.dip} unit="Kč" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: heroBg, borderRadius: 24, padding: 24, color: "var(--panelink)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                {R.exempt ? "Daň z prodeje" : "Odhadovaná daň"}
              </div>
              <div className="fd hero-num" style={{ fontSize: 40, fontWeight: 600, color: "var(--lime)", lineHeight: 1, marginTop: 6 }}>
                {R.exempt ? "0 Kč" : kc(R.tax)}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.72)", marginTop: 8, lineHeight: 1.5 }}>
                {R.exempt ? (
                  <>✓ Tvůj prodej je <b>osvobozený</b> od daně.</>
                ) : (
                  <>Zisk {kc(R.gain)} × 15 %. Čistý výnos po dani {kc(R.net)}.</>
                )}
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Osvobození — stačí splnit jeden test</div>
            <TestRow ok={R.timeTest} title="Časový test (3 roky)" desc={`Cenné papíry držené déle než 36 měsíců jsou od daně osvobozené. Držíš ${t.months} měs.`} />
            <TestRow ok={R.valueTest} title="Hodnotový test (100 000 Kč)" desc={`Pokud souhrn ročních příjmů z prodeje nepřesáhne 100 000 Kč, je osvobozený. Tvůj prodej: ${kc(t.sell)}.`} />
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 22, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Icon name="sparkles" size={16} color="var(--limedeep)" stroke={2.3} />
          <div style={{ fontWeight: 800, fontSize: 15 }}>Výhoda DIP (dlouhodobý investiční produkt)</div>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.55, marginBottom: 14 }}>
          Vklady do DIP si můžeš odečíst od základu daně až do 48 000 Kč ročně. Při tvém vkladu {kc(t.dip)} je uznatelný odpočet {kc(R.dipDeduct)}.
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 130, background: "var(--limesoft)", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--ink2)" }}>Roční úspora na dani</div>
            <div className="fd" style={{ fontSize: 24, fontWeight: 600, color: "var(--limedeep)", marginTop: 3 }}>{kc(R.dipSaving)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 130, background: "var(--surface2)", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--ink2)" }}>Uznatelný odpočet</div>
            <div className="fd" style={{ fontSize: 24, fontWeight: 600, marginTop: 3 }}>{kc(R.dipDeduct)}</div>
          </div>
        </div>
      </div>
      <button onClick={() => askAI("Jak se v Česku daní zisk z akcií?")} className="card lift" style={{ width: "100%", textAlign: "left", padding: 16, marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="chat" size={18} color="var(--lime)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Zeptej se Folio AI na daně</div>
          <div style={{ fontSize: 12, color: "var(--ink2)" }}>Vysvětlí testy, sazby i DIP jednoduše.</div>
        </div>
        <Icon name="chevR" size={16} color="var(--ink3)" />
      </button>
      <div className="disc" style={{ textAlign: "center", marginTop: 18 }}>
        Orientační výpočet pro fyzické osoby (ČR), zjednodušený model k roku 2024/2025. Nezohledňuje všechny situace (např. progresivní sazbu 23 %, ztráty, příjmy z jiných zdrojů). Není to daňové poradenství — pro konkrétní případ se obrať na daňového poradce.
      </div>
    </div>
  );
}
