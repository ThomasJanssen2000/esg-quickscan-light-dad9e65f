import { describe, it, expect } from "vitest";
import { calculateReport } from "@/lib/esgEngine";
import {
  kleinICTDienstverlening,
  middelgrootFoodProductie,
  grootBouwAanbestedingen,
  retailElektronicaBuitenEU,
} from "./fixtures/personas";

describe("Persona: klein ICT-dienstverlening (0-9 FTE, alleen NL, alleen diensten)", () => {
  const report = calculateReport(kleinICTDienstverlening);

  it("krijgt maturity 'Startfase'", () => {
    expect(report.maturityLabel).toBe("Startfase");
  });

  it("levert 5 actiestappen", () => {
    expect(report.acties).toHaveLength(5);
  });

  it("heeft géén CSRD / EU Taxonomie in nuRelevant", () => {
    const subjects = report.nuRelevant.map((t) => t.topic.subject).join(" | ");
    expect(subjects).not.toMatch(/CSRD|Taxonomie/i);
  });

  it("noemt CSRD of vergelijkbare 'vaak overschatte' onderwerpen in geenPrioriteit", () => {
    expect(report.geenPrioriteit.length).toBeGreaterThan(0);
  });
});

describe("Persona: middelgroot food-productie (50-249 FTE, palmolie, EU-keten)", () => {
  const report = calculateReport(middelgrootFoodProductie);

  it("heeft 'Basis op orde brengen' of hoger als maturity", () => {
    expect(["Basis op orde brengen", "Structureren", "Opschalen"]).toContain(
      report.maturityLabel
    );
  });

  it("activeert thema ketenbeheer (T4) door palmolie", () => {
    const t4 = report.themeScores.find((t) => t.theme.id === "T4");
    expect(t4?.active).toBe(true);
  });

  it("activeert thema energie & klimaat (T2) door productielocatie + hoog energieverbruik", () => {
    const t2 = report.themeScores.find((t) => t.theme.id === "T2");
    expect(t2?.active).toBe(true);
  });

  it("heeft minstens één 'Nu verplicht' topic", () => {
    const heeftNuVerplicht = report.nuRelevant.some(
      (t) => t.label === "Nu verplicht"
    );
    expect(heeftNuVerplicht).toBe(true);
  });
});

describe("Persona: grote bouw met aanbestedingen (250+ FTE, CO2-Ladder)", () => {
  const report = calculateReport(grootBouwAanbestedingen);

  it("krijgt 'Structureren' of 'Opschalen' als maturity", () => {
    expect(["Structureren", "Opschalen"]).toContain(report.maturityLabel);
  });

  it("activeert aanbestedingsthema (T7)", () => {
    const t7 = report.themeScores.find((t) => t.theme.id === "T7");
    expect(t7?.active).toBe(true);
  });

  it("primaryDriver is 'Aanbestedingen'", () => {
    expect(report.primaryDriver).toBe("Aanbestedingen");
  });

  it("noemt meerdere actieve thema's (minimaal 4)", () => {
    const actieve = report.themeScores.filter((t) => t.active);
    expect(actieve.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Persona: retail met elektronica-import uit buiten EU", () => {
  const report = calculateReport(retailElektronicaBuitenEU);

  it("activeert ketenbeheer (T4) door import buiten EU + 3TG", () => {
    const t4 = report.themeScores.find((t) => t.theme.id === "T4");
    expect(t4?.active).toBe(true);
  });

  it("activeert product- & circulariteitsthema (T3) door elektronica + batterijen", () => {
    const t3 = report.themeScores.find((t) => t.theme.id === "T3");
    expect(t3?.active).toBe(true);
  });
});

describe("Shape-stabiliteit van report-output", () => {
  it("levert voor elke persona dezelfde top-level keys", () => {
    const reports = [
      calculateReport(kleinICTDienstverlening),
      calculateReport(middelgrootFoodProductie),
      calculateReport(grootBouwAanbestedingen),
      calculateReport(retailElektronicaBuitenEU),
    ];
    for (const r of reports) {
      expect(r).toHaveProperty("profileType");
      expect(r).toHaveProperty("summary");
      expect(r).toHaveProperty("maturityLabel");
      expect(r).toHaveProperty("themeScores");
      expect(r).toHaveProperty("nuRelevant");
      expect(r).toHaveProperty("binnenkortRelevant");
      expect(r).toHaveProperty("geenPrioriteit");
      expect(r).toHaveProperty("acties");
      expect(Array.isArray(r.acties)).toBe(true);
    }
  });
});
