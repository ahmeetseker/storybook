// GlassSparkline — tablo hücresine sığan eksensiz mikro trend. GlassChart'ın
// küçültülmüşü DEĞİLDİR: eksen etiketi, grid, tooltip ve başlık taşımaz; tek işi
// bir satırın yönünü tek bakışta okutmaktır. GlassChart min 220px yüksekliğiyle
// hücreye giremez, bu yüzden ayrı component (bkz. rules.md §1).
//
// Erişilebilirlik kararı: sparkline dekoratif DEĞİL, veridir. SVG `role="img"`
// alır ve `label` zorunludur — ekran okuyucu "Göztepe 12 aylık trend: yükseliş,
// 78.400'den 91.200'e" cümlesini okur. Yön ayrıca son noktanın konumundan değil,
// açıkça `trend` prop'undan gelir; renk tek başına kanal değildir.
import type { HTMLAttributes } from 'react'
import styles from './GlassSparkline.module.css'

/** Serinin yön anlamı — sr-only metnin ve rengin kaynağı. */
export type GlassSparklineTrend = 'up' | 'down' | 'steady'

export interface GlassSparklineProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Soldan sağa değerler; en az 2 nokta gerekir (tek nokta trend anlatmaz) */
  points: number[]
  /**
   * Erişilebilir ad — zorunlu. Satırın hangi veriye ait olduğunu söyler
   * ("Göztepe · son 12 ay medyan m² fiyatı").
   */
  label: string
  /** Yön; verilmezse ilk ve son noktadan türetilir */
  trend?: GlassSparklineTrend
  /** Çizgi rengi; verilmezse yönden türetilir */
  tint?: string
  /** Genişlik/yükseklik (px) — hücre yoğunluğuna göre */
  width?: number
  height?: number
}

const TREND_TEXT: Record<GlassSparklineTrend, string> = {
  up: 'yükseliş',
  down: 'düşüş',
  steady: 'yatay',
}

const TREND_TINT: Record<GlassSparklineTrend, string> = {
  up: 'var(--lg-success)',
  down: 'var(--lg-danger)',
  steady: 'var(--lg-label-secondary)',
}

const formatNumber = (n: number) => Math.round(n).toLocaleString('tr-TR')

/** İlk/son karşılaştırması — %1'in altındaki fark "yatay" sayılır. */
function deriveTrend(points: number[]): GlassSparklineTrend {
  if (points.length < 2) return 'steady'
  const first = points[0]
  const last = points[points.length - 1]
  if (first === 0) return last === 0 ? 'steady' : last > 0 ? 'up' : 'down'
  const change = (last - first) / Math.abs(first)
  if (Math.abs(change) < 0.01) return 'steady'
  return change > 0 ? 'up' : 'down'
}

/**
 * Tablo hücresi içi mikro trend çizgisi. Sıralama tablolarında her satırın
 * yönünü sayıya ek olarak gösterir. İçerik katmanıdır: kendi yüzeyi yoktur.
 */
export function GlassSparkline({
  points,
  label,
  trend,
  tint,
  width = 72,
  height = 24,
  className,
  ...rest
}: GlassSparklineProps) {
  const usable = points.length >= 2
  const resolvedTrend = trend ?? deriveTrend(points)
  const stroke = tint ?? TREND_TINT[resolvedTrend]

  const classes = [styles.root, className].filter(Boolean).join(' ')

  if (!usable) {
    return (
      <span className={classes} {...rest}>
        <span className={styles.srOnly}>{label}: trend için yeterli veri yok</span>
        <span className={styles.dash} aria-hidden="true">
          —
        </span>
      </span>
    )
  }

  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || Math.max(Math.abs(max), 1) * 0.05
  const pad = 2
  const plotH = height - pad * 2

  const x = (i: number) => (i / (points.length - 1)) * width
  const y = (v: number) => pad + (1 - (v - min) / range) * plotH

  const d = `M ${points.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' L ')}`
  const lastX = x(points.length - 1)
  const lastY = y(points[points.length - 1])

  const summary = `${label}: ${TREND_TEXT[resolvedTrend]}, ${formatNumber(points[0])}'den ${formatNumber(points[points.length - 1])}'e`

  return (
    <span className={classes} {...rest}>
      <svg
        className={styles.svg}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={summary}
        data-trend={resolvedTrend}
      >
        <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lastX} cy={lastY} r={2} fill={stroke} />
      </svg>
    </span>
  )
}
