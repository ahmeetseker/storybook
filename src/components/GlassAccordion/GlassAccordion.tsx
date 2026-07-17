// Genel amaçlı aç/kapa liste — SSS, yardım merkezi, ilan detayında serbest
// ReactNode içerikli bölümler. GlassFeatureGroup'un `variant="accordion"`
// künye sunumundan (label:value satırları, sabit içerik şekli) FARKLI: burada
// içerik tamamen serbest ReactNode ve grup değil TEK seviyeli item listesi.
// GlassFeatureGroup'a dokunulmadı — iki component paralel, birbirinin yerine
// geçmez (bkz. rules.md §1).
import {
  useId,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import styles from './GlassAccordion.module.css'

export interface GlassAccordionItem {
  /** Panel + tetikleyiciyi eşleyen benzersiz kimlik (React key olarak da kullanılır) */
  id: string
  /** Tetikleyici başlık içeriği — serbest ReactNode (yalnız düz metin zorunlu değil) */
  title: ReactNode
  /** Panel içeriği — serbest ReactNode (SSS cevabı, yardım metni, herhangi bir markup) */
  content: ReactNode
}

export type GlassAccordionMode = 'single' | 'multiple'

export interface GlassAccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Sıralı öğe listesi */
  items: GlassAccordionItem[]
  /**
   * `'single'`: aynı anda yalnız bir panel açık — yeni birini açmak
   * öncekini kapatır (default). `'multiple'`: paneller birbirinden
   * bağımsız açılır/kapanır.
   */
  mode?: GlassAccordionMode
  /** Kontrollü açık panel id listesi */
  openIds?: string[]
  /** Kontrolsüz kullanımda başlangıç açık id listesi (varsayılan: hiçbiri açık) */
  defaultOpenIds?: string[]
  /** Açık id listesi her değiştiğinde güncel TÜM liste ile çağrılır */
  onOpenIdsChange?: (openIds: string[]) => void
  /**
   * Başlık düğmesini saran heading elementi. Sayfanın heading hiyerarşisi
   * çağıranın sorumluluğundadır — bağlama uygun seviyeyi seç. `'div'`
   * heading anlamı TAŞIMAZ (ör. accordion zaten bir heading altında
   * gruplanmışsa doküman ana hattını kirletmemek için).
   */
  headingAs?: 'h3' | 'h4' | 'div'
  /** Kökü adlandırır — sayfada birden çok accordion varsa vermek önerilir */
  'aria-label'?: string
}

// APG Accordion Pattern (chevron): aşağı bakan basit ok — dolgu yok, yalnız stroke.
function ChevronIcon() {
  return (
    <svg className={styles.chevron} viewBox="0 0 12 12" aria-hidden focusable="false">
      <path
        d="M2.5 4.25 6 7.75l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GlassAccordion({
  items,
  mode = 'single',
  openIds,
  defaultOpenIds,
  onOpenIdsChange,
  headingAs = 'h3',
  className,
  'aria-label': ariaLabel,
  ...rest
}: GlassAccordionProps) {
  const baseId = useId()
  const [innerOpenIds, setInnerOpenIds] = useState<string[]>(defaultOpenIds ?? [])
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([])

  // Controlled tespiti YALNIZ openIds üzerinden yapılır (bkz. GlassTable selectedIds deseni).
  const effectiveOpenIds = openIds ?? innerOpenIds
  const HeadingTag = headingAs as ElementType

  const emit = (next: string[]) => {
    if (openIds === undefined) setInnerOpenIds(next)
    onOpenIdsChange?.(next)
  }

  const toggle = (id: string) => {
    const isOpen = effectiveOpenIds.includes(id)
    if (mode === 'single') {
      emit(isOpen ? [] : [id])
      return
    }
    emit(isOpen ? effectiveOpenIds.filter((x) => x !== id) : [...effectiveOpenIds, id])
  }

  // APG Accordion klavye deseni: Aşağı/Yukarı ok bitişik başlığa, Home/End ilk/son
  // başlığa taşır. Tüm başlıklar gerçek <button> — doğal Tab sırası zaten çalışır,
  // roving tabindex (radiogroup/tablist deseni) GEREKMEZ; ok tuşları yalnız focus'u
  // ATLATIR, seçim/rol semantiği değiştirmez.
  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = -1
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % items.length
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = items.length - 1
    if (nextIndex === -1) return
    event.preventDefault()
    triggerRefs.current[nextIndex]?.focus()
  }

  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-mode={mode}
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const open = effectiveOpenIds.includes(item.id)
        const triggerId = `${baseId}-trigger-${item.id}`
        const panelId = `${baseId}-panel-${item.id}`
        return (
          <div key={item.id} className={styles.item}>
            <HeadingTag className={styles.heading}>
              <button
                ref={(node) => {
                  triggerRefs.current[index] = node
                }}
                type="button"
                id={triggerId}
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => onTriggerKeyDown(event, index)}
              >
                <span className={styles.title}>{item.title}</span>
                <span className={styles.chevronBox} data-open={open}>
                  <ChevronIcon />
                </span>
              </button>
            </HeadingTag>
            {/* Panel role TAŞIMAZ (spec) — açık/kapalı bilgisi tetikleyicideki
                aria-expanded'dan gelir. Kapalıyken `inert`: içerik DOM'da kalır
                (grid-template-rows geçişi için gerekli) ama klavye/AT gezinmesinden
                çıkarılır — display:none kullanılmadığı için geçiş kesintisiz çalışır. */}
            <div id={panelId} className={styles.panelOuter} data-open={open} inert={open ? undefined : true}>
              <div className={styles.panelInner}>
                <div className={styles.panel}>{item.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
