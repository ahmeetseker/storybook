// Bölge kartının iki yüzü iki soruya cevap verir: ön yüz "bu bölge nasıl bir
// yatırım?" (metrikler, sinyaller), arka yüz "orada ŞU AN ne satılık?" (o
// bölgenin ilanları gerçek haritada). Hover kartı çevirir; dokunmatik ve
// klavye için aynı iş açık bir butonla yapılır — hover tek yol olamaz.
import { useMemo, useState } from 'react'
import { GlassMap, GlassTrendChart } from '@repo/ui'
import { pointBasemap } from '@/config/basemap'
import { listingsForRegion } from './data/region-listings'
import { regionPriceSeries } from './data/region-price-series'
import type { RegionMatch, RegionSummary } from './domain/region-types'
import styles from './RegionFlipCard.module.css'

export interface RegionFlipCardProps {
  region: RegionSummary
  match?: RegionMatch
  compared: boolean
  onSelect(): void
  onToggleCompare(): void
  /** Haritadaki pinin popup'ından "İlana git" — üst katman rotaya çevirir. */
  onOpenListing?(listingId: string): void
}

/** Bölge merkezini ilçe ölçeğinde kadraja alır; kullanıcı oradan iner. */
const REGION_ZOOM = 12

export function RegionFlipCard({ region, match, compared, onSelect, onToggleCompare, onOpenListing }: RegionFlipCardProps) {
  const [hovered, setHovered] = useState(false)
  const [pinnedOpen, setPinnedOpen] = useState(false)
  // Leaflet + tile yükü kart başına pahalı: 6 kartın haritası sayfa açılışında
  // değil, kart İLK kez çevrildiğinde kurulur ve sonra sıcak kalır.
  const [everFlipped, setEverFlipped] = useState(false)
  const flipped = hovered || pinnedOpen

  const pins = useMemo(() => listingsForRegion(region), [region])
  // Ön yüzün grafiği: 12 aylık m² fiyat serisi, endeksle aynı üreticiden.
  const priceSeries = useMemo(
    () =>
      regionPriceSeries(region).map((point) => ({ x: point.period, y: point.value })),
    [region],
  )
  const basemap = useMemo(
    () => pointBasemap([region.coordinates.lat, region.coordinates.lng], REGION_ZOOM),
    [region.coordinates.lat, region.coordinates.lng],
  )

  const flip = (next: boolean) => {
    if (next) setEverFlipped(true)
    setPinnedOpen(next)
  }

  return (
    <article
      className={styles.root}
      data-flipped={flipped ? 'true' : 'false'}
      onMouseEnter={() => {
        setEverFlipped(true)
        setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.inner}>
        <section className={`${styles.face} ${styles.front}`} inert={flipped || undefined} aria-label={`${region.title} bölge özeti`}>
          <div className={styles.frontBody}>
            <div className={styles.identity}>
              <p className={styles.eyebrow}>{region.city} · {region.district}</p>
              <h3 className={styles.title}>{region.title}</h3>
              <p className={styles.subtitle}>{region.subtitle}</p>
            </div>
            <div className={styles.metrics}>
              <div>
                <strong>{region.pricePerSqm.toLocaleString('tr-TR')} ₺</strong>
                <span>m² fiyatı</span>
              </div>
              <div>
                <strong className={region.priceTrend >= 0 ? styles.positive : styles.caution}>+{region.priceTrend}%</strong>
                <span>12 aylık eğilim</span>
              </div>
              <div>
                <strong>{region.activeListings}</strong>
                <span>aktif ilan</span>
              </div>
            </div>
            <span className={styles.score} aria-label={`Uyum skoru %${match?.score ?? 0}`}>%{match?.score ?? 0}</span>
          </div>
          <div className={styles.signals}>
            {region.signals.map((signal) => (
              <span key={signal.evidenceId} className={styles.signal} data-tone={signal.tone}>
                {signal.label}: {signal.value}
              </span>
            ))}
          </div>
          <p className={styles.reason}>{match?.reasons[0] ?? 'Bölge profili değerlendirildi.'}</p>
          <div className={styles.chart}>
            <GlassTrendChart
              series={[{ id: `${region.id}-m2`, label: 'Son 12 ay m² fiyatı', points: priceSeries }]}
              height={104}
              valueSuffix=" ₺/m²"
              showGrid={false}
            />
          </div>
          <div className={styles.actions}>
            <div className={styles.actionGroup}>
              <button type="button" className={styles.textButton} onClick={onSelect}>Bölgeyi incele</button>
              <button type="button" className={styles.textButton} onClick={onToggleCompare}>
                {compared ? 'Karşılaştırmadan çıkar' : 'Karşılaştır'}
              </button>
            </div>
            <button type="button" className={styles.flipButton} onClick={() => flip(true)}>
              Haritada gör
              <span aria-hidden="true" className={styles.flipGlyph}>↺</span>
            </button>
          </div>
        </section>

        <section className={`${styles.face} ${styles.back}`} inert={!flipped || undefined} aria-label={`${region.title} bölge haritası`}>
          <div className={styles.backHeading}>
            <div>
              <p className={styles.eyebrow}>{region.city} · {region.district}</p>
              <h3 className={styles.title}>
                {region.title}
                <span className={styles.pinCount}>{pins.length ? ` · ${pins.length} ilan haritada` : ''}</span>
              </h3>
            </div>
            <button type="button" className={styles.flipButton} onClick={() => flip(false)}>Bilgilere dön</button>
          </div>
          <div className={styles.mapArea}>
            {everFlipped && pins.length ? (
              <GlassMap
                className={styles.map}
                variant="panel"
                label={`${region.title} ilan haritası`}
                pins={pins}
                basemap={basemap}
                cluster
                // Kart haritası popup taşıyamayacak kadar küçük: GlassMap
                // popup'ı bilerek kırpılmadığı için (kenar pinlerinde
                // okunabilirlik) kısa panelde kartın başlığına taşıyordu.
                // Küçük yüzeyde sözleşme basittir — kapsüle tıkla, ilana git.
                onPinSelect={(pinId) => {
                  if (pinId) onOpenListing?.(pinId)
                }}
              />
            ) : null}
            {everFlipped && !pins.length ? (
              <div className={styles.mapEmpty}>
                <strong>Bu bölgede haritalanmış ilan yok</strong>
                <p>Vitrindeki ilanlar başka bölgelerde. Bölgeyi inceleyerek fiyat ve arz sinyallerine bakabilirsiniz.</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </article>
  )
}
