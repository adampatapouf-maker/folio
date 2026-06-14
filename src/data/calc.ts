// AUTO-GENERATED from the Folio prototype. Mock seed data — do not hand-edit;
// regenerate via scripts/extract.mjs if the source design changes.
import type { CompareInstrument } from "@/lib/types";

export const CALC_COMPARE={
  savings:{label:'Spořicí účet',rate:2.5,color:'#3D7BFF',emoji:'🏦',desc:'Nízké riziko, nízký výnos. Po inflaci často reálně ztrácí.'},
  bonds:{label:'Státní dluhopisy',rate:4.0,color:'#FF9F1C',emoji:'📜',desc:'Stabilnější než akcie, nižší dlouhodobý výnos.'},
  dip:{label:'DIP (daňově zvýhodněný)',rate:null,color:'#16C7C0',emoji:'🛡️',desc:'Stejná tržní strategie + daňový odpočet ze vkladů.'},
  inflation:{label:'Inflace (kupní síla)',rate:2.5,color:'#FF5A4E',emoji:'📉',desc:'Co tvé vklady „sní" inflace, pokud je necháš ležet.'}
} as Record<string, CompareInstrument>;
