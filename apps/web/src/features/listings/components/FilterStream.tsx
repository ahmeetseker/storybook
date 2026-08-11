// Kademeli Akış — mobil filtre yaprağının TAMAMI.
//
// Tek yüzey kuralı: hiçbir kriter başka bir ekrana devredilmez. Kataloğun
// bütün bölümleri bu akışın içinde yaşar; "Tüm filtreler" düğmesi, ayrı
// katalog sayfası ya da akordeon yoktur.
//
// Kademe: her bölüm çok kullanılan kriterlerini (`core` + `common`) açık
// gösterir, nadir olanları (`niche`) "+N kriter" satırının arkasında tutar ve
// o satır AYNI YERDE genişler — kullanıcı konumunu kaybetmez. Kapalı akordeon
// başlığının aksine satır kaç kriter sakladığını SAYAR.
import { useCallback, useMemo, useState } from 'react'
import { GlassChip, GlassPriceRange, GlassSegmentedControl, GlassSwitch } from '@repo/ui'
import { listingDistribution } from '../data/listing-adapter'
import { FILTER_SECTIONS } from '../domain/filter-catalog'
import { sectionFacets, type FilterFacet } from '../domain/filter-catalog-types'
import {
  applyDecision,
  applyDecisionRange,
  AREA_FACET_KEY,
  curatedField,
  CURATED_FACET_KEYS,
  decisionFields,
  decisionRange,
  decisionValue,
  formatDecisionValue,
  type DecisionField,
} from '../domain/decision-sheet'
import type { ListingSearchState } from '../domain/search-state'
import { CatalogFilterControls } from './CatalogFilterControls'
import styles from './FilterStream.module.css'

export interface FilterStreamProps {
  state: ListingSearchState
  /** Taslak duruma düşen ilan sayısı — özet satırında canlı okunur */
  resultCount: number
  onChange: (state: ListingSearchState) => void
  onReset: () => void
}

const TRY = new Intl.NumberFormat('tr-TR')

type StreamSection = {
  id: string
  title: string
  /** Bölümün açık gösterdiği kriterler */
  facets: FilterFacet[]
  /** "+N kriter" arkasındaki nadir kriterler */
  extra: FilterFacet[]
  /** Katalogda karşılığı olan ama özel kontrolle çizilen kriterler */
  curated: DecisionField[]
  activeCount: number
}

function facetActive(facet: FilterFacet, state: ListingSearchState): boolean {
  if (facet.type === 'range') return state.categoryRanges[facet.key] !== undefined
  return (state.categoryFilters[facet.key] ?? []).length > 0
}

/** Katalog bölümlerini akışa çevirir: açık kriterler, nadir kriterler, sayaç. */
function catalogSections(state: ListingSearchState): StreamSection[] {
  return FILTER_SECTIONS.flatMap((section) => {
    const all = sectionFacets(section, state.category).filter(
      // Net m² aynı soruyu temel blokta histogramla soruyor.
      (facet) => facet.key !== AREA_FACET_KEY,
    )
    if (all.length === 0) return []

    const curated = all
      .filter((facet) => (CURATED_FACET_KEYS as readonly string[]).includes(facet.key))
      .map((facet) => curatedField(facet.key, state.category))
      .filter((field): field is DecisionField => field !== undefined)
    const curatedKeys = new Set(curated.map((field) => field.key))
    const rest = all.filter((facet) => !curatedKeys.has(facet.key))

    return [
      {
        id: section.id,
        title: section.title,
        facets: rest.filter((facet) => facet.importance !== 'niche'),
        extra: rest.filter((facet) => facet.importance === 'niche'),
        curated,
        activeCount: all.filter((facet) => facetActive(facet, state)).length,
      },
    ]
  })
}

/** Bir aralık alanı — dağılım histogramı varsa onunla. */
function StreamRange({
  field,
  state,
  onChange,
}: {
  field: DecisionField
  state: ListingSearchState
  onChange: (next: ListingSearchState) => void
}) {
  const distribution = useMemo(
    () => listingDistribution(state, field.axis ?? 'price'),
    [state, field.axis],
  )
  if (distribution.max <= distribution.min) return null

  const bounds = { min: distribution.min, max: distribution.max }
  const hasBins = distribution.bins.length > 0
  const step = Math.max(
    1,
    10 ** Math.max(0, Math.floor(Math.log10(Math.max(bounds.max - bounds.min, 1) / 100))),
  )

  return (
    <GlassPriceRange
      label={field.label}
      hint={field.hint}
      min={bounds.min}
      max={bounds.max}
      step={step}
      bins={hasBins ? distribution.bins : undefined}
      countLabel="ilan"
      value={decisionRange(field, state, bounds)}
      onChange={(next) => onChange(applyDecisionRange(field, state, next, bounds))}
      formatValue={(amount) => formatDecisionValue(field, amount)}
    />
  )
}

/** Segment ya da çip — katalog dışı ve özel kontrollü kriterler. */
function StreamChoice({
  field,
  state,
  onChange,
}: {
  field: DecisionField
  state: ListingSearchState
  onChange: (next: ListingSearchState) => void
}) {
  const current = decisionValue(field, state)

  if (field.control === 'category' || field.control === 'chips') {
    return (
      <fieldset className={styles.field}>
        <legend className={styles.legend}>
          <span className={styles.label}>{field.label}</span>
          {field.hint ? <span className={styles.hint}>{field.hint}</span> : null}
        </legend>
        <div className={styles.chips} role="radiogroup" aria-label={field.label}>
          {(field.options ?? []).map((option) => (
            <GlassChip
              key={option.value}
              size="sm"
              role="radio"
              aria-checked={option.value === current}
              selected={option.value === current}
              onSelectedChange={() => onChange(applyDecision(field, state, option.value))}
            >
              {option.label}
            </GlassChip>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{field.label}</span>
      <GlassSegmentedControl
        // `track`: beyaz yaprak içinde kapsülün cam kenarı okunmaz kalır.
        variant="track"
        label={field.label}
        options={field.options ?? []}
        value={current}
        onChange={(next) => onChange(applyDecision(field, state, next))}
        className={styles.segment}
      />
    </div>
  )
}

export function FilterStream({ state, resultCount, onChange, onReset }: FilterStreamProps) {
  const [expanded, setExpanded] = useState<string[]>([])
  const basics = decisionFields(state)
  const sections = useMemo(() => catalogSections(state), [state])

  const locationCount =
    (state.city ? 1 : 0) + (state.district ? 1 : 0) + (state.neighbourhood ? 1 : 0)
  const trustCount =
    (state.verified ? 1 : 0) +
    (state.featured ? 1 : 0) +
    (state.owners.length > 0 ? 1 : 0)

  // Atlama şeridi: hiyerarşi değil kısayol — bölüm aynı akışta durur.
  const jumpTo = useCallback((id: string) => {
    const target = document.getElementById(`stream-${id}`)
    if (!target) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
  }, [])

  const jumpTargets = [
    { id: 'temel', title: 'Temel' },
    { id: 'konum', title: 'Konum' },
    ...sections.map((section) => ({ id: section.id, title: section.title })),
    { id: 'guven', title: 'Güven ve satıcı' },
  ]

  const heading = (id: string, title: string, count: number) => (
    <h3 className={styles.sectionHead} id={`stream-${id}`}>
      <span>{title}</span>
      {count > 0 ? (
        <span className={styles.badge} aria-label={`${count} kriter etkin`}>
          {count}
        </span>
      ) : null}
    </h3>
  )

  return (
    <div className={styles.stream}>
      <div className={styles.summary}>
        <span className={styles.summaryLeft}>
          <p className={styles.count} aria-live="polite">
            {TRY.format(resultCount)} ilan
          </p>
        </span>
        <button type="button" className={styles.reset} onClick={onReset}>
          Temizle
        </button>
      </div>

      <nav className={styles.jump} aria-label="Filtre bölümleri">
        {jumpTargets.map((target) => (
          <button
            key={target.id}
            type="button"
            className={styles.jumpChip}
            onClick={() => jumpTo(target.id)}
          >
            {target.title}
          </button>
        ))}
      </nav>

      {/* Temel: katalogda karşılığı olmayan, durumun kendi alanları. */}
      {heading('temel', 'Temel', 0)}
      <div className={styles.sectionBody}>
        {basics.map((field) =>
          field.control === 'range' ? (
            <StreamRange key={field.id} field={field} state={state} onChange={onChange} />
          ) : (
            <StreamChoice key={field.id} field={field} state={state} onChange={onChange} />
          ),
        )}
      </div>

      {heading('konum', 'Konum', locationCount)}
      <div className={styles.sectionBody}>
        <label className={styles.field}>
          <span className={styles.label}>İlçe</span>
          <input
            className={styles.input}
            value={state.district ?? ''}
            placeholder="İlçe ara"
            onChange={(event) =>
              onChange({
                ...state,
                district: event.target.value || undefined,
                // İlçe değişince mahalle anlamını yitirir.
                neighbourhood: undefined,
                page: 1,
              })
            }
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Mahalle</span>
          <input
            className={styles.input}
            value={state.neighbourhood ?? ''}
            placeholder="Mahalle ara"
            onChange={(event) =>
              onChange({
                ...state,
                neighbourhood: event.target.value || undefined,
                page: 1,
              })
            }
          />
        </label>
      </div>

      {sections.map((section) => {
        const isOpen = expanded.includes(section.id)
        return (
          <div key={section.id}>
            {heading(section.id, section.title, section.activeCount)}
            <div className={styles.sectionBody}>
              {section.curated.map((field) => (
                <StreamChoice key={field.id} field={field} state={state} onChange={onChange} />
              ))}
              {section.facets.length > 0 ? (
                <CatalogFilterControls
                  facets={section.facets}
                  state={state}
                  onChange={onChange}
                />
              ) : null}
              {section.extra.length > 0 && !isOpen ? (
                <button
                  type="button"
                  className={styles.more}
                  onClick={() => setExpanded((current) => [...current, section.id])}
                >
                  + {section.extra.length} kriter
                </button>
              ) : null}
              {section.extra.length > 0 && isOpen ? (
                <CatalogFilterControls facets={section.extra} state={state} onChange={onChange} />
              ) : null}
            </div>
          </div>
        )
      })}

      {heading('guven', 'Güven ve satıcı', trustCount)}
      <div className={styles.sectionBody}>
        <div className={styles.switchRow}>
          <span>Yalnız doğrulanmış ilanlar</span>
          <GlassSwitch
            label="Yalnız doğrulanmış ilanlar"
            checked={state.verified}
            onChange={(checked) => onChange({ ...state, verified: checked, page: 1 })}
          />
        </div>
        <div className={styles.switchRow}>
          <span>Yalnız vitrin ilanları</span>
          <GlassSwitch
            label="Yalnız vitrin ilanları"
            checked={state.featured}
            onChange={(checked) => onChange({ ...state, featured: checked, page: 1 })}
          />
        </div>
        <div className={styles.switchRow}>
          <span>Yalnız sahibinden</span>
          <GlassSwitch
            label="Yalnız sahibinden"
            checked={state.owners.includes('owner')}
            onChange={(checked) =>
              onChange({ ...state, owners: checked ? ['owner'] : [], page: 1 })
            }
          />
        </div>
      </div>
    </div>
  )
}
