// One-off build helper: pull the literal data blocks out of the original
// single-file prototype and emit typed TypeScript data modules. Run once.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = process.argv[2];
const OUT = "src/data";
mkdirSync(OUT, { recursive: true });

const lines = readFileSync(SRC, "utf8").split("\n");

// Grab an inclusive 1-based line range and join.
const range = (a, b) => lines.slice(a - 1, b).join("\n");

// Extract `const NAME = <literal>;` spanning [a,b] and re-emit as an export
// with an optional type assertion appended before the trailing semicolon.
function block(a, b, cast) {
  let text = range(a, b).replace(/^\s*const\s+/, "export const ");
  if (cast) {
    // insert cast before the final semicolon
    text = text.replace(/;\s*$/, ` as ${cast};`);
  }
  return text;
}

const header = (imports) =>
  `// AUTO-GENERATED from the Folio prototype. Mock seed data — do not hand-edit;\n` +
  `// regenerate via scripts/extract.mjs if the source design changes.\n` +
  (imports ? imports + "\n\n" : "\n");

// --- assets.ts ---
writeFileSync(
  `${OUT}/assets.ts`,
  header(`import type { Asset, AssetCategory } from "@/lib/types";`) +
    block(286, 316, "Asset[]") +
    "\n\n" +
    block(222, 222, "Record<AssetCategory, string>").replace("CAT_COLOR", "CAT_COLOR") +
    "\n" +
    block(223, 223, "Record<AssetCategory, string>") +
    "\n" +
    block(227, 227, "Record<string, string>") +
    "\n" +
    block(687, 687, "string[]") +
    "\n"
);

// --- fundamentals.ts ---
writeFileSync(
  `${OUT}/fundamentals.ts`,
  header(`import type { Fundamentals } from "@/lib/types";`) +
    block(320, 349, "Record<string, Fundamentals>") +
    "\n"
);

// --- assetNews.ts ---
writeFileSync(
  `${OUT}/assetNews.ts`,
  header(`import type { AssetNewsItem } from "@/lib/types";`) +
    block(361, 380, "Record<string, AssetNewsItem[]>") +
    "\n\n" +
    block(381, 381, "string[]") +
    "\n"
);

// --- calendar.ts ---
writeFileSync(
  `${OUT}/calendar.ts`,
  header(`import type { CalendarEvent, CalendarType } from "@/lib/types";`) +
    block(624, 637, "CalendarEvent[]") +
    "\n\n" +
    block(638, 638, "Record<string, string>") +
    "\n" +
    block(639, 639) +
    "\n" +
    block(641, 646) +
    "\n"
);

// --- social.ts ---
writeFileSync(
  `${OUT}/social.ts`,
  header(`import type { DiscussPost, FeedItem } from "@/lib/types";`) +
    block(650, 657, "DiscussPost[]") +
    "\n\n" +
    block(660, 667, "FeedItem[]") +
    "\n"
);

// --- academy.ts ---
writeFileSync(
  `${OUT}/academy.ts`,
  header(`import type { Topic, Question } from "@/lib/types";`) +
    block(454, 461, "Topic[]") +
    "\n\n" +
    block(462, 499, "Question[]") +
    "\n"
);

// --- builder.ts ---
writeFileSync(
  `${OUT}/builder.ts`,
  header(`import type { BuilderQuestion, RiskProfile } from "@/lib/types";`) +
    block(1721, 1727, "BuilderQuestion[]") +
    "\n\n" +
    block(1729, 1735, "Record<string, RiskProfile>") +
    "\n"
);

// --- portfolio.ts ---
writeFileSync(
  `${OUT}/portfolio.ts`,
  header(`import type { Holding, RankingEntry, Strategy } from "@/lib/types";`) +
    block(586, 586, "Strategy") +
    "\n\n" +
    "export const MY_PORTFOLIO: { name: string; value: number; investedTotal: number; holdings: Holding[] } =" +
    range(589, 601).replace(/^\s*const\s+MY_PORTFOLIO\s*=/, "") +
    "\n\n" +
    block(612, 620, "RankingEntry[]") +
    "\n"
);

// --- calc.ts ---
writeFileSync(
  `${OUT}/calc.ts`,
  header(`import type { CompareInstrument } from "@/lib/types";`) +
    block(811, 816, "Record<string, CompareInstrument>") +
    "\n"
);

// --- tutorial.ts ---
writeFileSync(
  `${OUT}/tutorial.ts`,
  header(`import type { TutorialStep } from "@/lib/types";`) +
    block(2066, 2073, "TutorialStep[]") +
    "\n"
);

// --- misc.ts ---
writeFileSync(
  `${OUT}/misc.ts`,
  header() +
    block(1219, 1219, "string[]") +
    "\n\n" +
    "export const TFS: [string, string][] =" +
    range(409, 409).replace(/^\s*const\s+TFS\s*=/, "").replace(";", " as [string,string][];") +
    "\n"
);

console.log("Extraction complete.");
