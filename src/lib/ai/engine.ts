import { ASSETS } from "@/lib/assets";
import { sig } from "@/lib/assets";
import { STRAT } from "@/data/portfolio";
import { price } from "@/lib/format";
import type { AiWidget, ChatAttachment } from "@/lib/types";

export interface AiReply {
  t: string;
  widget?: AiWidget;
}

/**
 * Deterministic, intent-matching co-pilot reply engine. Ported verbatim from
 * the prototype's `aiReply`. Used as the server fallback when no LLM key is
 * configured, and importable on the client for offline/demo mode.
 *
 * Folio AI explains and educates — it intentionally never tells the user what
 * to buy or sell.
 */
export function aiReply(q: string, atts?: ChatAttachment[] | null): AiReply {
  const l = q.toLowerCase();
  if (atts && atts.length) {
    const hasImg = atts.some((a) => a.kind === "img");
    const names = atts.map((a) => a.name).join(", ");
    return {
      t:
        "Dík, vidím " +
        (atts.length > 1 ? atts.length + " přílohy" : "přílohu") +
        " (<b>" +
        names +
        "</b>). " +
        (hasImg
          ? "Z obrázku bych v produkční verzi přečetl graf nebo screenshot portfolia a okomentoval ho. "
          : "V produkční verzi bych z tohoto souboru (např. výpis z brokera nebo CSV s pozicemi) načetl tvé pozice a porovnal je s tvou strategií. ") +
        "V tomto demu přílohy nezpracovávám, ale klidně se zeptej na cokoliv k nim.",
    };
  }
  if (
    l.includes("prodat") ||
    l.includes("prodám") ||
    l.includes("mám prodat") ||
    l.includes("koupit") ||
    l.includes("mám koupit")
  )
    return {
      t: "Nemůžu ti říct, jestli konkrétně prodat nebo koupit — to záměrně nedělám. Co ti ale pomůže rozhodnout se sám: vrať se k <b>důvodu</b>, proč aktivum držíš, ke svému <b>horizontu</b> a <b>alokaci</b>. Časté chyby jsou panický prodej v poklesu a hon za tím, co zrovna roste. Pokud se ti změnila teze nebo váha v portfoliu, může dávat smysl rebalancovat — k tomu slouží <b>měsíční report</b>.",
    };
  if (l.includes("portfolio") || l.includes("postav"))
    return {
      t:
        "Na základě vyvážené strategie (střední riziko, výnos " +
        STRAT.ret +
        " p.a.) by AI z dat aktiv postavila toto modelové portfolio:",
      widget: "portfolio",
    };
  if (l.includes("nvda") || l.includes("nvidia") || l.includes("skóre"))
    return { t: "Tady je skóre NVDA z našeho data trackeru:", widget: "score" };
  if (l.includes("vydělám") || l.includes("let") || l.includes("úroč") || l.includes("kalkul"))
    return { t: "Pojďme to spočítat složeným úročením:", widget: "calc" };
  if (l.includes("etf"))
    return {
      t: "<b>ETF</b> (burzovně obchodovaný fond) je jeden fond, který drží mnoho aktiv najednou — koupíš celý koš akcií jediným nákupem. Začátečníci ho mají rádi pro okamžitou diverzifikaci, nízké poplatky a jednoduchost. Chceš se o tom dozvědět víc v Akademii?",
    };
  if (l.includes("dividend"))
    return {
      t: "<b>Dividenda</b> je část zisku, kterou firma pravidelně vyplácí akcionářům. Klíčové pojmy: <b>dividendový výnos</b> (dividenda ÷ cena akcie), <b>ex-dividend den</b> (kdo drží akcii do tohoto dne, dostane výplatu) a <b>payout ratio</b> (jaký podíl zisku se vyplácí). Stabilní „dividendoví aristokraté\" jako KO nebo PG zvyšují dividendu desítky let v řadě. Termíny ex-dividend i výplat najdeš v <b>Kalendáři</b>.",
    };
  if (l.includes("inflac"))
    return {
      t: "<b>Inflace</b> postupně snižuje kupní sílu peněz — při 2,5 % ročně má 1 000 € za 10 let reálnou hodnotu jen ~780 €. Proto „bezpečné\" peníze na běžném účtu reálně ztrácejí. Akcie a reálná aktiva (zlato, nemovitosti) historicky inflaci dlouhodobě překonávají. V <b>Kalkulačce</b> si můžeš zapnout porovnání s inflací a uvidíš ten rozdíl názorně.",
    };
  if (l.includes("rizik") || l.includes("volatil") || l.includes("bezpeč"))
    return {
      t:
        "<b>Riziko</b> v investování většinou znamená kolísání hodnoty (volatilitu) a šanci na trvalou ztrátu. Snižuješ ho hlavně <b>diverzifikací</b> (víc tříd aktiv), <b>časovým horizontem</b> (delší = méně záleží na výkyvech) a <b>alokací</b> (poměr akcie/dluhopisy). Tvůj profil je <b>" +
        STRAT.risk.toLowerCase() +
        "</b>. Pravidlo: investuj jen peníze, které nebudeš potřebovat řekněme 5+ let.",
    };
  if (l.includes("daň") || l.includes("daní") || l.includes("zdaň") || l.includes("dph") || l.includes("osvobozen"))
    return {
      t: "V Česku platí pro zisk z prodeje cenných papírů dvě cesty k <b>osvobození</b>: <b>časový test</b> (držba déle než 3 roky) nebo <b>hodnotový test</b> (souhrn ročních příjmů z prodeje do 100 000 Kč). Pokud nesplníš ani jeden, daníš zisk sazbou <b>15 %</b> (vyšší příjmy mohou spadnout do 23 %). Vklady do <b>DIP</b> si navíc odečteš od základu daně až do 48 000 Kč ročně. Otevři <b>Daňový poradce</b> a spočítej si to na své částky. (Není to daňové poradenství.)",
    };
  if (l.includes("diverzif") || l.includes("rozlož"))
    return {
      t: "<b>Diverzifikace</b> = nesázet vše na jednu kartu. Rozkládáš mezi třídy aktiv (akcie, dluhopisy, komodity), regiony, sektory a měny, aby propad jednoho nepoložil celé portfolio. Jeden globální ETF (např. VWCE) ti dá tisíce firem napříč světem jediným nákupem. Své rozložení vidíš v <b>Moje portfolio → Složení</b>.",
    };
  if (l.includes("krypto") || l.includes("bitcoin") || l.includes("btc"))
    return {
      t: "<b>Krypto</b> je nejvolatilnější třída — denní výkyvy 5–10 % nejsou nic neobvyklého. Bývá doplňkem, ne jádrem portfolia; běžně se drží jen malý podíl (např. do ~3–5 %), aby případný propad neohrozil celek. Investuj jen to, co si můžeš dovolit ztratit.",
    };
  const tk = ASSETS.find((a) => l.includes(a.sym.toLowerCase()) || l.includes(a.name.toLowerCase().split(" ")[0]));
  if (tk) {
    const [lab] = sig(tk.score);
    return {
      t:
        "<b>" +
        tk.name +
        " (" +
        tk.sym +
        ")</b> — kategorie " +
        tk.cat +
        ", aktuální cena €" +
        price(tk.price) +
        " (" +
        (tk.chg >= 0 ? "+" : "") +
        tk.chg.toFixed(1) +
        "% dnes). Folio AI skóre je <b>" +
        tk.score +
        "/100</b> (" +
        lab +
        "). " +
        (tk.why || "") +
        " Detail, graf a fundamenty najdeš v <b>Data aktiv</b>. Skóre není doporučení k nákupu.",
    };
  }
  return {
    t: "Dobrá otázka. V téhle demo verzi odpovídám ze šablon, ale v produkční verzi bych čerpal z aktuálních tržních dat a tvého profilu — a vysvětlil to jednoduše a srozumitelně.",
  };
}
