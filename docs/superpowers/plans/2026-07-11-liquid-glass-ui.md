# liquid-glass-ui İlk Tur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apple Liquid Glass tasarım dilini web'e taşıyan React component kütüphanesinin ilk turu: cam motoru (displacement map + SVG filter), `GlassSurface`, `GlassButton` (sıvılaşma animasyonlu), `GlassNavbar` ve Storybook v10 vitrini.

**Architecture:** Framework-bağımsız saf TS cam motoru (`src/core/`) squircle bezel + Snell ray-tracing ile displacement map üretir; React componentleri (`src/components/`) bunu `backdrop-filter: url(#filter)` (Chromium) veya blur+saturate fallback (Safari/Firefox) olarak uygular. Etkileşimler `motion` spring'leriyle `feDisplacementMap.scale` attribute'unu anime eder (map asla frame başına yeniden üretilmez).

**Tech Stack:** Vite 7 + React 19 + TypeScript, Storybook v10 (`@storybook/react-vite`), `motion`, Vitest + jsdom + @testing-library/react.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-11-liquid-glass-ui-design.md` — çelişkide spec kazanır.
- Node ≥ 20.19 (mevcut: 25.x). Her şey ESM (`"type": "module"`).
- Storybook importları HER ZAMAN `@storybook/react-vite`'tan (`@storybook/react` ASLA dependency olmaz).
- Saf matematik (pixel/vektör hesabı) canvas'tan AYRI fonksiyonlarda tutulur — jsdom'da canvas yok; canvas'a dokunan kod ince, test edilmeyen sarmalayıcıdır ve `document` yoksa `null` döner.
- Displacement map frame başına ASLA yeniden üretilmez; animasyon yalnız `feDisplacementMap.scale` attribute'u ve CSS transform üzerinden.
- Kanal kodlaması: R = X kayması, G = Y kayması, 128 = nötr, B = 128, A = 255.
- Varsayılan bezel profili `convexSquircle`, kırılma indisi 1.5, radius başına örnek sayısı 127.
- Commit mesajları conventional commits; gövde sonuna şu trailer eklenir:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- Test komutu: `npx vitest run <dosya>` (watch değil).

---

### Task 1: Proje iskeleti (Vite + React + TS + Vitest)

**Files:**
- Create: Vite `react-ts` şablonunun tamamı (repo köküne), `vitest.config.ts`, `src/test-setup.ts`
- Modify: `package.json` (test script), `.gitignore`

**Interfaces:**
- Produces: çalışan `npm run dev`, `npx vitest run`; sonraki tüm task'ların üzerine kurulduğu iskelet.

- [ ] **Step 1: Vite şablonunu kur** (kökte `docs/` ve `.git` olduğu için temp klasörden taşı)

```bash
cd /Users/ahmet/Desktop/storybook
npm create vite@latest tmp-scaffold -- --template react-ts
rsync -a tmp-scaffold/ . --exclude node_modules
rm -rf tmp-scaffold
npm install
```

- [ ] **Step 2: Bağımlılıkları ekle**

```bash
npm install motion
npm install -D vitest jsdom @testing-library/react @testing-library/dom
```

- [ ] **Step 3: Vitest config ve test setup yaz**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

`src/test-setup.ts` (jsdom'da olmayan API stub'ları):
```ts
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }) as MediaQueryList
}
```

`package.json` scripts'e ekle: `"test": "vitest run"`.

- [ ] **Step 4: Doğrula**

Run: `npx vitest run` → Expected: "No test files found" hatası DEĞİL, `include` boş eşleşince vitest exit code 1 verir — bu normaldir; `npm run dev -- --port 5199 &` kısa smoke (başlayıp öldür) veya sadece `npx tsc --noEmit` → Expected: hatasız.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: Vite + React + TS + Vitest iskeleti"
```

---

### Task 2: Storybook v10 + demo arka plan decorator'ı

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.tsx`, `.storybook/DemoBackground.tsx`
- Delete: CLI'nin ürettiği `src/stories/` örnekleri

**Interfaces:**
- Produces: `npm run storybook`; `backgroundKey` global'i (`vivid | dark | mono`) — tüm story'ler `DemoBackground` içinde render olur (cam efekti ancak desenli arka planda görünür).

- [ ] **Step 1: Storybook'u kur**

```bash
npx storybook@latest init --yes --features docs
rm -rf src/stories
```

- [ ] **Step 2: main.ts'i düzenle**

`.storybook/main.ts`:
```ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
}
export default config
```

- [ ] **Step 3: DemoBackground + preview yaz**

`.storybook/DemoBackground.tsx` — camın "canlı" görünmesi için renkli şekiller + metin içeren arka plan:
```tsx
import type { CSSProperties, ReactNode } from 'react'

const palettes: Record<string, string> = {
  vivid: 'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 25%,#a18cd1 50%,#fbc2eb 75%,#8fd3f4 100%)',
  dark: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)',
  mono: 'linear-gradient(135deg,#e0e0e0 0%,#f5f5f5 100%)',
}

const blob = (size: number, color: string, top: string, left: string): CSSProperties => ({
  position: 'absolute', width: size, height: size, top, left,
  borderRadius: '50%', background: color, filter: 'blur(2px)',
})

export function DemoBackground({ variant, children }: { variant: string; children: ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: palettes[variant] ?? palettes.vivid, padding: '4rem 2rem' }}>
      <div style={blob(180, '#ff5e62', '8%', '12%')} />
      <div style={blob(240, '#36d1dc', '55%', '65%')} />
      <div style={blob(120, '#f9d423', '70%', '20%')} />
      <p style={{ position: 'absolute', top: '30%', left: '8%', maxWidth: 420, fontSize: 22, lineHeight: 1.5, color: variant === 'dark' ? '#cfd8dc' : '#37474f' }}>
        Liquid Glass, arkasındaki içeriği mercek gibi kırar. Bu metin ve renkli
        şekiller, kırılmanın gözle görülmesi için buradadır. Kaydırınca camın
        kenarlarındaki bükülmeye dikkat edin.
      </p>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
```

`.storybook/preview.tsx`:
```tsx
import type { Preview } from '@storybook/react-vite'
import { DemoBackground } from './DemoBackground'

const preview: Preview = {
  globalTypes: {
    backgroundKey: {
      description: 'Demo arka planı',
      toolbar: { title: 'Arka plan', icon: 'photo', items: ['vivid', 'dark', 'mono'], dynamicTitle: true },
    },
  },
  initialGlobals: { backgroundKey: 'vivid' },
  decorators: [
    (Story, ctx) => (
      <DemoBackground variant={ctx.globals.backgroundKey as string}>
        <Story />
      </DemoBackground>
    ),
  ],
  parameters: { layout: 'fullscreen' },
}
export default preview
```

- [ ] **Step 4: Doğrula**

Run: `npm run build-storybook` → Expected: hatasız build (story olmadığı için boş vitrin normal).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: Storybook v10 + demo arka plan decorator'ı"
```

---

### Task 3: core/surfaces.ts — bezel profilleri + Snell kırılması

**Files:**
- Create: `src/core/surfaces.ts`
- Test: `src/core/surfaces.test.ts`

**Interfaces:**
- Produces:
  - `type BezelProfile = 'convexCircle' | 'convexSquircle' | 'concave' | 'lip'`
  - `profileHeight(profile: BezelProfile, x: number): number` — x∈[0,1] (0=dış kenar), dönüş [0,1]
  - `displacementAt(profile: BezelProfile, x: number, refractiveIndex?: number): number` — birim kalınlık için kayma büyüklüğü
  - `SAMPLE_COUNT = 127`
  - `computeRadialDisplacements(opts: { profile: BezelProfile; glassThickness: number; refractiveIndex?: number }): { normalized: number[]; maxDisplacement: number }` — `normalized` SAMPLE_COUNT eleman, [0,1]; `maxDisplacement` px

- [ ] **Step 1: Failing testleri yaz** — `src/core/surfaces.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { SAMPLE_COUNT, computeRadialDisplacements, displacementAt, profileHeight } from './surfaces'

describe('profileHeight', () => {
  it('convex profiller kenarda 0, içte 1', () => {
    expect(profileHeight('convexCircle', 0)).toBeCloseTo(0)
    expect(profileHeight('convexCircle', 1)).toBeCloseTo(1)
    expect(profileHeight('convexSquircle', 0)).toBeCloseTo(0)
    expect(profileHeight('convexSquircle', 1)).toBeCloseTo(1)
  })
  it('concave kenarda 1, içte 0', () => {
    expect(profileHeight('concave', 0)).toBeCloseTo(1)
    expect(profileHeight('concave', 1)).toBeCloseTo(0)
  })
  it('convexSquircle monoton artar', () => {
    let prev = -1
    for (let i = 0; i <= 20; i++) {
      const y = profileHeight('convexSquircle', i / 20)
      expect(y).toBeGreaterThanOrEqual(prev)
      prev = y
    }
  })
  it('x [0,1] dışına kıstırılır', () => {
    expect(profileHeight('convexSquircle', -0.5)).toBeCloseTo(0)
    expect(profileHeight('convexSquircle', 1.5)).toBeCloseTo(1)
  })
})

describe('displacementAt', () => {
  it('düz iç bölgede (x=1) kayma ~0', () => {
    expect(Math.abs(displacementAt('convexSquircle', 1))).toBeLessThan(0.01)
  })
  it('bezel içinde (x=0.15) pozitif kayma üretir', () => {
    expect(displacementAt('convexSquircle', 0.15)).toBeGreaterThan(0)
  })
  it('kırılma indisi 1 iken kayma ~0 (cam yok)', () => {
    expect(Math.abs(displacementAt('convexSquircle', 0.15, 1))).toBeLessThan(1e-9)
  })
})

describe('computeRadialDisplacements', () => {
  it('SAMPLE_COUNT örnek döner, normalized [0,1] içinde', () => {
    const r = computeRadialDisplacements({ profile: 'convexSquircle', glassThickness: 20 })
    expect(r.normalized).toHaveLength(SAMPLE_COUNT)
    for (const v of r.normalized) {
      expect(Math.abs(v)).toBeLessThanOrEqual(1)
    }
  })
  it('maxDisplacement kalınlıkla ölçeklenir', () => {
    const a = computeRadialDisplacements({ profile: 'convexSquircle', glassThickness: 10 })
    const b = computeRadialDisplacements({ profile: 'convexSquircle', glassThickness: 20 })
    expect(b.maxDisplacement).toBeCloseTo(a.maxDisplacement * 2, 5)
  })
})
```

- [ ] **Step 2: Çalıştır, FAIL gör**

Run: `npx vitest run src/core/surfaces.test.ts` → Expected: FAIL ("Cannot find module './surfaces'").

- [ ] **Step 3: Implementasyon** — `src/core/surfaces.ts`

```ts
export type BezelProfile = 'convexCircle' | 'convexSquircle' | 'concave' | 'lip'

export const SAMPLE_COUNT = 127
const DEFAULT_IOR = 1.5

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smootherstep = (x: number) => {
  const t = clamp01(x)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

const convexCircle = (x: number) => Math.sqrt(1 - (1 - x) ** 2)
const convexSquircle = (x: number) => (1 - (1 - x) ** 4) ** 0.25
const concave = (x: number) => 1 - convexCircle(x)
const lip = (x: number) => {
  const t = smootherstep(x)
  return convexCircle(x) * (1 - t) + concave(x) * t
}

export function profileHeight(profile: BezelProfile, x: number): number {
  const t = clamp01(x)
  switch (profile) {
    case 'convexCircle':
      return convexCircle(t)
    case 'convexSquircle':
      return convexSquircle(t)
    case 'concave':
      return concave(t)
    case 'lip':
      return lip(t)
  }
}

// Snell: dik gelen ışın, yüzey normalinden θ1 sapar; sin(θ2) = sin(θ1)/n.
// Kayma ≈ tan(θ1 − θ2) × yerel cam yüksekliği (tek kırılma olayı, kube.io modeli).
export function displacementAt(profile: BezelProfile, x: number, refractiveIndex = DEFAULT_IOR): number {
  const delta = 0.001
  const y1 = profileHeight(profile, x - delta)
  const y2 = profileHeight(profile, x + delta)
  const derivative = (y2 - y1) / (2 * delta)
  const theta1 = Math.atan(derivative)
  const theta2 = Math.asin(Math.sin(theta1) / refractiveIndex)
  return Math.tan(theta1 - theta2) * profileHeight(profile, x)
}

export interface RadialDisplacementOptions {
  profile: BezelProfile
  glassThickness: number
  refractiveIndex?: number
}

export interface RadialDisplacementResult {
  normalized: number[]
  maxDisplacement: number
}

export function computeRadialDisplacements(opts: RadialDisplacementOptions): RadialDisplacementResult {
  const magnitudes: number[] = []
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const x = i / (SAMPLE_COUNT - 1)
    magnitudes.push(displacementAt(opts.profile, x, opts.refractiveIndex) * opts.glassThickness)
  }
  const maxDisplacement = magnitudes.reduce((m, v) => Math.max(m, Math.abs(v)), 0)
  const normalized = magnitudes.map((m) => (maxDisplacement === 0 ? 0 : m / maxDisplacement))
  return { normalized, maxDisplacement }
}
```

- [ ] **Step 4: Testler PASS**

Run: `npx vitest run src/core/surfaces.test.ts` → Expected: PASS (10 test).

- [ ] **Step 5: Commit**

```bash
git add src/core/surfaces.ts src/core/surfaces.test.ts
git commit -m "feat(core): bezel profilleri ve Snell kırılma hesabı"
```

---

### Task 4: core/displacementMap.ts — SDF, pixel üretimi, cache, data-URL

**Files:**
- Create: `src/core/displacementMap.ts`
- Test: `src/core/displacementMap.test.ts`

**Interfaces:**
- Consumes: `computeRadialDisplacements`, `SAMPLE_COUNT`, `BezelProfile` (Task 3)
- Produces:
  - `roundedRectSDF(px, py, width, height, radius): number` — içeride negatif
  - `interface DisplacementMapOptions { width: number; height: number; cornerRadius: number; bezelWidth: number; glassThickness: number; profile?: BezelProfile; refractiveIndex?: number }`
  - `computeDisplacementPixels(opts): { data: Uint8ClampedArray; maxDisplacement: number }` — saf, canvas'sız
  - `interface DisplacementMapResult { dataUrl: string; maxDisplacement: number; width: number; height: number }`
  - `getDisplacementMap(opts): DisplacementMapResult | null` — canvas + module-level cache; `document` yoksa veya 2d context alınamazsa `null`

- [ ] **Step 1: Failing testleri yaz** — `src/core/displacementMap.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { computeDisplacementPixels, roundedRectSDF } from './displacementMap'

describe('roundedRectSDF', () => {
  it('merkezde negatif (içeride)', () => {
    expect(roundedRectSDF(50, 25, 100, 50, 12)).toBeLessThan(0)
  })
  it('dışarıda pozitif', () => {
    expect(roundedRectSDF(-10, 25, 100, 50, 12)).toBeGreaterThan(0)
  })
  it('düz kenar üzerinde ~0', () => {
    expect(roundedRectSDF(50, 0, 100, 50, 12)).toBeCloseTo(0, 5)
  })
})

describe('computeDisplacementPixels', () => {
  const opts = { width: 60, height: 40, cornerRadius: 12, bezelWidth: 10, glassThickness: 15 }

  it('RGBA boyutu doğru ve alpha 255', () => {
    const { data } = computeDisplacementPixels(opts)
    expect(data.length).toBe(60 * 40 * 4)
    for (let i = 3; i < data.length; i += 4) expect(data[i]).toBe(255)
  })

  it('merkez pikseli nötr (128,128,128)', () => {
    const { data } = computeDisplacementPixels(opts)
    const i = (20 * 60 + 30) * 4 // (x=30, y=20)
    expect(data[i]).toBe(128)
    expect(data[i + 1]).toBe(128)
    expect(data[i + 2]).toBe(128)
  })

  it('sol kenar bezel pikselinde X kanalı nötr değil, Y nötr (yatay normal)', () => {
    const { data } = computeDisplacementPixels(opts)
    const i = (20 * 60 + 2) * 4 // (x=2, y=20) — sol kenara 2px, dikeyde ortada
    expect(data[i]).not.toBe(128)
    expect(Math.abs(data[i + 1] - 128)).toBeLessThanOrEqual(1)
  })

  it('tüm kanallar 0-255 aralığında', () => {
    const { data } = computeDisplacementPixels(opts)
    for (const v of data) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(255)
    }
  })

  it('maxDisplacement pozitif', () => {
    expect(computeDisplacementPixels(opts).maxDisplacement).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/core/displacementMap.test.ts` → Expected: FAIL (modül yok).

- [ ] **Step 3: Implementasyon** — `src/core/displacementMap.ts`

```ts
import { SAMPLE_COUNT, computeRadialDisplacements, type BezelProfile } from './surfaces'

export interface DisplacementMapOptions {
  width: number
  height: number
  cornerRadius: number
  bezelWidth: number
  glassThickness: number
  profile?: BezelProfile
  refractiveIndex?: number
}

export interface DisplacementMapResult {
  dataUrl: string
  maxDisplacement: number
  width: number
  height: number
}

// Yuvarlatılmış dikdörtgenin işaretli uzaklık fonksiyonu; içeride negatif.
export function roundedRectSDF(px: number, py: number, width: number, height: number, radius: number): number {
  const r = Math.min(radius, width / 2, height / 2)
  const qx = Math.abs(px - width / 2) - (width / 2 - r)
  const qy = Math.abs(py - height / 2) - (height / 2 - r)
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r
}

export function computeDisplacementPixels(opts: DisplacementMapOptions): {
  data: Uint8ClampedArray
  maxDisplacement: number
} {
  const { width, height, cornerRadius, bezelWidth } = opts
  const profile = opts.profile ?? 'convexSquircle'
  const { normalized, maxDisplacement } = computeRadialDisplacements({
    profile,
    glassThickness: opts.glassThickness,
    refractiveIndex: opts.refractiveIndex,
  })

  const data = new Uint8ClampedArray(width * height * 4)
  const eps = 0.5

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cx = x + 0.5
      const cy = y + 0.5
      const inside = -roundedRectSDF(cx, cy, width, height, cornerRadius)
      const i = (y * width + x) * 4

      let vx = 0
      let vy = 0
      if (inside >= 0 && inside < bezelWidth) {
        const t = inside / bezelWidth // 0 = dış kenar
        const idx = Math.min(SAMPLE_COUNT - 1, Math.round(t * (SAMPLE_COUNT - 1)))
        const magnitude = normalized[idx]
        // Dışa dönük normal = SDF gradyanı (sayısal)
        let gx =
          (roundedRectSDF(cx + eps, cy, width, height, cornerRadius) -
            roundedRectSDF(cx - eps, cy, width, height, cornerRadius)) /
          (2 * eps)
        let gy =
          (roundedRectSDF(cx, cy + eps, width, height, cornerRadius) -
            roundedRectSDF(cx, cy - eps, width, height, cornerRadius)) /
          (2 * eps)
        const len = Math.hypot(gx, gy) || 1
        gx /= len
        gy /= len
        // Konveks mercek kenarı örneği dışarıdan çeker → dışa dönük normal yönü.
        // (İşaret görsel doğrulamada ters görünürse burada çevrilir.)
        vx = gx * magnitude
        vy = gy * magnitude
      }

      data[i] = Math.round(128 + vx * 127)
      data[i + 1] = Math.round(128 + vy * 127)
      data[i + 2] = 128
      data[i + 3] = 255
    }
  }

  return { data, maxDisplacement }
}

const cache = new Map<string, DisplacementMapResult>()

export function getDisplacementMap(opts: DisplacementMapOptions): DisplacementMapResult | null {
  if (typeof document === 'undefined') return null
  const key = JSON.stringify([
    opts.width, opts.height, opts.cornerRadius, opts.bezelWidth,
    opts.glassThickness, opts.profile ?? 'convexSquircle', opts.refractiveIndex ?? 1.5,
  ])
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = opts.width
  canvas.height = opts.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const { data, maxDisplacement } = computeDisplacementPixels(opts)
  ctx.putImageData(new ImageData(data, opts.width, opts.height), 0, 0)
  const result: DisplacementMapResult = {
    dataUrl: canvas.toDataURL('image/png'),
    maxDisplacement,
    width: opts.width,
    height: opts.height,
  }
  cache.set(key, result)
  return result
}
```

- [ ] **Step 4: Testler PASS**

Run: `npx vitest run src/core/displacementMap.test.ts` → Expected: PASS. Sol-kenar testi Y-nötr beklentisinde 1 birim toleransla geçmezse gradyan hesabını (eps) kontrol et — köşe radius'undan uzak bir satır seçilmiştir, geçmesi gerekir.

- [ ] **Step 5: Commit**

```bash
git add src/core/displacementMap.ts src/core/displacementMap.test.ts
git commit -m "feat(core): rounded-rect SDF ve displacement map üretimi"
```

---

### Task 5: core/specularMap.ts — kenar parlama haritası

**Files:**
- Create: `src/core/specularMap.ts`
- Test: `src/core/specularMap.test.ts`

**Interfaces:**
- Consumes: `roundedRectSDF` (Task 4)
- Produces:
  - `interface SpecularMapOptions { width: number; height: number; cornerRadius: number; bezelWidth: number; lightAngleDeg?: number }` (varsayılan ışık açısı −60°)
  - `computeSpecularPixels(opts): Uint8ClampedArray` — saf; beyaz piksel, alpha = rim şiddeti
  - `getSpecularMap(opts): string | null` — data-URL, cache'li, `document` yoksa `null`

- [ ] **Step 1: Failing testleri yaz** — `src/core/specularMap.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { computeSpecularPixels } from './specularMap'

describe('computeSpecularPixels', () => {
  const opts = { width: 60, height: 40, cornerRadius: 12, bezelWidth: 8, lightAngleDeg: -60 }

  it('doğru boyutta RGBA döner', () => {
    expect(computeSpecularPixels(opts).length).toBe(60 * 40 * 4)
  })

  it('merkezde alpha 0 (parlama yalnız kenarda)', () => {
    const data = computeSpecularPixels(opts)
    const i = (20 * 60 + 30) * 4
    expect(data[i + 3]).toBe(0)
  })

  it('ışığa bakan kenarda alpha > 0, ters kenarda daha düşük', () => {
    const data = computeSpecularPixels(opts)
    // Işık -60° (sol-üst): üst kenar (y=2) aydınlık, alt kenar (y=37) sönük olmalı
    const top = data[(2 * 60 + 30) * 4 + 3]
    const bottom = data[(37 * 60 + 30) * 4 + 3]
    expect(top).toBeGreaterThan(0)
    expect(top).toBeGreaterThan(bottom)
  })

  it('parlama pikselleri beyaz', () => {
    const data = computeSpecularPixels(opts)
    const i = (2 * 60 + 30) * 4
    expect(data[i]).toBe(255)
    expect(data[i + 1]).toBe(255)
    expect(data[i + 2]).toBe(255)
  })
})
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/core/specularMap.test.ts` → Expected: FAIL (modül yok).

- [ ] **Step 3: Implementasyon** — `src/core/specularMap.ts`

```ts
import { roundedRectSDF } from './displacementMap'

export interface SpecularMapOptions {
  width: number
  height: number
  cornerRadius: number
  bezelWidth: number
  lightAngleDeg?: number
}

export function computeSpecularPixels(opts: SpecularMapOptions): Uint8ClampedArray {
  const { width, height, cornerRadius, bezelWidth } = opts
  const lightAngle = ((opts.lightAngleDeg ?? -60) * Math.PI) / 180
  const lx = Math.cos(lightAngle)
  const ly = Math.sin(lightAngle)
  const data = new Uint8ClampedArray(width * height * 4)
  const eps = 0.5

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cx = x + 0.5
      const cy = y + 0.5
      const inside = -roundedRectSDF(cx, cy, width, height, cornerRadius)
      const i = (y * width + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255

      if (inside < 0 || inside >= bezelWidth) {
        data[i + 3] = 0
        continue
      }
      let gx =
        (roundedRectSDF(cx + eps, cy, width, height, cornerRadius) -
          roundedRectSDF(cx - eps, cy, width, height, cornerRadius)) / (2 * eps)
      let gy =
        (roundedRectSDF(cx, cy + eps, width, height, cornerRadius) -
          roundedRectSDF(cx, cy - eps, width, height, cornerRadius)) / (2 * eps)
      const len = Math.hypot(gx, gy) || 1
      gx /= len
      gy /= len
      // Normalin ışığa bakma oranı × kenara yakınlık düşüşü
      const facing = Math.max(0, gx * lx + gy * ly)
      const falloff = 1 - inside / bezelWidth
      data[i + 3] = Math.round(255 * facing * facing * falloff)
    }
  }
  return data
}

const cache = new Map<string, string>()

export function getSpecularMap(opts: SpecularMapOptions): string | null {
  if (typeof document === 'undefined') return null
  const key = JSON.stringify([opts.width, opts.height, opts.cornerRadius, opts.bezelWidth, opts.lightAngleDeg ?? -60])
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = opts.width
  canvas.height = opts.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.putImageData(new ImageData(computeSpecularPixels(opts), opts.width, opts.height), 0, 0)
  const url = canvas.toDataURL('image/png')
  cache.set(key, url)
  return url
}
```

- [ ] **Step 4: Testler PASS**

Run: `npx vitest run src/core/specularMap.test.ts` → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/specularMap.ts src/core/specularMap.test.ts
git commit -m "feat(core): specular rim haritası üretimi"
```

---

### Task 6: core/tier.ts — tarayıcı katmanı ve erişilebilirlik tespiti

**Files:**
- Create: `src/core/tier.ts`
- Test: `src/core/tier.test.ts`

**Interfaces:**
- Produces:
  - `type GlassTier = 'refraction' | 'fallback'`
  - `detectTier(nav?: { userAgent: string; userAgentData?: { brands?: { brand: string }[] } }): GlassTier`
  - `prefersReducedMotion(): boolean`, `prefersReducedTransparency(): boolean` (matchMedia; yoksa `false`)

- [ ] **Step 1: Failing testleri yaz** — `src/core/tier.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { detectTier } from './tier'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15'
const FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:141.0) Gecko/20100101 Firefox/141.0'

describe('detectTier', () => {
  it('userAgentData Chromium markası → refraction', () => {
    expect(detectTier({ userAgent: '', userAgentData: { brands: [{ brand: 'Chromium' }, { brand: 'Google Chrome' }] } })).toBe('refraction')
  })
  it('Chrome UA → refraction', () => {
    expect(detectTier({ userAgent: CHROME_UA })).toBe('refraction')
  })
  it('Safari UA → fallback', () => {
    expect(detectTier({ userAgent: SAFARI_UA })).toBe('fallback')
  })
  it('Firefox UA → fallback', () => {
    expect(detectTier({ userAgent: FIREFOX_UA })).toBe('fallback')
  })
})
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/core/tier.test.ts` → Expected: FAIL.

- [ ] **Step 3: Implementasyon** — `src/core/tier.ts`

```ts
export type GlassTier = 'refraction' | 'fallback'

interface NavigatorLike {
  userAgent: string
  userAgentData?: { brands?: { brand: string }[] }
}

// backdrop-filter: url(#f) yalnız Chromium'da çalışır (WebKit bug 245510, Firefox desteklemiyor).
// CSS.supports güvenilmez (parse edip render etmeyen motorlar var) → engine tespiti.
export function detectTier(nav: NavigatorLike = navigator as NavigatorLike): GlassTier {
  const brands = nav.userAgentData?.brands
  if (brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/i.test(b.brand))) return 'refraction'
  const ua = nav.userAgent
  const isChromiumUA = /(Chrome|Chromium|Edg|CriOS)\//.test(ua) && !/Firefox\//.test(ua)
  return isChromiumUA ? 'refraction' : 'fallback'
}

const media = (query: string): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false

export const prefersReducedMotion = () => media('(prefers-reduced-motion: reduce)')
export const prefersReducedTransparency = () => media('(prefers-reduced-transparency: reduce)')
```

- [ ] **Step 4: Testler PASS**

Run: `npx vitest run src/core/tier.test.ts` → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/tier.ts src/core/tier.test.ts
git commit -m "feat(core): glass tier ve erişilebilirlik tespiti"
```

---

### Task 7: core/GlassFilter.tsx — SVG filter zinciri componenti

**Files:**
- Create: `src/core/GlassFilter.tsx`
- Test: `src/core/GlassFilter.test.tsx`

**Interfaces:**
- Consumes: yok (props ile beslenir)
- Produces:
  - `interface GlassFilterProps { id: string; width: number; height: number; displacementMapUrl: string; maxDisplacement: number; specularMapUrl?: string | null; scaleValue?: MotionValue<number>; blur?: number; saturation?: number }`
  - `<GlassFilter />` — gizli `<svg><filter id=...>`; `scaleValue` değiştikçe `feDisplacementMap.scale = maxDisplacement × değer` attribute olarak güncellenir (re-render yok)

- [ ] **Step 1: Failing testleri yaz** — `src/core/GlassFilter.test.tsx`

```tsx
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { GlassFilter } from './GlassFilter'

const base = {
  id: 'glass-x',
  width: 200,
  height: 60,
  displacementMapUrl: 'data:image/png;base64,AAA',
  maxDisplacement: 40,
}

describe('GlassFilter', () => {
  it('filter ve feDisplacementMap doğru attribute\'larla render olur', () => {
    const { container } = render(<GlassFilter {...base} />)
    const filter = container.querySelector('filter')
    expect(filter?.getAttribute('id')).toBe('glass-x')
    const disp = container.querySelector('feDisplacementMap')
    expect(disp?.getAttribute('scale')).toBe('40')
    expect(disp?.getAttribute('xChannelSelector')).toBe('R')
    expect(disp?.getAttribute('yChannelSelector')).toBe('G')
  })

  it('specular yokken feComposite render olmaz, varken olur', () => {
    const { container, rerender } = render(<GlassFilter {...base} />)
    expect(container.querySelector('feComposite')).toBeNull()
    rerender(<GlassFilter {...base} specularMapUrl="data:image/png;base64,BBB" />)
    expect(container.querySelector('feComposite')).not.toBeNull()
  })

  it('feImage boyutları elemana eşit (filtre otomatik ölçeklenmez)', () => {
    const { container } = render(<GlassFilter {...base} />)
    const img = container.querySelector('feImage')
    expect(img?.getAttribute('width')).toBe('200')
    expect(img?.getAttribute('height')).toBe('60')
  })
})
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/core/GlassFilter.test.tsx` → Expected: FAIL.

- [ ] **Step 3: Implementasyon** — `src/core/GlassFilter.tsx`

```tsx
import { useEffect, useRef } from 'react'
import type { MotionValue } from 'motion/react'

export interface GlassFilterProps {
  id: string
  width: number
  height: number
  displacementMapUrl: string
  maxDisplacement: number
  specularMapUrl?: string | null
  scaleValue?: MotionValue<number>
  blur?: number
  saturation?: number
}

export function GlassFilter({
  id,
  width,
  height,
  displacementMapUrl,
  maxDisplacement,
  specularMapUrl,
  scaleValue,
  blur = 0.8,
  saturation = 4,
}: GlassFilterProps) {
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)

  useEffect(() => {
    if (!scaleValue) return
    return scaleValue.on('change', (v) => {
      dispRef.current?.setAttribute('scale', String(maxDisplacement * v))
    })
  }, [scaleValue, maxDisplacement])

  return (
    <svg aria-hidden width="0" height="0" style={{ position: 'absolute' }} colorInterpolationFilters="sRGB">
      <filter id={id} x="0" y="0" width={width} height={height} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse">
        <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />
        <feImage href={displacementMapUrl} x={0} y={0} width={width} height={height} result="map" />
        <feDisplacementMap
          ref={dispRef}
          in="blurred"
          in2="map"
          scale={maxDisplacement}
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        <feColorMatrix in="displaced" type="saturate" values={String(saturation)} result="saturated" />
        {specularMapUrl ? (
          <>
            <feImage href={specularMapUrl} x={0} y={0} width={width} height={height} result="spec" />
            <feComposite in="saturated" in2="spec" operator="in" result="specSat" />
            <feComponentTransfer in="spec" result="specFaded">
              <feFuncA type="linear" slope="0.25" />
            </feComponentTransfer>
            <feBlend in="specSat" in2="displaced" mode="normal" result="withSat" />
            <feBlend in="specFaded" in2="withSat" mode="normal" />
          </>
        ) : null}
      </filter>
    </svg>
  )
}
```

- [ ] **Step 4: Testler PASS**

Run: `npx vitest run src/core/GlassFilter.test.tsx` → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/GlassFilter.tsx src/core/GlassFilter.test.tsx
git commit -m "feat(core): SVG glass filter zinciri componenti"
```

---

### Task 8: GlassSurface — temel primitive + tier context + Storybook forceTier

**Files:**
- Create: `src/components/GlassSurface/GlassSurface.tsx`, `src/components/GlassSurface/GlassSurface.module.css`, `src/components/GlassSurface/useElementSize.ts`, `src/components/GlassSurface/GlassTierContext.tsx`, `src/components/GlassSurface/index.ts`, `src/components/GlassSurface/GlassSurface.stories.tsx`
- Modify: `.storybook/preview.tsx` (forceTier toolbar'ı)
- Test: `src/components/GlassSurface/GlassSurface.test.tsx`

**Interfaces:**
- Consumes: `getDisplacementMap` (Task 4), `getSpecularMap` (Task 5), `detectTier`, `GlassTier`, `prefersReducedTransparency` (Task 6), `GlassFilter` (Task 7)
- Produces:
  - `interface GlassSurfaceProps extends React.HTMLAttributes<HTMLElement> { variant?: 'regular' | 'clear'; thickness?: number; shape?: number | 'capsule'; tone?: 'light' | 'dark' | 'auto'; interactive?: boolean; displacementScale?: MotionValue<number>; as?: React.ElementType }`
  - `<GlassSurface />` — cam yüzey; refraction tier'da SVG filter, fallback'te blur+saturate
  - `<GlassTierProvider tier={...}>` + `useGlassTier(): GlassTier`

- [ ] **Step 1: Failing testleri yaz** — `src/components/GlassSurface/GlassSurface.test.tsx`

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassSurface } from './GlassSurface'
import { GlassTierProvider } from './GlassTierContext'

describe('GlassSurface', () => {
  it('children render eder', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSurface>merhaba</GlassSurface>
      </GlassTierProvider>,
    )
    expect(screen.getByText('merhaba')).toBeDefined()
  })

  it('fallback tier\'da SVG filter render etmez, blur fallback stili uygular', () => {
    const { container } = render(
      <GlassTierProvider tier="fallback">
        <GlassSurface data-testid="s">x</GlassSurface>
      </GlassTierProvider>,
    )
    expect(container.querySelector('filter')).toBeNull()
    const el = screen.getByTestId('s')
    expect(el.style.backdropFilter).toContain('blur')
  })

  it('clear varyantı karartma katmanı ekler', () => {
    const { container } = render(
      <GlassTierProvider tier="fallback">
        <GlassSurface variant="clear">x</GlassSurface>
      </GlassTierProvider>,
    )
    expect(container.querySelector('[data-glass-dimming]')).not.toBeNull()
  })

  it('as prop ile buton olarak render olur', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSurface as="button">tıkla</GlassSurface>
      </GlassTierProvider>,
    )
    expect(screen.getByRole('button')).toBeDefined()
  })
})
```

Not: jsdom'da ResizeObserver stub olduğundan boyut hiç ölçülmez → refraction yolunu jsdom'da test etmiyoruz; refraction görsel doğrulaması Storybook'ta (Chrome) yapılır. Bu bilinçli bir sınır.

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/components/GlassSurface/GlassSurface.test.tsx` → Expected: FAIL.

- [ ] **Step 3: Yardımcıları yaz**

`src/components/GlassSurface/GlassTierContext.tsx`:
```tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { detectTier, type GlassTier } from '../../core/tier'

const GlassTierContext = createContext<GlassTier | null>(null)

export function GlassTierProvider({ tier, children }: { tier: GlassTier; children: ReactNode }) {
  return <GlassTierContext.Provider value={tier}>{children}</GlassTierContext.Provider>
}

export function useGlassTier(): GlassTier {
  const fromContext = useContext(GlassTierContext)
  const detected = useMemo(() => (typeof navigator === 'undefined' ? 'fallback' : detectTier()), [])
  return fromContext ?? detected
}
```

`src/components/GlassSurface/useElementSize.ts` (150 ms debounce'lu ResizeObserver):
```ts
import { useEffect, useRef, useState } from 'react'

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const measure = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
      }
    }
    measure()
    const ro = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(measure, 150)
    })
    ro.observe(el)
    return () => {
      clearTimeout(timer)
      ro.disconnect()
    }
  }, [])

  return { ref, size }
}
```

- [ ] **Step 4: GlassSurface'i yaz**

`src/components/GlassSurface/GlassSurface.module.css`:
```css
.surface {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(255, 255, 255, 0.12);
  color: inherit;
}

/* Açıya göre değişen hairline rim — her iki tier'da ortak */
.surface::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(var(--glass-light-angle, 120deg), rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.35));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
  z-index: 2;
}

.dimming {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(0, 0, 0, 0.35); /* Apple clear varyant kuralı */
  z-index: 0;
  pointer-events: none;
}

.toneLight { color: rgba(255, 255, 255, 0.95); }
.toneDark { color: rgba(0, 0, 0, 0.85); }
.content { position: relative; z-index: 1; }
```

`src/components/GlassSurface/GlassSurface.tsx`:
```tsx
import { useId, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import type { MotionValue } from 'motion/react'
import { getDisplacementMap } from '../../core/displacementMap'
import { getSpecularMap } from '../../core/specularMap'
import { GlassFilter } from '../../core/GlassFilter'
import { prefersReducedTransparency } from '../../core/tier'
import { useGlassTier } from './GlassTierContext'
import { useElementSize } from './useElementSize'
import styles from './GlassSurface.module.css'

export interface GlassSurfaceProps extends HTMLAttributes<HTMLElement> {
  variant?: 'regular' | 'clear'
  /** 0–1: gölge derinliği, lensing gücü ve blur'u birlikte ölçekler (Apple'ın kalınlık kuralı) */
  thickness?: number
  shape?: number | 'capsule'
  tone?: 'light' | 'dark' | 'auto'
  interactive?: boolean
  /** Basınç animasyonu için dışarıdan verilen çarpan (1 = normal) */
  displacementScale?: MotionValue<number>
  as?: ElementType
  children?: ReactNode
}

export function GlassSurface({
  variant = 'regular',
  thickness = 0.5,
  shape = 16,
  tone = 'auto',
  interactive = false,
  displacementScale,
  as: Comp = 'div',
  className,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const tier = useGlassTier()
  const rawId = useId()
  const filterId = `glass-${rawId.replace(/[^a-zA-Z0-9-]/g, '')}`
  const { ref, size } = useElementSize<HTMLElement>()

  const radius = shape === 'capsule' ? (size ? size.height / 2 : 999) : shape
  const frosted = prefersReducedTransparency()

  let filterNode: ReactNode = null
  let backdrop = `blur(${(2 + thickness * 10).toFixed(1)}px) saturate(180%)`

  if (tier === 'refraction' && size && !frosted) {
    const bezelWidth = Math.max(6, Math.min(size.width, size.height) * 0.18)
    const map = getDisplacementMap({
      width: size.width,
      height: size.height,
      cornerRadius: Math.min(radius, size.height / 2),
      bezelWidth,
      glassThickness: 6 + thickness * 22,
    })
    if (map) {
      const specular = getSpecularMap({
        width: size.width,
        height: size.height,
        cornerRadius: Math.min(radius, size.height / 2),
        bezelWidth,
      })
      filterNode = (
        <GlassFilter
          id={filterId}
          width={size.width}
          height={size.height}
          displacementMapUrl={map.dataUrl}
          maxDisplacement={map.maxDisplacement}
          specularMapUrl={specular}
          scaleValue={displacementScale}
          blur={0.4 + thickness * 1.2}
          saturation={3 + thickness * 3}
        />
      )
      backdrop = `url(#${filterId})`
    }
  }

  const toneClass = tone === 'light' ? styles.toneLight : tone === 'dark' ? styles.toneDark : ''
  const surfaceStyle: CSSProperties = {
    borderRadius: radius,
    backdropFilter: backdrop,
    WebkitBackdropFilter: backdrop,
    boxShadow: `0 ${4 + thickness * 12}px ${16 + thickness * 24}px rgba(0,0,0,${0.12 + thickness * 0.14}), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(255,255,255,0.12)`,
    cursor: interactive ? 'pointer' : undefined,
    touchAction: interactive ? 'manipulation' : undefined,
    ...style,
  }

  return (
    <Comp ref={ref} className={[styles.surface, toneClass, className].filter(Boolean).join(' ')} style={surfaceStyle} {...rest}>
      {filterNode}
      {variant === 'clear' ? <span className={styles.dimming} data-glass-dimming /> : null}
      <span className={styles.content}>{children}</span>
    </Comp>
  )
}
```

`src/components/GlassSurface/index.ts`:
```ts
export { GlassSurface, type GlassSurfaceProps } from './GlassSurface'
export { GlassTierProvider, useGlassTier } from './GlassTierContext'
```

- [ ] **Step 5: Testler PASS**

Run: `npx vitest run src/components/GlassSurface/GlassSurface.test.tsx` → Expected: PASS. (`as: motion.button` gibi ref'li kullanım Task 10'da; jsdom'da `ref` ataması `Comp` string olduğu için sorunsuz.)

- [ ] **Step 6: forceTier toolbar'ını ekle** — `.storybook/preview.tsx`'i şununla güncelle (decorator'ı GlassTierProvider ile sarmala):

```tsx
import type { Preview } from '@storybook/react-vite'
import { DemoBackground } from './DemoBackground'
import { GlassTierProvider } from '../src/components/GlassSurface/GlassTierContext'
import { detectTier, type GlassTier } from '../src/core/tier'

const preview: Preview = {
  globalTypes: {
    backgroundKey: {
      description: 'Demo arka planı',
      toolbar: { title: 'Arka plan', icon: 'photo', items: ['vivid', 'dark', 'mono'], dynamicTitle: true },
    },
    forceTier: {
      description: 'Cam katmanını zorla',
      toolbar: { title: 'Tier', icon: 'beaker', items: ['auto', 'refraction', 'fallback'], dynamicTitle: true },
    },
  },
  initialGlobals: { backgroundKey: 'vivid', forceTier: 'auto' },
  decorators: [
    (Story, ctx) => {
      const forced = ctx.globals.forceTier as string
      const tier: GlassTier = forced === 'auto' ? detectTier() : (forced as GlassTier)
      return (
        <GlassTierProvider tier={tier}>
          <DemoBackground variant={ctx.globals.backgroundKey as string}>
            <Story />
          </DemoBackground>
        </GlassTierProvider>
      )
    },
  ],
  parameters: { layout: 'fullscreen' },
}
export default preview
```

- [ ] **Step 7: Story yaz** — `src/components/GlassSurface/GlassSurface.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSurface } from './GlassSurface'

const meta = {
  title: 'Primitives/GlassSurface',
  component: GlassSurface,
  tags: ['autodocs'],
  argTypes: {
    thickness: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    variant: { control: 'select', options: ['regular', 'clear'] },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
  },
} satisfies Meta<typeof GlassSurface>

export default meta
type Story = StoryObj<typeof meta>

export const Regular: Story = {
  args: { thickness: 0.5, style: { width: 340, height: 120, display: 'grid', placeItems: 'center' }, children: 'Regular cam yüzey' },
}

export const Clear: Story = {
  args: { ...Regular.args, variant: 'clear', tone: 'light', children: 'Clear varyant (%35 karartma)' },
}

export const Thick: Story = {
  args: { ...Regular.args, thickness: 1, children: 'Kalın cam — güçlü lensing' },
}
```

- [ ] **Step 8: Görsel doğrulama + commit**

Run: `npm run build-storybook` → Expected: hatasız. (Chrome'da `npm run storybook` ile kenar kırılması gözle kontrol edilir; kırılma yönü ters görünürse `computeDisplacementPixels` içindeki `vx = gx * magnitude` işaretini çevir, testleri tekrar koştur.)

```bash
git add -A && git commit -m "feat: GlassSurface primitive, tier context ve Storybook entegrasyonu"
```

---

### Task 9: motion/presets.ts + useGlassPress — sıvılaşma etkileşimi

**Files:**
- Create: `src/motion/presets.ts`, `src/motion/useGlassPress.ts`
- Test: `src/motion/useGlassPress.test.tsx`

**Interfaces:**
- Consumes: `prefersReducedMotion` (Task 6)
- Produces:
  - `presets` sabiti: `{ pressLiquefy: { displacementScale: 1.7, transformScale: 0.96 }, springs: { press: { stiffness: 400, damping: 25 }, jelly: { stiffness: 300, damping: 15 } } }`
  - `useGlassPress(opts?: { disabled?: boolean }): { displacementScale: MotionValue<number>; transformScale: MotionValue<number>; glowX: MotionValue<number>; glowY: MotionValue<number>; glowOpacity: MotionValue<number>; handlers: { onPointerDown; onPointerUp; onPointerLeave; onPointerCancel } }`

- [ ] **Step 1: Failing testleri yaz** — `src/motion/useGlassPress.test.tsx`

```tsx
import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { presets } from './presets'
import { useGlassPress } from './useGlassPress'

const pointerDown = {
  clientX: 30,
  clientY: 10,
  currentTarget: { getBoundingClientRect: () => ({ left: 10, top: 0, width: 100, height: 40 }) },
} as unknown as React.PointerEvent<HTMLElement>

describe('presets', () => {
  it('pressLiquefy displacement çarpanı 1\'den büyük, transform 1\'den küçük', () => {
    expect(presets.pressLiquefy.displacementScale).toBeGreaterThan(1)
    expect(presets.pressLiquefy.transformScale).toBeLessThan(1)
  })
})

describe('useGlassPress', () => {
  it('başlangıç değerleri nötr', () => {
    const { result } = renderHook(() => useGlassPress())
    expect(result.current.displacementScale.get()).toBe(1)
    expect(result.current.transformScale.get()).toBe(1)
    expect(result.current.glowOpacity.get()).toBe(0)
  })

  it('pointer down hedefleri basınç değerlerine çeker ve glow pozisyonunu yerleştirir', () => {
    const { result } = renderHook(() => useGlassPress())
    act(() => result.current.handlers.onPointerDown(pointerDown))
    expect(result.current.glowX.get()).toBe(20) // 30 - left 10
    expect(result.current.glowY.get()).toBe(10)
  })

  it('disabled iken pointer down hiçbir şeyi değiştirmez', () => {
    const { result } = renderHook(() => useGlassPress({ disabled: true }))
    act(() => result.current.handlers.onPointerDown(pointerDown))
    expect(result.current.glowOpacity.getVelocity()).toBe(0)
    expect(result.current.glowX.get()).toBe(0)
  })
})
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/motion/useGlassPress.test.tsx` → Expected: FAIL.

- [ ] **Step 3: Implementasyon**

`src/motion/presets.ts`:
```ts
// RealityKit AnimationLibraryComponent deseninden uyarlanmış adlandırılmış preset kaydı.
export const presets = {
  pressLiquefy: { displacementScale: 1.7, transformScale: 0.96 },
  springs: {
    press: { stiffness: 400, damping: 25 },
    jelly: { stiffness: 300, damping: 15 }, // düşük damping = bırakınca jöle salınımı
  },
} as const
```

`src/motion/useGlassPress.ts`:
```ts
import { useMemo } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent } from 'react'
import { prefersReducedMotion } from '../core/tier'
import { presets } from './presets'

export interface GlassPressOptions {
  disabled?: boolean
}

export function useGlassPress(opts: GlassPressOptions = {}) {
  const reduced = prefersReducedMotion()
  const disabled = opts.disabled || reduced

  const displacementScale = useSpring(1, presets.springs.press)
  const transformScale = useSpring(1, presets.springs.jelly)
  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const glowOpacity = useSpring(0, presets.springs.press)

  const handlers = useMemo(() => {
    const release = () => {
      if (disabled) return
      displacementScale.set(1)
      transformScale.set(1)
      glowOpacity.set(0)
    }
    return {
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        if (disabled) return
        const rect = e.currentTarget.getBoundingClientRect()
        glowX.jump(e.clientX - rect.left)
        glowY.jump(e.clientY - rect.top)
        displacementScale.set(presets.pressLiquefy.displacementScale)
        transformScale.set(presets.pressLiquefy.transformScale)
        glowOpacity.set(0.6)
      },
      onPointerUp: release,
      onPointerLeave: release,
      onPointerCancel: release,
    }
  }, [disabled, displacementScale, transformScale, glowOpacity, glowX, glowY])

  return { displacementScale, transformScale, glowX, glowY, glowOpacity, handlers }
}
```

- [ ] **Step 4: Testler PASS**

Run: `npx vitest run src/motion/useGlassPress.test.tsx` → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/motion
git commit -m "feat(motion): pressLiquefy/releaseJelly presetleri ve useGlassPress"
```

---

### Task 10: GlassButton

**Files:**
- Create: `src/components/GlassButton/GlassButton.tsx`, `src/components/GlassButton/GlassButton.module.css`, `src/components/GlassButton/index.ts`, `src/components/GlassButton/GlassButton.stories.tsx`
- Test: `src/components/GlassButton/GlassButton.test.tsx`

**Interfaces:**
- Consumes: `GlassSurface` (Task 8), `useGlassPress` (Task 9)
- Produces:
  - `interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { size?: 'sm' | 'md' | 'lg' | 'xl'; tint?: string; prominent?: boolean; tone?: 'light' | 'dark' | 'auto' }`
  - `<GlassButton />` — capsule cam buton; basınca sıvılaşma + iç ışıma + jöle bırakma

- [ ] **Step 1: Failing testleri yaz** — `src/components/GlassButton/GlassButton.test.tsx`

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassButton } from './GlassButton'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBtn = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassButton {...props}>Kaydet</GlassButton>
    </GlassTierProvider>,
  )

describe('GlassButton', () => {
  it('button rolüyle render olur ve tıklama çalışır', () => {
    const onClick = vi.fn()
    renderBtn({ onClick })
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled iken tıklanamaz', () => {
    const onClick = vi.fn()
    renderBtn({ onClick, disabled: true })
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('tint verilince CSS değişkeni olarak uygulanır', () => {
    renderBtn({ tint: '#0a84ff' })
    expect(screen.getByRole('button').style.getPropertyValue('--glass-tint')).toBe('#0a84ff')
  })

  it('boyut sınıfı uygulanır', () => {
    renderBtn({ size: 'xl' })
    expect(screen.getByRole('button').className).toMatch(/xl/)
  })
})
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/components/GlassButton/GlassButton.test.tsx` → Expected: FAIL.

- [ ] **Step 3: Implementasyon**

`src/components/GlassButton/GlassButton.module.css`:
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  font: inherit;
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.button:focus-visible {
  outline: 2px solid rgba(10, 132, 255, 0.9);
  outline-offset: 2px;
}
/* Adaptif ton: düz overlay değil, yarı saydam tint (Apple tint kuralı) */
.tinted { background-color: color-mix(in srgb, var(--glass-tint) 55%, transparent); }
.prominent { background-color: color-mix(in srgb, var(--glass-tint, #0a84ff) 85%, transparent); color: #fff; }

.sm { padding: 6px 14px; font-size: 13px; }
.md { padding: 10px 20px; font-size: 15px; }
.lg { padding: 14px 28px; font-size: 17px; }
.xl { padding: 18px 36px; font-size: 19px; } /* Apple'ın yeni extra-large boyutu */

.glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
}
.button:disabled { opacity: 0.45; cursor: default; pointer-events: none; }
```

`src/components/GlassButton/GlassButton.tsx`:
```tsx
import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { motion, useMotionTemplate } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassButton.module.css'

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tint?: string
  prominent?: boolean
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassButton({
  size = 'md',
  tint,
  prominent = false,
  tone = 'auto',
  className,
  style,
  children,
  disabled,
  ...rest
}: GlassButtonProps) {
  const press = useGlassPress({ disabled })
  const glow = useMotionTemplate`radial-gradient(120px circle at ${press.glowX}px ${press.glowY}px, rgba(255,255,255,0.55), transparent 70%)`

  const classes = [
    styles.button,
    styles[size],
    tint && !prominent ? styles.tinted : '',
    prominent ? styles.prominent : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const cssVars: CSSProperties = tint ? ({ '--glass-tint': tint } as CSSProperties) : {}

  return (
    <GlassSurface
      as={motion.button}
      shape="capsule"
      interactive
      tone={tone}
      thickness={0.35}
      displacementScale={press.displacementScale}
      className={classes}
      style={{ ...cssVars, scale: press.transformScale, ...style } as CSSProperties}
      disabled={disabled}
      {...press.handlers}
      {...rest}
    >
      {children}
      <motion.span className={styles.glow} style={{ background: glow, opacity: press.glowOpacity }} aria-hidden />
    </GlassSurface>
  )
}
```

Not: `GlassSurface`'e `motion.button` verildiğinde `style.scale` MotionValue'su motion tarafından işlenir. `GlassSurface` kendi `ref`'ini `Comp`'a geçirir — `motion.button` ref forwarding destekler, sorun çıkmaz. TypeScript `rest` yayılımında `HTMLAttributes<HTMLElement>` ile `ButtonHTMLAttributes` uyumsuzluğu çıkarsa `GlassSurfaceProps`'u `Record<string, unknown>` genişletmesiyle değil, `as`'e özgü prop'ları `...rest`'te bırakarak çöz (GlassSurface zaten `HTMLAttributes<HTMLElement>` + spread yapıyor; `disabled` gibi buton prop'ları spread ile geçer — gerekirse `GlassSurfaceProps`'a `[key: string]: unknown` index imzası EKLEME, bunun yerine `as unknown as GlassSurfaceProps` cast'ini GlassButton içinde yap).

`src/components/GlassButton/index.ts`:
```ts
export { GlassButton, type GlassButtonProps } from './GlassButton'
```

- [ ] **Step 4: Testler PASS**

Run: `npx vitest run src/components/GlassButton/GlassButton.test.tsx` → Expected: PASS.

- [ ] **Step 5: Story yaz** — `src/components/GlassButton/GlassButton.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassButton } from './GlassButton'

const meta = {
  title: 'Components/GlassButton',
  component: GlassButton,
  tags: ['autodocs'],
  args: { onClick: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    tint: { control: 'color' },
  },
} satisfies Meta<typeof GlassButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Devam Et' } }
export const Tinted: Story = { args: { children: 'Satın Al', tint: '#0a84ff', tone: 'light' } }
export const Prominent: Story = { args: { children: 'Bitti', prominent: true, tint: '#0a84ff' } }
export const ExtraLarge: Story = { args: { children: 'Başlayalım', size: 'xl' } }
export const Disabled: Story = { args: { children: 'Devre Dışı', disabled: true } }
```

- [ ] **Step 6: Doğrula + commit**

Run: `npx vitest run && npm run build-storybook` → Expected: tümü PASS + build hatasız. Chrome'da gözle: basılı tutunca cam belirgin biçimde "sıvılaşmalı" (kenar kırılması artar), parmak noktasından ışıma yayılmalı, bırakınca jöle gibi salınmalı.

```bash
git add -A && git commit -m "feat: GlassButton — basınca sıvılaşma, iç ışıma, jöle bırakma"
```

---

### Task 11: GlassNavbar + GlassBackButton + scroll edge effect

**Files:**
- Create: `src/components/GlassNavbar/GlassNavbar.tsx`, `src/components/GlassNavbar/GlassBackButton.tsx`, `src/components/GlassNavbar/GlassNavbar.module.css`, `src/components/GlassNavbar/index.ts`, `src/components/GlassNavbar/GlassNavbar.stories.tsx`
- Test: `src/components/GlassNavbar/GlassNavbar.test.tsx`

**Interfaces:**
- Consumes: `GlassSurface` (Task 8), `GlassButton` (Task 10)
- Produces:
  - `interface GlassNavbarProps { title?: ReactNode; onBack?: () => void; backLabel?: string; actions?: ReactNode; tone?: 'light' | 'dark' | 'auto' }`
  - `<GlassNavbar />` — iOS 26 stili yüzen bar: geri pill'i + başlık + paylaşımlı cam action grubu + soft scroll edge şeridi
  - `<GlassBackButton onClick label? />` — chevron'lu geri butonu

- [ ] **Step 1: Failing testleri yaz** — `src/components/GlassNavbar/GlassNavbar.test.tsx`

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassNavbar } from './GlassNavbar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBar = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassNavbar title="Ayarlar" {...props} />
    </GlassTierProvider>,
  )

describe('GlassNavbar', () => {
  it('başlığı gösterir', () => {
    renderBar()
    expect(screen.getByText('Ayarlar')).toBeDefined()
  })

  it('onBack verilince geri butonu render olur ve çağrılır', () => {
    const onBack = vi.fn()
    renderBar({ onBack, backLabel: 'Geri' })
    fireEvent.click(screen.getByRole('button', { name: /Geri/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('onBack yokken geri butonu yok', () => {
    renderBar()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('actions paylaşımlı cam grupta render olur', () => {
    renderBar({ actions: <button>Paylaş</button> })
    expect(screen.getByRole('button', { name: 'Paylaş' })).toBeDefined()
    expect(document.querySelector('[data-glass-action-group]')).not.toBeNull()
  })

  it('navigation landmark kullanır', () => {
    renderBar()
    expect(screen.getByRole('navigation')).toBeDefined()
  })
})
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/components/GlassNavbar/GlassNavbar.test.tsx` → Expected: FAIL.

- [ ] **Step 3: Implementasyon**

`src/components/GlassNavbar/GlassNavbar.module.css`:
```css
.bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

/* Soft scroll edge effect: bar bölgesinde içerik kademeli blur ile arka plana erir (Apple kuralı: çizgi yok) */
.scrollEdge {
  position: absolute;
  inset: 0 0 -28px 0;
  pointer-events: none;
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
  z-index: -1;
}

.title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actionGroup {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
}
.actionGroup > * { border: none; background: none; font: inherit; color: inherit; padding: 8px 12px; border-radius: 999px; cursor: pointer; }
.actionGroup > *:hover { background: rgba(255, 255, 255, 0.18); }

.chevron { width: 10px; height: 10px; border-left: 2.5px solid currentColor; border-bottom: 2.5px solid currentColor; transform: rotate(45deg); margin-right: 2px; }
.spacer { width: 44px; }
```

`src/components/GlassNavbar/GlassBackButton.tsx`:
```tsx
import { GlassButton } from '../GlassButton'
import styles from './GlassNavbar.module.css'

export interface GlassBackButtonProps {
  onClick: () => void
  label?: string
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassBackButton({ onClick, label, tone = 'auto' }: GlassBackButtonProps) {
  return (
    <GlassButton size="sm" tone={tone} onClick={onClick} aria-label={label ?? 'Geri'}>
      <span className={styles.chevron} aria-hidden />
      {label}
    </GlassButton>
  )
}
```

`src/components/GlassNavbar/GlassNavbar.tsx`:
```tsx
import type { ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import { GlassBackButton } from './GlassBackButton'
import styles from './GlassNavbar.module.css'

export interface GlassNavbarProps {
  title?: ReactNode
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassNavbar({ title, onBack, backLabel, actions, tone = 'auto' }: GlassNavbarProps) {
  return (
    <nav className={styles.bar}>
      <span className={styles.scrollEdge} aria-hidden />
      {onBack ? <GlassBackButton onClick={onBack} label={backLabel} tone={tone} /> : <span className={styles.spacer} />}
      <span className={styles.title}>{title}</span>
      {actions ? (
        <GlassSurface shape="capsule" tone={tone} thickness={0.35} className={styles.actionGroup} data-glass-action-group>
          {actions}
        </GlassSurface>
      ) : (
        <span className={styles.spacer} />
      )}
    </nav>
  )
}
```

`src/components/GlassNavbar/index.ts`:
```ts
export { GlassNavbar, type GlassNavbarProps } from './GlassNavbar'
export { GlassBackButton, type GlassBackButtonProps } from './GlassBackButton'
```

- [ ] **Step 4: Testler PASS**

Run: `npx vitest run src/components/GlassNavbar/GlassNavbar.test.tsx` → Expected: PASS.

- [ ] **Step 5: Story yaz** — `src/components/GlassNavbar/GlassNavbar.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassNavbar } from './GlassNavbar'

const meta = {
  title: 'Components/GlassNavbar',
  component: GlassNavbar,
  parameters: { layout: 'fullscreen' },
  args: { onBack: fn() },
} satisfies Meta<typeof GlassNavbar>

export default meta
type Story = StoryObj<typeof meta>

const ScrollContent = () => (
  <div style={{ padding: '24px 16px', maxWidth: 640, margin: '0 auto' }}>
    {Array.from({ length: 24 }, (_, i) => (
      <p key={i} style={{ fontSize: 17, lineHeight: 1.6, margin: '0 0 20px' }}>
        {i + 1}. paragraf — bar'ın altından kayarken kenarında kademeli olarak
        bulanıklaşıp arka plana erimeli (scroll edge effect). Sert bir çizgi
        görünmemeli.
      </p>
    ))}
  </div>
)

export const WithBackAndActions: Story = {
  args: {
    title: 'Ayarlar',
    backLabel: 'Geri',
    actions: (
      <>
        <button>Paylaş</button>
        <button>Düzenle</button>
      </>
    ),
  },
  render: (args) => (
    <div style={{ height: '100vh', overflowY: 'auto' }}>
      <GlassNavbar {...args} />
      <ScrollContent />
    </div>
  ),
}

export const TitleOnly: Story = {
  args: { title: 'Kitaplık', onBack: undefined },
  render: WithBackAndActions.render,
}
```

- [ ] **Step 6: Doğrula + commit**

Run: `npx vitest run && npm run build-storybook` → Expected: tümü PASS + build hatasız. Chrome'da gözle: içerik bar'ın altından kayarken kademeli eriyor mu, geri pill'i basınca sıvılaşıyor mu, action grubu tek cam pill mi.

```bash
git add -A && git commit -m "feat: GlassNavbar, GlassBackButton ve soft scroll edge effect"
```

---

### Task 12: Kütüphane girişi + final doğrulama

**Files:**
- Create: `src/index.ts`, `src/App.tsx`'i vitrin sayfasına çevir (Modify)
- Modify: `README.md`

**Interfaces:**
- Consumes: tüm önceki task'lar
- Produces: `src/index.ts` — kütüphanenin tek public giriş noktası

- [ ] **Step 1: Public API'yi topla** — `src/index.ts`

```ts
export { GlassSurface, GlassTierProvider, useGlassTier, type GlassSurfaceProps } from './components/GlassSurface'
export { GlassButton, type GlassButtonProps } from './components/GlassButton'
export { GlassNavbar, GlassBackButton, type GlassNavbarProps, type GlassBackButtonProps } from './components/GlassNavbar'
export { useGlassPress } from './motion/useGlassPress'
export { presets } from './motion/presets'
export { detectTier, type GlassTier } from './core/tier'
```

- [ ] **Step 2: App.tsx'i mini vitrine çevir** (Vite dev server'da hızlı manuel test için) — `src/App.tsx`:

```tsx
import { GlassButton, GlassNavbar } from './index'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#ff9a9e,#a18cd1,#8fd3f4)' }}>
      <GlassNavbar title="liquid-glass-ui" onBack={() => history.back()} backLabel="Geri" actions={<button>Paylaş</button>} />
      <div style={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
        <GlassButton size="xl" onClick={() => {}}>Bas ve sıvılaşmayı izle</GlassButton>
      </div>
    </div>
  )
}
```

`src/App.css` içeriğini boşalt (çakışan şablon stilleri): dosyayı `/* liquid-glass-ui demo */` tek satırına indir. `src/index.css`'te yalnız `* { box-sizing: border-box } body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif }` kalsın.

- [ ] **Step 3: README yaz** — kısa: ne olduğu, kurulum (`npm i && npm run storybook`), tarayıcı tier tablosu, component listesi, spec/plan linkleri.

- [ ] **Step 4: Final doğrulama**

Run: `npx tsc --noEmit && npx vitest run && npm run build-storybook` → Expected: üçü de hatasız; tüm testler PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: public API, demo vitrini ve README"
```

---

## Self-Review Notları

- **Spec kapsaması:** core motor (Task 3-7), GlassSurface (8), animasyon presetleri (9), GlassButton (10), GlassNavbar + scroll edge (11), Storybook + arka plan + forceTier (2, 8), hata yönetimi (`getDisplacementMap`/`getSpecularMap` null dönüşleri, fallback her zaman altta), test stratejisi (saf matematik unit testli; canvas/refraction görsel doğrulama Chrome'da) — tamam. Kapsam dışı listesi spec ile aynı.
- **Tip tutarlılığı:** `GlassTier`, `BezelProfile`, `DisplacementMapResult`, `useGlassPress` dönüş şekli task'lar arasında birebir aynı isimlerle kullanıldı.
- **Bilinen riskler (uygulayıcıya):** (1) kırılma yönü işareti görsel doğrulamada ters çıkabilir — tek satır düzeltme Task 8 Step 8'de tarif edildi; (2) `motion.button` + `as` prop TS uyumsuzluğu çıkarsa çözüm Task 10 Step 3 notunda; (3) Storybook CLI çıktısı sürümle değişebilir — main.ts/preview.tsx'i plandaki içerikle üzerine yaz.
