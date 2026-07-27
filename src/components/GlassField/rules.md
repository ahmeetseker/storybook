---
name: GlassField
category: form
status: hazır
lastReviewed: 2026-07-16
---

# GlassField Kuralları

## 1. Amaç

Form alanı sarmalayıcısı: label + kontrol + description/error'ı tek dikey
ritimde toplar ve erişilebilirlik bağlarını (id, `aria-describedby`,
`aria-invalid`) Context ile içerideki kontrole otomatik dağıtır.

- **Kullan:** GlassInput/GlassTextarea/GlassSelect içeren her form alanı.
- **Kullanma:** salt görüntüleme satırları (→ `GlassSpecTable`), checkbox
  grubu gibi çoklu-kontrol fieldset ihtiyacı (Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassInput/Textarea/Select | Kontrolün kendisi; Field yalnız sarmalar |

## 2. Semantik sözleşme

- Element: `<div>` kök + gerçek `<label htmlFor>`; kontrol id'si context'ten.
- cloneElement YOK, render-prop YOK — children aynen basılır; bağ Context ile
  kurulur. Context tüketmeyen custom kontrole `htmlFor` + `id`'yi kullanıcı bağlar.
- Hata `aria-live="polite"` span'inde duyurulur (`role="alert"` bilinçli
  kullanılmaz — her tuş vuruşunda agresif kesinti istemiyoruz). Span her zaman
  DOM'da kalır ki ekran okuyucu içerik değişimini yakalasın.
- DOM değişmezleri: (1) label her zaman ilk çocuk, (2) error/description
  kontrolün altında.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| label | ✅ | düz metin | Footnote boyutu, semibold; `required` ise dekoratif `*` |
| children | ✅ | form kontrolü | Context tüketirse bağlar otomatik |
| description | — | düz metin | error varken gizlenir |
| error | — | düz metin | `--lg-danger`; describedBy hataya döner |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| label | prop | `string` | — (zorunlu) | Görünür etiket |
| description | prop | `string` | — | Kalıcı yardım metni |
| error | prop | `string` | — | Hata metni; varlığı `invalid=true` demektir |
| required | prop | `boolean` | `false` | `*` işareti + context'e `required` |
| htmlFor | prop | `string` | `useId()` üretimi | Kontrol id'si; verilmezse üretilir ve context'le dağıtılır |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | className, style... |

Context (`useGlassFieldContext()`): `{ id, describedBy, invalid, required }`
— kontrol kendi prop'u verilmişse kendi prop'u kazanır (`invalid ?? context`).

## 5. Seçenek eksenleri

| Yasak / türetilen | Davranış |
|---|---|
| `error` + `description` birlikte | description gizlenir, describedBy error'a döner |
| `htmlFor` verildi | context id'si de o olur (çift kaynak yok) |
| iç içe GlassField | ❌ — context gölgelenir, tanımsız davranış |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| default | — | — | label + kontrol (+ description) |
| error | `error` prop | description | `--lg-danger` metin; kontrol kendi invalid çerçevesini çizer |
| required | prop | — | label yanında `--lg-danger` `*` (aria-hidden) |

## 7. Davranış

- Label tıklaması kontrole odaklanır (native `htmlFor`).
- Hata metni değişince `aria-live="polite"` duyurur; focus çalınmaz.
- Responsive: her viewport'ta %100 genişlik — sütun düzenini üst layout kurar
  (ör. bp-md'de iki sütunlu grid'e Field'lar olduğu gibi girer).

## 8. İçerik

Label kısa isim tamlaması ("Fiyat", "İlan Başlığı"); noktalama yok. Description
tek cümle. Error, kullanıcının eylemiyle düzelteceği dille yazılır
("Fiyat 0 olamaz"), suçlayıcı değil.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| label, description, error | font-size | `--lg-text-footnote` |
| label | color | `--lg-label` |
| description | color | `--lg-label-secondary` |
| error, required | color | `--lg-danger` |
| dikey boşluklar | margin | `--lg-space-1` |

**Borç (raw / mikro-geometri):** required işaretinin label metnine mesafesi
2px — token karşılığı yok (`--lg-space-1` 4px görsel olarak fazla geniş),
component kökünde yerel değişkende toplandı (`.field { --required-gap: 2px; }`).
Bunun dışında raw px yok; `@media (min-width: 768px)` bp-md breakpoint'i
bilinçli istisnadır (satırda `bp-md` yorumu var).

## 10. Storybook kapsamı

Var: Default, WithDescription, WithError, LiveValidation (kontrollü),
FormComposition (Input+Select+Textarea), Mobile (viewport mobile1).
**Eksik:** yatay label yerleşimi (bilinçli yok — Açık Kararlar).

## 11. Test kabul kriterleri

- [x] label context id'siyle kontrole bağlanır (getByLabelText)
- [x] description aria-describedby ile bağlanır
- [x] error: description gizlenir, aria-live="polite", kontrol aria-invalid
- [x] required `*` dekoratiftir (aria-hidden)
- [x] htmlFor override çalışır

## 12. Do / Don't

- ✅ Her form kontrolünü GlassField ile sarmala — çıplak input bırakma.
- ✅ Hata mesajını alan bazında ver; form geneli özet ayrı bileşenin işi.
- ❌ `error`'a uzun paragraf yazma; tek satır aksiyon dili.
- ❌ label'ı boş verip placeholder'a güvenme.

**Açık kararlar:** yatay (label solda) yerleşim varyantı · fieldset/legend'li
çoklu kontrol grubu · form geneli hata özeti bileşeni.

## Changelog

- 2026-07-16: İlk sürüm — Context tabanlı id/aria dağıtımı
  (`useGlassFieldContext`), polite live region, required işareti.
