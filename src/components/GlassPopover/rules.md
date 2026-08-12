---
name: GlassPopover
category: overlay
status: hazır
lastReviewed: 2026-07-16
---

# GlassPopover Kuralları

## 1. Amaç

Tetikleyiciye bağlı, non-modal cam panel: kısa bağlamsal içerik (özet, ipucu,
mini form) tetikleyicinin yanında açılır; sayfa akışını kesmez.

- **Kullan:** fiyat analizi özeti, kısa açıklama, 1-2 alanlık mini form,
  "daha fazla bilgi" panelleri.
- **Kullanma:** onay/kritik karar akışı (→ Modal), uzun içerik/scroll gerektiren
  panel (→ Drawer), salt metin ipucu (→ Tooltip), komut listesi (→ Menu).

| İlgili | Farkı |
|---|---|
| GlassContextMenu | Sağ tık + komut listesi; menuitem semantiği |
| GlassToast | Tetikleyicisiz, geçici bildirim |

## 2. Semantik sözleşme

- Panel: `role="dialog"`, **non-modal** — `aria-modal` YOK, focus trap YOK.
- `title` verilirse `aria-labelledby` panele bağlanır; verilmezse dialog isimsizdir
  (gerekiyorsa çağıran `aria-label`'ı içerikle çözer).
- Tetikleyici tek bir React elementiyse üzerine `aria-haspopup="dialog"` +
  `aria-expanded` yazılır (cloneElement). Tetikleyicinin odaklanabilir bir
  kontrol olması çağıranın sorumluluğudur (GlassButton önerilir).
- Panel DOM'da tetikleyicinin hemen ardındadır (portal YOK) — Tab sırası doğaldır.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| trigger | ✅ | ReactNode | Relative wrapper içinde tıklanır; buton önerilir |
| title | — | string | headline; `aria-labelledby` kaynağı |
| children | ✅ | ReactNode | Panel gövdesi; body boyutu |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| trigger | prop | `ReactNode` | — | Tıklanınca açar/kapatır |
| open | prop | `boolean` | — | Controlled durum |
| defaultOpen | prop | `boolean` | `false` | Uncontrolled başlangıç |
| onOpenChange | event | `(open: boolean) => void` | — | Her niyet değişiminde |
| placement | prop | `'top'\|'bottom'\|'left'\|'right'` | `'bottom'` | Panel yönü |
| align | prop | `'start'\|'center'\|'end'` | `'center'` | Çapraz eksen hizası |
| title | prop | `string` | — | Panel başlığı |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| ...rest | — | `HTMLAttributes<div>` | — | Kök wrapper'a |

## 5. Seçenek eksenleri

- `placement` top/bottom iken `align` yatay (start=sol), left/right iken dikey
  (start=üst) çalışır.
- Controlled + uncontrolled karışmaz: `open` verildiyse iç state devre dışı,
  kapanma niyetleri yalnız `onOpenChange` ile bildirilir.

## 6. State modeli

| State | Kaynak | Görsel |
|---|---|---|
| kapalı | `open`/iç state | Panel DOM'da yok (AnimatePresence exit sonrası) |
| açık | `open`/iç state | scale .97→1 + fade; transform-origin placement'a bakar |
| reduced-motion | media query | Yalnız opacity |

## 7. Davranış

- Escape ve dış `pointerdown` kapatır; panel içi tıklama kapatmaz.
- Açılınca panel **focus almaz** (non-modal); etkileşimli içerik varsa kullanıcı
  Tab ile girer — panel DOM'da tetikleyicinin ardında olduğundan sıra doğrudur.
- Konumlama saf CSS (absolute + translate); floating-ui yok. Viewport'a çarpan
  placement otomatik çevrilmez — placement seçimi çağıranın sorumluluğu.
- **Yatay viewport kıstırması:** açılışta positioner ölçülür; panel yatayda
  viewport'tan taşıyorsa `--pop-shift-x` ile içeri itilir (16px pay, resize'da
  yeniden ölçülür). Sığan panelde shift 0 — flip DEĞİLDİR, panel tetikleyiciye
  bağlı kalır, yalnız kaydırılır.
- Responsive: panel `max-width: calc(100vw - 32px)`; `/* bp-sm */ ≥640px`'de 320px.

## 8. İçerik

Kısa tut: 1-3 cümle veya mini form. Scroll gerekiyorsa yanlış bileşen (→ Drawer).
Başlık varsa cümle düzeni, nokta yok.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| panel | radius | 14 ← `--lg-radius-media` (GlassSurface shape sayısal aldığı için raw) |
| panel | padding | `--lg-space-4` |
| panel | offset | `--lg-space-2` |
| title | font-size | `--lg-text-headline` |
| body | font-size | `--lg-text-body` |
| focus | outline | `--lg-accent` |

**Borç (raw / mikro-geometri):** panel genişlik sınırları token karşılığı
olmadığından component kökünde yerel değişkende toplandı
(`.root { --panel-min-width: 220px; --panel-max-width: 320px; }`); mobil
viewport taşma marjı `calc(100vw - var(--lg-space-7))` token'a bağlandı
(birebir 32px). `@media (min-width: 640px)` bp-sm breakpoint istisnası;
`line-height: 1.45` oransal, token yok. Viewport kıstırma payı JS'te raw
`16` (px, `--lg-space-4` karşılığı) — jsdom CSS değişkenini çözemediği
için koddan okunur.

## 10. Storybook kapsamı

Var: Default, WithoutTitle, Placements (4 yön matrisi), Controlled,
Mobile (viewport: mobile1). **Eksik:** align matrisi story'si, RTL.

## 11. Test kabul kriterleri

- [x] Tıklama açar/kapatır, role dialog + accessible name
- [x] aria-modal yok; trigger'a aria-haspopup/expanded yazılır
- [x] Escape ve dış tıklama kapatır; iç tıklama kapatmaz
- [x] Controlled modda kendi kendine kapanmaz, onOpenChange bildirir
- [x] Yatay taşmada --pop-shift-x yazılır; sığan panelde ve layout'suz ortamda yazılmaz
- [ ] Placement/align görsel doğrulama (visual)

## 12. Do / Don't

- ✅ Tetikleyici olarak gerçek buton ver (klavye aktivasyonu bedava gelir).
- ✅ Mobilde `align="start"` + dar içerikle taşmayı azalt.
- ❌ İçine focus trap gerektiren kritik akış koyma (→ Modal).
- ❌ Hover ile açma bekleme — yalnız tıklama (tooltip değildir).

**Açık kararlar:** Ok (arrow) ucu bilinçli eklenmedi — döndürülmüş kare,
backdrop-filter'lı cam zeminde panelden ayrık ve kirli göründüğü için oksuz
bırakıldı; ihtiyaç doğarsa SVG clip-path'li tek parça çözüm değerlendirilecek.
Viewport çarpışmasında otomatik flip yok (floating-ui yasağı; basitlik kararı);
yalnız yatay kıstırma var — panel yön değiştirmez, taşarsa içeri kaydırılır
(2026-08-12).

## Changelog

- 2026-07-16: İlk sürüm — placement/align eksenleri, controlled/uncontrolled,
  non-modal dialog sözleşmesi, oksuz tasarım kararı.
- 2026-08-12: `material` ekseni (`glass` | `flat`, varsayılan `glass`).
  Yoğun metin içerikli paneller (bildirim gelen kutusu gibi) cam zeminde
  altta akan sayfayla yarışıp okunmaz kalıyordu; `flat` opak yüzey +
  hairline verir, yükselti (`--lg-shadow-md`) iki malzemede de aynı kalır.
  İlk kullanım: kabuk bildirim kutusu.
- 2026-08-12: Yatay viewport kıstırması. Tetikleyici viewport kenarına
  yakınken (dar ekranda hamburger menü içindeki bildirim zili + `align="end"`)
  panel sol kenardan taşıp kırpılıyordu. Açılışta positioner'ın layout kutusu
  ölçülür, taşma varsa `--pop-shift-x` CSS değişkeniyle (translate'e eklenir)
  içeri itilir; sığan panelde shift 0, geniş ekran davranışı değişmez.
  `position: fixed` bilinçli seçilmedi: transformlu ata (motion layout kapsülü)
  fixed'in içerme bloğunu değiştirir; ölçüm gerçek ekran konumuna bakar.
  Flip hâlâ yok — panel tetikleyiciye bağlı kalır, yalnız kaydırılır.
  16px pay `--lg-space-4` karşılığı, JS'te raw (§9 borç listesine eklendi).
