import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  CodexCompareTable,
  CodexDataTable,
  CodexList,
  CodexMiniChart,
  CodexScoreMeter,
  CodexSpecTable,
  CodexTimeline,
  type CodexDataColumn,
} from './index'

interface Row {
  id: string
  name: string
  price: number
}

const rows: Row[] = [
  { id: 'a', name: 'Urla parseli', price: 4_250_000 },
  { id: 'b', name: 'Kaş arsası', price: 6_900_000 },
]

const columns: Array<CodexDataColumn<Row>> = [
  { key: 'name', header: 'İlan', sortable: true, render: (row) => row.name },
  { key: 'price', header: 'Fiyat', align: 'end', render: (row) => `${row.price} TL` },
]

describe('Codex data components', () => {
  it('DataTable caption, kolon, satır ve sort sözleşmesini korur', () => {
    const onSortChange = vi.fn()
    render(
      <CodexDataTable
        caption="İlan operasyonu"
        columns={columns}
        rows={rows}
        sortKey="name"
        sortDirection="ascending"
        onSortChange={onSortChange}
      />,
    )

    const table = screen.getByRole('table', { name: 'İlan operasyonu' })
    expect(within(table).getAllByRole('row')).toHaveLength(3)
    expect(within(table).getByRole('columnheader', { name: /İlan/ }).getAttribute('aria-sort')).toBe('ascending')
    fireEvent.click(within(table).getByRole('button', { name: /İlan/ }))
    expect(onSortChange).toHaveBeenCalledWith('name', 'descending')
  })

  it('DataTable satır seçimi, mixed select-all ve accessible label üretir', () => {
    const onSelectionChange = vi.fn()
    const { rerender } = render(
      <CodexDataTable
        caption="Seçilebilir ilanlar"
        columns={columns}
        rows={rows}
        selectedIds={['a']}
        onSelectionChange={onSelectionChange}
        getRowLabel={(row) => row.name}
      />,
    )

    const selectAll = screen.getByRole('checkbox', { name: 'Tüm satırları seç' })
    expect(selectAll.getAttribute('aria-checked')).toBe('mixed')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Kaş arsası satırını seç' }))
    expect(onSelectionChange).toHaveBeenCalledWith(['a', 'b'])

    rerender(
      <CodexDataTable
        caption="Seçilebilir ilanlar"
        columns={columns}
        rows={rows}
        selectedIds={['a', 'b']}
        onSelectionChange={onSelectionChange}
      />,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Tüm satırları seç' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([])
  })

  it('loading ve empty tablo durumlarını ayrı canlı bölgelerle verir', () => {
    const { rerender } = render(<CodexDataTable caption="Yüklenen" columns={columns} rows={[]} loading loadingRows={3} />)
    expect(screen.getByRole('status').textContent).toContain('Tablo yükleniyor')
    expect(screen.getByRole('table', { name: 'Yüklenen' }).querySelectorAll('tr')).toHaveLength(4)

    rerender(
      <CodexDataTable
        caption="Boş"
        columns={columns}
        rows={[]}
        emptyTitle="İlan bulunamadı"
        emptyDescription="Filtreleri değiştirin."
      />,
    )
    expect(screen.getByRole('heading', { name: 'İlan bulunamadı' })).toBeTruthy()
    expect(screen.getByText('Filtreleri değiştirin.')).toBeTruthy()
  })

  it('SpecTable gruplanmış tanım listelerini semantik başlıklarla üretir', () => {
    render(
      <CodexSpecTable
        title="Parsel bilgisi"
        groups={[{ id: 'deed', title: 'Tapu', items: [{ label: 'Mülkiyet', value: 'Müstakil', description: 'TKGM doğruladı' }] }]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Parsel bilgisi', level: 2 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Tapu', level: 3 })).toBeTruthy()
    expect(screen.getByText('Mülkiyet').tagName).toBe('DT')
    expect(screen.getByText('Müstakil').closest('dd')).not.toBeNull()
  })

  it('CompareTable yalnız farklı scalar alanları gösterir ve remove aksiyonunu adlandırır', () => {
    const onRemove = vi.fn()
    render(
      <CodexCompareTable
        title="İki ilan"
        listings={[{ id: 'a', title: 'Urla', price: '4 Mn TL' }, { id: 'b', title: 'Kaş', price: '6 Mn TL' }]}
        fields={[
          { key: 'same', label: 'Tapu', values: { a: 'Müstakil', b: 'Müstakil' } },
          { key: 'different', label: 'Alan', values: { a: '500 m²', b: '700 m²' }, highlightBestId: 'b' },
        ]}
        differencesOnly
        onRemove={onRemove}
      />,
    )

    expect(screen.queryByRole('rowheader', { name: 'Tapu' })).toBeNull()
    expect(screen.getByRole('rowheader', { name: 'Alan' })).toBeTruthy()
    expect(screen.getByText('700 m²').textContent).toContain('en iyi değer')
    fireEvent.click(screen.getByRole('button', { name: 'Urla ilanını karşılaştırmadan çıkar' }))
    expect(onRemove).toHaveBeenCalledWith('a')
  })

  it('Timeline datetime, ton ve boş durum ilişkisini korur', () => {
    const { rerender } = render(
      <CodexTimeline
        title="Hareketler"
        events={[{ id: '1', title: 'Yayına alındı', time: 'Bugün', datetime: '2026-07-18', tone: 'success' }]}
      />,
    )
    expect(screen.getByRole('list').querySelector('[data-tone="success"]')).not.toBeNull()
    expect(screen.getByText('Bugün').getAttribute('datetime')).toBe('2026-07-18')

    rerender(<CodexTimeline title="Hareketler" events={[]} />)
    expect(screen.getByRole('heading', { name: 'Henüz hareket yok' })).toBeTruthy()
  })

  it('List selected/disabled durumlarını ve aksiyonları korur', () => {
    render(
      <CodexList items={[
        { id: '1', title: 'Yeni mesaj', selected: true, action: <button type="button">Aç</button> },
        { id: '2', title: 'Arşivlendi', disabled: true },
      ]} />,
    )
    expect(screen.getByText('Yeni mesaj').closest('li')?.dataset.selected).toBe('true')
    expect(screen.getByText('Arşivlendi').closest('li')?.dataset.disabled).toBe('true')
    expect(screen.getByRole('button', { name: 'Aç' })).toBeTruthy()
  })

  it('ScoreMeter sınırlar dışındaki değeri clamp eder ve açıklamaya bağlar', () => {
    render(<CodexScoreMeter label="Güven" value={125} max={100} description="Kaynak eşleşmesi" />)
    const meter = screen.getByRole('meter', { name: 'Güven' })
    expect(meter.getAttribute('aria-valuenow')).toBe('100')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-describedby')).toBe(screen.getByText('Kaynak eşleşmesi').id)
  })

  it('MiniChart görsel grafik yanında erişilebilir veri tablosu üretir', () => {
    render(
      <CodexMiniChart
        title="Fiyat hareketi"
        description="Son iki ay"
        points={[{ label: 'Haziran', value: 7800 }, { label: 'Temmuz', value: 7840 }]}
      />,
    )
    expect(screen.getByRole('img', { name: 'Fiyat hareketi: Son iki ay' })).toBeTruthy()
    const dataTable = screen.getByRole('table', { name: 'Fiyat hareketi veri noktaları' })
    expect(within(dataTable).getByRole('rowheader', { name: 'Temmuz' })).toBeTruthy()
  })
})
