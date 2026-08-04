---
name: GlassInput
category: form
status: hazır
lastReviewed: 2026-08-03
---

# GlassInput Kuralları

## 1. Amaç

Tek satırlık cam metin girişi: arama, fiyat, başlık gibi kısa serbest metin.
Form katmanının temel giriş kontrolüdür; GlassField ile etiketlenerek kullanılır.

- **Kullan:** arama kutusu, fiyat/kilometre/başlık girişleri, filtre alanları.
- **Kullanma:** çok satırlı metin (→ `GlassTextarea`), önceden tanımlı seçenek
  listesi (→ `GlassSelect`), tarih gibi özel formatlar (Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassTextarea | Çok satır + autoResize |
| GlassSelect | Serbest metin değil, seçenek listesi |
| GlassField | Label/description/error sarmalayıcısı; input değil |

## 2. Semantik sözleşme

- Element: gerçek `<input>` (görsel kabuk `GlassSurface` div'i). `as` desteklenmez.
- Accessible name: dışarıdan `aria-label` ya da GlassField label'ı (context id).
- `size` native attr'ı ve `prefix` RDFa attr'ı Omit edilir; `size` bizim boyut
  eksenimizdir, `prefix` slot'tur.
- DOM değişmezleri: (1) gerçek `<input>` kalır, (2) adornment'lar `aria-hidden`,
  (3) temizle butonu `type="button"` + `aria-label="Temizle"`.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| prefix | — | ikon / para birimi | Dekoratif (`aria-hidden`); anlam label'da olmalı |
| input | ✅ | native input | Tüm `InputHTMLAttributes` buraya akar |
| clear | — | otomatik | Yalnız `clearable` + değer varken + disabled değilken |
| suffix | — | ikon / birim | Dekoratif |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Yükseklik `--lg-control-*` token'ından |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu (GlassSurface'e geçer) |
| invalid | prop | `boolean` | field context ?? `false` | `aria-invalid` + `--lg-danger` çerçeve |
| prefix | prop | `ReactNode` | — | Sol adornment slotu |
| suffix | prop | `ReactNode` | — | Sağ adornment slotu |
| clearable | prop | `boolean` | `false` | Değer varken temizle butonu |
| ...rest | — | `Omit<InputHTMLAttributes, 'size'\|'prefix'>` | — | `value/defaultValue/onChange/type/disabled`... |

Event: `onChange` — native. Temizle butonu native value setter + `input` event
dispatch eder; kontrollü/kontrolsüz her iki modda da `onChange` görür.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, cam, nötr, adornment'sız.

| Yasak / türetilen | Davranış |
|---|---|
| `invalid` verilmedi + GlassField error'lu | invalid context'ten `true` türetilir |
| `id` verilmedi + GlassField içinde | id context'ten gelir (label bağlanır) |
| `clearable` + `disabled` | temizle butonu render edilmez |
| `type="search"` | WebKit'in native çarpısı gizlenir; clearable kendi butonunu sunar |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| focus | CSS `:focus-within` | — | Kabukta 2px `--lg-accent` halka |
| invalid | prop / context | — | 1.5px inset `--lg-danger` çerçeve (`!important`, GlassButton emsali) |
| disabled | native | clear butonu | opacity .45; native etkileşim kapalı |
| dolu | value/defaultValue aynası | — | `clearable` ise temizle butonu görünür |

## 7. Davranış

- Keyboard: native input davranışı; temizle butonu Tab sırasında input'tan sonra.
- Temizle: değeri boşaltır, `onChange` tetikler, focus'u input'a geri verir.
- `prefers-reduced-motion`: geçişler zaten yalnız renk/gölge; ek animasyon yok.
- Responsive: genişlik her zaman %100 (block). **bp-sm altında font 16px** —
  iOS Safari, <16px input'a odaklanınca sayfaya zoom yapar; ≥640px'te tipografi
  token ölçeğine iner. Yükseklik `pointer: coarse`'ta token üzerinden 44px+.

## 8. İçerik

Placeholder yardım metni değildir (kaybolur) — kalıcı yardım GlassField
`description`'ına yazılır. Adornment'lar tek karakter/ikon; uzun metin koymayın.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| inner | min-height | `--lg-control-{size}` |
| root | radius | shape 12 (GlassSurface) |
| root | focus outline | `--lg-accent` |
| root | invalid çerçeve | `--lg-danger` |
| input | font-size (≥sm) | `--lg-text-footnote/body/headline` |
| placeholder, adornment | color | `--lg-label-secondary` |
| inner | gap/padding | `--lg-space-2` gap; md/lg padding `--lg-space-3/4` |

**Borç (raw / mikro-geometri):** md/lg yatay padding'ler birebir
`--lg-space-3/4`'e bağlandı; token karşılığı olmayanlar kökte yerel
değişkenlerde toplandı: `--pad-x-sm` (10px — space-2/3 arası),
`--ios-min-font` (16px — iOS Safari zoom eşiği, platform sabiti, <bp-sm tüm
boyutlarda geçerli). `--clear-size` artık raw değil, `--lg-space-6`'ya (24px)
bağlı. Bilinçli bırakılan: invalid
gölge deseni `inset 0 0 0 1.5px var(--lg-danger) + 0 4px 16px rgba(0,0,0,.12)`
shadow token'larıyla birebir eşleşmediğinden raw kaldı (`!important`
GlassSurface inline gölgesini ezmek için). Süre/easing (`0.16s ease-out`)
raw — token yok.

**Dokunma hedefi:** kabuk yüksekliği `--lg-control-{size}`'dan gelir —
imleçli cihazda 36/40/44, dokunmatikte 44/44/48px. Temizle butonu görünürde
24px kalır ama `::after` ile dikeyde `--lg-control-hit`e (44px) uzanır;
GlassSurface `overflow: hidden` taşıdığı için taşma satır yüksekliğinde
kırpılır, yani gerçek hedef satırın kendi yüksekliği kadardır (36–44px) —
eski 22px'e göre belirgin iyi. Yatayda genişletilmez: girdi metnine taşıp
yanlış hedef üretirdi.

## 10. Storybook kapsamı

Var: Default, Invalid, Disabled, Sizes, Adornments, ClearableSearch (kontrollü),
Mobile (viewport mobile1). **Eksik:** forced focus görseli, RTL.

## 11. Test kabul kriterleri

- [x] textbox rolü + yazma onChange tetikler
- [x] clearable: temizler, onChange görür, buton kaybolur
- [x] invalid → aria-invalid
- [x] disabled: input kapalı, clear yok
- [x] GlassField context: label/description/error bağları
- [x] type="search" geçer

## 12. Do / Don't

- ✅ Her zaman GlassField ile ya da `aria-label` ile etiketle.
- ✅ Sayısal alanlarda `inputMode="numeric"` ver (mobil klavye).
- ❌ Placeholder'ı label yerine kullanma.
- ❌ prefix/suffix'e tıklanabilir öğe koyma (aria-hidden'dır) — aksiyon
  gerekiyorsa GlassIconButton'ı input'un dışına yerleştir.

**Açık kararlar:** maskeli giriş (fiyat binlik ayracı) · şifre görünürlük
toggle'ı (suffix aksiyonu gerektirir).

## Changelog

- 2026-07-16: İlk sürüm — size/tone/invalid/prefix/suffix/clearable,
  GlassField context entegrasyonu, iOS 16px kuralı.
- 2026-08-03: Yeni kontrol ölçeği. Kabuk yüksekliği imleçli cihazda
  44/44/48 → 36/40/44px (token değişimi; CSS'te yalnız bayat fallback'ler
  güncellendi). `--clear-size` 22px → `--lg-space-6` (24px) ve butona
  görünmez `::after` hedef genişletmesi eklendi.
