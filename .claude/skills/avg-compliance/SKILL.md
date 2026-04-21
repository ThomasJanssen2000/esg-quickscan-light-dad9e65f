---
name: avg-compliance
description: Gebruik bij alles rondom AVG/GDPR in de ESG Quickscan. Activeert
  bij wijzigingen aan ESGLeadGate (consent, velden), bij privacyverklaring-werk,
  bij retentie- of SAR-functionaliteit, bij cookies/tracking, of bij review van
  de submit-flow naar HubSpot. Bevat minimum-eisen, consent-teksten,
  rechtsgrondslag-keuze, bewaartermijnen, en koppeling met HubSpot's
  GDPR-features.
---

# AVG Compliance voor de ESG Quickscan

## Wanneer toepassen

- Lead-formulier wordt aangepast (`ESGLeadGate.tsx`).
- Privacyverklaring moet opgesteld of bijgewerkt worden.
- Cookies of tracking-scripts worden toegevoegd.
- Een bezoeker vraagt om inzage, correctie, verwijdering (SAR).
- Review vóór release: is de lead-flow AVG-proof?

## Status nu (gaps)

Uit code-audit van `ESGLeadGate.tsx`:

- ✅ Consent-checkbox bestaat.
- ❌ Link naar privacyverklaring loopt naar `#` — **blocker**.
- ❌ Geen expliciete rechtsgrondslag zichtbaar in UI.
- ❌ Geen vermelding bewaartermijn.
- ❌ Geen "Ik ontvang graag updates"-checkbox afgescheiden van de
  verwerkings-consent — dit moet gesplitst zijn (ja, verwerking voor rapport;
  apart: ja/nee marketingcommunicatie).

Alle vier zijn nodig voordat de Quickscan live mag.

## Rechtsgrondslag

Voor deze use-case:

| Verwerking | Rechtsgrond | Motivatie |
|---|---|---|
| Lead-data opslaan voor rapportlevering | Uitvoering overeenkomst (art. 6(1)(b)) | De gebruiker vraagt actief om een rapport; data is nodig om het te leveren. |
| Marketing-communicatie (ESG-updates, whitepapers) | Toestemming (art. 6(1)(a)) | Apart checkbox, opt-in, intrekbaar. |
| Contact opnemen voor discovery-gesprek | Gerechtvaardigd belang (art. 6(1)(f)) | De gebruiker heeft zelf ESG-interesse getoond; beperkt aantal follow-ups. |

**Nooit** beide consents bundelen in één checkbox — dat is niet "vrije"
toestemming volgens de AP.

## Minimum-eisen in de UI

### Consent-block in `ESGLeadGate.tsx`

```tsx
<div className="space-y-3 text-sm">
  <label className="flex gap-2 items-start">
    <Checkbox {...register('consentProcessing', { required: true })} />
    <span>
      Ik ga akkoord met de verwerking van mijn gegevens om het ESG-rapport
      te genereren en via e-mail te ontvangen. Lees de{' '}
      <a href="/privacyverklaring" className="underline" target="_blank">
        privacyverklaring
      </a>
      .
    </span>
  </label>

  <label className="flex gap-2 items-start">
    <Checkbox {...register('subscribeToUpdates')} />
    <span>
      Ja, ik ontvang graag maximaal 1× per maand relevante ESG-updates,
      whitepapers en uitnodigingen van Act Right. Ik kan me op elk moment
      uitschrijven.
    </span>
  </label>
</div>
```

De eerste is `required`, de tweede niet. Het niet-aanvinken van de tweede
mag **nooit** de submit blokkeren.

### Submit-button disclaimer

Onder de submit-button, klein:

> We bewaren uw gegevens maximaal 24 maanden, tenzij u eerder verwijdering
> vraagt. Beheren of verwijderen kan via privacy@actright.nl.

## Privacyverklaring (minimum-inhoud)

Zet op `/privacyverklaring` (nieuwe route). Moet bevatten:

1. **Verwerkingsverantwoordelijke**: Act Right, adres, KvK, AVG-contact.
2. **Welke gegevens**: naam, e-mailadres, bedrijfsnaam, telefoon (optioneel),
   FTE-klasse, ingevulde quickscan-antwoorden, lead-segment, HubSpot tracking
   cookie (als actief).
3. **Doelen**: (a) rapport genereren en versturen, (b) marketing (alleen bij
   opt-in), (c) commerciële follow-up (gerechtvaardigd belang).
4. **Rechtsgrondslag**: per doel expliciet (zie tabel hierboven).
5. **Ontvangers / verwerkers**: HubSpot (CRM, EU-datacenter — noteer
   specifiek), e-maildienst indien gescheiden, hosting (Lovable/Vercel).
6. **Doorgifte buiten EER**: HubSpot US — benoem SCC's + Data Privacy
   Framework.
7. **Bewaartermijn**: 24 maanden na laatste interactie, tenzij klant wordt.
   Bij klantrelatie: bewaartermijn conform Act Right's klant-privacybeleid.
8. **Rechten betrokkenen**: inzage, correctie, verwijdering, bezwaar,
   beperking, dataportabiliteit, klacht bij AP.
9. **Hoe rechten uitoefenen**: privacy@actright.nl (SLA: 1 maand).
10. **Cookies**: welke, wat doen ze, hoe weigeren.
11. **Wijzigingen**: versiedatum + hoe wijzigingen worden gecommuniceerd.

## HubSpot-koppeling

Zorg dat HubSpot AVG-conform is ingericht:

- **Datacenter**: EU (niet US) als dat beschikbaar is in je HubSpot-contract.
  Zo niet: documenteer de Data Privacy Framework + SCC's in de
  privacyverklaring.
- **GDPR-veldjes op contact-object**: HubSpot heeft standaard
  `Legal basis for processing` en `Subscription` fields — vul deze via de
  Forms API `legalConsentOptions` (zie `lead-webhook-hubspot` skill).
- **Subscription types**: één aparte voor "ESG-updates Act Right". Niet
  alle leads in de generieke marketinglijst.
- **Automatic deletion**: stel in HubSpot een workflow in die contacten
  ouder dan 24 maanden zonder interactie automatisch markeert voor
  verwijdering (of anonimiseert).
- **Data Processing Agreement**: Act Right moet een DPA met HubSpot
  hebben — te downloaden via HubSpot Legal.

## SAR-flow (Subject Access Request)

Simpele implementatie voor schaal van de Quickscan:

1. Bezoeker mailt naar `privacy@actright.nl`.
2. Act Right-medewerker zoekt contact in HubSpot.
3. Gebruikt HubSpot's **GDPR-delete endpoint**:
   ```
   POST /crm/v3/objects/contacts/gdpr-delete
   {
     "idProperty": "email",
     "objectId": "user@example.com"
   }
   ```
4. Bevestiging sturen aan de bezoeker.

Nog niet automatiseren zolang volumes <500/maand zijn — overhead niet waard.

## Cookies

Als de Quickscan **alleen** functionele state gebruikt (form-state in
React): geen cookie banner nodig.

**Zodra** je één van deze toevoegt, wél:
- HubSpot tracking pixel (`hs-script-loader`)
- Google Analytics / GTM
- Andere marketing-pixels (LinkedIn, Meta)

Dan: cookie consent banner nodig vóór het plaatsen, met granular opt-in
per categorie (functioneel / statistiek / marketing). **Niet** "door
gebruik van deze site accepteert u cookies" — die is niet geldig onder AVG.

Gebruik bv. [klaro](https://github.com/kiprotect/klaro) of
[cookieconsent](https://www.cookieconsent.com) — of bouw een eenvoudige
component zelf (drie checkboxes).

## DPIA

Een Data Protection Impact Assessment is **niet** verplicht voor deze
use-case (geen gevoelige gegevens, geen grote schaal, geen profiling met
rechtsgevolgen). Het lead-segment (hot/warm/koud) is wel een vorm van
profilering maar valt onder de uitzondering "geen aanzienlijke gevolgen
voor de betrokkene".

Als er later AI-gegenereerde personal advice komt of data van minderjarigen:
DPIA opnieuw overwegen.

## Testing-checklist (pre-release)

- [ ] `/privacyverklaring` route werkt en is inhoudelijk compleet.
- [ ] Consent-checkbox is `required`; marketing-opt-in is niet.
- [ ] Submit zonder marketing-opt-in werkt en `subscribeToUpdates = false`
      landt correct in HubSpot.
- [ ] E-mail naar `privacy@actright.nl` bestaat en wordt gemonitord.
- [ ] HubSpot contact krijgt `legal_basis` en `esg_lead_segment` gevuld.
- [ ] Geen PII in console.log of network requests naar third parties.
- [ ] Cookie banner (als actief) blokkeert tracking tot opt-in.
- [ ] Bewaartermijn-workflow in HubSpot is geconfigureerd.

## Anti-patterns

- ❌ Verwerkings-consent en marketing-consent in één checkbox.
- ❌ Pre-checked checkboxes.
- ❌ Privacyverklaring als modaal die alleen bij submit verschijnt.
- ❌ Data naar US-servers zonder expliciete vermelding en SCC's.
- ❌ Retentie-beleid ontbreekt ("we bewaren het voor altijd").
- ❌ Footer-link "Privacy" die naar 404 loopt.
- ❌ HubSpot tracking pixel laden vóór consent.

## Bronnen

- **AVG-tekst**: https://eur-lex.europa.eu/eli/reg/2016/679
- **AP-richtsnoeren**: https://autoriteitpersoonsgegevens.nl
- **EDPB-guidelines**: https://edpb.europa.eu/our-work-tools/our-documents/guidelines_en
- **HubSpot GDPR**: https://legal.hubspot.com/data-processing-agreement
- **HubSpot GDPR delete API**: https://developers.hubspot.com/docs/api/crm/contacts
