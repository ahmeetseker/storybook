import { useId, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import type { MotionValue } from 'motion/react'
import { getDisplacementMap } from '../../core/displacementMap'
import { getSpecularMap } from '../../core/specularMap'
import { GlassFilter } from '../../core/GlassFilter'
import { exceedsRefractionArea, prefersReducedTransparency } from '../../core/tier'
import { useGlassTier } from './GlassTierContext'
import { useElementSize } from './useElementSize'
import styles from './GlassSurface.module.css'

export interface GlassSurfaceProps extends HTMLAttributes<HTMLElement> {
  variant?: 'regular' | 'clear'
  /**
   * 'glass': cam malzeme (backdrop-filter + refraction) — navigasyon/kontrol katmanı için.
   * 'flat': opak, filtresiz yüzey — içerik katmanı için (compositor maliyeti yok).
   */
  material?: 'glass' | 'flat'
  /**
   * 0–1: lensing gücünü ve backdrop blur'unu birlikte ölçekler (Apple'ın kalınlık kuralı).
   * Dış gölge bu eksene bağlı değildir; yükselti `--lg-surface-shadow` ile verilir.
   */
  thickness?: number
  shape?: number | 'capsule'
  tone?: 'light' | 'dark' | 'auto'
  interactive?: boolean
  /** Basınç animasyonu için dışarıdan verilen çarpan (1 = normal) */
  displacementScale?: MotionValue<number>
  as?: ElementType
  children?: ReactNode
}

// useId, aynı React kökü içinde benzersizdir; ama Storybook docs sayfaları birden fazla
// React kökü render eder ve bu kökler arasında useId çakışabilir → yanlış filtre uygulanır.
// Modül seviyesinde bir sayaç ekleyerek kökler arası tekilliği garanti ediyoruz.
let instanceCounter = 0

export function GlassSurface({
  variant = 'regular',
  material = 'glass',
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
  const instanceId = useRef<number>(undefined)
  if (instanceId.current === undefined) instanceId.current = ++instanceCounter
  const filterId = `glass-${rawId.replace(/[^a-zA-Z0-9-]/g, '')}-${instanceId.current}`
  const { ref, size } = useElementSize<HTMLElement>()

  const radius = shape === 'capsule' ? (size ? size.height / 2 : 999) : shape
  const frosted = prefersReducedTransparency()

  let filterNode: ReactNode = null
  let backdrop = `blur(${(2 + thickness * 10).toFixed(1)}px) saturate(180%)`

  if (material === 'glass' && tier === 'refraction' && size && !frosted && !exceedsRefractionArea(size.width, size.height)) {
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
  const materialClass = material === 'flat' ? styles.flat : ''
  const surfaceStyle: CSSProperties = {
    borderRadius: radius,
    ...(material === 'glass'
      ? {
          backdropFilter: backdrop,
          WebkitBackdropFilter: backdrop,
        }
      : null),
    cursor: interactive ? 'pointer' : undefined,
    touchAction: interactive ? 'manipulation' : undefined,
    ...style,
  }

  return (
    <Comp
      ref={ref}
      className={[styles.surface, materialClass, toneClass, className].filter(Boolean).join(' ')}
      style={surfaceStyle}
      data-material={material}
      {...rest}
    >
      {material === 'glass' ? filterNode : null}
      {material === 'glass' && variant === 'clear' ? <span className={styles.dimming} data-glass-dimming /> : null}
      <span className={styles.content}>{children}</span>
    </Comp>
  )
}
