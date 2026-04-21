// HubSpot Forms API v3 integratie voor ESG Quickscan Light.
// Zie .claude/skills/lead-webhook-hubspot/SKILL.md en scripts/hubspot-setup.ps1.
//
// Het HubSpot-form is aangemaakt met `legalConsentOptions.type = legitimate_interest`.
// AVG-consent (required) en marketing-opt-in worden in onze eigen React-form
// opgevangen; de opt-in landt in HubSpot als het custom property
// `esg_marketing_optin` en kan via een HubSpot-workflow worden doorvertaald
// naar een subscription.

import type { Answers, ContactInfo, ESGReport } from "./esgEngine";

export type LeadFormData = ContactInfo & {
  consentProcessing: boolean;
  subscribeToUpdates: boolean;
};

export type LeadSegment = "hot" | "warm" | "koud";

/**
 * Bepaal hot/warm/koud op basis van bedrijfsomvang, ketendruk en
 * ESG-volwassenheid.
 */
export function deriveLeadSegment(
  answers: Answers,
  report: ESGReport
): LeadSegment {
  const isLargeByFte = answers["Q01"] === "250+";
  const isLargeByRevenue = answers["Q02"] === "> €50 mln";
  const isLarge = isLargeByFte || isLargeByRevenue;

  const q06 = answers["Q06"] as string | undefined;
  const q07 = answers["Q07"] as string | undefined;
  const hasKetenDruk =
    q06 === "Regelmatig" ||
    q06 === "Vaak / structureel" ||
    q07 === "Regelmatig" ||
    q07 === "Ja, dit is een belangrijk deel van onze omzet";

  const ready =
    report.maturityLabel === "Basis op orde brengen" ||
    report.maturityLabel === "Structureren" ||
    report.maturityLabel === "Opschalen";

  if (isLarge && ready) return "hot";
  if (isLarge || hasKetenDruk) return "warm";
  return "koud";
}

function topActiveThemeIds(report: ESGReport, n = 3): string {
  return report.themeScores
    .filter((t) => t.active)
    .slice(0, n)
    .map((t) => t.theme.id)
    .join("|");
}

function readHubspotCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("hubspotutk="))
    ?.split("=")[1];
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * POST de lead naar HubSpot Forms API v3. Faalt zachtjes: als HubSpot
 * onbereikbaar is toont Index.tsx het rapport tóch.
 */
export async function submitLead(
  form: LeadFormData,
  answers: Answers,
  report: ESGReport
): Promise<SubmitResult> {
  const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID as string | undefined;
  const formGuid = import.meta.env.VITE_HUBSPOT_FORM_GUID as string | undefined;

  if (!portalId || !formGuid) {
    return {
      ok: false,
      error:
        "HubSpot niet geconfigureerd. Run scripts/hubspot-setup.ps1 of zet VITE_HUBSPOT_PORTAL_ID en VITE_HUBSPOT_FORM_GUID handmatig in .env.local.",
    };
  }

  const segment = deriveLeadSegment(answers, report);
  const topThemes = topActiveThemeIds(report, 3);
  const scanDate = new Date().toISOString().slice(0, 10);

  const fields = [
    { objectTypeId: "0-1" as const, name: "email", value: form.email },
    { objectTypeId: "0-1" as const, name: "firstname", value: form.firstName },
    { objectTypeId: "0-1" as const, name: "lastname", value: form.lastName },
    { objectTypeId: "0-1" as const, name: "company", value: form.companyName },
    { objectTypeId: "0-1" as const, name: "phone", value: form.phone ?? "" },
    { objectTypeId: "0-1" as const, name: "numemployees", value: form.employees ?? "" },
    { objectTypeId: "0-1" as const, name: "esg_sector", value: (answers["Q03"] as string) ?? "" },
    { objectTypeId: "0-1" as const, name: "esg_maturity_label", value: report.maturityLabel },
    { objectTypeId: "0-1" as const, name: "esg_lead_segment", value: segment },
    { objectTypeId: "0-1" as const, name: "esg_top_themes", value: topThemes },
    { objectTypeId: "0-1" as const, name: "esg_primary_driver", value: report.primaryDriver },
    { objectTypeId: "0-1" as const, name: "esg_scan_date", value: scanDate },
    {
      objectTypeId: "0-1" as const,
      name: "esg_marketing_optin",
      value: form.subscribeToUpdates ? "true" : "false",
    },
  ];

  const body = {
    fields,
    context: {
      pageUri: typeof window !== "undefined" ? window.location.href : undefined,
      pageName: "ESG Quickscan Light",
      hutk: readHubspotCookie(),
    },
  };

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `HubSpot ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
