import { questions, type ScanAnswers } from "./esgQuestions";

export interface CategoryScore {
  category: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ESGReport {
  overallScore: number;
  maturityLevel: string;
  maturityDescription: string;
  categoryScores: CategoryScore[];
  risks: string[];
  opportunities: string[];
  priorities: string[];
  frameworks: { name: string; applicable: boolean; reason: string }[];
}

function getCategoryScores(answers: Record<string, string>): CategoryScore[] {
  const categories = ["environment", "social", "governance"] as const;
  const labels: Record<string, string> = {
    environment: "Environment",
    social: "Social",
    governance: "Governance",
  };

  return categories.map((cat) => {
    const catQuestions = questions.filter((q) => q.category === cat);
    let total = 0;
    let max = 0;
    catQuestions.forEach((q) => {
      max += 100;
      const answer = answers[q.id];
      if (answer) {
        const opt = q.options.find((o) => o.value === answer);
        if (opt) total += opt.score;
      }
    });
    const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
    return { category: cat, label: labels[cat], score: total, maxScore: max, percentage };
  });
}

function getMaturityLevel(score: number): { level: string; description: string } {
  if (score >= 80) return { level: "Voorloper", description: "Uw organisatie loopt voorop op het gebied van ESG. U heeft een sterke basis en bent klaar om verdere impact te maken." };
  if (score >= 60) return { level: "Gevorderd", description: "Uw organisatie heeft goede stappen gezet. Er zijn nog verbeterpunten, maar het fundament staat." };
  if (score >= 40) return { level: "Ontwikkelend", description: "Uw organisatie is op weg, maar er liggen nog significante kansen om ESG structureler aan te pakken." };
  if (score >= 20) return { level: "Startend", description: "Er is beperkt zicht op ESG-impact. Het is raadzaam om snel inzicht te krijgen in verplichtingen en kansen." };
  return { level: "Onbekend terrein", description: "ESG staat nog niet op de agenda. Er liggen waarschijnlijk urgente aandachtspunten die directe actie vereisen." };
}

function getRisks(answers: Record<string, string>, employeeCount: string): string[] {
  const risks: string[] = [];
  const envQ = questions.filter((q) => q.category === "environment");
  const envScore = envQ.reduce((sum, q) => {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    return sum + (opt?.score || 0);
  }, 0) / (envQ.length * 100) * 100;

  if (envScore < 30) risks.push("Onvoldoende inzicht in milieu-impact kan leiden tot non-compliance met toekomstige wetgeving en reputatierisico.");
  if (!answers.env_1 || answers.env_1 === "none") risks.push("Zonder CO₂-inzicht kunt u niet voldoen aan toenemende rapportageverplichtingen vanuit de keten.");
  if (!answers.gov_4 || answers.gov_4 === "none" || answers.gov_4 === "basic") risks.push("Onvoldoende kennis van ESG-verplichtingen vergroot het risico op boetes en gemiste commerciële kansen.");
  if (!answers.soc_3 || answers.soc_3 === "none" || answers.soc_3 === "aware") risks.push("Ketenverantwoordelijkheid wordt steeds vaker geëist door opdrachtgevers en wetgeving (CSDDD).");
  if (employeeCount === "250+") risks.push("Organisaties met 250+ medewerkers vallen mogelijk onder directe CSRD-rapportageverplichtingen.");

  return risks.length > 0 ? risks : ["Op basis van uw antwoorden zijn er geen acute risico's geïdentificeerd, maar blijf de ontwikkelingen volgen."];
}

function getOpportunities(answers: Record<string, string>, categoryScores: CategoryScore[]): string[] {
  const opps: string[] = [];
  const envScore = categoryScores.find((c) => c.category === "environment")?.percentage || 0;
  const socScore = categoryScores.find((c) => c.category === "social")?.percentage || 0;

  if (envScore >= 50) opps.push("Uw milieubewustzijn biedt kansen voor commerciële positionering bij duurzaamheidsbewuste klanten.");
  if (envScore < 40) opps.push("Quick wins op het gebied van energie en afval kunnen direct kosten besparen en uw profiel versterken.");
  if (socScore >= 50) opps.push("Sterk sociaal beleid draagt bij aan talentretentie en employer branding.");
  opps.push("Een ESG-strategie versterkt uw positie bij aanbestedingen en ketenpartners die steeds vaker hierop selecteren.");

  return opps;
}

function getPriorities(answers: Record<string, string>, categoryScores: CategoryScore[]): string[] {
  const prios: string[] = [];
  const sorted = [...categoryScores].sort((a, b) => a.percentage - b.percentage);

  if (sorted[0].percentage < 40) {
    prios.push(`Focus eerst op ${sorted[0].label}: dit is uw zwakste ESG-pijler en verdient directe aandacht.`);
  }

  if (!answers.env_1 || answers.env_1 === "none" || answers.env_1 === "basic") {
    prios.push("Breng uw CO₂-uitstoot in kaart — dit is de basis voor elke ESG-rapportage.");
  }
  if (!answers.gov_1 || answers.gov_1 === "none" || answers.gov_1 === "informal") {
    prios.push("Veranker ESG in uw strategie: wijs een verantwoordelijke aan en stel concrete doelen.");
  }
  if (!answers.gov_2 || answers.gov_2 === "none" || answers.gov_2 === "informal") {
    prios.push("Start met gestructureerde ESG-rapportage, ook al is het nog niet verplicht — uw keten verwacht dit steeds vaker.");
  }

  return prios.length > 0 ? prios : ["U bent goed op weg. Overweeg een verdiepende analyse om uw voorsprong te benutten."];
}

function getFrameworks(answers: Record<string, string>, employeeCount: string, sector: string): ESGReport["frameworks"] {
  const isLarge = employeeCount === "250+";
  const isPublic = sector === "Overheid & Publiek";
  const hasReporting = answers.gov_2 === "framework" || answers.gov_2 === "formal";

  return [
    {
      name: "CSRD",
      applicable: isLarge,
      reason: isLarge ? "Met 250+ medewerkers valt u mogelijk onder de CSRD-rapportageplicht." : "U valt waarschijnlijk (nog) niet onder directe CSRD-verplichtingen, maar keteneffecten zijn mogelijk."
    },
    {
      name: "VSME",
      applicable: !isLarge,
      reason: !isLarge ? "De VSME-standaard is ontwikkeld als vrijwillig rapportageformat voor MKB-organisaties." : "VSME is primair bedoeld voor het MKB; voor uw omvang is CSRD relevanter."
    },
    {
      name: "Ecovadis",
      applicable: true,
      reason: "Ecovadis wordt steeds vaker gevraagd door opdrachtgevers als bewijs van duurzaamheidsprestaties."
    },
    {
      name: "SBTi",
      applicable: answers.env_1 === "targets" || answers.env_1 === "measured",
      reason: answers.env_1 === "targets" || answers.env_1 === "measured" ? "U heeft al CO₂-inzicht; SBTi kan helpen om wetenschappelijk onderbouwde doelen te stellen." : "Start eerst met CO₂-meting voordat SBTi relevant wordt."
    },
    {
      name: "GRI",
      applicable: hasReporting || isLarge,
      reason: hasReporting ? "GRI-standaarden bieden een solide basis voor gestructureerde duurzaamheidsrapportage." : "GRI wordt relevant zodra u start met formele rapportage."
    },
  ];
}

export function calculateReport(scanData: ScanAnswers): ESGReport {
  const categoryScores = getCategoryScores(scanData.answers);
  const overallScore = Math.round(categoryScores.reduce((s, c) => s + c.percentage, 0) / categoryScores.length);
  const { level, description } = getMaturityLevel(overallScore);

  return {
    overallScore,
    maturityLevel: level,
    maturityDescription: description,
    categoryScores,
    risks: getRisks(scanData.answers, scanData.employeeCount),
    opportunities: getOpportunities(scanData.answers, categoryScores),
    priorities: getPriorities(scanData.answers, categoryScores),
    frameworks: getFrameworks(scanData.answers, scanData.employeeCount, scanData.sector),
  };
}
