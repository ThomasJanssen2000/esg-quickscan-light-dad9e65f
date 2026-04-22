import jsPDF from "jspdf";
import "jspdf-autotable";
import type { ESGReport, ContactInfo, ScoredTopic } from "./esgEngine";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// Canonieke Act Right brand colors (RGB) — zie
// .claude/skills/act-right-huisstijl/SKILL.md voor rationale.
// Afgeleid uit het officiele brandbook en gevalideerd tegen Office-theme.
const PRIMARY      = [44, 48, 28]   as const; // Resilient Moss #2C301C
const PRIMARY_LIGHT = [67, 75, 43]  as const; // Moss Dark #434B2B
const ACCENT       = [228, 230, 95] as const; // Adaptive Lime #E4E65F
const ACCENT_DARK  = [145, 147, 54] as const; // Lime Dark #919336 voor tekst-contrast op licht
const TEXT         = [35, 31, 32]   as const; // Moss Near-Black #231F20
const MUTED        = [160, 175, 117] as const; // Sage #A0AF75
const SOFT_BG      = [255, 254, 246] as const; // Pure Light #FFFEF6
const CREAM_DEEP   = [249, 250, 222] as const; // Lime-cream #F9FADE, accent-block background
const BORDER       = [218, 220, 205] as const; // Subtiele moss-cream border (berekend)
// Status-kleuren alleen nog voor echte errors; uit brand afgeleid waar mogelijk.
const RED          = [198, 60, 60]  as const;
const AMBER        = [145, 147, 54] as const; // Herleid naar lime-dark ipv feloranje
const BLUE         = [160, 175, 117] as const; // Herleid naar sage ipv fel blauw

export function generateESGPdf(report: ESGReport, contact: ContactInfo): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18; // margin
  const CW = W - M * 2;

  // ============= COVER =============
  // Brandbook-stijl: moss-bg met lime-blok onderin waarin de titel staat.
  // Zie .claude/skills/act-right-huisstijl/assets/act-right-brandbook.pdf
  // pagina 17 ("CSRD 2025 Top Taste") voor het referentie-patroon.

  // Basis: volledige moss-achtergrond.
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, H, "F");

  // Lime kleur-blok in onderste 35% — dit is waar titel + company komen.
  const blockTop = H * 0.62;
  doc.setFillColor(...ACCENT);
  doc.rect(0, blockTop, W, H - blockTop, "F");

  // Logo/wordmark links bovenin: lime + cream voor inverted variant.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...ACCENT);
  doc.text("act", M, 24);
  doc.setTextColor(255, 254, 246); // Pure Light
  doc.text("right", M + 10, 24); // vervolg van wordmark in cream
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 254, 246);
  doc.text("for a better future", M, 30);

  // Report eyebrow iets onder het midden, in cream boven de lime-blok.
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ACCENT);
  doc.text("ESG QUICKSCAN LIGHT", M, blockTop - 30);

  // Titel in cream boven de lime-blok
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(255, 254, 246);
  doc.text("Uw persoonlijke", M, blockTop - 15);
  doc.text("ESG-rapport.", M, blockTop - 2);

  // Binnen het lime-blok: company name + profiel in moss.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...PRIMARY);
  doc.text(contact.companyName, M, blockTop + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY);
  doc.text(report.profileType, M, blockTop + 28);

  // Recipient + datum onderin het lime-blok, in moss.
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY);
  doc.text(
    `Opgesteld voor: ${contact.firstName} ${contact.lastName}`,
    M,
    H - 20
  );
  doc.text(
    `Datum: ${new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`,
    W - M,
    H - 20,
    { align: "right" }
  );

  // Kleine taglijn-footer bovenaan het lime-blok — hairline in moss.
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.3);
  doc.line(M, blockTop + 38, W - M, blockTop + 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PRIMARY);
  doc.text(
    "act responsible   ·   act win-win   ·   act now",
    M,
    blockTop + 45
  );
  doc.text("www.actright.nl", W - M, blockTop + 45, { align: "right" });

  // ============= PAGE 2 — SAMENVATTING =============
  doc.addPage();
  let y = pageHeader(doc, "Samenvatting");

  y = drawEyebrow(doc, "01 · Uw ESG-profiel", y, M);
  y = drawHeading(doc, "Wat dit rapport u vertelt", y, M, CW);
  y += 4;
  y = drawBody(doc, report.summary, y, M, CW);
  y += 8;

  // Maturity card
  doc.setFillColor(...SOFT_BG);
  doc.roundedRect(M, y, CW, 38, 3, 3, "F");
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(M, y, M, y + 38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("VOLWASSENHEIDSLABEL", M + 6, y + 8);
  doc.setFontSize(18);
  doc.setTextColor(...PRIMARY);
  doc.text(report.maturityLabel, M + 6, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  const matLines = doc.splitTextToSize(report.maturityExplanation, CW - 12);
  doc.text(matLines, M + 6, y + 26);
  y += 48;

  // Disclaimer box: zichtbaar maken dat het rapport indicatief is.
  const discHeight = 38;
  doc.setFillColor(245, 243, 234); // zachte cream-tint, afwijkend van maturity-card
  doc.roundedRect(M, y, CW, discHeight, 3, 3, "F");
  doc.setDrawColor(...ACCENT_DARK);
  doc.setLineWidth(0.6);
  doc.line(M, y, M, y + discHeight);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT_DARK);
  doc.text("LET OP · INDICATIEF RAPPORT", M + 6, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  const discLines = doc.splitTextToSize(
    "Dit rapport is een indicatieve inschatting op basis van de 20 antwoorden die u heeft gegeven " +
      "en is géén juridisch advies. Wettelijke drempels voor onderwerpen als CSRD, CSDDD, EU-ETS of " +
      "energiebesparingsplicht hangen vaak af van details die een korte scan niet volledig kan uitvragen. " +
      "Act Right adviseert om de toepasselijkheid van de genoemde onderwerpen zelf te verifiëren " +
      "of met ons te bespreken voordat u compliance- of investeringsbesluiten neemt.",
    CW - 12
  );
  doc.text(discLines, M + 6, y + 14);
  y += discHeight + 10;

  // Theme scores
  y = drawEyebrow(doc, "02 · Actieve thema's", y, M);
  y = drawHeading(doc, "Welke ESG-thema's spelen voor u?", y, M, CW);
  y += 4;

  const activeThemes = report.themeScores.filter(t => t.active).slice(0, 6);
  activeThemes.forEach(t => {
    if (y > H - 30) { doc.addPage(); y = pageHeader(doc, "Samenvatting (vervolg)"); }
    const barWidth = Math.min(80, t.score * 8);
    doc.setFillColor(...ACCENT);
    doc.rect(M, y, barWidth, 2, "F");
    doc.setFillColor(...BORDER);
    doc.rect(M + barWidth, y, 80 - barWidth, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PRIMARY);
    doc.text(t.theme.name, M + 86, y + 2);
    y += 9;
  });

  // ============= PAGE 3+ — NU RELEVANT =============
  doc.addPage();
  y = pageHeader(doc, "Wat nu relevant is");
  y = drawEyebrow(doc, "Direct relevant · begin hier", y, M);
  y = drawHeading(doc, `Top ${report.nuRelevant.length} aandachtspunten`, y, M, CW);
  y += 6;

  if (report.nuRelevant.length === 0) {
    y = drawBody(doc, "Op basis van uw antwoorden zien wij momenteel geen ESG-onderwerpen die directe actie vereisen.", y, M, CW);
  } else {
    for (let i = 0; i < report.nuRelevant.length; i++) {
      y = drawTopicBlock(doc, report.nuRelevant[i], i + 1, y, M, CW, H);
    }
  }

  // ============= BINNENKORT RELEVANT =============
  if (report.binnenkortRelevant.length > 0) {
    doc.addPage();
    y = pageHeader(doc, "Wat binnenkort relevant wordt");
    y = drawEyebrow(doc, "Op de horizon · bereid u voor", y, M);
    y = drawHeading(doc, "Onderwerpen voor de komende 1-3 jaar", y, M, CW);
    y += 6;

    for (let i = 0; i < report.binnenkortRelevant.length; i++) {
      y = drawTopicBlock(doc, report.binnenkortRelevant[i], i + 1, y, M, CW, H);
    }
  }

  // ============= GEEN PRIORITEIT =============
  if (report.geenPrioriteit.length > 0) {
    if (y > H - 80) { doc.addPage(); y = pageHeader(doc, "Wat geen prioriteit heeft"); }
    else { y += 8; }
    y = drawEyebrow(doc, "Geen zorg · niet voor u", y, M);
    y = drawHeading(doc, "Wat nu geen prioriteit heeft", y, M, CW);
    y += 4;
    y = drawBody(doc, "Onderwerpen die vaak overschat worden, maar voor uw organisatie nu niet direct relevant zijn:", y, M, CW);
    y += 4;

    report.geenPrioriteit.forEach(t => {
      if (y > H - 25) { doc.addPage(); y = pageHeader(doc, "Wat geen prioriteit heeft"); }
      doc.setFillColor(...SOFT_BG);
      doc.roundedRect(M, y, CW, 14, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...PRIMARY);
      doc.text("• " + t.topic.subject, M + 4, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      const reasonLines = doc.splitTextToSize(t.reasons[0] || "Niet direct getriggerd door uw antwoorden.", CW - 8);
      doc.text(reasonLines.slice(0, 1), M + 4, y + 11);
      y += 18;
    });
  }

  // ============= ACTIES =============
  doc.addPage();
  y = pageHeader(doc, "Concrete vervolgstappen");
  y = drawEyebrow(doc, "Actie · begin hier", y, M);
  y = drawHeading(doc, "5 acties op maat", y, M, CW);
  y += 4;
  y = drawBody(doc, `Een mix van quick wins, compliance en strategische acties, afgestemd op uw volwassenheidsniveau (${report.maturityLabel.toLowerCase()}).`, y, M, CW);
  y += 8;

  report.acties.forEach((a, i) => {
    if (y > H - 35) { doc.addPage(); y = pageHeader(doc, "Concrete vervolgstappen (vervolg)"); }
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 22, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...ACCENT);
    doc.text(String(i + 1).padStart(2, "0"), M + 6, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT);
    const lines = doc.splitTextToSize(a, CW - 28);
    doc.text(lines, M + 22, y + 8);
    y += 28;
  });

  // ============= LAATSTE PAGINA — CTA =============
  doc.addPage();
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, 60, 4, "F");
  doc.rect(W - 60, H - 4, 60, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ACCENT);
  doc.text("ACT RIGHT", M, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("for a better future", M, 33);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.text("VOLGENDE STAP", M, H / 2 - 30);

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  const ctaLines = doc.splitTextToSize("Klaar voor de volgende stap?", CW);
  doc.text(ctaLines, M, H / 2 - 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...ACCENT);
  doc.text("Plan een gratis ESG Discovery Call met Act Right.", M, H / 2 + 4);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const exp = doc.splitTextToSize("In 30 minuten vertalen wij dit rapport naar een concrete aanpak voor uw organisatie. Geen verplichtingen, geen verkoopgesprek, wel duidelijkheid.", CW - 20);
  doc.text(exp, M, H / 2 + 18);

  // CTA box
  doc.setFillColor(...ACCENT);
  doc.roundedRect(M, H / 2 + 45, 80, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY);
  doc.text("Plan Discovery Call →", M + 40, H / 2 + 54, { align: "center" });

  // Contact footer
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.3);
  doc.line(M, H - 35, W - M, H - 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("www.actright.nl", M, H - 25);
  doc.text("info@actright.nl", M, H - 19);
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text("act responsible · act win-win · act now", W - M, H - 22, { align: "right" });

  // Add page numbers on content pages (skip cover & last page)
  const total = doc.getNumberOfPages();
  for (let p = 2; p < total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${p} / ${total}`, W - M, H - 8, { align: "right" });
    doc.text("ESG Quickscan Light · Act Right", M, H - 8);
  }

  return doc;
}

// ============= Helpers =============
function pageHeader(doc: jsPDF, section: string): number {
  const W = doc.internal.pageSize.getWidth();
  const M = 18;
  doc.setFillColor(...SOFT_BG);
  doc.rect(0, 0, W, 18, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(0, 18, W, 0.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY);
  doc.text("ACT RIGHT · ESG QUICKSCAN", M, 11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(section, W - M, 11, { align: "right" });
  return 32;
}

function drawEyebrow(doc: jsPDF, text: string, y: number, M: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text(text.toUpperCase(), M, y);
  return y + 5;
}

function drawHeading(doc: jsPDF, text: string, y: number, M: number, CW: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...PRIMARY);
  const lines = doc.splitTextToSize(text, CW);
  doc.text(lines, M, y + 8);
  return y + 8 + lines.length * 8;
}

function drawBody(doc: jsPDF, text: string, y: number, M: number, CW: number, size = 10): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...TEXT);
  const lines = doc.splitTextToSize(text, CW);
  doc.text(lines, M, y);
  return y + lines.length * 5;
}

function labelColor(label: string): readonly [number, number, number] {
  if (label === "Nu verplicht") return RED;
  if (label === "Hoog relevant via keten") return PRIMARY;
  if (label === "Marktstandaard / aanbevolen") return PRIMARY_LIGHT;
  if (label === "Sectorspecifiek vervolgonderzoek") return BLUE;
  if (label.startsWith("Monitoren") || label.startsWith("Mogelijk")) return AMBER;
  return MUTED;
}

function drawTopicBlock(doc: jsPDF, item: ScoredTopic, index: number, y: number, M: number, CW: number, H: number): number {
  // Estimate block height
  doc.setFontSize(9);
  const descLines = doc.splitTextToSize(item.topic.description, CW - 10);
  const reasonLines = item.reasons[0] ? doc.splitTextToSize(item.reasons[0], CW - 14) : [];
  const blockH = 22 + descLines.length * 4.5 + (reasonLines.length > 0 ? reasonLines.length * 4.2 + 10 : 0);

  if (y + blockH > H - 20) {
    doc.addPage();
    y = pageHeader(doc, "Onderwerpen (vervolg)");
  }

  // Card background
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, blockH, 2, 2, "FD");

  // Number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...ACCENT);
  doc.text(String(index).padStart(2, "0"), M + 6, y + 11);

  // Title
  doc.setFontSize(13);
  doc.setTextColor(...PRIMARY);
  doc.text(item.topic.subject, M + 22, y + 9);

  // Label badge
  const [lr, lg, lb] = labelColor(item.label);
  doc.setFillColor(lr, lg, lb);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  const labelW = doc.getTextWidth(item.label) + 4;
  doc.roundedRect(M + 22, y + 12, labelW, 4.5, 1, 1, "F");
  doc.text(item.label, M + 24, y + 15.3);

  // Horizon badge
  doc.setFillColor(...SOFT_BG);
  doc.setTextColor(...MUTED);
  const horW = doc.getTextWidth(item.horizon) + 4;
  doc.roundedRect(M + 22 + labelW + 2, y + 12, horW, 4.5, 1, 1, "F");
  doc.text(item.horizon, M + 24 + labelW + 2, y + 15.3);

  // Description
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  doc.text(descLines, M + 5, y + 22);

  // Reason
  if (reasonLines.length > 0) {
    const ry = y + 22 + descLines.length * 4.5 + 4;
    doc.setFillColor(...SOFT_BG);
    doc.rect(M + 5, ry, CW - 10, reasonLines.length * 4.2 + 4, "F");
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.6);
    doc.line(M + 5, ry, M + 5, ry + reasonLines.length * 4.2 + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...PRIMARY);
    doc.text("WAAROM RELEVANT", M + 8, ry + 3.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT);
    doc.text(reasonLines, M + 8, ry + 8);
  }

  return y + blockH + 6;
}
