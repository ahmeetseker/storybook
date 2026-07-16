---
name: GlassButton
category: kontroller
status: hazır
lastReviewed: 2026-07-15
---

# GlassButton Kuralları

## 1. Amaç

Capsule cam buton: basınca sıvılaşır, bırakınca jöle salınımıyla döner.
Navigasyon/kontrol katmanının birincil aksiyonudur.

- **Kullan:** sayfa aksiyonları (Mesaj Gönder, Devam Et), cam katmandaki CTA'lar.
- **Kullanma:** ikon-tek aksiyon (→ `GlassIconButton`), kalıcı aç/kapa durumu
  (→ ToggleButton yok; Açık Kararlar), içerik kartı içindeki liste linkleri.

| İlgili | Farkı |
|---|---|
| GlassIconButton | İkon-tek, kare→daire; `label` zorunlu |
| GlassListingCard | Tıklanabilir içerik kartı; buton değil |

## 2. Semantik sözleşme

- Element: `<button>` (motion.button). `as` desteklenmez.
- Accessible name: children metni.
- `type` default'u `'button'` — form içinde kazara submit olmaz.
- DOM değişmezleri: (1) gerçek `<button>` kalır, (2) içerik `.content`
  span'inde sarılıdır.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | ✅ | metin (+opsiyonel inline ikon) | Tek satır; sarma yok (`white-space: nowrap`) |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| size | prop | `'sm'\|'md'\|'lg'\|'xl'` | `'md'` | Yükseklik kontrol token'ından |
| tint | prop | `string` | — | Semantik vurgu; `--glass-tint` CSS var'ına yazılır |
| prominent | prop | `boolean` | `false` | Birincil aksiyon; tint verilmezse `--lg-accent` |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu |
| loading | prop | `boolean` | `false` | `aria-busy`; tekrar aktivasyon yok; genişlik korunur |
| disabled | prop | `boolean` | `false` | Native attribute |
| type | prop | `'button'\|'submit'\|'reset'` | `'button'` | Kazara form submit engellenir |
| ...rest | — | `ButtonHTMLAttributes` | — | `onClick` vb. |

Event: `onClick` — `disabled` iken çalışmaz (native). Basınç animasyonu
`onPointerDown/Up/Leave/Cancel` ile yönetilir, dışarı sızmaz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, cam, nötr.

| Yasak / türetilen | Davranış |
|---|---|
| `prominent` + `tint` yok | tint `--lg-accent`'ten türetilir |
| `tinted` + `prominent` birlikte | prominent kazanır (className sırası) |
| hover/focus/active prop olarak | ❌ — yalnız CSS |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| hover | CSS (`hover:hover`) | — | Opak beyaz zemin + koyu metin + scale 1.05 + gölge (tvOS focus modeli) |
| active | CSS + useGlassPress | — | Tam beyaz + sıvılaşma + jöle |
| focus-visible | CSS | — | 2px `--lg-accent` halka |
| disabled | native | hover, active | opacity .45 + `pointer-events: none` |
| loading | prop | active, hover lift | Etiket gizlenir (yer tutar), spinner döner, `cursor: progress`, `aria-busy` |

## 7. Davranış

- Keyboard: Enter/Space aktive eder (native). Focus halkası yalnız klavyede.
- `prefers-reduced-motion`: spring'ler ve hover scale kapalı; renk geçişi kalır.
- Touch: `touch-action: manipulation`; yükseklik dokunmatikte min 44px (md).

## 8. İçerik

Tek satır; uzun metin taşarsa buton büyür, kırpma yapılmaz — çağıran metni kısaltır.
İkon kullanılacaksa metinle birlikte (`gap: 0.5em`), ikon-tek ise GlassIconButton.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | min-height | `--lg-control-{size}` |
| root | radius | capsule (shape prop'u) |
| root | focus outline | `--lg-accent` |
| prominent | background | `--glass-tint` ← `--lg-accent` |
| root | font | miras (`--lg-font`) |

Borç: hover beyazı (`rgba(255,255,255,.94)`) ve boyut padding'leri raw — token'a
bağlanmaları değerlendirilecek.

## 10. Storybook kapsamı

Var: Default, Tinted, Prominent, ExtraLarge, Disabled, Loading, Sizes, States,
LongContent (+ autodocs Controls = Playground). **Eksik:** forced hover/focus
görselleri (pseudo-states addon'u gerektirir), RTL.

## 11. Test kabul kriterleri

- [x] tint CSS var'a yazılır (unit)
- [x] disabled aktivasyonu engeller
- [ ] hover'da kontrast (visual)
- [ ] reduced-motion'da spring çalışmaz
- [ ] klavye aktivasyonu (interaction)

## 12. Do / Don't

- ✅ Sayfada tek `prominent` buton.
- ✅ İçerik katmanında buton gerekiyorsa yanına flat kart, butonu cam bırak.
- ❌ `tint`'e tema rengi verme (tema token'dan gelir); tint yalnız semantik vurgudur.
- ❌ Kalıcı basılı durum için kullanma.

**Açık kararlar:** ToggleButton ihtiyacı (kalıcı basılı durum) · forced
pseudo-state story'leri için addon değerlendirmesi.

## Changelog

- 2026-07-15: `loading` prop'u (`aria-busy`, spinner, genişlik koruma) ve
  `type="button"` default'u eklendi; story matrisi tamamlandı.
- 2026-07-15: basınçtaki radial glow (parmak ucu ışıma) katmanı kaldırıldı —
  metnin arkasında beliren beyaz parlama istenmiyordu.
