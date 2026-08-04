import {
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import { GroupDepthContext, SidebarContext, useSidebarContext } from './SidebarContext'
import styles from './GlassSidebar.module.css'

/** Satır yoğunluğu ekseni — bkz. `GlassSidebarProps.density` */
export type GlassSidebarDensity = 'comfortable' | 'compact'

export interface GlassSidebarProps {
  selected?: string
  onSelect?: (id: string) => void
  tone?: 'light' | 'dark' | 'auto'
  /**
   * 'glass' (varsayılan): navigasyon katmanının cam malzemesi.
   * 'flat': opak yüzey — sidebar bir overlay (Drawer/Sheet) içinde gösterildiğinde
   * "cam üstüne cam yok" kuralı için zorunludur.
   */
  material?: 'glass' | 'flat'
  /**
   * Satır yoğunluğu.
   * 'comfortable' (varsayılan): 44px satır, 15.5px etiket — dokunma ve mobil için.
   * 'compact': 36px satır, 13.5px etiket — uzun bölüm listesinin masaüstü panosunda
   * kaydırmasız sığması için. Dokunmatik girdide (`@media (pointer: coarse)`) kompakt
   * ölçek de 44px dokunma hedefine döner (WCAG 2.5.5) — bu geri dönüş CSS'tedir.
   */
  density?: GlassSidebarDensity
  /**
   * İkon-only dar ray (68px). Etiketler, rozet sayısı, kısayol ipuçları, bölüm
   * başlıkları ve grup chevron'ları GÖRSEL olarak gizlenir; erişilebilir ad
   * (`aria-current`, rozet `badgeLabel`) korunur. `Header` render edilmez,
   * `Switcher` monogram düğmesine iner. İkonsuz `Item` bu modda boş satır olur.
   */
  collapsed?: boolean
  className?: string
  'aria-label'?: string
  children: ReactNode
}

export interface GlassSidebarHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}

export interface GlassSidebarItemProps {
  id: string
  icon?: ReactNode
  /** Sağda kapsül rozet (okunmamış sayısı, durum) — sayı ya da kısa metin */
  badge?: ReactNode
  /** Rozetin ne anlama geldiğini ekran okuyucuya açan ek metin (ör. "okunmamış mesaj") */
  badgeLabel?: string
  /** Dekoratif kısayol ipucu (ör. "⌘K") — erişilebilir adın parçası değildir */
  hint?: ReactNode
  children: ReactNode
}

export interface GlassSidebarGroupProps {
  label: ReactNode
  /** Grup başlığını öğe gibi gösteren opsiyonel simge */
  icon?: ReactNode
  /** Grup başlığında kapsül rozet */
  badge?: ReactNode
  badgeLabel?: string
  defaultOpen?: boolean
  children: ReactNode
}

export interface GlassSidebarSectionProps {
  /** Etkileşimsiz bölüm başlığı (ör. "PORTFÖYÜM") */
  label: ReactNode
  children: ReactNode
}

export interface GlassSidebarFooterProps {
  children: ReactNode
}

export interface GlassSidebarSwitcherOption {
  id: string
  label: string
  /** Etiketin altındaki soluk satır (ör. "Pro üyelik · Doğrulanmış") */
  meta?: string
}

export interface GlassSidebarSwitcherProps {
  options: GlassSidebarSwitcherOption[]
  /** Controlled seçili hesap/mağaza */
  value?: string
  /** Uncontrolled başlangıç değeri */
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Tetikleyicinin erişilebilir adı */
  label?: string
  /** Listenin sonundaki ek eylem (ör. "Yeni mağaza oluştur") */
  action?: { label: string; onSelect: () => void }
}

/**
 * Daraltılmış rayda tooltip: yalnız metin çocuk için `title` üretilir —
 * ReactNode etiketlerde anlamlı bir string çıkarılamaz.
 */
function tooltipOf(collapsed: boolean, label: ReactNode): string | undefined {
  return collapsed && typeof label === 'string' ? label : undefined
}

/** Daraltılmış rayda ad taşıyan metni görsel olarak gizler (DOM'da kalır). */
function labelClass(base: string, collapsed: boolean): string {
  return collapsed ? `${base} ${styles.srOnly}` : base
}

function SidebarRoot({
  selected,
  onSelect,
  tone = 'auto',
  material = 'glass',
  density = 'comfortable',
  collapsed = false,
  className,
  'aria-label': ariaLabel = 'Kenar çubuğu',
  children,
}: GlassSidebarProps) {
  const highlightId = useId()
  return (
    <GlassSurface
      as="nav"
      shape={24}
      tone={tone}
      material={material}
      thickness={0.5}
      className={[
        styles.sidebar,
        material === 'flat' ? styles.flat : null,
        density === 'compact' ? styles.compact : null,
        collapsed ? styles.collapsed : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      data-density={density}
      data-collapsed={collapsed ? 'true' : undefined}
    >
      <SidebarContext.Provider value={{ selected, onSelect, highlightId, density, collapsed }}>
        {children}
      </SidebarContext.Provider>
    </GlassSurface>
  )
}

function Header({ title, subtitle, action }: GlassSidebarHeaderProps) {
  const { collapsed } = useSidebarContext('GlassSidebar.Header')
  // Dar rayda başlık bloğu tamamen düşer: 68px'e sığmaz ve Switcher monogramıyla
  // görsel olarak çakışır. nav'ın adı `aria-label`dan gelir, ad kaybı olmaz.
  if (collapsed) return null
  return (
    <header className={styles.header}>
      <div>
        <span className={styles.title}>{title}</span>
        {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
      </div>
      {action}
    </header>
  )
}

/** Rozet + ekran okuyucu açıklaması; Item ve Group başlığı ortak kullanır. */
function Badge({ children, label, collapsed }: { children: ReactNode; label?: string; collapsed: boolean }) {
  return (
    <span className={styles.badge}>
      {/* Dar rayda rozet noktaya iner: sayı görsel olarak gizlenir, ada girmeye devam eder */}
      <span className={collapsed ? styles.srOnly : undefined}>{children}</span>
      {label ? <span className={styles.srOnly}> {label}</span> : null}
    </span>
  )
}

function Item({ id, icon, badge, badgeLabel, hint, children }: GlassSidebarItemProps) {
  const { selected, onSelect, highlightId, collapsed } = useSidebarContext('GlassSidebar.Item')
  const isSelected = selected === id
  const reduced = prefersReducedMotion()

  return (
    <button
      type="button"
      className={styles.item}
      aria-current={isSelected ? 'page' : undefined}
      title={tooltipOf(collapsed, children)}
      onClick={() => onSelect?.(id)}
    >
      {isSelected ? (
        <motion.span
          layoutId={highlightId}
          className={styles.itemHighlight}
          transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
          aria-hidden
        />
      ) : null}
      {icon ? (
        <span className={styles.itemIcon} aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className={labelClass(styles.itemLabel, collapsed)}>{children}</span>
      {hint ? (
        <kbd className={styles.hint} aria-hidden>
          {hint}
        </kbd>
      ) : null}
      {badge != null && badge !== false ? (
        <Badge label={badgeLabel} collapsed={collapsed}>
          {badge}
        </Badge>
      ) : null}
    </button>
  )
}

function Group({ label, icon, badge, badgeLabel, defaultOpen = true, children }: GlassSidebarGroupProps) {
  const { collapsed } = useSidebarContext('GlassSidebar.Group')
  const depth = useContext(GroupDepthContext)
  if (depth > 0 && import.meta.env.DEV) {
    console.warn('GlassSidebar: iç içe Group desteklenmez — HIG en fazla iki seviye önerir')
  }
  const [open, setOpen] = useState(defaultOpen)
  const reduced = prefersReducedMotion()
  const regionId = useId()

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={[styles.groupHeader, icon ? styles.groupHeaderWithIcon : null].filter(Boolean).join(' ')}
        aria-expanded={open}
        aria-controls={regionId}
        title={tooltipOf(collapsed, label)}
        onClick={() => setOpen((o) => !o)}
      >
        {icon ? (
          <span className={styles.itemIcon} aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className={labelClass(styles.groupLabel, collapsed)}>{label}</span>
        {badge != null && badge !== false ? (
          <Badge label={badgeLabel} collapsed={collapsed}>
            {badge}
          </Badge>
        ) : null}
        <motion.span
          className={styles.chevronBox}
          animate={{ rotate: open ? 0 : -90 }}
          transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          aria-hidden
        >
          <span className={styles.chevron} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={regionId}
            className={styles.groupItems}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className={styles.groupItemsInner}>
              <GroupDepthContext.Provider value={depth + 1}>{children}</GroupDepthContext.Provider>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function Section({ label, children }: GlassSidebarSectionProps) {
  const { collapsed } = useSidebarContext('GlassSidebar.Section')
  const labelId = useId()
  return (
    <div className={styles.section} role="group" aria-labelledby={labelId}>
      {/* Dar rayda başlık görsel olarak gizlenir ama `aria-labelledby` hedefi olarak kalır */}
      <span className={labelClass(styles.sectionLabel, collapsed)} id={labelId}>
        {label}
      </span>
      {children}
    </div>
  )
}

function Footer({ children }: GlassSidebarFooterProps) {
  useSidebarContext('GlassSidebar.Footer')
  return <div className={styles.footer}>{children}</div>
}

/**
 * Hesap/mağaza değiştirici: tetikleyici + `role="menu"` liste.
 * Liste paneli her zaman FLAT'tır — sidebar cam olduğunda cam üstüne cam olmaz.
 */
function Switcher({ options, value, defaultValue, onValueChange, label = 'Hesap seç', action }: GlassSidebarSwitcherProps) {
  const { collapsed } = useSidebarContext('GlassSidebar.Switcher')
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.id)
  const current = value ?? internal
  const active = options.find((option) => option.id === current) ?? options[0]
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const reduced = prefersReducedMotion()

  // Açılışta odağı seçili satıra taşı (menu deseni: liste kendi odağını yönetir)
  useEffect(() => {
    if (!open) return
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"], [role="menuitem"]')
    if (!items?.length) return
    const target = Array.from(items).find((item) => item.getAttribute('aria-checked') === 'true') ?? items[0]
    target.focus()
  }, [open])

  // Dışarı tıklama kapatır; odak tetikleyiciye döndürülmez (pointer etkileşimi)
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const close = (focusTrigger = true) => {
    setOpen(false)
    if (focusTrigger) triggerRef.current?.focus()
  }

  const choose = (id: string) => {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
    close()
  }

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"], [role="menuitem"]') ?? [])
    if (!items.length) return
    const index = items.indexOf(document.activeElement as HTMLElement)

    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'Tab') {
      close(false)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : event.key === 'ArrowDown'
              ? (index + 1) % items.length
              : (index - 1 + items.length) % items.length
      items[next]?.focus()
    }
  }

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
    }
  }

  return (
    <div className={styles.switcher} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.switcherTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${label}: ${active?.label ?? ''}`}
        title={tooltipOf(collapsed, active?.label)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles.monogram} aria-hidden>
          {active?.label.charAt(0)}
        </span>
        {/* Dar rayda yalnız monogram görünür; metin bloğu görsel olarak gizlenir */}
        <span className={labelClass(styles.switcherText, collapsed)}>
          <span className={styles.switcherLabel}>{active?.label}</span>
          {active?.meta ? <span className={styles.switcherMeta}>{active.meta}</span> : null}
        </span>
        <motion.span
          className={styles.chevronBox}
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
          aria-hidden
        >
          <span className={styles.chevron} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            ref={menuRef}
            role="menu"
            aria-label={label}
            className={styles.switcherMenu}
            onKeyDown={onMenuKeyDown}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 }}
            transition={reduced ? { duration: 0 } : { duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={option.id === current}
                className={styles.switcherOption}
                onClick={() => choose(option.id)}
              >
                <span className={styles.switcherOptionLabel}>{option.label}</span>
                {option.meta ? <span className={styles.switcherMeta}>{option.meta}</span> : null}
              </button>
            ))}
            {action ? (
              <>
                <span className={styles.switcherDivider} aria-hidden />
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.switcherOption} ${styles.switcherAction}`}
                  onClick={() => {
                    action.onSelect()
                    close()
                  }}
                >
                  <span className={styles.switcherPlus} aria-hidden>
                    +
                  </span>
                  {action.label}
                </button>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export const GlassSidebar = Object.assign(SidebarRoot, { Header, Switcher, Item, Group, Section, Footer })
