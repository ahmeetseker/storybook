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
