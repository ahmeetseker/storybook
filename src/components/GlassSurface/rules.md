---
name: GlassSurface
category: primitive
status: hazır
lastReviewed: 2026-07-15
---

# GlassSurface Kuralları

## 1. Amaç

Tüm cam ailesinin temel primitivi: refraction (SVG displacement) veya blur
fallback ile cam malzemeyi, `flat` ile opak içerik yüzeyini render eder.
Diğer Glass component'ler bunun üstüne kurulur.

- **Kullan:** yeni bir Glass component yazarken taban olarak; tek seferlik cam
  panel gerektiğinde.
- **Kullanma:** hazır bir bileşen varken doğrudan (buton → `GlassButton`,
  rozet → `GlassBadge`); büyük tam-sayfa paneller için `material="glass"` yerine
  `flat` tercih edilir (bkz. refraction alan sınırı).

| İlgili | Farkı |
|---|---|
| GlassButton / GlassIconButton | Etkileşim + basınç animasyonu ekler |
| GlassBadge | `as="span"`, sabit ince kalınlık |

## 2. Semantik sözleşme

- Element: `as` prop'u ile polimorfik, default `<div>`. Semantik sorumluluk
  çağırana aittir (`as="nav"`, `as={motion.button}` vb.).
- Role/accessible name yok — primitive kendisi anlam taşımaz.
- DOM değişmezleri: (1) kökte `data-material` attribute'u, (2) SVG filter node
  yalnız glass+refraction yolunda ilk çocuk, (3) `clear`'da `data-glass-dimming`
  span'i, (4) içerik her zaman `.content` span'inde (z-index 1) sarılıdır.
- `filterId`: `useId` + modül sayacı — Storybook docs sayfası gibi çoklu React
  kökünde bile tekildir; dışarıdan güvenilmemeli.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | — | serbest | `.content` span'inde, filtre/rim'in üstünde |
| filter | otomatik | SVG displacement | Yalnız glass + refraction tier + alan sınırı içinde |
| dimming | otomatik | %35 karartma | Yalnız `material="glass"` + `variant="clear"` |
| rim (`::before`) | otomatik | hairline gradient | `--glass-light-angle`'a göre; `flat`'te kaldırılır |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| variant | prop | `'regular'\|'clear'` | `'regular'` | `clear` karartma katmanı ekler (yalnız cam) |
| material | prop | `'glass'\|'flat'` | `'glass'` | `flat`: filtresiz opak yüzey, compositor maliyeti yok |
| thickness | prop | `number` (0–1) | `0.5` | Gölge + lensing + blur'u **birlikte** ölçekler |
| shape | prop | `number\|'capsule'` | `16` | `capsule` = ölçülen yüksekliğin yarısı |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Zemin bağlamı ipucu (metin rengi) |
| interactive | prop | `boolean` | `false` | Yalnız `cursor: pointer` + `touch-action: manipulation` |
| displacementScale | prop | `MotionValue<number>` | — | Basınç animasyonu çarpanı (useGlassPress'ten) |
| as | prop | `ElementType` | `'div'` | Polimorfik render |
| ...rest | — | `HTMLAttributes` | — | Köke geçer |

Event sözleşmesi yok; etkileşim üst component'in işidir.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=regular`, `material=glass`, `thickness=0.5`, `shape=16`.

| Yasak / türetilen | Davranış |
|---|---|
| `material="flat"` + `variant="clear"` | Dimming render edilmez (flat kazanır) |
| `material="flat"` + `thickness` | Etkisiz — flat'te gölge/blur formülü çalışmaz |
| `shape="capsule"` ölçüm öncesi | radius 999 (ilk ölçümde gerçek değere oturur) |

**Tier sistemi:** `GlassTierProvider` / `useGlassTier` — `'refraction'`
(yalnız Chromium; engine tespiti, `CSS.supports` güvenilmez) veya `'fallback'`
(WebKit/Firefox/iOS/SSR). Refraction yolu ayrıca şunları gerektirir: element
ölçülmüş, `prefers-reduced-transparency` kapalı ve **alan ≤ 160.000 px²**
(`REFRACTION_MAX_AREA`, ~400×400 — Apple kuralı: lensing kontroller içindir;
büyük paneller blur'da kalır, ayrıca büyük SVG filtresi Chrome'da kare düşürür).
Koşullardan biri sağlanmazsa fallback: `blur(2 + thickness×10 px) saturate(180%)`.

## 6. State modeli

N/A — primitive'in kendi etkileşim state'i yok; hover/active/focus üst
component'te tanımlanır. Ortam durumları:

| Durum | Kaynak | Etki |
|---|---|---|
| tier fallback | context/tespit | SVG filtre yerine blur |
| reduced-transparency | media query | Refraction kapalı, frosted blur |
| ölçüm bekleniyor | ResizeObserver (150ms debounce) | Filtre henüz yok, blur ile başlar |

## 7. Davranış

- Keyboard/pointer: N/A — kendisi etkileşimsiz.
- Resize: `useElementSize` 150ms debounce ile displacement map'i yeniden üretir.
- SSR: `navigator` yoksa tier `'fallback'`.
- `prefers-reduced-motion`: N/A — animasyonu yok (displacementScale dışarıdan).

## 8. İçerik

Serbest; taşma `overflow: hidden` ile kırpılır (radius'a uyum için zorunlu).
Kaydırılabilir içerik gerekiyorsa iç sarmalayıcıda çözülür. Lokalizasyon: N/A —
metin içermez.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| flat | background | `--lg-surface` |
| flat | border | `--lg-hairline` |
| flat | color | `--lg-label` |
| rim | angle | `--glass-light-angle` (default 120deg) |
| flat | box-shadow | `--lg-shadow-xs` (token üzerinden gelir) |

**Borç (raw / bilinçli malzeme sabitleri):** cam zemini `rgba(255,255,255,.06)`,
cam box-shadow katmanları (`0 6px 24px …` + inset beyazlar), rim gradyan
beyazları, `toneLight/toneDark` metin renkleri, dimming `rgba(0,0,0,.35)`
(Apple clear varyant kuralı) — bunlar temadan bağımsız cam malzeme
REÇETESİdir, token'a bağlanmaz (tema token'ları içerik katmanına aittir).
Gölge/blur/saturation formülleri (`0 (4+12t)px (16+24t)px …`) bilinçli olarak
koda gömülü. `.flat.toneLight` zemini `#1b1c20` — `tone` ekseni gereği koyu
kart zorunluluğu; `--lg-surface`'a bağlanamaz (o token açık yüzey rengini
taşır), bilinçli sabit değer olarak korunur.

## 10. Storybook kapsamı

Var: Regular, Clear, Thick, Materials (glass vs flat yan yana), UzunIcerik,
BuyukYuzey (alan sınırı geçişini gösteren büyük yüzey). **Eksik:** Playground,
Erişilebilirlik. States: N/A — etkileşimsiz.

## 11. Test kabul kriterleri

- [x] children render eder (unit)
- [x] fallback tier'da SVG filtre yok, blur stili var
- [x] clear varyantı `data-glass-dimming` ekler
- [x] `as` ile polimorfik render (button)
- [ ] alan sınırı aşımında refraction'dan blur'a düşüş
- [ ] `material="flat"`'te filtre ve dimming render edilmez
- [ ] reduced-transparency'de frosted fallback (visual)

## 12. Do / Don't

- ✅ Yeni Glass component'i bunun üstüne kur; tier/ölçüm mantığını kopyalama.
- ✅ Büyük panelleri `flat` veya düşük `thickness` blur'da bırak.
- ❌ `interactive` prop'unu buton yerine kullanma — focus/keyboard gelmez.
- ❌ `shape`'e radius ölçeği dışı keyfî değer verme (bkz. Token'lar).

**Bilinen kısıtlar:** refraction yalnız Chromium; capsule radius ilk ölçüme
kadar 999. **Açık kararlar:** raw cam renklerinin token'laşması ·
`REFRACTION_MAX_AREA`'nın cihaz gücüne göre dinamikleşmesi.
