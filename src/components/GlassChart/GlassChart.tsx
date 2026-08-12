// GlassChart — tek serili zaman serisi, Recharts 3 üstünde. İçerik katmanı FLAT:
// kart yüzeyi `--lg-surface` + `--lg-hairline`, cam/backdrop-filter yok. Üç tür
// paylaşır tek sözleşmeyi: 'line' (yalnız çizgi), 'area' (üstte %26 → şeffaf
// dikey gradyanlı dolgu + çizgi), 'bar' (sütun). Son nokta her türde dolu daire
// + değer etiketiyle vurgulanır.
//
// Recharts kararları (bkz. rules.md changelog 2026-08-12):
//   - ResponsiveContainer YOK — genişlik `useElementSize` ile ölçülür; jsdom ve
//     SSR'da 600'e düşer, ölçüm gelince gerçek genişlik uygulanır (deterministik).
//   - Tooltip içeriği bizim (mevcut balon dili); Recharts yalnız konum ve
//     crosshair imlecini yönetir. `accessibilityLayer` v3'te varsayılan açık —
//     grafik klavyeyle gezilebilir.
//   - Giriş animasyonu kapalıdır (isAnimationActive={false}): veri anında
//     çizilir, reduced-motion sorgusuna gerek kalmaz (eski davranışla aynı).
import { useId, type HTMLAttributes } from 'react'
import {
  Area,
  Bar,
  Cell,
  ComposedChart,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { useElementSize } from '../GlassSurface/useElementSize'
import styles from './GlassChart.module.css'

export interface GlassChartPoint {
  /** X ekseni etiketi — kısa tarih/dönem metni (ör. 'Oca 26') */
  x: string
  /** Y değeri — ör. TL fiyat, TL/m² birim fiyat */
  y: number
}

export type GlassChartType = 'line' | 'area' | 'bar'

export interface GlassChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Grafik türü — 'line': yalnız çizgi, 'area': gradyanlı dolgu, 'bar': sütun. Varsayılan 'line'. */
  type?: GlassChartType
  /** Veri noktaları — soldan sağa, sıradaki gibi çizilir (zorunlu, boş dizi "Veri yok" gösterir) */
  points: GlassChartPoint[]
  /** Vurgu rengi — CSS renk değeri; varsayılan `var(--lg-accent)` */
  tint?: string
  /** Grafik alanının yüksekliği (px) */
  height?: number
  /** Değerlerin sonuna eklenen birim metni (ör. ' TL', ' TL/m²') */
  valueSuffix?: string
  /** Soluk yatay grid çizgilerini göster */
  showGrid?: boolean
  /** Kart başlığı — verilirse görünür `h3` olur ve erişilebilir özetin önekidir */
  title?: string
}

const FALLBACK_WIDTH = 600

const formatNumber = (n: number) => Math.round(n).toLocaleString('tr-TR')

// Erişilebilir özet ve eksen tikleri için kısa biçim: 3.900.000 → '3.9M',
// 42.500 → '42.5K'. Türkçe ondalık virgülü yerine bilinçli olarak nokta
// kullanılır (spec örneğiyle birebir).
function formatCompact(n: number): string {
  const abs = Math.abs(n)
  const unit = abs >= 1_000_000 ? 1_000_000 : abs >= 1_000 ? 1_000 : 1
  if (unit === 1) return formatNumber(n)
  const suffix = unit === 1_000_000 ? 'M' : 'K'
  const scaled = Math.round((n / unit) * 100) / 100
  const str = scaled.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${str}${suffix}`
}

const AXIS_TICK = { fill: 'var(--lg-label-secondary)', fontSize: 11 } as const

export function GlassChart({
  type = 'line',
  points,
  tint = 'var(--lg-accent)',
  height = 220,
  valueSuffix = ' TL',
  showGrid = true,
  title,
  className,
  ...rest
}: GlassChartProps) {
  const rawGradId = useId()
  const gradId = `glasschart-grad-${rawGradId.replace(/[^a-zA-Z0-9]/g, '')}`
  const { ref, size } = useElementSize<HTMLDivElement>()

  const hasData = points.length > 0
  const lastIndex = points.length - 1
  const width = size?.width && size.width > 0 ? size.width : FALLBACK_WIDTH

  const formatValue = (v: number) => `${formatNumber(v)}${valueSuffix}`

  const summaryLabel = title ?? 'Değer grafiği'
  const ariaSummary = !hasData
    ? `${summaryLabel}: veri yok`
    : points.length === 1
      ? `${summaryLabel}: ${formatCompact(points[0].y)}`
      : `${summaryLabel}: ${formatCompact(points[0].y)}'den ${formatCompact(points[lastIndex].y)}'ye`

  // Bar tabanı 0'dır (negatif yoksa) — eşit/az değişken serilerde sütunlar
  // kaybolmasın; line/area veri aralığına oturur, %5 nefes payıyla.
  const yDomain: [unknown, unknown] =
    type === 'bar'
      ? [(dataMin: number) => Math.min(0, dataMin), 'auto']
      : [
          (dataMin: number) => (dataMin === 0 ? 0 : dataMin - Math.abs(dataMin) * 0.05),
          (dataMax: number) => dataMax + Math.abs(dataMax) * 0.05,
        ]

  // Son nokta vurgusu: yalnız son index'te dolu daire + değer etiketi.
  const lastDot = (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props
    if (index !== lastIndex || cx === undefined || cy === undefined) {
      return <g key={`dot-${index}`} />
    }
    return <circle key={`dot-${index}`} data-part="last-point" cx={cx} cy={cy} r={5} fill={tint} />
  }
  // Recharts label renderer'ının Props tipi zengin/değişken — parametre unknown
  // alınıp içeride daraltılır (x/y/value string|number gelebilir, sayıya indirger).
  const lastLabel = (rawProps: unknown) => {
    const props = rawProps as { x?: number | string; y?: number | string; index?: number; value?: number | string }
    const { index } = props
    const x = Number(props.x)
    const y = Number(props.y)
    const value = Number(props.value)
    if (index !== lastIndex || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(value)) {
      return <g key={`label-${index}`} />
    }
    // Etiket sağ kenardan taşmasın: son noktada sağa değil sola yazılır.
    return (
      <text
        key={`label-${index}`}
        data-part="last-label"
        x={x - 8}
        y={y - 10}
        textAnchor="end"
        className={styles.lastLabel}
      >
        {formatValue(value)}
      </text>
    )
  }

  const tooltipContent = (props: TooltipContentProps) => {
    const { active, payload, label } = props
    if (!active || !payload?.length) return null
    return (
      <div data-part="tooltip" className={styles.tooltip}>
        <span className={styles.tooltipX}>{label}</span>
        <span className={styles.tooltipY}>{formatValue(payload[0].value as number)}</span>
      </div>
    )
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}

      {hasData ? (
        <>
          <div ref={ref} className={styles.plot} role="img" aria-label={ariaSummary}>
            <ComposedChart
              width={width}
              height={height}
              data={points}
              margin={{ top: 24, right: 8, bottom: 4, left: 0 }}
              barCategoryGap="25%"
            >
              {type === 'area' ? (
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: `color-mix(in srgb, ${tint} 26%, transparent)` }} />
                    <stop offset="100%" style={{ stopColor: 'transparent' }} />
                  </linearGradient>
                </defs>
              ) : null}

              {showGrid ? (
                <CartesianGrid vertical={false} stroke="var(--lg-hairline)" strokeWidth={1} />
              ) : null}

              <XAxis
                dataKey="x"
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                minTickGap={32}
                interval="preserveStartEnd"
                tickMargin={8}
              />
              <YAxis
                width={56}
                domain={yDomain as [number, number]}
                tickCount={4}
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                tickFormatter={formatCompact}
              />

              <Tooltip
                content={tooltipContent}
                cursor={{ stroke: 'var(--lg-label-secondary)', strokeWidth: 1, strokeDasharray: '3 3' }}
                isAnimationActive={false}
              />

              {type === 'bar' ? (
                <Bar dataKey="y" fill={tint} radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false}>
                  {points.map((p, i) => (
                    <Cell key={`${p.x}-${i}`} opacity={i === lastIndex ? 1 : 0.5} />
                  ))}
                </Bar>
              ) : null}

              {type === 'area' ? (
                <Area
                  dataKey="y"
                  stroke="none"
                  fill={`url(#${gradId})`}
                  isAnimationActive={false}
                  activeDot={false}
                />
              ) : null}

              {type !== 'bar' ? (
                <Line
                  dataKey="y"
                  stroke={tint}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={lastDot}
                  label={lastLabel}
                  activeDot={{ r: 4, fill: tint, stroke: 'var(--lg-surface)', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ) : null}
            </ComposedChart>
          </div>

          {/* Ekran okuyucu tablosu blok bir kapta gizlenir: `overflow: hidden`
              table öğesinde yok sayıldığı için doğrudan tabloya uygulanınca
              sayfada yatay taşma üretiyordu. */}
          <div className={styles.srOnly}>
            <table data-part="data-table">
              <caption>{ariaSummary} — tam veri tablosu</caption>
              <thead>
                <tr>
                  <th scope="col">Dönem</th>
                  <th scope="col">Değer</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, i) => (
                  <tr key={`${p.x}-${i}`}>
                    <th scope="row">{p.x}</th>
                    <td>{formatValue(p.y)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className={styles.empty}>Veri yok</p>
      )}
    </div>
  )
}
