# AI Danışman Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, simple, explainable `/ai-danisman` frontend that turns one Turkish natural-language request into editable criteria, trustworthy listing matches, comparison handoff, and user-approved advisor actions.

**Architecture:** Split the current single-file workspace into domain parsing/matching, an abortable fixture adapter, a reducer-driven page state machine, and focused feature components. The route owns shareable URL state; `AdvisorWorkspace` owns the interaction session; the existing design-system primitives supply controls and overlays while page content remains flat.

**Tech Stack:** React 19, TypeScript 6, TanStack Router, CSS Modules, `motion/react`, Vitest, Testing Library, Storybook 10, existing `@repo/ui` components.

## Global Constraints

- Follow `src/design/GenelBakis.mdx`, `Tokenlar.mdx`, `EksenlerVeDurumlar.mdx`, `ErisilebilirlikMotionResponsive.mdx`, and `ComponentSablonu.mdx`.
- Component CSS consumes `--lg-*` tokens; no raw `px` or hex values.
- Glass is limited to navigation and primary controls; no glass-on-glass; page total remains at or below six glass surfaces including the global header and dock.
- Content cards, criteria, evidence, badges, and secondary actions use flat surfaces.
- The page uses one amber accent and the existing Kağıt/Grafit theme tokens.
- Focus rings appear only on `:focus-visible` and use `--lg-focus-ring-width`, `--lg-accent`, and `--lg-focus-ring-offset`.
- Coarse-pointer targets are at least `--lg-control-md`; hover styles are inside `@media (hover: hover)`.
- Layout uses container queries; DOM order and visual order remain identical.
- Motion changes only `transform`, `opacity`, or `filter`; reduced-motion and reduced-transparency preferences are honored.
- No new runtime dependency is added.
- Existing user changes outside `apps/web/src/features/advisor`, `apps/web/src/features/listings/data/listing-photos.ts`, the two advisor/comparison routes, and the scoped comparison adapter are preserved.
- Visible page copy contains no em dash or en dash characters.
- Fixture photography is labeled as representative demo imagery and falls back to the existing listing image when loading fails.
- Every `git commit` block is a checkpoint. The current workspace has a
  read-only `.git` directory and previously rejected `.git/index.lock`; if
  that remains true, skip the commit command, report it once, and continue
  implementation and verification without altering repository permissions.

## File Map

### Domain and data

- Modify `apps/web/src/features/advisor/domain/advisor-types.ts`: normalized criteria, match, evidence, route, and state types.
- Create `apps/web/src/features/advisor/domain/advisor-parser.ts`: Turkish query parsing and budget normalization.
- Create `apps/web/src/features/advisor/domain/advisor-parser.test.ts`: parser contract.
- Create `apps/web/src/features/advisor/domain/advisor-matcher.ts`: hard filtering, preference scoring, and explanations.
- Create `apps/web/src/features/advisor/domain/advisor-matcher.test.ts`: matching contract.
- Create `apps/web/src/features/advisor/domain/advisor-reducer.ts`: workspace state machine.
- Create `apps/web/src/features/advisor/domain/advisor-reducer.test.ts`: state transitions.
- Create `apps/web/src/features/advisor/domain/advisor-route-search.ts`: URL parsing and serialization.
- Create `apps/web/src/features/advisor/domain/advisor-route-search.test.ts`: shareable route state.
- Modify `apps/web/src/features/advisor/domain/advisor-ai.ts`: compatibility re-exports only.
- Modify `apps/web/src/features/advisor/domain/advisor-ai.test.ts`: remove duplicated cases and assert compatibility exports.
- Create `apps/web/src/features/advisor/data/advisor-search-adapter.ts`: abortable async fixture adapter.
- Create `apps/web/src/features/advisor/data/advisor-search-adapter.test.ts`: success, empty, error, and abort behavior.
- Create `apps/web/src/features/listings/data/listing-photos.ts`: shared representative photography mapping with fallback metadata.

### Feature components

- Create `apps/web/src/features/advisor/components/AdvisorWelcome.tsx`: first-use heading, composer, and flat examples.
- Create `apps/web/src/features/advisor/components/AdvisorComposer.tsx`: single controlled query surface.
- Create `apps/web/src/features/advisor/components/AdvisorSearchProfile.tsx`: visible criteria summary and edit/remove actions.
- Create `apps/web/src/features/advisor/components/AdvisorListingCard.tsx`: one unified explainable listing card.
- Create `apps/web/src/features/advisor/components/AdvisorListingCard.module.css`: card anatomy and responsive media.
- Create `apps/web/src/features/advisor/components/AdvisorListingCard.test.tsx`: card semantics and actions.
- Create `apps/web/src/features/advisor/components/AdvisorResults.tsx`: featured and alternative result composition.
- Create `apps/web/src/features/advisor/components/AdvisorDecisionRail.tsx`: criteria, comparison, save, alarm, and trust entry.
- Create `apps/web/src/features/advisor/components/AdvisorDrawers.tsx`: criteria, listing, trust/history, and consent drawers.
- Create `apps/web/src/features/advisor/components/AdvisorPanels.module.css`: flat profile, rail, drawer, state, and action styles.

### Workspace and routes

- Rewrite `apps/web/src/features/advisor/AdvisorWorkspace.tsx`: reducer-driven orchestration.
- Rewrite `apps/web/src/features/advisor/AdvisorWorkspace.module.css`: one coherent container-based layout.
- Expand `apps/web/src/features/advisor/AdvisorWorkspace.test.tsx`: integration and accessibility behaviors.
- Rewrite `apps/web/src/features/advisor/AdvisorWorkspace.stories.tsx`: approved state matrix.
- Rewrite `apps/web/src/features/advisor/rules.md`: full feature contract.
- Modify `apps/web/src/routes/ai-danisman.tsx`: validated route search and comparison navigation.
- Create `apps/web/src/routes/ai-danisman.test.tsx`: route search contract.
- Modify `apps/web/src/features/advisor/index.ts`: public feature exports.

### Comparison handoff

- Create `apps/web/src/features/comparison/comparison-listing-adapter.ts`: turn selected listing fixtures into comparison rows.
- Create `apps/web/src/features/comparison/comparison-listing-adapter.test.ts`: adapter mapping.
- Modify `apps/web/src/features/comparison/ComparisonWorkbench.tsx`: accept selected listing IDs.
- Modify `apps/web/src/features/comparison/ComparisonWorkbench.test.tsx`: selected listing rendering.
- Modify `apps/web/src/routes/karsilastir.tsx`: validate `ids` search parameter and pass it to the workbench.
- Create `apps/web/src/routes/karsilastir.test.tsx`: comparison route validation.

---

### Task 1: Normalize the advisor domain and Turkish parser

**Files:**
- Modify: `apps/web/src/features/advisor/domain/advisor-types.ts`
- Create: `apps/web/src/features/advisor/domain/advisor-parser.ts`
- Create: `apps/web/src/features/advisor/domain/advisor-parser.test.ts`
- Modify: `apps/web/src/features/advisor/domain/advisor-ai.ts`
- Modify: `apps/web/src/features/advisor/domain/advisor-ai.test.ts`

**Interfaces:**
- Consumes: `ListingSummary` and `PropertyCategory` from `../../listings/data/listing-adapter` and `../../listings/domain/search-state`.
- Produces: `parseAdvisorPrompt(query: string): AdvisorProposal`, `mergeAdvisorClarification(proposal, answer): AdvisorProposal`, `normalizeTurkishMoney(input: string): number | undefined`, `AdvisorCriteria`, `AdvisorProposal`, and stable feature/property enums.

- [ ] **Step 1: Write failing parser tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  mergeAdvisorClarification,
  normalizeTurkishMoney,
  parseAdvisorPrompt,
} from './advisor-parser'

describe('advisor parser', () => {
  it('parses a Turkish land investment request', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir Urla’da 5 milyon TL altında konut imarlı arsa yatırımı',
    )

    expect(proposal.criteria).toMatchObject({
      intent: 'invest',
      city: 'izmir',
      district: 'urla',
      propertyTypes: ['land'],
      budget: { max: 5_000_000 },
    })
    expect(proposal.criteria.mustHave).toContain('zoning')
    expect(proposal.interpretationConfidence).toBeGreaterThanOrEqual(80)
  })

  it('does not parse room count as a budget', () => {
    const proposal = parseAdvisorPrompt(
      'Kadıköy’de metroya yakın kiralık 3+1 daire',
    )

    expect(proposal.criteria.intent).toBe('rent')
    expect(proposal.criteria.city).toBe('istanbul')
    expect(proposal.criteria.district).toBe('kadıköy')
    expect(proposal.criteria.rooms).toBe('3+1')
    expect(proposal.criteria.budget).toEqual({})
    expect(proposal.criteria.preferences).toContain('transport')
  })

  it.each([
    ['5 milyon', 5_000_000],
    ['5.000.000 TL', 5_000_000],
    ['750 bin', 750_000],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeTurkishMoney(input)).toBe(expected)
  })

  it('parses independent minimum and maximum budgets', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir’de 3 milyon TL üstünde 5 milyon TL altında satılık daire',
    )
    expect(proposal.criteria.budget).toEqual({
      min: 3_000_000,
      max: 5_000_000,
    })
  })

  it('recognizes commercial property without splitting all-real-estate search', () => {
    const proposal = parseAdvisorPrompt(
      'İstanbul Ataşehir’de kiralık ofis',
    )
    expect(proposal.criteria.propertyTypes).toEqual(['commercial'])
    expect(proposal.criteria.intent).toBe('rent')
  })

  it('keeps propertyTypes empty when the user wants all real estate', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir’de bütçeme uygun satılık emlak arıyorum',
    )
    expect(proposal.criteria.propertyTypes).toEqual([])
  })

  it('asks one question when a low-confidence request has no location', () => {
    const proposal = parseAdvisorPrompt('Bütçeme uygun bir yer arıyorum')

    expect(proposal.interpretationConfidence).toBeLessThan(70)
    expect(proposal.clarification).toEqual({
      key: 'location',
      question: 'Hangi şehir veya bölgede arama yapalım?',
    })

    const refined = mergeAdvisorClarification(proposal, 'İzmir')
    expect(refined.query).toBe('Bütçeme uygun bir yer arıyorum İzmir')
    expect(refined.criteria.city).toBe('izmir')
    expect(refined.clarification).toBeUndefined()
  })

  it('parses area, deed, and life priorities separately from budget', () => {
    const proposal = parseAdvisorPrompt(
      'Urla’da en az 120 m² en fazla 180 m² müstakil tapulu, sakin yaşam için ev',
    )

    expect(proposal.criteria.area).toEqual({ min: 120, max: 180 })
    expect(proposal.criteria.budget).toEqual({})
    expect(proposal.criteria.mustHave).toContain('detached-deed')
    expect(proposal.criteria.preferences).toContain('quiet-life')
  })
})
```

- [ ] **Step 2: Run the parser test and verify RED**

Run:

```bash
npm test -- apps/web/src/features/advisor/domain/advisor-parser.test.ts --run
```

Expected: FAIL because `advisor-parser.ts` and the normalized interfaces do not exist.

- [ ] **Step 3: Define normalized domain types**

Replace the compact interfaces in `advisor-types.ts` with:

```ts
import type { ListingSummary } from '../../listings/data/listing-adapter'
import type { PropertyCategory } from '../../listings/domain/search-state'

export type AdvisorIntent = 'buy' | 'rent' | 'invest'
export type AdvisorPropertyType = Exclude<PropertyCategory, 'all'>
export type AdvisorFeature =
  | 'zoning'
  | 'detached-deed'
  | 'sea'
  | 'road'
  | 'transport'
  | 'quiet-life'
  | 'family-life'
  | 'rental-yield'

export interface AdvisorNumericRange {
  min?: number
  max?: number
}

export interface AdvisorCriteria {
  intent: AdvisorIntent
  city?: string
  district?: string
  propertyTypes: AdvisorPropertyType[]
  /** Transitional alias for the current workspace; remove in Task 6. */
  propertyType?: AdvisorPropertyType
  budget: AdvisorNumericRange
  area: AdvisorNumericRange
  rooms?: string
  mustHave: AdvisorFeature[]
  preferences: AdvisorFeature[]
}

export interface AdvisorCriterionMatch {
  key: string
  label: string
  kind: 'required' | 'preference'
  matched: boolean
  detail: string
}

export type AdvisorSimpleCriterionKey =
  | 'city'
  | 'district'
  | 'propertyTypes'
  | 'budgetMin'
  | 'budgetMax'
  | 'areaMin'
  | 'areaMax'
  | 'rooms'

export type AdvisorCriterionRemoval =
  | { key: AdvisorSimpleCriterionKey }
  | {
      key: 'mustHave' | 'preferences'
      feature: AdvisorFeature
    }

export interface AdvisorEvidence {
  id: string
  title: string
  source: string
  status: 'verified' | 'review' | 'missing'
  detail: string
}

export interface AdvisorMatch {
  listing: ListingSummary
  score: number
  reasons: string[]
  criteria: AdvisorCriterionMatch[]
  evidence: AdvisorEvidence[]
  missingData: string[]
}

export interface AdvisorProposal {
  query: string
  criteria: AdvisorCriteria
  summary: string
  interpretationConfidence: number
  /** Transitional alias for the current workspace; remove in Task 6. */
  confidence?: number
  clarification?: {
    key: 'location' | 'budget' | 'propertyType'
    question: string
  }
}

export interface AdvisorSearchResult {
  proposal: AdvisorProposal
  matches: AdvisorMatch[]
  generatedAt: string
}
```

- [ ] **Step 4: Implement the parser minimally and pass the tests**

Implement `advisor-parser.ts` with fixed dictionaries and deterministic parsing:

```ts
const LOCATION_INDEX = {
  izmir: ['urla', 'çeşme', 'bayraklı', 'konak'],
  istanbul: ['kadıköy', 'ataşehir'],
  ankara: ['gölbaşı', 'çankaya'],
  bursa: ['nilüfer'],
  antalya: ['kaş'],
  muğla: ['bodrum'],
} as const

const PROPERTY_KEYWORDS = {
  land: ['arsa', 'tarla', 'parsel'],
  residential: ['konut', 'daire', 'villa', 'ev'],
  commercial: ['iş yeri', 'işyeri', 'ofis', 'dükkan', 'dükkân'],
  building: ['bina'],
  timeshare: ['devremülk'],
  touristic: ['otel', 'pansiyon', 'turistik tesis'],
} as const

export function normalizeTurkishMoney(input: string): number | undefined {
  const normalized = input
    .toLocaleLowerCase('tr-TR')
    .replace(/\btl\b/g, '')
    .trim()
  const multiplier = normalized.includes('milyon')
    ? 1_000_000
    : normalized.includes('bin')
      ? 1_000
      : 1
  const raw = normalized.replace(/milyon|bin/g, '').trim()
  const digits =
    multiplier === 1
      ? raw.replace(/[.\s]/g, '').replace(',', '.')
      : raw.replace(',', '.')
  const value = Number(digits)
  return Number.isFinite(value) ? Math.round(value * multiplier) : undefined
}
```

The parser must:

- detect `3+1` before scanning numbers;
- detect `altında`, `en fazla`, and `maksimum` as `budget.max`;
- detect `üstünde`, `en az`, and `minimum` as `budget.min`;
- scan every contextual money span so one sentence can produce independent
  minimum and maximum bounds instead of taking only its first number;
- assign numbers followed by `m²`, `m2`, or `metrekare` to `area.min` or
  `area.max` before budget parsing;
- infer a city from a known district;
- return `propertyTypes: []` for generic `emlak` requests;
- classify zoning, detached deed, and explicit road frontage as structural
  `mustHave` criteria;
- classify sea access, transport, quiet life, family life, and rental yield
  as `preferences` unless the sentence marks them with `şart`, `mutlaka`, or
  `olmazsa olmaz`;
- attach at most one clarification question when confidence is below 70.

Interpretation confidence is deterministic: start at 35, add 20 for a resolved
location, 15 for an explicit property type or explicit generic `emlak`, 10 for
an explicit intent, 10 for a numeric budget or area, and 10 for any structural
or preference feature; clamp to 96. Below 70, ask only the first unresolved
high-value question: location first, then property type. Explicit generic
`emlak` counts as a resolved all-types choice and does not trigger a type
question.

Implement clarification merging as a deterministic reparse:

```ts
export function mergeAdvisorClarification(
  proposal: AdvisorProposal,
  answer: string,
): AdvisorProposal {
  const normalizedAnswer = answer.trim()
  return normalizedAnswer
    ? parseAdvisorPrompt(`${proposal.query} ${normalizedAnswer}`)
    : proposal
}
```

Until Task 2 replaces matching, keep the current workspace buildable with this
compatibility implementation in `advisor-ai.ts`:

```ts
export { parseAdvisorPrompt } from './advisor-parser'
export function matchAdvisorListings(
  _criteria: AdvisorCriteria,
  listings: ListingSummary[],
): AdvisorMatch[] {
  return listings.slice(0, 6).map((listing) => ({
    listing,
    score: 55,
    reasons: ['Genel profilinizle uyumlu başlangıç önerisi.'],
    criteria: [],
    evidence: [
      {
        id: `eids-${listing.id}`,
        title: 'EİDS taşınmaz yetkisi',
        source: 'İlan doğrulama kaydı',
        status: listing.verified ? 'verified' : 'review',
        detail: listing.verified
          ? 'Yetki doğrulaması tamamlandı.'
          : 'Belge incelemesi gerekiyor.',
      },
    ],
    missingData: [],
  }))
}
```

`parseAdvisorPrompt` sets `propertyType` to the first normalized property type
and sets `confidence` equal to `interpretationConfidence` during this
transition.

Run:

```bash
npm test -- apps/web/src/features/advisor/domain/advisor-parser.test.ts apps/web/src/features/advisor/domain/advisor-ai.test.ts --run
```

Expected: PASS.

- [ ] **Step 5: Commit the parser slice**

```bash
git add apps/web/src/features/advisor/domain
git commit -m "feat(advisor): normalize Turkish search criteria"
```

---

### Task 2: Add explainable matching and the abortable search adapter

**Files:**
- Create: `apps/web/src/features/advisor/domain/advisor-matcher.ts`
- Create: `apps/web/src/features/advisor/domain/advisor-matcher.test.ts`
- Create: `apps/web/src/features/advisor/data/advisor-search-adapter.ts`
- Create: `apps/web/src/features/advisor/data/advisor-search-adapter.test.ts`

**Interfaces:**
- Consumes: `AdvisorCriteria`, `AdvisorMatch`, and `LISTING_FIXTURES`.
- Produces: `matchAdvisorListings(criteria, listings): AdvisorMatch[]`, `AdvisorSearchAdapter`, and `createFixtureAdvisorSearchAdapter`. `AdvisorSearchResult` lives in the domain contract so the reducer never imports from the data layer.

- [ ] **Step 1: Write failing matcher and adapter tests**

```ts
import { describe, expect, it } from 'vitest'
import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import { parseAdvisorPrompt } from './advisor-parser'
import { matchAdvisorListings } from './advisor-matcher'

describe('advisor matcher', () => {
  it('hard-filters intent, location, type, and maximum budget', () => {
    const { criteria } = parseAdvisorPrompt(
      'İzmir Urla’da 5 milyon TL altında satılık arsa',
    )
    const matches = matchAdvisorListings(criteria, LISTING_FIXTURES)

    expect(matches.length).toBeGreaterThan(0)
    expect(matches.every(({ listing }) => listing.transaction === 'sale')).toBe(true)
    expect(matches.every(({ listing }) => listing.city === 'izmir')).toBe(true)
    expect(matches.every(({ listing }) => listing.district === 'urla')).toBe(true)
    expect(matches.every(({ listing }) => listing.category === 'land')).toBe(true)
    expect(matches.every(({ listing }) => listing.price <= 5_000_000)).toBe(true)
  })

  it('returns concrete reasons and missing-data evidence', () => {
    const { criteria } = parseAdvisorPrompt(
      'Urla’da imarlı ve yola cepheli arsa',
    )
    const [match] = matchAdvisorListings(criteria, LISTING_FIXTURES)

    expect(match.reasons).toContain('Konut imarı tercihinizle eşleşiyor.')
    expect(match.criteria.some((item) => item.key === 'road')).toBe(true)
    expect(match.evidence.some((item) => item.title === 'EİDS taşınmaz yetkisi')).toBe(true)
  })

  it('uses preferences for ranking without filtering misses out', () => {
    const { criteria } = parseAdvisorPrompt('Urla’da denize yakın arsa')
    const base = LISTING_FIXTURES[0]
    const withoutSea = {
      ...base,
      id: 'without-sea',
      title: 'Urla’da merkezde imarlı parsel',
      highlights: ['Konut imarlı', 'Müstakil tapu'],
    }
    const matches = matchAdvisorListings(criteria, [base, withoutSea])

    expect(matches).toHaveLength(2)
    expect(matches[0]?.listing.id).toBe(base.id)
    expect(
      matches[1]?.criteria.find((item) => item.key === 'sea'),
    ).toMatchObject({ kind: 'preference', matched: false })
  })

  it('treats an explicit room count as a hard criterion', () => {
    const { criteria } = parseAdvisorPrompt('Bursa Nilüfer’de satılık 3+1 daire')
    const matches = matchAdvisorListings(criteria, LISTING_FIXTURES)

    expect(matches.length).toBeGreaterThan(0)
    expect(
      matches.every(({ listing }) => listing.attributes.rooms === '3+1'),
    ).toBe(true)
  })

  it('always provides a concrete reason for generic real-estate requests', () => {
    const { criteria } = parseAdvisorPrompt('İzmir’de satılık emlak')
    const matches = matchAdvisorListings(criteria, LISTING_FIXTURES)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches.every((match) => match.reasons.length > 0)).toBe(true)
    expect(matches[0]?.reasons[0]).toContain('İzmir')
  })
})
```

```ts
import { describe, expect, it } from 'vitest'
import { parseAdvisorPrompt } from '../domain/advisor-parser'
import { createFixtureAdvisorSearchAdapter } from './advisor-search-adapter'

describe('fixture advisor search adapter', () => {
  it('returns a proposal and matched listings', async () => {
    const adapter = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const proposal = parseAdvisorPrompt('İzmir’de satılık emlak')
    const result = await adapter.search(proposal)
    expect(result.proposal.query).toContain('İzmir')
    expect(result.matches.length).toBeGreaterThan(0)
  })

  it('returns a deterministic empty result', async () => {
    const adapter = createFixtureAdvisorSearchAdapter({
      listings: [],
      delayMs: 0,
    })
    const result = await adapter.search(parseAdvisorPrompt('İzmir’de arsa'))
    expect(result.matches).toEqual([])
  })

  it('exposes a deterministic failure without changing the proposal', async () => {
    const adapter = createFixtureAdvisorSearchAdapter({
      delayMs: 0,
      fail: true,
    })
    await expect(
      adapter.search(parseAdvisorPrompt('İzmir’de arsa')),
    ).rejects.toThrow('İlanlar şu anda hazırlanamadı.')
  })

  it('honors AbortSignal', async () => {
    const adapter = createFixtureAdvisorSearchAdapter({ delayMs: 20 })
    const controller = new AbortController()
    const request = adapter.search(parseAdvisorPrompt('İzmir'), {
      signal: controller.signal,
    })
    controller.abort()
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
})
```

- [ ] **Step 2: Run both tests and verify RED**

```bash
npm test -- apps/web/src/features/advisor/domain/advisor-matcher.test.ts apps/web/src/features/advisor/data/advisor-search-adapter.test.ts --run
```

Expected: FAIL because the matcher and adapter modules do not exist.

- [ ] **Step 3: Implement hard filters and weighted explanations**

Implement:

```ts
export function matchAdvisorListings(
  criteria: AdvisorCriteria,
  listings: ListingSummary[],
): AdvisorMatch[] {
  const transaction = criteria.intent === 'rent' ? 'rent' : 'sale'

  return listings
    .filter((listing) => listing.transaction === transaction)
    .filter((listing) => !criteria.city || listing.city === criteria.city)
    .filter((listing) => !criteria.district || listing.district === criteria.district)
    .filter(
      (listing) =>
        criteria.propertyTypes.length === 0 ||
        criteria.propertyTypes.includes(listing.category),
    )
    .filter(
      (listing) =>
        criteria.budget.min === undefined ||
        listing.price >= criteria.budget.min,
    )
    .filter(
      (listing) =>
        criteria.budget.max === undefined ||
        listing.price <= criteria.budget.max,
    )
    .filter(
      (listing) =>
        criteria.area.min === undefined ||
        listing.area >= criteria.area.min,
    )
    .filter(
      (listing) =>
        criteria.area.max === undefined ||
        listing.area <= criteria.area.max,
    )
    .filter(
      (listing) =>
        !criteria.rooms || listing.attributes.rooms === criteria.rooms,
    )
    .map((listing) => buildAdvisorMatch(criteria, listing))
    .filter((match) =>
      match.criteria
        .filter((criterion) => criterion.kind === 'required')
        .every((criterion) => criterion.matched),
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        Number(right.listing.verified) - Number(left.listing.verified) ||
        left.listing.unitPrice - right.listing.unitPrice,
    )
    .slice(0, 6)
}
```

`buildAdvisorMatch` must compare normalized title, highlights, and attributes for:

- `zoning`: contains `imar`;
- `detached-deed`: contains `müstakil tapu` or `attributes.deed === 'detached'`;
- `sea`: contains `deniz` or `plaj`;
- `road`: contains `yol` or `cephe`;
- `transport`: contains `metro`, `ulaşım`, or `merkezi`;
- `quiet-life`: contains `sakin`, `sessiz`, or `huzurlu`;
- `family-life`: contains `aile`, `site`, `okul`, or `park`;
- `rental-yield`: contains `kira getirisi` or `kiracılı`.

Only `mustHave` entries receive `kind: 'required'`; `preferences` receive
`kind: 'preference'`. Score starts at 60 after hard filtering, adds at most 30
proportionally to matched preferences, and at most 10 for verified data. Clamp
to 100. A missed preference remains in the result explanation without
filtering the listing out. Missing requested data is added to `missingData`
and is never treated as a positive signal.
If no feature-specific reason matches, add a concrete fallback composed from
the actual hard filters, for example `İzmir konumu ve satılık talebinizle
eşleşiyor.` `reasons` is never empty and never falls back to a vague
`profilinize uygun` claim.

Replace the compatibility body in `advisor-ai.ts` with:

```ts
export { parseAdvisorPrompt } from './advisor-parser'
export { matchAdvisorListings } from './advisor-matcher'
```

- [ ] **Step 4: Implement the async adapter and pass tests**

```ts
import type {
  AdvisorProposal,
  AdvisorSearchResult,
} from '../domain/advisor-types'

function abortError() {
  return new DOMException('Advisor search aborted', 'AbortError')
}

function abortableDelay(delayMs: number, signal?: AbortSignal) {
  if (signal?.aborted) return Promise.reject(abortError())

  return new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof globalThis.setTimeout>
    const onAbort = () => {
      globalThis.clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(abortError())
    }
    timer = globalThis.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, delayMs)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export interface AdvisorSearchAdapter {
  search(
    proposal: AdvisorProposal,
    options?: { signal?: AbortSignal },
  ): Promise<AdvisorSearchResult>
}

export function createFixtureAdvisorSearchAdapter({
  listings = LISTING_FIXTURES,
  delayMs = 320,
  fail = false,
}: {
  listings?: ListingSummary[]
  delayMs?: number
  fail?: boolean
} = {}): AdvisorSearchAdapter {
  return {
    async search(proposal, options) {
      await abortableDelay(delayMs, options?.signal)
      if (fail) throw new Error('İlanlar şu anda hazırlanamadı.')
      return {
        proposal,
        matches: matchAdvisorListings(proposal.criteria, listings),
        generatedAt: '2026-07-26T12:00:00.000Z',
      }
    },
  }
}
```

Run:

```bash
npm test -- apps/web/src/features/advisor/domain/advisor-matcher.test.ts apps/web/src/features/advisor/data/advisor-search-adapter.test.ts --run
```

Expected: PASS.

- [ ] **Step 5: Commit the matching slice**

```bash
git add apps/web/src/features/advisor/domain apps/web/src/features/advisor/data
git commit -m "feat(advisor): add explainable listing matching"
```

---

### Task 3: Add reducer state and shareable advisor route search

**Files:**
- Create: `apps/web/src/features/advisor/domain/advisor-reducer.ts`
- Create: `apps/web/src/features/advisor/domain/advisor-reducer.test.ts`
- Create: `apps/web/src/features/advisor/domain/advisor-route-search.ts`
- Create: `apps/web/src/features/advisor/domain/advisor-route-search.test.ts`

**Interfaces:**
- Consumes: `AdvisorProposal`, `AdvisorMatch`, and `AdvisorCriterionRemoval`.
- Produces: `AdvisorWorkspaceState`, `AdvisorWorkspaceAction`, `createInitialAdvisorState`, `advisorReducer`, `parseAdvisorRouteSearch`, and `serializeAdvisorRouteSearch`.

- [ ] **Step 1: Write failing reducer and URL-state tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  advisorReducer,
  createInitialAdvisorState,
} from './advisor-reducer'
import { parseAdvisorPrompt } from './advisor-parser'

describe('advisor reducer', () => {
  it('moves from idle to analyzing without losing the query', () => {
    const state = createInitialAdvisorState()
    const proposal = parseAdvisorPrompt('Urla’da arsa')
    const next = advisorReducer(state, {
      type: 'QUERY_SUBMITTED',
      proposal,
    })
    expect(next.status).toBe('analyzing')
    expect(next.query).toBe('Urla’da arsa')
    expect(next.proposal).toBe(proposal)
    expect(next.error).toBeUndefined()
  })

  it('enforces the three-listing comparison limit', () => {
    const initial = {
      ...createInitialAdvisorState(),
      compareIds: ['a', 'b', 'c'],
    }
    const next = advisorReducer(initial, {
      type: 'COMPARE_TOGGLED',
      listingId: 'd',
    })
    expect(next.compareIds).toEqual(['a', 'b', 'c'])
    expect(next.notice).toBe('En fazla 3 ilan karşılaştırabilirsiniz.')
  })

  it('returns to the previous stable status after cancellation', () => {
    const initial = {
      ...createInitialAdvisorState(),
      status: 'results' as const,
    }
    const proposal = parseAdvisorPrompt('Kadıköy kiralık')
    const analyzing = advisorReducer(initial, {
      type: 'QUERY_SUBMITTED',
      proposal,
    })
    const cancelled = advisorReducer(analyzing, { type: 'QUERY_CANCELLED' })
    expect(cancelled.status).toBe('results')
  })

  it('preserves parsed criteria when analysis fails', () => {
    const proposal = parseAdvisorPrompt(
      'İzmir’de 5 milyon TL altında satılık arsa',
    )
    const analyzing = advisorReducer(createInitialAdvisorState(), {
      type: 'QUERY_SUBMITTED',
      proposal,
    })
    const failed = advisorReducer(analyzing, {
      type: 'ANALYSIS_FAILED',
      message: 'İlanlar şu anda hazırlanamadı.',
    })

    expect(failed.status).toBe('error')
    expect(failed.proposal?.criteria).toEqual(proposal.criteria)
    expect(failed.query).toBe(proposal.query)
  })

  it('keeps one clarification question in the idle state', () => {
    const proposal = parseAdvisorPrompt('Bütçeme uygun bir yer arıyorum')
    const next = advisorReducer(createInitialAdvisorState(), {
      type: 'CLARIFICATION_REQUIRED',
      proposal,
    })

    expect(next.status).toBe('idle')
    expect(next.proposal).toBe(proposal)
    expect(next.query).toBe('')
    expect(next.notice).toBe('Hangi şehir veya bölgede arama yapalım?')
  })

  it('removes scalar and feature criteria without mutating the source', () => {
    const proposal = parseAdvisorPrompt(
      'Urla’da 5 milyon TL altında imarlı arsa',
    )
    const initial = { ...createInitialAdvisorState(), proposal }
    const withoutBudget = advisorReducer(initial, {
      type: 'CRITERION_REMOVED',
      removal: { key: 'budgetMax' },
    })
    const withoutZoning = advisorReducer(withoutBudget, {
      type: 'CRITERION_REMOVED',
      removal: { key: 'mustHave', feature: 'zoning' },
    })

    expect(withoutBudget.proposal?.criteria.budget.max).toBeUndefined()
    expect(withoutZoning.proposal?.criteria.mustHave).not.toContain('zoning')
    expect(proposal.criteria.budget.max).toBe(5_000_000)
  })
})
```

```ts
import { describe, expect, it } from 'vitest'
import {
  parseAdvisorRouteSearch,
  serializeAdvisorRouteSearch,
} from './advisor-route-search'

describe('advisor route search', () => {
  it('normalizes query and unique comparison ids', () => {
    expect(
      parseAdvisorRouteSearch({
        q: '  Urla arsa  ',
        compare: 'listing-1-1,listing-1-2,listing-1-1,unknown',
      }),
    ).toEqual({
      query: 'Urla arsa',
      compareIds: ['listing-1-1', 'listing-1-2', 'unknown'],
    })
  })

  it('serializes only meaningful values and caps comparison ids', () => {
    expect(
      serializeAdvisorRouteSearch({
        query: '',
        compareIds: ['a', 'b', 'c', 'd'],
      }),
    ).toEqual({ compare: 'a,b,c' })
  })
})
```

- [ ] **Step 2: Run tests and verify RED**

```bash
npm test -- apps/web/src/features/advisor/domain/advisor-reducer.test.ts apps/web/src/features/advisor/domain/advisor-route-search.test.ts --run
```

Expected: FAIL because both modules are missing.

- [ ] **Step 3: Implement the reducer**

Use this state contract:

```ts
export type AdvisorStatus =
  | 'idle'
  | 'analyzing'
  | 'results'
  | 'empty'
  | 'error'

export type AdvisorOverlay =
  | 'criteria'
  | 'listing'
  | 'trust'
  | 'history'
  | 'advisorConsent'

export interface AdvisorHistoryEntry {
  id: string
  title: string
  detail: string
  status: 'done' | 'rejected' | 'info'
}

export interface AdvisorWorkspaceState {
  status: AdvisorStatus
  previousStableStatus: Exclude<AdvisorStatus, 'analyzing'>
  query: string
  proposal?: AdvisorProposal
  matches: AdvisorMatch[]
  selectedListingId?: string
  compareIds: string[]
  favoriteIds: string[]
  overlay?: AdvisorOverlay
  error?: string
  notice?: string
  consentStatus: 'idle' | 'approved' | 'rejected'
  history: AdvisorHistoryEntry[]
}
```

Use this exact action union:

```ts
export type AdvisorWorkspaceAction =
  | { type: 'QUERY_CHANGED'; query: string }
  | { type: 'QUERY_SUBMITTED'; proposal: AdvisorProposal }
  | {
      type: 'ANALYSIS_SUCCEEDED'
      proposal: AdvisorProposal
      matches: AdvisorMatch[]
    }
  | { type: 'CLARIFICATION_REQUIRED'; proposal: AdvisorProposal }
  | { type: 'ANALYSIS_FAILED'; message: string }
  | { type: 'QUERY_CANCELLED' }
  | { type: 'CRITERIA_REPLACED'; proposal: AdvisorProposal }
  | { type: 'CRITERION_REMOVED'; removal: AdvisorCriterionRemoval }
  | { type: 'LISTING_SELECTED'; listingId: string }
  | { type: 'FAVORITE_TOGGLED'; listingId: string }
  | { type: 'COMPARE_TOGGLED'; listingId: string }
  | { type: 'SEARCH_SAVED' }
  | { type: 'ALERT_CREATED' }
  | { type: 'OVERLAY_OPENED'; overlay: AdvisorOverlay }
  | { type: 'OVERLAY_CLOSED' }
  | { type: 'CONSENT_APPROVED' }
  | { type: 'CONSENT_REJECTED' }
  | { type: 'NOTICE_CLEARED' }
```

`QUERY_SUBMITTED` stores both `proposal` and `proposal.query` before any
adapter call, then enters `analyzing`; failures therefore preserve parsed and
edited criteria. It snapshots `previousStableStatus` only when the current
state is not already `analyzing`, so a replacement request keeps the correct
cancel destination. `ANALYSIS_SUCCEEDED` selects `results` or `empty` based
on `matches.length`.
`CLARIFICATION_REQUIRED` returns to `idle`, keeps the parsed proposal, and
publishes exactly one clarification question without starting the adapter. It
clears the composer value so that the user's next submission is treated as the
answer, while the original request remains visible in the clarification card.
`ANALYSIS_FAILED` preserves the query and proposal. `QUERY_CANCELLED` aborts
the request, restores `previousStableStatus`, preserves the query, and sets
`Analiz durduruldu.` as the polite notice. Consent actions append an
`AdvisorHistoryEntry` whose
detail explicitly states whether any data was shared. `SEARCH_SAVED` and
`ALERT_CREATED` append local preview history entries and expose a polite notice;
their copy explicitly says that no account write or notification occurred.
`CRITERIA_REPLACED` is the atomic drawer form implementation of the approved
`CRITERION_UPDATED` event. `CRITERION_REMOVED` handles every
`AdvisorCriterionRemoval`; removing a city also clears its district, numeric
keys remove only their bound, and feature removals affect only their named
collection.
`COMPARE_TOGGLED` removes an existing ID before checking the three-item limit;
new IDs over the limit are rejected with the notice. Initial comparison IDs
are deduplicated and capped to three. Favorites remain explicit session-only
IDs.

- [ ] **Step 4: Implement route parsing/serialization and pass tests**

```ts
export interface AdvisorRouteState {
  query: string
  compareIds: string[]
}

export function parseAdvisorRouteSearch(
  raw: Record<string, unknown>,
): AdvisorRouteState {
  const query = typeof raw.q === 'string' ? raw.q.trim() : ''
  const compareIds =
    typeof raw.compare === 'string'
      ? [...new Set(raw.compare.split(',').map((id) => id.trim()).filter(Boolean))]
          .slice(0, 3)
      : []
  return { query, compareIds }
}

export function serializeAdvisorRouteSearch(
  state: AdvisorRouteState,
): Record<string, string> {
  const result: Record<string, string> = {}
  if (state.query.trim()) result.q = state.query.trim()
  if (state.compareIds.length > 0) {
    result.compare = state.compareIds.slice(0, 3).join(',')
  }
  return result
}
```

Run:

```bash
npm test -- apps/web/src/features/advisor/domain/advisor-reducer.test.ts apps/web/src/features/advisor/domain/advisor-route-search.test.ts --run
```

Expected: PASS.

- [ ] **Step 5: Commit state and URL contracts**

```bash
git add apps/web/src/features/advisor/domain
git commit -m "feat(advisor): add workspace state machine"
```

---

### Task 4: Build the unified explainable listing card

**Files:**
- Create: `apps/web/src/features/listings/data/listing-photos.ts`
- Create: `apps/web/src/features/advisor/components/AdvisorListingCard.tsx`
- Create: `apps/web/src/features/advisor/components/AdvisorListingCard.module.css`
- Create: `apps/web/src/features/advisor/components/AdvisorListingCard.test.tsx`

**Interfaces:**
- Consumes: `AdvisorMatch`.
- Produces: `AdvisorListingCardProps` and `getRepresentativeListingImage(listing)`.

- [ ] **Step 1: Write failing card interaction tests**

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import type { AdvisorMatch } from '../domain/advisor-types'
import { AdvisorListingCard } from './AdvisorListingCard'

const match: AdvisorMatch = {
  listing: LISTING_FIXTURES[0],
  score: 92,
  reasons: ['Konut imarı tercihinizle eşleşiyor.'],
  criteria: [
    {
      key: 'zoning',
      label: 'Konut imarlı',
      kind: 'required',
      matched: true,
      detail: 'İlan bilgisinde mevcut.',
    },
  ],
  evidence: [],
  missingData: [],
}

describe('AdvisorListingCard', () => {
  it('renders one coherent listing article with decision data', () => {
    render(
      <AdvisorListingCard
        match={match}
        featured
        favorite={false}
        compared={false}
        onOpen={() => undefined}
        onFavorite={() => undefined}
        onCompare={() => undefined}
        onExplain={() => undefined}
        onSimilar={() => undefined}
      />,
    )

    expect(screen.getByRole('article')).toHaveAccessibleName(match.listing.title)
    expect(screen.getByText('4.250.000 TL')).toBeTruthy()
    expect(screen.getByText('512 m²')).toBeTruthy()
    expect(screen.getByText('%92 eşleşme')).toBeTruthy()
    expect(screen.getByText(match.reasons[0])).toBeTruthy()
  })

  it('exposes persistent favorite and compare states', () => {
    const onCompare = vi.fn()
    const onFavorite = vi.fn()
    const onSimilar = vi.fn()
    const { rerender } = render(
      <AdvisorListingCard
        match={match}
        featured={false}
        favorite={false}
        compared={false}
        onOpen={() => undefined}
        onFavorite={onFavorite}
        onCompare={onCompare}
        onExplain={() => undefined}
        onSimilar={onSimilar}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Favoriye ekle' }))
    fireEvent.click(screen.getByRole('button', { name: 'Karşılaştırmaya ekle' }))
    fireEvent.click(screen.getByRole('button', { name: 'Benzer ilanları göster' }))
    expect(onFavorite).toHaveBeenCalledOnce()
    expect(onCompare).toHaveBeenCalledOnce()
    expect(onSimilar).toHaveBeenCalledOnce()

    rerender(
      <AdvisorListingCard
        match={match}
        featured={false}
        favorite
        compared
        onOpen={() => undefined}
        onFavorite={onFavorite}
        onCompare={onCompare}
        onExplain={() => undefined}
        onSimilar={onSimilar}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Favoriden çıkar' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Karşılaştırmadan çıkar' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('falls back once when representative photography cannot load', () => {
    render(
      <AdvisorListingCard
        match={match}
        featured={false}
        favorite={false}
        compared={false}
        onOpen={() => undefined}
        onFavorite={() => undefined}
        onCompare={() => undefined}
        onExplain={() => undefined}
        onSimilar={() => undefined}
      />,
    )
    const image = screen.getByAltText(/temsili ilan fotoğrafı/i)
    fireEvent.error(image)
    expect(image).toHaveAttribute('src', match.listing.image.src)
    fireEvent.error(image)
    expect(image).toHaveAttribute('src', match.listing.image.src)
  })
})
```

- [ ] **Step 2: Run the card test and verify RED**

```bash
npm test -- apps/web/src/features/advisor/components/AdvisorListingCard.test.tsx --run
```

Expected: FAIL because the card module does not exist.

- [ ] **Step 3: Add representative image mapping**

Create a category mapping with stable existing Unsplash delivery URLs:

```ts
const IMAGE_BY_CATEGORY = {
  land:
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=84',
  residential:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84',
  commercial:
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=84',
  building:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84',
  timeshare:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=84',
  touristic:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=84',
} satisfies Record<ListingSummary['category'], string>

export function getRepresentativeListingImage(listing: ListingSummary) {
  return {
    src: IMAGE_BY_CATEGORY[listing.category],
    fallbackSrc: listing.image.src,
    alt: `${listing.title} için temsili ilan fotoğrafı`,
  }
}
```

Inside `AdvisorListingCard.tsx`, define the formatting helpers as:

```ts
const formatPrice = (value: number) =>
  `${value.toLocaleString('tr-TR')} TL`
const formatArea = (value: number) =>
  `${value.toLocaleString('tr-TR')} m²`
const formatUnitPrice = (value: number) =>
  `${value.toLocaleString('tr-TR')} TL/m²`
```

The card image `onError` must switch once to `fallbackSrc`, preventing an
infinite error loop.

- [ ] **Step 4: Implement semantic card markup and token-only CSS**

The root is:

```tsx
<article
  className={styles.card}
  data-featured={featured || undefined}
  aria-labelledby={titleId}
>
  <button className={styles.mediaAction} type="button" onClick={onOpen}>
    <img src={imageSrc} alt={image.alt} onError={handleImageError} />
    <span className={styles.demoLabel}>Temsili fotoğraf</span>
    <span className={styles.photoCount}>{listing.imageCount} fotoğraf</span>
  </button>
  <div className={styles.body}>
    <div className={styles.identity}>
      <span className={styles.verification}>
        {listing.verified ? 'EİDS doğrulandı' : 'Belge incelemesi gerekiyor'}
      </span>
      <h3 id={titleId}>{listing.title}</h3>
      <p>{listing.city} / {listing.district}</p>
    </div>
    <dl className={styles.metrics}>
      <div><dt>Fiyat</dt><dd>{formatPrice(listing.price)}</dd></div>
      <div><dt>Alan</dt><dd>{formatArea(listing.area)}</dd></div>
      <div><dt>m² fiyatı</dt><dd>{formatUnitPrice(listing.unitPrice)}</dd></div>
    </dl>
    <div className={styles.match}>
      <strong>%{match.score} eşleşme</strong>
      <p>{match.reasons[0]}</p>
    </div>
    <ul className={styles.highlights} aria-label="Öne çıkan özellikler">
      {listing.highlights.slice(0, 3).map((highlight) => (
        <li key={highlight}>{highlight}</li>
      ))}
    </ul>
    <div className={styles.actions}>
      <button type="button" onClick={onOpen}>İlanı incele</button>
      <button
        type="button"
        aria-pressed={favorite}
        aria-label={favorite ? 'Favoriden çıkar' : 'Favoriye ekle'}
        onClick={onFavorite}
      >
        {favorite ? 'Kaydedildi' : 'Favori'}
      </button>
      <button
        type="button"
        aria-pressed={compared}
        aria-label={compared ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'}
        onClick={onCompare}
      >
        {compared ? 'Seçildi' : 'Karşılaştır'}
      </button>
      <button type="button" onClick={onExplain}>Neden önerildi?</button>
      <button type="button" onClick={onSimilar}>
        Benzer ilanları göster
      </button>
    </div>
  </div>
</article>
```

CSS uses `--lg-radius-card`, `--lg-radius-media`, `--lg-hairline`,
`--lg-surface`, typography tokens, spacing tokens, and focus tokens. It defines
no raw pixel or hex values. `featured` changes only grid composition and media
aspect ratio.

Run:

```bash
npm test -- apps/web/src/features/advisor/components/AdvisorListingCard.test.tsx --run
npm run typecheck:web
```

Expected: PASS.

- [ ] **Step 5: Commit the card slice**

```bash
git add apps/web/src/features/listings/data/listing-photos.ts apps/web/src/features/advisor/components/AdvisorListingCard*
git commit -m "feat(advisor): add explainable listing cards"
```

---

### Task 5: Build the welcome, profile, results, and decision components

**Files:**
- Create: `apps/web/src/features/advisor/components/AdvisorWelcome.tsx`
- Create: `apps/web/src/features/advisor/components/AdvisorComposer.tsx`
- Create: `apps/web/src/features/advisor/components/AdvisorSearchProfile.tsx`
- Create: `apps/web/src/features/advisor/components/AdvisorResults.tsx`
- Create: `apps/web/src/features/advisor/components/AdvisorDecisionRail.tsx`
- Create: `apps/web/src/features/advisor/components/AdvisorPanels.module.css`
- Create: `apps/web/src/features/advisor/components/AdvisorPanels.test.tsx`

**Interfaces:**
- Consumes: proposal, matches, status, compare IDs, favorites, and event callbacks.
- Produces: focused presentational components with no router dependency.

- [ ] **Step 1: Write failing composition tests**

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdvisorWelcome } from './AdvisorWelcome'
import { AdvisorDecisionRail } from './AdvisorDecisionRail'

const proposalFixture: AdvisorProposal = {
  query: 'Urla’da 5 milyon TL altında imarlı arsa',
  criteria: {
    intent: 'buy',
    city: 'izmir',
    district: 'urla',
    propertyTypes: ['land'],
    budget: { max: 5_000_000 },
    area: {},
    mustHave: ['zoning'],
    preferences: [],
  },
  summary: 'Urla içinde kriterlerinize uyan ilanları hazırladım.',
  interpretationConfidence: 92,
}

describe('advisor panels', () => {
  it('offers one query surface and flat examples on first use', () => {
    const onSubmit = vi.fn()
    render(
      <AdvisorWelcome
        query=""
        onQueryChange={() => undefined}
        onSubmit={onSubmit}
      />,
    )
    expect(screen.getAllByRole('search')).toHaveLength(1)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Urla’da 5 milyon TL altında imarlı arsa',
      }),
    )
    expect(onSubmit).toHaveBeenCalledWith(
      'Urla’da 5 milyon TL altında imarlı arsa',
    )
  })

  it('shows compare progress without a second floating bar', () => {
    render(
      <AdvisorDecisionRail
        proposal={proposalFixture}
        compareIds={['listing-1-1', 'listing-1-2']}
        onEditCriteria={() => undefined}
        onRemoveCriterion={() => undefined}
        onOpenCompare={() => undefined}
        onSaveSearch={() => undefined}
        onCreateAlert={() => undefined}
        onOpenTrust={() => undefined}
        onOpenHistory={() => undefined}
        onOpenAdvisorConsent={() => undefined}
      />,
    )
    expect(screen.getByText('2/3 ilan seçildi')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Karşılaştır' })).toBeEnabled()
  })
})
```

Import `AdvisorProposal` from `../domain/advisor-types`.

- [ ] **Step 2: Run panel tests and verify RED**

```bash
npm test -- apps/web/src/features/advisor/components/AdvisorPanels.test.tsx --run
```

Expected: FAIL because the panel modules do not exist.

- [ ] **Step 3: Implement one composer and editable profile summary**

`AdvisorComposer` wraps `GlassAiSearchBar` once:

```tsx
export interface AdvisorComposerProps {
  query: string
  status: AdvisorStatus
  onQueryChange: (query: string) => void
  onSubmit: (query: string) => void
  onCancel?: () => void
}

export function AdvisorComposer({
  query,
  status,
  onQueryChange,
  onSubmit,
  onCancel,
}: AdvisorComposerProps) {
  const analyzing = status === 'analyzing'
  return (
    <div className={styles.composer}>
      <p className={styles.composerLabel}>Ne aradığınızı doğal biçimde yazın</p>
      <GlassAiSearchBar
        value={query}
        onValueChange={onQueryChange}
        onSubmit={onSubmit}
        aria-busy={analyzing}
        placeholder="Örn. Urla’da 5 milyon TL altında imarlı arsa"
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            (event.nativeEvent as KeyboardEvent).isComposing
          ) {
            event.preventDefault()
          }
        }}
      />
      {analyzing && onCancel ? (
        <button type="button" className={styles.textAction} onClick={onCancel}>
          Analizi durdur
        </button>
      ) : null}
    </div>
  )
}
```

The composer remains editable while `aria-busy` is true. Submitting a revised
query aborts the previous request; `Analizi durdur` cancels without clearing
the query. The geometry-matched results skeleton owns the visible live status.

`AdvisorWelcome` renders one eyebrow, one H1, one subtext, this composer, and
three native flat example buttons. It does not render `GlassChatDock`,
`GlassChip`, an empty results panel, or activity log.

`AdvisorSearchProfile` renders labeled criterion rows and explicit remove/edit
buttons. It never displays criterion values as default glass chips.

- [ ] **Step 4: Implement results and decision rail, then pass tests**

`AdvisorResults` receives `status` and renders:

- a geometry-matched skeleton for `analyzing`;
- an inline error with retry/edit callbacks for `error`;
- a constraint explanation and remove-criterion callback for `empty`;
- one `featured` `AdvisorListingCard` plus an alternatives grid for `results`.

`AdvisorDecisionRail` renders:

- `AdvisorSearchProfile`;
- `N/3 ilan seçildi`;
- one prominent `GlassButton` for enabled comparison;
- native flat/text actions for save, alarm, trust, history, and advisor consent.

Run:

```bash
npm test -- apps/web/src/features/advisor/components/AdvisorPanels.test.tsx apps/web/src/features/advisor/components/AdvisorListingCard.test.tsx --run
npm run typecheck:web
```

Expected: PASS.

- [ ] **Step 5: Commit panel components**

```bash
git add apps/web/src/features/advisor/components
git commit -m "feat(advisor): compose the calm decision studio"
```

---

### Task 6: Rewrite the workspace as a reducer-driven single flow

**Files:**
- Rewrite: `apps/web/src/features/advisor/AdvisorWorkspace.tsx`
- Rewrite: `apps/web/src/features/advisor/AdvisorWorkspace.module.css`
- Expand: `apps/web/src/features/advisor/AdvisorWorkspace.test.tsx`
- Modify: `apps/web/src/features/advisor/index.ts`

**Interfaces:**
- Consumes: Task 1 parser, Task 2 adapter, Task 3 reducer, and Task 4/5 components.
- Produces: `AdvisorWorkspaceProps`, the full idle/analyzing/results/empty/error flow, and route-state callbacks.

- [ ] **Step 1: Replace the existing tests with failing end-to-end component tests**

```tsx
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  createFixtureAdvisorSearchAdapter,
  type AdvisorSearchAdapter,
} from './data/advisor-search-adapter'
import { AdvisorWorkspace } from './AdvisorWorkspace'

describe('AdvisorWorkspace', () => {
  it('starts with one focused advisor composer', () => {
    render(<AdvisorWorkspace searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })} />)
    expect(
      screen.getByRole('heading', {
        name: 'Doğru ilanı birlikte bulalım.',
      }),
    ).toBeTruthy()
    expect(screen.getAllByRole('search')).toHaveLength(1)
    expect(screen.queryByText('Karar günlüğü')).toBeNull()
    expect(screen.queryByText('Bir arama başlatın')).toBeNull()
  })

  it('does not submit an empty or whitespace-only query', () => {
    const search = vi.fn<AdvisorSearchAdapter['search']>()
    render(<AdvisorWorkspace searchAdapter={{ search }} />)
    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(search).not.toHaveBeenCalled()
  })

  it('moves through analyzing to explainable results', async () => {
    vi.useFakeTimers()
    render(<AdvisorWorkspace searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 20 })} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Urla’da 5 milyon TL altında imarlı arsa',
      }),
    )
    expect(screen.getByRole('status')).toHaveTextContent('İlanlar analiz ediliyor')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20)
    })

    expect(await screen.findByText(/ilan eşleşti/)).toBeTruthy()
    expect(screen.getByText('Arama profilim')).toBeTruthy()
    expect(screen.getByText(/Konut imarı tercihinizle eşleşiyor/)).toBeTruthy()
    vi.useRealTimers()
  })

  it('keeps the query and retries after an error', async () => {
    const working = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const search = vi
      .fn<AdvisorSearchAdapter['search']>()
      .mockRejectedValueOnce(new Error('İlanlar şu anda hazırlanamadı.'))
      .mockImplementation((proposal, options) =>
        working.search(proposal, options),
      )
    render(<AdvisorWorkspace searchAdapter={{ search }} />)
    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: 'İzmir’de satılık emlak' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(await screen.findByText('İlanlar şu anda hazırlanamadı.')).toBeTruthy()
    expect(input).toHaveValue('İzmir’de satılık emlak')
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }))
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(await screen.findByText(/ilan eşleşti/)).toBeTruthy()
  })

  it('keeps the composer editable and cancels analysis without clearing it', async () => {
    const slow = createFixtureAdvisorSearchAdapter({ delayMs: 2_000 })
    let activeSignal: AbortSignal | undefined
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => {
        activeSignal = options?.signal
        return slow.search(proposal, options)
      },
    )
    render(
      <AdvisorWorkspace searchAdapter={{ search }} />,
    )
    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: 'Urla’da arsa' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(input).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))
    expect(input).toHaveValue('Urla’da arsa')
    expect(activeSignal?.aborted).toBe(true)
    expect(screen.getByRole('status')).toHaveTextContent('Analiz durduruldu.')
  })

  it('asks one short clarification before searching a vague request', async () => {
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      async (proposal) => ({
        proposal,
        matches: [],
        generatedAt: '2026-07-26T12:00:00.000Z',
      }),
    )
    const onRouteStateChange = vi.fn()
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Bütçeme uygun bir yer arıyorum"
        onRouteStateChange={onRouteStateChange}
      />,
    )

    expect(
      await screen.findByText('Hangi şehir veya bölgede arama yapalım?'),
    ).toBeTruthy()
    expect(search).not.toHaveBeenCalled()
    expect(screen.getAllByRole('search')).toHaveLength(1)

    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: 'İzmir' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(search).toHaveBeenCalledOnce())
    expect(search.mock.calls[0]?.[0].query).toBe(
      'Bütçeme uygun bir yer arıyorum İzmir',
    )
    expect(onRouteStateChange).toHaveBeenLastCalledWith({
      query: 'Bütçeme uygun bir yer arıyorum İzmir',
      compareIds: [],
    })
  })

  it('explains an empty result through removable hard criteria', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({
          listings: [],
          delayMs: 0,
        })}
        initialQuery="Urla’da 1 milyon TL altında imarlı arsa"
      />,
    )

    expect(await screen.findByText(/sonuç bulunamadı/i)).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Maksimum bütçeyi kaldır' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'İmar şartını kaldır' }),
    ).toBeTruthy()
  })

  it('provides the shell skip-link target', () => {
    const { container } = render(<AdvisorWorkspace />)
    expect(container.querySelector('main#main-content')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run workspace tests and verify RED**

```bash
npm test -- apps/web/src/features/advisor/AdvisorWorkspace.test.tsx --run
```

Expected: FAIL because the current workspace still renders duplicate chat/search surfaces and lacks the new state API.

- [ ] **Step 3: Implement the orchestration**

Use this public API:

```ts
export interface AdvisorWorkspaceProps {
  initialQuery?: string
  initialCompareIds?: string[]
  searchAdapter?: AdvisorSearchAdapter
  onRouteStateChange?: (state: AdvisorRouteState) => void
  onOpenComparison?: (ids: string[]) => void
}
```

Implementation rules:

- one `AdvisorComposer` instance exists at every state;
- remove the transitional `criteria.propertyType` and `proposal.confidence`
  aliases from Task 1 after the old workspace no longer consumes them;
- `AbortController` is stored in a ref and aborted before a newer search;
- the default adapter is created once with `useMemo`;
- a valid `initialQuery` auto-runs once after mount behind a
  `didAutoRunRef`, including React Strict Mode;
- reducer events own all visible state;
- the workspace owns exactly one persistent `role="status"` and
  `aria-live="polite"` outlet for analyzing, result count, limits, local
  preview actions, and clarification; visual skeletons are `aria-hidden`;
- `onRouteStateChange` fires immediately after every non-empty parsed
  submission and after comparison selection changes, so clarification,
  cancellation, and error states never lose the shareable query;
- a proposal with `clarification` renders its single question beside the same composer and never calls the search adapter;
- `Benzer ilanları göster` builds a deterministic Turkish query from the
  listing transaction, city, district, category, and optional room count,
  then submits through the same abortable path;
- no `GlassChatDock`, duplicate inline input, `GlassAiSummaryCard`, or always-visible activity panel remains.
- an unmount cleanup aborts the current controller so delayed adapters cannot
  dispatch into an abandoned workspace.

Core submit function:

```ts
const stateRef = useRef(state)
stateRef.current = state

const submit = useCallback(
  async (rawQuery: string) => {
    const query = rawQuery.trim()
    if (!query) return
    requestRef.current?.abort()
    const pendingProposal = stateRef.current.proposal?.clarification
      ? stateRef.current.proposal
      : undefined
    const proposal = pendingProposal
      ? mergeAdvisorClarification(pendingProposal, query)
      : parseAdvisorPrompt(query)
    dispatch({ type: 'QUERY_SUBMITTED', proposal })
    onRouteStateChange?.({
      query: proposal.query,
      compareIds: stateRef.current.compareIds,
    })
    if (proposal.clarification) {
      dispatch({ type: 'CLARIFICATION_REQUIRED', proposal })
      return
    }
    const controller = new AbortController()
    requestRef.current = controller
    try {
      const result = await adapter.search(proposal, {
        signal: controller.signal,
      })
      dispatch({
        type: 'ANALYSIS_SUCCEEDED',
        proposal: result.proposal,
        matches: result.matches,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      dispatch({
        type: 'ANALYSIS_FAILED',
        message:
          error instanceof Error
            ? error.message
            : 'İlanlar şu anda hazırlanamadı.',
      })
    } finally {
      if (requestRef.current === controller) requestRef.current = null
    }
  },
  [adapter, onRouteStateChange],
)
```

- [ ] **Step 4: Replace the cascade CSS with one coherent layout and pass tests**

`AdvisorWorkspace.module.css` must contain:

- page container and dock safe-area reservation;
- a 52rem idle stage;
- a shared results container;
- 12-column `workspace` with `results` spanning 8 and `rail` spanning 4;
- a sticky rail only in the wide-container rule;
- medium-container profile band;
- strict one-column narrow layout;
- no duplicated selector blocks;
- no `!important`;
- no raw pixel or hex values.

Run:

```bash
npm test -- apps/web/src/features/advisor/AdvisorWorkspace.test.tsx apps/web/src/features/advisor/components --run
npm run typecheck:web
```

Expected: PASS.

- [ ] **Step 5: Commit the workspace rewrite**

```bash
git add apps/web/src/features/advisor
git commit -m "feat(advisor): rebuild the advisor workspace"
```

---

### Task 7: Add criteria, evidence, history, and consent drawers

**Files:**
- Create: `apps/web/src/features/advisor/components/AdvisorDrawers.tsx`
- Modify: `apps/web/src/features/advisor/components/AdvisorPanels.module.css`
- Modify: `apps/web/src/features/advisor/AdvisorWorkspace.tsx`
- Expand: `apps/web/src/features/advisor/AdvisorWorkspace.test.tsx`

**Interfaces:**
- Consumes: reducer overlay state, selected match, proposal, compare IDs, and consent status.
- Produces: accessible controlled drawers and complete action feedback.

- [ ] **Step 1: Add failing interaction and consent tests**

```tsx
const instantAdapter = createFixtureAdvisorSearchAdapter({ delayMs: 0 })

it('edits a criterion and recomputes results', async () => {
  render(<AdvisorWorkspace searchAdapter={instantAdapter} initialQuery="Urla’da arsa" />)
  expect(await screen.findByText(/ilan eşleşti/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Kriterleri düzenle' }))
  expect(screen.getByRole('dialog', { name: 'Arama kriterlerini düzenle' })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Maksimum bütçe'), {
    target: { value: '3000000' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Kriterleri uygula' }))
  expect(await screen.findByText(/sonuç bulunamadı/i)).toBeTruthy()
})

it('shows evidence without claiming missing data is verified', async () => {
  render(<AdvisorWorkspace searchAdapter={instantAdapter} initialQuery="Urla’da arsa" />)
  await screen.findByText(/ilan eşleşti/)
  fireEvent.click(screen.getByRole('button', { name: 'Güven ve kaynaklar' }))
  const dialog = screen.getByRole('dialog', { name: 'Güven ve kaynaklar' })
  expect(dialog).toHaveTextContent('İlan doğrulama kaydı')
  expect(dialog).toHaveTextContent('Temsili demo verisi')
})

it('records explicit advisor consent and supports rejection', async () => {
  render(<AdvisorWorkspace searchAdapter={instantAdapter} initialQuery="Urla’da arsa" />)
  await screen.findByText(/ilan eşleşti/)
  fireEvent.click(screen.getByRole('button', { name: 'Danışman desteği' }))
  expect(
    screen.getByRole('dialog', { name: 'İnsan danışmanla paylaşım' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Vazgeç' }))
  expect(screen.getByRole('status')).toHaveTextContent(
    'Paylaşım yapılmadı.',
  )

  fireEvent.click(screen.getByRole('button', { name: 'Danışman desteği' }))
  fireEvent.click(screen.getByRole('button', { name: 'Onayla' }))
  expect(screen.getByRole('status')).toHaveTextContent(
    'Onay kaydedildi. Bu prototip dışarıya veri göndermedi.',
  )
})

it('removes criteria and keeps favorite and compare states visible', async () => {
  render(
    <AdvisorWorkspace
      searchAdapter={instantAdapter}
      initialQuery="Urla’da imarlı arsa"
    />,
  )
  await screen.findByText(/ilan eşleşti/)

  fireEvent.click(
    screen.getByRole('button', { name: 'İmar şartını kaldır' }),
  )
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'İmar şartını kaldır' }),
    ).toBeNull(),
  )
  await screen.findByText(/ilan eşleşti/)

  fireEvent.click(
    screen.getAllByRole('button', { name: 'Favoriye ekle' })[0],
  )
  expect(
    screen.getAllByRole('button', { name: 'Favoriden çıkar' })[0],
  ).toHaveAttribute('aria-pressed', 'true')

  for (let index = 0; index < 3; index += 1) {
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Karşılaştırmaya ekle' })[0],
    )
  }
  expect(screen.getByText('3/3 ilan seçildi')).toBeTruthy()
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Karşılaştırmaya ekle' })[0],
  )
  expect(screen.getByRole('status')).toHaveTextContent(
    'En fazla 3 ilan karşılaştırabilirsiniz.',
  )
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Karşılaştırmadan çıkar' })[0],
  )
  expect(screen.getByText('2/3 ilan seçildi')).toBeTruthy()
})

it('opens listing detail and returns focus to the trigger', async () => {
  render(<AdvisorWorkspace searchAdapter={instantAdapter} initialQuery="Urla’da arsa" />)
  await screen.findByText(/ilan eşleşti/)
  const trigger = screen.getAllByRole('button', { name: 'İlanı incele' })[0]
  trigger.focus()
  fireEvent.click(trigger)
  expect(
    screen.getByRole('dialog', { name: /ilan detay/i }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
  await waitFor(() => expect(trigger).toHaveFocus())
})

it('submits a deterministic similar-listing query', async () => {
  const search = vi.fn<AdvisorSearchAdapter['search']>(
    (proposal, options) => instantAdapter.search(proposal, options),
  )
  render(
    <AdvisorWorkspace
      searchAdapter={{ search }}
      initialQuery="Urla’da arsa"
    />,
  )
  await screen.findByText(/ilan eşleşti/)
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Benzer ilanları göster' })[0],
  )
  await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
  expect(search.mock.calls[1]?.[0].query).toContain('izmir urla')
})

it('labels save and alert actions as local previews', async () => {
  render(<AdvisorWorkspace searchAdapter={instantAdapter} initialQuery="Urla’da arsa" />)
  await screen.findByText(/ilan eşleşti/)

  fireEvent.click(screen.getByRole('button', { name: 'Aramayı kaydet' }))
  expect(screen.getByRole('status')).toHaveTextContent(
    'Arama yalnız bu demo oturumu için kaydedildi.',
  )

  fireEvent.click(screen.getByRole('button', { name: 'Fiyat alarmı oluştur' }))
  expect(screen.getByRole('status')).toHaveTextContent(
    'Alarm önizlemesi hazır. Bildirim gönderilmeyecek.',
  )
})
```

- [ ] **Step 2: Run workspace tests and verify RED**

```bash
npm test -- apps/web/src/features/advisor/AdvisorWorkspace.test.tsx --run
```

Expected: FAIL because the approved drawers and reducer events are not wired.

- [ ] **Step 3: Implement `AdvisorDrawers`**

Render separate controlled `GlassDrawer` instances for:

- criteria: flat `GlassSelect material="flat"` controls for intent and
  locations, labeled numeric inputs for budget and area, a room field, and
  native flat checkbox fieldsets for property types, structural requirements,
  and preferences;
- listing: image, metrics, criterion breakdown, evidence, and explicit close button;
- trust/history: sources, missing-data explanation, demo-data notice, and session event list;
- advisor consent: share scope, approval and rejection controls.

Every drawer includes a visible native flat close button:

```tsx
<button
  type="button"
  className={styles.closeAction}
  onClick={onClose}
>
  Kapat
</button>
```

The consent footer contains:

```tsx
<>
  <button type="button" className={styles.textAction} onClick={onReject}>
    Vazgeç
  </button>
  <GlassButton prominent onClick={onApprove}>
    Onayla
  </GlassButton>
</>
```

The approved action updates local history with:
`Onay kaydedildi. Bu prototip dışarıya veri göndermedi.`

- [ ] **Step 4: Wire criterion updates and pass tests**

Criterion edits dispatch `CRITERIA_REPLACED`, close the drawer, and call the
adapter with the revised proposal. Removal uses `CRITERION_REMOVED`. Empty
results list which hard criteria are currently active and provide direct
remove buttons. Save and alert controls dispatch `SEARCH_SAVED` and
`ALERT_CREATED`; both update the session-only history and polite notice
without claiming an account write or notification delivery.

Run:

```bash
npm test -- apps/web/src/features/advisor/AdvisorWorkspace.test.tsx apps/web/src/features/advisor/components --run
npm run typecheck:web
```

Expected: PASS.

- [ ] **Step 5: Commit drawer interactions**

```bash
git add apps/web/src/features/advisor
git commit -m "feat(advisor): add trusted decision disclosures"
```

---

### Task 8: Connect validated route state and comparison handoff

**Files:**
- Modify: `apps/web/src/routes/ai-danisman.tsx`
- Create: `apps/web/src/routes/ai-danisman.test.tsx`
- Create: `apps/web/src/features/comparison/comparison-listing-adapter.ts`
- Create: `apps/web/src/features/comparison/comparison-listing-adapter.test.ts`
- Modify: `apps/web/src/features/comparison/ComparisonWorkbench.tsx`
- Modify: `apps/web/src/features/comparison/ComparisonWorkbench.test.tsx`
- Modify: `apps/web/src/routes/karsilastir.tsx`
- Create: `apps/web/src/routes/karsilastir.test.tsx`

**Interfaces:**
- Consumes: `AdvisorRouteState`, listing fixture IDs, and `LISTING_FIXTURES`.
- Produces: `/ai-danisman?q=...&compare=...` persistence and `/karsilastir?ids=...` selected listing rendering.

- [ ] **Step 1: Write failing route and comparison adapter tests**

```tsx
import { describe, expect, it } from 'vitest'
import { Route } from './ai-danisman'

describe('/ai-danisman route', () => {
  it('validates advisor search parameters', () => {
    const options = Route.options
    expect(
      options.validateSearch?.({
        q: ' Urla arsa ',
        compare: 'listing-1-1,listing-1-2,listing-1-1',
      }),
    ).toEqual({
      q: 'Urla arsa',
      compare: 'listing-1-1,listing-1-2',
    })
  })
})
```

Create `apps/web/src/routes/karsilastir.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { Route } from './karsilastir'

describe('/karsilastir route', () => {
  it('normalizes, deduplicates, and caps selected listing ids', () => {
    const options = Route.options
    expect(
      options.validateSearch?.({
        ids: ' listing-1-2,listing-1-1,listing-1-2,unknown,overflow ',
      }),
    ).toEqual({
      ids: 'listing-1-2,listing-1-1,unknown',
    })
  })

  it('omits an empty ids parameter', () => {
    expect(Route.options.validateSearch?.({ ids: '  ' })).toEqual({})
  })
})
```

Append this test to `AdvisorWorkspace.test.tsx`:

```tsx
it('persists comparison selection and hands it to the comparison route', async () => {
  const onRouteStateChange = vi.fn()
  const onOpenComparison = vi.fn()
  render(
    <AdvisorWorkspace
      searchAdapter={instantAdapter}
      initialQuery="Urla’da arsa"
      initialCompareIds={['listing-1-1']}
      onRouteStateChange={onRouteStateChange}
      onOpenComparison={onOpenComparison}
    />,
  )
  await screen.findByText(/ilan eşleşti/)
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Karşılaştırmaya ekle' })[0],
  )

  await waitFor(() =>
    expect(onRouteStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: 'Urla’da arsa',
        compareIds: expect.arrayContaining(['listing-1-1']),
      }),
    ),
  )
  const routeState = onRouteStateChange.mock.calls.at(-1)?.[0]
  expect(routeState.compareIds).toHaveLength(2)

  fireEvent.click(screen.getByRole('button', { name: 'Karşılaştır' }))
  expect(onOpenComparison).toHaveBeenCalledWith(routeState.compareIds)
})
```

```ts
import { describe, expect, it } from 'vitest'
import { createComparisonListings } from './comparison-listing-adapter'

describe('comparison listing adapter', () => {
  it('keeps URL order and ignores unknown ids', () => {
    const items = createComparisonListings([
      'listing-1-2',
      'unknown',
      'listing-1-1',
    ])
    expect(items.map((item) => item.id)).toEqual([
      'listing-1-2',
      'listing-1-1',
    ])
    expect(items[0].values).toMatchObject({
      konum: 'izmir / urla',
      oda: 'Bilgi sağlanmadı',
    })
  })

  it('returns no rows when every provided id is unknown', () => {
    expect(createComparisonListings(['unknown', 'retired-id'])).toEqual([])
  })
})
```

Append this test to `ComparisonWorkbench.test.tsx`:

```tsx
it('renders the listings selected by the advisor URL handoff', () => {
  render(
    <ComparisonWorkbench
      initialIds={['listing-1-2', 'listing-1-1']}
    />,
  )
  expect(
    screen.getAllByText(/Urla’da denize yakın, imarlı köşe parsel/).length,
  ).toBeGreaterThan(0)
  expect(
    screen.queryByText('Kozlu Fatih Sitesi 3+1'),
  ).toBeNull()
})
```

- [ ] **Step 2: Run route/adapter tests and verify RED**

```bash
npm test -- apps/web/src/routes/ai-danisman.test.tsx apps/web/src/routes/karsilastir.test.tsx apps/web/src/features/comparison/comparison-listing-adapter.test.ts apps/web/src/features/comparison/ComparisonWorkbench.test.tsx --run
```

Expected: FAIL because route validation and the comparison adapter are missing.

- [ ] **Step 3: Implement the advisor route container**

Use:

```tsx
export const Route = createFileRoute('/ai-danisman')({
  validateSearch: (search) =>
    serializeAdvisorRouteSearch(
      parseAdvisorRouteSearch(search as Record<string, unknown>),
    ),
  head: () => createPageHead('ai-advisor'),
  component: AiAdvisorRoutePage,
})

function AiAdvisorRoutePage() {
  const rawSearch = Route.useSearch()
  const navigate = Route.useNavigate()
  const routeState = parseAdvisorRouteSearch(rawSearch)

  return (
    <AdvisorWorkspace
      initialQuery={routeState.query}
      initialCompareIds={routeState.compareIds}
      onRouteStateChange={(state) =>
        void navigate({
          search: serializeAdvisorRouteSearch(state) as never,
          replace: true,
        })
      }
      onOpenComparison={(ids) =>
        void navigate({
          to: '/karsilastir',
          search: { ids: ids.join(',') } as never,
        })
      }
    />
  )
}
```

- [ ] **Step 4: Implement comparison mapping and pass all scoped tests**

`comparison-listing-adapter.ts` exports the `CompareProperty` interface and
`createComparisonListings(ids)`. It maps each selected `ListingSummary` to
the existing comparison shape and uses `getRepresentativeListingImage` for
the same representative photo shown by the advisor. Missing values use
`Bilgi sağlanmadı`.
`ComparisonWorkbench` accepts:

```ts
export interface ComparisonWorkbenchProps {
  initialIds?: string[]
}
```

When `initialIds === undefined`, retain the current `START` demonstration.
When IDs were explicitly provided, always use the adapter result, including an
empty array if every ID is stale or unknown. That empty state says
`Seçtiğiniz ilanlar artık bulunamıyor` and never substitutes unrelated demo
properties. `/karsilastir` validates a unique, maximum-three `ids` CSV and
passes it to the component.

Use this route helper:

```ts
function parseComparisonSearch(raw: Record<string, unknown>) {
  if (typeof raw.ids !== 'string') return {}
  const ids = raw.ids
    .split(',')
    .map((id) => id.trim())
    .filter((id, index, values) => Boolean(id) && values.indexOf(id) === index)
    .slice(0, 3)
  return ids.length ? { ids: ids.join(',') } : {}
}
```

Run:

```bash
npm test -- apps/web/src/routes/ai-danisman.test.tsx apps/web/src/routes/karsilastir.test.tsx apps/web/src/features/comparison apps/web/src/features/advisor --run
npm run typecheck:web
```

Expected: PASS.

- [ ] **Step 5: Commit the route handoff**

```bash
git add apps/web/src/routes/ai-danisman.tsx apps/web/src/routes/ai-danisman.test.tsx apps/web/src/routes/karsilastir.tsx apps/web/src/routes/karsilastir.test.tsx apps/web/src/features/comparison
git commit -m "feat(advisor): hand selected listings to comparison"
```

---

### Task 9: Complete Storybook, rules, responsive, and accessibility coverage

**Files:**
- Rewrite: `apps/web/src/features/advisor/AdvisorWorkspace.stories.tsx`
- Rewrite: `apps/web/src/features/advisor/rules.md`
- Modify: `apps/web/src/features/advisor/AdvisorWorkspace.module.css`
- Modify: `apps/web/src/features/advisor/components/AdvisorListingCard.module.css`
- Modify: `apps/web/src/features/advisor/components/AdvisorPanels.module.css`
- Expand: `apps/web/src/features/advisor/AdvisorWorkspace.test.tsx`

**Interfaces:**
- Consumes: injectable adapters and initial route state from prior tasks.
- Produces: deterministic Storybook states, accessibility contract, and final responsive styling.

- [ ] **Step 1: Add failing accessibility regressions**

```tsx
it('keeps visible and DOM order aligned in the results state', async () => {
  const { container } = render(
    <AdvisorWorkspace searchAdapter={instantAdapter} initialQuery="Urla’da arsa" />,
  )
  await screen.findByText(/ilan eşleşti/)
  const ordered = [...container.querySelectorAll('[data-flow-section]')].map(
    (node) => node.getAttribute('data-flow-section'),
  )
  expect(ordered).toEqual(['query', 'profile', 'featured', 'alternatives', 'actions'])
})

it('supports IME composition without submitting early', () => {
  const onRouteStateChange = vi.fn()
  render(<AdvisorWorkspace onRouteStateChange={onRouteStateChange} />)
  const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
  fireEvent.compositionStart(input)
  expect(
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true }),
  ).toBe(false)
  expect(onRouteStateChange).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run the advisor suite and verify RED**

```bash
npm test -- apps/web/src/features/advisor --run
```

Expected: FAIL until flow markers and IME protection are implemented.

- [ ] **Step 3: Implement deterministic Storybook states**

Create these stories with injected adapters and fixed fixtures:

```ts
import { expect, userEvent, within } from 'storybook/test'

const instantAdapter = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
const emptyAdapter: AdvisorSearchAdapter = {
  async search(proposal) {
    return {
      proposal,
      matches: [],
      generatedAt: '2026-07-26T12:00:00.000Z',
    }
  },
}
const failingAdapter = createFixtureAdvisorSearchAdapter({
  delayMs: 0,
  fail: true,
})
const longContentAdapter: AdvisorSearchAdapter = {
  async search(proposal) {
    const result = await instantAdapter.search(proposal)
    return {
      ...result,
      matches: result.matches.map((match, index) =>
        index === 0
          ? {
              ...match,
              listing: {
                ...match.listing,
                title:
                  'Urla’da denize yakın, müstakil tapulu ve uzun açıklamalı konut imarlı köşe parsel',
              },
            }
          : match,
      ),
    }
  },
}

export const Initial: Story = {}
export const Analyzing: Story = {
  args: { searchAdapter: createFixtureAdvisorSearchAdapter({ delayMs: 60_000 }), initialQuery: 'Urla’da arsa' },
}
export const Results: Story = {
  args: { searchAdapter: instantAdapter, initialQuery: 'Urla’da 5 milyon TL altında imarlı arsa' },
}
export const PaperResults: Story = {
  args: { searchAdapter: instantAdapter, initialQuery: 'Urla’da arsa' },
  globals: { backgroundKey: 'light' },
}
export const GraphiteResults: Story = {
  args: { searchAdapter: instantAdapter, initialQuery: 'Urla’da arsa' },
  globals: { backgroundKey: 'dark' },
}
export const CompareSelected: Story = {
  args: { searchAdapter: instantAdapter, initialQuery: 'Urla’da arsa', initialCompareIds: ['listing-1-1', 'listing-1-2'] },
}
export const Empty: Story = {
  args: { searchAdapter: emptyAdapter, initialQuery: 'Urla’da 1 milyon TL altında arsa' },
}
export const ErrorState: Story = {
  args: { searchAdapter: failingAdapter, initialQuery: 'İzmir’de satılık emlak' },
}
export const LowConfidence: Story = {
  args: { searchAdapter: instantAdapter, initialQuery: 'Denize yakın bir yer' },
}
export const LongTurkishContent: Story = {
  args: { searchAdapter: longContentAdapter, initialQuery: 'İzmir’de satılık emlak için uzun içerik örneği' },
}
export const NarrowContainer: Story = {
  args: { searchAdapter: instantAdapter, initialQuery: 'Urla’da arsa' },
  parameters: { viewport: { defaultViewport: 'mobile390' } },
}
export const MediumContainer: Story = {
  args: { searchAdapter: instantAdapter, initialQuery: 'Urla’da arsa' },
  parameters: { viewport: { defaultViewport: 'tablet768' } },
}
export const Accessibility: Story = {
  name: 'Klavye ve ARIA sözleşmesi',
  args: { searchAdapter: instantAdapter, initialQuery: 'Urla’da arsa' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const openListing = (await canvas.findAllByRole('button', {
      name: 'İlanı incele',
    }))[0]
    openListing.focus()
    await userEvent.keyboard('{Enter}')
    const body = within(document.body)
    await body.findByRole('dialog', { name: /ilan detay/i })
    await userEvent.keyboard('{Escape}')
    await expect(openListing).toHaveFocus()

    const compare = (await canvas.findAllByRole('button', {
      name: 'Karşılaştırmaya ekle',
    }))[0]
    compare.focus()
    await userEvent.keyboard('{Enter}')
    await expect(compare).toHaveAttribute('aria-pressed', 'true')
  },
}
```

Kağıt and Grafit use the existing `backgroundKey` global and never add
component theme props.

- [ ] **Step 4: Finish CSS capability rules and the full `rules.md`**

`rules.md` must include purpose, semantics, anatomy, public API, state model,
behavior, copy rules, token mapping, Storybook coverage, test criteria,
do/don't guidance, limitations, and changelog.

Run all scoped checks:

```bash
npm test -- apps/web/src/features/advisor apps/web/src/features/comparison apps/web/src/routes/ai-danisman.test.tsx apps/web/src/routes/karsilastir.test.tsx --run
npm run typecheck:web
npx oxlint apps/web/src/features/advisor apps/web/src/features/comparison apps/web/src/routes/ai-danisman.tsx apps/web/src/routes/karsilastir.tsx
rg -n '#[0-9A-Fa-f]{3,8}|[0-9]+px|!important' apps/web/src/features/advisor
rg -n '@media\\s*\\((min|max)-width' apps/web/src/features/advisor
```

Expected:

- all tests pass;
- typecheck passes;
- scoped lint has no errors;
- both `rg` commands return no matches.

- [ ] **Step 5: Commit Storybook and contract coverage**

```bash
git add apps/web/src/features/advisor
git commit -m "test(advisor): complete states and accessibility coverage"
```

---

### Task 10: Run full verification and visual review

**Files:**
- Modify only files required by failures proven to belong to this feature.

**Interfaces:**
- Consumes: the complete implementation.
- Produces: passing quality gates and a documented visual verification result.

- [ ] **Step 1: Run the focused suite**

```bash
npm test -- apps/web/src/features/advisor apps/web/src/features/comparison apps/web/src/routes/ai-danisman.test.tsx apps/web/src/routes/karsilastir.test.tsx --run
```

Expected: all focused test files pass.

- [ ] **Step 2: Run repository type, lint, and build gates**

```bash
npm test
npx tsc -b
npm run typecheck:web
npm run lint
npm run build
```

Expected:

- TypeScript exits 0.
- Lint exits 0 or reports only pre-existing warnings outside touched files.
- Web and Storybook builds exit 0.

- [ ] **Step 3: Inspect the final diff without disturbing user changes**

```bash
git diff --check -- apps/web/src/features/advisor apps/web/src/features/listings/data/listing-photos.ts apps/web/src/routes/ai-danisman.tsx apps/web/src/routes/karsilastir.tsx apps/web/src/features/comparison
git status --short
git diff -- apps/web/src/features/advisor apps/web/src/features/listings/data/listing-photos.ts apps/web/src/routes/ai-danisman.tsx apps/web/src/routes/karsilastir.tsx apps/web/src/features/comparison
```

Expected:

- no whitespace errors;
- no unrelated file is included in the implementation summary;
- existing dirty files outside scope remain untouched.

- [ ] **Step 4: Perform browser visual verification when the connected browser is available**

Open `http://127.0.0.1:3000/ai-danisman` and verify:

1. 1440px Kağıt initial and results states.
2. 1440px Grafit initial and results states.
3. Tablet composition with profile above results.
4. 390px mobile composition with no horizontal overflow.
5. Keyboard flow from composer through listing actions and drawers.
6. Drawer focus trap and focus return.
7. Comparison selection and `/karsilastir?ids=...` handoff.
8. Remote image failure fallback.

If no connected browser is available, record this exact limitation in the
handoff and do not substitute a standalone Playwright screenshot as visual
proof.

- [ ] **Step 5: Commit verified final polish**

```bash
git add apps/web/src/features/advisor apps/web/src/features/listings/data/listing-photos.ts apps/web/src/routes/ai-danisman.tsx apps/web/src/routes/karsilastir.tsx apps/web/src/features/comparison
git commit -m "feat(advisor): ship premium AI decision studio"
```
