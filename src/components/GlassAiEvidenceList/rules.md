---
name: GlassAiEvidenceList
category: içerik
status: hazır
lastReviewed: 2026-07-18
---

# GlassAiEvidenceList Kuralları

## 1. Amaç

AI cevaplarının kaynak/dayanak (citation) listesi — AI şeffaflık katmanının
çekirdeği. Bir AI özeti/cevabı hangi kaynaklara dayandığını numaralı, doğrulama
durumlu ve ilgi oranlı biçimde gösterir. Kullanıcı karar vermeden önce kaynağı
denetleyebilir.

- **Kullan:** AI özet/cevap kartının altında kaynak gösterimi, değerleme/risk
  çıktısının dayanakları.
- **Kullanma:** serbest kaynak notu tek satırsa (→ `GlassAiSummaryCard.sourceNote`),
  güven skoru göstergesi (→ `GlassAiConfidence`).

## 2. Semantik sözleşme

- Kök `<section aria-labelledby>` adlandırılır; kaynaklar numaralı `<ol>`.
- AI-first standardı: koşulsuz `✦ AI` rozeti (`aria-label="Yapay zekâ üretimi"`).
- Doğrulama durumu renk dışında metinle: "Doğrulandı" / "Doğrulanmalı".
- `relevance` [0,100]'e clamp; sonlu değilse gizlenir.
- Kaynak açma: `href` → `<a>`, yalnız `onOpen` → `<button>`, ikisi de yoksa
  tıklanamaz `<div>` (false affordance yok).
- Boş liste: `role="note"` güvenli mesaj ("önce doğrulayın") — `alert` DEĞİL.
- AI çıktısı asla otomatik eylem tetiklemez.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| header | ✅ | başlık + `✦ AI` rozeti + kaynak sayısı |
| index | ✅ | sıra numarası (`aria-hidden`) |
| itemTitle / meta | ✅ | başlık + kaynak türü etiketi |
| excerpt | — | alıntı (`compact`'te gizli) |
| state | ✅ | doğrulama + ilgi oranı |
| empty | boşken | güvenli `role="note"` mesaj |

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| evidence | `GlassAiEvidenceItem[]` | — (zorunlu) | `{id,title,sourceType,verified?,relevance?,excerpt?,href?,onOpen?}` |
| title | `string` | `'Kaynaklar'` | bölüm başlığı |
| emptyMessage | `string` | güvenli metin | boş liste mesajı |
| compact | `boolean` | `false` | alıntıları gizler |
| ...rest | `HTMLAttributes<HTMLElement>` | — | birleşir; yönetilenlerden önce yayılır |

`sourceType`: `official`\|`listing`\|`market`\|`document`\|`user`.

## 5. Seçenek eksenleri

Varsayılan: dolu liste, `compact=false`. Cam yok (içerik katmanı).

| Türetilen | Davranış |
|---|---|
| `relevance` sonlu değil | ilgi satırı gizlenir |
| `href` + `onOpen` | `<a>`; tıklamada `onOpen` da çağrılır |
| ne `href` ne `onOpen` | statik `<div>` |
| boş `evidence` | `role="note"` mesaj |

## 6. State modeli

Etkileşimsiz veri sunumu; hover/focus yalnız açılabilir kaynaklarda (`:focus-visible`).

## 7. Davranış

- Açılabilir kaynaklar `:focus-visible` halkası + coarse pointer'da min 44px.
- Uzun başlık/alıntı `overflow-wrap: anywhere` ile sarar.
- Animasyon yok.

## 8. İçerik kuralları

- `title` kaynağın ne olduğunu net söylemeli ("Tapu kaydı — 34/1284").
- Doğrulanmamış kaynak "Doğrulanmalı" rozetiyle açıkça işaretlenir — kullanıcı
  ne kadar güvenebileceğini görür.
- Boş mesaj her zaman "doğrulayın" çağrısı içermeli.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` |
| badge/index | background | `color-mix(--lg-accent 12%)` |
| verify true | color | `--lg-success` |
| verify false | color | `--lg-warning` |
| empty | background/border | `color-mix(--lg-warning ...)` |

Raw px: index rozeti 22px + rozet font 10.5px — AI rozet standardıyla aynı borç.

## 10. Storybook kapsamı

Default, Karışık Doğrulama, Boş Durum, İnteraktif ve Statik, Kompakt,
Uzun İçerik, Erişilebilirlik (docs).

## 11. Test kabul kriterleri

- [x] koşulsuz `✦ AI` rozeti + adlandırılmış bölüm
- [x] kaynak türü Türkçe etiket
- [x] doğrulama metinle (Doğrulandı/Doğrulanmalı)
- [x] relevance clamp (128→100)
- [x] href→a / onOpen→button / statik ayrımı + callback
- [x] boş liste `role="note"` (alert değil)
- [x] rest-override koruması

## 12. Do / Don't

- ✅ Her AI cevabının altına kaynak listesini koy — şeffaflık zorunlu.
- ✅ Doğrulanmamış kaynağı gizleme; "Doğrulanmalı" olarak göster.
- ❌ Boş listede sessiz kalma; güvenli doğrulama mesajı göster.
- ❌ Kaynağı otomatik açan/uygulayan eylem bağlama — yalnız kullanıcı açar.

## Changelog

- 2026-07-18: İlk sürüm — numaralı kaynak listesi, renk-dışı doğrulama/ilgi
  kanalı, güvenli boş durum. Codex `CodexAiEvidenceList` deseninden türetildi.
