import { GlassAlert, GlassChart, type GlassChartPoint, type GlassChartType } from '@repo/ui'

import type {
  AccountInsights,
  AccountSectionError,
  AccountTrendPoint,
} from '../domain/account-types'

import styles from './AccountInsightsPanel.module.css'
import sectionStyles from './AccountSections.module.css'

export interface AccountInsightsPanelProps {
  /** Performans serileri; verilmezse (ve hata da yoksa) bölüm hiç çizilmez. */
  insights?: AccountInsights
  /** Bu bölüme ait yerel yükleme hatası — verilirse yalnız uyarı gösterilir, grafik çizilmez. */
  error?: AccountSectionError
}

/* Grafik yükseklikleri GlassChart'ın `height` prop'una (px sayı) gider; bu API
   bir CSS token'ı kabul etmez, bu yüzden sayı olarak burada durur. İki kademe:
   tam genişlikteki ana grafikler ve yan yana duran küçük grafikler. */
const PRIMARY_CHART_HEIGHT = 200
const COMPACT_CHART_HEIGHT = 160

const countFormat = new Intl.NumberFormat('tr-TR')
const percentFormat = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 })

const formatCount = (value: number) => countFormat.format(value)
const formatPercent = (value: number) => `%${percentFormat.format(value)}`
const formatWithUnit = (value: number, unitLabel: string) =>
  `${formatCount(value)} ${unitLabel}`

type ChangeDirection = 'up' | 'down' | 'flat'

/** Değişim yüzdesini yön işareti + metne çevirir; metin tek başına yeterlidir. */
function describeChange(changePct: number): {
  direction: ChangeDirection
  symbol: string
  text: string
} {
  if (changePct > 0) {
    return { direction: 'up', symbol: '▲', text: `${formatPercent(changePct)} artış` }
  }
  if (changePct < 0) {
    return {
      direction: 'down',
      symbol: '▼',
      text: `${formatPercent(Math.abs(changePct))} azalış`,
    }
  }
  return { direction: 'flat', symbol: '—', text: 'değişim yok' }
}

/** `AccountTrendPoint` → GlassChart sözleşmesi (`label` → x, `value` → y). */
function toChartPoints(series: AccountTrendPoint[]): GlassChartPoint[] {
  return series.map((point) => ({ x: point.label, y: point.value }))
}

/**
 * Grafiğin metin karşılığı: ilk ve son noktayı tam değerle, yönü de kelimeyle
 * yazar. Grafik boşsa GlassChart "Veri yok" gösterir, alt yazı da onu söyler.
 */
function describeTrend(series: AccountTrendPoint[], unitLabel: string): string {
  if (series.length === 0) return 'Bu dönem için veri yok.'

  const first = series[0]
  const last = series[series.length - 1]
  if (series.length === 1) {
    return `${first.label}: ${formatWithUnit(first.value, unitLabel)}.`
  }

  const direction =
    last.value > first.value
      ? 'yükseliş'
      : last.value < first.value
        ? 'düşüş'
        : 'yatay seyir'

  return `${first.label} ${formatWithUnit(first.value, unitLabel)}, ${last.label} ${formatWithUnit(last.value, unitLabel)} — ${direction}.`
}

interface ChartSpec {
  key: string
  type: GlassChartType
  title: string
  series: AccountTrendPoint[]
  /** GlassChart değer biçiminin birim eki (y ekseni/balon/tablo) */
  valueSuffix: string
  /** Alt yazıdaki birim sözcüğü — eksen etiketini uzatmadan anlamı taşır */
  unitLabel: string
  height: number
  /** Geniş kapta iki kolonu birden kaplar */
  wide: boolean
}

/**
 * Hesap özetindeki performans bölümü: dönem özeti şeridi + görüntülenme,
 * mesaj, favori ve harcama grafikleri.
 *
 * Bölüm FLAT'tır (cam yok). `insights` verilmezse ve hata da yoksa `null`
 * döner — boş bir "veri yok" kartı sayfada yer kaplamaz. `error` verildiğinde
 * bölüm başlığı korunur ama grafik çizilmez.
 */
export function AccountInsightsPanel({ insights, error }: AccountInsightsPanelProps) {
  if (error) {
    return (
      <section
        data-account-section="insights"
        data-part="section-error"
        aria-labelledby="account-insights-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={sectionStyles.cardHeadText}>
            <h2 id="account-insights-title" className={sectionStyles.cardTitle}>
              Performans
            </h2>
          </div>
        </div>
        <GlassAlert severity="warning" title="Performans verileri yüklenemedi">
          {error.message}
        </GlassAlert>
      </section>
    )
  }

  if (!insights) return null

  const { summary } = insights
  const viewsChange = describeChange(summary.viewsChangePct)
  const messagesChange = describeChange(summary.messagesChangePct)

  const charts: ChartSpec[] = [
    {
      key: 'listing-views',
      type: 'area',
      title: 'Görüntülenme trendi',
      series: insights.listingViews,
      valueSuffix: '',
      unitLabel: 'görüntülenme',
      height: PRIMARY_CHART_HEIGHT,
      wide: true,
    },
    {
      key: 'messages',
      type: 'line',
      title: 'Gelen mesajlar',
      series: insights.messages,
      valueSuffix: '',
      unitLabel: 'mesaj',
      height: COMPACT_CHART_HEIGHT,
      wide: false,
    },
    {
      key: 'favorites',
      type: 'line',
      title: 'Favoriye eklenme',
      series: insights.favorites,
      valueSuffix: '',
      unitLabel: 'favori',
      height: COMPACT_CHART_HEIGHT,
      wide: false,
    },
    {
      key: 'spend',
      type: 'bar',
      title: 'Aylık harcama',
      series: insights.spendByMonth,
      valueSuffix: ' TL',
      unitLabel: 'TL',
      height: PRIMARY_CHART_HEIGHT,
      wide: true,
    },
  ]

  return (
    <section
      data-account-section="insights"
      aria-labelledby="account-insights-title"
      className={sectionStyles.card}
    >
      <div className={sectionStyles.cardHead}>
        <div className={sectionStyles.cardHeadText}>
          <h2 id="account-insights-title" className={sectionStyles.cardTitle}>
            Performans
          </h2>
        </div>
        <p data-part="insights-period" className={sectionStyles.cardMeta}>
          {insights.periodLabel}
        </p>
      </div>

      <dl data-part="insights-summary" className={styles.summary}>
        <div data-part="summary-views" className={styles.summaryItem}>
          <dt className={styles.summaryTerm}>Toplam görüntülenme</dt>
          <dd className={styles.summaryValue}>
            <span className={styles.summaryNumber}>{formatCount(summary.totalViews)}</span>
            <span
              data-part="summary-views-change"
              data-direction={viewsChange.direction}
              className={styles.summaryChange}
            >
              <span aria-hidden="true">{viewsChange.symbol}</span>
              {viewsChange.text}
            </span>
          </dd>
        </div>

        <div data-part="summary-messages" className={styles.summaryItem}>
          <dt className={styles.summaryTerm}>Toplam mesaj</dt>
          <dd className={styles.summaryValue}>
            <span className={styles.summaryNumber}>
              {formatCount(summary.totalMessages)}
            </span>
            <span
              data-part="summary-messages-change"
              data-direction={messagesChange.direction}
              className={styles.summaryChange}
            >
              <span aria-hidden="true">{messagesChange.symbol}</span>
              {messagesChange.text}
            </span>
          </dd>
        </div>

        <div data-part="summary-contact-rate" className={styles.summaryItem}>
          <dt className={styles.summaryTerm}>İletişim oranı</dt>
          <dd className={styles.summaryValue}>
            <span className={styles.summaryNumber}>
              {formatPercent(summary.contactRatePct)}
            </span>
            <span className={styles.summaryNote}>
              Görüntülenmelerin mesaja dönüşme oranı
            </span>
          </dd>
        </div>
      </dl>

      <div data-part="insights-charts" className={styles.chartGrid}>
        {charts.map((chart) => (
          <figure
            key={chart.key}
            data-part={`chart-${chart.key}`}
            className={[styles.chart, chart.wide ? styles.chartWide : null]
              .filter(Boolean)
              .join(' ')}
          >
            <GlassChart
              type={chart.type}
              title={chart.title}
              points={toChartPoints(chart.series)}
              valueSuffix={chart.valueSuffix}
              height={chart.height}
            />
            <figcaption className={styles.chartNote}>
              {describeTrend(chart.series, chart.unitLabel)}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
