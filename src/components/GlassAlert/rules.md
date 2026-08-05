---
name: GlassAlert
category: durum
status: hazır
lastReviewed: 2026-07-16
---

# GlassAlert Kuralları

## 1. Amaç

Akış içi durum banner'ı: sayfanın/bölümün bağlamına dair bilgi, başarı, uyarı
veya hata. Overlay değildir — yerleşimde yer kaplar, içeriği itmez/kapatmaz.

- **Kullan:** form/sayfa üstü durum bildirimi (ilan yayında, ödeme reddedildi),
  bağlamsal ipuçları (fiyat piyasa altında).
- **Kullanma:** karar bekleyen kesinti (→ `GlassModal`), geçici bildirim/toast
  (yok — Açık Kararlar), küçük etiket (→ `GlassBadge`).

| İlgili | Farkı |
|---|---|
| GlassBadge | Tek kelimelik etiket; gövde/aksiyon taşımaz |
| GlassModal | Overlay; akışı keser ve yanıt bekler |

## 2. Semantik sözleşme

- Element: düz `div` — **flat** yüzey (cam değil; içerik katmanı, Temel kural 1).
- Rol severity'ye göre değişir:
  - `danger`/`warning` → `role="alert"` (assertive live region): kullanıcının
    işini etkileyen, hemen duyulması gereken sorun — ekran okuyucu mevcut konuşmayı
    keser.
  - `info`/`success` → `role="status"` (polite): akışı kesmeye değmeyecek
    bilgilendirme — sıra kendine gelince okunur. Her şeyi `alert` yapmak
    ekran okuyucu kullanıcısını gereksiz böler; bu yüzden rol ikiye ayrıldı.
- Kapatma butonu: gerçek `<button>` + `aria-label="Kapat"`.
- İkon `aria-hidden` — anlam severity metniyle taşınır, ikonla değil.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| icon | — (default var) | inline SVG | Severity ikonu; `icon` prop'u değiştirir, renk hep severity token'ı |
| title | — | düz metin | Kalın; tek satır önerilir |
| children | ✅ | gövde metni | 1–2 cümle; link içerebilir |
| action | — | buton(lar) | Mobilde alt satıra sarar, ≥sm satır içi |
| dismiss | — (`onDismiss` ile) | × butonu | Kendi küçük butonu; GlassIconButton değil (cam maliyeti gereksiz) |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| severity | prop | `'info'\|'success'\|'warning'\|'danger'` | `'info'` | Renk + rol + default ikon |
| title | prop | `string` | — | Kalın başlık satırı |
| children | prop | `ReactNode` | — | Gövde (zorunlu) |
| icon | prop | `ReactNode` | severity ikonu | Default SVG'nin yerine geçer |
| onDismiss | event | `() => void` | — | Verilirse × butonu görünür; görünürlüğü çağıran yönetir |
| action | prop | `ReactNode` | — | Aksiyon alanı (GlassButton `size="sm"` önerilir) |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | `className`, `style` vb. |

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `severity=info`, ikonlu, kapatmasız, aksiyonsuz.

| Yasak / türetilen | Davranış |
|---|---|
| rol | Prop değil — severity'den türetilir (dışarıdan `role` verme) |
| `icon` verilince | Renk yine severity token'ından; ikon yalnız biçim değiştirir |
| kapanış animasyonu | Yok — kaldırmayı çağıran yönetir (liste yeniden akar) |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| severity | prop | — | Sol 3px şerit + `color-mix` %12 soluk zemin + ikon rengi |
| dismiss hover | CSS | — | %18 tint zemin, label rengi koyulaşır |
| dismiss focus-visible | CSS | — | 2px `--lg-accent` halka |

## 7. Davranış

- Statik bileşen: kendi açık/kapalı state'i yok; `onDismiss` yalnız niyet bildirir.
- Keyboard: yalnız × butonu etkileşimli — native `<button>`, Enter/Space çalışır.
- Dokunmatik: × hedefi `pointer: coarse`'ta 36px'e büyür.
- Reduced-motion: tek transition (dismiss hover) kapanır.

## 8. İçerik

Title telegrafik ("Belge eksik"), gövde tek konu + sonraki adım. Danger'da
neden + çözüm birlikte ("Kart bilgilerinizi kontrol edin"). Aksiyon etiketi
fiil ("Süreyi Uzat").

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background | `color-mix(severity 12%, transparent)` ← `--lg-accent/success/warning/danger` |
| root | radius | `--lg-radius-media` |
| root | padding | `--lg-space-3` (mobil) / `--lg-space-4` (≥sm) |
| şerit | background | severity token'ı (genişlik `--stripe-width` yerel değişkeni) |
| title | font-size | `--lg-text-body` |
| message | font-size | `--lg-text-footnote` |
| dismiss | radius | `--lg-radius-capsule` |

**Borç (raw / mikro-geometri):** şerit genişliği, dismiss taban boyutu ve
optik hizalama payı token karşılığı olmadığından component kökünde yerel
değişken olarak toplandı (`.alert { --stripe-width: 3px; --dismiss-size: 28px;
--dismiss-nudge: -2px; }`); dokunmatikte dismiss `--lg-control-sm`'e bağlandı
(coarse'ta token 36px — büyüme tasarımın istediği davranıştır); geçiş
süresi/easing (`0.15s ease-out`) süre token'ı olmadığından raw.

## 10. Storybook kapsamı

Var: Default, Severities (4'lü matris), WithActionAndDismiss, CustomIcon,
MobileLayout (`viewport: mobile1`). **Eksik:** RTL.

## 11. Test kabul kriterleri

- [x] info/success → `role="status"`, warning/danger → `role="alert"`
- [x] title + gövde render
- [x] `onDismiss` → "Kapat" butonu görünür ve çağrılır; verilmezse yok
- [x] Özel `icon` default SVG'nin yerine geçer
- [x] severity sınıfı ve action alanı
- [ ] color-mix zemin kontrastı (visual, Chrome QA)

## 12. Do / Don't

- ✅ Sayfada aynı anda tek danger banner'ı hedefle; çoklu sorunları tek
  banner'da listele.
- ✅ Dinamik beliren alert'i içeriğin üstüne yerleştir — `role` sayesinde
  ekran okuyucu değişikliği duyurur.
- ❌ `role="alert"`'i pazarlama mesajı için kullanma (severity=info kullan).
- ❌ Cam yüzeye çevirme; banner içerik katmanıdır, flat kalır.

**Açık kararlar:** geçici Toast bileşeni ihtiyacı (portal + otomatik kapanma) ·
kapanışta yükseklik animasyonu (şimdilik çağıranın sorumluluğu).

## Changelog

- 2026-07-16: İlk sürüm — severity/rol eşlemesi, default inline SVG ikon seti,
  mobilde alt satıra saran action düzeni.
