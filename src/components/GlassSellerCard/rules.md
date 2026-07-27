---
name: GlassSellerCard
category: içerik
status: hazır
lastReviewed: 2026-07-15
---

# GlassSellerCard Kuralları

## 1. Amaç

Satıcı kimlik kartı: avatar/baş harfler + isim + doğrulanmış rozeti + maskeli
telefon (isteğe bağlı reveal) + birincil "Mesaj Gönder" aksiyonu. İçerik
katmanı component'idir; içerik sayfalarında `material="flat"` önerilir.

- **Kullan:** ilan detayında satıcı bilgisi + iletişim aksiyonları.
- **Kullanma:** kullanıcı profil sayfası başlığı, yorum/mesaj listesindeki
  küçük avatar satırları.

| İlgili | Farkı |
|---|---|
| GlassPriceHeader | Sayfa başlığı; kişi/iletişim semantiği yok |
| GlassButton | Kartın içindeki aksiyonlar bu component'ten kompoze edilir |

## 2. Semantik sözleşme

- Element: `<section>` (`GlassSurface as="section"`, `shape={20}`, `thickness={0.45}`).
- Avatar `<img alt="">` (dekoratif); yoksa baş harfler `aria-hidden` span —
  isim zaten metin olarak vardır, tekrar okunmaz.
- Verified rozeti: `role="img"` + `aria-label="Doğrulanmış hesap"` + `title`.
- Maskeli telefon `aria-hidden` — ekran okuyucu maskeli rakam duymaz, yalnız
  "Telefonu Göster" butonunu alır; reveal sonrası `<a href="tel:...">` linki.
- `tel:` href'i rakam-dışı karakterlerden arındırılır (`replace(/[^+\d]/g,'')`).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| avatar | otomatik | `avatarUrl` img veya baş harfler | Fallback: ilk 2 kelimenin ilk harfi, `toLocaleUpperCase('tr')` |
| name (+verified) | ✅ | string + opsiyonel rozet | Rozet ismin inline devamında |
| memberSince | — | string | Ör. "Üyelik: Ocak 2019"; biçim çağıranda |
| phoneRow | — | maskeli metin + "Telefonu Göster" | Yalnız `phone` verilince; reveal sonrası `tel:` linkine dönüşür |
| message | — | prominent GlassButton | Yalnız `onMessage` verilince |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| name | prop | `string` | — (zorunlu) | — | Baş harf fallback'i de buradan türer |
| memberSince | prop | `string` | — | — | Serbest metin |
| avatarUrl | prop | `string` | — | — | Verilmezse baş harf fallback |
| phone | prop | `string` | — | — | Biçimli numara; ilk 5 karakter maskesiz kalır |
| verified | prop | `boolean` | `false` | — | Rozet `--lg-accent` renginde |
| onPhoneReveal | prop | `() => void` | — | — | Reveal tıklamasında, state açıldıktan sonra çağrılır |
| onMessage | prop | `() => void` | — | — | Verilmezse "Mesaj Gönder" hiç render edilmez |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | — | Surface + iç butonlara geçer |
| material | prop | `'glass'\|'flat'` | — (GlassSurface default'u `glass`) | — | İçerikte `flat` önerilir |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | — | `className` birleştirilir |

Event: `onPhoneReveal` yalnız buton tıklamasında, bir kez ateşlenebilir
(buton reveal sonrası DOM'dan kalkar). `onMessage` her tıklamada çalışır.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `verified=false`, `tone=auto`, telefon maskeli.

| Kural | Davranış |
|---|---|
| `phone` yok | phoneRow tamamen render edilmez |
| `onMessage` yok | Mesaj butonu render edilmez (Minimal kullanım) |
| `avatarUrl` + fallback | img kazanır; ikisi aynı anda çıkmaz |
| Kart başına tek `prominent` | Mesaj Gönder tek birincil aksiyondur |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA / DOM |
|---|---|---|---|
| revealed | internal `useState(false)` | maskeli satır + reveal butonu | `tel:` linki render edilir |

Uncontrolled ve tek yönlüdür: dışarıdan açılamaz/kapatılamaz, geri alınamaz
(remount gerekir). hover/active/focus kartın kendisinde yok; iç butonlar
GlassButton sözleşmesine tabidir.

## 7. Davranış

- Focus akışı DOM sırası: "Telefonu Göster" → "Mesaj Gönder". Reveal sonrası
  buton kaybolur, odak body'ye düşer — odağın `tel:` linkine taşınması yok
  (bkz. Açık kararlar).
- Reveal masrafsız/sync'tir; sunucudan numara çekme yoktur — `phone` baştan
  DOM prop'undadır, maske yalnız görseldir (gizlilik garantisi değildir).
- `tel:` linki native davranır; hover'da underline.

## 8. İçerik kuralları

- Buton/rozet metinleri hardcoded Türkçe: "Telefonu Göster", "Mesaj Gönder",
  "Doğrulanmış hesap" — i18n borcu.
- Uzun isim: `who` `min-width: 0` ile daralır ama isimde truncation yok;
  çok uzun kurumsal isimler sarar.
- Baş harf fallback'i en fazla 2 karakter; tek kelimelik isimde 1 harf.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| verified | color | `--lg-accent` (fallback `#0a84ff`) |
| root (flat) | background / border | `--lg-surface` / `--lg-hairline` (GlassSurface) |
| avatarFallback (flat) | background | `[data-material='flat']` ile `rgba(0,0,0,.07)` — raw |
| root | radius | `shape={20}` — `--lg-radius-card` değeriyle aynı, sayısal |

**Borç (raw / mikro-geometri):** birebir karşılığı olanlar token'a bağlandı —
padding 20px → `--lg-space-5`, identity gap 12px → `--lg-space-3`, baş harf
17px → `--lg-text-headline`. Token karşılığı olmayanlar component kökünde
yerel değişkene toplandı: gap'ler (`--card-gap: 14px; --who-gap: 2px;
--name-gap: 6px; --phone-row-gap: 10px`), avatar (`--avatar-size: 48px` —
kontrol değil, `--lg-control-lg` bilinçli kullanılmadı), rozet ikonu
(`--verified-icon: 17px`), ölçek dışı tipografi (`--name-text: 16px;
--member-text: 12.5px; --masked-text: 16px; --phone-text: 20px`). Bilinçli
bırakılanlar: cam avatar zemini `rgba(255,255,255,.22)` (beyaz-alfa malzeme
etkisi, color-mix'e çevrilmez) ve flat avatar zemini `rgba(0,0,0,.07)` —
birebir renk token'ı yok; flat zemin koyu flat kartta (`flat + tone="light"`)
görünmez kalabilir, yalnız açık flat'e göre ayarlı.

## 10. Storybook kapsamı

Var: Default, WithoutPhone, Minimal, WithAvatar (`avatarUrl` ile img,
fallback'siz), Materials (glass vs flat yan yana), States (maskeli · play ile
açılmış · verified'sız), UzunIcerik (uzun kurumsal isim). **Eksik:**
Playground, Responsive, Temalar, Erişilebilirlik.

## 11. Test kabul kriterleri

- [x] maskeli görünümde tam numara DOM metninde yok (unit)
- [x] reveal → `onPhoneReveal` 1 kez + `tel:05321234567` href (interaction)
- [x] `onMessage` tıklamada çağrılır (interaction)
- [x] verified rozeti `role="img"` ile erişilebilir (a11y)
- [x] avatar yoksa baş harfler ("MY") (unit)
- [ ] `avatarUrl` verilince img render, fallback yok
- [ ] reveal sonrası odak yönetimi (interaction)
- [ ] flat malzemede avatar/ayraç kontrastı (visual)

## 12. Do / Don't

- ✅ İçerik sayfasında `material="flat"`; iç GlassButton'lar cam kalır.
- ✅ `onPhoneReveal`'i analytics/loglama için kullan; numarayı orada üretme.
- ❌ `phone`'a gerçek gizlilik yükleme — numara DOM'dadır; sunucu tarafı
  maskeleme gerekiyorsa reveal'da fetch eden ayrı bir akış kur.
- ❌ Karta ikinci bir prominent aksiyon ekleme.

**Bilinen kısıtlar:** revealed geri alınamaz/kontrol edilemez · metinler
i18n'siz · `material` efektif default'u `glass`. **Açık kararlar:**
`revealed`/`onRevealChange` controlled çifti · reveal'da async numara çekme
desteği · reveal sonrası odağın linke taşınması. **Changelog:** 2026-07-15
ilk sözleşme.
