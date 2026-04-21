---
name: lead-webhook-hubspot
description: Gebruik bij alles rondom lead-capture en HubSpot-integratie in de
  ESG Quickscan. Activeert bij wijzigingen aan ESGLeadGate, bij het toevoegen
  van lead-velden, bij segmentatie-logica (hot/warm/koud), bij
  HubSpot-webhookfouten, of bij AVG-vereisten voor de submit-call. Bevat het
  exacte payload-schema voor HubSpot Forms API v3, veldmapping, env-vars en
  de lead-scoring uit de engine-output.
---

# Lead-webhook naar HubSpot

## Wanneer toepassen

- `src/components/ESGLeadGate.tsx` wordt aangepast.
- Er moeten velden bij/weg in de lead-submit.
- Lead-segmentatie (hot/warm/koud) moet aangepast op basis van
  engine-output.
- HubSpot ontvangt geen submissions of foute data.
- AVG-implicaties van de submit-call.

## Waarom HubSpot Forms API (niet Contacts API)

- Geen secret auth: `portalId` + `formGuid` zijn publiek, dus veilig
  client-side vanuit Vite.
- GDPR-aware: `legalConsentOptions` is first-class citizen.
- Triggert automatisch HubSpot-workflows per form, per lifecycle-stage.
- Rate limit van 50 req/s is ruim voor Quickscan-volumes.

Contacts API (`crm/v3/objects/contacts`) vereist een Private App token — **niet
client-side**. Alleen gebruiken vanuit een server-less function als er later
complexere logica nodig is (upsert, deduplicatie, associaties).

## Setup (eenmalig, door Act Right)

1. In HubSpot → **Marketing › Forms › Create form › Embedded form**.
2. Voeg deze velden toe (contact-properties — gebruik bestaande waar mogelijk):
   - `email` (standaard)
   - `firstname` (standaard)
   - `lastname` (standaard)
   - `company` (standaard)
   - `phone` (standaard)
   - `numemployees` (standaard; dropdown)
   - **Custom properties aanmaken** onder *Settings › Properties › Contact*:
     - `esg_sector` — dropdown, opties matchen Q03 in `questions.ts`
     - `esg_maturity_label` — dropdown: Startfase, Basis op orde, Structureren, Opschalen
     - `esg_lead_segment` — dropdown: hot, warm, koud
     - `esg_top_themes` — multi-line text (pipe-separated thema-IDs)
     - `esg_scan_date` — date
3. Onder *Legal and consent options* → kies "Legitimate interest" voor
   lead-verwerking en voeg één subscription type toe: *"ESG-updates Act Right"*
   (noteer het `subscriptionTypeId`).
4. Na opslaan: kopieer **Portal ID** en **Form GUID** uit de embed-code.
5. Zet in `.env.local`:
   ```env
   VITE_HUBSPOT_PORTAL_ID=12345678
   VITE_HUBSPOT_FORM_GUID=abcd1234-ef56-7890-ghij-klmnopqrstuv
   VITE_HUBSPOT_SUBSCRIPTION_ID=999
   ```
6. Voeg dezelfde keys toe aan je deploy-omgeving (Lovable secrets / Vercel /
   Netlify).

## Payload-schema

HubSpot Forms API v3 verwacht:

```ts
type HubSpotSubmission = {
  fields: Array<{
    objectTypeId: '0-1'; // 0-1 = contact
    name: string;        // property internal name
    value: string;       // altijd string
  }>;
  context?: {
    pageUri?: string;
    pageName?: string;
    hutk?: string;       // HubSpot tracking cookie, optioneel
  };
  legalConsentOptions: {
    consent: {
      consentToProcess: true;
      text: string;
      communications: Array<{
        value: boolean;
        subscriptionTypeId: number;
        text: string;
      }>;
    };
  };
};
```

Endpoint:
```
POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
```

## Implementatie-template

Maak `src/lib/submitLead.ts`:

```ts
import type { ContactInfo } from './esgEngine';
import type { ESGReport } from './esgEngine';

type LeadSegment = 'hot' | 'warm' | 'koud';

export function deriveLeadSegment(
  answers: Answers,
  report: ESGReport
): LeadSegment {
  const isLarge =
    answers.Q01 === '250+' ||
    answers.Q02 === '50M+' ||
    (parseFte(answers.Q01) >= 250 && parseOmzet(answers.Q02) >= 50_000_000);

  const hasKetenDruk =
    (answers.Q06 ?? []).includes('frequent') ||
    (answers.Q07 ?? []).includes('aanbesteding');

  const maturityReady =
    ['Basis op orde', 'Structureren', 'Opschalen'].includes(
      report.maturityLabel
    );

  if (isLarge && maturityReady) return 'hot';
  if (hasKetenDruk || isLarge) return 'warm';
  return 'koud';
}

export async function submitLead(
  contact: ContactInfo,
  answers: Answers,
  report: ESGReport
): Promise<{ ok: true } | { ok: false; error: string }> {
  const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID;
  const formGuid = import.meta.env.VITE_HUBSPOT_FORM_GUID;
  const subscriptionId = Number(import.meta.env.VITE_HUBSPOT_SUBSCRIPTION_ID);

  if (!portalId || !formGuid) {
    return { ok: false, error: 'HubSpot niet geconfigureerd' };
  }

  const segment = deriveLeadSegment(answers, report);
  const topThemes = report.themeScores
    .filter((t) => t.active)
    .slice(0, 3)
    .map((t) => t.id)
    .join('|');

  const body = {
    fields: [
      { objectTypeId: '0-1', name: 'email', value: contact.email },
      { objectTypeId: '0-1', name: 'firstname', value: contact.firstName },
      { objectTypeId: '0-1', name: 'lastname', value: contact.lastName },
      { objectTypeId: '0-1', name: 'company', value: contact.company },
      { objectTypeId: '0-1', name: 'phone', value: contact.phone ?? '' },
      { objectTypeId: '0-1', name: 'numemployees', value: answers.Q01 },
      { objectTypeId: '0-1', name: 'esg_sector', value: answers.Q03 },
      { objectTypeId: '0-1', name: 'esg_maturity_label', value: report.maturityLabel },
      { objectTypeId: '0-1', name: 'esg_lead_segment', value: segment },
      { objectTypeId: '0-1', name: 'esg_top_themes', value: topThemes },
      { objectTypeId: '0-1', name: 'esg_scan_date', value: new Date().toISOString().slice(0, 10) },
    ],
    context: {
      pageUri: window.location.href,
      pageName: 'ESG Quickscan Light',
      hutk: readHubspotCookie(),
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text:
          'Ik ga akkoord met de verwerking van mijn gegevens volgens de ' +
          'privacyverklaring van Act Right.',
        communications: [
          {
            value: contact.subscribeToUpdates,
            subscriptionTypeId: subscriptionId,
            text:
              'Ik ontvang graag relevante ESG-updates en whitepapers van ' +
              'Act Right.',
          },
        ],
      },
    },
  };

  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `HubSpot ${res.status}: ${err}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function readHubspotCookie(): string | undefined {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith('hubspotutk='))
    ?.split('=')[1];
}
```

## Integratie in ESGLeadGate.tsx

```tsx
const onSubmit = async (data: LeadFormData) => {
  setSubmitting(true);
  const result = await submitLead(data, answers, report);
  if (!result.ok) {
    toast.error('Kon rapport niet versturen — probeer opnieuw.');
    console.error(result.error);
    setSubmitting(false);
    return;
  }
  onComplete(data); // toont ESGReport
};
```

## UX-regels

- **Double-submit:** disable de button tot de response binnen is.
- **Netwerkfout:** toon rapport tóch (de gebruiker heeft het verdiend), log
  error in Sentry/console. Faalmodus: stille data-loss is erger dan retry-UX.
- **Retry:** één automatische retry na 2s bij 5xx, niet bij 4xx.
- **PII in logs:** nooit `body` of `contact` loggen in production.

## Testing-checklist

- [ ] `deriveLeadSegment` unit-test voor elk van de 3 segmenten (zie
      `esg-engine-tester` skill).
- [ ] Integration: mock `fetch`, verifieer payload-shape.
- [ ] E2E: echte form-submit tegen een HubSpot test-portal.
- [ ] AVG: verifieer dat bij `subscribeToUpdates = false` de communications-entry
      `value: false` heeft.

## Anti-patterns

- ❌ Geen Contacts API client-side (lekt Private App token).
- ❌ Geen PII in query params of URL.
- ❌ Geen `fields` als object — moet altijd array zijn.
- ❌ Geen submissie zonder `legalConsentOptions` — HubSpot weigert of logt als
  onrechtmatig.
- ❌ Niet de submit blokkeren op `hutk`-cookie (sommige browsers blokkeren
  third-party cookies — maak het optioneel).

## Bronnen

- HubSpot Forms API v3: https://developers.hubspot.com/docs/api/marketing/forms
- Legal consent options: https://developers.hubspot.com/docs/api/marketing/forms#legal-consent-options
- Contact properties API: https://developers.hubspot.com/docs/api/crm/properties
