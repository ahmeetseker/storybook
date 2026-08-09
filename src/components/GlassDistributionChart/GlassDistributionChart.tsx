// GlassDistributionChart — fiyat dağılımı histogramı. GlassChart'ın `bar` türü
// bunun yerine geçmez: o SON sütunu vurgular (zaman serisinde "bugünkü değer"
// doğru davranıştır), oysa dağılımda son bant en pahalı bantdır ve özel bir
// anlamı yoktur — vurgulanması yanıltıcıdır. Burada vurgulanan MEDYANIN
// düştüğü banttır; okuma noktası odur (bkz. rules.md §1).
//
// İkinci fark: histogramın altında persentil şeridi vardır. Dağılımın tek
// sayıya indirgenmesini engellemek bu component'in varlık sebebidir.
import { useId, type HTMLAttributes } from 'react'
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

const VIEW_WIDTH = 600
const PAD_Y = 8

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

  const hasData = bins.length > 0
  const maxCount = hasData ? Math.max(...bins.map((b) => b.count)) : 0
  const plotTop = PAD_Y
  const plotBottom = Math.max(plotTop + 32, height - PAD_Y)
  const plotHeight = plotBottom - plotTop

  const slot = hasData ? VIEW_WIDTH / bins.length : VIEW_WIDTH
  const barWidth = Math.max(6, slot * 0.62)

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
          <div className={styles.plot}>
            <svg
              className={styles.svg}
              viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
              preserveAspectRatio="none"
              style={{ height }}
              role="img"
              aria-label={ariaSummary}
            >
              {bins.map((b, i) => {
                const h = maxCount > 0 ? (b.count / maxCount) * plotHeight : 0
                const cx = slot * i + slot / 2
                return (
                  <rect
                    key={b.id}
                    data-part="bin"
                    data-median={b.containsMedian ? 'true' : undefined}
                    x={cx - barWidth / 2}
                    y={plotBottom - h}
                    width={barWidth}
                    height={Math.max(0, h)}
                    rx={2}
                    className={b.containsMedian ? styles.binMedian : styles.bin}
                  />
                )
              })}

              {/* Medyan bandının üstüne dikey işaret — renkten bağımsız ikinci kanal */}
              {medianBin
                ? (() => {
                    const i = bins.indexOf(medianBin)
                    const cx = slot * i + slot / 2
                    return (
                      <line
                        data-part="median-mark"
                        x1={cx}
                        x2={cx}
                        y1={plotTop}
                        y2={plotBottom}
                        stroke="var(--lg-accent)"
                        strokeWidth={1}
                        strokeDasharray="4 3"
                        opacity={0.55}
                      />
                    )
                  })()
                : null}
            </svg>
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
