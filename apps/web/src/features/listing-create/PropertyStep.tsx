import { GlassSelect, type GlassSelectOption } from '@repo/ui'
import type { ListingProperty, PropertyFamily } from './listing-create-domain'
import { ListingField } from './ListingField'
import { listingFieldA11y } from './listing-field-a11y'
import styles from './ListingCreateWorkspace.module.css'

interface PropertyStepProps {
  value: ListingProperty
  errors: Record<string, string>
  onChange: (value: ListingProperty) => void
}

const subtypeOptions: Record<Exclude<PropertyFamily, ''>, Array<[string, string]>> = {
  land: [
    ['zoned-land', 'İmarlı arsa'],
    ['field', 'Tarla'],
    ['garden', 'Bağ / bahçe'],
    ['industrial-land', 'Sanayi arsası'],
  ],
  residential: [
    ['apartment', 'Daire'],
    ['villa', 'Villa'],
    ['detached-house', 'Müstakil ev'],
    ['residence', 'Rezidans'],
  ],
  commercial: [
    ['office', 'Ofis'],
    ['shop', 'Dükkan'],
    ['warehouse', 'Depo'],
    ['workplace', 'İşyeri'],
  ],
  building: [
    ['apartment-building', 'Apartman'],
    ['commercial-building', 'Ticari bina'],
    ['mixed-building', 'Karma bina'],
  ],
}

const familyOptions: GlassSelectOption[] = [
  { value: 'land', label: 'Arsa / Arazi' },
  { value: 'residential', label: 'Konut' },
  { value: 'commercial', label: 'İş yeri' },
  { value: 'building', label: 'Bina' },
]

function toSelectOptions(options: Array<[string, string]>): GlassSelectOption[] {
  return options.map(([value, label]) => ({ value, label }))
}

function familyReset(value: ListingProperty, family: PropertyFamily): ListingProperty {
  return {
    ...value,
    family,
    subtype: '',
    area: '',
    zoning: '',
    deedType: '',
    rooms: '',
    grossArea: '',
    netArea: '',
    buildingAge: '',
    usageStatus: '',
    floorCount: '',
    independentUnitCount: '',
  }
}

export function PropertyStep({ value, errors, onChange }: PropertyStepProps) {
  const set = <K extends keyof ListingProperty>(key: K, next: ListingProperty[K]) => {
    onChange({ ...value, [key]: next })
  }

  return (
    <section className={styles.stepSection} aria-labelledby="property-step-title">
      <header className={styles.stepHeader}>
        <div>
          <p className={styles.kicker}>Adım 1 / 5</p>
          <h1 id="property-step-title" tabIndex={-1}>Mülk bilgileri</h1>
          <p>
            İlanın doğru kategoride görünmesi için mülkü ve yayınlama yetkinizi
            tanımlayın.
          </p>
        </div>
        <span className={styles.requiredNote}>* Zorunlu alan</span>
      </header>

      <fieldset
        id="property-transaction"
        className={styles.choiceFieldset}
        aria-required="true"
        aria-invalid={Boolean(errors.transaction) || undefined}
        aria-describedby={errors.transaction ? 'transaction-error' : undefined}
        tabIndex={errors.transaction ? -1 : undefined}
      >
        <legend>İlan amacı *</legend>
        <div className={styles.segmentChoices}>
          {[
            ['sale', 'Satılık'],
            ['rent', 'Kiralık'],
          ].map(([id, label]) => (
            <label key={id} className={styles.segmentChoice}>
              <input
                type="radio"
                name="transaction"
                value={id}
                required
                checked={value.transaction === id}
                aria-invalid={Boolean(errors.transaction) || undefined}
                onChange={() => set('transaction', id as ListingProperty['transaction'])}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <p id="transaction-error" className={styles.fieldError} aria-live="polite">
          {errors.transaction ?? ''}
        </p>
      </fieldset>

      <div className={styles.formGrid}>
        <ListingField
          id="property-family"
          label="Mülk türü"
          required
          error={errors.family}
        >
          <GlassSelect
            material="flat"
            size="lg"
            options={familyOptions}
            value={value.family}
            onChange={(family) =>
              onChange(familyReset(value, family as PropertyFamily))
            }
            id="property-family"
            invalid={Boolean(errors.family)}
            aria-required="true"
            aria-describedby={errors.family ? 'property-family-error' : undefined}
          />
        </ListingField>

        <ListingField
          id="property-subtype"
          label="Alt tür"
          required
          error={errors.subtype}
        >
          <GlassSelect
            material="flat"
            size="lg"
            options={
              value.family ? toSelectOptions(subtypeOptions[value.family]) : []
            }
            value={value.subtype}
            disabled={!value.family}
            onChange={(subtype) => set('subtype', subtype)}
            id="property-subtype"
            invalid={Boolean(errors.subtype)}
            aria-required="true"
            aria-describedby={errors.subtype ? 'property-subtype-error' : undefined}
          />
        </ListingField>
      </div>

      <fieldset
        id="property-publisher-role"
        className={styles.choiceFieldset}
        aria-required="true"
        aria-invalid={Boolean(errors.publisherRole) || undefined}
        aria-describedby={errors.publisherRole ? 'publisher-role-error' : undefined}
        tabIndex={errors.publisherRole ? -1 : undefined}
      >
        <legend>İlanı hangi yetkiyle veriyorsunuz? *</legend>
        <div className={styles.roleChoices}>
          {[
            ['owner', 'Mülk sahibiyim', 'EİDS’de taşınmaz sahipliği doğrulanır.'],
            ['relative', 'Yakını / eşiyim', 'Birinci veya ikinci derece yakınlık doğrulanır.'],
            ['agency', 'Yetkili emlak işletmesiyim', 'Taşınmaz sahibinin verdiği yetki aranır.'],
          ].map(([id, label, description]) => (
            <label key={id} className={styles.roleChoice}>
              <input
                type="radio"
                name="publisher-role"
                value={id}
                required
                checked={value.publisherRole === id}
                aria-invalid={Boolean(errors.publisherRole) || undefined}
                onChange={() =>
                  set('publisherRole', id as ListingProperty['publisherRole'])
                }
              />
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
            </label>
          ))}
        </div>
        <p id="publisher-role-error" className={styles.fieldError} aria-live="polite">
          {errors.publisherRole ?? ''}
        </p>
      </fieldset>

      {value.family === 'land' ? (
        <div className={styles.formGrid}>
          <ListingField
            id="property-area"
            label="Toplam alan (m²)"
            required
            error={errors.area}
          >
            <input
              className={styles.flatControl}
              type="text"
              inputMode="numeric"
              value={value.area}
              required
              onChange={(event) => set('area', event.target.value)}
              placeholder="Örn. 512"
              {...listingFieldA11y('property-area', errors.area)}
            />
          </ListingField>
          <ListingField
            id="property-zoning"
            label="İmar durumu"
            required
            error={errors.zoning}
          >
            <GlassSelect
              material="flat"
              size="lg"
              options={[
                { value: 'residential', label: 'Konut imarlı' },
                { value: 'commercial', label: 'Ticari imarlı' },
                { value: 'field', label: 'İmarsız / tarla' },
              ]}
              value={value.zoning}
              onChange={(zoning) => set('zoning', zoning)}
              id="property-zoning"
              invalid={Boolean(errors.zoning)}
              aria-required="true"
              aria-describedby={errors.zoning ? 'property-zoning-error' : undefined}
            />
          </ListingField>
          <ListingField
            id="property-deed"
            label="Tapu türü"
            required
            error={errors.deedType}
          >
            <GlassSelect
              material="flat"
              size="lg"
              options={[
                { value: 'detached', label: 'Müstakil tapu' },
                { value: 'shared', label: 'Hisseli tapu' },
              ]}
              value={value.deedType}
              onChange={(deedType) => set('deedType', deedType)}
              id="property-deed"
              invalid={Boolean(errors.deedType)}
              aria-required="true"
              aria-describedby={errors.deedType ? 'property-deed-error' : undefined}
            />
          </ListingField>
        </div>
      ) : null}

      {value.family === 'residential' ? (
        <div className={styles.formGrid}>
          <ListingField
            id="property-rooms"
            label="Oda sayısı"
            required
            error={errors.rooms}
          >
            <GlassSelect
              material="flat"
              size="lg"
              options={['1+1', '2+1', '3+1', '4+1'].map((rooms) => ({
                value: rooms,
                label: rooms,
              }))}
              value={value.rooms}
              onChange={(rooms) => set('rooms', rooms)}
              id="property-rooms"
              invalid={Boolean(errors.rooms)}
              aria-required="true"
              aria-describedby={errors.rooms ? 'property-rooms-error' : undefined}
            />
          </ListingField>
          <ListingField
            id="property-gross-area"
            label="Brüt alan (m²)"
            required
            error={errors.grossArea}
          >
            <input
              className={styles.flatControl}
              inputMode="numeric"
              value={value.grossArea}
              required
              onChange={(event) => set('grossArea', event.target.value)}
              {...listingFieldA11y('property-gross-area', errors.grossArea)}
            />
          </ListingField>
          <ListingField
            id="property-net-area"
            label="Net alan (m²)"
            required
            error={errors.netArea}
          >
            <input
              className={styles.flatControl}
              inputMode="numeric"
              value={value.netArea}
              required
              onChange={(event) => set('netArea', event.target.value)}
              {...listingFieldA11y('property-net-area', errors.netArea)}
            />
          </ListingField>
          <ListingField
            id="property-age"
            label="Bina yaşı"
            required
            error={errors.buildingAge}
          >
            <GlassSelect
              material="flat"
              size="lg"
              options={[
                { value: '0', label: 'Sıfır' },
                { value: '1-5', label: '1–5 yıl' },
                { value: '6-10', label: '6–10 yıl' },
                { value: '11+', label: '11 yıl ve üzeri' },
              ]}
              value={value.buildingAge}
              onChange={(buildingAge) => set('buildingAge', buildingAge)}
              id="property-age"
              invalid={Boolean(errors.buildingAge)}
              aria-required="true"
              aria-describedby={errors.buildingAge ? 'property-age-error' : undefined}
            />
          </ListingField>
        </div>
      ) : null}

      {value.family === 'commercial' ? (
        <div className={styles.formGrid}>
          <ListingField
            id="property-usage-status"
            label="Kullanım durumu"
            required
            error={errors.usageStatus}
          >
            <GlassSelect
              material="flat"
              size="lg"
              options={[
                { value: 'vacant', label: 'Boş' },
                { value: 'tenant', label: 'Kiracılı' },
                { value: 'owner-occupied', label: 'Mülk sahibi kullanıyor' },
              ]}
              value={value.usageStatus}
              onChange={(usageStatus) => set('usageStatus', usageStatus)}
              id="property-usage-status"
              invalid={Boolean(errors.usageStatus)}
              aria-required="true"
              aria-describedby={
                errors.usageStatus ? 'property-usage-status-error' : undefined
              }
            />
          </ListingField>
          <ListingField
            id="property-gross-area"
            label="Brüt alan (m²)"
            required
            error={errors.grossArea}
          >
            <input
              className={styles.flatControl}
              inputMode="numeric"
              value={value.grossArea}
              required
              onChange={(event) => set('grossArea', event.target.value)}
              {...listingFieldA11y('property-gross-area', errors.grossArea)}
            />
          </ListingField>
          <ListingField
            id="property-net-area"
            label="Net alan (m²)"
            required
            error={errors.netArea}
          >
            <input
              className={styles.flatControl}
              inputMode="numeric"
              value={value.netArea}
              required
              onChange={(event) => set('netArea', event.target.value)}
              {...listingFieldA11y('property-net-area', errors.netArea)}
            />
          </ListingField>
        </div>
      ) : null}

      {value.family === 'building' ? (
        <div className={styles.formGrid}>
          <ListingField
            id="property-gross-area"
            label="Toplam alan (m²)"
            required
            error={errors.grossArea}
          >
            <input
              className={styles.flatControl}
              inputMode="numeric"
              value={value.grossArea}
              required
              onChange={(event) => set('grossArea', event.target.value)}
              {...listingFieldA11y('property-gross-area', errors.grossArea)}
            />
          </ListingField>
          <ListingField
            id="property-floor-count"
            label="Kat sayısı"
            required
            error={errors.floorCount}
          >
            <input
              className={styles.flatControl}
              inputMode="numeric"
              value={value.floorCount}
              required
              onChange={(event) => set('floorCount', event.target.value)}
              {...listingFieldA11y(
                'property-floor-count',
                errors.floorCount,
              )}
            />
          </ListingField>
          <ListingField
            id="property-independent-unit-count"
            label="Bağımsız bölüm sayısı"
            required
            error={errors.independentUnitCount}
          >
            <input
              className={styles.flatControl}
              inputMode="numeric"
              value={value.independentUnitCount}
              required
              onChange={(event) =>
                set('independentUnitCount', event.target.value)
              }
              {...listingFieldA11y(
                'property-independent-unit-count',
                errors.independentUnitCount,
              )}
            />
          </ListingField>
        </div>
      ) : null}
    </section>
  )
}
