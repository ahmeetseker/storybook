import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import {
  GlassAiSearchBar,
  GlassButton,
  GlassCheckbox,
  GlassChip,
  GlassDrawer,
  GlassEmptyState,
  GlassFilterPanel,
  GlassMap,
  GlassPagination,
  GlassSegmentedControl,
  GlassSelect,
  GlassSkeleton,
} from '@repo/ui'
import { withBase } from '@/config/base-path'
import { PageContainer } from '@/components/PageContainer'
import type {
  AiFilterProposal,
  ListingSearchResponse,
  ListingSummary,
} from './data/listing-adapter'
import {
  changeCategory,
  type ListingSearchState,
  type PropertyCategory,
  type TransactionType,
} from './domain/search-state'
import styles from './EmlakSearchView.module.css'

type HistoryMode = 'push' | 'replace'

export interface EmlakSearchViewProps {
  state: ListingSearchState
  response?: ListingSearchResponse
  status: 'loading' | 'refreshing' | 'success' | 'error'
  errorMessage?: string
  onStateChange: (
    state: ListingSearchState,
    options: { history: HistoryMode },
  ) => void
  onAiSearch: (query: string) => void
  onSaveSearch: () => void
  aiProposal?: AiFilterProposal
  aiLoading?: boolean
  onApplyAiProposal?: () => void
  onDismissAiProposal?: () => void
}

const CATEGORY_OPTIONS: Array<{
  value: PropertyCategory
  label: string
}> = [
  { value: 'all', label: 'Tüm Emlak' },
  { value: 'residential', label: 'Konut' },
  { value: 'land', label: 'Arsa' },
  { value: 'commercial', label: 'İş Yeri' },
  { value: 'building', label: 'Bina' },
  { value: 'timeshare', label: 'Devremülk' },
  { value: 'touristic', label: 'Turistik Tesis' },
]

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<PropertyCategory, string>

const CITY_OPTIONS = [
  ['', 'Tüm Türkiye'],
  ['istanbul', 'İstanbul'],
  ['ankara', 'Ankara'],
  ['izmir', 'İzmir'],
  ['bursa', 'Bursa'],
  ['antalya', 'Antalya'],
  ['muğla', 'Muğla'],
] as const

const SORT_OPTIONS = [
  ['recommended', 'Önerilen sıralama'],
  ['newest', 'En yeni ilanlar'],
  ['price-asc', 'Fiyat: düşükten yükseğe'],
  ['price-desc', 'Fiyat: yüksekten düşüğe'],
  ['unit-price', 'm² fiyatı'],
] as const

const formatter = new Intl.NumberFormat('tr-TR')

function currency(value: number, transaction: TransactionType) {
  return `${formatter.format(value)} TL${transaction === 'rent' ? ' / ay' : ''}`
}

function updateRange(
  state: ListingSearchState,
  key: 'salePrice' | 'rentPrice' | 'area',
  edge: 'min' | 'max',
  value: string,
): ListingSearchState {
  const parsed = value === '' ? undefined : Number(value)
  return {
    ...state,
    [key]: {
      ...state[key],
      [edge]:
        parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined,
    },
    page: 1,
  }
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

function FilterSection({
  title,
  children,
  open = true,
}: {
  title: string
  children: ReactNode
  open?: boolean
}) {
  return (
    <details className={styles.filterSection} open={open}>
      <summary>{title}</summary>
      <div className={styles.filterSectionBody}>{children}</div>
    </details>
  )
}

interface FilterFormProps {
  state: ListingSearchState
  resultCount: number
  onChange: (state: ListingSearchState) => void
  onReset: () => void
  footer?: ReactNode
}

function FilterForm({
  state,
  resultCount,
  onChange,
  onReset,
  footer,
}: FilterFormProps) {
  const selectId = useId()

  const setCategoryFilter = (key: string, value: string) => {
    const nextValues = toggleValue(state.categoryFilters[key] ?? [], value)
    onChange({
      ...state,
      categoryFilters: {
        ...state.categoryFilters,
        [key]: nextValues,
      },
      page: 1,
    })
  }

  return (
    <GlassFilterPanel
      label="Emlak filtreleri"
      title="Filtreler"
      resultCount={resultCount}
      resultLabel={(count) => `${count} ilan`}
      onReset={onReset}
      footer={footer}
      material="flat"
      className={styles.filterPanel}
    >
      <FilterSection title="İlan türü ve kategori">
        <div className={styles.checkStack}>
          <GlassCheckbox
            label="Satılık"
            checked={state.transactions.includes('sale')}
            onChange={() => {
              const transactions = toggleValue(state.transactions, 'sale')
              if (transactions.length > 0)
                onChange({ ...state, transactions, page: 1 })
            }}
          />
          <GlassCheckbox
            label="Kiralık"
            checked={state.transactions.includes('rent')}
            onChange={() => {
              const transactions = toggleValue(state.transactions, 'rent')
              if (transactions.length > 0)
                onChange({ ...state, transactions, page: 1 })
            }}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${selectId}-category`}>Kategori</label>
          <GlassSelect
            id={`${selectId}-category`}
            options={CATEGORY_OPTIONS}
            value={state.category}
            onChange={(category) =>
              onChange(
                changeCategory(
                  state,
                  category as PropertyCategory,
                ),
              )
            }
          />
        </div>
      </FilterSection>

      <FilterSection title="Konum">
        <div className={styles.field}>
          <label htmlFor={`${selectId}-city`}>Şehir</label>
          <GlassSelect
            id={`${selectId}-city`}
            options={CITY_OPTIONS.map(([value, label]) => ({ value, label }))}
            value={state.city ?? ''}
            onChange={(city) =>
              onChange({
                ...state,
                city: city || undefined,
                district: undefined,
                page: 1,
              })
            }
          />
        </div>
        <label className={styles.field}>
          <span>İlçe</span>
          <input
            value={state.district ?? ''}
            placeholder="İlçe ara"
            onChange={(event) =>
              onChange({
                ...state,
                district: event.target.value || undefined,
                page: 1,
              })
            }
          />
        </label>
      </FilterSection>

      {state.transactions.includes('sale') ? (
        <FilterSection title="Satılık fiyatı">
          <div className={styles.range}>
            <label>
              <span>En az</span>
              <input
                inputMode="numeric"
                aria-label="En düşük satılık fiyatı"
                value={state.salePrice?.min ?? ''}
                onChange={(event) =>
                  onChange(
                    updateRange(state, 'salePrice', 'min', event.target.value),
                  )
                }
              />
            </label>
            <label>
              <span>En çok</span>
              <input
                inputMode="numeric"
                aria-label="En yüksek satılık fiyatı"
                value={state.salePrice?.max ?? ''}
                onChange={(event) =>
                  onChange(
                    updateRange(state, 'salePrice', 'max', event.target.value),
                  )
                }
              />
            </label>
          </div>
        </FilterSection>
      ) : null}

      {state.transactions.includes('rent') ? (
        <FilterSection title="Aylık kira">
          <div className={styles.range}>
            <label>
              <span>En az</span>
              <input
                inputMode="numeric"
                aria-label="En düşük aylık kira"
                value={state.rentPrice?.min ?? ''}
                onChange={(event) =>
                  onChange(
                    updateRange(state, 'rentPrice', 'min', event.target.value),
                  )
                }
              />
            </label>
            <label>
              <span>En çok</span>
              <input
                inputMode="numeric"
                aria-label="En yüksek aylık kira"
                value={state.rentPrice?.max ?? ''}
                onChange={(event) =>
                  onChange(
                    updateRange(state, 'rentPrice', 'max', event.target.value),
                  )
                }
              />
            </label>
          </div>
        </FilterSection>
      ) : null}

      <FilterSection title="Alan">
        <div className={styles.range}>
          <label>
            <span>En az m²</span>
            <input
              inputMode="numeric"
              aria-label="En düşük alan"
              value={state.area?.min ?? ''}
              onChange={(event) =>
                onChange(updateRange(state, 'area', 'min', event.target.value))
              }
            />
          </label>
          <label>
            <span>En çok m²</span>
            <input
              inputMode="numeric"
              aria-label="En yüksek alan"
              value={state.area?.max ?? ''}
              onChange={(event) =>
                onChange(updateRange(state, 'area', 'max', event.target.value))
              }
            />
          </label>
        </div>
      </FilterSection>

      {state.category === 'land' ? (
        <>
          <FilterSection title="İmar ve tapu">
            <div className={styles.checkStack}>
              <GlassCheckbox
                label="Konut imarlı"
                checked={(state.categoryFilters.zoning ?? []).includes(
                  'residential',
                )}
                onChange={() => setCategoryFilter('zoning', 'residential')}
              />
              <GlassCheckbox
                label="Turizm imarlı"
                checked={(state.categoryFilters.zoning ?? []).includes(
                  'tourism',
                )}
                onChange={() => setCategoryFilter('zoning', 'tourism')}
              />
              <GlassCheckbox
                label="Müstakil tapu"
                checked={(state.categoryFilters.deed ?? []).includes(
                  'detached',
                )}
                onChange={() => setCategoryFilter('deed', 'detached')}
              />
            </div>
          </FilterSection>
          <FilterSection title="Altyapı ve konum">
            <div className={styles.checkStack}>
              <GlassCheckbox
                label="Yola cepheli"
                checked={(state.categoryFilters.road ?? []).includes(
                  'frontage',
                )}
                onChange={() => setCategoryFilter('road', 'frontage')}
              />
              <GlassCheckbox label="Elektrik hattı yakınında" />
              <GlassCheckbox label="Su hattı yakınında" />
            </div>
          </FilterSection>
        </>
      ) : null}

      {state.category === 'residential' ? (
        <FilterSection title="Konut özellikleri">
          <div className={styles.checkStack}>
            {['1+1', '2+1', '3+1', '4+1'].map((room) => (
              <GlassCheckbox
                key={room}
                label={room}
                checked={(state.categoryFilters.rooms ?? []).includes(room)}
                onChange={() => setCategoryFilter('rooms', room)}
              />
            ))}
          </div>
        </FilterSection>
      ) : null}

      {state.category !== 'all' &&
      state.category !== 'land' &&
      state.category !== 'residential' ? (
        <FilterSection title={`${CATEGORY_LABELS[state.category]} özellikleri`}>
          <div className={styles.checkStack}>
            <GlassCheckbox label="Kullanıma hazır" />
            <GlassCheckbox label="Otopark" />
            <GlassCheckbox label="Ruhsatlı / belgeli" />
          </div>
        </FilterSection>
      ) : null}

      <FilterSection title="Güven ve satıcı">
        <div className={styles.checkStack}>
          <GlassCheckbox
            label="Yalnız doğrulanmış ilanlar"
            checked={state.verified}
            onChange={() =>
              onChange({ ...state, verified: !state.verified, page: 1 })
            }
          />
          <GlassCheckbox
            label="Sahibinden"
            checked={state.owners.includes('owner')}
            onChange={() =>
              onChange({
                ...state,
                owners: toggleValue(state.owners, 'owner'),
                page: 1,
              })
            }
          />
          <GlassCheckbox
            label="Emlak ofisinden"
            checked={state.owners.includes('agency')}
            onChange={() =>
              onChange({
                ...state,
                owners: toggleValue(state.owners, 'agency'),
                page: 1,
              })
            }
          />
        </div>
      </FilterSection>
    </GlassFilterPanel>
  )
}

function ListingCard({
  item,
  layout,
  selected,
  onSelect,
}: {
  item: ListingSummary
  layout: 'row' | 'grid'
  selected: boolean
  onSelect: () => void
}) {
  return (
    <article
      aria-label={`${item.title} ilanı`}
      className={[
        styles.listing,
        styles[layout],
        selected ? styles.selectedListing : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={onSelect}
      onFocusCapture={onSelect}
    >
      <a href={withBase(`/ilan/${item.id}`)} className={styles.media}>
        <img src={item.image.src} alt={item.image.alt} />
        <span>{item.imageCount} fotoğraf</span>
      </a>
      <div className={styles.listingBody}>
        <div className={styles.listingTopline}>
          <span className={styles.categoryTag}>
            {CATEGORY_LABELS[item.category]} ·{' '}
            {item.transaction === 'sale' ? 'Satılık' : 'Kiralık'}
          </span>
          {item.verified ? (
            <span className={styles.verified}>Doğrulanmış</span>
          ) : (
            <span className={styles.unverified}>Doğrulama bekliyor</span>
          )}
        </div>
        <a href={withBase(`/ilan/${item.id}`)} className={styles.listingTitle}>
          {item.title}
        </a>
        <p className={styles.location}>
          {item.city.toLocaleUpperCase('tr-TR')} ·{' '}
          {item.district.toLocaleUpperCase('tr-TR')}
        </p>
        <ul className={styles.highlights} aria-label="Temel özellikler">
          <li>{formatter.format(item.area)} m²</li>
          {item.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <div className={styles.listingFooter}>
          <span>
            {item.sellerName} · {item.publishedDays} gün önce
          </span>
          <span>{formatter.format(item.unitPrice)} TL/m²</span>
        </div>
      </div>
      <div className={styles.priceBlock}>
        <strong>{currency(item.price, item.transaction)}</strong>
        <div className={styles.cardActions}>
          <button type="button" aria-label="Karşılaştırmaya ekle">
            Karşılaştır
          </button>
          <button type="button" aria-label="Favoriye ekle">
            Kaydet
          </button>
        </div>
      </div>
    </article>
  )
}

function LoadingResults() {
  return (
    <div className={styles.skeletonList} aria-label="İlanlar yükleniyor">
      {Array.from({ length: 6 }, (_, index) => (
        <GlassSkeleton
          key={index}
          variant="rect"
          className={styles.skeleton}
        />
      ))}
    </div>
  )
}

function activeFilterChips(state: ListingSearchState) {
  const chips: Array<{ key: string; label: string; state: ListingSearchState }> =
    []
  if (state.category !== 'all') {
    chips.push({
      key: 'category',
      label: CATEGORY_LABELS[state.category],
      state: changeCategory(state, 'all'),
    })
  }
  if (state.city) {
    chips.push({
      key: 'city',
      label: state.city.toLocaleUpperCase('tr-TR'),
      state: { ...state, city: undefined, district: undefined, page: 1 },
    })
  }
  if (state.salePrice?.max !== undefined) {
    chips.push({
      key: 'sale-price',
      label: `Satılık ≤ ${formatter.format(state.salePrice.max)} TL`,
      state: { ...state, salePrice: undefined, page: 1 },
    })
  }
  if (state.rentPrice?.max !== undefined) {
    chips.push({
      key: 'rent-price',
      label: `Kira ≤ ${formatter.format(state.rentPrice.max)} TL`,
      state: { ...state, rentPrice: undefined, page: 1 },
    })
  }
  if (state.area?.min !== undefined) {
    chips.push({
      key: 'area',
      label: `Alan ≥ ${formatter.format(state.area.min)} m²`,
      state: { ...state, area: undefined, page: 1 },
    })
  }
  if (state.verified) {
    chips.push({
      key: 'verified',
      label: 'Doğrulanmış',
      state: { ...state, verified: false, page: 1 },
    })
  }
  return chips
}

export function EmlakSearchView({
  state,
  response,
  status,
  errorMessage,
  onStateChange,
  onAiSearch,
  onSaveSearch,
  aiProposal,
  aiLoading = false,
  onApplyAiProposal,
  onDismissAiProposal,
}: EmlakSearchViewProps) {
  const sortSelectId = useId()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [draftState, setDraftState] = useState(state)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  useEffect(() => {
    if (!mobileFiltersOpen) setDraftState(state)
  }, [mobileFiltersOpen, state])

  const total = response?.total ?? 0
  const chips = activeFilterChips(state)
  const pins = useMemo(
    () =>
      (response?.items ?? []).map((item) => ({
        id: item.id,
        x: item.map.x,
        y: item.map.y,
        price:
          item.transaction === 'rent'
            ? `${Math.round(item.price / 1000)}B`
            : `${(item.price / 1_000_000).toFixed(1)}M`,
      })),
    [response],
  )

  const desktopChange = (next: ListingSearchState) =>
    onStateChange(next, { history: 'replace' })

  return (
    <PageContainer size="wide" className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Türkiye emlak pazarı</p>
          <h1>{CATEGORY_LABELS[state.category]}</h1>
          <p>
            Konut, arsa, iş yeri ve yatırım fırsatlarını tek çalışma alanında
            karşılaştırın.
          </p>
        </div>
        <GlassButton size="md" onClick={onSaveSearch}>
          Aramayı kaydet
        </GlassButton>
      </header>

      <section className={styles.searchArea} aria-label="Akıllı emlak araması">
        <GlassAiSearchBar
          value={state.query}
          onValueChange={(query) =>
            onStateChange(
              { ...state, query, page: 1 },
              { history: 'replace' },
            )
          }
          onSubmit={onAiSearch}
          placeholder='Örn. "Urla’da 5 milyon altı imarlı arsa"'
          suggestions={[
            'İzmir’de denize yakın satılık konut',
            'Urla’da 5 milyon altı imarlı arsa',
            'İstanbul’da kiralık cadde mağazası',
          ]}
          loading={aiLoading}
        />
      </section>

      {aiProposal && aiProposal.filters.length > 0 ? (
        <section className={styles.aiProposal} aria-label="AI filtre önerisi">
          <div>
            <span className={styles.aiBadge}>AI önerisi</span>
            <strong>Sorgunuzu {aiProposal.filters.length} filtreye çevirdik</strong>
            <span>%{aiProposal.confidence} güven</span>
          </div>
          <ul>
            {aiProposal.filters.map((filter) => (
              <li key={filter.key}>
                <span>{filter.label}</span>
                <strong>{filter.displayValue}</strong>
              </li>
            ))}
          </ul>
          <div className={styles.aiActions}>
            <GlassButton size="sm" onClick={onDismissAiProposal}>
              Şimdi değil
            </GlassButton>
            <GlassButton size="sm" prominent onClick={onApplyAiProposal}>
              Önerilen filtreleri uygula
            </GlassButton>
          </div>
        </section>
      ) : null}

      {chips.length > 0 ? (
        <section className={styles.appliedFilters} aria-label="Uygulanan filtreler">
          <span>Uygulanan filtreler</span>
          <div>
            {chips.map((chip) => (
              <GlassChip
                key={chip.key}
                size="sm"
                onRemove={() =>
                  onStateChange(chip.state, { history: 'replace' })
                }
              >
                {chip.label}
              </GlassChip>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              onStateChange(
                {
                  ...state,
                  category: 'all',
                  city: undefined,
                  district: undefined,
                  salePrice: undefined,
                  rentPrice: undefined,
                  area: undefined,
                  unitPrice: undefined,
                  owners: [],
                  verified: false,
                  categoryFilters: {},
                  page: 1,
                },
                { history: 'replace' },
              )
            }
          >
            Tümünü temizle
          </button>
        </section>
      ) : null}

      <div className={styles.mobileToolbar}>
        <GlassButton
          size="md"
          onClick={() => setMobileFiltersOpen(true)}
          aria-label="Filtreleri aç"
        >
          Filtreler
        </GlassButton>
        <span>{total} ilan</span>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.desktopFilters}>
          <FilterForm
            state={state}
            resultCount={total}
            onChange={desktopChange}
            onReset={() =>
              onStateChange(
                {
                  ...state,
                  category: 'all',
                  city: undefined,
                  district: undefined,
                  salePrice: undefined,
                  rentPrice: undefined,
                  area: undefined,
                  unitPrice: undefined,
                  owners: [],
                  verified: false,
                  categoryFilters: {},
                  page: 1,
                },
                { history: 'replace' },
              )
            }
          />
        </aside>

        <section className={styles.results} aria-labelledby="results-heading">
          <div className={styles.resultsToolbar}>
            <div>
              <h2 id="results-heading">{total} ilan</h2>
              <p aria-live="polite">
                {status === 'refreshing'
                  ? 'Sonuçlar güncelleniyor'
                  : `${total} ilan bulundu`}
              </p>
            </div>
            <div className={styles.toolbarControls}>
              <div className={styles.sortField}>
                <label htmlFor={sortSelectId}>Sıralama</label>
                <GlassSelect
                  id={sortSelectId}
                  options={SORT_OPTIONS.map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  value={state.sort}
                  onChange={(sort) =>
                    onStateChange(
                      {
                        ...state,
                        sort: sort as ListingSearchState['sort'],
                        page: 1,
                      },
                      { history: 'replace' },
                    )
                  }
                />
              </div>
              <GlassSegmentedControl
                size="sm"
                label="Sonuç düzeni"
                value={state.layout}
                options={[
                  { value: 'row', label: 'Liste' },
                  { value: 'grid', label: 'Izgara' },
                ]}
                onChange={(layout) =>
                  onStateChange(
                    {
                      ...state,
                      layout: layout as ListingSearchState['layout'],
                    },
                    { history: 'replace' },
                  )
                }
              />
              <GlassSegmentedControl
                size="sm"
                label="Harita görünümü"
                value={state.mapMode}
                options={[
                  { value: 'off', label: 'Sonuçlar' },
                  { value: 'split', label: 'Bölünmüş' },
                  { value: 'full', label: 'Harita' },
                ]}
                onChange={(mapMode) =>
                  onStateChange(
                    {
                      ...state,
                      mapMode: mapMode as ListingSearchState['mapMode'],
                    },
                    { history: 'replace' },
                  )
                }
              />
            </div>
          </div>

          {status === 'loading' ? <LoadingResults /> : null}
          {status === 'error' ? (
            <GlassEmptyState
              variant="error"
              title="İlanlar yüklenemedi"
              description={
                errorMessage ??
                'Bağlantıyı kontrol edip yeniden deneyin. Filtreleriniz korundu.'
              }
              action={
                <GlassButton onClick={() => onStateChange(state, { history: 'replace' })}>
                  Yeniden dene
                </GlassButton>
              }
            />
          ) : null}
          {status !== 'loading' && status !== 'error' && total === 0 ? (
            <GlassEmptyState
              title="Bu ölçütlerle eşleşen ilan yok"
              description="Fiyat aralığını genişletin veya uzman filtrelerden birini kaldırın."
              action={
                <GlassButton
                  onClick={() =>
                    onStateChange(
                      {
                        ...state,
                        salePrice: undefined,
                        rentPrice: undefined,
                        categoryFilters: {},
                        page: 1,
                      },
                      { history: 'replace' },
                    )
                  }
                >
                  Filtreleri gevşet
                </GlassButton>
              }
            />
          ) : null}

          {status !== 'loading' && status !== 'error' && total > 0 ? (
            <div
              className={[
                styles.resultStage,
                state.mapMode !== 'off' ? styles.withMap : '',
                state.mapMode === 'full' ? styles.mapOnly : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {state.mapMode !== 'full' ? (
                <div
                  className={[
                    styles.list,
                    state.layout === 'grid' ? styles.gridList : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {response?.items.map((item) => (
                    <ListingCard
                      key={item.id}
                      item={item}
                      layout={state.layout}
                      selected={selectedId === item.id}
                      onSelect={() => setSelectedId(item.id)}
                    />
                  ))}
                </div>
              ) : null}
              {state.mapMode !== 'off' ? (
                <div className={styles.mapPanel}>
                  <GlassMap
                    variant="panel"
                    label="İlan haritası"
                    pins={pins}
                    selectedId={selectedId ?? null}
                    onPinSelect={setSelectedId}
                    popupContent={(id) => {
                      const item = response?.items.find(
                        (listing) => listing.id === id,
                      )
                      return item ? (
                        <strong>{currency(item.price, item.transaction)}</strong>
                      ) : null
                    }}
                    seed="enterprise-emlak"
                  />
                  <GlassButton size="sm" className={styles.mapSearchButton}>
                    Bu alanda ara
                  </GlassButton>
                </div>
              ) : null}
            </div>
          ) : null}

          {response && response.pageCount > 1 && state.mapMode !== 'full' ? (
            <div className={styles.pagination}>
              <GlassPagination
                page={response.page}
                pageCount={response.pageCount}
                onPageChange={(page) =>
                  onStateChange(
                    { ...state, page },
                    { history: 'push' },
                  )
                }
              />
            </div>
          ) : null}
        </section>
      </div>

      <GlassDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Emlak filtreleri"
        side="bottom"
        size="lg"
        footer={
          <div className={styles.drawerActions}>
            <GlassButton
              onClick={() => setDraftState(state)}
            >
              Değişiklikleri sıfırla
            </GlassButton>
            <GlassButton
              prominent
              onClick={() => {
                onStateChange(draftState, { history: 'push' })
                setMobileFiltersOpen(false)
              }}
            >
              {response?.total ?? 0} ilanı göster
            </GlassButton>
          </div>
        }
      >
        <FilterForm
          state={draftState}
          resultCount={response?.total ?? 0}
          onChange={setDraftState}
          onReset={() =>
            setDraftState({
              ...state,
              category: 'all',
              city: undefined,
              district: undefined,
              salePrice: undefined,
              rentPrice: undefined,
              area: undefined,
              unitPrice: undefined,
              owners: [],
              verified: false,
              categoryFilters: {},
              page: 1,
            })
          }
        />
      </GlassDrawer>
    </PageContainer>
  )
}
