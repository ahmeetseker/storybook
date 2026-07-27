import { GlassSelect } from '@repo/ui'
import type { ListingLocation, PropertyFamily } from './listing-create-domain'
import { ListingField } from './ListingField'
import { LeafletPropertyPicker } from './LeafletPropertyPicker'
import { listingFieldA11y } from './listing-field-a11y'
import styles from './ListingCreateWorkspace.module.css'

interface LocationStepProps {
  value: ListingLocation
  propertyFamily: PropertyFamily
  errors: Record<string, string>
  onChange: (value: ListingLocation) => void
}

const districts: Record<string, Array<[string, string]>> = {
  izmir: [
    ['urla', 'Urla'],
    ['çeşme', 'Çeşme'],
    ['seferihisar', 'Seferihisar'],
  ],
  istanbul: [
    ['kadıköy', 'Kadıköy'],
    ['beşiktaş', 'Beşiktaş'],
    ['sarıyer', 'Sarıyer'],
  ],
  ankara: [
    ['gölbaşı', 'Gölbaşı'],
    ['çankaya', 'Çankaya'],
  ],
}

const cityOptions = [
  { value: 'izmir', label: 'İzmir' },
  { value: 'istanbul', label: 'İstanbul' },
  { value: 'ankara', label: 'Ankara' },
]

const neighborhoods: Record<string, Array<[string, string]>> = {
  urla: [
    ['iskele', 'İskele'],
    ['çeşmealtı', 'Çeşmealtı'],
    ['zeytinalanı', 'Zeytinalanı'],
  ],
  çeşme: [
    ['alaçatı', 'Alaçatı'],
    ['ılıca', 'Ilıca'],
  ],
  seferihisar: [
    ['sığacık', 'Sığacık'],
    ['camikebir', 'Camikebir'],
    ['hıdırlık', 'Hıdırlık'],
  ],
  kadıköy: [
    ['caddebostan', 'Caddebostan'],
    ['moda', 'Moda'],
  ],
  beşiktaş: [
    ['etiler', 'Etiler'],
    ['levent', 'Levent'],
    ['bebek', 'Bebek'],
  ],
  sarıyer: [
    ['zekeriyaköy', 'Zekeriyaköy'],
    ['tarabya', 'Tarabya'],
    ['istinye', 'İstinye'],
  ],
  gölbaşı: [['incek', 'İncek']],
  çankaya: [
    ['çukurambar', 'Çukurambar'],
    ['oran', 'Oran'],
    ['ayrancı', 'Ayrancı'],
  ],
}

const locationCenters: Record<string, [number, number]> = {
  urla: [38.322, 26.764],
  çeşme: [38.324, 26.303],
  seferihisar: [38.197, 26.839],
  kadıköy: [40.991, 29.028],
  beşiktaş: [41.043, 29.009],
  sarıyer: [41.167, 29.057],
  gölbaşı: [39.79, 32.805],
  çankaya: [39.902, 32.86],
  izmir: [38.423, 27.142],
  istanbul: [41.008, 28.978],
  ankara: [39.933, 32.86],
}

export function LocationStep({
  value,
  propertyFamily,
  errors,
  onChange,
}: LocationStepProps) {
  const mapCenter =
    locationCenters[value.district] ??
    locationCenters[value.city] ??
    locationCenters.izmir
  const set = <K extends keyof ListingLocation>(key: K, next: ListingLocation[K]) => {
    onChange({ ...value, [key]: next })
  }

  return (
    <section className={styles.stepSection} aria-labelledby="location-step-title">
      <header className={styles.stepHeader}>
        <div>
          <p className={styles.kicker}>Adım 2 / 5</p>
          <h1 id="location-step-title" tabIndex={-1}>Konum ve taşınmaz</h1>
          <p>
            Doğrulama için gerçek adresi kullanırız; ilanda yaklaşık konumu
            gösterebilirsiniz.
          </p>
        </div>
        <span className={styles.privacyNote}>⌖ Tam adres ilanda gösterilmez</span>
      </header>

      <div className={styles.formGridThree}>
        <ListingField id="location-city" label="İl" required error={errors.city}>
          <GlassSelect
            material="flat"
            size="lg"
            options={cityOptions}
            value={value.city}
            onChange={(city) =>
              onChange({
                ...value,
                city,
                district: '',
                neighborhood: '',
                latitude: null,
                longitude: null,
              })
            }
            id="location-city"
            invalid={Boolean(errors.city)}
            aria-required="true"
            aria-describedby={errors.city ? 'location-city-error' : undefined}
          />
        </ListingField>
        <ListingField
          id="location-district"
          label="İlçe"
          required
          error={errors.district}
        >
          <GlassSelect
            material="flat"
            size="lg"
            options={(districts[value.city] ?? []).map(([district, label]) => ({
              value: district,
              label,
            }))}
            value={value.district}
            disabled={!value.city}
            onChange={(district) =>
              onChange({
                ...value,
                district,
                neighborhood: '',
                latitude: null,
                longitude: null,
              })
            }
            id="location-district"
            invalid={Boolean(errors.district)}
            aria-required="true"
            aria-describedby={errors.district ? 'location-district-error' : undefined}
          />
        </ListingField>
        <ListingField
          id="location-neighborhood"
          label="Mahalle"
          required
          error={errors.neighborhood}
        >
          <GlassSelect
            material="flat"
            size="lg"
            options={(neighborhoods[value.district] ?? []).map(
              ([neighborhood, label]) => ({ value: neighborhood, label }),
            )}
            value={value.neighborhood}
            disabled={!value.district}
            onChange={(neighborhood) => set('neighborhood', neighborhood)}
            id="location-neighborhood"
            invalid={Boolean(errors.neighborhood)}
            aria-required="true"
            aria-describedby={
              errors.neighborhood ? 'location-neighborhood-error' : undefined
            }
          />
        </ListingField>
      </div>

      <ListingField
        id="location-address"
        label="Açık adres"
        description="Bu bilgi yalnızca doğrulama ve konumlandırma için kullanılır."
      >
        <input
          className={styles.flatControl}
          value={value.address}
          onChange={(event) => set('address', event.target.value)}
          placeholder="Cadde, sokak ve dış kapı bilgisi"
          {...listingFieldA11y(
            'location-address',
            undefined,
            'Bu bilgi yalnızca doğrulama ve konumlandırma için kullanılır.',
          )}
        />
      </ListingField>

      <div className={styles.locationGrid}>
        <div
          id="location-map"
          className={styles.mapFrame}
          aria-invalid={Boolean(errors.coordinates) || undefined}
          aria-describedby={errors.coordinates ? 'location-coordinates-error' : undefined}
          tabIndex={errors.coordinates ? -1 : undefined}
        >
          <LeafletPropertyPicker
            center={mapCenter}
            latitude={value.latitude}
            longitude={value.longitude}
            onPointChange={(latitude, longitude) =>
              onChange({ ...value, latitude, longitude })
            }
          />
        </div>
        <div className={styles.locationSide}>
          <fieldset className={styles.choiceFieldset}>
            <legend>İlanda konum görünürlüğü</legend>
            <label className={styles.radioLine}>
              <input
                type="radio"
                name="location-precision"
                checked={value.precision === 'approximate'}
                onChange={() => set('precision', 'approximate')}
              />
              <span>
                <strong>Yaklaşık konum</strong>
                <small>Önerilen · Mahremiyeti korur</small>
              </span>
            </label>
            <label className={styles.radioLine}>
              <input
                type="radio"
                name="location-precision"
                checked={value.precision === 'exact'}
                onChange={() => set('precision', 'exact')}
              />
              <span>
                <strong>Tam konum</strong>
                <small>İlan haritasında nokta olarak görünür</small>
              </span>
            </label>
          </fieldset>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() =>
              onChange({
                ...value,
                latitude: mapCenter[0],
                longitude: mapCenter[1],
              })
            }
          >
            Harita merkezini konum olarak seç
          </button>
          {value.latitude !== null && value.longitude !== null ? (
            <p className={styles.coordinateStatus} role="status">
              Seçili nokta: {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
            </p>
          ) : null}
        </div>
      </div>
      <p
        id="location-coordinates-error"
        className={styles.fieldError}
        aria-live="polite"
      >
        {errors.coordinates ?? ''}
      </p>

      <div className={styles.identityBlock}>
        <div>
          <p className={styles.contextEyebrow}>Taşınmaz kimliği</p>
          <h2>Tapu kayıt bilgileri</h2>
          <p>Bu değerler yalnız EİDS eşleştirmesinde kullanılır; ilanda gösterilmez.</p>
        </div>
        <ListingField
          id="location-property-number"
          label="Taşınmaz numarası"
          required
          error={errors.propertyNumber}
          description="Web Tapu veya tapu belgenizdeki taşınmaz numarası."
        >
          <input
            className={styles.flatControl}
            inputMode="numeric"
            value={value.propertyNumber}
            required
            onChange={(event) => set('propertyNumber', event.target.value)}
            {...listingFieldA11y(
              'location-property-number',
              errors.propertyNumber,
              'Web Tapu veya tapu belgenizdeki taşınmaz numarası.',
            )}
          />
        </ListingField>
        {propertyFamily === 'land' ? (
          <div className={styles.formGrid}>
            <ListingField id="location-island" label="Ada" required error={errors.parcel}>
              <input
                className={styles.flatControl}
                inputMode="numeric"
                value={value.island}
                required
                onChange={(event) => set('island', event.target.value)}
                {...listingFieldA11y('location-island', errors.parcel)}
              />
            </ListingField>
            <ListingField id="location-parcel" label="Parsel" required error={errors.parcel}>
              <input
                className={styles.flatControl}
                inputMode="numeric"
                value={value.parcel}
                required
                onChange={(event) => set('parcel', event.target.value)}
                {...listingFieldA11y('location-parcel', errors.parcel)}
              />
            </ListingField>
          </div>
        ) : (
          <ListingField
            id="location-building"
            label="Bina / dış kapı numarası"
            required
            error={errors.buildingNumber}
          >
            <input
              className={styles.flatControl}
              value={value.buildingNumber}
              required
              onChange={(event) => set('buildingNumber', event.target.value)}
              {...listingFieldA11y('location-building', errors.buildingNumber)}
            />
          </ListingField>
        )}
      </div>
    </section>
  )
}
