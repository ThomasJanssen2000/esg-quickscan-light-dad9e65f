// Persona-fixtures voor engine-tests.
// Gebruikt de exacte enum-waardes uit src/data/questions.ts.
// Zie .claude/skills/esg-engine-tester/SKILL.md voor de test-strategie.

import type { Answers } from "@/lib/esgEngine";

/**
 * Kleine ICT-consultancy, alleen NL, alleen diensten. Minimaal profiel —
 * hoort bij lead-segment "koud" te landen.
 */
export const kleinICTDienstverlening: Answers = {
  Q01: "0-9",
  Q02: "< €2 mln",
  Q03: "Zakelijke dienstverlening",
  Q04: "Alleen Nederland",
  Q05: ["Kleine bedrijven"],
  Q06: "Nee",
  Q07: "Nooit",
  Q08: "Nee",
  Q09: "Nee, alleen diensten",
  Q10: ["Nee"],
  Q11: ["Nee"],
  Q12: "Laag",
  Q13: ["Kantoor/bedrijfspand"],
  Q14: "Nee",
  Q15: "Ja, 1-9",
  Q16: ["Nee"],
  Q17: "Enigszins",
  Q18: ["Geen van deze"],
  Q19: ["Geen"],
  Q20: "Voorbereiden op toekomstige eisen",
};

/**
 * Middelgroot food-productiebedrijf met palmolie in de keten, levert aan
 * grote bedrijven, doet mee aan aanbestedingen. Verwacht segment: "warm"
 * of "hot".
 */
export const middelgrootFoodProductie: Answers = {
  Q01: "50-249",
  Q02: "€10-50 mln",
  Q03: "Food / agro",
  Q04: "Ook in EU",
  Q05: ["Grote bedrijven / corporates", "Consumenten"],
  Q06: "Regelmatig",
  Q07: "Regelmatig",
  Q08: "Beperkt",
  Q09: "Kern van het bedrijf",
  Q10: ["Verpakte producten", "Foodproducten"],
  Q11: ["Palmolie"],
  Q12: "Hoog",
  Q13: ["Productielocatie", "Magazijn/distributiecentrum", "Wagenpark / servicebussen"],
  Q14: "Regelmatig",
  Q15: "Ja, 50+",
  Q16: ["Fysiek of veiligheidsintensief werk", "Internationale leveranciers"],
  Q17: "Ja",
  Q18: ["CO2-footprint", "ESG- of duurzaamheidsbeleid"],
  Q19: ["VSME"],
  Q20: "Vragen van klanten / keten",
};

/**
 * Grote bouwonderneming die aanbestedingen als omzetmotor heeft. Verwacht
 * segment "hot" (groot + ketendruk + volwassen beleid).
 */
export const grootBouwAanbestedingen: Answers = {
  Q01: "250+",
  Q02: "> €50 mln",
  Q03: "Bouw / installatie / techniek",
  Q04: "Ook in EU",
  Q05: ["Overheden / semipubliek", "Aannemers / ketenpartners"],
  Q06: "Vaak / structureel",
  Q07: "Ja, dit is een belangrijk deel van onze omzet",
  Q08: "Ja, zeer belangrijk",
  Q09: "Belangrijk onderdeel",
  Q10: ["Nee"],
  Q11: ["Nee"],
  Q12: "Gemiddeld",
  Q13: ["Kantoor/bedrijfspand", "Wagenpark / servicebussen"],
  Q14: "Ja, dit is onderdeel van onze propositie",
  Q15: "Ja, 50+",
  Q16: ["Fysiek of veiligheidsintensief werk", "Uitzendkrachten / flexibele arbeid"],
  Q17: "Ja, zeer belangrijk",
  Q18: [
    "CO2-footprint",
    "ESG- of duurzaamheidsbeleid",
    "Gedragscode / leverancierscode",
    "KPI's of doelen",
    "ESG-rapportage",
    "Certificeringen / ratings",
  ],
  Q19: ["CO2-Prestatieladder", "ISO 14001", "ISO 45001"],
  Q20: "Aanbestedingen",
};

/**
 * Retail met elektronica-import uit buiten EU, consumenten-doelgroep.
 * Verwacht ketenregel-triggers (3TG, elektronica-stromen, claims-risico).
 */
export const retailElektronicaBuitenEU: Answers = {
  Q01: "10-49",
  Q02: "€2-10 mln",
  Q03: "Retail / e-commerce",
  Q04: "Ook buiten EU",
  Q05: ["Consumenten"],
  Q06: "Af en toe",
  Q07: "Nooit",
  Q08: "Nee",
  Q09: "Kern van het bedrijf",
  Q10: ["Elektronica", "Batterijen / accu's"],
  Q11: ["3TG metalen", "Elektronische componenten"],
  Q12: "Laag",
  Q13: ["Magazijn/distributiecentrum"],
  Q14: "Beperkt",
  Q15: "Ja, 10-49",
  Q16: ["Internationale leveranciers"],
  Q17: "Ja",
  Q18: ["Geen van deze"],
  Q19: ["Geen"],
  Q20: "Positionering / commercieel voordeel",
};
