---
name: GlassIconButton
category: kontroller
status: hazır
lastReviewed: 2026-08-03
---

# GlassIconButton Kuralları

## 1. Amaç

İkon-tek dairesel cam buton (kare gövde + capsule = daire): paylaş, favori,
kapat gibi tek ikonla anlaşılan aksiyonlar. Basınçta GlassButton ile aynı
sıvılaşma modelini kullanır.

- **Kullan:** araç çubuğu/kart üstü ikon aksiyonları, aç/kapa (favori) durumu.
- **Kullanma:** metinli aksiyon (→ `GlassButton`), ikonun tek başına
  anlaşılmadığı durumlar (metin ekle, bu component'i kullanma).

| İlgili | Farkı |
|---|---|
| GlassButton | Metinli capsule; accessible name children'dan gelir |
| GlassBadge | Etkileşimsiz statü göstergesi |

## 2. Semantik sözleşme

- Element: `<button>` (`GlassSurface as={motion.button}`).
- Accessible name: **`label` prop'u zorunlu** — `aria-label` + `title`
  (tooltip) olarak uygulanır; ikon span'i `aria-hidden`'dır.
- `active` boolean verilirse `aria-pressed` yansır (toggle semantiği);
  verilmezse attribute hiç konmaz (sıradan buton).
- `type` dışarıdan verilmezse tarayıcı default'u (`submit`) — form içinde dikkat.
- DOM değişmezleri: (1) gerçek `<button>`, (2) ikon `aria-hidden`.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | ✅ | tek ikon (SVG) | `aria-hidden` span'de; SVG `1.1em`, `currentColor` kullanmalı |
| label | ✅ | metin (prop) | Görünmez; aria-label + title. Durumu yansıtmalı ("Favorilerden çıkar") |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| label | prop | `string` | — (zorunlu) | Erişilebilirlik etiketi |
| active | prop | `boolean` | — | Kalıcı aç/kapa durumu → `aria-pressed`. Controlled (yalnız prop; iç state yok) |
| tint | prop | `string` | — | Aktif durum vurgu rengi; `--glass-tint`'e yazılır |
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Kontrol token'ından kare boyut |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu |
| disabled | prop | `boolean` | `false` | Native attribute |
| ...rest | — | `ButtonHTMLAttributes` | — | `onClick` vb. |

Event: `onClick` — `disabled` iken çalışmaz. `active`'in değişimi tamamen
çağıranın işi; component toggle etmez. Basınç `useGlassPress` handler'larıyla
içeride yönetilir, dışarı sızmaz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, nötr cam, `active` yok.

| Yasak / türetilen | Davranış |
|---|---|
| `active=true` + `tint` yok | Görsel değişmez (`.active` sınıfı yalnız `active && tint`'te); `aria-pressed` yine yansır — görsel/semantik ayrışması, bkz. Açık Kararlar |
| `xl` boyutu | ❌ — GlassButton'dan farklı olarak yok |
| hover/focus/active(basılı) prop olarak | ❌ — yalnız CSS |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel / ARIA |
|---|---|---|---|
| hover | CSS (`hover:hover`) | — | Opak beyaz `.94` + koyu ikon + scale 1.08 + gölge (tvOS focus modeli) |
| hover + `active`+tint | CSS | nötr hover | `color-mix(tint %75, beyaz)` + beyaz ikon |
| active (basılı) | CSS `:active` + useGlassPress | — | Tam beyaz + scale 1.03 + sıvılaşma |
| pressed (kalıcı, `active` prop) | prop | — | `color-mix(tint %85, transparent)` zemin, beyaz ikon; `aria-pressed` |
| focus-visible | CSS | — | 2px `--lg-accent` halka, offset 2px |
| disabled | native | hover, active | opacity .45 + `pointer-events: none` |

Katman sırası: disabled → pressed(value) → hover/active(interaction).

## 7. Davranış

- Keyboard: Enter/Space aktive eder (native). Focus halkası yalnız klavyede.
- `prefers-reduced-motion`: hover/basılı scale kapalı (`scale: none`); renk
  geçişi kalır. Spring davranışı `useGlassPress` içinde ele alınır.
- Touch: `interactive` üzerinden `touch-action: manipulation`; boyutlar
  `--lg-control-*` ile dokunmatikte büyür (md → 44px).

## 8. İçerik

Tek ikon; metin sokulmaz. `label` durumla senkron tutulur (FavoriteOn →
"Favorilerden çıkar"). Lokalizasyon: `label` çağırandan gelir; `title`
tooltip'i de aynı metni gösterir. Boş `children` verilmesi sözleşme ihlalidir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | width/height | `--lg-control-{sm,md,lg}` |
| root | radius | capsule |
| root | focus outline | `--lg-accent` |
| pressed/hover-tint | background | `--glass-tint` ← `tint` prop'u |
| root | font | miras (`font: inherit`) |

**Borç (raw / mikro-geometri):** ikon glyph boyutları 14/20px token
karşılığı olmadığından kökte yerel değişkenlerde toplandı
(`.button { --icon-font-sm: 14px; --icon-font-lg: 20px; }`); md'nin 17px'i
birebir `--lg-text-headline`'a bağlandı. Bilinçli raw bırakılanlar: tvOS
hover beyazı `rgba(255,255,255,.94)` + koyu ikon `rgba(0,0,0,.85)` + `#fff`
active zemini + aktif-hover `color-mix(%75, #ffffff)`/`#fff` metinleri —
opak malzeme etkisi, tema token'ına bağlanmaz (değer değiştirilmedi); hover
gölgesi `0 10px 26px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.45)`
shadow token'larıyla birebir eşleşmiyor. Hover gölgesinde `!important` var
(GlassSurface inline box-shadow'unu ezmek için) — kırılgan, bkz. Bilinen
kısıtlar. Süre/easing (`0.16s ease-out`) raw — token yok.

**Dokunma hedefi:** kök GlassSurface'tir ve kendi köşe kırpması için
`overflow: hidden` taşır; kutunun dışına taşan görünmez bir `::after`
genişletmesi ne boyanır ne tıklanır. Bu yüzden hedef = görünür kutu ve
doğrudan kontrol token'ından gelir: imleçli cihazda 36/40/44px (AA 2.5.8'in
24px tabanının belirgin üstünde), dokunmatikte 44/44/48px (AAA 2.5.5).
Aynı kısıt GlassButton ve GlassStepper'da da geçerli; ikon buton bu sayede
yanındaki GlassButton ile aynı satır yüksekliğinde kalır. Hedefi görünür
ölçüden bağımsız büyütmek GlassSurface'te bir "hit-slop" kanalı gerektirir
(açık karar).

## 10. Storybook kapsamı

Var: Default, FavoriteOff, FavoriteOn, Large, Disabled, Sizes (üçü yan yana),
States (default · aktif · disabled matrisi; hover/focus CSS state'i olduğundan
zorlanmaz), UzunEtiket (uzun `label` tooltip/aria üzerinden — içerik N/A,
tek ikon). **Eksik:** Playground, Responsive (coarse pointer), Temalar,
Erişilebilirlik (aria-pressed gösterimi — States kısmen kapsıyor).

## 11. Test kabul kriterleri

- [x] `label` ile erişilebilir buton; onClick çalışır (unit)
- [x] `active` boolean → `aria-pressed` yansır
- [x] `active` verilmezse `aria-pressed` konmaz
- [x] disabled tıklamayı engeller
- [ ] `active=true` + tint'te görsel durum (visual)
- [ ] klavye aktivasyonu Enter/Space (interaction)
- [ ] reduced-motion'da scale uygulanmaz

## 12. Do / Don't

- ✅ `label`'ı duruma göre değiştir; ikonu `currentColor` ile çiz.
- ✅ Kalıcı durum için `tint` ver — yoksa kullanıcı durumu göremez.
- ❌ İçine metin koyma (→ GlassButton).
- ❌ `active`'i basılı-anı efekti sanma; o CSS `:active`'in işi.

**Bilinen kısıtlar:** hover gölgesindeki `!important` GlassSurface inline
stiline bağımlı. **Açık kararlar:** `active` prop adı **yanlış** — sistem
sözlüğünde (EksenlerVeDurumlar) geçici basılı durum `active`, kalıcı durum
`pressed`'dir; bu prop kalıcı durumu taşıdığı için `pressed` olarak
adlandırılmalı (breaking, v2) · `active=true` + tint'siz durumda görselin
değişmemesi düzeltilecek mi? · `type="button"` default'u.

**Changelog ek:** 2026-07-15 — basınçtaki radial glow katmanı kaldırıldı.
2026-08-03 — yeni kontrol ölçeğine uyum: `--lg-control-*` fallback'leri
güncel değerlere çekildi (32/40/48 → 36/40/44); görünür ölçü imleçli cihazda
44→36 (sm) / 44→40 (md) / 48→44 (lg), dokunmatikte token 44/44/48'de kalıyor.
Dokunma hedefi kısıtı §9'a yazıldı.
