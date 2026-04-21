---
name: esg-engine-tester
description: Gebruik bij het schrijven, uitbreiden of reviewen van tests voor
  de ESG-engine (esgEngine.ts, rules.ts, topics.ts, themes.ts). Activeert bij
  nieuwe rule, nieuwe topic, engine-wijziging, of regressie-debug. Bevat
  persona-fixtures, test-patterns voor rule-triggers, maturity-afleiding,
  horizon-sortering, onzekerheidslogica en PDF-output snapshots.
---

# ESG Engine Tester

## Wanneer toepassen

- Nieuwe rule toegevoegd aan `src/data/rules.ts`.
- Nieuwe topic in `src/data/topics.ts` of thema in `src/data/themes.ts`.
- Wijziging in `src/lib/esgEngine.ts` (scoring, maturity, label-selectie,
  sortering, onzekerheid).
- Regressie-bug gemeld waarbij een bedrijfsprofiel de verkeerde topics krijgt.
- Voor elke release: smoke-test over alle persona's.

## Test-strategie

Drie lagen:

1. **Unit** — pure functies in `esgEngine.ts` (label-selectie, horizon-merge,
   onzekerheid-downgrade, segmentatie).
2. **Rule-level** — per rule in `rules.ts`: minimaal één positieve
   (trigger-match) en één negatieve (trigger-miss) test.
3. **Persona-scenario** — end-to-end engine-call voor realistische
   bedrijfsprofielen; assert top-5 nuRelevant + maturity + action-count.

Geen UI-tests in deze skill — daarvoor is Playwright/Testing Library in een
aparte suite.

## Persona-fixtures

Leg vast in `src/test/fixtures/personas.ts`:

```ts
import type { Answers } from '@/lib/esgEngine';

export const kleinICT: Answers = {
  Q01: '0-9',          // FTE
  Q02: '0-2M',         // omzet
  Q03: 'ict',          // sector
  Q04: ['NL'],         // geografie
  Q05: ['bedrijven'],  // klanttype
  Q06: 'zelden',
  Q07: 'nooit',
  Q08: 'geen',
  Q09: 'geen',
  Q10: [],
  Q11: [],
  Q12: 'laag',
  Q13: ['kantoor'],
  Q14: 'geen',
  Q15: 'vast',
  Q16: [],
  Q17: 'privacy',
  Q18: [],
  Q19: [],
  Q20: 'interesse',
};

export const middelgrootFoodProductie: Answers = {
  Q01: '50-249',
  Q02: '10-50M',
  Q03: 'food-agro',
  Q04: ['NL', 'EU'],
  Q05: ['bedrijven', 'consumenten'],
  Q06: 'regelmatig',
  Q07: 'regelmatig',
  Q08: 'klein-krediet',
  Q09: 'middel',
  Q10: ['food', 'verpakt'],
  Q11: ['palmolie'],
  Q12: 'hoog',
  Q13: ['productie', 'magazijn', 'wagenpark'],
  Q14: 'onderbouwd',
  Q15: 'gemengd',
  Q16: ['fysiek', 'internationale-leveranciers'],
  Q17: 'compliance',
  Q18: ['co2-basis', 'beleid'],
  Q19: ['VSME'],
  Q20: 'klantdruk',
};

export const grootBouw: Answers = { /* 250+ FTE, €50M+, bouw, NL+EU */ };
export const agroCooperatie: Answers = { /* 150 FTE, palmolie-keten */ };
export const retailMet3TG: Answers = { /* 40 FTE, elektronica-import */ };
```

Check de echte enum-waardes in `src/data/questions.ts` voordat je fixtures
schrijft — elke Q heeft specifieke `id`-waardes per antwoord-optie.

## Test-patterns

### 1. Rule-level

Eén testbestand per rule-groep (bv. `rules.energy.test.ts`,
`rules.supplychain.test.ts`). Per rule:

```ts
import { describe, it, expect } from 'vitest';
import { generateReport } from '@/lib/esgEngine';
import { middelgrootFoodProductie, kleinICT } from './fixtures/personas';

describe('Rule: energiebesparingsplicht (>50.000 kWh of >25.000 m³ gas)', () => {
  it('activeert topic "energiebesparingsplicht" bij productielocatie', () => {
    const report = generateReport(middelgrootFoodProductie);
    const topic = [...report.nuRelevant, ...report.binnenkortRelevant]
      .find((t) => t.id === 'energiebesparingsplicht');
    expect(topic).toBeDefined();
    expect(topic?.label).toBe('Nu verplicht');
    expect(topic?.horizon).toBe('Nu');
  });

  it('activeert NIET voor klein kantoor-only ICT', () => {
    const report = generateReport(kleinICT);
    const topic = [...report.nuRelevant, ...report.binnenkortRelevant]
      .find((t) => t.id === 'energiebesparingsplicht');
    expect(topic).toBeUndefined();
  });
});
```

### 2. Engine-unit

```ts
describe('labelSelection', () => {
  it('kiest hoogste label als meerdere rules hetzelfde topic activeren', () => {
    const accumulated = [
      { label: 'Monitoren', count: 3 },
      { label: 'Nu verplicht', count: 1 },
    ];
    expect(selectBestLabel(accumulated)).toBe('Nu verplicht');
  });

  it('downgrade Nu verplicht naar Mogelijk relevant bij onzekerheid', () => {
    const result = applyUncertainty('Nu verplicht', { hasUnknownAnswer: true });
    expect(result).toBe('Mogelijk relevant · nadere toetsing');
  });
});
```

### 3. Persona-scenario

```ts
describe('Persona: middelgrootFoodProductie', () => {
  const report = generateReport(middelgrootFoodProductie);

  it('heeft maturity "Basis op orde"', () => {
    expect(report.maturityLabel).toBe('Basis op orde');
  });

  it('heeft T2 (energie) en T4 (keten) als actieve thema\'s', () => {
    const activeIds = report.themeScores.filter((t) => t.active).map((t) => t.id);
    expect(activeIds).toContain('T2');
    expect(activeIds).toContain('T4');
  });

  it('heeft CBAM of EUDR in nuRelevant of binnenkortRelevant', () => {
    const all = [...report.nuRelevant, ...report.binnenkortRelevant];
    const subjects = all.map((t) => t.subject);
    expect(
      subjects.some((s) => s.includes('CBAM') || s.includes('EUDR'))
    ).toBe(true);
  });

  it('levert 5 acties', () => {
    expect(report.acties).toHaveLength(5);
  });
});
```

### 4. Snapshot (voor regressie op rapport-structuur)

```ts
it('report-structuur blijft stabiel voor kleinICT', () => {
  const report = generateReport(kleinICT);
  expect({
    maturity: report.maturityLabel,
    nuCount: report.nuRelevant.length,
    binnenkortCount: report.binnenkortRelevant.length,
    actieCount: report.acties.length,
    actieveThemas: report.themeScores.filter((t) => t.active).length,
  }).toMatchSnapshot();
});
```

Gebruik snapshots **alleen** voor shape-assertions, niet voor tekstinhoud
(tekst verandert, structuur niet).

### 5. Segmentatie

```ts
import { deriveLeadSegment } from '@/lib/submitLead';

describe('deriveLeadSegment', () => {
  it('groot + maturity "Structureren" → hot', () => {
    const report = generateReport(grootBouw);
    expect(deriveLeadSegment(grootBouw, report)).toBe('hot');
  });

  it('middel + ketendruk → warm', () => {
    const report = generateReport(middelgrootFoodProductie);
    expect(deriveLeadSegment(middelgrootFoodProductie, report)).toBe('warm');
  });

  it('klein + alleen interesse → koud', () => {
    const report = generateReport(kleinICT);
    expect(deriveLeadSegment(kleinICT, report)).toBe('koud');
  });
});
```

## Coverage-doelen

| Laag | Minimum | Target |
|---|---|---|
| `esgEngine.ts` pure functies | 90% | 100% |
| Rules (per rule 2 testen) | 100% | 100% |
| Topics geactiveerd in ≥1 persona | 70% | 90% |
| Personas die het happy-path doorlopen | 5 | 8 |

Gebruik `vitest --coverage` met `c8`/`v8` provider. Drempels in
`vitest.config.ts`:

```ts
coverage: {
  thresholds: {
    lines: 85,
    functions: 90,
    branches: 80,
  },
  include: ['src/lib/**', 'src/data/**'],
},
```

## Workflow bij nieuwe rule

1. Voeg rule toe in `rules.ts` (volg `esg-rules-maintainer` skill).
2. Voeg of update persona-fixture die de rule triggert.
3. Schrijf 2 tests: trigger-match + trigger-miss.
4. Run `bun test --coverage` en check dat de rule nu covered is.
5. Check of bestaande snapshot-tests breken — als ja: valideer dat de change
   intentional is en update snapshots.

## Anti-patterns

- ❌ Geen tests die de hele `ESGReport` output tekstueel asserten — te
  brittle, update-onvriendelijk.
- ❌ Geen tests die externe state gebruiken (datum, locale, Math.random).
  Mock `Date.now()` via `vi.useFakeTimers()` als rapport-datum meespeelt.
- ❌ Geen tests die alleen de happy-path doen — elke rule heeft expliciet
  een negatief scenario nodig.
- ❌ Geen tests op `themeScores[0].score === 12` — scores zijn
  implementatie-detail. Test op `active: true/false` of relatieve ordening.

## Bronnen

- Vitest docs: https://vitest.dev/
- Testing Library: https://testing-library.com/docs/react-testing-library/intro/
