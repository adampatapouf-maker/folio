// AUTO-GENERATED from the Folio prototype. Mock seed data — do not hand-edit;
// regenerate via scripts/extract.mjs if the source design changes.
import type { Holding, RankingEntry, Strategy } from "@/lib/types";

export const STRAT={name:'Vyvážená',risk:'Střední riziko',ret:'6 – 9 %',vol:'11 %',alloc:[['Akciové ETF',50],['Dluhopisové ETF',20],['Konzervativní akcie',10],['Růstové akcie',10],['Komodity',7],['Krypto',3]]} as Strategy;

export const MY_PORTFOLIO: { name: string; value: number; investedTotal: number; holdings: Holding[] } ={
 name:'Moje portfolio',value:48250,investedTotal:39800,
 holdings:[
  {sym:'VWCE',units:142,avg:108.20,cat:'Akciové ETF'},
  {sym:'CSPX',units:9,avg:480.0,cat:'Akciové ETF'},
  {sym:'AGGH',units:120,avg:5.05,cat:'Dluhopisové ETF'},
  {sym:'KO',units:55,avg:58.0,cat:'Konzervativní akcie'},
  {sym:'MSFT',units:14,avg:330.0,cat:'Růstové akcie'},
  {sym:'NVDA',units:18,avg:62.0,cat:'Růstové akcie'},
  {sym:'SGLN',units:130,avg:28.5,cat:'Komodity'},
  {sym:'BTC',units:0.12,avg:48000,cat:'Krypto'}
 ]
};

export const PF_RANKING=[
 {name:'GrowthSeeker',you:false,ytd:24.8,risk:'Vysoké',followers:'12,4k',badge:'🚀',color:'#FF5A4E'},
 {name:'DividendKing',you:false,ytd:18.2,risk:'Nízké',followers:'9,1k',badge:'👑',color:'#FF9F1C'},
 {name:'Moje portfolio',you:true,ytd:14.6,risk:'Střední',followers:'—',badge:'⭐',color:'#CCFF00'},
 {name:'TechBull',you:false,ytd:13.1,risk:'Vysoké',followers:'7,8k',badge:'🤖',color:'#7B61FF'},
 {name:'SteadyEddie',you:false,ytd:9.4,risk:'Nízké',followers:'5,2k',badge:'🛡️',color:'#3D7BFF'},
 {name:'CryptoCarl',you:false,ytd:7.9,risk:'Velmi vysoké',followers:'15,7k',badge:'⚡',color:'#16C7C0'},
 {name:'SlowAndSteady',you:false,ytd:6.1,risk:'Nízké',followers:'3,1k',badge:'🐢',color:'#D9A521'}
] as RankingEntry[];

// 12-month portfolio value shape (growth factors). Scaled at runtime so the
// last point equals the live computed value and the first ≈ invested.
export const PF_SHAPE: { m: string; f: number }[] = (() => {
  const months = ["VI", "VII", "VIII", "IX", "X", "XI", "XII", "I", "II", "III", "IV", "V"];
  let v = 1;
  const out: { m: string; f: number }[] = [];
  const steps = [-0.012, 0.028, 0.016, -0.02, 0.034, 0.018, 0.04, -0.015, 0.03, 0.022, 0.025, 0.014];
  out.push({ m: "V", f: 1 });
  for (let i = 0; i < 12; i++) {
    v = v * (1 + steps[i]);
    out.push({ m: months[i], f: v });
  }
  return out;
})();
