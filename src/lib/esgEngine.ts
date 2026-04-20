// ESG Quickscan Light, scoring engine
// Volledig op basis van Excel beslisregels + masterdatabase

import { questions, type Question } from "@/data/questions";
import { themes, type Theme } from "@/data/themes";
import { rules, type Rule } from "@/data/rules";
import { topics, type Topic } from "@/data/topics";

export type Answers = Record<string, string | string[]>;

export interface ContactInfo {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone?: string;
  employees?: string;
}

export type MaturityLabel =
  | "Startfase"
  | "Basis op orde brengen"
  | "Structureren"
  | "Opschalen";

export type TopicLabel =
  | "Nu verplicht"
  | "Hoog relevant via keten"
  | "Marktstandaard / aanbevolen"
  | "Sectorspecifiek vervolgonderzoek"
  | "Monitoren / voorbereiden"
  | "Mogelijk relevant · nadere toetsing aanbevolen"
  | "Niet prioritair";

export interface ScoredTopic {
  topic: Topic;
  score: number;
  themeIds: string[];
  label: TopicLabel;
  horizon: string;
  reasons: string[];
  uncertain: boolean;
}

export interface ThemeScore {
  theme: Theme;
  score: number;
  active: boolean;
  reasons: string[];
}

export interface ESGReport {
  profileType: string;
  summary: string;
  maturityLabel: MaturityLabel;
  maturityExplanation: string;
  themeScores: ThemeScore[];
  nuRelevant: ScoredTopic[];
  binnenkortRelevant: ScoredTopic[];
  geenPrioriteit: ScoredTopic[];
  acties: string[];
  totalActiveThemes: number;
  primaryDriver: string;
}

// Helpers
function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function isUncertain(answer: string): boolean {
  return /onbekend|weet ik niet/i.test(answer);
}

const PRIORITY_LABELS: TopicLabel[] = [
  "Nu verplicht",
  "Hoog relevant via keten",
  "Marktstandaard / aanbevolen",
  "Sectorspecifiek vervolgonderzoek",
  "Monitoren / voorbereiden",
  "Mogelijk relevant · nadere toetsing aanbevolen",
];

function labelRank(label: string): number {
  const idx = PRIORITY_LABELS.indexOf(label as TopicLabel);
  return idx === -1 ? 99 : idx;
}

function isHorizonNow(h: string): boolean {
  return /^\s*nu\b/i.test(h.trim());
}
function isHorizonSoon(h: string): boolean {
  return /1-3|monitoren|voorbereiden/i.test(h);
}

// Eerste-stap suggesties per onderwerp categorie / label
function firstStepFor(topic: Topic, label: TopicLabel): string {
  const subj = topic.subject;
  if (label === "Nu verplicht") {
    if (/AVG|GDPR/i.test(subj)) return "Inventariseer welke persoonsgegevens u verwerkt en update uw verwerkingsregister.";
    if (/Energie/i.test(subj)) return "Voer een energie-scan uit en breng erkende maatregelen in beeld via uw omgevingsdienst of RVO.";
    if (/Arbo|RI&E/i.test(subj)) return "Controleer of uw RI&E actueel is en het plan van aanpak loopt.";
    if (/klokkenluider/i.test(subj)) return "Stel een interne meldregeling op en wijs een vertrouwenspersoon aan.";
    if (/UPV|verpakk/i.test(subj)) return "Meld uw verpakkingsstromen aan bij Verpact en check uw afdracht.";
    return "Doe een nulmeting tegen de wettelijke eisen en leg compliance vast.";
  }
  if (label === "Hoog relevant via keten") {
    if (/CSRD|VSME|ESRS/i.test(subj)) return "Bereid een VSME-conforme dataset voor zodat u klantvragen efficiënt kunt beantwoorden.";
    if (/EcoVadis|CDP/i.test(subj)) return "Inventariseer welke klanten dit van u vragen en bereid een eerste assessment voor.";
    if (/CO2|GHG/i.test(subj)) return "Bereken een eerste CO2-footprint (scope 1+2) volgens GHG Protocol.";
    return "Inventariseer welke klanten of financiers dit vragen en plan een gestructureerde aanpak.";
  }
  if (label === "Marktstandaard / aanbevolen") {
    return "Beoordeel of certificering of aansluiting commercieel waarde toevoegt voor uw doelgroep.";
  }
  if (label === "Sectorspecifiek vervolgonderzoek") {
    return "Laat een sectorspecifieke compliance-check uitvoeren om de exacte scope te bepalen.";
  }
  if (label === "Monitoren / voorbereiden") {
    return "Volg ontwikkelingen via uw branchevereniging en plan voorbereiding wanneer scope helder is.";
  }
  return "Toets relevantie in een verdiepingsgesprek.";
}

export function calculateReport(answers: Answers, contact?: ContactInfo): ESGReport {
  // 1. Themasscores berekenen
  const themeScoreMap = new Map<string, ThemeScore>();
  themes.forEach(t => themeScoreMap.set(t.id, { theme: t, score: 0, active: false, reasons: [] }));

  // 2. Topic accumulator
  type TopicAcc = { ids: Set<string>; score: number; themeIds: Set<string>; reasons: string[]; labels: Map<string, number>; horizons: Map<string, number>; uncertainty: number };
  const topicAcc = new Map<number, TopicAcc>();

  // 3. Onzekere antwoorden detecteren
  const uncertainQuestions = new Set<string>();
  Object.entries(answers).forEach(([qid, val]) => {
    asArray(val).forEach(v => { if (isUncertain(v)) uncertainQuestions.add(qid); });
  });

  // 4. Regels evalueren
  for (const rule of rules) {
    const ans = asArray(answers[rule.questionId]);
    if (!ans.includes(rule.trigger)) continue;

    // Speciale regel: R020 (Zakelijke diensverlening verzwakt T3) alleen als Q09 = "Nee, alleen diensten"
    if (rule.id === "R020") {
      const q9 = asArray(answers["Q09"]);
      if (!q9.includes("Nee, alleen diensten")) continue;
    }

    const ts = themeScoreMap.get(rule.themeId);
    if (ts) {
      ts.score += rule.scoreImpact;
      if (rule.reportPhrasing) ts.reasons.push(rule.reportPhrasing);
    }

    const isUncertainRule = rule.ruleType.toLowerCase().includes("onzekerheid") || uncertainQuestions.has(rule.questionId);

    for (const tid of rule.activatedTopicIds) {
      let acc = topicAcc.get(tid);
      if (!acc) {
        acc = { ids: new Set(), score: 0, themeIds: new Set(), reasons: [], labels: new Map(), horizons: new Map(), uncertainty: 0 };
        topicAcc.set(tid, acc);
      }
      acc.ids.add(rule.id);
      acc.score += Math.max(rule.scoreImpact, 1);
      acc.themeIds.add(rule.themeId);
      if (rule.reportPhrasing) acc.reasons.push(rule.reportPhrasing);
      if (rule.preferredLabel) acc.labels.set(rule.preferredLabel, (acc.labels.get(rule.preferredLabel) ?? 0) + Math.max(rule.scoreImpact, 1));
      if (rule.preferredHorizon) acc.horizons.set(rule.preferredHorizon, (acc.horizons.get(rule.preferredHorizon) ?? 0) + 1);
      if (isUncertainRule) acc.uncertainty += 1;
    }
  }

  // 5. Active themes
  themeScoreMap.forEach(ts => { ts.active = ts.score > 0; });

  // 6. Build scored topics
  const scored: ScoredTopic[] = [];
  topicAcc.forEach((acc, topicId) => {
    if (acc.score <= 0) return;
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    // Pick best label by score
    let bestLabel: string = topic.recommendedLabel || "Marktstandaard / aanbevolen";
    let bestLabelScore = -1;
    acc.labels.forEach((score, label) => {
      if (score > bestLabelScore) { bestLabelScore = score; bestLabel = label; }
    });

    let bestHorizon = topic.horizon || "Nu";
    let bestHorScore = -1;
    acc.horizons.forEach((c, h) => { if (c > bestHorScore) { bestHorScore = c; bestHorizon = h; } });

    // Onzekerheidsregel: harde "Nu verplicht" claim afzwakken bij ontbrekende drempelinformatie
    let label = bestLabel as TopicLabel;
    let uncertain = acc.uncertainty > 0;
    if (uncertain && label === "Nu verplicht") {
      label = "Mogelijk relevant · nadere toetsing aanbevolen";
    }
    // Sectorspecifieke topics: alleen behouden als sector-trigger geactiveerd is (al gefiltered via rules)

    scored.push({
      topic,
      score: acc.score,
      themeIds: Array.from(acc.themeIds),
      label,
      horizon: bestHorizon,
      reasons: Array.from(new Set(acc.reasons)).slice(0, 2),
      uncertain,
    });
  });

  // 7. Sorteer en categoriseer
  const sortedTopics = [...scored].sort((a, b) => {
    const lr = labelRank(a.label) - labelRank(b.label);
    if (lr !== 0) return lr;
    return b.score - a.score;
  });

  const nuRelevant = sortedTopics
    .filter(s => isHorizonNow(s.horizon) && labelRank(s.label) <= 2)
    .slice(0, 5);

  const usedIds = new Set(nuRelevant.map(s => s.topic.id));
  const binnenkortRelevant = sortedTopics
    .filter(s => !usedIds.has(s.topic.id) && (isHorizonSoon(s.horizon) || s.label === "Monitoren / voorbereiden" || s.label === "Sectorspecifiek vervolgonderzoek"))
    .slice(0, 5);

  binnenkortRelevant.forEach(s => usedIds.add(s.topic.id));

  // Geen prioriteit: vaak overschatte onderwerpen die nu niet getriggerd worden
  // Zoek topics waar geen actieve trigger voor is, met expliciete "vaak overschat" notie
  const overshattedSubjects = ["CSRD", "EU Taxonomie", "CSDDD", "B Corp", "SBTi"];
  const geenPrioriteit: ScoredTopic[] = [];
  for (const subj of overshattedSubjects) {
    const t = topics.find(t => t.subject.includes(subj));
    if (!t) continue;
    const acc = topicAcc.get(t.id);
    if (acc && acc.score > 0) continue; // wel geactiveerd → niet hier tonen
    geenPrioriteit.push({
      topic: t,
      score: 0,
      themeIds: [],
      label: "Niet prioritair" as TopicLabel,
      horizon: "Niet nu",
      reasons: [`Op basis van uw antwoorden zijn geen directe triggers voor ${t.subject} actief.`],
      uncertain: false,
    });
    if (geenPrioriteit.length >= 4) break;
  }

  // 8. Volwassenheidslabel (Q18 + Q19 + actieve themas)
  const buildingBlocks = asArray(answers["Q18"]).filter(v => v && v !== "Geen van deze");
  const standards = asArray(answers["Q19"]).filter(v => v && v !== "Geen");
  const activeThemes = Array.from(themeScoreMap.values()).filter(ts => ts.active).length;

  let maturityLabel: MaturityLabel;
  let maturityExplanation: string;
  if (buildingBlocks.length === 0 && standards.length === 0) {
    maturityLabel = "Startfase";
    maturityExplanation = "Er zijn nog weinig ESG-bouwstenen aanwezig. Focus op quick wins en de basis op orde brengen.";
  } else if (buildingBlocks.length <= 2 && standards.length <= 1) {
    maturityLabel = "Basis op orde brengen";
    maturityExplanation = "Enkele bouwstenen zijn aanwezig. Focus op het structureren van data, rollen en eerste beleid.";
  } else if (buildingBlocks.length <= 4 || activeThemes >= 3) {
    maturityLabel = "Structureren";
    maturityExplanation = "Meerdere bouwstenen zijn aanwezig en er is duidelijke ketendruk. Focus op vaste processen, rapportage en gerichte certificering.";
  } else {
    maturityLabel = "Opschalen";
    maturityExplanation = "Beleid, rapportage en certificeringen zijn er. Focus op verdieping, professionalisering en strategische positionering.";
  }

  // 9. Profieltype + samenvatting
  const sector = (answers["Q03"] as string) || "uw sector";
  const employees = (answers["Q01"] as string) || "";
  const intl = (answers["Q04"] as string) || "Alleen Nederland";
  const driver = (answers["Q20"] as string) || "Voorbereiden op toekomstige eisen";

  const profileType = `${sector} • ${employees} medewerkers • ${intl}`;
  const topThemes = Array.from(themeScoreMap.values())
    .filter(t => t.active)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(t => t.theme.name);

  const summary = topThemes.length > 0
    ? `Voor ${contact?.companyName || "uw organisatie"} zien we vooral aandachtspunten op het gebied van ${topThemes.join(", ").toLowerCase()}. Uw belangrijkste drijfveer is "${driver.toLowerCase()}", daar stemmen we de prioriteiten op af.`
    : `Voor ${contact?.companyName || "uw organisatie"} zien we beperkte directe ESG-druk. Een gerichte verkenning helpt om kansen en eerste stappen te bepalen.`;

  // 10. Acties, mix volgens rapportlogica
  const acties = buildActions(nuRelevant, maturityLabel, driver);

  return {
    profileType,
    summary,
    maturityLabel,
    maturityExplanation,
    themeScores: Array.from(themeScoreMap.values()).sort((a, b) => b.score - a.score),
    nuRelevant,
    binnenkortRelevant,
    geenPrioriteit,
    acties,
    totalActiveThemes: activeThemes,
    primaryDriver: driver,
  };
}

function buildActions(nuRelevant: ScoredTopic[], maturity: MaturityLabel, driver: string): string[] {
  const acts: string[] = [];

  // Quick win, eerste "nu verplicht" of energie-onderwerp
  const energy = nuRelevant.find(s => /energie/i.test(s.topic.subject));
  if (energy) {
    acts.push(`Quick win: vraag een energie-scan aan voor ${energy.topic.subject.toLowerCase()}, vaak korte terugverdientijd én directe compliance.`);
  } else if (nuRelevant[0]) {
    acts.push(`Quick win: pak ${nuRelevant[0].topic.subject} als eerste op, duidelijke wettelijke basis en snel te organiseren.`);
  } else {
    acts.push("Quick win: doe een ESG-nulmeting om uw startpunt en quick wins helder te krijgen.");
  }

  // Compliance check
  const compliance = nuRelevant.find(s => s.label === "Nu verplicht" && !/energie/i.test(s.topic.subject));
  if (compliance) {
    acts.push(`Compliance: laat een gerichte check uitvoeren op ${compliance.topic.subject} om risico's en boetes te voorkomen.`);
  }

  // Datastructuur
  const reporting = nuRelevant.find(s => /VSME|CSRD|GHG|EcoVadis|footprint|rapport/i.test(s.topic.subject));
  if (reporting) {
    acts.push(`Data: zet een eenvoudige ESG-datastructuur op (scope 1+2 + sociale basisdata) zodat u klantvragenlijsten zoals ${reporting.topic.subject} efficiënt kunt invullen.`);
  } else {
    acts.push("Data: zet een basale ESG-datastructuur op (energie, afval, personeel) als startpunt voor verdere stappen.");
  }

  // Keten/markt
  if (/aanbesteding/i.test(driver) || nuRelevant.some(s => /Ladder|ISO 14001/i.test(s.topic.subject))) {
    acts.push("Markt: bepaal welke certificering (CO2-Prestatieladder, ISO 14001) commercieel het meeste rendement oplevert.");
  } else if (/klant|keten/i.test(driver)) {
    acts.push("Keten: bereid een VSME-conforme datasheet voor om klantvragen efficiënt te beantwoorden.");
  } else {
    acts.push("Markt: identificeer 1-2 klantsegmenten waar ESG-positionering nu al commercieel verschil maakt.");
  }

  // Strategisch
  const stratByMaturity: Record<MaturityLabel, string> = {
    "Startfase": "Strategisch: stel een ESG-routekaart op met 3-5 doelen voor de komende 12 maanden.",
    "Basis op orde brengen": "Strategisch: leg eigenaarschap en governance vast, wijs een ESG-coördinator aan.",
    "Structureren": "Strategisch: kies een rapportagekader (VSME, GRI of CO2-Prestatieladder) en bouw daar processen omheen.",
    "Opschalen": "Strategisch: vertaal ESG-prestaties naar commerciële positionering en investeerderscommunicatie.",
  };
  acts.push(stratByMaturity[maturity]);

  return acts.slice(0, 5);
}
