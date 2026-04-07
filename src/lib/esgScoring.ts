import { questions, getThemes, type ScanAnswers } from "./esgQuestions";

export interface CategoryScore {
  category: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface FrameworkAssessment {
  name: string;
  fullName: string;
  type: "wetgeving" | "standaard" | "rating" | "framework" | "richtlijn";
  status: "verplicht" | "waarschijnlijk relevant" | "aanbevolen" | "nog niet van toepassing" | "vrijwillig";
  applicable: boolean;
  reason: string;
  actionRequired?: string;
}

export interface ESGReport {
  overallScore: number;
  maturityLevel: string;
  maturityDescription: string;
  categoryScores: CategoryScore[];
  risks: string[];
  opportunities: string[];
  priorities: string[];
  frameworks: FrameworkAssessment[];
}

function getThemeScores(answers: Record<string, string>): CategoryScore[] {
  const themes = getThemes();
  return themes.map((theme) => {
    const themeQuestions = questions.filter((q) => q.theme === theme);
    let total = 0;
    let max = 0;
    themeQuestions.forEach((q) => {
      const maxOpt = Math.max(...q.options.map((o) => o.score));
      max += maxOpt;
      const answer = answers[q.id];
      if (answer) {
        const opt = q.options.find((o) => o.value === answer);
        if (opt) total += opt.score;
      }
    });
    const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
    return { category: theme, label: theme, score: total, maxScore: max, percentage };
  });
}

function getMaturityLevel(score: number): { level: string; description: string } {
  if (score >= 80) return { level: "Voorloper", description: "Uw organisatie loopt voorop op het gebied van ESG. U heeft een sterke basis en bent klaar om verdere impact te maken en een concurrentievoordeel te benutten." };
  if (score >= 60) return { level: "Gevorderd", description: "Uw organisatie heeft goede stappen gezet. Er zijn nog verbeterpunten, maar het fundament staat. Focus op het formaliseren en verdiepen van uw aanpak." };
  if (score >= 40) return { level: "Ontwikkelend", description: "Uw organisatie is op weg, maar er liggen nog significante kansen om ESG structureler aan te pakken. Een gerichte aanpak kan snel resultaat opleveren." };
  if (score >= 20) return { level: "Startend", description: "Er is beperkt zicht op ESG-impact. Het is raadzaam om snel inzicht te krijgen in verplichtingen en kansen, voordat u door klanten of wetgeving wordt ingehaald." };
  return { level: "Onbekend terrein", description: "ESG staat nog niet op de agenda. Er liggen waarschijnlijk urgente aandachtspunten die directe actie vereisen. Begin met het in kaart brengen van uw verplichtingen." };
}

function getRisks(answers: Record<string, string>, employeeCount: string, revenue: string, sector: string): string[] {
  const risks: string[] = [];
  const isLarge = employeeCount === "250-500" || employeeCount === "500+";
  const isHighRevenue = revenue === "€50 - €150 miljoen" || revenue === "> €150 miljoen";

  if (!answers.env_1 || answers.env_1 === "none" || answers.env_1 === "basic") {
    risks.push("Zonder CO₂-inzicht kunt u niet voldoen aan toenemende rapportageverplichtingen vanuit de keten en wetgeving.");
  }
  if (!answers.strat_3 || answers.strat_3 === "none" || answers.strat_3 === "basic") {
    risks.push("Onvoldoende kennis van ESG-verplichtingen vergroot het risico op boetes, gemiste aanbestedingen en commerciële kansen.");
  }
  if (!answers.chain_2 || answers.chain_2 === "none" || answers.chain_2 === "aware") {
    risks.push("Ketenverantwoordelijkheid wordt steeds vaker geëist door opdrachtgevers en wetgeving (CSDDD/CS3D). Zonder due diligence loopt u risico.");
  }
  if (isLarge || isHighRevenue) {
    risks.push("Op basis van uw omvang valt uw organisatie mogelijk onder directe CSRD-rapportageverplichtingen of wordt u via de keten geraakt.");
  }
  if (answers.chain_3 === "regular" || answers.chain_3 === "mandatory") {
    if (!answers.gov_1 || answers.gov_1 === "none" || answers.gov_1 === "informal") {
      risks.push("Klanten vragen om duurzaamheidsprestaties, maar u rapporteert hier niet formeel over. Dit kan leiden tot verlies van opdrachten.");
    }
  }
  if (!answers.gov_4 || answers.gov_4 === "none") {
    if (employeeCount !== "1-10") {
      risks.push("Organisaties met 50+ medewerkers zijn verplicht een klokkenluidersregeling te hebben (Wet bescherming klokkenluiders).");
    }
  }
  if (!answers.risk_1 || answers.risk_1 === "none") {
    risks.push("Zonder ESG-risico-inventarisatie kunt u niet anticiperen op klimaat-, reputatie- en transitierisico's.");
  }
  if (answers.risk_3 === "requirements" || answers.risk_3 === "mentioned") {
    risks.push("Financiers stellen ESG-eisen. Zonder adequate ESG-prestaties kan dit impact hebben op uw financieringsvoorwaarden.");
  }
  if (sector === "Bouw & Infrastructuur" || sector === "Productie & Industrie" || sector === "Energie & Utilities") {
    risks.push("Uw sector kent relatief hoge milieu-impact en daarmee toenemende regeldruk. Vroegtijdig handelen is essentieel.");
  }

  return risks.length > 0 ? risks.slice(0, 6) : ["Op basis van uw antwoorden zijn er geen acute risico's geïdentificeerd, maar blijf de ontwikkelingen actief volgen."];
}

function getOpportunities(answers: Record<string, string>, categoryScores: CategoryScore[]): string[] {
  const opps: string[] = [];
  const envScore = categoryScores.find((c) => c.category === "Milieu & Klimaat")?.percentage || 0;
  const socScore = categoryScores.find((c) => c.category === "Mensen & Sociaal")?.percentage || 0;
  const stratScore = categoryScores.find((c) => c.category === "Strategie & Bewustzijn")?.percentage || 0;

  if (envScore >= 50) opps.push("Uw milieubewustzijn biedt kansen voor commerciële positionering bij duurzaamheidsbewuste klanten en aanbestedingen.");
  if (envScore < 40) opps.push("Quick wins op het gebied van energie en afval kunnen direct kosten besparen en uw profiel versterken.");
  if (socScore >= 50) opps.push("Sterk sociaal beleid draagt bij aan talentretentie, employer branding en aantrekkelijkheid voor nieuwe medewerkers.");
  if (stratScore >= 60) opps.push("Uw strategische bewustzijn geeft een voorsprong. Formaliseer dit om het als concurrentievoordeel in te zetten.");
  opps.push("Een ESG-strategie versterkt uw positie bij aanbestedingen en ketenpartners die steeds vaker hierop selecteren.");
  if (answers.risk_2 === "steps" || answers.risk_2 === "plan") {
    opps.push("Uw voortgang in de energietransitie kan dienen als unique selling point en kosten op termijn verlagen.");
  }

  return opps.slice(0, 5);
}

function getPriorities(answers: Record<string, string>, categoryScores: CategoryScore[]): string[] {
  const prios: string[] = [];
  const sorted = [...categoryScores].sort((a, b) => a.percentage - b.percentage);

  if (sorted[0].percentage < 40) {
    prios.push(`Focus eerst op "${sorted[0].label}": dit is uw zwakste thema en verdient directe aandacht.`);
  }
  if (sorted.length > 1 && sorted[1].percentage < 40) {
    prios.push(`Besteed ook aandacht aan "${sorted[1].label}" — hier liggen eveneens verbeterkansen.`);
  }

  if (!answers.env_1 || answers.env_1 === "none" || answers.env_1 === "basic") {
    prios.push("Breng uw CO₂-uitstoot in kaart (minimaal scope 1 & 2) — dit is de basis voor elke ESG-rapportage.");
  }
  if (!answers.strat_1 || answers.strat_1 === "none" || answers.strat_1 === "informal") {
    prios.push("Veranker ESG in uw strategie: wijs een verantwoordelijke aan en stel concrete doelen.");
  }
  if (!answers.gov_1 || answers.gov_1 === "none" || answers.gov_1 === "informal") {
    prios.push("Start met gestructureerde ESG-rapportage — uw keten en financiers verwachten dit steeds vaker.");
  }
  if (!answers.strat_2 || answers.strat_2 === "none" || answers.strat_2 === "aware") {
    prios.push("Voer een materialiteitsanalyse uit om te bepalen welke ESG-thema's voor uw organisatie het meest relevant zijn.");
  }
  if (!answers.risk_1 || answers.risk_1 === "none") {
    prios.push("Maak een ESG-risico-inventarisatie — dit helpt bij strategische besluitvorming en verantwoording.");
  }

  return prios.length > 0 ? prios.slice(0, 5) : ["U bent goed op weg. Overweeg een verdiepende analyse om uw voorsprong te benutten."];
}

function getFrameworks(answers: Record<string, string>, employeeCount: string, revenue: string, sector: string): FrameworkAssessment[] {
  const isLarge = employeeCount === "250-500" || employeeCount === "500+";
  const isVeryLarge = employeeCount === "500+";
  const isHighRevenue = revenue === "€50 - €150 miljoen" || revenue === "> €150 miljoen";
  const isMidRevenue = revenue === "€10 - €50 miljoen";
  const isMKB = !isLarge && !isHighRevenue;
  const isPublic = sector === "Overheid & Publiek";
  const isFinancial = sector === "Financiële dienstverlening";
  const hasReporting = answers.gov_1 === "framework" || answers.gov_1 === "formal";
  const hasCO2 = answers.env_1 === "scope12" || answers.env_1 === "scope123" || answers.env_1 === "targets";
  const hasChainPressure = answers.chain_3 === "regular" || answers.chain_3 === "mandatory";
  const hasScope3 = answers.env_1 === "scope123" || answers.env_1 === "targets";

  const frameworks: FrameworkAssessment[] = [
    // --- Wetgeving ---
    {
      name: "CSRD",
      fullName: "Corporate Sustainability Reporting Directive",
      type: "wetgeving",
      status: (isLarge || isHighRevenue) ? "verplicht" : (isMidRevenue || hasChainPressure) ? "waarschijnlijk relevant" : "nog niet van toepassing",
      applicable: isLarge || isHighRevenue,
      reason: (isLarge || isHighRevenue)
        ? "Op basis van uw omvang en/of omzet valt u waarschijnlijk onder de CSRD-rapportageplicht (gefaseerde invoering 2024-2026)."
        : isMidRevenue
        ? "U valt mogelijk niet onder directe CSRD-verplichtingen, maar uw omvang maakt het waarschijnlijk dat ketenpartners u om data vragen."
        : "U valt waarschijnlijk (nog) niet onder directe CSRD-verplichtingen, maar keteneffecten zijn mogelijk. Bereid u alvast voor.",
      actionRequired: (isLarge || isHighRevenue) ? "Verplichte rapportage conform ESRS. Start met gap-analyse en data-inventarisatie." : undefined,
    },
    {
      name: "ESRS",
      fullName: "European Sustainability Reporting Standards",
      type: "standaard",
      status: (isLarge || isHighRevenue) ? "verplicht" : "nog niet van toepassing",
      applicable: isLarge || isHighRevenue,
      reason: (isLarge || isHighRevenue)
        ? "ESRS zijn de verplichte rapportagestandaarden onder de CSRD. U dient conform deze standaarden te rapporteren."
        : "ESRS wordt verplicht onder CSRD. Voor MKB is de VSME-variant ontwikkeld als vrijwillig alternatief.",
      actionRequired: (isLarge || isHighRevenue) ? "Implementeer rapportage conform de relevante ESRS-standaarden (E1-E5, S1-S4, G1)." : undefined,
    },
    {
      name: "CSDDD / CS3D",
      fullName: "Corporate Sustainability Due Diligence Directive",
      type: "wetgeving",
      status: isVeryLarge && isHighRevenue ? "waarschijnlijk relevant" : "nog niet van toepassing",
      applicable: isVeryLarge && isHighRevenue,
      reason: isVeryLarge && isHighRevenue
        ? "De CSDDD verplicht grote ondernemingen tot due diligence op mensenrechten en milieu in de waardeketen. Op basis van uw omvang bent u mogelijk in scope."
        : "De CSDDD is primair gericht op grote ondernemingen (1000+ fte, >€450M omzet). U valt hier waarschijnlijk (nog) niet onder, maar keteneffecten zijn mogelijk.",
      actionRequired: isVeryLarge && isHighRevenue ? "Start met het in kaart brengen van uw due diligence-verplichtingen in de waardeketen." : undefined,
    },
    {
      name: "EU Taxonomie",
      fullName: "EU Taxonomy for Sustainable Activities",
      type: "wetgeving",
      status: (isLarge || isHighRevenue) ? "waarschijnlijk relevant" : isFinancial ? "verplicht" : "nog niet van toepassing",
      applicable: isLarge || isHighRevenue || isFinancial,
      reason: isFinancial
        ? "Financiële instellingen moeten rapporteren over het aandeel taxonomie-conforme activiteiten in hun portefeuille."
        : (isLarge || isHighRevenue)
        ? "Onder de CSRD moet u rapporteren welk deel van uw activiteiten bijdraagt aan de EU-klimaatdoelen (taxonomy alignment)."
        : "De EU Taxonomie is primair relevant voor grote/beursgenoteerde bedrijven en financiële instellingen. Indirect kunt u wel om data gevraagd worden.",
    },
    {
      name: "Wet bescherming klokkenluiders",
      fullName: "Wet bescherming klokkenluiders (NL)",
      type: "wetgeving",
      status: (employeeCount !== "1-10" && employeeCount !== "11-50") ? "verplicht" : employeeCount === "11-50" ? "aanbevolen" : "nog niet van toepassing",
      applicable: employeeCount !== "1-10",
      reason: employeeCount !== "1-10" && employeeCount !== "11-50"
        ? "Organisaties met 50+ medewerkers zijn verplicht een interne meldregeling in te richten."
        : "Hoewel niet verplicht voor uw omvang, is een meldregeling een goede praktijk die bijdraagt aan compliance en vertrouwen.",
    },
    {
      name: "CBAM",
      fullName: "Carbon Border Adjustment Mechanism",
      type: "wetgeving",
      status: (sector === "Productie & Industrie" || sector === "Energie & Utilities") ? "waarschijnlijk relevant" : "nog niet van toepassing",
      applicable: sector === "Productie & Industrie" || sector === "Energie & Utilities",
      reason: (sector === "Productie & Industrie" || sector === "Energie & Utilities")
        ? "CBAM legt een CO₂-heffing op geïmporteerde goederen (staal, cement, aluminium, etc.). Dit kan impact hebben op uw kosten en supply chain."
        : "CBAM is primair relevant voor importeurs van specifieke producten (ijzer, staal, cement, aluminium, kunstmest, elektriciteit).",
    },
    // --- Standaarden & Frameworks ---
    {
      name: "VSME",
      fullName: "Voluntary SME Standard (EFRAG)",
      type: "standaard",
      status: isMKB ? "aanbevolen" : "nog niet van toepassing",
      applicable: isMKB,
      reason: isMKB
        ? "De VSME-standaard is specifiek ontwikkeld als vrijwillig en proportioneel rapportageformat voor MKB-organisaties."
        : "VSME is primair bedoeld voor het MKB. Voor uw omvang is ESRS/CSRD waarschijnlijk relevanter.",
      actionRequired: isMKB && hasChainPressure ? "Overweeg VSME als basis voor uw eerste duurzaamheidsrapportage richting ketenpartners." : undefined,
    },
    {
      name: "GRI",
      fullName: "Global Reporting Initiative Standards",
      type: "framework",
      status: hasReporting || isLarge ? "aanbevolen" : "vrijwillig",
      applicable: hasReporting || isLarge,
      reason: hasReporting
        ? "GRI-standaarden bieden een internationaal erkende basis voor duurzaamheidsrapportage en zijn compatibel met ESRS."
        : "GRI is het meest gebruikte rapportageframework wereldwijd. Relevant zodra u start met formele rapportage.",
    },
    {
      name: "SBTi",
      fullName: "Science Based Targets initiative",
      type: "framework",
      status: hasCO2 ? "aanbevolen" : "vrijwillig",
      applicable: hasCO2,
      reason: hasCO2
        ? "U heeft al CO₂-inzicht. SBTi helpt om wetenschappelijk onderbouwde reductiedoelen te stellen in lijn met het Klimaatakkoord van Parijs."
        : "SBTi wordt relevant zodra u CO₂-uitstoot heeft gemeten. Start eerst met een carbon footprint-berekening.",
      actionRequired: hasScope3 ? "U kunt overwegen SBTi-doelstellingen te committeren voor scope 1, 2 en 3." : undefined,
    },
    {
      name: "CDP",
      fullName: "Carbon Disclosure Project",
      type: "rating",
      status: (isLarge || hasChainPressure) ? "aanbevolen" : "vrijwillig",
      applicable: isLarge || hasChainPressure,
      reason: (isLarge || hasChainPressure)
        ? "CDP-disclosure wordt steeds vaker gevraagd door investeerders en grote opdrachtgevers. Het biedt een gestandaardiseerde manier om klimaatdata te delen."
        : "CDP is met name relevant voor grotere organisaties of bij druk vanuit de keten. Nog niet urgent voor uw situatie.",
    },
    {
      name: "Ecovadis",
      fullName: "Ecovadis Sustainability Rating",
      type: "rating",
      status: hasChainPressure ? "waarschijnlijk relevant" : "aanbevolen",
      applicable: true,
      reason: hasChainPressure
        ? "Ecovadis wordt veelvuldig gevraagd door opdrachtgevers als bewijs van duurzaamheidsprestaties. Gezien de ketendruk die u ervaart, is dit sterk aanbevolen."
        : "Ecovadis is het meest gebruikte duurzaamheidsplatform in supply chains. Een goede score versterkt uw commerciële positie.",
      actionRequired: hasChainPressure ? "Overweeg een Ecovadis-assessment te starten om uw rating te laten vaststellen." : undefined,
    },
    {
      name: "ISO 14001",
      fullName: "ISO 14001 — Milieumanagementsysteem",
      type: "standaard",
      status: (sector === "Productie & Industrie" || sector === "Bouw & Infrastructuur") ? "aanbevolen" : "vrijwillig",
      applicable: sector === "Productie & Industrie" || sector === "Bouw & Infrastructuur" || sector === "Energie & Utilities",
      reason: (sector === "Productie & Industrie" || sector === "Bouw & Infrastructuur")
        ? "ISO 14001 is in uw sector een breed erkende standaard die steeds vaker gevraagd wordt bij aanbestedingen."
        : "ISO 14001 biedt een systematische aanpak voor milieumanagement. Relevant als klanten of aanbestedingen hierom vragen.",
    },
    {
      name: "ISO 26000",
      fullName: "ISO 26000 — Richtlijn MVO",
      type: "richtlijn",
      status: "vrijwillig",
      applicable: false,
      reason: "ISO 26000 is een richtlijn (geen certificeerbare norm) die houvast biedt bij het vormgeven van maatschappelijk verantwoord ondernemen.",
    },
    {
      name: "CO₂-Prestatieladder",
      fullName: "CO₂-Prestatieladder (SKAO)",
      type: "standaard",
      status: (sector === "Bouw & Infrastructuur" || sector === "Transport & Logistiek" || isPublic) ? "waarschijnlijk relevant" : "vrijwillig",
      applicable: sector === "Bouw & Infrastructuur" || sector === "Transport & Logistiek" || isPublic,
      reason: (sector === "Bouw & Infrastructuur" || sector === "Transport & Logistiek")
        ? "De CO₂-Prestatieladder wordt in uw sector veelvuldig gevraagd bij aanbestedingen en levert gunningsvoordeel op."
        : isPublic
        ? "De CO₂-Prestatieladder wordt door veel overheden als criterium gehanteerd bij aanbestedingen."
        : "De CO₂-Prestatieladder is met name relevant in de bouw, infra en GWW-sector. Kan gunningsvoordeel opleveren.",
    },
    {
      name: "TCFD / TNFD",
      fullName: "Task Force on Climate/Nature-related Financial Disclosures",
      type: "framework",
      status: isLarge || isFinancial ? "aanbevolen" : "vrijwillig",
      applicable: isLarge || isFinancial,
      reason: isFinancial
        ? "TCFD/TNFD-rapportage wordt steeds meer verwacht van financiële instellingen voor klimaat- en natuurgerelateerde risico's."
        : isLarge
        ? "TCFD/TNFD biedt een framework om klimaat- en natuurgerelateerde financiële risico's en kansen te rapporteren."
        : "TCFD/TNFD is primair relevant voor grotere organisaties en financiële instellingen.",
    },
    {
      name: "UN SDGs",
      fullName: "United Nations Sustainable Development Goals",
      type: "framework",
      status: "vrijwillig",
      applicable: true,
      reason: "De SDGs bieden een universeel kader om uw bijdrage aan mondiale duurzaamheidsdoelen te positioneren. Veel organisaties gebruiken dit voor communicatie en strategie.",
    },
    {
      name: "EED / EBO",
      fullName: "Europese Energie-Efficiency Richtlijn / Energiebesparingsplicht",
      type: "wetgeving",
      status: (employeeCount !== "1-10") ? "waarschijnlijk relevant" : "nog niet van toepassing",
      applicable: employeeCount !== "1-10",
      reason: employeeCount !== "1-10"
        ? "De energiebesparingsplicht verplicht bedrijven om alle energiebesparende maatregelen met een terugverdientijd van ≤5 jaar te treffen en hierover te rapporteren."
        : "De energiebesparingsplicht is primair relevant voor grotere energiegebruikers.",
      actionRequired: (employeeCount !== "1-10") ? "Controleer of u een energiebesparingsplicht heeft en of u uw informatie- en rapportageplicht nakomt." : undefined,
    },
    {
      name: "SFDR",
      fullName: "Sustainable Finance Disclosure Regulation",
      type: "wetgeving",
      status: isFinancial ? "verplicht" : "nog niet van toepassing",
      applicable: isFinancial,
      reason: isFinancial
        ? "De SFDR verplicht financiële marktdeelnemers om te rapporteren over duurzaamheidsrisico's en -impact van beleggingsproducten."
        : "SFDR is specifiek gericht op financiële instellingen. Niet direct relevant voor uw organisatie.",
    },
  ];

  // Sort: verplicht first, then relevant, then aanbevolen, then rest
  const statusOrder: Record<string, number> = {
    "verplicht": 0,
    "waarschijnlijk relevant": 1,
    "aanbevolen": 2,
    "vrijwillig": 3,
    "nog niet van toepassing": 4,
  };
  frameworks.sort((a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5));

  return frameworks;
}

export function calculateReport(scanData: ScanAnswers): ESGReport {
  const categoryScores = getThemeScores(scanData.answers);
  const overallScore = Math.round(categoryScores.reduce((s, c) => s + c.percentage, 0) / categoryScores.length);
  const { level, description } = getMaturityLevel(overallScore);

  return {
    overallScore,
    maturityLevel: level,
    maturityDescription: description,
    categoryScores,
    risks: getRisks(scanData.answers, scanData.employeeCount, scanData.revenue, scanData.sector),
    opportunities: getOpportunities(scanData.answers, categoryScores),
    priorities: getPriorities(scanData.answers, categoryScores),
    frameworks: getFrameworks(scanData.answers, scanData.employeeCount, scanData.revenue, scanData.sector),
  };
}
