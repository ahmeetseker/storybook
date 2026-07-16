---
name: GlassSidebar
category: navigasyon
status: hazır
lastReviewed: 2026-07-15
---

# GlassSidebar Kuralları

## 1. Amaç

Yüzen cam kenar çubuğu: başlık, düz öğeler ve açılır/kapanır (disclosure)
gruplarla hiyerarşik navigasyon; seçim vurgusu satırlar arasında kayan tek
kapsüldür (layoutId). **Compound API:** `GlassSidebar` + `.Header` + `.Item` +
`.Group`.

- **Kullan:** `GlassSplitView` içinde bölüm navigasyonu; gruplu içerik listeleri
  (Music demo: Library / Playlists).
- **Kullanma:** 3–6 öğelik düz uygulama sekmeleri (→ `GlassTabBar`), sayfa içi
  içerik sekmeleri (→ `GlassTabs`), geçici menü/overlay (portal'lı bir Menu yok).

| İlgili | Farkı |
|---|---|
| GlassTabBar | Dikey ama ikon-odaklı, gruplama yok, `role="tablist"` kullanır |
| GlassSplitView | Sidebar'ı *yerleştiren* layout; Sidebar'ın kendisi camdır |

## 2. Semantik sözleşme

- Kök: `GlassSurface as="nav"` (`shape=24`, `thickness=0.5`) +
  `aria-label` (default `"Kenar çubuğu"`).
- Item: `<button type="button">`; seçiliyse `aria-current="page"` (tab değil —
  navigasyon semantiği). Link (`href`) desteklenmez (Açık Kararlar).
- Group başlığı: `<button aria-expanded aria-controls={regionId}>`; öğeler
  `useId`'li bölgede, kapalıyken **DOM'dan çıkar** (AnimatePresence exit).
- Header: `<header>`; `title` span, opsiyonel `subtitle` + `action`.
- Alt component'ler context dışında anlamlı hata fırlatır; iç içe `Group`
  DEV'de `console.warn` üretir (HIG: en fazla iki seviye).
- Highlight kapsülü `aria-hidden`; layoutId sidebar örneğine özgü (`useId`).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Header.title | Header varsa ✅ | `ReactNode` | 28px display; tek başlık |
| Header.subtitle | — | `ReactNode` | 14px, opacity .6 |
| Header.action | — | `ReactNode` | Sağa yaslanır; buton verilecekse çağıran erişilebilirliğini sağlar |
| Item.icon | — | `ReactNode` (svg) | 22px hücre, svg 18px, `aria-hidden` |
| Item.children | ✅ | metin | Tek satır, `ellipsis` ile kırpılır |
| Group.label | ✅ | `ReactNode` | Disclosure başlığı; chevron otomatik |
| Group.children | ✅ | `Item`'lar | Tek seviye — iç içe Group yasak (DEV uyarısı) |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| selected | prop | `string` | — | ✅ yalnız controlled | Seçili Item id'si; opsiyonel |
| onSelect | prop | `(id: string) => void` | — | ✅ | Item tıklamasında |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | — | GlassSurface'e geçer |
| aria-label | prop | `string` | `'Kenar çubuğu'` | — | nav adı |
| className | prop | `string` | — | — | Kök nav'a eklenir |
| Item.id | prop | `string` | — (zorunlu) | — | Seçim kimliği |
| Item.icon | prop | `ReactNode` | — | — | Opsiyonel simge |
| Group.defaultOpen | prop | `boolean` | `true` | uncontrolled | Disclosure başlangıcı |

İki ayrı state modeli: **seçim controlled-only** (`defaultSelected` yok, iç
state tutulmaz), **grup açıklığı uncontrolled-only** (`open`/`onOpenChange`
yok — bkz. Açık Kararlar). `...rest` geçirilmez; `onSelect` zaten seçili
öğeye tıklanınca da çağrılır. Ref hedefi yok.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `tone=auto`, seçimsiz, gruplar açık.

| Kural / türetilen | Davranış |
|---|---|
| `selected` verilmezse | Hiçbir öğe vurgulanmaz; salt aksiyon listesi gibi çalışır |
| `selected` bilinmeyen id | Highlight ve `aria-current` üretilmez (test kapsamında) |
| Seçili öğe kapalı Group içindeyse | Highlight DOM'dan çıkar; grup açılınca layout animasyonsuz geri gelir |
| `material` / `size` ekseni | Yok — kontrol katmanı, her zaman cam; tek boyut (300px) |
| iç içe Group | Yasak — DEV `console.warn`, render yine yapılır |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| selected (Item) | prop (controlled) | hover görselini (highlight üstte) | `aria-current="page"` |
| expanded (Group) | iç state (`useState`) | — | `aria-expanded` + `aria-controls` |
| hover (Item/GroupHeader) | CSS `:hover` | — | zemin `rgba(255,255,255,.08)` / `.06` |
| focus-visible | tarayıcı default'u | — | Özel `--lg-accent` halka tanımlı DEĞİL (Borç) |
| disabled | — | — | Desteklenmiyor |

Katman sırası: value (selected highlight .18) → interaction (hover .08).

## 7. Davranış

- Pointer: Item tıklaması `onSelect(id)`; Group başlığı tıklaması iç `open`
  state'ini çevirir. Item min-height 44px (dokunma hedefi kuralı sağlanır).
- **Keyboard: yalnız Tab/Shift+Tab + Enter/Space (native button).** Ok tuşu
  navigasyonu ve roving tabindex **yok** — her öğe tab durağıdır; uzun
  listelerde tab zinciri uzar. Eksik olarak Açık Kararlar'da.
- Disclosure animasyonu: height 0↔auto + opacity, 0.32s `cubic-bezier(0.32,0.72,0,1)`;
  `prefers-reduced-motion` → yalnız opacity, süre 0. Kayan highlight spring'i
  `presets.springs.sidebar` (260/32), reduced'da `duration: 0`.
- Kapalı grup öğeleri DOM'dan çıktığından focus içerideyken grup kapatılırsa
  focus body'ye düşer (yönetilmiyor — Açık Kararlar).
- Controlled seçim: parent `selected`'ı güncellemezse vurgu değişmez.
- Async / overlay: N/A — senkron, portal yok.

## 8. İçerik kuralları

- Item etiketi tek satır; taşan metin `text-overflow: ellipsis` ile kırpılır
  (genişlik 300px sabit) — tam metin gerekiyorsa `title` attribute'u çağırandan.
- Header `title` kısa tutulmalı (28px display, sarmaz diye kural yok — uzunsa sarar).
- İkonlar opsiyonel ama **grup içinde tutarlı** olmalı: ya hepsi ikonlu ya hiçbiri
  (hizalama `gap: 14px` + 22px hücreyle bozulur).
- Lokalizasyon: `aria-label` default'u Türkçe — farklı dilde override edilmeli.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök | cam görünümü | GlassSurface (`thickness=0.5`, `tone`) | — |
| item/groupHeader | font | miras (`font: inherit`) | — |
| highlight/disclosure geçişi | spring / easing | `presets.springs.sidebar` | reduced-motion → 0 |

**Borç (raw değerler):** genişlik `300px` · `shape={24}` sayısal (radius
ölçeğinde yok; card=20) · title `28px/800` — **ağırlık 800 tipografi kuralını
(400/600/700) aşıyor** · item `15.5px/500` — ölçek ve ağırlık kuralı dışı ·
groupHeader `17px/700` (≈`--lg-text-headline` ama raw, ağırlık farklı) ·
highlight `rgba(255,255,255,.18)`, hover `.08`/`.06` · item radius `14px`
(değer `--lg-radius-media`'ya eşit ama token'dan okunmuyor) · `min-height: 44px`
raw (kontrol token'ı yerine) · boşluklar (`padding: 20px 12px`, `gap: 14px`,
`margin-top: 18px`) `--lg-space-*` ölçeğinden okunmuyor · **focus-visible
halkası `--lg-accent`'e bağlanmamış**.

## 10. Storybook kapsamı

Var: **Default** (Music Library demo: Header + 4 Item + 1 Group, degrade
zemin, `tone="light"`) · **States** (seçimli/ikonlu/açık grup yanında
seçimsiz/ikonsuz/kapalı grup — `defaultOpen={false}`) · **UzunIcerik**
(ellipsis'i tetikleyen uzun TR etiketler, 6 öğeli grup, disclosure).
**Eksik:** Playground (Controls: `tone`, `aria-label`) · Responsive (dar/alçak
container'da iç kaydırma — kaydırmayı SplitView slot'u sağlar) · Temalar
(Kağıt/Grafit) · Erişilebilirlik (tab sırası, `aria-current`, disclosure).
Sizes / Variants-Materials: N/A — tek boyut, her zaman cam.

## 11. Test kabul kriterleri

- [x] `nav` rolü, başlık ve öğeler render olur (unit)
- [x] Item tıklaması `onSelect`'i doğru id ile çağırır (interaction)
- [x] Seçili öğe `aria-current="page"`; bilinmeyen `selected` vurgu üretmez
- [x] Group `aria-expanded` günceller, kapanınca öğeler DOM'dan çıkar
- [x] İç içe Group DEV uyarısı üretir
- [x] Context dışı Item anlamlı hata fırlatır
- [ ] reduced-motion'da height animasyonu yerine opacity (visual)
- [ ] Kayan highlight'ın satırlar arası geçişi (visual/Chromatic)
- [ ] `aria-controls` id'si bölge id'siyle eşleşir (a11y)

## 12. Do / Don't

- ✅ `GlassSplitView.sidebar` slot'una koy; genişliği SplitView'la eşle (300px).
- ✅ `selected`'ı uygulama state'ine bağla — sidebar seçim tutmaz.
- ❌ Group içine Group koyma (HIG iki seviye; DEV uyarısı verir).
- ❌ `Header.action` içine erişilebilir adı olmayan ikon-buton koyma.
- ❌ Aynı grup içinde ikonlu/ikonsuz öğeleri karıştırma.

**Bilinen kısıtlar:** Item `disabled` yok · link semantiği (`href`) yok —
router entegrasyonu `onSelect` üzerinden · grup açıklığı dışarıdan kontrol
edilemez · genişlik prop'u yok (className ile ezilebilir).

**Açık kararlar:** ok tuşu navigasyonu + roving tabindex eklenecek mi (uzun
listelerde tab zinciri sorunu) · `Group` için `open`/`onOpenChange` controlled
çifti · `Item`'a `as`/`href` desteği (`aria-current="page"` semantiğiyle link
daha doğru) · focus içindeyken kapanan grubun focus yönetimi · title 800 / item
500 ağırlıklarının tipografi ölçeğine çekilmesi.

**Changelog:** 2026-07-15 — ilk sözleşme, koddan çıkarıldı.

**Not (2026-07-16):** Storybook story dosyası kullanıcı isteğiyle kaldırıldı — component yalnız Hesabım sayfa demolarının kabuğunda (AccountShell) sergileniyor.
