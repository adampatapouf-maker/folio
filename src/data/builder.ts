// AUTO-GENERATED from the Folio prototype. Mock seed data — do not hand-edit;
// regenerate via scripts/extract.mjs if the source design changes.
import type { BuilderQuestion, RiskProfile } from "@/lib/types";

export const QZ=[
 {id:'goal',q:'Jaký je tvůj hlavní cíl?',emoji:'🎯',opts:[['Ochránit, co mám',0],['Pravidelný příjem',12],['Vyvážený růst',26],['Maximální růst',40]]},
 {id:'horizon',q:'Na jak dlouho plánuješ investovat?',emoji:'⏳',opts:[['Méně než 3 roky',0],['3–7 let',12],['7–15 let',22],['Více než 15 let',30]]},
 {id:'drop',q:'Tvé portfolio spadne o 20 %. Co uděláš?',emoji:'📉',opts:[['Prodám vše',0],['Část prodám',8],['Nic neměním',20],['Přikoupím levně',30]]},
 {id:'exp',q:'Jak zkušený investor jsi?',emoji:'🧠',opts:[['Úplný začátečník',0],['Něco už vím',8],['Zkušený',15]]},
 {id:'amount',q:'Kolik chceš investovat měsíčně?',emoji:'💶',opts:[['Do 100 €',0],['100–500 €',4],['500–1 500 €',8],['Více než 1 500 €',12]]},
 {id:'crypto',q:'Jak to máš s kryptem?',emoji:'⚡',opts:[['Nechci ho vůbec',0],['Jen malou špetku',1],['Klidně i víc',2]]}
] as BuilderQuestion[];

export const PROFILES={
 Konzervativní:{min:0,risk:'Nízké riziko',ret:'3 – 5 %',vol:'6 %',alloc:[['Dluhopisové ETF',55],['Akciové ETF',20],['Konzervativní akcie',15],['Komodity',10],['Růstové akcie',0],['Krypto',0]]},
 Opatrná:{min:22,risk:'Nízké–střední',ret:'4 – 6 %',vol:'8 %',alloc:[['Dluhopisové ETF',40],['Akciové ETF',30],['Konzervativní akcie',15],['Komodity',8],['Růstové akcie',5],['Krypto',2]]},
 Vyvážená:{min:42,risk:'Střední riziko',ret:'6 – 9 %',vol:'11 %',alloc:[['Akciové ETF',42],['Dluhopisové ETF',25],['Konzervativní akcie',12],['Růstové akcie',12],['Komodity',6],['Krypto',3]]},
 Růstová:{min:62,risk:'Vyšší riziko',ret:'8 – 11 %',vol:'15 %',alloc:[['Akciové ETF',50],['Růstové akcie',22],['Dluhopisové ETF',12],['Konzervativní akcie',8],['Komodity',4],['Krypto',4]]},
 Dynamická:{min:82,risk:'Vysoké riziko',ret:'9 – 13 %',vol:'19 %',alloc:[['Akciové ETF',52],['Růstové akcie',30],['Konzervativní akcie',5],['Dluhopisové ETF',5],['Komodity',3],['Krypto',5]]}
} as Record<string, RiskProfile>;
