"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { FEED } from "@/data/social";
import { getAsset, catColor, assetNews } from "@/lib/assets";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import type { FeedItem } from "@/lib/types";

/** Category accent color for a feed item (lime → purple fallback). */
function feedColor(f: FeedItem): string {
  if (!f.sym) return "var(--purple)";
  const a = getAsset(f.sym);
  return a ? catColor(a.cat) : "var(--purple)";
}

/** "For You" Instagram-style feed of AI-generated market news. */
export function NewsScreen() {
  const openNews = useFolioStore((s) => s.openNews);
  const openAsset = useFolioStore((s) => s.openAsset);

  return (
    <div className="fade" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="sub">AI zpravodajství</div>
          <div className="h1">Novinky</div>
        </div>
      </div>
      <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 18 }}>Tvůj personalizovaný feed a nejnovější články.</div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name="sparkles" size={16} color="var(--limedeep)" stroke={2.2} />
        <span style={{ fontWeight: 800, fontSize: 15 }}>Pro tebe</span>
        <span style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 600 }}>· výběr podle tvého portfolia</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {FEED.map((f, idx) => {
          const cc = feedColor(f);
          return (
            <button
              key={f.title}
              onClick={() => openNews(idx)}
              className="card lift"
              style={{ padding: 0, overflow: "hidden", textAlign: "left", width: "100%", display: "block" }}
            >
              <div style={{ position: "relative", height: 300, background: "var(--panel)", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://images.unsplash.com/${f.img}?w=460&q=70&auto=format&fit=crop`}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(13,17,23,.15) 35%,rgba(13,17,23,.9) 100%)" }} />
                <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 7 }}>
                  {f.sym ? (
                    <LogoTile sym={f.sym} size={30} radius={9} />
                  ) : (
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: cc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📡</div>
                  )}
                  <span className="chip" style={{ background: "rgba(255,255,255,.22)", color: "#fff", backdropFilter: "blur(6px)", fontSize: 10 }}>
                    {f.tag}
                  </span>
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, color: "#fff" }}>
                  <div className="fd" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2, marginBottom: 5 }}>{f.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.4 }}>{f.body}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, fontSize: 12, fontWeight: 700 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Icon name="heart" size={13} color="var(--lime)" stroke={2.2} /> {f.likes}
                    </span>
                    <span style={{ opacity: 0.7 }}>{f.time}</span>
                    {f.sym && (
                      <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          openAsset(f.sym!);
                        }}
                        className="pressable"
                        style={{ marginLeft: "auto", background: "var(--lime)", color: "var(--inkfix)", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}
                      >
                        {f.sym} →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="disc" style={{ textAlign: "center", marginTop: 18 }}>Články generuje AI z tržních dat pro demo. Ověř si fakta.</div>
    </div>
  );
}

/** Full article view for the open feed item. */
export function NewsArticleScreen() {
  const newsOpen = useFolioStore((s) => s.newsOpen);
  const closeNews = useFolioStore((s) => s.closeNews);
  const openAsset = useFolioStore((s) => s.openAsset);
  const go = useFolioStore((s) => s.go);

  const f = newsOpen != null ? FEED[newsOpen] : undefined;

  if (!f) {
    return (
      <div className="fade" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 14 }}>Článek se nepodařilo načíst.</div>
        <button
          onClick={() => go("news")}
          className="pressable"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--ink2)" }}
        >
          <Icon name="chevL" size={16} color="var(--ink2)" /> Zpět na novinky
        </button>
      </div>
    );
  }

  const cc = feedColor(f);
  const related = f.sym ? assetNews(f.sym) : [];

  return (
    <div className="fade" style={{ maxWidth: 720, margin: "0 auto" }}>
      <button
        onClick={() => closeNews()}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--ink2)", marginBottom: 14 }}
      >
        <Icon name="chevL" size={16} color="var(--ink2)" /> Zpět na novinky
      </button>

      <div style={{ position: "relative", height: 280, borderRadius: 20, overflow: "hidden", marginBottom: 20, background: "var(--panel)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://images.unsplash.com/${f.img}?w=460&q=70&auto=format&fit=crop`}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(14,14,16,0) 50%,rgba(14,14,16,0.7) 100%)" }} />
        <span className="tag" style={{ position: "absolute", top: 18, left: 18, background: cc, color: cc === "var(--lime)" ? "var(--ink)" : "#fff", fontSize: 11 }}>
          {f.tag}
        </span>
      </div>

      <h1 className="fd" style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-.025em", lineHeight: 1.15, marginBottom: 16 }}>{f.title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="sparkles" size={16} color="var(--lime)" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Folio AI</div>
          <div style={{ fontSize: 11.5, color: "var(--ink2)" }}>Vygenerováno z aktuálních tržních dat</div>
        </div>
      </div>

      <div style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink)", whiteSpace: "pre-line" }}>{f.body}</div>

      {f.sym && (
        <button
          onClick={() => openAsset(f.sym!)}
          className="card lift"
          style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: 14, marginTop: 22 }}
        >
          <LogoTile sym={f.sym} size={40} radius={12} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Související aktivum</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{f.sym}</div>
          </div>
          <Icon name="chevR" size={18} color="var(--ink3)" stroke={2} />
        </button>
      )}

      {related.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Další zprávy k {f.sym}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {related.map(([tag, title, body, time]) => (
              <div key={title} className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span className="chip" style={{ background: "var(--surface2)", color: "var(--ink2)", fontSize: 10 }}>{tag}</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink3)", fontWeight: 600 }}>
                    <Icon name="clock" size={12} color="var(--ink3)" /> {time}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="disc" style={{ textAlign: "center", marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
        Tento článek je generován AI pro demo. Ověř si fakta. Není to investiční poradenství.
      </div>
    </div>
  );
}
