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
| material | prop | `'glass'\|'flat'` | `'glass'` | Malzeme ekseni; `GlassSurface`'e geçer |
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
| `material="flat"` + `prominent` | dolgu kendi sınırıdır; `.flat` hairline'ı şeffaflaşır |
| hover/focus/active prop olarak | ❌ — yalnız CSS |

**`material` bir stil tercihi değil katman kararıdır.** `'glass'` butonu
kontrol katmanına taşır ve sayfanın cam bütçesinden (sayfa başına altı yüzey,
`GenelBakis.mdx`) bir pay yer. İçerik katmanındaki bir kartın veya yaprağın
içinde duran buton bu payı hak etmez — orada `'flat'` kullanılır ve buton
görünümü (zemin, metin, ağırlık) yine bu component'ten gelir.

Eksen açılmadan önce böyle her buton feature CSS'inde elle çiziliyordu ve her
biri kendi rengini uyduruyordu: kabuğun `İlan ver` butonu accent'i %85 ile,
ilan detayındaki karar rayının birincil eylemi DÜZ accent + ağırlık 700 ile
çiziyordu. Aynı sayfada yan yana iki farklı kahve görünüyordu.

Eksenin varlığı `'flat'` kullanma zorunluluğu değildir: bir sayfa bütün
butonlarının aynı malzemeyi paylaşmasını tercih edip bütçeyi bilerek aşabilir
(ilan detayı böyle yapar). O zaman bedeli görmek gerekir — cam zeminini
arkasındaki yüzeyden alır, tonlu bir bandın üstünde soluklaşır.

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
- Touch: `touch-action: manipulation`; yükseklik dokunmatikte TÜM boylarda min
  44px — `sm` coarse'ta `--lg-control-md`'ye yükselir (token'ı 36px'te kalırdı),
  md/lg/xl coarse token'larıyla zaten 44px+.

## 8. İçerik

Tek satır; uzun metin taşarsa buton büyür, kırpma yapılmaz — çağıran metni kısaltır.
İkon kullanılacaksa metinle birlikte (`gap: 0.5em`), ikon-tek ise GlassIconButton.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | min-height | `--lg-control-{size}` |
| root | radius | capsule (shape prop'u) |
| root | focus outline | `--lg-accent` |
| root | font-weight | `--lg-action-weight` |
| prominent | background | `--lg-action-prominent` |
| prominent | color | `--lg-action-prominent-label` |
| prominent | hover background | `--lg-action-prominent-hover` |
| root | font | miras (`--lg-font`) |

Dolu eylemin rengi burada değil **eylem dili token'larında** tanımlıdır
(`--lg-action-*`, bkz. `Tokenlar.mdx`). Sebep: aynı görünümü paylaşması gereken
her kontrol `<button>` değildir — dock'un `Satıcıya git` bağlantısı ve kabuğun
atlama bağlantısı `<a>`'dır ve bu component'i kullanamaz. Ortak kaynak
token seviyesinde olmazsa bu iki taraf kaçınılmaz olarak ayrışır.

`tint` verildiğinde component `--lg-action-tint` kancasını set eder; karışım
oranı ve kontrast kuralı token'da kalır, kontrol yalnız hangi rengin
tonlanacağını söyler.

Boyut rampası `--lg-space-*`, `--lg-text-*` ve `--lg-control-*`
birebir değerlerinden üretilir — yatay padding `sm` `--lg-space-3`, `md`
`--lg-space-5`, `lg` `--lg-space-6`, `xl` `--lg-space-7`; font-size `sm`
`--lg-text-footnote`, `md` `--lg-text-body`, `lg`/`xl` `--lg-text-headline`.
`--lg-focus-ring-width` yalnız `:focus-visible` outline kalınlığında
kullanılır — tipografi/boyut hesabına karışmaz (önceki `xl` font-size'ı
`calc(--lg-text-headline + --lg-focus-ring-width)` idi, token sözleşmesi
ihlaliydi; kaldırıldı). Prominent durumda normal, hover ve loading metni
daima `--lg-accent-contrast` kullanır; hover arka planı opak `--glass-tint` /
`--lg-accent` olur. Böylece Kağıt ve Grafit temada metin kontrastı durum
değişiminde bozulmaz.

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
- 2026-07-30: `sm`/`lg`/`xl` yatay padding'lerindeki `calc()` ek terimleri
  kaldırıldı, birebir `--lg-space-*` token'ına bağlandı; `xl` font-size'ı
  `--lg-focus-ring-width` içeren hesaptan `--lg-text-headline`'a (17px)
  indirgendi — focus halkası token'ı artık yalnız outline'da kullanılıyor.
