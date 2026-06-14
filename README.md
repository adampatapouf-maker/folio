# Folio — AI investiční co-pilot

Folio is a **mobile-first fintech PWA**: a calm investing companion that sends
weekly & monthly reports, explains the markets through an AI co-pilot, and
builds a model portfolio tailored to your goals. The product language is Czech.

This repository is a production-minded **Next.js + TypeScript** application,
refactored from a single-file HTML prototype into a real app architecture:
reusable React components, typed data models, a service/calculation layer,
client state management, API routes, mock seed data and a prepared database
schema.

> ⚠️ Educational/informational only. Folio does **not** execute trades or give
> personalized investment advice. Demo data; capital is at risk.

---

## Features

| Area | What it does |
| --- | --- |
| **Dashboard** | Reports hero, AI + builder entry points, portfolio snapshot, live calculator & tax widgets, news. |
| **Portfolio** | Live value/P&L, 12-month history, holdings with edit mode, allocation breakdowns, community ranking. |
| **Asset database** | Searchable/filterable universe of 25 ETFs, stocks, ETCs & crypto with Folio AI scores. |
| **Asset detail** | Timeframe charts (line/candle), moving average, full fundamentals per asset kind, per-asset news. |
| **Portfolio builder** | 6-question risk questionnaire → model portfolio with class/sector/currency/origin breakdowns (premium). |
| **Calendar** | Economic calendar: earnings, ex-dividend, dividend payouts, rate decisions. |
| **News** | Instagram-style "For You" feed + article view. |
| **Discussion** | Twitter-style community feed with `$TICKER` linking and posting. |
| **Folio AI** | Co-pilot chat that explains & educates (never tells you what to buy); 5 free messages, unlimited on premium. |
| **Reports** | Weekly sample (free) + monthly buy-plan / rebalancing (premium). |
| **Compound calculator** | Compound interest with comparisons to savings, bonds, DIP & inflation (premium). |
| **Academy / Quiz / XP** | Topic quizzes, XP-gated difficulty, weak-spot practice. |
| **Tax assistant** | Czech capital-gains estimate (time/value tests, 15 %, DIP deduction). |
| **Profile** | Plan, theme (light/dark), notifications, reset. |
| **PWA** | Installable, theme-color, service worker, phone-locked layout. |

Free vs. premium gating is enforced in the store and screens: the report's
monthly/deep sections, the portfolio builder, the calculator comparisons, and
the AI message limit.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** with CSS-variable design tokens (light/dark themes)
- **Zustand** for state, persisted to `localStorage` (key `folio_state_v1`)
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
│  └─ ui/                   # Icon, LogoTile, RichText, Paywall
├─ screens/                 # one component per screen (Dashboard, Data, AssetDetail, Ai, Portfolio, …)
├─ store/useFolioStore.ts   # Zustand store: state + all actions + persistence
├─ lib/
│  ├─ types.ts              # domain types / data models
│  ├─ format.ts             # fmt / kc / price / pct (cs-CZ)
│  ├─ assets.ts             # getAsset, topAsset, sig, catColor, assetNews
│  ├─ linkify.ts            # $TICKER → chips
│  ├─ ai/engine.ts          # deterministic co-pilot reply engine
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

### Wiring a real LLM

`/api/ai` currently answers with the deterministic engine in
`src/lib/ai/engine.ts` so the app works with zero configuration. To use a real
model, set `ANTHROPIC_API_KEY` and replace the placeholder in
`src/app/api/ai/route.ts` with a model call. Keep Folio's guardrail in the
system prompt: **explain & educate, never give personalized buy/sell advice.**

---

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
- **AI** — swap the template engine for an LLM as above.

---

## License

Demo / educational project.
