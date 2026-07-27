# arsam.net Homepage Concepts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build five full, SSR-rendered arsam.net homepage concepts from the existing Storybook Glass component library and expose them through a browser-ready concept index.

**Architecture:** Keep `MarketplaceShell` as the single owner of Header and Dock. Add static noindex TanStack routes that import isolated feature pages from `apps/web/src/features/home-concepts`. All visual primitives come from `@repo/ui`; pages own only semantic section composition and CSS Module layout.

**Tech Stack:** React 19, TanStack Start and Router, Vite 8, TypeScript 6, CSS Modules, Motion through existing components, Vitest, Playwright.

## Global Constraints

- Use only `@repo/ui` for Storybook components; do not copy component implementation.
- Render one `<main id="main-content">` and one visible `<h1>` per concept.
- Keep `GlassIslandHeader` and `GlassDock` exclusively in `MarketplaceShell`.
- Content components are flat; every `GlassListingCard` uses `material="flat"`.
- Use existing `--lg-*` tokens in page CSS and preserve Kağıt/Grafit themes.
- Concept routes are `noindex, nofollow` and have no canonical.
- Use real `href` links where the current component API supports them.
- Do not edit `apps/web/src/routeTree.gen.ts` manually.
- Preserve existing user changes and current shell behavior.
- Do not add third-party dependencies.
- Avoid visible em-dash and en-dash characters in new page copy.

---

### Task 1: Concept registry and shared fixtures

**Files:**
- Create: `apps/web/src/features/home-concepts/concepts.ts`
- Create: `apps/web/src/features/home-concepts/concepts.test.ts`
- Create: `apps/web/src/features/home-concepts/fixtures.ts`
- Create: `apps/web/src/features/home-concepts/shared/HomeConceptFrame.tsx`
- Create: `apps/web/src/features/home-concepts/shared/HomeConceptFrame.module.css`
- Create: `apps/web/src/features/home-concepts/shared/HomeFooter.tsx`

**Interfaces:**
- Produces: `HomeConceptId`, `HomeConceptDefinition`, `homeConcepts`
- Produces: `homeListings`, `homeVitrinItems`, `trustSignals`, `agencyFixtures`
- Produces: `HomeConceptFrame` and `HomeFooter`

- [ ] **Step 1: Write the failing registry test**

```ts
import { describe, expect, it } from 'vitest'
import { homeConcepts } from './concepts'

describe('ana sayfa konsept kaydı', () => {
  it('benzersiz id ve href ile tam beş konsept taşır', () => {
    expect(homeConcepts).toHaveLength(5)
    expect(new Set(homeConcepts.map((item) => item.id)).size).toBe(5)
    expect(new Set(homeConcepts.map((item) => item.href)).size).toBe(5)
    expect(
      homeConcepts.every((item) => item.href.startsWith('/konseptler/')),
    ).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx vitest run apps/web/src/features/home-concepts/concepts.test.ts`

Expected: FAIL because `./concepts` does not exist.

- [ ] **Step 3: Implement the registry and shared interfaces**

```ts
export type HomeConceptId =
  | 'ai-kesif'
  | 'pazar-vitrini'
  | 'harita-kesfi'
  | 'guven-merkezi'
  | 'ai-danisman'

export interface HomeConceptDefinition {
  id: HomeConceptId
  title: string
  href: `/konseptler/${HomeConceptId}`
  summary: string
  emphasis: string
}

export const homeConcepts: readonly HomeConceptDefinition[] = [
  {
    id: 'ai-kesif',
    title: 'AI Keşif',
    href: '/konseptler/ai-kesif',
    summary: 'Doğal dil araması, eşleşme ve güveni dengeler.',
    emphasis: 'Önerilen ana yön',
  },
  {
    id: 'pazar-vitrini',
    title: 'Pazar Vitrini',
    href: '/konseptler/pazar-vitrini',
    summary: 'Yüksek ilan yoğunluğu ve hızlı tarama sunar.',
    emphasis: 'Sahibinden yoğunluğu',
  },
  {
    id: 'harita-kesfi',
    title: 'Harita Keşfi',
    href: '/konseptler/harita-kesfi',
    summary: 'Bölge ve konum üzerinden arsa keşfini öne alır.',
    emphasis: 'Konum odaklı',
  },
  {
    id: 'guven-merkezi',
    title: 'Güven Merkezi',
    href: '/konseptler/guven-merkezi',
    summary: 'EİDS, tapu, imar ve kaynak şeffaflığını anlatır.',
    emphasis: 'Güven odaklı',
  },
  {
    id: 'ai-danisman',
    title: 'AI Danışman',
    href: '/konseptler/ai-danisman',
    summary: 'İhtiyaçtan öneriye ve karşılaştırmaya ilerler.',
    emphasis: 'AI-first akış',
  },
] as const
```

Create deterministic fixtures by adapting the existing arsa data shape into
the exact `GlassListingCard`, `GlassVitrin`, trust and agency prop shapes.
`HomeConceptFrame` renders semantic `main`, optional concept navigation and
children. `HomeFooter` renders `GlassFooter` with native links.

- [ ] **Step 4: Verify GREEN**

Run: `npx vitest run apps/web/src/features/home-concepts/concepts.test.ts`

Expected: 1 file and 1 test pass.

---

### Task 2: Concept index and static routes

**Files:**
- Create: `apps/web/src/features/home-concepts/ConceptIndexPage.tsx`
- Create: `apps/web/src/features/home-concepts/ConceptIndexPage.module.css`
- Create: `apps/web/src/routes/konseptler.tsx`
- Create: `apps/web/src/routes/konseptler.index.tsx`

**Interfaces:**
- Consumes: `homeConcepts`
- Produces: the concept index SSR route and parent outlet

- [ ] **Step 1: Extend the failing registry test with index requirements**

```ts
it('tarayıcı seçim ekranı için kısa ve dolu metin taşır', () => {
  expect(
    homeConcepts.every(
      (item) => item.title && item.summary && item.emphasis,
    ),
  ).toBe(true)
})
```

- [ ] **Step 2: Run the test and verify RED if metadata is incomplete**

Run: `npx vitest run apps/web/src/features/home-concepts/concepts.test.ts`

Expected: FAIL only if required metadata is missing.

- [ ] **Step 3: Implement the index and route adapters**

`ConceptIndexPage` maps `homeConcepts` to real TanStack `Link` elements and
shows title, summary, emphasis and route. Each route adapter exports a
`createFileRoute` definition with:

```ts
head: () => ({
  meta: [
    { title: 'Konsept adı | arsam.net' },
    { name: 'description', content: 'Konsept açıklaması' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
```

The parent `/konseptler` route renders `<Outlet />`. Concept child adapters
are added beside their page implementation in Tasks 3-5 so typecheck remains
green after every task.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`

Expected: exit 0 and generated route types include all concept URLs.

---

### Task 3: AI Discovery and Marketplace Showcase

**Files:**
- Create: `apps/web/src/features/home-concepts/ai-discovery/AiDiscoveryHome.tsx`
- Create: `apps/web/src/features/home-concepts/ai-discovery/AiDiscoveryHome.module.css`
- Create: `apps/web/src/features/home-concepts/marketplace/MarketplaceShowcaseHome.tsx`
- Create: `apps/web/src/features/home-concepts/marketplace/MarketplaceShowcaseHome.module.css`
- Create: `apps/web/src/routes/konseptler.ai-kesif.tsx`
- Create: `apps/web/src/routes/konseptler.pazar-vitrini.tsx`
- Create: `apps/web/e2e/home-concepts.spec.ts`

**Interfaces:**
- Consumes: shared frame, footer and fixtures
- Produces: AI Discovery and Marketplace Showcase route bodies

- [ ] **Step 1: Add failing E2E expectations**

In `apps/web/e2e/home-concepts.spec.ts`:

```ts
test('AI Keşif ve Pazar Vitrini SSR ana içeriklerini gösterir', async ({
  page,
}) => {
  for (const [href, heading] of [
    ['/konseptler/ai-kesif', 'Arsanı tarif et, gerisini birlikte daraltalım'],
    ['/konseptler/pazar-vitrini', 'Türkiye genelinde arsa ilanları'],
  ] as const) {
    await page.goto(href)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect(page.locator('main#main-content')).toHaveCount(1)
  }
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx playwright test apps/web/e2e/home-concepts.spec.ts --grep "AI Keşif"`

Expected: FAIL because route page components do not exist yet.

- [ ] **Step 3: Implement both compositions**

AI Discovery must use `GlassHero`, `GlassAiSearchBar`, `GlassBento`,
`GlassMatchScore`, `GlassVitrin`, `GlassAgencyCard` and `GlassFooter`.

Marketplace Showcase must use `GlassHero`, `GlassAiSearchBar`,
`GlassVitrin` banded and ruled variants, `GlassMetricStrip`,
`GlassSavedSearchCard` and `GlassFooter`.

All ListingCard instances use `material="flat"`. Search submissions navigate
to `/arsa-ara`; compare actions navigate to `/karsilastir`.

- [ ] **Step 4: Verify GREEN**

Run: `npx playwright test apps/web/e2e/home-concepts.spec.ts --grep "AI Keşif"`

Expected: selected test passes.

---

### Task 4: Map Discovery and Trust Center

**Files:**
- Create: `apps/web/src/features/home-concepts/map-first/MapFirstHome.tsx`
- Create: `apps/web/src/features/home-concepts/map-first/MapFirstHome.module.css`
- Create: `apps/web/src/features/home-concepts/trust-first/TrustFirstHome.tsx`
- Create: `apps/web/src/features/home-concepts/trust-first/TrustFirstHome.module.css`
- Create: `apps/web/src/routes/konseptler.harita-kesfi.tsx`
- Create: `apps/web/src/routes/konseptler.guven-merkezi.tsx`

**Interfaces:**
- Consumes: shared frame, footer and fixtures
- Produces: Map Discovery and Trust Center route bodies

- [ ] **Step 1: Add failing E2E expectations**

```ts
test('Harita Keşfi ve Güven Merkezi kendi ürün yönlerini gösterir', async ({
  page,
}) => {
  await page.goto('/konseptler/harita-kesfi')
  await expect(page.getByRole('region', { name: 'Bölgesel arsa haritası' })).toBeVisible()

  await page.goto('/konseptler/guven-merkezi')
  await expect(page.getByRole('heading', { name: 'Güven Kontrolleri' })).toBeVisible()
})
```

- [ ] **Step 2: Run and verify RED**

Run: `npx playwright test apps/web/e2e/home-concepts.spec.ts --grep "Harita Keşfi"`

Expected: FAIL because page compositions are absent.

- [ ] **Step 3: Implement both compositions**

Map Discovery uses `GlassHero variant="split"`, `GlassAiSearchBar`,
`GlassMap`, `GlassCarousel`, flat `GlassListingCard`, region links,
`GlassAgencyCard` and newsletter `GlassFooter`.

Trust Center uses `GlassHero`, `GlassMetricStrip`,
`GlassTrustSignalPanel`, `GlassAiEvidenceList`, verified listing carousel,
`GlassAgencyCard` and CTA `GlassFooter`.

- [ ] **Step 4: Verify GREEN**

Run: `npx playwright test apps/web/e2e/home-concepts.spec.ts --grep "Harita Keşfi"`

Expected: selected test passes.

---

### Task 5: AI Advisor

**Files:**
- Create: `apps/web/src/features/home-concepts/ai-advisor/AiAdvisorHome.tsx`
- Create: `apps/web/src/features/home-concepts/ai-advisor/AiAdvisorHome.module.css`
- Create: `apps/web/src/routes/konseptler.ai-danisman.tsx`

**Interfaces:**
- Consumes: shared frame, footer and fixtures
- Produces: AI Advisor route body

- [ ] **Step 1: Add the failing E2E expectation**

```ts
test('AI Danışman öneriden karşılaştırmaya ilerleyen akışı gösterir', async ({
  page,
}) => {
  await page.goto('/konseptler/ai-danisman')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Nasıl bir arsa aradığını birlikte netleştirelim',
    }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Önerileri karşılaştır' })).toHaveAttribute(
    'href',
    '/karsilastir',
  )
})
```

- [ ] **Step 2: Run and verify RED**

Run: `npx playwright test apps/web/e2e/home-concepts.spec.ts --grep "AI Danışman"`

Expected: FAIL because the page composition is absent.

- [ ] **Step 3: Implement the composition**

Use `GlassHero variant="split"`, `GlassAiSearchBar`,
`GlassAiAgentActivity`, flat listing cards, `GlassMatchScore`,
`GlassAiSummaryCard`, `GlassAiEvidenceList`, `GlassVitrin` and
`GlassFooter`. Keep high-impact AI actions behind existing human approval
controls.

- [ ] **Step 4: Verify GREEN**

Run: `npx playwright test apps/web/e2e/home-concepts.spec.ts --grep "AI Danışman"`

Expected: selected test passes.

---

### Task 6: Responsive, accessibility and browser handoff

**Files:**
- Modify: `apps/web/e2e/home-concepts.spec.ts`
- Create/update: Playwright snapshots under `apps/web/e2e/*.spec.ts-snapshots/`
- Modify only if required by verified defects: concept feature CSS Modules

**Interfaces:**
- Verifies all six concept routes and the unchanged shell

- [ ] **Step 1: Complete the E2E matrix**

Add tests that:

- visit all six routes and assert their SSR heading
- assert exactly one `main#main-content`
- assert Header and Dock are present
- check no horizontal overflow at 1440px and 390px
- run Axe and require zero critical or serious violations
- disable JavaScript for index and AI Discovery
- capture one desktop screenshot per concept and mobile screenshots for the
  recommended AI Discovery concept

- [ ] **Step 2: Run the complete concept E2E suite**

Run: `npx playwright test apps/web/e2e/home-concepts.spec.ts`

Expected: all concept tests pass.

- [ ] **Step 3: Run project verification**

```bash
npm run typecheck
npm run lint
npm test -- --reporter=dot
npm run test:e2e
npm run build
```

Expected: every command exits 0. Existing lint warnings may remain, but no new
lint errors are introduced.

- [ ] **Step 4: Open the browser**

Navigate the in-app browser to `http://localhost:3000/konseptler`, confirm all
five links are visible, open each concept, and leave the browser on the
concept index for user comparison.
