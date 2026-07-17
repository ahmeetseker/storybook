---
name: GlassTable
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassTable Kuralları

## 1. Amaç

Gerçek `<table>` semantiğiyle sıralanabilir ve (opsiyonel) çoklu seçilebilir
veri tablosu. Faturalar, ilan listeleri, işlem geçmişi gibi satır×sütun
yapısındaki veriler için. İçerik katmanı component'idir — cam yok.

- **Kullan:** birden çok sütunlu, potansiyel olarak sıralanan/seçilen kayıt
  listesi (faturalar, ilanlar, mesajlar, işlemler).
- **Kullanma:** anahtar–değer çiftleri (→ `GlassSpecTable`), basit tek
  sütunlu liste (→ `GlassList`), kart tabanlı vitrin (→ `GlassVitrin`).

| İlgili | Farkı |
|---|---|
| GlassSpecTable | `dl` etiket/değer çifti; sıralama/seçim yok, satır=alan |
| GlassList | Tek sütunlu liste öğeleri; tablo grid'i yok |

## 2. Semantik sözleşme

- Kök: yatay kaydırma için `<div>` sarmalayıcı (`overflow-x: auto`) içinde
  gerçek `<table>`. `aria-label` prop'u tabloyu adlandırır (sayfada birden
  çok tablo varsa zorunlu — Do/Don't).
- `<thead>` > `<tr>` > `<th scope="col">`; sıralanabilir sütunlarda `th`
  içinde gerçek `<button type="button">` (başlık metni + ok ikonu birlikte
  tıklanabilir alan).
- `aria-sort`: yalnız `sortable` sütunlarda yazılır — aktif sütunda
  `"ascending"`/`"descending"`, sıralanabilir ama aktif olmayan sütunda
  `"none"`. Sıralanamayan sütunlarda hiç yazılmaz.
- Seçim sütunu: `th`/`td` içinde gerçek `GlassCheckbox` (native
  `<input type="checkbox">` + `label` üzerinden erişilebilir isim — burada
  görsel olarak gizli `span` ile, bkz. §8).
- DOM değişmezi: her satır tam bir `<tr>` üretir; `key` = `row.id` (zorunlu
  ve benzersiz olmalı — çağıranın sorumluluğu).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| columns | ✅ | `GlassTableColumn[]` | sıra = sütun sırası |
| rows | ✅ | `GlassTableRow[]` | `{id: string, ...}`; `id` benzersiz |
| seçim sütunu | selectable'da | `GlassCheckbox` | başlıkta tümü, satırda tekil |
| emptyState | — | `ReactNode` | `rows` boşken; default basit metin |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| columns | prop | `GlassTableColumn[]` (`{key, label, sortable?, align?, width?}`) | — (zorunlu) | — | Sütun tanımı |
| rows | prop | `GlassTableRow[]` (`{id: string} & Record<string, ReactNode>`) | — (zorunlu) | — | Zaten çağıran tarafından sıralanmış/filtrelenmiş veri |
| sortKey | prop | `string` | — | ✅ (`defaultSortKey` ile birlikte kontrolsüz) — controlled tespiti bu prop üzerinden yapılır, `sortDirection`'ın da controlled olup olmadığını belirler | Aktif sıralama sütunu |
| defaultSortKey | prop | `string` | — | — | Kontrolsüz başlangıç değeri |
| sortDirection | prop | `'asc'\|'desc'` | — | ✅ ama YALNIZ `sortKey` de controlled ise (verilmemişse `'asc'` varsayılır); `sortKey` yokken tek başına verilirse YOK sayılır | Aktif yön |
| defaultSortDirection | prop | `'asc'\|'desc'` | `'asc'` | — | Kontrolsüz başlangıç yönü (yalnız `sortKey` de uncontrolled iken kullanılır) |
| onSortChange | event | `(key, direction) => void` | — | — | Sıralanabilir başlığa tıklanınca; **component satırları SIRALAMAZ**, yalnız göstergeyi (ok yönü + `aria-sort`) günceller — yeni `rows`'u sağlamak çağıranın işidir |
| selectable | prop | `boolean` | `false` | — | Seçim sütununu açar |
| selectedIds | prop | `string[]` | — | ✅ (`defaultSelectedIds` ile kontrolsüz) | Seçili satır id'leri |
| defaultSelectedIds | prop | `string[]` | `[]` | — | Kontrolsüz başlangıç seçimi |
| onSelectedIdsChange | event | `(ids: string[]) => void` | — | — | Güncel tam id listesiyle çağrılır (tekil toggle da tümünü seç/temizle de) |
| emptyState | prop | `ReactNode` | `"Kayıt bulunamadı."` | — | `rows.length === 0` iken gösterilir |
| aria-label | prop | `string` | — | — | Tabloyu adlandırır |
| ...rest | — | `HTMLAttributes<HTMLTableElement>` (`onChange` hariç) | — | — | `<table>` elemanına geçer; `className` sarmalayıcı `div`'e uygulanır |

Ref hedefi: yok (v1). Event sözleşmesi: `onSortChange`/`onSelectedIdsChange`
yalnız kullanıcı etkileşimiyle (başlık tıklaması / checkbox değişimi) tetiklenir;
prop değişiminden tetiklenmez.

## 5. Seçenek eksenleri

Eksen yok (`material`/`tone`/`size`/`variant`/`thickness`/`tint`/`prominent`
N/A — flat içerik yüzeyi, tek görünüm). `selectable` bir özellik anahtarı
(prop), state değil.

| Kural | Davranış |
|---|---|
| `column.sortable` yoksa | başlık düz metin, tıklanamaz, `aria-sort` yazılmaz |
| `column.align='end'` | başlık + hücre sağa hizalı; sort butonu ikonu da sağda |
| `selectable=false` (default) | seçim sütunu hiç render edilmez |

Yasak kombinasyon yok. Türetilen: `selectable` açıkken `emptyState` satırının
`colSpan`'ı seçim sütununu da kapsayacak şekilde otomatik +1 artar.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| sıralama (key+direction) | `sortKey`/`sortDirection` prop VEYA iç state | — | `aria-sort` |
| seçim | `selectedIds` prop VEYA iç state | — | checkbox `checked`/`indeterminate` |
| tümü seçili | türetilmiş (`rows` boş değilse hepsi `selectedIds` içinde) | — | `checked=true` |
| kısmi seçili | türetilmiş | tümü-seçili | `indeterminate=true` |

Katman sırası: availability (rows boş mu → empty state) → value (controlled
prop varsa o kazanır) → interaction (tıklama iç state'i günceller ve/veya
callback'i tetikler).

## 7. Davranış

- **Sıralama tıklaması:** aynı sütuna tekrar tıklama yönü `asc↔desc`
  arasında tersine çevirir (2 durumlu toggle — "sıralamasız" üçüncü durum
  yok); farklı sütuna tıklama her zaman `asc` ile başlar.
- **Klavye:** `Tab` sort butonları ve checkbox'lar arasında DOM sırasıyla
  gezer; `Enter`/`Space` ikisini de tetikler (native `<button>`/`<input>`).
- **Seçim:** başlık checkbox'ı tüm `rows` id'lerini seçer/temizler (yalnız o
  anki `rows` — sayfalama varsa görünmeyen sayfalardaki seçim korunmaz,
  §12 bilinen kısıt); satır checkbox'ı tekil toggle.
- **Controlled/uncontrolled:** `sortKey`/`selectedIds` verilmişse o kazanır
  (GlassCheckbox/GlassSelect kalıbı); verilmemişse `defaultSortKey`/
  `defaultSelectedIds`'den başlayan iç state kullanılır.
- **Sıralama (key+direction) BİRLİKTE controlled/uncontrolled:** `sortKey` ve
  `sortDirection` tek mantıksal state olarak ele alınır — controlled tespiti
  **yalnız `sortKey`** üzerinden yapılır. `sortKey` verilmişse `sortDirection`
  de controlled sayılır (prop eksikse `'asc'` varsayılır, iç state'e
  düşülmez); `sortKey` verilmemişse ikisi de iç state'ten okunur ve tek
  başına verilen `sortDirection` prop'u (sortKey olmadan) kontrolsüz modda
  YOK sayılır. Bu, "yalnız biri controlled olunca eski kolon + yeni yön
  karışması" hatasını engeller — bkz. `Sortable` story'sindeki desen (ikisi
  birlikte controlled) tek desteklenen controlled kullanım şeklidir.
- **Sticky header:** `th` `position: sticky; top: 0`; en yakın kaydıran
  ata (sarmalayıcı `div` veya sayfa) üzerinde çalışır — ek prop gerekmez.
- **Responsive:** 700px altında `<thead>` `display: none` ile tamamen
  kaldırılır (DOM'da kalır ama render edilmez, erişilebilirlik ağacından ve
  Tab sırasından çıkar), satırlar blok karta düşer, her `<td>` `data-label`
  attribute'undan `::before` ile etiketini gösterir (bkz. §9 borç). Bilinen
  kısıt: mobilde sort butonları da bu şekilde erişilemez olur — bkz. §12.

## 8. İçerik kuralları

- Uzun açıklama hücreleri satır içinde serbestçe kırılır (`white-space`
  varsayılanı); sütun genişliğini sabitlemek için `column.width` kullan.
- Boş `rows`: tek satırlık, tüm sütunları kaplayan (`colSpan`) ortalanmış
  metin/`ReactNode`; varsayılan "Kayıt bulunamadı."
- Checkbox erişilebilir isimleri görsel olarak gizlenir (satır içeriği zaten
  görünür — çift bilgi tekrarını önler): başlıkta sabit "Tümünü seç", satırda
  ilk sütun değerinden türetilen "{değer} satırını seç" (değer string/number
  değilse `row.id` kullanılır).
- Para/tarih biçimlendirmesi çağıranın işi (`4.250.000 TL`, tabular-nums
  tabloya kök seviyede uygulanır).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| wrapper | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-media` | — |
| th/thead | background/renk | `--lg-surface` / `--lg-label-secondary` | sticky'de aynı (arka plan opak kalmalı) |
| tr | ayraç | `--lg-hairline` | hover: `color-mix(--lg-label 4%)` (yalnız `hover: hover`); seçili: `color-mix(--lg-accent 10%)` |
| sort buton focus | outline | `--lg-accent` | yalnız `:focus-visible` |
| td/th padding, font | boşluk/tipografi | `--lg-space-*` / `--lg-text-*` | — |

**Borç (raw):** `sortIcon` 10×10px SVG ikon ölçüsü ve `viewBox` koordinatları
· mobil kart kırılım noktası 700px (spec'in kendisi) · sr-only clip tekniği
(diğer component'lerle aynı raw değerler — GlassLink/GlassRadioGroup'ta da
mevcut, ortak yardımcıya taşınmadı) · `.selectCell` `width: 1%` (intrinsic
genişlik hack'i, token yok).

## 10. Storybook kapsamı

Var: Default, Playground, Sortable (controlled gerçek sıralama akışı),
Selectable (controlled çoklu seçim + indeterminate), Empty, EmptyOzel,
UzunIcerik, Responsive (mobile viewport + selectable), Erisilebilirlik (docs
açıklamalı).
**Eksik:** Temalar (ayrı story yok — toolbar'la Kağıt/Grafit doğrulanır,
tüm token'lar üzerinden otomatik) · States (disabled satır/kolon N/A — v1'de
yok, §12 açık karar).

## 11. Test kabul kriterleri

- [x] `scope="col"` başlıklar + satır/hücre render (unit)
- [x] boş `rows` → varsayılan boş durum metni (unit)
- [x] özel `emptyState` render edilir, varsayılan gizlenir (unit)
- [x] sıralanabilir başlık `<button>`; tıklama `onSortChange(key,'asc')`
      çağırır, satır SIRASI değişmez (unit — sıralamama sözleşmesi)
- [x] aynı sütuna 2. tıklama yön tersine çevirir + `aria-sort` günceller (unit)
- [x] sıralanamayan sütunda `aria-sort` hiç yazılmaz (unit)
- [x] tümü-seç → tüm id'lerle `onSelectedIdsChange` (unit)
- [x] kısmi seçim → tümü-seç `indeterminate=true`, `checked=false` (unit)
- [x] tekil satır seçimi id listesine ekler (unit)
- [x] her hücre `data-label` taşır — mobil kart görünümü ön koşulu (unit)
- [x] `sortKey` controlled + `sortDirection` verilmemişken yön `'asc'`
      varsayılır ve tıklama iç state'e sızmadan tutarlı `onSortChange`
      üretir — karışık controlled/uncontrolled regresyonu (unit)
- [ ] 700px altı gerçek kart görünümü + sticky header (visual, Chrome)
- [ ] mobilde `<thead>` `display:none` sonrası sort/tümünü-seç kontrollerinin
      Tab sırasından gerçekten çıktığı (visual/manual, Chrome)
- [ ] Kağıt/Grafit tema kontrastı (visual)

## 12. Do / Don't

- ✅ `rows`'u zaten doğru sırada ver; `onSortChange` callback'inde kendi
  sırala (`Sortable` story'sindeki desene bak).
- ✅ Birden çok tablo varsa her birine ayrı `aria-label` ver.
- ✅ Sayısal/parasal sütunlarda `align: 'end'`.
- ❌ Component'e sıralama mantığı (comparator) verme — yalnız gösterge.
- ❌ `rows` içine blok component (kart, ikinci tablo) koyma — hücre içeriği
  inline/kompakt kalmalı.

**Bilinen kısıtlar:** seçim yalnız o anki `rows` üzerinde çalışır — harici
sayfalamada görünmeyen sayfaların seçimi bu component'in bilgisi dışındadır
(çağıran `selectedIds`'i birleştirerek yönetmeli) · sıralama 2 durumlu
(asc/desc) — "sıralamasız" üçüncü durum yok · `sortKey`/`sortDirection`
BİRLİKTE controlled veya BİRLİKTE uncontrolled olmalı — `sortKey` olmadan tek
başına `sortDirection` vermek desteklenmez (yok sayılır, iç state kullanılır)
· mobilde (<700px) `<thead>` `display: none` ile DOM'dan render dışı
bırakıldığı için sıralama başlık butonları VE tümünü-seç checkbox'ı Tab
sırasından ve erişilebilirlik ağacından tamamen kaybolur (satır sırası zaten
üstte `rows` ile belirlendiğinden görsel olarak sorun değil, ama mobilde
sort/tümünü-seç tetikleme ayrı bir kontrol gerektirir — v2 açık kararı).

**Açık kararlar:** mobilde sıralama tetikleyicisi (ayrı `<select>` veya
sheet) · sayfalama entegrasyonu (`selectedIds` birleştirme yardımcı fonksiyonu)
· sütun genişliği `%`/`px` dışında `minmax()` desteği.

**Changelog:** 2026-07-17 — İlk sürüm: sıralama göstergesi (comparator'sız,
controlled) + çoklu seçim (indeterminate destekli) + 700px altı kart
görünümü.
2026-07-17 — Code review fix: `sortKey`/`sortDirection` artık tek mantıksal
state (controlled tespiti yalnız `sortKey` üzerinden, karışık kullanımda eski
kolon + yeni yön karışması giderildi); mobil kart modunda `<thead>` artık
`display: none` (önceden sr-only clip ile DOM'da kalıp sort butonları/
tümünü-seç Tab sırasında kalıyordu).
