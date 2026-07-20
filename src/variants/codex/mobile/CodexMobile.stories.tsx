import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexListingCard, CodexSurface } from '../content'
import {
  CodexButton,
  CodexCheckbox,
  CodexChip,
  CodexField,
  CodexIconButton,
  CodexInput,
  CodexSelect,
} from '../controls'
import { CodexMetricStrip } from '../data'
import { CodexPriceHeader, CodexSavedSearchCard } from '../marketplace'
import { CodexSidebar, type CodexSidebarSection } from '../navigation'
import {
  CodexActionBar,
  CodexAppBar,
  CodexBottomNavigation,
  CodexBottomSheet,
  CodexCompactFilterBar,
  CodexCompactShell,
  type CodexBottomNavigationItem,
} from './CodexMobile'
import styles from './CodexMobile.stories.module.css'

const meta = {
  title: 'Codex Enterprise/13 Mobil Sistem/01 Kabuk ve Navigasyon',
  component: CodexCompactShell,
  args: { children: null },
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { defaultTheme: 'paper', fullCanvas: true },
  },
} satisfies Meta<typeof CodexCompactShell>

export default meta
type Story = StoryObj<typeof meta>

type IconName = 'home' | 'search' | 'heart' | 'message' | 'account' | 'back' | 'share' | 'more' | 'menu'

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10M9 20v-6h6v6" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    heart: <path d="M20.8 4.8a5.4 5.4 0 0 0-7.7 0L12 5.9l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z" />,
    message: <path d="M4 5.5h16v11H9l-5 4v-15Z" />,
    account: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    back: <><path d="m14.5 5-7 7 7 7" /><path d="M8 12h11" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  }

  return <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>
}

function destinations(): CodexBottomNavigationItem[] {
  return [
    { id: 'home', label: 'Ana Sayfa', icon: <Icon name="home" />, href: '#ana-sayfa' },
    { id: 'search', label: 'Ara', icon: <Icon name="search" />, href: '#arama' },
    { id: 'saved', label: 'Favoriler', icon: <Icon name="heart" />, href: '#favoriler' },
    { id: 'messages', label: 'Mesajlar', icon: <Icon name="message" />, href: '#mesajlar', badge: 2, badgeLabel: '2 okunmamış mesaj' },
    { id: 'account', label: 'Hesabım', icon: <Icon name="account" />, href: '#hesabim' },
  ]
}

const listingFixtures = [
  { title: 'Denize yakın, imarlı köşe parsel', price: '4.250.000 TL', location: 'İzmir, Urla', meta: '512 m² · 8.301 TL/m²', badge: 'EİDS doğrulandı', badgeTone: 'success' as const, mediaTone: 'forest' as const },
  { title: 'Merkeze yakın yatırımlık arsa', price: '2.980.000 TL', location: 'İzmir, Güzelbahçe', meta: '420 m² · 7.095 TL/m²', badge: 'Fiyat düştü', badgeTone: 'accent' as const, mediaTone: 'coast' as const },
  { title: 'Yol cepheli müstakil tapulu tarla', price: '1.850.000 TL', location: 'İzmir, Seferihisar', meta: '1.240 m² · 1.492 TL/m²', badge: 'Yeni', badgeTone: 'info' as const, mediaTone: 'earth' as const },
]

function SearchExperience() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const [destination, setDestination] = useState('search')
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={styles.canvas}>
      <CodexCompactShell
        contentPadding="none"
        mainLabel="Satılık arsa sonuçları"
        appBar={(
          <CodexAppBar
            title="Satılık arsa"
            subtitle="İzmir · 124 ilan"
            leading={<CodexIconButton label="Geri" size="md" icon={<Icon name="back" />} />}
            actions={<CodexIconButton label="Diğer işlemler" size="md" icon={<Icon name="more" />} />}
          />
        )}
        bottomNavigation={(
          <CodexBottomNavigation
            items={destinations()}
            value={destination}
            onValueChange={setDestination}
          />
        )}
      >
        <CodexCompactFilterBar
          filterButtonRef={filterButtonRef}
          activeCount={3}
          results={<><strong>124</strong> eşleşme</>}
          onFilterClick={() => setFilterOpen(true)}
        >
          <CodexChip selected>Urla</CodexChip>
          <CodexChip selected>0–5 Mn TL</CodexChip>
          <CodexChip selected>İmarlı</CodexChip>
          <CodexChip>500 m²+</CodexChip>
        </CodexCompactFilterBar>

        <section className={styles.results} aria-labelledby="mobile-results-title">
          <header className={styles.resultHeading}>
            <h2 id="mobile-results-title">Öne çıkanlar</h2>
            <p>Önerilen sıralama</p>
          </header>
          <div className={styles.listingStack}>
            {listingFixtures.map((listing, index) => (
              <CodexListingCard
                key={listing.title}
                {...listing}
                variant="row"
                favorite={index === 0 ? favorite : false}
                onFavoriteChange={index === 0 ? setFavorite : undefined}
                onOpen={() => undefined}
              />
            ))}
          </div>
        </section>

        <CodexBottomSheet
          title="Filtreler"
          description="124 ilanı fiyat, konum ve tapu durumuna göre daraltın."
          open={filterOpen}
          onOpenChange={setFilterOpen}
          detents={['medium', 'large']}
          defaultDetent="medium"
          returnFocusRef={filterButtonRef}
          footer={(
            <div className={styles.sheetActions}>
              <CodexButton variant="quiet" onClick={() => undefined}>Temizle</CodexButton>
              <CodexButton onClick={() => setFilterOpen(false)}>124 ilanı göster</CodexButton>
            </div>
          )}
        >
          <form className={styles.sheetForm} onSubmit={(event) => event.preventDefault()}>
            <CodexField label="İlçe">
              <CodexSelect defaultValue="urla">
                <option value="urla">Urla</option>
                <option value="guzelbahce">Güzelbahçe</option>
                <option value="seferihisar">Seferihisar</option>
              </CodexSelect>
            </CodexField>
            <div className={styles.fieldPair}>
              <CodexField label="En düşük fiyat"><CodexInput inputMode="numeric" placeholder="0 TL" /></CodexField>
              <CodexField label="En yüksek fiyat"><CodexInput inputMode="numeric" placeholder="5.000.000 TL" /></CodexField>
            </div>
            <fieldset className={styles.checkList}>
              <legend>Tapu ve doğrulama</legend>
              <CodexCheckbox label="Müstakil tapu" defaultChecked />
              <CodexCheckbox label="EİDS doğrulandı" defaultChecked />
              <CodexCheckbox label="Krediye uygun" />
            </fieldset>
          </form>
        </CodexBottomSheet>
      </CodexCompactShell>
    </div>
  )
}

function DetailExperience({ landscape = false }: { landscape?: boolean }) {
  const [favorite, setFavorite] = useState(false)
  const detail = (
    <>
      <div className={styles.detailMedia} role="img" aria-label="Urla’da denize yakın arsanın temsili görünümü">
        <span className={styles.mediaLabel}>1 / 18 · Tapu konumu doğrulandı</span>
      </div>
      <div className={styles.detailContent}>
        <CodexPriceHeader
          title="Denize yakın, imarlı köşe parsel"
          location="İzmir · Urla · İskele"
          referenceId="12498531"
          price="4.250.000 TL"
          unitPrice="8.301 TL/m²"
          favorite={favorite}
          onFavoriteChange={setFavorite}
          headingAs="h2"
        />
        <dl className={styles.factGrid}>
          <div><dt>Alan</dt><dd>512 m²</dd></div>
          <div><dt>İmar</dt><dd>Konut</dd></div>
          <div><dt>Tapu</dt><dd>Müstakil</dd></div>
        </dl>
        <CodexSurface as="section" treatment="tonal" className={styles.detailSection}>
          <h2>İlan özeti</h2>
          <p>Denize 900 metre mesafede, iki yola cepheli parsel. İmar ve tapu kayıtları 18 Temmuz 2026 tarihinde doğrulandı.</p>
        </CodexSurface>
      </div>
    </>
  )

  return (
    <div className={styles.canvas}>
      <CodexCompactShell
        contentPadding="none"
        mainLabel="İlan ayrıntıları"
        appBar={<CodexAppBar title="İlan detayı" leading={<CodexIconButton label="Aramaya dön" icon={<Icon name="back" />} />} actions={<CodexIconButton label="İlanı paylaş" icon={<Icon name="share" />} />} />}
        actionBar={(
          <CodexActionBar
            summary={<><strong>4.250.000 TL</strong><span>Doğrulanmış satıcı</span></>}
            secondaryAction={<CodexButton variant="secondary">Ara</CodexButton>}
            primaryAction={<CodexButton>Mesaj gönder</CodexButton>}
          />
        )}
      >
        {landscape ? <div className={styles.landscapeContent}>{detail}</div> : detail}
      </CodexCompactShell>
    </div>
  )
}

const accountSections: CodexSidebarSection[] = [
  { id: 'account', label: 'Hesap', items: [
    { id: 'overview', label: 'Genel bakış', icon: <Icon name="home" /> },
    { id: 'saved', label: 'Kaydettiklerim', icon: <Icon name="heart" />, badge: 12 },
    { id: 'messages', label: 'Mesajlar', icon: <Icon name="message" />, badge: 2 },
  ] },
  { id: 'settings', label: 'Ayarlar', items: [
    { id: 'profile', label: 'Profil ve güvenlik', icon: <Icon name="account" /> },
  ] },
]

function AccountExperience() {
  const [destination, setDestination] = useState('account')
  return (
    <div className={styles.canvas}>
      <CodexCompactShell
        mainLabel="Hesap özeti"
        appBar={(
          <CodexAppBar
            title="Hesabım"
            subtitle="Bireysel hesap"
            leading={<CodexSidebar sections={accountSections} defaultActiveId="overview" brand="PP" mobileOpenLabel="Hesap menüsünü aç" />}
            actions={<CodexIconButton label="Hesap işlemleri" icon={<Icon name="more" />} />}
          />
        )}
        bottomNavigation={<CodexBottomNavigation items={destinations()} value={destination} onValueChange={setDestination} />}
      >
        <div className={styles.accountContent}>
          <CodexSurface treatment="tonal" className={styles.profileSummary}>
            <span className={styles.profileMark} aria-hidden>AY</span>
            <div><h2>Ahmet Yılmaz</h2><p>Kimlik ve telefon doğrulandı</p></div>
          </CodexSurface>
          <CodexMetricStrip items={[
            { id: 'saved', label: 'Kaydedilen', value: '12' },
            { id: 'alerts', label: 'Aktif alarm', value: '3' },
            { id: 'messages', label: 'Yeni mesaj', value: '2' },
          ]} />
          <section className={styles.accountList} aria-labelledby="saved-search-heading">
            <header className={styles.sectionHeading}><h2 id="saved-search-heading">Arama alarmları</h2><p>Son 24 saat</p></header>
            <CodexSavedSearchCard
              title="Urla · satılık arsa"
              query="0–5 Mn TL · 400 m²+"
              filters={['İmarlı', 'Müstakil tapu']}
              resultCount={124}
              newCount={6}
              onOpen={() => undefined}
              onEnabledChange={() => undefined}
            />
          </section>
        </div>
      </CodexCompactShell>
    </div>
  )
}

export const AramaVeFiltre: Story = {
  render: () => <SearchExperience />,
  globals: { viewport: 'mobile390' },
}

export const KucukTelefon320: Story = {
  render: () => <SearchExperience />,
  globals: { viewport: 'mobile1' },
}

export const Telefon375: Story = {
  render: () => <SearchExperience />,
  globals: { viewport: 'mobile375' },
}

export const IlanDetayActionBar: Story = {
  render: () => <DetailExperience />,
  globals: { viewport: 'mobile390' },
}

export const HesapVeOffCanvasMenu: Story = {
  render: () => <AccountExperience />,
  globals: { viewport: 'mobile430' },
}

export const YatayTelefon: Story = {
  render: () => <DetailExperience landscape />,
  globals: { viewport: 'mobileLandscape' },
}

export const TabletRail768: Story = {
  render: () => <SearchExperience />,
  globals: { viewport: 'tablet768' },
}
