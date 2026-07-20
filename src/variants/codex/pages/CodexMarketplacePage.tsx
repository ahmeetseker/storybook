import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import {
  CodexButton,
  CodexCheckbox,
  CodexChip,
  CodexField,
  CodexInput,
  CodexSelect,
  CodexSwitch,
  CodexTabs,
} from '../controls'
import {
  CodexFilterPanel,
  CodexHeader,
  CodexListingCard,
  CodexNotice,
  CodexStat,
  CodexSurface,
} from '../content'
import styles from './CodexMarketplacePage.module.css'

export type CodexMarketplaceVariant = 'workspace' | 'editorial' | 'intelligence'

export interface CodexMarketplacePageProps {
  variant?: CodexMarketplaceVariant
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.7-3.7" />
  </svg>
)

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3V6Z" />
    <path d="M8 3v15M16 6v15" />
  </svg>
)

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
  </svg>
)

const LISTINGS = [
  {
    id: 'urla',
    title: 'Denize yakın, imarlı köşe parsel',
    price: '4.250.000 TL',
    location: 'İzmir, Urla',
    meta: '512 m² · 8.301 TL/m² · Müstakil tapu',
    badge: 'EİDS doğrulandı',
    mediaTone: 'forest' as const,
  },
  {
    id: 'golbasi',
    title: 'Yol cepheli yatırımlık tarla',
    price: '1.850.000 TL',
    location: 'Ankara, Gölbaşı',
    meta: '1.240 m² · 1.492 TL/m² · Hisseli tapu',
    badge: 'Yeni',
    mediaTone: 'earth' as const,
  },
  {
    id: 'kas',
    title: 'Deniz manzaralı turizm imarlı arsa',
    price: '6.900.000 TL',
    location: 'Antalya, Kaş',
    meta: '780 m² · 8.846 TL/m² · Müstakil tapu',
    badge: 'Fiyat güncellendi',
    mediaTone: 'coast' as const,
  },
  {
    id: 'nilufer',
    title: 'Villa imarlı, altyapısı hazır parsel',
    price: '3.100.000 TL',
    location: 'Bursa, Nilüfer',
    meta: '420 m² · 7.381 TL/m² · Site içinde',
    badge: 'Doğrulama bekliyor',
    mediaTone: 'city' as const,
  },
]

const noop = () => undefined

function PageHeader({ compact = false }: { compact?: boolean }) {
  return (
    <CodexHeader
      compact={compact}
      links={[
        { label: 'Ara', href: '/ara', active: true },
        { label: 'Harita', href: '/harita' },
        { label: 'Değerleme', href: '/degerleme' },
        { label: 'Rehber', href: '/rehber' },
      ]}
      actions={(
        <>
          <CodexButton variant="quiet" size="sm">Giriş</CodexButton>
          <CodexButton variant="primary" size="sm">İlan ver</CodexButton>
        </>
      )}
    />
  )
}

function SearchBox({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState('İzmir’de 5 milyon altı imarlı arsa')
  const [busy, setBusy] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    window.setTimeout(() => setBusy(false), 650)
  }

  return (
    <form role="search" className={compact ? styles.searchCompact : styles.search} onSubmit={submit}>
      <CodexInput
        aria-label="İlan ara"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        prefix={<SearchIcon />}
        placeholder="Konum, bütçe veya arsa özelliği yazın"
      />
      <CodexButton type="submit" variant="primary" size={compact ? 'md' : 'lg'} loading={busy}>
        {busy ? 'Aranıyor' : 'Ara'}
      </CodexButton>
    </form>
  )
}

function ActiveFilters() {
  const [active, setActive] = useState(['İzmir', '≤ 5 Mn TL', 'Konut imarlı'])
  const suggestedFilter = 'Müstakil tapu'
  const removeFilter = (filter: string) => {
    setActive((items) => items.filter((item) => item !== filter))
  }

  return (
    <div className={styles.activeFilters} aria-label="Aktif filtreler">
      {active.map((filter) => (
        <CodexChip
          key={filter}
          selected
          onSelectedChange={(next) => {
            if (!next) removeFilter(filter)
          }}
          onRemove={() => removeFilter(filter)}
        >
          {filter}
        </CodexChip>
      ))}
      {!active.includes(suggestedFilter) ? (
        <CodexButton
          variant="quiet"
          size="sm"
          onClick={() => setActive((items) => [...items, suggestedFilter])}
        >
          + {suggestedFilter} ekle
        </CodexButton>
      ) : null}
    </div>
  )
}

function Filters({ resultCount = '128 doğrulanmış ilan' }: { resultCount?: string }) {
  return (
    <CodexFilterPanel
      title="Aramayı daralt"
      resultCount={resultCount}
      onReset={noop}
      footer={<CodexButton variant="primary" fullWidth>128 ilanı göster</CodexButton>}
    >
      <CodexField label="İmar durumu">
        <CodexSelect defaultValue="konut" aria-label="İmar durumu">
          <option value="konut">Konut imarlı</option>
          <option value="villa">Villa imarlı</option>
          <option value="turizm">Turizm imarlı</option>
          <option value="tarla">Tarla</option>
        </CodexSelect>
      </CodexField>
      <div className={styles.priceFields}>
        <CodexField label="En düşük">
          <CodexInput inputMode="numeric" placeholder="1.000.000" suffix="TL" />
        </CodexField>
        <CodexField label="En yüksek">
          <CodexInput inputMode="numeric" defaultValue="5.000.000" suffix="TL" />
        </CodexField>
      </div>
      <fieldset className={styles.checkboxGroup}>
        <legend>İlan niteliği</legend>
        <CodexCheckbox label="EİDS doğrulanmış" defaultChecked />
        <CodexCheckbox label="Müstakil tapu" />
        <CodexCheckbox label="Yol cepheli" />
      </fieldset>
      <CodexSwitch label="Fiyat düşünce bildir" defaultChecked />
    </CodexFilterPanel>
  )
}

function ListingGrid({ limit = 4 }: { limit?: number }) {
  const [favorites, setFavorites] = useState<string[]>(['urla'])
  return (
    <div className={styles.listingGrid}>
      {LISTINGS.slice(0, limit).map((listing) => (
        <CodexListingCard
          key={listing.id}
          {...listing}
          badgeTone={listing.id === 'nilufer' ? 'warning' : listing.id === 'golbasi' ? 'accent' : 'success'}
          favorite={favorites.includes(listing.id)}
          onFavoriteChange={(next) => setFavorites((items) => next ? [...items, listing.id] : items.filter((id) => id !== listing.id))}
        />
      ))}
    </div>
  )
}

function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.sectionHeading}>
      <div>{children}</div>
      {action ? <div className={styles.sectionAction}>{action}</div> : null}
    </div>
  )
}

function WorkspacePage() {
  const [view, setView] = useState('grid')
  return (
    <div className={styles.page} data-page-variant="workspace">
      <PageHeader />
      <main id="main-content" className={styles.main}>
        <section className={styles.workspaceIntro} aria-labelledby="workspace-title">
          <div>
            <p className={styles.contextLine}>Doğrulanmış arazi pazarı · 17 Temmuz 2026</p>
            <h1 id="workspace-title">Aradığınız parseli veriye bakarak seçin.</h1>
            <p>İmar, tapu ve bölge fiyatlarını tek akışta karşılaştırın. Sonuçlar EİDS durumuna göre açıkça işaretlenir.</p>
          </div>
          <SearchBox />
          <ActiveFilters />
        </section>

        <CodexNotice
          tone="info"
          title="Aramanızdan 4 ölçüt çıkardık"
          action={<CodexButton variant="quiet" size="sm">Ölçütleri incele</CodexButton>}
        >
          Konum, bütçe, imar durumu ve minimum alan sonuçlara uygulandı.
        </CodexNotice>

        <div className={styles.workspaceLayout}>
          <Filters />
          <section aria-labelledby="results-title" className={styles.results}>
            <PageTitle action={(
              <div className={styles.viewSwitch} role="group" aria-label="Sonuç görünümü">
                {[
                  { id: 'grid', label: 'Kart' },
                  { id: 'list', label: 'Liste' },
                  { id: 'map', label: 'Harita' },
                ].map((item) => (
                  <CodexButton
                    key={item.id}
                    variant="quiet"
                    size="sm"
                    aria-pressed={view === item.id}
                    onClick={() => setView(item.id)}
                  >
                    {item.label}
                  </CodexButton>
                ))}
              </div>
            )}>
              <p>İzmir · Konut imarlı</p>
              <h2 id="results-title">128 sonuç</h2>
            </PageTitle>
            {view === 'map' ? <MapPanel /> : view === 'list' ? <ListingRows /> : <ListingGrid />}
          </section>
        </div>
      </main>
    </div>
  )
}

function EditorialPage() {
  const [favorite, setFavorite] = useState(false)
  return (
    <div className={styles.page} data-page-variant="editorial">
      <PageHeader />
      <main id="main-content" className={styles.editorialMain}>
        <section className={styles.editorialHero} aria-labelledby="editorial-title">
          <div className={styles.editorialLead}>
            <p className={styles.contextLine}>Ege seçkisi · 24 doğrulanmış parsel</p>
            <h1 id="editorial-title">Toprağı yalnız metrekaresiyle ölçmeyin.</h1>
            <p>Yola, kıyıya ve merkeze uzaklığı; imar koşulları ve bölgedeki gerçek fiyat hareketiyle birlikte görün.</p>
            <SearchBox compact />
          </div>
          <div className={styles.editorialStats} aria-label="Bölge özeti">
            <CodexStat label="Ortanca m² fiyatı" value="7.840 TL" change="%4,2" direction="up" />
            <CodexStat label="Yeni ilan" value="18" change="7 günde" />
            <CodexStat label="Satış süresi" value="46 gün" change="−8 gün" direction="up" />
          </div>
        </section>

        <ActiveFilters />

        <section className={styles.editorialFeature} aria-labelledby="editorial-feature-title">
          <CodexListingCard
            {...LISTINGS[0]}
            title="Urla’nın gelişim aksında, okunaklı bir köşe parsel"
            meta="512 m² · İki yola cepheli · Denize 900 m · Müstakil tapu"
            badge="Editör seçimi"
            badgeTone="accent"
            variant="featured"
            favorite={favorite}
            onFavoriteChange={setFavorite}
          />
          <CodexSurface as="aside" treatment="tonal" radius="card" padding="lg" className={styles.editorialInsight}>
            <p className={styles.contextLine}>Bölge notu</p>
            <h2 id="editorial-feature-title">Fiyat artışı yavaşladı; imarlı parsel arzı hâlâ sınırlı.</h2>
            <p>Son 90 günde yeni ilan fiyatı %4,2 yükseldi. Aynı dönemde satışa dönüş süresi sekiz gün kısaldı.</p>
            <CodexButton variant="secondary">Urla raporunu aç</CodexButton>
          </CodexSurface>
        </section>

        <section aria-labelledby="editorial-more-title" className={styles.editorialMore}>
          <PageTitle action={<CodexButton variant="quiet">Tüm seçkiyi gör</CodexButton>}>
            <p>Benzer ölçütler</p>
            <h2 id="editorial-more-title">Sakin kıyı, net imar</h2>
          </PageTitle>
          <ListingGrid limit={3} />
        </section>
      </main>
    </div>
  )
}

function ListingRows() {
  const [favorites, setFavorites] = useState<string[]>([])
  return (
    <div className={styles.listingRows}>
      {LISTINGS.map((listing) => (
        <CodexListingCard
          key={listing.id}
          {...listing}
          badgeTone={listing.id === 'nilufer' ? 'warning' : 'success'}
          variant="row"
          favorite={favorites.includes(listing.id)}
          onFavoriteChange={(next) => setFavorites((items) => next ? [...items, listing.id] : items.filter((id) => id !== listing.id))}
        />
      ))}
    </div>
  )
}

function MapPanel() {
  const pins = [
    { id: 'urla', location: 'Urla', price: '4,25 milyon TL', shortPrice: '4,25 Mn', x: '28%', y: '43%' },
    { id: 'guzelbahce', location: 'Güzelbahçe', price: '3,10 milyon TL', shortPrice: '3,10 Mn', x: '58%', y: '28%' },
    { id: 'seferihisar', location: 'Seferihisar', price: '2,85 milyon TL', shortPrice: '2,85 Mn', x: '69%', y: '67%' },
  ]
  const [selectedPin, setSelectedPin] = useState(pins[0].id)
  const selectedLocation = pins.find((pin) => pin.id === selectedPin)?.location

  return (
    <div className={styles.map} role="region" aria-label="İzmir ve çevresindeki temsili ilan haritası">
      <span className={styles.mapWater} />
      <span className={styles.mapRoadA} />
      <span className={styles.mapRoadB} />
      <span className={styles.mapDistrict}>Urla</span>
      <span className={styles.mapDistrict}>Güzelbahçe</span>
      {pins.map((pin) => (
        <button
          key={pin.id}
          type="button"
          aria-label={`${pin.location}, ${pin.price} fiyatındaki ilanları göster`}
          aria-pressed={selectedPin === pin.id}
          onClick={() => setSelectedPin(pin.id)}
          style={{ '--pin-x': pin.x, '--pin-y': pin.y } as CSSProperties}
        >
          {pin.shortPrice}
        </button>
      ))}
      <span className={styles.mapLegend} aria-live="polite">
        <MapIcon /> {selectedLocation} seçili
      </span>
    </div>
  )
}

function IntelligencePage() {
  const [view, setView] = useState('signals')
  return (
    <div className={styles.page} data-page-variant="intelligence">
      <PageHeader compact />
      <main id="main-content" className={styles.intelligenceMain}>
        <section className={styles.intelligenceTop} aria-labelledby="intelligence-title">
          <div>
            <p className={styles.contextLine}>Piyasa monitörü · Ege bölgesi</p>
            <h1 id="intelligence-title">Sinyaller</h1>
          </div>
          <SearchBox compact />
          <CodexButton variant="secondary"><BellIcon /> Alarm kur</CodexButton>
        </section>

        <CodexTabs
          className={styles.pageTabs}
          ariaLabel="Piyasa görünümü"
          value={view}
          onValueChange={setView}
          items={[
            {
              id: 'signals',
              label: 'Sinyaller',
              panel: (
                <div className={styles.intelligenceGrid}>
                  <section className={styles.intelligenceListings} aria-labelledby="intel-listings-title">
                    <PageTitle>
                      <p>Ölçütlerinize uyan</p>
                      <h2 id="intel-listings-title">24 ilan</h2>
                    </PageTitle>
                    <ListingRows />
                  </section>

                  <section className={styles.intelligenceMap} aria-labelledby="intel-map-title">
                    <PageTitle action={<CodexButton variant="quiet" size="sm">Tam ekran</CodexButton>}>
                      <p>Yoğunluk</p>
                      <h2 id="intel-map-title">Fiyat haritası</h2>
                    </PageTitle>
                    <MapPanel />
                  </section>

                  <aside className={styles.intelligenceAside} aria-label="Piyasa özeti">
                    <PageTitle>
                      <p>Son 90 gün</p>
                      <h2>Piyasa özeti</h2>
                    </PageTitle>
                    <div>
                      <CodexStat label="Ortanca fiyat" value="4,18 Mn TL" change="%3,8" direction="up" />
                      <CodexStat label="m² fiyatı" value="7.840 TL" change="%4,2" direction="up" />
                      <CodexStat label="Yeni arz" value="61 ilan" change="%1,4" direction="down" />
                      <CodexStat label="Satış süresi" value="46 gün" change="−8 gün" direction="up" />
                    </div>
                    <CodexNotice tone="warning" title="Veri yoğunluğu sınırlı">
                      Çeşmealtı için son 30 günde yalnız 6 doğrulanmış emsal var.
                    </CodexNotice>
                  </aside>
                </div>
              ),
            },
            {
              id: 'listings',
              label: 'İlanlar',
              panel: <section className={styles.intelligenceSingle}><ListingRows /></section>,
            },
            {
              id: 'comparables',
              label: 'Emsaller',
              panel: (
                <CodexSurface treatment="tonal" className={styles.intelligenceSingle}>
                  <PageTitle><p>Doğrulanmış satışlar</p><h2>Urla emsal özeti</h2></PageTitle>
                  <CodexStat label="Ortanca m² fiyatı" value="7.840 TL" change="%4,2" direction="up" />
                  <CodexStat label="Alt–üst aralık" value="6.920–9.180 TL" change="18 kayıt" />
                </CodexSurface>
              ),
            },
          ]}
        />
      </main>
    </div>
  )
}

export function CodexMarketplacePage({ variant = 'workspace' }: CodexMarketplacePageProps) {
  if (variant === 'editorial') return <EditorialPage />
  if (variant === 'intelligence') return <IntelligencePage />
  return <WorkspacePage />
}
