---
name: GlassAccordion
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassAccordion Kuralları

## 1. Amaç

Genel amaçlı aç/kapa liste: SSS, yardım merkezi, ilan detayında serbest
içerikli bölümler. Tek satır cümle: "başlığa tıklayınca serbest ReactNode
içerik açılır/kapanır".

- **Kullan:** SSS blokları, yardım merkezi maddeleri, uzun serbest metinli
  ilan detay bölümleri (ör. "İptal/İade Koşulları").
- **Kullanma:** sabit `label:value` künye sunumu → `GlassFeatureGroup`
  (`variant="accordion"`); GlassAccordion içerik olarak SERBEST ReactNode
  kabul eder, GlassFeatureGroup ise `{label, value, present}` şemalı yapılı
  veri kabul eder. İki component birbirinin yerine GEÇMEZ, `GlassFeatureGroup`
  bu iş için değiştirilmedi.
- Tek soru/cevap için `GlassDisclosure` yok — gerekirse `items` tek elemanlı
  verilebilir.

## 2. Semantik sözleşme

- Kök: sade `<div>`, `data-mode` (`single`/`multiple`), opsiyonel
  `aria-label`. `aria-label` verildiğinde köke `role="group"` da eklenir —
  isimsiz (adlandırılamayan) generic `<div>` AT'ye anlamlı bir grup olarak
  sunulmaz, `aria-label` yalnız adlandırılabilir bir role üstünde etkilidir.
  `aria-label` verilmezse `role` EKLENMEZ (gereksiz gürültü, tek accordion'lu
  sayfada rol semantiği zorunlu değil).
- Her başlık: `headingAs` (`'h3'|'h4'|'div'`, varsayılan `'h3'`) elementiyle
  sarılmış gerçek `<button type="button" aria-expanded aria-controls>`.
  Heading seviyesini seçmek ÇAĞIRANIN işidir — sayfa ana hattını component
  bilemez.
- Panel: `role` TAŞIMAZ, yalnız `id` (button'ın `aria-controls`'u bununla
  eşleşir). Kapalıyken `inert` — DOM'dan silinmez (grid-rows geçişi için),
  klavye/AT gezinmesinden çıkarılır.
- `trigger`/`panel` DOM `id`'leri (`aria-controls` eşleşmesi) `useId` önekiyle
  ITEM INDEX'İNDEN türetilir — ham `item.id` DEĞİL. `item.id` yalnız React
  `key` ve `openIds` eşleştirmesi için serbesttir (boşluk/özel karakter
  içerebilir); ham haliyle DOM id'sine eklenirse ARIA IDREF (`aria-controls`)
  kırılır.
- Chevron ikonu `aria-hidden` — dönüş bilgisini `aria-expanded` taşır.
- Portal YOK.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| item.title | ✅ | Serbest `ReactNode` | Buton içeriği — accessible name burdan hesaplanır |
| item.content | ✅ | Serbest `ReactNode` | Panel içi; markup/link/liste serbest |
| chevron | ✅ (üretilir) | SVG ok | `aria-hidden`, çağıran değiştiremez |

## 4. Public API

| Ad | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|
| items | `GlassAccordionItem[]` | — | — | `{id, title, content}` |
| mode | `'single'\|'multiple'` | `'single'` | — | single: biri açılınca öteki kapanır |
| openIds | `string[]` | — | ✅ kaynak | verilirse component kontrollüdür |
| defaultOpenIds | `string[]` | `[]` | — | yalnız kontrolsüz başlangıç |
| onOpenIdsChange | `(ids: string[]) => void` | — | — | her değişimde GÜNCEL tüm liste |
| headingAs | `'h3'\|'h4'\|'div'` | `'h3'` | — | `'div'` heading anlamı taşımaz |
| aria-label | `string` | — | — | köke isim |

Controlled tespiti YALNIZ `openIds !== undefined` üzerinden yapılır (bkz.
`GlassTable.selectedIds` deseni) — `defaultOpenIds` kontrollü modda yok
sayılır. Ref: N/A — dışa ref açılmıyor (v1 kararı, bkz. §12).

**Normalize (render'da türetilir, ayrı state olarak SAKLANMAZ):** kullanılan
`openIds` (kontrollü prop veya iç state) her render'da `items` ve `mode` ile
normalize edilir — `items`'ta artık var olmayan id'ler düşürülür; `mode`
`'single'`iken normalize sonrası birden fazla id kalırsa yalnız SON id (listede
en sonda olan — "en son açılan" kabul edilir) açık tutulur. `onOpenIdsChange`
her zaman bu normalize edilmiş listeyle çağrılır — silinmiş id'ler veya
`single` modda fazla id'ler çağırana asla taşınmaz. Bu, çağıranın `items`'ı
component'ten bağımsız güncellediği (ör. bir madde silindiği) veya `mode`'u
`'multiple'`'dan `'single'`'a değiştirdiği senaryolarda tutarlılığı garanti
eder.

## 5. Seçenek eksenleri

`material`/`tone`/`size`/`variant`/`thickness`/`tint`/`prominent` YOK —
içerik katmanı FLAT, tek görsel biçim. Tek eksen `mode`; `headingAs` bir
seçenek değil, semantik entegrasyon parametresidir.

Yasak kombinasyon yok (mode × headingAs bağımsız çarpar).

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| open (panel başına) | `openIds`/iç state | — | `aria-expanded`, panel `inert` |
| focus (buton) | tarayıcı | — | `:focus-visible` halkası |

Katman sırası: availability (yok — her item her zaman etkileşilebilir) →
value (`openIds`/iç state hangi id'lerin açık olduğunu belirler) →
interaction (tıklama/Enter/Space native buton davranışıyla toggle eder).

## 7. Davranış

- Pointer: tıklama → `toggle(id)`.
- Klavye (APG Accordion deseni): `Tab` başlıklar arasında DOĞAL sırayla
  gezer (tüm başlıklar gerçek `<button>`, roving tabindex GEREKMEZ — bu yalnız
  tablist/radiogroup gibi tek-buton-tabindex desenlerinde gerekir). `Enter`/
  `Space` native buton davranışıyla açar/kapar. `↓` bitişik (sıradaki)
  başlığa, `↑` bitişik (önceki) başlığa focus taşır (sarar); `Home`/`End` ilk/
  son başlığa taşır. Ok tuşları YALNIZ focus taşır, açma/kapama tetiklemez.
- Controlled/uncontrolled: §4.
- Async: N/A.
- Overlay: N/A — portal yok.
- `mode='single'`de açık paneli tekrar tıklamak onu kapatır (hiçbiri açık
  kalmayabilir) — "en az bir açık" zorunluluğu YOK (bilinçli karar, §12).

## 8. İçerik kuralları

- `title`/`content` serbest `ReactNode` — uzunluk sınırı yok; başlık sarılır
  (`white-space` normal), panel içeriği taşmadan akar.
- Boş `items`: kök boş render olur (dış çerçeve görünür, madde yok) —
  çağıranın boş durumu ayrıca ele alması önerilir.
- İkon-etiket ilişkisi: chevron dekoratif, `title` tek başına accessible name
  kaynağıdır — `title` salt ikon vermemeli (metin içermeli).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kök yüzey/çizgi | background/border | `--lg-surface` / `--lg-hairline` | — |
| kök radius | border-radius | `--lg-radius-card` | — |
| item ayırıcı | border-top | `--lg-hairline` | — |
| tetikleyici yükseklik | min-height | `--lg-control-lg` (48px) | `pointer:coarse`'ta 48px sabit |
| tetikleyici hover | background | `color-mix(in srgb, var(--lg-label) 4%, transparent)` | `@media (hover:hover)` |
| focus halkası | outline | `--lg-accent` | yalnız `:focus-visible` |
| başlık metni | font-size/weight | `--lg-text-headline` / 600 (headline ağırlık kuralı) | — |
| panel metni | color | `--lg-label-secondary` | — |
| boşluk | padding/gap | `--lg-space-3/4/5` | — |

**Borç (raw / mikro-geometri):** chevron kutu 20×20px ve ikon 12×12 token
karşılığı olmadığından component kökünde yerel değişken olarak toplandı
(`.root { --chevron-box: 20px; --chevron-icon: 12px; }`); geçiş süresi/easing
(`0.24s`/`0.32s` `cubic-bezier(0.32,0.72,0,1)`) — mevcut proje konvansiyonu
(GlassFeatureGroup'ta aynı eğri kullanılıyor), token'a bağlanmadı. Tetikleyici
min-height'ı her yerde `--lg-control-lg` token'ından gelir; sabit 48px
pointer:coarse override'ı kaldırıldı — token coarse'ta 48→50px büyür, kontrol
token'ının coarse büyümesi tasarımın istediği davranıştır.

**Bilinçli istisna:** panel açılışı `grid-template-rows 0fr→1fr` geçişi
transform/opacity/filter dışıdır; `height` animasyonu yasağının kabul edilmiş
alternatifi olarak korunur (reduced-motion'da kapanır).

## 10. Storybook kapsamı

Default, Playground, Multiple (mode ekseni), Controlled, UzunIcerik,
Responsive, Erisilebilirlik (docs description'lı). Sizes/Materials
story'si YOK — eksen yok (mevcut proje konvansiyonu).

## 11. Test kabul kriterleri

- [x] varsayılan: `aria-expanded=false`, panel içerik DOM'da
- [x] tıklama açar; `aria-expanded`/`aria-controls`/panel `id` tutarlı, panel `role` YOK
- [x] kapalı panel `inert`, açık panel değil
- [x] `mode='single'`: biri açılınca öteki kapanır
- [x] `mode='multiple'`: bağımsız açık kalır
- [x] aynı panele tekrar tıklama kapatır
- [x] controlled: `openIds` verilince iç state değişmez, yalnız `onOpenIdsChange` çağrılır
- [x] klavye: `↓`/`↑` bitişik başlığa (sararak), `Home`/`End` ilk/son başlığa
- [x] `headingAs`: `h3` (default) / `h4` / `div` doğru heading seviyesini üretir
- [x] kök `aria-label` ile adlandırılır ve `role="group"` taşır; `aria-label`
  yoksa `role` eklenmez
- [x] normalize: `single` modda birden çok geçerli id verilirse yalnız SON id
  açık kalır
- [x] normalize: `items`'ta olmayan (silinmiş) id `openIds`'ten düşer, callback'e
  taşınmaz
- [x] DOM id'leri (`aria-controls`) ham `item.id`'den değil index'ten türetilir
  — boşluklu id ARIA IDREF'i kırmaz
- [ ] grid-template-rows geçişi + reduced-motion anlık geçiş (visual, Chrome)

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

**Do**

- ✅ Sayfa heading hiyerarşisine göre `headingAs` ver (SSS sayfasında `h2`
  altındaysa `h3`; zaten bir kart başlığı altındaysa `div`).
- ✅ Birden çok accordion aynı sayfadaysa köke `aria-label` ver.

**Don't**

- ❌ `GlassFeatureGroup`'un künye accordion'ı yerine bunu kullanma (yapılı
  `label:value` verisi için o daha uygun) — ve tam tersi.
- ❌ Panel içeriğine kendi `role`'ünü ekleme; component'in `inert`
  yönetimiyle çakışabilir.

**Bilinen kısıtlar**

- Dışa `ref` açılmıyor (imperatif "programatik aç/kapat" ihtiyacı `openIds`
  controlled deseniyle karşılanmalı).
- `inert` özniteliği eski tarayıcılarda (ör. Safari <17) polyfill'siz
  çalışmayabilir — proje hedef matrisinde kabul edilen borç.

**Açık kararlar:** item başına `disabled` desteği (spec'te istenmedi, v2'ye
bırakıldı) · sürükle-bırak sıralama (kapsam dışı) · animasyon süresinin
token'a bağlanması.

**Changelog:** 2026-07-17 — İlk sürüm. 2026-07-17 — Codex review fix: `openIds`
render'da `items`/`mode` ile normalize edilir (silinmiş id + `single` modda
çoklu id sızıntısı giderildi); `aria-label` verilince köke `role="group"`
eklendi; DOM id'leri (`aria-controls`) ham `item.id` yerine index'ten türetildi.
