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
  data: Uint8ClampedArray<ArrayBuffer>
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
