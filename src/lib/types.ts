/**
 * Folio domain types.
 *
 * These model the data extracted from the original prototype: market assets,
 * fundamentals, the user's portfolio, academy/quiz, the portfolio builder,
 * calendar, social feeds and app state. Czech is the product language, so
 * user-facing string literals stay in Czech by design.
 */

// ---- Market assets ----
export type AssetCategory =
  | "Akciové ETF"
  | "Dluhopisové ETF"
  | "Konzervativní akcie"
  | "Růstové akcie"
  | "Komodity"
  | "Krypto";

export type AssetKind = "etf" | "stock" | "etc" | "crypto";

/** Lightweight market row shown in lists, dashboard and search. */
export interface Asset {
  sym: string;
  name: string;
  cat: AssetCategory;
  score: number; // Folio AI score 0–100
  risk: string;
  price: number;
  chg: number; // % change today
  pe: number | null;
  ps: number | null;
  divY: number | null;
  roe: number | null;
  mcap: string;
  low52: number;
  high52: number;
  ter: string | null;
  why: string;
}

/** Deep fundamentals keyed by symbol, merged into the asset on detail views. */
export interface Fundamentals {
  kind: AssetKind;
  sector?: string;
  industry?: string;
  region?: string;
  isin?: string;
  exchange?: string;
  currency?: string;
  desc: string;
  // returns
  ytd?: number;
  r1y?: number;
  r3y?: number;
  r5y?: number | null;
  // risk
  beta?: number;
  vol1y?: string;
  maxdd?: string;
  // ETF specifics
  aum?: string;
  holdings?: string;
  replication?: string;
  dist?: string;
  inception?: string;
  ongoing?: string;
  top?: [string, string][];
  duration?: string;
  ytm?: string;
  credit?: string;
  backing?: string;
  // stock specifics
  founded?: number;
  ceo?: string;
  employees?: string;
  eps?: number;
  fwdPe?: number;
  pb?: number | null;
  evEbitda?: number;
  debtEq?: number | null;
  fcfY?: number;
  grossM?: number;
  netM?: number;
  opM?: number;
  revG?: number;
  payout?: number;
  divStreak?: string;
  // crypto specifics
  supply?: string;
  circ?: string;
  consensus?: string;
  dominance?: string;
  staking?: string;
}

export type AssetDetail = Asset & Partial<Fundamentals>;

/** A single curated news headline tuple: [tag, title, body, time]. */
export type AssetNewsItem = [string, string, string, string];

// ---- Portfolio ----
export interface Holding {
  sym: string;
  units: number;
  avg: number; // average buy price
  cat: AssetCategory;
}

export interface PortfolioRow {
  sym: string;
  name: string;
  cat: AssetCategory;
  units: number;
  avg: number;
  price: number;
  mv: number; // market value
  cost: number;
  pl: number; // profit/loss
  plPct: number;
  chg: number;
}

export type Allocation = [string, number][];

export interface PortfolioComputed {
  rows: PortfolioRow[];
  val: number;
  inv: number;
  pl: number;
  plPct: number;
  allocCat: Allocation;
  allocSector: Allocation;
  allocCurrency: Allocation;
  allocRegion: Allocation;
}

export interface RankingEntry {
  name: string;
  you: boolean;
  ytd: number;
  risk: string;
  followers: string;
  badge: string;
  color: string;
}

export interface Strategy {
  name: string;
  risk: string;
  ret: string;
  vol: string;
  alloc: Allocation;
}

// ---- Calendar ----
export type CalendarType = "earnings" | "exdiv" | "divpay" | "rate";

export interface CalendarEvent {
  date: string;
  d: string;
  type: CalendarType;
  title: string;
  sub: string;
  time: string;
  impact: number;
  sym?: string;
  bank?: string;
  prev?: string;
  fc?: string;
  eps?: string;
  rev?: string;
  amt?: string;
}

// ---- Social ----
export interface DiscussPost {
  user: string;
  handle: string;
  av: string;
  ver: boolean;
  time: string;
  sym: string | null;
  text: string;
  likes: number;
  comments: number;
  reposts: number;
  mine?: boolean;
  id?: string;
}

export interface FeedItem {
  sym: string | null;
  tag: string;
  img: string;
  title: string;
  body: string;
  likes: string;
  time: string;
}

// ---- Academy / Quiz ----
export interface Topic {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export interface Question {
  id: string;
  topic: string;
  diff: 1 | 2 | 3;
  q: string;
  opts: string[];
  correct: number;
  exp: string;
}

export interface QuizSession {
  topic: string | null;
  questions: Question[];
  idx: number;
  answers: number[];
}

export interface AcademyState {
  xp: number;
  answered: string[];
  wrong: string[];
  session: QuizSession | null;
  questIdx: number;
}

// ---- Portfolio builder ----
export interface BuilderQuestion {
  id: string;
  q: string;
  emoji: string;
  opts: [string, number][]; // [label, weight]
}

export interface RiskProfile {
  min: number;
  risk: string;
  ret: string;
  vol: string;
  alloc: Allocation;
}

export interface BuilderResult {
  score: number;
  name: string;
  risk: string;
  ret: string;
  vol: string;
  alloc: Allocation;
  reasons: string[];
  picks: { cat: string; pct: number; sym: string; name: string; score: number }[];
  originAlloc: Allocation;
  currencyAlloc: Allocation;
  sectorAlloc: Allocation;
  specificAlloc: Allocation;
}

export interface BuilderState {
  step: number;
  answers: Record<string, number>;
  done: boolean;
}

// ---- Calculator ----
export interface CalcInputs {
  initial: number;
  monthly: number;
  rate: number;
  years: number;
}

export interface CompoundResult {
  principal: number[];
  total: number[];
  final: number;
  contributed: number;
  interest: number;
}

export interface CompareInstrument {
  label: string;
  rate: number | null;
  color: string;
  emoji: string;
  desc: string;
}

// ---- Tax ----
export interface TaxInputs {
  buy: number;
  sell: number;
  months: number;
  dip: number;
}

export interface TaxResult {
  gain: number;
  exempt: boolean;
  timeTest: boolean;
  valueTest: boolean;
  rate: number;
  taxable: number;
  tax: number;
  dipDeduct: number;
  dipSaving: number;
  net: number;
}

// ---- AI ----
export interface ChatAttachment {
  name: string;
  kind: "img" | "file";
}

export type AiWidget = "portfolio" | "calc" | "score";

export interface ChatMessage {
  r: "user" | "ai";
  t: string;
  atts?: ChatAttachment[] | null;
  widget?: AiWidget;
}

// ---- App-level ----
export type Plan = "free" | "premium";
export type Theme = "light" | "dark";

export type ViewId =
  | "dashboard"
  | "data"
  | "ai"
  | "portfolio"
  | "report"
  | "calc"
  | "academy"
  | "quizPlay"
  | "quizResult"
  | "weakSpots"
  | "news"
  | "newsArticle"
  | "builder"
  | "calendar"
  | "discuss"
  | "profile"
  | "tax";

export interface TutorialStep {
  emoji: string;
  title: string;
  body: string;
  color: string;
}
