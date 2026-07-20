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
| actions | — | aç / düzenle / sil (koşullu) |

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

- Butonlar `:focus-visible` + min 44px (`--lg-control-md`).
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
| primary | background | `--lg-accent` |
| quiet (sil) | color | `--lg-danger` |
| buton min-height | | `--lg-control-md` |

Raw px: yok.

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

- 2026-07-18: İlk sürüm — article + heading, controlled alarm switch, koşullu
  aksiyonlar. Codex `CodexSavedSearchCard` deseninden türetildi.
