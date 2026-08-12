// GlassTrendChart — çok serili zaman serisi, Recharts 3 üstünde. GlassChart'ın
// tek serili sözleşmesini genişletmez, onun YANINDA yaşar: GlassChart bir değerin
// seyrini gösterir, bu component bir değeri BAŞKA bir seriyle kıyaslar
// (mahalle ↔ ilçe ↔ resmî endeks).
//
// Üç karar bu component'in şeklini belirlemeye devam eder:
//   1. Seri türü çizgi desenine bağlıdır, yalnız renge değil: `observed` düz,
//      `benchmark` uzun kesikli, `estimated` kısa kesikli. Renk körlüğünde ve
//      tek renkli baskıda seriler yine ayırt edilir.
//   2. Tooltip PAYLAŞIMLIDIR — imleç bir x'e geldiğinde tüm serilerin o
//      dönemdeki değeri birlikte okunur (Recharts shared tooltip).
//   3. Varsayılan palet semantik token kullanmaz: success/danger "iyi/kötü"
//      demektir; bir kıyas serisi ne iyidir ne kötü.
//
// Recharts kararları GlassChart ile ortak (bkz. rules.md changelog 2026-08-12):
// ResponsiveContainer yerine useElementSize (jsdom/SSR 600 fallback), custom
// tooltip içeriği, animasyon kapalı, `accessibilityLayer` v3 varsayılanı açık.
import { type HTMLAttributes, useId } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { useElementSize } from '../GlassSurface/useElementSize'
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

const FALLBACK_WIDTH = 600

/**
 * Semantik olmayan palet — sıra AÇIKLIK ZITLIĞIYLA serpiştirilir (koyu vurgu →
 * açık ten → koyu nötr → açık nötr). Eski sıralamada 2.-3. seriler normal
 * görüşte bile ayırt edilemiyordu (dataviz doğrulayıcısı ΔE 5.9, taban 15);
 * bu dizilim komşu çiftlerde ΔE ≥ 25 verir (CVD dahil). Nötrlerin düşük
 * kroması bilinçlidir: kıyas serileri eşit kategori değil bağlamdır ve
 * kimlikleri kesik deseni + künyeyle (ikincil kanal) taşınır.
 */
const DEFAULT_TINTS = [
  'var(--lg-accent)',
  'color-mix(in srgb, var(--lg-accent) 55%, var(--lg-surface))',
  'var(--lg-label-secondary)',
  'color-mix(in srgb, var(--lg-label-secondary) 45%, var(--lg-surface))',
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

function formatCompact(n: number): string {
  const abs = Math.abs(n)
  const unit = abs >= 1_000_000 ? 1_000_000 : abs >= 1_000 ? 1_000 : 1
  if (unit === 1) return formatNumber(n)
  const suffix = unit === 1_000_000 ? 'M' : 'K'
  const scaled = Math.round((n / unit) * 100) / 100
  return `${scaled.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}${suffix}`
}

const AXIS_TICK = { fill: 'var(--lg-label-secondary)', fontSize: 11 } as const

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
  const { ref, size } = useElementSize<HTMLDivElement>()

  const axis = series[0]?.points ?? []
  const hasData = series.length > 0 && axis.length > 0
  const width = size?.width && size.width > 0 ? size.width : FALLBACK_WIDTH

  const formatValue = (v: number | null | undefined) =>
    v === null || v === undefined ? 'veri yok' : `${formatNumber(v)}${valueSuffix}`

  let benchmarkSayaci = 0
  const resolved = series.map((s, i) => {
    const kind = s.kind ?? 'observed'
    const dash = dashFor(kind, kind === 'benchmark' ? benchmarkSayaci++ : 0)
    return { ...s, kind, dash, tint: s.tint ?? DEFAULT_TINTS[i % DEFAULT_TINTS.length] }
  })

  // Recharts tek veri dizisi ister: seriler x eksenine göre satırlara birleşir.
  // İlk seri ekseni belirler (sözleşme); null değer satırda korunur — Recharts
  // connectNulls=false (varsayılan) ile çizgide boşluk bırakır.
  const rows = axis.map((p, i) => {
    const row: Record<string, string | number | null> = { x: p.x }
    for (const s of resolved) row[s.id] = s.points[i]?.y ?? null
    return row
  })

  const summaryLabel = title ?? 'Karşılaştırmalı seyir grafiği'
  const ariaSummary = !hasData
    ? `${summaryLabel}: veri yok`
    : `${summaryLabel}: ${resolved.map((s) => s.label).join(', ')} — ${axis.length} dönem`

  const tooltipContent = (props: TooltipContentProps) => {
    const { active, payload, label } = props
    if (!active || !payload?.length) return null
    return (
      <div data-part="tooltip" className={styles.tooltip}>
        <span className={styles.tooltipX}>{label}</span>
        {resolved.map((s) => {
          const entry = payload.find((p) => p.dataKey === s.id)
          return (
            <span key={s.id} className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: s.tint }} aria-hidden="true" />
              <span className={styles.tooltipName}>{s.label}</span>
              <span className={styles.tooltipValue}>{formatValue(entry?.value as number | null | undefined)}</span>
            </span>
          )
        })}
      </div>
    )
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

          <div ref={ref} className={styles.plot} role="img" aria-label={ariaSummary}>
            <LineChart
              width={width}
              height={height}
              data={rows}
              margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
            >
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
                width={44}
                domain={['auto', 'auto']}
                tickCount={4}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                tickFormatter={formatCompact}
              />

              {/* Balon çizim alanına kilitlidir: allowEscapeViewBox=false (v3
                  varsayılanı, sözleşme olarak sabitlendi) ile Recharts wrapper'ı
                  ölçer, imleci takip eder ve kenarlarda plot içine iter. Bunun
                  çalışması için tooltip içeriği statik akışta kalmalı —
                  .tooltip'e position/transform verilmez (bkz. module.css notu). */}
              <Tooltip
                content={tooltipContent}
                allowEscapeViewBox={{ x: false, y: false }}
                cursor={{ stroke: 'var(--lg-label-secondary)', strokeWidth: 1, strokeDasharray: '3 3' }}
                isAnimationActive={false}
              />

              {resolved.map((s) => (
                <Line
                  key={s.id}
                  dataKey={s.id}
                  stroke={s.tint}
                  strokeWidth={s.kind === 'observed' ? 2.5 : 2}
                  strokeDasharray={s.dash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={s.kind === 'observed' ? 1 : 0.85}
                  dot={false}
                  activeDot={{ r: 4, fill: s.tint, stroke: 'var(--lg-surface)', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
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
