import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  GlassAiSearchBar,
  GlassButton,
  GlassCheckbox,
  GlassChip,
  GlassDrawer,
  GlassEmptyState,
  GlassFilterPanel,
  GlassListingCard,
  GlassListingRowCard,
  GlassMap,
  GlassMapPopupCard,
  GlassPagination,
  GlassRibbon,
  GlassSegmentedControl,
  GlassSelect,
  GlassSkeleton,
} from '@repo/ui'
import { withBase } from '@/config/base-path'
import { EXPLORE_BASEMAP } from '@/config/basemap'
import { FACET_BY_KEY, FILTER_SECTIONS } from './domain/filter-catalog'
import { sectionFacets } from './domain/filter-catalog-types'
import { CatalogFilterControls } from './components/CatalogFilterControls'
import { AllFiltersModal } from './components/AllFiltersModal'
import { FilterStream } from './components/FilterStream'
import { PageContainer } from '@/components/PageContainer'
import {
  countListings,
  type AiFilterProposal,
  type ListingSearchResponse,
  type ListingSummary,
} from './data/listing-adapter'
import {
  changeCategory,
  clearListingFilters,
  type ListingSearchState,
  type PropertyCategory,
  type TransactionType,
} from './domain/search-state'
import {
  getCategoryStockPhoto,
  getRepresentativeListingImage,
  stockPhotoCount,
} from './data/listing-photos'
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

/* Dar ekran algısı: satır kartı mobilde bileşenin kendi `sm` yoğunluğuna
   iner — yoğunluk bir prop olduğu için kırılma CSS'te değil burada
   (MapFirstHome'daki fill anahtarıyla aynı desen). Eşik, sayfanın mobil
   kap sorgusuyla aynı (48rem). */
const DAR_EKRAN_SORGUSU = '(max-width: 48rem)'
const subscribeDarEkran = (onChange: () => void) => {
  const mql = window.matchMedia(DAR_EKRAN_SORGUSU)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
const darEkranMi = () => window.matchMedia(DAR_EKRAN_SORGUSU).matches

/* Mobil mod segmentinin ikonları — dekoratif (aria-hidden segment içinde);
   erişilebilir ad seçenek etiketinden gelir. */
function ListGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden focusable="false">
      <path d="M3 4.5h10M3 8h10M3 11.5h10" />
    </svg>
  )
}

function MapGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="M2.5 4.2 6 2.8l4 1.4 3.5-1.4v9.4L10 13.6l-4-1.4-3.5 1.4Z" />
      <path d="M6 2.8v9.4M10 4.2v9.4" />
    </svg>
  )
}

/* Özellik rozetlerinin ikonları — rozet salt bilgi, ikon dekoratif. */
function AreaGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden focusable="false">
      <rect x="1.8" y="1.8" width="8.4" height="8.4" rx="1" />
      <path d="M1.8 6h8.4M6 1.8v8.4" />
    </svg>
  )
}

function ZoningGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="M2 10.5V4.8L6 2l4 2.8v5.7M4.5 10.5V7h3v3.5" />
    </svg>
  )
}

function DeedGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="M3 1.8h4.5L9.5 4v6.2H3Z" />
      <path d="M7.2 1.8V4h2.3" />
    </svg>
  )
}

function RoadGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden focusable="false">
      <path d="M2.5 10.5 5 1.5M9.5 10.5 7 1.5M5.7 4.2h.9M5.4 7.2h1.4" />
    </svg>
  )
}

function CompareGlyph() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="M5 2 2.5 4.5 5 7M2.5 4.5h9M9 7l2.5 2.5L9 12M11.5 9.5h-9" />
    </svg>
  )
}

/* Serbest metin öne çıkanı ikona bağlar: sınıflandırma anahtar kelimeyle —
   eşleşmeyen rozet ikonsuz kalır (yanlış ikon, ikonsuzdan kötüdür). */
function highlightGlyph(label: string): ReactNode {
  const l = label.toLocaleLowerCase('tr-TR')
  if (/imar|konut|ticari|tarla|bina/.test(l)) return <ZoningGlyph />
  if (/tapu|kat mülkiyeti|iskân|iskan/.test(l)) return <DeedGlyph />
  if (/yol|cephe|kadastro/.test(l)) return <RoadGlyph />
  return undefined
}

function currency(value: number, transaction: TransactionType) {
  return `${formatter.format(value)} TL${transaction === 'rent' ? ' / ay' : ''}`
}

/**
 * "İlçe, İl" — şehir/ilçe veride küçük harfli anahtar olarak durur, görünür
 * metin Türkçe yerelinde büyük harfe çevrilir (i/İ ayrımı için `tr-TR` şart).
 */
function locationLabel(item: Pick<ListingSummary, 'city' | 'district'>): string {
  const capitalize = (value: string) =>
    value.charAt(0).toLocaleUpperCase('tr-TR') + value.slice(1)
  return `${capitalize(item.district)}, ${capitalize(item.city)}`
}

/**
 * Harita pini için kısaltılmış fiyat. Kapsül zemini kapatmasın diye tam tutar
 * değil büyüklük mertebesi yazılır; tam tutarı popup ve ilan kartı taşır.
 * Milyonun altındaki satışlar da "B" (bin) ile okunur — aksi halde 850.000 TL
 * "0,9M" olarak yuvarlanıp yanıltıcı hale geliyordu.
 */
function compactPrice(value: number, transaction: TransactionType): string {
  const suffix = transaction === 'rent' ? '/ay' : ''
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    // 10M üstünde ondalık gürültüdür; altında tek hane ayırt edici.
    const text = millions >= 10 ? String(Math.round(millions)) : millions.toFixed(1).replace('.', ',')
    return `₺${text}M${suffix}`
  }
  return `₺${Math.round(value / 1000)}B${suffix}`
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
  selectedCount = 0,
}: {
  title: string
  children: ReactNode
  open?: boolean
  /** Bu bölümde kaç kriterin seçili olduğu — kapalıyken de görünür kalır. */
  selectedCount?: number
}) {
  return (
    <details className={styles.filterSection} open={open}>
      <summary>
        <span className={styles.filterSectionTitle}>{title}</span>
        {selectedCount > 0 ? (
          <span
            className={styles.sectionCount}
            aria-label={`${selectedCount} kriter seçili`}
          >
            {selectedCount}
          </span>
        ) : null}
        {/* Ok, GlassSelect'in chevron'uyla aynı çizim: metin karakteri
            (`⌄`) fontla birlikte değişiyor ve satır ortasına oturmuyordu. */}
        <svg
          className={styles.filterChevron}
          viewBox="0 0 12 12"
          width="12"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M2.5 4.5L6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
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
  /**
   * Panelin nerede yaşadığı.
   *
   * `sidebar` (masaüstü): dar kolona yalnız `core` kriterler sığar, gerisi
   * "Tüm Seçenekler" modalına devredilir.
   * `sheet` (mobil çekmece): çekmece zaten tam ekran bir yüzey; kriterleri
   * ikinci bir modala saklamak yerine HEPSİ burada açılır. Çekmecenin üstüne
   * modal bindirmek hem odak tuzağını iç içe geçirir hem de kullanıcıyı iki
   * kademe geri gitmeye zorlardı.
   */
  surface?: 'sidebar' | 'sheet'
  /** "Tüm Seçenekler"i açar; verilmezse düğme render EDİLMEZ (yalancı kontrol yok). */
  onOpenAllFilters?: () => void
  /** Katalogda kaç kriterin etkin olduğu — başlıkta ve düğmede görünür */
  activeCount?: number
}

function FilterForm({
  state,
  resultCount,
  onChange,
  onReset,
  footer,
  surface = 'sidebar',
  onOpenAllFilters,
  activeCount = 0,
}: FilterFormProps) {
  const selectId = useId()

  return (
    <GlassFilterPanel
      label="Emlak filtreleri"
      title={
        <span className={styles.panelTitle}>
          {/* Çekmecede başlık "Emlak filtreleri" zaten diyalogun adı; aynı
              sözü tekrar etmemek için katalog görünümü kendi adını söyler. */}
          {surface === 'sheet' ? 'Tüm kriterler' : 'Filtreler'}
          {activeCount > 0 ? (
            <span
              className={styles.sectionCount}
              aria-label={`${activeCount} kriter etkin`}
            >
              {activeCount}
            </span>
          ) : null}
        </span>
      }
      resultCount={resultCount}
      resultLabel={(count) => `${count} ilan`}
      onReset={onReset}
      footer={footer}
      material="flat"
      className={styles.filterPanel}
    >
      {/* Akordeon satırları TEK liste: panelin gövde boşluğu (space-4) her
          bölümün altına ekleniyor, ayraç ise üstünde duruyordu — başlık
          çizgiye yapışıp altında boşluk kalıyordu. Liste kendi ritmini
          kurar: ayraçlar arası tek satır yüksekliği. */}
      <div className={styles.filterSections}>
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
                  // İlçe değişince mahalle anlamını yitirir.
                  neighbourhood: undefined,
                  page: 1,
                })
              }
            />
          </label>
          <label className={styles.field}>
            <span>Mahalle</span>
            <input
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

        {/* Katalog tabanlı bölümler: elle yazılmış kategori blokları yerine tek
            kaynaktan (filter-catalog.ts) gelir. Kenar çubuğunda YALNIZ `core`
            kriterler durur; gerisi "Tüm Seçenekler" modalında yaşar — dar bir
            kolona 60+ kriter sığdırmaya çalışmak hepsini okunmaz kılıyordu. */}
        {FILTER_SECTIONS.map((section) => {
          const all = sectionFacets(section, state.category)
          const facets = surface === 'sheet' ? all : all.filter((facet) => facet.importance === 'core')
          if (facets.length === 0) return null
          const chosen = facets.reduce(
            (total, facet) =>
              total +
              (facet.type === 'range'
                ? state.categoryRanges[facet.key]
                  ? 1
                  : 0
                : (state.categoryFilters[facet.key] ?? []).length > 0
                  ? 1
                  : 0),
            0,
          )
          return (
            <FilterSection
              key={section.id}
              title={section.title}
              selectedCount={chosen}
              // Seçim yapılmamış bölümler kapalı başlar: dar kolonda 12 bölüm
              // birden açıkken kullanıcı hiçbirini göremiyordu.
              open={chosen > 0}
            >
              <CatalogFilterControls facets={facets} state={state} onChange={onChange} />
            </FilterSection>
          )
        })}

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
              label="Yalnız vitrin ilanları"
              checked={state.featured}
              onChange={() =>
                onChange({ ...state, featured: !state.featured, page: 1 })
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
      </div>

      {onOpenAllFilters ? (
        <button type="button" className={styles.allFiltersTrigger} onClick={onOpenAllFilters}>
          Tüm Seçenekler
          {activeCount > 0 ? <span className={styles.sectionCount}>{activeCount}</span> : null}
        </button>
      ) : null}
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
  const [favorite, setFavorite] = useState(false)
  const darEkran = useSyncExternalStore(subscribeDarEkran, darEkranMi, () => false)
  // Galeri kareleri: kategori stok havuzundan, ilk kare = temsili kapak.
  // Havuz uzunluğunu aşma — aynı kare iki kez görünürse "iki görsel var"
  // izlenimi doğar (listing-photos yorumu).
  const galleryImages = useMemo(
    () =>
      Array.from(
        { length: Math.min(item.imageCount, stockPhotoCount(item.category)) },
        (_, index) =>
          getCategoryStockPhoto(item.category, index, `${item.title} — temsili görsel ${index + 1}`),
      ),
    [item.category, item.imageCount, item.title],
  )
  // Her iki düzen de aynı temsili kareyi kullanır; ilan verisinde taşınmazın
  // kendi fotoğrafı yok (bkz. REPRESENTATIVE_IMAGE_NOTE).
  const representativeImage = getRepresentativeListingImage(item)

  if (layout === 'grid') {
    return (
      <article
        aria-label={`${item.title} ilanı`}
        className={[
          styles.gridListingShell,
          selected ? styles.selectedGridListing : '',
        ].filter(Boolean).join(' ')}
        onMouseEnter={onSelect}
        onFocusCapture={onSelect}
      >
        {/* 2-yukarı mobil ızgarada overlay yerleşimi 140px karta sığmıyor
            (metrikler kurdele/yer imiyle çakışıyor) — dar ekran kompakt
            varyanta düşer: görsel + başlık + konum + fiyat. */}
        <GlassListingCard
          variant={darEkran ? 'compact' : 'propertyOverlay'}
          material="flat"
          image={{ src: representativeImage.src, alt: representativeImage.alt }}
          badge={
            item.verified ? (
              <GlassRibbon label="Doğrulanmış" note="Temsili görsel" />
            ) : (
              <span className={styles.unverified}>Yetki bekliyor · Temsili</span>
            )
          }
          badgePlacement={item.verified ? 'corner' : 'inset'}
          pricePrefix={item.transaction === 'sale' ? 'Liste:' : 'Kira:'}
          price={currency(item.price, item.transaction)}
          title={item.title}
          location={`${item.city.toLocaleUpperCase('tr-TR')} · ${item.district.toLocaleUpperCase('tr-TR')}`}
          metrics={[
            { value: `${formatter.format(item.area)} m²`, label: 'Alan' },
            {
              value: CATEGORY_LABELS[item.category],
              label: item.transaction === 'sale' ? 'Satılık' : 'Kiralık',
            },
          ]}
          seller={item.sellerName}
          listedAt={`${item.publishedDays} gün önce`}
          aria-label={`${item.title}; ${currency(item.price, item.transaction)}; ${formatter.format(item.area)} metrekare; ${item.city}, ${item.district}`}
          onClick={() => {
            window.location.href = withBase(`/ilan/${item.id}`)
          }}
          style={{ width: '100%' }}
        />
        <span className={styles.overlayActions} aria-label="İlan eylemleri">
          <button
            type="button"
            aria-label={favorite ? 'Favorilerden çıkar' : 'Favoriye ekle'}
            aria-pressed={favorite}
            title={favorite ? 'Favorilerden çıkar' : 'Favoriye ekle'}
            onClick={() => setFavorite((current) => !current)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 3h12v18l-6-4-6 4V3Z" />
            </svg>
          </button>
        </span>
      </article>
    )
  }

  // Liste düzeni tasarım sistemindeki yatay karta devredildi; kabuk yalnız
  // harita eşlemesi (hover/focus → seçili ilan) ve seçim vurgusunu taşır.
  return (
    <GlassListingRowCard
      aria-label={`${item.title} ilanı`}
      size={darEkran ? 'sm' : 'md'}
      /* Liste görünümünün kimliği: HER genişlikte yatay kart (Varyant A,
         2026-08-08). Görsel sütun genişliği view CSS'inde kademelenir. */
      media="thumb"
      className={[styles.rowListing, selected ? styles.selectedListing : '']
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={onSelect}
      onFocusCapture={onSelect}
      image={representativeImage}
      images={galleryImages}
      mediaCaption={darEkran ? `${item.imageCount}` : `${item.imageCount} fotoğraf`}
      badge={
        item.verified ? (
          // Izgara kartıyla aynı dil: doğrulama köşe şerididir, kapsül değil.
          <GlassRibbon label="Doğrulanmış" note="Temsili görsel" size={darEkran ? 'xs' : 'sm'} />
        ) : (
          <span className={[styles.mediaBadge, styles.unverified].join(' ')}>
            Doğrulama bekliyor
          </span>
        )
      }
      badgePlacement={item.verified ? 'corner' : 'inset'}
      price={currency(item.price, item.transaction)}
      title={item.title}
      href={withBase(`/ilan/${item.id}`)}
      location={`${CATEGORY_LABELS[item.category]} · ${
        item.transaction === 'sale' ? 'Satılık' : 'Kiralık'
      } · ${locationLabel(item)}`}
      features={[
        { label: `${formatter.format(item.area)} m²`, icon: <AreaGlyph /> },
        ...item.highlights.map((highlight) => ({
          label: highlight,
          icon: highlightGlyph(highlight),
        })),
      ]}
      agent={{ name: item.sellerName }}
      listedAt={darEkran ? `${item.publishedDays}g` : `${item.publishedDays} gün önce`}
      footerMeta={`${formatter.format(item.unitPrice)} TL/m²`}
      favorite={favorite}
      onFavoriteChange={setFavorite}
      actions={[
        darEkran
          ? { id: 'compare', label: 'Karşılaştır', icon: <CompareGlyph /> }
          : { id: 'compare', label: 'Karşılaştır' },
      ]}
    />
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
      state: {
        ...state,
        city: undefined,
        district: undefined,
        neighbourhood: undefined,
        page: 1,
      },
    })
  }
  if (state.mapArea) {
    chips.push({
      key: 'map-area',
      label: 'Haritada seçili alan',
      state: { ...state, mapArea: undefined, page: 1 },
    })
  }
  if (state.neighbourhood) {
    chips.push({
      key: 'neighbourhood',
      label: `${state.neighbourhood.toLocaleUpperCase('tr-TR')} Mah.`,
      state: { ...state, neighbourhood: undefined, page: 1 },
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
  if (state.featured) {
    chips.push({
      key: 'featured',
      label: 'Vitrin ilanları',
      state: { ...state, featured: false, page: 1 },
    })
  }

  // Katalog filtreleri de çipe döner: modalda seçilen bir kriter panelde
  // görünmezse kullanıcı sonucun neden daraldığını anlayamaz ve geri alamaz.
  for (const [key, values] of Object.entries(state.categoryFilters)) {
    const facet = FACET_BY_KEY.get(key)
    if (!facet || values.length === 0) continue
    const label =
      facet.type === 'boolean'
        ? facet.label
        : `${facet.label}: ${values
            .map((value) => facet.options?.find((option) => option.value === value)?.label ?? value)
            .join(', ')}`
    const nextFilters = { ...state.categoryFilters }
    delete nextFilters[key]
    chips.push({
      key: `f-${key}`,
      label,
      state: { ...state, categoryFilters: nextFilters, page: 1 },
    })
  }

  for (const [key, bounds] of Object.entries(state.categoryRanges)) {
    const facet = FACET_BY_KEY.get(key)
    if (!facet) continue
    const unit = facet.unit ? ` ${facet.unit}` : ''
    const label =
      bounds.min !== undefined && bounds.max !== undefined
        ? `${facet.label}: ${formatter.format(bounds.min)}–${formatter.format(bounds.max)}${unit}`
        : bounds.min !== undefined
          ? `${facet.label} ≥ ${formatter.format(bounds.min)}${unit}`
          : `${facet.label} ≤ ${formatter.format(bounds.max as number)}${unit}`
    const nextRanges = { ...state.categoryRanges }
    delete nextRanges[key]
    chips.push({
      key: `r-${key}`,
      label,
      state: { ...state, categoryRanges: nextRanges, page: 1 },
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
  const [allFiltersOpen, setAllFiltersOpen] = useState(false)
  // Haritanın o anki kadrajı. State'e YAZILMAZ: her hareket bir render ve URL
  // güncellemesi tetiklerdi. Yalnız "Bu alanda ara" anında okunur.
  const viewportRef = useRef<[[number, number], [number, number]] | undefined>(undefined)
  const [draftState, setDraftState] = useState(state)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  useEffect(() => {
    if (!mobileFiltersOpen) setDraftState(state)
  }, [mobileFiltersOpen, state])

  const total = response?.total ?? 0
  const chips = activeFilterChips(state)
  const catalogFilterCount =
    Object.values(state.categoryFilters).filter((values) => values.length > 0).length +
    Object.keys(state.categoryRanges).length
  // Karar yaprağının alt eylemi taslak durumun sonucunu SAYAR; ağ turu
  // beklemeden hesaplanır ki her dokunuşta güncel kalsın.
  const draftCount = useMemo(() => countListings(draftState), [draftState])
  // Pin etiketi haritada okunabilir kalmalı: tam fiyat kapsülü zemini kapatır,
  // bu yüzden büyüklük mertebesine yuvarlanır (₺6,8M / ₺45B). Tam tutar
  // popup'ta ve kartta zaten yazılı.
  const pins = useMemo(
    () =>
      (response?.items ?? []).map((item) => ({
        id: item.id,
        lat: item.coordinates.lat,
        lng: item.coordinates.lng,
        // Zemin yüklenemezse şematik yüzeye düşülür (bkz. GlassMap rules §7).
        x: item.map.x,
        y: item.map.y,
        price: compactPrice(item.price, item.transaction),
        // Doğrulanmamış ilan uyarı tonunda: haritada da listedeki ayrımı korur.
        tone: item.verified ? ('accent' as const) : ('warning' as const),
      })),
    [response],
  )

  const desktopChange = (next: ListingSearchState) =>
    onStateChange(next, { history: 'replace' })

  return (
    <PageContainer size="wide" className={styles.page}>
      {/* Dar kapta başlık «V5-başlıklı» düzenine iner: eyebrow ve açıklama
          gizlenir, sayaç başlığın yanına gelir, kaydet kısa etiketle satırda
          kalır. Masaüstü blok aynı — davranış tamamen CSS kademesinde. */}
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Türkiye emlak pazarı</p>
          <div className={styles.heroTitleRow}>
            <h1>{CATEGORY_LABELS[state.category]}</h1>
            {/* Sayaç yalnız dar kapta görünür; erişilebilir sayaç results
                başlığında yaşamaya devam eder (orada sr-only'ye iner). */}
            <span className={styles.heroCount} aria-hidden>
              {total} ilan
            </span>
          </div>
          <p className={styles.heroDesc}>
            Konut, arsa, iş yeri ve yatırım fırsatlarını tek çalışma alanında
            karşılaştırın.
          </p>
        </div>
        <GlassButton size="md" onClick={onSaveSearch}>
          <span className={styles.saveLong}>Aramayı kaydet</span>
          <span className={styles.saveShort} aria-hidden>
            Kaydet
          </span>
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
              onStateChange(clearListingFilters(state),
                { history: 'replace' },
              )
            }
          >
            Tümünü temizle
          </button>
        </section>
      ) : null}

      {/* Dar kabın tek denetim çubuğu (V5-başlıklı): sayaç artık hero'da,
          sıralama/düzen/harita denetimleri buraya iner — results toolbar'ın
          masaüstü kopyaları dar kapta gizlenir, durum aynı state'ten okunur. */}
      <div className={styles.mobileToolbar}>
        <div className={styles.mobileToolbarRow}>
          <GlassButton
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Filtreleri aç"
          >
            Filtreler{catalogFilterCount > 0 ? ` (${catalogFilterCount})` : ''}
          </GlassButton>
          <div className={styles.mobileSort}>
            <GlassSelect
              aria-label="Sıralama"
              size="sm"
              material="flat"
              options={SORT_OPTIONS.map(([value, label]) => ({ value, label }))}
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
        </div>
        <div className={styles.mobileToolbarRow}>
          {/* Mobilde «Bölünmüş» yok: dar ekranda split zaten tam haritaya
              düşüyordu (resultStage.withMap .list gizli) — seçenek olarak
              sunmak yanıltıcıydı. URL'den split gelirse kontrol Harita'yı
              işaretler; iki mod ikonla temsil edilir, etiket ekran okuyucuda. */}
          <div className={styles.mobileMapMode}>
            <GlassSegmentedControl
              size="sm"
              variant="track"
              iconOnly
              label="Harita görünümü"
              value={state.mapMode === 'off' ? 'off' : 'full'}
              options={[
                { value: 'off', label: 'Sonuçlar', icon: <ListGlyph /> },
                { value: 'full', label: 'Harita', icon: <MapGlyph /> },
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
          <div className={styles.mobileLayout}>
            <GlassSegmentedControl
              size="sm"
              variant="track"
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
          </div>
        </div>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.desktopFilters}>
          <FilterForm
            state={state}
            resultCount={total}
            onChange={desktopChange}
            activeCount={catalogFilterCount}
            onOpenAllFilters={() => setAllFiltersOpen(true)}
            onReset={() =>
              onStateChange(clearListingFilters(state),
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
                    basemap={EXPLORE_BASEMAP}
                    cluster
                    selectedId={selectedId ?? null}
                    onPinSelect={setSelectedId}
                    popupContent={(id) => {
                      const item = response?.items.find(
                        (listing) => listing.id === id,
                      )
                      if (!item) return null
                      return (
                        <GlassMapPopupCard
                          title={item.title}
                          meta={`${locationLabel(item)} · ${formatter.format(item.area)} m²`}
                          price={currency(item.price, item.transaction)}
                          status={{
                            label: item.verified ? 'Doğrulanmış' : 'Doğrulanmamış',
                            tone: item.verified ? 'success' : 'warning',
                          }}
                          href={withBase(`/ilan/${item.id}`)}
                        />
                      )
                    }}
                    onViewportChange={(bounds) => {
                      viewportRef.current = bounds
                    }}
                    seed="enterprise-emlak"
                  />
                  {/* Kadraj kendiliğinden filtre DEĞİLDİR: harita her
                      oynadığında liste değişseydi sonuçlar okunamaz olurdu.
                      Alan yalnız kullanıcı burada istediğinde uygulanır. */}
                  <GlassButton
                    size="sm"
                    className={styles.mapSearchButton}
                    onClick={() => {
                      const bounds = viewportRef.current
                      if (!bounds) return
                      onStateChange(
                        { ...state, mapArea: bounds, page: 1 },
                        { history: 'replace' },
                      )
                    }}
                  >
                    {state.mapArea ? 'Bu alanda yeniden ara' : 'Bu alanda ara'}
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

      <AllFiltersModal
        open={allFiltersOpen}
        onClose={() => setAllFiltersOpen(false)}
        state={state}
        resultCount={total}
        onChange={(next) => onStateChange(next, { history: 'replace' })}
        onReset={() => {
          onStateChange(clearListingFilters(state), { history: 'replace' })
        }}
      />

      <GlassDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Emlak filtreleri"
        side="bottom"
        size="lg"
        footer={
          /* Alt eylem sonucu SAYAR: taslak durumun sonucu her dokunuşta
             yeniden hesaplanır, kullanıcı yaprağı kapatmadan seçiminin ne
             kadar daralttığını görür. */
          <GlassButton
            prominent
            size="lg"
            onClick={() => {
              onStateChange(draftState, { history: 'push' })
              setMobileFiltersOpen(false)
            }}
            style={{ width: '100%' }}
          >
            {formatter.format(draftCount)} ilanı göster
          </GlassButton>
        }
      >
        {/* Kademeli Akış: kataloğun TAMAMI bu tek yüzeyde. İkinci bir ekran,
            "Tüm filtreler" düğmesi ya da akordeon yok — nadir kriterler kendi
            bölümlerinin içinde "+N kriter" ile yerinde açılır. */}
        <FilterStream
          state={draftState}
          resultCount={draftCount}
          onChange={setDraftState}
          onReset={() => setDraftState(clearListingFilters(state))}
        />
      </GlassDrawer>
    </PageContainer>
  )
}
