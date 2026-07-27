import { useId } from 'react'
import type { HTMLAttributes } from 'react'
import styles from './GlassAiConfidence.module.css'

/** Bir etkenin güvene yönü — renk dışında ikon + sr-only metinle iletilir. */
export type GlassAiConfidenceImpact = 'positive' | 'negative' | 'neutral'

export interface GlassAiConfidenceFactor {
  /** React key + benzersiz kimlik */
  id: string
  /** Etken açıklaması */
  label: string
  /** Etkenin güvene etkisi */
  impact?: GlassAiConfidenceImpact
}

export type GlassAiConfidenceLevel = 'low' | 'medium' | 'high'

export interface GlassAiConfidenceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Güven skoru (0-100). Verilmezse "ölçülmedi" fallback'i gösterilir */
  score?: number
  /** Güveni etkileyen etkenler */
  factors?: GlassAiConfidenceFactor[]
  /** Görünür etiket — meter'ın accessible name kaynağı */
  label?: string
  /** Yoğunluk */
  size?: 'md' | 'sm'
}

const IMPACT_META: Record<GlassAiConfidenceImpact, { glyph: string; sr: string }> = {
  positive: { glyph: '▲', sr: 'Artırıyor' },
  negative: { glyph: '▼', sr: 'Azaltıyor' },
  neutral: { glyph: '■', sr: 'Nötr' },
}

const DISCLAIMER = 'Güven skoru doğruluk garantisi değildir.'

function levelOf(score: number): GlassAiConfidenceLevel {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const LEVEL_LABELS: Record<GlassAiConfidenceLevel, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
}

/**
 * AI güven düzeyi göstergesi: erişilebilir `role="meter"` + seviye metni + güveni
 * etkileyen etkenler listesi. Skor verilmezse sessizce gizlenmez; "Ölçülmedi —
 * sonucu doğrulayın" açık fallback'i gösterilir. Güven asla bir doğruluk garantisi
 * olarak sunulmaz — kalıcı uyarı satırı bunu belirtir.
 */
export function GlassAiConfidence({
  score,
  factors = [],
  label = 'Güven düzeyi',
  size = 'md',
  className,
  ...rest
}: GlassAiConfidenceProps) {
  const labelId = useId()
  const hasScore = score !== undefined && Number.isFinite(score)
  const normalized = hasScore ? Math.round(Math.min(Math.max(score as number, 0), 100)) : 0
  const level = levelOf(normalized)
  const classes = [styles.root, styles[size], className].filter(Boolean).join(' ')

  return (
    // rest önce yayılır; yönetilen attribute'lar caller tarafından ezilemez
    <div {...rest} className={classes} data-level={hasScore ? level : undefined}>
      <div className={styles.head}>
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        {hasScore ? (
          <strong className={styles.readout}>
            {LEVEL_LABELS[level]} · %{normalized}
          </strong>
        ) : null}
      </div>

      {hasScore ? (
        <div
          className={styles.meter}
          role="meter"
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalized}
          aria-valuetext={`${LEVEL_LABELS[level]}, yüzde ${normalized}`}
        >
          <span className={styles.fill} style={{ transform: `scaleX(${normalized / 100})` }} />
        </div>
      ) : (
        <p className={styles.unmeasured} role="note">
          Ölçülmedi — sonucu doğrulayın.
        </p>
      )}

      {factors.length ? (
        <ul className={styles.factors} aria-label="Güven düzeyini etkileyen etkenler">
          {factors.map((factor) => {
            const meta = IMPACT_META[factor.impact ?? 'neutral']
            return (
              <li key={factor.id} className={styles.factor} data-impact={factor.impact ?? 'neutral'}>
                <span className={styles.srOnly}>{meta.sr}: </span>
                <span className={styles.impactGlyph} aria-hidden>
                  {meta.glyph}
                </span>
                <span>{factor.label}</span>
              </li>
            )
          })}
        </ul>
      ) : null}

      <p className={styles.disclaimer}>{DISCLAIMER}</p>
    </div>
  )
}
