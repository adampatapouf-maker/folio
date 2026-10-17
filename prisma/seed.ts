/**
 * Prisma seed: load the mock asset universe, fundamentals, curated news, a
 * demo user with the seed portfolio, the economic calendar and a few social
 * posts into the database. Run with `npm run db:seed`.
 *
 * Imports the same data modules the app uses, so the DB stays in sync with the
 * in-app demo data by construction.
 */
import { PrismaClient, AssetKind, Plan } from "@prisma/client";
import { ASSETS } from "../src/data/assets";
import { FUND } from "../src/data/fundamentals";
import { ASSET_NEWS } from "../src/data/assetNews";
import { MY_PORTFOLIO } from "../src/data/portfolio";
import { CALENDAR } from "../src/data/calendar";
import { DISCUSS } from "../src/data/social";

const prisma = new PrismaClient();

function kindOf(sym: string): AssetKind {
  const k = FUND[sym]?.kind;
  return (k as AssetKind) ?? AssetKind.stock;
}

async function main() {
  console.log("Seeding assets…");
  for (const a of ASSETS) {
    await prisma.asset.upsert({
      where: { sym: a.sym },
      update: {},
      create: {
        sym: a.sym,
        name: a.name,
        category: a.cat,
        kind: kindOf(a.sym),
        score: a.score,
        risk: a.risk,
        price: a.price,
        chg: a.chg,
        currency: FUND[a.sym]?.currency ?? null,
        ter: a.ter,
        why: a.why,
        pe: a.pe,
        ps: a.ps,
        divY: a.divY,
        roe: a.roe,
        mcap: a.mcap,
        low52: a.low52,
        high52: a.high52,
      },
    });
    if (FUND[a.sym]) {
      const data = FUND[a.sym] as object;
      await prisma.fundamentals.upsert({
        where: { sym: a.sym },
        update: { data },
        create: { sym: a.sym, data },
      });
    }
  }

  console.log("Seeding asset news…");
  for (const [sym, items] of Object.entries(ASSET_NEWS)) {
    for (const [tag, title, body, label] of items) {
      await prisma.assetNews.create({
        data: { sym, tag, title, body, publishedLabel: label },
      });
    }
  }

  console.log("Seeding demo user + portfolio…");
  const user = await prisma.user.upsert({
    where: { email: "demo@folio.app" },
    update: {},
    create: {
      email: "demo@folio.app",
      name: "Demo investor",
      plan: Plan.free,
      onboardedAt: new Date(),
      portfolio: {
        create: {
          name: MY_PORTFOLIO.name,
          holdings: {
            create: MY_PORTFOLIO.holdings.map((h) => ({
              sym: h.sym,
              units: h.units,
              avgPrice: h.avg,
              category: h.cat,
            })),
          },
        },
      },
    },
  });

  console.log("Seeding calendar…");
  for (const e of CALENDAR) {
    await prisma.calendarEvent.create({
      data: {
        date: e.date,
        type: e.type,
        title: e.title,
        subtitle: e.sub,
        time: e.time,
        impact: e.impact,
        sym: e.sym ?? null,
        bank: e.bank ?? null,
        meta: e as object,
      },
    });
  }

  console.log("Seeding discussion…");
  for (const p of DISCUSS) {
    await prisma.discussPost.create({
      data: {
        authorId: null,
        handle: p.handle,
        avatar: p.av,
        verified: p.ver,
        sym: p.sym,
        text: p.text,
        likes: p.likes,
        comments: p.comments,
        reposts: p.reposts,
      },
    });
  }

  console.log(`Done. Demo user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
