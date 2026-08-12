import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassSwitch.module.css'

export interface GlassSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Controlled durum */
  checked?: boolean
  /** Uncontrolled başlangıç durumu */
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  /**
   * Erişilebilirlik etiketi (aria-label). Switch'in görünen çocuğu yoktur;
   * `label` vermezsen `aria-label`'ı rest üzerinden geçirmek ZORUNDASIN.
   */
  label?: string
  size?: 'sm' | 'md'
  /** Açıkken ray vurgusu; verilmezse `--lg-accent` */
  tint?: string
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassSwitch({
  checked,
  defaultChecked,
  onChange,
  label,
  size = 'md',
  tint,
  tone = 'auto',
  disabled,
  className,
  style,
  onClick,
  onKeyDown,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...rest
}: GlassSwitchProps) {
  // Kontrollü/kontrolsüz kalıbı (GlassTabs ile aynı)
  const [inner, setInner] = useState(defaultChecked ?? false)
  const isChecked = checked ?? inner
  const reduced = prefersReducedMotion()

  // Sıvı basış (Apple liquid glass): basılı tutarken thumb cama dönüp hareket
  // yönüne uzar; toggle sonrası süzülme boyunca cam kalır, varınca beyaza döner.
  // `pressed` parmağın raydaki anı, `traveling` FLIP süzülüşünün ömrüdür.
  const [pressed, setPressed] = useState(false)
  const [traveling, setTraveling] = useState(false)

  // Emniyet: layout animasyonu hiç koşmazsa (ör. controlled parent değeri
  // yutarsa) cam durum asılı kalmasın — spring ömründen uzun bir tavanla kapat.
  useEffect(() => {
    if (!traveling) return
    const t = setTimeout(() => setTraveling(false), 700)
    return () => clearTimeout(t)
  }, [traveling])

  const toggle = () => {
    if (disabled) return
    if (!reduced) setTraveling(true)
    if (checked === undefined) setInner(!isChecked)
    onChange?.(!isChecked)
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    toggle()
  }

  // Space/Enter'ı manuel yönetiyoruz: preventDefault native click'i bastırır,
  // böylece tarayıcıda çift tetikleme olmaz ve davranış her ortamda deterministiktir.
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e)
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }

  // Kapsülün kendisi de basınca sıvılaşır (GlassButton ile aynı dil):
  // lens kırılması artar, gövde jöle yayıyla hafifçe çöker — Apple'ın
  // Denetim Merkezi'ndeki "hafif efekt" budur.
  const press = useGlassPress({ disabled })

  // Mercek yaşam döngüsü (GlassSlider ile aynı gerekçe): gerçek refraction
  // sürekli DOM'da durmaz; basışta/süzülüşte kurulur, sonra sökülür.
  const liquid = pressed || traveling
  const [lensAlive, setLensAlive] = useState(false)
  useEffect(() => {
    if (liquid) {
      setLensAlive(true)
      return
    }
    if (!lensAlive) return
    const t = setTimeout(() => setLensAlive(false), 320)
    return () => clearTimeout(t)
  }, [liquid, lensAlive])

  const setPress = (next: boolean) => {
    if (disabled || reduced) return
    setPressed(next)
  }
  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(e)
    press.handlers.onPointerDown()
    setPress(true)
  }
  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerUp?.(e)
    press.handlers.onPointerUp()
    setPress(false)
  }
  const handlePointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(e)
    press.handlers.onPointerLeave()
    setPress(false)
  }
  const handlePointerCancel = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerCancel?.(e)
    press.handlers.onPointerCancel()
    setPress(false)
  }

  const cssVars: CSSProperties = tint ? ({ '--glass-tint': tint } as CSSProperties) : {}
  const classes = [styles.root, styles[size], isChecked ? styles.on : '', className].filter(Boolean).join(' ')

  return (
    <GlassSurface
      as={motion.button}
      shape="capsule"
      interactive={!disabled}
      tone={tone}
      thickness={0.25}
      displacementScale={press.displacementScale}
      className={classes}
      style={{ ...cssVars, scale: press.transformScale, ...style } as CSSProperties}
      {...({
        type: 'button',
        role: 'switch',
        'aria-checked': isChecked,
        'aria-label': label,
        disabled,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerLeave,
        onPointerCancel: handlePointerCancel,
        ...rest,
      } as unknown as GlassSurfaceProps)}
    >
      <span className={styles.track}>
        {/* Thumb, layout animasyonuyla kayar: justify-content değişimini spring izler.
            data-liquid cam görünümü, data-pressed kapsül uzamasını taşır — ikisi de
            CSS'te yaşar, layout FLIP genişleme/dönüşü de springle animasyonlar. */}
        <motion.span
          className={styles.thumb}
          data-liquid={liquid || undefined}
          data-pressed={pressed || undefined}
          layout
          onLayoutAnimationComplete={() => setTraveling(false)}
          transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
          aria-hidden
        >
          {/* Gerçek mercek: rayı büken displacement filtresi — beyaz kapak
              (::after) basılıyken sönerek altındaki camı gösterir */}
          {lensAlive ? (
            <GlassSurface
              as="span"
              shape="capsule"
              thickness={1}
              className={styles.lens}
              style={{ position: 'absolute', inset: 0 }}
            />
          ) : null}
        </motion.span>
      </span>
    </GlassSurface>
  )
}
