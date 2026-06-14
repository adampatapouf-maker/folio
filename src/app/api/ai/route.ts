import { NextRequest, NextResponse } from "next/server";
import { aiReply } from "@/lib/ai/engine";
import type { ChatAttachment } from "@/lib/types";

export const runtime = "nodejs";

interface AiRequestBody {
  q: string;
  atts?: ChatAttachment[];
}

/**
 * Folio AI endpoint.
 *
 * By default it answers with the deterministic local engine so the app is
 * fully functional with zero configuration. When `ANTHROPIC_API_KEY` is set
 * you can swap in a real LLM call here (the system prompt should preserve
 * Folio's guardrail: explain & educate, never give personalized buy/sell
 * advice). The fallback engine is always used on error.
 */
export async function POST(req: NextRequest) {
  let body: AiRequestBody;
  try {
    body = (await req.json()) as AiRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.q || typeof body.q !== "string") {
    return NextResponse.json({ error: "Missing 'q'" }, { status: 400 });
  }

  // Placeholder for a real model integration:
  //
  //   if (process.env.ANTHROPIC_API_KEY) {
  //     const reply = await callAnthropic(body.q, body.atts);
  //     return NextResponse.json(reply);
  //   }
  //
  // Until then (and as a safety net) we use the local intent engine.
  const reply = aiReply(body.q, body.atts ?? null);
  return NextResponse.json(reply);
}
