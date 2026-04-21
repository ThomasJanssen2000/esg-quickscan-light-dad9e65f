// HubSpot Forms API v3 integratie voor ESG Quickscan Light
// Zie .claude/skills/lead-webhook-hubspot/SKILL.md voor het volledige ontwerp.

import type { Answers, ContactInfo, ESGReport } from "./esgEngine";

export type LeadFormData = ContactInfo & {
  consentProcessing: boolean;
  subscribeToUpdates: boolean;
};

export type LeadSegment = "hot" | "warm" | "koud";

/**
 * Bepaal hot/warm/koud op basis van bedrijfsomvang, ketendruk en
 * ESG-volwassenheid. Gebruikt door sales om follow-up te prioriteren.
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
 * onbereikbaar is moet de UX het rapport wél tonen (de gebruiker heeft
 * recht op hun rapport).
 */
export async function submitLead(
  form: LeadFormData,
  answers: Answers,
  report: ESGReport
): Promise<SubmitResult> {
  const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID as string | undefined;
  const formGuid = import.meta.env.VITE_HUBSPOT_FORM_GUID as string | undefined;
  const subscriptionIdRaw = import.meta.env.VITE_HUBSPOT_SUBSCRIPTION_ID as
    | string
    | undefined;

  if (!portalId || !formGuid) {
    return {
      ok: false,
      error:
        "HubSpot niet geconfigureerd. Zet VITE_HUBSPOT_PORTAL_ID en VITE_HUBSPOT_FORM_GUID in .env.local.",
    };
  }

  const segment = deriveLeadSegment(answers, report);
  const topThemes = topActiveThemeIds(report, 3);
  const scanDate = new Date().toISOString().slice(0, 10);
  const subscriptionId = subscriptionIdRaw ? Number(subscriptionIdRaw) : undefined;

  const fields: Array<{ objectTypeId: "0-1"; name: string; value: string }> = [
    { objectTypeId: "0-1", name: "email", value: form.email },
    { objectTypeId: "0-1", name: "firstname", value: form.firstName },
    { objectTypeId: "0-1", name: "lastname", value: form.lastName },
    { objectTypeId: "0-1", name: "company", value: form.companyName },
    { objectTypeId: "0-1", name: "phone", value: form.phone ?? "" },
    { objectTypeId: "0-1", name: "numemployees", value: form.employees ?? "" },
    { objectTypeId: "0-1", name: "esg_sector", value: (answers["Q03"] as string) ?? "" },
    { objectTypeId: "0-1", name: "esg_maturity_label", value: report.maturityLabel },
    { objectTypeId: "0-1", name: "esg_lead_segment", value: segment },
    { objectTypeId: "0-1", name: "esg_top_themes", value: topThemes },
    { objectTypeId: "0-1", name: "esg_primary_driver", value: report.primaryDriver },
    { objectTypeId: "0-1", name: "esg_scan_date", value: scanDate },
  ];

  const communications =
    subscriptionId !== undefined
      ? [
          {
            value: form.subscribeToUpdates,
            subscriptionTypeId: subscriptionId,
            text:
              "Ik ontvang graag maximaal 1 keer per maand relevante ESG-updates, " +
              "whitepapers en uitnodigingen van Act Right.",
          },
        ]
      : [];

  const body = {
    fields,
    context: {
      pageUri: typeof window !== "undefined" ? window.location.href : undefined,
      pageName: "ESG Quickscan Light",
      hutk: readHubspotCookie(),
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text:
          "Ik ga akkoord met de verwerking van mijn gegevens volgens de " +
          "privacyverklaring van Act Right, om mijn ESG-rapport te ontvangen.",
        communications,
      },
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
