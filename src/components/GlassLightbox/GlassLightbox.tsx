import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, motion, useMotionValue, type PanInfo } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import { GlassIconButton } from '../GlassIconButton'
import styles from './GlassLightbox.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/* Şerit genişlikleri motion tarafından sürülür, bu yüzden CSS'te değil burada
   yaşar (tek kaynak). Dokunmatikte daralmış kare 44px hedefin altına inmez. */
const THUMB_FULL_PX = 120
const THUMB_COLLAPSED_PX = 36
const THUMB_COLLAPSED_COARSE_PX = 44
const THUMB_ACTIVE_MARGIN_PX = 2

/** Hızlı fırlatma eşiği: bunun üstündeki yatay hız kaydırma mesafesine bakmaz. */
const SWIPE_VELOCITY = 500
/** Yavaş sürüklemede kare değiştirme eşiği: sahne genişliğinin oranı. */
const SWIPE_OFFSET_RATIO = 0.3

export interface GlassLightboxImage {
  src: string
  alt: string
}

export interface GlassLightboxProps {
  /** Kontrollü görünürlük — lightbox yalnız controlled çalışır */
  open: boolean
  /** Kapatma isteği (Escape, backdrop, Kapat butonu) — state'i çağıran günceller */
  onClose: () => void
  images: GlassLightboxImage[]
  /** Controlled aktif kare; verilirse indeks tamamen çağıranındır */
  index?: number
  /** Uncontrolled başlangıç karesi; her açılışta bu kareye dönülür */
  defaultIndex?: number
  /** Her gezinmede (ok butonu, ok tuşu, thumbnail, sürükleme) çağrılır */
  onIndexChange?: (index: number) => void
  /** Dialog adının başına eklenen bağlam, ör. `İlan görselleri` */
  label?: string
  /** Şeridin altında görünen açıklama satırı; `aria-describedby` ile bağlanır */
  note?: ReactNode
  /** Alt thumbnail şeridi (tek görselde zaten çizilmez) */
  thumbnails?: boolean
  className?: string
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

/**
 * Tam ekran görsel görüntüleyici — karartılmış katman üstünde tek kare.
 *
 * Overlay sözleşmesi Modal/Drawer/Toast ile ortaktır: `createPortal` ile
 * `document.body`, `role="dialog"` + `aria-modal`, Tab'ı içeride tutan focus
 * trap, `body` scroll kilidi ve kapanışta odağın tetikleyiciye dönüşü.
 *
 * Sahne **cam değildir**: karartma zaten bir katmandır, üstüne cam gelmez
 * (bkz. GenelBakis "cam üstüne cam yok"). Kontroller — ok, kapat — cam kalır.
 *
 * İndeks controlled (`index`) ya da uncontrolled (`defaultIndex`) sürülebilir;
 * ok/klavye gezinmesi uçlarda sarar, sürükleme uçlarda kıstırır (sarma bir
 * sürükleme jestinde ekranı ters yöne uçururdu) ve her ikisi `onIndexChange`
 * çağırır. Aktif thumbnail film şeridi gibi genişler; komşuları daralır.
 */
export function GlassLightbox({
  open,
  onClose,
  images,
  index,
  defaultIndex = 0,
  onIndexChange,
  label,
  note,
  thumbnails = true,
  className,
}: GlassLightboxProps) {
  const count = images.length
  const clamp = useCallback(
    (value: number) => (count === 0 ? 0 : Math.min(Math.max(value, 0), count - 1)),
    [count],
  )

  const controlled = index !== undefined
  const [inner, setInner] = useState(() => clamp(defaultIndex))
  const [dragging, setDragging] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)
  // Sürükleme sonrası tetiklenen click kapatma sayılmaz; jest jesttir.
  const draggedRef = useRef(false)
  const openedRef = useRef(false)
  const noteId = useId()
  const reduced = prefersReducedMotion()
  const coarse =
    typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches
  const thumbCollapsed = coarse ? THUMB_COLLAPSED_COARSE_PX : THUMB_COLLAPSED_PX

  const current = clamp(controlled ? (index as number) : inner)

  // Sahne yatay bir ray üstünde kayar: x, aktif karenin negatif ofsetidir.
  const x = useMotionValue(0)

  // Uncontrolled kullanımda her AÇILIŞ başlangıç karesine döner: kapanmış bir
  // görüntüleyici, bir önceki oturumun indeksini saklamaz.
  useEffect(() => {
    if (!open || controlled) return
    setInner(clamp(defaultIndex))
  }, [open, controlled, defaultIndex, clamp])

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return
      const wrapped = (next + count) % count
      if (!controlled) setInner(wrapped)
      onIndexChange?.(wrapped)
    },
    [count, controlled, onIndexChange],
  )

  // Ray aktif kareye oturur. Açılış anında sıçrayarak (animasyonsuz) yerine
  // gelir; sonraki indeks değişimleri yayla kayar. Sürükleme sürerken el
  // raydadır, animasyon araya girmez — jest bitince buraya döner.
  useEffect(() => {
    if (!open) {
      openedRef.current = false
      return
    }
    const width = stageRef.current?.offsetWidth ?? 0
    const target = -current * width
    if (!openedRef.current) {
      openedRef.current = true
      x.jump(target)
      return
    }
    if (dragging) return
    const controls = animate(
      x,
      target,
      reduced
        ? { duration: 0.15, ease: 'easeOut' }
        : { type: 'spring', ...presets.springs.sidebar },
    )
    return () => controls.stop()
  }, [open, current, dragging, reduced, x])

  // Pencere boyutu değişince ray animasyonsuz yeniden hizalanır.
  useEffect(() => {
    if (!open) return
    const onResize = () => x.jump(-current * (stageRef.current?.offsetWidth ?? 0))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open, current, x])

  const onDragStart = () => {
    setDragging(true)
    draggedRef.current = true
  }

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    setDragging(false)
    const width = stageRef.current?.offsetWidth || 1
    let next = current
    if (Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
      next = info.velocity.x > 0 ? current - 1 : current + 1
    } else if (Math.abs(info.offset.x) > width * SWIPE_OFFSET_RATIO) {
      next = info.offset.x > 0 ? current - 1 : current + 1
    }
    // Sürükleme uçlarda SARMAZ, kıstırır: ilk karede sağa çekmek geri yaylanır.
    next = clamp(next)
    if (next !== current) goTo(next)
    // Jest sonrası click aynı frame'de gelmez; bir tık sonra temizlenir.
    setTimeout(() => {
      draggedRef.current = false
    }, 0)
  }

  // Escape kapatır, ok tuşları gezinir. Dinleyici pencere düzeyindedir: odak
  // hangi kontrolde olursa olsun klavye gezinmesi aynı çalışır.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (count < 2) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(current - 1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goTo(current + 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, count, current, goTo, onClose])

  // Scroll kilidi + açılış focus'u + kapanışta tetikleyiciye geri dönüş.
  // Cleanup hem open=false olduğunda hem unmount'ta çalışır.
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  // Aktif thumbnail şeritte ortalanır (uzun galeride kaymayı sürdürür).
  useEffect(() => {
    if (!open) return
    activeThumbRef.current?.scrollIntoView?.({ block: 'nearest', inline: 'center' })
  }, [open, current])

  // Basit focus trap: Tab son elemandan ilkine (ve tersine) sarar.
  const onDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const dialog = dialogRef.current
    if (!dialog) return
    const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) {
      event.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (typeof document === 'undefined') return null

  const image = count > 0 ? images[current] : undefined
  const dialogName = image
    ? `${label ? `${label} · ` : ''}Görsel ${current + 1} / ${count}: ${image.alt}`
    : (label ?? 'Görsel')

  return createPortal(
    <AnimatePresence>
      {open && image ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={dialogName}
          aria-describedby={note ? noteId : undefined}
          tabIndex={-1}
          className={[styles.lightbox, className].filter(Boolean).join(' ')}
          onKeyDown={onDialogKeyDown}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.12 : 0.2 }}
        >
          <div className={styles.stage} ref={stageRef}>
            {/* Ray bütün kareleri yan yana taşır; drag yalnız çok karede açık.
                Boş kare alanına tıklama kapatır (sürükleme jesti hariç),
                görselin kendisine tıklama kapatmaz. */}
            <motion.div
              className={styles.track}
              drag={count > 1 ? 'x' : false}
              dragElastic={0.2}
              dragMomentum={false}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              style={{ x }}
            >
              {images.map((item, i) => (
                <div
                  key={`${item.src}-${i}`}
                  className={styles.frame}
                  aria-hidden={i === current ? undefined : true}
                  onClick={(event) => {
                    if (event.target === event.currentTarget && !draggedRef.current) onClose()
                  }}
                >
                  <img
                    className={styles.image}
                    src={item.src}
                    alt={item.alt}
                    loading={i === current ? undefined : 'lazy'}
                    draggable={false}
                  />
                </div>
              ))}
            </motion.div>

            {count > 1 ? (
              <>
                <div className={`${styles.nav} ${styles.navLeft}`}>
                  <GlassIconButton label="Önceki görsel" size="lg" tone="light" onClick={() => goTo(current - 1)}>
                    <ChevronLeft />
                  </GlassIconButton>
                </div>
                <div className={`${styles.nav} ${styles.navRight}`}>
                  <GlassIconButton label="Sonraki görsel" size="lg" tone="light" onClick={() => goTo(current + 1)}>
                    <ChevronRight />
                  </GlassIconButton>
                </div>
              </>
            ) : null}
          </div>

          <div className={styles.close}>
            <GlassIconButton label="Kapat" tone="light" onClick={onClose}>
              <CloseIcon />
            </GlassIconButton>
          </div>

          <div className={styles.footer}>
            {count > 1 ? (
              <span className={styles.counter}>
                {current + 1} / {count}
              </span>
            ) : null}

            {thumbnails && count > 1 ? (
              <div className={styles.thumbs}>
                {images.map((item, i) => (
                  <motion.button
                    key={`${item.src}-${i}`}
                    ref={i === current ? activeThumbRef : undefined}
                    type="button"
                    className={[styles.thumb, i === current ? styles.thumbActive : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => goTo(i)}
                    aria-label={`${i + 1}. görsele git: ${item.alt}`}
                    aria-current={i === current}
                    initial={false}
                    animate={
                      i === current
                        ? {
                            width: THUMB_FULL_PX,
                            marginLeft: THUMB_ACTIVE_MARGIN_PX,
                            marginRight: THUMB_ACTIVE_MARGIN_PX,
                          }
                        : { width: thumbCollapsed, marginLeft: 0, marginRight: 0 }
                    }
                    transition={reduced ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
                  >
                    {/* Thumb dekoratiftir: adı butonun aria-label'ındadır. */}
                    <img className={styles.thumbImage} src={item.src} alt="" loading="lazy" draggable={false} />
                  </motion.button>
                ))}
              </div>
            ) : null}

            {note ? (
              <p id={noteId} className={styles.note}>
                {note}
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
