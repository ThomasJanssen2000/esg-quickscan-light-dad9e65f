export interface QuestionOption {
  label: string;
  value: string;
  score: number;
}

export interface Question {
  id: string;
  category: "company" | "environment" | "social" | "governance";
  question: string;
  description?: string;
  options: QuestionOption[];
}

export interface ScanAnswers {
  companyName: string;
  sector: string;
  employeeCount: string;
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
  "Overig",
];

export const employeeCounts = [
  "1-10",
  "11-50",
  "51-250",
  "250+",
];

export const questions: Question[] = [
  // Environment
  {
    id: "env_1",
    category: "environment",
    question: "Heeft uw organisatie inzicht in de eigen CO₂-uitstoot?",
    description: "Denk aan scope 1 (directe uitstoot) en scope 2 (energie).",
    options: [
      { label: "Nee, geen inzicht", value: "none", score: 0 },
      { label: "Globaal beeld, maar niet gemeten", value: "basic", score: 25 },
      { label: "Ja, we hebben een berekening gemaakt", value: "measured", score: 60 },
      { label: "Ja, inclusief reductiedoelstellingen", value: "targets", score: 100 },
    ],
  },
  {
    id: "env_2",
    category: "environment",
    question: "Hoe gaat uw organisatie om met afval en circulair materiaalgebruik?",
    options: [
      { label: "Geen bewust beleid", value: "none", score: 0 },
      { label: "We scheiden afval", value: "basic", score: 30 },
      { label: "We sturen actief op afvalreductie", value: "active", score: 65 },
      { label: "We werken aan circulaire bedrijfsvoering", value: "circular", score: 100 },
    ],
  },
  {
    id: "env_3",
    category: "environment",
    question: "In hoeverre houdt uw organisatie rekening met milieu-impact in de keten?",
    description: "Leveranciersselectie, inkoop, transport, etc.",
    options: [
      { label: "Niet of nauwelijks", value: "none", score: 0 },
      { label: "We letten erop maar stellen geen eisen", value: "aware", score: 25 },
      { label: "We hebben criteria in ons inkoopbeleid", value: "criteria", score: 65 },
      { label: "We monitoren en rapporteren hierover", value: "reporting", score: 100 },
    ],
  },
  {
    id: "env_4",
    category: "environment",
    question: "Maakt uw organisatie gebruik van duurzame energie?",
    options: [
      { label: "Nee", value: "none", score: 0 },
      { label: "Deels (bijv. groene stroom)", value: "partial", score: 40 },
      { label: "Ja, volledig groene energie", value: "full", score: 75 },
      { label: "Ja, met eigen opwekking (bijv. zonnepanelen)", value: "own", score: 100 },
    ],
  },
  // Social
  {
    id: "soc_1",
    category: "social",
    question: "Hoe is het gesteld met diversiteit en inclusie in uw organisatie?",
    options: [
      { label: "Geen bewust beleid", value: "none", score: 0 },
      { label: "We besteden er aandacht aan, maar informeel", value: "informal", score: 30 },
      { label: "We hebben een actief D&I-beleid", value: "policy", score: 70 },
      { label: "D&I is verankerd in strategie en werving", value: "embedded", score: 100 },
    ],
  },
  {
    id: "soc_2",
    category: "social",
    question: "Hoe waarborgt uw organisatie het welzijn van medewerkers?",
    description: "Denk aan werkdruk, veiligheid, work-life balance.",
    options: [
      { label: "Geen structurele aanpak", value: "none", score: 0 },
      { label: "We bieden basis-arbeidsvoorwaarden", value: "basic", score: 25 },
      { label: "We hebben een actief welzijnsbeleid", value: "active", score: 65 },
      { label: "Inclusief metingen en verbeterplannen", value: "measured", score: 100 },
    ],
  },
  {
    id: "soc_3",
    category: "social",
    question: "Besteedt uw organisatie aandacht aan eerlijke ketenverantwoordelijkheid?",
    description: "Denk aan arbeidsomstandigheden bij leveranciers, mensenrechten.",
    options: [
      { label: "Nee", value: "none", score: 0 },
      { label: "We zijn ons bewust maar ondernemen geen actie", value: "aware", score: 20 },
      { label: "We stellen eisen aan leveranciers", value: "requirements", score: 60 },
      { label: "We monitoren en rapporteren actief", value: "monitoring", score: 100 },
    ],
  },
  // Governance
  {
    id: "gov_1",
    category: "governance",
    question: "Is ESG verankerd in de strategie en besturing van uw organisatie?",
    options: [
      { label: "Nee, ESG staat niet op de agenda", value: "none", score: 0 },
      { label: "Er wordt over gesproken, maar niet formeel", value: "informal", score: 25 },
      { label: "ESG is onderdeel van onze strategie", value: "strategy", score: 70 },
      { label: "Er is een verantwoordelijke en er wordt actief gestuurd", value: "embedded", score: 100 },
    ],
  },
  {
    id: "gov_2",
    category: "governance",
    question: "Rapporteert uw organisatie over duurzaamheid of ESG?",
    description: "Denk aan jaarverslag, CSRD, Ecovadis, GRI, etc.",
    options: [
      { label: "Nee", value: "none", score: 0 },
      { label: "We vermelden het in communicatie, maar rapporteren niet formeel", value: "informal", score: 20 },
      { label: "We rapporteren op basis van een framework", value: "framework", score: 70 },
      { label: "We rapporteren conform CSRD/GRI/Ecovadis of vergelijkbaar", value: "formal", score: 100 },
    ],
  },
  {
    id: "gov_3",
    category: "governance",
    question: "Hoe gaat uw organisatie om met ethiek en compliance?",
    description: "Denk aan gedragscodes, anti-corruptie, privacy.",
    options: [
      { label: "Geen formeel beleid", value: "none", score: 0 },
      { label: "Basismaatregelen (bijv. AVG)", value: "basic", score: 30 },
      { label: "Gedragscode en compliance-beleid aanwezig", value: "policy", score: 65 },
      { label: "Volledig compliance-programma met monitoring", value: "full", score: 100 },
    ],
  },
  {
    id: "gov_4",
    category: "governance",
    question: "Kent uw organisatie de ESG-verplichtingen die op u van toepassing zijn?",
    description: "Vanuit wetgeving, klanten of ketenpartners.",
    options: [
      { label: "Nee, geen overzicht", value: "none", score: 0 },
      { label: "Globaal beeld", value: "basic", score: 30 },
      { label: "We weten wat verplicht is", value: "known", score: 65 },
      { label: "We hebben een volledig overzicht en actieplan", value: "full", score: 100 },
    ],
  },
];

export const categoryLabels: Record<string, string> = {
  company: "Bedrijfsinformatie",
  environment: "Environment",
  social: "Social",
  governance: "Governance",
};

export const categoryDescriptions: Record<string, string> = {
  environment: "Milieu-impact, uitstoot en duurzaam gebruik van grondstoffen",
  social: "Mensen, welzijn, diversiteit en ketenverantwoordelijkheid",
  governance: "Besturing, rapportage, ethiek en compliance",
};
