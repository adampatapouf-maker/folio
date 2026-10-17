"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { TUTORIAL } from "@/data/tutorial";

export function TutorialOverlay() {
  const tutorial = useFolioStore((s) => s.tutorial);
  const next = useFolioStore((s) => s.tutorialNext);
  const prev = useFolioStore((s) => s.tutorialPrev);
  const end = useFolioStore((s) => s.tutorialEnd);

  if (tutorial == null) return null;
  const i = tutorial;
  const step = TUTORIAL[i];
  const total = TUTORIAL.length;

  return (
    <div
      className="sheet-backdrop"
      style={{ position: "absolute", inset: 0, background: "rgba(13,17,23,.6)", zIndex: 70, display: "flex", alignItems: "flex-end", backdropFilter: "blur(2px)" }}
    >
      <div
        className="sheet-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--surface)", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 22px calc(26px + env(safe-area-inset-bottom))", boxShadow: "0 -10px 40px rgba(0,0,0,.3)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink3)" }}>
            Jak na to · {i + 1}/{total}
          </span>
          <button onClick={end} className="pressable" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink3)" }}>
            Přeskočit
          </button>
        </div>
        <div
          className="pop"
          style={{ width: 84, height: 84, borderRadius: 24, background: step.color === "#CCFF00" ? step.color : step.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, marginBottom: 18 }}
        >
          {step.emoji}
        </div>
        <div className="fd" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.15, marginBottom: 10 }}>
          {step.title}
        </div>
        <div style={{ fontSize: 14.5, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 22 }}>{step.body}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          {TUTORIAL.map((_, k) => (
            <span key={k} style={{ width: k === i ? 22 : 7, height: 7, borderRadius: 4, background: k === i ? "var(--lime)" : "var(--line)", transition: ".25s" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {i > 0 && (
            <button onClick={prev} className="pressable" style={{ background: "var(--surface2)", color: "var(--ink)", fontWeight: 800, fontSize: 14.5, padding: "14px 22px", borderRadius: 14 }}>
              Zpět
            </button>
          )}
          <button onClick={next} className="pressable" style={{ flex: 1, background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 15, padding: 14, borderRadius: 14 }}>
            {i >= total - 1 ? "Začít používat Folio ✓" : "Další →"}
          </button>
        </div>
      </div>
    </div>
  );
}
