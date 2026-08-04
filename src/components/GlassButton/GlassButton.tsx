import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassButton.module.css'

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tint?: string
  prominent?: boolean
  tone?: 'light' | 'dark' | 'auto'
  /**
   * Malzeme ekseni (bkz. EksenlerVeDurumlar.mdx). `'glass'` varsayılandır ve
   * butonu kontrol katmanına taşır; `'flat'` aynı eylem dilini cam AÇMADAN
   * çizer.
   *
   * `'flat'` bir stil tercihi değil **katman kararıdır**: sayfa başına cam
   * bütçesi altıdır (GenelBakis.mdx) ve içerik katmanındaki bir yaprağın
   * içinde duran buton camı hak etmez. Bu eksen açılmadan önce böyle her
   * buton feature CSS'inde elle çiziliyordu ve her biri kendi rengini
   * uyduruyordu.
   */
  material?: 'glass' | 'flat'
  /** Async işlem sürerken: tekrar aktivasyon engellenir, genişlik korunur, aria-busy verilir */
  loading?: boolean
}

export function GlassButton({
  size = 'md',
  tint,
  prominent = false,
  tone = 'auto',
  material = 'glass',
  loading = false,
  className,
  style,
  children,
  disabled,
  type = 'button',
  onClick,
  ...rest
}: GlassButtonProps) {
  const press = useGlassPress({ disabled: disabled || loading })

  const classes = [
    styles.button,
    styles[size],
    tint && !prominent ? styles.tinted : '',
    prominent ? styles.prominent : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // `--lg-action-tint` eylem dilinin ton kancasıdır: karışım oranı ve kontrast
  // kuralı token'da kalır, kontrol yalnız hangi rengin tonlanacağını söyler.
  const cssVars: CSSProperties = tint
    ? ({ '--glass-tint': tint, '--lg-action-tint': tint } as CSSProperties)
    : {}

  return (
    <GlassSurface
      as={motion.button}
      shape="capsule"
      interactive
      material={material}
      tone={tone}
      thickness={0.35}
      displacementScale={press.displacementScale}
      className={classes}
      style={{ ...cssVars, color: prominent ? 'var(--lg-accent-contrast)' : undefined, scale: press.transformScale, ...style } as CSSProperties}
      {...press.handlers}
      {...({
        disabled,
        type,
        onClick: loading || disabled ? undefined : onClick,
        'aria-busy': loading || undefined,
        'data-loading': loading || undefined,
        ...rest,
      } as unknown as GlassSurfaceProps)}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
      <span className={styles.label}>{children}</span>
    </GlassSurface>
  )
}
