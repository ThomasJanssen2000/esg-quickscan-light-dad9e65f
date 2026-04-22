import jsPDF from "jspdf";
import "jspdf-autotable";
import type { ESGReport, ContactInfo, ScoredTopic } from "./esgEngine";
import * as FunnelDisplayBold from "@/assets/generated/funnel-display-bold";
import * as FunnelSansLight from "@/assets/generated/funnel-sans-light";
import * as FunnelSansRegular from "@/assets/generated/funnel-sans-regular";
import { logoDataUrl } from "@/assets/generated/actright-logo-base64";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// ============= Canonical Act Right palette (zie skill) =============
const PRIMARY      = [44, 48, 28]    as const; // Resilient Moss #2C301C
const PRIMARY_DARK = [32, 36, 18]    as const; // Diepere moss voor accents
const ACCENT       = [228, 230, 95]  as const; // Adaptive Lime #E4E65F
const ACCENT_DARK  = [145, 147, 54]  as const; // Lime Dark #919336
const TEXT         = [35, 31, 32]    as const; // Moss Near-Black #231F20
const MUTED        = [115, 120, 95]  as const; // Muted moss-olive
const SOFT_BG      = [255, 254, 246] as const; // Pure Light #FFFEF6
const CREAM_DEEP   = [249, 250, 222] as const; // Lime-cream #F9FADE
const SAGE         = [160, 175, 117] as const; // Sage #A0AF75
const BORDER       = [218, 220, 205] as const;

// Font registration names (match base64-module exports)
const FONT_HEADING  = FunnelDisplayBold.jspdfName;   // "FunnelDisplay"
const FONT_BODY     = FunnelSansLight.jspdfName;     // "FunnelSans"
const FONT_BODY_EM  = FunnelSansRegular.jspdfName;   // "FunnelSansRegular"

function registerFonts(doc: jsPDF) {
  doc.addFileToVFS(FunnelDisplayBold.fontFile, FunnelDisplayBold.base64);
  doc.addFont(FunnelDisplayBold.fontFile, FunnelDisplayBold.jspdfName, FunnelDisplayBold.jspdfStyle);
  doc.addFileToVFS(FunnelSansLight.fontFile, FunnelSansLight.base64);
  doc.addFont(FunnelSansLight.fontFile, FunnelSansLight.jspdfName, FunnelSansLight.jspdfStyle);
  doc.addFileToVFS(FunnelSansRegular.fontFile, FunnelSansRegular.base64);
  doc.addFont(FunnelSansRegular.fontFile, FunnelSansRegular.jspdfName, FunnelSansRegular.jspdfStyle);
}

// ============= Typography helpers =============
function useHeading(doc: jsPDF, size: number) {
  doc.setFont(FONT_HEADING, "bold");
  doc.setFontSize(size);
}
function useBody(doc: jsPDF, size: number) {
  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(size);
}
function useBodyEm(doc: jsPDF, size: number) {
  doc.setFont(FONT_BODY_EM, "normal");
  doc.setFontSize(size);
}

// ============= Layout helpers =============
function drawEyebrow(doc: jsPDF, text: string, x: number, y: number, rgb = ACCENT_DARK): number {
  useBodyEm(doc, 7.5);
  doc.setTextColor(...rgb);
  doc.setCharSpace(0.4);
  doc.text(text.toUpperCase(), x, y);
  doc.setCharSpace(0);
  return y + 5;
}

function drawHeading(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size = 20,
  rgb: readonly [number, number, number] = PRIMARY
): number {
  useHeading(doc, size);
  doc.setTextColor(...rgb);
  const lines = doc.splitTextToSize(text, maxWidth);
  const lineHeight = size * 0.42;
  doc.text(lines, x, y + lineHeight);
  return y + lineHeight + lines.length * lineHeight * 0.9;
}

function drawBody(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size = 9.5,
  rgb: readonly [number, number, number] = TEXT
): number {
  useBody(doc, size);
  doc.setTextColor(...rgb);
  const lines = doc.splitTextToSize(text, maxWidth);
  const lineHeight = size * 0.52;
  doc.text(lines, x, y + lineHeight * 0.9);
  return y + lineHeight * 0.9 + lines.length * lineHeight;
}

function softPageBackground(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(...SOFT_BG);
  doc.rect(0, 0, W, H, "F");
}

function drawPageHeader(doc: jsPDF, sectionTitle: string) {
  const W = doc.internal.pageSize.getWidth();
  const M = 22;
  // Minimal: geen volle gekleurde strip, alleen klein logo links + titel rechts
  // met ruim whitespace eromheen. Geen zichtbare hairline.
  doc.addImage(logoDataUrl, "PNG", M, 12, 28, 10);
  useBodyEm(doc, 7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(0.4);
  doc.text(sectionTitle.toUpperCase(), W - M, 18, { align: "right" });
  doc.setCharSpace(0);
  // Zachte lime-accent puntje rechtsboven (niet een hele lijn)
  doc.setFillColor(...ACCENT);
  doc.circle(W - M + 3, 17.5, 1.3, "F");
}

function drawPageFooter(doc: jsPDF, pageNum: number, total: number) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 22;
  useBody(doc, 7.5);
  doc.setTextColor(...MUTED);
  doc.text("Act Right  ·  ESG Quickscan Light", M, H - 12);
  doc.text(`${pageNum}  /  ${total}`, W - M, H - 12, { align: "right" });
}

// ============= Cover =============
function drawCover(doc: jsPDF, report: ESGReport, contact: ContactInfo) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 22;

  // Basis: moss-achtergrond
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, H, "F");

  // Cream-strook bovenaan voor het logo (zodat het PNG-logo op zijn natuurlijke
  // achtergrond staat, niet ingedrukt op moss)
  const creamStripHeight = 30;
  doc.setFillColor(...SOFT_BG);
  doc.rect(0, 0, W, creamStripHeight, "F");

  // Logo bovenaan, horizontaal gecentreerd? Nee, editorial: links uitgelijnd.
  doc.addImage(logoDataUrl, "PNG", M, 7, 55, 18);

  // Lime kleur-blok onderin ~36% voor company + profiel
  const blockTop = H * 0.64;
  doc.setFillColor(...ACCENT);
  doc.rect(0, blockTop, W, H - blockTop, "F");

  // Zachte afgeronde overlap: een ronde cirkel-accent tussen moss en lime
  // om de harde lijn te verzachten (brand metafoor "verbinding")
  doc.setFillColor(...CREAM_DEEP);
  doc.circle(W - M - 20, blockTop - 24, 4, "F");
  doc.setFillColor(...ACCENT_DARK);
  doc.circle(W - M - 10, blockTop - 10, 2.2, "F");

  // Eyebrow + titel op moss, boven de lime-blok
  const titleY = blockTop - 50;
  drawEyebrow(doc, "ESG Quickscan Light  ·  Rapport", M, titleY, ACCENT);

  useHeading(doc, 42);
  doc.setTextColor(...SOFT_BG);
  const titleLines = doc.splitTextToSize("Uw persoonlijke\nESG-rapport.", W - M * 2);
  const lh = 42 * 0.42;
  doc.text(titleLines, M, titleY + 16);

  // Binnen de lime-blok: company + profiel in moss
  const companyY = blockTop + 16;
  useHeading(doc, 26);
  doc.setTextColor(...PRIMARY);
  doc.text(contact.companyName, M, companyY);

  useBodyEm(doc, 11);
  doc.setTextColor(...PRIMARY);
  doc.text(report.profileType, M, companyY + 8);

  // Onderin: recipient + datum
  useBody(doc, 9);
  doc.setTextColor(...PRIMARY);
  doc.text(
    `Opgesteld voor  ·  ${contact.firstName} ${contact.lastName}`,
    M,
    H - 22
  );
  const datum = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(datum, W - M, H - 22, { align: "right" });

  // Tiny tagline onderaan helemaal
  useBody(doc, 7);
  doc.setTextColor(...PRIMARY);
  doc.text(
    "act responsible   ·   act win-win   ·   act now",
    M,
    H - 14
  );
  doc.text("www.actright.nl", W - M, H - 14, { align: "right" });
}

// ============= Summary page =============
function drawSummaryPage(doc: jsPDF, report: ESGReport, contact: ContactInfo) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 22;
  const CW = W - M * 2;
  let y = 40;

  drawPageHeader(doc, "Samenvatting");

  y = drawEyebrow(doc, "01  ·  Uw ESG-profiel", M, y);
  y = drawHeading(doc, "Wat dit rapport u vertelt", M, y, CW, 22);
  y += 3;
  y = drawBody(doc, report.summary, M, y, CW, 10);
  y += 10;

  // Maturity card: afgeronde lime-cream met moss-accent
  const matH = 42;
  doc.setFillColor(...CREAM_DEEP);
  doc.roundedRect(M, y, CW, matH, 4, 4, "F");
  // Lime-accent puntje links
  doc.setFillColor(...ACCENT);
  doc.circle(M + 8, y + 10, 2, "F");
  useBodyEm(doc, 7.5);
  doc.setTextColor(...ACCENT_DARK);
  doc.setCharSpace(0.4);
  doc.text("VOLWASSENHEIDSLABEL", M + 14, y + 11);
  doc.setCharSpace(0);

  useHeading(doc, 20);
  doc.setTextColor(...PRIMARY);
  doc.text(report.maturityLabel, M + 8, y + 23);

  useBody(doc, 9);
  doc.setTextColor(...TEXT);
  const matLines = doc.splitTextToSize(report.maturityExplanation, CW - 16);
  doc.text(matLines.slice(0, 2), M + 8, y + 31);
  y += matH + 10;

  // Disclaimer — zachte lime-cream met moss dot
  const discH = 44;
  doc.setFillColor(...CREAM_DEEP);
  doc.roundedRect(M, y, CW, discH, 4, 4, "F");
  doc.setFillColor(...PRIMARY);
  doc.circle(M + 8, y + 10, 2, "F");
  useBodyEm(doc, 7.5);
  doc.setTextColor(...PRIMARY);
  doc.setCharSpace(0.4);
  doc.text("LET OP   ·   INDICATIEF RAPPORT", M + 14, y + 11);
  doc.setCharSpace(0);

  useBody(doc, 9);
  doc.setTextColor(...TEXT);
  const discLines = doc.splitTextToSize(
    "Dit rapport is een indicatieve inschatting op basis van de 20 antwoorden die u gaf en is géén juridisch advies. " +
      "Wettelijke drempels voor onderwerpen als CSRD, CSDDD, EU-ETS of energiebesparingsplicht hangen vaak af van " +
      "details die een korte scan niet volledig uit kan vragen. Verifieer toepasselijkheid zelf of bespreek met Act Right " +
      "voor compliance- of investeringsbesluiten.",
    CW - 16
  );
  doc.text(discLines, M + 8, y + 17);
  y += discH + 14;

  // Thema-scores
  y = drawEyebrow(doc, "02  ·  Actieve thema's", M, y);
  y = drawHeading(doc, "Welke ESG-thema's spelen voor u?", M, y, CW, 18);
  y += 6;

  const activeThemes = report.themeScores.filter(t => t.active).slice(0, 6);
  activeThemes.forEach(t => {
    if (y > H - 40) return; // simpele bounds-check
    const barWidth = Math.min(70, Math.max(4, t.score * 7));
    // Zachte rail
    doc.setFillColor(...BORDER);
    doc.roundedRect(M, y + 2.5, 70, 2.2, 1, 1, "F");
    // Voortgang
    doc.setFillColor(...ACCENT);
    doc.roundedRect(M, y + 2.5, barWidth, 2.2, 1, 1, "F");
    // Thema-naam
    useBodyEm(doc, 10);
    doc.setTextColor(...PRIMARY);
    doc.text(t.theme.name, M + 76, y + 4.5);
    y += 10;
  });
}

// ============= Topic card =============
function drawTopicCard(
  doc: jsPDF,
  item: ScoredTopic,
  index: number,
  y: number,
  M: number,
  CW: number,
  H: number
): number {
  // Benodigde ruimte schatten: titel + 2 meta-lijnen + waarom-block
  const neededMinH = 48;
  if (y + neededMinH > H - 25) {
    doc.addPage();
    softPageBackground(doc);
    drawPageHeader(doc, "Wat nu relevant is (vervolg)");
    y = 40;
  }

  const cardX = M;
  const cardY = y;
  const cardW = CW;

  // Card-body in cream (bijna background) met lichte offset
  doc.setFillColor(...SOFT_BG);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  // Voorlopige hoogte; we past 'm aan onderaan
  // Start met compacte hoogte en groei met content
  let cursor = cardY + 10;

  // Lime-accent streep links (smal, geen vlakken)
  doc.setFillColor(...ACCENT);
  doc.roundedRect(cardX, cardY, 3, 4, 1.5, 1.5, "F"); // placeholder; we tekenen de echte balk als laatste

  // Nummer in lime
  useHeading(doc, 22);
  doc.setTextColor(...ACCENT_DARK);
  doc.text(String(index).padStart(2, "0"), cardX + 10, cursor + 5);

  // Title
  useHeading(doc, 14);
  doc.setTextColor(...PRIMARY);
  const titleLines = doc.splitTextToSize(item.topic.subject, cardW - 30);
  doc.text(titleLines, cardX + 28, cursor + 2);
  cursor += 2 + titleLines.length * 6 + 2;

  // Label + horizon meta-regel
  useBodyEm(doc, 8);
  doc.setTextColor(...ACCENT_DARK);
  doc.setCharSpace(0.3);
  doc.text(
    `${item.label.toUpperCase()}   ·   ${item.horizon.toUpperCase()}`,
    cardX + 28,
    cursor + 2
  );
  doc.setCharSpace(0);
  cursor += 6;

  // Description van topic (indien korter dan X chars, anders 2 regels)
  if (item.topic.description) {
    useBody(doc, 9);
    doc.setTextColor(...TEXT);
    const descLines = doc.splitTextToSize(item.topic.description, cardW - 16);
    doc.text(descLines.slice(0, 2), cardX + 8, cursor + 4);
    cursor += 4 + Math.min(2, descLines.length) * 4.2;
  }

  // "Waarom voor u relevant" accent-block in lime-cream
  const reasonText = (item.reasons || []).join(" ").trim();
  if (reasonText) {
    cursor += 3;
    useBody(doc, 8.5);
    const reasonLines = doc.splitTextToSize(reasonText, cardW - 20);
    const reasonLineCount = Math.min(4, reasonLines.length);
    const reasonBoxH = 6 + reasonLineCount * 4.2;

    doc.setFillColor(...CREAM_DEEP);
    doc.roundedRect(cardX + 4, cursor, cardW - 8, reasonBoxH, 2.5, 2.5, "F");

    useBodyEm(doc, 7);
    doc.setTextColor(...ACCENT_DARK);
    doc.setCharSpace(0.4);
    doc.text("WAAROM VOOR U RELEVANT", cardX + 10, cursor + 4);
    doc.setCharSpace(0);

    useBody(doc, 8.5);
    doc.setTextColor(...TEXT);
    doc.text(reasonLines.slice(0, reasonLineCount), cardX + 10, cursor + 8.5);
    cursor += reasonBoxH + 2;
  }

  const cardH = cursor - cardY + 6;

  // Teken de volledige card-background nu we de hoogte kennen
  // (we hebben de content al op de pagina gezet, dus deze rect moet eronder
  // komen. Maar PDF is append-only dus we moeten dit vooraf doen. Herstel:
  // zet achtergrond achteraf als transparante border ipv opvullen.)
  doc.setFillColor(...SOFT_BG); // Re-fill card bg (overlay niet mogelijk in PDF;
  // Alternatief: we laten de card-background wit/cream zijn want de page-bg is al
  // SOFT_BG, en tekenen alleen de border + lime-bar.)
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(cardX + 5, cardY, cardW - 5, cardH, 3, 3, "D");

  // Lime-accent bar helemaal links (buiten de geroude border voor een hippe look)
  doc.setFillColor(...ACCENT);
  doc.roundedRect(cardX, cardY, 3, cardH, 1.5, 1.5, "F");

  return cardY + cardH + 6;
}

// ============= Not-priority tile =============
function drawNotPriorityTile(
  doc: jsPDF,
  item: ScoredTopic,
  y: number,
  M: number,
  CW: number
): number {
  const tileH = 16;
  doc.setFillColor(...CREAM_DEEP);
  doc.roundedRect(M, y, CW, tileH, 2.5, 2.5, "F");
  // Mini-dot
  doc.setFillColor(...SAGE);
  doc.circle(M + 6, y + tileH / 2, 1.8, "F");
  useHeading(doc, 10);
  doc.setTextColor(...PRIMARY);
  doc.text(item.topic.subject, M + 12, y + 6.5);
  useBody(doc, 7.5);
  doc.setTextColor(...MUTED);
  const r = doc.splitTextToSize(item.reasons[0] || "Niet direct getriggerd door uw antwoorden.", CW - 18);
  doc.text(r.slice(0, 1), M + 12, y + 11);
  return y + tileH + 4;
}

// ============= Action item =============
function drawActionItem(
  doc: jsPDF,
  index: number,
  text: string,
  y: number,
  M: number,
  CW: number
): number {
  const boxH = 22;
  // Lime-accent vierkantje links
  doc.setFillColor(...ACCENT);
  doc.roundedRect(M, y, 14, boxH, 2, 2, "F");
  useHeading(doc, 16);
  doc.setTextColor(...PRIMARY);
  doc.text(String(index).padStart(2, "0"), M + 7, y + 14, { align: "center" });

  // Body-container
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(M + 16, y, CW - 16, boxH, 2, 2, "D");
  useBody(doc, 9.5);
  doc.setTextColor(...TEXT);
  const lines = doc.splitTextToSize(text, CW - 22);
  doc.text(lines.slice(0, 3), M + 21, y + 7);

  return y + boxH + 5;
}

// ============= CTA page =============
function drawCtaPage(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 22;

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, H, "F");

  // Cream strook bovenaan voor het logo
  doc.setFillColor(...SOFT_BG);
  doc.rect(0, 0, W, 30, "F");
  doc.addImage(logoDataUrl, "PNG", M, 7, 55, 18);

  // Accent dots-cluster rechtsboven voor "verbinding"-motief
  doc.setFillColor(...ACCENT);
  doc.circle(W - 45, 60, 4, "F");
  doc.setFillColor(...CREAM_DEEP);
  doc.circle(W - 30, 75, 2.5, "F");
  doc.setFillColor(...ACCENT_DARK);
  doc.circle(W - 55, 85, 1.8, "F");

  // Eyebrow
  drawEyebrow(doc, "Volgende stap", M, 90, ACCENT);

  // Big headline
  useHeading(doc, 40);
  doc.setTextColor(...SOFT_BG);
  const headLines = doc.splitTextToSize(
    "Klaar voor de\nvolgende stap?",
    W - M * 2
  );
  doc.text(headLines, M, 112);

  // Explanation
  useBody(doc, 11.5);
  doc.setTextColor(...ACCENT);
  doc.text("Plan een gratis ESG discovery-call met Act Right.", M, 166);

  useBody(doc, 10);
  doc.setTextColor(...SOFT_BG);
  const explain = doc.splitTextToSize(
    "In 30 minuten vertalen we dit rapport naar een concrete aanpak voor uw organisatie. Geen verplichtingen, geen verkoopgesprek — wel duidelijkheid over wat nu echt telt voor uw MKB.",
    W - M * 2 - 10
  );
  doc.text(explain, M, 175);

  // CTA-button visual: pill-shape in lime met moss-tekst
  const btnY = H / 2 + 40;
  const btnW = 92;
  const btnH = 16;
  doc.setFillColor(...ACCENT);
  doc.roundedRect(M, btnY, btnW, btnH, 8, 8, "F");
  useHeading(doc, 11);
  doc.setTextColor(...PRIMARY);
  doc.text("Plan discovery-call  →", M + btnW / 2, btnY + 10.5, { align: "center" });

  // Footer met contact
  useBody(doc, 9);
  doc.setTextColor(...SOFT_BG);
  doc.text("www.actright.nl", M, H - 30);
  doc.text("info@actright.nl", M, H - 23);

  useBody(doc, 7.5);
  doc.setTextColor(...ACCENT);
  doc.text(
    "act responsible   ·   act win-win   ·   act now",
    W - M,
    H - 23,
    { align: "right" }
  );
}

// ============= Main entrypoint =============
export function generateESGPdf(report: ESGReport, contact: ContactInfo): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  registerFonts(doc);

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 22;
  const CW = W - M * 2;

  // ============= COVER =============
  drawCover(doc, report, contact);

  // ============= PAGE 2 — SAMENVATTING =============
  doc.addPage();
  softPageBackground(doc);
  drawSummaryPage(doc, report, contact);

  // ============= PAGE 3+ — NU RELEVANT =============
  doc.addPage();
  softPageBackground(doc);
  drawPageHeader(doc, "Wat nu relevant is");
  let y = 40;
  y = drawEyebrow(doc, "03  ·  Direct relevant", M, y);
  y = drawHeading(
    doc,
    `Top ${report.nuRelevant.length} aandachtspunten`,
    M,
    y,
    CW,
    22
  );
  y += 3;
  y = drawBody(
    doc,
    "De onderwerpen hieronder zijn op basis van uw antwoorden direct relevant. Begin hier.",
    M,
    y,
    CW,
    10,
    MUTED
  );
  y += 8;

  if (report.nuRelevant.length === 0) {
    y = drawBody(
      doc,
      "Op basis van uw antwoorden zien wij momenteel geen onderwerpen die directe actie vereisen. Een verdiepingsgesprek kan dit beeld bevestigen of nuanceren.",
      M,
      y,
      CW,
      10
    );
  } else {
    for (let i = 0; i < report.nuRelevant.length; i++) {
      y = drawTopicCard(doc, report.nuRelevant[i], i + 1, y, M, CW, H);
    }
  }

  // ============= BINNENKORT RELEVANT =============
  if (report.binnenkortRelevant.length > 0) {
    doc.addPage();
    softPageBackground(doc);
    drawPageHeader(doc, "Binnenkort relevant");
    y = 40;
    y = drawEyebrow(doc, "04  ·  Op de horizon", M, y);
    y = drawHeading(doc, "Bereid u voor op 1-3 jaar", M, y, CW, 22);
    y += 3;
    y = drawBody(
      doc,
      "Onderwerpen waar u tijdig aandacht aan moet besteden voordat ze u direct raken.",
      M,
      y,
      CW,
      10,
      MUTED
    );
    y += 8;

    for (let i = 0; i < report.binnenkortRelevant.length; i++) {
      y = drawTopicCard(doc, report.binnenkortRelevant[i], i + 1, y, M, CW, H);
    }
  }

  // ============= GEEN PRIORITEIT =============
  if (report.geenPrioriteit.length > 0) {
    if (y > H - 70) {
      doc.addPage();
      softPageBackground(doc);
      drawPageHeader(doc, "Geen prioriteit");
      y = 40;
    } else {
      y += 8;
    }
    y = drawEyebrow(doc, "05  ·  Geen zorg", M, y);
    y = drawHeading(doc, "Wat nu geen prioriteit heeft", M, y, CW, 18);
    y += 3;
    y = drawBody(
      doc,
      "Vaak overschatte onderwerpen die op dit moment niet direct voor u spelen:",
      M,
      y,
      CW,
      9.5,
      MUTED
    );
    y += 4;
    report.geenPrioriteit.forEach(t => {
      if (y > H - 30) {
        doc.addPage();
        softPageBackground(doc);
        drawPageHeader(doc, "Geen prioriteit (vervolg)");
        y = 40;
      }
      y = drawNotPriorityTile(doc, t, y, M, CW);
    });
  }

  // ============= ACTIES =============
  doc.addPage();
  softPageBackground(doc);
  drawPageHeader(doc, "Vervolgstappen");
  y = 40;
  y = drawEyebrow(doc, "06  ·  Actie", M, y);
  y = drawHeading(doc, "5 concrete vervolgstappen", M, y, CW, 22);
  y += 3;
  y = drawBody(
    doc,
    `Een mix van quick wins, compliance en strategische acties, afgestemd op uw volwassenheidsniveau (${report.maturityLabel.toLowerCase()}).`,
    M,
    y,
    CW,
    10,
    MUTED
  );
  y += 8;
  report.acties.forEach((a, i) => {
    if (y > H - 35) {
      doc.addPage();
      softPageBackground(doc);
      drawPageHeader(doc, "Vervolgstappen (vervolg)");
      y = 40;
    }
    y = drawActionItem(doc, i + 1, a, y, M, CW);
  });

  // ============= CTA =============
  doc.addPage();
  drawCtaPage(doc);

  // ============= Page numbers (skip cover + CTA) =============
  const total = doc.getNumberOfPages();
  for (let p = 2; p < total; p++) {
    doc.setPage(p);
    drawPageFooter(doc, p, total);
  }

  return doc;
}
