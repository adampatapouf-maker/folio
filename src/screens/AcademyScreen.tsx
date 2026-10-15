"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { TOPICS, QBANK } from "@/data/academy";
import { Icon } from "@/components/ui/Icon";
import type { AcademyState, Question } from "@/lib/types";

interface Mastery {
  right: number;
  total: number;
  pct: number;
}

interface Quest {
  id: string;
  title: string;
  desc: string;
  target: number;
  prog: number;
  reward: number;
}

interface Insight {
  min: number;
  title: string;
  body: string;
  emoji: string;
}

/** Local calendar day as YYYY-MM-DD — must match the store's streak bookkeeping. */
const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** A streak only survives if the last finished quiz was today or yesterday. */
function effectiveStreak(streak: number, lastQuizDay: string | null, today: string): number {
  if (!lastQuizDay) return 0;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return lastQuizDay === today || lastQuizDay === dayKey(y) ? streak : 0;
}

/** Czech plural: 1 den, 2–4 dny, 5+ dní. */
const daysLabel = (n: number): string => (n === 1 ? "den" : n >= 2 && n <= 4 ? "dny" : "dní");

function topicMastery(academy: AcademyState, topicId: string): Mastery {
  const all = QBANK.filter((q) => q.topic === topicId);
  const right = all.filter((q) => academy.answered.includes(q.id) && !academy.wrong.includes(q.id)).length;
  return { right, total: all.length, pct: all.length ? Math.round((right / all.length) * 100) : 0 };
}

function activeQuests(academy: AcademyState, quizToday: boolean): Quest[] {
  const xp = academy.xp;
  const list: Quest[] = [
    { id: "q1", title: "První kvíz dne", desc: "Dokonči 1 kvíz", target: 1, prog: quizToday ? 1 : 0, reward: 20 },
    {
      id: "q2",
      title: "Studuj všechna témata",
      desc: "Odpověz alespoň 1 otázku z každého tématu",
      target: TOPICS.length,
      prog: TOPICS.filter((t) => QBANK.some((q) => q.topic === t.id && academy.answered.includes(q.id))).length,
      reward: 50,
    },
    { id: "q3", title: "Bez chyby", desc: "Dokonči kvíz s plným skóre", target: 1, prog: 0, reward: 30 },
  ];
  if (xp >= 100)
    list.push({
      id: "q4",
      title: "Mistr středně těžkých",
      desc: "Odpověz 10 otázek úrovně 2",
      target: 10,
      prog: QBANK.filter((q) => q.diff === 2 && academy.answered.includes(q.id)).length,
      reward: 60,
    });
  if (xp >= 250)
    list.push({
      id: "q5",
      title: "Mistr náročných",
      desc: "Odpověz 5 otázek úrovně 3",
      target: 5,
      prog: QBANK.filter((q) => q.diff === 3 && academy.answered.includes(q.id)).length,
      reward: 100,
    });
  return list;
}

function unlockedInsights(xp: number): Insight[] {
  const all: Insight[] = [
    { min: 0, title: "Začni brzy", body: "Čas je v investování silnější než částka. €100/měs od 25 let je víc než €300/měs od 40 let.", emoji: "⏰" },
    { min: 50, title: "Pravidelnost > načasování", body: "Pravidelné nákupy v různých cenách (DCA) statisticky překonávají snahu „trefit dno”.", emoji: "🎯" },
    { min: 100, title: "Pravidlo 72", body: "Vyděl 72 sazbou a získáš roky do zdvojnásobení. 7 % výnos → 10 let.", emoji: "🧮" },
    { min: 150, title: "Diverzifikuj globálně", body: "1 globální ETF (např. VWCE) drží ~3 700 firem ze 47 zemí. Jediný nákup = ohromná diverzifikace.", emoji: "🌍" },
    { min: 250, title: "P/E v kontextu", body: "Nízké P/E neznamená vždy levné — může signalizovat problémy. Vysoké P/E neznamená drahé — pokud roste zisk.", emoji: "💡" },
    { min: 400, title: "Riziko ≠ ztráta", body: "Riziko = kolísání. Pokud máš dlouhý horizont, krátkodobé propady jsou cena za dlouhodobý výnos.", emoji: "🧘" },
  ];
  return all.filter((i) => i.min <= xp);
}

const DIFF_TIER = (diff: 1 | 2 | 3): { soft: string; label: string } =>
  diff === 1 ? { soft: "var(--limesoft)", label: "LEHKÁ" } : diff === 2 ? { soft: "var(--ambersoft)", label: "STŘEDNÍ" } : { soft: "var(--coralsoft)", label: "TĚŽKÁ" };

export function AcademyScreen() {
  const academy = useFolioStore((s) => s.academy);
  const streak = useFolioStore((s) => s.streak);
  const lastQuizDay = useFolioStore((s) => s.lastQuizDay);
  const startQuiz = useFolioStore((s) => s.startQuiz);
  const startQuizFromWrong = useFolioStore((s) => s.startQuizFromWrong);

  const xp = academy.xp;
  const tier = xp < 100 ? "Začátečník" : xp < 250 ? "Pokročilý" : "Mistr";
  const tierColor = xp < 100 ? "var(--lime)" : xp < 250 ? "var(--amber)" : "var(--purple)";
  const tierFrom = xp < 100 ? 0 : 100;
  const nextTier = xp < 100 ? 100 : xp < 250 ? 250 : null;
  const nextLabel = xp < 100 ? "Pokročilý" : xp < 250 ? "Mistr" : null;
  const tierPct = nextTier ? Math.min(100, ((xp - tierFrom) / (nextTier - tierFrom)) * 100) : 100;

  const today = dayKey(new Date());
  const quizToday = lastQuizDay === today;
  const streakDays = effectiveStreak(streak, lastQuizDay, today);

  const answeredCount = academy.answered.length;
  const wrongAnswered = academy.wrong.filter((id) => academy.answered.includes(id)).length;
  const successPct = answeredCount ? Math.round(((answeredCount - wrongAnswered) / answeredCount) * 100) : 0;

  const quests = activeQuests(academy, quizToday);
  const insights = unlockedInsights(xp).slice(-3).reverse();
  const wrongCount = academy.wrong.length;

  const wrongQs = academy.wrong
    .map((id) => QBANK.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q));

  return (
    <div className="fade" style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div className="sub">Uč se zábavně</div>
      <div className="h1" style={{ marginBottom: 18 }}>
        Akademie
      </div>

      {/* XP / tier hero */}
      <div style={{ background: "var(--panel)", color: "var(--panelink)", borderRadius: 22, padding: 22, marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: tierColor, opacity: 0.22 }} />
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>Tvá úroveň</div>
            <div className="fd" style={{ fontSize: 30, fontWeight: 600, color: tierColor, marginTop: 3 }}>
              {tier}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{xp} XP celkem</div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 10,
                padding: "5px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                background: streakDays > 0 ? "rgba(255,90,78,.18)" : "rgba(255,255,255,.08)",
                color: streakDays > 0 ? "var(--coral)" : "rgba(255,255,255,.75)",
              }}
            >
              <span aria-hidden>🔥</span>
              {streakDays > 0 ? `${streakDays} ${daysLabel(streakDays)} v řadě` : "Začni sérii dnes"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
              <div className="fd" style={{ fontSize: 22, fontWeight: 600, color: "var(--amber)" }}>
                {answeredCount}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 700 }}>ODPOVĚDÍ</div>
            </div>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
              <div className="fd" style={{ fontSize: 22, fontWeight: 600, color: "var(--lime)" }}>
                {successPct}%
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 700 }}>ÚSPĚŠNOST</div>
            </div>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,.75)" }}>{nextTier ? `Do úrovně ${nextLabel}` : "Nejvyšší úroveň dosažena"}</span>
            <span style={{ color: "rgba(255,255,255,.55)" }}>{nextTier ? `${xp} / ${nextTier} XP · zbývá ${nextTier - xp}` : `${xp} XP`}</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={tierFrom}
            aria-valuemax={nextTier ?? xp}
            aria-valuenow={xp}
            aria-label={nextTier ? `Pokrok k úrovni ${nextLabel}` : "Nejvyšší úroveň"}
            style={{ height: 7, background: "rgba(255,255,255,.08)", borderRadius: 4, overflow: "hidden" }}
          >
            <div style={{ height: "100%", width: `${tierPct}%`, background: `linear-gradient(to right,${tierColor},var(--lime))`, transition: "width .4s ease" }} />
          </div>
        </div>
      </div>

      {/* weak spots banner */}
      {wrongCount > 0 && (
        <button
          onClick={startQuizFromWrong}
          className="pressable"
          style={{ width: "100%", background: "var(--coralsoft)", border: "1px solid rgba(255,90,78,.25)", borderRadius: 16, padding: 16, textAlign: "left", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Moje slabá místa ({wrongCount})</div>
            <div style={{ fontSize: 12, color: "var(--ink2)" }}>Procvič otázky, které ti dělaly problém — jako v autoškole.</div>
          </div>
          <Icon name="chevR" size={16} color="var(--ink)" />
        </button>
      )}

      {/* quick play */}
      <button
        onClick={() => startQuiz("all")}
        className="pressable"
        style={{ width: "100%", background: "var(--lime)", color: "var(--inkfix)", borderRadius: 16, padding: 18, textAlign: "left", marginBottom: 22, display: "flex", alignItems: "center", gap: 14 }}
      >
        <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--panel)", color: "var(--lime)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Rychlý kvíz</div>
          <div style={{ fontSize: 12.5, opacity: 0.7 }}>5 otázek napříč tématy podle tvé úrovně</div>
        </div>
        <Icon name="chevR" size={18} color="var(--ink)" stroke={2.4} />
      </button>

      {/* topic grid */}
      <div className="h2" style={{ fontSize: 20, marginBottom: 12 }}>
        Témata
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {TOPICS.map((t) => {
          const m = topicMastery(academy, t.id);
          return (
            <button
              key={t.id}
              onClick={() => startQuiz(t.id)}
              className="card pressable"
              aria-label={`${t.name} — zvládnuto ${m.right} z ${m.total}, hrát kvíz`}
              style={{ padding: 12, textAlign: "left", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{t.emoji}</div>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: "var(--ink2)" }}>
                  {m.right}/{m.total}
                </span>
                <Icon name="chevR" size={12} color="var(--ink3)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.25, minHeight: 34, display: "flex", alignItems: "center" }}>{t.name}</div>
              <div style={{ width: "100%", height: 4, background: "var(--surface2)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${m.pct}%`, background: t.color }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* quests */}
      <div className="h2" style={{ fontSize: 20, marginBottom: 12 }}>
        Aktivní questy
      </div>
      <div className="grid two" style={{ marginBottom: 24 }}>
        {quests.map((q) => {
          const done = q.prog >= q.target;
          return (
            <div key={q.id} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, ...(done ? { textDecoration: "line-through", color: "var(--ink3)" } : {}) }}>{q.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink2)", marginTop: 2 }}>{q.desc}</div>
                </div>
                {done ? (
                  <span style={{ background: "var(--lime)", color: "var(--inkfix)", fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 5 }}>HOTOVO</span>
                ) : (
                  <span style={{ background: "var(--surface2)", color: "var(--ink)", fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 5 }}>+{q.reward} XP</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (q.prog / q.target) * 100)}%`, background: "var(--limedeep)" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)" }}>
                  {q.prog}/{q.target}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* insights */}
      {insights.length > 0 && (
        <>
          <div className="h2" style={{ fontSize: 20, marginBottom: 12 }}>
            Co ses naučil
          </div>
          <div className="grid three" style={{ marginBottom: 18 }}>
            {insights.map((i) => (
              <div key={i.title} className="card" style={{ padding: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ fontSize: 24 }}>{i.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>{i.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5 }}>{i.body}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* weak spots detail */}
      <div className="h2" style={{ fontSize: 20, marginBottom: 12 }}>
        Moje slabá místa
      </div>
      <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 18 }}>
        Otázky, na kterých jsi udělal chybu. Procvič je dokud je nezvládneš — jako v autoškole.
      </div>
      {wrongQs.length ? (
        <>
          {wrongQs.map((q) => {
            const topic = TOPICS.find((t) => t.id === q.topic);
            const dt = DIFF_TIER(q.diff);
            return (
              <div key={q.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 18 }}>{topic?.emoji}</span>
                  <span className="sub" style={{ margin: 0 }}>
                    {topic?.name}
                  </span>
                  <span style={{ marginLeft: "auto", background: dt.soft, color: "var(--ink)", fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 5 }}>{dt.label}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{q.q}</div>
                <div style={{ background: "var(--limesoft)", borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "var(--limedeep)", fontWeight: 800 }}>✓ Správně: </span>
                  {q.opts[q.correct]}
                </div>
                <div style={{ background: "var(--bg)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5 }}>{q.exp}</div>
              </div>
            );
          })}
          <button
            onClick={startQuizFromWrong}
            className="pressable"
            style={{ width: "100%", background: "var(--panel)", color: "var(--lime)", fontWeight: 700, fontSize: 14, padding: 14, borderRadius: 13, marginTop: 10 }}
          >
            Spustit kvíz ze slabých míst
          </button>
        </>
      ) : (
        <div className="card" style={{ padding: 30, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌟</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Žádná slabá místa!</div>
          <div style={{ fontSize: 13, color: "var(--ink2)" }}>Zatím jsi neudělal žádnou chybu. Pokračuj v kvízech.</div>
        </div>
      )}
    </div>
  );
}
