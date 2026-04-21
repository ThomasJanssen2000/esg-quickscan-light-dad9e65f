---
name: esg-rules-maintainer
description: Gebruik bij het toevoegen, wijzigen of verwijderen van ESG-rules,
  topics of thema's in src/data/. Activeert bij nieuwe wetgeving (CSRD Omnibus,
  ESRS-updates, CBAM-fases, EUDR, CSDDD, VSME, nationale regelingen), bij
  horizon-wijzigingen (ingangsdatum schuift), bij sector-specifieke updates, of
  bij feedback uit adviespraktijk dat de rulebase onjuist triggered. Bevat
  schema-documentatie, stap-voor-stap proces, bronlijst en wetgevings-context
  2026.
---

# ESG Rules Maintainer

## Wanneer toepassen

- Nieuwe EU- of NL-regelgeving is gepubliceerd of van kracht geworden.
- Bestaande rule triggert op verkeerde bedrijfsprofielen (false positive /
  negative).
- Horizon moet schuiven (bv. Stop-the-Clock-uitstel, delegated act-publicatie).
- Sector-specifieke regel toevoegen.
- Topic herformuleren voor betere klant-communicatie.

## Schema (read first)

**`src/data/questions.ts`** — vragen + antwoord-enums. Elke Q heeft `id`,
`type` (single/multi), `options[]` met `id` en `label`.

**`src/data/rules.ts`** — if-then rules. Elke rule:
- `id` (unique, kebab-case)
- trigger: predikaat op `answers` (kan compositie zijn)
- `themeImpacts`: record van themeId → score-delta
- `activateTopics`: topic-id's die geraakt worden
- `preferredLabel`: `Nu verplicht` | `Hoog relevant via keten` | `Marktstandaard` | `Sector vervolgonderzoek` | `Monitoren` | `Mogelijk relevant · nadere toetsing` | `Niet prioritair`
- `horizon`: `Nu` | `1-3 jaar` | `Monitor`
- `reason`: korte tekst die in het rapport verschijnt

**`src/data/topics.ts`** — ESG-onderwerpen. Elke topic:
- `id` (unique)
- `category` (matcht themeId)
- `subject` (display-naam)
- `type`: `Wetgeving` | `Best Practice` | `Certificering`
- `pillar`: `E` | `S` | `G`
- `direct` | `indirect`
- `description`, `whenRelevant`, `sourceUrl`

**`src/data/themes.ts`** — 8 thema's met `id` (T1–T8), `name`, `description`,
`scope`.

## Stap-voor-stap: nieuwe wet toevoegen

### 1. Onderzoek de wetgeving

Noteer:
- **Bron** (officiële publicatie): EUR-Lex voor EU, officielebekendmakingen.nl
  voor NL.
- **Ingangsdatum** (en reporting-start als die later valt).
- **Scope**: welke bedrijven? (omvang, sector, product, keten).
- **Verplichting**: wat moet er gebeuren? (rapporteren, meten, mitigeren,
  certificeren).
- **Sancties / handhaver**: wie handhaaft?
- **Horizon**: Nu (per direct) / 1-3 jaar (aankomend) / Monitor (waarschijnlijk
  maar onzeker).

### 2. Koppel aan bestaande vragen

Kan de rule triggeren op wat al wordt uitgevraagd in `questions.ts`?

- **Ja** → door naar stap 4.
- **Nee** → stap 3.

### 3. Vraag uitbreiden (alleen als écht nodig)

Het toevoegen van een vraag verhoogt drop-off. Weeg af of:
- een bestaande vraag-enum uitgebreid kan worden (bv. nieuwe sector-optie)
- of de rule afgeleid kan worden uit combinatie van bestaande antwoorden
- of de regel bewust breder triggert en als `Sector vervolgonderzoek` wordt
  gelabeld (gebruiker krijgt "check of dit op u van toepassing is")

Alleen als géén van deze werkt: nieuwe vraag. Dan:
- update `questions.ts`
- migratiepad voor oude antwoorden (optional field, default-value)
- update persona-fixtures in tests

### 4. Topic aanmaken (of hergebruiken)

Als de wet een onderwerp is dat nog niet bestaat: nieuwe entry in
`topics.ts`. Voorbeeld:

```ts
{
  id: 'cbam-2026-finalphase',
  category: 'T3', // Product & circulariteit
  subject: 'CBAM — definitieve fase (certificaatkoop vanaf 2026)',
  type: 'Wetgeving',
  pillar: 'E',
  direct: true,
  description:
    'Importeurs van staal, aluminium, cement, kunstmest, waterstof en ' +
    'elektriciteit uit buiten EU moeten vanaf 2026 CBAM-certificaten kopen ' +
    'die de CO2-prijs compenseren.',
  whenRelevant: 'U importeert genoemde producten uit buiten de EU.',
  sourceUrl: 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en',
}
```

Als de wet een nieuwe manifestatie is van een bestaand onderwerp: update
bestaande topic (description, horizon, sourceUrl, eventueel subject).

### 5. Rule schrijven

Volg bestaande conventies in `rules.ts`. Typisch patroon:

```ts
{
  id: 'cbam-import-trigger',
  when: (a) =>
    (a.Q10 ?? []).some((p) => ['staal', 'aluminium', 'cement'].includes(p)) &&
    (a.Q04 ?? []).includes('buiten-eu'),
  themeImpacts: { T3: 3, T1: 1 },
  activateTopics: ['cbam-2026-finalphase'],
  preferredLabel: 'Nu verplicht',
  horizon: 'Nu',
  reason: 'U importeert CBAM-producten van buiten de EU.',
}
```

Als je een rule met **onzekerheid** hebt (vraag kan "weet niet" zijn):
markeer het in de rule-metadata zodat de engine de label downgrade naar
`Mogelijk relevant · nadere toetsing` toepast.

### 6. Test schrijven

Gebruik de `esg-engine-tester` skill. Minimaal:
- 1 test die de rule triggert (persona die aan criteria voldoet).
- 1 test die de rule NIET triggert (persona net buiten criteria).
- Bij onzekerheids-logica: 1 test met "onbekend"-antwoord.

### 7. Changelog + commit

Maak een commit met message:
```
rules: add CBAM import trigger for steel/aluminum/cement

Ingangsdatum: 2026-01-01. Bron: EU CBAM Regulation (EU) 2023/956.
Activeert topic cbam-2026-finalphase met horizon=Nu en label=Nu verplicht
wanneer Q10 (productcategorieën) + Q04 (geografie buiten EU) matcht.
```

Dit creëert een natuurlijke changelog via `git log`.

## Wetgevings-context (april 2026)

**Status wijzigt — verifieer altijd bij EUR-Lex of RVO voordat je een rule
toevoegt of wijzigt.**

### Actief en van kracht

- **CSRD Wave 1** (FY2024 reporting): grote beursgenoteerde ondernemingen
  rapporteren per 2025 over 2024.
- **EU-ETS**: fases lopen; staal/cement/alu uitgebreid in 2026.
- **CBAM**: transitie tot dec 2025, vanaf 2026 certificaat-aankoop verplicht.
- **EUDR**: uitgesteld tot eind 2025, groot uitgesteld tot juni 2026 — check
  status.
- **PPWR** (Packaging and Packaging Waste Regulation): in werking sinds 2025.
- **Battery Regulation**: due diligence-verplichtingen actief 2025–2026.
- **AVG/GDPR**: continu.
- **Informatieplicht energiebesparing (NL)**: vierjaarlijkse cyclus.

### In transitie / onzeker

- **CSRD Omnibus-pakket** (Feb 2025): voorstel drempel naar ≥1000 FTE.
  Trilogue lopend. **Nog niet aannemen dat drempels gewijzigd zijn** voordat
  formeel aangenomen. Hou voor nu de originele drempels (250 FTE + 2/3
  criteria) aan, en markeer horizon voor "Wave 2" als `Monitor`.
- **Stop-the-Clock-directive** (2025): Wave 2 (large non-listed) → FY2027,
  Wave 3 (listed SME) → FY2028. Actief aangenomen.
- **CSDDD**: nationale transpositie-deadline 2026-07-26 (gewijzigd door
  Omnibus).
- **ESPR delegated acts**: gefaseerd per productgroep — textiel, staal,
  meubels eerst. Horizon `1-3 jaar` tot publicatie.

### Nederlandse aanvullingen

- **CO2-heffing industrie** (per 2021, tarief stijgt).
- **Informatieplicht energiebesparing** (Wet Milieubeheer) —
  verbruiksdrempel 50.000 kWh of 25.000 m³ gas.
- **Erkende Maatregelenlijsten (EML)** — sector-specifieke verplichte
  maatregelen.
- **WPM (Werkgebonden Personenmobiliteit)** — verplicht voor werkgevers
  ≥100 werknemers (totaal, ook bij meerdere locaties).
- **Warmtewet / warmtetransitievisies gemeenten** — relevant voor vastgoed.

## Bronnen

- **EU-wetgeving:** https://eur-lex.europa.eu
- **CSRD/ESRS/VSME:** https://www.efrag.org
- **CBAM:** https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en
- **NL-regelgeving:** https://www.rvo.nl (ESG, duurzaamheid)
- **AVG:** https://autoriteitpersoonsgegevens.nl
- **Sector-specifiek:** branche-organisaties (TLN, Bouwend Nederland, FNLI)
- **ACM-leidraad duurzaamheidsclaims:** https://www.acm.nl

## Anti-patterns

- ❌ Rule die triggert op "altijd waar" — gebruik dan `themes.ts` voor algemene
  beleidsinformatie.
- ❌ Rule die drie of meer topics activeert vanuit één trigger — splits op.
- ❌ Label `Nu verplicht` voor iets dat pas over 2 jaar ingaat — gebruik
  `1-3 jaar` horizon + label `Sector vervolgonderzoek`.
- ❌ Vaag `whenRelevant` in topics.ts — schrijf concreet: "als u X doet en Y
  hebt".
- ❌ SourceUrl naar nieuwssite in plaats van wet/richtlijn — altijd primaire
  bron.
- ❌ Nieuwe rule zonder test (zie `esg-engine-tester`).
