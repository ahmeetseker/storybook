---
name: GlassFaqMarquee
category: içerik
status: hazır
lastReviewed: 2026-08-07
---

# GlassFaqMarquee Kuralları

## 1. Amaç

SSS kartlarının yatay raflar halinde kesintisiz aktığı vitrin bölümü.
Satırlar farklı hız ve yönde döner; amaç sayfanın sonunda soruları göz
ucuyla yakalatmaktır — sözlük değil, vitrindir.

- **Kullan:** pazarlama/paket sayfalarının SSS bölümü, çok soruluk vitrin.
- **Kullanma:** hukuki/kritik bilgi (hareket okumayı bozar, tek geçişte
  kaçırılır), az sorulu kısa liste (→ `GlassAccordion` — açılır kapanır,
  aranabilir), destek dokümantasyonu (→ statik sayfa).

| İlgili | Farkı |
|---|---|
| GlassMarquee | Tek satırlık bağlantı şeridi; bu component kart rafı döndürür |
| GlassAccordion | Statik, tıkla-aç SSS; okuma odaklı sayfalarda onu seç |

## 2. Semantik sözleşme

- Kök `<section>`: `title` verilirse `<h2>` basılır ve bölge `aria-labelledby`
  ile, verilmezse `label` prop'u ile adlandırılır.
- Kart `<li>` içinde `<h3>` soru + `<p>` cevap; satır `<ul>`'dur.
- Kesintisiz döngü için her satır **iki kez** basılır. Kopya `aria-hidden` +
  `inert`: ekran okuyucu aynı soruyu iki kez okumaz, klavye kopyaya takılmaz.
- Duraklat/sürdür düğmesi gerçek `<button>`; erişilebilir adı eyleme göre
  değişir ("Şeridi duraklat" / "Şeridi sürdür"), ikon `aria-hidden`.
- Hareket durumu kökte `data-paused`, satır yönü `data-direction` ile DOM'da
  görünür (test ve hata ayıklama kancası).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | — | bölüm başlığı | verilirse `<h2>`; girişte fadeInUp oynar |
| subtitle | — | açıklama satırı | yalnız title ile birlikte anlamlı |
| rows[].items[].question | ✅ | soru cümlesi | kart başlığı `<h3>` |
| rows[].items[].answer | ✅ | cevap metni | 1–3 cümle; uzun cevap kartı büyütür |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| rows | prop | `GlassFaqMarqueeRow[]` | — | Satırlar; her satır kendi hız/yönünü taşır |
| rows[].speed | prop | `number` | `40` | Saniyedeki piksel — süre ölçülen genişlikten türetilir |
| rows[].direction | prop | `'start'\|'end'` | `'start'` | start: sağdan sola |
| title | prop | `ReactNode` | — | `<h2>` bölüm başlığı |
| subtitle | prop | `ReactNode` | — | Başlık altı açıklama |
| label | prop | `string` | — | Başlıksız gömmede bölgenin erişilebilir adı |

## 5. Seçenek eksenleri

- Hız süre değil **pikseldir**: uzun satır hızlanmaz, kısa satır yavaşlamaz
  (süre = ölçülen grup genişliği / speed, `ResizeObserver` ile güncellenir).
- Birleşik variant yok; satır sayısı ve yönler veriden gelir.

## 6. State modeli

| State | Kaynak | Görsel |
|---|---|---|
| paused | düğme (`data-paused`) | tüm rafların animasyonu durur |
| hover (hover:hover) | CSS | yalnız imlecin üstündeki raf durur |
| focus-within | CSS | tüm raflar durur (klavye kovalamaca yaşamaz) |
| reduced-motion | CSS | döngü hiç başlamaz; kopya gizlenir, raf yatay kaydırılır, düğme gizlenir |

## 7. Davranış

- Döngü `translate3d` ile -%50'ye kayar; iki grup yan yana olduğundan desen
  kesintisiz başa döner. Animasyon yalnız transform kullanır.
- Kenarlar `mask-image` ile erir — kesik kart "yarım kaldı" hissi vermez.
- Grup genişliği viewport'tan dar kalırsa döngüde boşluk görünür; satır başına
  en az viewport'u dolduracak kadar kart ver (pratikte ≥3 kart).

## 8. İçerik

Soru tek cümle; cevap 1–3 cümle. Uzun cevap kartı dikeyde büyütür, satırdaki
tüm kartlar `align-items: stretch` ile eş boya gelir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| kart | background / border / gölge | `--lg-surface` / `--lg-hairline` / `--lg-shadow-xs` |
| kart | radius / padding | `--lg-radius-card` / `--lg-space-6` |
| soru | font | `--lg-text-headline`, 700 |
| cevap | font / renk | `--lg-text-body` / `--lg-label-secondary` |
| başlık | font | `--lg-text-display`, 700 |
| raf arası | gap | `--lg-space-6` |
| düğme | hedef | `--lg-control-hit` |

**Borç notu:** `--faq-card-inline: 24rem` ve `--faq-fade: 3rem` mikro
geometrisinin token karşılığı yok (GlassMarquee'deki `--marquee-fade` ile
aynı durum). Ölçek token'a bağlanırsa buradan tüketilecek.

## 10. Storybook kapsamı

Var: Default (iki raf, zıt yön), TekRaf, Başlıksız, Playground, Responsive,
Erişilebilirlik. **Eksik:** forced reduced-motion görseli (addon gerekir).

## 11. Test kabul kriterleri

- [x] başlık `<h2>` + bölge adlandırma (`aria-labelledby` / `label`)
- [x] satır başına iki grup; kopya `aria-hidden`
- [x] duraklat düğmesi `data-paused` yazar, adı eyleme göre değişir
- [x] satır yönü `data-direction` kancasına yazılır
- [ ] reduced-motion'da döngü başlamaz (visual)

## 12. Do / Don't

- ✅ Satır başına ≥3 kart — grup viewport'u doldursun, döngü boşluk vermesin.
- ✅ Zıt yönlü satırlar — akış tek blok gibi görünmez.
- ❌ Kart içine link/buton koyma: hareketli hedefe tıklamak kovalamacadır;
  eylem gerekiyorsa bölümün altına sabit CTA koy.
- ❌ Kritik/hukuki metni rafa koyma.

**Açık kararlar:** kart içeriğini slot'a açmak (şimdilik soru+cevap sabit
anatomi — üçüncü bir alan istenirse eksen o zaman açılır).

## Changelog

- 2026-08-07 — İlk sürüm. GlassMarquee'nin döngü sözleşmesi (çift kopya +
  `aria-hidden`/`inert`, ölçülen süre, duraklat + hover/focus durması,
  reduced-motion'da statik raf) kart rafına taşındı; fadeInUp başlık girişi.
