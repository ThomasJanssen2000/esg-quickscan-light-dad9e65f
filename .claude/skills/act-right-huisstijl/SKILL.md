---
name: act-right-huisstijl
description: Gebruik bij iedere visuele wijziging aan de ESG Quickscan Light
  (Tailwind-config, UI-componenten, PDF-generatie, iconografie, typografie,
  imagery). Bevat de officiele Act Right-huisstijl (brandbook + Office-theme
  geverifieerd): kleuren Pure Light / Adaptive Lime / Resilient Moss, Funnel
  Display-Bold + Funnel Sans-Light, logo-gebruik, icon-stijl, tone-of-voice,
  layout-principes en concrete token-mappings voor zowel Tailwind als jsPDF.
  Altijd checken voor kleurkeuzes, font-weight-beslissingen, nieuwe componenten
  of PDF-refinements. Gebruik gekoppeld aan de stock-skill `frontend-design`
  voor algemene ontwerpfilosofie (bold direction, no-AI-slop, typografie-ritme,
  spatial composition).
---

# Act Right huisstijl — voor de ESG Quickscan Light

Deze skill is de single source of truth voor alles visueel in de
Quickscan. Aangelegd op basis van het officiele Act Right-brandbook
(`assets/act-right-brandbook.pdf`), het Office-theme (`assets/act-right-
office-theme.thmx`) en publieke actright.nl-verkenning. Waar brandbook en
Office-theme verschillen: **brandbook wint** (Office-theme is een technische
afgeleide met afrondingen en Office-specifieke hyperlink-accenten).

## Werk altijd samen met `frontend-design`

Deze skill werkt in tandem met de stock-skill `frontend-design`
(geïnstalleerd in `~/.claude/skills/frontend-design/`). De verdeling:

| Skill | Rol |
|---|---|
| **`frontend-design`** (stock) | **Het hoe**: bold aesthetic direction, geen generieke AI-esthetiek, karaktervolle typografie, dominante kleuren met scherpe accenten, motion-principes, spatial composition. |
| **`act-right-huisstijl`** (deze) | **Het wat**: welke specifieke kleuren, lettertypes, componenten, tone-of-voice Act Right voert. |

**Workflow bij elke UI/PDF-taak:**
1. Lees eerst `frontend-design` voor ontwerpprincipes.
2. Pas deze skill toe voor de Act Right-invulling.
3. Controleer je output tegen beide: "Is het karaktervol genoeg
   (frontend-design)?" én "Zit het binnen Act Right's merk (deze skill)?"

## Act Right's aesthetic direction (volgens frontend-design-jargon)

Van alle mogelijke richtingen die `frontend-design` opsomt, heeft Act Right
één expliciete identiteit:

**Editorial-minimal met natuur-referentie, geen maximalisme.**

Concreet:
- **Bold typography moments** (42pt editoriale titels op covers) — geen
  timide centered headings.
- **Dominante kleuren + scherpe accenten**: Resilient Moss en Adaptive
  Lime als dominante duo, met Pure Light als canvas. Geen 5+ kleuren
  gelijk verdeeld — dat verwatert.
- **Generous negative space** boven visuele clutter.
- **Horizontale ritme**: secties durven helemaal in moss of lime te zijn
  (full-color blocks), niet alleen subtiele grijstinten.
- **Asymmetrie**: logo linksboven, titel linksgroot, details
  rechtsonder. Niet alles centeren.
- **Terugkerende brand-motieven**: atoom-beeldmerk, cirkel-cluster (de
  "verbinding"-metafoor uit brandbook p4), afgeronde vormen ipv strakke
  hoeken.

## Wat we expliciet vermijden (anti-AI-slop voor Act Right)

Uit `frontend-design` gecombineerd met Act Right-specifiek:

- ❌ **Generieke fonts**: Inter, Roboto, Arial, Helvetica (PDF-fallback
  daargelaten). Altijd Funnel Display/Sans.
- ❌ **Paarse gradients op wit** (cliche AI-landing-page-stijl).
- ❌ **Vage centered hero's** met centered text, centered subtext,
  centered button. Act Right gebruikt links-uitgelijnd editorial.
- ❌ **Bright candy-colored accents** buiten lime. Blauw, oranje, rood
  alleen in status/error-context.
- ❌ **Cookie-cutter card-grids** met identieke cards. Gebruik
  hiërarchie, varieer cards per belang.
- ❌ **Pure wit en pure zwart**. Altijd Pure Light en Resilient Moss.
- ❌ **Dunne drop-shadows overal**. Alleen `shadow-soft` waar echt
  depth nodig is.
- ❌ **Emoji** in productie-UI of PDF. Bewust Nederlands-professioneel
  register.
- ❌ **Hairlines als enige scheidingsmiddel**. Gebruik whitespace of
  kleurblokken, hairlines alleen in tabellen of bij strak afgebakende
  containers.

## Wanneer toepassen

- Tailwind-config wordt aangepast (colors, fontFamily, fontSize, spacing).
- Nieuwe React-component of styling-aanpassing in de Quickscan-UI.
- `src/lib/generatePdf.ts` wordt aangepast (PDF-layout, -kleuren, -fonts).
- Iconografie toegevoegd of vervangen (nieuwe icon-set, SVG-assets).
- Imagery toegevoegd (illustraties, fotografie, hero-images).
- Copy-werk: tone-of-voice moet aansluiten op merkstem.

---

## 1. Kleurpalet (canoniek)

### Drie kernkleuren

| Naam | Hex | RGB | Rol |
|---|---|---|---|
| **Pure Light** | `#FFFEF6` | 255, 254, 246 | Primaire achtergrond; zacht cream-wit. Staat voor transparantie, optimisme, open blik. |
| **Adaptive Lime** | `#E4E65F` | 228, 230, 95 | Primair accent; levendige lime. Staat voor flexibiliteit, aanpassingsvermogen, brug tussen traditionele (geel) en duurzame (groen) energie. |
| **Resilient Moss** | `#2C301C` | 44, 48, 28 | Primaire tekst / dark brand color. Staat voor stabiliteit, klimaat-verbondenheid, kracht, toekomstbestendigheid. |

### Ondersteunende tinten (uit brandbook + Office-theme)

| Hex | RGB | Gebruik |
|---|---|---|
| `#231F20` | 35, 31, 32 | Bijna-zwart voor body-text over cream als je meer contrast nodig hebt dan `#2C301C` |
| `#919336` | 145, 147, 54 | Donker-lime, voor highlight-labels of kleine accent-tekst |
| `#A0AF75` | 160, 175, 117 | Sage / muted olive-green — secundaire accent |
| `#434B2B` | 67, 75, 43 | Donkere olijftint voor gestratificeerde moss-blokken |
| `#F9FADE` | 249, 250, 222 | Zeer licht lime-cream; perfect voor subtiele tag-achtergronden of hover-states |
| `#B9C0DA` | 185, 192, 218 | Zacht blauw-grijs; sparse gebruiken (bv. inactieve states, borders) |

### Kleuren die NIET in de huisstijl zitten (niet gebruiken)

- Helder wit `#FFFFFF` — gebruik altijd Pure Light
- Pure zwart `#000000` — gebruik Resilient Moss of `#231F20`
- Shadcn grijze tinten (slate-50, gray-100 etc.) als achtergrond — cream-tones zijn de canon
- Acid-lime of neon-geel — Adaptive Lime is gedempter dan Lovable-default lime
- Oranje / blauw / rood als accent — alleen in bestaande toast/error-states

### Semantic role mapping

- **Background (primary)** → Pure Light `#FFFEF6`
- **Foreground (text)** → Resilient Moss `#2C301C`
- **Accent (CTA, highlights, wordmark-bold)** → Adaptive Lime `#E4E65F`
- **Accent-foreground (text on lime)** → Resilient Moss `#2C301C`
- **Muted (subtext, captions)** → Donker-olijf of muted-sage, afhankelijk van contrast
- **Border (low contrast)** → Een tint tussen moss en cream, bv. `#DADCCD` (bestaande tailwind-config)
- **Destructive (error)** → ongewijzigd laten; zit buiten merkpalette

---

## 2. Typografie

### Font-keuze

- **Headings**: **Funnel Display** — Bold — letter-spacing +10 (oftewel `0.01em`)
- **Body**: **Funnel Sans** — Light (weight 300)

Beide door Google Fonts beschikbaar. Laden in `index.html` of via Tailwind-
config. Voor PDF (jsPDF) bestaat geen native Funnel — val terug op
`helvetica` (huidige configuratie), behoud dezelfde bold/light-logica.

### Gewichten — heel belangrijk

Het brandbook schrijft expliciet **Bold (700)** voor headings. De huidige
Quickscan gebruikt op veel plekken `font-extrabold` (800). **Vervang stapsgewijs
naar `font-bold` (700)** bij herziening. Extrabold is niet on-brand.

Body gebruikt **Light (300)**, niet regular. De huidige code gebruikt soms
`font-semibold` in body-like contexten — dat ook terugdraaien naar `font-light`
tenzij semantische nadruk echt nodig is.

### Typografie-ladder (voorstel voor de Quickscan)

| Niveau | Font | Weight | Size | Line-height | Tracking |
|---|---|---|---|---|---|
| h1 hero | Funnel Display | 700 | 3.5rem (`text-6xl`) | 1.05 | `tracking-tight` |
| h1 section | Funnel Display | 700 | 2.5rem (`text-4xl`) | 1.1 | `tracking-tight` |
| h2 | Funnel Display | 700 | 1.875rem (`text-3xl`) | 1.15 | `tracking-tight` |
| h3 | Funnel Display | 700 | 1.25rem (`text-xl`) | 1.3 | normal |
| eyebrow | Funnel Sans | 600 | 0.75rem (`text-xs`) | 1 | `tracking-wider`, `uppercase` |
| body | Funnel Sans | 300 | 1rem (`text-base`) | 1.6 | normal |
| body-sm | Funnel Sans | 300 | 0.875rem (`text-sm`) | 1.55 | normal |
| caption | Funnel Sans | 300 | 0.75rem (`text-xs`) | 1.4 | normal |

### Wordmark-logica (uit logo)

De "actright"-wordmark heeft een light-bold contrast binnen het woord:
`act` in lichtere weight, `right` in Bold. Dit is een merk-signature. Als
je het wordmark in tekst naschrijft: `act` regular + `right` bold. Niet
relevant voor gewone headings — alleen voor wordmark-referenties.

---

## 3. Logo-gebruik

Assets beschikbaar in `assets/actright-logo.png` (colored op cream). Voor
runtime-gebruik in de Quickscan zit er al een kopie in `src/assets/`.

### Varianten uit brandbook

1. **Primair**: lime beeldmerk + moss-wordmark, op Pure Light (cream) achtergrond
2. **Inverted**: lime beeldmerk + cream-wordmark, op Resilient Moss achtergrond
3. **Mono-lime**: volledig lime (beeldmerk + tekst), op Resilient Moss of als sticker/pin
4. **Mono-moss**: volledig moss, op Adaptive Lime of Pure Light

### Witruimte-regel

Minimaal 1x de hoogte van het beeldmerk (de atoom-achtige vorm) rondom het
logo als veilige padding. In praktijk: `min-height: 72px` rond het logo in
UI-context.

### Taglijn

"for a better future" — altijd in Funnel Sans, Light, klein formaat,
rechtsonder het wordmark. Niet elke plaatsing heeft de taglijn nodig
(de header-bar van de Quickscan bijvoorbeeld laat 'm weg; de PDF-cover en
CTA-pagina gebruiken 'm wel).

---

## 4. Iconografie

Brandbook toont een **volledige icon-set** gericht op duurzaamheid / energie-
transitie (zonnepanelen, windmolens, recycling, groene gebouwen, EV, etc.).

Stijl:
- **Alleen lijnen**, geen fills
- Consistente stroke weight (ongeveer 1.5–2 px bij 48 px icon)
- Afgeronde lijneinden en corners (niet scherp)
- Twee toegestane kleur-uitvoeringen:
  - **Lime op moss achtergrond** (negatief)
  - **Twee-toon lime + moss op cream** (positief)

Huidige Quickscan gebruikt `lucide-react` voor icons. Lucide past qua
stijl goed (line-icons met consistente stroke), **behoud Lucide**, maar:
- Stel `strokeWidth={1.5}` of `2` in voor brand-consistentie
- Kleur icons in moss (`text-primary`) of accent (`text-accent`), niet in grijs
- Vermijd filled Lucide-varianten

### Aanvullingen in `lucide-react` die goed bij Act Right passen

Voor ESG-context: `Leaf`, `TreePine`, `Factory`, `Zap`, `Sun`, `Wind`,
`Recycle`, `Droplets`, `Building2`, `ShieldCheck`, `Target`, `TrendingUp`,
`BarChart3`, `FileText`, `HandCoins`, `Globe`, `Gauge`.

---

## 5. Imagery + illustrations

Brandbook toont:
- **Architectuur + natuur** combo (groene gevels, stadsgezichten met groen)
- **Product-fotografie** met brand-color backdrops (Tesla in moss-groen,
  mug tegen lime-achtergrond)
- **Duotone overlays**: moss-toned transparante laag over foto met lime-logo

Richtlijn voor de Quickscan:
- Gebruik geen stock-fotografie zonder duotone-behandeling
- Als je foto's toevoegt: leg een 60%-opaque moss-overlay erover zodat tekst
  leesbaar blijft en imagery on-brand wordt
- Illustraties bij voorkeur line-art in lime, geen bol-vormige 3D-iconen
- Geen emoji in productie-UI of PDF

---

## 6. Merk-metaforen uit brandbook

Het merk positioneert zich rond vier concepten, visueel uitgedrukt:

| Concept | Symbool | Betekenis in copy |
|---|---|---|
| Samenwerking | × (vermenigvuldigen) | partnerschap, keten, gezamenlijk effect |
| Holistisch | ∞ (oneindig) | integrale aanpak, systeem-denken |
| Mondiaal | ○ (verbinding) | globale impact, ketens, kringlopen |
| Verbinding | atoom-icoon | onderliggende structuur |

Gebruik deze metaforen sparzaam maar consistent in copy en iconografie.

---

## 7. Tone-of-voice (uit actright.nl + brandbook)

Observaties:
- **Declaratief, niet vragend**: "Innoveren, koplopen en realiseren" i.p.v.
  "Wilt u innoveren?"
- **Kort, actie-gericht**: drie-woord-phrases zijn karakteristiek
- **Nederlands + Engels gemengd maar consistent binnen context**:
  wordmark en taglijn zijn Engels ("act right", "for a better future");
  content-copy grotendeels Nederlands
- **Merk-phrases**:
  - "act responsible · act win-win · act now" (huidig in footer)
  - "for a better future"
  - "Transitiebureau voor maatschappelijke verduurzaming"

Voor de Quickscan specifiek:
- Headings in declaratieve vorm ("Uw ESG-rapport is gereed", niet "Is uw ESG-
  rapport klaar?")
- CTA-tekst kort en ww-eerste: "Start Quickscan", "Bekijk rapport", "Plan
  discovery call"
- Vermijd marketing-taal als "transform your business" — Act Right is feitelijk
  en Nederlands-professioneel

---

## 8. Layout-principes

Uit brandbook + website:

1. **Ademruimte rond focal elements**: logo, koppen, CTA's hebben ruim
   whitespace. Niet clutteren.
2. **Full-color-blocks**: durf hele secties in moss (dark mode) of lime te
   zetten. De Quickscan-intro doet dit al goed met `bg-hero`.
3. **Hoog contrast, zacht contrast**: moss op cream = primary; cream op moss
   = inverse. Vermijd grijs-op-grijs.
4. **Horizontale ritme**: asymmetrisch met brede lege ruimtes (zie brandbook
   pagina 8 met gebouw-foto waar logo links-gecentreerd staat).
5. **2 of 3 kolommen** voor grids; geen 4+-kolom grids.
6. **Partner-logos** indien toegevoegd: horizontale strip, zelfde hoogte,
   zwart/monochroom tenzij klant dat expliciet niet wil.

---

## 9. Concrete Tailwind-config

Huidige `tailwind.config.ts` is grotendeels goed ingericht maar met
onjuiste hex-waardes. Canon voor `src/index.css` (HSL-conversies) +
`tailwind.config.ts`:

```ts
// tailwind.config.ts — kleuren (semantic tokens)
extend: {
  colors: {
    // Act Right canonical
    background: "hsl(var(--background))",   // Pure Light    #FFFEF6
    foreground: "hsl(var(--foreground))",   // Resilient Moss #2C301C
    primary: {
      DEFAULT: "hsl(var(--primary))",       // #2C301C
      foreground: "hsl(var(--primary-foreground))", // #FFFEF6
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",        // Adaptive Lime #E4E65F
      foreground: "hsl(var(--accent-foreground))",  // #2C301C
    },
    // Ondersteunend
    "lime-dark": "#919336",
    "moss-dark": "#434B2B",
    "moss-near-black": "#231F20",
    "lime-cream": "#F9FADE",
    sage: "#A0AF75",
    "neutral-lavender": "#B9C0DA",
  },
  fontFamily: {
    heading: ['"Funnel Display"', "system-ui", "sans-serif"],
    body: ['"Funnel Sans"', "system-ui", "sans-serif"],
  },
  fontWeight: {
    // Override defaults om onbedoeld extrabold te vermijden
    heading: "700",
    body: "300",
  },
}
```

Voor `src/index.css` — HSL-waarden voor de css-vars (Lovable stijl):

```css
:root {
  /* Pure Light #FFFEF6 */
  --background: 51 100% 98%;
  /* Resilient Moss #2C301C */
  --foreground: 72 26% 15%;
  --primary: 72 26% 15%;
  --primary-foreground: 51 100% 98%;
  /* Adaptive Lime #E4E65F */
  --accent: 61 72% 64%;
  --accent-foreground: 72 26% 15%;
}
```

> Controleer alle huidige HSL-waardes in `src/index.css` tegen deze canonical
> en pas aan. Huidige code heeft iets afwijkende moss (72 22% 18% ipv 72 26%
> 15%) en lime (66 65% 56% ipv 61 72% 64%) — eerstvolgende UI-iteratie dit
> alignen.

---

## 10. PDF-kleur-constanten (jsPDF)

In `src/lib/generatePdf.ts`. Vervang de huidige constanten:

```ts
// Canonical brand palette for PDF
const PRIMARY = [44, 48, 28] as const;       // Resilient Moss
const PRIMARY_LIGHT = [67, 75, 43] as const; // Moss Dark (variant)
const ACCENT = [228, 230, 95] as const;      // Adaptive Lime
const ACCENT_DARK = [145, 147, 54] as const; // Lime Dark for text contrast
const TEXT = [35, 31, 32] as const;          // Near-black for body
const MUTED = [160, 175, 117] as const;      // Sage
const SOFT_BG = [255, 254, 246] as const;    // Pure Light cream
const BORDER = [218, 220, 205] as const;     // Subtle moss-cream border
const CREAM_DEEP = [249, 250, 222] as const; // Lime-cream voor accent-blokken
// Error/status blijven ongewijzigd (RED/AMBER/BLUE in huidig bestand)
```

Huidige constanten wijken licht af (PRIMARY is `[56, 64, 38]` moet `[44, 48,
28]`; ACCENT is `[197, 214, 61]` moet `[228, 230, 95]`). Bij refactoren die
waardes bijwerken.

---

## 11. Component-patronen

### Buttons

- **Primaire CTA**: `bg-accent text-accent-foreground` (lime op moss-text),
  pill-shaped (`btn-pill` class bestaat al), comfortabele padding
  (`h-14 px-8`).
- **Secundaire CTA**: `bg-transparent border border-primary text-primary`,
  hover naar `bg-primary/5`. Geen rounded-full op secondary (rounded-lg is ok).
- **Tertiaire / ghost**: link-stijl met underline on hover.
- **Nooit**: gradient, shadow-2xl, bright colors.

### Cards / report topic-cards

- `bg-card` (cream, iets lichter dan body-bg) met `border border-border`
- Border-radius: `rounded-2xl` voor grotere cards, `rounded-lg` voor kleinere
- Shadow: `shadow-soft` bestaand is goed; geen zware `shadow-xl`
- Accent-bar links (zoals huidige "Waarom voor u relevant"-blok) is on-brand

### Labels / tags

- Pill-shape met zachte lime-cream achtergrond + moss-text
- Voorbeeld: `bg-accent/15 border border-accent/30 text-primary`

### Section dividers

- 1-px horizontale lijn in `border-border` (subtiel)
- Of een 2-4 px accent-lime lijn als emphasis-divider

### Progress / maturity-indicator

- Gebruik 4-stap bar met brand-kleuren per stap:
  - Stap 1 (Startfase) → `bg-amber-500` (bestaand)
  - Stap 2 (Basis op orde) → `bg-lime-dark` (#919336) ipv blue
  - Stap 3 (Structureren) → `bg-accent` (#E4E65F)
  - Stap 4 (Opschalen) → `bg-sage` (#A0AF75) of `bg-lime-dark` verzadigd
- Huidige code gebruikt `bg-info` / `bg-success` — daar kunnen we de
  brand-variant van maken.

---

## 12. Motion & micro-interacties

Act Right's merk is niet maximalistisch, dus motion moet **fijn en
doelgericht** zijn. De Quickscan gebruikt al `framer-motion` dat blijft
de juiste keuze.

### Regels

- **Eén goed georchestreerd paginaload-moment** > tien losse
  micro-interacties. Voor een nieuwe sectie: staggered reveal van
  3–5 elementen met 40–80ms delay ertussen, niet 20 elementen met
  trage easing.
- **Easing**: `easeOut` of custom `[0.22, 1, 0.36, 1]` (licht-overshoot).
  Nooit `linear`. Nooit `easeInOut` (voelt ambtelijk).
- **Duration**: 300–500ms voor major transitions, 150–250ms voor
  button-hovers en kleine state-changes. Niets boven 600ms, voelt traag.
- **Hover-states** op interactieve elementen (cards, buttons, links)
  zijn verplicht. Geen hover = dode interface.
- **Scroll-triggered reveals** mogen op de intro en op het rapport —
  maar alleen op hero-blokken, niet op elke card (anders ritmebreuk).
- **Page transitions** binnen de Quickscan-stappen (intro →
  questionnaire → leadgate → report): zacht fade + y-offset 12px.
  Geen slides, geen flips.

### Concrete patroon voor de Quickscan

```tsx
import { motion } from "framer-motion";

// Hero-reveal
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
>
  ...
</motion.div>

// Staggered list-reveal (bijv. topic-cards)
const container = { animate: { transition: { staggerChildren: 0.06 } } };
const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
```

### Wat we NIET doen

- ❌ Auto-playing video backgrounds
- ❌ Parallax scrolling (distractie van content)
- ❌ Animated gradients (acid-trip-feel)
- ❌ Rotating icons / spinning elements zonder functionele reden
- ❌ Bounce-easing op serieuze content (wel OK op playful CTA's, maar
  niet op compliance-topics)

## 13. Toepassen op de ESG Quickscan (opvolglijst)

Bij de eerstvolgende UI-verbeter-ronde, in prioriteit:

1. **Tailwind-config + index.css**: exacte canonical kleuren doorvoeren
   (huidige waardes wijken licht af).
2. **Font-weight sweep**: `font-extrabold` → `font-bold` in headings; check
   of body `font-light` gebruikt.
3. **Icon-stroke**: `strokeWidth={1.5}` op alle Lucide-icons standaardiseren.
4. **Button-audit**: primary CTA moet pill-shaped lime; secundaire moss-outline.
5. **Disclaimer-component**: al on-brand, maar check moss-tint consistentie.
6. **PDF-kleuren**: canonical doorvoeren (stap 10 hierboven).
7. **PDF cover-design**: overweeg brandbook-stijl met volledige moss-bg +
   lime wordmark + rechtsonder een lime kleur-block met titel (zie brandbook
   pagina 17 "CSRD 2025 Top Taste"-voorbeeld).
8. **Maturity-bar**: brand-kleuren ipv info/success generic.
9. **Section blocks** in rapport: durf één sectie volledig moss te maken
   (bv. "Concrete vervolgstappen") voor visuele afwisseling.
10. **Favicon + touch-icon**: lime atoom-icoon op cream.

---

## 14. Anti-patterns

- Kleuren die niet in dit document staan
- Grijze achtergronden (gebruik cream of moss)
- Shadcn-default border/input/muted tinten die grijs neigen
- Font-weights buiten Light (300), Regular (400), Bold (700). Vermijd 500,
  600, 800, 900.
- Iconografie in blauw of oranje
- Buttons met gradient of drop-shadow sterker dan `shadow-soft`
- Mix van meerdere brand-kleuren als accent in één component (kies lime OF
  moss, niet beide als accent)
- Marketing-taal zonder substance ("transformeer uw bedrijf", "ontketen uw
  potentieel") — Act Right is feitelijk
- Emoji in productie-content

---

## 15. Bronnen in deze skill-map

- `assets/act-right-brandbook.pdf` — officieel merkdocument
- `assets/act-right-office-theme.thmx` — Office-kleuren (ter validatie)
- `assets/actright-logo.png` — primair logo-asset (PNG met transparantie)

Voor nieuw materiaal: actright.nl (live website, Nederlands).
