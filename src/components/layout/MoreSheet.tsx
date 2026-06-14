"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { ViewId } from "@/lib/types";

const PRIMARY: [string, string, IconName][] = [
  ["builder", "Sestavit portfolio", "sparkles"],
  ["report", "Týdenní & měsíční report", "report"],
  ["ai", "Folio AI", "chat"],
];
const SECONDARY: [ViewId, string, IconName][] = [
  ["data", "Trh / Data aktiv", "data"],
  ["calendar", "Kalendář", "calendar"],
  ["tax", "Daňový poradce", "dollar"],
  ["news", "Novinky", "news"],
  ["discuss", "Diskuze", "hash"],
  ["academy", "Akademie", "academy"],
  ["calc", "Kalkulačka", "calc"],
  ["profile", "Profil", "user"],
];

export function MoreSheet() {
  const moreOpen = useFolioStore((s) => s.moreOpen);
  const view = useFolioStore((s) => s.view);
  const toggleMore = useFolioStore((s) => s.toggleMore);
  const go = useFolioStore((s) => s.go);
  const startBuilder = useFolioStore((s) => s.startBuilder);

  if (!moreOpen) return null;

  const cell = (id: string, label: string, icon: IconName, big: boolean) => (
    <button
      key={id}
      onClick={() => (id === "builder" ? startBuilder() : go(id as ViewId))}
      className="pressable"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        padding: big ? "15px 8px" : "14px 8px",
        borderRadius: 16,
        background: view === id ? "var(--limesoft)" : big ? "var(--limesoft)" : "var(--surface2)",
        border: big ? "1px solid var(--lime)" : "none",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          background: big ? "var(--lime)" : "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={20} color={big ? "var(--inkfix)" : view === id ? "var(--limedeep)" : "var(--ink)"} stroke={2} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2, textAlign: "center" }}>{label}</span>
    </button>
  );

  return (
    <div
      onClick={toggleMore}
      className="sheet-backdrop"
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 60, display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-panel"
        style={{
          background: "var(--surface)",
          width: "100%",
          borderRadius: "24px 24px 0 0",
          padding: "20px 18px calc(28px + env(safe-area-inset-bottom))",
          maxHeight: "86%",
          overflowY: "auto",
          boxShadow: "0 -10px 40px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--line)", margin: "0 auto 18px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--limedeep)", marginBottom: 10 }}>
          <Icon name="sparkles" size={13} color="var(--limedeep)" stroke={2.3} /> Jádro Folia
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
          {PRIMARY.map(([id, l, ic]) => cell(id, l, ic, true))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink3)", marginBottom: 10 }}>
          Další nástroje
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {SECONDARY.map(([id, l, ic]) => cell(id, l, ic, false))}
        </div>
      </div>
    </div>
  );
}
