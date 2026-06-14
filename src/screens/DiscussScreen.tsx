"use client";
import { useState } from "react";
import { useFolioStore } from "@/store/useFolioStore";
import { DISCUSS } from "@/data/social";
import { getAsset, catColor } from "@/lib/assets";
import { linkifyTickers } from "@/lib/linkify";
import { RichText } from "@/components/ui/RichText";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import type { DiscussPost } from "@/lib/types";

const CHIPS: [string, string][] = [
  ["all", "Vše"],
  ["NVDA", "NVDA"],
  ["VWCE", "VWCE"],
  ["KO", "KO"],
  ["BTC", "BTC"],
  ["AAPL", "AAPL"],
];

/** A seed/my post paired with the stable id used for the like map + React key. */
interface Entry {
  post: DiscussPost;
  id: string;
}

function priceLabel(price?: number): string {
  if (!price) return "";
  return "€" + (price >= 1000 ? Math.round(price).toLocaleString("cs-CZ") : price.toFixed(2));
}

export function DiscussScreen() {
  const filt = useFolioStore((s) => s.discFilter);
  const myPosts = useFolioStore((s) => s.myPosts);
  const likes = useFolioStore((s) => s.likes);
  const setDiscFilter = useFolioStore((s) => s.setDiscFilter);
  const postDiscuss = useFolioStore((s) => s.postDiscuss);
  const toggleLike = useFolioStore((s) => s.toggleLike);
  const openAsset = useFolioStore((s) => s.openAsset);
  const showToast = useFolioStore((s) => s.showToast);

  const [text, setText] = useState("");

  const entries: Entry[] = [
    ...myPosts.map((p) => ({ post: p, id: p.id ?? "p" + p.time })),
    ...DISCUSS.map((p, i) => ({ post: p, id: `DISCUSS-${i}` })),
  ];

  const list = filt === "all" ? entries : entries.filter((e) => e.post.sym === filt);

  // trending tickers: count mentions
  const counts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.post.sym) counts[e.post.sym] = (counts[e.post.sym] || 0) + 1;
  });
  const trending = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 5);

  const submit = () => {
    postDiscuss(text);
    setText("");
  };

  return (
    <div className="fade" style={{ maxWidth: 620, margin: "0 auto" }}>
      <div className="sub">Komunita</div>
      <div className="h1" style={{ marginBottom: 4 }}>
        Diskuze
      </div>
      <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 16 }}>
        Sdílej názory a sleduj, co řeší ostatní investoři — jako na sociální síti, ale o trzích.
      </div>

      {/* trending strip */}
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink3)", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
        <Icon name="trophy" size={13} color="var(--gold)" stroke={2.2} /> Trendující tituly
      </div>
      <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 16 }}>
        {trending.map((sym) => {
          const a = getAsset(sym);
          const chg = a?.chg ?? 0;
          return (
            <button key={sym} onClick={() => openAsset(sym)} className="card lift" style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", textAlign: "left" }}>
              <LogoTile sym={sym} size={32} radius={9} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800 }}>${sym}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: chg >= 0 ? "var(--limedeep)" : "var(--coral)" }}>
                  {chg >= 0 ? "+" : ""}
                  {chg.toFixed(1)}%
                </div>
              </div>
              <span style={{ fontSize: 10, color: "var(--ink3)", fontWeight: 700, background: "var(--surface2)", padding: "2px 6px", borderRadius: 6 }}>
                {counts[sym]} 💬
              </span>
            </button>
          );
        })}
      </div>

      {/* filter pills */}
      <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 14 }}>
        {CHIPS.map(([key, label]) => {
          const on = filt === key;
          return (
            <button
              key={key}
              onClick={() => setDiscFilter(key)}
              className="pressable"
              style={{ padding: "7px 13px", borderRadius: 18, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", background: on ? "var(--lime)" : "var(--surface)", color: on ? "var(--inkfix)" : "var(--ink)", border: `1px solid ${on ? "var(--lime)" : "var(--line)"}` }}
            >
              {key === "all" ? "🔥 " : "$"}
              {label}
            </button>
          );
        })}
      </div>

      {/* composer */}
      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--grad-lime)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, color: "var(--inkfix)", fontWeight: 800 }}>
            Ty
          </div>
          <textarea
            aria-label="Napsat příspěvek"
            placeholder="Sdílej názor… zmiň titul přes $NVDA"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            style={{ flex: 1, minWidth: 0, background: "var(--surface2)", border: "none", borderRadius: 20, padding: "11px 16px", fontSize: 13.5, color: "var(--ink)", outline: "none", resize: "none", fontFamily: "inherit" }}
          />
          <button onClick={submit} className="pressable" style={{ background: "var(--lime)", color: "var(--inkfix)", fontWeight: 800, fontSize: 12.5, padding: "9px 16px", borderRadius: 11, flexShrink: 0 }}>
            Příspěvek
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 8, paddingLeft: 51 }}>
          Tip: napiš <b>$NVDA</b> a Folio z toho udělá klikací odkaz na akcii.
        </div>
      </div>

      {/* post list */}
      {list.length ? (
        list.map(({ post: d, id }) => {
          const meta = d.sym ? getAsset(d.sym) : null;
          const cc = d.sym && meta ? catColor(meta.cat) : "var(--purple)";
          const liked = !!likes[id];
          const likeCount = (d.likes || 0) + (liked ? 1 : 0);
          const chg = meta?.chg ?? 0;
          return (
            <div key={id} className="card fade" style={{ padding: 16, marginBottom: 12, ...(d.mine ? { border: "1.5px solid var(--lime)" } : {}) }}>
              <div style={{ display: "flex", gap: 11 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${d.av},${d.av}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: d.mine ? 13 : 17, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                  {d.mine ? "Ty" : d.user[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{d.user}</span>
                    {d.ver && <Icon name="verified" size={14} color="var(--blue)" stroke={1.5} />}
                    {d.mine && (
                      <span className="chip" style={{ background: "var(--limesoft)", color: "var(--limedeep)", fontSize: 9, padding: "1px 6px" }}>
                        TY
                      </span>
                    )}
                    <span style={{ fontSize: 12.5, color: "var(--ink3)" }}>{d.handle}</span>
                    <span style={{ fontSize: 12.5, color: "var(--ink3)" }}>· {d.time}</span>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, margin: "7px 0" }}>
                    <RichText html={linkifyTickers(d.text)} />
                  </div>
                  {d.sym && (
                    <button onClick={() => openAsset(d.sym!)} className="pressable" style={{ display: "flex", alignItems: "center", gap: 8, background: `${cc}10`, border: `1px solid ${cc}2e`, borderRadius: 12, padding: "9px 12px", marginBottom: 10, width: "100%", textAlign: "left" }}>
                      <LogoTile sym={d.sym} size={30} radius={9} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: cc }}>
                          ${d.sym} · {meta?.name || ""}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--ink2)" }}>
                          {(meta?.exchange || meta?.region || "") + (meta?.ceo ? " · CEO " + meta.ceo : "")}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div className="fd" style={{ fontSize: 14, fontWeight: 600 }}>
                          {priceLabel(meta?.price)}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: chg >= 0 ? "var(--limedeep)" : "var(--coral)" }}>
                          {chg >= 0 ? "▲ " : "▼ "}
                          {Math.abs(chg).toFixed(1)}%
                        </div>
                      </div>
                    </button>
                  )}
                  <div style={{ display: "flex", gap: 20, alignItems: "center", color: "var(--ink3)" }}>
                    <button onClick={() => showToast("Komentáře jsou v demu vypnuté", "💬")} className="pressable" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--ink3)", background: "none" }}>
                      <Icon name="comment" size={15} color="var(--ink3)" stroke={1.9} /> {d.comments}
                    </button>
                    <button onClick={() => showToast("Sdíleno dál (demo)", "🔁")} className="pressable" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--ink3)", background: "none" }}>
                      <Icon name="repeat" size={15} color="var(--ink3)" stroke={1.9} /> {d.reposts}
                    </button>
                    <button onClick={() => toggleLike(id)} className="pressable" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: liked ? 800 : 600, color: liked ? "var(--coral)" : "var(--ink3)", background: "none" }}>
                      <Icon name="heart" size={15} color={liked ? "var(--coral)" : "var(--ink3)"} stroke={liked ? 0 : 1.9} /> {likeCount}
                    </button>
                    <button onClick={() => showToast("Odkaz zkopírován (demo)", "🔗")} className="pressable" style={{ marginLeft: "auto", background: "none" }}>
                      <Icon name="share" size={15} color="var(--ink3)" stroke={1.9} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--ink2)" }}>
          Zatím tu nic není pro tento filtr.
        </div>
      )}
      <div className="disc" style={{ textAlign: "center", marginTop: 6 }}>
        Příspěvky jsou pro toto demo simulované. Nejde o investiční doporučení.
      </div>
    </div>
  );
}
