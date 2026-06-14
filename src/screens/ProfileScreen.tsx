"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { pfCompute, defaultHoldings } from "@/lib/calc/portfolio";
import { fmt } from "@/lib/format";
import { STRAT } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import type { ReactNode } from "react";

function Stat({ emo, val, lab }: { emo: string; val: string; lab: string }) {
  return (
    <div className="card" style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{emo}</div>
      <div className="fd" style={{ fontSize: 20, fontWeight: 600 }}>{val}</div>
      <div style={{ fontSize: 11, color: "var(--ink2)", fontWeight: 600 }}>{lab}</div>
    </div>
  );
}

function Row({ icon, title, sub, right, onClick }: { icon: ReactNode; title: string; sub?: string; right?: ReactNode; onClick?: () => void }) {
  const inner = (
    <>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--ink2)" }}>{sub}</div>}
      </div>
      {right}
    </>
  );
  if (onClick) {
    return (
      <button onClick={onClick} className="pressable" style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "14px 0", borderBottom: "1px solid var(--line)", background: "none", textAlign: "left" }}>
        {inner}
      </button>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
      {inner}
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="pressable" style={{ width: 46, height: 27, borderRadius: 14, background: on ? "var(--lime)" : "var(--surface2)", position: "relative", flexShrink: 0, transition: ".2s" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.3)", transition: ".2s" }} />
    </button>
  );
}

export function ProfileScreen() {
  const plan = useFolioStore((s) => s.plan);
  const theme = useFolioStore((s) => s.theme);
  const notif = useFolioStore((s) => s.notif);
  const xp = useFolioStore((s) => s.academy.xp);
  const answered = useFolioStore((s) => s.academy.answered);
  const setPlan = useFolioStore((s) => s.setPlan);
  const setTheme = useFolioStore((s) => s.setTheme);
  const toggleTheme = useFolioStore((s) => s.toggleTheme);
  const toggleNotif = useFolioStore((s) => s.toggleNotif);
  const startBuilder = useFolioStore((s) => s.startBuilder);
  const startTutorial = useFolioStore((s) => s.startTutorial);
  const resetState = useFolioStore((s) => s.resetState);
  const showToast = useFolioStore((s) => s.showToast);

  const p = pfCompute(defaultHoldings());
  const isPrem = plan === "premium";
  const dark = theme === "dark";
  const lvl = Math.floor(xp / 100) + 1;

  const confirmReset = () => {
    if (window.confirm("Obnovit demo do výchozího stavu?")) resetState();
  };

  return (
    <div className="fade" style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* profile hero */}
      <div style={{ background: "var(--grad-hero)", borderRadius: 24, padding: 26, color: "var(--panelink)", position: "relative", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: "var(--lime)", opacity: 0.18 }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 78, height: 78, borderRadius: 24, background: "var(--grad-lime)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0, boxShadow: "0 8px 22px rgba(204,255,0,.4)" }}>
            🙂
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="fd" style={{ fontSize: 26, fontWeight: 600 }}>Investor</span>
              {isPrem ? (
                <span className="chip" style={{ background: "var(--lime)", color: "var(--inkfix)", padding: "3px 10px" }}>✦ PREMIUM</span>
              ) : (
                <span className="chip" style={{ background: "rgba(255,255,255,.2)", color: "#fff", padding: "3px 10px" }}>FREE</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 2 }}>investor@folio.app · člen od 2024</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <span className="chip" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>⭐ Úroveň {lvl}</span>
              <span className="chip" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>{xp} XP</span>
              <span className="chip" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>{STRAT.name} profil</span>
            </div>
          </div>
        </div>
      </div>

      {/* quick stats */}
      <div className="grid four" style={{ marginBottom: 18 }}>
        <Stat emo="💼" val={fmt(p.val)} lab="Portfolio" />
        <Stat emo="📈" val={(p.plPct >= 0 ? "+" : "") + p.plPct.toFixed(1) + "%"} lab="Zhodnocení" />
        <Stat emo="🎓" val={"Úr. " + lvl} lab="Akademie" />
        <Stat emo="🔥" val={String(answered.length)} lab="Kvízů" />
      </div>

      {/* account */}
      <div className="card" style={{ padding: "6px 20px 16px", marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 14, padding: "16px 0 4px" }}>Účet</div>
        <Row
          icon={<Icon name="user" size={18} color="var(--purple)" stroke={2} />}
          title="Osobní údaje"
          sub="Jméno, e-mail, telefon"
          right={<Icon name="chevR" size={16} color="var(--ink3)" />}
          onClick={() => showToast("Osobní údaje — v demu needitovatelné", "👤")}
        />
        <Row
          icon={<Icon name="wallet" size={18} color="var(--blue)" stroke={2} />}
          title="Předplatné"
          sub={isPrem ? "Premium · 12,90 €/měs" : "Free plán"}
          right={
            <button
              onClick={() => setPlan(isPrem ? "free" : "premium")}
              className="pressable"
              style={{ background: isPrem ? "var(--surface2)" : "var(--lime)", color: isPrem ? "var(--ink)" : "var(--inkfix)", fontSize: 12, fontWeight: 800, padding: "7px 13px", borderRadius: 9 }}
            >
              {isPrem ? "Premium aktivní" : "Odemknout Premium"}
            </button>
          }
        />
        <Row
          icon={<Icon name="trophy" size={18} color="var(--amber)" stroke={2} />}
          title="Můj profil rizika"
          sub={STRAT.name + " · " + STRAT.risk}
          right={
            <button onClick={() => startBuilder()} className="pressable" style={{ fontSize: 12, fontWeight: 800, color: "var(--limedeep)", background: "none" }}>
              Změnit
            </button>
          }
        />
      </div>

      {/* settings */}
      <div className="card" style={{ padding: "6px 20px 16px", marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 14, padding: "16px 0 4px" }}>Nastavení</div>
        <Row
          icon={<Icon name="sparkles" size={18} color="var(--limedeep)" stroke={2} />}
          title="Vzhled"
          right={
            <div style={{ display: "flex", gap: 3, background: "var(--surface2)", borderRadius: 10, padding: 3, flexShrink: 0 }}>
              <button
                onClick={() => setTheme("light")}
                className="pressable"
                style={{ padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 800, background: !dark ? "var(--lime)" : "transparent", color: !dark ? "var(--inkfix)" : "var(--ink2)" }}
              >
                ☀️ Světlý
              </button>
              <button
                onClick={() => setTheme("dark")}
                className="pressable"
                style={{ padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 800, background: dark ? "var(--lime)" : "transparent", color: dark ? "var(--inkfix)" : "var(--ink2)" }}
              >
                🌙 Tmavý
              </button>
            </div>
          }
        />
        <Row
          icon={<Icon name="sparkles" size={18} color="var(--limedeep)" stroke={2} />}
          title="Tmavý režim"
          sub={dark ? "Zapnuto" : "Vypnuto"}
          right={<Toggle on={dark} onClick={() => toggleTheme()} />}
        />
        <Row
          icon={<Icon name="bell" size={18} color="var(--coral)" stroke={2} />}
          title="Notifikace"
          sub="Ex-dividendy, výsledky, sazby"
          right={<Toggle on={notif} onClick={() => toggleNotif()} />}
        />
        <Row
          icon={<Icon name="globe" size={18} color="var(--teal)" stroke={2} />}
          title="Jazyk"
          sub="Čeština"
          right={<Icon name="chevR" size={16} color="var(--ink3)" />}
          onClick={() => showToast("V demu je dostupná jen čeština", "🌐")}
        />
        <Row
          icon={<Icon name="dollar" size={18} color="var(--gold)" stroke={2} />}
          title="Měna"
          sub="EUR (€)"
          right={<Icon name="chevR" size={16} color="var(--ink3)" />}
          onClick={() => showToast("V demu je dostupné jen EUR", "💶")}
        />
      </div>

      {/* about */}
      <div className="card" style={{ padding: "6px 20px 16px", marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 14, padding: "16px 0 4px" }}>Více</div>
        <Row
          icon={<Icon name="sparkles" size={18} color="var(--limedeep)" stroke={2} />}
          title="Spustit tutoriál"
          sub="Projít znovu, jak appka funguje"
          right={<Icon name="chevR" size={16} color="var(--ink3)" />}
          onClick={() => startTutorial()}
        />
        <Row
          icon={<Icon name="help" size={18} color="var(--ink2)" stroke={2} />}
          title="Nápověda a podpora"
          right={<Icon name="chevR" size={16} color="var(--ink3)" />}
          onClick={() => showToast("Podpora: ahoj@folio.app (demo)", "💬")}
        />
        <Row
          icon={<Icon name="report" size={18} color="var(--ink2)" stroke={2} />}
          title="Podmínky a soukromí"
          right={<Icon name="chevR" size={16} color="var(--ink3)" />}
          onClick={() => showToast("Podmínky a soukromí — demo", "📄")}
        />
      </div>

      <button
        onClick={() => showToast("Odhlášení je v demu vypnuté", "👋")}
        className="pressable"
        style={{ width: "100%", background: "var(--coralsoft)", color: "var(--coral)", fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}
      >
        <Icon name="logout" size={16} color="var(--coral)" stroke={2} /> Odhlásit se
      </button>
      <button
        onClick={confirmReset}
        className="pressable"
        style={{ width: "100%", background: "none", color: "var(--ink3)", fontWeight: 700, fontSize: 12.5, padding: 12, marginTop: 4 }}
      >
        Restartovat Folio
      </button>
      <div className="disc" style={{ textAlign: "center", marginTop: 18 }}>
        Folio je vzdělávací demo. Nastavení a údaje jsou ilustrativní.
      </div>
    </div>
  );
}
