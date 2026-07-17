import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassTable, type GlassTableColumn, type GlassTableRow, type GlassTableSortDirection } from './GlassTable'

interface Fatura extends GlassTableRow {
  id: string
  tarih: string
  aciklama: string
  tutar: string
  durum: string
}

// Sıralama için gerçek (ISO) tarih ve sayısal tutar — görünen değer TR formatlı string
const faturaSiralamaKaynagi: { id: string; tarihIso: string; tutarSayi: number; aciklama: string; durum: string }[] = [
  { id: 'F-2026-0412', tarihIso: '2026-07-12', tutarSayi: 349, aciklama: 'Öne Çıkan dopingi — İzmir Urla parseli (2 hafta)', durum: 'Ödendi' },
  { id: 'F-2026-0298', tarihIso: '2026-06-08', tutarSayi: 749, aciklama: 'Vitrin dopingi — Antalya Kaş arsası (2 hafta)', durum: 'Ödendi' },
  { id: 'F-2026-0271', tarihIso: '2026-06-01', tutarSayi: 1249, aciklama: 'Vitrin dopingi — Muğla Bodrum tarla (4 hafta)', durum: 'Ödendi' },
  { id: 'F-2026-0141', tarihIso: '2026-05-03', tutarSayi: 129, aciklama: 'Ek ilan hakkı (1 ilan)', durum: 'Ödendi' },
  { id: 'F-2026-0119', tarihIso: '2026-04-22', tutarSayi: 349, aciklama: 'Öne Çıkan dopingi — Sakarya Adapazarı arsası (2 hafta)', durum: 'İade' },
  { id: 'F-2026-0087', tarihIso: '2026-03-30', tutarSayi: 249, aciklama: 'Vitrin dopingi — Balıkesir Ayvalık parseli (1 hafta)', durum: 'Beklemede' },
  { id: 'F-2026-0052', tarihIso: '2026-03-11', tutarSayi: 129, aciklama: 'Ek ilan hakkı (1 ilan)', durum: 'Ödendi' },
  { id: 'F-2026-0019', tarihIso: '2026-02-14', tutarSayi: 749, aciklama: 'Vitrin dopingi — İzmir Çeşme arsası (2 hafta)', durum: 'Ödendi' },
]

function tarihGoster(iso: string): string {
  const [y, m, d] = iso.split('-')
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  return `${Number(d)} ${aylar[Number(m) - 1]} ${y}`
}

function tutarGoster(n: number): string {
  return `${n.toLocaleString('tr-TR')} TL`
}

const faturalar: Fatura[] = faturaSiralamaKaynagi.map((f) => ({
  id: f.id,
  tarih: tarihGoster(f.tarihIso),
  aciklama: f.aciklama,
  tutar: tutarGoster(f.tutarSayi),
  durum: f.durum,
}))

const columns: GlassTableColumn[] = [
  { key: 'id', label: 'Fatura No', sortable: true },
  { key: 'tarih', label: 'Tarih', sortable: true },
  { key: 'aciklama', label: 'Açıklama' },
  { key: 'tutar', label: 'Tutar', sortable: true, align: 'end', width: '120px' },
  { key: 'durum', label: 'Durum', align: 'end', width: '110px' },
]

/** Gerçek sıralama: component sıralamaz, örnekler kaynağı burada sıralar. */
function sortFaturalar(key: string, direction: GlassTableSortDirection): Fatura[] {
  const kaynak = [...faturaSiralamaKaynagi]
  kaynak.sort((a, b) => {
    let cmp = 0
    if (key === 'id') cmp = a.id.localeCompare(b.id)
    else if (key === 'tarih') cmp = a.tarihIso.localeCompare(b.tarihIso)
    else if (key === 'tutar') cmp = a.tutarSayi - b.tutarSayi
    return direction === 'asc' ? cmp : -cmp
  })
  return kaynak.map((f) => ({
    id: f.id,
    tarih: tarihGoster(f.tarihIso),
    aciklama: f.aciklama,
    tutar: tutarGoster(f.tutarSayi),
    durum: f.durum,
  }))
}

const meta = {
  title: 'Components/GlassTable',
  component: GlassTable,
  tags: ['autodocs'],
  args: {
    columns,
    rows: faturalar,
    'aria-label': 'Faturalarım',
    onSortChange: fn(),
    onSelectedIdsChange: fn(),
  },
  argTypes: {
    selectable: { control: 'boolean' },
    defaultSortKey: { control: false },
    defaultSortDirection: { control: false },
  },
} satisfies Meta<typeof GlassTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 720, margin: '48px auto' }}>
      <GlassTable {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: { defaultSortKey: 'tarih', defaultSortDirection: 'desc' },
  render: Default.render,
}

/** `Sortable` story gövdesi — isimli component, oxlint'in anonim fonksiyonlarda hook kuralı ihlali saymasını önler. */
function SortableDemo() {
  const [sortKey, setSortKey] = useState('tarih')
  const [sortDirection, setSortDirection] = useState<GlassTableSortDirection>('desc')
  const rows = useMemo(() => sortFaturalar(sortKey, sortDirection), [sortKey, sortDirection])
  return (
    <div style={{ maxWidth: 720, margin: '48px auto' }}>
      <GlassTable
        columns={columns}
        rows={rows}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, direction) => {
          setSortKey(key)
          setSortDirection(direction)
        }}
        aria-label="Faturalarım — sıralanabilir"
      />
    </div>
  )
}

/**
 * Gerçek sıralama akışı: `onSortChange` çağıranın işidir. Bu örnek `sortKey`/
 * `sortDirection`'ı controlled tutar, callback'te veriyi kendi sıralar ve
 * yeni `rows`'u geri verir — component yalnız ok yönünü ve `aria-sort`'u gösterir.
 */
export const Sortable: Story = {
  render: () => <SortableDemo />,
}

/** `Selectable` story gövdesi — bkz. `SortableDemo` notu. */
function SelectableDemo() {
  const [selectedIds, setSelectedIds] = useState<string[]>([faturalar[0].id])
  return (
    <div style={{ maxWidth: 760, margin: '48px auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--lg-label-secondary)' }}>
        {selectedIds.length} fatura seçili
      </p>
      <GlassTable
        columns={columns}
        rows={faturalar}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        aria-label="Faturalarım — seçilebilir"
      />
    </div>
  )
}

/**
 * Çoklu seçim: başlıktaki checkbox tüm satırları seçer/temizler, kısmi seçimde
 * indeterminate olur. Seçili satır id'leri dışarıda tutulur (controlled).
 */
export const Selectable: Story = {
  render: () => <SelectableDemo />,
}

/** Boş durum: özel `emptyState` verilmezse varsayılan metin görünür. */
export const Empty: Story = {
  args: { rows: [] },
  render: Default.render,
}

/** Özel boş durum içeriği. */
export const EmptyOzel: Story = {
  args: {
    rows: [],
    emptyState: (
      <span>
        Henüz faturanız yok. <a href="#doping">Doping satın alın</a>, faturanız burada listelensin.
      </span>
    ),
  },
  render: Default.render,
}

/**
 * Uzun içerik: uzun açıklama metni + uzun fatura no; sütun genişlikleri sabit
 * kalır, açıklama sütunu satır içinde kırılır.
 */
export const UzunIcerik: Story = {
  args: {
    rows: [
      ...faturalar,
      {
        id: 'F-2026-0001-TASINMAZ-DOPING-UZATMA',
        tarih: '2 Ocak 2026',
        aciklama:
          'Vitrin dopingi + Öne Çıkan dopingi birleşik paket uzatması — Muğla Milas Selimiye mevkii tarla ilanı, 6 haftalık kampanya, KDV dahil toplam tutar',
        tutar: '2.849 TL',
        durum: 'Ödendi',
      },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassTable {...args} />
    </div>
  ),
}

/** Dar ekran + dokunmatik: 700px altında satırlar kart görünümüne düşer, her hücre kendi etiketiyle listelenir. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { selectable: true },
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '24px auto' }}>
      <GlassTable {...args} />
    </div>
  ),
}

/**
 * Erişilebilirlik: `scope="col"` başlıklar, sıralanabilir başlıklar gerçek
 * `<button>` + `aria-sort` (`ascending`/`descending`/`none`), seçim
 * checkbox'ları GlassCheckbox'ın gerçek `<input type="checkbox">`'ından gelen
 * erişilebilir isimlerle (görsel olarak gizli metin). Klavye: `Tab` başlık
 * butonları ve satır checkbox'ları arasında doğal DOM sırasıyla gezer,
 * `Enter`/`Space` her ikisini de tetikler.
 */
export const Erisilebilirlik: Story = {
  args: { selectable: true, defaultSortKey: 'tarih', defaultSortDirection: 'desc' },
  parameters: {
    docs: {
      description: {
        story:
          'Sıralanabilir başlıklar `<button>` içerir ve aktif sütunda `aria-sort` günceller; sıralanmayan sütunlarda `aria-sort` hiç yazılmaz. Tüm-seç checkbox\'ı kısmi seçimde `indeterminate`; erişilebilir isim `label` prop\'undaki (görsel olarak gizli) metinden gelir.',
      },
    },
  },
  render: Default.render,
}
