import jsPDF from "jspdf";
import "jspdf-autotable";
import type { ESGReport, FrameworkAssessment } from "./esgScoring";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export function generateESGPdf(report: ESGReport, companyName: string): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const navy = [17, 33, 66] as const;
  const green = [22, 163, 126] as const;
  const gray = [107, 114, 128] as const;
  const red = [220, 38, 38] as const;
  const yellow = [202, 138, 4] as const;

  function addPageIfNeeded(needed: number) {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  }

  function sectionTitle(title: string) {
    addPageIfNeeded(20);
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 2;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 8;
  }

  // --- Header ---
  doc.setFillColor(17, 33, 66);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ESG Quickscan Light — Rapport", margin, 22);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(companyName, margin, 32);
  doc.setFontSize(9);
  doc.text(`Gegenereerd op ${new Date().toLocaleDateString("nl-NL")}`, margin, 40);
  y = 55;

  // --- Overall Score ---
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, "F");
  doc.setTextColor(...navy);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(`${report.overallScore}`, margin + 12, y + 20);
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text("/ 100", margin + 28, y + 20);
  doc.setFontSize(16);
  doc.setTextColor(...green);
  doc.setFont("helvetica", "bold");
  doc.text(report.maturityLevel, margin + 55, y + 16);
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(report.maturityDescription, contentWidth - 60);
  doc.text(descLines, margin + 55, y + 23);
  y += 42;

  // --- Category Scores ---
  sectionTitle("Score per thema");
  report.categoryScores.forEach((c) => {
    addPageIfNeeded(10);
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "normal");
    doc.text(c.label, margin, y + 4);
    // Bar background
    const barX = margin + 55;
    const barW = contentWidth - 70;
    doc.setFillColor(230, 232, 236);
    doc.roundedRect(barX, y, barW, 5, 1, 1, "F");
    // Bar fill
    const fillColor: readonly [number, number, number] = c.percentage >= 60 ? green : c.percentage >= 40 ? yellow : red;
    doc.setFillColor(...fillColor);
    doc.roundedRect(barX, y, barW * (c.percentage / 100), 5, 1, 1, "F");
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.text(`${c.percentage}%`, margin + contentWidth - 10, y + 4);
    y += 9;
  });

  // --- Risks ---
  sectionTitle("Geïdentificeerde risico's");
  report.risks.forEach((r) => {
    addPageIfNeeded(12);
    doc.setFillColor(254, 242, 242);
    const lines = doc.splitTextToSize(r, contentWidth - 12);
    const blockH = lines.length * 4.5 + 4;
    doc.roundedRect(margin, y - 2, contentWidth, blockH, 1.5, 1.5, "F");
    doc.setFontSize(9);
    doc.setTextColor(153, 27, 27);
    doc.setFont("helvetica", "normal");
    doc.text(lines, margin + 6, y + 3);
    y += blockH + 3;
  });

  // --- Opportunities ---
  sectionTitle("Kansen");
  report.opportunities.forEach((o) => {
    addPageIfNeeded(12);
    doc.setFillColor(236, 253, 245);
    const lines = doc.splitTextToSize(o, contentWidth - 12);
    const blockH = lines.length * 4.5 + 4;
    doc.roundedRect(margin, y - 2, contentWidth, blockH, 1.5, 1.5, "F");
    doc.setFontSize(9);
    doc.setTextColor(6, 95, 70);
    doc.setFont("helvetica", "normal");
    doc.text(lines, margin + 6, y + 3);
    y += blockH + 3;
  });

  // --- Priorities ---
  sectionTitle("Prioriteiten voor de korte termijn");
  report.priorities.forEach((p, i) => {
    addPageIfNeeded(12);
    const lines = doc.splitTextToSize(p, contentWidth - 16);
    const blockH = lines.length * 4.5 + 4;
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin, y - 2, contentWidth, blockH, 1.5, 1.5, "F");
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}.`, margin + 3, y + 3);
    doc.setFont("helvetica", "normal");
    doc.text(lines, margin + 10, y + 3);
    y += blockH + 3;
  });

  // --- Frameworks ---
  sectionTitle("Regelgeving, standaarden & frameworks");

  const statusGroups: { label: string; items: FrameworkAssessment[] }[] = [
    { label: "Verplicht", items: report.frameworks.filter((f) => f.status === "verplicht") },
    { label: "Waarschijnlijk relevant", items: report.frameworks.filter((f) => f.status === "waarschijnlijk relevant") },
    { label: "Aanbevolen", items: report.frameworks.filter((f) => f.status === "aanbevolen") },
    { label: "Vrijwillig", items: report.frameworks.filter((f) => f.status === "vrijwillig") },
    { label: "Nog niet van toepassing", items: report.frameworks.filter((f) => f.status === "nog niet van toepassing") },
  ];

  statusGroups.forEach((group) => {
    if (group.items.length === 0) return;
    addPageIfNeeded(15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const groupColor: readonly [number, number, number] = group.label === "Verplicht" ? red : group.label === "Waarschijnlijk relevant" ? yellow : group.label === "Aanbevolen" ? green : gray;
    doc.setTextColor(...groupColor);
    doc.text(group.label.toUpperCase(), margin, y);
    y += 6;

    group.items.forEach((fw) => {
      addPageIfNeeded(20);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text(`${fw.name}`, margin + 2, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      doc.text(`  ·  ${fw.type}`, margin + 2 + doc.getTextWidth(fw.name), y);
      y += 4;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(fw.fullName, margin + 2, y);
      y += 4;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const reasonLines = doc.splitTextToSize(fw.reason, contentWidth - 6);
      doc.text(reasonLines, margin + 2, y);
      y += reasonLines.length * 4;
      if (fw.actionRequired) {
        doc.setTextColor(...green);
        doc.setFont("helvetica", "bold");
        const actionLines = doc.splitTextToSize(`→ ${fw.actionRequired}`, contentWidth - 6);
        doc.text(actionLines, margin + 2, y);
        y += actionLines.length * 4;
      }
      y += 4;
    });
    y += 2;
  });

  // --- Footer CTA ---
  addPageIfNeeded(30);
  y += 5;
  doc.setFillColor(17, 33, 66);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Klaar voor de volgende stap?", margin + 8, y + 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Neem contact op met Act Right voor een volledige ESG Quickscan — info@actright.nl", margin + 8, y + 18);
  doc.text("www.actright.nl", margin + 8, y + 24);

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(`© Act Right — ESG Quickscan Light`, margin, 290);
    doc.text(`Pagina ${i} / ${totalPages}`, pageWidth - margin - 20, 290);
  }

  return doc;
}
