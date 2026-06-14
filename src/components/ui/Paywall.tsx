"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { Icon } from "@/components/ui/Icon";

const FEATURES = [
  "Týdenní report — co se hýbe na trzích",
  "Měsíční report — plán příkupu & rebalancování",
  "Folio AI Premium (neomezený chat)",
  "Sestavení portfolia na míru",
  "Pokročilá data, fundamenty a akademie",
];

/** Generic premium paywall (report / locked features). */
export function Paywall() {
  const setPlan = useFolioStore((s) => s.setPlan);
  const startBuilder = useFolioStore((s) => s.startBuilder);
  return (
    <div className="fade" style={{ maxWidth: 540, margin: "24px auto", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>📊</div>
      <div className="h1" style={{ marginBottom: 8 }}>
        Týdenní &amp; měsíční report
      </div>
      <div style={{ fontSize: 15, color: "var(--ink2)", marginBottom: 22, lineHeight: 1.6 }}>
        Jádro Folia: každý <b>týden</b> přehled trhu a tvého portfolia, každý <b>měsíc</b> plán příkupu a rebalancování. Plus Folio AI a sestavení portfolia.
      </div>
      <div style={{ background: "var(--panel)", color: "var(--panelink)", borderRadius: 20, padding: 24, textAlign: "left", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div className="fd" style={{ fontSize: 24, fontWeight: 500 }}>
            Premium
          </div>
          <div>
            <span className="fd" style={{ fontSize: 30, fontWeight: 600, color: "var(--lime)" }}>
              12,90 €
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>/měs</span>
          </div>
        </div>
        {FEATURES.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7, fontSize: 13.5 }}>
            <span style={{ color: "var(--lime)" }}>✓</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setPlan("premium")} style={{ background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 15, padding: "14px 28px", borderRadius: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
        ✦ Odemknout Premium (demo)
      </button>
      <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 14 }}>
        Toto je demo přepínač pro investory — v produkční verzi by zde byla skutečná platba.
      </div>
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12.5, color: "var(--ink2)", marginBottom: 8 }}>Nebo si zdarma nech od AI navrhnout portfolio na míru:</div>
        <button onClick={startBuilder} className="pressable" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 700, fontSize: 13.5, padding: "11px 18px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="sparkles" size={15} color="var(--limedeep)" /> Spustit dotazník (zdarma)
        </button>
      </div>
    </div>
  );
}

/** Builder-specific premium paywall. */
export function BuilderPaywall() {
  const setPlan = useFolioStore((s) => s.setPlan);
  const items = [
    "Profil rizika z dotazníku",
    "Doporučená alokace + konkrétní nástroje",
    "Rozpad: třídy, sektory, měny, původ aktiv",
    "Vysvětlení proč právě takhle",
  ];
  return (
    <div className="fade" style={{ maxWidth: 560, margin: "10px auto" }}>
      <div style={{ background: "var(--grad-hero)", borderRadius: 24, padding: 28, color: "var(--panelink)", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: "var(--lime)", opacity: 0.18 }} />
        <div style={{ position: "relative" }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "var(--grad-lime)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 10px 28px rgba(204,255,0,.45)" }}>
            <Icon name="sparkles" size={30} color="var(--inkfix)" stroke={2.3} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--lime)", marginBottom: 8 }}>
            Premium · jádro Folia
          </div>
          <div className="fd" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.15, marginBottom: 8 }}>
            Nech si od AI sestavit portfolio na míru
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.72)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
            6 otázek o tvých cílech a toleranci rizika → hotové modelové portfolio s konkrétními nástroji, rozpadem podle tříd, sektorů, měn a regionů.
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 22, marginTop: 16 }}>
        {items.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--line)", fontSize: 13.5 }}>
            <span style={{ color: "var(--limedeep)", fontWeight: 800 }}>✓</span>
            <span>{f}</span>
          </div>
        ))}
        <button onClick={() => setPlan("premium")} className="pressable" style={{ width: "100%", marginTop: 16, background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 15, padding: 14, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          ✦ Odemknout Premium
        </button>
        <div style={{ fontSize: 11, color: "var(--ink3)", textAlign: "center", marginTop: 12 }}>
          Demo přepínač · v produkční verzi by zde byla platba.
        </div>
      </div>
      <div className="disc" style={{ textAlign: "center", marginTop: 16 }}>
        Modelové portfolio je informační a vzdělávací — Folio neprovádí obchody ani neposkytuje personalizované poradenství.
      </div>
    </div>
  );
}
