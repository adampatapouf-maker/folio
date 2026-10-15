"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ViewId,
  Plan,
  Theme,
  CalcInputs,
  TaxInputs,
  AcademyState,
  BuilderState,
  ChatMessage,
  ChatAttachment,
  Holding,
  DiscussPost,
  Question,
  Strategy,
  AiWidget,
} from "@/lib/types";
import { defaultHoldings } from "@/lib/calc/portfolio";
import { computeBuilder } from "@/lib/calc/builder";
import { getAsset } from "@/lib/assets";
import { QZ, PROFILES } from "@/data/builder";
import { QBANK } from "@/data/academy";
import { STRAT } from "@/data/portfolio";
import { aiReply } from "@/lib/ai/engine";
import { buildAiContext } from "@/lib/ai/context";
import { TUTORIAL } from "@/data/tutorial";

/** Snapshot pushed onto the navigation history stack. */
interface NavSnapshot {
  view: ViewId;
  assetView: string | null;
  newsOpen: number | null;
  pfTab: string;
}

interface ToastState {
  msg: string;
  emoji?: string;
  id: number;
}

const TOP_VIEWS: ViewId[] = ["dashboard", "data", "ai", "portfolio", "report", "calc", "academy", "news", "calendar", "discuss", "profile"];
export const AI_FREE_LIMIT = 5;
const QUESTIONS_PER_QUIZ = 5;

/** Local calendar day as YYYY-MM-DD (streaks follow the user's day, not UTC). */
const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const toast = (msg: string, emoji?: string): { toast: ToastState } => ({ toast: { msg, emoji, id: Date.now() } });

export interface FolioState {
  // ---- core ----
  view: ViewId;
  plan: Plan;
  theme: Theme;
  /** The user's target strategy — drives drift, monthly plan, report and AI. */
  strategy: Strategy;
  // ---- calculator ----
  calc: CalcInputs;
  calcChart: "line" | "bar";
  calcCompare: Record<string, boolean>;
  // ---- ai ----
  chat: ChatMessage[];
  aiAtt: ChatAttachment[];
  aiPending: boolean;
  // ---- academy ----
  academy: AcademyState;
  streak: number;
  lastQuizDay: string | null;
  // ---- asset / charts ----
  assetView: string | null;
  chartMode: "line" | "candle";
  tf: string;
  maOn: boolean;
  // ---- builder ----
  builder: BuilderState;
  // ---- tax ----
  tax: TaxInputs;
  // ---- portfolio ----
  holdings: Holding[] | null;
  pfEdit: boolean;
  pfTab: string;
  addAsset: boolean;
  addSearch: string;
  // ---- news / filters ----
  newsOpen: number | null;
  calFilter: string;
  discFilter: string;
  dataFilter: string;
  dataSearch: string;
  reportTab: string;
  reportWhy: string | null;
  // ---- chrome ----
  notif: boolean;
  moreOpen: boolean;
  onboarded: boolean;
  tutorial: number | null;
  tutorialDone: boolean;
  // ---- social ----
  myPosts: DiscussPost[];
  likes: Record<string, boolean>;
  // ---- transient ----
  hist: NavSnapshot[];
  toast: ToastState | null;
  hydrated: boolean;

  // ===== actions =====
  go: (v: ViewId) => void;
  goBack: () => void;
  openAsset: (sym: string) => void;
  closeAsset: () => void;
  openNews: (idx: number) => void;
  closeNews: () => void;
  setPlan: (p: Plan) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setStrategy: (profileName: string) => void;
  adoptBuilderResult: () => void;
  setCalc: (k: keyof CalcInputs, v: number) => void;
  setCalcChart: (t: "line" | "bar") => void;
  toggleCompare: (k: string) => void;
  setTax: (k: keyof TaxInputs, v: number) => void;
  setChart: (m: "line" | "candle") => void;
  setTf: (t: string) => void;
  toggleMA: () => void;
  askAI: (q: string, atts?: ChatAttachment[]) => Promise<void>;
  addAtt: (a: ChatAttachment) => void;
  removeAtt: (i: number) => void;
  startQuiz: (topicId: string) => void;
  answerQ: (idx: number) => void;
  startQuizFromWrong: () => void;
  startBuilder: () => void;
  builderAnswer: (qid: string, i: number) => void;
  builderBack: () => void;
  togglePfEdit: () => void;
  pfAdjust: (sym: string, delta: number) => void;
  pfRemove: (sym: string) => void;
  openAddAsset: () => void;
  closeAddAsset: () => void;
  pfAdd: (sym: string) => void;
  setAddSearch: (v: string) => void;
  setPfTab: (t: string) => void;
  setCalFilter: (t: string) => void;
  setDiscFilter: (t: string) => void;
  setDataFilter: (f: string) => void;
  setDataSearch: (v: string) => void;
  setReportTab: (t: string) => void;
  toggleReportWhy: (id: string) => void;
  toggleNotif: () => void;
  toggleMore: () => void;
  onboardStart: () => void;
  onboardSkip: () => void;
  tutorialNext: () => void;
  tutorialPrev: () => void;
  tutorialEnd: () => void;
  startTutorial: () => void;
  postDiscuss: (text: string) => void;
  toggleLike: (id: string) => void;
  showToast: (msg: string, emoji?: string) => void;
  resetState: () => void;
  setHydrated: () => void;
}

const snapshot = (s: FolioState): NavSnapshot => ({ view: s.view, assetView: s.assetView, newsOpen: s.newsOpen, pfTab: s.pfTab });
const pushHist = (s: FolioState) => [...s.hist, snapshot(s)].slice(-40);

const INITIAL = {
  view: "dashboard" as ViewId,
  plan: "free" as Plan,
  theme: "light" as Theme,
  strategy: STRAT,
  calc: { initial: 5000, monthly: 500, rate: 7, years: 20 },
  calcChart: "line" as const,
  calcCompare: {} as Record<string, boolean>,
  chat: [] as ChatMessage[],
  aiAtt: [] as ChatAttachment[],
  aiPending: false,
  academy: { xp: 0, answered: [], wrong: [], session: null, questIdx: 0 } as AcademyState,
  streak: 0,
  lastQuizDay: null as string | null,
  builder: { step: 0, answers: {}, done: false } as BuilderState,
  tax: { buy: 10000, sell: 14000, months: 18, dip: 6000 },
  holdings: null as Holding[] | null,
  myPosts: [] as DiscussPost[],
  likes: {} as Record<string, boolean>,
  onboarded: false,
  tutorialDone: false,
};

export const useFolioStore = create<FolioState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      assetView: null,
      chartMode: "line",
      tf: "1M",
      maOn: false,
      pfEdit: false,
      pfTab: "overview",
      addAsset: false,
      addSearch: "",
      newsOpen: null,
      calFilter: "all",
      discFilter: "all",
      dataFilter: "all",
      dataSearch: "",
      reportTab: "weekly",
      reportWhy: null,
      notif: true,
      moreOpen: false,
      tutorial: null,
      hist: [],
      toast: null,
      hydrated: false,

      // ---- navigation ----
      go: (v) =>
        set((s) => ({
          view: v,
          onboarded: true,
          assetView: null,
          newsOpen: null,
          moreOpen: false,
          addAsset: false,
          hist: TOP_VIEWS.includes(v) ? [] : pushHist(s),
        })),
      goBack: () =>
        set((s) => {
          if (s.addAsset) return { addAsset: false };
          if (s.moreOpen) return { moreOpen: false };
          if (!s.hist.length) return s.view === "dashboard" ? {} : { view: "dashboard", assetView: null, newsOpen: null };
          const hist = [...s.hist];
          const prev = hist.pop()!;
          return { view: prev.view, assetView: prev.assetView, newsOpen: prev.newsOpen, pfTab: prev.pfTab, moreOpen: false, hist };
        }),
      openAsset: (sym) => set((s) => ({ hist: pushHist(s), assetView: sym, view: "data", moreOpen: false })),
      closeAsset: () => get().goBack(),
      openNews: (idx) => set((s) => ({ hist: pushHist(s), newsOpen: idx, view: "newsArticle" })),
      closeNews: () => get().goBack(),

      // ---- settings ----
      setPlan: (p) => set({ plan: p, ...(p === "premium" ? toast("Premium odemčeno (demo)", "✦") : {}) }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      // ---- strategy ----
      setStrategy: (name) => {
        const p = PROFILES[name];
        if (p) set({ strategy: { name, risk: p.risk, ret: p.ret, vol: p.vol, alloc: p.alloc }, ...toast(`Strategie: ${name}`, "🎯") });
      },
      adoptBuilderResult: () =>
        set((s) => {
          const r = computeBuilder(s.builder.answers);
          return {
            strategy: { name: r.name, risk: r.risk, ret: r.ret, vol: r.vol, alloc: r.alloc },
            ...toast(`Strategie ${r.name} nastavena — report a plán se přepočítaly`, "🎯"),
          };
        }),

      // ---- calculator / tax / charts ----
      setCalc: (k, v) => set((s) => ({ calc: { ...s.calc, [k]: Math.max(0, Number.isFinite(v) ? v : 0) } })),
      setCalcChart: (t) => set({ calcChart: t }),
      toggleCompare: (k) => set((s) => (s.plan !== "premium" ? {} : { calcCompare: { ...s.calcCompare, [k]: !s.calcCompare[k] } })),
      setTax: (k, v) => set((s) => ({ tax: { ...s.tax, [k]: Math.max(0, Number(v) || 0) } })),
      setChart: (m) => set({ chartMode: m }),
      setTf: (t) => set({ tf: t }),
      toggleMA: () => set((s) => ({ maOn: !s.maOn })),

      // ---- Folio AI ----
      askAI: async (q, atts) => {
        const s = get();
        if (s.aiPending) return;
        const used = s.chat.filter((m) => m.r === "user").length;
        set({ view: "ai", moreOpen: false });
        if (s.plan === "free" && used >= AI_FREE_LIMIT) return;

        const a0 = atts && atts.length ? atts : null;
        const history = s.chat.map((m) => ({ r: m.r, t: m.t }));
        const context = buildAiContext(s.holdings ?? defaultHoldings(), s.strategy, s.calc.monthly);
        set({ chat: [...s.chat, { r: "user", t: q, atts: a0 }], aiAtt: [], aiPending: true });

        let reply: { t: string; widget?: AiWidget };
        try {
          const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ q, atts: a0 ?? undefined, history, context }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          reply = (await res.json()) as { t: string; widget?: AiWidget };
        } catch {
          // Offline / server down: answer locally so the chat never dead-ends.
          reply = aiReply(q, a0, context);
        }
        set((cur) => ({ chat: [...cur.chat, { r: "ai", t: reply.t, widget: reply.widget }], aiPending: false }));
      },
      addAtt: (a) => set((s) => (s.aiAtt.length < 5 ? { aiAtt: [...s.aiAtt, a] } : {})),
      removeAtt: (i) => set((s) => ({ aiAtt: s.aiAtt.filter((_, idx) => idx !== i) })),

      // ---- academy ----
      startQuiz: (topicId) =>
        set((s) => {
          const xp = s.academy.xp;
          const maxDiff = xp >= 250 ? 3 : xp >= 100 ? 2 : 1;
          let pool = QBANK.filter((q) => q.diff <= maxDiff);
          if (topicId && topicId !== "all") pool = pool.filter((q) => q.topic === topicId);
          // Unanswered first, then ones answered wrong, then anything.
          const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
          const fresh = shuffle(pool.filter((q) => !s.academy.answered.includes(q.id)));
          const wrong = shuffle(pool.filter((q) => s.academy.wrong.includes(q.id) && !fresh.includes(q)));
          const rest = shuffle(pool.filter((q) => !fresh.includes(q) && !wrong.includes(q)));
          const chosen = [...fresh, ...wrong, ...rest].slice(0, QUESTIONS_PER_QUIZ);
          if (!chosen.length) return toast("V tomto tématu zatím nejsou otázky", "📚");
          const hist = s.view !== "quizPlay" && s.view !== "quizResult" ? pushHist(s) : s.hist;
          return { academy: { ...s.academy, session: { topic: topicId, questions: chosen, idx: 0, answers: [] } }, view: "quizPlay", hist };
        }),
      answerQ: (idx) =>
        set((s) => {
          const sess = s.academy.session;
          const q = sess?.questions[sess.idx];
          if (!sess || !q || sess.answers.length > sess.idx) return {};
          const answers = [...sess.answers, idx];
          const answered = s.academy.answered.includes(q.id) ? s.academy.answered : [...s.academy.answered, q.id];
          let wrong = [...s.academy.wrong];
          let xp = s.academy.xp;
          if (idx === q.correct) {
            wrong = wrong.filter((x) => x !== q.id);
            xp += q.diff * 5;
          } else if (!wrong.includes(q.id)) {
            wrong.push(q.id);
          }
          if (sess.idx < sess.questions.length - 1) {
            return { academy: { ...s.academy, xp, answered, wrong, session: { ...sess, idx: sess.idx + 1, answers } } };
          }
          const correct = answers.filter((a, i) => a === sess.questions[i].correct).length;
          if (correct === sess.questions.length) xp += 20;
          // Daily streak: consecutive days with at least one finished quiz.
          const today = dayKey();
          const y = new Date();
          y.setDate(y.getDate() - 1);
          const streak = s.lastQuizDay === today ? s.streak : s.lastQuizDay === dayKey(y) ? s.streak + 1 : 1;
          return { academy: { ...s.academy, xp, answered, wrong, session: { ...sess, answers } }, view: "quizResult", streak, lastQuizDay: today };
        }),
      startQuizFromWrong: () =>
        set((s) => {
          const wrongQs = s.academy.wrong
            .map((id) => QBANK.find((q) => q.id === id))
            .filter((q): q is Question => Boolean(q))
            .slice(0, QUESTIONS_PER_QUIZ);
          if (!wrongQs.length) return { view: "academy" };
          return { academy: { ...s.academy, session: { topic: "weak", questions: wrongQs, idx: 0, answers: [] } }, view: "quizPlay", hist: pushHist(s) };
        }),

      // ---- builder ----
      startBuilder: () => set((s) => ({ hist: pushHist(s), builder: { step: 0, answers: {}, done: false }, view: "builder", moreOpen: false })),
      builderAnswer: (qid, i) =>
        set((s) => {
          const answers = { ...s.builder.answers, [qid]: i };
          const idx = QZ.findIndex((q) => q.id === qid);
          if (idx >= QZ.length - 1) {
            const firstRun = !s.onboarded;
            // During onboarding the questionnaire *is* the setup, so its result
            // becomes the strategy right away; later runs are adopted explicitly.
            const r = firstRun ? computeBuilder(answers) : null;
            return {
              builder: { ...s.builder, answers, done: true },
              onboarded: true,
              tutorial: firstRun && !s.tutorialDone ? 0 : s.tutorial,
              ...(r ? { strategy: { name: r.name, risk: r.risk, ret: r.ret, vol: r.vol, alloc: r.alloc } } : {}),
            };
          }
          return { builder: { ...s.builder, answers, step: idx + 1 } };
        }),
      builderBack: () =>
        set((s) => {
          const b = s.builder;
          if (b.done) return { builder: { ...b, done: false, step: QZ.length - 1 } };
          if (b.step > 0) return { builder: { ...b, step: b.step - 1 } };
          return {};
        }),

      // ---- portfolio editing ----
      togglePfEdit: () => set((s) => ({ pfEdit: !s.pfEdit })),
      pfAdjust: (sym, delta) =>
        set((s) => {
          const holdings = (s.holdings ?? defaultHoldings()).map((h) => ({ ...h }));
          const h = holdings.find((x) => x.sym === sym);
          if (!h) return {};
          const step = h.cat === "Krypto" ? 0.01 : 1;
          h.units = Math.max(0, Math.round((h.units + delta * step) * 100) / 100);
          if (h.units <= 0) return { holdings: holdings.filter((x) => x.sym !== sym), ...toast(`${sym} odebráno z portfolia`, "🗑️") };
          return { holdings };
        }),
      pfRemove: (sym) =>
        set((s) => ({ holdings: (s.holdings ?? defaultHoldings()).filter((x) => x.sym !== sym), ...toast(`${sym} odebráno z portfolia`, "🗑️") })),
      openAddAsset: () => set({ addAsset: true, addSearch: "", moreOpen: false }),
      closeAddAsset: () => set({ addAsset: false }),
      pfAdd: (sym) =>
        set((s) => {
          const holdings = (s.holdings ?? defaultHoldings()).map((h) => ({ ...h }));
          const existing = holdings.find((x) => x.sym === sym);
          if (existing) {
            existing.units = Math.round((existing.units + (existing.cat === "Krypto" ? 0.01 : 1)) * 100) / 100;
            return { holdings, addAsset: false, ...toast(`${sym} navýšeno`, "✓") };
          }
          const a = getAsset(sym);
          if (!a) return {};
          holdings.push({ sym, units: a.cat === "Krypto" ? 0.05 : 5, avg: a.price || 1, cat: a.cat });
          return { holdings, addAsset: false, ...toast(`${sym} přidáno do portfolia`, "✓") };
        }),
      setAddSearch: (v) => set({ addSearch: v }),

      // ---- filters / tabs ----
      setPfTab: (t) => set({ pfTab: t }),
      setCalFilter: (t) => set({ calFilter: t }),
      setDiscFilter: (t) => set({ discFilter: t }),
      setDataFilter: (f) => set({ dataFilter: f }),
      setDataSearch: (v) => set({ dataSearch: v }),
      setReportTab: (t) => set({ reportTab: t, reportWhy: null }),
      toggleReportWhy: (id) => set((s) => ({ reportWhy: s.reportWhy === id ? null : id })),
      toggleNotif: () => set((s) => ({ notif: !s.notif, ...toast(!s.notif ? "Notifikace zapnuty" : "Notifikace vypnuty", !s.notif ? "🔔" : "🔕") })),
      toggleMore: () => set((s) => ({ moreOpen: !s.moreOpen })),

      // ---- onboarding / tutorial ----
      onboardStart: () => set({ hist: [], builder: { step: 0, answers: {}, done: false }, view: "builder" }),
      onboardSkip: () => set((s) => ({ onboarded: true, view: "dashboard", tutorial: s.tutorialDone ? null : 0 })),
      tutorialNext: () =>
        set((s) => {
          if (s.tutorial == null) return {};
          if (s.tutorial >= TUTORIAL.length - 1) return { tutorial: null, tutorialDone: true };
          return { tutorial: s.tutorial + 1 };
        }),
      tutorialPrev: () => set((s) => (s.tutorial && s.tutorial > 0 ? { tutorial: s.tutorial - 1 } : {})),
      tutorialEnd: () => set({ tutorial: null, tutorialDone: true }),
      startTutorial: () => set({ tutorial: 0 }),

      // ---- social ----
      postDiscuss: (text) =>
        set((s) => {
          const v = text.trim();
          if (!v) return toast("Napiš nejdřív svůj názor", "🙂");
          const symMatch = v.match(/\$([A-Z]{1,6})\b/);
          const sym = symMatch && getAsset(symMatch[1]) ? symMatch[1] : null;
          const post: DiscussPost = {
            user: "Ty",
            handle: "@ty",
            av: "#7FB000",
            ver: false,
            time: "teď",
            sym,
            text: v,
            likes: 0,
            comments: 0,
            reposts: 0,
            mine: true,
            id: "p" + Date.now(),
          };
          return { myPosts: [post, ...s.myPosts], ...toast("Příspěvek přidán", "✓") };
        }),
      toggleLike: (id) => set((s) => ({ likes: { ...s.likes, [id]: !s.likes[id] } })),

      // ---- misc ----
      showToast: (msg, emoji) => set(toast(msg, emoji)),
      resetState: () =>
        set({
          ...INITIAL,
          academy: { xp: 0, answered: [], wrong: [], session: null, questIdx: 0 },
          builder: { step: 0, answers: {}, done: false },
          hist: [],
          tutorial: null,
        }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "folio_state_v1",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        plan: s.plan,
        theme: s.theme,
        strategy: s.strategy,
        calc: s.calc,
        calcChart: s.calcChart,
        calcCompare: s.calcCompare,
        holdings: s.holdings,
        chat: s.chat,
        academy: { xp: s.academy.xp, answered: s.academy.answered, wrong: s.academy.wrong, session: null, questIdx: 0 },
        streak: s.streak,
        lastQuizDay: s.lastQuizDay,
        builder: s.builder.done ? s.builder : null,
        notif: s.notif,
        onboarded: s.onboarded,
        tax: s.tax,
        myPosts: s.myPosts,
        likes: s.likes,
        tutorialDone: s.tutorialDone,
      }),
      // v1 → v2: strategy was added; older saves get the default.
      migrate: (persisted) => persisted as Partial<FolioState>,
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<FolioState>;
        return {
          ...current,
          ...p,
          strategy: p.strategy?.alloc?.length ? p.strategy : current.strategy,
          academy: { ...current.academy, ...(p.academy || {}), session: null },
          builder: p.builder || current.builder,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
