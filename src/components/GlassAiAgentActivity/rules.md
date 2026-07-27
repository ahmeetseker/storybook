---
name: GlassAiAgentActivity
category: içerik
status: hazır
lastReviewed: 2026-07-24
---

# GlassAiAgentActivity Kuralları

## 1. Amaç

AI ajanın kullandığı araçları ve karar bekleyen adımları canlı bir denetim
kaydı olarak gösterir. Yüksek etkili adımlar açık bir insan izin kapısı sunar;
ajan izin almadan ilerlemez.

- **Kullan:** ajan/kopilot akışı, otomasyon denetim paneli, izin kuyruğu.
- **Kullanma:** sohbet baloncukları (→ `GlassChatDock`), tekil risk incelemesi
  (→ `GlassAiRiskReview`).

## 2. Semantik sözleşme

- Kök `<section aria-labelledby>`; koşulsuz `✦ AI` rozeti; aktif işlem varken
  `aria-busy`.
- Akış `<ol role="log" aria-live="polite">` — yeni işlemler duyurulur.
- Durum ("Sırada/Çalışıyor/Tamamlandı/İzin bekliyor/Reddedildi/Hata") renk
  dışında metinle iletilir.
- `needsApproval` girişte "İzin ver"/"Reddet" butonları — yalnız ilgili callback
  verilince çizilir (false affordance yok). İzin kapısı butonları `GlassButton`
  compose eder: "İzin ver" `prominent size="sm"`, "Reddet" default `size="sm"`;
  kapı davranışı (callback sözleşmesi, id ile çağrı) değişmez.
- Çalışan/sırada işlem + `onStop` → "Çalışmayı durdur" (`GlassButton size="sm"`).
- Teknik ayrıntı `<details>` içinde katlı.
- Kalıcı yetki notu her durumda görünür.
- Boş akış: `role="status"` bilgilendirme.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| header | ✅ | başlık + `✦ AI` + (koşullu) durdur (`GlassButton size="sm"`) |
| log | dolu | işlem kalemleri (mark/durum/detay/meta/details) |
| actions | koşullu | izin ver/reddet (needsApproval) — `GlassButton` compose (approve `prominent`) |
| empty | boşken | bilgilendirme |
| permission | ✅ | kalıcı yetki notu |

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| entries | `GlassAgentActivityEntry[]` | — (zorunlu) | `{id,title,status,detail?,toolLabel?,timeLabel?,technical?}` |
| title | `string` | `'AI ajan etkinliği'` | başlık |
| onApprove / onReject | `(id)=>void` | — | needsApproval kapısı |
| onStop | `()=>void` | — | çalışan işlem varken |
| permissionNote | `string` | varsayılan yetki metni | kalıcı not |
| ...rest | `HTMLAttributes<HTMLElement>` (title hariç) | — | önce yayılır |

`status`: queued\|running\|done\|needsApproval\|rejected\|error.

## 5. Seçenek eksenleri

Varsayılan: akış dolu. Durdur/izin butonları türetilir.

| Türetilen | Davranış |
|---|---|
| running/queued yok | durdur butonu yok |
| status ≠ needsApproval | izin kapısı yok |
| callback yok | ilgili buton yok |

## 6. State modeli

Akış tamamen kontrollü (`entries`). Component iç state tutmaz; ebeveyn günceller.

## 7. Davranış

- `role="log"` + `aria-live="polite"` yeni giriş duyurur.
- `running` mark nabız animasyonu (transform/opacity); reduced-motion kapatır.
- Eylem butonları `GlassButton` compose eder; `:focus-visible` halkası ve
  coarse pointer'da 44px+ hedef GlassButton/kontrol token'larından gelir.

## 8. İçerik kuralları

- İşlem başlığı ne yapıldığını net söyler ("Satıcıya mesaj gönderilecek").
- Yüksek etkili adım her zaman `needsApproval` olmalı — sessizce yürütülmez.
- Yetki notu ajanın sınırını açıkça belirtir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` |
| mark running | background | `--lg-accent` |
| item needsApproval | background/border | `color-mix(--lg-warning ...)` |
| approve | görsel | `GlassButton prominent` (accent dolgu GlassButton'dan) |
| reject / stop | görsel | `GlassButton` default (cam kapsül) |
| permission | border-top | `--lg-hairline` |

Not (stop butonu): eski elle çizilmiş görünüm danger-karışımlı kenarlıklı
şeffaf ghost'tu. `tint={var(--lg-danger)}` tinted varyantı %55 saydam danger
dolgu verdiği için bu görünümden belirgin sapardı; bu yüzden tint'siz default
GlassButton kullanıldı. `.stop` sınıfı yalnız yerleşim (flex-shrink kilidi)
olarak korunur.

Rozet font'u `--lg-text-badge` token'ına bağlandı (10.5→11px kabul edilen
tipografi kayması).

Borç (mikro-geometri): token karşılığı olmayan değerler component kökünde
yerel değişken olarak toplandı — `.root { --mark-size: 9px; --mark-offset: 5px;
--gap-tight: 2px; --badge-pad-block: 3px; }` (durum noktası çapı/baseline
hizası, satır içi mikro aralık ve AI rozeti dikey dolgusu — kontrat sabiti,
diğer AI component'lerindeki 3px ile aynı).

## 10. Storybook kapsamı

Default, İzin Bekliyor, Hepsi Tamamlandı, Hata Durumu, Boş Akış, Responsive
(mobile1), Erişilebilirlik (docs).

## 11. Test kabul kriterleri

- [x] `✦ AI` rozeti + `role="log"` + `aria-live=polite`
- [x] durum metin kanalı
- [x] izin ver/reddet callback (id ile)
- [x] callback yokken buton yok
- [x] onStop yalnız aktif işlemde
- [x] teknik detay details/summary
- [x] boş akış bilgilendirme
- [x] kalıcı yetki notu
- [x] aktif işlemde aria-busy

## 12. Do / Don't

- ✅ Yüksek etkili adımı `needsApproval` yap; izinsiz yürütme.
- ✅ Teknik ayrıntıyı `details` içinde sun (gürültü yapmadan denetlenebilir).
- ❌ İzin kapısını atlayıp otomatik onaylatma.
- ❌ Yetki notunu kaldırma — ajan sınırı görünür kalmalı.

## Changelog

- 2026-07-24: Durdur/İzin ver/Reddet butonları `GlassButton` kompozisyonuna
  geçirildi (approve `prominent size="sm"`, diğerleri default `size="sm"`);
  izin kapısı davranışı ve log semantiği birebir korundu. Ölü buton CSS'i
  silindi; stop'ta tint kullanılmama gerekçesi §9'da.
- 2026-07-18: İlk sürüm — `role="log"` denetim akışı + izin kapısı + yetki notu.
  Codex `CodexAiAgentActivity` deseninden türetildi.
