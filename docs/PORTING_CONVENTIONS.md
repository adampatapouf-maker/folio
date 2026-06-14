# Folio screen porting conventions (for contributors & agents)

We are porting a single-file vanilla-JS prototype into a Next.js + TypeScript +
Tailwind app. Each "view function" in the prototype becomes a React screen
component under `src/screens/`. Keep the **content, layout, copy (Czech), and
visual identity identical** — just make it idiomatic React.

## Source of truth

The original prototype is the single HTML file provided to the project. Each
screen task names the exact line range of the `function xxxView()` to port.

## Component contract

- Each screen is a **named export** matching what `ScreenRouter.tsx` imports,
  e.g. `export function DashboardScreen() { … }`.
- Files start with `"use client";`.
- The screen returns the **inner content** only (it is rendered inside
  `<div className="content">`). Wrap in `<div className="fade" style={{maxWidth: …, margin:"0 auto"}}>` like the original.

## State & actions — use the Zustand store

```ts
import { useFolioStore } from "@/store/useFolioStore";
const view = useFolioStore((s) => s.view);
const go = useFolioStore((s) => s.go);
```

Select narrowly (one field/action per `useFolioStore` call) to avoid re-renders.
Available state & actions are defined in `src/store/useFolioStore.ts` — read it.
Key actions: `go(view)`, `openAsset(sym)`, `openNews(idx)`, `setPlan`,
`setTf`, `setChart`, `toggleMA`, `setCalc`, `toggleCompare`, `askAI`, `startQuiz`,
`answerQ`, `startBuilder`, `builderAnswer`, `pfAdjust/pfAdd/pfRemove/togglePfEdit`,
`openAddAsset`, `setTax`, `setPfTab`, `setCalFilter`, `setDiscFilter`,
`setDataFilter/setDataSearch`, `setReportTab/toggleReportWhy`, `postDiscuss`,
`toggleLike`, `toggleNotif`, `resetState`, `showToast`.

## Design tokens — use CSS variables, NOT the JS color object

The prototype's `C.lime` etc. → use `"var(--lime)"`. Full token list is in
`globals.css`. Premium gating uses `plan === "premium"`. Examples:
`var(--ink)`, `var(--ink2)`, `var(--ink3)`, `var(--surface)`, `var(--surface2)`,
`var(--line)`, `var(--panel)`, `var(--panelink)`, `var(--inkfix)`, `var(--lime)`,
`var(--limesoft)`, `var(--limedeep)`, `var(--purple)`, `var(--coral)`,
`var(--amber)`, `var(--gold)`, `var(--blue)`, `var(--teal)`, `var(--pink)`,
plus `*soft` variants. Gradients: `var(--grad-lime)`, `var(--grad-hero)`.

Keep the inline `style={{…}}` approach from the prototype (convert CSS strings to
React style objects). Reuse the global classes: `card`, `lift`, `pressable`,
`pill`, `chip`, `tag`, `stat`, `sub`, `h1`, `h2`, `fd`, `disc`, `fade`, `stagger`,
`grid two|three|four|dash`, `hscroll`, `mrow`, `tfbtn`, `glow`.

## Helpers & components to reuse

- Icons: `import { Icon } from "@/components/ui/Icon"` →
  `<Icon name="chevR" size={16} color="var(--ink3)" stroke={1.9} />`.
  (Replaces `ic('chevR',16,...)`.) Names come from the prototype's ICON map.
- Logos: `import { LogoTile } from "@/components/ui/LogoTile"` →
  `<LogoTile sym="VWCE" size={40} radius={12} />`. (Replaces `logoTile(...)`.)
- Rich/AI HTML text with `$TICKER` links:
  `import { RichText } from "@/components/ui/RichText"` →
  `<RichText html={someHtml} />`.
- Formatting: `import { fmt, kc, price, pct } from "@/lib/format"`.
  `fmt(n)` → `€1 234`; `kc(n)` → `1 234 Kč`; `price(n)` → big rounded / else 2dp.
- Asset data: `import { ASSETS, getAsset, topAsset, sig, catColor, catEmoji, assetNews } from "@/lib/assets"`.
  `sig(score)` returns `[label, "var(--…)"]`.
- Charts: `import { Donut, DonutPal, AreaChart, GrowthChart, CompareChart, CandleChart, Sparkline, palColor } from "@/components/charts/Charts"`.
  These are React components — render them where the prototype drew on a `<canvas id=…>`.
  Example: `<div style={{height:46}}><Sparkline data={vals} up={true} /></div>`.
  Donut/DonutPal take `data` = `[string, number][]`.
  GrowthChart takes `principal`, `total`, `mode`.
  CompareChart takes `series` (`{series:number[],color,primary?,dashed?,label?}[]`) and `mode`.
- Calc: `import { computeCompound, projectSeries, projectDIP } from "@/lib/calc/compound"`;
  `import { taxComputeCZ } from "@/lib/calc/tax"`;
  `import { computeBuilder } from "@/lib/calc/builder"`;
  `import { pfCompute, defaultHoldings, pfHistory } from "@/lib/calc/portfolio"`;
  `import { tfSeries, priceSeries, movingAvg } from "@/lib/calc/series"`.
- Data modules under `src/data/`: `assets`, `fundamentals`, `assetNews`,
  `calendar` (CALENDAR, BANK_LOGO, CAL_META, CAL_IMG), `social` (DISCUSS, FEED),
  `academy` (TOPICS, QBANK), `builder` (QZ, PROFILES), `portfolio`
  (STRAT, MY_PORTFOLIO, PF_RANKING, PF_SHAPE), `calc` (CALC_COMPARE),
  `tutorial` (TUTORIAL), `misc` (SUGG, TFS).

## Patterns

- `onclick="go('x')"` → `onClick={() => go("x")}`.
- `onclick="openAsset('NVDA')"` → `onClick={() => openAsset("NVDA")}`.
- Lists built via `.map(...).join('')` → `.map((x) => <Component key=… />)`.
  Always provide stable `key`s.
- `setTimeout(()=>donut('id',data),0)` canvas calls → replace with the chart
  React component in-place; delete the setTimeout entirely.
- Portfolio holdings: read `const holdings = useFolioStore((s)=>s.holdings) ?? defaultHoldings()`,
  then `const p = pfCompute(holdings)`.
- Inputs that set state: controlled inputs with `value` + `onChange`.
- `dangerouslySetInnerHTML` only via `<RichText>` for trusted educational/AI copy.
- Czech strings: copy verbatim, including diacritics and the “ ” quotes.
- Unsplash images: `https://images.unsplash.com/${img}?w=460&q=70&auto=format&fit=crop`.

## Quality bar

- Must compile under `tsc` (strict). No `any` unless unavoidable (prefer precise types).
- No dead code, no leftover `setTimeout` canvas hacks, no `window.*` globals.
- Mobile-first; the screen renders inside a 430px phone frame.
