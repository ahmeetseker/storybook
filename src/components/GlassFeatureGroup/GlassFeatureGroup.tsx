// Gruplu özellik/künye sunumu — sahibinden 'İç/Dış Özellikler' deseni.
// Üç sunum biçimi: accordion (aç/kapa grup), checklist (ikonlu amenity ızgarası),
// columns (GlassSpecTable görünümünde 1|2 kolon). İçerik katmanı FLAT — cam yok.
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'
import styles from './GlassFeatureGroup.module.css'

export interface GlassFeatureGroupItem {
  /** Özellik adı (ör. "Klima", "Yakıt Tipi") */
  label: string
  /** Verilirse label:value satırı olarak render edilir (variant'tan bağımsız) */
  value?: ReactNode
  /** value verilmediyse: checklist ızgarasında / satırında ✓ ya da ✕ ikonu */
  present?: boolean
}

export interface GlassFeatureGroupSection {
  title: string
  items: GlassFeatureGroupItem[]
}

export interface GlassFeatureGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  groups: GlassFeatureGroupSection[]
  /** Sunum biçimi: aç/kapa grup, ikonlu amenity ızgarası veya spec-table kolonları */
  variant?: 'accordion' | 'checklist' | 'columns'
  /** Yalnız variant="columns": grup içi etiket/değer satırlarının kaç sütuna dizileceği */
  columns?: 1 | 2
}

// value verilmişse doğrudan onu, yoksa present boole'una göre ✓/✕ ikonunu üretir.
// Ne value ne present verilmişse hücre boş kalır (çağıranın veri eksikliği).
function FeatureValue({ item }: { item: GlassFeatureGroupItem }) {
  if (item.value !== undefined) return <>{item.value}</>
  if (item.present === undefined) return null
  return (
    <span
      className={styles.presenceIcon}
      data-present={item.present}
      role="img"
      aria-label={item.present ? 'mevcut' : 'yok'}
    >
      {item.present ? '✓' : '✕'}
    </span>
  )
}

function FeatureRows({ items }: { items: GlassFeatureGroupItem[] }) {
  return (
    <dl className={styles.rows}>
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className={styles.row}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>
            <FeatureValue item={item} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ── accordion: gerçek button aria-expanded + region; ilk grup varsayılan açık.
// Açılış animasyonu GlassAccordion'daki `grid-template-rows: 0fr→1fr` CSS
// tekniğiyle yapılır — height animasyonu YASAK (bkz. tasarım sistemi motion
// kuralı). İçerik DOM'da kalır; kapalıyken `inert` ile klavye/AT gezinmesinden
// çıkarılır, display:none kullanılmadığı için geçiş kesintisiz çalışır. ──
function AccordionSection({ group, defaultOpen }: { group: GlassFeatureGroupSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const buttonId = useId()
  const regionId = useId()

  return (
    <div className={styles.accordionGroup}>
      <h3 className={styles.accordionHeading}>
        <button
          type="button"
          id={buttonId}
          className={styles.accordionTrigger}
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles.accordionTitle}>{group.title}</span>
          <span className={styles.chevronBox} data-open={open} aria-hidden>
            <span className={styles.chevron} />
          </span>
        </button>
      </h3>
      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        className={styles.accordionRegionOuter}
        data-open={open}
        inert={open ? undefined : true}
      >
        <div className={styles.accordionRegionInner}>
          <div className={styles.accordionRegion}>
            <FeatureRows items={group.items} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── checklist: ikonlu amenity ızgarası (yalnız label'lı item'lar) + değerli item'lar satır olarak ──
function ChecklistSection({ group }: { group: GlassFeatureGroupSection }) {
  const gridItems = group.items.filter((item) => item.value === undefined)
  const rowItems = group.items.filter((item) => item.value !== undefined)

  return (
    <div className={styles.checklistGroup}>
      <h3 className={styles.checklistTitle}>{group.title}</h3>
      {gridItems.length ? (
        <ul className={styles.checklistGrid}>
          {gridItems.map((item, i) => {
            const hasPresence = item.present !== undefined
            return (
              <li
                key={`${item.label}-${i}`}
                className={styles.checklistItem}
                data-present={hasPresence ? item.present : 'unknown'}
              >
                {hasPresence ? (
                  <span
                    className={styles.checklistIcon}
                    role="img"
                    aria-label={item.present ? 'mevcut' : 'yok'}
                  >
                    {item.present ? '✓' : '✕'}
                  </span>
                ) : (
                  <span className={styles.checklistIconNeutral} aria-hidden="true">
                    —
                  </span>
                )}
                <span className={styles.checklistLabel}>{item.label}</span>
              </li>
            )
          })}
        </ul>
      ) : null}
      {rowItems.length ? <FeatureRows items={rowItems} /> : null}
    </div>
  )
}

// ── columns: GlassSpecTable görünümü, grup başlığı heading DEĞİL (kicker etiket) ──
function ColumnsSection({ group, columns }: { group: GlassFeatureGroupSection; columns: 1 | 2 }) {
  return (
    <div className={styles.columnsGroup}>
      <p className={styles.columnsKicker}>{group.title}</p>
      <dl className={[styles.rows, columns === 2 ? styles.twoColumns : ''].filter(Boolean).join(' ')}>
        {group.items.map((item, i) => (
          <div key={`${item.label}-${i}`} className={styles.row}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>
              <FeatureValue item={item} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function GlassFeatureGroup({ groups, variant = 'accordion', columns = 1, className, ...rest }: GlassFeatureGroupProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} data-variant={variant} {...rest}>
      {variant === 'checklist'
        ? groups.map((group) => <ChecklistSection key={group.title} group={group} />)
        : variant === 'columns'
          ? groups.map((group) => <ColumnsSection key={group.title} group={group} columns={columns} />)
          : groups.map((group, i) => <AccordionSection key={group.title} group={group} defaultOpen={i === 0} />)}
    </div>
  )
}
