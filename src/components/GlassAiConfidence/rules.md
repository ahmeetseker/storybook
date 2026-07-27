---
name: GlassAiConfidence
category: içerik
status: hazır
lastReviewed: 2026-07-18
---

# GlassAiConfidence Kuralları

## 1. Amaç

AI cevabının güven düzeyini erişilebilir bir `meter` + seviye metni + etkenler
listesiyle sunar. Güvenin ne olduğunu, ne kadar olduğunu ve neyin etkilediğini
şeffaf gösterir; güveni bir doğruluk garantisi olarak sunmaz.

- **Kullan:** AI özet/cevap/değerleme çıktısının yanında güven göstergesi.
- **Kullanma:** genel skor göstergesi (→ `GlassScoreMeter`), kaynak listesi
  (→ `GlassAiEvidenceList`).

## 2. Semantik sözleşme

- Skor varsa `<div role="meter">` + `aria-valuemin/max/now` + `aria-valuetext`;
  accessible name görünür etiketten `aria-labelledby` ile gelir.
- Skor [0,100]'e clamp; `NaN`/`Infinity` sonlu değilse "ölçülmedi" sayılır.
- Skor yoksa sessizce gizlenmez: `role="note"` "Ölçülmedi — sonucu doğrulayın"
  fallback'i (Codex'in üstün deseni).
- Seviye ("Düşük/Orta/Yüksek") ve etken yönü ("Artırıyor/Azaltıyor/Nötr") renk
  dışında metinle iletilir (sr-only + görünür).
- Kalıcı uyarı: "Güven skoru doğruluk garantisi değildir."

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| head | ✅ | etiket + seviye·yüzde okuması |
| meter / unmeasured | ✅ | skor varsa meter, yoksa fallback |
| factors | — | etken listesi (`aria-label`'lı `ul`) |
| disclaimer | ✅ | kalıcı garanti uyarısı |

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| score | `number` | — | verilmezse "ölçülmedi" |
| factors | `GlassAiConfidenceFactor[]` | `[]` | `{id,label,impact?}` |
| label | `string` | `'Güven düzeyi'` | meter accessible name |
| size | `'md'\|'sm'` | `'md'` | yoğunluk |
| ...rest | `HTMLAttributes<HTMLDivElement>` (title hariç) | — | birleşir; önce yayılır |

`impact`: `positive`\|`negative`\|`neutral`.

## 5. Seçenek eksenleri

Varsayılan: `size=md`. Seviye tonu otomatik eşik (≥70 success, 40-69 accent,
<40 danger); metin zaten seviyeyi söyler, renk ikincildir.

| Türetilen | Davranış |
|---|---|
| `score` sonlu değil / yok | meter yok, "ölçülmedi" fallback |
| `factors` boş | etken listesi çizilmez |

## 6. State modeli

Etkileşimsiz. Durum yalnız `score`/`factors` verisiyle belirlenir.

## 7. Davranış

- Meter dolgusu `inline-size` 0.3s ease-out; `prefers-reduced-motion` kapatır.
- Responsive: tam genişliğe uyar.

## 8. İçerik kuralları

- `label` kısa ("Yanıt güveni"); yüzde/seviye metni component tarafından yazılır.
- `factors` somut olmalı ("Tapu kaydı doğrulandı"), yönü doğru eşlenmeli.
- Fallback ve disclaimer her zaman görünür — güven abartılmaz.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| meter track | background | `--lg-hairline` |
| fill/readout | background/color | `--glass-confidence-tone` ← success/accent/danger |
| unmeasured | background/border | `color-mix(--lg-warning ...)` |
| disclaimer | color | `--lg-label-secondary` |

Etken glifi `--lg-text-badge` token'ına bağlandı (9→11px, denetim kararı).

Borç (mikro-geometri): meter yüksekliği component kökünde yerel değişken —
`.root { --meter-height: 8px; }` (GlassScoreMeter bar borcuyla aynı).

**Animasyon tekniği:** dolgu genişlik animasyonu YASAK — `.fill` her zaman
%100 genişliktedir, oran inline `transform: scaleX(oran)` ile verilir
(`transform-origin: left`, RTL'de `right`; track `overflow: hidden`).
Geçiş yalnız `transform` üzerindedir, reduced-motion'da kapanır.

## 10. Storybook kapsamı

Default, Seviyeler, Ölçülmedi, Etkenli, Kompakt, Erişilebilirlik (docs).

## 11. Test kabul kriterleri

- [x] meter rolü + aria değerleri + `aria-labelledby`
- [x] clamp (128→100)
- [x] NaN/Infinity → "ölçülmedi", meter yok
- [x] skor yoksa açık fallback (sessiz gizleme yok)
- [x] seviye metni + `data-level`
- [x] etken listesi + yön sr-only metni
- [x] kalıcı disclaimer
- [x] rest ile className birleşir

## 12. Do / Don't

- ✅ Skor yoksa "ölçülmedi" göster — uydurma güven yazma.
- ✅ Etkenleri şeffaf listele; yönü doğru işaretle.
- ❌ Güveni doğruluk garantisi gibi sunma (disclaimer kaldırma).
- ❌ Genel amaçlı skor için kullanma (→ `GlassScoreMeter`).

## Changelog

- 2026-07-18: İlk sürüm — meter + seviye + etken listesi, "ölçülmedi" fallback,
  kalıcı disclaimer. Codex `CodexAiConfidence` deseninden türetildi.
