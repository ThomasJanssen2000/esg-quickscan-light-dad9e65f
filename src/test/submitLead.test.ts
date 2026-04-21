import { describe, it, expect } from "vitest";
import { calculateReport } from "@/lib/esgEngine";
import { deriveLeadSegment, submitLead } from "@/lib/submitLead";
import type { LeadFormData } from "@/lib/submitLead";
import {
  kleinICTDienstverlening,
  middelgrootFoodProductie,
  grootBouwAanbestedingen,
} from "./fixtures/personas";

describe("deriveLeadSegment", () => {
  it("klein ICT, alleen interesse → koud", () => {
    const report = calculateReport(kleinICTDienstverlening);
    expect(deriveLeadSegment(kleinICTDienstverlening, report)).toBe("koud");
  });

  it("middelgroot food met regelmatige ESG-vragen en aanbestedingen → warm of hot", () => {
    const report = calculateReport(middelgrootFoodProductie);
    const segment = deriveLeadSegment(middelgrootFoodProductie, report);
    expect(["warm", "hot"]).toContain(segment);
  });

  it("grote bouw met aanbestedingen + volwassenheid → hot", () => {
    const report = calculateReport(grootBouwAanbestedingen);
    expect(deriveLeadSegment(grootBouwAanbestedingen, report)).toBe("hot");
  });

  it("grootte-criterium door omzet (> €50 mln) is voldoende voor warm", () => {
    const answers = { ...kleinICTDienstverlening, Q02: "> €50 mln" };
    const report = calculateReport(answers);
    const segment = deriveLeadSegment(answers, report);
    expect(segment === "warm" || segment === "hot").toBe(true);
  });
});

describe("submitLead environment guard", () => {
  it("retourneert een nette error als HubSpot-env niet gezet is", async () => {
    // In de test-omgeving zijn VITE_HUBSPOT_PORTAL_ID en _FORM_GUID niet gezet.
    const form: LeadFormData = {
      firstName: "Test",
      lastName: "Gebruiker",
      companyName: "Testbedrijf",
      email: "test@example.com",
      consentProcessing: true,
      subscribeToUpdates: false,
    };
    const report = calculateReport(kleinICTDienstverlening);
    const result = await submitLead(form, kleinICTDienstverlening, report);
    // Ontbrekende config moet falen met een duidelijke melding, niet met een crash.
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/HubSpot niet geconfigureerd/i);
    }
  });
});
