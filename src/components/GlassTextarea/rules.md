---
name: GlassTextarea
category: form
status: hazır
lastReviewed: 2026-07-16
---

# GlassTextarea Kuralları

## 1. Amaç

Çok satırlı cam metin girişi: ilan açıklaması, mesaj, not gibi uzun serbest metin.
`autoResize` ile içerik büyüdükçe alan büyür (scrollHeight tekniği).

- **Kullan:** ilan açıklaması, satıcıya mesaj, şikayet/başvuru metni.
- **Kullanma:** tek satır kısa metin (→ `GlassInput`), zengin metin editörü
  (kapsam dışı — Açık Kararlar).

| İlgili | Farkı |
|---|---|
| GlassInput | Tek satır; adornment/clearable var |
| GlassField | Label/description/error sarmalayıcısı |

## 2. Semantik sözleşme

- Element: gerçek `<textarea>` (görsel kabuk `GlassSurface` div'i).
- Accessible name: dışarıdan `aria-label` ya da GlassField label'ı (context id).
- `rows` Omit edilir → tek eksen `minRows/maxRows` (autoResize ile tutarlı).
- DOM değişmezleri: (1) gerçek `<textarea>` kalır, (2) autoResize yüksekliği
  inline `style.height` ile yönetir, başka stil override etmez.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| textarea | ✅ | native textarea | Tüm `TextareaHTMLAttributes` buraya akar |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Padding + tipografi ölçeği |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu |
| invalid | prop | `boolean` | field context ?? `false` | `aria-invalid` + `--lg-danger` çerçeve |
| autoResize | prop | `boolean` | `false` | scrollHeight tekniğiyle otomatik yükseklik; el ile resize kapanır |
| minRows | prop | `number` | `3` | Başlangıç/asgari satır (`rows` attr'ı) |
| maxRows | prop | `number` | — | autoResize üst sınırı; aşınca içeride scroll |
| ...rest | — | `Omit<TextareaHTMLAttributes, 'rows'>` | — | `value/defaultValue/onChange/disabled`... |

Event: `onChange` — native; autoResize açıksa önce yükseklik güncellenir.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, `minRows=3`, autoResize kapalı (el ile
dikey resize açık).

| Yasak / türetilen | Davranış |
|---|---|
| `autoResize` + el ile resize | `resize: none` — iki mekanizma çakışmaz |
| `maxRows` autoResize'sız | etkisiz (yalnız autoResize sınırı) |
| `invalid`/`id` verilmedi + GlassField içinde | context'ten türetilir |
| kontrollü `value` dışarıdan değişirse | `useLayoutEffect` yüksekliği yeniden hesaplar |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| focus | CSS `:focus-within` | — | Kabukta 2px `--lg-accent` halka |
| invalid | prop / context | — | 1.5px inset `--lg-danger` çerçeve |
| disabled | native | resize tutamacı | opacity .45 |
| taşma (autoResize) | scrollHeight > maxRows | büyüme | `overflow-y: auto` içeride scroll |

## 7. Davranış

- autoResize: `height='auto'` → `scrollHeight` oku → `minRows*lineHeight` ile
  `maxRows*lineHeight` arasına kırp. lineHeight hesaplanamazsa 20px fallback.
- Keyboard: native textarea (Enter yeni satır — form submit etmez).
- `prefers-reduced-motion`: yükseklik değişimi animasyonsuzdur (bilinçli:
  yazma sırasında zıplama hissi yaratmamak için transition yok).
- Responsive: genişlik %100. **bp-sm altında font 16px** (iOS Safari odak
  zoom'u); ≥640px'te token ölçeğine iner.

## 8. İçerik

Placeholder kısa tutulur; kalıcı yönerge GlassField `description`'ına.
Karakter sınırı gösterimi çağıranın işi (Açık Kararlar: sayaç slotu).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | radius | shape 12 (GlassSurface) |
| root | focus outline | `--lg-accent` |
| root | invalid çerçeve | `--lg-danger` |
| textarea | font-size (≥sm) | `--lg-text-footnote/body/headline` |
| placeholder | color | `--lg-label-secondary` |
| textarea | padding | boyuta özel raw px (borç) |

## 10. Storybook kapsamı

Var: Default, Invalid, Disabled, Sizes, AutoResize (kontrollü), Mobile
(viewport mobile1). **Eksik:** forced focus görseli, karakter sayacı örneği.

## 11. Test kabul kriterleri

- [x] textbox rolü + yazma onChange tetikler
- [x] minRows → rows attribute
- [x] autoResize scrollHeight'e göre height yazar
- [x] maxRows kırpar + overflow açar
- [x] invalid/disabled aria sözleşmesi
- [x] GlassField context bağları

## 12. Do / Don't

- ✅ Uzun formlarda `autoResize + maxRows` ver — sayfa scroll'u öngörülebilir kalır.
- ✅ Her zaman GlassField ile ya da `aria-label` ile etiketle.
- ❌ `autoResize`'ı sabit yükseklikli layout'larda kullanma (kart içi sabit alan).
- ❌ İçine HTML/zengin metin bekleyen akış koyma; bu düz metin alanıdır.

**Açık kararlar:** karakter sayacı slotu · yapıştırılan uzun metinde
"daralt" davranışı.

## Changelog

- 2026-07-16: İlk sürüm — size/tone/invalid/autoResize/minRows/maxRows,
  GlassField context entegrasyonu, iOS 16px kuralı.
