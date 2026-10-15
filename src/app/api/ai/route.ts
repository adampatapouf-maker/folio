import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { aiReply } from "@/lib/ai/engine";
import { askClaude, llmEnabled, type ChatTurn } from "@/lib/ai/llm";
import type { AiContext } from "@/lib/ai/context";
import type { ChatAttachment } from "@/lib/types";

export const runtime = "nodejs";

interface AiRequestBody {
  q: string;
  atts?: ChatAttachment[];
  history?: ChatTurn[];
  context?: AiContext | null;
}

const MAX_Q = 2000;

/**
 * Folio AI endpoint.
 *
 * With ANTHROPIC_API_KEY set, questions go to Claude with the user's portfolio
 * snapshot and Folio's guardrails (explain, never tell what to buy/sell).
 * Without a key — or when the model refuses or the API fails — the
 * deterministic local engine answers, so the chat always works.
 */
export async function POST(req: NextRequest) {
  let body: AiRequestBody;
  try {
    body = (await req.json()) as AiRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const q = typeof body?.q === "string" ? body.q.trim().slice(0, MAX_Q) : "";
  if (!q) return NextResponse.json({ error: "Missing 'q'" }, { status: 400 });

  const atts = Array.isArray(body.atts) ? body.atts.slice(0, 5) : null;
  const history = Array.isArray(body.history) ? body.history.filter((m) => m && typeof m.t === "string") : [];
  const ctx = body.context ?? null;

  // Attachments aren't parsed yet, and the model-portfolio / calculator /
  // score widgets are rendered client-side — the local engine handles those.
  const local = aiReply(q, atts, ctx);
  if (!llmEnabled() || atts?.length || local.widget) {
    return NextResponse.json({ ...local, source: "local" });
  }

  try {
    const reply = await askClaude(q, history, ctx);
    if (reply) return NextResponse.json(reply);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.warn("[folio-ai] rate limited, using local engine");
    } else if (error instanceof Anthropic.AuthenticationError) {
      console.error("[folio-ai] invalid ANTHROPIC_API_KEY");
    } else if (error instanceof Anthropic.APIError) {
      console.error(`[folio-ai] API error ${error.status}: ${error.message}`);
    } else {
      console.error("[folio-ai] unexpected error", error);
    }
  }
  return NextResponse.json({ ...local, source: "local" });
}
