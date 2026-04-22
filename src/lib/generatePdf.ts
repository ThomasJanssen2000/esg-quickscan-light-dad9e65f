import jsPDF from "jspdf";
import "jspdf-autotable";
import type { ESGReport, ContactInfo, ScoredTopic } from "./esgEngine";
import * as FunnelDisplayBold from "@/assets/generated/funnel-display-bold";
import * as FunnelSansLight from "@/assets/generated/funnel-sans-light";
import * as FunnelSansRegular from "@/assets/generated/funnel-sans-regular";
import { logoDataUrl } from "@/assets/generated/actright-logo-base64";
import { logoWhiteDataUrl } from "@/assets/generated/actright-logo-white-base64";

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

// Logo-afmetingen: natuurlijke ratio van actright-logo.png is 1920/1357 ≈ 1.415.
// Gebruik deze ratio overal om stretching te voorkomen.
const LOGO_RATIO = 1920 / 1357;
function logoSize(widthMm: number): { w: number; h: number } {
  return { w: widthMm, h: widthMm / LOGO_RATIO };
}

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
  // Logo iets groter (32mm breed ipv 22mm) zodat het merk zichtbaarder is.
  // Dot komt VOOR de titel zodat ze nooit overlappen.
  const { w: lw, h: lh } = logoSize(32);
  doc.addImage(logoDataUrl, "PNG", M, 10, lw, lh);

  useBodyEm(doc, 8);
  doc.setCharSpace(0.4);
  const label = sectionTitle.toUpperCase();
  const rightEdge = W - M;
  const textW = doc.getTextWidth(label);
  const textLeft = rightEdge - textW;
  const titleBaselineY = 10 + lh / 2 + 1.5; // verticaal uitgelijnd met logo-centerlijn

  // Dot links van de titel, verticaal gecentreerd op dezelfde baseline
  doc.setFillColor(...ACCENT);
  doc.circle(textLeft - 4, titleBaselineY - 1.2, 1.3, "F");

  doc.setTextColor(...MUTED);
  doc.text(label, rightEdge, titleBaselineY, { align: "right" });
  doc.setCharSpace(0);
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

  // Basis: volledig moss-achtergrond (geen cream-strook meer)
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, H, "F");

  // Wit logo (lime atoom + witte wordmark) helemaal bovenaan links.
  // Grotere afmeting voor meer brand-presence.
  const logoWidth = 68;
  const { h: logoH } = logoSize(logoWidth); // 68 / 1.415 ≈ 48mm
  doc.addImage(logoWhiteDataUrl, "PNG", M, 20, logoWidth, logoH);

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
  doc.text(titleLines, M, titleY + 16);

  // Binnen de lime-blok: company + profiel in moss
  const companyY = blockTop + 16;
  useHeading(doc, 26);
  doc.setTextColor(...PRIMARY);
  doc.text(contact.companyName, M, companyY);

  useBodyEm(doc, 12);
  doc.setTextColor(...PRIMARY);
  doc.text(report.profileType, M, companyY + 9);

  // Onderin: recipient + datum (iets groter dan voorheen)
  useBody(doc, 10.5);
  doc.setTextColor(...PRIMARY);
  doc.text(
    `Opgesteld voor  ·  ${contact.firstName} ${contact.lastName}`,
    M,
    H - 24
  );
  const datum = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(datum, W - M, H - 24, { align: "right" });

  // Taglijn onderaan — ook iets groter voor leesbaarheid
  useBodyEm(doc, 8.5);
  doc.setTextColor(...PRIMARY);
  doc.text(
    "act responsible   ·   act win-win   ·   act now",
    M,
    H - 14
  );
  doc.text("www.actright.nl", W - M, H - 14, { align: "right" });
}

// Maturity-mapping voor 4-stap voortgangsbar (matcht UI)
const MATURITY_STEP: Record<string, number> = {
  "Startfase": 1,
  "Basis op orde brengen": 2,
  "Structureren": 3,
  "Opschalen": 4,
};

// ============= Summary page =============
// Volgorde: intro-profiel → maturity-kaart (met 4-stap bar) → actieve
// thema's → disclaimer helemaal onderaan. Alles op één pagina.
function drawSummaryPage(doc: jsPDF, report: ESGReport, contact: ContactInfo) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 22;
  const CW = W - M * 2;
  let y = 40;

  drawPageHeader(doc, "Samenvatting");

  // ========= 01 · Uw ESG-profiel =========
  y = drawEyebrow(doc, "01  ·  Uw ESG-profiel", M, y);
  y = drawHeading(doc, "Wat dit rapport u vertelt", M, y, CW, 20);
  y += 3;
  y = drawBody(doc, report.summary, M, y, CW, 10);
  y += 8;

  // Maturity-kaart (onderdeel van "Uw ESG-profiel") met 4-stap voortgangsbar
  const matH = 44;
  const matPadX = 10;
  doc.setFillColor(...CREAM_DEEP);
  doc.roundedRect(M, y, CW, matH, 4, 4, "F");

  // Eyebrow + dot links
  doc.setFillColor(...ACCENT);
  doc.circle(M + matPadX, y + 9, 1.8, "F");
  useBodyEm(doc, 7.5);
  doc.setTextColor(...ACCENT_DARK);
  doc.setCharSpace(0.4);
  doc.text("VOLWASSENHEIDSLABEL", M + matPadX + 5, y + 10);
  doc.setCharSpace(0);

  // Maturity label groot + 4-stap voortgangsbar ernaast
  useHeading(doc, 18);
  doc.setTextColor(...PRIMARY);
  doc.text(report.maturityLabel, M + matPadX, y + 22);

  // 4-stap bar rechts in de kaart
  const currentStep = MATURITY_STEP[report.maturityLabel] ?? 1;
  const barTotalWidth = 58;
  const barSeg = (barTotalWidth - 6) / 4; // 4 segmenten + 3 gaps van 2mm
  const barY = y + 20;
  const barXStart = M + CW - matPadX - barTotalWidth;
  for (let i = 1; i <= 4; i++) {
    const segX = barXStart + (i - 1) * (barSeg + 2);
    doc.setFillColor(...(i <= currentStep ? ACCENT_DARK : BORDER));
    doc.roundedRect(segX, barY, barSeg, 3, 1.5, 1.5, "F");
  }
  useBody(doc, 7.5);
  doc.setTextColor(...MUTED);
  doc.text(`Stap ${currentStep} van 4`, M + CW - matPadX, barY + 8.5, { align: "right" });

  // Uitlegtekst onderaan maturity-kaart
  useBody(doc, 8.5);
  doc.setTextColor(...TEXT);
  const matLines = doc.splitTextToSize(report.maturityExplanation, CW - matPadX * 2);
  doc.text(matLines.slice(0, 2), M + matPadX, y + 34);
  y += matH + 12;

  // ========= 02 · Actieve thema's =========
  y = drawEyebrow(doc, "02  ·  Actieve thema's", M, y);
  y = drawHeading(doc, "Welke ESG-thema's spelen voor u?", M, y, CW, 18);
  y += 6;

  const activeThemes = report.themeScores.filter(t => t.active).slice(0, 6);
  const themeBarWidth = 72;
  activeThemes.forEach(t => {
    const pct = Math.min(1, Math.max(0.1, t.score / 10));
    const fillWidth = themeBarWidth * pct;
    // Rail
    doc.setFillColor(...BORDER);
    doc.roundedRect(M, y + 2.5, themeBarWidth, 2.4, 1.2, 1.2, "F");
    // Fill
    doc.setFillColor(...ACCENT);
    doc.roundedRect(M, y + 2.5, fillWidth, 2.4, 1.2, 1.2, "F");
    // Thema-naam
    useBodyEm(doc, 10);
    doc.setTextColor(...PRIMARY);
    doc.text(t.theme.name, M + themeBarWidth + 6, y + 4.5);
    y += 9;
  });

  // ========= Disclaimer ONDERAAN de pagina =========
  // Compactere disclaimer (21mm) i.p.v. eerdere 42mm. Tekst ingekort zodat
  // hij in max 2 regels past.
  const discH = 24;
  const footerSafeY = H - 18;
  const discY = footerSafeY - discH;

  doc.setFillColor(...CREAM_DEEP);
  doc.roundedRect(M, discY, CW, discH, 3.5, 3.5, "F");
  doc.setFillColor(...PRIMARY);
  doc.circle(M + 10, discY + 8, 1.8, "F");
  useBodyEm(doc, 7.5);
  doc.setTextColor(...PRIMARY);
  doc.setCharSpace(0.4);
  doc.text("LET OP   ·   INDICATIEF RAPPORT", M + 15, discY + 9);
  doc.setCharSpace(0);

  useBody(doc, 8.5);
  doc.setTextColor(...TEXT);
  const discLines = doc.splitTextToSize(
    "Indicatieve inschatting op basis van uw 20 antwoorden; géén juridisch advies. " +
      "Verifieer toepasselijkheid van de genoemde onderwerpen zelf of bespreek met Act Right voor compliance- of investeringsbesluiten.",
    CW - 20
  );
  doc.text(discLines.slice(0, 2), M + 10, discY + 15);
}

// ============= Topic card =============
// Card-geometrie:
//   - Lime accent-balk helemaal links (3mm breed, cardX tot cardX+3)
//   - Card-border start bij cardX+5, eindigt bij cardX+cardW (border-width cardW-5)
//   - Inhoud-padding binnen de border: 8mm links van border, 8mm rechts
//   - Waarom-blok zit BINNEN de border met zelfde 5mm inset aan beide kanten
function drawTopicCard(
  doc: jsPDF,
  item: ScoredTopic,
  index: number,
  y: number,
  M: number,
  CW: number,
  H: number,
  sectionLabel: string = "Vervolg"
): number {
  const neededMinH = 56;
  if (y + neededMinH > H - 22) {
    doc.addPage();
    softPageBackground(doc);
    drawPageHeader(doc, sectionLabel);
    y = 40;
  }

  const cardX = M;
  const cardY = y;
  const cardW = CW;

  // Geometrie-constanten (één keer gedefinieerd = consistente margins):
  const BORDER_LEFT = cardX + 5;        // waar de card-border begint
  const BORDER_RIGHT = cardX + cardW;   // waar de card-border eindigt
  const INNER_PAD = 8;                  // padding binnen de border
  const CONTENT_LEFT = BORDER_LEFT + INNER_PAD;
  const CONTENT_WIDTH = BORDER_RIGHT - BORDER_LEFT - INNER_PAD * 2;

  // Reason-block geometrie: inset van 5mm links/rechts binnen de border
  const REASON_INSET = 5;
  const REASON_LEFT = BORDER_LEFT + REASON_INSET;
  const REASON_WIDTH = BORDER_RIGHT - BORDER_LEFT - REASON_INSET * 2;
  const REASON_TEXT_PAD = 6; // padding tekst binnen het reason-blok
  const REASON_TEXT_WIDTH = REASON_WIDTH - REASON_TEXT_PAD * 2;

  let cursor = cardY + 11;

  // Nummer (big, lime-dark) — linker zone
  useHeading(doc, 22);
  doc.setTextColor(...ACCENT_DARK);
  doc.text(String(index).padStart(2, "0"), CONTENT_LEFT, cursor + 5);

  // Titel & meta rechter zone (vanaf CONTENT_LEFT + 22 voor het nummer)
  const titleX = CONTENT_LEFT + 22;
  const titleW = BORDER_RIGHT - INNER_PAD - titleX;

  useHeading(doc, 13);
  doc.setTextColor(...PRIMARY);
  const titleLines = doc.splitTextToSize(item.topic.subject, titleW);
  doc.text(titleLines, titleX, cursor + 2);
  cursor += 2 + titleLines.length * 5.5 + 3;

  // Label + horizon meta
  useBodyEm(doc, 7.5);
  doc.setTextColor(...ACCENT_DARK);
  doc.setCharSpace(0.35);
  doc.text(
    `${item.label.toUpperCase()}   ·   ${item.horizon.toUpperCase()}`,
    titleX,
    cursor + 1
  );
  doc.setCharSpace(0);
  cursor += 6;

  // Korte beschrijving (max 2 regels), full-width
  if (item.topic.description) {
    useBody(doc, 9);
    doc.setTextColor(...TEXT);
    const descLines = doc.splitTextToSize(item.topic.description, CONTENT_WIDTH);
    doc.text(descLines.slice(0, 2), CONTENT_LEFT, cursor + 4);
    cursor += 4 + Math.min(2, descLines.length) * 4.5;
  }

  // "Waarom voor u relevant" accent-blok
  const reasonText = (item.reasons || []).join(" ").trim();
  if (reasonText) {
    cursor += 4;
    useBody(doc, 8.5);
    const reasonLines = doc.splitTextToSize(reasonText, REASON_TEXT_WIDTH);
    const reasonLineCount = Math.min(5, reasonLines.length);
    const reasonBoxH = 8 + reasonLineCount * 4.3;

    // Reason-box: GECENTREERD in de card (REASON_INSET padding aan beide kanten)
    doc.setFillColor(...CREAM_DEEP);
    doc.roundedRect(REASON_LEFT, cursor, REASON_WIDTH, reasonBoxH, 2.5, 2.5, "F");

    // Eyebrow binnenin, op REASON_TEXT_PAD vanaf linkerkant van reason-box
    useBodyEm(doc, 7);
    doc.setTextColor(...ACCENT_DARK);
    doc.setCharSpace(0.4);
    doc.text("WAAROM VOOR U RELEVANT", REASON_LEFT + REASON_TEXT_PAD, cursor + 5);
    doc.setCharSpace(0);

    // Reason-tekst, zelfde padding links
    useBody(doc, 8.5);
    doc.setTextColor(...TEXT);
    doc.text(
      reasonLines.slice(0, reasonLineCount),
      REASON_LEFT + REASON_TEXT_PAD,
      cursor + 10
    );
    cursor += reasonBoxH + 3;
  }

  const cardH = cursor - cardY + 4;

  // Card-border (alleen outline) rond content - geen invulling
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(BORDER_LEFT, cardY, BORDER_RIGHT - BORDER_LEFT, cardH, 3, 3, "D");

  // Lime accent-balk helemaal links, volle card-hoogte
  doc.setFillColor(...ACCENT);
  doc.roundedRect(cardX, cardY, 3, cardH, 1.5, 1.5, "F");

  return cardY + cardH + 7;
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
// Actie-tekst heeft het patroon "Label: inhoudelijke beschrijving".
// We splitsen op de eerste ":" en renderen label bold + body regular.
// Nummer en label+body worden beide verticaal gecentreerd in hun box.
function drawActionItem(
  doc: jsPDF,
  index: number,
  text: string,
  y: number,
  M: number,
  CW: number
): number {
  // Split "Label: body" (kan "Label:" zonder body zijn in edge cases)
  const colonIdx = text.indexOf(":");
  const hasLabel = colonIdx > 0 && colonIdx < 30;
  const label = hasLabel ? text.substring(0, colonIdx).trim() : "";
  const body = hasLabel ? text.substring(colonIdx + 1).trim() : text;

  // Bereken hoeveel body-regels we nodig hebben
  const bodyWidth = CW - 16 - 10; // 10mm linker-padding binnen body-box
  useBody(doc, 9.5);
  const bodyLines = doc.splitTextToSize(body, bodyWidth);
  const bodyLineCount = Math.min(3, bodyLines.length);

  // Box-hoogte adaptief: min 22mm, groei met aantal body-regels
  const labelBlockH = hasLabel ? 6 : 0; // extra ruimte voor bold label
  const bodyBlockH = bodyLineCount * 4.6;
  const contentH = labelBlockH + bodyBlockH;
  const boxH = Math.max(22, contentH + 10); // 5mm padding boven + onder

  // Lime-accent vierkantje links (nummer)
  doc.setFillColor(...ACCENT);
  doc.roundedRect(M, y, 14, boxH, 2, 2, "F");

  // Nummer verticaal en horizontaal gecentreerd in het lime-vierkantje
  useHeading(doc, 16);
  doc.setTextColor(...PRIMARY);
  // Voor 16pt in een box van boxH hoogte: baseline op y + boxH/2 + ~5
  // (het "+5" offset komt van cap-height / 2 in mm voor 16pt = ~2.8mm
  // plus een subtiele optische correctie)
  doc.text(
    String(index).padStart(2, "0"),
    M + 7,
    y + boxH / 2 + 2.8,
    { align: "center" }
  );

  // Body-container
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(M + 16, y, CW - 16, boxH, 2, 2, "D");

  // Label + body verticaal gecentreerd binnen de body-container
  const textBlockStartY = y + (boxH - contentH) / 2;
  const textLeft = M + 21;

  if (hasLabel) {
    useHeading(doc, 10);
    doc.setTextColor(...PRIMARY);
    doc.text(label, textLeft, textBlockStartY + 4.5);
  }

  useBody(doc, 9.5);
  doc.setTextColor(...TEXT);
  doc.text(
    bodyLines.slice(0, bodyLineCount),
    textLeft,
    textBlockStartY + labelBlockH + 4.5
  );

  return y + boxH + 5;
}

// ============= CTA page =============
const CONTACT_URL = "https://www.actright.nl/contact";

function drawCtaPage(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 22;

  // Volledig moss achtergrond (geen cream-strook meer)
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, H, "F");

  // Wit logo (lime atoom + witte wordmark) bovenaan links.
  // Wat groter dan eerder voor matchende brand-presence met cover.
  const ctaLogoW = 60;
  const { h: ctaLogoH } = logoSize(ctaLogoW);
  doc.addImage(logoWhiteDataUrl, "PNG", M, 20, ctaLogoW, ctaLogoH);

  // Accent dots-cluster rechtsboven voor "verbinding"-motief
  doc.setFillColor(...ACCENT);
  doc.circle(W - 45, 40, 4, "F");
  doc.setFillColor(...CREAM_DEEP);
  doc.circle(W - 30, 55, 2.5, "F");
  doc.setFillColor(...ACCENT_DARK);
  doc.circle(W - 55, 65, 1.8, "F");

  // Eyebrow iets onder het logo
  drawEyebrow(doc, "Volgende stap", M, 95, ACCENT);

  // Grote headline
  useHeading(doc, 40);
  doc.setTextColor(...SOFT_BG);
  const headLines = doc.splitTextToSize(
    "Klaar voor de\nvolgende stap?",
    W - M * 2
  );
  doc.text(headLines, M, 118);

  // Uitleg
  useBody(doc, 11.5);
  doc.setTextColor(...ACCENT);
  doc.text("Plan een gratis ESG discovery-call met Act Right.", M, 172);

  useBody(doc, 10);
  doc.setTextColor(...SOFT_BG);
  const explain = doc.splitTextToSize(
    "In 30 minuten vertalen we dit rapport naar een concrete aanpak voor uw organisatie. Geen verplichtingen, geen verkoopgesprek — wel duidelijkheid over wat nu echt telt voor uw MKB.",
    W - M * 2 - 10
  );
  doc.text(explain, M, 181);

  // CTA-button: pill in lime met moss-tekst.
  // Horizontaal en verticaal correct gecentreerd via gemeten text-metrics.
  const btnY = H / 2 + 50;
  const btnW = 96;
  const btnH = 18;
  doc.setFillColor(...ACCENT);
  doc.roundedRect(M, btnY, btnW, btnH, 9, 9, "F");

  useHeading(doc, 12);
  doc.setTextColor(...PRIMARY);
  const btnText = "Plan discovery-call  →";
  // Verticale center: baseline = btn_center + font cap-height/2
  // 12pt cap-height ≈ 4.2mm; center y = btnY + btnH/2; baseline ≈ center + 2
  const btnCenterY = btnY + btnH / 2 + 2.1;
  const btnCenterX = M + btnW / 2;
  doc.text(btnText, btnCenterX, btnCenterY, { align: "center" });

  // Klikbare link over de button: naar Act Right contactformulier
  doc.link(M, btnY, btnW, btnH, { url: CONTACT_URL });

  // Footer met contact (links klikbaar)
  useBody(doc, 10);
  doc.setTextColor(...SOFT_BG);
  doc.textWithLink("www.actright.nl", M, H - 30, { url: "https://www.actright.nl" });
  doc.textWithLink("info@actright.nl", M, H - 22, { url: "mailto:info@actright.nl" });

  useBodyEm(doc, 8);
  doc.setTextColor(...ACCENT);
  doc.text(
    "act responsible   ·   act win-win   ·   act now",
    W - M,
    H - 22,
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
      y = drawTopicCard(doc, report.nuRelevant[i], i + 1, y, M, CW, H, "Wat nu relevant is");
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
      y = drawTopicCard(doc, report.binnenkortRelevant[i], i + 1, y, M, CW, H, "Binnenkort relevant");
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
