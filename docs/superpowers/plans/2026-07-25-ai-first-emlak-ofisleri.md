# AI-First Emlak Ofisleri Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/ofisler` rotasını alıcı, kiracı, satıcı ve mülk sahibini kullanıcı onayıyla doğru emlak ofisiyle eşleştiren AI-first enterprise keşif workspace’ine dönüştürmek.

**Architecture:** URL ile serileştirilen bir `OfficeSearchState`, deterministik mock ofis adapter’ı ve ayrı AI brief parser/matcher domain katmanı kurulacak. Route loader/query controller veriyi sağlar; `OfficeDirectoryView` AI prompt, filtre rail’i, sonuç kartları, kanıt paneli, karşılaştırma bar’ı ve aksiyon onay drawer’ını render eder. Mevcut `GlassAgencyCard` temel kimlik kartı olarak yeniden kullanılacak; yeni sayfa davranışı tek bir feature klasöründe izole edilecek.

**Tech Stack:** React 19, TanStack Router, TanStack Query, CSS Modules, Motion, Vitest, Testing Library, Storybook

## Global Constraints

- AI hiçbir dış aksiyonu kullanıcı açıkça onaylamadan başlatmayacak.
- Her eşleşme en az bir gerekçe ve kanıt kaynağı gösterecek; veri yoksa uydurma değer gösterilmeyecek.
- Sayfada tek ana AI cam yüzeyi olacak; filtre ve sonuç içerik katmanları düz/token yüzey kullanacak.
- CSS raw hex/px kullanmayacak; `src/index.css` içindeki `--lg-*` token’ları tüketilecek.
- Focus yalnız `:focus-visible` ile, dokunmatik hedefler minimum 44px ile uygulanacak.
- `prefers-reduced-motion` ve `prefers-reduced-transparency` desteklenecek.
- Mobilde filtreler ve AI içgörüleri drawer’a dönüşecek.

## Dosya haritası

- Create: `apps/web/src/features/offices/domain/office-search-state.ts` — URL’ye serileştirilen brief/filtre durumu.
- Create: `apps/web/src/features/offices/domain/office-types.ts` — AI kanıtı, proposal ve kullanıcı onaylı aksiyonların paylaşılan tipleri.
- Create: `apps/web/src/features/offices/domain/office-search-state.test.ts` — parse/serialize ve state geçiş testleri.
- Create: `apps/web/src/features/offices/data/office-adapter.ts` — deterministik ofis fixture’ları, filtreleme, sıralama ve karşılaştırma verisi.
- Create: `apps/web/src/features/offices/data/office-adapter.test.ts` — adapter filtre/facet/pagination testleri.
- Create: `apps/web/src/features/offices/domain/office-ai.ts` — doğal dil brief parser’ı, eşleşme gerekçesi ve kanıt modeli.
- Create: `apps/web/src/features/offices/domain/office-ai.test.ts` — AI proposal parser/matcher testleri.
- Create: `apps/web/src/features/offices/OfficeDirectoryView.tsx` — sayfanın UI orchestration bileşeni.
- Create: `apps/web/src/features/offices/OfficeDirectoryView.module.css` — workspace, kart, rail, panel ve responsive kurallar.
- Create: `apps/web/src/features/offices/OfficeDirectoryView.stories.tsx` — Storybook durum matrisi.
- Create: `apps/web/src/features/offices/OfficeDirectoryView.test.tsx` — AI/filter/compare/consent UI testleri.
- Create: `apps/web/src/features/offices/index.ts` — feature export’ları.
- Modify: `apps/web/src/routes/ofisler.tsx` — gerçek route loader, query state ve navigation.
- Create: `apps/web/src/routes/ofisler.test.tsx` — route state ve legacy/head davranışı testleri.
- Modify: `.storybook/main.ts` — feature story glob’ı zaten yoksa eklenir.

---

### Task 1: Ofis arama domain state’i

**Interfaces:**

```ts
type OfficeIntent = 'buy' | 'rent' | 'sell' | 'valuate'
type OfficeLayout = 'list' | 'split'
interface OfficeSearchState {
  query: string
  intent: OfficeIntent | 'all'
  propertyType?: string
  city?: string
  district?: string
  expertise: string[]
  verifiedOnly: boolean
  maxResponseMinutes?: number
  language?: string
  sort: 'match' | 'response' | 'portfolio' | 'rating'
  layout: OfficeLayout
  page: number
}

type OfficeEvidenceSource = 'listing-data' | 'office-profile' | 'verified-transaction' | 'review'
interface OfficeMatchEvidence { label: string; value: string; source: OfficeEvidenceSource; observedAt?: string }
interface OfficeAiProposal { confidence: number; summary: string; brief: OfficeSearchBrief; filters: Array<{ key: string; label: string; value: string; displayValue: string }> }
type OfficeActionType = 'message' | 'meeting' | 'offer'
interface OfficeActionDraft { officeId: string; action: OfficeActionType; summary: string; fields: Array<{ label: string; value: string }> }
```

- [ ] **Step 1: Parse/serialize testlerini yaz.** `?intent=sell&city=izmir&expertise=land, zoning` URL’si canonical state’e, state de aynı canonical query’ye dönmelidir; boş/default değerler URL’den atılmalıdır.
- [ ] **Step 2: Testi çalıştır ve fail olduğunu doğrula.** `npx vitest run apps/web/src/features/offices/domain/office-search-state.test.ts` beklenen sonuç: yardımcılar henüz olmadığı için FAIL.
- [ ] **Step 3: Parser ve serializer’ı uygula.** `parseOfficeSearch`, `serializeOfficeSearch`, `changeOfficeIntent` ve `resetOfficeSearch` named export’larını oluştur; `URLSearchParams` kullan ve geçersiz değerleri default’a indir.
- [ ] **Step 4: Domain testini çalıştır.** Aynı Vitest komutu PASS olmalıdır.

### Task 2: Deterministik ofis adapter’ı

**Interfaces:**

```ts
interface OfficeSummary {
  id: string; name: string; city: string; districts: string[]
  tagline: string; verified: boolean; verifiedBy?: string
  expertise: string[]; languages: string[]; activeListings: number
  consultants: number; rating: number; reviewCount: number
  responseMinutes: number; lastActiveLabel: string
  evidence: OfficeMatchEvidence[]; logoSrc?: string
}
interface OfficeSearchResponse {
  items: OfficeSummary[]; total: number; page: number; pageCount: number
  facets: { cities: Array<{ value: string; count: number }>; expertise: Array<{ value: string; count: number }> }
}
function searchOffices(input: { state: OfficeSearchState; pageSize: number }): Promise<OfficeSearchResponse>
```

- [ ] **Step 1: Fixture ve adapter testini yaz.** Varsayılan aramada en az 12 ofis, `city=izmir` filtresinde yalnız İzmir ofisleri, `verifiedOnly=true` filtresinde doğrulanmamış ofis yok ve sıralama `response` artan olmalıdır.
- [ ] **Step 2: Testi çalıştır ve fail olduğunu doğrula.** `npx vitest run apps/web/src/features/offices/data/office-adapter.test.ts` FAIL olmalıdır.
- [ ] **Step 3: Adapter’ı uygula.** En az 18 deterministic fixture oluştur; şehir, ilçe, uzmanlık, doğrulama, dil ve yanıt süresi filtrelerini uygula; `match` sıralamasında skor için domain matcher’a girdi sağla.
- [ ] **Step 4: Adapter testini çalıştır.** Aynı komut PASS olmalıdır.

### Task 3: AI brief parser ve kanıtlı eşleşme

**Interfaces:**

```ts
interface OfficeSearchBrief { intent: OfficeIntent; propertyType?: string; location?: string; budget?: { min?: number; max?: number }; timeline?: string; expertise?: string[]; communicationPreference?: 'message' | 'call' | 'meeting' }
interface OfficeMatch { officeId: string; score: number; reasons: string[]; evidence: OfficeMatchEvidence[] }
function parseOfficePrompt(query: string): { brief: OfficeSearchBrief; filters: Array<{ key: string; label: string; value: string; displayValue: string }>; confidence: number }
function matchOffices(brief: OfficeSearchBrief, offices: OfficeSummary[]): OfficeMatch[]
```

- [ ] **Step 1: Parser/matcher testlerini yaz.** “İzmir Urla’da arsa satışı için imar uzmanı” girdisi `intent=sell`, `location=İzmir/Urla`, `expertise` içinde imar/arsa üretmeli; matcher her sonuç için score, reason ve evidence döndürmelidir.
- [ ] **Step 2: Testi çalıştır ve fail olduğunu doğrula.** `npx vitest run apps/web/src/features/offices/domain/office-ai.test.ts` FAIL olmalıdır.
- [ ] **Step 3: Deterministik parser ve matcher’ı uygula.** Türkçe anahtar kelime sözlüğüyle parse et; skor bileşenlerini intent, city/district, expertise, verified ve response time olarak açıkça hesapla; evidence yalnız fixture’daki verilere dayanmalı.
- [ ] **Step 4: AI testini çalıştır.** Aynı komut PASS olmalıdır.

### Task 4: OfficeDirectoryView workspace UI

**Interfaces:**

```ts
interface OfficeDirectoryViewProps {
  state: OfficeSearchState; response?: OfficeSearchResponse
  matches?: OfficeMatch[]; status: 'loading' | 'refreshing' | 'success' | 'error'
  aiProposal?: OfficeAiProposal; selectedOfficeId?: string
  compareIds: string[]; actionDraft?: OfficeActionDraft
  onStateChange(next: OfficeSearchState, options: { history: 'push' | 'replace' }): void
  onAiSearch(query: string): void; onSelectOffice(id: string): void
  onToggleCompare(id: string): void; onStartAction(action: OfficeActionType, id: string): void
  onApplyProposal(): void; onDismissProposal(): void; onConfirmAction(): void; onCloseAction(): void
}
```

- [ ] **Step 1: UI testlerini yaz.** Başlangıçta AI prompt ve niyet seçenekleri görünmeli; öneri apply edilmeden state değişmemeli; ofis seçimi içgörü panelini açmalı; üç ofis karşılaştırılabilmeli; onay drawer’ında confirm olmadan action callback çalışmamalı; loading/empty/error state’leri görünmeli.
- [ ] **Step 2: Testi çalıştır ve fail olduğunu doğrula.** `npx vitest run apps/web/src/features/offices/OfficeDirectoryView.test.tsx` FAIL olmalıdır.
- [ ] **Step 3: Workspace markup’ını uygula.** Kompakt `GlassAiSearchBar`, hızlı niyet chip’leri, düz filtre rail’i, `GlassAgencyCard variant="inline"`, kanıt paneli, karşılaştırma bar’ı ve `GlassDrawer` onay akışını ekle. GlassAgencyCard’ın tekil CTA’sı ve mevcut accessibility sözleşmesi korunmalı.
- [ ] **Step 4: CSS’i uygula.** Desktop üç bölge, tablet iki bölge, mobil tek akış/drawer; sonuç kartları bilgi yoğun, AI yüzeyi tek glass katmanı; token-only CSS, focus-visible, coarse pointer ve reduced motion kuralları.
- [ ] **Step 5: UI testini çalıştır.** Aynı Vitest komutu PASS olmalıdır.

### Task 5: `/ofisler` route ve URL senkronizasyonu

**Interfaces:**

- `validateSearch` flat canonical query döndürür.
- `loader` query key ile `searchOffices` response’unu önceden yükler.
- AI apply `navigate({ search, replace: true })` ile URL’ye brief filtrelerini yazar.
- Aksiyon onayı mock session intent’i kaydeder ve kullanıcı akışını kaybetmeden sonuç toast/drawer durumu gösterir.

- [ ] **Step 1: Route testlerini yaz.** URL’den state okunmalı, filter değişimi replace, AI apply push/replace sözleşmesine uymalı ve route head `offices` config’inden üretilmelidir.
- [ ] **Step 2: Route testini çalıştır ve fail olduğunu doğrula.** `npx vitest run apps/web/src/routes/ofisler.test.tsx` FAIL olmalıdır.
- [ ] **Step 3: Route’u uygula.** `RoutePlaceholder` yerine `OfficeDirectoryView` bağla; query controller, mock adapter, AI proposal ve consent state’lerini route seviyesinde tut; `/ofisler` refresh/share davranışını koru.
- [ ] **Step 4: Route testini çalıştır.** Aynı komut PASS olmalıdır.

### Task 6: Storybook ve kalite matrisi

- [ ] **Step 1: Storybook story’lerini ekle.** `Default`, `AiProposal`, `SaticiArsa`, `KiralikKonut`, `CompareThree`, `Loading`, `Empty`, `Error`, `ActionConsent`, `MobileDrawer` durumlarını oluştur.
- [ ] **Step 2: Storybook build’i çalıştır.** `npm run build:storybook` PASS olmalıdır.
- [ ] **Step 3: Tam doğrulama çalıştır.** `npm test && npm run lint && npm run typecheck:web && npm run build` komutlarının tümü exit code 0 vermelidir.
- [ ] **Step 4: Scope self-review yap.** AI önerilerinin kanıtsız değer üretmediğini, dış aksiyonların confirm olmadan çağrılmadığını ve mevcut kullanıcı değişikliklerine dokunulmadığını kontrol et.
