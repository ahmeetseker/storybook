# Enterprise İlan Verme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/ilan-ver` sayfasını hibrit AI/manuel başlangıç, beş doğrulanabilir adım, medya stüdyosu, fiyat/metin desteği ve EİDS yayın kapısı içeren enterprise bir ilan oluşturma deneyimine dönüştürmek.

**Architecture:** `ListingCreateWorkspace` yalnız akış orkestrasyonu ve taslak state’ini yönetir. Saf domain kuralları ayrı dosyada tutulur; her adım kendi bileşeninde kategoriye bağlı alanları işler; bağlamsal sağ panel ve alt eylem rayı ortak bileşenlerdir. Harici servisler deterministik frontend adapter durumlarıyla temsil edilir.

**Tech Stack:** React 19, TypeScript, CSS Modules, `@repo/ui` Liquid Glass bileşenleri, Vitest, Testing Library, Storybook.

## Global Constraints

- Tasarım sistemi `src/design/*.mdx` ve `src/index.css` içindeki `--lg-*` tokenları bağlayıcıdır.
- Component CSS’inde raw hex ve keyfî pixel/radius kullanılmaz; breakpoint değerleri mevcut proje istisnası olarak rem ile tanımlanabilir.
- Cam yalnız navigasyon/kontrol katmanında kullanılır; sayfada en fazla 6 cam yüzey ve cam üstüne cam yoktur.
- Cam yüzey sayısı form kontrollerini de kapsar; bu nedenle uzun form alanları token tabanlı düz HTML kontrolleridir. `GlassButton` yalnız ana navigasyon/eylem kontrolünde kullanılır.
- AI önerileri kullanıcı onayı olmadan forma uygulanmaz ve hiçbir zaman ilan yayınlamaz.
- EİDS doğrulaması tamamlanmadan yayın eylemi etkinleşmez; entegrasyon “demo bağlantısı” olarak açıkça etiketlenir.
- Hareket yalnız transform/opacity/filter kullanır; `prefers-reduced-motion` ve `prefers-reduced-transparency` desteklenir.
- Klavye focus halkası yalnız `:focus-visible`; ikon-tek butonlarda erişilebilir ad zorunludur.
- Dokunmatik kontroller en az 44px hedefe sahiptir.
- Mevcut çalışma ağacındaki ilgisiz kullanıcı değişiklikleri korunur.

---

### Task 1: Domain modeli ve doğrulama kuralları

**Files:**
- Create: `apps/web/src/features/listing-create/listing-create-domain.ts`
- Create: `apps/web/src/features/listing-create/listing-create-domain.test.ts`
- Create: `apps/web/src/features/listing-create/listing-create-adapters.ts`
- Create: `apps/web/src/features/listing-create/listing-create-adapters.test.ts`
- Modify: `apps/web/src/features/listing-create/listing-create-types.ts`

**Interfaces:**
- Produces: `ListingDraft`, exact five-value `ListingStepId`, `getStepValidation(draft, step)`, `getCompletion(draft)`, `canPublish(draft)`, `formatUnitPrice(price, area)`, `applyAiProposal(draft, proposal)`.
- Produces adapters: `createListingAdapters(scenario)` with `saveDraft`, `proposeFromText`, and `verifyEids`.
- Validation result: `{ valid: boolean; errors: Record<string, string> }`.

- [ ] **Step 1: Write failing domain tests**

Cover literal expectations for:

```ts
expect(getStepValidation(emptyDraft, 'property').valid).toBe(false)
expect(getStepValidation(landDraftWithoutParcel, 'location').errors.parcel).toBe('Ada/parsel bilgisi gerekli')
expect(getStepValidation({...draft, media: threeReadyPhotos}, 'media').valid).toBe(true)
expect(canPublish({...completeDraft, verification: { status: 'idle' }})).toBe(false)
expect(formatUnitPrice('4250000', '512')).toBe('8.301 TL/m²')
expect(LISTING_STEPS).toHaveLength(5)
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run apps/web/src/features/listing-create/listing-create-domain.test.ts`

Expected: FAIL because domain exports do not exist.

- [ ] **Step 3: Implement minimal typed domain model**

Define category-specific properties, media states, content fields, legal consent, risk review, verification states, `returnToReview` and meta save states. Compute completion from validation; do not store completed booleans. Add deterministic adapters whose result is selected by an explicit test scenario; do not use randomness.

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `npx vitest run apps/web/src/features/listing-create/listing-create-domain.test.ts apps/web/src/features/listing-create/listing-create-adapters.test.ts`

Expected: all domain tests pass.

### Task 2: Workspace shell, hybrid entry and progress navigation

**Files:**
- Create: `apps/web/src/features/listing-create/ListingCreateHeader.tsx`
- Create: `apps/web/src/features/listing-create/ListingProgress.tsx`
- Create: `apps/web/src/features/listing-create/ListingEntryChoice.tsx`
- Create: `apps/web/src/features/listing-create/ListingActionBar.tsx`
- Modify: `apps/web/src/features/listing-create/ListingCreateWorkspace.tsx`
- Modify: `apps/web/src/features/listing-create/ListingCreateWorkspace.test.tsx`

**Interfaces:**
- Consumes domain interfaces from Task 1.
- `ListingEntryChoice` emits `{ mode: 'ai' | 'manual'; proposal?: AiListingProposal }` only after explicit confirmation.
- `ListingProgress` receives step validations and sets `aria-current="step"` on active item.

- [ ] **Step 1: Write failing interaction tests**

Test that a new draft shows AI and manual choices; AI text produces an inspectable proposal but leaves title unchanged until “Forma uygula”; manual choice opens Property step; progress contains exactly five items, active item has `aria-current="step"`, incomplete future items are disabled, and no separate Preview sixth step exists.

- [ ] **Step 2: Run targeted tests and confirm RED**

Run: `npx vitest run apps/web/src/features/listing-create/ListingCreateWorkspace.test.tsx`

- [ ] **Step 3: Implement shell components and state transitions**

Remove the old three-column always-visible layout. Render header, literal five-step progress, focused workspace, contextual panel slot and action bar. Implement deterministic AI proposal parsing for the prototype.

- [ ] **Step 4: Run tests and confirm GREEN**

Run the same targeted test command and require zero failures.

### Task 3: Property and location steps

**Files:**
- Create: `apps/web/src/features/listing-create/PropertyStep.tsx`
- Create: `apps/web/src/features/listing-create/LocationStep.tsx`
- Create: `apps/web/src/features/listing-create/PropertyLocationSteps.test.tsx`
- Modify: `apps/web/src/features/listing-create/ListingCreateWorkspace.tsx`

**Interfaces:**
- `PropertyStep` receives `draft.property`, errors and `onChange`.
- `LocationStep` receives `draft.location`, selected property family, errors and `onChange`.

- [ ] **Step 1: Write failing category and validation tests**

Assert that land shows zoning, deed, area and ada/parsel controls; residential shows rooms, gross/net area and building age; invalid Continue reveals inline errors; returning to Property preserves values.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run apps/web/src/features/listing-create/PropertyLocationSteps.test.tsx`

- [ ] **Step 3: Implement progressive fields and accessible errors**

Use token-based flat controls and persistent labels. Select fields use the
custom accessible `GlassSelect` listbox with `material="flat"` so the themed
menu is preserved without spending the page’s glass budget. Conditional fields
depend only on property family. Cover every property family’s required-field
table; changing family clears or ignores stale family fields. Location
selections are dependent: changing city clears district and neighborhood,
changing district clears neighborhood. Location includes a flat
OSM/Leaflet-compatible approximate-map preview, explicit precision choice and
category-specific identity controls.

- [ ] **Step 4: Run tests and confirm GREEN**

Run the same targeted test command.

### Task 4: Media studio

**Files:**
- Create: `apps/web/src/features/listing-create/MediaStudioStep.tsx`
- Create: `apps/web/src/features/listing-create/MediaStudioStep.test.tsx`
- Modify: `apps/web/src/features/listing-create/ListingCreateWorkspace.tsx`

**Interfaces:**
- Receives `ListingMediaItem[]` and emits the full ordered list.
- Each media item carries `id`, `name`, `src`, `status`, `isCover`, `caption` and `qualityHints`.

- [ ] **Step 1: Write failing media behavior tests**

Use three real `File` objects. Assert files appear, first becomes cover, another can become cover, a photo can move right with keyboard-accessible action, remove updates count, and fewer than three ready photos keeps the step invalid.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run apps/web/src/features/listing-create/MediaStudioStep.test.tsx`

- [ ] **Step 3: Implement upload grid and deterministic quality hints**

Use a single visually hidden native file input owned by `MediaStudioStep`; do not duplicate `GlassFileUpload` internal state. Use object URLs when available, fixture fallback in jsdom, revoke URLs on remove/unmount, flat media tiles, caption inputs, cover/rank controls, and clear error/status copy.

- [ ] **Step 4: Run tests and confirm GREEN**

Run the same targeted test command.

### Task 5: Pricing, content editing and contextual preview

**Files:**
- Create: `apps/web/src/features/listing-create/ContentPricingStep.tsx`
- Create: `apps/web/src/features/listing-create/ListingContextPanel.tsx`
- Create: `apps/web/src/features/listing-create/ContentPricingStep.test.tsx`
- Modify: `apps/web/src/features/listing-create/ListingCreateWorkspace.tsx`

**Interfaces:**
- Pricing step consumes `ListingContent`, property and location summaries.
- AI revision is `{ field: 'title' | 'description'; before: string; after: string; reason: string }` and requires explicit Apply.

- [ ] **Step 1: Write failing pricing and AI consent tests**

Assert unit price literal, title counter with 50-character quality target and 70-character hard limit, contextual comparison data, AI revision preview preserving old text, Apply changing text, risk review/explicit acceptance, legal publication consent, and preview card reflecting accepted values.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run apps/web/src/features/listing-create/ContentPricingStep.test.tsx`

- [ ] **Step 3: Implement pricing workspace and contextual panel**

Show suggested range as transparent fixture data with sample size and freshness. Keep one prominent action. Use sentence-case labels and realistic Turkish listing content.

- [ ] **Step 4: Run tests and confirm GREEN**

Run the same targeted test command.

### Task 6: EİDS verification, check-answers review and publish gate

**Files:**
- Create: `apps/web/src/features/listing-create/VerificationReviewStep.tsx`
- Create: `apps/web/src/features/listing-create/VerificationReviewStep.test.tsx`
- Modify: `apps/web/src/features/listing-create/ListingCreateWorkspace.tsx`

**Interfaces:**
- Verification adapter transitions `idle → checking → verified | unauthorized | unavailable`.
- Review emits `onEdit(stepId)` and `onPublish()`; publish remains disabled unless `canPublish(draft)`.

- [ ] **Step 1: Write failing verification and review tests**

Assert demo disclosure is visible, owner/relative/agency receive role-specific guidance, idle cannot publish, unauthorized and unavailable states preserve draft and offer the correct recovery, verification success unlocks only when all other steps validate, and each review section’s Edit action navigates to its step. After editing and continuing, `returnToReview` sends the user back to the updated final review.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run apps/web/src/features/listing-create/VerificationReviewStep.test.tsx`

- [ ] **Step 3: Implement deterministic EİDS demo and review summary**

Display role-specific instructions, explicit state feedback, section status and accessible action labels such as “Konum bilgilerini düzenle”. Publication produces an inline success state, not an alert or navigation placeholder.

- [ ] **Step 4: Run tests and confirm GREEN**

Run the same targeted test command.

### Task 7: Visual system, responsive stories and documentation

**Files:**
- Rewrite: `apps/web/src/features/listing-create/ListingCreateWorkspace.module.css`
- Modify: `apps/web/src/features/listing-create/ListingCreateWorkspace.stories.tsx`
- Modify: `apps/web/src/features/listing-create/rules.md`
- Modify: `apps/web/src/features/listing-create/index.ts`

**Interfaces:**
- Stories expose `Varsayilan`, `KoyuTema`, `Mobil`, and `ReducedMotion` states.

- [ ] **Step 1: Add story matrices and render-level assertions where behavior is observable**

Ensure stories render the real workspace and use viewport/theme parameters rather than duplicating components. The workspace feature owns the page-level story matrix; reusable root-library component conventions are not duplicated for app-private step components.

- [ ] **Step 2: Implement the premium two-column visual system**

Use token-only flat content surfaces, one amber accent, typographic hierarchy, max-width container, sticky contextual panel on wide screens, compact mobile progress and safe-area action bar. Add hover only under `hover: hover`, coarse-pointer targets, reduced motion/transparency fallbacks.

- [ ] **Step 3: Run token and source audits**

Run:

```bash
rg -n '#[0-9A-Fa-f]{3,8}|[0-9]+px' apps/web/src/features/listing-create --glob '*.css'
rg -n 'Glass(Input|Select|Checkbox|FileUpload)|material="glass"' apps/web/src/features/listing-create
```

Expected: no raw hex; pixel hits only documented breakpoint comments or none; no glass-backed form primitives; glass surface count ≤ 6 in any rendered state.

### Task 8: Full verification and live visual audit

**Files:**
- Modify only files required by verified defects.

- [ ] **Step 1: Run all feature tests**

Run: `npx vitest run apps/web/src/features/listing-create`

Expected: zero failed tests.

- [ ] **Step 2: Run typecheck and production build**

Run:

```bash
npx tsc -b apps/web/tsconfig.json --pretty false
npm run build:web
```

Expected: both exit 0; the known unrelated `ofisler.test.tsx` route warning may remain documented.

- [ ] **Step 3: Audit `/ilan-ver` in a live browser**

Inspect at desktop and mobile widths. Verify no horizontal overflow; header, progress, primary action and current field are visible; open/select/upload/AI/verification/review interactions work; light and dark theme contrast is legible.

- [ ] **Step 4: Fix visual defects and repeat the covering checks**

For every change, run the smallest covering test first, then repeat feature tests, typecheck and build.

## Plan self-review

- Every acceptance criterion in the design spec maps to Tasks 1–8.
- State and signatures are consistent across tasks; step completion is derived only by domain validation.
- No task relies on a real EİDS, AI, map or upload backend.
- Tests exercise user-visible behavior or pure domain outputs; they do not assert mock existence.
- No placeholder implementation step remains.
