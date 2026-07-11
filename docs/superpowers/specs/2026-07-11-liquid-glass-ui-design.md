# liquid-glass-ui — Apple Liquid Glass React Component Library Tasarımı

**Tarih:** 2026-07-11
**Durum:** Onaylandı (kullanıcı, sohbet içinde)

## Amaç

Apple'ın Liquid Glass (iOS 26 / macOS Tahoe) tasarım dilini web'e taşıyan, React + Vite + TypeScript
ile yazılmış, Storybook v10 üzerinde geliştirilen ve sergilenen bir component kütüphanesi.
İlk tur kapsamı: çekirdek cam motoru, `GlassSurface` primitive'i, `GlassButton` (basınca
sıvılaşma animasyonlu) ve `GlassNavbar` (geri tuşu, başlık, action grubu).

## Alınan kararlar

| Karar | Seçim |
|---|---|
| Tarayıcı stratejisi | 3 katmanlı progressive enhancement (Chromium: gerçek kırılma; Safari/Firefox: blur+saturate+specular fallback) |
| Animasyon | `motion` kütüphanesi (spring fiziği, whileTap, layoutId morph) |
| İlk kapsam | Button + Navbar (altyapıyla birlikte), sonra Dropdown/Sidebar/Switch/Slider |
| Cam çekirdeği | Kendi motorumuz — kube.io matematiği (squircle bezel + Snell ray-tracing) TypeScript ile |

## Teknik arka plan (araştırma özeti)

- **Kırılma tekniği (kube.io):** Bezel kesit profili üzerinden Snell yasasıyla (n=1 → n=1.5,
  tek kırılma olayı, dik gelen ışınlar) radius başına 127 ışın örneklenir. Çıkan yer değiştirme
  vektörleri normalize edilip RGBA görüntüye kodlanır: R = X kayması, G = Y kayması,
  128 = nötr. `maximumDisplacement` (px) filtrenin `scale` attribute'u olarak geri kullanılır.
- **Filter zinciri:** `feGaussianBlur(0–1)` → `feImage`(displacement map) + `feDisplacementMap`
  → `feColorMatrix saturate(4–9)` → specular map `feComposite operator="in"` +
  `feComponentTransfer`(alpha 0.2–0.5) → iki `feBlend` katmanı.
- **Bezel profilleri:** Convex Circle `y=√(1−(1−x)²)`, **Convex Squircle** `y=⁴√(1−(1−x)⁴)`
  (varsayılan — Apple'ın tercihi, gerilince de yumuşak), Concave (kaçınılır: ışınları eleman
  dışına taşırır), Lip (Switch için; convex+concave karışımı).
- **Tarayıcı gerçeği:** `backdrop-filter: url(#f)` yalnız Chromium. Safari (WebKit bug 245510)
  ve Firefox'ta çalışmıyor. `CSS.supports` güvenilmez → engine tespiti.
- **Apple davranış kuralları:** iki varyant (`regular` adaptif / `clear` medya üstü + %35 karartma,
  asla karışmaz), cam üstüne cam yasak, content katmanında cam yasak, büyüyen cam "kalınlaşır"
  (gölge + lensing artar), yakın elemanlar metaball gibi birleşir, buton→menü morph, basınca
  içten ışıma + jöle esnemesi, scroll edge effect (soft/hard), Reduced Motion → elastiklik kapalı,
  Reduced Transparency → daha buzlu.
- **Sıvılaşma animasyonu:** displacement map'i yeniden üretmek pahalı; `feDisplacementMap.scale`
  attribute'unu anime etmek ucuz. Basınç = scale 1×→~1.7× spring + `transform: scale(0.96)` +
  parmak noktasından radyal iç ışıma; bırakınca düşük damping'li jöle salınımı.
- **Storybook v10:** `npm create storybook@latest`, her şey `@storybook/react-vite`'tan import
  edilir, essentials core'da. `parameters.backgrounds` yalnız düz renk → arka plan görseli için
  global decorator + custom toolbar global'i.

## Mimari

```
src/
  core/                    # framework-bağımsız saf TS cam motoru
    surfaces.ts            # bezel profil fonksiyonları + Snell ray-tracing (1D radyal displacement)
    displacementMap.ts     # canvas'ta RGBA PNG data-URL üretimi + (w,h,radius,bezel) cache
    specularMap.ts         # kenar parlama haritası üretimi (ışık açısına göre rim light)
    filterChain.tsx        # SVG <filter> zinciri React componenti
    tier.ts                # 'refraction' | 'fallback' tespiti + reduced-motion/transparency
  components/
    GlassSurface/          # temel primitive: tüm cam yüzeylerin çekirdeği
    GlassButton/
    GlassNavbar/           # GlassBackButton, başlık, action pill grubu dahil
  motion/
    presets.ts             # adlandırılmış animasyon kütüphanesi (RealityKit deseni)
```

### core/ birimleri

- **surfaces.ts** — Girdi: profil tipi + x∈[0,1]. Çıktı: yükseklik; sayısal türevle normal;
  Snell ile kırılma vektörü. Saf fonksiyonlar, unit testli.
- **displacementMap.ts** — Girdi: `{width, height, cornerRadius, bezelWidth, glassThickness,
  profile}`. 1D radyal hesap → rounded-rect'e süpürme (köşeler dairesel, kenarlar gerilmiş) →
  canvas → PNG data-URL + `maximumDisplacement`. Module-level `Map` cache; anahtar =
  parametrelerin serileştirilmesi.
- **filterChain.tsx** — `<GlassFilter id=... maps=... scale=... blur=... saturation=...>`;
  `scale` bir `MotionValue` ile anime edilebilir (attribute güncelleme, map rebuild yok).
- **tier.ts** — Chromium tespiti (UA/engine); `refraction` | `fallback`. Ayrıca
  `prefers-reduced-motion` ve `prefers-reduced-transparency` okumaları. Context ile dağıtılır,
  Storybook toolbar'ından zorlanabilir (`forceTier`).

### GlassSurface (temel primitive)

Props:
- `variant: 'regular' | 'clear'` — clear, %35 opaklıkta karartma katmanı ekler (parlak medya kuralı).
- `thickness: number` (0–1) — arttıkça gölge derinleşir, `scale` (lensing) ve blur artar.
- `interactive?: boolean` — basınç davranışlarını (sıvılaşma, iç ışıma) açar.
- `shape: number | 'capsule' | { concentric: { parentRadius, padding } }` — Apple'ın
  fixed/capsule/concentric üçlüsü; concentric = `parentRadius − padding`.
- `tone: 'light' | 'dark' | 'auto'` — auto yalnız `prefers-color-scheme` (gerçek arka plan
  luminance örneklemesi v2'ye ertelendi — bilinçli kapsam kararı).

Render: refraction tier'da `backdrop-filter: url(#id)` + inline `<svg><filter>`;
fallback tier'da `backdrop-filter: blur() saturate()` + specular box-shadow yığını
(`inset 0 1px 0 rgba(255,255,255,.6)` vb.). Her iki tier'da ortak: hairline gradient border
(mask-composite rim), dış gölge, `ResizeObserver` ile boyut değişiminde map yeniden üretimi
(150 ms debounce).

### GlassButton

- `GlassSurface interactive` üzerine kurulur; `size: 'sm'|'md'|'lg'|'xl'` (xl = Apple'ın yeni
  extra-large'ı), `tint?: string` (adaptif ton — flat overlay değil), `prominent?: boolean`.
- Basınç akışı: pointer down → `pressLiquefy` preset (displacement scale spring 1→1.7,
  transform scale 0.96, pointer koordinatından radyal ışıma overlay'i) → pointer up →
  `releaseJelly` (stiffness ~300, damping ~15 salınım).

### GlassNavbar

- Yatay bar: `GlassBackButton` (chevron + isteğe bağlı etiket), başlık, sağda action'lar.
- Apple kuralı: action'lar **paylaşımlı cam pill gruplarına** toplanır; primary action ayrı ve
  tintli; text ile ikon aynı grupta karışmaz.
- Basit scroll edge effect: bar'ın altına `mask-image` gradyanlı progressive blur şeridi
  (`backdrop-filter: blur` + dikey mask) — soft stil; hard stil v2.
- Story'de `layout: 'fullscreen'` + scroll edilebilir içerik decorator'ı.

### motion/presets.ts

RealityKit `AnimationLibraryComponent` deseninden uyarlanmış kayıt:
```ts
const presets = {
  pressLiquefy:  { displacementScale: 1.7, scale: 0.96, spring: { stiffness: 400, damping: 25 } },
  releaseJelly:  { spring: { stiffness: 300, damping: 15 } },
  appearMaterialize: { /* opacity yerine displacement scale 0→1 modülasyonu */ },
}
```
- Kesinti davranışı: yeni preset devreye girince spring retarget (motion bunu doğal yapar).
- `prefers-reduced-motion` → elastik presetler no-op'a düşer (Apple kuralı).

## Storybook kurulumu

- `npm create vite@latest . -- --template react-ts` → `npm create storybook@latest`
  (docs + a11y; Vitest addon'u motor testleri zaten Vitest olduğu için uyumlu).
- `.storybook/preview.tsx`: global decorator — seçilebilir arka planlar (renkli foto, koyu foto,
  canlı gradient animasyonu) custom toolbar global'i ile; `staticDirs: ['../public']`.
- İkinci custom toolbar: `forceTier` (auto / refraction / fallback) — fallback'in Chrome'da
  test edilebilmesi için.
- CSF3 + autodocs; tüm importlar `@storybook/react-vite`'tan.

## Hata yönetimi

- Canvas/map üretimi başarısız olursa (SSR, eski tarayıcı) sessizce fallback tier'a düş.
- `feImage` boyutları elemana otomatik uymaz → boyut yoksa (ölçüm öncesi ilk render) filtre
  uygulanmaz, ölçüm gelince takılır; flash önlemek için fallback stiller her zaman altta durur.

## Test stratejisi

- **Vitest unit:** bezel fonksiyonları (uç değerler: x=0, x=1, monotonluk), vektör → RGBA
  kodlama sınırları (0–255, 128 nötr), cache anahtarları, tier tespiti (UA mock).
- **Storybook:** her state kalıcı story (default, pressed, clear variant, fallback tier,
  reduced-motion); a11y addon açık.
- Görsel doğrulama manuel (Chrome + Safari karşılaştırması kullanıcıyla birlikte).

## Kapsam dışı (v2+)

- Dropdown (layoutId morph), Sidebar, Switch (lip bezel), Slider.
- Metaball birleşme (`GlassEffectContainer` karşılığı), chromatic aberration (3 kanal ayrı
  displacement), gerçek arka plan luminance örneklemesi, hard scroll edge stili,
  View Transitions entegrasyonu, npm paketi olarak yayınlama.
