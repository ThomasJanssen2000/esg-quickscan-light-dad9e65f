import { describe, it, expect } from "vitest";
import { calculateReport } from "@/lib/esgEngine";
import { deriveLeadSegment } from "@/lib/submitLead";
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

describe("HubSpot config", () => {
  it("levert non-lege Portal ID en Form GUID zodat submitLead nooit zonder config draait", async () => {
    const { HUBSPOT_PORTAL_ID, HUBSPOT_FORM_GUID } = await import(
      "@/config/hubspot"
    );
    expect(HUBSPOT_PORTAL_ID).toMatch(/^\d{5,}$/);
    expect(HUBSPOT_FORM_GUID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });
});
