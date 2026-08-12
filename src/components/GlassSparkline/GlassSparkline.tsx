// GlassSparkline — tablo hücresine sığan eksensiz mikro trend, Recharts 3
// üstünde. GlassChart'ın küçültülmüşü DEĞİLDİR: eksen etiketi, grid, tooltip ve
// başlık taşımaz; tek işi bir satırın yönünü tek bakışta okutmaktır.
//
// Erişilebilirlik kararı: sparkline dekoratif DEĞİL, veridir. Kap `role="img"`
// alır ve `label` zorunludur — ekran okuyucu "Göztepe 12 aylık trend: yükseliş,
// 78.400'den 91.200'e" cümlesini okur. Recharts'ın klavye katmanı burada
// BİLİNÇLİ kapalıdır (accessibilityLayer={false}): sıralama tablosundaki her
// satırın odak durağı olması gezinmeyi boğar; özet zaten kapta okunur.
import type { HTMLAttributes } from 'react'
import { Line, LineChart, YAxis } from 'recharts'
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

  const summary = `${label}: ${TREND_TEXT[resolvedTrend]}, ${formatNumber(points[0])}'den ${formatNumber(points[points.length - 1])}'e`

  const lastIndex = points.length - 1
  const data = points.map((v, i) => ({ i, v }))

  // Son nokta vurgusu: yalnız son index'te küçük dolu daire.
  const lastDot = (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props
    if (index !== lastIndex || cx === undefined || cy === undefined) return <g key={`dot-${index}`} />
    return <circle key={`dot-${index}`} data-part="last-point" cx={cx} cy={cy} r={2} fill={stroke} />
  }

  return (
    <span className={classes} role="img" aria-label={summary} data-trend={resolvedTrend} {...rest}>
      <LineChart
        width={width}
        height={height}
        data={data}
        margin={{ top: 3, right: 3, bottom: 3, left: 3 }}
        accessibilityLayer={false}
      >
        {/* Gizli eksen: aralık veri min–max'ıdır — Recharts'ın 0 tabanı mikro
            trendde çizgiyi düzleştirirdi */}
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Line
          dataKey="v"
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={lastDot}
          activeDot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </span>
  )
}
