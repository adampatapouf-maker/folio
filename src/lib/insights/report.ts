import { pfCompute } from "@/lib/calc/portfolio";
import { tfSeries } from "@/lib/calc/series";
import { getAsset, sig } from "@/lib/assets";
import { CALENDAR } from "@/data/calendar";
import { fmt } from "@/lib/format";
import {
  allocationDrift,
  contributionPlan,
  riskMetrics,
  DRIFT_BAND,
  type ContributionPlan,
  type DriftRow,
  type RiskMetrics,
} from "./rebalance";
import type { CalendarEvent, Holding, PortfolioComputed, Strategy } from "@/lib/types";

export type ReportKind = "weekly" | "monthly";
export type ActionKind = "buy" | "pause" | "hold" | "watch";

export interface ReportAction {
  id: string;
  kind: ActionKind;
  /** Full title for compact lists, e.g. "Doplnit: Dluhopisové ETF". */
  title: string;
  /** What the action is about, shown next to the kind tag, e.g. "Dluhopisové ETF". */
  subject: string;
  text: string;
  why: string[];
  sym?: string;
}

export interface MarketTick {
  label: string;
  change: number;
}

export interface Report {
  kind: ReportKind;
  period: string;
  /** Portfolio return over the period, in %. */
  change: number;
  changeValue: number;
  headline: string;
  market: MarketTick[];
  actions: ReportAction[];
  drift: DriftRow[];
  plan: ContributionPlan;
  risk: RiskMetrics;
  movers: { best: { sym: string; change: number }; worst: { sym: string; change: number } };
  watch: CalendarEvent[];
  commentary: string;
  portfolio: PortfolioComputed;
}

const MONTHS = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];

export function periodLabel(kind: ReportKind, now: Date): string {
  if (kind === "monthly") return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const sameMonth = mon.getMonth() === sun.getMonth();
  return sameMonth
    ? `${mon.getDate()}.–${sun.getDate()}. ${sun.getMonth() + 1}. ${sun.getFullYear()}`
    : `${mon.getDate()}. ${mon.getMonth() + 1}. – ${sun.getDate()}. ${sun.getMonth() + 1}. ${sun.getFullYear()}`;
}

const pp = (n: number) => `${Math.abs(n).toFixed(1).replace(".", ",")} p.b.`;
const pc = (n: number, dp = 0) => `${n.toFixed(dp).replace(".", ",")} %`;
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1).replace(".", ",")} %`;

const MARKET: [string, string][] = [
  ["CSPX", "S&P 500"],
  ["IWDA", "MSCI World"],
  ["SGLN", "Zlato"],
  ["BTC", "Bitcoin"],
];

/**
 * Build the weekly report or monthly plan from the user's real holdings and
 * target strategy. Every number and every "why" bullet is derived from data —
 * no hard-coded narrative that could contradict the portfolio.
 */
export function buildReport(
  holdings: Holding[],
  strategy: Strategy,
  monthly: number,
  kind: ReportKind,
  now: Date = new Date()
): Report {
  const tf = kind === "weekly" ? "1T" : "1M";
  const p = pfCompute(holdings);
  const drift = allocationDrift(p, strategy);
  const plan = contributionPlan(p, strategy, monthly);
  const risk = riskMetrics(p);

  const perf = p.rows.map((r) => ({ sym: r.sym, w: p.val > 0 ? r.mv / p.val : 0, change: tfSeries(r.sym, tf).change }));
  const change = perf.reduce((s, r) => s + r.w * r.change, 0);
  const changeValue = p.val - p.val / (1 + change / 100);
  const sorted = [...perf].sort((a, b) => b.change - a.change);
  const movers = {
    best: sorted[0] ?? { sym: "—", change: 0 },
    worst: sorted[sorted.length - 1] ?? { sym: "—", change: 0 },
  };

  const market = MARKET.map(([sym, label]) => ({ label, change: tfSeries(sym, tf).change }));

  const heldSyms = new Set(p.rows.map((r) => r.sym));
  const watch = [
    ...CALENDAR.filter((e) => e.sym && heldSyms.has(e.sym)),
    ...CALENDAR.filter((e) => e.type === "rate"),
  ].slice(0, 4);

  // ---- actions ----
  const actions: ReportAction[] = [];
  const under = drift.filter((d) => d.status === "under");
  const over = drift.filter((d) => d.status === "over");
  const ok = drift.filter((d) => d.status === "ok" && d.target > 0);

  under.slice(0, 2).forEach((d) => {
    const line = plan.lines.find((l) => l.cat === d.cat);
    const a = line ? getAsset(line.sym) : null;
    actions.push({
      id: `buy-${d.cat}`,
      kind: "buy",
      title: `Doplnit: ${d.cat}`,
      subject: d.cat,
      text: line
        ? `${pp(d.drift)} pod cílem. Z měsíčního vkladu sem míří ${fmt(line.amount)}${line.sym ? ` — např. ${line.sym}` : ""}.`
        : `${pp(d.drift)} pod cílem. Další vklady by měly směřovat sem.`,
      why: [
        `Aktuálně ${pc(d.actual, 1)} vs. cíl ${pc(d.target)} (tolerance ±${DRIFT_BAND} p.b.)`,
        a ? `${a.sym}: Folio skóre ${a.score}/100 — ${sig(a.score)[0].toLowerCase()}` : "Nástroj vybraný podle Folio skóre",
        "Doplnění příkupem nevyžaduje prodej, takže nevzniká daň z prodeje",
      ],
      sym: line?.sym || undefined,
    });
  });

  over.slice(0, 2).forEach((d) => {
    const extra =
      d.cat === "Krypto"
        ? `Krypto má v portfoliu nejvyšší kolísání — při poklesu o 50 % by portfolio ztratilo cca ${pc((d.actual * 50) / 100, 1)}.`
        : "Přerostlá třída zvyšuje koncentraci rizika.";
    actions.push({
      id: `pause-${d.cat}`,
      kind: "pause",
      title: `Nenavyšovat: ${d.cat}`,
      subject: d.cat,
      text: `${pp(d.drift)} nad cílem. Nové peníze sem nesměřují — prodávat není nutné, váhu srovnají příkupy jinam.`,
      why: [
        `Aktuálně ${pc(d.actual, 1)} vs. cíl ${pc(d.target)}`,
        extra,
        `Při ${fmt(plan.monthly)}/měs. se portfolio vrátí do pásma zhruba za ${plan.monthsToBalance} ${plan.monthsToBalance === 1 ? "měsíc" : plan.monthsToBalance < 5 ? "měsíce" : "měsíců"}`,
      ],
    });
  });

  if (ok.length) {
    actions.push({
      id: "hold",
      kind: "hold",
      title: "Držet dle strategie",
      subject: ok.length === 1 ? ok[0].cat : `${ok.length} třídy v cíli`,
      text: `${ok.map((d) => d.cat).join(", ")} ${ok.length === 1 ? "je" : "jsou"} v toleranci cíle. Žádný zásah není potřeba.`,
      why: ok.map((d) => `${d.cat}: ${pc(d.actual, 1)} vs. cíl ${pc(d.target)}`),
    });
  }

  const event = watch.find((e) => e.sym && heldSyms.has(e.sym));
  if (event?.sym) {
    const mv = perf.find((r) => r.sym === event.sym);
    actions.push({
      id: `watch-${event.sym}`,
      kind: "watch",
      title: `Sledovat: ${event.sym}`,
      subject: getAsset(event.sym)?.name ?? event.sym,
      text: `${event.title} (${event.date}). Na strategii to nic nemění — jen počítej s vyšším kolísáním.`,
      why: [
        `Váha v portfoliu: ${pc((mv?.w ?? 0) * 100, 1)}`,
        `Za ${kind === "weekly" ? "týden" : "měsíc"}: ${signed(mv?.change ?? 0)}`,
        "Reagovat na jednotlivé zprávy se dlouhodobě nevyplácí",
      ],
      sym: event.sym,
    });
  }

  // ---- narrative ----
  const period = kind === "weekly" ? "týden" : "měsíc";
  const headline = `Portfolio za ${period} ${signed(change)} (${change >= 0 ? "+" : "−"}${fmt(Math.abs(changeValue))})`;
  const worstDrift = drift[0];
  const parts = [
    `Nejvíc táhl ${movers.best.sym} (${signed(movers.best.change)}), nejslabší byl ${movers.worst.sym} (${signed(movers.worst.change)}).`,
    worstDrift && worstDrift.status !== "ok"
      ? `Největší odchylka od strategie ${strategy.name}: ${worstDrift.cat} ${pc(worstDrift.actual, 0)} místo ${pc(worstDrift.target, 0)}.`
      : `Všechny třídy jsou v toleranci strategie ${strategy.name}.`,
    plan.lines[0]
      ? `Měsíční vklad ${fmt(plan.monthly)} proto směřuje hlavně do: ${plan.lines.slice(0, 2).map((l) => l.cat).join(" a ")}.`
      : "",
  ];

  return {
    kind,
    period: periodLabel(kind, now),
    change,
    changeValue,
    headline,
    market,
    actions: actions.slice(0, 4),
    drift,
    plan,
    risk,
    movers,
    watch,
    commentary: parts.filter(Boolean).join(" "),
    portfolio: p,
  };
}
