export interface QuestionOption {
  label: string;
  value: string;
  score: number;
}

export interface Question {
  id: string;
  theme: string;
  question: string;
  description?: string;
  options: QuestionOption[];
}

export interface ScanAnswers {
  companyName: string;
  sector: string;
  employeeCount: string;
  revenue: string;
  answers: Record<string, string>;
}

export const sectors = [
  "Bouw & Infrastructuur",
  "Productie & Industrie",
  "Technologie & IT",
  "Zakelijke dienstverlening",
  "Handel & Retail",
  "Transport & Logistiek",
  "Gezondheidszorg",
  "Voeding & Agri",
  "Energie & Utilities",
  "Overheid & Publiek",
  "Financiële dienstverlening",
  "Overig",
];

export const employeeCounts = [
  "1-10",
  "11-50",
  "51-250",
  "250-500",
  "500+",
];

export const revenueRanges = [
  "< €2 miljoen",
  "€2 - €10 miljoen",
  "€10 - €50 miljoen",
  "€50 - €150 miljoen",
  "> €150 miljoen",
  "Niet van toepassing (overheid/non-profit)",
];

export const questions: Question[] = [
  // --- Strategie & Bewustzijn ---
  {
    id: "strat_1",
    theme: "Strategie & Bewustzijn",
    question: "Is duurzaamheid of ESG onderdeel van de strategie van uw organisatie?",
    options: [
      { label: "Nee, het staat niet op de agenda", value: "none", score: 0 },
      { label: "Het wordt besproken maar is niet formeel vastgelegd", value: "informal", score: 25 },
      { label: "Ja, er zijn doelen geformuleerd", value: "goals", score: 65 },
      { label: "Ja, inclusief KPI's, verantwoordelijke(n) en rapportage", value: "embedded", score: 100 },
    ],
  },
  {
    id: "strat_2",
    theme: "Strategie & Bewustzijn",
    question: "Heeft uw organisatie een materialiteitsanalyse uitgevoerd?",
    description: "Een materialiteitsanalyse brengt in kaart welke ESG-thema's het meest relevant zijn voor uw organisatie en stakeholders.",
    options: [
      { label: "Nee, onbekend begrip", value: "none", score: 0 },
      { label: "We weten wat het is maar hebben het niet gedaan", value: "aware", score: 15 },
      { label: "We hebben een informele inschatting gemaakt", value: "informal", score: 45 },
      { label: "Ja, we hebben een formele (dubbele) materialiteitsanalyse", value: "formal", score: 100 },
    ],
  },
  {
    id: "strat_3",
    theme: "Strategie & Bewustzijn",
    question: "Kent uw organisatie de ESG-verplichtingen die op u van toepassing zijn?",
    description: "Vanuit wetgeving, klanten, financiers of ketenpartners.",
    options: [
      { label: "Nee, geen overzicht", value: "none", score: 0 },
      { label: "Globaal beeld, maar niet compleet", value: "basic", score: 30 },
      { label: "We weten wat verplicht is", value: "known", score: 65 },
      { label: "We hebben een volledig overzicht en actieplan", value: "full", score: 100 },
    ],
  },
  // --- Milieu & Klimaat ---
  {
    id: "env_1",
    theme: "Milieu & Klimaat",
    question: "Heeft uw organisatie inzicht in de eigen CO₂-uitstoot?",
    description: "Scope 1 (directe uitstoot), scope 2 (energie) en eventueel scope 3 (keten).",
    options: [
      { label: "Nee, geen inzicht", value: "none", score: 0 },
      { label: "Globaal beeld, maar niet berekend", value: "basic", score: 20 },
      { label: "Scope 1 & 2 zijn berekend", value: "scope12", score: 55 },
      { label: "Scope 1, 2 & 3 zijn berekend", value: "scope123", score: 85 },
      { label: "Inclusief reductiedoelstellingen en roadmap", value: "targets", score: 100 },
    ],
  },
  {
    id: "env_2",
    theme: "Milieu & Klimaat",
    question: "Maakt uw organisatie gebruik van duurzame energie?",
    options: [
      { label: "Nee", value: "none", score: 0 },
      { label: "Deels (bijv. groene stroom inkopen)", value: "partial", score: 40 },
      { label: "Volledig groene energie", value: "full", score: 75 },
      { label: "Groene energie inclusief eigen opwekking", value: "own", score: 100 },
    ],
  },
  {
    id: "env_3",
    theme: "Milieu & Klimaat",
    question: "Hoe gaat uw organisatie om met afval en circulair materiaalgebruik?",
    options: [
      { label: "Geen bewust beleid", value: "none", score: 0 },
      { label: "We scheiden afval", value: "basic", score: 30 },
      { label: "We sturen actief op afvalreductie", value: "active", score: 65 },
      { label: "We werken aan circulaire bedrijfsvoering", value: "circular", score: 100 },
    ],
  },
  {
    id: "env_4",
    theme: "Milieu & Klimaat",
    question: "Heeft uw organisatie beleid rondom watergebruik en biodiversiteit?",
    options: [
      { label: "Nee, niet relevant of geen beleid", value: "none", score: 0 },
      { label: "We zijn ons bewust maar nemen geen maatregelen", value: "aware", score: 25 },
      { label: "We hebben beleidsmaatregelen geïmplementeerd", value: "policy", score: 70 },
      { label: "We monitoren, rapporteren en verbeteren actief", value: "active", score: 100 },
    ],
  },
  // --- Keten & Leveranciers ---
  {
    id: "chain_1",
    theme: "Keten & Leveranciers",
    question: "In hoeverre houdt uw organisatie rekening met milieu-impact in de keten?",
    description: "Leveranciersselectie, inkoop, transport, etc.",
    options: [
      { label: "Niet of nauwelijks", value: "none", score: 0 },
      { label: "We letten erop maar stellen geen eisen", value: "aware", score: 25 },
      { label: "We hebben duurzaamheidscriteria in ons inkoopbeleid", value: "criteria", score: 65 },
      { label: "We monitoren, auditeren en rapporteren hierover", value: "reporting", score: 100 },
    ],
  },
  {
    id: "chain_2",
    theme: "Keten & Leveranciers",
    question: "Stelt uw organisatie eisen aan leveranciers op het gebied van mensenrechten en arbeidsomstandigheden?",
    description: "Denk aan due diligence, gedragscodes voor leveranciers, IMVO.",
    options: [
      { label: "Nee", value: "none", score: 0 },
      { label: "We zijn ons bewust maar ondernemen geen actie", value: "aware", score: 20 },
      { label: "We hebben een gedragscode/eisen voor leveranciers", value: "requirements", score: 60 },
      { label: "We voeren due diligence uit en monitoren actief", value: "duediligence", score: 100 },
    ],
  },
  {
    id: "chain_3",
    theme: "Keten & Leveranciers",
    question: "Wordt uw organisatie door klanten of opdrachtgevers gevraagd naar duurzaamheidsprestaties?",
    description: "Bijv. Ecovadis-rating, CO₂-footprint, duurzaamheidsverklaringen.",
    options: [
      { label: "Nee, nooit", value: "none", score: 0 },
      { label: "Af en toe, informeel", value: "sometimes", score: 30 },
      { label: "Ja, regelmatig — het wordt steeds belangrijker", value: "regular", score: 65 },
      { label: "Ja, het is een harde eis bij aanbestedingen/contracten", value: "mandatory", score: 100 },
    ],
  },
  // --- Mensen & Sociaal ---
  {
    id: "soc_1",
    theme: "Mensen & Sociaal",
    question: "Hoe is het gesteld met diversiteit en inclusie in uw organisatie?",
    options: [
      { label: "Geen bewust beleid", value: "none", score: 0 },
      { label: "We besteden er aandacht aan, maar informeel", value: "informal", score: 30 },
      { label: "We hebben een actief D&I-beleid", value: "policy", score: 70 },
      { label: "D&I is verankerd in strategie, werving en rapportage", value: "embedded", score: 100 },
    ],
  },
  {
    id: "soc_2",
    theme: "Mensen & Sociaal",
    question: "Hoe waarborgt uw organisatie het welzijn van medewerkers?",
    description: "Werkdruk, veiligheid, mentaal welzijn, work-life balance.",
    options: [
      { label: "Geen structurele aanpak", value: "none", score: 0 },
      { label: "We bieden basis-arbeidsvoorwaarden", value: "basic", score: 25 },
      { label: "We hebben een actief welzijnsbeleid", value: "active", score: 65 },
      { label: "Inclusief metingen, KPI's en verbeterplannen", value: "measured", score: 100 },
    ],
  },
  {
    id: "soc_3",
    theme: "Mensen & Sociaal",
    question: "Investeert uw organisatie in opleiding en ontwikkeling van medewerkers?",
    options: [
      { label: "Niet structureel", value: "none", score: 0 },
      { label: "Op verzoek of ad hoc", value: "adhoc", score: 30 },
      { label: "Er is een opleidingsbudget en -plan", value: "plan", score: 65 },
      { label: "Continue ontwikkeling is verankerd in HR-beleid", value: "embedded", score: 100 },
    ],
  },
  // --- Governance & Rapportage ---
  {
    id: "gov_1",
    theme: "Governance & Rapportage",
    question: "Rapporteert uw organisatie over duurzaamheid of ESG?",
    description: "Denk aan jaarverslag, duurzaamheidsverslag, CSRD, Ecovadis, GRI, etc.",
    options: [
      { label: "Nee", value: "none", score: 0 },
      { label: "We vermelden het in communicatie maar rapporteren niet formeel", value: "informal", score: 20 },
      { label: "We rapporteren op basis van een framework of rating", value: "framework", score: 70 },
      { label: "We rapporteren conform CSRD, GRI, Ecovadis of vergelijkbaar", value: "formal", score: 100 },
    ],
  },
  {
    id: "gov_2",
    theme: "Governance & Rapportage",
    question: "Hoe gaat uw organisatie om met ethiek, integriteit en compliance?",
    description: "Gedragscodes, anti-corruptie, klokkenluidersregeling, privacy.",
    options: [
      { label: "Geen formeel beleid", value: "none", score: 0 },
      { label: "Basismaatregelen (bijv. AVG-compliance)", value: "basic", score: 30 },
      { label: "Gedragscode en compliance-beleid aanwezig", value: "policy", score: 65 },
      { label: "Volledig compliance-programma met monitoring en training", value: "full", score: 100 },
    ],
  },
  {
    id: "gov_3",
    theme: "Governance & Rapportage",
    question: "Is er een governance-structuur voor ESG binnen uw organisatie?",
    description: "Denk aan een ESG-commissie, verantwoordelijke directielid, rapportagelijnen.",
    options: [
      { label: "Nee, niemand is verantwoordelijk", value: "none", score: 0 },
      { label: "Eén persoon houdt zich er informeel mee bezig", value: "informal", score: 25 },
      { label: "Er is een verantwoordelijke met mandaat", value: "responsible", score: 65 },
      { label: "Er is een formele governance-structuur met toezicht", value: "formal", score: 100 },
    ],
  },
  {
    id: "gov_4",
    theme: "Governance & Rapportage",
    question: "Heeft uw organisatie een klokkenluidersregeling?",
    options: [
      { label: "Nee", value: "none", score: 0 },
      { label: "Niet formeel, maar medewerkers kunnen issues melden", value: "informal", score: 30 },
      { label: "Ja, conform de Wet bescherming klokkenluiders", value: "compliant", score: 100 },
    ],
  },
  // --- Risicobeheer & Toekomst ---
  {
    id: "risk_1",
    theme: "Risicobeheer & Toekomst",
    question: "Heeft uw organisatie ESG-risico's geïdentificeerd en beoordeeld?",
    description: "Klimaatrisico's, reputatierisico's, juridische risico's, transitierisico's.",
    options: [
      { label: "Nee", value: "none", score: 0 },
      { label: "We zijn ons bewust van enkele risico's", value: "aware", score: 25 },
      { label: "We hebben een informele risico-inventarisatie", value: "informal", score: 55 },
      { label: "We hebben een formeel ESG-risicomanagementproces", value: "formal", score: 100 },
    ],
  },
  {
    id: "risk_2",
    theme: "Risicobeheer & Toekomst",
    question: "In hoeverre is uw organisatie voorbereid op de energietransitie?",
    description: "Denk aan afhankelijkheid van fossiele energie, verduurzaming vastgoed, mobiliteit.",
    options: [
      { label: "Niet mee bezig", value: "none", score: 0 },
      { label: "We denken erover na maar ondernemen nog geen actie", value: "thinking", score: 20 },
      { label: "We nemen stappen (bijv. verduurzaming wagenpark, pand)", value: "steps", score: 60 },
      { label: "We hebben een transitieplan met tijdlijn en budget", value: "plan", score: 100 },
    ],
  },
  {
    id: "risk_3",
    theme: "Risicobeheer & Toekomst",
    question: "Speelt duurzaamheid een rol bij uw financiering of verzekeringen?",
    description: "Banken en verzekeraars stellen steeds vaker ESG-eisen.",
    options: [
      { label: "Niet dat ik weet", value: "none", score: 0 },
      { label: "Het is ter sprake gekomen", value: "mentioned", score: 30 },
      { label: "Ja, er worden eisen gesteld", value: "requirements", score: 70 },
      { label: "Ja, en we anticiperen hier actief op", value: "proactive", score: 100 },
    ],
  },
];

// Get unique themes in order
export function getThemes(): string[] {
  const seen = new Set<string>();
  const themes: string[] = [];
  for (const q of questions) {
    if (!seen.has(q.theme)) {
      seen.add(q.theme);
      themes.push(q.theme);
    }
  }
  return themes;
}

export function getQuestionsByTheme(theme: string): Question[] {
  return questions.filter((q) => q.theme === theme);
}
