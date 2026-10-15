"use client";
import { useEffect, useRef, useState } from "react";
import { useFolioStore, AI_FREE_LIMIT } from "@/store/useFolioStore";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { Donut } from "@/components/charts/Charts";
import { linkifyTickers } from "@/lib/linkify";
import { computeCompound } from "@/lib/calc/compound";
import { fmt } from "@/lib/format";
import { ASSETS, sig, catColor } from "@/lib/assets";
import type { ChatMessage, ChatAttachment, AssetCategory } from "@/lib/types";

const SUGGESTIONS = [
  "Jak je na tom moje portfolio?",
  "Kam poslat měsíční vklad?",
  "Proč mám tolik krypta?",
  "Co je rebalancování?",
  "Jak se daní zisk z akcií?",
  "Kolik vydělám za 20 let?",
] as const;

/** Scoped keyframes for the typing indicator (respects prefers-reduced-motion). */
const TYPING_CSS = `
.folio-ai-typing span{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--ink3);animation:folioAiDot 1.2s ease-in-out infinite}
.folio-ai-typing span:nth-child(2){animation-delay:.18s}
.folio-ai-typing span:nth-child(3){animation-delay:.36s}
@keyframes folioAiDot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
@media (prefers-reduced-motion: reduce){.folio-ai-typing span{animation:none;opacity:.6}}
`;

function AttChip({ f, color }: { f: ChatAttachment; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.14)", borderRadius: 9, padding: "5px 9px", minWidth: 0 }}>
      <Icon name={f.kind === "img" ? "image" : "paperclip"} size={13} color={color} stroke={2} />
      <span style={{ fontSize: 11.5, fontWeight: 600, maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
    </div>
  );
}

function PortfolioWidget() {
  const strategy = useFolioStore((s) => s.strategy);
  return (
    <div style={{ marginTop: 12, background: "var(--bg)", borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink3)", marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        Cílová strategie: {strategy.name}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <div style={{ width: 96, height: 96, flexShrink: 0 }}>
          <Donut data={strategy.alloc} inner={0.6} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {strategy.alloc.map(([cat, w]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, minWidth: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: catColor(cat as AssetCategory) }} />
              <span style={{ fontSize: 12, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat}</span>
              <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{w} %</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalcWidget() {
  const r = computeCompound(5000, 500, 7, 20);
  const go = useFolioStore((s) => s.go);
  return (
    <div style={{ marginTop: 12, background: "var(--panel)", borderRadius: 14, padding: 16, color: "var(--panelink)" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
        Za 20 let při €500/měs a 7 % p.a.
      </div>
      <div className="fd" style={{ fontSize: 30, fontWeight: 600, color: "var(--lime)", marginTop: 4 }}>{fmt(r.final)}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 4 }}>
        Vloženo {fmt(r.contributed)} · úroky {fmt(r.interest)}
      </div>
      <button onClick={() => go("calc")} className="pressable" style={{ marginTop: 10, background: "var(--lime)", color: "var(--inkfix)", fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 9 }}>
        Otevřít kalkulačku →
      </button>
    </div>
  );
}

function ScoreWidget() {
  const a = ASSETS.find((x) => x.sym === "NVDA");
  if (!a) return null;
  const [lab, col] = sig(a.score);
  return (
    <div style={{ marginTop: 12, background: "var(--bg)", borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
      <div className="fd" style={{ fontSize: 30, fontWeight: 600, color: col, flexShrink: 0 }}>{a.score}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name} · {lab}</div>
        <div style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.5 }}>{a.why}</div>
      </div>
    </div>
  );
}

const aiBubbleBase: React.CSSProperties = {
  padding: "13px 16px",
  borderRadius: "18px 18px 18px 6px",
  background: "var(--surface)",
  color: "var(--ink)",
  border: "1px solid var(--line)",
  fontSize: 14.5,
  lineHeight: 1.55,
  minWidth: 0,
};

function Bubble({ m }: { m: ChatMessage }) {
  const isUser = m.r === "user";
  const hasWidget = !isUser && !!m.widget;
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div
        style={
          isUser
            ? {
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: "18px 18px 6px 18px",
                background: "var(--panel)",
                color: "var(--panelink)",
                fontSize: 14.5,
                lineHeight: 1.5,
                minWidth: 0,
                overflowWrap: "anywhere",
              }
            : { ...aiBubbleBase, maxWidth: hasWidget ? "100%" : "86%", width: hasWidget ? "100%" : undefined }
        }
      >
        {m.atts && m.atts.length ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: m.t ? 8 : 0 }}>
            {m.atts.map((f, i) => (
              <AttChip key={`${f.name}-${i}`} f={f} color={isUser ? "var(--lime)" : "var(--limedeep)"} />
            ))}
          </div>
        ) : null}
        {isUser ? <span>{m.t}</span> : <RichText html={linkifyTickers(m.t)} />}
        {m.widget === "portfolio" && <PortfolioWidget />}
        {m.widget === "calc" && <CalcWidget />}
        {m.widget === "score" && <ScoreWidget />}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }} role="status" aria-live="polite">
      <style>{TYPING_CSS}</style>
      <div style={{ ...aiBubbleBase, padding: "15px 18px", position: "relative" }}>
        <div className="folio-ai-typing" style={{ display: "flex", gap: 5, alignItems: "center", height: 10 }} aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Folio AI píše…</span>
      </div>
    </div>
  );
}

function QuotaRow({ free, left }: { free: boolean; left: number }) {
  if (!free) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, color: "var(--limedeep)" }}>
        ✦ Premium · neomezeně
      </div>
    );
  }
  const low = left <= 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: low ? "var(--coral)" : "var(--ink2)", whiteSpace: "nowrap" }}>
        {left > 0 ? `Zbývá ${left} z ${AI_FREE_LIMIT} otázek zdarma` : "Otázky zdarma vyčerpány"}
      </span>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={AI_FREE_LIMIT}
        aria-valuenow={left}
        aria-label="Zbývající otázky zdarma"
        style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--surface2)", overflow: "hidden", minWidth: 40 }}
      >
        <div style={{ width: `${(left / AI_FREE_LIMIT) * 100}%`, height: "100%", borderRadius: 4, background: low ? "var(--coral)" : "var(--limedeep)", transition: "width .3s" }} />
      </div>
    </div>
  );
}

export function AiScreen() {
  const chat = useFolioStore((s) => s.chat);
  const aiAtt = useFolioStore((s) => s.aiAtt);
  const aiPending = useFolioStore((s) => s.aiPending);
  const plan = useFolioStore((s) => s.plan);
  const strategyName = useFolioStore((s) => s.strategy.name);
  const askAI = useFolioStore((s) => s.askAI);
  const addAtt = useFolioStore((s) => s.addAtt);
  const removeAtt = useFolioStore((s) => s.removeAtt);
  const setPlan = useFolioStore((s) => s.setPlan);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const greeting: ChatMessage = {
    r: "ai",
    t: `Ahoj! Jsem <b>Folio AI</b> — tvůj investiční co-pilot. Znám tvoje portfolio i cílovou strategii <b>${strategyName}</b>, takže ti umím vysvětlit, jak na tom jsi, kam poslat vklad, co znamená skóre aktiv nebo kolik můžeš vydělat. <b>Neříkám co koupit</b> — to necháváme na tobě. Na co se ptáš?`,
  };
  const messages = chat.length ? chat : [greeting];

  useEffect(() => {
    const sc = scrollRef.current;
    if (sc) sc.scrollTop = sc.scrollHeight;
  }, [chat.length, aiPending]);

  const used = chat.filter((m) => m.r === "user").length;
  const free = plan === "free";
  const left = Math.max(0, AI_FREE_LIMIT - used);
  const reached = free && used >= AI_FREE_LIMIT;
  const suggestions = chat.length ? SUGGESTIONS.slice(0, 4) : SUGGESTIONS;
  const canSend = !aiPending && input.trim().length > 0;

  const send = () => {
    const text = input.trim();
    if (!text || aiPending) return;
    void askAI(text, aiAtt);
    setInput("");
  };

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        addAtt({ name: file.name, kind: file.type.includes("image") ? "img" : "file" });
      });
    }
    e.target.value = "";
  };

  return (
    <div className="fade" style={{ maxWidth: 860, margin: "0 auto", height: "100%", display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 160px)" }}>
      <div style={{ borderBottom: "1px solid var(--line)", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
            <Icon name="sparkles" size={20} color="var(--lime)" />
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, background: "var(--lime)", borderRadius: "50%", border: "2px solid var(--bg)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fd" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.2 }}>Folio AI</div>
            <div style={{ fontSize: 12.5, color: "var(--ink2)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Zná tvé portfolio a strategii {strategyName}
            </div>
          </div>
        </div>
        <QuotaRow free={free} left={left} />
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
        {messages.map((m, i) => (
          <Bubble key={`${i}-${m.r}`} m={m} />
        ))}
        {aiPending && <TypingBubble />}
      </div>

      {!reached && (
        <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", flexWrap: "nowrap", marginTop: 8 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              className="pill pressable"
              disabled={aiPending}
              onClick={() => void askAI(s)}
              style={{ whiteSpace: "nowrap", flexShrink: 0, opacity: aiPending ? 0.5 : 1, cursor: aiPending ? "default" : "pointer" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {reached ? (
        <div style={{ marginTop: 12, background: "var(--panel)", color: "var(--panelink)", borderRadius: 18, padding: 22, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>🔒</div>
            <div className="fd" style={{ fontSize: 21, fontWeight: 600, marginBottom: 6 }}>Vyčerpal jsi {AI_FREE_LIMIT} otázek zdarma</div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.7)", lineHeight: 1.55, maxWidth: 440, margin: "0 auto 16px" }}>
              Folio AI Premium ti dá <b>neomezené dotazy</b>, sestavení portfolia na míru, týdenní reporty a pokročilá data.
            </div>
            <button onClick={() => setPlan("premium")} className="pressable" style={{ background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 14, padding: "13px 26px", borderRadius: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
              ✦ Odemknout Premium
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          {aiAtt.length ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {aiAtt.map((f, i) => (
                <div key={`${f.name}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 11, padding: "7px 9px 7px 11px", maxWidth: 220, minWidth: 0 }}>
                  <Icon name={f.kind === "img" ? "image" : "paperclip"} size={15} color="var(--limedeep)" stroke={2} />
                  <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{f.name}</span>
                  <button onClick={() => removeAtt(i)} className="pressable" aria-label={`Odebrat ${f.name}`} style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--surface2)", color: "var(--ink2)", fontSize: 10, flexShrink: 0 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "6px 6px 6px 8px" }}>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.csv,.xlsx,.txt" multiple style={{ display: "none" }} onChange={pickFiles} />
            <button onClick={() => fileRef.current?.click()} className="pressable" aria-label="Přidat přílohu" style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface2)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="paperclip" size={18} color="var(--ink)" stroke={2.1} />
            </button>
            <input
              aria-label="Zpráva pro Folio AI"
              placeholder="Zeptej se na portfolio, vklad, výnosy…"
              value={input}
              enterKeyHint="send"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 16, color: "var(--ink)", minWidth: 0 }}
            />
            <button
              onClick={send}
              disabled={!canSend}
              className="pressable"
              aria-label="Odeslat"
              style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--lime)", color: "var(--inkfix)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: canSend ? 1 : 0.45, cursor: canSend ? "pointer" : "default" }}
            >
              <Icon name="send" size={17} color="var(--inkfix)" stroke={2.3} />
            </button>
          </div>
        </div>
      )}

      <div className="disc" style={{ textAlign: "center", marginTop: 10 }}>
        Folio AI vysvětluje a vzdělává — neposkytuje personalizované investiční poradenství. Demo.
      </div>
    </div>
  );
}
