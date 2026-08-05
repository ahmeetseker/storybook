---
name: GlassSidebar
category: navigasyon
status: hazır
lastReviewed: 2026-08-02
---

# GlassSidebar Kuralları

## 1. Amaç

Yüzen cam kenar çubuğu: hesap değiştirici, başlık, düz öğeler, etkileşimsiz
bölüm başlıkları ve açılır/kapanır (disclosure) gruplarla hiyerarşik
navigasyon; seçim vurgusu satırlar arasında kayan tek kapsüldür (layoutId).
**Compound API:** `GlassSidebar` + `.Header` + `.Switcher` + `.Item` +
`.Group` + `.Section` + `.Footer`.

- **Kullan:** Hesabım çalışma alanının bölüm navigasyonu (AccountShell); gruplu
  içerik listeleri (Music demo: Library / Playlists).
- **Kullanma:** 3–6 öğelik düz uygulama sekmeleri (→ `GlassTabBar`), sayfa içi
  içerik sekmeleri (→ `GlassTabs`), geçici menü/overlay (portal'lı bir Menu yok).

| İlgili | Farkı |
|---|---|
| GlassTabBar | Dikey ama ikon-odaklı, gruplama yok, `role="tablist"` kullanır |
| GlassDrawer | Dar ekranda sidebar'ı *taşıyan* overlay; içine `material="flat"` sidebar konur |

## 2. Semantik sözleşme

- Kök: `GlassSurface as="nav"` (`shape=24`, `thickness=0.5`, `material`) +
  `aria-label` (default `"Kenar çubuğu"`).
- Item: `<button type="button">`; seçiliyse `aria-current="page"` (tab değil —
  navigasyon semantiği). Link (`href`) desteklenmez (Açık Kararlar).
- Group başlığı: `<button aria-expanded aria-controls={regionId}>`; öğeler
  `useId`'li bölgede, kapalıyken **DOM'dan çıkar** (AnimatePresence exit).
- Section: `<div role="group" aria-labelledby>` + etkileşimsiz `<span>` başlık —
  buton değildir, açılıp kapanmaz.
- Footer: yalnız görsel/yerleşim kabı (`margin-top: auto` + üst saç çizgisi);
  ek semantik taşımaz, içindeki Item'lar normal navigasyon öğeleridir.
- Switcher: `<button aria-haspopup="menu" aria-expanded aria-controls>` +
  `role="menu"` panel; seçenekler `role="menuitemradio"` + `aria-checked`,
  opsiyonel eylem `role="menuitem"`. Tetikleyicinin erişilebilir adı
  `"{label}: {seçili hesap}"`.
- Rozet: `badgeLabel` verilirse rozet metni + açıklama erişilebilir ada girer
  ("Mesajlar 2 okunmamış mesaj"). Kısayol ipucu (`hint`) **dekoratiftir**
  (`aria-hidden`) — ada karışmaz.
- `collapsed` **görsel bir eksendir**: ad taşıyan hiçbir metin DOM'dan çıkmaz,
  yalnız `.srOnly` ile görünmez kılınır — `aria-current`, rozet adı ve Section'ın
  `aria-labelledby` bağı rayda da geçerlidir. Tek istisna `Header` (render
  edilmez) ve dekoratif `hint`/chevron (`display: none`).
- Alt component'ler context dışında anlamlı hata fırlatır; iç içe `Group`
  DEV'de `console.warn` üretir (HIG: en fazla iki seviye).
- Highlight kapsülü `aria-hidden`; layoutId sidebar örneğine özgü (`useId`).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Switcher.options | Switcher varsa ✅ | `{id,label,meta?}[]` | Monogram `label`in ilk harfi; liste FLAT panel |
| Switcher.action | — | `{label,onSelect}` | Liste sonunda ayraçla ayrılır |
| Header.title | Header varsa ✅ | `ReactNode` | 28px display; tek başlık |
| Header.subtitle | — | `ReactNode` | 14px, opacity .6 |
| Header.action | — | `ReactNode` | Sağa yaslanır; çağıran erişilebilirliği sağlar |
| Item.icon | — | `ReactNode` (svg) | 22px hücre, svg 18px, `aria-hidden` |
| Item.children | ✅ | metin | Tek satır, `ellipsis` ile kırpılır |
| Item.badge | — | `ReactNode` | Kapsül; accent zemin + accent-contrast metin |
| Item.badgeLabel | — | `string` | Rozetin anlamı; ekran okuyucuya okunur |
| Item.hint | — | `ReactNode` | Kısayol ipucu (`⌘K`), dekoratif |
| Group.label | ✅ | `ReactNode` | Disclosure başlığı; chevron otomatik |
| Group.icon | — | `ReactNode` | Verilirse başlık öğe satırı gibi hizalanır (44px) |
| Group.children | ✅ | `Item`'lar | Tek seviye; girintili + saç çizgili bağlantı |
| Section.label | ✅ | `ReactNode` | Küçük, aralıklı, uppercase; tıklanamaz |
| Footer.children | ✅ | `Item`'lar | Alta yapışır; üstünde hairline |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| selected | prop | `string` | — | ✅ yalnız controlled | Seçili Item id'si; opsiyonel |
| onSelect | prop | `(id: string) => void` | — | ✅ | Item tıklamasında |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | — | GlassSurface'e geçer |
| material | prop | `'glass'\|'flat'` | `'glass'` | — | `'flat'`: overlay içinde ikinci cam katmanı önler |
| density | prop | `'comfortable'\|'compact'` | `'comfortable'` | — | Satır yoğunluğu; `compact` 36px satır (dokunmatikte CSS ile 44px'e döner) |
| collapsed | prop | `boolean` | `false` | — | İkon-only 68px ray; etiketler görsel gizlenir, ad korunur |
| aria-label | prop | `string` | `'Kenar çubuğu'` | — | nav adı |
| className | prop | `string` | — | — | Kök nav'a eklenir |
| Item.id | prop | `string` | — (zorunlu) | — | Seçim kimliği |
| Item.icon / badge / badgeLabel / hint | prop | `ReactNode`/`string` | — | — | bkz. Anatomy |
| Group.icon / badge / badgeLabel | prop | `ReactNode`/`string` | — | — | Başlık satırında |
| Group.defaultOpen | prop | `boolean` | `true` | uncontrolled | Disclosure başlangıcı |
| Switcher.value | prop | `string` | — | ✅ controlled | Seçili hesap/mağaza |
| Switcher.defaultValue | prop | `string` | ilk seçenek | uncontrolled | Başlangıç değeri |
| Switcher.onValueChange | prop | `(id: string) => void` | — | ✅ | Seçim değişiminde |
| Switcher.label | prop | `string` | `'Hesap seç'` | — | Tetikleyici + menü adı |
| Switcher.action | prop | `{label,onSelect}` | — | — | Liste sonu eylemi |

Üç state modeli: **seçim controlled-only** (`defaultSelected` yok), **grup
açıklığı uncontrolled-only** (`open`/`onOpenChange` yok), **Switcher değeri
controlled + uncontrolled** (`value` / `defaultValue` + `onValueChange` —
Eksenler dokümanındaki controlled deseni). Switcher'ın açık/kapalı durumu
her zaman içeridedir. `...rest` geçirilmez; `onSelect` zaten seçili öğeye
tıklanınca da çağrılır. Ref hedefi yok. `density` ve `collapsed` **saf görünüm
eksenleridir** — kök nav'a `data-density` / `data-collapsed="true"` olarak da
yansırlar (test ve dış yerleşim kancası); semantiği değiştirmezler.

`GlassSidebarDensity` (`'comfortable' | 'compact'`) tipi component klasöründen
export edilir.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `material=glass`, `tone=auto`, `density=comfortable`,
`collapsed=false`, seçimsiz, gruplar açık.

| Kural / türetilen | Davranış |
|---|---|
| `selected` verilmezse | Hiçbir öğe vurgulanmaz; salt aksiyon listesi gibi çalışır |
| `selected` bilinmeyen id | Highlight ve `aria-current` üretilmez (test kapsamında) |
| Seçili öğe kapalı Group içindeyse | Highlight DOM'dan çıkar; grup açılınca animasyonsuz geri gelir |
| `material="flat"` | Genişlik `100%` (kapsayıcıya uyar), hover/selected katmanları beyaz-alfa yerine `color-mix(--lg-label)` |
| `size` ekseni | Yok — kontrol katmanı; genişlik cam modda 300px, flat modda kapsayıcı |
| iç içe Group | Yasak — DEV `console.warn`, render yine yapılır |
| Section içinde Group | Serbest — Section derinlik sayacını artırmaz |

**`density` (yoğunluk):** yalnız yerel geometri değişkenlerini yeniden bağlar,
hiçbir DOM/ARIA farkı üretmez.

| | comfortable | compact |
|---|---|---|
| satır yüksekliği (`--touch-target`) | 44px | 36px · `pointer: coarse` → **44px** |
| öğe fontu (`--item-font`) | 15.5px | 13.5px |
| ikon hücresi / svg | 22 / 18px | 20 / 16px |
| satır iç boşluğu (`--row-pad-x`) | `--lg-space-3` | `--lg-space-2` |
| grup/bölüm üst boşluğu (`--group-gap`) | 18px | 10px |
| grup başlığı fontu | `--lg-text-headline` | `--lg-text-footnote` |
| bölüm başlığı fontu | `--lg-text-badge` (11px) | 10px |
| kök padding | `--lg-space-5 / -3` | `--lg-space-3 / -2` |
| başlık fontu | `--lg-text-display` | `--lg-text-title` |
| monogram / rozet | 34 / 20px | 28 / 18px |

Dokunma hedefinin geri dönüşü **CSS'tedir** (`@media (pointer: coarse) { .compact
{ --touch-target: 44px } }`) — JS'te yetenek algılama yok, WCAG 2.5.5 (AAA) ve
Tokenlar dokümanındaki "dokunmatikte min 44px" kuralı kompakt ölçekte de geçerli.

**`collapsed` (ikon-only ray):** 300px → 68px (`--rail-width`). `.flat`ten sonra
tanımlanır, yani çekmece içinde de ray genişliğini kazanır.

| Parça | Daraltılmış davranış |
|---|---|
| `Item.children`, `Group.label`, `Section.label`, `Switcher` metni | `.srOnly` sınıfı TSX'te eklenir — **DOM'da kalır**, erişilebilir ad ve `aria-labelledby` bağı bozulmaz |
| `Item.badge` | İkonun sağ üstünde `--badge-dot` (8px) nokta; sayı `.srOnly`, `badgeLabel` okunmaya devam eder |
| `Item.hint`, chevron'lar | `display: none` — zaten `aria-hidden`, dekoratif |
| `Header` | **Render edilmez** (`return null`): 68px'e sığmaz ve Switcher monogramıyla görsel olarak çakışır; nav'ın adı `aria-label`dan gelir, ad kaybı yok. `Header.action` bu modda kullanılamaz |
| `Switcher` | Yalnız monogram düğmesi; menü yine açılır, panel `min-width: --rail-menu-width` (240px) ile raydan taşar |
| `Group` alt öğeleri | Girinti ve bağlantı çizgisi kalkar (tek ikon ekseni) |
| tooltip | `Item`/`Group`/`Switcher` **metin çocuk string ise** `title` alır; ReactNode etiketlerde `title` verilmez |

`density="compact" collapsed` birlikte kullanılabilir — eksenler bağımsızdır
(ray 68px kalır, satır 36px'e iner, dokunmatikte yine 44px).

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| selected (Item) | prop (controlled) | hover görselini (highlight üstte) | `aria-current="page"` |
| expanded (Group) | iç state (`useState`) | — | `aria-expanded` + `aria-controls` |
| open (Switcher) | iç state | — | `aria-expanded` + `aria-controls` |
| value (Switcher) | prop ya da iç state | — | `aria-checked` (menuitemradio) |
| hover (Item/GroupHeader/Switcher) | CSS `:hover`, yalnız `hover: hover` | — | zemin `--hover-bg` / `--group-hover-bg` |
| focus-visible | `outline: 2px solid var(--lg-accent)` + offset | — | Erişilebilirlik dokümanının tek halkası |
| disabled | — | — | Desteklenmiyor |

Katman sırası: value (selected highlight) → interaction (hover) → focus halkası.

## 7. Davranış

- Pointer: Item tıklaması `onSelect(id)`; Group başlığı iç `open` state'ini
  çevirir; Switcher tetikleyicisi menüyü açar/kapatır. Tüm satırlar min 44px.
- **Keyboard (Item/Group): yalnız Tab/Shift+Tab + Enter/Space.** Ok tuşu
  navigasyonu ve roving tabindex yok — her öğe tab durağıdır (Açık Kararlar).
- **Keyboard (Switcher menüsü):** açılışta odak seçili satıra gider;
  ↑/↓ döngüsel gezinir, Home/End uçlara gider, Escape kapatır ve **odağı
  tetikleyiciye döndürür**, Tab menüyü kapatır (odak akışa devam eder).
  Dışarı `pointerdown` menüyü kapatır (odak taşınmaz). Focus trap **yok** —
  menü kısa listedir, portal kullanılmaz.
- Disclosure animasyonu: height 0↔auto + opacity, 0.32s `cubic-bezier(0.32,0.72,0,1)`;
  Switcher paneli 0.18s opacity+scale; `prefers-reduced-motion` → yalnız
  opacity, süre 0. Kayan highlight spring'i `presets.springs.sidebar` (260/32).
- Kapalı grup öğeleri DOM'dan çıktığından focus içerideyken grup kapatılırsa
  focus body'ye düşer (yönetilmiyor — Açık Kararlar).
- Async / overlay: N/A — senkron; Switcher paneli sidebar akışında konumlanır
  (portal yok), bu yüzden dar kapsayıcıda kırpılmaya karşı `z-index: 2` alır.

## 8. İçerik kuralları

- Item etiketi tek satır; taşan metin `ellipsis` ile kırpılır.
- Rozet sayısal ya da çok kısa metin ("Yeni"); sayı 0 ise **rozet verilmez**
  (çağıran `badge={sayi || undefined}` ile eler).
- Rozet verildiğinde `badgeLabel` de verilmelidir — yalnız sayı okunursa
  ("Mesajlar 2") anlam ekran okuyucuda kaybolur.
- `hint` yalnız gerçekten bağlanmış bir kısayolu gösterir; kabuk kısayolu
  dinlemiyorsa ipucu yazılmaz.
- Section başlığı 1–2 kelime, uppercase'e CSS ile dönüştürülür (metin normal
  yazılır — ekran okuyucu harf harf okumasın).
- İkonlar opsiyonel ama **grup içinde tutarlı** olmalı: ya hepsi ikonlu ya hiçbiri.
- Lokalizasyon: `aria-label` ve `Switcher.label` default'ları Türkçe.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök | cam/flat görünüm | GlassSurface (`material`, `thickness=0.5`, `tone`) | — |
| monogram / rozet | zemin + metin | `--lg-accent` / `--lg-accent-contrast` | — |
| switcher paneli | zemin/çerçeve/gölge | `--lg-surface` · `--lg-hairline` · `--lg-shadow-md` | seçili satır `color-mix(--lg-accent 12%)` |
| grup bağlantı çizgisi / footer ayracı | hairline | `--lg-hairline` + `--lg-stroke-hairline` | — |
| focus halkası | outline | `--lg-focus-ring-width` + `--lg-accent` + offset | yalnız `:focus-visible` |
| rozet/ipucu tipografi | font-size | `--lg-text-badge` | — |
| highlight/disclosure geçişi | spring / easing | `presets.springs.sidebar` | reduced-motion → 0 |
| yoğunluk / ray geometrisi | ölçek | kök yerel değişkenler | `.compact` / `.collapsed` yeniden bağlar |

**Borç (raw / mikro-geometri):** Token'a bağlananlar: boşluklar
(`--lg-space-*`), title `--lg-text-display` (compact `--lg-text-title`),
groupHeader `--lg-text-headline` (compact `--lg-text-footnote`), subtitle
compact'ta `--lg-text-footnote`, radius `--lg-radius-media/chip/capsule`.
Token karşılığı olmayanlar kökte yerel değişkende toplanır:
`--sidebar-width: 300px` · `--subtitle-size: 14px` + `--subtitle-gap: 2px` ·
`--item-font: 15.5px` · `--item-gap: 14px` · `--touch-target: 44px` ·
`--group-gap: 18px` · `--group-pad-y: 6px` · `--icon-box: 22px` /
`--icon-size: 18px` · `--chevron-box: 16px` / `--chevron-size: 8px` /
`--chevron-stroke: 2px` · `--monogram-box: 34px` · `--badge-min: 20px` ·
`--child-indent: 18px`. **Yeni eksenlerle eklenen yerel değişkenler:**
`--pad-y` / `--pad-x` / `--row-pad-x` / `--header-pad-b` / `--title-font` /
`--group-font` / `--section-font` (hepsi token değerine bağlanır — yalnız
`--section-font`ın compact değeri `10px` raw'dır, `--lg-text-badge`in altında
bir adım yok) · compact ölçek `--item-font: 13.5px` · `--item-gap: 10px` ·
`--touch-target: 36px` · `--group-gap: 10px` · `--icon-box: 20px` /
`--icon-size: 16px` · `--monogram-box: 28px` · `--badge-min: 18px` ·
`--child-indent: 14px` · ray ölçeği `--rail-width: 68px` ·
`--rail-menu-width: 240px` · `--badge-dot: 8px`. Cam moddaki beyaz-alfa
katmanları bilinçli malzeme etkisi olarak korunur (`--selected-bg .18` ·
`--hover-bg .08` · `--group-hover-bg .06`); flat modda bunlar
`color-mix(in srgb, var(--lg-label) …)` karşılıklarıyla değiştirilir.
Kalan borçlar: `shape={24}` sayısal (radius ölçeğinde yok) · title `800` /
item `500` ağırlıkları tipografi ölçeği (400/600/700) dışı · switcher
panelinin `z-index: 2`'si için token yok · compact `36px` satır ve `68px` ray
kontrol yüksekliği ölçeğinde (`--lg-control-*` hepsi ≥44px) yok.

## 10. Storybook kapsamı

Var: **Default** (Music Library demo) · **Controlled** · **Groups** ·
**States** (seçimli/açık ↔ seçimsiz/kapalı) · **Responsive** (dar kapsayıcı,
iç kaydırma) · **Erisilebilirlik** (aria-current / aria-expanded play testi) ·
**HesapNavigasyonu** (arsa-emlak hesabı: Switcher + Section + rozet + ipucu +
alt kırılımlı Group + Footer) · **CekmeceIcinde** (`material="flat"`, mobil
viewport) · **HesapDegistirici** (menu açılışı, `menuitemradio`, Escape ile
odak dönüşü — play testi) · **Kompakt** (comfortable ↔ compact yan yana, aynı
içerik) · **DaraltilmisRay** (68px ray; daralt/genişlet düğmesi + play testi:
erişilebilir ad, `title`, `role="group"` adı ve monogram Switcher menüsü).
**Eksik:** Playground (Controls matrisi) · `density="compact" collapsed`
kombinasyonu için ayrı story (Controls'tan denenebilir). Sizes: N/A —
`density` yoğunluk ekseni, `size` değil.

## 11. Test kabul kriterleri

- [x] `nav` rolü, başlık ve öğeler render olur (unit)
- [x] Item tıklaması `onSelect`'i doğru id ile çağırır (interaction)
- [x] Seçili öğe `aria-current="page"`; bilinmeyen `selected` vurgu üretmez
- [x] Group `aria-expanded` günceller, kapanınca öğeler DOM'dan çıkar
- [x] İç içe Group DEV uyarısı üretir
- [x] Context dışı Item anlamlı hata fırlatır
- [x] Rozet + `badgeLabel` erişilebilir ada girer; `hint` adı kirletmez
- [x] Section `role="group"` verir ve buton üretmez; Footer öğeleri seçilebilir
- [x] Switcher: `aria-haspopup="menu"`, seçenekler `menuitemradio` + `aria-checked`
- [x] Switcher controlled/uncontrolled ayrımı (`value` verilince iç state yazılmaz)
- [x] Escape menüyü kapatır ve odağı tetikleyiciye döndürür
- [x] ↑/↓/Home/End menü satırları arasında odağı taşır
- [x] `density` default `comfortable`; `compact` yalnız ölçek sınıfı + `data-density`
      ekler, rozet adı / `role="group"` / başlık render'ı değişmez
- [x] `collapsed`: erişilebilir ad korunur — `getByRole('button', { name: /Mesajlar 2
      okunmamış mesaj/ })` hâlâ bulunur; etiket `.srOnly` alır (kritik)
- [x] `collapsed`: rozet sayısı görsel olarak gizlenir (`.srOnly`), `badgeLabel`
      okunmaya devam eder (kritik)
- [x] `collapsed`: Section başlığı `.srOnly` olur ama `role="group"` adı korunur;
      Group `aria-expanded` çalışmayı sürdürür
- [x] `collapsed`: metin çocuklu Item/Group/Switcher `title` ipucu alır, Header render edilmez
- [x] `density="compact" collapsed` birlikte çalışır (iki sınıf + ad korunumu)
- [x] `collapsed` Switcher monogram düğmesi adını korur, menü yine açılır
- [ ] `@media (pointer: coarse)` altında compact satırın 44px'e dönmesi (visual — jsdom
      medya sorgusu değerlendirmez)
- [ ] Daraltılmış rayda rozet noktasının ikon sağ üstüne oturması (visual/Chromatic)
- [ ] reduced-motion'da height animasyonu yerine opacity (visual)
- [ ] Kayan highlight'ın satırlar arası geçişi (visual/Chromatic)
- [ ] `material="flat"` katman kontrastı (visual)

## 12. Do / Don't

- ✅ Dar ekranda sidebar'ı `GlassDrawer` içine `material="flat"` ile koy —
  cam üstüne cam olmaz (bkz. AccountShell).
- ✅ `selected`'ı uygulama state'ine bağla — sidebar seçim tutmaz.
- ✅ Rozetle birlikte `badgeLabel` ver.
- ✅ `collapsed` kullanacaksan **her öğeye ikon ver** — ikonsuz öğe rayda boş satır olur.
- ✅ `collapsed`'ı kabuk state'inde tut; daralt/genişlet düğmesini sidebar dışında
  (kabukta) konumlandır — sidebar bu düğmeyi üretmez.
- ✅ Uzun bölüm listeleri için `density="compact"` — dokunmatikte satır zaten 44px'e döner.
- ❌ Group içine Group koyma (HIG iki seviye; DEV uyarısı verir).
- ❌ `hint` ile gerçekte var olmayan kısayolu gösterme.
- ❌ Aynı grup içinde ikonlu/ikonsuz öğeleri karıştırma.
- ❌ Switcher'ı cam panelli bir menüye çevirme — panel her zaman flat.
- ❌ `collapsed`'da etiket metnini DOM'dan silme (`{collapsed ? null : 'Mesajlar'}`) —
  erişilebilir ad kaybolur; gizleme component'in içinde `.srOnly` ile yapılır.
- ❌ `collapsed` ile birlikte `Header.action`'a güvenme — Header bu modda render edilmez.

**Bilinen kısıtlar:** Item `disabled` yok · link semantiği (`href`) yok —
router entegrasyonu `onSelect` üzerinden · grup açıklığı dışarıdan kontrol
edilemez · Switcher paneli portal kullanmaz (kırpan `overflow: hidden`
kapsayıcıda taşabilir; daraltılmış rayda panel 240px ile raydan taşar) ·
genişlik prop'u yok (className/`material`/`collapsed` ile ezilir) ·
`collapsed` daralt/genişlet düğmesi üretmez (kabuğun işi) · `collapsed`'da
`Header` düşer · `collapsed` tooltip'i yalnız string `children`/`label` için.

**Açık kararlar:** ok tuşu navigasyonu + roving tabindex (Item'lar için) ·
`Group` için `open`/`onOpenChange` çifti · `Item`'a `as`/`href` desteği ·
focus içindeyken kapanan grubun focus yönetimi · Switcher panelinin portal'a
taşınması · title 800 / item 500 ağırlıklarının tipografi ölçeğine çekilmesi ·
`collapsed` geçişinin (300px ↔ 68px) animasyonlanması · daraltılmış rayda
`Group`un flyout menüye dönüşmesi (şu an satır içi disclosure kalıyor).

**Changelog:**
- 2026-08-02 — `density` (`comfortable`/`compact`) ve `collapsed` (68px ikon-only
  ray) eksenleri eklendi; kompakt ölçek `@media (pointer: coarse)` altında 44px
  dokunma hedefine döner (WCAG 2.5.5). Daraltılmış rayda etiket/rozet metni
  `.srOnly` ile yalnız görsel olarak gizlenir, `Header` render edilmez, `Switcher`
  monograma iner, metin çocuklu satırlar `title` ipucu alır. Kök nav'a
  `data-density` / `data-collapsed` yansıtıldı. Geriye dönük uyumlu: varsayılanlar
  önceki görünümü birebir korur.
- 2026-08-02 — `material` ekseni (glass/flat), `Switcher`, `Section`, `Footer`
  eklendi; `Item`/`Group` rozet + `badgeLabel` + `hint` aldı; alt öğelere
  girinti ve bağlantı çizgisi; focus halkası `--lg-accent`'e bağlandı
  (eski borç kapandı). Hesabım kabuğu (AccountShell) bu API'yi tüketir.
- 2026-07-15 — ilk sözleşme, koddan çıkarıldı.
