// GlassTrendChart — çok serili zaman serisi. GlassChart'ın tek serili sözleşmesini
// genişletmez, onun YANINDA yaşar: GlassChart bir değerin seyrini gösterir, bu
// component bir değeri BAŞKA bir seriyle kıyaslar (mahalle ↔ ilçe ↔ resmî endeks).
//
// Üç karar bu component'in şeklini belirledi:
//   1. Seri türü çizgi desenine bağlıdır, yalnız renge değil: `observed` düz,
//      `benchmark` uzun kesikli, `estimated` kısa kesikli. Renk körlüğünde ve
//      tek renkli baskıda seriler yine ayırt edilir (Erişilebilirlik dokümanı:
//      "renk tek başına anlam taşımaz").
//   2. Tooltip PAYLAŞIMLIDIR — imleç bir x'e geldiğinde tüm serilerin o
//      dönemdeki değeri birlikte okunur. Kıyas component'inde tek seri değeri
//      göstermek amacı boşa çıkarır.
//   3. Varsayılan palet semantik token kullanmaz. success/danger "iyi/kötü"
//      demektir; bir kıyas serisi ne iyidir ne kötü. Palet accent + nötr
//      etiket renginden türetilir.
import { useEffect, useId, useRef, useState, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from 'react'
import styles from './GlassTrendChart.module.css'

export interface GlassTrendPoint {
  /** X ekseni etiketi — kısa dönem metni (ör. 'Oca 26') */
  x: string
  /** Y değeri; `null` veri yayımlanmadığı dönemi anlatır ve çizgide boşluk bırakır */
  y: number | null
}

/**
 * Serinin veri sınıfı — çizgi desenini ve künye rozetini belirler.
 * `observed`: kendi ölçümümüz · `benchmark`: dış/üst bölge referansı ·
 * `estimated`: model çıktısı (tahmin).
 */
export type GlassTrendSeriesKind = 'observed' | 'benchmark' | 'estimated'

export interface GlassTrendSeries {
  id: string
  /** Künyede okunan seri adı (zorunlu — renk tek başına yeterli değildir) */
  label: string
  points: GlassTrendPoint[]
  /** Varsayılan `observed` */
  kind?: GlassTrendSeriesKind
  /** Seri rengini geçersiz kılar; verilmezse sıraya göre varsayılan paletten alınır */
  tint?: string
}

export interface GlassTrendChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Seriler — en az 1. Hepsi aynı x etiketlerini paylaşmalıdır (ilk seri ekseni belirler). */
  series: GlassTrendSeries[]
  /** Çizim alanının yüksekliği (px) */
  height?: number
  /** Değerlerin sonuna eklenen birim metni (ör. ' TL/m²') */
  valueSuffix?: string
  showGrid?: boolean
  /** Kart başlığı — verilirse görünür `h3` olur ve erişilebilir özetin önekidir */
  title?: string
}

const VIEW_WIDTH = 600
const PAD_Y = 16
const GRID_FRACTIONS = [0, 1 / 3, 2 / 3, 1]

/** Semantik olmayan palet: vurgu → nötr → ikisinin karışımı → soluk nötr. */
const DEFAULT_TINTS = [
  'var(--lg-accent)',
  'var(--lg-label-secondary)',
  'color-mix(in srgb, var(--lg-accent) 50%, var(--lg-label-secondary))',
  'color-mix(in srgb, var(--lg-label-secondary) 55%, var(--lg-surface))',
]

/**
 * Kesik deseni iki şey kodlar: seri sınıfı VE — benchmark'lar arasında —
 * hiyerarşik uzaklık. Referanslar veriliş sırasına göre giderek seyrelir
 * (ilçe uzun kesik → il noktalı → ülke seyrek nokta), yani "bölge uzaklaştıkça
 * çizgi zayıflar". Böylece iki referans yalnız renge kalmaz.
 */
const BENCHMARK_DASHES = ['8 4', '2 3', '1 5']
const ESTIMATED_DASH = '5 3 1 3'

function dashFor(kind: GlassTrendSeriesKind, benchmarkOrder: number): string | undefined {
  if (kind === 'observed') return undefined
  if (kind === 'estimated') return ESTIMATED_DASH
  return BENCHMARK_DASHES[Math.min(benchmarkOrder, BENCHMARK_DASHES.length - 1)]
}

const KIND_NOTE: Record<GlassTrendSeriesKind, string> = {
  observed: '',
  benchmark: 'referans',
  estimated: 'tahmin',
}

const formatNumber = (n: number) => Math.round(n).toLocaleString('tr-TR')
const clampPct = (pct: number) => Math.min(92, Math.max(8, pct))

/**
 * Çok serili zaman serisi grafiği — bir bölgenin seyrini üst bölge veya resmî
 * endeksle aynı eksende kıyaslar. İçerik katmanıdır: düz kart, cam yok.
 */
export function GlassTrendChart({
  series,
  height = 260,
  valueSuffix = ' TL',
  showGrid = true,
  title,
  className,
  ...rest
}: GlassTrendChartProps) {
  const rawId = useId()
  const safeId = rawId.replace(/[^a-zA-Z0-9]/g, '')
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const plotRef = useRef<HTMLDivElement>(null)

  const axis = series[0]?.points ?? []
  const hasData = series.length > 0 && axis.length > 0
  const lastIndex = axis.length - 1
  const midIndex = axis.length >= 3 ? Math.round(lastIndex / 2) : -1
  const showMid = midIndex > 0 && midIndex < lastIndex

  // Seri sayısı/uzunluğu değişince eski hoverIndex sınır dışı kalabilir.
  useEffect(() => {
    setHoverIndex((prev) => {
      if (prev === null) return prev
      if (!hasData) return null
      return prev > lastIndex ? lastIndex : prev
    })
  }, [hasData, lastIndex])

  const clampedHover = hasData && hoverIndex !== null ? Math.min(hoverIndex, lastIndex) : null

  const plotTop = PAD_Y
  const plotBottom = Math.max(plotTop + 40, height - PAD_Y)
  const plotHeight = plotBottom - plotTop

  const allValues = series.flatMap((s) => s.points.map((p) => p.y)).filter((v): v is number => v !== null)
  const dataMax = allValues.length ? Math.max(...allValues) : 0
  const dataMin = allValues.length ? Math.min(...allValues) : 0
  let yMin = dataMin
  let yRange = dataMax - dataMin
  if (yRange === 0) {
    // Dejenere durum (tüm değerler eşit): yapay ±%5 aralıkla çizgi ortada dursun.
    const pad = Math.max(Math.abs(dataMax), 1) * 0.05
    yMin -= pad
    yRange = pad * 2
  }

  const xScale = (i: number) => (axis.length > 1 ? (i / (axis.length - 1)) * VIEW_WIDTH : VIEW_WIDTH / 2)
  const yScale = (v: number) => plotTop + (1 - (v - yMin) / yRange) * plotHeight

  const formatValue = (v: number | null) => (v === null ? 'veri yok' : `${formatNumber(v)}${valueSuffix}`)

  let benchmarkSayaci = 0
  const resolved = series.map((s, i) => {
    const kind = s.kind ?? 'observed'
    const dash = dashFor(kind, kind === 'benchmark' ? benchmarkSayaci++ : 0)
    return { ...s, kind, dash, tint: s.tint ?? DEFAULT_TINTS[i % DEFAULT_TINTS.length] }
  })

  const summaryLabel = title ?? 'Karşılaştırmalı seyir grafiği'
  const ariaSummary = !hasData
    ? `${summaryLabel}: veri yok`
    : `${summaryLabel}: ${resolved.map((s) => s.label).join(', ')} — ${axis.length} dönem`

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

  /** null değerlerde çizgiyi koparır — "veri yayımlanmadı" düz çizgiyle doldurulmaz. */
  const pathFor = (points: GlassTrendPoint[]) => {
    let d = ''
    let open = false
    points.forEach((p, i) => {
      if (p.y === null) {
        open = false
        return
      }
      const cmd = open ? 'L' : 'M'
      d += `${d ? ' ' : ''}${cmd} ${xScale(i).toFixed(2)},${yScale(p.y).toFixed(2)}`
      open = true
    })
    return d
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}

      {hasData ? (
        <>
          <ul className={styles.legend}>
            {resolved.map((s) => (
              <li key={s.id} className={styles.legendItem}>
                <svg className={styles.swatch} viewBox="0 0 24 8" aria-hidden="true" focusable="false">
                  <line
                    x1={0}
                    y1={4}
                    x2={24}
                    y2={4}
                    stroke={s.tint}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray={s.dash}
                  />
                </svg>
                <span className={styles.legendLabel}>{s.label}</span>
                {KIND_NOTE[s.kind] ? <span className={styles.legendNote}>{KIND_NOTE[s.kind]}</span> : null}
              </li>
            ))}
          </ul>

          <div
            ref={plotRef}
            className={styles.plot}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerLeave}
          >
            <span data-part="y-max" className={styles.yLabel} style={{ top: plotTop, transform: 'translateY(-50%)' }}>
              {formatValue(dataMax)}
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
              {showGrid
                ? GRID_FRACTIONS.map((f) => (
                    <line
                      key={f}
                      data-part="grid"
                      x1={0}
                      x2={VIEW_WIDTH}
                      y1={plotTop + f * plotHeight}
                      y2={plotTop + f * plotHeight}
                      stroke="var(--lg-hairline)"
                      strokeWidth={1}
                    />
                  ))
                : null}

              {resolved.map((s) => (
                <path
                  key={s.id}
                  data-part="line"
                  data-series={s.id}
                  data-kind={s.kind}
                  d={pathFor(s.points)}
                  fill="none"
                  stroke={s.tint}
                  strokeWidth={s.kind === 'observed' ? 2.5 : 2}
                  strokeDasharray={s.dash}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={s.kind === 'observed' ? 1 : 0.85}
                />
              ))}

              {clampedHover !== null ? (
                <g aria-hidden="true">
                  <line
                    data-part="guide"
                    x1={xScale(clampedHover)}
                    x2={xScale(clampedHover)}
                    y1={plotTop}
                    y2={plotBottom}
                    stroke="var(--lg-label-secondary)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  {resolved.map((s) => {
                    const v = s.points[clampedHover]?.y
                    if (v === null || v === undefined) return null
                    return (
                      <circle
                        key={s.id}
                        data-part="guide-dot"
                        cx={xScale(clampedHover)}
                        cy={yScale(v)}
                        r={4}
                        fill={s.tint}
                      />
                    )
                  })}
                </g>
              ) : null}
            </svg>

            {clampedHover !== null ? (
              <div
                data-part="tooltip"
                className={styles.tooltip}
                aria-hidden="true"
                style={{ left: `${clampPct((xScale(clampedHover) / VIEW_WIDTH) * 100)}%` }}
              >
                <span className={styles.tooltipX}>{axis[clampedHover]?.x}</span>
                {resolved.map((s) => (
                  <span key={s.id} className={styles.tooltipRow}>
                    <span className={styles.tooltipDot} style={{ background: s.tint }} aria-hidden="true" />
                    <span className={styles.tooltipName}>{s.label}</span>
                    <span className={styles.tooltipValue}>{formatValue(s.points[clampedHover]?.y ?? null)}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div data-part="x-labels" className={styles.xLabels} aria-hidden="true">
            <span>{axis[0]?.x}</span>
            <span>{showMid ? axis[midIndex].x : ''}</span>
            <span>{lastIndex > 0 ? axis[lastIndex].x : ''}</span>
          </div>

          {/* Ekran okuyucu tablosu — blok kapta gizlenir (overflow table'da yok sayılır). */}
          <div className={styles.srOnly}>
            <table data-part="data-table" id={`trend-table-${safeId}`}>
              <caption>{ariaSummary} — tam veri tablosu</caption>
              <thead>
                <tr>
                  <th scope="col">Dönem</th>
                  {resolved.map((s) => (
                    <th key={s.id} scope="col">
                      {s.label}
                      {KIND_NOTE[s.kind] ? ` (${KIND_NOTE[s.kind]})` : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {axis.map((p, i) => (
                  <tr key={`${p.x}-${i}`}>
                    <th scope="row">{p.x}</th>
                    {resolved.map((s) => (
                      <td key={s.id}>{formatValue(s.points[i]?.y ?? null)}</td>
                    ))}
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
