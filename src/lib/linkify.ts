import { getAsset, catColor } from "@/lib/assets";

/**
 * Turn `$TICKER` mentions into clickable chips. Returns an HTML string with
 * `data-sym` markers; <RichText> wires the click via event delegation.
 * Ported from the prototype's `linkifyTickers`.
 */
export function linkifyTickers(text: string): string {
  if (!text) return text;
  return text.replace(/\$([A-Z]{1,6})\b/g, (m, sym) => {
    const a = getAsset(sym);
    if (!a) return m;
    const cc = catColor(a.cat);
    return `<button data-sym="${sym}" style="display:inline-flex;align-items:center;gap:3px;background:${cc}1f;color:${cc};font-weight:800;font-size:12.5px;padding:1px 7px;border-radius:7px;vertical-align:baseline;line-height:1.3;cursor:pointer;">$${sym}</button>`;
  });
}
