"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { Icon } from "@/components/ui/Icon";
import type { ViewId } from "@/lib/types";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  data: "Data aktiv",
  ai: "Folio AI",
  portfolio: "Moje portfolio",
  report: "Report",
  calc: "Kalkulačka",
  academy: "Akademie",
  quizPlay: "Kvíz",
  quizResult: "Výsledek",
  weakSpots: "Slabá místa",
  news: "Novinky",
  newsArticle: "Článek",
  calendar: "Kalendář",
  discuss: "Diskuze",
  profile: "Profil",
  builder: "Sestavení portfolia",
  tax: "Daňový poradce",
};

export function TopBar() {
  const view = useFolioStore((s) => s.view);
  const assetView = useFolioStore((s) => s.assetView);
  const hist = useFolioStore((s) => s.hist);
  const plan = useFolioStore((s) => s.plan);
  const theme = useFolioStore((s) => s.theme);
  const goBack = useFolioStore((s) => s.goBack);
  const toggleTheme = useFolioStore((s) => s.toggleTheme);
  const go = useFolioStore((s) => s.go);

  const canBack = hist.length > 0 || !!assetView || view === "newsArticle";
  const title = TITLES[view as ViewId] || "Folio";

  return (
    <div className="mtop" id="mtop">
      {canBack ? (
        <button
          onClick={goBack}
          className="pressable"
          aria-label="Zpět"
          style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 14, color: "var(--ink)" }}
        >
          <Icon name="chevL" size={20} /> Zpět
        </button>
      ) : (
        <button onClick={() => go("dashboard")} style={{ display: "flex", alignItems: "center", gap: 8 }} aria-label="Folio domů">
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "var(--grad-lime)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(204,255,0,.45)",
            }}
          >
            <span className="fd" style={{ color: "var(--inkfix)", fontSize: 18, fontWeight: 700 }}>
              F
            </span>
          </div>
          <span className="fd" style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-.02em" }}>
            Folio
          </span>
        </button>
      )}

      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 14, fontWeight: 700 }}>
        {canBack ? title : ""}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {plan === "premium" && (
          <span className="chip" style={{ background: "var(--lime)", color: "var(--inkfix)", fontSize: 10 }}>
            ✦ Premium
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="pressable"
          aria-label="Přepnout motiv"
          style={{ width: 34, height: 34, borderRadius: 11, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}
