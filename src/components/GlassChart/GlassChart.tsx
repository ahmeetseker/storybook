// GlassChart — saf SVG veri grafiği (kütüphane yok). İçerik katmanı FLAT: kart yüzeyi
// `--lg-surface` + `--lg-hairline`, cam/backdrop-filter yok. Üç tür paylaşır tek geometriyi:
// 'line' (yalnız çizgi), 'area' (üstte %26 → şeffaf dikey gradyanlı dolgu + çizgi),
// 'bar' (sütun). Son nokta her türde dolu daire + değer etiketiyle vurgulanır.
// Giriş animasyonu yoktur (reduced-motion sorgusuna gerek kalmadan varsayılan uyum) —
// veri anında render edilir; yalnız pointer/tap ile beliren dikey kılavuz + değer
// balonu vardır, o da anlık görünür/gizlenir (transition yok).
import { useEffect, useId, useRef, useState, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from 'react'
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

const VIEW_WIDTH = 600
const PAD_Y = 16
const GRID_FRACTIONS = [0, 1 / 3, 2 / 3, 1]

const formatNumber = (n: number) => Math.round(n).toLocaleString('tr-TR')

// Erişilebilir özet için kısa biçim: 3.900.000 → '3.9M', 4.250.000 → '4.25M', 42.500 → '42.5K'.
// Türkçe ondalık virgülü yerine bilinçli olarak nokta kullanılır (spec örneğiyle birebir).
function formatCompact(n: number): string {
  const abs = Math.abs(n)
  const unit = abs >= 1_000_000 ? 1_000_000 : abs >= 1_000 ? 1_000 : 1
  if (unit === 1) return formatNumber(n)
  const suffix = unit === 1_000_000 ? 'M' : 'K'
  const scaled = Math.round((n / unit) * 100) / 100
  const str = scaled.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${str}${suffix}`
}

const clampPct = (pct: number) => Math.min(94, Math.max(6, pct))

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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const plotRef = useRef<HTMLDivElement>(null)

  const hasData = points.length > 0
  const lastIndex = points.length - 1
  const midIndex = points.length >= 3 ? Math.round((points.length - 1) / 2) : -1
  const showMid = midIndex > 0 && midIndex < lastIndex

  // points kısalırken (rerender) eski hoverIndex sınır dışı kalabilir — state'i de
  // düzelt ki bir sonraki render'a stale/geçersiz index taşınmasın.
  useEffect(() => {
    setHoverIndex((prev) => {
      if (prev === null) return prev
      if (!hasData) return null
      return prev > lastIndex ? lastIndex : prev
    })
  }, [hasData, lastIndex])

  // Render anında ek güvenlik: efekt henüz çalışmadan önceki ilk boyamada bile
  // points[hoverIndex] sınır dışına taşmasın diye clamp edilmiş index kullanılır.
  const clampedHoverIndex = hasData && hoverIndex !== null ? Math.min(hoverIndex, lastIndex) : null

  const plotTop = PAD_Y
  const plotBottom = Math.max(plotTop + 40, height - PAD_Y)
  const plotHeight = plotBottom - plotTop

  const values = hasData ? points.map((p) => p.y) : [0]
  const dataMax = Math.max(...values)
  const dataMin = Math.min(...values)
  const hasNegative = dataMin < 0
  // 'bar' türünde taban her zaman 0 (negatif değer yoksa) — aksi halde eşit/az değişken
  // serilerde tüm sütunlar yMin'e (kendi değerine) eşitlenip sıfır yükseklikte kayboluyordu.
  const yMax = dataMax
  let yMin = type === 'bar' ? (hasNegative ? dataMin : 0) : dataMin
  let yRange = yMax - yMin
  if (yRange === 0) {
    // Dejenere durum (tüm değerler eşit): yapay ±%5 (min 1 birim) aralık uygula ki
    // line/area ortada dursun, bar da tabana yapışıp kaybolmasın.
    const pad = Math.max(Math.abs(yMax), 1) * 0.05
    yMin -= pad
    yRange = pad * 2
  }

  const xScale = (i: number) => (points.length > 1 ? (i / (points.length - 1)) * VIEW_WIDTH : VIEW_WIDTH / 2)
  const yScale = (v: number) => plotTop + (1 - (v - yMin) / yRange) * plotHeight

  const formatValue = (v: number) => `${formatNumber(v)}${valueSuffix}`

  const summaryLabel = title ?? 'Değer grafiği'
  const ariaSummary = !hasData
    ? `${summaryLabel}: veri yok`
    : points.length === 1
      ? `${summaryLabel}: ${formatCompact(points[0].y)}`
      : `${summaryLabel}: ${formatCompact(points[0].y)}'den ${formatCompact(points[lastIndex].y)}'ye`

  const indexFromClientX = (clientX: number): number | null => {
    const el = plotRef.current
    if (!el || !hasData) return null
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return null
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return Math.round(fraction * lastIndex)
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const idx = indexFromClientX(e.clientX)
    if (idx !== null) setHoverIndex(idx)
  }
  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const idx = indexFromClientX(e.clientX)
    if (idx !== null) setHoverIndex(idx)
  }
  const handlePointerLeave = () => setHoverIndex(null)

  const lineD = hasData
    ? `M ${points.map((p, i) => `${xScale(i).toFixed(2)},${yScale(p.y).toFixed(2)}`).join(' L ')}`
    : ''
  const areaD = hasData
    ? `${lineD} L ${xScale(lastIndex).toFixed(2)},${plotBottom} L ${xScale(0).toFixed(2)},${plotBottom} Z`
    : ''
  const barWidth = hasData ? Math.max(6, (VIEW_WIDTH / points.length) * 0.5) : 0

  const hoveredPoint = clampedHoverIndex !== null ? points[clampedHoverIndex] : null
  const lastPoint = hasData ? points[lastIndex] : null

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}

      {hasData ? (
        <>
          <div
            ref={plotRef}
            className={styles.plot}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerLeave}
          >
            <span data-part="y-max" className={styles.yLabel} style={{ top: plotTop, transform: 'translateY(-50%)' }}>
              {formatValue(yMax)}
            </span>
            <span data-part="y-min" className={styles.yLabel} style={{ top: plotBottom, transform: 'translateY(-50%)' }}>
              {formatValue(yMin)}
            </span>

            <svg
              className={styles.svg}
              viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
              preserveAspectRatio="none"
              style={{ height }}
              role="img"
              aria-label={ariaSummary}
            >
              {type === 'area' ? (
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: `color-mix(in srgb, ${tint} 26%, transparent)` }} />
                    <stop offset="100%" style={{ stopColor: 'transparent' }} />
                  </linearGradient>
                </defs>
              ) : null}

              {showGrid
                ? GRID_FRACTIONS.map((f) => {
                    const y = plotTop + f * plotHeight
                    return (
                      <line
                        key={f}
                        data-part="grid"
                        x1={0}
                        x2={VIEW_WIDTH}
                        y1={y}
                        y2={y}
                        stroke="var(--lg-hairline)"
                        strokeWidth={1}
                      />
                    )
                  })
                : null}

              {type === 'bar'
                ? points.map((p, i) => {
                    const barTop = yScale(p.y)
                    return (
                      <rect
                        key={`${p.x}-${i}`}
                        data-part="bar"
                        data-last={i === lastIndex ? 'true' : undefined}
                        x={xScale(i) - barWidth / 2}
                        y={barTop}
                        width={barWidth}
                        height={Math.max(0, plotBottom - barTop)}
                        rx={2}
                        fill={tint}
                        opacity={i === lastIndex ? 1 : 0.5}
                      />
                    )
                  })
                : null}

              {type === 'area' ? <path data-part="area" d={areaD} fill={`url(#${gradId})`} stroke="none" /> : null}

              {type !== 'bar' ? (
                <path
                  data-part="line"
                  d={lineD}
                  fill="none"
                  stroke={tint}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ) : null}

              {clampedHoverIndex !== null ? (
                <g aria-hidden="true">
                  <line
                    data-part="guide"
                    x1={xScale(clampedHoverIndex)}
                    x2={xScale(clampedHoverIndex)}
                    y1={plotTop}
                    y2={plotBottom}
                    stroke={tint}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <circle
                    data-part="guide-dot"
                    cx={xScale(clampedHoverIndex)}
                    cy={yScale(points[clampedHoverIndex].y)}
                    r={4}
                    fill={tint}
                  />
                </g>
              ) : null}

              {lastPoint ? (
                <circle data-part="last-point" cx={xScale(lastIndex)} cy={yScale(lastPoint.y)} r={5} fill={tint} />
              ) : null}
            </svg>

            {lastPoint ? (
              <span data-part="last-label" className={styles.lastLabel} style={{ top: yScale(lastPoint.y) }}>
                {formatValue(lastPoint.y)}
              </span>
            ) : null}

            {hoveredPoint && clampedHoverIndex !== null ? (
              <div
                data-part="tooltip"
                className={styles.tooltip}
                aria-hidden="true"
                style={{ left: `${clampPct((xScale(clampedHoverIndex) / VIEW_WIDTH) * 100)}%` }}
              >
                <span className={styles.tooltipX}>{hoveredPoint.x}</span>
                <span className={styles.tooltipY}>{formatValue(hoveredPoint.y)}</span>
              </div>
            ) : null}
          </div>

          <div data-part="x-labels" className={styles.xLabels} aria-hidden="true">
            <span>{points[0].x}</span>
            <span>{showMid ? points[midIndex].x : ''}</span>
            <span>{lastIndex > 0 ? points[lastIndex].x : ''}</span>
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
