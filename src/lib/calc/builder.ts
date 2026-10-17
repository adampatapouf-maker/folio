import { QZ, PROFILES } from "@/data/builder";
import { getAsset, topAsset } from "@/lib/assets";
import type { Allocation, BuilderResult } from "@/lib/types";

/**
 * Turn questionnaire answers into a risk profile + recommended model
 * portfolio with class / sector / currency / origin breakdowns.
 * Ported verbatim from the prototype's `computeBuilder`.
 */
export function computeBuilder(ans: Record<string, number>): BuilderResult {
  let raw = 0;
  QZ.forEach((q) => {
    if (q.id === "crypto") return;
    const i = ans[q.id];
    if (i != null) raw += q.opts[i][1];
  });
  const maxRaw = 40 + 30 + 30 + 15 + 12;
  const score = Math.round((raw / maxRaw) * 100);
  let name = "Vyvážená";
  Object.keys(PROFILES).forEach((k) => {
    if (score >= PROFILES[k].min) name = k;
  });
  const p = PROFILES[name];
  let alloc: Allocation = p.alloc.map((a) => [a[0], a[1]] as [string, number]);

  // crypto preference adjustment (cap 6 %)
  const cp = ans.crypto != null ? QZ.find((q) => q.id === "crypto")!.opts[ans.crypto][1] : 1;
  const idxC = alloc.findIndex((a) => a[0] === "Krypto");
  const idxB = alloc.findIndex((a) => a[0] === "Dluhopisové ETF");
  if (cp === 0 && idxC >= 0) {
    const moved = alloc[idxC][1];
    alloc[idxC][1] = 0;
    if (idxB >= 0) alloc[idxB][1] += moved;
  }
  if (cp === 2 && idxC >= 0) {
    const add = Math.min(2, 6 - alloc[idxC][1]);
    alloc[idxC][1] += add;
    if (idxB >= 0) alloc[idxB][1] = Math.max(0, alloc[idxB][1] - add);
  }
  alloc = alloc.filter((a) => a[1] > 0).sort((a, b) => b[1] - a[1]);

  // reasons from answers
  const reasons: string[] = [];
  const goalTxt = ["ochranu kapitálu", "pravidelný příjem", "vyvážený růst", "maximální růst"][ans.goal ?? 2];
  reasons.push(`Tvůj cíl je <b>${goalTxt}</b> — tomu odpovídá zvolený poměr růstových a obranných aktiv.`);
  const horTxt = ["kratší než 3 roky", "3–7 let", "7–15 let", "15+ let"][ans.horizon ?? 2];
  reasons.push(
    `Investiční horizont <b>${horTxt}</b> ${(ans.horizon ?? 2) >= 2 ? "umožňuje vyšší podíl akcií." : "vede k opatrnější, stabilnější alokaci."}`
  );
  const dropTxt = ["bys prodal vše", "bys část prodal", "bys nic neměnil", "bys přikoupil"][ans.drop ?? 2];
  reasons.push(
    `Při poklesu trhu ${dropTxt} — to ukazuje ${(ans.drop ?? 2) >= 2 ? "vyšší" : "nižší"} toleranci k riziku.`
  );
  reasons.push(
    "Krypto: " +
      ["vynecháno úplně.", "drženo jen jako malý 2–3% satelit.", "o něco vyšší, ale stále pod 6% limitem."][cp]
  );
  reasons.push("Dluhopisová složka tlumí kolísání; akciová ETF tvoří jádro dlouhodobého růstu.");

  // recommended instruments per category (top score)
  const picks = alloc
    .map((a) => {
      const t = topAsset(a[0] as never);
      return t ? { cat: a[0], pct: a[1], sym: t.sym, name: t.name, score: t.score } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  // derive secondary breakdowns from the recommended picks (weighted by category %)
  const origin: Record<string, number> = {};
  const currency: Record<string, number> = {};
  const sector: Record<string, number> = {};
  const specific: [string, number][] = [];
  picks.forEach((pk) => {
    const a = getAsset(pk.sym) || ({} as ReturnType<typeof getAsset> & Record<string, never>);
    const w = pk.pct;
    const reg =
      a && a.region && a.region.indexOf("USA") >= 0
        ? "USA"
        : a &&
            a.region &&
            (a.region.indexOf("Eurozóna") >= 0 ||
              a.region.indexOf("rozvinuté") >= 0 ||
              a.region.indexOf("Svět") >= 0)
          ? "Svět / DM"
          : pk.cat === "Krypto"
            ? "Globální (krypto)"
            : a && a.region && a.region.indexOf("Rozvíjející") >= 0
              ? "Rozvíjející se"
              : "Svět";
    origin[reg] = (origin[reg] || 0) + w;
    const cur = (a && a.currency) || (pk.cat === "Krypto" ? "Krypto" : "EUR");
    currency[cur] = (currency[cur] || 0) + w;
    const sec = (a && a.sector) || pk.cat;
    sector[sec] = (sector[sec] || 0) + w;
    specific.push([pk.sym, w]);
  });
  const norm = (o: Record<string, number>): Allocation => {
    const t = Object.values(o).reduce((s, v) => s + v, 0) || 1;
    return Object.keys(o)
      .map((k) => [k, Math.round((o[k] / t) * 100)] as [string, number])
      .filter((x) => x[1] > 0)
      .sort((a, b) => b[1] - a[1]);
  };

  return {
    score,
    name,
    risk: p.risk,
    ret: p.ret,
    vol: p.vol,
    alloc,
    reasons,
    picks,
    originAlloc: norm(origin),
    currencyAlloc: norm(currency),
    sectorAlloc: norm(sector),
    specificAlloc: specific.sort((a, b) => b[1] - a[1]),
  };
}
