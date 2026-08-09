---
name: GlassRibbon
category: içerik
status: hazır
lastReviewed: 2026-08-07
---

# GlassRibbon Kuralları

## 1. Amaç

Kart köşesini 45° çaprazlama saran ince vitrin şeridi: "Doğrulanmış" gibi
kartın tamamına ait, taranırken anında ayırt edilmesi gereken tek durum
vurgusu. Salt görseldir, etkileşimsizdir.

- **Kullan:** medya köşesinde kartın kimliğini belirleyen tek durum
  (doğrulama, vitrin kademesi).
- **Kullanma:** birden çok etiket yan yana (→ `GlassBadge`), tıklanabilir
  filtre/aksiyon (→ `GlassButton`), uzun açıklama metni.

| İlgili | Farkı |
|---|---|
| GlassBadge | Kapsül rozet; içerik akışında durur, şerit köşeye kilitlidir |
| GlassListingCard | `badgePlacement="corner"` ile şeridi medya köşesine yerleştirir |

## 2. Semantik sözleşme

- Element: `<span>` tutucu + `<span>` bant. Role yok — statik durum metni.
- Accessible name: `label` metni; `note` verilirse görsel olarak gizli ek
  bağlam olarak ardından okunur (örn. "Doğrulanmış" + "Temsili görsel").
- Tutucu `pointer-events: none` taşır; içine yerleştirildiği kartın
  tıklanabilirliğini etkilemez.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| label | ✅ | kısa durum metni | Tek satır; sm'de ~11 karakter sınırı (görünür pencere ~72px) |
| note | — | ekran okuyucu bağlamı | Görsel yerleşimi etkilemez (`clip-path` ile gizli) |

**Kap sözleşmesi:** Şerit, `position: relative` + `overflow: hidden` bir kabın
ilk katmanına yerleştirilir; köşe yuvarlaklığını `border-top-left-radius:
inherit` ile devralır. `GlassListingCard.media` bu sözleşmeyi hazır sağlar.

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| label | prop | `string` | — | Bant üzerindeki metin |
| note | prop | `string` | — | Yalnız ekran okuyucuya okunan ek bağlam |
| tone | prop | `'accent'\|'neutral'` | `'accent'` | accent: dolu vurgu (`--lg-action-prominent`); neutral: opak yüzey |
| size | prop | `'sm'\|'md'` | `'sm'` | Köşe alanı + tipografi ölçeği |
| ...rest | — | `HTMLAttributes<HTMLSpanElement>` | — | Tutucu köke geçer |

Ref hedefi: yok. Event sözleşmesi: yok — etkileşimsiz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `tone=accent`, `size=sm`.

| Eksen | Değerler | Not |
|---|---|---|
| tone | accent · neutral | accent zemin **tek kaynaktan** gelir: `--lg-action-prominent` (+`-label`) — kabuktaki "İlan ver" kahvesi. neutral, fotoğraf üstü okunurluk için opak `--lg-surface` kullanır |
| size | sm · md | sm: 72px köşe, `--lg-text-badge`; md: 88px köşe, `--lg-text-caption` |

Etiket sığması: görünür şerit uzunluğu `2 × --ribbon-offset`tir (sm 72px,
md 90px). Sığmayan metin kırpılır — story `UzunEtiket` bunu belgeler.

## 6. Durumlar

hover/focus/active yok — etkileşimsiz. Durum çeşitlemesi yalnız `tone`
ekseninden gelir; yeni renk ihtiyacı doğarsa ton eklenir, raw değer yazılmaz.

## 7. Responsive

Kap `container-type: inline-size` tanımlıyorsa (GlassListingCard
`propertyOverlay` tanımlar) 260px altı genişlikte `md` geometrisi `sm`e iner.
Dokunmatik hedef kuralı uygulanmaz (etkileşimsiz).

## 8. Motion

Yok — statik. `prefers-reduced-motion` etkisi yoktur.

## 9. Bilinen borçlar

- Köşe geometrisi (`--ribbon-size/offset/pad`) raw px'tir; space ölçeğinin
  dışında kalan mikro-geometri (GlassBadge §9 ile aynı gerekçe).
- Kırpma kaba devredildiği için Storybook dışında konumlandırılmamış bir kapta
  şerit köşeye oturmaz; kap sözleşmesi §3'te belgelidir.
- 2026-08-08 — `size="xs"` (60px pencere, 9px bant): kompakt yatay kartın
  108px medyası için; sm mevcut kullanımlarda kalır.
