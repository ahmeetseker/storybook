// İçerik katmanı component'i (Dalga 1 kontratı §15) — bilinçli olarak FLAT:
// yüzey --lg-surface + --lg-hairline, backdrop-filter/cam yok. Tamamen
// statik/sunum amaçlı: etkileşim, controlled state veya klavye deseni yok
// (GlassScoreMeter/GlassSpecTable ile aynı karar — risk verisi dışarıdan
// hesaplanır, component yalnız çizer).
import { useId } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import styles from './GlassClimateRiskPanel.module.css'

/** Seviyenin otomatik türetilen semantik tonu. */
type GlassClimateRiskTone = 'success' | 'warning' | 'danger'

export interface GlassClimateRiskHazard {
  /** Liste anahtarı — sabit ve benzersiz olmalı (React key + data-hazard-id kaynağı) */
  id: string
  /** Görünen tehlike adı ("Deprem", "Sel", "Yangın", "Zemin Etüdü") */
  label: string
  /** Solda dekoratif ikon — bilgi taşımaz, `aria-hidden` uygulanır */
  icon?: ReactNode
  /** 1 (en düşük) – 5 (en yüksek) risk seviyesi; rengi otomatik türetir */
  level: 1 | 2 | 3 | 4 | 5
  /**
   * Seviyenin metinsel karşılığı ("Orta-Yüksek"). ZORUNLU: WCAG 1.4.1 gereği
   * seviye bilgisi yalnız renkle taşınamaz — bu metin her varyantta görünür
   * render edilir.
   */
  levelLabel: string
  /** `detailed` varyantında satırın altında gösterilen kısa gerekçe; `badges`'te yok sayılır */
  description?: string
  /** `detailed` varyantında kaynak atfı ("AFAD 2025"); `badges`'te yok sayılır */
  source?: string
}

export interface GlassClimateRiskPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Sıralı gösterilecek tehlike listesi */
  hazards: GlassClimateRiskHazard[]
  /** `badges`: ikon+etiket+seviye çipi yan yana kompakt sunum; `detailed`: satır başına 5 birimlik ölçek + açıklama + kaynak */
  variant?: 'badges' | 'detailed'
  /** Panel başlığı — verilirse `h3` render edilir ve `section`'ı `aria-labelledby` ile adlandırır */
  title?: string
}

function resolveTone(level: GlassClimateRiskHazard['level']): GlassClimateRiskTone {
  if (level <= 2) return 'success'
  if (level === 3) return 'warning'
  return 'danger'
}

// warning tonu için --lg-warning yoksa --lg-accent'e düşen CSS fallback zinciri (spec: "3 --lg-warning yoksa --lg-accent").
const TONE_VAR: Record<GlassClimateRiskTone, string> = {
  success: 'var(--lg-success)',
  warning: 'var(--lg-warning, var(--lg-accent))',
  danger: 'var(--lg-danger)',
}

const SCALE_UNITS = [1, 2, 3, 4, 5] as const

export function GlassClimateRiskPanel({
  hazards,
  variant = 'badges',
  title,
  className,
  ...rest
}: GlassClimateRiskPanelProps) {
  const uid = useId()
  const titleId = `${uid}-title`

  return (
    <section
      {...rest}
      {...(title ? { 'aria-labelledby': titleId } : null)}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {title ? (
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
      ) : null}
      {/* list-style: none Safari'de liste semantiğini düşürür → role="list" açıkça verilir (GlassList ile aynı desen) */}
      <ul role="list" className={[styles.list, styles[variant]].filter(Boolean).join(' ')}>
        {hazards.map((hazard) => {
          const tone = resolveTone(hazard.level)
          const cssVars: CSSProperties = { '--glass-climate-tone': TONE_VAR[tone] } as CSSProperties

          if (variant === 'detailed') {
            const scaleLabel = `${hazard.label}: 5 üzerinden ${hazard.level}, ${hazard.levelLabel}`
            return (
              <li key={hazard.id} data-tone={tone} className={styles.detailedItem} style={cssVars}>
                <div className={styles.detailedHead}>
                  {hazard.icon ? (
                    <span className={styles.icon} aria-hidden>
                      {hazard.icon}
                    </span>
                  ) : null}
                  <span className={styles.hazardLabel}>{hazard.label}</span>
                  <span className={styles.levelText}>{hazard.levelLabel}</span>
                </div>
                {/* Beş birimlik ölçek görsel — dolu birim sayısı 'level'; sayısal/metinsel karşılığı role="img" aria-label'da AT'ye eşdeğer sunulur */}
                <div className={styles.scale} role="img" aria-label={scaleLabel}>
                  {SCALE_UNITS.map((unit) => (
                    <span
                      key={unit}
                      aria-hidden
                      className={unit <= hazard.level ? styles.unitFilled : styles.unitEmpty}
                    />
                  ))}
                </div>
                {hazard.description ? <p className={styles.description}>{hazard.description}</p> : null}
                {hazard.source ? <span className={styles.source}>{hazard.source}</span> : null}
              </li>
            )
          }

          return (
            <li key={hazard.id} data-tone={tone} className={styles.badgeItem} style={cssVars}>
              {hazard.icon ? (
                <span className={styles.icon} aria-hidden>
                  {hazard.icon}
                </span>
              ) : null}
              <span className={styles.hazardLabel}>{hazard.label}</span>
              <span className={styles.levelChip}>{hazard.levelLabel}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
