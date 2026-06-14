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
} from "@/lib/types";
import { defaultHoldings } from "@/lib/calc/portfolio";
import { getAsset } from "@/lib/assets";
import { QZ } from "@/data/builder";
import { QBANK } from "@/data/academy";
import { aiReply } from "@/lib/ai/engine";
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

const TOP_VIEWS: ViewId[] = [
  "dashboard",
  "data",
  "ai",
  "portfolio",
  "report",
  "calc",
  "academy",
  "news",
  "calendar",
  "discuss",
  "profile",
];
const AI_FREE_LIMIT = 5;

export interface FolioState {
  // ---- core ----
  view: ViewId;
  plan: Plan;
  theme: Theme;
  // ---- calculator ----
  calc: CalcInputs;
  calcChart: "line" | "bar";
  calcCompare: Record<string, boolean>;
  // ---- ai ----
  chat: ChatMessage[];
  aiAtt: ChatAttachment[];
  // ---- academy ----
  academy: AcademyState;
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
  reportWhy: number | null;
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
  // calc
  setCalc: (k: keyof CalcInputs, v: number) => void;
  setCalcChart: (t: "line" | "bar") => void;
  toggleCompare: (k: string) => void;
  // tax
  setTax: (k: keyof TaxInputs, v: number) => void;
  // charts
  setChart: (m: "line" | "candle") => void;
  setTf: (t: string) => void;
  toggleMA: () => void;
  // ai
  askAI: (q: string, atts?: ChatAttachment[]) => void;
  addAtt: (a: ChatAttachment) => void;
  removeAtt: (i: number) => void;
  // academy
  startQuiz: (topicId: string) => void;
  answerQ: (idx: number) => void;
  startQuizFromWrong: () => void;
  // builder
  startBuilder: () => void;
  builderAnswer: (qid: string, i: number) => void;
  builderBack: () => void;
  // portfolio
  togglePfEdit: () => void;
  pfAdjust: (sym: string, delta: number) => void;
  pfRemove: (sym: string) => void;
  openAddAsset: () => void;
  closeAddAsset: () => void;
  pfAdd: (sym: string) => void;
  setAddSearch: (v: string) => void;
  // filters / tabs
  setPfTab: (t: string) => void;
  setCalFilter: (t: string) => void;
  setDiscFilter: (t: string) => void;
  setDataFilter: (f: string) => void;
  setDataSearch: (v: string) => void;
  setReportTab: (t: string) => void;
  toggleReportWhy: (i: number) => void;
  toggleNotif: () => void;
  toggleMore: () => void;
  // tutorial / onboarding
  onboardStart: () => void;
  onboardSkip: () => void;
  tutorialNext: () => void;
  tutorialPrev: () => void;
  tutorialEnd: () => void;
  startTutorial: () => void;
  // social
  postDiscuss: (text: string) => void;
  toggleLike: (id: string) => void;
  // misc
  showToast: (msg: string, emoji?: string) => void;
  resetState: () => void;
  setHydrated: () => void;
}

const snapshot = (s: FolioState): NavSnapshot => ({
  view: s.view,
  assetView: s.assetView,
  newsOpen: s.newsOpen,
  pfTab: s.pfTab,
});

export const useFolioStore = create<FolioState>()(
  persist(
    (set, get) => ({
      view: "dashboard",
      plan: "free",
      theme: "light",
      calc: { initial: 5000, monthly: 500, rate: 7, years: 20 },
      calcChart: "line",
      calcCompare: {},
      chat: [],
      aiAtt: [],
      academy: { xp: 0, answered: [], wrong: [], session: null, questIdx: 0 },
      assetView: null,
      chartMode: "line",
      tf: "1M",
      maOn: false,
      builder: { step: 0, answers: {}, done: false },
      tax: { buy: 10000, sell: 14000, months: 18, dip: 6000 },
      holdings: null,
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
      onboarded: false,
      tutorial: null,
      tutorialDone: false,
      myPosts: [],
      likes: {},
      hist: [],
      toast: null,
      hydrated: false,

      go: (v) =>
        set((s) => {
          const hist = TOP_VIEWS.includes(v) ? [] : [...s.hist, snapshot(s)].slice(-40);
          if (!s.onboarded) {
            return { onboarded: true, view: v, assetView: null, newsOpen: null, moreOpen: false, addAsset: false, hist };
          }
          return { view: v, assetView: null, newsOpen: null, moreOpen: false, addAsset: false, hist };
        }),

      goBack: () =>
        set((s) => {
          if (s.addAsset) return { addAsset: false };
          if (s.moreOpen) return { moreOpen: false };
          if (!s.hist.length) return {};
          const hist = [...s.hist];
          const prev = hist.pop()!;
          return { view: prev.view, assetView: prev.assetView, newsOpen: prev.newsOpen, pfTab: prev.pfTab, moreOpen: false, hist };
        }),

      openAsset: (sym) => set((s) => ({ hist: [...s.hist, snapshot(s)].slice(-40), assetView: sym, view: "data", moreOpen: false })),
      closeAsset: () => get().goBack(),
      openNews: (idx) => set((s) => ({ hist: [...s.hist, snapshot(s)].slice(-40), newsOpen: idx, view: "newsArticle" })),
      closeNews: () => get().goBack(),

      setPlan: (p) => set({ plan: p }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      setCalc: (k, v) => set((s) => ({ calc: { ...s.calc, [k]: Math.max(0, isNaN(v) ? 0 : v) } })),
      setCalcChart: (t) => set({ calcChart: t }),
      toggleCompare: (k) =>
        set((s) => {
          if (s.plan !== "premium") return { view: "calc" };
          return { calcCompare: { ...s.calcCompare, [k]: !s.calcCompare[k] } };
        }),

      setTax: (k, v) => set((s) => ({ tax: { ...s.tax, [k]: Number(v) } })),

      setChart: (m) => set({ chartMode: m }),
      setTf: (t) => set({ tf: t }),
      toggleMA: () => set((s) => ({ maOn: !s.maOn })),

      askAI: (q, atts) =>
        set((s) => {
          const used = s.chat.filter((m) => m.r === "user").length;
          if (s.plan === "free" && used >= AI_FREE_LIMIT) return { view: "ai" };
          const a0 = atts && atts.length ? atts : null;
          const reply = aiReply(q, a0);
          return {
            view: "ai",
            chat: [...s.chat, { r: "user", t: q, atts: a0 }, { r: "ai", t: reply.t, widget: reply.widget }],
            aiAtt: [],
          };
        }),
      addAtt: (a) => set((s) => (s.aiAtt.length < 5 ? { aiAtt: [...s.aiAtt, a] } : {})),
      removeAtt: (i) => set((s) => ({ aiAtt: s.aiAtt.filter((_, idx) => idx !== i) })),

      startQuiz: (topicId) =>
        set((s) => {
          const xp = s.academy.xp;
          let maxDiff = 1;
          if (xp >= 100) maxDiff = 2;
          if (xp >= 250) maxDiff = 3;
          let pool = QBANK.filter((q) => q.diff <= maxDiff);
          if (topicId && topicId !== "all") pool = pool.filter((q) => q.topic === topicId);
          const wrong = pool.filter((q) => s.academy.wrong.includes(q.id));
          const fresh = pool.filter((q) => !s.academy.answered.includes(q.id));
          const chosen: Question[] = [];
          const freshCopy = [...fresh];
          for (let i = 0; i < 5; i++) {
            const pickFrom = freshCopy.length ? freshCopy : wrong.length ? wrong : pool;
            if (!pickFrom.length) break;
            const idx = Math.floor(Math.random() * pickFrom.length);
            const q = pickFrom[idx];
            if (!q) break;
            if (!chosen.find((x) => x.id === q.id)) chosen.push(q);
            const i2 = freshCopy.indexOf(q);
            if (i2 >= 0) freshCopy.splice(i2, 1);
          }
          const hist = s.view !== "quizPlay" && s.view !== "quizResult" ? [...s.hist, snapshot(s)].slice(-40) : s.hist;
          return { academy: { ...s.academy, session: { topic: topicId, questions: chosen, idx: 0, answers: [] } }, view: "quizPlay", hist };
        }),

      answerQ: (idx) =>
        set((s) => {
          const sess = s.academy.session;
          if (!sess) return {};
          const q = sess.questions[sess.idx];
          if (!q) return {};
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
          return { academy: { ...s.academy, xp, answered, wrong, session: { ...sess, answers } }, view: "quizResult" };
        }),

      startQuizFromWrong: () =>
        set((s) => {
          const wrongQs = s.academy.wrong.map((id) => QBANK.find((q) => q.id === id)).filter((q): q is Question => Boolean(q)).slice(0, 5);
          if (!wrongQs.length) return { view: "academy" };
          return { academy: { ...s.academy, session: { topic: "weak", questions: wrongQs, idx: 0, answers: [] } }, view: "quizPlay" };
        }),

      startBuilder: () => set((s) => ({ hist: [...s.hist, snapshot(s)].slice(-40), builder: { step: 0, answers: {}, done: false }, view: "builder", moreOpen: false })),
      builderAnswer: (qid, i) =>
        set((s) => {
          const answers = { ...s.builder.answers, [qid]: i };
          const idx = QZ.findIndex((q) => q.id === qid);
          if (idx >= QZ.length - 1) {
            const startTut = !s.onboarded && !s.tutorialDone;
            return { builder: { ...s.builder, answers, done: true }, onboarded: true, tutorial: startTut ? 0 : s.tutorial };
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

      togglePfEdit: () => set((s) => ({ pfEdit: !s.pfEdit })),
      pfAdjust: (sym, delta) =>
        set((s) => {
          const holdings = (s.holdings || defaultHoldings()).map((h) => ({ ...h }));
          const h = holdings.find((x) => x.sym === sym);
          if (!h) return {};
          const isCrypto = h.cat === "Krypto";
          const step = isCrypto ? 0.01 : 1;
          h.units = Math.max(0, Math.round((h.units + delta * step) * 100) / 100);
          if (h.units <= 0) {
            get().showToast(sym + " odebráno z portfolia", "🗑️");
            return { holdings: holdings.filter((x) => x.sym !== sym) };
          }
          return { holdings };
        }),
      pfRemove: (sym) =>
        set((s) => {
          get().showToast(sym + " odebráno z portfolia", "🗑️");
          return { holdings: (s.holdings || defaultHoldings()).filter((x) => x.sym !== sym) };
        }),
      openAddAsset: () => set({ addAsset: true, moreOpen: false }),
      closeAddAsset: () => set({ addAsset: false }),
      pfAdd: (sym) =>
        set((s) => {
          const holdings = (s.holdings || defaultHoldings()).map((h) => ({ ...h }));
          const existing = holdings.find((x) => x.sym === sym);
          if (existing) {
            const isCrypto = existing.cat === "Krypto";
            existing.units = Math.round((existing.units + (isCrypto ? 0.01 : 1)) * 100) / 100;
            get().showToast(sym + " navýšeno", "✓");
            return { holdings, addAsset: false };
          }
          const a = getAsset(sym);
          if (!a) return {};
          const isCrypto = a.cat === "Krypto";
          holdings.push({ sym, units: isCrypto ? 0.05 : 5, avg: a.price || 1, cat: a.cat });
          get().showToast(sym + " přidáno do portfolia", "✓");
          return { holdings, addAsset: false };
        }),
      setAddSearch: (v) => set({ addSearch: v }),

      setPfTab: (t) => set({ pfTab: t }),
      setCalFilter: (t) => set({ calFilter: t }),
      setDiscFilter: (t) => set({ discFilter: t }),
      setDataFilter: (f) => set({ dataFilter: f }),
      setDataSearch: (v) => set({ dataSearch: v }),
      setReportTab: (t) => set({ reportTab: t }),
      toggleReportWhy: (i) => set((s) => ({ reportWhy: s.reportWhy === i ? null : i })),
      toggleNotif: () =>
        set((s) => {
          const notif = !s.notif;
          get().showToast(notif ? "Notifikace zapnuty 🔔" : "Notifikace vypnuty");
          return { notif };
        }),
      toggleMore: () => set((s) => ({ moreOpen: !s.moreOpen })),

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

      postDiscuss: (text) =>
        set((s) => {
          const v = text.trim();
          if (!v) {
            get().showToast("Napiš nejdřív svůj názor 🙂");
            return {};
          }
          const symMatch = v.match(/\$([A-Z]{1,6})\b/);
          let sym = symMatch && getAsset(symMatch[1]) ? symMatch[1] : null;
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
          get().showToast("Příspěvek přidán", "✓");
          return { myPosts: [post, ...s.myPosts] };
        }),
      toggleLike: (id) => set((s) => ({ likes: { ...s.likes, [id]: !s.likes[id] } })),

      showToast: (msg, emoji) => set({ toast: { msg, emoji, id: Date.now() } }),
      resetState: () =>
        set({
          holdings: null,
          chat: [],
          academy: { xp: 0, answered: [], wrong: [], session: null, questIdx: 0 },
          plan: "free",
          calcCompare: {},
          onboarded: false,
          builder: { step: 0, answers: {}, done: false },
          myPosts: [],
          likes: {},
          tutorialDone: false,
          view: "dashboard",
        }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "folio_state_v1",
      storage: createJSONStorage(() => localStorage),
      // Persist the same subset the prototype's saveState() did.
      partialize: (s) => ({
        plan: s.plan,
        theme: s.theme,
        calc: s.calc,
        calcChart: s.calcChart,
        calcCompare: s.calcCompare,
        holdings: s.holdings,
        chat: s.chat,
        academy: { xp: s.academy.xp, answered: s.academy.answered, wrong: s.academy.wrong, session: null, questIdx: 0 },
        builder: s.builder.done ? s.builder : null,
        notif: s.notif,
        onboarded: s.onboarded,
        tax: s.tax,
        myPosts: s.myPosts,
        likes: s.likes,
        tutorialDone: s.tutorialDone,
      }),
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<FolioState>;
        return {
          ...current,
          ...p,
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
