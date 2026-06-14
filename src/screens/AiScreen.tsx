"use client";
import { useEffect, useRef, useState } from "react";
import { useFolioStore } from "@/store/useFolioStore";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { Donut } from "@/components/charts/Charts";
import { linkifyTickers } from "@/lib/linkify";
import { computeCompound } from "@/lib/calc/compound";
import { fmt } from "@/lib/format";
import { SUGG } from "@/data/misc";
import { STRAT } from "@/data/portfolio";
import { ASSETS, sig, catColor } from "@/lib/assets";
import type { ChatMessage, ChatAttachment, AssetCategory } from "@/lib/types";

const GREETING: ChatMessage = {
  r: "ai",
  t: "Ahoj! Jsem <b>Folio AI</b> — tvůj investiční co-pilot. Umím postavit modelové portfolio z dat aktiv, vysvětlit skóre, počítat výnosy a učit tě. <b>Neříkám co koupit</b> — to necháváme na tobě. Na co se ptáš?",
};

const LIMIT = 5;

function AttChip({ f, color }: { f: ChatAttachment; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.14)", borderRadius: 9, padding: "5px 9px" }}>
      <Icon name={f.kind === "img" ? "image" : "paperclip"} size={13} color={color} stroke={2} />
      <span style={{ fontSize: 11.5, fontWeight: 600, maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
    </div>
  );
}

function PortfolioWidget() {
  return (
    <div style={{ marginTop: 12, background: "var(--bg)", borderRadius: 14, padding: 14 }}>
      <div className="mrow" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 110, height: 110, flexShrink: 0 }}>
          <Donut data={STRAT.alloc} inner={0.6} />
        </div>
        <div style={{ flex: 1 }}>
          {STRAT.alloc.map((a) => (
            <div key={a[0]} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: catColor(a[0] as AssetCategory) }} />
              <span style={{ fontSize: 12, flex: 1 }}>{a[0]}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{a[1]}%</span>
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
      <div className="fd" style={{ fontSize: 30, fontWeight: 600, color: col }}>{a.score}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name} · {lab}</div>
        <div style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.5 }}>{a.why}</div>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  const isUser = m.r === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 14 }}>
      <div
        style={{
          maxWidth: "74%",
          padding: "14px 17px",
          borderRadius: 18,
          background: isUser ? "var(--panel)" : "var(--surface)",
          color: isUser ? "var(--panelink)" : "var(--ink)",
          border: m.r === "ai" ? "1px solid var(--line)" : undefined,
          fontSize: 14.5,
          lineHeight: 1.55,
        }}
      >
        {m.atts && m.atts.length ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: m.t ? 8 : 0 }}>
            {m.atts.map((f, i) => (
              <AttChip key={i} f={f} color={isUser ? "var(--lime)" : "var(--limedeep)"} />
            ))}
          </div>
        ) : null}
        {m.r === "ai" ? <RichText html={linkifyTickers(m.t)} /> : <span>{m.t}</span>}
        {m.widget === "portfolio" && <PortfolioWidget />}
        {m.widget === "calc" && <CalcWidget />}
        {m.widget === "score" && <ScoreWidget />}
      </div>
    </div>
  );
}

export function AiScreen() {
  const chat = useFolioStore((s) => s.chat);
  const aiAtt = useFolioStore((s) => s.aiAtt);
  const plan = useFolioStore((s) => s.plan);
  const askAI = useFolioStore((s) => s.askAI);
  const addAtt = useFolioStore((s) => s.addAtt);
  const removeAtt = useFolioStore((s) => s.removeAtt);
  const setPlan = useFolioStore((s) => s.setPlan);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const messages = chat.length ? chat : [GREETING];

  useEffect(() => {
    const sc = scrollRef.current;
    if (sc) sc.scrollTop = sc.scrollHeight;
  }, [chat.length]);

  const used = chat.filter((m) => m.r === "user").length;
  const free = plan === "free";
  const left = Math.max(0, LIMIT - used);
  const reached = free && used >= LIMIT;

  const send = () => {
    const text = input.trim();
    if (!text) return;
    askAI(text, aiAtt);
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

  const counter = free ? (
    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, background: left <= 1 ? "var(--coralsoft)" : "var(--limesoft)", color: "var(--inkfix)", padding: "4px 10px", borderRadius: 999 }}>
      {left > 0 ? `Zbývá ${left} z 5 otázek zdarma` : "Limit vyčerpán"}
    </span>
  ) : (
    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, background: "var(--lime)", color: "var(--inkfix)", padding: "4px 10px", borderRadius: 999 }}>
      ✦ Premium · neomezeně
    </span>
  );

  return (
    <div className="fade" style={{ maxWidth: 860, margin: "0 auto", height: "100%", display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 160px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <Icon name="sparkles" size={21} color="var(--lime)" />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 13, height: 13, background: "var(--lime)", borderRadius: "50%", border: "2px solid var(--bg)" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="fd" style={{ fontSize: 21, fontWeight: 500 }}>Folio AI</div>
          <div style={{ fontSize: 12, color: "var(--limedeep)", fontWeight: 700 }}>● Online · propojeno s daty, kalkulačkou i akademií</div>
        </div>
        {counter}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingRight: 6 }}>
        {messages.map((m, i) => (
          <Bubble key={i} m={m} />
        ))}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {!reached &&
            SUGG.map((s) => (
              <button key={s} className="pill pressable" onClick={() => askAI(s)}>
                {s}
              </button>
            ))}
        </div>
      </div>

      {reached ? (
        <div style={{ marginTop: 16, background: "var(--panel)", color: "var(--panelink)", borderRadius: 18, padding: 22, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "var(--lime)", opacity: 0.16 }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>🔒</div>
            <div className="fd" style={{ fontSize: 21, fontWeight: 600, marginBottom: 6 }}>Vyčerpal jsi 5 otázek zdarma</div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.7)", lineHeight: 1.55, maxWidth: 440, margin: "0 auto 16px" }}>
              Folio AI Premium ti dá <b>neomezené dotazy</b>, sestavení portfolia na míru, týdenní reporty a pokročilá data.
            </div>
            <button onClick={() => setPlan("premium")} className="pressable" style={{ background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 14, padding: "13px 26px", borderRadius: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
              ✦ Odemknout Premium
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {aiAtt.length ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {aiAtt.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 11, padding: "7px 9px 7px 11px", maxWidth: 220 }}>
                  <Icon name={f.kind === "img" ? "image" : "paperclip"} size={15} color="var(--limedeep)" stroke={2} />
                  <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                  <button onClick={() => removeAtt(i)} className="pressable" style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--surface2)", color: "var(--ink2)", fontSize: 10, flexShrink: 0 }}>
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
              placeholder="Zeptej se na trhy, portfolio, výnosy…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 15, color: "var(--ink)", minWidth: 0 }}
            />
            <button onClick={send} className="pressable" style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--lime)", color: "var(--inkfix)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
