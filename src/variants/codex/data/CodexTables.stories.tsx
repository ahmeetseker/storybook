import { useMemo, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexBadge, CodexButton, CodexIconButton, CodexSwitch } from '../controls'
import {
  CodexCompareTable,
  CodexDataTable,
  CodexSpecTable,
  type CodexDataColumn,
  type CodexSortDirection,
} from './CodexData'
import styles from './CodexData.stories.module.css'

const meta = {
  title: 'Codex Enterprise/06 Veri ve Karşılaştırma/01 Tablolar',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface ListingRow {
  id: string
  title: string
  location: string
  owner: string
  price: number
  views: number
  leads: number
  status: 'Yayında' | 'İncelemede' | 'Değişiklik gerekli' | 'Pasif'
  updated: string
}

const rows: ListingRow[] = [
  { id: 'ILN-48291', title: 'Denize yakın imarlı köşe parsel', location: 'İzmir · Urla', owner: 'Ege Parsel Gayrimenkul', price: 4_250_000, views: 1284, leads: 38, status: 'Yayında', updated: '18 Tem, 09:42' },
  { id: 'ILN-48277', title: 'Yol cepheli yatırımlık tarla', location: 'Ankara · Gölbaşı', owner: 'Başkent Arazi', price: 1_850_000, views: 742, leads: 16, status: 'İncelemede', updated: '18 Tem, 08:16' },
  { id: 'ILN-48193', title: 'Deniz manzaralı turizm imarlı arsa', location: 'Antalya · Kaş', owner: 'Likya Emlak Ofisi', price: 6_900_000, views: 2411, leads: 64, status: 'Değişiklik gerekli', updated: '17 Tem, 22:05' },
  { id: 'ILN-48056', title: 'Villa imarlı, altyapısı hazır parsel', location: 'Bursa · Nilüfer', owner: 'Nilüfer Portföy', price: 3_100_000, views: 896, leads: 21, status: 'Yayında', updated: '17 Tem, 17:28' },
  { id: 'ILN-47902', title: 'Bağ evi izinli geniş tarla', location: 'Eskişehir · Tepebaşı', owner: 'Porsuk Gayrimenkul', price: 2_475_000, views: 532, leads: 9, status: 'Pasif', updated: '16 Tem, 14:11' },
]

const toneByStatus = {
  Yayında: 'success',
  İncelemede: 'warning',
  'Değişiklik gerekli': 'danger',
  Pasif: 'neutral',
} as const

const columns: Array<CodexDataColumn<ListingRow>> = [
  {
    key: 'title',
    header: 'İlan',
    sortable: true,
    render: (row) => (
      <span className={styles.entity}>
        <strong>{row.title}</strong>
        <span>{row.id} · {row.location}</span>
      </span>
    ),
  },
  { key: 'owner', header: 'Hesap', render: (row) => row.owner, hideOnCompact: true },
  { key: 'price', header: 'Fiyat', align: 'end', sortable: true, render: (row) => <span className={styles.money}>{row.price.toLocaleString('tr-TR')} TL</span> },
  { key: 'views', header: 'Görüntülenme', align: 'end', sortable: true, render: (row) => row.views.toLocaleString('tr-TR'), hideOnCompact: true },
  { key: 'leads', header: 'Talep', align: 'end', sortable: true, render: (row) => row.leads },
  { key: 'status', header: 'Durum', render: (row) => <CodexBadge tone={toneByStatus[row.status]} dot>{row.status}</CodexBadge> },
  { key: 'updated', header: 'Güncelleme', align: 'end', render: (row) => <span className={styles.muted}>{row.updated}</span>, hideOnCompact: true },
]

function MoreIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
}

function DataPage({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}><h1>{title}</h1><p>{description}</p></header>
      {children}
    </div>
  )
}

function InteractiveTableDemo({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<string[]>(['ILN-48291'])
  const [sortKey, setSortKey] = useState('views')
  const [direction, setDirection] = useState<CodexSortDirection>('descending')
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const left = a[sortKey as keyof ListingRow]
      const right = b[sortKey as keyof ListingRow]
      const result = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'tr')
      return direction === 'ascending' ? result : -result
    })
  }, [direction, sortKey])

  return (
    <DataPage title="İlan operasyon tablosu" description="Seçim, sıralama, toplu işlem, yoğunluk ve mobil kart dönüşümü aynı semantik tablo sözleşmesini korur.">
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <CodexBadge tone={selected.length ? 'accent' : 'neutral'}>{selected.length} seçili</CodexBadge>
          <CodexButton size="sm" variant="secondary" disabled={!selected.length}>Durumu değiştir</CodexButton>
          <CodexButton size="sm" variant="quiet" disabled={!selected.length}>Dışa aktar</CodexButton>
        </div>
        <CodexButton size="sm">Yeni ilan</CodexButton>
      </div>
      <CodexDataTable
        caption="Kurumsal hesap ilanları"
        columns={columns}
        rows={sortedRows}
        density={compact ? 'compact' : 'comfortable'}
        sortKey={sortKey}
        sortDirection={direction}
        onSortChange={(key, nextDirection) => { setSortKey(key); setDirection(nextDirection) }}
        selectedIds={selected}
        onSelectionChange={setSelected}
        getRowLabel={(row) => row.title}
        rowActions={(row) => <CodexIconButton label={`${row.title} işlemleri`} size="sm" icon={<MoreIcon />} />}
      />
    </DataPage>
  )
}

export const InteractiveOperations: Story = { render: () => <InteractiveTableDemo /> }
export const CompactDensity: Story = { render: () => <InteractiveTableDemo compact /> }

export const Loading: Story = {
  render: () => (
    <DataPage title="Tablo yükleniyor" description="Kolon geometrisini koruyan skeleton satırları kullanıcıya neyin geleceğini anlatır.">
      <CodexDataTable caption="Yüklenen ilanlar" columns={columns} rows={[]} loading loadingRows={6} />
    </DataPage>
  ),
}

export const Empty: Story = {
  render: () => (
    <DataPage title="Filtre sonucu boş" description="Boş durum yalnız sonucu bildirmez; filtreyi gevşetmek için doğrudan bir sonraki adımı verir.">
      <CodexDataTable
        caption="Filtrelenen ilanlar"
        columns={columns}
        rows={[]}
        emptyTitle="Bu filtrelerde ilan yok"
        emptyDescription="Moderasyon durumu veya tarih aralığını değiştirerek kapsamı genişletin."
        emptyAction={<CodexButton variant="secondary">Filtreleri temizle</CodexButton>}
      />
    </DataPage>
  ),
}

export const MobileResponsive: Story = {
  render: () => <InteractiveTableDemo compact />,
  globals: { viewport: 'mobile1' },
}

const specGroups = [
  {
    id: 'tapu',
    title: 'Tapu ve parsel',
    items: [
      { label: 'Ada / parsel', value: '118 / 24', description: 'TKGM kaydıyla 17 Temmuz 2026 tarihinde eşleşti.' },
      { label: 'Tapu niteliği', value: 'Arsa' },
      { label: 'Mülkiyet', value: 'Müstakil tapu' },
      { label: 'Yüzölçümü', value: '512 m²' },
    ],
  },
  {
    id: 'imar',
    title: 'İmar koşulları',
    items: [
      { label: 'Kullanım', value: 'Konut alanı' },
      { label: 'Emsal (KAKS)', value: '0,30' },
      { label: 'Yükseklik', value: '6,50 m · 2 kat' },
      { label: 'Çekme mesafesi', value: 'Ön 5 m · Yan 3 m' },
    ],
  },
]

export const SpecificationGroups: Story = {
  render: () => (
    <DataPage title="Gruplanmış teknik özellikler" description="Uzun açıklamalar ve eksik alanlar taranabilir bir tanım listesi içinde kalır.">
      <CodexSpecTable title="Parsel bilgileri" groups={specGroups} />
    </DataPage>
  ),
}

const compareListings = [
  { id: 'urla', title: 'Urla · Köşe parsel', price: '4.250.000 TL', status: <CodexBadge tone="success" dot>Doğrulandı</CodexBadge> },
  { id: 'guzelbahce', title: 'Güzelbahçe · Villa imarlı', price: '4.680.000 TL', status: <CodexBadge tone="success" dot>Doğrulandı</CodexBadge> },
  { id: 'seferihisar', title: 'Seferihisar · Yola cepheli', price: '3.760.000 TL', status: <CodexBadge tone="warning" dot>Belge bekliyor</CodexBadge> },
]

const compareFields = [
  { key: 'area', label: 'Yüzölçümü', values: { urla: '512 m²', guzelbahce: '460 m²', seferihisar: '625 m²' }, highlightBestId: 'seferihisar' },
  { key: 'unit', label: 'm² fiyatı', values: { urla: '8.301 TL', guzelbahce: '10.174 TL', seferihisar: '6.016 TL' }, highlightBestId: 'seferihisar' },
  { key: 'zoning', label: 'İmar', values: { urla: 'Konut · 0,30', guzelbahce: 'Villa · 0,25', seferihisar: 'Konut · 0,30' } },
  { key: 'deed', label: 'Tapu', values: { urla: 'Müstakil', guzelbahce: 'Müstakil', seferihisar: 'Hisseli' }, highlightBestId: 'urla' },
  { key: 'sea', label: 'Denize uzaklık', values: { urla: '900 m', guzelbahce: '1,4 km', seferihisar: '2,8 km' }, highlightBestId: 'urla' },
  { key: 'road', label: 'Yol cephesi', values: { urla: 'İki cephe · 34 m', guzelbahce: 'Tek cephe · 21 m', seferihisar: 'Tek cephe · 42 m' }, highlightBestId: 'urla' },
]

function CompareDemo() {
  const [listings, setListings] = useState(compareListings)
  const [differencesOnly, setDifferencesOnly] = useState(false)
  return (
    <DataPage title="İlan karşılaştırma" description="Sticky başlıklar, güçlü boş değer dili ve yalnız farkları gösterme modu karar vermeyi hızlandırır.">
      <div className={styles.toolbar}>
        <CodexSwitch label="Yalnız farklı değerler" checked={differencesOnly} onCheckedChange={setDifferencesOnly} />
        <CodexBadge>{listings.length}/4 ilan</CodexBadge>
      </div>
      <CodexCompareTable
        title="Ege parsel karşılaştırması"
        listings={listings}
        fields={compareFields}
        differencesOnly={differencesOnly}
        onRemove={(id) => setListings((items) => items.filter((item) => item.id !== id))}
      />
    </DataPage>
  )
}

export const Comparison: Story = { render: () => <CompareDemo /> }
