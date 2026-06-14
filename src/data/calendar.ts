// AUTO-GENERATED from the Folio prototype. Mock seed data — do not hand-edit;
// regenerate via scripts/extract.mjs if the source design changes.
import type { CalendarEvent, CalendarType } from "@/lib/types";

export const CALENDAR=[
 {date:'2.6.',d:'Po',type:'rate',title:'ECB — rozhodnutí o sazbě',sub:'Evropská centrální banka',bank:'ECB',time:'14:15',impact:3,prev:'4,25 %',fc:'4,00 %'},
 {date:'3.6.',d:'Út',type:'earnings',title:'NVIDIA — výsledky Q1',sub:'Po uzávěrce trhu',sym:'NVDA',time:'22:20',impact:3,eps:'2,18 €',rev:'26,0 mld €'},
 {date:'4.6.',d:'St',type:'exdiv',title:'Coca-Cola — ex-dividenda',sub:'Rozhodný den pro dividendu',sym:'KO',time:'—',impact:1,amt:'0,485 €'},
 {date:'5.6.',d:'Čt',type:'rate',title:'Bank of England — sazba',sub:'Centrální banka Anglie',bank:'BoE',time:'13:00',impact:3,prev:'5,00 %',fc:'4,75 %'},
 {date:'6.6.',d:'Pá',type:'earnings',title:'Apple — výsledky Q3',sub:'Po uzávěrce trhu',sym:'AAPL',time:'22:30',impact:3,eps:'1,52 €',rev:'84,5 mld €'},
 {date:'9.6.',d:'Po',type:'divpay',title:'Microsoft — výplata dividendy',sub:'Připsání na účet',sym:'MSFT',time:'—',impact:1,amt:'0,75 €'},
 {date:'11.6.',d:'St',type:'rate',title:'FED — rozhodnutí o sazbě',sub:'Federální rezervní systém (USA)',bank:'FED',time:'20:00',impact:3,prev:'5,50 %',fc:'5,25 %'},
 {date:'12.6.',d:'Čt',type:'earnings',title:'Walmart — výsledky Q1',sub:'Před otevřením trhu',sym:'WMT',time:'13:00',impact:2,eps:'0,52 €',rev:'152 mld €'},
 {date:'13.6.',d:'Pá',type:'exdiv',title:'Johnson & Johnson — ex-dividenda',sub:'Rozhodný den pro dividendu',sym:'JNJ',time:'—',impact:1,amt:'1,19 €'},
 {date:'16.6.',d:'Po',type:'earnings',title:'Alphabet — výsledky Q2',sub:'Po uzávěrce trhu',sym:'GOOGL',time:'22:00',impact:3,eps:'1,84 €',rev:'78,2 mld €'},
 {date:'18.6.',d:'St',type:'divpay',title:'Procter & Gamble — výplata',sub:'Připsání na účet',sym:'PG',time:'—',impact:1,amt:'0,94 €'},
 {date:'20.6.',d:'Pá',type:'earnings',title:'Visa — výsledky Q3',sub:'Po uzávěrce trhu',sym:'V',time:'22:05',impact:2,eps:'2,42 €',rev:'8,9 mld €'}
] as CalendarEvent[];

export const BANK_LOGO={FED:'federalreserve.gov',ECB:'ecb.europa.eu',BoE:'bankofengland.co.uk'} as Record<string, string>;
export const CAL_META={earnings:{emoji:'📊',label:'Výsledky',color:'#3D7BFF'},exdiv:{emoji:'✂️',label:'Ex-dividenda',color:'#FF9F1C'},divpay:{emoji:'💸',label:'Výplata dividendy',color:'#16C7C0'},rate:{emoji:'🏦',label:'Úroková sazba',color:'#7B61FF'}};
export const CAL_IMG={
  earnings:['photo-1611974789855-9c2a0a7236a3','photo-1590283603385-17ffb3a7f29f','photo-1543286386-2e659306cd6c'],
  exdiv:['photo-1554224155-6726b3ff858f','photo-1607863680198-23d4b2565df0','photo-1567427017947-545c5f8d16ad'],
  divpay:['photo-1579621970795-87facc2f976d','photo-1565514020179-026b92b84bb6','photo-1526304640581-d334cdbbf45e'],
  rate:['photo-1541354329998-f4d9a9f9297f','photo-1559526324-4b87b5e36e44','photo-1611324586758-1d8b4d2a4c8e']
};
