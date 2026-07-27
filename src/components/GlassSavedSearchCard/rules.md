---
name: GlassSavedSearchCard
category: içerik
status: hazır
lastReviewed: 2026-07-18
---

# GlassSavedSearchCard Kuralları

## 1. Amaç

Kullanıcının kaydettiği arama/alarm kartı: ölçüt özeti, yeni eşleşme sayısı,
alarm anahtarı ve yönetim aksiyonları. Alıcı hesabı ve arama alarmları
sayfalarında kullanılır.

- **Kullan:** kaydedilen aramalar listesi, alarm yönetimi.
- **Kullanma:** ilan kartı (→ `GlassListingCard`), satıcı ilan yönetimi
  (→ `GlassListingManagementCard`).

## 2. Semantik sözleşme

- Kök `<article>` — kart tümüyle button DEĞİL; başlık gerçek heading (`headingAs`).
- Alarm anahtarı `GlassSwitch` (`role="switch"`), controlled/uncontrolled
  deseni (`alertsEnabled` / `defaultAlertsEnabled` / `onAlertsChange`).
- Silme butonu bağlama duyarlı `aria-label` ("{title} aramasını sil").
- Callback verilmeyen aksiyon butonu çizilmez (false affordance yok).
- Ölçütler adlandırılmış `<ul aria-label>`.
- Yeni sonuç rozeti sr-only "eşleşme" bağlamı taşır.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik |
|---|---|---|
| header | ✅ | başlık + yeni rozet + alarm switch |
| criteria | — | ölçüt chip listesi |
| meta | — | son çalıştırma / sıklık |
| actions | — | aç / düzenle / sil (koşullu). "Sonuçları aç" `<GlassButton prominent size="sm">`, "Düzenle" `<GlassButton size="sm">` compose eder; "Sil" yerel quiet/danger buton (danger ekseni kararı bekliyor). |

## 4. Public API

| Ad | Tür | Default | Controlled |
|---|---|---|---|
| title | `string` | — (zorunlu) | — |
| criteria | `string[]` | — (zorunlu) | — |
| newResultCount | `number` | `0` | — |
| lastRunLabel / frequencyLabel | `string` | — | — |
| alertsEnabled | `boolean` | — | ✅ (`onAlertsChange`) |
| defaultAlertsEnabled | `boolean` | — | uncontrolled başlangıç |
| onAlertsChange | `(enabled)=>void` | — | — |
| onOpen / onEdit / onDelete | `()=>void` | — | verilmezse buton yok |
| headingAs | `'h2'\|'h3'\|'h4'` | `'h3'` | — |
| ...rest | `HTMLAttributes<HTMLElement>` (title hariç) | — | önce yayılır |

## 5. Seçenek eksenleri

Varsayılan: `headingAs=h3`. Cam yok (içerik katmanı).

| Türetilen | Davranış |
|---|---|
| `newResultCount<=0` | rozet yok |
| alarm prop'larının hiçbiri yok | switch yok |
| aksiyon callback yok | ilgili buton yok |

## 6. State modeli

Alarm anahtarı controlled/uncontrolled (GlassSwitch'e devredilir). Kartın kendi
başka durumu yok.

## 7. Davranış

- "Sonuçları aç"/"Düzenle" GlassButton'dır (focus halkası ve basınç etkileşimi
  GlassButton sözleşmesinden gelir); "Sil" `:focus-visible` + min 44px
  (`--lg-control-md`).
- Uzun başlık/kriter sarar; kriter listesi `flex-wrap`.
- Animasyon yok.

## 8. İçerik kuralları

- `title` aramayı tanımlar ("Urla deniz manzaralı bahçeli").
- `criteria` kısa özet etiketleri; tam sorgu değil.
- Silme her zaman bağlama duyarlı adla ("… aramasını sil").

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` |
| newBadge | background | `color-mix(--lg-accent 14%)` |
| chip | background | `color-mix(--lg-label-secondary 10%)` |
| aç / düzenle | — | GlassButton compose (`prominent size="sm"` / `size="sm"`) — kendi token setini kullanır |
| quiet (sil) | color | `--lg-danger` |
| sil min-height | | `--lg-control-md` |

**Borç (mikro-geometri, `.root` üzerinde yerel değişken):**
- `--gssc-badge-padding-block: 2px` — yeni sonuç rozeti dikey dolgusu.
- `--gssc-chip-padding-block: 3px` — ölçüt çipi dikey dolgusu.

Bunların dışında raw px yok. `.quiet` `:hover` kuralı `@media (hover: hover)`
bloğu içinde — dokunmatikte yapışan hover durumu oluşmaz.

## 10. Storybook kapsamı

Default, Yeni Sonuç Yok, Alarm Kapalı, Salt Okunur, Uzun Kriter Listesi,
Responsive (mobile1), Erişilebilirlik (docs).

## 11. Test kabul kriterleri

- [x] article + gerçek heading (kart button değil)
- [x] yeni sonuç rozeti (>0 / 0 ayrımı)
- [x] alarm switch uncontrolled + callback
- [x] alarm prop'u yoksa switch yok
- [x] silme bağlama duyarlı ad
- [x] callback yokken buton yok
- [x] onOpen callback
- [x] adlandırılmış ölçüt listesi

## 12. Do / Don't

- ✅ Kartı `<article>` tut; başlığı heading yap.
- ✅ Silme adını bağlama duyarlı ver.
- ❌ Kartın tamamını tıklanabilir button yapma (GlassListingCard hatası).
- ❌ Boş callback ile buton "görünsün diye" ekleme.

## Changelog

- 2026-07-24: Buton kompozisyonu — "Sonuçları aç" → `<GlassButton prominent
  size="sm">`, "Düzenle" → `<GlassButton size="sm">`; `.primary`/`.secondary`
  CSS sınıfları silindi. "Sil" (quiet/danger) danger ekseni kararı bekleyene
  dek yerel kaldı. Davranış (koşullu render, onClick) değişmedi.
- 2026-07-24: Uyum düzeltmesi — `.primary`/`.secondary`/`.quiet` hover
  kuralları `@media (hover: hover)` içine alındı (dokunmatikte yapışan hover
  giderildi); mikro-geometri (`2px` rozet, `3px` çip dikey dolguları) `.root`
  üzerinde yerel değişkenlere toplandı (§9). Görsel değişiklik yok.
- 2026-07-18: İlk sürüm — article + heading, controlled alarm switch, koşullu
  aksiyonlar. Codex `CodexSavedSearchCard` deseninden türetildi.
