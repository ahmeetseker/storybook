# liquid-glass-ui

Apple'ın Liquid Glass tasarım dilinin web'e taşınması. Repository, React + Vite + TypeScript ile yazılmış ortak component kütüphanesini, Storybook v10 vitrini ve TanStack Start tabanlı SSR web uygulamasıyla birlikte barındırır.

## Kurulum ve çalıştırma

```bash
npm install
npm run dev         # web :3000 + Storybook :6006
npm run dev:web     # yalnızca TanStack Start web uygulaması
npm run storybook   # yalnızca component vitrini
npm test            # Vitest birim/component testleri
npm run test:e2e    # Playwright responsive, a11y ve SSR testleri
npm run build       # typecheck + web production build + Storybook build
```

Web uygulaması, Storybook'taki gerçek `GlassIslandHeader` ve `GlassDock` kaynaklarını `@repo/ui` alias'ı üzerinden doğrudan kullanır. Bu nedenle component kaynağındaki bir değişiklik hem Storybook'a hem web uygulamasına HMR ile yansır; ikinci bir component kopyası yoktur.

İlk teslimatta `/`, `/arsa-ara`, `/ofisler`, `/bolgeler`, `/blog`, `/ai-danisman`, `/karsilastir`, `/favoriler`, `/ilan-ver`, `/hesabim` ve `/hesabim/mesajlar` rota kabukları hazırdır. Tamamlanmamış sayfalar bilinçli olarak `noindex`; public içerikler tamamlandıkça rota bazında indekslemeye açılacaktır.

## Üretim

```bash
npm run build:web
npm run start:web
```

Uygulama Node/Nitro SSR çıktısı üretir ve `/health` endpoint'i sunar. Container görüntüsü repository kökünden oluşturulur:

```bash
docker build -f apps/web/Dockerfile -t arsam-web .
docker run --rm -p 3000:3000 arsam-web
```

Canonical origin varsayılan olarak `https://arsam.net` değeridir. Yerel build'de `VITE_APP_ORIGIN`, Docker build'inde ise `--build-arg APP_ORIGIN=https://ornek.test` ile değiştirilebilir.

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
- **GlassIslandHeader** — marka, canlı breadcrumb/durum hapı, bildirim aksiyonu ve erişilebilir modal hızlı-gezinme paneli.
- **GlassDock** — masaüstü, tablet ve mobil için farklılaştırılmış; gerçek linklerle SSR'da da çalışan alt navigasyon.

## Mimari, kısaca

1. Bir squircle bezel profili tanımlanır ve Snell kırılma yasasına dayalı ray-tracing ile her piksel için kırılma vektörü hesaplanır.
2. Bu vektörler bir RGBA displacement map'e (kırmızı/yeşil kanallar = x/y ofseti) bake edilir.
3. Map, bir SVG `feDisplacementMap` filtre zincirine (+ blur/specular katmanları) beslenir ve `backdrop-filter: url(#filter)` ile DOM'a uygulanır.
4. Etkileşim animasyonları (basma, bırakma) `motion` kütüphanesinin spring'leri ile `displacementScale`/`transformScale` gibi filtre ve `scale` attribute'ları üzerinden sürülür.

Chromium dışı motorlarda bu zincir çalışmadığından, blur + saturate + statik specular katmanından oluşan bir fallback her zaman altta hazır tutulur.

## Kaynaklar

- Tasarım spesifikasyonu: [`docs/superpowers/specs/2026-07-11-liquid-glass-ui-design.md`](docs/superpowers/specs/2026-07-11-liquid-glass-ui-design.md)
- Uygulama planı: [`docs/superpowers/plans/2026-07-11-liquid-glass-ui.md`](docs/superpowers/plans/2026-07-11-liquid-glass-ui.md)
