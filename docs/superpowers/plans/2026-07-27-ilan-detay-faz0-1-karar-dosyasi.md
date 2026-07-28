# AI-First İlan Detayı — Faz 0+1 Uygulama Planı (Yön A: Karar Dosyası)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/ilan/$listingId` rotasında, arsa dikeyi için kaynaklı ve kanıt-öncelikli bir ilan detay sayfası yayına almak; her değerin kaynağını, sorgu tarihini ve kapsamını taşıyan bir domain sözleşmesiyle birlikte.

**Architecture:** Kanıt defteri (`EvidenceValue<T>`) domain çekirdeği önce kurulur; deterministik fixture/adapter bu çekirdeği doldurur; `apps/web/src/features/listing-detail` feature'ı Yön A yerleşimini (8/4 kolon, sol kanıt akışı + sağ karar rayı) kurar. Üç yeni shared component (`GlassDataProvenance`, `GlassListingDetailHeader`, `GlassDetailActionBar`) dışında her şey mevcut 98 component'ten compose edilir. Sayfa layout'u, bölüm sırası ve rail sticky sınırı feature seviyesinde kalır — shared component'e çıkarılmaz.

**Tech Stack:** React 19, TanStack Start + Router (file routes), TanStack Query, CSS Modules, `@repo/ui` (bu repo'nun `src/`), vitest + @testing-library/react, Storybook 10.

## Kapsam

Bu plan spec'in **Faz 0 (doğruluk ve domain temeli)** ve **Faz 1 (arsa ilan detay çekirdeği)** bölümlerini kapsar. Kapsam dışı — ayrı planlara bırakıldı:

- Faz 2: interaktif harita katmanları, piyasa/emsal analizi, tehlike katman servisleri
- Faz 3: konuşmalı asistan (`GlassAiAnswer`/`GlassAiChatMessage`), izinli ajan onay akışı, audit
- Faz 4: konut/ticari/bina/devremülk/turistik kategori paketleri

Faz 1 sonunda sayfa **AI özetini statik ve kaynaklı** gösterir (sohbet yok), harita yerine `GlassMap` inline görünüm + metin/tablo eşdeğeri kullanır.

**Kaynak spec:** `docs/superpowers/specs/2026-07-27-ai-first-enterprise-ilan-detay-design.md`
**Seçilen tasarım yönü:** Yön A — Karar Dosyası (8/4 kolon, sağ sticky karar rayı, hairline ile ayrılmış bölümler, kart-içinde-kart yok)

## Global Constraints

Her task'ın gereksinimleri bu bölümü kapsar.

- **Tasarım sistemi bağlayıcıdır:** `src/design/*.mdx`. Component ve feature CSS'inde raw hex/rgba/px/gölge/keyfî radius **yasak**; yalnız `--lg-*` token'ları (fallback yazımı `var(--lg-x, 15px)` serbest).
- **Cam bütçesi:** Sayfada aynı anda en fazla **6** `data-material="glass"` yüzey. Yön A dağılımı: (1) global marketplace nav, (2) medya kontrol grubu, (3) sticky bölüm indeksi, (4) karar/iletişim rayı, (5) AI launcher — 1 yedek. İçerik yüzeyleri `material="flat"`.
- **Cam üstüne cam yok:** Cam bir grup içinde çocuk kontroller yeni `GlassSurface` üretmez.
- **EİDS semantiği:** İzin verilen tek olumlu metin — `İlan verme yetkisi EİDS ile doğrulandı.` Zorunlu kapsam notu — `Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.` Yasak: "Tapu EİDS ile doğrulandı", "İmar EİDS ile doğrulandı", "Tam doğrulanmış ilan", "Fiyatı doğrulandı", "Sorunsuz taşınmaz", "tapu kaydıyla eşleşti".
- **"Doğrulandı" tek başına kullanılmaz.** Her rozet hangi alanın hangi kaynaktan doğrulandığını söyler.
- **Tehlike ≠ risk:** AFAD/MTA/MGM verisi "bölgesel ... tehlike göstergesi" olarak sunulur; güvenli/güvensiz hükmü üretilmez.
- **Değerleme:** Tek fiyat değil aralık; "ArsaPazar tahmini" etiketi; veri yetersizse **çekinme** (`insufficient`) — uydurma aralık yok; "ekspertiz"/"resmî değerleme" denmez.
- **Determinizm:** Fixture ve adapter'da `Math.random()` ve argümansız `new Date()`/`Date.now()` **yasak**; zaman `now: string` parametresiyle enjekte edilir.
- **Semantik:** Sayfada tek görünür `h1`; bölümler `h2`; etiket/değer çiftleri `dl`; gerçek kıyaslar `table`; ikon-tek butonlarda `label` zorunlu.
- **Erişilebilirlik:** WCAG 2.2 AA; focus yalnız `:focus-visible` ile `2px solid var(--lg-accent)`; coarse pointer'da hedef ≥ 44px; `prefers-reduced-motion` ve `prefers-reduced-transparency` desteklenir; motion yalnız transform/opacity/filter.
- **Responsive:** `mobile`/`tablet`/`desktop` prop'u yok; container query, doğal akış, `pointer: coarse`, `hover: hover`.
- **Dil:** Kullanıcıya görünen tüm metin Türkçe; kod tanımlayıcıları İngilizce; JSDoc Türkçe.
- **Yeni shared component seti eksiksizdir:** `GlassX.tsx`, `GlassX.module.css`, `GlassX.stories.tsx`, `GlassX.test.tsx`, `rules.md`, `index.ts` + `src/index.ts` export + `src/demo/ComponentCatalog.tsx` kaydı.
- **Doğrulama komutları:** `npm test` (vitest run), `npx tsc -b`, `npm run typecheck:web`, `npm run lint`.

## File Structure

**Yeni shared component'ler (`src/components/`)**

| Dosya | Sorumluluk |
|---|---|
| `GlassDataProvenance/` | Tek bir değerin kaynak sınıfı, tarihleri, kapsamı, yöntemi, sınırlaması ve çelişkisi — açılır çekmece |
| `GlassListingDetailHeader/` | Ayarlanabilir `h1`, yapılandırılmış meta, para semantiği, rozet/utility slotları; varsayılan `flat` |
| `GlassDetailActionBar/` | Tek prominent CTA + secondary + utility; `rail`/`bar` biçimi, safe-area, child nesting üretmeyen tek cam grup |

**Feature (`apps/web/src/features/listing-detail/`)**

| Dosya | Sorumluluk |
|---|---|
| `domain/evidence.ts` | `EvidenceValue<T>` ve türev tipler, kaynak/durum/güncellik etiketleri |
| `domain/listing-detail-types.ts` | `ListingDetailBase`, `LandListingDetail`, `ListingDetail` union, doğrulama vektörü |
| `domain/listing-detail-view-model.ts` | Kritik eksik/çelişki çıkarımı, bölüm görünürlüğü, metrik şeridi projeksiyonu |
| `data/listing-detail-fixtures.ts` | Ören 214/7 senaryosu + durum senaryoları (deterministik) |
| `data/listing-detail-adapter.ts` | `loadListingDetail()` — senaryo → normalize detay, provider hata izolasyonu |
| `data/listing-detail-query.ts` | TanStack Query options |
| `ListingDetailWorkspace.tsx` + `.module.css` | Yön A yerleşimi: intro grid, section index, kanıt akışı, karar rayı |
| `components/ListingIntro.tsx` | Medya sahnesi + karar özeti kolonu (fiyat, doğrulama vektörü, kritik eksik) |
| `components/ListingSectionIndex.tsx` | Sticky cam bölüm indeksi |
| `components/ListingDecisionRail.tsx` | Sağ sticky eylem rayı + satıcı özeti |
| `components/EvidenceRow.tsx` | Tek kanıt satırı: `dt`/`dd` + kaynak rozeti + `GlassDataProvenance` çekmecesi |
| `components/ListingEvidenceBrief.tsx` | AI karar özeti (kaynaklı, çekinmeli) |
| `components/ParcelSection.tsx` | Parsel ve konum |
| `components/PlanningAndLegalSection.tsx` | İmar ve hukuk |
| `components/InfrastructureSection.tsx` | Altyapı ve erişim (yasal ≠ fiziksel) |
| `components/HazardSection.tsx` | Arazi ve tehlike göstergeleri |
| `components/SellerSection.tsx` | Satıcı/ofis + telefon reveal sözleşmesi |
| `index.ts`, `rules.md` | Re-export + feature sözleşmesi |

**Route:** `apps/web/src/routes/ilan.$listingId.tsx`
**Değişecek:** `apps/web/vite.config.ts` (prerender filtresi), `apps/web/src/config/routes.ts` (rota künyesi), `src/pages/ArsaIlanDetay.tsx` + `src/pages/AnaSayfa.tsx` + `GlassTrustSignalPanel` örnekleri (EİDS metni), `src/index.ts`, `src/demo/ComponentCatalog.tsx`

---

## Task 1: Kanıt (evidence) domain çekirdeği

**Files:**
- Create: `apps/web/src/features/listing-detail/domain/evidence.ts`
- Test: `apps/web/src/features/listing-detail/domain/evidence.test.ts`

**Interfaces:**
- Consumes: —
- Produces: `EvidenceStatus`, `FreshnessStatus`, `EvidenceSourceClass`, `UnavailableReason`, `EvidenceSource`, `EvidenceValue<T>`, `EvidenceConflict`, `sourceClassLabel(sourceClass: EvidenceSourceClass): string`, `evidenceStatusLabel(value: EvidenceValue<unknown>): string`, `freshnessFrom(retrievedAt: string, now: string, effectiveAt?: string): FreshnessStatus`, `hasConflict(value: EvidenceValue<unknown>): boolean`, `isAnswered(value: EvidenceValue<unknown>): boolean`

- [ ] **Step 1: Write the failing test**

`apps/web/src/features/listing-detail/domain/evidence.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  evidenceStatusLabel,
  freshnessFrom,
  hasConflict,
  isAnswered,
  sourceClassLabel,
  type EvidenceValue,
} from './evidence'

const NOW = '2026-07-27T09:00:00.000Z'

function official(): EvidenceValue<string> {
  return {
    value: '214 ada / 7 parsel',
    status: 'verified',
    freshness: 'current',
    source: {
      id: 'megsis',
      name: 'TKGM MEGSİS',
      sourceClass: 'official',
      authority: 'Tapu ve Kadastro Genel Müdürlüğü',
    },
    retrievedAt: '2026-07-24T09:12:00.000Z',
    scope: 'parcel',
  }
}

describe('sourceClassLabel', () => {
  it('her kaynak sınıfı için görünür Türkçe etiket üretir', () => {
    expect(sourceClassLabel('official')).toBe('Resmî kayıttan')
    expect(sourceClassLabel('verified_document')).toBe('Doğrulanmış belgeden')
    expect(sourceClassLabel('advertiser_declared')).toBe('İlan sahibi beyanı')
    expect(sourceClassLabel('platform_derived')).toBe('ArsaPazar hesabı')
    expect(sourceClassLabel('model_estimate')).toBe('Model tahmini')
    expect(sourceClassLabel('unknown')).toBe('Doğrulanamadı')
  })

  it('tek başına "Doğrulandı" etiketi üretmez', () => {
    const labels = (
      ['official', 'verified_document', 'advertiser_declared', 'platform_derived', 'model_estimate', 'unknown'] as const
    ).map(sourceClassLabel)
    expect(labels).not.toContain('Doğrulandı')
  })
})

describe('evidenceStatusLabel', () => {
  it('çelişkili değerde kaynak sınıfı yerine çelişki etiketi döner', () => {
    const value: EvidenceValue<number> = {
      ...official(),
      value: 4712,
      status: 'conflicting',
      conflicts: [{ sourceId: 'advertiser', value: 4850, effectiveAt: '2026-04-12T00:00:00.000Z' }],
    }
    expect(evidenceStatusLabel(value)).toBe('Kaynaklar çelişiyor')
  })

  it('bayat değerde güncellik etiketi kaynak sınıfının önüne geçer', () => {
    const value = { ...official(), freshness: 'stale' as const }
    expect(evidenceStatusLabel(value)).toBe('Güncel değil')
  })

  it('değer yoksa doğrulanamadı etiketi döner', () => {
    const value: EvidenceValue<string> = {
      status: 'unavailable',
      unavailableReason: 'not_published',
      freshness: 'unknown',
      source: { id: 'takbis', name: 'TAKBİS', sourceClass: 'unknown' },
      retrievedAt: NOW,
      scope: 'property',
    }
    expect(evidenceStatusLabel(value)).toBe('Doğrulanamadı')
  })

  it('normal durumda kaynak sınıfı etiketini kullanır', () => {
    expect(evidenceStatusLabel(official())).toBe('Resmî kayıttan')
  })
})

describe('freshnessFrom', () => {
  it('90 günden yeni sorguyu güncel sayar', () => {
    expect(freshnessFrom('2026-07-24T09:12:00.000Z', NOW)).toBe('current')
  })

  it('90-180 gün arasını yaşlanıyor sayar', () => {
    expect(freshnessFrom('2026-03-01T00:00:00.000Z', NOW)).toBe('aging')
  })

  it('180 günden eski kaynağı bayat sayar', () => {
    expect(freshnessFrom('2025-11-19T00:00:00.000Z', NOW)).toBe('stale')
  })

  it('geçerlilik tarihi verilmişse onu sorgu tarihine tercih eder', () => {
    expect(freshnessFrom(NOW, NOW, '2025-11-19T00:00:00.000Z')).toBe('stale')
  })

  it('geçersiz tarihte bilinmiyor döner', () => {
    expect(freshnessFrom('bilinmiyor', NOW)).toBe('unknown')
  })
})

describe('hasConflict / isAnswered', () => {
  it('çelişki listesi doluysa hasConflict true olur', () => {
    expect(hasConflict({ ...official(), conflicts: [{ sourceId: 'x', value: 1 }] })).toBe(true)
    expect(hasConflict(official())).toBe(false)
  })

  it('değeri olmayan veya unavailable olan kanıt cevaplanmamış sayılır', () => {
    expect(isAnswered(official())).toBe(true)
    expect(isAnswered({ ...official(), value: undefined, status: 'unavailable' })).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/web/src/features/listing-detail/domain/evidence.test.ts`
Expected: FAIL — `Failed to resolve import "./evidence"`

- [ ] **Step 3: Write the implementation**

`apps/web/src/features/listing-detail/domain/evidence.ts`:

```ts
/**
 * Kanıt defteri çekirdeği.
 *
 * Sayfadaki her önemli değer; kim söyledi, ne zaman geçerliydi, hangi kapsam
 * için geçerli ve sınırlaması ne sorularına cevap verir. Bu tipler yalnız
 * veriyi taşır — hangi rozetin çizileceği görünüm katmanının kararıdır.
 */

/** Değerin kanıt durumu. `verified` yalnız gösterilen ALANIN doğrulandığı hâldir. */
export type EvidenceStatus =
  | 'verified'
  | 'declared'
  | 'derived'
  | 'estimated'
  | 'unavailable'
  | 'conflicting'

/** Güncellik, kökenden bağımsızdır: resmî veri de bayatlayabilir. */
export type FreshnessStatus = 'current' | 'aging' | 'stale' | 'unknown'

/** Değerin nereden geldiği — "doğrulandı" tek rozetine indirgenmez. */
export type EvidenceSourceClass =
  | 'official'
  | 'verified_document'
  | 'advertiser_declared'
  | 'platform_derived'
  | 'model_estimate'
  | 'unknown'

/** `unavailable` tek bir "veri yok" değildir; nedeni ayrıca taşınır. */
export type UnavailableReason =
  | 'not_published'
  | 'provider_unavailable'
  | 'not_applicable'
  | 'permission_denied'
  | 'out_of_scope'

export interface EvidenceSource {
  id: string
  /** Kullanıcıya gösterilen sağlayıcı adı */
  name: string
  sourceClass: EvidenceSourceClass
  /** Kaynağın arkasındaki kurum (varsa) */
  authority?: string
  /** Resmî sorgu/kayıt bağlantısı (varsa) */
  url?: string
}

export interface EvidenceConflict {
  sourceId: string
  value: unknown
  effectiveAt?: string
}

/** Değerin hangi coğrafi/hukuki birim için geçerli olduğu */
export type EvidenceScope = 'property' | 'parcel' | 'building' | 'neighborhood' | 'district'

export interface EvidenceValue<T> {
  /** Değer yoksa alan hiç doldurulmaz — boş string veya 0 ile taklit edilmez */
  value?: T
  status: EvidenceStatus
  freshness: FreshnessStatus
  source: EvidenceSource
  /** Verinin geçerli olduğu tarih (belge/kayıt tarihi) */
  effectiveAt?: string
  /** Sorgunun yapıldığı an */
  retrievedAt: string
  validUntil?: string
  scope: EvidenceScope
  /** Ör. "10 m hücre", "bölgesel" */
  geographicResolution?: string
  method?: string
  methodVersion?: string
  /** Yalnız kalibre edilmiş `derived`/`estimated` sonuçlarda anlamlıdır */
  confidence?: number
  knownLimitations?: string[]
  conflicts?: EvidenceConflict[]
  unavailableReason?: UnavailableReason
}

const SOURCE_CLASS_LABELS: Record<EvidenceSourceClass, string> = {
  official: 'Resmî kayıttan',
  verified_document: 'Doğrulanmış belgeden',
  advertiser_declared: 'İlan sahibi beyanı',
  platform_derived: 'ArsaPazar hesabı',
  model_estimate: 'Model tahmini',
  unknown: 'Doğrulanamadı',
}

/** Kaynak sınıfının görünür kullanıcı etiketi. */
export function sourceClassLabel(sourceClass: EvidenceSourceClass): string {
  return SOURCE_CLASS_LABELS[sourceClass]
}

export function hasConflict(value: EvidenceValue<unknown>): boolean {
  return (value.conflicts?.length ?? 0) > 0
}

export function isAnswered(value: EvidenceValue<unknown>): boolean {
  return value.value !== undefined && value.status !== 'unavailable'
}

/**
 * Satırda gösterilecek tek etiket. Öncelik sırası bilinçlidir: çelişki
 * bastırılamaz, bayatlık kökenin önüne geçer, cevapsızlık gizlenmez.
 */
export function evidenceStatusLabel(value: EvidenceValue<unknown>): string {
  if (value.status === 'conflicting' || hasConflict(value)) return 'Kaynaklar çelişiyor'
  if (value.freshness === 'stale') return 'Güncel değil'
  if (!isAnswered(value)) return 'Doğrulanamadı'
  return sourceClassLabel(value.source.sourceClass)
}

const DAY_MS = 86_400_000
const AGING_AFTER_DAYS = 90
const STALE_AFTER_DAYS = 180

/**
 * Güncelliği belirler. Belge/kayıt tarihi (`effectiveAt`) varsa sorgu
 * tarihinden daha belirleyicidir: dün sorgulanmış sekiz aylık bir plan notu
 * güncel değildir.
 */
export function freshnessFrom(
  retrievedAt: string,
  now: string,
  effectiveAt?: string,
): FreshnessStatus {
  const reference = effectiveAt ?? retrievedAt
  const referenceMs = Date.parse(reference)
  const nowMs = Date.parse(now)
  if (Number.isNaN(referenceMs) || Number.isNaN(nowMs)) return 'unknown'

  const ageDays = (nowMs - referenceMs) / DAY_MS
  if (ageDays < 0) return 'unknown'
  if (ageDays <= AGING_AFTER_DAYS) return 'current'
  if (ageDays <= STALE_AFTER_DAYS) return 'aging'
  return 'stale'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run apps/web/src/features/listing-detail/domain/evidence.test.ts`
Expected: PASS — 12 test

- [ ] **Step 5: Typecheck ve commit**

```bash
npm run typecheck:web
git add apps/web/src/features/listing-detail/domain/evidence.ts apps/web/src/features/listing-detail/domain/evidence.test.ts
git commit -m "feat(listing-detail): kanıt defteri domain çekirdeğini ekle"
```

---

## Task 2: ListingDetail domain tipleri ve doğrulama vektörü

**Files:**
- Create: `apps/web/src/features/listing-detail/domain/listing-detail-types.ts`
- Create: `apps/web/src/features/listing-detail/domain/listing-detail-view-model.ts`
- Test: `apps/web/src/features/listing-detail/domain/listing-detail-view-model.test.ts`

**Interfaces:**
- Consumes: `EvidenceValue<T>`, `hasConflict`, `isAnswered`, `evidenceStatusLabel` (Task 1)
- Produces:
  - `ListingLifecycle = 'active' | 'expired' | 'sold' | 'withdrawn' | 'moderated'`
  - `VerificationRowId = 'advertiser_identity' | 'listing_authorisation' | 'agency_licence' | 'parcel_match' | 'planning_document' | 'platform_moderation' | 'media_provenance'`
  - `VerificationRow { id, title, scopeNote?, state: 'positive' | 'negative' | 'unknown', source, retrievedAt?, validUntil? }`
  - `ListingDetailBase`, `LandListingDetail`, `ListingDetail`
  - `CriticalIssue { id, title, detail, action? }`
  - `criticalIssues(detail: ListingDetail): CriticalIssue[]`
  - `verificationScore(rows: VerificationRow[]): { positive: number; total: number }`
  - `metricStripItems(detail: ListingDetail): GlassMetricStripItem[]`

- [ ] **Step 1: Write the failing test**

`apps/web/src/features/listing-detail/domain/listing-detail-view-model.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { criticalIssues, metricStripItems, verificationScore } from './listing-detail-view-model'
import type { LandListingDetail, VerificationRow } from './listing-detail-types'
import type { EvidenceValue } from './evidence'

function evidence<T>(value: T, over: Partial<EvidenceValue<T>> = {}): EvidenceValue<T> {
  return {
    value,
    status: 'verified',
    freshness: 'current',
    source: { id: 'megsis', name: 'TKGM MEGSİS', sourceClass: 'official' },
    retrievedAt: '2026-07-24T09:12:00.000Z',
    scope: 'parcel',
    ...over,
  }
}

function landDetail(over: Partial<LandListingDetail> = {}): LandListingDetail {
  return {
    kind: 'land',
    id: 'arsa-214-7',
    title: "Ören'de 4.850 m² tarla",
    lifecycle: 'active',
    listingNumber: '2026-114-8207',
    publishedAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-07-21T00:00:00.000Z',
    evidenceCutoff: '2026-07-24T09:12:00.000Z',
    location: { city: 'Muğla', district: 'Milas', neighbourhood: 'Ören' },
    price: { amount: 8_750_000, currency: 'TRY', declaredArea: 4850, unitPrice: 1804 },
    verification: [],
    parcel: {
      blockParcel: evidence('214 ada / 7 parsel'),
      area: evidence(4712),
      locationPrecision: evidence('Pin parsel geometrisinin içinde · ±5 m'),
    },
    planning: {
      titleDeedType: evidence('Tarla', { status: 'declared', source: { id: 'advertiser', name: 'İlan sahibi', sourceClass: 'advertiser_declared' } }),
      shared: { isShared: true, share: '2/4' },
      planStatus: evidence('1/1000 Uygulama İmar Planı — askıda'),
      landUse: evidence('Turizm Tesis Alanı (öneri)', { freshness: 'stale' }),
      encumbrance: { status: 'unavailable', unavailableReason: 'not_published', freshness: 'unknown', source: { id: 'takbis', name: 'TAKBİS', sourceClass: 'unknown' }, retrievedAt: '2026-07-24T09:12:00.000Z', scope: 'property' },
    },
    access: {
      legalRoadAccess: { status: 'unavailable', unavailableReason: 'not_published', freshness: 'unknown', source: { id: 'kadastro', name: 'Kadastro', sourceClass: 'unknown' }, retrievedAt: '2026-07-24T09:12:00.000Z', scope: 'parcel' },
      physicalAccess: evidence('Stabilize yol', { status: 'derived', source: { id: 'imagery', name: 'Uydu görüntüsü', sourceClass: 'platform_derived' } }),
      utilities: [],
    },
    terrain: { slope: evidence('%12'), hazards: [] },
    market: { comparableMedianUnitPrice: evidence(1980, { status: 'derived', source: { id: 'market', name: 'ArsaPazar emsal kesiti', sourceClass: 'platform_derived' } }), comparableCount: 14, valuation: { kind: 'insufficient', reason: 'Bölgede gerçekleşmiş işlem verisi yok; emsal örneklemi eşiğin altında.' } },
    documents: [],
    seller: { name: 'Ören Emlak', type: 'agency', licence: evidence('TTBS 4820/1173') },
    media: [],
    ...over,
  }
}

describe('criticalIssues', () => {
  it('hisseli tapuyu, doğrulanamayan yasal erişimi ve çelişkiyi kritik sayar', () => {
    const detail = landDetail({
      parcel: {
        blockParcel: evidence('214 ada / 7 parsel'),
        area: evidence(4712, { status: 'conflicting', conflicts: [{ sourceId: 'advertiser', value: 4850, effectiveAt: '2026-04-12T00:00:00.000Z' }] }),
        locationPrecision: evidence('±5 m'),
      },
    })

    const ids = criticalIssues(detail).map((issue) => issue.id)
    expect(ids).toContain('shared-title-deed')
    expect(ids).toContain('legal-access-unverified')
    expect(ids).toContain('area-conflict')
  })

  it('çelişki metninde iki değeri ve iki kaynağı birlikte gösterir', () => {
    const detail = landDetail({
      parcel: {
        blockParcel: evidence('214 ada / 7 parsel'),
        area: evidence(4712, { status: 'conflicting', conflicts: [{ sourceId: 'advertiser', value: 4850 }] }),
        locationPrecision: evidence('±5 m'),
      },
    })
    const issue = criticalIssues(detail).find((item) => item.id === 'area-conflict')
    expect(issue?.detail).toContain('4.712')
    expect(issue?.detail).toContain('4.850')
  })

  it('müstakil tapu ve doğrulanmış erişimde kritik eksik üretmez', () => {
    const detail = landDetail({
      planning: {
        ...landDetail().planning,
        shared: { isShared: false },
      },
      access: {
        ...landDetail().access,
        legalRoadAccess: evidence('Kadastral yol cephesi var'),
      },
    })
    expect(criticalIssues(detail)).toHaveLength(0)
  })
})

describe('verificationScore', () => {
  it('yalnız olumlu satırları sayar, bilinmeyeni olumlu saymaz', () => {
    const rows: VerificationRow[] = [
      { id: 'listing_authorisation', title: 'İlan verme yetkisi EİDS ile doğrulandı', state: 'positive', source: 'EİDS' },
      { id: 'agency_licence', title: 'TTBS yetki belgesi geçerli', state: 'positive', source: 'TTBS' },
      { id: 'parcel_match', title: 'Yüzölçümü kayıtla eşleşmedi', state: 'negative', source: 'MEGSİS' },
      { id: 'planning_document', title: 'İmar durum belgesi sunulmadı', state: 'unknown', source: '—' },
    ]
    expect(verificationScore(rows)).toEqual({ positive: 2, total: 4 })
  })
})

describe('metricStripItems', () => {
  it('fiyat, birim fiyat ve kayıt alanını tabular değerlerle üretir', () => {
    const items = metricStripItems(landDetail())
    const byId = Object.fromEntries(items.map((item) => [item.id, item]))
    expect(byId.price.value).toBe('8.750.000 ₺')
    expect(byId['unit-price'].value).toBe('1.804 ₺/m²')
    expect(byId.area.value).toBe('4.712 m²')
    expect(byId.area.hint).toContain('MEGSİS')
  })

  it('değerleme çekindiğinde metrik yerine açıklama taşır', () => {
    const items = metricStripItems(landDetail())
    const valuation = items.find((item) => item.id === 'valuation')
    expect(valuation?.value).toBe('Üretilmedi')
    expect(valuation?.hint).toContain('veri')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/web/src/features/listing-detail/domain/listing-detail-view-model.test.ts`
Expected: FAIL — `Failed to resolve import "./listing-detail-view-model"`

- [ ] **Step 3: Write the type module**

`apps/web/src/features/listing-detail/domain/listing-detail-types.ts`:

```ts
import type { EvidenceValue } from './evidence'

/** İlan yaşam döngüsü — aktif olmayan ilan sessizce aramaya yönlendirilmez. */
export type ListingLifecycle = 'active' | 'expired' | 'sold' | 'withdrawn' | 'moderated'

/** Doğrulama vektörü satırları; biri olumlu olsa diğerleri olumlu olmaz. */
export type VerificationRowId =
  | 'advertiser_identity'
  | 'listing_authorisation'
  | 'agency_licence'
  | 'parcel_match'
  | 'planning_document'
  | 'platform_moderation'
  | 'media_provenance'

export interface VerificationRow {
  id: VerificationRowId
  /** Tam cümle — "Doğrulandı" tek başına kullanılmaz */
  title: string
  /** Kontrolün neyi KAPSAMADIĞINI söyleyen zorunlu açıklama (EİDS satırında zorunlu) */
  scopeNote?: string
  state: 'positive' | 'negative' | 'unknown'
  /** Görünür kaynak adı */
  source: string
  retrievedAt?: string
  validUntil?: string
}

export interface ListingLocation {
  city: string
  district: string
  neighbourhood: string
}

export interface ListingPrice {
  amount: number
  currency: 'TRY'
  /** İlanda beyan edilen alan — birim fiyat bunun üzerinden hesaplanır */
  declaredArea: number
  unitPrice: number
}

export interface ListingMediaItem {
  id: string
  kind: 'photo' | 'video' | 'plan' | 'parcel' | 'drone'
  label: string
  src?: string
  capturedAt?: string
  /** AI ile üretilmiş veya maddi biçimde düzenlenmiş medya görünür etiketlenir */
  aiEdited?: boolean
}

export interface ListingDocument {
  id: string
  label: string
  state: 'available' | 'missing'
  critical: boolean
  issuedAt?: string
  authority?: string
}

export interface ListingSeller {
  name: string
  type: 'agency' | 'individual'
  licence?: EvidenceValue<string>
  respondsInHours?: number
  activeListings?: number
  memberSince?: string
}

export interface UtilityEvidence {
  id: string
  label: string
  /** Boolean yerine kapsamlı durum: parselde / sınırda / yolda / yok */
  value: EvidenceValue<string>
}

export interface HazardIndicator {
  id: string
  /** "Bölgesel deprem tehlike göstergesi" gibi — risk hükmü değil */
  label: string
  value: EvidenceValue<string>
  /** Zorunlu kapsam/sınırlama açıklaması */
  scopeNote: string
}

export type ValuationOutcome =
  | { kind: 'range'; low: number; high: number; methodVersion: string; sampleSize: number }
  | { kind: 'insufficient'; reason: string }

export interface ListingDetailBase {
  id: string
  title: string
  lifecycle: ListingLifecycle
  listingNumber: string
  publishedAt: string
  updatedAt: string
  /** Tüm kanıtların ortak sorgu kesiti */
  evidenceCutoff: string
  location: ListingLocation
  price: ListingPrice
  verification: VerificationRow[]
  documents: ListingDocument[]
  seller: ListingSeller
  media: ListingMediaItem[]
}

export interface LandListingDetail extends ListingDetailBase {
  kind: 'land'
  parcel: {
    blockParcel: EvidenceValue<string>
    /** Kayıttaki yüzölçümü; beyanla çelişebilir */
    area: EvidenceValue<number>
    locationPrecision: EvidenceValue<string>
    distanceToSea?: EvidenceValue<string>
  }
  planning: {
    titleDeedType: EvidenceValue<string>
    shared: { isShared: boolean; share?: string }
    planStatus: EvidenceValue<string>
    landUse: EvidenceValue<string>
    encumbrance: EvidenceValue<string>
    planNumber?: string
    planScale?: string
  }
  access: {
    /** Yasal yol hakkı — "yola yakın" bu değildir */
    legalRoadAccess: EvidenceValue<string>
    physicalAccess: EvidenceValue<string>
    utilities: UtilityEvidence[]
  }
  terrain: {
    slope: EvidenceValue<string>
    aspect?: EvidenceValue<string>
    hazards: HazardIndicator[]
  }
  market: {
    comparableMedianUnitPrice: EvidenceValue<number>
    comparableCount: number
    valuation: ValuationOutcome
  }
}

/** Kategori paketleri bu union üzerinden büyür (Faz 4). */
export type ListingDetail = LandListingDetail
```

- [ ] **Step 4: Write the view-model module**

`apps/web/src/features/listing-detail/domain/listing-detail-view-model.ts`:

```ts
import type { GlassMetricStripItem } from '@repo/ui'
import { hasConflict, isAnswered } from './evidence'
import type { ListingDetail, VerificationRow } from './listing-detail-types'

export interface CriticalIssue {
  id: string
  title: string
  detail: string
  /** Kullanıcının atabileceği güvenli sonraki adım */
  action?: string
}

const trNumber = new Intl.NumberFormat('tr-TR')

/** Karar öncesi çözülmesi gereken konular — accordion arkasına saklanmaz. */
export function criticalIssues(detail: ListingDetail): CriticalIssue[] {
  const issues: CriticalIssue[] = []

  if (detail.planning.shared.isShared) {
    const share = detail.planning.shared.share
    issues.push({
      id: 'shared-title-deed',
      title: 'Tapu hisseli',
      detail: share
        ? `İlan ${share} pay için veriliyor. Diğer paydaşların satışa katılımı ve önalım hakkı belirsiz.`
        : 'İlan taşınmazın tamamı için değil, bir pay için veriliyor.',
      action: 'Paydaş durumunu sor',
    })
  }

  if (!isAnswered(detail.access.legalRoadAccess)) {
    issues.push({
      id: 'legal-access-unverified',
      title: 'Yasal yol erişimi doğrulanamadı',
      detail:
        'Kadastral yol veya geçit irtifakı kaydı bulunamadı. Yola yakınlık yasal erişim hakkı değildir.',
      action: 'Yol erişim belgesi iste',
    })
  }

  if (hasConflict(detail.parcel.area)) {
    const recorded = detail.parcel.area.value
    const declared = detail.parcel.area.conflicts?.[0]?.value
    issues.push({
      id: 'area-conflict',
      title: 'Yüzölçümü çelişkisi',
      detail: `Kayıtta ${trNumber.format(Number(recorded))} m², ilanda ${trNumber.format(
        Number(declared),
      )} m² beyan edildi. Birim fiyat beyan edilen alana göre hesaplandı.`,
      action: 'Aplikasyon krokisi iste',
    })
  }

  return issues
}

export function verificationScore(rows: VerificationRow[]): { positive: number; total: number } {
  return {
    positive: rows.filter((row) => row.state === 'positive').length,
    total: rows.length,
  }
}

/** L0 karar görüntüsünün sayısal şeridi; her değer kaynağını hint'te taşır. */
export function metricStripItems(detail: ListingDetail): GlassMetricStripItem[] {
  const items: GlassMetricStripItem[] = [
    {
      id: 'price',
      label: 'Toplam fiyat',
      value: `${trNumber.format(detail.price.amount)} ₺`,
      hint: 'İlan sahibi beyanı',
    },
    {
      id: 'unit-price',
      label: 'Birim fiyat',
      value: `${trNumber.format(detail.price.unitPrice)} ₺/m²`,
      hint: 'Beyan edilen alana göre türetildi',
    },
  ]

  const area = detail.parcel.area
  if (area.value !== undefined) {
    items.push({
      id: 'area',
      label: 'Yüzölçümü',
      value: `${trNumber.format(area.value)} m²`,
      hint: hasConflict(area) ? 'MEGSİS kaydı · beyanla çelişiyor' : 'MEGSİS kaydı',
    })
  }

  const median = detail.market.comparableMedianUnitPrice
  if (median.value !== undefined) {
    items.push({
      id: 'comparable-median',
      label: 'Emsal medyanı',
      value: `${trNumber.format(median.value)} ₺/m²`,
      hint: `${detail.market.comparableCount} ilan · yalnız ilan fiyatı`,
    })
  }

  items.push(
    detail.market.valuation.kind === 'range'
      ? {
          id: 'valuation',
          label: 'ArsaPazar tahmini',
          value: `${trNumber.format(detail.market.valuation.low)} – ${trNumber.format(
            detail.market.valuation.high,
          )} ₺`,
          hint: `Model ${detail.market.valuation.methodVersion} · ${detail.market.valuation.sampleSize} emsal`,
        }
      : {
          id: 'valuation',
          label: 'ArsaPazar tahmini',
          value: 'Üretilmedi',
          hint: detail.market.valuation.reason,
        },
  )

  return items
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run apps/web/src/features/listing-detail/domain/listing-detail-view-model.test.ts`
Expected: PASS — 6 test

- [ ] **Step 6: Typecheck ve commit**

```bash
npm run typecheck:web
git add apps/web/src/features/listing-detail/domain/
git commit -m "feat(listing-detail): domain tiplerini ve karar görünümü türevlerini ekle"
```

---

## Task 3: Deterministik fixture, adapter ve query

**Files:**
- Create: `apps/web/src/features/listing-detail/data/listing-detail-fixtures.ts`
- Create: `apps/web/src/features/listing-detail/data/listing-detail-adapter.ts`
- Create: `apps/web/src/features/listing-detail/data/listing-detail-query.ts`
- Test: `apps/web/src/features/listing-detail/data/listing-detail-adapter.test.ts`

**Interfaces:**
- Consumes: Task 1 + Task 2 tipleri
- Produces:
  - `ListingDetailScenario = 'default' | 'stale-planning' | 'ai-unavailable' | 'map-unavailable' | 'inactive' | 'not-found'`
  - `ListingDetailSection = 'core' | 'map' | 'planning' | 'market' | 'ai'`
  - `SectionState<T> = { state: 'ready'; data: T } | { state: 'unavailable'; reason: string }`
  - `ListingDetailResult { detail: ListingDetail; sections: Record<ListingDetailSection, SectionState<true>>; aiBrief: SectionState<AiDecisionBrief> }`
  - `AiDecisionBrief { summary: string; claims: AiClaim[]; unknowns: string[]; nextChecks: string[]; modelVersion: string; evidenceCutoff: string }`
  - `AiClaim { id: string; text: string; sectionId: string }`
  - `loadListingDetail(input: { listingId: string; scenario?: ListingDetailScenario; now: string }): Promise<ListingDetailResult | null>`
  - `listingDetailQueryOptions(listingId: string, now: string, scenario?: ListingDetailScenario)`

- [ ] **Step 1: Write the failing test**

`apps/web/src/features/listing-detail/data/listing-detail-adapter.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { loadListingDetail } from './listing-detail-adapter'

const NOW = '2026-07-27T09:00:00.000Z'

describe('loadListingDetail', () => {
  it('aynı girdiyle iki kez çağrıldığında birebir aynı sonucu üretir', async () => {
    const first = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const second = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  it('bilinmeyen ilan için null döner — arama sayfasına yönlendirmez', async () => {
    expect(await loadListingDetail({ listingId: 'yok-boyle-bir-ilan', now: NOW })).toBeNull()
  })

  it('EİDS satırı yalnız ilan verme yetkisini doğrular ve kapsam notu taşır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const row = result?.detail.verification.find((item) => item.id === 'listing_authorisation')
    expect(row?.title).toBe('İlan verme yetkisi EİDS ile doğrulandı')
    expect(row?.scopeNote).toBe(
      'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.',
    )
  })

  it('parsel eşleşmesi satırı çelişki nedeniyle olumsuzdur', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const row = result?.detail.verification.find((item) => item.id === 'parcel_match')
    expect(row?.state).toBe('negative')
  })

  it('plan notu bayat senaryosunda güncellik stale olarak işaretlenir', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'stale-planning', now: NOW })
    expect(result?.detail.planning.landUse.freshness).toBe('stale')
  })

  it('AI kullanılamadığında yapılandırılmış içerik korunur, yalnız brief düşer', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'ai-unavailable', now: NOW })
    expect(result?.aiBrief.state).toBe('unavailable')
    expect(result?.detail.parcel.blockParcel.value).toBe('214 ada / 7 parsel')
    expect(result?.sections.core.state).toBe('ready')
  })

  it('harita sağlayıcısı düştüğünde yalnız harita bölümü etkilenir', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'map-unavailable', now: NOW })
    expect(result?.sections.map.state).toBe('unavailable')
    expect(result?.sections.planning.state).toBe('ready')
  })

  it('AI özetindeki her iddia bir bölüme bağlıdır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    const brief = result?.aiBrief
    if (brief?.state !== 'ready') throw new Error('brief hazır olmalı')
    expect(brief.data.claims.length).toBeGreaterThan(0)
    for (const claim of brief.data.claims) {
      expect(claim.sectionId).toMatch(/^(parsel|imar|altyapi|arazi|piyasa|belgeler)$/)
    }
  })

  it('AI özeti fiyat tahmini uydurmaz — değerleme çekinmesini aktarır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
    expect(result?.detail.market.valuation.kind).toBe('insufficient')
  })

  it('süresi dolmuş ilanda yaşam döngüsü aktarılır', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'inactive', now: NOW })
    expect(result?.detail.lifecycle).toBe('expired')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/web/src/features/listing-detail/data/listing-detail-adapter.test.ts`
Expected: FAIL — `Failed to resolve import "./listing-detail-adapter"`

- [ ] **Step 3: Write the fixture module**

`apps/web/src/features/listing-detail/data/listing-detail-fixtures.ts` — Ören 214/7 senaryosu. Tüm tarihler sabit; `Math.random()` ve argümansız `new Date()` kullanılmaz.

```ts
import type { EvidenceValue } from '../domain/evidence'
import type { LandListingDetail, VerificationRow } from '../domain/listing-detail-types'

const CUTOFF = '2026-07-24T09:12:00.000Z'

/** EİDS satırında kapsam notu zorunludur — metin repo genelinde tek kaynaktır. */
export const EIDS_SCOPE_NOTE =
  'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.'

function official<T>(value: T, over: Partial<EvidenceValue<T>> = {}): EvidenceValue<T> {
  return {
    value,
    status: 'verified',
    freshness: 'current',
    source: { id: 'megsis', name: 'TKGM MEGSİS', sourceClass: 'official', authority: 'Tapu ve Kadastro Genel Müdürlüğü' },
    retrievedAt: CUTOFF,
    scope: 'parcel',
    ...over,
  }
}

function declared<T>(value: T, over: Partial<EvidenceValue<T>> = {}): EvidenceValue<T> {
  return {
    value,
    status: 'declared',
    freshness: 'current',
    source: { id: 'advertiser', name: 'İlan sahibi', sourceClass: 'advertiser_declared' },
    retrievedAt: '2026-04-12T00:00:00.000Z',
    effectiveAt: '2026-04-12T00:00:00.000Z',
    scope: 'property',
    ...over,
  }
}

function derived<T>(value: T, over: Partial<EvidenceValue<T>> = {}): EvidenceValue<T> {
  return {
    value,
    status: 'derived',
    freshness: 'current',
    source: { id: 'platform', name: 'ArsaPazar türevi', sourceClass: 'platform_derived' },
    retrievedAt: CUTOFF,
    scope: 'parcel',
    ...over,
  }
}

function unavailable<T>(sourceName: string, reason: EvidenceValue<T>['unavailableReason']): EvidenceValue<T> {
  return {
    status: 'unavailable',
    unavailableReason: reason,
    freshness: 'unknown',
    source: { id: sourceName.toLowerCase(), name: sourceName, sourceClass: 'unknown' },
    retrievedAt: CUTOFF,
    scope: 'property',
  }
}

const VERIFICATION: VerificationRow[] = [
  {
    id: 'advertiser_identity',
    title: 'İlan veren kimliği doğrulandı',
    state: 'positive',
    source: 'ArsaPazar kimlik kontrolü',
    retrievedAt: '2026-04-11T00:00:00.000Z',
  },
  {
    id: 'listing_authorisation',
    title: 'İlan verme yetkisi EİDS ile doğrulandı',
    scopeNote: EIDS_SCOPE_NOTE,
    state: 'positive',
    source: 'Ticaret Bakanlığı EİDS',
    retrievedAt: CUTOFF,
  },
  {
    id: 'agency_licence',
    title: 'Emlak işletmesinin TTBS yetki belgesi geçerli',
    state: 'positive',
    source: 'TTBS 4820/1173',
    validUntil: '2026-12-31T00:00:00.000Z',
  },
  {
    id: 'parcel_match',
    title: 'İlan yüzölçümü parsel kaydıyla eşleşmedi',
    scopeNote: 'Beyan 4.850 m² · MEGSİS 4.712 m² · fark 138 m²',
    state: 'negative',
    source: 'TKGM MEGSİS',
    retrievedAt: CUTOFF,
  },
  {
    id: 'planning_document',
    title: 'İmar durum belgesi platforma sunulmadı',
    scopeNote: 'Plan durumu yalnız e-Plan sorgusundan biliniyor.',
    state: 'unknown',
    source: '—',
  },
  {
    id: 'platform_moderation',
    title: 'Platform moderasyonu tamamlandı',
    scopeNote: 'Kapsam: yasak içerik ve yinelenen ilan kontrolü. İçerik doğruluğu kapsam dışıdır.',
    state: 'positive',
    source: 'ArsaPazar moderasyon',
    retrievedAt: '2026-04-14T00:00:00.000Z',
  },
  {
    id: 'media_provenance',
    title: '24 fotoğrafın 3ünde düzenleme izi bulundu',
    scopeNote: 'Content Credentials bulunamadı; bu, görsellerin sahte olduğu anlamına gelmez.',
    state: 'unknown',
    source: 'ArsaPazar medya taraması',
    retrievedAt: '2026-04-14T00:00:00.000Z',
  },
]

export const OREN_LAND_LISTING: LandListingDetail = {
  kind: 'land',
  id: 'arsa-214-7',
  title: "Ören'de 4.850 m² tarla — denize 1,4 km, imar planı askıda",
  lifecycle: 'active',
  listingNumber: '2026-114-8207',
  publishedAt: '2026-04-12T00:00:00.000Z',
  updatedAt: '2026-07-21T00:00:00.000Z',
  evidenceCutoff: CUTOFF,
  location: { city: 'Muğla', district: 'Milas', neighbourhood: 'Ören' },
  price: { amount: 8_750_000, currency: 'TRY', declaredArea: 4850, unitPrice: 1804 },
  verification: VERIFICATION,
  parcel: {
    blockParcel: official('214 ada / 7 parsel', { effectiveAt: '2019-02-03T00:00:00.000Z' }),
    area: official(4712, {
      status: 'conflicting',
      conflicts: [{ sourceId: 'advertiser', value: 4850, effectiveAt: '2026-04-12T00:00:00.000Z' }],
      knownLimitations: ['Birim fiyat beyan edilen alana göre hesaplandı.'],
    }),
    locationPrecision: derived('Pin parsel geometrisinin içinde · ±5 m', {
      method: 'Geometri içi nokta testi',
      geographicResolution: '±5 m',
    }),
    distanceToSea: derived('1,4 km kuş uçuşu', {
      method: 'Kıyı çizgisine en kısa mesafe',
      knownLimitations: ['Araçla ulaşım mesafesi yol ağı nedeniyle daha uzundur.'],
    }),
  },
  planning: {
    titleDeedType: declared('Tarla'),
    shared: { isShared: true, share: '2/4' },
    planStatus: {
      value: '1/1000 Uygulama İmar Planı — askıda, itirazlar değerlendiriliyor',
      status: 'verified',
      freshness: 'current',
      source: { id: 'eplan', name: 'Milas Belediyesi · e-Plan', sourceClass: 'official' },
      retrievedAt: CUTOFF,
      scope: 'parcel',
      knownLimitations: ['Askıdaki plan kesinleşmiş hak doğurmaz; itiraz, revizyon veya iptalle değişebilir.'],
    },
    landUse: {
      value: 'Turizm Tesis Alanı (öneri) · TAKS 0,20 · KAKS 0,40 · maks. 2 kat',
      status: 'declared',
      freshness: 'aging',
      source: { id: 'plan-note', name: 'Plan notu belgesi', sourceClass: 'verified_document' },
      retrievedAt: CUTOFF,
      effectiveAt: '2025-11-19T00:00:00.000Z',
      scope: 'neighborhood',
      knownLimitations: ['Kapsam plan bölgesidir, parsel bazlı değildir.'],
    },
    encumbrance: unavailable('TAKBİS', 'not_published'),
    planNumber: 'MİL-2026/14',
    planScale: '1/1000',
  },
  access: {
    legalRoadAccess: unavailable('Kadastro Müdürlüğü', 'not_published'),
    physicalAccess: derived('Stabilize yol — asfalt bağlantıya ~340 m', {
      source: { id: 'imagery', name: 'Uydu görüntüsü yorumu', sourceClass: 'platform_derived' },
      effectiveAt: '2026-06-12T00:00:00.000Z',
      geographicResolution: '±25 m',
    }),
    utilities: [
      { id: 'electricity', label: 'Elektrik', value: derived('Yolda — parselde bağlantı yok, ~180 m', { geographicResolution: '±25 m' }) },
      { id: 'water', label: 'Su', value: declared('Köy şebekesi yolda — parselde abonelik yok') },
      { id: 'sewage', label: 'Kanalizasyon', value: declared('Yok — fosseptik gerekli') },
    ],
  },
  terrain: {
    slope: derived('Ortalama %12 · min %4 · maks %19', {
      method: '10 m çözünürlüklü sayısal yükseklik modeli',
      geographicResolution: '10 m hücre',
      knownLimitations: ['Parsel içi mikro topografya ve zemin yapısı için jeoteknik etüt gerekir.'],
    }),
    aspect: derived('Güney-güneybatı · kot 84–142 m'),
    hazards: [
      {
        id: 'earthquake',
        label: 'Bölgesel deprem tehlike göstergesi',
        scopeNote: 'Tehlike risk değildir. Risk için maruziyet, kırılganlık ve yerel zemin koşulları ayrıca incelenir.',
        value: {
          value: 'PGA 0,32 g — 50 yılda %10 aşılma olasılığı',
          status: 'verified',
          freshness: 'current',
          source: { id: 'afad', name: 'AFAD Türkiye Deprem Tehlike Haritası', sourceClass: 'official' },
          retrievedAt: CUTOFF,
          effectiveAt: '2018-01-18T00:00:00.000Z',
          scope: 'district',
          geographicResolution: 'bölgesel',
        },
      },
      {
        id: 'wildfire',
        label: 'Orman yangını duyarlılık göstergesi',
        scopeNote: 'Kapsam orman işletme şefliği ölçeğindedir; parsel bazlı hüküm vermez.',
        value: {
          value: 'Yüksek sınıf — çevrede kızılçam örtüsü',
          status: 'verified',
          freshness: 'current',
          source: { id: 'ogm', name: 'OGM duyarlılık sınıfı', sourceClass: 'official' },
          retrievedAt: CUTOFF,
          scope: 'district',
        },
      },
      {
        id: 'flood',
        label: 'Taşkın göstergesi',
        scopeNote: 'Katmanın bulunmaması taşkın tehlikesi olmadığı anlamına gelmez.',
        value: unavailable('Havza taşkın haritası', 'not_published'),
      },
    ],
  },
  market: {
    comparableMedianUnitPrice: derived(1980, {
      source: { id: 'market', name: 'ArsaPazar emsal kesiti', sourceClass: 'platform_derived' },
      method: '3 km yarıçap · son 12 ay · 2 aykırı değer çıkarıldı',
      knownLimitations: ['Yalnız ilan fiyatıdır; gerçekleşmiş işlem ve ekspertiz kapsam dışıdır.'],
    }),
    comparableCount: 14,
    valuation: {
      kind: 'insufficient',
      reason: 'Bölgede gerçekleşmiş işlem verisi yok ve emsal örneklemi modelin eşiğinin altında.',
    },
  },
  documents: [
    { id: 'deed-copy', label: 'Tapu kaydı örneği', state: 'available', critical: false, issuedAt: '2026-04-12T00:00:00.000Z' },
    { id: 'survey-sketch', label: 'Aplikasyon krokisi', state: 'available', critical: false, issuedAt: '2026-05-04T00:00:00.000Z', authority: 'LİHKAB' },
    { id: 'zoning-status', label: 'İmar durum belgesi', state: 'missing', critical: true, authority: 'Milas Belediyesi İmar Müdürlüğü' },
    { id: 'road-access', label: 'Yol erişim / irtifak belgesi', state: 'missing', critical: true, authority: 'Kadastro Müdürlüğü' },
    { id: 'encumbrance', label: 'Güncel takyidat kaydı', state: 'missing', critical: true, authority: 'TAKBİS' },
  ],
  seller: {
    name: 'Ören Emlak',
    type: 'agency',
    licence: official('TTBS 4820/1173', {
      source: { id: 'ttbs', name: 'Ticaret Bakanlığı TTBS', sourceClass: 'official' },
      validUntil: '2026-12-31T00:00:00.000Z',
      scope: 'property',
    }),
    respondsInHours: 4,
    activeListings: 42,
    memberSince: '2023-05-01T00:00:00.000Z',
  },
  media: [
    { id: 'parcel', kind: 'parcel', label: 'Parsel görünümü', capturedAt: CUTOFF },
    { id: 'photo-1', kind: 'photo', label: 'Parselden deniz yönü', capturedAt: '2026-04-08T00:00:00.000Z' },
    { id: 'photo-2', kind: 'photo', label: 'Stabilize yol girişi', capturedAt: '2026-04-08T00:00:00.000Z' },
    { id: 'drone-1', kind: 'drone', label: 'Drone çekimi', capturedAt: '2026-04-08T00:00:00.000Z' },
    { id: 'plan-note', kind: 'plan', label: 'Plan notu (PDF)', capturedAt: '2025-11-19T00:00:00.000Z' },
  ],
}
```

- [ ] **Step 4: Write the adapter**

`apps/web/src/features/listing-detail/data/listing-detail-adapter.ts`:

```ts
import type { LandListingDetail, ListingDetail } from '../domain/listing-detail-types'
import { OREN_LAND_LISTING } from './listing-detail-fixtures'

/** Storybook ve testlerin açıkça seçtiği durum senaryoları. */
export type ListingDetailScenario =
  | 'default'
  | 'stale-planning'
  | 'ai-unavailable'
  | 'map-unavailable'
  | 'inactive'
  | 'not-found'

/** Bölüm bazlı hata izolasyonu: tek sağlayıcı hatası tüm ilanı kapatmaz. */
export type ListingDetailSection = 'core' | 'map' | 'planning' | 'market' | 'ai'

export type SectionState<T> = { state: 'ready'; data: T } | { state: 'unavailable'; reason: string }

export interface AiClaim {
  id: string
  text: string
  /** Bölüm çapası — her iddia sayfadaki bir kanıt bölümüne bağlanır */
  sectionId: 'parsel' | 'imar' | 'altyapi' | 'arazi' | 'piyasa' | 'belgeler'
}

export interface AiDecisionBrief {
  summary: string
  claims: AiClaim[]
  unknowns: string[]
  nextChecks: string[]
  modelVersion: string
  evidenceCutoff: string
}

export interface ListingDetailResult {
  detail: ListingDetail
  sections: Record<ListingDetailSection, SectionState<true>>
  aiBrief: SectionState<AiDecisionBrief>
}

const READY: SectionState<true> = { state: 'ready', data: true }

function briefFor(detail: LandListingDetail): AiDecisionBrief {
  return {
    summary:
      'Birim fiyat emsal medyanının altında ve arazi küçük ölçekli bir tesis için elverişli; ancak tapu hisseli, yasal yol erişimi doğrulanamadı ve kullanım kararının dayandığı plan henüz yürürlükte değil.',
    claims: [
      { id: 'price-vs-median', text: 'Birim fiyat 14 ilan emsalinin medyanının %9 altında.', sectionId: 'piyasa' },
      { id: 'terrain-fit', text: 'Güney bakı ve %12 ortalama eğim küçük ölçekli tesis için elverişli.', sectionId: 'arazi' },
      { id: 'shared-deed', text: 'Tapu hisseli; ilan 2/4 pay için veriliyor.', sectionId: 'imar' },
      { id: 'legal-access', text: 'Yasal yol erişimini gösteren kadastral kayıt bulunamadı.', sectionId: 'altyapi' },
      { id: 'plan-pending', text: 'Kullanım kararının dayandığı 1/1000 plan askıda, yürürlükte değil.', sectionId: 'imar' },
    ],
    unknowns: [
      'TAKBİS takyidat kaydı platformda yok',
      'Planın kesinleşme takvimi belirsiz',
      'Yüzölçümü çelişkisi çözülmedi (138 m²)',
    ],
    nextChecks: [
      'Güncel takyidat belgesi isteyin',
      'Parsel bazlı imar durum belgesi isteyin',
      'Yol erişim / irtifak kaydını sorun',
      'Diğer paydaşların satışa katılımını teyit edin',
    ],
    modelVersion: 'v2.4',
    evidenceCutoff: detail.evidenceCutoff,
  }
}

function withScenario(base: LandListingDetail, scenario: ListingDetailScenario): LandListingDetail {
  if (scenario === 'stale-planning') {
    return {
      ...base,
      planning: {
        ...base.planning,
        landUse: { ...base.planning.landUse, freshness: 'stale' },
      },
    }
  }
  if (scenario === 'inactive') {
    return { ...base, lifecycle: 'expired' }
  }
  return base
}

/**
 * İlan detayını normalize edilmiş kanıt defteri olarak yükler.
 *
 * `now` çağıran tarafından verilir; adapter zamanı kendisi okumaz — böylece
 * test ve prerender çıktıları deterministik kalır.
 */
export async function loadListingDetail(input: {
  listingId: string
  scenario?: ListingDetailScenario
  now: string
}): Promise<ListingDetailResult | null> {
  const scenario = input.scenario ?? 'default'
  if (scenario === 'not-found' || input.listingId !== OREN_LAND_LISTING.id) return null

  const detail = withScenario(OREN_LAND_LISTING, scenario)

  return {
    detail,
    sections: {
      core: READY,
      map:
        scenario === 'map-unavailable'
          ? { state: 'unavailable', reason: 'Harita servisine ulaşılamadı. Konum ve parsel bilgisi tablo olarak aşağıdadır.' }
          : READY,
      planning: READY,
      market: READY,
      ai:
        scenario === 'ai-unavailable'
          ? { state: 'unavailable', reason: 'Asistan şu anda yanıt veremiyor.' }
          : READY,
    },
    aiBrief:
      scenario === 'ai-unavailable'
        ? {
            state: 'unavailable',
            reason:
              'Karar özeti şu anda üretilemiyor. Aşağıdaki kaynaklı ilan bilgileri eksiksiz kullanılabilir.',
          }
        : { state: 'ready', data: briefFor(detail) },
  }
}
```

- [ ] **Step 5: Write the query module**

`apps/web/src/features/listing-detail/data/listing-detail-query.ts`:

```ts
import { queryOptions } from '@tanstack/react-query'
import { loadListingDetail, type ListingDetailScenario } from './listing-detail-adapter'

export function listingDetailQueryKey(listingId: string, scenario: ListingDetailScenario) {
  return ['listing-detail', listingId, scenario] as const
}

/** Route loader ve client query aynı normalize şemayı paylaşır. */
export function listingDetailQueryOptions(
  listingId: string,
  now: string,
  scenario: ListingDetailScenario = 'default',
) {
  return queryOptions({
    queryKey: listingDetailQueryKey(listingId, scenario),
    queryFn: () => loadListingDetail({ listingId, scenario, now }),
    staleTime: 60_000,
  })
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run apps/web/src/features/listing-detail/`
Expected: PASS — Task 1-3 testleri (28 test)

- [ ] **Step 7: Typecheck ve commit**

```bash
npm run typecheck:web
git add apps/web/src/features/listing-detail/data/
git commit -m "feat(listing-detail): deterministik fixture, adapter ve query katmanını ekle"
```

---

## Task 4: EİDS kapsam düzeltme geçidi

Spec §1.2'nin birinci kritik düzeltmesi. Repo genelinde EİDS'i tapu/imar doğrulaması gibi sunan metinler düzeltilir ve tekrar sızmalarını engelleyen bir guard testi eklenir.

**Files:**
- Modify: `src/pages/ArsaIlanDetay.tsx:78`, `src/pages/ArsaIlanDetay.tsx:151-153`
- Modify: `src/pages/AnaSayfa.tsx:45`
- Modify: `src/components/GlassTrustSignalPanel/GlassTrustSignalPanel.tsx:21,152`
- Modify: `src/components/GlassTrustSignalPanel/GlassTrustSignalPanel.stories.tsx:8,35,112,162`
- Modify: `src/components/GlassTrustSignalPanel/GlassTrustSignalPanel.test.tsx:6`
- Modify: `src/components/GlassTrustSignalPanel/rules.md:12,157`
- Create: `src/eids-copy.test.ts`

**Interfaces:**
- Consumes: —
- Produces: `src/eids-copy.test.ts` guard — sonraki tüm task'lar bu testi kırmadan metin yazar.

- [ ] **Step 1: Write the failing guard test**

`src/eids-copy.test.ts`:

```ts
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * EİDS, kimlik ve taşınmazı ilan etme yetkisini doğrular; tapu niteliği,
 * imar doğruluğu, fiziksel durum veya fiyat için toplu garanti vermez.
 * Bu test o kapsamı aşan ifadelerin repoya geri sızmasını engeller.
 */
const FORBIDDEN = [
  /tapu\s+kaydıyla\s+EİDS/i,
  /tapu\s+(ve\s+imar\s+)?durumu\s+EİDS/i,
  /İmar\s+EİDS\s+ile\s+doğrulan/i,
  /Tam\s+doğrulanmış\s+ilan/i,
  /Fiyatı\s+doğrulandı/i,
  /Sorunsuz\s+taşınmaz/i,
  /EİDS\s+tapu\s+eşleşmesi/i,
  /tapu\s+kaydıyla\s+eşleşti/i,
  /Her\s+ilan\s+tapu\s+kaydıyla\s+EİDS/i,
]

const ROOTS = ['src', 'apps/web/src']
const EXTENSIONS = ['.ts', '.tsx', '.md', '.mdx']
const SKIP_FILES = ['eids-copy.test.ts']

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '.output') continue
      walk(full, files)
      continue
    }
    if (EXTENSIONS.some((ext) => entry.endsWith(ext)) && !SKIP_FILES.includes(entry)) {
      files.push(full)
    }
  }
  return files
}

describe('EİDS kapsam metni', () => {
  const files = ROOTS.flatMap((root) => walk(root))

  it('kapsam dışı doğrulama iddiası içeren metin bırakmaz', () => {
    const offenders: string[] = []
    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      for (const pattern of FORBIDDEN) {
        if (pattern.test(content)) offenders.push(`${file} → ${pattern}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/eids-copy.test.ts`
Expected: FAIL — `src/pages/ArsaIlanDetay.tsx`, `src/pages/AnaSayfa.tsx` ve `GlassTrustSignalPanel` dosyaları offenders listesinde

- [ ] **Step 3: Fix `src/pages/ArsaIlanDetay.tsx`**

Satır 78'deki spec satırını değiştir:

```tsx
  { label: 'EİDS Durumu', value: 'İlan verme yetkisi doğrulandı — 12 Temmuz 2026' },
  { label: 'EİDS Kapsamı', value: 'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.' },
```

Satır 151-153'teki paragrafı değiştir:

```tsx
                      <p style={{ margin: 0 }}>
                        1/1000 uygulama imar planında konut alanında kalmaktadır; 0.30 emsal ile
                        yaklaşık 150 m² taban oturumlu, iki katlı yapı yapılabilir. Bu taşınmaz için
                        ilan verme yetkisi EİDS ile doğrulanmıştır; tapu niteliği ve imar bilgisi
                        ayrı belgelerle teyit edilmelidir.
                      </p>
```

- [ ] **Step 4: Fix `src/pages/AnaSayfa.tsx:45`**

```tsx
            Her ilanda, ilan verme yetkisi EİDS ile doğrulanır. Aradığınızı doğal dille yazın, filtreleri yapay zekâ kursun.
```

- [ ] **Step 5: Fix `GlassTrustSignalPanel` sinyal isimlendirmesi**

`GlassTrustSignalPanel.tsx` JSDoc örneklerinde ve `rules.md` §8'de `EİDS tapu eşleşmesi` yerine ayrık sinyaller kullanılır. Story/test fixture'larında da aynı ayrım uygulanır:

```tsx
const SIGNALS: GlassTrustSignal[] = [
  { id: 'eids', label: 'EİDS ilan verme yetkisi', status: 'verified', detail: 'Ticaret Bakanlığı sorgusu — 12 Temmuz 2026' },
  { id: 'parcel', label: 'Parsel kaydı eşleşmesi', status: 'verified', detail: 'MEGSİS — 12 Temmuz 2026' },
  { id: 'planning-doc', label: 'İmar belgesi kaynağı', status: 'info', detail: 'Belge sunulmadı' },
  { id: 'moderation', label: 'Platform moderasyonu', status: 'verified', detail: 'İçerik doğruluğu kapsam dışı — 12 Temmuz 2026' },
  { id: 'ai-check', label: 'AI içerik kontrolü', status: 'info', detail: 'Model v2.4', aiGenerated: true },
]
```

`rules.md`'ye kural ekle:

```markdown
- `label` tek bir kaynağın tek bir kontrolünü adlandırır. Farklı kurumların
  kontrolleri (EİDS ilan yetkisi, parsel kaydı eşleşmesi, imar belgesi
  kaynağı, platform moderasyonu, AI içerik kontrolü) **ayrı satır** olur;
  tek bir "doğrulandı" rozetinde birleştirilmez.
- Changelog: 2026-07-27 — EİDS ile tapu/parsel kontrolü ayrı sinyallere bölündü.
```

- [ ] **Step 6: Run the guard test and the full suite**

```bash
npx vitest run src/eids-copy.test.ts
npm test
```
Expected: guard PASS; mevcut `GlassTrustSignalPanel` testleri yeni label'larla PASS

- [ ] **Step 7: Commit**

```bash
git add src/eids-copy.test.ts src/pages/ArsaIlanDetay.tsx src/pages/AnaSayfa.tsx src/components/GlassTrustSignalPanel/
git commit -m "fix: EİDS doğrulama kapsamını repo genelinde düzelt ve guard testi ekle"
```

---

## Task 5: `GlassDataProvenance` shared component

Bir değerin kaynağını, tarihlerini, kapsamını, yöntemini, sınırlamalarını ve çelişkisini açan çekmece. Sayfadaki her kanıt satırının arkasında bu component durur.

**Files:**
- Create: `src/components/GlassDataProvenance/GlassDataProvenance.tsx`
- Create: `src/components/GlassDataProvenance/GlassDataProvenance.module.css`
- Create: `src/components/GlassDataProvenance/GlassDataProvenance.stories.tsx`
- Create: `src/components/GlassDataProvenance/GlassDataProvenance.test.tsx`
- Create: `src/components/GlassDataProvenance/rules.md`
- Create: `src/components/GlassDataProvenance/index.ts`
- Modify: `src/index.ts`, `src/demo/ComponentCatalog.tsx`

**Interfaces:**
- Consumes: —
- Produces:
  - `GlassProvenanceSourceClass = 'official' | 'verified_document' | 'advertiser_declared' | 'platform_derived' | 'model_estimate' | 'unknown'`
  - `GlassProvenanceFreshness = 'current' | 'aging' | 'stale' | 'unknown'`
  - `GlassProvenanceConflict { sourceLabel: string; value: string; effectiveAt?: string }`
  - `GlassDataProvenanceProps`
  - `GlassDataProvenance` — controlled deseni `open` + `defaultOpen` + `onOpenChange`

- [ ] **Step 1: Write the failing test**

`src/components/GlassDataProvenance/GlassDataProvenance.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GlassDataProvenance } from './GlassDataProvenance'

const BASE = {
  fieldLabel: 'Yüzölçümü',
  sourceLabel: 'TKGM MEGSİS',
  sourceClass: 'official' as const,
  retrievedAt: '24 Tem 2026',
  scopeLabel: 'parsel',
}

describe('GlassDataProvenance', () => {
  it('tetikleyici kaynak sınıfının görünür etiketini taşır', () => {
    render(<GlassDataProvenance {...BASE} />)
    expect(screen.getByRole('button', { name: /Resmî kayıttan/ })).toBeTruthy()
  })

  it('kapalıyken ayrıntı içeriği DOM içinde render edilmez', () => {
    render(<GlassDataProvenance {...BASE} method="Doğrudan kayıt sorgusu" />)
    expect(screen.queryByText('Doğrudan kayıt sorgusu')).toBeNull()
  })

  it('tıklayınca ayrıntıyı açar ve aria-expanded günceller', async () => {
    const user = userEvent.setup()
    render(<GlassDataProvenance {...BASE} method="Doğrudan kayıt sorgusu" />)
    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    await user.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Doğrudan kayıt sorgusu')).toBeTruthy()
  })

  it('controlled kullanımda kendi state\'ini değiştirmez', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<GlassDataProvenance {...BASE} open={false} onOpenChange={onOpenChange} method="Sorgu" />)
    await user.click(screen.getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false')
  })

  it('bayat kaynakta güncellik etiketi kaynak sınıfının yerine geçer', () => {
    render(<GlassDataProvenance {...BASE} freshness="stale" />)
    expect(screen.getByRole('button', { name: /Güncel değil/ })).toBeTruthy()
  })

  it('çelişkili değerde iki kaynağı ve iki tarihi birlikte gösterir', async () => {
    const user = userEvent.setup()
    render(
      <GlassDataProvenance
        {...BASE}
        conflicts={[{ sourceLabel: 'İlan sahibi beyanı', value: '4.850 m²', effectiveAt: '12 Nis 2026' }]}
        currentValueLabel="4.712 m²"
      />,
    )
    await user.click(screen.getByRole('button', { name: /Kaynaklar çelişiyor/ }))
    expect(screen.getByText('4.850 m²')).toBeTruthy()
    expect(screen.getByText('4.712 m²')).toBeTruthy()
    expect(screen.getByText(/12 Nis 2026/)).toBeTruthy()
  })

  it('sınırlamaları liste olarak gösterir', async () => {
    const user = userEvent.setup()
    render(<GlassDataProvenance {...BASE} limitations={['Parsel bazlı hüküm vermez.']} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Parsel bazlı hüküm vermez.')).toBeTruthy()
  })

  it('yalnız düz yüzey üretir — cam bütçesini tüketmez', () => {
    const { container } = render(<GlassDataProvenance {...BASE} />)
    expect(container.querySelectorAll('[data-material="glass"]').length).toBe(0)
  })

  it('erişilebilir adı alan adını içerir', () => {
    render(<GlassDataProvenance {...BASE} />)
    expect(screen.getByRole('button', { name: /Yüzölçümü/ })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/GlassDataProvenance`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Write the component**

`src/components/GlassDataProvenance/GlassDataProvenance.tsx`:

```tsx
import { useId, useState, type HTMLAttributes } from 'react'
import styles from './GlassDataProvenance.module.css'

export type GlassProvenanceSourceClass =
  | 'official'
  | 'verified_document'
  | 'advertiser_declared'
  | 'platform_derived'
  | 'model_estimate'
  | 'unknown'

export type GlassProvenanceFreshness = 'current' | 'aging' | 'stale' | 'unknown'

export interface GlassProvenanceConflict {
  /** Çelişen kaynağın görünür adı */
  sourceLabel: string
  /** Çelişen değerin biçimlenmiş hâli */
  value: string
  effectiveAt?: string
}

export interface GlassDataProvenanceProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Hangi alanın kaynağı — erişilebilir adın parçası olur */
  fieldLabel: string
  /** Sağlayıcının görünür adı ("TKGM MEGSİS") */
  sourceLabel: string
  sourceClass: GlassProvenanceSourceClass
  /** Sorgunun yapıldığı an (biçimlenmiş) */
  retrievedAt: string
  /** Verinin geçerli olduğu tarih */
  effectiveAt?: string
  validUntil?: string
  freshness?: GlassProvenanceFreshness
  /** "parsel", "bölgesel" gibi kapsam */
  scopeLabel?: string
  geographicResolution?: string
  method?: string
  methodVersion?: string
  /** Bilinen sınırlamalar — kullanıcıya olduğu gibi gösterilir */
  limitations?: string[]
  /** Çelişki varsa rozet metni bunu bildirir; iki değer birlikte açılır */
  conflicts?: GlassProvenanceConflict[]
  /** Çelişki gösteriminde bu alanın geçerli kabul edilen değeri */
  currentValueLabel?: string
  /** Kaynak bağlantısı (resmî sorgu sayfası) */
  sourceHref?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const SOURCE_CLASS_LABELS: Record<GlassProvenanceSourceClass, string> = {
  official: 'Resmî kayıttan',
  verified_document: 'Doğrulanmış belgeden',
  advertiser_declared: 'İlan sahibi beyanı',
  platform_derived: 'ArsaPazar hesabı',
  model_estimate: 'Model tahmini',
  unknown: 'Doğrulanamadı',
}

/**
 * Bir değerin kanıt künyesi. Rozet, kaynak sınıfını (veya çelişki/bayatlık
 * durumunu) taşır; açıldığında sağlayıcı, tarihler, kapsam, yöntem,
 * sınırlamalar ve varsa çelişen ikinci değer görünür.
 *
 * Yalnız düz yüzey üretir — içerik katmanındadır, cam bütçesini tüketmez.
 */
export function GlassDataProvenance({
  fieldLabel,
  sourceLabel,
  sourceClass,
  retrievedAt,
  effectiveAt,
  validUntil,
  freshness = 'current',
  scopeLabel,
  geographicResolution,
  method,
  methodVersion,
  limitations,
  conflicts,
  currentValueLabel,
  sourceHref,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...rest
}: GlassDataProvenanceProps) {
  const panelId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : uncontrolledOpen

  const hasConflict = (conflicts?.length ?? 0) > 0
  const badgeLabel = hasConflict
    ? 'Kaynaklar çelişiyor'
    : freshness === 'stale'
      ? 'Güncel değil'
      : SOURCE_CLASS_LABELS[sourceClass]

  const tone = hasConflict
    ? 'conflict'
    : freshness === 'stale'
      ? 'stale'
      : sourceClass === 'unknown'
        ? 'unknown'
        : sourceClass === 'official' || sourceClass === 'verified_document'
          ? 'official'
          : sourceClass === 'platform_derived' || sourceClass === 'model_estimate'
            ? 'derived'
            : 'declared'

  function toggle() {
    const next = !isOpen
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} {...rest}>
      <button
        type="button"
        className={styles.trigger}
        data-tone={tone}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className={styles.srOnly}>{fieldLabel} kaynağı: </span>
        {badgeLabel}
      </button>

      {isOpen ? (
        <div className={styles.panel} id={panelId}>
          <dl className={styles.grid}>
            <div>
              <dt>Sağlayıcı</dt>
              <dd>
                {sourceHref ? (
                  <a href={sourceHref} className={styles.link}>
                    {sourceLabel}
                  </a>
                ) : (
                  sourceLabel
                )}
              </dd>
            </div>
            <div>
              <dt>Sorgu</dt>
              <dd>{retrievedAt}</dd>
            </div>
            {effectiveAt ? (
              <div>
                <dt>Geçerlilik tarihi</dt>
                <dd>{effectiveAt}</dd>
              </div>
            ) : null}
            {validUntil ? (
              <div>
                <dt>Geçerli olduğu son tarih</dt>
                <dd>{validUntil}</dd>
              </div>
            ) : null}
            {scopeLabel ? (
              <div>
                <dt>Kapsam</dt>
                <dd>{scopeLabel}</dd>
              </div>
            ) : null}
            {geographicResolution ? (
              <div>
                <dt>Çözünürlük</dt>
                <dd>{geographicResolution}</dd>
              </div>
            ) : null}
            {method ? (
              <div>
                <dt>Yöntem</dt>
                <dd>{method}</dd>
              </div>
            ) : null}
            {methodVersion ? (
              <div>
                <dt>Sürüm</dt>
                <dd>{methodVersion}</dd>
              </div>
            ) : null}
          </dl>

          {hasConflict ? (
            <div className={styles.conflict}>
              <p className={styles.conflictTitle}>Bu alanda kaynaklar farklı değer veriyor</p>
              <ul className={styles.conflictList}>
                {currentValueLabel ? (
                  <li>
                    <b>{currentValueLabel}</b>
                    <span>
                      {sourceLabel} · {retrievedAt}
                    </span>
                  </li>
                ) : null}
                {conflicts?.map((conflict) => (
                  <li key={`${conflict.sourceLabel}-${conflict.value}`}>
                    <b>{conflict.value}</b>
                    <span>
                      {conflict.sourceLabel}
                      {conflict.effectiveAt ? ` · ${conflict.effectiveAt}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {limitations?.length ? (
            <ul className={styles.limitations}>
              {limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4: Write the CSS module**

`src/components/GlassDataProvenance/GlassDataProvenance.module.css` — yalnız token tüketir:

```css
.root {
  display: block;
}

.trigger {
  font: inherit;
  font-size: var(--lg-text-badge, 11px);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--lg-label-secondary);
  background: transparent;
  border: var(--lg-stroke-hairline, 1px) solid var(--lg-hairline);
  border-radius: var(--lg-radius-capsule, 999px);
  padding: var(--lg-space-1, 4px) var(--lg-space-3, 12px);
  min-height: var(--lg-control-sm, 32px);
  cursor: pointer;
}

.trigger:focus-visible {
  outline: var(--lg-focus-ring-width, 2px) solid var(--lg-accent);
  outline-offset: var(--lg-focus-ring-offset, 2px);
}

.trigger[data-tone='official'] { color: var(--lg-success); }
.trigger[data-tone='derived'] { color: var(--lg-accent); }
.trigger[data-tone='stale'] { color: var(--lg-warning); }
.trigger[data-tone='conflict'] { color: var(--lg-danger); }
.trigger[data-tone='unknown'],
.trigger[data-tone='declared'] { color: var(--lg-label-secondary); }

.panel {
  margin-top: var(--lg-space-2, 8px);
  padding: var(--lg-space-3, 12px) var(--lg-space-4, 16px);
  border-radius: var(--lg-radius-chip, 10px);
  border: var(--lg-stroke-hairline, 1px) solid var(--lg-hairline);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--lg-space-2, 8px) var(--lg-space-5, 20px);
  margin: 0;
}

.grid dt {
  font-size: var(--lg-text-badge, 11px);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lg-label-secondary);
}

.grid dd {
  margin: var(--lg-space-1, 4px) 0 0;
  font-size: var(--lg-text-footnote, 13px);
  font-variant-numeric: tabular-nums;
}

.link { color: var(--lg-accent); }

.conflict {
  margin-top: var(--lg-space-3, 12px);
  padding-top: var(--lg-space-3, 12px);
  border-top: var(--lg-stroke-hairline, 1px) solid var(--lg-hairline);
}

.conflictTitle {
  margin: 0;
  font-size: var(--lg-text-footnote, 13px);
  font-weight: 600;
  color: var(--lg-danger);
}

.conflictList {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--lg-space-2, 8px);
  margin: var(--lg-space-2, 8px) 0 0;
  padding: 0;
  list-style: none;
}

.conflictList li {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-1, 4px);
  font-size: var(--lg-text-footnote, 13px);
  font-variant-numeric: tabular-nums;
}

.conflictList span {
  font-size: var(--lg-text-caption, 12px);
  color: var(--lg-label-secondary);
}

.limitations {
  margin: var(--lg-space-3, 12px) 0 0;
  padding-left: var(--lg-space-5, 20px);
  font-size: var(--lg-text-caption, 12px);
  color: var(--lg-label-secondary);
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (pointer: coarse) {
  .trigger { min-height: var(--lg-control-md, 44px); }
}
```

- [ ] **Step 5: Write index, stories and rules**

`index.ts`:

```ts
export {
  GlassDataProvenance,
  type GlassDataProvenanceProps,
  type GlassProvenanceSourceClass,
  type GlassProvenanceFreshness,
  type GlassProvenanceConflict,
} from './GlassDataProvenance'
```

`GlassDataProvenance.stories.tsx` — `title: 'Bileşenler/Veri Gösterimi/GlassDataProvenance'`, `tags: ['autodocs']`. Zorunlu story matrisi: `Default`, `Playground`, `KaynakSiniflari` (altı sourceClass yan yana), `Cakisma` (conflicts + currentValueLabel), `BayatKaynak` (freshness="stale"), `UzunIcerik` (uzun sağlayıcı adı + üç sınırlama), `Responsive` (240px container), `Temalar` (Kağıt + Grafit), `Erisilebilirlik` (açık panel + focus sırası).

`rules.md` — `ComponentSablonu.mdx` şablonunun 12 bölümü. Zorunlu maddeler:
- §2: tetikleyici `button`, panel `aria-controls`/`aria-expanded` ile bağlı; panel kapalıyken DOM'da yok.
- §4: `open` + `defaultOpen` + `onOpenChange` controlled deseni.
- §6: rozet metni önceliği — çelişki → bayatlık → cevapsızlık → kaynak sınıfı.
- §8: "Doğrulandı" tek başına yasak; çelişki sessizce çözülmez, iki değer birlikte gösterilir.
- §9: yalnız `--lg-*`; raw değer borcu yok.
- §12: Changelog `2026-07-27 — ilk sürüm`.

- [ ] **Step 6: Export and catalogue**

`src/index.ts` — `GlassSpecTable` export'unun yanına:

```ts
export {
  GlassDataProvenance,
  type GlassDataProvenanceProps,
  type GlassProvenanceSourceClass,
  type GlassProvenanceFreshness,
  type GlassProvenanceConflict,
} from './components/GlassDataProvenance'
```

`src/demo/ComponentCatalog.tsx` — `ENTRIES` dizisine İçerik kategorisinde:

```tsx
  {
    name: 'Data Provenance',
    description: 'Bir değerin kaynağı, sorgu tarihi, kapsamı, yöntemi ve çelişkisi — açılır kanıt künyesi.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/bilesenler-veri-gosterimi-glassdataprovenance--default',
  },
```

- [ ] **Step 7: Run tests, typecheck, lint and commit**

```bash
npx vitest run src/components/GlassDataProvenance
npx tsc -b
npm run lint
git add src/components/GlassDataProvenance src/index.ts src/demo/ComponentCatalog.tsx
git commit -m "feat(ui): GlassDataProvenance kanıt künyesi component'ini ekle"
```

---

## Task 6: `GlassListingDetailHeader` shared component

`GlassPriceHeader` üretim sayfasında kullanılmaz (sabit `h2`, string meta, efektif cam varsayılanı). Yerine semantik `h1`, yapılandırılmış meta ve flat varsayılanı olan bu component gelir.

**Files:**
- Create: `src/components/GlassListingDetailHeader/` (tsx, module.css, stories, test, rules, index)
- Modify: `src/index.ts`, `src/demo/ComponentCatalog.tsx`

**Interfaces:**
- Consumes: —
- Produces:
  - `GlassListingMetaItem { id: string; label: string; value: string }`
  - `GlassListingDetailHeaderProps { title, headingLevel?: 1 | 2 | 3, price, priceUnit?, priceNote?, meta?, status?, badges?, utilities?, material?, tone? }`
  - `GlassListingDetailHeader`

- [ ] **Step 1: Write the failing test**

`src/components/GlassListingDetailHeader/GlassListingDetailHeader.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlassListingDetailHeader } from './GlassListingDetailHeader'

const BASE = {
  title: "Ören'de 4.850 m² tarla",
  price: '8.750.000 ₺',
  priceUnit: '1.804 ₺/m²',
}

describe('GlassListingDetailHeader', () => {
  it('varsayılan olarak h1 render eder', () => {
    render(<GlassListingDetailHeader {...BASE} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain("Ören'de")
  })

  it('headingLevel ile başlık seviyesi ayarlanabilir', () => {
    render(<GlassListingDetailHeader {...BASE} headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy()
  })

  it('meta öğelerini etiket/değer çifti olarak dl içinde verir', () => {
    render(
      <GlassListingDetailHeader
        {...BASE}
        meta={[
          { id: 'no', label: 'İlan no', value: '2026-114-8207' },
          { id: 'updated', label: 'Güncelleme', value: '21 Tem 2026' },
        ]}
      />,
    )
    expect(screen.getByText('İlan no').tagName).toBe('DT')
    expect(screen.getByText('2026-114-8207').tagName).toBe('DD')
  })

  it('varsayılan malzeme flat — cam bütçesini tüketmez', () => {
    const { container } = render(<GlassListingDetailHeader {...BASE} />)
    expect(container.querySelectorAll('[data-material="glass"]').length).toBe(0)
  })

  it('fiyatı ve birim fiyatı ayrı okunabilir metinler olarak verir', () => {
    render(<GlassListingDetailHeader {...BASE} priceNote="4.850 m² beyan" />)
    expect(screen.getByText('8.750.000 ₺')).toBeTruthy()
    expect(screen.getByText('1.804 ₺/m²')).toBeTruthy()
    expect(screen.getByText('4.850 m² beyan')).toBeTruthy()
  })

  it('utilities slotunu başlık bölgesinde render eder', () => {
    render(<GlassListingDetailHeader {...BASE} utilities={<button type="button">Kaydet</button>} />)
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeTruthy()
  })

  it('durum metnini yalnız renkle değil metinle taşır', () => {
    render(<GlassListingDetailHeader {...BASE} status={{ label: 'Aktif ilan', tone: 'success' }} />)
    expect(screen.getByText('Aktif ilan')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/GlassListingDetailHeader`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Write the component**

`src/components/GlassListingDetailHeader/GlassListingDetailHeader.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassListingDetailHeader.module.css'

export interface GlassListingMetaItem {
  id: string
  label: string
  value: string
}

export interface GlassListingDetailHeaderProps extends HTMLAttributes<HTMLElement> {
  /** İlanın tek görünür başlığı */
  title: string
  /** Sayfada tek h1 kuralı için ayarlanabilir; varsayılan 1 */
  headingLevel?: 1 | 2 | 3
  /** Biçimlenmiş para değeri — component biçimlendirme yapmaz */
  price: string
  /** Birim fiyat, ör. "1.804 ₺/m²" */
  priceUnit?: string
  /** Fiyatın altında küçük açıklama (alan kaynağı, çelişki notu) */
  priceNote?: string
  meta?: GlassListingMetaItem[]
  /** İlan durumu — metinle taşınır, yalnız renkle değil */
  status?: { label: string; tone?: 'success' | 'warning' | 'danger' | 'neutral' }
  /** Rozet slotu (doğrulama özeti gibi) */
  badges?: ReactNode
  /** Kaydet/paylaş gibi utility kontroller */
  utilities?: ReactNode
  /** Varsayılan flat — başlık içerik katmanındadır */
  material?: 'glass' | 'flat'
  tone?: 'light' | 'dark' | 'auto'
}

/**
 * İlan detay sayfasının başlık bloğu: tek `h1`, yapılandırılmış meta ve
 * para semantiği. Fiyat biçimlendirmesi çağırana aittir; component yalnız
 * hiyerarşiyi ve hizayı kurar.
 */
export function GlassListingDetailHeader({
  title,
  headingLevel = 1,
  price,
  priceUnit,
  priceNote,
  meta,
  status,
  badges,
  utilities,
  material = 'flat',
  tone = 'auto',
  className,
  ...rest
}: GlassListingDetailHeaderProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3'

  return (
    <GlassSurface
      as="header"
      material={material}
      tone={tone}
      shape={20}
      thickness={0.4}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className={styles.head}>
        <div className={styles.titleBlock}>
          <Heading className={styles.title}>{title}</Heading>
          {status ? (
            <p className={styles.status} data-tone={status.tone ?? 'neutral'}>
              {status.label}
            </p>
          ) : null}
          {meta?.length ? (
            <dl className={styles.meta}>
              {meta.map((item) => (
                <div key={item.id} className={styles.metaItem}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className={styles.priceBlock}>
          <p className={styles.price}>{price}</p>
          {priceUnit ? <p className={styles.priceUnit}>{priceUnit}</p> : null}
          {priceNote ? <p className={styles.priceNote}>{priceNote}</p> : null}
        </div>
      </div>

      {badges ? <div className={styles.badges}>{badges}</div> : null}
      {utilities ? <div className={styles.utilities}>{utilities}</div> : null}
    </GlassSurface>
  )
}
```

- [ ] **Step 4: Write the CSS module**

`GlassListingDetailHeader.module.css` — grid iki kolon (başlık / fiyat), dar container'da tek kolona düşer; `.title` `font-size: var(--lg-text-display, 28px)`, `font-weight: 700`, `text-wrap: balance`; `.price` `font-variant-numeric: tabular-nums`; `.status[data-tone='success']` → `color: var(--lg-success)`; `.meta` `display: flex; flex-wrap: wrap; gap: var(--lg-space-1) var(--lg-space-4)` ve `.metaItem` `display: flex; gap: var(--lg-space-1)`; `dt` `color: var(--lg-label-secondary)`. Container query: `@container (max-width: 640px) { .head { grid-template-columns: 1fr } }` — kök öğeye `container-type: inline-size`.

- [ ] **Step 5: Stories, rules, index, export, catalogue**

`title: 'Bileşenler/Pazar Yeri/GlassListingDetailHeader'`, `tags: ['autodocs']`. Story matrisi: `Default`, `Playground`, `Materials` (flat/glass), `Sizes` (headingLevel 1-2-3), `States` (status tone'ları), `UzunIcerik` (uzun TR başlık + 6 meta), `Responsive` (360px container), `Temalar`, `Erisilebilirlik` (h1 + utilities focus sırası).

`rules.md` zorunlu maddeleri: §2 tek `h1` sözleşmesi ve `headingLevel` gerekçesi; §4 `material` varsayılanı `flat`; §8 fiyat biçimlendirmesi çağırana aittir, component `Intl` çağırmaz; §12 Changelog. `src/index.ts` export + katalog kaydı (`Pazar Yeri` açıklaması: "İlan detayının başlık bloğu — tek h1, yapılandırılmış meta ve para semantiği.").

- [ ] **Step 6: Run tests, typecheck, lint, commit**

```bash
npx vitest run src/components/GlassListingDetailHeader
npx tsc -b && npm run lint
git add src/components/GlassListingDetailHeader src/index.ts src/demo/ComponentCatalog.tsx
git commit -m "feat(ui): GlassListingDetailHeader component'ini ekle"
```

---

## Task 7: `GlassDetailActionBar` shared component

Tek prominent CTA + secondary + utility'leri **tek cam yüzeyde** toplar; çocuk kontroller yeni yüzey üretmez (cam üstüne cam yasağı).

**Files:**
- Create: `src/components/GlassDetailActionBar/` (tsx, module.css, stories, test, rules, index)
- Modify: `src/index.ts`, `src/demo/ComponentCatalog.tsx`

**Interfaces:**
- Consumes: —
- Produces:
  - `GlassDetailAction { id: string; label: string; onSelect: () => void; disabled?: boolean }`
  - `GlassDetailUtilityAction extends GlassDetailAction { pressed?: boolean }`
  - `GlassDetailActionBarProps { primary, secondary?, utilities?, note?, layout?: 'rail' | 'bar', label, material?: 'glass' | 'flat' }`
  - `GlassDetailActionBar`

- [ ] **Step 1: Write the failing test**

`src/components/GlassDetailActionBar/GlassDetailActionBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GlassDetailActionBar } from './GlassDetailActionBar'

const PRIMARY = { id: 'message', label: 'Mesaj gönder', onSelect: () => {} }

describe('GlassDetailActionBar', () => {
  it('grup olarak adlandırılır', () => {
    render(<GlassDetailActionBar label="Karar ve iletişim" primary={PRIMARY} />)
    expect(screen.getByRole('group', { name: 'Karar ve iletişim' })).toBeTruthy()
  })

  it('yalnız tek cam yüzey üretir — çocuk kontroller yüzey açmaz', () => {
    const { container } = render(
      <GlassDetailActionBar
        label="Karar ve iletişim"
        primary={PRIMARY}
        secondary={{ id: 'tour', label: 'Randevu iste', onSelect: () => {} }}
        utilities={[
          { id: 'save', label: 'Kaydet', onSelect: () => {} },
          { id: 'share', label: 'Paylaş', onSelect: () => {} },
        ]}
      />,
    )
    expect(container.querySelectorAll('[data-material="glass"]').length).toBe(1)
  })

  it('primary eylemi tıklandığında çağırır', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<GlassDetailActionBar label="Karar" primary={{ ...PRIMARY, onSelect }} />)
    await user.click(screen.getByRole('button', { name: 'Mesaj gönder' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('utility eyleminde aria-pressed durumunu yansıtır', () => {
    render(
      <GlassDetailActionBar
        label="Karar"
        primary={PRIMARY}
        utilities={[{ id: 'save', label: 'Kaydet', onSelect: () => {}, pressed: true }]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Kaydet' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('devre dışı eylem tıklanamaz', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <GlassDetailActionBar
        label="Karar"
        primary={{ id: 'message', label: 'Mesaj gönder', onSelect, disabled: true }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Mesaj gönder' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('not metnini eylemlerin altında gösterir', () => {
    render(<GlassDetailActionBar label="Karar" primary={PRIMARY} note="Ören Emlak · yanıt ~4 saat" />)
    expect(screen.getByText('Ören Emlak · yanıt ~4 saat')).toBeTruthy()
  })

  it('bar düzeninde safe-area sınıfını uygular', () => {
    const { container } = render(<GlassDetailActionBar label="Karar" primary={PRIMARY} layout="bar" />)
    expect(container.firstElementChild?.getAttribute('data-layout')).toBe('bar')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/GlassDetailActionBar`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Write the component**

```tsx
import type { HTMLAttributes } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassDetailActionBar.module.css'

export interface GlassDetailAction {
  id: string
  label: string
  onSelect: () => void
  disabled?: boolean
}

export interface GlassDetailUtilityAction extends GlassDetailAction {
  /** Toggle davranışı olan utility'ler için (kaydet) */
  pressed?: boolean
}

export interface GlassDetailActionBarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Grubun erişilebilir adı — zorunlu */
  label: string
  /** Sayfadaki tek prominent CTA */
  primary: GlassDetailAction
  secondary?: GlassDetailAction
  utilities?: GlassDetailUtilityAction[]
  /** Eylemlerin altında küçük bağlam notu */
  note?: string
  /** `rail`: desktop dikey ray · `bar`: mobil alt çubuk (safe-area) */
  layout?: 'rail' | 'bar'
  material?: 'glass' | 'flat'
}

/**
 * İlan detayının karar/iletişim eylem grubu.
 *
 * Cam üstüne cam yasağı gereği yüzeyi yalnız bu component açar; içindeki
 * butonlar `GlassButton`/`GlassIconButton` değil, yüzey üretmeyen düz
 * kontrollerdir.
 */
export function GlassDetailActionBar({
  label,
  primary,
  secondary,
  utilities,
  note,
  layout = 'rail',
  material = 'glass',
  className,
  ...rest
}: GlassDetailActionBarProps) {
  return (
    <GlassSurface
      as="section"
      role="group"
      aria-label={label}
      material={material}
      shape={20}
      thickness={0.5}
      data-layout={layout}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <button
        type="button"
        className={styles.primary}
        onClick={primary.onSelect}
        disabled={primary.disabled}
      >
        {primary.label}
      </button>

      {secondary ? (
        <button
          type="button"
          className={styles.secondary}
          onClick={secondary.onSelect}
          disabled={secondary.disabled}
        >
          {secondary.label}
        </button>
      ) : null}

      {utilities?.length ? (
        <div className={styles.utilities}>
          {utilities.map((utility) => (
            <button
              key={utility.id}
              type="button"
              className={styles.utility}
              onClick={utility.onSelect}
              disabled={utility.disabled}
              aria-pressed={utility.pressed}
            >
              {utility.label}
            </button>
          ))}
        </div>
      ) : null}

      {note ? <p className={styles.note}>{note}</p> : null}
    </GlassSurface>
  )
}
```

- [ ] **Step 4: Write the CSS module**

`GlassDetailActionBar.module.css`: kök `display: flex; flex-direction: column; gap: var(--lg-space-2, 8px); padding: var(--lg-space-3, 12px)`. `.primary` — `background: var(--lg-accent); color: var(--lg-accent-contrast); border: 0; border-radius: var(--lg-radius-chip, 10px); min-height: var(--lg-control-lg, 48px); font-weight: 600`. `.secondary` — `background: transparent; border: var(--lg-stroke-hairline, 1px) solid var(--lg-hairline); min-height: var(--lg-control-md, 40px)`. `.utilities` — `display: flex; gap: var(--lg-space-2, 8px)`, çocukları `flex: 1`. `[data-layout='bar']` — `flex-direction: row; align-items: center; padding-bottom: calc(var(--lg-space-3, 12px) + env(safe-area-inset-bottom))` ve `.note { display: none }`. `:focus-visible` halkası tüm butonlarda. `@media (pointer: coarse) { .utility { min-height: var(--lg-control-md, 44px) } }`.

- [ ] **Step 5: Stories, rules, index, export, catalogue**

`title: 'Bileşenler/Eylemler/GlassDetailActionBar'`. Story matrisi: `Default`, `Playground`, `Layouts` (rail/bar), `Materials` (glass/flat), `States` (disabled primary, pressed utility), `UzunIcerik` (uzun CTA metinleri), `Responsive` (dar container + coarse pointer), `Temalar`, `Erisilebilirlik` (grup adı + tab sırası).

`rules.md` zorunlu maddeleri: §2 `role="group"` + zorunlu `label`; §4 tek `primary`, en fazla bir `secondary`; §5 yasak kombinasyon — aynı sayfada `rail` ve `bar` aynı anda görünür olamaz; §6 `pressed` yalnız utility'lerde; §9 tüm ölçüler `--lg-control-*`; §12 Changelog.

- [ ] **Step 6: Run tests, typecheck, lint, commit**

```bash
npx vitest run src/components/GlassDetailActionBar
npx tsc -b && npm run lint
git add src/components/GlassDetailActionBar src/index.ts src/demo/ComponentCatalog.tsx
git commit -m "feat(ui): GlassDetailActionBar eylem grubunu ekle"
```

---

## Task 8: `/ilan/$listingId` rotası ve SSR kabuğu

**Files:**
- Create: `apps/web/src/routes/ilan.$listingId.tsx`
- Modify: `apps/web/vite.config.ts:44-46` (prerender filtresi)
- Test: `apps/web/src/routes/ilan.listingId.test.tsx`

**Interfaces:**
- Consumes: `loadListingDetail`, `listingDetailQueryOptions` (Task 3), `ListingDetailWorkspace` (Task 9 — bu task'ta minimal iskelet olarak oluşturulur ve Task 9'da doldurulur)
- Produces: `Route` (TanStack file route), `parseListingDetailSearch(raw): { senaryo?: ListingDetailScenario }`

- [ ] **Step 1: Write the failing test**

`apps/web/src/routes/ilan.listingId.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { parseListingDetailSearch } from './ilan.$listingId'

describe('parseListingDetailSearch', () => {
  it('geçerli senaryoyu korur', () => {
    expect(parseListingDetailSearch({ senaryo: 'stale-planning' })).toEqual({ senaryo: 'stale-planning' })
  })

  it('bilinmeyen senaryoyu sessizce düşürür', () => {
    expect(parseListingDetailSearch({ senaryo: 'uydurma' })).toEqual({})
  })

  it('senaryo verilmediğinde boş arama döner', () => {
    expect(parseListingDetailSearch({})).toEqual({})
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/web/src/routes/ilan.listingId.test.tsx`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Write the route**

`apps/web/src/routes/ilan.$listingId.tsx`:

```tsx
/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { createFileRoute, notFound } from '@tanstack/react-router'
import { ListingDetailWorkspace } from '@/features/listing-detail'
import {
  loadListingDetail,
  type ListingDetailScenario,
} from '@/features/listing-detail/data/listing-detail-adapter'

const SCENARIOS: ListingDetailScenario[] = [
  'default',
  'stale-planning',
  'ai-unavailable',
  'map-unavailable',
  'inactive',
  'not-found',
]

/** Storybook/QA senaryolarını URL'den seçilebilir kılar; bilinmeyeni düşürür. */
export function parseListingDetailSearch(raw: Record<string, unknown>): {
  senaryo?: ListingDetailScenario
} {
  const value = raw.senaryo
  if (typeof value === 'string' && (SCENARIOS as string[]).includes(value)) {
    return { senaryo: value as ListingDetailScenario }
  }
  return {}
}

/**
 * Kanıt kesiti loader'da sabitlenir: aynı istek içinde tüm bölümler aynı
 * "şimdi" değerini kullanır, SSR ve hydration çıktıları ayrışmaz.
 */
export const Route = createFileRoute('/ilan/$listingId')({
  validateSearch: parseListingDetailSearch,
  loaderDeps: ({ search }) => ({ senaryo: search.senaryo }),
  loader: async ({ params, deps }) => {
    const result = await loadListingDetail({
      listingId: params.listingId,
      scenario: deps.senaryo,
      now: new Date().toISOString(),
    })
    if (!result) throw notFound()
    return result
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.detail.title} · ArsaPazar` },
          {
            name: 'description',
            content: `${loaderData.detail.location.neighbourhood}, ${loaderData.detail.location.district} · ${loaderData.detail.listingNumber} numaralı ilanın kaynaklı detayları.`,
          },
        ]
      : [{ title: 'İlan bulunamadı · ArsaPazar' }],
  }),
  component: ListingDetailRoutePage,
  notFoundComponent: ListingNotFound,
})

function ListingDetailRoutePage() {
  const result = Route.useLoaderData()
  return <ListingDetailWorkspace result={result} />
}

function ListingNotFound() {
  return (
    <main>
      <h1>Bu ilan bulunamadı</h1>
      <p>
        İlan kaldırılmış veya adres yanlış olabilir. Benzer ilanlara arama sayfasından
        ulaşabilirsiniz.
      </p>
      <a href="/emlak">Arsa ilanlarına dön</a>
    </main>
  )
}
```

- [ ] **Step 4: Update the prerender filter**

`apps/web/vite.config.ts` — yorumdan `/ilan/:id` istisnasını kaldır ve filtreyi güncelle:

```ts
      prerender: {
        enabled: staticBuild,
        crawlLinks: true,
        failOnError: false,
        // `/health` sunucu handler'ı ve query varyantları HTML gerektirmez.
        filter: ({ path: pagePath }) =>
          !pagePath.includes('?') && !pagePath.endsWith('/health'),
      },
```

- [ ] **Step 5: Create the workspace skeleton so the route compiles**

`apps/web/src/features/listing-detail/index.ts`:

```ts
export { ListingDetailWorkspace } from './ListingDetailWorkspace'
export type { ListingDetailWorkspaceProps } from './ListingDetailWorkspace'
```

`apps/web/src/features/listing-detail/ListingDetailWorkspace.tsx` — Task 9'da doldurulacak minimal iskelet:

```tsx
import type { ListingDetailResult } from './data/listing-detail-adapter'

export interface ListingDetailWorkspaceProps {
  result: ListingDetailResult
}

export function ListingDetailWorkspace({ result }: ListingDetailWorkspaceProps) {
  return (
    <main>
      <h1>{result.detail.title}</h1>
    </main>
  )
}
```

- [ ] **Step 6: Run tests, typecheck, build check, commit**

```bash
npx vitest run apps/web/src/routes/ilan.listingId.test.tsx
npm run typecheck:web
git add apps/web/src/routes/ilan.\$listingId.tsx apps/web/src/routes/ilan.listingId.test.tsx apps/web/vite.config.ts apps/web/src/features/listing-detail/
git commit -m "feat(web): /ilan/\$listingId rotasını ve SSR kabuğunu ekle"
```

---

## Task 9: `ListingDetailWorkspace` — Yön A yerleşimi ve cam bütçesi

**Files:**
- Modify: `apps/web/src/features/listing-detail/ListingDetailWorkspace.tsx`
- Create: `apps/web/src/features/listing-detail/ListingDetailWorkspace.module.css`
- Create: `apps/web/src/features/listing-detail/components/ListingIntro.tsx`
- Create: `apps/web/src/features/listing-detail/components/ListingSectionIndex.tsx`
- Create: `apps/web/src/features/listing-detail/components/ListingDecisionRail.tsx`
- Test: `apps/web/src/features/listing-detail/ListingDetailWorkspace.test.tsx`

**Interfaces:**
- Consumes: `ListingDetailResult` (Task 3), `criticalIssues`/`metricStripItems`/`verificationScore` (Task 2), `GlassListingDetailHeader` (Task 6), `GlassDetailActionBar` (Task 7), `GlassMetricStrip`, `GlassBreadcrumb`, `GlassMediaGallery`, `GlassAlert`
- Produces: `ListingDetailWorkspace`, `LISTING_SECTIONS: Array<{ id: string; label: string }>`

- [ ] **Step 1: Write the failing test**

`apps/web/src/features/listing-detail/ListingDetailWorkspace.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListingDetailWorkspace } from './ListingDetailWorkspace'
import { loadListingDetail } from './data/listing-detail-adapter'

const NOW = '2026-07-27T09:00:00.000Z'

async function renderWorkspace(scenario?: Parameters<typeof loadListingDetail>[0]['scenario']) {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario, now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return render(<ListingDetailWorkspace result={result} />)
}

describe('ListingDetailWorkspace', () => {
  it('sayfada tek h1 bulunur', async () => {
    await renderWorkspace()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('aynı anda en fazla altı cam yüzey render eder', async () => {
    const { container } = await renderWorkspace()
    expect(container.querySelectorAll('[data-material="glass"]').length).toBeLessThanOrEqual(6)
  })

  it('EİDS satırını kapsam notuyla birlikte gösterir', async () => {
    await renderWorkspace()
    expect(screen.getByText('İlan verme yetkisi EİDS ile doğrulandı')).toBeTruthy()
    expect(
      screen.getByText(
        'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.',
      ),
    ).toBeTruthy()
  })

  it('kritik eksikleri ilk görünümde, accordion arkasına saklamadan listeler', async () => {
    await renderWorkspace()
    const critical = screen.getByRole('region', { name: /Görüşmeden önce/ })
    expect(within(critical).getByText(/hisseli/i)).toBeTruthy()
    expect(within(critical).getByText(/Yasal yol erişimi/i)).toBeTruthy()
    expect(within(critical).getByText(/çelişki/i)).toBeTruthy()
  })

  it('bölüm indeksi yedi bölümü sırayla bağlar', async () => {
    await renderWorkspace()
    const nav = screen.getByRole('navigation', { name: 'Bölümler' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Özet',
      'Parsel',
      'İmar ve Hukuk',
      'Altyapı ve Erişim',
      'Arazi ve Tehlike',
      'Piyasa',
      'Belgeler',
    ])
  })

  it('karar rayında tek prominent CTA bulunur', async () => {
    await renderWorkspace()
    const rail = screen.getByRole('group', { name: 'Karar ve iletişim' })
    expect(within(rail).getByRole('button', { name: 'Mesaj gönder' })).toBeTruthy()
  })

  it('süresi dolmuş ilanda iletişim eylemleri kapanır ve gerekçe görünür', async () => {
    await renderWorkspace('inactive')
    expect(screen.getByText(/İlan süresi doldu/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Mesaj gönder' })).toHaveProperty('disabled', true)
  })

  it('harita kullanılamadığında konum bilgisi tablo olarak kalır', async () => {
    await renderWorkspace('map-unavailable')
    expect(screen.getByText(/Harita servisine ulaşılamadı/)).toBeTruthy()
    expect(screen.getByText('214 ada / 7 parsel')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/web/src/features/listing-detail/ListingDetailWorkspace.test.tsx`
Expected: FAIL — `Unable to find role="navigation"` (iskelet yalnız h1 render ediyor)

- [ ] **Step 3: Write the section index**

`components/ListingSectionIndex.tsx` — cam yüzey #3:

```tsx
import { GlassSurface } from '@repo/ui'
import styles from '../ListingDetailWorkspace.module.css'

export const LISTING_SECTIONS = [
  { id: 'ozet', label: 'Özet' },
  { id: 'parsel', label: 'Parsel' },
  { id: 'imar', label: 'İmar ve Hukuk' },
  { id: 'altyapi', label: 'Altyapı ve Erişim' },
  { id: 'arazi', label: 'Arazi ve Tehlike' },
  { id: 'piyasa', label: 'Piyasa' },
  { id: 'belgeler', label: 'Belgeler' },
] as const

/** Sticky bölüm indeksi — sayfa düzeyinde tab değildir, bölümler DOM'da kalır. */
export function ListingSectionIndex() {
  return (
    <GlassSurface as="nav" aria-label="Bölümler" shape={999} thickness={0.4} className={styles.sectionIndex}>
      {LISTING_SECTIONS.map((section) => (
        <a key={section.id} href={`#${section.id}`} className={styles.sectionLink}>
          {section.label}
        </a>
      ))}
    </GlassSurface>
  )
}
```

- [ ] **Step 4: Write the intro block**

`components/ListingIntro.tsx` — medya sahnesi (cam #2 medya kontrolü `GlassMediaGallery` içinde) + karar özeti kolonu: fiyat, doğrulama vektörü listesi (`dl` değil `ul` — her satır başlık + kapsam notu + kaynak), kritik eksikler `section` `aria-label="Görüşmeden önce çözülmesi gerekenler"`. Kritik eksik listesi `criticalIssues(detail)` çıktısından kurulur; her madde `title` + `detail` + varsa `action` butonu.

Doğrulama vektörü satırı işaretleri metinle taşınır:

```tsx
const STATE_LABEL: Record<VerificationRow['state'], string> = {
  positive: 'Doğrulandı',
  negative: 'Çelişkili',
  unknown: 'Eksik',
}
```

`STATE_LABEL.positive` yalnız satır başlığıyla birlikte okunur (`title` cümlesi neyin doğrulandığını söyler), tek başına rozet olarak kullanılmaz.

- [ ] **Step 5: Write the decision rail**

`components/ListingDecisionRail.tsx` — `GlassDetailActionBar` (cam #4) `layout="rail"`, `label="Karar ve iletişim"`; `lifecycle !== 'active'` iken `primary.disabled` ve `secondary.disabled` true, üstünde `GlassAlert severity="warning"` ile gerekçe (`İlan süresi doldu — iletişim kapalı.`). Rail altında satıcı özeti (ad, TTBS, yanıt süresi) düz metin.

- [ ] **Step 6: Compose the workspace**

`ListingDetailWorkspace.tsx` — Yön A yerleşimi:

```tsx
export function ListingDetailWorkspace({ result }: ListingDetailWorkspaceProps) {
  const { detail, sections, aiBrief } = result

  return (
    <main className={styles.shell}>
      <GlassBreadcrumb items={breadcrumbItems(detail)} className={styles.crumbs} />

      <GlassListingDetailHeader
        title={detail.title}
        price={formatPrice(detail.price.amount)}
        priceUnit={`${formatNumber(detail.price.unitPrice)} ₺/m²`}
        priceNote={priceNote(detail)}
        status={lifecycleStatus(detail.lifecycle)}
        meta={headerMeta(detail)}
        utilities={<ListingUtilities />}
      />

      <ListingIntro detail={detail} mapSection={sections.map} />
      <ListingSectionIndex />

      <div className={styles.body}>
        <div className={styles.flow}>
          <ListingEvidenceBrief brief={aiBrief} detail={detail} />
          <GlassMetricStrip items={metricStripItems(detail)} label="Temel göstergeler" />
          <ParcelSection detail={detail} mapSection={sections.map} />
          <PlanningAndLegalSection detail={detail} />
          <InfrastructureSection detail={detail} />
          <HazardSection detail={detail} />
          <MarketSection detail={detail} />
          <DocumentsSection detail={detail} />
        </div>
        <ListingDecisionRail detail={detail} />
      </div>

      <SellerSection detail={detail} />
    </main>
  )
}
```

`ListingDetailWorkspace.module.css`: `.body { display: grid; grid-template-columns: minmax(0, 1.62fr) minmax(280px, 1fr); gap: var(--lg-space-7, 32px) }`, `container-type: inline-size` + `@container (max-width: 900px) { .body { grid-template-columns: 1fr } }`. `.sectionIndex { position: sticky; top: var(--lg-space-6, 24px); display: flex; gap: var(--lg-space-1, 4px); overflow-x: auto }`. Rail `position: sticky; top: calc(var(--lg-space-7, 32px) * 2); align-self: start`.

Task 9'da `MarketSection`, `DocumentsSection`, `SellerSection`, `ListingEvidenceBrief`, `ParcelSection`, `PlanningAndLegalSection`, `InfrastructureSection`, `HazardSection` yalnız `<section id="..."><h2>…</h2></section>` iskeleti olarak oluşturulur; içerikleri Task 10-12'de doldurulur. Bölüm başlıkları `LISTING_SECTIONS` etiketleriyle birebir aynıdır.

- [ ] **Step 7: Run tests, typecheck, commit**

```bash
npx vitest run apps/web/src/features/listing-detail/
npm run typecheck:web && npm run lint
git add apps/web/src/features/listing-detail/
git commit -m "feat(listing-detail): Yön A yerleşimini ve cam bütçesi testini kur"
```

---

## Task 10: Kanıt bölümleri ve `EvidenceRow`

**Files:**
- Create: `apps/web/src/features/listing-detail/components/EvidenceRow.tsx`
- Create: `apps/web/src/features/listing-detail/components/EvidenceRow.module.css`
- Modify: `components/ParcelSection.tsx`, `components/PlanningAndLegalSection.tsx`, `components/InfrastructureSection.tsx`, `components/HazardSection.tsx`, `components/MarketSection.tsx`, `components/DocumentsSection.tsx`
- Test: `apps/web/src/features/listing-detail/components/EvidenceSections.test.tsx`

**Interfaces:**
- Consumes: `EvidenceValue`, `evidenceStatusLabel`, `isAnswered`, `hasConflict` (Task 1), `GlassDataProvenance` (Task 5), `GlassTable`
- Produces: `EvidenceRow({ label, value, formatValue?, fallbackText?, limitationsOverride? })`, `formatEvidenceDate(iso: string): string`

- [ ] **Step 1: Write the failing test**

`components/EvidenceSections.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { loadListingDetail } from '../data/listing-detail-adapter'
import { PlanningAndLegalSection } from './PlanningAndLegalSection'
import { InfrastructureSection } from './InfrastructureSection'
import { HazardSection } from './HazardSection'
import { MarketSection } from './MarketSection'

const NOW = '2026-07-27T09:00:00.000Z'

async function detail() {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return result.detail
}

describe('kanıt bölümleri', () => {
  it('her kanıt satırı bir kaynak künyesi taşır', async () => {
    render(<PlanningAndLegalSection detail={await detail()} />)
    const section = screen.getByRole('region', { name: 'İmar ve Hukuk' })
    const badges = within(section).getAllByRole('button', { expanded: false })
    expect(badges.length).toBeGreaterThanOrEqual(4)
  })

  it('bayat plan notu "Güncel değil" etiketiyle görünür', async () => {
    render(<PlanningAndLegalSection detail={await detail()} />)
    expect(screen.getByRole('button', { name: /Güncel değil/ })).toBeTruthy()
  })

  it('takyidat bilgisi yoksa "bulunmadığı anlamına gelmez" uyarısı gösterilir', async () => {
    const user = userEvent.setup()
    render(<PlanningAndLegalSection detail={await detail()} />)
    await user.click(screen.getByRole('button', { name: /Takyidat kaynağı/ }))
    expect(screen.getByText(/bulunmadığı anlamına gelmez/i)).toBeTruthy()
  })

  it('yasal ve fiziksel erişimi ayrı satırlarda gösterir', async () => {
    render(<InfrastructureSection detail={await detail()} />)
    expect(screen.getByText('Yasal yol erişimi')).toBeTruthy()
    expect(screen.getByText('Fiziksel ulaşım')).toBeTruthy()
    expect(screen.getByText(/Yola yakınlık yasal erişim hakkı değildir/)).toBeTruthy()
  })

  it('tehlike göstergeleri risk hükmü içermez ve kapsam notu taşır', async () => {
    render(<HazardSection detail={await detail()} />)
    expect(screen.getByText('Bölgesel deprem tehlike göstergesi')).toBeTruthy()
    expect(screen.getByText(/Tehlike risk değildir/)).toBeTruthy()
    expect(screen.queryByText(/güvenli parsel/i)).toBeNull()
  })

  it('yayımlanmamış katman "tehlike yok" gibi sunulmaz', async () => {
    render(<HazardSection detail={await detail()} />)
    expect(screen.getByText(/taşkın tehlikesi olmadığı anlamına gelmez/i)).toBeTruthy()
  })

  it('değerleme çekindiğinde aralık yerine gerekçe gösterilir', async () => {
    render(<MarketSection detail={await detail()} />)
    expect(screen.getByText('ArsaPazar fiyat tahmini üretilmedi')).toBeTruthy()
    expect(screen.getByText(/gerçekleşmiş işlem verisi yok/)).toBeTruthy()
    expect(screen.queryByText(/ekspertiz/i)).toBeNull()
  })

  it('emsal tablosu gerçek table semantiği kullanır', async () => {
    render(<MarketSection detail={await detail()} />)
    expect(screen.getByRole('table', { name: /Emsal/ })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/web/src/features/listing-detail/components/EvidenceSections.test.tsx`
Expected: FAIL — bölümler yalnız başlık render ediyor

- [ ] **Step 3: Write `EvidenceRow`**

```tsx
import { GlassDataProvenance, type GlassProvenanceSourceClass } from '@repo/ui'
import { hasConflict, isAnswered, type EvidenceValue } from '../domain/evidence'
import styles from './EvidenceRow.module.css'

const trDate = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })

/** ISO tarihi kullanıcıya görünür Türkçe biçime çevirir. */
export function formatEvidenceDate(iso: string): string {
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? 'bilinmiyor' : trDate.format(new Date(ms))
}

export interface EvidenceRowProps<T> {
  label: string
  value: EvidenceValue<T>
  /** Değeri okunur metne çevirir; verilmezse String(value) kullanılır */
  formatValue?: (value: T) => string
  /** Değer yokken gösterilecek metin — "—" yerine gerekçe cümlesi */
  fallbackText?: string
}

/**
 * Tek kanıt satırı: etiket, değer ve kaynak künyesi. Cevapsız değer boş
 * bırakılmaz; nedeni yazılır. Çelişki varsa künye bunu bildirir.
 */
export function EvidenceRow<T>({ label, value, formatValue, fallbackText }: EvidenceRowProps<T>) {
  const answered = isAnswered(value)
  const text = answered
    ? formatValue
      ? formatValue(value.value as T)
      : String(value.value)
    : (fallbackText ?? 'Bilgi alınamadı')

  const conflicts = value.conflicts?.map((conflict) => ({
    sourceLabel: conflict.sourceId === 'advertiser' ? 'İlan sahibi beyanı' : conflict.sourceId,
    value: String(conflict.value),
    effectiveAt: conflict.effectiveAt ? formatEvidenceDate(conflict.effectiveAt) : undefined,
  }))

  return (
    <div className={styles.row} data-state={answered ? 'answered' : 'missing'}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{text}</dd>
      <div className={styles.source}>
        <GlassDataProvenance
          fieldLabel={`${label} kaynağı`}
          sourceLabel={value.source.name}
          sourceClass={value.source.sourceClass as GlassProvenanceSourceClass}
          retrievedAt={formatEvidenceDate(value.retrievedAt)}
          effectiveAt={value.effectiveAt ? formatEvidenceDate(value.effectiveAt) : undefined}
          validUntil={value.validUntil ? formatEvidenceDate(value.validUntil) : undefined}
          freshness={value.freshness}
          scopeLabel={value.scope}
          geographicResolution={value.geographicResolution}
          method={value.method}
          methodVersion={value.methodVersion}
          limitations={value.knownLimitations}
          conflicts={hasConflict(value) ? conflicts : undefined}
          currentValueLabel={answered ? text : undefined}
        />
      </div>
    </div>
  )
}
```

`EvidenceRow.module.css`: `.row { display: grid; grid-template-columns: minmax(140px, 1fr) minmax(0, 1.9fr) auto; gap: var(--lg-space-2, 8px) var(--lg-space-5, 20px); padding: var(--lg-space-3, 12px) 0; border-bottom: var(--lg-stroke-hairline, 1px) solid var(--lg-hairline); align-items: baseline }`, `[data-state='missing'] .value { color: var(--lg-label-secondary) }`, container query ile 640px altında tek kolon.

- [ ] **Step 4: Fill the sections**

Her bölüm `<section id="..." aria-labelledby="...">` + `<h2>` + `<dl>` yapısındadır ve `LISTING_SECTIONS` etiketiyle aynı adı taşır:

- **ParcelSection** (`id="parsel"`): `blockParcel`, `area` (çelişkili), `locationPrecision`, `distanceToSea`. `mapSection.state === 'ready'` iken `GlassMap` `variant="inline"`, `privacyCircle` ile; `unavailable` iken `GlassAlert severity="warning"` + aynı değerlerin tablo görünümü. Harita her durumda tablo eşdeğeriyle birlikte gelir.
- **PlanningAndLegalSection** (`id="imar"`): `titleDeedType` (hisse bilgisi `dd` içinde metin olarak), `planStatus`, `landUse` (bayat), `encumbrance` (fallbackText: `Bilgi alınamadı — TAKBİS kaydı sunulmadı`, `knownLimitations`: `İpotek, haciz, şerh veya beyan bulunmadığı anlamına gelmez.` fixture'da tanımlı).
- **InfrastructureSection** (`id="altyapi"`): üstte `GlassAlert severity="warning"` — `Yasal erişim ile fiziksel erişim aynı şey değildir. Yola yakınlık yasal erişim hakkı değildir.`; ardından `legalRoadAccess`, `physicalAccess` ve `utilities` satırları.
- **HazardSection** (`id="arazi"`): `slope`, `aspect` ve `hazards[]`. Her tehlike satırı `label` + `scopeNote` (görünür `p`) + `EvidenceRow`.
- **MarketSection** (`id="piyasa"`): `comparableMedianUnitPrice` satırı + değerleme bloğu. `valuation.kind === 'insufficient'` iken başlık `ArsaPazar fiyat tahmini üretilmedi` ve `reason` metni; `range` iken aralık + `methodVersion` + `sampleSize`. Emsal tablosu `GlassTable` ile, `aria-label="Emsal ilanlar"`.
- **DocumentsSection** (`id="belgeler"`): `documents[]` — `state === 'missing' && critical` olanlar `Kritik eksik` etiketiyle ve `authority` bilgisiyle listelenir.

- [ ] **Step 5: Run tests, typecheck, commit**

```bash
npx vitest run apps/web/src/features/listing-detail/
npm run typecheck:web && npm run lint
git add apps/web/src/features/listing-detail/components/
git commit -m "feat(listing-detail): kaynaklı kanıt bölümlerini doldur"
```

---

## Task 11: AI karar özeti (kaynaklı ve çekinmeli)

**Files:**
- Modify: `apps/web/src/features/listing-detail/components/ListingEvidenceBrief.tsx`
- Create: `apps/web/src/features/listing-detail/components/ListingEvidenceBrief.module.css`
- Test: `apps/web/src/features/listing-detail/components/ListingEvidenceBrief.test.tsx`

**Interfaces:**
- Consumes: `SectionState<AiDecisionBrief>` (Task 3), `LISTING_SECTIONS` (Task 9), `GlassAiSummaryCard`, `GlassAiEvidenceList`, `GlassAlert`
- Produces: `ListingEvidenceBrief({ brief, detail })`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { loadListingDetail } from '../data/listing-detail-adapter'
import { ListingEvidenceBrief } from './ListingEvidenceBrief'

const NOW = '2026-07-27T09:00:00.000Z'

async function setup(scenario?: 'ai-unavailable') {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario, now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return render(<ListingEvidenceBrief brief={result.aiBrief} detail={result.detail} />)
}

describe('ListingEvidenceBrief', () => {
  it('her iddiayı ilgili bölüme bağlayan bir dayanak bağlantısı verir', async () => {
    await setup()
    const region = screen.getByRole('region', { name: /karar özeti/i })
    const links = within(region).getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(5)
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^#(parsel|imar|altyapi|arazi|piyasa|belgeler)$/)
    }
  })

  it('çıplak güven yüzdesi göstermez', async () => {
    const { container } = await setup()
    expect(container.textContent).not.toMatch(/%\s?\d{1,3}\s?güven/i)
  })

  it('bilinmeyenleri ve sonraki kontrolleri ayrı listeler', async () => {
    await setup()
    expect(screen.getByText('Bilinmeyenler')).toBeTruthy()
    expect(screen.getByText('Önerilen sonraki kontroller')).toBeTruthy()
    expect(screen.getByText(/TAKBİS takyidat kaydı/)).toBeTruthy()
  })

  it('model sürümünü ve kanıt kesitini görünür kılar', async () => {
    await setup()
    expect(screen.getByText(/model v2\.4/i)).toBeTruthy()
    expect(screen.getByText(/24 Tem 2026/)).toBeTruthy()
  })

  it('AI kullanılamadığında yapılandırılmış içeriği bozmadan gerekçe gösterir', async () => {
    await setup('ai-unavailable')
    expect(screen.getByText(/Karar özeti şu anda üretilemiyor/)).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('geri bildirim kategorilerini sunar', async () => {
    await setup()
    expect(screen.getByRole('button', { name: 'Yanlış bilgi bildir' })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/web/src/features/listing-detail/components/ListingEvidenceBrief.test.tsx`
Expected: FAIL — bileşen yalnız başlık render ediyor

- [ ] **Step 3: Write the component**

`ListingEvidenceBrief.tsx`:
- `brief.state === 'unavailable'` → `<GlassAlert severity="info" title="Karar özeti kullanılamıyor">{brief.reason}</GlassAlert>` ve başka hiçbir şey render edilmez (yapılandırılmış içerik zaten sayfada).
- `ready` → `<section id="ozet" aria-label="30 saniyelik karar özeti">`: özet paragrafı; ardından `claims` listesi — her madde metin + `<a href={'#' + claim.sectionId}>Dayanak</a>`; `unknowns` ve `nextChecks` iki ayrı `h3` + `ul`; altta `p` künye: `ArsaPazar asistanı · model {modelVersion} · kanıt kesiti {formatEvidenceDate(evidenceCutoff)}` ve `Yanlış bilgi bildir` butonu.
- `GlassAiSummaryCard` `confidence` prop'u **verilmez** (kalibre edilmiş değer yok); `sourceNote` künye metnini taşır.

- [ ] **Step 4: Run tests, typecheck, commit**

```bash
npx vitest run apps/web/src/features/listing-detail/
npm run typecheck:web && npm run lint
git add apps/web/src/features/listing-detail/components/ListingEvidenceBrief.tsx apps/web/src/features/listing-detail/components/ListingEvidenceBrief.module.css apps/web/src/features/listing-detail/components/ListingEvidenceBrief.test.tsx
git commit -m "feat(listing-detail): kaynaklı AI karar özetini ekle"
```

---

## Task 12: Satıcı bölümü, durum matrisi story'leri ve erişilebilirlik geçidi

**Files:**
- Modify: `apps/web/src/features/listing-detail/components/SellerSection.tsx`
- Create: `apps/web/src/features/listing-detail/ListingDetailWorkspace.stories.tsx`
- Create: `apps/web/src/features/listing-detail/rules.md`
- Test: `apps/web/src/features/listing-detail/components/SellerSection.test.tsx`
- Test: `apps/web/src/features/listing-detail/ListingDetailAccessibility.test.tsx`

**Interfaces:**
- Consumes: `ListingDetail` (Task 2), `GlassAgencyCard`, `GlassButton`
- Produces: `SellerSection({ detail, onRevealPhone })`, `revealed` + `defaultRevealed` + `onRevealedChange` controlled deseni

- [ ] **Step 1: Write the failing tests**

`SellerSection.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { loadListingDetail } from '../data/listing-detail-adapter'
import { SellerSection } from './SellerSection'

const NOW = '2026-07-27T09:00:00.000Z'

async function detail() {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return result.detail
}

describe('SellerSection', () => {
  it('telefon numarası açılana kadar DOM içinde bulunmaz', async () => {
    const { container } = render(<SellerSection detail={await detail()} onRevealPhone={async () => '0 (252) 000 00 00'} />)
    expect(container.textContent).not.toMatch(/\d{3}\s?\d{2}\s?\d{2}/)
  })

  it('numarayı yalnız istek anında getirir ve odağı numaraya taşır', async () => {
    const user = userEvent.setup()
    const onRevealPhone = vi.fn(async () => '0 (252) 000 00 00')
    render(<SellerSection detail={await detail()} onRevealPhone={onRevealPhone} />)
    await user.click(screen.getByRole('button', { name: 'Numarayı göster' }))
    expect(onRevealPhone).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /0 \(252\)/ })
      expect(document.activeElement).toBe(link)
    })
  })

  it('numara alınamazsa gerekçe gösterir ve butonu tekrar denenebilir bırakır', async () => {
    const user = userEvent.setup()
    render(
      <SellerSection
        detail={await detail()}
        onRevealPhone={async () => {
          throw new Error('rate-limited')
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Numarayı göster' }))
    expect(await screen.findByText(/Numara şu anda gösterilemiyor/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Numarayı göster' })).toBeTruthy()
  })

  it('TTBS yetkisini ilan içeriğinin doğrulaması gibi sunmaz', async () => {
    render(<SellerSection detail={await detail()} onRevealPhone={async () => '0'} />)
    expect(screen.getByText(/işletmenin faaliyet yetkisidir/i)).toBeTruthy()
  })
})
```

`ListingDetailAccessibility.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { loadListingDetail } from './data/listing-detail-adapter'
import { ListingDetailWorkspace } from './ListingDetailWorkspace'

const NOW = '2026-07-27T09:00:00.000Z'

async function renderPage() {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return render(<ListingDetailWorkspace result={result} />)
}

describe('ilan detayı erişilebilirlik geçidi', () => {
  it('başlık hiyerarşisi tek h1 ve h2 bölümlerinden oluşur', async () => {
    await renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(7)
  })

  it('her bölüm indeksi bağlantısının hedefi sayfada mevcuttur', async () => {
    const { container } = await renderPage()
    const nav = screen.getByRole('navigation', { name: 'Bölümler' })
    for (const link of Array.from(nav.querySelectorAll('a'))) {
      const id = link.getAttribute('href')?.slice(1)
      expect(container.querySelector(`#${id}`)).toBeTruthy()
    }
  })

  it('durum yalnız renkle değil metinle de taşınır', async () => {
    await renderPage()
    expect(screen.getByText('Çelişkili')).toBeTruthy()
    expect(screen.getByText('Eksik')).toBeTruthy()
  })

  it('etiket/değer çiftleri dl, kıyaslar table kullanır', async () => {
    const { container } = await renderPage()
    expect(container.querySelectorAll('dl').length).toBeGreaterThan(0)
    expect(screen.getByRole('table', { name: /Emsal/ })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run apps/web/src/features/listing-detail/`
Expected: FAIL — `SellerSection` henüz reveal sözleşmesini uygulamıyor

- [ ] **Step 3: Write `SellerSection`**

Sözleşme:
- `phone` prop **yoktur**; numara yalnız `onRevealPhone(): Promise<string>` ile istek anında alınır.
- `revealed` + `defaultRevealed` + `onRevealedChange` controlled deseni.
- Yükleme sırasında buton `aria-busy`, hata durumunda `GlassAlert severity="warning"` + `Numara şu anda gösterilemiyor. Birkaç dakika sonra tekrar deneyin.` ve buton tekrar aktif.
- Başarıda `<a href={'tel:' + digits}>` render edilir ve `ref.current?.focus()` ile odak numaraya taşınır.
- TTBS satırı: `TTBS, işletmenin faaliyet yetkisidir; ilan içeriğinin doğruluğunu göstermez.`
- Analitiğe numara değil yalnız olay adı gider — `rules.md`'de kural olarak yazılır.

- [ ] **Step 4: Write the Storybook state matrix**

`ListingDetailWorkspace.stories.tsx` — `title: 'Sayfalar/Public/İlan Detayı'`, `tags: ['autodocs']`. Story'ler (her biri `loadListingDetail` ile sabit `now` kullanır):

| Story | Senaryo |
|---|---|
| `Default` | `default` |
| `BayatPlanKaynagi` | `stale-planning` |
| `AiKullanilamiyor` | `ai-unavailable` |
| `HaritaKullanilamiyor` | `map-unavailable` |
| `SuresiDolmus` | `inactive` |
| `Yukleniyor` | `GlassSkeleton` iskeleti + `aria-busy` |
| `UzunIcerik` | 90 karakterlik başlık, 8 belge, 6 altyapı satırı |
| `Responsive` | 390px ve 834px container |
| `Temalar` | Kağıt + Grafit |

- [ ] **Step 5: Write `rules.md`**

`apps/web/src/features/listing-detail/rules.md` — feature sözleşmesi:
- Cam bütçesi 6 ve dağılımı; testle korunur.
- EİDS metni ve kapsam notu tek kaynaktan (`EIDS_SCOPE_NOTE`) gelir.
- Kritik tapu/imar/erişim/çelişki/bayatlık bilgisi accordion arkasına saklanmaz.
- Sayfa düzeyinde tab yok; `GlassTabs` yalnız medya/harita görünüm değişiminde.
- Değerleme çekinmesi bir hata değil, geçerli bir sonuçtur.
- Telefon numarası prop olarak taşınmaz; analytics'e numara gönderilmez.
- Fixture ve adapter deterministiktir; `Math.random()` ve argümansız `Date` yasak.
- Changelog: `2026-07-27 — Faz 0+1, Yön A (Karar Dosyası) yerleşimiyle ilk sürüm.`

- [ ] **Step 6: Full verification and commit**

```bash
npm test
npx tsc -b
npm run typecheck:web
npm run lint
git add apps/web/src/features/listing-detail/
git commit -m "feat(listing-detail): satıcı sözleşmesini, durum matrisini ve a11y geçidini tamamla"
```

- [ ] **Step 7: Manuel doğrulama**

```bash
npm run dev:web
```
`http://localhost:3000/ilan/arsa-214-7` — Kağıt ve Grafit temada, 390px ve 1440px genişlikte kontrol:
1. Tek `h1`, bölüm indeksi sticky ve hedefleri çalışıyor.
2. Karar rayı satıcı bölümüne gelince sticky bırakıyor.
3. Kaynak künyeleri klavye ile açılıp kapanıyor, focus halkası görünür.
4. `?senaryo=ai-unavailable` ve `?senaryo=map-unavailable` ile bölüm bazlı gerileme çalışıyor.
5. DevTools'ta `document.querySelectorAll('[data-material="glass"]').length` ≤ 6.

---

## Self-Review

**Spec coverage**

| Spec bölümü | Karşılayan task |
|---|---|
| §1.1 normalize sözleşme · §11 provenance | Task 1, 2, 3 |
| §1.2 EİDS düzeltmesi · §12.1 | Task 4 (guard testi kalıcı) |
| §9.1 sayfa sırası · §9.3 desktop şeması | Task 9 |
| §9.2 ilk görünüm | Task 9 (ListingIntro) |
| §10 içerik matrisi P0 · §10.1 arsa paketi | Task 2, 3, 10 |
| §11.4 doğrulama vektörü | Task 2 (`VerificationRow`), Task 9 |
| §12.3-12.5 TKGM/e-Plan/AFAD dili | Task 3 fixture, Task 10 |
| §12.6 değerleme çekinmesi | Task 3, 10 |
| §13.1 karar özeti anatomisi | Task 11 |
| §14 cam bütçesi ve nesting | Task 7, 9 (test) |
| §15.2 GlassPriceHeader/SellerCard/TrustSignalPanel düzeltmeleri | Task 4, 6, 12 |
| §15.3 yeni component'ler | Task 5, 6, 7 |
| §16.1 dosya sınırları · §16.5 SSR · §16.6 hata izolasyonu · §16.7 determinizm | Task 3, 8, 9 |
| §17 durum modeli | Task 3 senaryoları, Task 9, 12 |
| §18 responsive · §19 erişilebilirlik | Task 9 (container query), Task 12 |
| §25 test/story matrisi | Task 5-7 story'leri, Task 12 |

**Kapsam dışı bırakılanlar (bilinçli):** §13.2-13.3 sohbet ve ajan basamakları (Faz 3), §20.5 SLO ölçümü, §21 JSON-LD, §23 analytics olay sözlüğü — bunlar Faz 2+ planlarına aittir ve bu plan onlara bağımlı değildir.

**Tip tutarlılığı kontrolü:** `EvidenceValue` alan adları Task 1'de tanımlandığı gibi Task 3 fixture'ında ve Task 10 `EvidenceRow`'unda birebir kullanılıyor (`retrievedAt`, `effectiveAt`, `knownLimitations`, `conflicts`). `GlassDataProvenance` prop adları (Task 5) `EvidenceRow` çağrısıyla (Task 10) eşleşiyor. `ListingDetailScenario` değerleri Task 3, 8, 9, 12'de aynı altı değer. `LISTING_SECTIONS` etiketleri Task 9 testindeki sıra ile Task 10 bölüm başlıklarında aynı.

**Bilinen kabuller:** `GlassMap` Faz 1'de gerçek tile servisi kullanmaz (seed'li şematik zemin); parsel sınırı kadastral doğrulukta çizilmez ve bu `rules.md`'de yazılıdır.
