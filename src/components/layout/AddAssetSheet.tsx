"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { ASSETS, catColor } from "@/lib/assets";
import { price } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";

export function AddAssetSheet() {
  const addAsset = useFolioStore((s) => s.addAsset);
  const addSearch = useFolioStore((s) => s.addSearch);
  const holdings = useFolioStore((s) => s.holdings);
  const closeAddAsset = useFolioStore((s) => s.closeAddAsset);
  const setAddSearch = useFolioStore((s) => s.setAddSearch);
  const pfAdd = useFolioStore((s) => s.pfAdd);

  if (!addAsset) return null;

  const held = (holdings || []).map((h) => h.sym);
  const q = addSearch.trim().toLowerCase();
  let list = ASSETS.filter((a) => !held.includes(a.sym));
  if (q) list = list.filter((a) => a.sym.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q));

  return (
    <div
      onClick={closeAddAsset}
      className="sheet-backdrop"
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 60, display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-panel"
        style={{ background: "var(--surface)", width: "100%", borderRadius: "24px 24px 0 0", padding: "18px 18px calc(20px + env(safe-area-inset-bottom))", maxHeight: "86%", display: "flex", flexDirection: "column", boxShadow: "0 -10px 40px rgba(0,0,0,.25)" }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--line)", margin: "0 auto 16px", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>Přidat akcii</div>
          <button onClick={closeAddAsset} className="pressable" style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface2)", color: "var(--ink2)", fontSize: 14 }}>
            ✕
          </button>
        </div>
        <div style={{ position: "relative", marginBottom: 10, flexShrink: 0 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <Icon name="search" size={16} color="var(--ink3)" stroke={2} />
          </span>
          <input
            type="text"
            autoComplete="off"
            aria-label="Hledat akcii k přidání"
            placeholder="Hledat ticker nebo název…"
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            style={{ width: "100%", padding: "11px 14px 11px 40px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", fontSize: 15, outline: "none" }}
          />
        </div>
        <div style={{ overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>
          {list.length ? (
            list.map((a) => {
              const cc = catColor(a.cat);
              return (
                <button
                  key={a.sym}
                  onClick={() => pfAdd(a.sym)}
                  className="pressable"
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 4px", borderBottom: "1px solid var(--line)", textAlign: "left" }}
                >
                  <LogoTile sym={a.sym} size={38} radius={11} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{a.sym}</span>
                      <span className="chip" style={{ background: cc + "1f", color: cc, padding: "1px 7px", fontSize: 9 }}>
                        {a.cat}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  </div>
                  <div className="fd" style={{ fontSize: 13.5, fontWeight: 600 }}>€{price(a.price)}</div>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--limesoft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="plus" size={16} color="var(--limedeep)" stroke={2.4} />
                  </div>
                </button>
              );
            })
          ) : (
            <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--ink2)" }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 13.5 }}>Nic nenalezeno{q ? ` pro „${addSearch}"` : ""}.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
