import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassTable, type GlassTableColumn, type GlassTableRow } from './GlassTable'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const columns: GlassTableColumn[] = [
  { key: 'id', label: 'Fatura No', sortable: true },
  { key: 'tarih', label: 'Tarih', sortable: true },
  { key: 'tutar', label: 'Tutar', align: 'end' },
]

const rows: GlassTableRow[] = [
  { id: 'F-1', tarih: '12 Temmuz 2026', tutar: '349 TL' },
  { id: 'F-2', tarih: '8 Haziran 2026', tutar: '749 TL' },
]

function renderTable(ui: ReactElement) {
  return render(<GlassTierProvider tier="fallback">{ui}</GlassTierProvider>)
}

describe('GlassTable', () => {
  it('sütun başlıklarını scope="col" ile ve satırları render eder', () => {
    renderTable(<GlassTable columns={columns} rows={rows} />)
    expect(screen.getByRole('columnheader', { name: 'Tutar' })).toBeDefined()
    expect(screen.getByText('12 Temmuz 2026')).toBeDefined()
    expect(screen.getByText('749 TL')).toBeDefined()
  })

  it('boş rows verildiğinde varsayılan boş durum metnini gösterir', () => {
    renderTable(<GlassTable columns={columns} rows={[]} />)
    expect(screen.getByText('Kayıt bulunamadı.')).toBeDefined()
  })

  it('özel emptyState verildiğinde onu gösterir', () => {
    renderTable(<GlassTable columns={columns} rows={[]} emptyState="Hiç fatura yok" />)
    expect(screen.getByText('Hiç fatura yok')).toBeDefined()
    expect(screen.queryByText('Kayıt bulunamadı.')).toBeNull()
  })

  it('sıralanabilir başlık gerçek bir buton içerir ve tıklanınca onSortChange(key, direction) çağırır — kendisi satırları sıralamaz', () => {
    const onSortChange = vi.fn()
    renderTable(<GlassTable columns={columns} rows={rows} onSortChange={onSortChange} />)
    const button = screen.getByRole('button', { name: /Tarih/ })
    fireEvent.click(button)
    expect(onSortChange).toHaveBeenCalledWith('tarih', 'asc')
    // Sıralanmayan (görüntüde) satır sırası aynı kalır — component satırı taşımaz
    const cells = screen.getAllByText(/Temmuz|Haziran/)
    expect(cells[0].textContent).toBe('12 Temmuz 2026')
  })

  it('aynı sütuna ikinci tıklama yönü tersine çevirir ve aria-sort günceller', () => {
    renderTable(<GlassTable columns={columns} rows={rows} defaultSortKey="tarih" defaultSortDirection="asc" />)
    const columnHeader = screen.getByRole('columnheader', { name: /Tarih/ })
    expect(columnHeader.getAttribute('aria-sort')).toBe('ascending')
    fireEvent.click(screen.getByRole('button', { name: /Tarih/ }))
    expect(columnHeader.getAttribute('aria-sort')).toBe('descending')
  })

  it('sıralanamayan sütunda aria-sort yazılmaz', () => {
    renderTable(<GlassTable columns={columns} rows={rows} />)
    const tutarHeader = screen.getByRole('columnheader', { name: 'Tutar' })
    expect(tutarHeader.hasAttribute('aria-sort')).toBe(false)
  })

  it('selectable: tüm-seç checkbox tüm satırları seçer, onSelectedIdsChange tam id listesiyle çağrılır', () => {
    const onSelectedIdsChange = vi.fn()
    renderTable(<GlassTable columns={columns} rows={rows} selectable onSelectedIdsChange={onSelectedIdsChange} />)
    const selectAll = screen.getByRole('checkbox', { name: 'Tümünü seç' })
    fireEvent.click(selectAll)
    expect(onSelectedIdsChange).toHaveBeenCalledWith(['F-1', 'F-2'])
  })

  it('selectable: kısmi seçimde tüm-seç checkbox indeterminate olur', () => {
    renderTable(<GlassTable columns={columns} rows={rows} selectable selectedIds={['F-1']} onSelectedIdsChange={vi.fn()} />)
    const selectAll = screen.getByRole('checkbox', { name: 'Tümünü seç' }) as HTMLInputElement
    expect(selectAll.indeterminate).toBe(true)
    expect(selectAll.checked).toBe(false)
  })

  it('selectable: tek satır checkbox seçili id listesine ekler', () => {
    const onSelectedIdsChange = vi.fn()
    renderTable(<GlassTable columns={columns} rows={rows} selectable selectedIds={[]} onSelectedIdsChange={onSelectedIdsChange} />)
    const rowCheckbox = screen.getByRole('checkbox', { name: 'F-1 satırını seç' })
    fireEvent.click(rowCheckbox)
    expect(onSelectedIdsChange).toHaveBeenCalledWith(['F-1'])
  })

  it('karışık kullanım — sortKey controlled ama sortDirection verilmemişse yön daima "asc" varsayılır ve tutarlı onSortChange üretir (eski kolon + yeni yön karışması regresyonu)', () => {
    const onSortChange = vi.fn()
    renderTable(<GlassTable columns={columns} rows={rows} sortKey="tarih" onSortChange={onSortChange} />)
    const tarihHeader = screen.getByRole('columnheader', { name: /Tarih/ })
    // sortDirection verilmediği için controlled çift, yönü 'asc' varsayar
    expect(tarihHeader.getAttribute('aria-sort')).toBe('ascending')
    fireEvent.click(screen.getByRole('button', { name: /Tarih/ }))
    expect(onSortChange).toHaveBeenLastCalledWith('tarih', 'desc')
    // Ebeveyn sortDirection'ı hâlâ göndermiyor — sortKey tek başına controlled
    // kaldığı için yön daima prop'un varsayılanına ('asc') göre yeniden
    // hesaplanır; eski (senkronize edilmemiş) iç state'e sızma OLMAZ.
    fireEvent.click(screen.getByRole('button', { name: /Tarih/ }))
    expect(onSortChange).toHaveBeenLastCalledWith('tarih', 'desc')
    expect(tarihHeader.getAttribute('aria-sort')).toBe('ascending')
  })

  it('karışık kullanım — sortKey uncontrolled iken tek başına verilen sortDirection prop\'u yok sayılır (iç state kullanılır)', () => {
    const onSortChange = vi.fn()
    renderTable(<GlassTable columns={columns} rows={rows} sortDirection="desc" onSortChange={onSortChange} />)
    // sortKey verilmediği için component tümüyle uncontrolled kalır; tek
    // başına sortDirection="desc" prop'u yok sayılır, ilk tıklama 'asc' ile başlar.
    fireEvent.click(screen.getByRole('button', { name: /Tarih/ }))
    expect(onSortChange).toHaveBeenCalledWith('tarih', 'asc')
    const tarihHeader = screen.getByRole('columnheader', { name: /Tarih/ })
    expect(tarihHeader.getAttribute('aria-sort')).toBe('ascending')
  })

  it('her satır bir <tr> ve her hücre data-label taşır (mobil kart görünümü için)', () => {
    renderTable(<GlassTable columns={columns} rows={rows} />)
    const table = screen.getByRole('table')
    const firstRow = within(table).getAllByRole('row')[1]
    const cell = within(firstRow).getByText('349 TL')
    expect(cell.getAttribute('data-label')).toBe('Tutar')
  })
})
