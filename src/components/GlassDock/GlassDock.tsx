// GlassDock — varsayılan olarak sürekli açık ikon gezinmesi.
// `behavior="morph"` legacy Dynamic Island peek↔dock aç/kapa davranışını
// korur. Açık ray, public-site LiquidDock referansındaki cursor takipli
// magnification + hareketli edge-lens davranışını kullanır.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributeAnchorTarget,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import { GlassSurface, GlassTierProvider } from '../GlassSurface'
import styles from './GlassDock.module.css'

/** Dock'taki tek bir gezinme öğesi. */
export interface GlassDockItem {
  key: string
  /** Erişilebilir ad + hover tooltip metni */
  label: string
  icon: ReactNode
  /** Verildiğinde öğe gerçek bağlantı olarak render edilir. */
  href?: string
  target?: HTMLAttributeAnchorTarget
  rel?: string
  onSelect?: () => void
  /** Geçerli sayfa göstergesi — arkasında kalıcı aktif yüzeyi çizilir */
  active?: boolean
  /** @deprecated Grup etiketleri artık render edilmez; geriye uyumluluk için geçici olarak korunur. */
  group?: string
}

export interface GlassDockProps {
  items: GlassDockItem[]
  /** Yerleşim: yatay = alt-orta, dikey = sağ-orta (viewport'a sabit) */
  orientation?: 'horizontal' | 'vertical'
  /** `fixed`: sürekli açık LiquidDock nav; `morph`: legacy peek↔nav davranışı */
  behavior?: 'fixed' | 'morph'
  /** Yalnız `behavior="morph"` için controlled açık/kapalı durumu */
  open?: boolean
  /** Yalnız `behavior="morph"` için uncontrolled başlangıç durumu */
  defaultOpen?: boolean
  /** Yalnız `behavior="morph"` açma/kapama isteklerinde çağrılır */
  onOpenChange?: (open: boolean) => void
  /** Nav ve morph peek yüzeyinin erişilebilir adı */
  label?: string
  /**
   * Modifiyesiz, aynı sekmeli iç bağlantıları SPA router'a delege eder.
   * Verilmezse bağlantının native gezinme davranışı korunur.
   */
  onRoute?: (href: string) => void
  className?: string
}

// public-site/packages/ui/src/primitives/liquid-glass.tsx ile aynı Dock eğrisi.
const BASE_ICON = 38
const ICON_GAP = 6
const MIN_SCALE = 1
const MAX_SCALE = 1.5
const EFFECT_LENGTH = 180

const baseCenter = (index: number) => index * (BASE_ICON + ICON_GAP) + BASE_ICON / 2

const initialScales = (count: number): number[] =>
  Array.from({ length: count }, () => MIN_SCALE)

const initialPositions = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => baseCenter(index))

function targetScales(mousePosition: number | null, count: number): number[] {
  if (mousePosition === null) return initialScales(count)
  return Array.from({ length: count }, (_, index) => {
    const center = baseCenter(index)
    const minimum = mousePosition - EFFECT_LENGTH / 2
    const maximum = mousePosition + EFFECT_LENGTH / 2
    if (center < minimum || center > maximum) return MIN_SCALE
    const theta = ((center - minimum) / EFFECT_LENGTH) * 2 * Math.PI
    const capped = Math.min(Math.max(theta, 0), 2 * Math.PI)
    const influence = (1 - Math.cos(capped)) / 2
    return MIN_SCALE + influence * (MAX_SCALE - MIN_SCALE)
  })
}

function targetPositions(scales: number[]): number[] {
  let cursor = 0
  return scales.map((scale) => {
    const size = BASE_ICON * scale
    const center = cursor + size / 2
    cursor += size + ICON_GAP
    return center
  })
}

function isUnmodifiedPrimaryClick(
  event: ReactMouseEvent<HTMLAnchorElement>,
  target?: HTMLAttributeAnchorTarget,
): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    (!target || target === '_self')
  )
}

function isInternalHref(href: string): boolean {
  if (href.startsWith('#') || href.startsWith('?')) return true
  if (typeof window === 'undefined') return href.startsWith('/') && !href.startsWith('//')
  try {
    return new URL(href, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

export function GlassDock({
  items,
  orientation = 'horizontal',
  behavior = 'fixed',
  open,
  defaultOpen = false,
  onOpenChange,
  label = 'Gezinme',
  onRoute,
  className,
}: GlassDockProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const isMorph = behavior === 'morph'
  const isOpen = isMorph ? (open ?? innerOpen) : true
  const reduced = prefersReducedMotion()
  const isH = orientation === 'horizontal'
  const rootRef = useRef<HTMLDivElement>(null)
  const peekRef = useRef<HTMLButtonElement>(null)
  const firstItemRef = useRef<HTMLElement>(null)
  const lastMouseMoveTime = useRef(0)
  const [canMagnify, setCanMagnify] = useState(false)
  const [mousePosition, setMousePosition] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [scales, setScales] = useState<number[]>(() => initialScales(items.length))
  const [positions, setPositions] = useState<number[]>(() => initialPositions(items.length))
  const scalesRef = useRef(scales)
  const positionsRef = useRef(positions)

  // Açılış/kapanışta odak hedefi — yalnız gerçek kullanıcı aktivasyonu
  // (peek tıklaması/Enter, Escape, öğe seçimi) odak taşır; hover taşımaz.
  const focusTargetRef = useRef<'item' | 'peek' | null>(null)

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isMorph) return
      if (open === undefined) setInnerOpen(next)
      onOpenChange?.(next)
    },
    [isMorph, open, onOpenChange],
  )

  // LiquidDock büyütmesi yalnız gerçek hover + fine-pointer donanımında
  // çalışır. Sentetik mouse event'leri dokunmatik cihazlarda rayı oynatmaz.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(hover: hover) and (pointer: fine)')
    const apply = () => {
      setCanMagnify(query.matches)
      if (!query.matches) setMousePosition(null)
    }
    apply()
    query.addEventListener?.('change', apply)
    return () => query.removeEventListener?.('change', apply)
  }, [])

  const prevOpenRef = useRef(isOpen)
  useEffect(() => {
    const was = prevOpenRef.current
    prevOpenRef.current = isOpen
    if (was === isOpen) return
    const target = focusTargetRef.current
    focusTargetRef.current = null
    if (isOpen && target === 'item') firstItemRef.current?.focus()
    if (!isOpen && target === 'peek') peekRef.current?.focus()
  }, [isOpen])

  // Dışarı tıklama + Escape yalnız açık morph davranışında aktiftir. Escape
  // ayrıca kök kapsayıcının onKeyDown'unda odaklıyken yakalanıp odak iadesi
  // yapar; document dinleyicisi odak dışarıdayken de kapanmayı sağlar.
  useEffect(() => {
    if (!isMorph || !isOpen) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isMorph, isOpen, setOpen])

  useEffect(() => {
    const nextScales = initialScales(items.length)
    const nextPositions = initialPositions(items.length)
    scalesRef.current = nextScales
    positionsRef.current = nextPositions
    setScales(nextScales)
    setPositions(nextPositions)
    setMousePosition(null)
  }, [items.length])

  // Referanstaki iki tempolu lerp: imleç içerideyken hızlı (.20), ayrılırken
  // daha yumuşak (.12). State yalnız görsel ölçüleri besler; route semantiğine
  // veya odak yönetimine karışmaz.
  useEffect(() => {
    if (reduced) {
      const nextScales = initialScales(items.length)
      const nextPositions = initialPositions(items.length)
      scalesRef.current = nextScales
      positionsRef.current = nextPositions
      setScales(nextScales)
      setPositions(nextPositions)
      return
    }

    const wantedScales = targetScales(mousePosition, items.length)
    const wantedPositions = targetPositions(wantedScales)
    const lerp = mousePosition === null ? 0.12 : 0.2
    let animationFrame = 0

    const animate = () => {
      const currentScales =
        scalesRef.current.length === items.length
          ? scalesRef.current
          : initialScales(items.length)
      const currentPositions =
        positionsRef.current.length === items.length
          ? positionsRef.current
          : initialPositions(items.length)
      const nextScales = currentScales.map(
        (scale, index) =>
          scale + ((wantedScales[index] ?? MIN_SCALE) - scale) * lerp,
      )
      const nextPositions = currentPositions.map(
        (position, index) =>
          position + ((wantedPositions[index] ?? baseCenter(index)) - position) * lerp,
      )

      scalesRef.current = nextScales
      positionsRef.current = nextPositions
      setScales(nextScales)
      setPositions(nextPositions)

      const scalesNeedAnimation = nextScales.some(
        (scale, index) =>
          Math.abs(scale - (wantedScales[index] ?? MIN_SCALE)) > 0.002,
      )
      const positionsNeedAnimation = nextPositions.some(
        (position, index) =>
          Math.abs(position - (wantedPositions[index] ?? baseCenter(index))) > 0.1,
      )
      if (scalesNeedAnimation || positionsNeedAnimation) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [items.length, mousePosition, reduced])

  const contentLength =
    positions.length > 0
      ? Math.max(
          ...positions.map(
            (position, index) =>
              position + (BASE_ICON * (scales[index] ?? MIN_SCALE)) / 2,
          ),
        )
      : 0
  const activeIdx = useMemo(() => items.findIndex((item) => item.active), [items])
  const pointerHoveredIdx = useMemo(() => {
    if (mousePosition === null || positions.length === 0) return null
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY
    for (let index = 0; index < positions.length; index += 1) {
      const distance = Math.abs((positions[index] ?? 0) - mousePosition)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    }
    return closestIndex
  }, [mousePosition, positions])
  const pointerTargetIdx =
    canMagnify && !reduced ? pointerHoveredIdx : null
  // Klavye odağı pointer'dan üstündür: lens ve görsel tooltip aynı erişilebilir
  // hedefte kalır; aynı anda iki tooltip üretilmez.
  const targetIdx = focusedIndex ?? pointerTargetIdx ?? activeIdx
  const tooltipTargetIdx = focusedIndex ?? pointerHoveredIdx
  const indicatorScale =
    targetIdx >= 0 ? (scales[targetIdx] ?? MIN_SCALE) : MIN_SCALE
  const indicatorPosition =
    targetIdx >= 0 ? (positions[targetIdx] ?? baseCenter(targetIdx)) : 0

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!canMagnify) return
      const now = performance.now()
      if (now - lastMouseMoveTime.current < 16) return
      lastMouseMoveTime.current = now
      const rectangle = event.currentTarget.getBoundingClientRect()
      const alongAxis = isH
        ? event.clientX - rectangle.left
        : event.clientY - rectangle.top
      setMousePosition(alongAxis)
    },
    [canMagnify, isH],
  )

  // Legacy morph modunda odak dock dışına çıkarsa kapanır; fixed nav kalıcıdır.
  const handleRootBlur = (e: FocusEvent) => {
    if (isMorph && isOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setOpen(false)
    }
  }

  const handleRootKeyDown = (e: ReactKeyboardEvent) => {
    if (isMorph && e.key === 'Escape' && isOpen) {
      e.stopPropagation()
      focusTargetRef.current = 'peek'
      setOpen(false)
    }
  }

  const selectItem = (item: GlassDockItem) => {
    item.onSelect?.()
    if (isMorph) {
      focusTargetRef.current = 'peek'
      setOpen(false)
    }
  }

  const selectLinkedItem = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    item: GlassDockItem,
  ) => {
    if (!item.href || !isUnmodifiedPrimaryClick(event, item.target)) return
    selectItem(item)
    if (!onRoute || !isInternalHref(item.href)) return
    event.preventDefault()
    onRoute(item.href)
  }

  const layoutTransition = reduced
    ? { duration: 0 }
    : ({ type: 'spring', ...presets.springs.sidebar, mass: 0.8 } as const)
  const contentMotion = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, scale: 0.85, ...(isH ? { y: 8 } : { x: 8 }) },
        animate: { opacity: 1, scale: 1, x: 0, y: 0 },
        // Çıkış yalnız opacity — layout morph container'ı küçültürken içerik
        // hareket etmez, hayalet kalıntı oluşmaz (kaynak MorphDock kararı).
        exit: { opacity: 0 },
        transition: {
          opacity: { duration: 0.14, ease: 'linear' as const },
          scale: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
          x: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
          y: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
        },
      }

  const dockNav = (
    <nav
      aria-label={label}
      data-behavior={behavior}
      className={[styles.body, isH ? styles.bodyH : styles.bodyV].join(' ')}
    >
      <GlassTierProvider tier="fallback">
        <GlassSurface
          shape="capsule"
          thickness={0.55}
          className={styles.glass}
          aria-hidden
          style={{
            // Referans GlassEffect dış katmanı + Header malzeme eşliği.
            backdropFilter: 'blur(14px) saturate(180%)',
            WebkitBackdropFilter: 'blur(14px) saturate(180%)',
            background: 'color-mix(in srgb, var(--lg-surface) 55%, transparent)',
          }}
        />
      </GlassTierProvider>
      <div
        data-part="track"
        className={styles.track}
        style={{
          width: isH ? `${contentLength}px` : `${BASE_ICON}px`,
          height: isH ? `${BASE_ICON}px` : `${contentLength}px`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePosition(null)}
      >
        {targetIdx >= 0 && (
          <span
            aria-hidden="true"
            data-lq-lens="edge"
            className={styles.indicator}
            style={{
              ...(isH
                ? {
                    left: `${indicatorPosition - BASE_ICON / 2}px`,
                    bottom: 0,
                  }
                : {
                    top: `${indicatorPosition - BASE_ICON / 2}px`,
                    right: 0,
                  }),
              transform: `scale(${indicatorScale})`,
              transformOrigin: isH ? '50% 100%' : '100% 50%',
              backdropFilter: 'blur(6px) saturate(180%)',
              WebkitBackdropFilter: 'blur(6px) saturate(180%)',
            }}
          />
        )}
        {items.map((item, index) => {
          const scale = scales[index] ?? MIN_SCALE
          const position = positions[index] ?? baseCenter(index)
          const itemStyle: CSSProperties = {
            ...(isH
              ? { left: `${position - BASE_ICON / 2}px`, bottom: 0 }
              : { top: `${position - BASE_ICON / 2}px`, right: 0 }),
            transform: `scale(${scale})`,
            transformOrigin: isH ? '50% 100%' : '100% 50%',
            zIndex: Math.round(scale * 10),
          }
          const showTooltip = tooltipTargetIdx === index
          const captureFirstItem =
            index === 0
              ? (node: HTMLElement | null) => {
                  firstItemRef.current = node
                }
              : undefined
          const contents = (
            <>
              {showTooltip ? (
                <span
                  aria-hidden="true"
                  data-part="tooltip"
                  className={[styles.tooltip, isH ? styles.tooltipH : styles.tooltipV].join(' ')}
                >
                  {item.label}
                </span>
              ) : null}
              <span className={styles.itemIcon} aria-hidden="true">
                {item.icon}
              </span>
            </>
          )
          return item.href ? (
            <a
              key={item.key}
              ref={captureFirstItem}
              href={item.href}
              target={item.target}
              rel={item.rel}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
              className={styles.item}
              style={itemStyle}
              data-magnification-scale={scale.toFixed(3)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onClick={(event) => selectLinkedItem(event, item)}
            >
              {contents}
            </a>
          ) : (
            <button
              key={item.key}
              ref={captureFirstItem}
              type="button"
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
              className={styles.item}
              style={itemStyle}
              data-magnification-scale={scale.toFixed(3)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onClick={() => selectItem(item)}
            >
              {contents}
            </button>
          )
        })}
      </div>
    </nav>
  )

  return (
    <div
      className={[styles.root, isH ? styles.rootH : styles.rootV, className]
        .filter(Boolean)
        .join(' ')}
    >
      {isMorph ? (
        <motion.div
          ref={rootRef}
          layout={!reduced}
          className={[
            styles.morph,
            isOpen ? styles.morphOpen : styles.morphClosed,
            isH ? styles.morphH : styles.morphV,
          ].join(' ')}
          transition={{ layout: layoutTransition }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onBlur={handleRootBlur}
          onKeyDown={handleRootKeyDown}
        >
          {!isOpen ? (
            <button
              ref={peekRef}
              type="button"
              aria-label={label}
              aria-expanded={false}
              className={styles.peek}
              onClick={() => {
                focusTargetRef.current = 'item'
                setOpen(true)
              }}
            />
          ) : null}
          <AnimatePresence mode="wait" initial={false}>
            {isOpen && (
              <motion.div key="dock-content" {...contentMotion}>
                {dockNav}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        dockNav
      )}
    </div>
  )
}
