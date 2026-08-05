import { useId, useMemo } from 'react'
import { GlassMap } from '@repo/ui'
import { pointBasemap } from '@/config/basemap'

import type {
  ListingApproximateGeo,
  ListingLocation,
  ListingNearbyPlace,
} from '../domain/listing-detail-types'
import workspace from '../ListingDetailWorkspace.module.css'
import styles from './ListingLocationSection.module.css'

export interface ListingLocationSectionProps {
  /** İdari konum — il/ilçe her zaman vardır, mahalle bilinmiyorsa yokluğu yazılır */
  location: ListingLocation
  /**
   * Konum çizimi. İki varyantı vardır ve ikisi aynı şeyi iddia etmez:
   * `geographic` yaklaşık koordinattır (mahremiyet dairesi anlamlıdır),
   * `schematic` yalnız bir yerleşimdir (koordinat kaydı yoktur). Hiç yoksa
   * çizim çizilmez, yalnız idari konum metni kalır.
   */
  geo?: ListingApproximateGeo
  /** Çevredeki noktalar — boş/yoksa liste yerine yokluk cümlesi durur */
  nearby?: ListingNearbyPlace[]
}

const kmFormat = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 })

/**
 * Mesafe biçimlemesi — 1 km altı metre, üstü tek ondalıklı kilometre.
 *
 * Bu sayı **kuş uçuşudur**; yürüme/sürüş mesafesi değildir ve çağıran taraf
 * bunu görünür metinle söyler. Geçersiz (sonlu olmayan ya da negatif) değerde
 * uydurma bir mesafe yazılmaz, "Bilinmiyor" döner.
 */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return 'Bilinmiyor'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${kmFormat.format(meters / 1000)} km`
}

/** Nokta türünün görünür karşılığı — bilgi yalnız ikon/renkle taşınmaz, kelimeyle yazılır. */
const NEARBY_KIND_LABELS: Record<ListingNearbyPlace['kind'], string> = {
  transit: 'Ulaşım',
  school: 'Eğitim',
  health: 'Sağlık',
  shopping: 'Alışveriş',
  landmark: 'Öne çıkan nokta',
  coast: 'Sahil',
}

/**
 * Şematik zeminin temsil ettiği kaba görüş genişliği (metre).
 *
 * `GlassMap` Faz 1'de gerçek tile servisi kullanmaz (feature rules.md §13):
 * zemin seed'li şematik bir çizimdir, dolayısıyla ölçeği yoktur. Daire yine de
 * `radiusMeters` ile birlikte büyüsün diye bu taban üzerinden oranlanır —
 * bu bir ölçek iddiası DEĞİLDİR ve görünür metin dairenin ölçekli
 * çizilmediğini açıkça söyler.
 */
const SCHEMATIC_VIEW_METERS = 1200

function privacyRadius(meters: number): number {
  if (!Number.isFinite(meters) || meters <= 0) return 0.12
  return Math.min(0.42, Math.max(0.1, meters / SCHEMATIC_VIEW_METERS))
}

/** Sonlu olmayan mesafe listenin sonuna düşer; sıralama deterministiktir. */
function distanceOrder(place: ListingNearbyPlace): number {
  return Number.isFinite(place.distanceMeters) ? place.distanceMeters : Number.POSITIVE_INFINITY
}

/**
 * Şematik çizimdeki işaretin büyüklüğü (0-1 normalize).
 *
 * Bu bir yarıçap **değildir**: şematik yerleşimde metre cinsinden bir ölçü
 * yoktur, işaret yalnız çizimdeki yeri gösterir. Sabit tutulur ki büyüklüğü
 * bir mesafe iddiası gibi okunmasın.
 */
const SCHEMATIC_MARK_RADIUS = 0.14

const NO_GEO_TEXT =
  'Bu kayıtta haritada gösterilebilecek bir koordinat yok; konum yalnız idari birim düzeyinde biliniyor. Yaklaşık bile olsa bir nokta uydurulmadı.'
const SCHEMATIC_TITLE = 'Şematik yerleşim'
const SCHEMATIC_MAP_LABEL = 'Şematik konum yerleşimi'
const SCHEMATIC_SUMMARY_PREFIX = 'Şematik yerleşim · coğrafi koordinat kaydı yok · kaynak: '
const SCHEMATIC_NOTE =
  'Bu çizim bir harita değildir: kayıtta enlem/boylam bulunmadığı için işaret, arama kaydının şematik yerleşiminden alınmıştır ve gerçek bir noktayı göstermez. İşaretin büyüklüğü bir yarıçap veya mesafe bildirmez; taşınmazın yeri bu kayıtta yalnız il/ilçe düzeyinde biliniyor.'
const NO_NEIGHBOURHOOD_TEXT = 'Mahalle bilgisi bu kayıtta yok.'
const NO_NEARBY_TEXT =
  'Bu ilan için çevredeki noktalar derlenmedi; listenin boş olması çevrede nokta olmadığı anlamına gelmez.'

/**
 * Konum ve çevresi bölümü.
 *
 * Mahremiyet kuralı görünür metindir: haritadaki nokta parselin tam merkezi
 * değildir, `radiusMeters` yarıçaplı bir alanın merkezidir ve konumun kaynağı
 * (`sourceLabel`) gizlenmez.
 *
 * **Şematik varyant** (`kind: 'schematic'`) aynı çizimi kullanır ama başka bir
 * şey söyler: kayıtta coğrafi koordinat yoktur, işaret arama kaydının
 * yerleşiminden gelir ve bir yere karşılık gelmez. Bu yüzden orada ne
 * mahremiyet dairesi cümlesi ne de yarıçap/mesafe geçer — gizlenecek gerçek
 * bir koordinat olmadığı için mahremiyet iddiası da olmaz. Başlık, haritanın
 * erişilebilir adı ve özet satırı varyanta göre değişir; iki varyant hiçbir
 * yerde aynı cümleyi paylaşmaz.
 *
 * Geo hiç yoksa çizim çizilmez — kesinlik iddiası üretilmez, yalnız idari
 * konum metni kalır. Çizim dekoratif değil:
 * aynı bilgi haritanın altındaki özet paragrafta metin olarak da durur ve
 * harita bu paragrafa `aria-describedby` ile bağlanır (harita düşse de bilgi
 * kaybolmaz).
 */
export function ListingLocationSection({ location, geo, nearby }: ListingLocationSectionProps) {
  const baseId = useId()
  const summaryId = `${baseId}-konum-ozeti`
  const places = [...(nearby ?? [])].sort((a, b) => distanceOrder(a) - distanceOrder(b))
  // Zemin SABİT referans olmalı: her render'da yeni nesne üretilirse Leaflet
  // örneği baştan kurulur ve harita sürekli titrer (bkz. useBasemap kurulum
  // efektinin bağımlılıkları).
  const geoLat = geo?.kind === 'geographic' ? geo.lat : undefined
  const geoLng = geo?.kind === 'geographic' ? geo.lng : undefined
  const basemap = useMemo(
    () => (geoLat !== undefined && geoLng !== undefined ? pointBasemap([geoLat, geoLng], 13) : undefined),
    [geoLat, geoLng],
  )

  return (
    <section
      id="konum"
      data-listing-section="location"
      className={workspace.section}
      aria-labelledby="konum-baslik"
    >
      <h2 id="konum-baslik" className={workspace.sectionTitle}>
        Konum ve çevresi
      </h2>

      <p className={styles.address}>
        <span className={styles.addressPart}>{location.city}</span>
        <span aria-hidden="true"> · </span>
        <span className={styles.addressPart}>{location.district}</span>
        {location.neighbourhood ? (
          <>
            <span aria-hidden="true"> · </span>
            <span className={styles.addressPart}>{location.neighbourhood}</span>
          </>
        ) : null}
      </p>
      {location.neighbourhood ? null : (
        <p className={workspace.blockNote}>{NO_NEIGHBOURHOOD_TEXT}</p>
      )}

      <h3 className={workspace.subTitle}>
        {geo?.kind === 'schematic' ? SCHEMATIC_TITLE : 'Yaklaşık konum'}
      </h3>
      {geo === undefined ? <p className={workspace.blockNote}>{NO_GEO_TEXT}</p> : null}

      {geo?.kind === 'geographic' ? (
        <>
          <div className={styles.mapFrame}>
            <GlassMap
              label="Yaklaşık konum haritası"
              aria-describedby={summaryId}
              pins={[]}
              // Gerçek zemin: kayıtta coğrafi koordinat VAR, bu yüzden
              // şematik çizim değil gerçek harita gösterilir. Mahremiyet
              // dairesi metre cinsinden verilir ve zeminle ölçeklenir;
              // x/y/r yalnız zemin yüklenemezse devreye giren yedektir.
              basemap={basemap}
              privacyCircle={{
                x: 0.5,
                y: 0.5,
                r: privacyRadius(geo.radiusMeters),
                lat: geo.lat,
                lng: geo.lng,
                radiusMeters: geo.radiusMeters,
              }}
              seed={`${geo.lat},${geo.lng}`}
            />
          </div>
          <p id={summaryId} className={styles.mapSummary}>
            Yaklaşık konum · {formatDistance(geo.radiusMeters)} yarıçaplı alan · kaynak:{' '}
            {geo.sourceLabel}
          </p>
          <p className={workspace.blockNote}>
            Haritadaki daire parselin tam yerini göstermez: ilan sahibinin mahremiyeti için
            konum {formatDistance(geo.radiusMeters)} yarıçaplı bir alanla gösterilir. Zemin
            gerçek haritadır ve daire bu ölçeğe göre çizilir; parsel bu alanın içinde
            herhangi bir noktada olabilir.
          </p>
        </>
      ) : null}

      {/* Şematik varyantta çizim yine görünür — ama mahremiyet dairesi ve
          yarıçap cümlesi YOKTUR: gizlenecek gerçek bir koordinat yoktur.
          İşaret yalnız çizimdeki yeri gösterir ve metin bunu açıkça söyler. */}
      {geo?.kind === 'schematic' ? (
        <>
          <div className={styles.mapFrame}>
            <GlassMap
              label={SCHEMATIC_MAP_LABEL}
              aria-describedby={summaryId}
              pins={[]}
              privacyCircle={{ x: geo.x, y: geo.y, r: SCHEMATIC_MARK_RADIUS }}
              seed={`${geo.x},${geo.y}`}
            />
          </div>
          <p id={summaryId} className={styles.mapSummary}>
            {SCHEMATIC_SUMMARY_PREFIX}
            {geo.sourceLabel}
          </p>
          <p className={workspace.blockNote}>{SCHEMATIC_NOTE}</p>
        </>
      ) : null}

      <h3 className={workspace.subTitle}>Çevredeki noktalar</h3>
      {places.length > 0 ? (
        <>
          <p className={workspace.blockNote}>
            Mesafeler kuş uçuşudur — yürüme veya sürüş mesafesi değildir ve yaklaşık konumdan
            ölçülmüştür.
          </p>
          {/* Kart içinde kart açılmaz (feature rules.md §1b): GlassNearbyPlaces kendi
              çerçeveli yüzeyini getirdiği için bu kutusuz bölümde kullanılmaz; liste
              sayfanın düz akışında hairline ile ayrılır. */}
          <ul className={styles.nearbyList}>
            {places.map((place) => (
              <li key={place.id} className={styles.nearbyRow}>
                <span className={styles.nearbyKind}>{NEARBY_KIND_LABELS[place.kind]}</span>
                <span className={styles.nearbyLabel}>{place.label}</span>
                <span className={styles.nearbyDistance}>
                  {formatDistance(place.distanceMeters)}
                  <span className={styles.srOnly}> kuş uçuşu</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={workspace.blockNote}>{NO_NEARBY_TEXT}</p>
      )}
    </section>
  )
}
