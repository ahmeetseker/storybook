---
name: GlassToast
category: overlay
status: hazır
lastReviewed: 2026-07-16
---

# GlassToast Kuralları

## 1. Amaç

Geçici, kendiliğinden düşen bildirim yığını: işlem sonucu (kaydedildi, silindi,
hata) kullanıcıyı akışından koparmadan viewport köşesinde raporlanır.

- **Kullan:** async işlem sonuçları, geri alınabilir aksiyonlar ("Geri Al"),
  arka plan olayları (yeni mesaj geldi).
- **Kullanma:** onay gerektiren karar (→ Modal), form alanı hatası (alanın
  yanında göster), kalıcı sistem durumu (→ banner/badge).

| İlgili | Farkı |
|---|---|
| GlassPopover | Tetikleyiciye bağlı, kullanıcı açar |
| GlassBadge | Kalıcı, statik durum etiketi |

## 2. Semantik sözleşme

- Yığın: `createPortal(document.body)` + `role="region" aria-label="Bildirimler"`.
- Her toast: `role="status"` (nazik canlı bölge); `severity: 'danger'` →
  `role="alert"` (agresif duyuru).
- Her toast'ta `aria-label="Kapat"` butonu zorunlu olarak render edilir.
- İmperatif API: `useGlassToast()` fonksiyon döner; `toast(options)` → `id`,
  `toast.dismiss(id)` (fonksiyon + metod deseni). Provider dışında çağrı throw eder.
- API referansı render'lar arası stabildir (effect dep olarak güvenli).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| stripe | ✅ (oto) | severity rengi | 4px sol şerit; dekoratif (`aria-hidden`) |
| title | ✅ | string | Tek satır önerilir, 600 ağırlık |
| description | — | string | footnote, ikincil renk |
| action | — | `{ label, onClick }` | Tek aksiyon; tıklanınca toast kapanır |
| close | ✅ (oto) | ✕ butonu | `aria-label="Kapat"` |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| position | prop (Provider) | `'bottom-right'\|'bottom-center'\|'top-right'` | `'bottom-right'` | Yalnız ≥640px'te geçerli |
| tone | prop (Provider) | `'light'\|'dark'\|'auto'` | `'auto'` | Tüm toast'ların GlassSurface'ine |
| title | option | `string` | — | Zorunlu |
| description | option | `string` | — | İkincil satır |
| severity | option | `'info'\|'success'\|'warning'\|'danger'` | `'info'` | Şerit rengi + rol seçimi |
| duration | option | `number \| null` | `4000` | ms; `null` = kalıcı |
| action | option | `{ label: string; onClick(): void }` | — | Tıklama sonrası toast kapanır |
| dismiss | metod | `(id: number) => void` | — | Programatik kapatma |

## 5. Seçenek eksenleri

- `duration: null` + `action` = "Geri Al" deseni (önerilen ikili).
- `severity` yalnız görsel değil, rol semantiğini de değiştirir (danger → alert).
- Yığın sırası: yenisi sona eklenir (bottom konumlarda en altta biter,
  top-right'ta aşağı doğru büyür).

## 6. State modeli

| State | Kaynak | Görsel |
|---|---|---|
| giriş | AnimatePresence | translateY(±12) + fade (yön position'a göre) |
| bekleme | setTimeout | — |
| hover | mouse | Sayaç iptal; ayrılınca **tam süreyle** yeniden kurulur (kalan süre takibi yok — bilinçli basitlik) |
| çıkış | süre/kapat/dismiss | Yalnız fade; kalanlar `layout` ile kayar |
| reduced-motion | media query | Yalnız opacity; layout kayması kapalı |

## 7. Davranış

- Süre dolunca otomatik düşer; `dismiss(id)` ve Kapat butonu anında düşürür.
- Hover sayacı duraklatır (mouseEnter clearTimeout / mouseLeave yeniden kur).
- Responsive (mobile-first): <640px'te yığın altta tam genişlik (left/right 16px),
  `position` prop'u CSS'te yok sayılır; `/* bp-sm */ ≥640px`'te 380px sabit
  genişlik + seçilen köşe. Kapat butonu coarse pointer'da 44px hedefe büyür.
- Yığın kabı `pointer-events: none` — boş alan alttaki sayfayı engellemez.

## 8. İçerik

Başlık kısa eylem sonucu ("İlan yayında"), açıklama tek cümle bağlam. Danger
metni çözüm önerir ("tekrar deneyin"). Aynı anda 3+ toast üretme — arka arkaya
olaylarda birleştir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| toast | radius | 14 ← `--lg-radius-media` |
| toast | padding | `--lg-space-3/4` |
| stack | gap / offset | `--lg-space-2` / `--lg-space-6` |
| stripe | background | `--lg-accent/success/warning/danger` |
| description | color / size | `--lg-label-secondary` / `--lg-text-footnote` |
| action | color | `--lg-accent` |
| focus | outline | `--lg-accent` |
| stack | mobil offset (left/right/bottom) | `--lg-space-4` |
| close (coarse) | width/height | `--lg-control-md` (44px dokunmatik hedef) |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler `.stack`
kökünde yerel değişkenlerde toplandı: `--stack-width` (380px ≥bp-sm yığın
genişliği), `--stripe-width/radius` (4px/2px severity şeridi — ince şerit,
space token'ı kullanılmadı), `--texts-gap` (2px başlık/açıklama arası),
`--close-size` (28px). Coarse'ta kapat butonu `--lg-control-md`'ye (=44px)
büyür; negatif margin `calc((--close-size − --lg-control-md)/2)` = −8px ile
yerleşim ayak izi 28px'te korunur. Bilinçli bırakılan: `z-index: 60`
(z token'ı yok), `.texts` içi `padding-top: 1px` optik hizalama, süre/easing
(`0.16s ease-out`) — token yok.

## 10. Storybook kapsamı

Var: Default (severity dörtlüsü), PersistentWithAction, TopRight,
Mobile (viewport: mobile1). **Eksik:** yoğun yığın stres story'si, RTL.

## 11. Test kabul kriterleri

- [x] region + role status/alert sözleşmesi
- [x] 4000ms sonra otomatik düşme (fake timers)
- [x] hover duraklatma / leave'de yeniden kurulum
- [x] `duration: null` kalıcı; Kapat + `dismiss(id)` çalışır
- [x] action onClick + otomatik kapanma
- [x] api referans stabilitesi; provider dışında throw
- [ ] layout kayma animasyonu (visual)

## 12. Do / Don't

- ✅ Yıkıcı aksiyonlardan sonra `duration: null` + "Geri Al" ver.
- ✅ Provider'ı uygulama köküne bir kez koy; iç içe provider kurma.
- ❌ Toast içine link/form koyma — tek `action` ile sınırlı kal.
- ❌ danger toast'ı doğrulama hatası için kullanma (alanın yanında göster).

**Açık kararlar:** Hover'da kalan süre korunmaz, sayaç tam süreyle yeniden kurulur
(brief'in "basit tut" kararı). Maksimum yığın sınırı yok — çağıran tarafın
sorumluluğu; ihtiyaç doğarsa `limit` prop'u eklenecek. Progress göstergesi yok.

## Changelog

- 2026-07-16: İlk sürüm — imperatif fonksiyon+metod API'si, severity şeridi,
  hover duraklatma, mobile-first tam genişlik yığın.
