// Yıldızlı gece kartı — "Glowing Stars" deseninin Kağıt temaya uyarlanmış
// hali: mürekkep (--lg-label) tonlu koyu zeminin TAMAMINI kaplayan 18
// sütunluk yıldız matrisi; içerik yıldızların üstünde durur. Boşta her 3
// sn'de birkaç yıldız yavaşça nefes alır (sert yanıp sönme yok); imleç ya
// da klavye odağı karta gelince matris kademeli tutuşur. İçerik katmanı:
// cam DEĞİL, koyu düz yüzey — sayfa başına cam bütçesini harcamaz.
import {
  useEffect,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import styles from './GlassStarsCard.module.css'

const STAR_COUNT = 216
const COLUMN_COUNT = 18
const TWINKLE_INTERVAL_MS = 3000
const TWINKLE_BATCH = 5

export interface GlassStarsCardProps extends HTMLAttributes<HTMLElement> {
  /** Kök elementin türü; kart bir liste öğesiyse `article` önerilir. Default: `div` */
  as?: 'div' | 'article' | 'section'
  children?: ReactNode
}

/**
 * Yıldızlı gece kartı. hover/focus prop olmaz; tutuşma imleç ve
 * `focus-within` ile kendiliğinden gerçekleşir. `prefers-reduced-motion`
 * açıkken kırpışma durur, yıldızlar animasyonsuz son hallerinde çizilir.
 */
export function GlassStarsCard({
  as: Tag = 'div',
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}: GlassStarsCardProps) {
  const [ignited, setIgnited] = useState(false)

  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    setIgnited(true)
    onMouseEnter?.(event)
  }
  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    setIgnited(false)
    onMouseLeave?.(event)
  }
  // Klavye eşdeğeri: karttaki bir aksiyona odaklanınca da matris tutuşur.
  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    setIgnited(true)
    onFocus?.(event)
  }
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIgnited(false)
    onBlur?.(event)
  }

  return (
    <Tag
      {...rest}
      className={[styles.card, className].filter(Boolean).join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <StarField ignited={ignited} />
      <div className={styles.body}>{children}</div>
    </Tag>
  )
}

/** Kart başlığı — koyu zeminde fildişi; `<h3>` olarak çizilir. */
export function GlassStarsCardTitle({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return <h3 className={[styles.title, className].filter(Boolean).join(' ')}>{children}</h3>
}

/** Başlık altı kısa açıklama; ölçüsü okuma genişliğiyle sınırlıdır. */
export function GlassStarsCardDescription({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return <p className={[styles.description, className].filter(Boolean).join(' ')}>{children}</p>
}

function StarField({ ignited }: { ignited: boolean }) {
  const reducedMotion = useReducedMotion()
  const [glowingStars, setGlowingStars] = useState<number[]>([])

  useEffect(() => {
    if (reducedMotion) return
    const interval = setInterval(() => {
      setGlowingStars(
        Array.from({ length: TWINKLE_BATCH }, () => Math.floor(Math.random() * STAR_COUNT)),
      )
    }, TWINKLE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [reducedMotion])

  return (
    <div
      className={styles.starField}
      style={{ gridTemplateColumns: `repeat(${COLUMN_COUNT}, 1fr)` }}
      aria-hidden
    >
      {Array.from({ length: STAR_COUNT }, (_, starIdx) => {
        const isGlowing = ignited || glowingStars.includes(starIdx)
        const delay = ignited ? starIdx * 0.005 : (starIdx % 10) * 0.1
        return (
          <div key={starIdx} className={styles.cell}>
            <Star isGlowing={isGlowing} delay={delay} instant={Boolean(reducedMotion)} />
            <AnimatePresence>
              {isGlowing ? <Glow delay={delay} instant={Boolean(reducedMotion)} /> : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// Kaynak desendeki background-color animasyonu bilinçli olarak opaklığa
// çevrildi: sistem yalnız transform/opacity/filter animasyonuna izin verir.
// Genlik küçük, süre uzun tutulur: yıldız "yanıp sönmez", nefes alır —
// sönük hal bile görünür kalır (opacity 0.45), içerik okunurluğunu bozmaz.
function Star({
  isGlowing,
  delay,
  instant,
}: {
  isGlowing: boolean
  delay: number
  instant: boolean
}) {
  return (
    <motion.div
      className={styles.star}
      animate={
        instant
          ? { scale: isGlowing ? 1.4 : 1, opacity: isGlowing ? 0.95 : 0.45 }
          : {
              scale: isGlowing ? [1, 1.15, 1.8, 1.6, 1.35] : 1,
              opacity: isGlowing ? 0.95 : 0.45,
            }
      }
      transition={instant ? { duration: 0 } : { duration: 3, ease: 'easeInOut', delay }}
    />
  )
}

function Glow({ delay, instant }: { delay: number; instant: boolean }) {
  return (
    <motion.div
      className={styles.glow}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={instant ? { duration: 0 } : { duration: 3, ease: 'easeInOut', delay }}
    />
  )
}
