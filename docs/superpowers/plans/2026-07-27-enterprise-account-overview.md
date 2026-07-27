# Enterprise Hesabım Genel Bakış Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/hesabim` rotasını placeholder ekranından; kimlik, öncelikli işler,
ilan özeti, güvenlik, etkinlik ve kayıtlı arama bilgilerini birleştiren
enterprise düzeyde, erişilebilir ve responsive bir hesap genel bakışına
dönüştürmek.

**Architecture:** Özellik `apps/web/src/features/account` altında uygulama
yerelinde kalır. Ham demo verisi saf bir adapter ile normalize edilir; metrik,
öncelik, ana aksiyon ve görünüm modu saf domain fonksiyonlarıyla türetilir.
`AccountWorkspace` yalnız orkestrasyon yapar ve küçük sunum bileşenlerini mevcut
`@repo/ui` primitive'leriyle birleştirir.

**Tech Stack:** React 19, TypeScript 6, TanStack Router, CSS Modules,
`@repo/ui`, Vitest, Testing Library, Storybook 10, Playwright ve Axe.

**Tasarım spesifikasyonu:**
`docs/superpowers/specs/2026-07-27-enterprise-account-overview-design.md`

## Global Constraints

- Tüm görünür metin Türkçe, kod tanımlayıcıları İngilizce olacaktır.
- Component CSS'i yalnız `--lg-*` tokenlarını tüketecek; raw `px`, raw hex,
  `rgb`, `hsl`, özel shadow, gradient ve `!important` kullanılmayacaktır.
- İçerik yüzeyleri flat kalacak; sayfa içinde yalnız bir primary hesap
  aksiyonu cam kontrol yüzeyi kullanacaktır.
- `main#main-content` içindeki `[data-material="glass"]` sayısı biri
  geçmeyecek; Header ve Dock birleşik navigasyon yüzeyleri ayrıca doğrulanacak.
- Sayfada tam olarak bir `main#main-content`, bir `h1` ve bir
  `AccountActionLink[data-variant="primary"]` bulunacaktır.
- Gerçek rotası olmayan kontrol render edilmeyecektir.
- `/hesabim/mesajlar` placeholder olduğu sürece gündem eylemi olmayacaktır.
- `GlassListingManagementCard` yalnız `draft`, `review`, `live`, `changes`,
  `paused`, `expired` durumlarıyla kullanılacaktır.
- AI yalnız öncelik gerekçesini açıklayacak; hiçbir veriyi veya ayarı
  değiştirmeyecektir.
- Responsive davranış container query ve capability query ile kurulacaktır.
- Coarse pointer hedefleri en az `--lg-control-md` olacaktır.
- Focus halkası `--lg-focus-ring-width`, `--lg-accent` ve
  `--lg-focus-ring-offset` tokenlarını kullanacaktır.
- `prefers-reduced-motion` ve `prefers-reduced-transparency` desteklenmelidir.
- `routeTree.gen.ts` elle düzenlenmeyecektir.
- Eski `src/pages/HesapOzeti*` dosyalarına dokunulmayacaktır.
- Kullanıcıya ait mevcut ve ilgisiz worktree değişiklikleri korunacaktır.
- Mevcut ortamda `.git` salt okunurdur. Commit denenmeyecek; her görev sonunda
  kapsamlı diff ve test kontrol noktası alınacaktır.

## File Map

### Create

- `apps/web/src/features/account/domain/account-types.ts`: tüm hesap görünüm
  tipleri ve sabitler.
- `apps/web/src/features/account/domain/account-summary.ts`: saf metrik,
  öncelik, son ilan, ana aksiyon ve mod türetme fonksiyonları.
- `apps/web/src/features/account/domain/account-summary.test.ts`: domain
  sözleşmesi testleri.
- `apps/web/src/features/account/data/account-dashboard-adapter.ts`: ham
  fixture verisini normalize eden saf adapter.
- `apps/web/src/features/account/data/account-dashboard-adapter.test.ts`:
  adapter filtreleme ve fallback testleri.
- `apps/web/src/features/account/data/account-fixtures.ts`: gerçekçi ve
  deterministik Storybook/rota fixture'ları.
- `apps/web/src/features/account/components/AccountActionLink.tsx`: gerçek
  TanStack Link semantiğine sahip primary, secondary ve text aksiyonları.
- `apps/web/src/features/account/components/AccountActionLink.module.css`:
  token tabanlı kontrol stilleri.
- `apps/web/src/features/account/components/AccountActionLink.test.tsx`: link
  semantiği ve primary cam bütçesi testleri.
- `apps/web/src/features/account/components/AccountOverviewHeader.tsx`:
  kimlik, rol, doğrulama ve tek CTA.
- `apps/web/src/features/account/components/AccountAttentionQueue.tsx`: en
  fazla üç öncelikli iş.
- `apps/web/src/features/account/components/AccountListingsPreview.tsx`: iki
  ilan veya rol tabanlı empty state.
- `apps/web/src/features/account/components/AccountSecuritySummary.tsx`:
  doğrulama ve son giriş özeti.
- `apps/web/src/features/account/components/AccountActivityList.tsx`: hesap
  etkinliği zaman çizelgesi.
- `apps/web/src/features/account/components/AccountSavedSearchSummary.tsx`: tek
  kayıtlı aramanın flat özeti.
- `apps/web/src/features/account/components/AccountSections.test.tsx`: alt
  bölüm semantiği ve hata durumları.
- `apps/web/src/features/account/AccountWorkspace.tsx`: state ve bölüm
  orkestrasyonu.
- `apps/web/src/features/account/AccountWorkspace.module.css`: sayfa
  yerleşimi, temalar ve responsive sistem.
- `apps/web/src/features/account/AccountWorkspace.test.tsx`: workspace state ve
  erişilebilirlik testleri.
- `apps/web/src/features/account/AccountWorkspace.stories.tsx`: on dört
  senaryolu Storybook matrisi.
- `apps/web/src/features/account/rules.md`: feature sözleşmesi.
- `apps/web/src/features/account/index.ts`: public feature export'u.
- `apps/web/src/routes/hesabim.test.tsx`: gerçek rota mount testi.
- `apps/web/e2e/account.spec.ts`: Axe, screenshot, overflow, Dock, motion ve cam
  bütçesi testi.

### Modify

- `apps/web/src/routes/hesabim.tsx`: placeholder yerine AccountWorkspace ve
  fixture bağlama.
- `apps/web/src/components/MarketplaceShell.tsx`: account scope içinde hesap
  kontrolünün metnini “Hesabım” yapma.
- `apps/web/src/components/MarketplaceShell.test.tsx`: route-aware hesap etiketi
  regresyon testi.

---

### Task 1: Domain sözleşmeleri ve deterministik özetler

**Files:**

- Create: `apps/web/src/features/account/domain/account-types.ts`
- Create: `apps/web/src/features/account/domain/account-summary.ts`
- Create: `apps/web/src/features/account/domain/account-summary.test.ts`

**Interfaces:**

- Produces:
  - `AccountRole`
  - `VerificationState`
  - `AccountWorkspaceMode`
  - `AccountDashboardData`
  - `RawAccountDashboard`
  - `AccountAttentionItem`
  - `AccountListingPreview`
  - `AccountAction`
  - `AccountMetricItem`
  - `getAccountMetricItems(data)`
  - `getPriorityAttentionItems(data)`
  - `getRecentListings(data, limit?)`
  - `getPrimaryAccountAction(data)`
  - `resolveAccountWorkspaceMode(input)`
  - `hasAccountAttention(data)`
- Consumes: yalnız TypeScript standart kütüphanesi.

- [ ] **Step 1: Domain tiplerini ve desteklenen ilan durumlarını tanımla**

`account-types.ts` içinde aşağıdaki çekirdek sözleşmeleri yaz:

```ts
export const ACCOUNT_LISTING_STATES = [
  'draft',
  'review',
  'live',
  'changes',
  'paused',
  'expired',
] as const

export type AccountListingState =
  (typeof ACCOUNT_LISTING_STATES)[number]
export type AccountRole = 'buyer' | 'seller' | 'hybrid'
export type VerificationState =
  | 'verified'
  | 'pending'
  | 'missing'
  | 'not-applicable'
  | 'unavailable'
export type AccountWorkspaceMode =
  | 'loading'
  | 'ready'
  | 'new-account'
  | 'restricted'
  | 'session-expired'

export interface AccountAction {
  kind: 'route'
  label: string
  to: '/ilan-ver' | '/favoriler' | '/emlak'
}

export interface AccountMetricItem {
  id: 'live-listings' | 'action-listings' | 'unread-messages' | 'active-alarms'
  label: string
  value: string
  hint: string
}
```

Dosyanın kalan interface'lerini spesifikasyonun 11. bölümündeki adlarla
eksiksiz tanımla. `AccountDashboardData` içinde
`attentionCandidates: AccountAttentionItem[]` ve
`sectionErrors: AccountSectionError[]` zorunlu olsun.

- [ ] **Step 2: Özet fonksiyonları için başarısız testleri yaz**

`account-summary.test.ts` içinde local `makeData` factory kullan ve en az şu
davranışları test et:

```ts
it('sorts attention by severity, newest date, then id and caps at three', () => {
  const data = makeData({
    attentionCandidates: [
      makeAttention('normal-old', 'normal', '2026-07-20T08:00:00.000Z'),
      makeAttention('high-old', 'high', '2026-07-21T08:00:00.000Z'),
      makeAttention('critical-b', 'critical', '2026-07-25T08:00:00.000Z'),
      makeAttention('critical-a', 'critical', '2026-07-25T08:00:00.000Z'),
    ],
  })

  expect(getPriorityAttentionItems(data).map(({ id }) => id)).toEqual([
    'critical-a',
    'critical-b',
    'high-old',
  ])
})

it('counts only live and changes listings in account metrics', () => {
  const data = makeData({
    listings: [
      makeListing('one', 'live'),
      makeListing('two', 'changes'),
      makeListing('three', 'paused'),
    ],
    unreadMessageCount: 7,
    activeAlarmCount: 2,
  })

  expect(getAccountMetricItems(data).map(({ value }) => value)).toEqual([
    '1',
    '1',
    '7',
    '2',
  ])
})

it('selects a real route CTA from account role', () => {
  expect(getPrimaryAccountAction(makeData({ role: 'buyer' }))).toEqual({
    kind: 'route',
    label: 'İlanları keşfet',
    to: '/emlak',
  })
  expect(getPrimaryAccountAction(makeData({ role: 'hybrid' }))).toEqual({
    kind: 'route',
    label: 'Yeni ilan ver',
    to: '/ilan-ver',
  })
})
```

Ayrıca şu testleri ekle:

- son ilanların `updatedAt` azalan, eşitlikte `id` artan ve limit iki olması,
- `session-expired > restricted > loading > new-account > ready` önceliği,
- boş faaliyetli hesabın `new-account` olması,
- critical/high iş varsa `hasAccountAttention` değerinin true olması.

- [ ] **Step 3: Domain testlerinin kırmızı olduğunu doğrula**

Run:

```bash
npx vitest run apps/web/src/features/account/domain/account-summary.test.ts
```

Expected: FAIL, çünkü domain modülleri ve export'lar henüz yok.

- [ ] **Step 4: Saf domain fonksiyonlarını uygula**

`account-summary.ts` içinde comparator ve türetmeleri açık, yan etkisiz
fonksiyonlar olarak yaz:

```ts
const severityRank = { critical: 0, high: 1, normal: 2 } as const

export function getPriorityAttentionItems(
  data: AccountDashboardData,
): AccountAttentionItem[] {
  return [...data.attentionCandidates]
    .filter((item) => item.action.kind === 'route')
    .sort((a, b) => {
      const severity = severityRank[a.severity] - severityRank[b.severity]
      if (severity !== 0) return severity
      const recency =
        Date.parse(b.occurredAt) - Date.parse(a.occurredAt)
      return recency !== 0 ? recency : a.id.localeCompare(b.id, 'tr')
    })
    .slice(0, 3)
}

export function getRecentListings(
  data: AccountDashboardData,
  limit = 2,
): AccountListingPreview[] {
  return [...data.listings]
    .sort((a, b) => {
      const recency = Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
      return recency !== 0 ? recency : a.id.localeCompare(b.id, 'tr')
    })
    .slice(0, limit)
}
```

`getAccountMetricItems`, `getPrimaryAccountAction`,
`hasAccountAttention` ve `resolveAccountWorkspaceMode` fonksiyonlarını aynı
dosyada test sözleşmesine göre tamamla. `resolveAccountWorkspaceMode`,
`new-account` kararını ilan, aktivite, kayıtlı arama ve sayaçların tamamı boş
olduğunda versin.

- [ ] **Step 5: Domain testlerini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/account/domain/account-summary.test.ts
```

Expected: PASS.

- [ ] **Step 6: Görev kontrol noktası**

Run:

```bash
git diff --check -- apps/web/src/features/account/domain
npx tsc --noEmit -p apps/web/tsconfig.json
```

Expected: whitespace hatası yok, typecheck PASS. `.git` salt okunur olduğu için
commit oluşturma.

---

### Task 2: Adapter ve gerçekçi demo fixture'ları

**Files:**

- Create: `apps/web/src/features/account/data/account-dashboard-adapter.ts`
- Create: `apps/web/src/features/account/data/account-dashboard-adapter.test.ts`
- Create: `apps/web/src/features/account/data/account-fixtures.ts`

**Interfaces:**

- Consumes:
  - `RawAccountDashboard`
  - `AccountDashboardData`
  - `ACCOUNT_LISTING_STATES`
- Produces:
  - `normalizeAccountDashboard(raw): AccountDashboardData`
  - `ACCOUNT_FIXTURES.default`
  - `ACCOUNT_FIXTURES.buyer`
  - `ACCOUNT_FIXTURES.newAccount`
  - `ACCOUNT_FIXTURES.partialError`
  - `ACCOUNT_FIXTURES.restricted`
  - `ACCOUNT_FIXTURES.sessionExpired`

- [ ] **Step 1: Adapter için başarısız testleri yaz**

`account-dashboard-adapter.test.ts` içinde şunları doğrula:

```ts
it('excludes unsupported lifecycle states without semantic remapping', () => {
  const result = normalizeAccountDashboard(
    makeRaw({
      listings: [
        makeRawListing('live', '2026-07-27T08:00:00.000Z'),
        makeRawListing('sold', '2026-07-27T09:00:00.000Z'),
        makeRawListing('eids-pending', '2026-07-27T10:00:00.000Z'),
      ],
    }),
  )

  expect(result.listings.map(({ state }) => state)).toEqual(['live'])
})

it('marks buyer EİDS as not applicable when the source omits it', () => {
  const result = normalizeAccountDashboard(
    makeRaw({
      viewer: { ...makeRaw().viewer, role: 'buyer' },
      verification: { email: 'verified', phone: 'verified' },
    }),
  )

  expect(result.verification.eids).toBe('not-applicable')
})
```

Ek testler:

- satıcıda eksik EİDS `unavailable`,
- negatif ve ondalıklı sayaçlar sıfır tabanlı tam sayıya normalize edilir,
- geçersiz `updatedAt` taşıyan ilan dışarıda bırakılır,
- eksik security `dataUpdatedAt` değerini uydurmaz,
- section error yalnız kendi section anahtarıyla korunur,
- bilinmeyen attention route'u tipe giremeyeceği için fixture katmanında
  üretilmez.

- [ ] **Step 2: Adapter testinin kırmızı olduğunu doğrula**

Run:

```bash
npx vitest run apps/web/src/features/account/data/account-dashboard-adapter.test.ts
```

Expected: FAIL, adapter henüz yok.

- [ ] **Step 3: Normalize adapter'ını uygula**

`normalizeAccountDashboard` içinde:

```ts
const supportedStates = new Set<string>(ACCOUNT_LISTING_STATES)

function normalizeCount(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value ?? 0)) : 0
}

export function normalizeAccountDashboard(
  raw: RawAccountDashboard,
): AccountDashboardData {
  const eids =
    raw.verification.eids ??
    (raw.viewer.role === 'buyer' ? 'not-applicable' : 'unavailable')

  return {
    identity: { ...raw.viewer },
    verification: {
      email: raw.verification.email ?? 'unavailable',
      phone: raw.verification.phone ?? 'unavailable',
      eids,
    },
    security: {
      lastSuccessfulLogin: raw.security?.lastSuccessfulLogin,
      dataUpdatedAt: raw.security?.dataUpdatedAt,
    },
    listings: raw.listings.filter(
      (listing): listing is AccountListingPreview =>
        supportedStates.has(listing.state) &&
        !Number.isNaN(Date.parse(listing.updatedAt)),
    ),
    unreadMessageCount: normalizeCount(raw.unreadMessageCount),
    activeAlarmCount: normalizeCount(raw.activeAlarmCount),
    priceDropFavoriteCount: normalizeCount(raw.priceDropFavoriteCount),
    attentionCandidates: [...(raw.attentionCandidates ?? [])],
    activities: [...(raw.activities ?? [])],
    savedSearch: raw.savedSearch,
    sectionErrors: [...(raw.sectionErrors ?? [])],
  }
}
```

Type predicate TypeScript tarafından kabul edilmezse supported state için
ayrı `isAccountListingState(value: string): value is AccountListingState`
guard'ı yaz; type assertion ile unsupported değeri zorla geçirme.

- [ ] **Step 4: Adapter testlerini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/account/data/account-dashboard-adapter.test.ts
```

Expected: PASS.

- [ ] **Step 5: Deterministik fixture setini oluştur**

`account-fixtures.ts`, ilk iki görsel için
`LISTING_FIXTURES[0]` ve `LISTING_FIXTURES[3]` kaynaklarını kullanarak ham
hesap verisi üretir. Default fixture şu görünür gerçekleri taşımalıdır:

- Mehmet Yılmaz
- Hibrit hesap
- e-posta ve telefon doğrulandı
- EİDS beklemede
- bir live, bir changes ilan
- 3 okunmamış mesaj
- 2 aktif alarm
- 1 fiyatı düşen favori
- `/favoriler`, `/ilan-ver` ve `/emlak` hedefli üç attention candidate
- üç etkinlik
- “Urla ve Çeşme yatırım arsaları” kayıtlı araması

Fixture'ları yalnız adapter üzerinden export et:

```ts
export const ACCOUNT_FIXTURES = {
  default: normalizeAccountDashboard(defaultRaw),
  buyer: normalizeAccountDashboard(buyerRaw),
  newAccount: normalizeAccountDashboard(newAccountRaw),
  partialError: normalizeAccountDashboard(partialErrorRaw),
  restricted: normalizeAccountDashboard(restrictedRaw),
  sessionExpired: normalizeAccountDashboard(defaultRaw),
} as const
```

Tarihler sabit ISO değerleri olmalı; `Date.now()` veya random kullanılmamalıdır.

- [ ] **Step 6: Adapter ve domain regresyonunu birlikte çalıştır**

Run:

```bash
npx vitest run \
  apps/web/src/features/account/domain/account-summary.test.ts \
  apps/web/src/features/account/data/account-dashboard-adapter.test.ts
```

Expected: PASS.

- [ ] **Step 7: Görev kontrol noktası**

Run:

```bash
git diff --check -- apps/web/src/features/account/data
npx tsc --noEmit -p apps/web/tsconfig.json
```

Expected: PASS; commit oluşturma.

---

### Task 3: Gerçek link semantiği ve kimlik/gündem bileşenleri

**Files:**

- Create: `apps/web/src/features/account/components/AccountActionLink.tsx`
- Create: `apps/web/src/features/account/components/AccountActionLink.module.css`
- Create: `apps/web/src/features/account/components/AccountActionLink.test.tsx`
- Create: `apps/web/src/features/account/components/AccountOverviewHeader.tsx`
- Create: `apps/web/src/features/account/components/AccountAttentionQueue.tsx`

**Interfaces:**

- Consumes:
  - `AccountAction`
  - `AccountDashboardData`
  - `AccountAttentionItem[]`
- Produces:
  - `AccountActionLink`
  - `AccountOverviewHeader`
  - `AccountAttentionQueue`

- [ ] **Step 1: AccountActionLink için kırmızı router testini yaz**

Memory router ile:

```tsx
it('renders primary account navigation as one real link and one glass shell', async () => {
  const { container, history } = renderActionLink({
    variant: 'primary',
    action: { kind: 'route', label: 'Yeni ilan ver', to: '/ilan-ver' },
  })

  const link = screen.getByRole('link', { name: 'Yeni ilan ver' })
  expect(link.getAttribute('href')).toBe('/ilan-ver')
  expect(link.getAttribute('data-variant')).toBe('primary')
  expect(container.querySelectorAll('[data-material="glass"]')).toHaveLength(1)

  fireEvent.click(link)
  await waitFor(() => expect(history.location.pathname).toBe('/ilan-ver'))
})
```

Secondary ve text varyantlarının `[data-material="glass"]` üretmediğini de
doğrula.

- [ ] **Step 2: Testin kırmızı olduğunu doğrula**

Run:

```bash
npx vitest run apps/web/src/features/account/components/AccountActionLink.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: AccountActionLink'i uygula**

Primary varyant:

```tsx
export function AccountActionLink({
  action,
  variant = 'secondary',
}: AccountActionLinkProps) {
  const link = (
    <Link
      to={action.to}
      className={styles[variant]}
      data-variant={variant}
    >
      {action.label}
    </Link>
  )

  if (variant !== 'primary') return link

  return (
    <GlassSurface
      material="glass"
      shape="capsule"
      className={styles.primarySurface}
      style={{ boxShadow: 'none' }}
    >
      {link}
    </GlassSurface>
  )
}
```

CSS:

- primary link `min-block-size: var(--lg-control-lg)`,
- coarse pointer altında `var(--lg-control-md)` altına düşmeme,
- border/radius/spacing yalnız token,
- focus-visible token halkası,
- secondary ve text flat,
- hover yalnız `@media (hover: hover)`,
- reduced motion altında transition kapalı,
- reduced transparency altında primary surface opak `--lg-surface`.

- [ ] **Step 4: Link testini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/account/components/AccountActionLink.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Header ve attention sunum bileşenlerini yaz**

`AccountOverviewHeader` props:

```ts
interface AccountOverviewHeaderProps {
  data: AccountDashboardData
  primaryAction: AccountAction
}
```

Görünür sıra:

1. `GlassAvatar`
2. tek `h1`: “Hesabım”
3. kullanıcı adı ve rol
4. email, telefon, EİDS flat badge'leri
5. EİDS beklemede ise “Doğrulama ilan verme adımında tamamlanır.”
6. tek primary `AccountActionLink`

`AccountAttentionQueue` props:

```ts
interface AccountAttentionQueueProps {
  items: AccountAttentionItem[]
}
```

Liste boşsa section render etme. Her item bir `article` değil `li` olsun;
title, reason, zaman etiketi, “Kural” veya “AI açıklaması” metni ve flat
secondary AccountActionLink içersin. `items.slice(0, 3)` ile üst sınırı
component sınırında da savun.

- [ ] **Step 6: Header/gündem semantiğini test et**

`AccountActionLink.test.tsx` dosyasına:

- bir h1,
- primary action sayısı bir,
- EİDS yalnız renkle değil metinle,
- AI kaynağı olan item'da “AI açıklaması”,
- dört item verilse yalnız üç list item

assertion'larını ekle.

Run:

```bash
npx vitest run apps/web/src/features/account/components/AccountActionLink.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Görev kontrol noktası**

Run:

```bash
git diff --check -- apps/web/src/features/account/components
npx tsc --noEmit -p apps/web/tsconfig.json
```

Expected: PASS; commit oluşturma.

---

### Task 4: İlan, güvenlik, etkinlik ve kayıtlı arama bölümleri

**Files:**

- Create: `apps/web/src/features/account/components/AccountListingsPreview.tsx`
- Create: `apps/web/src/features/account/components/AccountSecuritySummary.tsx`
- Create: `apps/web/src/features/account/components/AccountActivityList.tsx`
- Create: `apps/web/src/features/account/components/AccountSavedSearchSummary.tsx`
- Create: `apps/web/src/features/account/components/AccountSections.test.tsx`

**Interfaces:**

- Consumes:
  - `AccountListingPreview[]`
  - `AccountRole`
  - `AccountVerification`
  - `AccountSecuritySummary`
  - `AccountActivity[]`
  - `AccountSavedSearchSummary`
  - `AccountSectionError`
- Produces dört flat, tek sorumluluklu sunum bölümü.

- [ ] **Step 1: Bölüm testlerini kırmızı yaz**

Memory router helper ile şu testleri ekle:

```tsx
it('renders only the two supplied supported listing states', () => {
  renderWithRouter(
    <AccountListingsPreview
      role="seller"
      listings={[
        makeListing('live-one', 'live'),
        makeListing('changes-one', 'changes'),
      ]}
    />,
  )

  expect(screen.getAllByRole('article')).toHaveLength(2)
  expect(screen.getByText('Yayında')).toBeTruthy()
  expect(screen.getByText('Değişiklik istendi')).toBeTruthy()
})

it('describes unavailable security data without a fake action', () => {
  renderWithRouter(
    <AccountSecuritySummary
      verification={makeVerification({ eids: 'unavailable' })}
      security={{}}
    />,
  )

  expect(screen.getByText('Son giriş bilgisi kullanılamıyor')).toBeTruthy()
  expect(screen.queryByRole('button')).toBeNull()
})
```

Ek testler:

- buyer empty state `/emlak` linki gösterir,
- seller empty state `/ilan-ver` linki gösterir,
- section error varsa yalnız ilgili `GlassAlert` görünür,
- timeline boşsa yönlendirici olmayan açıklama görünür,
- saved search yoksa component `null` döner,
- saved search özeti switch veya button üretmez.

- [ ] **Step 2: Bölüm testinin kırmızı olduğunu doğrula**

Run:

```bash
npx vitest run apps/web/src/features/account/components/AccountSections.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: AccountListingsPreview'i uygula**

- Başlık `h2` olarak “Son ilanlar”.
- Verilen en fazla iki listing için `GlassListingManagementCard`.
- Kart başlığı `headingAs="h3"`.
- `actions` prop'u verme; edit/manage rotası yok.
- Listing issue mevcutsa component'in `issue` prop'una geçir.
- Boş buyer için “Aramaya başlamak için ilanları keşfedin” ve `/emlak`.
- Boş seller/hybrid için “İlk ilanınızı hazırlayın” ve `/ilan-ver`.
- Bölüm hatası varsa içerik yerine yerel `GlassAlert`.

- [ ] **Step 4: Security, activity ve saved search bölümlerini uygula**

`AccountSecuritySummary`:

- `h2` “Hesap güvenliği”
- email, telefon, EİDS için `dl`
- tüm state'ler Türkçe metinle
- son giriş `time dateTime`
- bulunmayan veride açık “kullanılamıyor” metni
- hiçbir action/button yok

`AccountActivityList`:

- `h2` “Son etkinlik”
- `GlassTimeline variant="compact"`
- en fazla dört etkinlik
- hata ve boş state yerel

`AccountSavedSearchSummary`:

- kayıt yoksa `null`
- `h2` “Kayıtlı arama”
- başlık, kriter, yeni eşleşme sayısı ve güncellik
- yalnız `/emlak` hedefli text AccountActionLink
- switch ve button yok

- [ ] **Step 5: Bölüm testlerini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/account/components/AccountSections.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Görev kontrol noktası**

Run:

```bash
git diff --check -- apps/web/src/features/account/components
npx tsc --noEmit -p apps/web/tsconfig.json
```

Expected: PASS; commit oluşturma.

---

### Task 5: AccountWorkspace, token-only yerleşim ve Storybook matrisi

**Files:**

- Create: `apps/web/src/features/account/AccountWorkspace.tsx`
- Create: `apps/web/src/features/account/AccountWorkspace.module.css`
- Create: `apps/web/src/features/account/AccountWorkspace.test.tsx`
- Create: `apps/web/src/features/account/AccountWorkspace.stories.tsx`
- Create: `apps/web/src/features/account/rules.md`
- Create: `apps/web/src/features/account/index.ts`

**Interfaces:**

- Consumes Task 1-4 export'ları ve `ACCOUNT_FIXTURES`.
- Produces `AccountWorkspace`.

- [ ] **Step 1: Workspace için kırmızı erişilebilirlik/state testlerini yaz**

`renderWorkspace` helper'ı memory router ile sarmalansın. Şu testleri yaz:

```tsx
it('renders one main, one h1, one primary action and no more than one local glass surface', () => {
  const { container } = renderWorkspace({
    data: ACCOUNT_FIXTURES.default,
  })

  expect(container.querySelectorAll('main#main-content')).toHaveLength(1)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(
    container.querySelectorAll('[data-variant="primary"]'),
  ).toHaveLength(1)
  expect(
    container.querySelectorAll('[data-material="glass"]'),
  ).toHaveLength(1)
})

it('does not expose personal content when the session is expired', () => {
  renderWorkspace({
    data: ACCOUNT_FIXTURES.sessionExpired,
    mode: 'session-expired',
  })

  expect(screen.queryByText('Mehmet Yılmaz')).toBeNull()
  expect(screen.queryByText('Son ilanlar')).toBeNull()
  expect(screen.queryByText('Okunmamış mesaj')).toBeNull()
  expect(screen.getByText('Oturum süresi doldu')).toBeTruthy()
})
```

Ek testler:

- heading seviyesi sırası,
- loading'de `aria-busy` ve skeleton,
- new-account rol tabanlı empty state,
- restricted durumunda kısıtlama açıklaması,
- partial error'da sağlam bölümlerin render edilmeye devam etmesi,
- attention list max üç,
- statü metinlerinin görünmesi,
- route'u olmayan action'ın tip/veri katmanından gelememesi.

- [ ] **Step 2: Workspace testinin kırmızı olduğunu doğrula**

Run:

```bash
npx vitest run apps/web/src/features/account/AccountWorkspace.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Workspace state orkestrasyonunu uygula**

Temel render:

```tsx
export function AccountWorkspace({
  data,
  mode,
}: AccountWorkspaceProps) {
  const resolvedMode =
    mode ??
    resolveAccountWorkspaceMode({
      data,
      loading: false,
      restricted: false,
      sessionExpired: false,
    })

  return (
    <main id="main-content" className={styles.page}>
      {resolvedMode === 'session-expired' ? (
        <SessionExpiredState />
      ) : resolvedMode === 'loading' ? (
        <AccountLoadingState />
      ) : resolvedMode === 'restricted' ? (
        <RestrictedAccountState />
      ) : (
        <AccountReadyContent
          data={data}
          newAccount={resolvedMode === 'new-account'}
        />
      )}
    </main>
  )
}
```

`AccountReadyContent` içinde `getAccountMetricItems`,
`getPriorityAttentionItems`, `getRecentListings` ve
`getPrimaryAccountAction` çağrılır. State helper'ları `main` üretmez; böylece
her modda aynı tek `main#main-content` korunur.

Ready/new-account DOM sırası:

1. AccountOverviewHeader
2. AccountAttentionQueue
3. GlassMetricStrip
4. listings + security grid
5. activity + saved search grid

Her section error, `sectionErrors.find` ile yalnız kendi bölümüne verilsin.

- [ ] **Step 4: Token-only responsive CSS'i uygula**

`AccountWorkspace.module.css`:

- `.page`: `container-type: inline-size`, token renk ve Dock bottom reserve
- `.frame`: `inline-size: min(100%, 88rem)`, ortak merkez ekseni
- `.section`: flat surface, hairline border, card radius, token padding
- `.mainGrid`: 12 kolon; listings 8, security 4
- `.bottomGrid`: 12 kolon; activity 8, saved search 4
- `@container (inline-size <= 64rem)`: tüm kolonlar tek sıra
- `@container (inline-size <= 40rem)`: daha kompakt token spacing
- `@media (hover: hover)`: yalnız secondary link hover
- `@media (prefers-reduced-motion: reduce)`: transition none
- `@media (prefers-reduced-transparency: reduce)`: opak control surface
- `@media (pointer: coarse)`: interactive hedef min block size
- `.metricStrip` için taşmasız grid veya component'in wrap sözleşmesine uygun
  konteyner
- sayılarda `font-variant-numeric: tabular-nums`

Raw `px`, hex, gradient ve box-shadow yazma.

- [ ] **Step 5: Workspace testlerini yeşile getir**

Run:

```bash
npx vitest run apps/web/src/features/account/AccountWorkspace.test.tsx
```

Expected: PASS.

- [ ] **Step 6: On dört Storybook senaryosunu yaz**

Title:

```ts
title: 'Sayfalar/Hesabım/Enterprise Genel Bakış'
```

Story'ler:

- `Default`
- `AliciHesabi`
- `IslemGerekiyor`
- `YeniHesap`
- `Loading`
- `PartialError`
- `Restricted`
- `UzunIcerik`
- `Mobile390`
- `Tablet768`
- `Kagit`
- `Grafit`
- `Erisilebilirlik`
- `SessionExpired`

Story decorator gerçek memory router sağlamalı. `Erisilebilirlik` play
fonksiyonu primary linke odaklanıp focus-visible davranışını ve heading
varlığını kontrol etmeli. `Mobile390` ve `Tablet768` mevcut preview viewport
anahtarlarını kullanmalı.

- [ ] **Step 7: Feature sözleşmesini ve export'u tamamla**

`rules.md` şu değişmezleri yazılı hale getirsin:

- tek primary action,
- en fazla üç attention item,
- tek local glass surface,
- gerçek route olmadan kontrol yok,
- session-expired kişisel veri çizmez,
- unsupported listing state eşlenmez,
- section errors yerel kalır,
- DOM ve mobil görsel sıra aynıdır.

`index.ts`:

```ts
export { AccountWorkspace } from './AccountWorkspace'
export type { AccountWorkspaceProps } from './domain/account-types'
export { ACCOUNT_FIXTURES } from './data/account-fixtures'
```

- [ ] **Step 8: CSS politika ve feature testlerini çalıştır**

Run:

```bash
if rg -n '#[0-9a-fA-F]{3,8}|rgb\\(|hsl\\(|[0-9]+px|linear-gradient|radial-gradient|!important|box-shadow' \
  apps/web/src/features/account --glob '*.css'; then
  exit 1
fi
npx vitest run apps/web/src/features/account
npx tsc --noEmit -p apps/web/tsconfig.json
```

Expected: politika taraması eşleşme bulmaz; test ve typecheck PASS.

- [ ] **Step 9: Görev kontrol noktası**

Run:

```bash
git diff --check -- apps/web/src/features/account
```

Expected: PASS; commit oluşturma.

---

### Task 6: Gerçek `/hesabim` rotası ve route-aware shell etiketi

**Files:**

- Modify: `apps/web/src/routes/hesabim.tsx`
- Create: `apps/web/src/routes/hesabim.test.tsx`
- Modify: `apps/web/src/components/MarketplaceShell.tsx`
- Modify: `apps/web/src/components/MarketplaceShell.test.tsx`

**Interfaces:**

- Consumes:
  - `AccountWorkspace`
  - `ACCOUNT_FIXTURES.default`
- Produces:
  - üretim rotasında gerçek hesap ekranı,
  - account scope içinde “Hesabım” shell etiketi.

- [ ] **Step 1: Rota ve shell için kırmızı testleri yaz**

`hesabim.test.tsx`, mevcut `karsilastir.test.tsx` memory router kalıbını
kullansın:

```tsx
it('mounts the enterprise account workspace instead of the placeholder', async () => {
  renderRoute('/hesabim')

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Hesabım' }),
  ).toBeTruthy()
  expect(screen.queryByText(/bu alana yerleşecek/i)).toBeNull()
  expect(
    screen.getByRole('link', { name: 'Yeni ilan ver' }).getAttribute('href'),
  ).toBe('/ilan-ver')
})
```

`MarketplaceShell.test.tsx` mock `GlassIslandHeader` içinde `extras` prop'unu
render edecek biçimde genişletilsin. Şunları test et:

- pathname `/hesabim` iken “Hesabım”
- pathname `/hesabim/mesajlar` iken “Hesabım”
- pathname `/emlak` iken “Üye girişi”

- [ ] **Step 2: Entegrasyon testlerinin kırmızı olduğunu doğrula**

Run:

```bash
npx vitest run \
  apps/web/src/routes/hesabim.test.tsx \
  apps/web/src/components/MarketplaceShell.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Hesabım rotasını bağla**

`hesabim.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import {
  ACCOUNT_FIXTURES,
  AccountWorkspace,
} from '@/features/account'

export const Route = createFileRoute('/hesabim')({
  head: () => createPageHead('account'),
  component: () => (
    <AccountWorkspace data={ACCOUNT_FIXTURES.default} />
  ),
})
```

`routeTree.gen.ts` dosyasına elle dokunma.

- [ ] **Step 4: Shell hesap etiketini route scope'a göre düzelt**

`MarketplaceShell.tsx` içindeki mevcut hesap GlassButton metni:

```tsx
{currentRoute.scope === 'account' ? 'Hesabım' : 'Üye girişi'}
```

olarak değişsin. Navigasyon yöntemi ve diğer shell kontrolleri değişmesin.

- [ ] **Step 5: Rota ve shell testlerini yeşile getir**

Run:

```bash
npx vitest run \
  apps/web/src/routes/hesabim.test.tsx \
  apps/web/src/components/MarketplaceShell.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Rota head sözleşmesini doğrula**

Testte `Route.options.head` fonksiyonunu çağır ve:

- title `Hesabım | arsam.net`
- robots `noindex, nofollow`
- canonical `/hesabim`

değerlerini doğrula.

- [ ] **Step 7: Görev kontrol noktası**

Run:

```bash
git diff --check -- \
  apps/web/src/routes/hesabim.tsx \
  apps/web/src/routes/hesabim.test.tsx \
  apps/web/src/components/MarketplaceShell.tsx \
  apps/web/src/components/MarketplaceShell.test.tsx
npm run typecheck:web
```

Expected: PASS; commit oluşturma.

---

### Task 7: Playwright, Axe ve pixel-level kabul doğrulaması

**Files:**

- Create: `apps/web/e2e/account.spec.ts`
- Create on first approved run:
  `apps/web/e2e/account.spec.ts-snapshots/account-desktop-desktop-chrome-darwin.png`
- Create on first approved run:
  `apps/web/e2e/account.spec.ts-snapshots/account-mobile-desktop-chrome-darwin.png`

**Interfaces:**

- Consumes gerçek `/hesabim` rotası ve global shell.
- Produces otomatik görsel, erişilebilirlik ve responsive kabul kapısı.

- [ ] **Step 1: E2E kabul testini yaz**

Temel masaüstü testi:

```ts
test('hesap merkezi masaüstünde erişilebilir ve cam bütçesine uyar', async ({
  page,
}) => {
  await page.goto('/hesabim')
  await expect(page.getByRole('heading', { name: 'Hesabım' })).toBeVisible()
  await expect(page.locator('.shell-dock-variant')).toHaveCount(1)

  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(
    accessibility.violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    ),
  ).toEqual([])

  expect(
    await page.locator('main#main-content [data-material="glass"]').count(),
  ).toBeLessThanOrEqual(1)
  await expect(
    page.getByRole('button', { name: 'Hızlı gezinme' })
      .locator('xpath=ancestor::*[@data-material][1]'),
  ).toHaveAttribute('data-material', 'glass')
  await expect(
    page.getByRole('navigation', { name: 'Ana gezinme' })
      .locator('[data-material="glass"]'),
  ).toHaveCount(1)
  expect(
    await page.locator('[data-variant="primary"]').count(),
  ).toBe(1)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)

  await expect(page).toHaveScreenshot('account-desktop.png', {
    fullPage: true,
  })
})
```

Mobil testte `page.setViewportSize({ width: 390, height: 844 })`, yatay taşma,
bölüm DOM sırası ve `account-mobile.png` screenshot'ı doğrulansın.

- [ ] **Step 2: Dock odak örtüşmesini test et**

Son account linkine klavye ile odaklan. Link ve Dock bounding box'larını al:

```ts
expect(lastFocusBox!.y + lastFocusBox!.height)
  .toBeLessThanOrEqual(dockBox!.y)
```

Gerekirse `scrollIntoViewIfNeeded()` kullan; CSS'i testten gizlemek için
Dock'u kapatma.

- [ ] **Step 3: Reduced motion ve transparency testini yaz**

- Playwright config zaten reduced motion kullanır.
- `page.emulateMedia({ reducedMotion: 'reduce' })` sonrası account feature
  içindeki transition duration değerlerinin `0s` olmasını doğrula.
- `prefers-reduced-transparency` Playwright tarafından emüle edilemiyorsa
  component CSS kuralının varlığı Vitest/CSS politika taramasıyla korunur;
  E2E'de olmayan browser özelliği için sahte JS flag ekleme.

- [ ] **Step 4: E2E testini çalıştır ve ilk kırmızı sonucu sınıflandır**

Run:

```bash
npx playwright test apps/web/e2e/account.spec.ts
```

Expected ilk çalıştırmada screenshot missing nedeniyle FAIL; işlevsel, Axe,
overflow ve Dock assertion'ları screenshot adımına kadar PASS.

- [ ] **Step 5: Yalnız doğrulanmış görsel snapshot'ları üret**

Önce failure screenshot ve trace'i görsel olarak incele. Hizalama, metin
taşması, odak veya Dock örtüşmesi yoksa:

```bash
npx playwright test apps/web/e2e/account.spec.ts --update-snapshots=all
```

Ardından normal komutu tekrar çalıştır.

Expected: PASS.

- [ ] **Step 6: Görev kontrol noktası**

Run:

```bash
git diff --check -- apps/web/e2e/account.spec.ts
```

Expected: PASS; commit oluşturma.

---

### Task 8: Tam regresyon, tarayıcı incelemesi ve teslim

**Files:**

- Verify only: bu plandaki tüm dosyalar

**Interfaces:**

- Consumes tüm feature ve entegrasyon değişiklikleri.
- Produces doğrulanmış teslim.

- [ ] **Step 1: Hesap test paketini çalıştır**

Run:

```bash
npx vitest run apps/web/src/features/account \
  apps/web/src/routes/hesabim.test.tsx \
  apps/web/src/components/MarketplaceShell.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Tam typecheck ve lint çalıştır**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: PASS. İlgisiz mevcut worktree hatası çıkarsa hesap kapsamındaki hata
ile ayrıştır; kullanıcı değişikliklerini düzeltme veya silme.

- [ ] **Step 3: Web ve Storybook build doğrula**

Run:

```bash
npm run build:web
npm run build:storybook
```

Expected: PASS.

- [ ] **Step 4: Hesap E2E testini normal modda tekrar çalıştır**

Run:

```bash
npx playwright test apps/web/e2e/account.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Tarayıcıda masaüstü ve mobil görsel inceleme yap**

Kontrol listesi:

- 1440×900 masaüstünde ortak sol/sağ eksen,
- kimlik, gündem ve metriklerin düzenli dikey ritmi,
- ana 2:1 grid baseline hizası,
- içerik kartlarında gölge ve gradient bulunmaması,
- primary CTA metin kontrastı,
- Kağıt ve Grafit tema,
- 390×844 mobilde tek kolon ve doğru bölüm sırası,
- Dock ile son içerik arasında güvenli alan,
- uzun Türkçe metinde taşma olmaması,
- focus-visible halkasının kırpılmaması.

- [ ] **Step 6: Son diff ve kapsam denetimi**

Run:

```bash
git status --short
git diff --check
git diff -- \
  apps/web/src/features/account \
  apps/web/src/routes/hesabim.tsx \
  apps/web/src/routes/hesabim.test.tsx \
  apps/web/src/components/MarketplaceShell.tsx \
  apps/web/src/components/MarketplaceShell.test.tsx \
  apps/web/e2e/account.spec.ts
```

Expected:

- yalnız plan kapsamındaki yeni/değişen dosyalar teslim özetine alınır,
- mevcut ilgisiz worktree değişiklikleri korunur,
- whitespace hatası yoktur.

- [ ] **Step 7: Teslim özetini hazırla**

Özet:

- `/hesabim` placeholder kaldırıldı,
- action-first hesap merkezi eklendi,
- state/story/test kapsamı,
- gerçek route bağlantıları,
- doğrulama komutları ve sonuçları,
- `.git` salt okunur olduğu için commit oluşturulmadığı

bilgilerini içerir.
