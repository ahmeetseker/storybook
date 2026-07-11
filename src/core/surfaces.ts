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
