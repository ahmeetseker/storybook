---
name: GlassAvatar
category: görüntüleme
status: hazır
lastReviewed: 2026-07-16
---

# GlassAvatar Kuralları

## 1. Amaç

Kullanıcı/satıcı kimlik görseli: fotoğraf varsa fotoğraf, yoksa (veya
yüklenemezse) isimden türetilen baş harfler + deterministik pastel zemin.
Salt görseldir, etkileşimsizdir.

- **Kullan:** satıcı kartı, mesaj listesi satırı, yorum başlığı, profil özeti.
- **Kullanma:** tıklanabilir profil aksiyonu (avatarı `<a>`/`<button>` içine
  çağıran sarar), ilan fotoğrafı (→ `GlassGallery`), logo/marka görseli.

| İlgili | Farkı |
|---|---|
| GlassSellerCard | Avatar'ı kompozisyon olarak kullanabilir; kart etkileşimlidir |
| GlassBadge | Metin rozeti; avatar kimlik görselidir |

## 2. Semantik sözleşme

- Element: `<span>` kök; içinde `<img>` (görsel modda) veya `role="img"` span
  (baş harf modunda, `aria-label` ile isimlendirilmiş).
- Accessible name: `alt` → yoksa `name`. İkisi de yoksa dekoratif sayılır ve
  fallback `aria-hidden` olur (rol verilmez).
- **Dekoratif değilse `alt` (veya `name`) zorunludur** — component `name`'den
  `alt` türetir, ama ikisi de boşsa AT hiçbir şey duymaz; bu çağıranın bilinçli
  kararı olmalıdır.
- Durum noktası `aria-hidden`; anlamı görsel olarak gizli metinle
  ("çevrim içi/çevrim dışı/meşgul") ekran okuyucuya verilir.
- DOM değişmezleri: radius kökte tanımlıdır ve içerik katmanı `inherit` eder;
  durum noktası kök `overflow`'una kırpılmaz.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| src görseli | — | `<img object-fit: cover>` | Kare olmayan görsel merkezden kırpılır |
| baş harfler | — (fallback) | ilk + son kelimenin baş harfi | `toLocaleUpperCase('tr')` — i → İ doğru büyür |
| status noktası | — | renkli daire | Sağ alt; boyutun ~%26'sı; `--lg-bg` halkasıyla ayrılır |

`children` yok — avatar içerik almaz.

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| src | prop | `string` | — | Görsel URL; onError'da baş harf fallback |
| alt | prop | `string` | `name` | Görsel alternatif metni; dekoratifse boş bırakılabilir |
| name | prop | `string` | — | Baş harf + pastel + alt türetme kaynağı |
| size | prop | `'xs'\|'sm'\|'md'\|'lg'\|'xl'` | `'md'` | 24/32/40/56/72px — sabit |
| shape | prop | `'circle'\|'rounded'` | `'circle'` | rounded = %25 orantılı köşe |
| tint | prop | `string` | name'den pastel | Baş harf zemini; görsel moduna etkisiz |
| status | prop | `'online'\|'offline'\|'busy'` | — | success / label-secondary / danger noktası |
| ...rest | — | `HTMLAttributes<HTMLSpanElement>` | — | Köke geçer |

Ref hedefi: yok (forwardRef edilmemiş). Event sözleşmesi: yok — etkileşimsiz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, `shape=circle`, durum yok.

| Yasak / türetilen | Davranış |
|---|---|
| `tint` yok + `name` var | Zemin `name`'den deterministik pastel (hash → hue, S/L sabit) |
| `tint` + `src` (yüklenen) | tint görünmez — yalnız baş harf zeminidir |
| `src` + `name` | name yalnız fallback ve alt kaynağıdır |
| cam malzeme | ❌ — avatar içerik katmanıdır, `GlassSurface` sarmaz |
| responsive boyut | ❌ — bkz. bölüm 7 |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| loaded | src başarılı | fallback | `<img>` görünür |
| failed | img `onError` | loaded | Baş harf + pastel zemin; `src` değişince sıfırlanır |
| status | prop | — | Nokta rengi: online `--lg-success`, offline `--lg-label-secondary`, busy `--lg-danger` |

hover/focus/active/disabled yok — etkileşimsiz.

## 7. Davranış

- **Boyutlar sabittir, responsive DEĞİLDİR:** avatar bir kimlik simgesidir;
  breakpoint ile büyüyüp küçülmesi hizaları bozar. Bağlam değişiyorsa çağıran
  farklı `size` render eder.
- Pointer/keyboard: N/A — focus almaz. `user-select: none`.
- `onError` sonrası `src` prop'u değişirse yükleme yeniden denenir.
- Animasyon yok — reduced-motion etkisi yok.

## 8. İçerik

Baş harfler ilk + son kelimeden üretilir ("Ayşe Nur Yılmaz" → "AY"); tek
kelimede tek harf. Türkçe büyütme `toLocaleUpperCase('tr')` ile yapılır —
"irem" → "İ" (ASCII `toUpperCase` "I" üretirdi, yanlış). Emoji/harf dışı
başlayan isimlerde ilk code unit gösterilir; çağıran anlamlı `name` verir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| kök/kenar | box-shadow (hairline) | `--lg-hairline` |
| baş harf zemini (nötr) | background | `color-mix(--lg-label 10%, transparent)` |
| status halkası | box-shadow | `--lg-bg` |
| status renkleri | background | `--lg-success` / `--lg-label-secondary` / `--lg-danger` |
| font (sm–xl) | font-size | `--lg-text-caption/body/title/display` |

Borç: boyut px'leri (24–72) ve `xs` font'u (10px) raw — boyut ölçeği token'ı
yok. Pastel üstü metin `rgba(0,0,0,.62)` raw (pastel L %74 sabit → kontrast
garanti); koyu `tint` verilirse kontrast çağıranın sorumluluğunda.

## 10. Storybook kapsamı

Var: Default (görsel), BasHarfler (TR büyütme + pastel), KirikGorsel
(onError fallback), Boyutlar, Sekiller, Durumlar, MobilSaticiSatiri
(responsive: avatar sabit, metin daralır — mobile1 viewport).
**Eksik:** koyu tema karşılaştırması, yükleme anı (skeleton ile kompozisyon).

## 11. Test kabul kriterleri

- [x] img `alt`'ı `name`'den türetilir
- [x] baş harfler `toLocaleUpperCase('tr')` ile büyür (İY)
- [x] onError → fallback'e düşer
- [x] pastel deterministiktir (aynı isim → aynı zemin)
- [x] `tint` zemine uygulanır
- [x] status ekran okuyucu metni verir
- [x] alt+name yoksa AT'den gizlenir
- [ ] `src` değişince failed sıfırlanır (unit)
- [ ] koyu tint'te baş harf kontrastı (visual)

## 12. Do / Don't

- ✅ Dekoratif olmayan her avatara `name` (veya `alt`) ver.
- ✅ Durum bilgisini yalnız gerçek zamanlı bağlamda kullan (mesajlaşma);
  ilan kartında gösterme.
- ❌ Avatar'ı buton yapma — tıklanacaksa çağıran `<button>`/`<a>` ile sarar.
- ❌ Boyutu CSS ile ezme; beş sabit boyuttan seç.
- ❌ `tint`'e koyu renk verme (metin koyu sabittir).

**Açık kararlar:** avatar grubu (üst üste binen dizi) ihtiyacı · `loading`
prop'u (skeleton entegrasyonu) değerlendirilecek.

## Changelog

- 2026-07-16: İlk sürüm — img/baş-harf fallback, TR locale büyütme,
  deterministik pastel, status noktası (sr-only metinli), 5 sabit boyut.
