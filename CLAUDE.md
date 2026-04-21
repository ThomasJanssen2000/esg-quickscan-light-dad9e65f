# ESG Quickscan Light — Act Right

Lead-generation tool voor Act Right's MKB-propositie. Bezoekers vullen een
enquête in over bedrijfskarakteristieken en ESG-status, krijgen een rapport met
drie categorieën (nu relevant / toekomstig relevant / aanbevolen) en belanden
als gekwalificeerde lead in HubSpot.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Radix
- **Forms:** react-hook-form + zod
- **Animatie:** framer-motion
- **PDF:** jsPDF + jspdf-autotable
- **Testing:** Vitest + Testing Library + Playwright
- **Package manager:** bun
- **Linting:** eslint + typescript-eslint

## Architectuur

```
src/
├── pages/Index.tsx          ← Flow-root: Intro → Questionnaire → LeadGate → Report
├── components/
│   ├── ESGIntro.tsx         ← Splash + start
│   ├── ESGQuestionnaire.tsx ← 20 vragen, one-per-screen, validatie
│   ├── ESGLeadGate.tsx      ← Lead capture (gaat naar HubSpot)
│   └── ESGReport.tsx        ← In-app rapport + PDF-download
├── data/
│   ├── questions.ts         ← 20 vragen (Q01–Q20), incl. bedrijfsprofiel
│   ├── rules.ts             ← 105 if-regels die thema's + topics activeren
│   ├── topics.ts            ← 90+ ESG-onderwerpen (wetgeving + best practice)
│   └── themes.ts            ← 8 thema's (rapportage, energie, product, keten, …)
├── lib/
│   ├── esgEngine.ts         ← Scoring + maturity + rapport-samenstelling
│   └── generatePdf.ts       ← PDF-export in Act Right-huisstijl
└── assets/actright-logo.png
```

## Engine-flow

1. **Input:** `answers` object met Q01–Q20 responses + `ContactInfo`.
2. **Rules:** elke rule in `rules.ts` test `answers`, heeft effect op `themeScores` + activeert topics met een `preferredLabel` en `horizon`.
3. **Aggregatie:** per topic-id wordt score/label/horizon geaccumuleerd; beste label wint.
4. **Maturity:** afgeleid uit Q18 (basisbouwstenen) + Q19 (externe standaarden) + aantal actieve thema's → `Startfase` / `Basis op orde` / `Structureren` / `Opschalen`.
5. **Output:** `ESGReport` met `nuRelevant` (top 5), `binnenkortRelevant` (top 5), `geenPrioriteit`, `themeScores`, `acties`, `summary`.
6. **PDF:** `generatePdf.ts` rendert het rapport in Act Right-huisstijl.

## Labels & horizons

**Horizon:** `Nu` | `1-3 jaar` | `Monitor`
**Labels (van hoog naar laag prioriteit):** `Nu verplicht` > `Hoog relevant via keten` > `Marktstandaard` > `Sector vervolgonderzoek` > `Mogelijk relevant · nadere toetsing` > `Monitoren` > `Niet prioritair`

Onzekerheidslogica: als antwoorden "onbekend" bevatten die de rule betreffen, wordt `Nu verplicht` gedowngrade naar `Mogelijk relevant · nadere toetsing`.

## Huisstijl

Gedefinieerd in `tailwind.config.ts` + `src/index.css`:

- **Primary:** `#384026` (dark olive, HSL 72 22 18)
- **Accent:** `#C5D63D` (lime-yellow, HSL 66 65 56)
- **Background:** cream/off-white
- **Fonts:** Funnel Display (headings), Funnel Sans (body)

Niet vervangen door shadcn-defaults. Houd contrast hoog voor WCAG AA.

## Lead-flow

`ESGLeadGate.tsx` capteert: voornaam, achternaam, bedrijfsnaam, zakelijk e-mailadres, telefoon (optioneel), aantal medewerkers, consent-checkbox.

**Na submit:** POST naar HubSpot Forms API (zie `lead-webhook-hubspot` skill) met lead-segment (`hot` / `warm` / `koud`) afgeleid uit de engine-output. Pas daarna wordt `ESGReport` getoond.

**Lead-segmentatie:**
- `hot` — valt onder CSRD (grote onderneming) of heeft concrete ESG-druk vanuit keten/aanbesteding én `maturityLabel` ≥ `Basis op orde`
- `warm` — VSME-doelgroep of ketenplicht actief, maturity `Startfase`/`Basis op orde`
- `koud` — interesse zonder concrete trigger

## Testing

- **Unit (Vitest):** `src/test/*.test.ts` — nu enkel een dummy. Zie `esg-engine-tester` skill voor uitbouw.
- **E2E (Playwright):** `playwright.config.ts` — Lovable-default, nog niet ingericht.

Run:
```bash
bun test          # vitest run
bun run test:watch
bun x playwright test
```

## Bekende gaps (prioriteit)

1. **Backend:** nu geen persistence — leads moeten naar HubSpot (skill: `lead-webhook-hubspot`).
2. **Tests:** engine heeft 105 rules + 90 topics, coverage is nul (skill: `esg-engine-tester`).
3. **AVG:** consent-link is `#`, geen privacyverklaring, geen bewaartermijn (skill: `avg-compliance`).
4. **Rules-onderhoud:** geen proces voor wetswijzigingen (skill: `esg-rules-maintainer`).
5. **Accessibility:** WCAG-audit ontbreekt.
6. **i18n:** alles Nederlands hardcoded.

## Conventies

- **Componenten:** PascalCase, één per file in `src/components/`.
- **shadcn/ui:** ongewijzigd laten in `src/components/ui/`; custom componenten eronder samenstellen.
- **Domein-data in `src/data/`:** nooit inline in componenten. Nieuwe wet = nieuwe rule + topic in `data/`.
- **Tailwind:** gebruik design tokens (`bg-primary`, `text-accent`), niet hex.
- **Types:** `zod`-schema's zijn de single source of truth voor form-validatie.

## Skills in deze repo

- `.claude/skills/lead-webhook-hubspot/` — HubSpot Forms API integratie
- `.claude/skills/esg-engine-tester/` — Vitest-specs voor engine + rules
- `.claude/skills/esg-rules-maintainer/` — wet toevoegen/wijzigen
- `.claude/skills/avg-compliance/` — AVG-checks voor lead-flow
