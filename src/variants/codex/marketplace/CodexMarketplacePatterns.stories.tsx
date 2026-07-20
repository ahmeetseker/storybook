import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexButton } from '../controls'
import {
  CodexListingManagementCard,
  CodexMarketplaceEmpty,
  CodexSavedSearchCard,
  type CodexListingState,
} from './CodexMarketplace'
import styles from './CodexMarketplace.stories.module.css'

const meta = {
  title: 'Codex Enterprise/09 Pazar Yeri Kalıpları/01 Hesap ve İlan Yönetimi',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <div className={styles.page}><header className={styles.header}><h1>{title}</h1><p>{description}</p></header>{children}</div>
}

function SavedSearchDemo() {
  const [states, setStates] = useState<Record<string, boolean>>({ urla: true, ankara: false, coast: true })
  const searches = [
    { id: 'urla', title: 'Urla yatırım parselleri', query: 'Urla’da 5 milyon TL altı konut imarlı arsa', filters: ['≤ 5 Mn TL', 'Konut imarlı', 'Müstakil tapu'], resultCount: 128, newCount: 6, frequency: 'Anında' },
    { id: 'ankara', title: 'Ankara geniş tarla', query: 'Gölbaşı ve çevresinde 2.000 m² üzeri tarla', filters: ['≥ 2.000 m²', 'Yola cepheli'], resultCount: 74, newCount: 0, frequency: 'Haftalık' },
    { id: 'coast', title: 'Ege kıyı seçkisi', query: 'Denize 2 km içinde imarlı parsel', filters: ['İzmir', 'Muğla', 'Denize yakın'], resultCount: 216, newCount: 18, frequency: 'Günlük' },
  ]
  return <div className={styles.grid}>{searches.map((search) => <CodexSavedSearchCard key={search.id} {...search} enabled={states[search.id]} onEnabledChange={(enabled) => setStates((current) => ({ ...current, [search.id]: enabled }))} onOpen={() => undefined} onDelete={() => undefined} />)}</div>
}

export const SavedSearches: Story = {
  render: () => <Page title="Kayıtlı aramalar ve alarmlar" description="Her kayıt kendi doğal dil sorgusunu, aktif filtrelerini, yeni sonuç sayısını ve bildirim sıklığını taşır."><SavedSearchDemo /></Page>,
}

const listingStates: Array<{ state: CodexListingState; title: string; issue?: string; actions: ReactNode }> = [
  { state: 'live', title: 'Denize yakın imarlı köşe parsel', actions: <><CodexButton size="sm" variant="secondary">Düzenle</CodexButton><CodexButton size="sm">Öne çıkar</CodexButton></> },
  { state: 'review', title: 'Yol cepheli yatırımlık tarla', actions: <CodexButton size="sm" variant="quiet">İnceleme durumunu aç</CodexButton> },
  { state: 'changes', title: 'Deniz manzaralı turizm imarlı arsa', issue: 'İmar belgesinin güncel ve okunaklı nüshasını yükleyin.', actions: <CodexButton size="sm">Belgeyi güncelle</CodexButton> },
  { state: 'draft', title: 'Bağ evi izinli geniş tarla', actions: <><CodexButton size="sm">Taslağa devam et</CodexButton><CodexButton size="sm" variant="quiet">Sil</CodexButton></> },
  { state: 'paused', title: 'Villa imarlı altyapısı hazır parsel', actions: <CodexButton size="sm" variant="secondary">Yeniden yayınla</CodexButton> },
  { state: 'expired', title: 'Köy merkezine yakın zeytinlik', actions: <CodexButton size="sm">Süreyi uzat</CodexButton> },
]

export const ListingLifecycle: Story = {
  render: () => (
    <Page title="İlan yönetimi durum matrisi" description="Taslak, inceleme, yayın, değişiklik, duraklatma ve süre sonu aynı kartın ayrı iş akışı durumlarıdır.">
      <div className={styles.stack}>{listingStates.map((item, index) => <CodexListingManagementCard key={item.state} {...item} referenceId={`ILN-${48291 - index * 17}`} location={index % 2 ? 'Ankara · Gölbaşı' : 'İzmir · Urla'} price={`${(4.25 - index * 0.31).toFixed(2).replace('.', ',')} milyon TL`} views={index % 2 ? '742' : '1.284'} messages={String(38 - index * 5)} expiresAt={item.state === 'live' ? '27 gün' : undefined} />)}</div>
    </Page>
  ),
}

export const EmptyAccountStates: Story = {
  render: () => (
    <Page title="Hesap boş durumları" description="Boş ekranlar yalnız eksikliği söylemez; ilk değere giden tek ve açık eylemi verir.">
      <div className={styles.gridWide}>
        <CodexMarketplaceEmpty kind="saved" action={<CodexButton>İlan ara</CodexButton>} />
        <CodexMarketplaceEmpty kind="alerts" action={<CodexButton>Arama oluştur</CodexButton>} />
        <CodexMarketplaceEmpty kind="listings" action={<CodexButton>İlan ver</CodexButton>} />
        <CodexMarketplaceEmpty kind="messages" action={<CodexButton variant="secondary">Favorilere git</CodexButton>} />
      </div>
    </Page>
  ),
}

export const MobileManagement: Story = {
  render: () => <Page title="Mobil ilan yönetimi" description="Durum ve ana işlem dar ekranda ilk bakışta kalır."><CodexListingManagementCard {...listingStates[2]} referenceId="ILN-48257" location="Antalya · Kaş" price="6,90 milyon TL" views="2.411" messages="64" /></Page>,
  globals: { viewport: 'mobile1' },
}
