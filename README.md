# liquid-glass-ui

Apple'ın Liquid Glass tasarım dilinin web'e taşınması. React + Vite + TypeScript ile yazılmış bir component kütüphanesi; Storybook v10 üzerinde canlı bir vitrini var.

## Kurulum ve çalıştırma

```bash
npm install
npm run storybook   # http://localhost:6006 — component vitrini
npm test            # vitest ile birim testleri çalıştırır
```

Proje yalnızca Storybook üzerinden çalışır; ayrı bir uygulama kabuğu yoktur (`npm run dev` de Storybook'u açar).

## Tarayıcı tier tablosu

Gerçek kırılma efekti yalnızca `backdrop-filter: url(#svg)` + displacement map zincirini destekleyen motorlarda çalışır; diğerlerinde blur/saturate tabanlı bir fallback devreye girer.

| Motor | Tier | Görünüm |
| --- | --- | --- |
| Chromium (Chrome, Edge, Opera, ...) | `refraction` | Gerçek kırılma — SVG `feDisplacementMap` zinciriyle üretilen displacement map |
| Safari (WebKit) | `fallback` | blur + saturate + specular highlight taklidi |
| Firefox | `fallback` | blur + saturate + specular highlight taklidi |

> Not: WebKit, `backdrop-filter: url(#filter)` ifadesini desteklemiyor (bkz. [WebKit bug 245510](https://bugs.webkit.org/show_bug.cgi?id=245510)); Firefox da bu söz dizimini render etmiyor. Bu yüzden tier tespiti `CSS.supports` yerine motor tespitiyle (`detectTier`) yapılıyor.

## Component'ler

- **GlassSurface** (+ `GlassTierProvider` / `useGlassTier`) — kütüphanenin temel yüzey primitive'i. `regular`/`clear` varyantları, ayarlanabilir `thickness`, `capsule` şekli.
- **GlassButton** — `sm`/`md`/`lg`/`xl` boyutları, `tint` rengi, `prominent` modu; basılınca sıvılaşan (liquefy) displacement animasyonu.
- **GlassNavbar** (+ `GlassBackButton`) — geri tuşu, action pill grubu (birden fazla aksiyonu tek bir cam yüzeyde toplar), scroll ile beliren yumuşak kenar (soft scroll edge).

## Mimari, kısaca

1. Bir squircle bezel profili tanımlanır ve Snell kırılma yasasına dayalı ray-tracing ile her piksel için kırılma vektörü hesaplanır.
2. Bu vektörler bir RGBA displacement map'e (kırmızı/yeşil kanallar = x/y ofseti) bake edilir.
3. Map, bir SVG `feDisplacementMap` filtre zincirine (+ blur/specular katmanları) beslenir ve `backdrop-filter: url(#filter)` ile DOM'a uygulanır.
4. Etkileşim animasyonları (basma, bırakma) `motion` kütüphanesinin spring'leri ile `displacementScale`/`transformScale` gibi filtre ve `scale` attribute'ları üzerinden sürülür.

Chromium dışı motorlarda bu zincir çalışmadığından, blur + saturate + statik specular katmanından oluşan bir fallback her zaman altta hazır tutulur.

## Kaynaklar

- Tasarım spesifikasyonu: [`docs/superpowers/specs/2026-07-11-liquid-glass-ui-design.md`](docs/superpowers/specs/2026-07-11-liquid-glass-ui-design.md)
- Uygulama planı: [`docs/superpowers/plans/2026-07-11-liquid-glass-ui.md`](docs/superpowers/plans/2026-07-11-liquid-glass-ui.md)
