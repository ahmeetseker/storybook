// GlassDistributionChart — fiyat dağılımı histogramı, Recharts 3 üstünde.
// GlassChart'ın `bar` türü bunun yerine geçmez: o SON sütunu vurgular (zaman
// serisinde "bugünkü değer" doğru davranıştır), oysa dağılımda son bant en
// pahalı bantdır ve özel bir anlamı yoktur — vurgulanması yanıltıcıdır. Burada
// vurgulanan MEDYANIN düştüğü banttır; okuma noktası odur (bkz. rules.md §1).
//
// İkinci fark: histogramın altında persentil şeridi vardır. Dağılımın tek
// sayıya indirgenmesini engellemek bu component'in varlık sebebidir.
//
// Recharts kararları GlassChart ile ortak (bkz. rules.md changelog 2026-08-12):
// useElementSize genişliği (jsdom/SSR 600 fallback), custom tooltip (bant +
// gözlem sayısı — hover artık her bandı okutur), animasyon kapalı.
import { useId, type HTMLAttributes } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { useElementSize } from '../GlassSurface/useElementSize'
import styles from './GlassDistributionChart.module.css'

export interface GlassDistributionBin {
  id: string
  /** Bandın görünür etiketi (ör. '80–90 bin') */
  label: string
  /** Bu banda düşen gözlem sayısı */
  count: number
  /** Medyanın bu banda düştüğünü işaretler — en fazla bir bant true olmalıdır */
  containsMedian?: boolean
}

export interface GlassDistributionMarker {
  id: string
  /** 'P25', 'Medyan' gibi kısa etiket */
  label: string
  /** Biçimlenmiş değer ('82.500 TL/m²') */
  value: string
  /** Vurgulu gösterim — medyan için */
  prominent?: boolean
}

export interface GlassDistributionChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Soldan sağa artan bantlar */
  bins: GlassDistributionBin[]
  /** Persentil şeridi — verilmezse şerit render edilmez */
  markers?: GlassDistributionMarker[]
  /** Sütun yüksekliği (px) */
  height?: number
  /** Gözlem sayısının birimi ("ilan") — erişilebilir metinde geçer */
  countLabel?: string
  /** Kart başlığı */
  title?: string
  /** Toplam gözlem — künyede "n = 121" olarak görünür */
  sampleSize?: number
}

const FALLBACK_WIDTH = 600

const formatNumber = (n: number) => Math.round(n).toLocaleString('tr-TR')

/**
 * Dağılım histogramı — medyan bandını vurgular, altında persentil şeridi taşır.
 * İçerik katmanıdır: düz kart, cam yok.
 */
export function GlassDistributionChart({
  bins,
  markers,
  height = 200,
  countLabel = 'ilan',
  title,
  sampleSize,
  className,
  ...rest
}: GlassDistributionChartProps) {
  const rawId = useId()
  const tableId = `dist-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const { ref, size } = useElementSize<HTMLDivElement>()

  const hasData = bins.length > 0
  const width = size?.width && size.width > 0 ? size.width : FALLBACK_WIDTH

  const total = bins.reduce((sum, b) => sum + b.count, 0)
  const medianBin = bins.find((b) => b.containsMedian)

  const summaryLabel = title ?? 'Dağılım grafiği'
  const ariaSummary = !hasData
    ? `${summaryLabel}: veri yok`
    : `${summaryLabel}: ${bins.length} bant, toplam ${formatNumber(total)} ${countLabel}${
        medianBin ? `, medyan ${medianBin.label} bandında` : ''
      }`

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {title || sampleSize !== undefined ? (
        <div className={styles.head}>
          {title ? <h3 className={styles.title}>{title}</h3> : null}
          {sampleSize !== undefined ? (
            <span className={styles.sample}>
              n = {formatNumber(sampleSize)} {countLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {hasData ? (
        <>
          <div ref={ref} className={styles.plot} role="img" aria-label={ariaSummary}>
            <BarChart
              width={width}
              height={height}
              data={bins}
              margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
              barCategoryGap="19%"
            >
              <XAxis dataKey="label" hide />
              <YAxis hide domain={[0, 'auto']} />

              <Tooltip
                content={(props: TooltipContentProps) => {
                  const { active, payload, label } = props
                  if (!active || !payload?.length) return null
                  const bin = payload[0].payload as GlassDistributionBin
                  return (
                    <div data-part="tooltip" className={styles.tooltip}>
                      <span className={styles.tooltipX}>
                        {label}
                        {bin.containsMedian ? ' · medyan bandı' : ''}
                      </span>
                      <span className={styles.tooltipY}>
                        {formatNumber(bin.count)} {countLabel}
                      </span>
                    </div>
                  )
                }}
                cursor={{ fill: 'color-mix(in srgb, var(--lg-label) 5%, transparent)' }}
                isAnimationActive={false}
              />

              {/* Medyan bandının üstüne dikey işaret — renkten bağımsız ikinci kanal */}
              {medianBin ? (
                <ReferenceLine
                  x={medianBin.label}
                  stroke="var(--lg-accent)"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  opacity={0.55}
                />
              ) : null}

              <Bar dataKey="count" radius={[4, 4, 0, 0]} minPointSize={2} isAnimationActive={false}>
                {bins.map((b) => (
                  <Cell key={b.id} className={b.containsMedian ? styles.binMedian : styles.bin} />
                ))}
              </Bar>
            </BarChart>
          </div>

          <div className={styles.binLabels} aria-hidden="true">
            {bins.map((b) => (
              <span key={b.id} className={b.containsMedian ? styles.binLabelMedian : styles.binLabel}>
                {b.label}
              </span>
            ))}
          </div>

          {markers?.length ? (
            <dl className={styles.markers}>
              {markers.map((m) => (
                <div key={m.id} className={m.prominent ? styles.markerStrong : styles.marker}>
                  <dt className={styles.markerLabel}>{m.label}</dt>
                  <dd className={styles.markerValue}>{m.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className={styles.srOnly}>
            <table data-part="data-table" id={tableId}>
              <caption>{ariaSummary} — tam veri tablosu</caption>
              <thead>
                <tr>
                  <th scope="col">Bant</th>
                  <th scope="col">{countLabel}</th>
                </tr>
              </thead>
              <tbody>
                {bins.map((b) => (
                  <tr key={b.id}>
                    <th scope="row">
                      {b.label}
                      {b.containsMedian ? ' (medyan bandı)' : ''}
                    </th>
                    <td>{formatNumber(b.count)}</td>
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
