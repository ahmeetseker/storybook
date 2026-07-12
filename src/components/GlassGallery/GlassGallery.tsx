import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { GlassSurface } from '../GlassSurface'
import { GlassIconButton } from '../GlassIconButton'
import styles from './GlassGallery.module.css'

export interface GlassGalleryImage {
  src: string
  alt: string
}

export interface GlassGalleryProps extends HTMLAttributes<HTMLDivElement> {
  images: GlassGalleryImage[]
  /** Ana görsel alanının en-boy oranı (CSS aspect-ratio) */
  aspectRatio?: string
  initialIndex?: number
  onIndexChange?: (index: number) => void
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

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export function GlassGallery({
  images,
  aspectRatio = '4 / 3',
  initialIndex = 0,
  onIndexChange,
  tone = 'auto',
  className,
  ...rest
}: GlassGalleryProps) {
  const [index, setIndex] = useState(() => Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)))
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback(
    (next: number) => {
      if (images.length === 0) return
      const clamped = (next + images.length) % images.length
      setIndex(clamped)
      onIndexChange?.(clamped)
    },
    [images.length, onIndexChange],
  )

  useEffect(() => {
    if (!lightboxOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') goTo(index - 1)
      if (e.key === 'ArrowRight') goTo(index + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    dialogRef.current?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxOpen, index, goTo])

  if (images.length === 0) return null
  const current = images[index]

  const lightbox = lightboxOpen
    ? createPortal(
        <div
          ref={dialogRef}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Görsel ${index + 1} / ${images.length}: ${current.alt}`}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false)
          }}
        >
          <img className={styles.lightboxImage} src={current.src} alt={current.alt} />
          <div className={styles.lightboxClose}>
            <GlassIconButton label="Kapat" tone="light" onClick={() => setLightboxOpen(false)}>
              <CloseIcon />
            </GlassIconButton>
          </div>
          {images.length > 1 && (
            <>
              <div className={`${styles.lightboxNav} ${styles.navLeft}`}>
                <GlassIconButton label="Önceki görsel" size="lg" tone="light" onClick={() => goTo(index - 1)}>
                  <ChevronLeft />
                </GlassIconButton>
              </div>
              <div className={`${styles.lightboxNav} ${styles.navRight}`}>
                <GlassIconButton label="Sonraki görsel" size="lg" tone="light" onClick={() => goTo(index + 1)}>
                  <ChevronRight />
                </GlassIconButton>
              </div>
            </>
          )}
          <span className={styles.lightboxCounter}>
            {index + 1} / {images.length}
          </span>
        </div>,
        document.body,
      )
    : null

  return (
    <div className={[styles.gallery, className].filter(Boolean).join(' ')} {...rest}>
      <GlassSurface as="div" shape={20} tone={tone} thickness={0.4} className={styles.stage}>
        <button
          type="button"
          className={styles.stageButton}
          style={{ aspectRatio }}
          onClick={() => setLightboxOpen(true)}
          aria-label={`Görseli büyüt: ${current.alt}`}
        >
          <img className={styles.stageImage} src={current.src} alt={current.alt} />
        </button>
        {images.length > 1 && (
          <>
            <div className={`${styles.stageNav} ${styles.navLeft}`}>
              <GlassIconButton label="Önceki görsel" onClick={() => goTo(index - 1)}>
                <ChevronLeft />
              </GlassIconButton>
            </div>
            <div className={`${styles.stageNav} ${styles.navRight}`}>
              <GlassIconButton label="Sonraki görsel" onClick={() => goTo(index + 1)}>
                <ChevronRight />
              </GlassIconButton>
            </div>
            <span className={styles.counter}>
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </GlassSurface>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              type="button"
              className={[styles.thumb, i === index ? styles.thumbActive : ''].filter(Boolean).join(' ')}
              onClick={() => goTo(i)}
              aria-label={`${i + 1}. görsele git: ${img.alt}`}
              aria-current={i === index}
            >
              <img className={styles.thumbImage} src={img.src} alt="" />
            </button>
          ))}
        </div>
      )}
      {lightbox}
    </div>
  )
}
