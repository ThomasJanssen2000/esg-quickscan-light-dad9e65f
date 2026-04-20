// Auto-generated from ESG_Quickscan_Beslisboom_ActRight_NL.xlsx
export interface QuestionOption { value: string; label: string }
export interface Question { id: string; question: string; type: 'single' | 'multi'; required: boolean; options: QuestionOption[]; helper?: string }

export const questions: Question[] = [
  {
    id: "Q01",
    question: "Hoeveel medewerkers heeft uw organisatie?",
    type: "single",
    required: true,
    helper: "Stuurt op omvangsafhankelijke verplichtingen, HR-risico's en volwassenheid.",
    options: [
      { value: "0-9", label: "0-9" },
      { value: "10-49", label: "10-49" },
      { value: "50-249", label: "50-249" },
      { value: "250+", label: "250+" }
    ]
  },
  {
    id: "Q02",
    question: "Wat is uw jaarlijkse omzet (globale bandbreedte)?",
    type: "single",
    required: true,
    helper: "Helpt inschatten of reporting-/auditcontext zwaarder kan worden en of financieringsdruk waarschijnlijk is.",
    options: [
      { value: "< €2 mln", label: "< €2 mln" },
      { value: "€2-10 mln", label: "€2-10 mln" },
      { value: "€10-50 mln", label: "€10-50 mln" },
      { value: "> €50 mln", label: "> €50 mln" },
      { value: "Onbekend", label: "Onbekend" }
    ]
  },
  {
    id: "Q03",
    question: "In welke hoofdsector is uw organisatie actief?",
    type: "single",
    required: true,
    helper: "Activeert sectorrouting en sectorspecifieke modules.",
    options: [
      { value: "Zakelijke dienstverlening", label: "Zakelijke dienstverlening" },
      { value: "Productie / industrie", label: "Productie / industrie" },
      { value: "Bouw / installatie / techniek", label: "Bouw / installatie / techniek" },
      { value: "Handel / groothandel", label: "Handel / groothandel" },
      { value: "Retail / e-commerce", label: "Retail / e-commerce" },
      { value: "Logistiek / transport", label: "Logistiek / transport" },
      { value: "Food / agro", label: "Food / agro" },
      { value: "Vastgoed / bouwontwikkeling", label: "Vastgoed / bouwontwikkeling" },
      { value: "ICT / technologie / elektronica", label: "ICT / technologie / elektronica" },
      { value: "Anders", label: "Anders" }
    ]
  },
  {
    id: "Q04",
    question: "Waar is uw organisatie actief?",
    type: "single",
    required: true,
    helper: "Stuurt op internationale keten- en productregels.",
    options: [
      { value: "Alleen Nederland", label: "Alleen Nederland" },
      { value: "Ook in EU", label: "Ook in EU" },
      { value: "Ook buiten EU", label: "Ook buiten EU" }
    ]
  },
  {
    id: "Q05",
    question: "Wie zijn uw belangrijkste klanten of opdrachtgevers?",
    type: "multi",
    required: true,
    helper: "Stuurt op klantdruk, aanbestedingen, claims en ketenverzoeken.",
    options: [
      { value: "Consumenten", label: "Consumenten" },
      { value: "Kleine bedrijven", label: "Kleine bedrijven" },
      { value: "Grote bedrijven / corporates", label: "Grote bedrijven / corporates" },
      { value: "Overheden / semipubliek", label: "Overheden / semipubliek" },
      { value: "Aannemers / ketenpartners", label: "Aannemers / ketenpartners" }
    ]
  },
  {
    id: "Q06",
    question: "Krijgt u al ESG-, CO2- of duurzaamheidsvragen van klanten of opdrachtgevers?",
    type: "single",
    required: true,
    helper: "Sterkste indicator voor directe ketendruk.",
    options: [
      { value: "Nee", label: "Nee" },
      { value: "Af en toe", label: "Af en toe" },
      { value: "Regelmatig", label: "Regelmatig" },
      { value: "Vaak / structureel", label: "Vaak / structureel" }
    ]
  },
  {
    id: "Q07",
    question: "Doet uw organisatie mee aan aanbestedingen of tendertrajecten?",
    type: "single",
    required: true,
    helper: "Activeert aanbestedingskaders en certificeringen.",
    options: [
      { value: "Nooit", label: "Nooit" },
      { value: "Soms", label: "Soms" },
      { value: "Regelmatig", label: "Regelmatig" },
      { value: "Ja, dit is een belangrijk deel van onze omzet", label: "Ja, dit is een belangrijk deel van onze omzet" }
    ]
  },
  {
    id: "Q08",
    question: "Zijn bank, investeerders of subsidiegevers belangrijk voor uw organisatie?",
    type: "single",
    required: true,
    helper: "Stuurt op indirecte financieringsdruk en behoefte aan gestructureerde ESG-data.",
    options: [
      { value: "Nee", label: "Nee" },
      { value: "Beperkt", label: "Beperkt" },
      { value: "Regelmatig", label: "Regelmatig" },
      { value: "Ja, zeer belangrijk", label: "Ja, zeer belangrijk" }
    ]
  },
  {
    id: "Q09",
    question: "Verkoopt of produceert uw organisatie fysieke producten?",
    type: "single",
    required: true,
    helper: "Startvraag voor product-, afval- en circulariteitsregels.",
    options: [
      { value: "Nee, alleen diensten", label: "Nee, alleen diensten" },
      { value: "Beperkt", label: "Beperkt" },
      { value: "Belangrijk onderdeel", label: "Belangrijk onderdeel" },
      { value: "Kern van het bedrijf", label: "Kern van het bedrijf" }
    ]
  },
  {
    id: "Q10",
    question: "Brengt uw organisatie producten of verpakte goederen op de markt onder eigen naam, als producent of als importeur?",
    type: "multi",
    required: true,
    helper: "Bepaalt welke productregels en producentenverantwoordelijkheden mogelijk gelden.",
    options: [
      { value: "Nee", label: "Nee" },
      { value: "Verpakte producten", label: "Verpakte producten" },
      { value: "Elektronica", label: "Elektronica" },
      { value: "Batterijen / accu's", label: "Batterijen / accu's" },
      { value: "Textiel", label: "Textiel" },
      { value: "Chemische producten / mengsels", label: "Chemische producten / mengsels" },
      { value: "Foodproducten", label: "Foodproducten" },
      { value: "Hout- of papierproducten", label: "Hout- of papierproducten" },
      { value: "Meerdere van deze", label: "Meerdere van deze" },
      { value: "Onbekend", label: "Onbekend" }
    ]
  },
  {
    id: "Q11",
    question: "Gebruikt of verhandelt uw organisatie grondstoffen of componenten uit internationale ketens?",
    type: "multi",
    required: true,
    helper: "Stuurt op EUDR, conflict minerals, due diligence en ketenstandaarden.",
    options: [
      { value: "Nee", label: "Nee" },
      { value: "Hout/papier", label: "Hout/papier" },
      { value: "Palmolie", label: "Palmolie" },
      { value: "Cacao/koffie/soja/rubber", label: "Cacao/koffie/soja/rubber" },
      { value: "3TG metalen", label: "3TG metalen" },
      { value: "Elektronische componenten", label: "Elektronische componenten" },
      { value: "Andere risicogrondstoffen", label: "Andere risicogrondstoffen" },
      { value: "Onbekend", label: "Onbekend" }
    ]
  },
  {
    id: "Q12",
    question: "Hoe energie-intensief is uw bedrijfsvoering of locatie?",
    type: "single",
    required: true,
    helper: "Stuurt op energiebesparingsplicht, footprintkansen en energiemanagement.",
    options: [
      { value: "Laag", label: "Laag" },
      { value: "Gemiddeld", label: "Gemiddeld" },
      { value: "Hoog", label: "Hoog" },
      { value: "Onbekend", label: "Onbekend" }
    ]
  },
  {
    id: "Q13",
    question: "Welke operationele assets heeft uw organisatie?",
    type: "multi",
    required: true,
    helper: "Helpt vaststellen of gebouwen, logistiek, vastgoed en operationele milieu-impact relevant zijn.",
    options: [
      { value: "Geen van deze", label: "Geen van deze" },
      { value: "Kantoor/bedrijfspand", label: "Kantoor/bedrijfspand" },
      { value: "Productielocatie", label: "Productielocatie" },
      { value: "Magazijn/distributiecentrum", label: "Magazijn/distributiecentrum" },
      { value: "Wagenpark / servicebussen", label: "Wagenpark / servicebussen" },
      { value: "Eigen vastgoedportefeuille", label: "Eigen vastgoedportefeuille" },
      { value: "Meerdere van deze", label: "Meerdere van deze" }
    ]
  },
  {
    id: "Q14",
    question: "Gebruikt uw organisatie in marketing of sales termen als duurzaam, groen, circulair, klimaatneutraal of CO2-neutraal?",
    type: "single",
    required: true,
    helper: "Activeert claims- en greenwashing-risico.",
    options: [
      { value: "Nee", label: "Nee" },
      { value: "Beperkt", label: "Beperkt" },
      { value: "Regelmatig", label: "Regelmatig" },
      { value: "Ja, dit is onderdeel van onze propositie", label: "Ja, dit is onderdeel van onze propositie" }
    ]
  },
  {
    id: "Q15",
    question: "Heeft uw organisatie personeel in loondienst?",
    type: "single",
    required: true,
    helper: "Startvraag voor sociale wetgeving en HR-thema's.",
    options: [
      { value: "Nee", label: "Nee" },
      { value: "Ja, 1-9", label: "Ja, 1-9" },
      { value: "Ja, 10-49", label: "Ja, 10-49" },
      { value: "Ja, 50+", label: "Ja, 50+" }
    ]
  },
  {
    id: "Q16",
    question: "Zijn er verhoogde arbeids- of ketenrisico's in uw organisatie of keten?",
    type: "multi",
    required: true,
    helper: "Versterkt sociale en due-diligence thema's.",
    options: [
      { value: "Nee", label: "Nee" },
      { value: "Fysiek of veiligheidsintensief werk", label: "Fysiek of veiligheidsintensief werk" },
      { value: "Uitzendkrachten / flexibele arbeid", label: "Uitzendkrachten / flexibele arbeid" },
      { value: "Internationale leveranciers", label: "Internationale leveranciers" },
      { value: "Risicolanden / risicosectoren", label: "Risicolanden / risicosectoren" },
      { value: "Onbekend", label: "Onbekend" }
    ]
  },
  {
    id: "Q17",
    question: "Zijn privacy, compliance, integriteit of informatiebeveiliging belangrijke thema's in uw organisatie?",
    type: "single",
    required: true,
    helper: "Stuurt op governance-output en beleidsvolwassenheid.",
    options: [
      { value: "Nee", label: "Nee" },
      { value: "Enigszins", label: "Enigszins" },
      { value: "Ja", label: "Ja" },
      { value: "Ja, zeer belangrijk", label: "Ja, zeer belangrijk" }
    ]
  },
  {
    id: "Q18",
    question: "Welke ESG-bouwstenen heeft uw organisatie al?",
    type: "multi",
    required: true,
    helper: "Bepaalt volwassenheidslabel en voorkomt dat een beginnerstraject aan een gevorderde organisatie wordt geadviseerd.",
    options: [
      { value: "Geen van deze", label: "Geen van deze" },
      { value: "CO2-footprint", label: "CO2-footprint" },
      { value: "ESG- of duurzaamheidsbeleid", label: "ESG- of duurzaamheidsbeleid" },
      { value: "Gedragscode / leverancierscode", label: "Gedragscode / leverancierscode" },
      { value: "KPI's of doelen", label: "KPI's of doelen" },
      { value: "ESG-rapportage", label: "ESG-rapportage" },
      { value: "Certificeringen / ratings", label: "Certificeringen / ratings" }
    ]
  },
  {
    id: "Q19",
    question: "Met welke externe standaarden, ratings of vragenlijsten heeft u nu al te maken?",
    type: "multi",
    required: true,
    helper: "Zorgt dat de output aansluit op bestaande praktijk en voorkomt doublures.",
    options: [
      { value: "Geen", label: "Geen" },
      { value: "VSME", label: "VSME" },
      { value: "EcoVadis", label: "EcoVadis" },
      { value: "GRI", label: "GRI" },
      { value: "SBTi", label: "SBTi" },
      { value: "CDP", label: "CDP" },
      { value: "GHG Protocol", label: "GHG Protocol" },
      { value: "CO2-Prestatieladder", label: "CO2-Prestatieladder" },
      { value: "ISO 14001", label: "ISO 14001" },
      { value: "ISO 50001", label: "ISO 50001" },
      { value: "ISO 45001", label: "ISO 45001" },
      { value: "SMETA/Sedex", label: "SMETA/Sedex" },
      { value: "amfori BSCI", label: "amfori BSCI" },
      { value: "Anders", label: "Anders" }
    ]
  },
  {
    id: "Q20",
    question: "Wat is op dit moment de belangrijkste reden om met ESG aan de slag te gaan?",
    type: "single",
    required: true,
    helper: "Stuurt de prioritering, tone-of-voice en CTA's in het rapport.",
    options: [
      { value: "Wettelijke verplichtingen", label: "Wettelijke verplichtingen" },
      { value: "Vragen van klanten / keten", label: "Vragen van klanten / keten" },
      { value: "Aanbestedingen", label: "Aanbestedingen" },
      { value: "Financiering / investeerders", label: "Financiering / investeerders" },
      { value: "Kostenbesparing / efficiëntie", label: "Kostenbesparing / efficiëntie" },
      { value: "Positionering / commercieel voordeel", label: "Positionering / commercieel voordeel" },
      { value: "Voorbereiden op toekomstige eisen", label: "Voorbereiden op toekomstige eisen" }
    ]
  },
];
