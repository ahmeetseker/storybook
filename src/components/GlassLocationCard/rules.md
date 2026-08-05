---
name: GlassLocationCard
category: içerik
status: hazır
lastReviewed: 2026-07-15
---

# GlassLocationCard Kuralları

## 1. Amaç

Konum kartı: stilize harita placeholder'ı + adres + opsiyonel dipnot +
"Haritada Aç" aksiyonu. Harita **gerçek değildir** — CSS gradyan/ızgara ile
çizilen dekoratif bir görseldir; koordinat almaz, zoom/pan yapmaz. İçerik
katmanı component'idir; içerik sayfalarında `material="flat"` önerilir.

- **Kullan:** ilan detayında yaklaşık konum gösterimi + harici haritaya köprü.
- **Kullanma:** gerçek harita etkileşimi gereken yerler (→ harita SDK'sı),
  adres formu/pin seçimi.

| İlgili | Farkı |
|---|---|
| GlassSpecTable | "İl/İlçe" satırı verebilir ama görsel bağlam vermez |
| GlassButton | Karttaki aksiyon bu component'ten kompoze edilir |

## 2. Semantik sözleşme

- Element: `<section>` (`GlassSurface as="section"`, `shape={20}`, `thickness={0.45}`).
- Harita placeholder'ı `aria-hidden` div — ekran okuyucuya yalnız adres metni
  ve buton gider; pin ikonu da `aria-hidden`.
- Adres `<p>`; heading yoktur — kartın adı sayfa bağlamından gelir.
- DOM değişmezi: (1) harita bloğu daima `aria-hidden` kalır, (2) buton yalnız
  `onOpenMap` verilince render edilir (gerçek `<button>`, GlassButton).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| map | otomatik | CSS ızgara + pin ikonu | Dekoratif; 150px sabit yükseklik; değiştirilemez |
| address | ✅ | string | 14.5px/600; sarar, kırpılmaz |
| note | — | string | Dipnot ("Konum yaklaşıktır"); verilmezse render edilmez |
| action | — | "Haritada Aç" (GlassButton `size="sm"`) | Yalnız `onOpenMap` verilince |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| address | prop | `string` | — (zorunlu) | Tek görünür konum metni |
| note | prop | `string` | — | Gizlilik/yaklaşıklık dipnotu |
| onOpenMap | prop | `() => void` | — | Harici harita açma; URL üretimi çağıranda |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Surface + iç butona geçer |
| material | prop | `'glass'\|'flat'` | — (GlassSurface default'u `glass`) | İçerikte `flat` önerilir |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | `className` birleştirilir |

Event: `onOpenMap` yalnız buton tıklamasında; kartın/haritanın kendisi
tıklanabilir değildir ve yapılmamalıdır (dekoratif alan yanlış beklenti yaratır).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `tone=auto`, `material` verilmemiş (→ glass), buton yok.

| Kural | Davranış |
|---|---|
| `onOpenMap` yok | Buton render edilmez; kart salt bilgi |
| Koordinat/zoom prop'u | Yok — bilinçli; gerçek harita ayrı entegrasyon |
| size ekseni | Yok — genişlik parent'tan, harita 150px sabit |

## 6. State modeli

N/A — kartın kendisi statik; tek etkileşimli öğe iç GlassButton'dır ve kendi
sözleşmesine (hover/active/focus/disabled) tabidir. Harita placeholder'ının
malzemeye/temaya göre state türevi yoktur — her kombinasyonda aynı yeşil
gradyan render edilir.

## 7. Davranış

- Keyboard: focus edilebilir tek öğe "Haritada Aç"; Enter/Space native.
- Pointer: harita alanında pointer event beklentisi yok (`aria-hidden`,
  cursor default) — tıklama yakalanmaz.
- Responsive: kart genişliğe uyar, harita yüksekliği 150px sabittir; çok
  geniş container'da ızgara deseni tekrarla büyür (bozulmaz).

## 8. İçerik kuralları

- Buton etiketi hardcoded Türkçe: "Haritada Aç" — i18n borcu.
- `address` kırpılmaz, sarar (line-height 1.4); "İl, İlçe — Mahalle" biçimi
  önerilir, biçimleme çağıranda.
- Gizlilik: yaklaşık konum gösteriliyorsa `note` ile açıkça söyle
  ("Güvenlik nedeniyle konum yaklaşık gösterilir.").
- Harita görseli bilgi taşımaz — pin konumu sabittir (%50/%48), adresle
  ilişkisi yoktur; kullanıcıya gerçek konum vaat etme.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root (flat) | background / border / renk | `--lg-surface` / `--lg-hairline` / `--lg-label` (GlassSurface) |
| root | radius | `shape={20}` — `--lg-radius-card` değeriyle aynı, sayısal |
| action | yükseklik | `--lg-control-sm` (GlassButton üzerinden) |

**Borç (raw / mikro-geometri):** Token'a bağlananlar: kart iç `gap`
`--lg-space-3` (12px), info yatay padding `--lg-space-1` (4px), not fontu
`--lg-text-caption` (12px). Token karşılığı olmayanlar component kökünde
yerel değişkene toplandı: `--card-pad: 14px` (set'teki diğer kartların
20px'inden farklı — görsel eşdeğerlik için değer korundu) ·
`--map-height: 150px` · `--map-radius: 13px` (`--lg-radius-media` 14px'e
denk gelmeli ama birebir değil — yuvarlama yasak, değer korundu) ·
`--address-size: 14.5px` / `--info-gap: 3px` (tipografi/boşluk ölçeği dışı) ·
pin `--pin-size: 36px` / `--pin-color: #ff453a` (semantic danger değil,
hardcoded — temayla değişmez, bilinçli dekoratif) · harita paleti
`--map-green-1/2` (#4a7a63/#2f5546), ızgara `--map-grid-line`
rgba(255,255,255,.16) + adımları `--map-row-a/b` 34/36px,
`--map-col-a/b` 46/48px, parlama `--map-glow` rgba(255,255,255,.18) /
`--map-glow-size: 160px` — tümü tema duyarsız dekoratif görsel (koyu yeşil
sabit kalır; tema token'ına bağlanması Açık Kararlar'da). Bilinçli
bırakılan: pin `drop-shadow(0 4px 8px rgba(0,0,0,.35))` — `--lg-shadow-*`
desenleriyle birebir eşleşmediğinden dokunulmadı.

## 10. Storybook kapsamı

Var: Default, WithoutButton, Materials (glass vs flat yan yana), UzunIcerik
(uzun mahalle/site adı + çok satırlı note, dar container). **Eksik:**
Playground, Responsive (geniş container), Erişilebilirlik (haritanın AT'ye kapalı
olduğunu doğrulayan story). States N/A.

## 11. Test kabul kriterleri

- [x] adres + not render; buton verilmeyince yok (unit)
- [x] "Haritada Aç" → `onOpenMap` 1 kez (interaction)
- [ ] harita bloğu ve pin `aria-hidden` (a11y — regresyon)
- [ ] `note` verilmeyince `<p>` render edilmez (unit)
- [ ] flat kart/harita kontrastı (visual)

## 12. Do / Don't

- ✅ İçerik sayfasında `material="flat"`; harita görseli zaten doygun renkli.
- ✅ `onOpenMap` içinde harici URL aç (`maps.google.com/...`); yeni sekme kararı çağıranda.
- ❌ Harita alanına onClick bağlamaya çalışma — dekoratiftir, tıklama hedefi butondur.
- ❌ Gerçek koordinat/pin doğruluğu gereken akışta kullanma — harita SDK'sına geç.

**Bilinen kısıtlar:** harita tamamen dekoratif ve tema duyarsız · pin adresle
ilişkisiz · 150px yükseklik sabit. **Açık kararlar:** harita paletinin tema
token'larına bağlanması · `mapHeight` ya da `aspectRatio` ihtiyacı · gerçek
harita entegrasyonu için `renderMap` slot'u. **Changelog:** 2026-07-15 ilk
sözleşme.
