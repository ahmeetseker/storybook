// GlassIslandHeader — Apple Dynamic Island tarzı genişleyen üst başlık.
// Kapalıyken üst-ortada marka + zil taşıyan bir cam hap; hover'da hap
// genişleyip "Şu an: <sayfa> · <saat>" durum chip'ini gösterir; tıklayınca
// "Nereye gitmek istersin?" hızlı gezinme paneline morph eder (sayfa
// kartları → alt navigasyon, extras ve arama slotları). Kaynak: public-site
// DynamicIslandHeader primitive'inin liquid-glass-ui uyarlaması (rules.md §1).
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributeAnchorTarget,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import { GlassSurface, GlassTierProvider } from '../GlassSurface'
import styles from './GlassIslandHeader.module.css'

/** Panel ızgarasındaki bir üst seviye sayfa kartı. */
export interface GlassIslandHeaderPage {
  key: string
  label: string
  icon: ReactNode
  /** Native/SSR gezinme hedefi. Alt navigasyonu olan sayfalarda disclosure davranışı önceliklidir. */
  href?: string
  target?: HTMLAttributeAnchorTarget
  rel?: string
}

/** Bir sayfanın alt navigasyon öğesi. */
export interface GlassIslandHeaderSubItem {
  key: string
  label: string
  icon?: ReactNode
  /** Verildiğinde öğe gerçek bağlantı olarak render edilir. */
  href?: string
  target?: HTMLAttributeAnchorTarget
  rel?: string
}

export type GlassIslandHeaderStatusVisibility = 'auto' | 'always' | 'hover' | 'hidden'

export type GlassIslandHeaderInitialTime = Date | string | number

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface GlassIslandHeaderProps {
  /** Marka ikonu — hap solunda, her durumda görünür */
  brandIcon: ReactNode
  brandLabel: string
  /** Verildiğinde marka gerçek ana sayfa bağlantısı olarak render edilir. */
  brandHref?: string
  pages: GlassIslandHeaderPage[]
  /**
   * Sayfa anahtarı → alt navigasyon öğeleri. Verilen sayfa kartına tıklama
   * alt görünümü açar; verilmeyen sayfa doğrudan `onNavigate(key)` çağırır.
   */
  subNav?: Record<string, GlassIslandHeaderSubItem[]>
  /** Geçerli sayfanın anahtarı — durum chip'i etiketi ve kart göstergesi buradan türer */
  activeKey?: string
  /** Durum chip'i metnini geçersiz kılar (varsayılan: aktif sayfanın etiketi) */
  statusLabel?: string
  /**
   * Salt-okunur durum yolu. Verildiğinde `statusLabel`/aktif sayfa etiketinin
   * yerini alır; etkileşimli breadcrumb yerine kısa bağlam özeti içindir.
   */
  statusTrail?: readonly string[]
  /**
   * `auto`: ince pointer'da hover/focus, dokunmatikte sürekli görünür.
   * `always`, `hover` ve `hidden` çağırana açık görünürlük kontrolü verir.
   */
  statusVisibility?: GlassIslandHeaderStatusVisibility
  /** Durum chip'inde canlı saat (tr-TR SS:DD, 30 sn'de bir tazelenir) */
  showClock?: boolean
  /**
   * SSR ile istemcide aynı ilk saat metnini üretmek için deterministik başlangıç.
   * Verilmezse SSR `--:--` üretir, istemci mount sonrası yerel saati başlatır.
   */
  initialTime?: GlassIslandHeaderInitialTime
  /** Saatin IANA zaman dilimi (ör. `Europe/Istanbul`). */
  timeZone?: string
  /** Controlled panel açık/kapalı durumu */
  open?: boolean
  /** Uncontrolled kullanımda başlangıç durumu */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Zil rozeti sayısı — 0 ise rozet çizilmez */
  notificationCount?: number
  /** Verilirse zil butonu render edilir ve tıklamada çağrılır */
  onNotificationsClick?: () => void
  /** Panel alt şeridi — dil/oturum eylemleri için serbest slot */
  extras?: ReactNode
  /** Panelin en altındaki arama slotu (ör. `GlassAiSearchBar`) */
  search?: ReactNode
  /** Sayfa (veya alt öğe) seçiminde çağrılır; seçim paneli kapatır */
  onNavigate?: (pageKey: string, subKey?: string) => void
  /**
   * Modifiyesiz, aynı sekmeli iç bağlantıları SPA router'a delege eder.
   * Verilmezse bağlantının native gezinme davranışı korunur.
   */
  onRoute?: (href: string) => void
  className?: string
}

function parseInitialTime(value: GlassIslandHeaderInitialTime | undefined): Date | null {
  if (value === undefined) return null
  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatTime(value: Date | null, timeZone?: string): string {
  if (value === null) return '--:--'
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    }).format(value)
  } catch {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(value)
  }
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

function measureNaturalWidth(element: HTMLElement): number {
  const container = element.parentElement
  const previousWidth = element.style.width
  const previousMaxWidth = element.style.maxWidth
  const previousContainerWidth = container?.style.width
  const previousContainerMaxWidth = container?.style.maxWidth
  if (container) {
    container.style.width = 'max-content'
    container.style.maxWidth = 'none'
  }
  element.style.width = 'max-content'
  element.style.maxWidth = 'none'
  const width = Math.ceil(element.getBoundingClientRect().width)
  element.style.width = previousWidth
  element.style.maxWidth = previousMaxWidth
  if (container) {
    container.style.width = previousContainerWidth ?? ''
    container.style.maxWidth = previousContainerMaxWidth ?? ''
  }
  return width
}

export function GlassIslandHeader({
  brandIcon,
  brandLabel,
  brandHref,
  pages,
  subNav,
  activeKey,
  statusLabel,
  statusTrail,
  statusVisibility = 'auto',
  showClock = true,
  initialTime,
  timeZone,
  open,
  defaultOpen = false,
  onOpenChange,
  notificationCount = 0,
  onNotificationsClick,
  extras,
  search,
  onNavigate,
  onRoute,
  className,
}: GlassIslandHeaderProps) {
  const uid = useId()
  const panelTitleId = `${uid}-panel-title`
  const reduced = prefersReducedMotion()

  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const isOpen = open ?? innerOpen
  const [selected, setSelected] = useState<string | null>(null)
  const [pillHovered, setPillHovered] = useState(false)
  const [pillFocusWithin, setPillFocusWithin] = useState(false)
  const [canHover, setCanHover] = useState(true)
  const [now, setNow] = useState<Date | null>(() => parseInitialTime(initialTime))

  const pillRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef(false)
  const statusContentRef = useRef<HTMLSpanElement>(null)
  const [statusWidth, setStatusWidth] = useState(0)

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInnerOpen(next)
      onOpenChange?.(next)
    },
    [open, onOpenChange],
  )

  const closePanel = useCallback(() => {
    restoreFocusRef.current =
      panelRef.current?.contains(document.activeElement) === true
    setOpen(false)
    setSelected(null)
  }, [setOpen])

  // Hover yeteneği — dokunmatikte durum chip'i hep görünür, hover genişlemesi yok.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const apply = () => {
      setCanHover(mq.matches)
      if (!mq.matches) setPillHovered(false)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Canlı saat — SSR ilk render'ında yalnız çağıranın verdiği deterministik
  // initialTime kullanılır. Değer verilmezse mount sonrası istemci saati
  // başlatılır; server/client HTML'i `--:--` ile eşleşir.
  useEffect(() => {
    if (!showClock) return
    if (initialTime === undefined) setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(id)
  }, [initialTime, showClock])

  const timeLabel = formatTime(now, timeZone)
  const statusTrailLabels = (statusTrail ?? []).map((item) => item.trim()).filter(Boolean)
  const visibleStatusTrail =
    statusTrailLabels.length > 2
      ? [
          { key: 'first', label: statusTrailLabels[0]!, collapsed: false },
          { key: 'collapsed', label: '…', collapsed: true },
          {
            key: 'last',
            label: statusTrailLabels[statusTrailLabels.length - 1]!,
            collapsed: false,
          },
        ]
      : statusTrailLabels.map((label, index) => ({
          key: `${label}-${index}`,
          label,
          collapsed: false,
        }))
  const activePageLabel = statusLabel ?? pages.find((p) => p.key === activeKey)?.label ?? brandLabel
  const statusAccessibleLabel =
    statusTrailLabels.length > 0 ? statusTrailLabels.join(' › ') : activePageLabel
  const statusPersistent =
    statusVisibility === 'always' || (statusVisibility === 'auto' && !canHover)
  const pillEngaged = pillHovered || pillFocusWithin
  const statusShown =
    statusVisibility !== 'hidden' &&
    (statusPersistent ||
      ((statusVisibility === 'auto' || statusVisibility === 'hover') && pillEngaged))

  // Durum chip'inin doğal genişliği ölçülür. Görünürlük opacity/translate ile,
  // hap boyutu ise Motion layout projection (FLIP) ile animasyon alır.
  useLayoutEffect(() => {
    const el = statusContentRef.current
    if (!el) return
    const w = measureNaturalWidth(el)
    if (w > 0) setStatusWidth(w)
  }, [statusAccessibleLabel, timeLabel])

  useEffect(() => {
    const fonts = document.fonts
    if (!fonts) return
    let cancelled = false
    void fonts.ready.then(() => {
      const el = statusContentRef.current
      if (cancelled || !el) return
      const w = measureNaturalWidth(el)
      if (w > 0) setStatusWidth((prev) => (prev === w ? prev : w))
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Kapanışta odak panel içindeyse hapa iade edilir — odak body'ye düşmez.
  const prevOpenRef = useRef(isOpen)
  useEffect(() => {
    const was = prevOpenRef.current
    prevOpenRef.current = isOpen
    if (was === isOpen || isOpen) return
    const active = document.activeElement
    const shouldRestore =
      restoreFocusRef.current ||
      (active !== null && panelRef.current?.contains(active) === true)
    restoreFocusRef.current = false
    if (shouldRestore) {
      pillRef.current?.focus()
    }
  }, [isOpen])

  // Backdrop pointer erişimini kapattığı için panel modal davranır: açılışta
  // odak dialog içine girer ve klavye odağı panel sınırları içinde tutulur.
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus()
  }, [isOpen])

  // Modal açıkken arka sayfa tekerlek/dokunmatik kaydırmasına kapatılır.
  // Her iki overflow değeri de aynen geri yüklenir; controlled kapanış
  // reddedilirse effect cleanup çalışmadığı için kilit korunur.
  useEffect(() => {
    if (!isOpen) return
    const previousBodyOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousRootOverflow
    }
  }, [isOpen])

  // Escape kök kapsayıcının onKeyDown'unda — yalnız başlık/panel içi bir hedef
  // odaktayken çalışır, üst katmanlarla çakışıp odak çalmaz (GlassChatDock kararı).
  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.nativeEvent.isComposing || e.key === 'Process') return
    if (e.key === 'Tab' && isOpen) {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      )
      if (!focusable || focusable.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (
        !e.shiftKey &&
        (active === last || !panelRef.current?.contains(active))
      ) {
        e.preventDefault()
        first.focus()
      }
      return
    }
    if (e.key === 'Escape' && isOpen) {
      e.stopPropagation()
      closePanel()
    }
  }

  const selectPage = (pageKey: string) => {
    const hasSub = (subNav?.[pageKey] ?? []).length > 0
    if (hasSub) {
      setSelected(pageKey)
    } else {
      onNavigate?.(pageKey)
      closePanel()
    }
  }

  const selectSub = (pageKey: string, subKey: string) => {
    onNavigate?.(pageKey, subKey)
    closePanel()
  }

  const routeAnchor = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
    target?: HTMLAttributeAnchorTarget,
  ) => {
    if (!onRoute || !isUnmodifiedPrimaryClick(event, target) || !isInternalHref(href)) return
    event.preventDefault()
    onRoute(href)
  }

  const panelMotion = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto' as const },
        exit: { opacity: 0, height: 0 },
        transition: { type: 'spring', ...presets.springs.sidebar } as const,
      }

  const viewMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
        transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
      }

  const selectedPage = selected !== null ? pages.find((p) => p.key === selected) : undefined

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.2 }}
            className={styles.backdrop}
            onClick={closePanel}
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        layout={reduced ? false : true}
        transition={
          reduced
            ? { layout: { duration: 0 } }
            : {
                layout: {
                  duration: 0.22,
                  ease: [0.23, 1, 0.32, 1],
                },
              }
        }
        className={[
          styles.root,
          statusVisibility === 'auto' ? styles.rootStatusAuto : '',
          isOpen ? styles.rootOpen : statusShown && !statusPersistent ? styles.rootHover : '',
          statusPersistent ? styles.rootStatusPersistent : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onKeyDown={handleKeyDown}
      >
        <GlassTierProvider tier="fallback">
          <GlassSurface
            shape={isOpen ? 28 : 'capsule'}
            thickness={0.55}
            className={[styles.island, isOpen ? styles.islandOpen : ''].filter(Boolean).join(' ')}
            style={{
              // Bu yüzey sürekli genişlik değiştirir. Boyuta bağlı SVG
              // displacement filtresi Chromium'da morph sırasında arka planı
              // boşaltabildiği için kaynak header'daki kararlı blur malzemesi
              // kullanılır; rim/gölge ve tier renkleri GlassSurface'ta kalır.
              backdropFilter: 'blur(14px) saturate(180%)',
              WebkitBackdropFilter: 'blur(14px) saturate(180%)',
            }}
          >
          <div
            className={styles.pill}
            onMouseEnter={() => canHover && setPillHovered(true)}
            onMouseLeave={() => canHover && setPillHovered(false)}
            onFocus={() => canHover && setPillFocusWithin(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setPillFocusWithin(false)
              }
            }}
          >
            {brandHref ? (
              <a
                href={brandHref}
                aria-label={brandLabel}
                className={[styles.brand, styles.brandLink].join(' ')}
                onClick={(event) => {
                  if (!isUnmodifiedPrimaryClick(event)) return
                  if (isOpen) closePanel()
                  routeAnchor(event, brandHref)
                }}
              >
                <span className={styles.brandIcon} aria-hidden="true">
                  {brandIcon}
                </span>
                <span className={styles.brandLabel}>{brandLabel}</span>
              </a>
            ) : (
              <span className={styles.brand}>
                <span className={styles.brandIcon} aria-hidden="true">
                  {brandIcon}
                </span>
                <span className={styles.brandLabel}>{brandLabel}</span>
              </span>
            )}

            <button
              ref={pillRef}
              type="button"
              aria-label="Hızlı gezinme"
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              className={styles.pillTrigger}
              onClick={() => (isOpen ? closePanel() : setOpen(true))}
            />

            {statusVisibility !== 'hidden' ? (
              <span
                className={[
                  styles.statusReveal,
                  statusShown ? styles.statusRevealVisible : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  statusPersistent && statusWidth === 0
                    ? undefined
                    : { width: `${statusWidth}px` }
                }
                data-visible={statusShown ? 'true' : 'false'}
                aria-hidden={
                  statusVisibility === 'auto' ? undefined : !statusShown
                }
              >
                <span
                  ref={statusContentRef}
                  className={styles.statusChip}
                  aria-label={`Şu an: ${statusAccessibleLabel}`}
                >
                  <span className={styles.statusLead} aria-hidden="true">
                    <span className={styles.liveDot} data-part="status-live">
                      <span className={styles.liveDotPing} />
                      <span className={styles.liveDotCore} />
                    </span>
                  </span>
                  <span
                    className={styles.statusText}
                    data-part="status-breadcrumb"
                  >
                    <span className={styles.statusPrefix}>Şu an: </span>
                    {statusTrailLabels.length > 0 ? (
                      <span className={styles.statusTrail}>
                        {visibleStatusTrail.map((item, index) => (
                          <span key={item.key} className={styles.statusTrailItem}>
                            {index > 0 ? (
                              <span className={styles.statusTrailSeparator} aria-hidden="true">
                                ›
                              </span>
                            ) : null}
                            <span
                              className={[
                                styles.statusValue,
                                item.collapsed ? styles.statusTrailEllipsis : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              aria-hidden={item.collapsed || undefined}
                            >
                              {item.label}
                            </span>
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className={styles.statusValue}>{activePageLabel}</span>
                    )}
                  </span>
                  <span className={styles.statusEnd} aria-hidden="true">
                    {showClock ? (
                      <>
                        <span className={styles.statusDivider} aria-hidden="true" />
                        <span className={styles.statusTime}>{timeLabel}</span>
                      </>
                    ) : null}
                  </span>
                </span>
              </span>
            ) : null}

            {onNotificationsClick ? (
              <button
                type="button"
                aria-label={`Bildirimler${notificationCount > 0 ? `, ${notificationCount} okunmamış` : ''}`}
                className={styles.bell}
                onClick={onNotificationsClick}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </svg>
                {notificationCount > 0 ? (
                  <span className={styles.badge} aria-hidden="true">
                    {notificationCount}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>

          <AnimatePresence initial={false}>
            {isOpen ? (
              <motion.div
                key="panel"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={panelTitleId}
                className={styles.panel}
                {...panelMotion}
              >
                <div className={styles.panelHeader}>
                  <h2 id={panelTitleId} className={styles.panelTitle}>
                    Nereye gitmek istersin?
                  </h2>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Kapat"
                    className={styles.close}
                    onClick={(e) => {
                      e.stopPropagation()
                      closePanel()
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>

                <div className={styles.panelBody}>
                  <AnimatePresence mode="wait" initial={false}>
                    {selected === null || !selectedPage ? (
                      <motion.div key="cards" {...viewMotion} className={styles.cardsGrid}>
                        {pages.map((p) => {
                          const isActive = activeKey === p.key
                          const hasSubNavigation = (subNav?.[p.key] ?? []).length > 0
                          const contents = (
                            <>
                              <span className={styles.cardIcon} aria-hidden="true">
                                {p.icon}
                              </span>
                              <span className={styles.cardLabel}>{p.label}</span>
                              {isActive ? <span className={styles.cardDot} aria-hidden="true" /> : null}
                            </>
                          )
                          return p.href && !hasSubNavigation ? (
                            <a
                              key={p.key}
                              href={p.href}
                              target={p.target}
                              rel={p.rel}
                              aria-current={isActive ? 'page' : undefined}
                              className={styles.card}
                              onClick={(event) => {
                                event.stopPropagation()
                                if (!isUnmodifiedPrimaryClick(event, p.target)) return
                                selectPage(p.key)
                                routeAnchor(event, p.href!, p.target)
                              }}
                            >
                              {contents}
                            </a>
                          ) : (
                            <button
                              key={p.key}
                              type="button"
                              aria-current={isActive ? 'page' : undefined}
                              className={styles.card}
                              onClick={(e) => {
                                e.stopPropagation()
                                selectPage(p.key)
                              }}
                            >
                              {contents}
                            </button>
                          )
                        })}
                      </motion.div>
                    ) : (
                      <motion.div key={`sub-${selected}`} {...viewMotion} className={styles.subView}>
                        <div className={styles.peekRow}>
                          {pages
                            .filter((p) => p.key !== selected)
                            .map((p) => {
                              const hasSubNavigation = (subNav?.[p.key] ?? []).length > 0
                              const contents = (
                                <>
                                  <span className={styles.peekIcon} aria-hidden="true">
                                    {p.icon}
                                  </span>
                                  <span>{p.label}</span>
                                </>
                              )
                              return p.href && !hasSubNavigation ? (
                                <a
                                  key={p.key}
                                  href={p.href}
                                  target={p.target}
                                  rel={p.rel}
                                  aria-current={activeKey === p.key ? 'page' : undefined}
                                  className={styles.peekItem}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    if (!isUnmodifiedPrimaryClick(event, p.target)) return
                                    selectPage(p.key)
                                    routeAnchor(event, p.href!, p.target)
                                  }}
                                >
                                  {contents}
                                </a>
                              ) : (
                                <button
                                  key={p.key}
                                  type="button"
                                  aria-current={activeKey === p.key ? 'page' : undefined}
                                  className={styles.peekItem}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    selectPage(p.key)
                                  }}
                                >
                                  {contents}
                                </button>
                              )
                            })}
                        </div>

                        <div className={styles.subCard}>
                          <div className={styles.subCardHead}>
                            <span className={styles.subCardIcon} aria-hidden="true">
                              {selectedPage.icon}
                            </span>
                            <h3 className={styles.subCardTitle}>{selectedPage.label}</h3>
                            {activeKey === selected ? (
                              <span className={styles.subCardDot} aria-hidden="true" />
                            ) : null}
                          </div>
                          <div className={styles.subDivider} aria-hidden="true" />
                          <div className={styles.subGrid}>
                            {(subNav?.[selected] ?? []).map((s) => {
                              const contents = (
                                <>
                                  {s.icon ? (
                                    <span className={styles.subItemIcon} aria-hidden="true">
                                      {s.icon}
                                    </span>
                                  ) : null}
                                  <span className={styles.subItemLabel}>{s.label}</span>
                                </>
                              )
                              return s.href ? (
                                <a
                                  key={s.key}
                                  href={s.href}
                                  target={s.target}
                                  rel={s.rel}
                                  className={styles.subItem}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    if (!isUnmodifiedPrimaryClick(event, s.target)) return
                                    selectSub(selected, s.key)
                                    routeAnchor(event, s.href!, s.target)
                                  }}
                                >
                                  {contents}
                                </a>
                              ) : (
                                <button
                                  key={s.key}
                                  type="button"
                                  className={styles.subItem}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    selectSub(selected, s.key)
                                  }}
                                >
                                  {contents}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {extras ? <div className={styles.extras}>{extras}</div> : null}
                {search ? <div className={styles.search}>{search}</div> : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
          </GlassSurface>
        </GlassTierProvider>
      </motion.div>
    </>
  )
}
