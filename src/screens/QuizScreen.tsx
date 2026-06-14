"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { TOPICS } from "@/data/academy";
import { Icon } from "@/components/ui/Icon";
import { AcademyScreen } from "@/screens/AcademyScreen";

const DIFF_TIER = (diff: 1 | 2 | 3): { soft: string; label: string } =>
  diff === 1 ? { soft: "var(--limesoft)", label: "LEHKÁ" } : diff === 2 ? { soft: "var(--ambersoft)", label: "STŘEDNÍ" } : { soft: "var(--coralsoft)", label: "TĚŽKÁ" };

export function QuizPlayScreen() {
  const session = useFolioStore((s) => s.academy.session);
  const answerQ = useFolioStore((s) => s.answerQ);
  const go = useFolioStore((s) => s.go);

  if (!session || !session.questions.length) return <AcademyScreen />;

  const q = session.questions[session.idx];
  const topic = TOPICS.find((t) => t.id === q.topic);
  const topicColor = topic?.color ?? "var(--lime)";
  const totalSteps = session.questions.length;
  const dt = DIFF_TIER(q.diff);
  // The store advances automatically; an answer is recorded for the current
  // index only if the session was reopened on the same index — render feedback then.
  const picked = session.answers[session.idx];
  const answered = picked !== undefined;

  return (
    <div className="fade" style={{ maxWidth: 680, margin: "0 auto" }}>
      <button
        onClick={() => go("academy")}
        className="pressable"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--ink2)", marginBottom: 12 }}
      >
        <Icon name="chevL" size={16} color="var(--ink2)" /> Konec kvízu
      </button>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {session.questions.map((sq, i) => (
          <div
            key={sq.id}
            style={{
              flex: 1,
              height: i === session.idx ? 9 : 5,
              marginTop: i === session.idx ? -2 : 0,
              background: i < session.idx ? topicColor : "var(--surface2)",
              borderRadius: 3,
              ...(i === session.idx ? { border: `2px solid ${topicColor}` } : {}),
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 24 }}>{topic?.emoji}</span>
        <span className="sub" style={{ margin: 0 }}>
          {topic?.name} · Otázka {session.idx + 1}/{totalSteps}
        </span>
        <span style={{ marginLeft: "auto", background: dt.soft, color: "var(--ink)", fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 5 }}>{dt.label}</span>
      </div>

      <div className="fd" style={{ fontSize: 24, fontWeight: 500, marginBottom: 20, lineHeight: 1.3 }}>
        {q.q}
      </div>

      {q.opts.map((o, i) => {
        const isPicked = answered && picked === i;
        const isCorrect = answered && i === q.correct;
        let background = "var(--surface)";
        let borderColor = "var(--line)";
        if (isCorrect) {
          background = "var(--limesoft)";
          borderColor = "var(--limedeep)";
        } else if (isPicked) {
          background = "var(--coralsoft)";
          borderColor = "var(--coral)";
        }
        return (
          <button
            key={i}
            onClick={() => answerQ(i)}
            disabled={answered}
            className="pressable"
            style={{
              width: "100%",
              textAlign: "left",
              padding: "16px 18px",
              marginBottom: 10,
              background,
              border: `1.5px solid ${borderColor}`,
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              transition: ".15s",
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function QuizResultScreen() {
  const session = useFolioStore((s) => s.academy.session);
  const startQuiz = useFolioStore((s) => s.startQuiz);
  const startQuizFromWrong = useFolioStore((s) => s.startQuizFromWrong);
  const go = useFolioStore((s) => s.go);

  if (!session) return <AcademyScreen />;

  const total = session.questions.length;
  const correct = session.answers.filter((a, i) => a === session.questions[i].correct).length;
  const wrongList = session.questions.map((q, i) => ({ q, picked: session.answers[i] })).filter((x) => x.picked !== x.q.correct);
  const pct = Math.round((correct / total) * 100);
  const xpGained = correct * 10 + (correct === total ? 20 : 0);
  const isPerfect = correct === total;
  const isGood = correct >= total * 0.6;

  const heroBg = isPerfect ? "var(--lime)" : isGood ? "var(--ambersoft)" : "var(--coralsoft)";
  const heroColor = isPerfect ? "var(--inkfix)" : "var(--ink)";
  const heroEmoji = isPerfect ? "🏆" : isGood ? "👍" : "💪";
  const heroTitle = isPerfect ? "Plný počet!" : isGood ? "Dobrá práce" : "Zkus to znovu";

  return (
    <div className="fade" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div className="pop" style={{ background: heroBg, color: heroColor, borderRadius: 22, padding: 30, textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{heroEmoji}</div>
        <div className="fd" style={{ fontSize: 30, fontWeight: 600, marginBottom: 4 }}>
          {heroTitle}
        </div>
        <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 14 }}>
          {correct}/{total} správně · {pct} %
        </div>
        <div style={{ display: "inline-block", background: "var(--panel)", color: "var(--lime)", padding: "10px 18px", borderRadius: 12, fontWeight: 800, fontSize: 15 }}>+{xpGained} XP</div>
      </div>

      {wrongList.length ? (
        <>
          <div className="h2" style={{ fontSize: 20, marginBottom: 12 }}>
            Kde jsi udělal chybu
          </div>
          {wrongList.map(({ q, picked }) => {
            const topic = TOPICS.find((t) => t.id === q.topic);
            return (
              <div key={q.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{topic?.emoji}</span>
                  <span className="sub" style={{ margin: 0 }}>
                    {topic?.name}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{q.q}</div>
                <div style={{ background: "var(--coralsoft)", borderRadius: 10, padding: "10px 12px", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: "var(--coral)", fontWeight: 800 }}>✗ Tvá odpověď: </span>
                  {q.opts[picked]}
                </div>
                <div style={{ background: "var(--limesoft)", borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: "var(--limedeep)", fontWeight: 800 }}>✓ Správně: </span>
                  {q.opts[q.correct]}
                </div>
                <div style={{ background: "var(--bg)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5 }}>
                  <b>💡 </b>
                  {q.exp}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="card" style={{ padding: 20, textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>✨</div>
          <div style={{ fontWeight: 700 }}>Žádné chyby — všechny otázky správně!</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        <button
          onClick={() => startQuiz(session.topic ?? "all")}
          className="pressable"
          style={{ flex: 1, minWidth: 160, background: "var(--panel)", color: "var(--lime)", fontWeight: 700, fontSize: 14, padding: 14, borderRadius: 13 }}
        >
          Další kvíz
        </button>
        <button
          onClick={startQuizFromWrong}
          className="pressable"
          style={{ flex: 1, minWidth: 160, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 700, fontSize: 14, padding: 14, borderRadius: 13 }}
        >
          Procvičit chyby
        </button>
        <button
          onClick={() => go("academy")}
          className="pressable"
          style={{ flex: 1, minWidth: 160, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 700, fontSize: 14, padding: 14, borderRadius: 13 }}
        >
          Zpět do akademie
        </button>
      </div>
    </div>
  );
}
