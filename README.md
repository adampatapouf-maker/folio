# Folio — AI investiční co-pilot

Folio is a **mobile-first fintech PWA**: a calm investing companion that sends
weekly & monthly reports, explains the markets through an AI co-pilot, and
builds a model portfolio tailored to your goals. The product language is Czech.

This repository is a production-minded **Next.js + TypeScript** application,
refactored from a single-file HTML prototype into a real app architecture:
reusable React components, typed data models, a service/calculation layer,
client state management, API routes, mock seed data and a prepared database
schema.

## Concept: one strategy drives everything

The user picks a **target strategy** (6-question builder → risk profile and
allocation; a sensible default until they do). Every screen then compares the
**real portfolio** against that target:

1. **Drift** — each asset class's actual weight vs. target, with a ±5 p.b.
   tolerance band (`src/lib/insights/rebalance.ts`).
2. **Monthly buy plan** — the monthly contribution is split across
   underweight classes in proportion to their gap. It is **buy-only**: nothing
   is sold, so the investor stays calm and, in CZ, avoids capital-gains tax on
   positions held < 3 years. The plan prefers instruments the user already holds.
3. **Generated report** — the weekly report and monthly plan are built from the
   portfolio, the strategy and market data (`src/lib/insights/report.ts`).
   Every action and every "Proč?" bullet is derived from numbers, so the report
   can never contradict the portfolio.
4. **Folio AI** gets a compact snapshot of all of the above with each question,
   so "how is my portfolio doing?" is answered from real data.

> ⚠️ Educational/informational only. Folio does **not** execute trades or give
> personalized investment advice. Demo data; capital is at risk.

---

## Features

| Area | What it does |
| --- | --- |
| **Dashboard** | Portfolio value (total + this week), "this week" actions from the report, monthly buy plan, AI, future value, news, tools. |
| **Portfolio** | Value/P&L, 12-month history, actual-vs-target bars, real risk profile, holdings with edit mode, breakdowns, ranking. |
| **Asset database** | Searchable/filterable universe of 25 ETFs, stocks, ETCs & crypto with Folio AI scores. |
| **Asset detail** | Timeframe charts (line/candle), "in your portfolio" block with class drift, full fundamentals, per-asset news. |
| **Portfolio builder** | 6-question risk questionnaire → strategy + model portfolio with breakdowns; one tap to make it your strategy (free). |
| **Calendar** | Economic calendar: earnings, ex-dividend, dividend payouts, rate decisions. |
| **News** | Instagram-style "For You" feed + article view. |
| **Discussion** | Twitter-style community feed with `$TICKER` linking and posting. |
| **Folio AI** | Co-pilot chat grounded in your portfolio; explains & educates, never tells you what to buy. Claude when configured, local engine otherwise. 5 free questions, unlimited on premium. |
| **Reports** | Weekly report generated from your portfolio (free) + monthly buy plan with amounts and instruments, risk profile (premium). |
| **Compound calculator** | Compound interest with comparisons to savings, bonds, DIP & inflation (premium). |
| **Academy / Quiz / XP** | Topic quizzes with instant feedback, XP-gated difficulty, real daily streak, weak-spot practice. |
| **Tax assistant** | Czech capital-gains estimate (time/value tests, 15 %, DIP deduction). |
| **Profile** | Plan, theme (light/dark), notifications, reset. |
| **PWA** | Installable, theme-color, service worker, phone-locked layout. |

**Free vs. premium.** Free users get the diagnosis: the strategy builder, the
weekly report with drift and actions, and 5 AI questions. Premium adds what to
do about it each month: the concrete buy plan (amounts + instruments), the
risk profile, unlimited AI and calculator comparisons.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** with CSS-variable design tokens (light/dark themes)
- **Zustand** for state, persisted to `localStorage` (key `folio_state_v1`, versioned)
- **Anthropic SDK** for Folio AI (optional; local fallback engine)
- **Vitest** unit tests for the calculation and insight engines
- **Prisma** schema targeting **PostgreSQL** (prepared; app runs without a DB)
- Canvas-based chart components (donut, area, growth, compare, candlestick, sparkline)
- API routes for assets, portfolio, calendar, news and the AI engine

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx            # fonts (Fraunces + DM Sans), metadata, PWA manifest
│  ├─ page.tsx              # mounts <AppShell/>
│  ├─ globals.css           # design tokens + ported component styles
│  └─ api/                  # ai, assets, assets/[sym], portfolio, calendar, news
├─ components/
│  ├─ layout/               # AppShell, TopBar, TabBar, MoreSheet, AddAssetSheet, Toast, Tutorial, ScreenRouter
│  ├─ charts/Charts.tsx     # Donut, DonutPal, AreaChart, GrowthChart, CompareChart, CandleChart, Sparkline
│  └─ ui/                   # Icon, LogoTile/BankTile (monograms), RichText, AllocationBars
├─ screens/                 # one component per screen (Dashboard, Data, AssetDetail, Ai, Portfolio, …)
├─ store/useFolioStore.ts   # Zustand store: state + all actions + persistence
├─ hooks/useInsights.ts     # memoised portfolio / drift / plan / report for screens
├─ lib/
│  ├─ types.ts              # domain types / data models
│  ├─ format.ts             # fmt / kc / price / pct (cs-CZ)
│  ├─ assets.ts             # getAsset, topAsset, sig, catColor, assetNews
│  ├─ linkify.ts            # $TICKER → chips
│  ├─ insights/             # rebalance (drift, buy plan, risk) + report generator
│  ├─ ai/engine.ts          # deterministic co-pilot reply engine (offline fallback)
│  ├─ ai/context.ts         # portfolio snapshot sent with each AI question
│  ├─ ai/llm.ts             # Claude call (server-only), guardrailed system prompt
│  └─ calc/                 # compound, tax, builder, portfolio, series
├─ data/                    # typed mock seed data (assets, fundamentals, calendar, academy, …)
└─ icon-data.ts             # lucide icon path set
prisma/
├─ schema.prisma            # User/Subscription, Asset/Fundamentals/PriceBar, Portfolio/Holding, Quiz, Chat, …
└─ seed.ts                  # loads the mock data into the DB
```

The original prototype's literal data is extracted faithfully via
`scripts/extract.mjs` into the typed modules under `src/data/`. Porting
conventions live in `docs/PORTING_CONVENTIONS.md`.

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

The app is fully functional with **no external services**: the AI route falls
back to a deterministic local engine, and all screens read in-memory mock data
through the service layer. A database is only needed if you want to persist
server-side.

### 3. Run

```bash
npm run dev
# http://localhost:3000
```

On screens ≥ 560px wide the app renders inside a centered phone frame; below
that it fills the viewport like a native mobile app.

### 4. (Optional) Database

Point `DATABASE_URL` at a PostgreSQL instance, then:

```bash
npm run db:generate   # prisma generate
npm run db:push       # create tables
npm run db:seed       # load assets, fundamentals, calendar, a demo user + portfolio
npm run db:studio     # browse data
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests (calc + insight engines, AI fallback) |
| `npm run db:generate` / `db:push` / `db:seed` / `db:studio` | Prisma workflows |

---

## API routes

| Route | Method | Returns |
| --- | --- | --- |
| `/api/assets` | GET | The asset universe |
| `/api/assets/[sym]` | GET | Full detail: fundamentals + news + a default-timeframe series |
| `/api/portfolio` | GET / POST | Computed portfolio (seed holdings, or POST custom holdings) |
| `/api/calendar` | GET | Economic calendar events |
| `/api/news` | GET | "For You" feed |
| `/api/ai` | POST `{ q, atts? }` | Co-pilot reply (local engine; LLM-ready) |

### Folio AI and Claude

`/api/ai` takes `{ q, history, context }`, where `context` is the portfolio
snapshot from `src/lib/ai/context.ts`. With `ANTHROPIC_API_KEY` set it calls
Claude through `@anthropic-ai/sdk` (`src/lib/ai/llm.ts`):

- model `claude-opus-5-5` by default (override with `FOLIO_AI_MODEL`), low
  effort for snappy chat answers;
- a frozen, prompt-cached system prompt with Folio's guardrails — explain and
  educate, **never** say what to buy or sell, no price predictions, tax info is
  orientational;
- the portfolio snapshot travels in the latest user turn, not the system
  prompt, so the cache prefix stays stable;
- server-side refusal fallback (`fallbacks: "default"`), and any refusal or API
  error falls back to the local engine, so the chat never dead-ends.

Widget answers (model portfolio, calculator, score) and attachments are served
by the local engine. The 5-question free limit is enforced client-side for the
demo; enforce it server-side once there are user accounts.

## Backend requirements (what a production deployment would add)

The prototype was a pure client demo. This refactor prepares for, but does not
require, the following backend concerns:

- **Auth & accounts** — `User` model is in place; wire an auth provider and
  replace the demo plan toggle with a real session.
- **Subscriptions/billing** — `Subscription` model is Stripe-shaped; the
  `setPlan` demo switch stands in for checkout/webhooks.
- **Market data** — prices/fundamentals are static mock data; replace the
  service layer (`src/lib/assets.ts`, `src/lib/calc/series.ts`) with a real
  quotes/feed provider and persist `PriceBar`s.
- **Persistence** — chat history, quiz progress, holdings, and the builder
  result currently live in `localStorage`; models exist to move them server-side.
- **AI quota** — move the free-question limit server-side with auth.

---

## License

Demo / educational project.
