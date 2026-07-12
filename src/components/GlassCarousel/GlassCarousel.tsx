import { useCallback, useRef, type HTMLAttributes } from 'react'
import { GlassIconButton } from '../GlassIconButton'
import styles from './GlassCarousel.module.css'

export interface GlassCarouselProps extends HTMLAttributes<HTMLDivElement> {
  /** Erişilebilirlik için bölge etiketi */
  label?: string
  tone?: 'light' | 'dark' | 'auto'
}

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 5l7 7-7 7" />
  </svg>
)

export function GlassCarousel({ label = 'İçerik şeridi', tone = 'auto', className, children, ...rest }: GlassCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollBy = useCallback((direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }, [])

  return (
    <div
      role="region"
      aria-label={label}
      className={[styles.carousel, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div ref={trackRef} className={styles.track}>
        {children}
      </div>
      <div className={`${styles.nav} ${styles.navLeft}`}>
        <GlassIconButton label="Geri kaydır" tone={tone} onClick={() => scrollBy(-1)}>
          <ChevronLeft />
        </GlassIconButton>
      </div>
      <div className={`${styles.nav} ${styles.navRight}`}>
        <GlassIconButton label="İleri kaydır" tone={tone} onClick={() => scrollBy(1)}>
          <ChevronRight />
        </GlassIconButton>
      </div>
    </div>
  )
}
