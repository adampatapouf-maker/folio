"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { Icon, type IconName } from "@/components/ui/Icon";

const PILLARS: [IconName, string, string, string, string][] = [
  ["report", "Týdenní & měsíční report", "Přehled trhu a tvého portfolia", "var(--lime)", "var(--inkfix)"],
  ["chat", "Folio AI", "Vysvětlí, neporadí co koupit", "var(--purple)", "#fff"],
  ["sparkles", "Portfolio na míru", "6 otázek → hotový návrh", "var(--teal)", "#fff"],
];

export function OnboardingScreen() {
  const onboardStart = useFolioStore((s) => s.onboardStart);
  const onboardSkip = useFolioStore((s) => s.onboardSkip);

  return (
    <div className="fade" style={{ maxWidth: 560, margin: "0 auto", minHeight: "calc(100dvh - 130px)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, background: "var(--grad-lime)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", boxShadow: "0 14px 36px rgba(204,255,0,.45)" }}>
          <span className="fd" style={{ color: "var(--inkfix)", fontSize: 46, fontWeight: 700 }}>
            F
          </span>
        </div>
        <div className="fd" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.1, marginBottom: 12 }}>
          Vítej ve Foliu
        </div>
        <div style={{ fontSize: 15, color: "var(--ink2)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 28px" }}>
          Tvůj klidný investiční společník. Každý týden i měsíc ti pošleme report, vysvětlíme trhy přes AI a pomůžeme ti sestavit portfolio na míru.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", maxWidth: 380, margin: "0 auto 8px", width: "100%" }}>
          {PILLARS.map(([icon, title, sub, bg, fg]) => (
            <div key={title} style={{ display: "flex", alignItems: "center", gap: 13, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 15, padding: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={icon} size={20} color={fg} stroke={2.3} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{title}</div>
                <div style={{ fontSize: 12, color: "var(--ink2)" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 0 4px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onboardStart} className="pressable" style={{ width: "100%", background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 15.5, padding: 15, borderRadius: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="sparkles" size={17} color="var(--inkfix)" stroke={2.4} /> Sestavit moje portfolio
        </button>
        <button onClick={onboardSkip} className="pressable" style={{ width: "100%", background: "none", color: "var(--ink2)", fontWeight: 700, fontSize: 14, padding: 8 }}>
          Přeskočit, jen se rozhlédnu
        </button>
      </div>
    </div>
  );
}
