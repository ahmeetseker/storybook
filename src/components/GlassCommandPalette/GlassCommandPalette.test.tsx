import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassCommandPalette, type GlassCommandPaletteCommand } from './GlassCommandPalette'

const buildCommands = (overrides?: Partial<Record<string, () => void>>): GlassCommandPaletteCommand[] => [
  {
    id: 'ilan-1',
    label: 'İzmir Karşıyaka 3+1 Daire',
    hint: '⌘1',
    group: 'İlanlar',
    onSelect: overrides?.ilan1 ?? vi.fn(),
  },
  {
    id: 'ilan-2',
    label: 'Ankara Çankaya Villa',
    group: 'İlanlar',
    onSelect: overrides?.ilan2 ?? vi.fn(),
  },
  {
    id: 'sayfa-1',
    label: 'Favorilerim',
    hint: '⌘F',
    group: 'Sayfalar',
    onSelect: overrides?.sayfa1 ?? vi.fn(),
  },
  {
    id: 'genel-1',
    label: 'Yeni İlan Ekle',
    onSelect: overrides?.genel1 ?? vi.fn(),
  },
]

describe('GlassCommandPalette', () => {
  it('open=false iken hiçbir şey render edilmez (dialog yok)', () => {
    render(<GlassCommandPalette open={false} onClose={vi.fn()} commands={buildCommands()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('open=true olunca dialog render edilir, accessible name taşır ve arama input odak alır', () => {
    render(<GlassCommandPalette open={true} onClose={vi.fn()} commands={buildCommands()} />)
    const dialog = screen.getByRole('dialog', { name: 'Komut paleti' })
    expect(dialog).toBeTruthy()
    const input = screen.getByRole('textbox', { name: 'Komut ara' })
    expect(document.activeElement).toBe(input)
  })

  it('grup başlıkları heading DEĞİL — role="group" + aria-labelledby ile bağlı <p> render edilir', () => {
    render(<GlassCommandPalette open={true} onClose={vi.fn()} commands={buildCommands()} />)
    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    const group = screen.getByRole('group', { name: 'İlanlar' })
    expect(group.querySelector('p')?.textContent).toBe('İlanlar')
  })

  it('yazınca label üzerinde Türkçe locale-insensitive filtre uygulanır (İ/i eşleşir)', () => {
    render(<GlassCommandPalette open={true} onClose={vi.fn()} commands={buildCommands()} />)
    const input = screen.getByRole('textbox', { name: 'Komut ara' })
    fireEvent.change(input, { target: { value: 'izmir' } })
    expect(screen.getByText('İzmir Karşıyaka 3+1 Daire')).toBeTruthy()
    expect(screen.queryByText('Ankara Çankaya Villa')).toBeNull()
  })

  it('ArrowDown/ArrowUp aktif öğeyi data-active ile taşır, Enter aktif komutu seçer ve onClose çağırır', () => {
    const ilan1 = vi.fn()
    const ilan2 = vi.fn()
    const onClose = vi.fn()
    render(
      <GlassCommandPalette open={true} onClose={onClose} commands={buildCommands({ ilan1, ilan2 })} />,
    )
    const dialog = screen.getByRole('dialog')
    const first = screen.getByText('İzmir Karşıyaka 3+1 Daire').closest('button')!
    expect(first.dataset.active).toBe('true')

    fireEvent.keyDown(dialog, { key: 'ArrowDown' })
    const second = screen.getByText('Ankara Çankaya Villa').closest('button')!
    expect(second.dataset.active).toBe('true')
    expect(first.dataset.active).toBeUndefined()

    fireEvent.keyDown(dialog, { key: 'Enter' })
    expect(ilan2).toHaveBeenCalledTimes(1)
    expect(ilan1).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('bir komuta tıklamak onSelect + onClose çağırır', () => {
    const sayfa1 = vi.fn()
    const onClose = vi.fn()
    render(<GlassCommandPalette open={true} onClose={onClose} commands={buildCommands({ sayfa1 })} />)
    fireEvent.click(screen.getByText('Favorilerim'))
    expect(sayfa1).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('backdrop tıklaması onClose çağırır; panel içine tıklama kapatmaz', () => {
    const onClose = vi.fn()
    render(<GlassCommandPalette open={true} onClose={onClose} commands={buildCommands()} />)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(onClose).not.toHaveBeenCalled()

    const backdrop = dialog.parentElement!
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Escape dialog içinde kapatır; document genelinde (kapsam dışı) Escape kapatmaz', () => {
    const onClose = vi.fn()
    render(<GlassCommandPalette open={true} onClose={onClose} commands={buildCommands()} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('IME kompozisyonu sürerken Enter/Escape yok sayılır', () => {
    const onClose = vi.fn()
    const ilan1 = vi.fn()
    render(<GlassCommandPalette open={true} onClose={onClose} commands={buildCommands({ ilan1 })} />)
    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Enter', isComposing: true })
    fireEvent.keyDown(dialog, { key: 'Escape', isComposing: true })
    expect(onClose).not.toHaveBeenCalled()
    expect(ilan1).not.toHaveBeenCalled()
  })

  it('sonuç yokken emptyText render edilir ve aria-live durum metni "0 sonuç" bildirir', () => {
    render(
      <GlassCommandPalette
        open={true}
        onClose={vi.fn()}
        commands={buildCommands()}
        emptyText="Eşleşen komut yok."
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Komut ara' })
    fireEvent.change(input, { target: { value: 'zzz-eslesmeyen-sorgu' } })
    expect(screen.getByText('Eşleşen komut yok.')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('0 sonuç bulundu')
  })

  it('her açılışta arama sıfırlanır ve input yeniden odak alır', async () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <GlassCommandPalette open={true} onClose={onClose} commands={buildCommands()} />,
    )
    const input = screen.getByRole('textbox', { name: 'Komut ara' })
    fireEvent.change(input, { target: { value: 'izmir' } })
    expect((input as HTMLInputElement).value).toBe('izmir')

    rerender(<GlassCommandPalette open={false} onClose={onClose} commands={buildCommands()} />)
    // DOM'dan kalkması AnimatePresence exit animasyonuna bağlı — asenkron (bkz. GlassChatDock testi).
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    rerender(<GlassCommandPalette open={true} onClose={onClose} commands={buildCommands()} />)
    const reopenedInput = screen.getByRole('textbox', { name: 'Komut ara' })
    expect((reopenedInput as HTMLInputElement).value).toBe('')
    expect(document.activeElement).toBe(reopenedInput)
  })
})
