import { ASSETS, CAT_COLOR, CAT_EMOJI, LOGO } from "@/data/assets";
import { FUND } from "@/data/fundamentals";
import { ASSET_NEWS } from "@/data/assetNews";
import type { Asset, AssetDetail, AssetCategory, AssetNewsItem } from "@/lib/types";

/** Merge market row + deep fundamentals into a full detail object. */
export function getAsset(sym: string): AssetDetail | null {
  const a = ASSETS.find((x) => x.sym === sym);
  if (!a) return null;
  return { ...a, ...(FUND[sym] || {}) };
}

/** Top-scoring asset in a category (used by builder + dashboard). */
export function topAsset(cat: AssetCategory): Asset | undefined {
  return ASSETS.filter((a) => a.cat === cat).sort((x, y) => y.score - x.score)[0];
}

/** Folio AI score → [label, color-token]. Ported from `sig`. */
export function sig(s: number): [string, string] {
  if (s >= 80) return ["Silně pozitivní", "var(--limedeep)"];
  if (s >= 65) return ["Pozitivní", "var(--limedeep)"];
  if (s >= 45) return ["Neutrální", "var(--ink3)"];
  if (s >= 30) return ["Slabý", "var(--amber)"];
  return ["Negativní", "var(--coral)"];
}

/** Readable text color on a solid category chip. */
export function onColor(hex: string): string {
  return hex === "#CCFF00" || hex === "#D9A521" || hex === "#FF9F1C" ? "#0D1117" : "#fff";
}

export function catColor(cat: AssetCategory): string {
  return CAT_COLOR[cat] || "var(--purple)";
}
export function catEmoji(cat: AssetCategory): string {
  return CAT_EMOJI[cat] || "•";
}
export function logoDomain(sym: string): string | undefined {
  return LOGO[sym];
}

/** Curated per-asset news, with a generic fallback. */
export function assetNews(sym: string): AssetNewsItem[] {
  return (
    ASSET_NEWS[sym] || [
      ["TRHY", "Žádné specifické zprávy", "Sleduj obecné novinky na záložce Novinky.", "dnes"],
    ]
  );
}

export { ASSETS, CAT_COLOR, CAT_EMOJI, LOGO };
