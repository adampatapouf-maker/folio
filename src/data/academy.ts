// AUTO-GENERATED from the Folio prototype. Mock seed data — do not hand-edit;
// regenerate via scripts/extract.mjs if the source design changes.
import type { Topic, Question } from "@/lib/types";

export const TOPICS=[
 {id:'basics',name:'Základy investování',color:'#CCFF00',emoji:'🌱'},
 {id:'etf',name:'ETF',color:'#FFB547',emoji:'📊'},
 {id:'risk',name:'Riziko a diverzifikace',color:'#7B61FF',emoji:'🛡'},
 {id:'compound',name:'Složené úročení',color:'#9FCC00',emoji:'📈'},
 {id:'fund',name:'Fundamenty',color:'#D4AF37',emoji:'💎'},
 {id:'crypto',name:'Krypto',color:'#FF5A4E',emoji:'₿'}
] as Topic[];

export const QBANK=[
 // Basics — easy
 {id:'b1',topic:'basics',diff:1,q:'Co je to akcie?',opts:['Půjčka firmě','Podíl ve vlastnictví firmy','Pojistka proti inflaci','Druh úspor v bance'],correct:1,exp:'Akcie znamená vlastnický podíl ve firmě. Jako akcionář se podílíš na zisku i ztrátě.'},
 {id:'b2',topic:'basics',diff:1,q:'Co znamená diverzifikace?',opts:['Investovat vše do jedné akcie','Rozložit investice mezi více aktiv','Prodat vše a držet hotovost','Investovat jen do dluhopisů'],correct:1,exp:'Diverzifikace = nedávat všechna vejce do jednoho košíku. Snižuje riziko bez výrazného snížení výnosu.'},
 {id:'b3',topic:'basics',diff:1,q:'Jaký je hlavní rozdíl mezi spořením a investováním?',opts:['Žádný','Spoření nese vyšší výnos','Investování má potenciálně vyšší výnos i riziko','Investovat může jen profesionál'],correct:2,exp:'Spoření je bezpečné, ale výnos sotva pokryje inflaci. Investování může nabídnout vyšší výnos výměnou za přijetí kolísání hodnoty.'},
 {id:'b4',topic:'basics',diff:1,q:'Co je to dividenda?',opts:['Poplatek brokerovi','Část zisku firmy vyplacená akcionářům','Poplatek za vedení účtu','Daň z investic'],correct:1,exp:'Dividenda je část zisku, kterou firma vyplácí svým akcionářům — obvykle čtvrtletně nebo ročně.'},
 {id:'b5',topic:'basics',diff:2,q:'Co je to bear market?',opts:['Trh s minimálními pohyby','Trh, který výrazně roste','Trh, který výrazně klesá (obvykle o 20 % a více)','Trh medvědích plyšáků'],correct:2,exp:'Bear (medvědí) market je dlouhodobý pokles trhu o 20 % a více od posledních maxim. Opak je bull (býčí) market.'},
 {id:'b6',topic:'basics',diff:2,q:'Co je „dollar-cost averaging" (pravidelné investování)?',opts:['Investovat jen v USD','Pravidelně investovat stejnou částku bez ohledu na cenu','Kupovat jen na maximech','Prodávat při poklesu'],correct:1,exp:'DCA znamená pravidelně investovat stejnou částku. Snižuje riziko špatného načasování a využívá výkyvů ve tvůj prospěch.'},
 {id:'b7',topic:'basics',diff:3,q:'Co znamená P/E ratio?',opts:['Profit / Equity','Price / Earnings — kolik investoři platí za 1 € zisku','Personal / Expense','Period / Earnings'],correct:1,exp:'P/E (Price-to-Earnings) ukazuje, kolik trh platí za každé 1 € čistého zisku firmy. Vyšší P/E = vyšší očekávání růstu.'},
 // ETF
 {id:'e1',topic:'etf',diff:1,q:'Co je to ETF?',opts:['Jedna konkrétní akcie','Fond, který drží koš mnoha aktiv','Pojistný produkt','Bankovní účet'],correct:1,exp:'ETF (Exchange-Traded Fund) je fond, který drží stovky až tisíce aktiv najednou. Koupíš ho jedním nákupem jako akcii.'},
 {id:'e2',topic:'etf',diff:1,q:'Hlavní výhoda ETF pro začátečníka:',opts:['Garantovaný zisk','Okamžitá diverzifikace a nízké poplatky','Žádné riziko','Vyšší výnos než akcie'],correct:1,exp:'ETF dává začátečníkovi diverzifikaci a nízké náklady. Riziko stále existuje, ale je rozložené.'},
 {id:'e3',topic:'etf',diff:2,q:'Co je TER (Total Expense Ratio)?',opts:['Daň z výnosu','Roční poplatek za správu ETF','Cena ETF','Výnos ETF'],correct:1,exp:'TER je celkový roční poplatek za správu fondu. U dobrých ETF bývá 0,07 % – 0,30 % ročně.'},
 {id:'e4',topic:'etf',diff:2,q:'Co znamená „UCITS" u evropských ETF?',opts:['Druh kryptoměny','Evropský regulační rámec pro fondy','Americká burza','Typ daně'],correct:1,exp:'UCITS je evropský standard pro fondy. Chrání investory a zajišťuje transparentnost.'},
 {id:'e5',topic:'etf',diff:3,q:'Jaký je rozdíl mezi akumulujícím (Acc) a distribučním (Dist) ETF?',opts:['Žádný','Acc reinvestuje dividendy, Dist je vyplácí','Acc je dražší','Dist je rizikovější'],correct:1,exp:'Acc ETF reinvestuje dividendy zpět do fondu (lepší pro dlouhodobý růst). Dist je vyplácí na účet (pasivní příjem).'},
 // Risk
 {id:'r1',topic:'risk',diff:1,q:'Co je to volatilita?',opts:['Výše dividend','Míra kolísání ceny aktiva','Typ daně','Poplatek brokerovi'],correct:1,exp:'Volatilita měří, jak silně cena kolísá v čase. Vyšší volatilita = vyšší riziko i potenciál.'},
 {id:'r2',topic:'risk',diff:1,q:'Které aktivum má obvykle nejvyšší volatilitu?',opts:['Státní dluhopisy','Bankovní spořicí účet','Kryptoměny','Zlato'],correct:2,exp:'Kryptoměny patří mezi nejvolatilnější aktiva — denní pohyby 5–10 % nejsou výjimkou.'},
 {id:'r3',topic:'risk',diff:2,q:'Co je „drawdown"?',opts:['Poplatek za výběr','Maximální pokles od posledního vrcholu','Druh ETF','Typ účtu'],correct:1,exp:'Drawdown je maximální pokles hodnoty od posledního maxima. Měří, kolik bys teoreticky mohl ztratit v nejhorším okamžiku.'},
 {id:'r4',topic:'risk',diff:2,q:'Co dělá diverzifikace s rizikem?',opts:['Zcela ho odstraňuje','Snižuje specifické riziko jednotlivých aktiv','Zvyšuje výnos bez rizika','Nemá vliv'],correct:1,exp:'Diverzifikace snižuje tzv. specifické (firemní) riziko. Tržní riziko ale zůstává — když padne celý trh, padnou i diverzifikovaná portfolia.'},
 {id:'r5',topic:'risk',diff:3,q:'Co je „beta" akcie?',opts:['Druh dividendy','Citlivost na pohyby trhu (1 = stejně jako trh)','Cena akcie','Počet akcií'],correct:1,exp:'Beta měří, jak akcie reaguje na pohyby trhu. Beta 1,5 znamená, že akcie kolísá o 50 % víc než trh.'},
 // Compound
 {id:'c1',topic:'compound',diff:1,q:'Co je složené úročení?',opts:['Úrok z úroku — výnosy se reinvestují','Daň z úroků','Poplatek bankce','Typ účtu'],correct:0,exp:'Složené úročení = úroky generují další úroky. Čím déle investuješ, tím silněji to funguje. Einstein to nazval „osmým divem světa".'},
 {id:'c2',topic:'compound',diff:1,q:'Co nejvíc pomáhá složenému úročení?',opts:['Vysoká částka','Krátká doba','Dlouhý čas','Nízký výnos'],correct:2,exp:'Čas je nejdůležitější. Začít brzy s malou částkou je lepší než pozdě s velkou.'},
 {id:'c3',topic:'compound',diff:2,q:'Při 7 % ročního výnosu se peníze přibližně zdvojnásobí za…',opts:['Asi 5 let','Asi 10 let','Asi 20 let','Nikdy'],correct:1,exp:'Pravidlo 72: 72 ÷ úroková sazba = roky do zdvojnásobení. Při 7 % to je 72/7 ≈ 10 let.'},
 {id:'c4',topic:'compound',diff:3,q:'€100/měs po 30 letech při 8 % p.a. dá přibližně…',opts:['€36 000','€60 000','€150 000','€500 000'],correct:2,exp:'Přibližně €150 000. Vloženo: €36 000. Zbytek (€114 000) jsou úroky díky složenému úročení.'},
 // Fundamentals
 {id:'f1',topic:'fund',diff:1,q:'Co je tržní kapitalizace (market cap)?',opts:['Roční zisk firmy','Cena akcie × počet akcií','Dluh firmy','Počet zaměstnanců'],correct:1,exp:'Market cap = celková tržní hodnota firmy. Velké firmy = large cap (>€10 mld), malé = small cap.'},
 {id:'f2',topic:'fund',diff:1,q:'Co je dividend yield?',opts:['Roční dividenda / cena akcie v %','Cena akcie','Daň z dividendy','Růst dividendy'],correct:0,exp:'Dividend yield ukazuje, jaký % výnos dostaneš z dividend. Akcie za €100 s dividendou €3 ročně = yield 3 %.'},
 {id:'f3',topic:'fund',diff:2,q:'Vysoké P/E typicky znamená:',opts:['Levnou akcii','Vysoká očekávání budoucího růstu','Bankrot','Nízkou volatilitu'],correct:1,exp:'Vysoké P/E = trh očekává vysoký budoucí růst zisku. Pozor: pokud růst nepřijde, akcie může výrazně klesnout.'},
 {id:'f4',topic:'fund',diff:2,q:'Co je ROE (Return on Equity)?',opts:['Cena akcie','Návratnost vlastního kapitálu — kolik firma vydělá z 1 € kapitálu','Druh dividendy','Daňový odpis'],correct:1,exp:'ROE měří, jak efektivně firma využívá svůj kapitál. Vyšší ROE = kvalitnější business (obvykle >15 %).'},
 {id:'f5',topic:'fund',diff:3,q:'Free Cash Flow (FCF) je důležitější než zisk, protože:',opts:['Je vyšší','Ukazuje skutečnou hotovost po investicích','Není zdaněn','Je jednodušší vypočítat'],correct:1,exp:'FCF ukazuje, kolik hotovosti firma reálně generuje po investicích. Účetní zisk lze upravit; cash flow ne.'},
 // Crypto
 {id:'k1',topic:'crypto',diff:1,q:'Co je Bitcoin?',opts:['Akcie firmy Bitcoin Inc.','Decentralizovaná digitální měna','Bankovní účet','Typ ETF'],correct:1,exp:'Bitcoin je decentralizovaná kryptoměna. Funguje bez centrální banky, na principu peer-to-peer sítě a blockchainu.'},
 {id:'k2',topic:'crypto',diff:1,q:'Doporučená maximální alokace krypta v portfoliu začátečníka:',opts:['50–100 %','25–50 %','1–5 % (jako spekulativní satelit)','100 % je nejlepší'],correct:2,exp:'Pro většinu investorů 1–5 % portfolia v kryptu je rozumný limit. Vyšší alokace prudce zvyšuje volatilitu celého portfolia.'},
 {id:'k3',topic:'crypto',diff:2,q:'Co je halving u Bitcoinu?',opts:['Pokles ceny o polovinu','Snížení odměny těžařů na polovinu (každé 4 roky)','Rozdělení Bitcoinu na dvě kryptoměny','Dividenda'],correct:1,exp:'Halving každé 4 roky snižuje nově vytvořené BTC. Historicky předchází růstovým cyklům.'},
 {id:'k4',topic:'crypto',diff:3,q:'Co je „stablecoin"?',opts:['Bitcoin','Kryptoměna navázaná na hodnotu fiat měny (např. USD)','Kryptoměna s nulovou volatilitou navždy','Akcie krypto firmy'],correct:1,exp:'Stablecoin je kryptoměna navázaná na stabilní aktivum, obvykle dolar. Mezi známé patří USDC a USDT.'}
] as Question[];
