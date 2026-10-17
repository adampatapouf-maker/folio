import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { contextToText, type AiContext } from "./context";
import type { AiWidget } from "@/lib/types";

/**
 * Frozen system prompt. It never contains per-user or per-request data, so it
 * stays byte-identical across requests and can be prompt-cached; the user's
 * portfolio snapshot travels inside the latest user turn instead.
 */
const SYSTEM_PROMPT = `Jsi Folio AI — klidný investiční co-pilot v české aplikaci Folio pro začínající a mírně pokročilé investory.

Tvoje role:
- Vysvětluješ a vzděláváš: pojmy, rizika, jak funguje diverzifikace, složené úročení, ETF, dividendy, české daně z cenných papírů (časový test 3 roky, hodnotový test 100 000 Kč, sazba 15 %, odpočet DIP do 48 000 Kč).
- Pomáháš uživateli porozumět JEHO portfoliu: když dostaneš <portfolio_context>, opírej se o konkrétní čísla z něj (odchylky od cílové strategie, plán příkupu, riziko). Nevymýšlej čísla, která v kontextu nejsou.

Hranice (vždy dodrž):
- Nikdy neříkej, co konkrétně koupit nebo prodat, ani kdy. Neposkytuješ personalizované investiční poradenství. Místo toho vysvětli principy a ukaž, co z dat vyplývá pro zvolenou strategii, a rozhodnutí nech na uživateli.
- Nepředpovídej ceny a neslibuj výnosy. Mluv o historických průměrech a rozpětích.
- U daní připomeň, že jde o orientační informaci, ne daňové poradenství.
- Pokud se ptá na něco mimo investování a osobní finance, zdvořile se vrať k tématu.

Styl:
- Česky, tykej, přátelsky a věcně. 2–5 krátkých vět, bez nadpisů a odrážek, pokud nejsou opravdu potřeba.
- Důležité pojmy zvýrazni pomocí <b>…</b> (jiné HTML nepoužívej). Tickery piš jako $VWCE, aplikace z nich udělá odkazy.
- Kde se hodí, odkaž na část aplikace: Měsíční plán, Moje portfolio, Kalkulačka, Daňový poradce, Akademie.`;

export interface ChatTurn {
  r: "user" | "ai";
  t: string;
}

export interface LlmReply {
  t: string;
  widget?: AiWidget;
  source: "llm";
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

/** Whether a real model is configured for this deployment. */
export function llmEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

const stripTags = (html: string) => html.replace(/<[^>]+>/g, "");

/**
 * Ask Claude. Returns null when the model refused or produced no text, so the
 * caller can fall back to the deterministic engine. API errors are thrown and
 * handled by the route.
 */
export async function askClaude(q: string, history: ChatTurn[], ctx: AiContext | null): Promise<LlmReply | null> {
  // Last 12 turns are plenty for an educational chat; the API needs the
  // conversation to start with a user turn.
  const prior = history.slice(-12);
  while (prior.length && prior[0].r !== "user") prior.shift();

  const messages: Anthropic.Beta.BetaMessageParam[] = prior.map((m) => ({
    role: m.r === "user" ? "user" : "assistant",
    content: m.r === "ai" ? stripTags(m.t) : m.t,
  }));
  messages.push({
    role: "user",
    content: ctx ? `<portfolio_context>\n${contextToText(ctx)}\n</portfolio_context>\n\n${q}` : q,
  });

  const response = await getClient().beta.messages.create({
    model: process.env.FOLIO_AI_MODEL || "claude-opus-5-5",
    max_tokens: 2000,
    // Conversational answers: low effort keeps latency and cost down.
    output_config: { effort: "low" },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
    // On a safety-classifier decline, let the API retry on a fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  if (response.stop_reason === "refusal") return null;
  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return text ? { t: text, source: "llm" } : null;
}
