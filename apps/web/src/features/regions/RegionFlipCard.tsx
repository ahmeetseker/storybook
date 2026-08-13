// Bölge kartının iki yüzü iki soruya cevap verir: ön yüz "bu bölge nasıl bir
// yatırım?" (metrikler, sinyaller, fiyat grafiği), arka yüz "orada ŞU AN ne
// satılık?" (o bölgenin ilanları gerçek haritada). Çevirme yalnız "Haritada
// gör" butonundan yapılır (hover veya tık) — kartın üstünden geçerken
// istemsiz flip grafiği okumayı bölüyordu.
//
// DAR KARTTA (mobil) flip yoktur: kart yalnız karar verdiren kapağı taşır,
// grafik/sinyaller/harita "İncele" ile açılan alttan tam boy sayfaya
// (GlassDrawer) taşınır. Kapak ile sayfa arasındaki ayrım CSS container
// query'siyle yapılır; sheet içeriği açılana dek mount edilmez.
import { useEffect, useMemo, useState } from 'react'
import { GlassDrawer, GlassMap, GlassTrendChart } from '@repo/ui'
import { pointBasemap } from '@/config/basemap'
import { listingsForRegion, type RegionListingPin } from './data/region-listings'
import { regionPriceSeries } from './data/region-price-series'
import type { RegionMatch, RegionSummary } from './domain/region-types'
import styles from './RegionFlipCard.module.css'

export interface RegionFlipCardProps {
  region: RegionSummary
  match?: RegionMatch
  compared: boolean
  onSelect(): void
  onToggleCompare(): void
  /** Haritadaki önizlemenin "İlana git" eylemi — üst katman rotaya çevirir. */
  onOpenListing?(listingId: string): void
}

/** Bölge merkezini ilçe ölçeğinde kadraja alır; kullanıcı oradan iner. */
const REGION_ZOOM = 12

/**
 * Bölgenin ilan haritası + alt kenara demirli önizleme. Flip'in arka yüzü ve
 * mobil sheet aynı paneli paylaşır; önizleme durumu panelin kendi meselesidir.
 * Önizleme pine çapalanmaz: GlassMap'in kendi popup'ı bilerek kırpılmadığından
 * kısa panelde kartın dışına taşıyordu — demirli kart hep haritanın içindedir.
 */
function RegionMapPanel({
  region,
  pins,
  visible,
  onOpenListing,
}: {
  region: RegionSummary
  pins: RegionListingPin[]
  /** Panel görünür değilken (kart öne dönmüş) açık önizleme sıfırlanır. */
  visible: boolean
  onOpenListing?(listingId: string): void
}) {
  const [previewId, setPreviewId] = useState<string>()
  useEffect(() => {
    if (!visible) setPreviewId(undefined)
  }, [visible])

  const basemap = useMemo(
    () => pointBasemap([region.coordinates.lat, region.coordinates.lng], REGION_ZOOM),
    [region.coordinates.lat, region.coordinates.lng],
  )
  const preview = previewId ? pins.find((pin) => pin.id === previewId) : undefined

  return (
    <div className={styles.mapArea}>
      {pins.length ? (
        <GlassMap
          className={styles.map}
          variant="panel"
          label={`${region.title} ilan haritası`}
          pins={pins}
          basemap={basemap}
          cluster
          selectedId={previewId ?? null}
          onPinSelect={(pinId) => setPreviewId(pinId ?? undefined)}
        />
      ) : (
        <div className={styles.mapEmpty}>
          <strong>Bu bölgede haritalanmış ilan yok</strong>
          <p>Vitrindeki ilanlar başka bölgelerde. Bölgeyi inceleyerek fiyat ve arz sinyallerine bakabilirsiniz.</p>
        </div>
      )}
      {preview ? (
        <div className={styles.preview} role="group" aria-label={`${preview.title} önizlemesi`}>
          <button
            type="button"
            className={styles.previewClose}
            aria-label="Önizlemeyi kapat"
            onClick={() => setPreviewId(undefined)}
          >
            ×
          </button>
          <div className={styles.previewBody}>
            <img className={styles.previewImage} src={preview.image.src} alt={preview.image.alt} loading="lazy" />
            <div className={styles.previewInfo}>
              <p className={styles.previewTitle}>{preview.title}</p>
              <p className={styles.previewMeta}>{preview.meta}</p>
              <div className={styles.previewBadges}>
                <span className={styles.previewBadge} data-tone={preview.verified ? 'success' : 'warning'}>
                  {preview.verified ? '✓ Doğrulanmış' : 'Doğrulanmamış'}
                </span>
                <span className={styles.previewBadge} data-tone="accent">AI uyum %{preview.aiScore}</span>
              </div>
            </div>
          </div>
          <p className={styles.previewNote}>{preview.aiNote}</p>
          <div className={styles.previewFooter}>
            <strong className={styles.previewPrice}>{preview.fullPrice}</strong>
            <button type="button" className={styles.previewAction} onClick={() => onOpenListing?.(preview.id)}>
              İlana git <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function RegionFlipCard({ region, match, compared, onSelect, onToggleCompare, onOpenListing }: RegionFlipCardProps) {
  const [hovered, setHovered] = useState(false)
  const [pinnedOpen, setPinnedOpen] = useState(false)
  // Leaflet + tile yükü kart başına pahalı: 6 kartın haritası sayfa açılışında
  // değil, kart İLK kez çevrildiğinde kurulur ve sonra sıcak kalır.
  const [everFlipped, setEverFlipped] = useState(false)
  // Mobil "İncele" sayfası — GlassDrawer kapalıyken içeriğini mount etmez.
  const [sheetOpen, setSheetOpen] = useState(false)
  const flipped = hovered || pinnedOpen

  const pins = useMemo(() => listingsForRegion(region), [region])
  // Ön yüzün grafiği: 12 aylık m² fiyat serisi, endeksle aynı üreticiden.
  const priceSeries = useMemo(
    () =>
      regionPriceSeries(region).map((point) => ({ x: point.period, y: point.value })),
    [region],
  )
  // Kapağın dekoratif arka çizgisi — grafiğin kendisi mobil sayfadadır.
  const coverSparkPoints = useMemo(() => {
    const values = priceSeries.map((point) => point.y ?? 0)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 320
        const y = 64 - ((value - min) / span) * 52
        return `${Math.round(x)},${Math.round(y)}`
      })
      .join(' ')
  }, [priceSeries])

  const flip = (next: boolean) => {
    if (next) setEverFlipped(true)
    setPinnedOpen(next)
  }

  const signalChips = region.signals.map((signal) => (
    <span key={signal.evidenceId} className={styles.signal} data-tone={signal.tone}>
      {signal.label}: {signal.value}
    </span>
  ))
  const trendChart = (
    <GlassTrendChart
      series={[{ id: `${region.id}-m2`, label: 'Son 12 ay m² fiyatı', points: priceSeries }]}
      height={176}
      valueSuffix=" ₺/m²"
      showGrid={false}
    />
  )

  return (
    <article
      className={styles.root}
      data-flipped={flipped ? 'true' : 'false'}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.inner}>
        <section className={`${styles.face} ${styles.front}`} inert={flipped || undefined} aria-label={`${region.title} bölge özeti`}>
          <svg className={styles.coverSpark} viewBox="0 0 320 70" preserveAspectRatio="none" aria-hidden="true">
            <polygon points={`0,70 ${coverSparkPoints} 320,70`} />
          </svg>
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
          <div className={styles.signals}>{signalChips}</div>
          <p className={styles.reason}>{match?.reasons[0] ?? 'Bölge profili değerlendirildi.'}</p>
          <div className={styles.chart}>{trendChart}</div>
          <div className={styles.actions}>
            <div className={styles.actionGroup}>
              <button type="button" className={styles.textButton} onClick={onSelect}>Bölgeyi incele</button>
              <button type="button" className={styles.textButton} onClick={onToggleCompare}>
                {compared ? 'Karşılaştırmadan çıkar' : 'Karşılaştır'}
              </button>
            </div>
            <button
              type="button"
              className={styles.flipButton}
              onMouseEnter={() => {
                setEverFlipped(true)
                setHovered(true)
              }}
              onClick={() => flip(true)}
            >
              Haritada gör
              <span aria-hidden="true" className={styles.flipGlyph}>↺</span>
            </button>
          </div>
          <div className={styles.mobileCta}>
            <button type="button" className={styles.sheetButton} onClick={() => setSheetOpen(true)}>
              İncele <span aria-hidden="true">→</span>
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
          {everFlipped ? (
            <RegionMapPanel region={region} pins={pins} visible={flipped} onOpenListing={onOpenListing} />
          ) : null}
        </section>
      </div>

      <GlassDrawer
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={`${region.title} · bölge detayı`}
        side="bottom"
        size="lg"
      >
        <div className={styles.sheetBody}>
          <div className={styles.signals}>{signalChips}</div>
          <p className={styles.reason}>{match?.reasons[0] ?? 'Bölge profili değerlendirildi.'}</p>
          {trendChart}
          <div className={styles.sheetMap}>
            <RegionMapPanel region={region} pins={pins} visible={sheetOpen} onOpenListing={onOpenListing} />
          </div>
          <div className={styles.actions}>
            <div className={styles.actionGroup}>
              <button type="button" className={styles.textButton} onClick={() => { setSheetOpen(false); onSelect() }}>Bölgeyi incele</button>
              <button type="button" className={styles.textButton} onClick={onToggleCompare}>
                {compared ? 'Karşılaştırmadan çıkar' : 'Karşılaştır'}
              </button>
            </div>
          </div>
        </div>
      </GlassDrawer>
    </article>
  )
}
