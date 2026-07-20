---
name: GlassAiRiskReview
category: içerik
status: hazır
lastReviewed: 2026-07-18
---

# GlassAiRiskReview Kuralları

## 1. Amaç

AI'ın önceliklendirdiği riskleri (moderasyon/uyuşmazlık) insan onay kapısıyla
sunar. AI karar vermez; nihai onay/red insana bırakılır. Ağır riskler görmezden
gelinerek onaylanamaz — bu bir güvenlik sözleşmesidir.

- **Kullan:** ilan moderasyonu, güven/trust operatör kuyruğu, tutarsızlık incelemesi.
- **Kullanma:** tek uyarı bandı (→ `GlassAiFlagBanner`), kaynak listesi
  (→ `GlassAiEvidenceList`).

## 2. Semantik sözleşme

- Kök `<section aria-labelledby>`; koşulsuz `✦ AI` rozeti.
- Önem ("Düşük/Orta/Yüksek/Engelleyici") ve durum ("Açık/Çözüldü/Kabul edildi")
  renk dışında metinle iletilir.
- **Kilit kuralı:** açık `high`/`blocking` risk varken onay butonu `disabled` +
  `role="status"` neden notu + `aria-describedby` ile bağlanır.
- Karar verilmişse (`approved`/`rejected`) aksiyon yerine `role="status"` karar
  özeti + reviewer gösterilir.
- Onay/red butonları yalnız callback verilince çizilir (false affordance yok).
- Boş liste: `role="note"` güvenli mesaj.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| header | ✅ | başlık + özet + `✦ AI` |
| list | dolu | risk kalemleri (severity/status + toggle) |
| empty | boşken | güvenli not |
| decision | ✅ | insan kararı + aksiyon/özet |
| lockNote | koşullu | onay kilidi nedeni |

## 4. Public API

| Ad | Tür | Default | Açıklama |
|---|---|---|---|
| items | `GlassAiRiskItem[]` | — (zorunlu) | `{id,title,description?,severity,status?,evidenceLabel?}` |
| decision | `'pending'\|'approved'\|'rejected'` | `'pending'` | insan kararı |
| reviewer | `string` | — | kararı veren |
| onApprove / onReject | `()=>void` | — | verilmezse buton yok |
| onItemToggle | `(id)=>void` | — | "Çözüldü işaretle" |
| title | `string` | `'Risk incelemesi'` | görünür başlık |
| label | `string` | — | alternatif erişilebilir ad |
| ...rest | `HTMLAttributes<HTMLElement>` (title hariç) | — | önce yayılır |

`severity`: low\|medium\|high\|blocking · `status`: open\|resolved\|accepted.

## 5. Seçenek eksenleri

Varsayılan: `decision=pending`. Kilit türetilir: açık severe risk sayısı > 0.

| Türetilen | Davranış |
|---|---|
| açık high/blocking var | onay `disabled` + neden notu |
| decision ≠ pending | aksiyon yerine özet badge |
| callback yok | ilgili buton yok |

## 6. State modeli

Karar ve risk durumu dışarıdan kontrollü (`decision`, `items[].status`);
component iç state tutmaz — ebeveyn yönetir.

## 7. Davranış

- Onay kilidi anında hesaplanır (render'da); risk çözülünce kilit kalkar.
- Butonlar `:focus-visible` halkası + min 44px.
- Animasyon yok.

## 8. İçerik kuralları

- Risk başlığı somut ("Tapu ile ilan alanı uyuşmuyor").
- Öneri/dayanak varsa gösterilmeli; kullanıcı neye dayandığını görmeli.
- Kilit notu her zaman "nasıl açılır" yolunu söyler (çöz/kabul et).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` |
| item severity kenarı | border-inline-start | `--lg-danger`/`--lg-warning`/`--lg-hairline` |
| approve | background | `--lg-accent` |
| lockNote | color | `color-mix(--lg-danger ...)` |
| buton min-height | | `--lg-control-md` |

Raw px: yok (severity glifi yerine metin + renkli kenar).

## 10. Storybook kapsamı

Default, Ağır Risk Kilidi, Onaylanabilir Durum, Onaylanmış, Reddedilmiş,
Boş Liste, Responsive (mobile1), Erişilebilirlik (docs).

## 11. Test kabul kriterleri

- [x] `✦ AI` rozeti + adlandırılmış bölüm + özet
- [x] açık severe risk → onay `disabled` + neden metni
- [x] severe yoksa onay aktif + callback
- [x] severity/status metin kanalı
- [x] karar verilince özet + reviewer (aksiyon yok)
- [x] onReject callback
- [x] callback yokken buton yok
- [x] boş liste güvenli not
- [x] onItemToggle yalnız açık risklerde

## 12. Do / Don't

- ✅ Onayı yalnız ağır riskler çözülünce serbest bırak (güvenlik kapısı).
- ✅ Kararı ve reviewer'ı denetim için sakla/göster.
- ❌ AI'a otomatik onay/red verdirme — insan kapısı zorunlu.
- ❌ Ağır riski gizleyip onay açma (kilidi baypas etme).

## Changelog

- 2026-07-18: İlk sürüm — risk kalemleri + insan karar kapısı + ağır-risk onay
  kilidi. Codex `CodexAiRiskReview` deseninden türetildi.
