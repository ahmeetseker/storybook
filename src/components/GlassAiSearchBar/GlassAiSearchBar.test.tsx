import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassAiSearchBar, type GlassAiSearchBarFilter } from './GlassAiSearchBar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const FILTERS: GlassAiSearchBarFilter[] = [
  { id: 'konum', label: 'Konum', value: 'İzmir, Urla' },
  { id: 'oda', label: 'Oda Sayısı', value: '3+1' },
]

const renderBar = (props: Partial<ComponentProps<typeof GlassAiSearchBar>> = {}) => {
  const onSubmit = props.onSubmit ?? vi.fn()
  const utils = render(
    <GlassTierProvider tier="fallback">
      <GlassAiSearchBar onSubmit={onSubmit} {...props} />
    </GlassTierProvider>,
  )
  return { onSubmit, ...utils }
}

describe('GlassAiSearchBar', () => {
  it('role="search" form içinde searchbox render olur, sabit aria-label taşır', () => {
    renderBar()
    expect(screen.getByRole('search')).toBeTruthy()
    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' }) as HTMLInputElement
    expect(input.type).toBe('search')
  })

  it('kontrolsüz modda yazınca değer güncellenir, form submit güncel değerle onSubmit çağırır', () => {
    const { onSubmit } = renderBar({ defaultValue: '' })
    const input = screen.getByRole('searchbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Urla villa' } })
    expect(input.value).toBe('Urla villa')
    fireEvent.submit(screen.getByRole('search'))
    expect(onSubmit).toHaveBeenCalledWith('Urla villa')
  })

  it('controlled modda dışarıdaki value geçerlidir; yazınca onValueChange çağrılır ama iç state değişmez', () => {
    const onValueChange = vi.fn()
    renderBar({ value: 'sabit sorgu', onValueChange })
    const input = screen.getByRole('searchbox') as HTMLInputElement
    expect(input.value).toBe('sabit sorgu')
    fireEvent.change(input, { target: { value: 'yeni yazı' } })
    expect(onValueChange).toHaveBeenCalledWith('yeni yazı')
    // Dışarıdan value güncellenmedikçe input değeri değişmez
    expect(input.value).toBe('sabit sorgu')
  })

  it('öneriler yalnız input odaklıyken görünür ve düz buton olarak render olur (listbox değil)', () => {
    renderBar({ suggestions: ['Urla villa', 'Bornova daire'] })
    expect(screen.queryByRole('button', { name: 'Urla villa' })).toBeNull()
    fireEvent.focus(screen.getByRole('searchbox'))
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByRole('button', { name: 'Urla villa' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Bornova daire' })).toBeTruthy()
  })

  it('öneriye tıklanınca değer o öneri olur ve onSubmit doğrudan çağrılır', () => {
    const onSubmit = vi.fn()
    const onValueChange = vi.fn()
    renderBar({ suggestions: ['Urla villa'], value: '', onValueChange, onSubmit })
    fireEvent.focus(screen.getByRole('searchbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Urla villa' }))
    expect(onValueChange).toHaveBeenCalledWith('Urla villa')
    expect(onSubmit).toHaveBeenCalledWith('Urla villa')
  })

  it('loading iken input disabled olur, önerilere odaklanılamaz ve "Düşünüyor…" duyurulur', () => {
    renderBar({ suggestions: ['Urla villa'], loading: true, defaultValue: 'sorgu' })
    const input = screen.getByRole('searchbox') as HTMLInputElement
    expect(input.disabled).toBe(true)
    expect(screen.getByText('Düşünüyor…')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Urla villa' })).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('aria-live kapsayıcısı loading olmasa da her zaman mount edilir; loading olunca içine metin yazılır', () => {
    const { container, rerender } = render(
      <GlassTierProvider tier="fallback">
        <GlassAiSearchBar onSubmit={vi.fn()} />
      </GlassTierProvider>,
    )
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeTruthy()
    expect(liveRegion?.textContent).toBe('')

    rerender(
      <GlassTierProvider tier="fallback">
        <GlassAiSearchBar onSubmit={vi.fn()} loading />
      </GlassTierProvider>,
    )
    const sameLiveRegion = container.querySelector('[aria-live="polite"]')
    expect(sameLiveRegion).toBe(liveRegion)
    expect(sameLiveRegion?.textContent).toContain('Düşünüyor…')
  })

  it('harici duyuru modunda düşünme metnini korur ama live-region sahipliğini parenta bırakır', () => {
    const { container } = renderBar({
      loading: true,
      announcementMode: 'external',
    })
    const input = screen.getByRole('searchbox')
    const descriptionId = input.getAttribute('aria-describedby')

    expect(container.querySelector('[aria-live="polite"]')).toBeNull()
    expect(screen.getByText('Düşünüyor…')).toBeTruthy()
    expect(descriptionId).toBeTruthy()
    expect(document.getElementById(descriptionId!)?.textContent).toContain(
      'Düşünüyor…',
    )
  })

  it('Escape ile öneri listesi kapanınca event propagation durdurulur (üst katman dock kapanmamalı)', () => {
    const onOuterKeyDown = vi.fn()
    render(
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div onKeyDown={onOuterKeyDown}>
        <GlassTierProvider tier="fallback">
          <GlassAiSearchBar onSubmit={vi.fn()} suggestions={['Urla villa']} />
        </GlassTierProvider>
      </div>,
    )
    const input = screen.getByRole('searchbox')
    fireEvent.focus(input)
    expect(screen.getByRole('button', { name: 'Urla villa' })).toBeTruthy()
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: 'Urla villa' })).toBeNull()
    expect(onOuterKeyDown).not.toHaveBeenCalled()
  })

  it('öneri listesi kapalıyken Escape işlenmez, propagation durdurulmaz', () => {
    const onOuterKeyDown = vi.fn()
    render(
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div onKeyDown={onOuterKeyDown}>
        <GlassTierProvider tier="fallback">
          <GlassAiSearchBar onSubmit={vi.fn()} suggestions={['Urla villa']} />
        </GlassTierProvider>
      </div>,
    )
    const input = screen.getByRole('searchbox')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onOuterKeyDown).toHaveBeenCalledTimes(1)
  })

  it('loading iken filtre chip\'leri soluklaşır ve kaldır butonları devre dışı kalır', () => {
    const onRemoveFilter = vi.fn()
    renderBar({ parsedFilters: FILTERS, onRemoveFilter, loading: true })
    const removeButton = screen.getByRole('button', {
      name: 'Filtreyi kaldır: Konum: İzmir, Urla',
    }) as HTMLButtonElement
    expect(removeButton.disabled).toBe(true)
    fireEvent.click(removeButton)
    expect(onRemoveFilter).not.toHaveBeenCalled()
  })

  it('parsedFilters chip olarak render olur; kaldır butonu accessible name filtreye VE değere özeldir, id ile çağırır', () => {
    const onRemoveFilter = vi.fn()
    renderBar({ parsedFilters: FILTERS, onRemoveFilter })
    expect(screen.getByText('Konum:')).toBeTruthy()
    expect(screen.getByText('İzmir, Urla')).toBeTruthy()
    const removeButton = screen.getByRole('button', { name: 'Filtreyi kaldır: Konum: İzmir, Urla' })
    fireEvent.click(removeButton)
    expect(onRemoveFilter).toHaveBeenCalledWith('konum')
    expect(
      screen.getByRole('button', { name: 'Filtreyi kaldır: Oda Sayısı: 3+1' }),
    ).toBeTruthy()
  })

  it('aynı etiketli farklı değerli filtreler ayırt edilebilir accessible name üretir', () => {
    const sameLabelFilters: GlassAiSearchBarFilter[] = [
      { id: 'oda-1', label: 'Oda Sayısı', value: '2+1' },
      { id: 'oda-2', label: 'Oda Sayısı', value: '3+1' },
    ]
    renderBar({ parsedFilters: sameLabelFilters, onRemoveFilter: vi.fn() })
    expect(screen.getByRole('button', { name: 'Filtreyi kaldır: Oda Sayısı: 2+1' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Filtreyi kaldır: Oda Sayısı: 3+1' })).toBeTruthy()
  })

  it('parsedFilters varken AI rozeti görünür; confidence [0,100] dışıysa/sonlu değilse gizlenir', () => {
    const { rerender } = render(
      <GlassTierProvider tier="fallback">
        <GlassAiSearchBar onSubmit={vi.fn()} parsedFilters={FILTERS} confidence={140} />
      </GlassTierProvider>,
    )
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.getByText('%100 güven')).toBeTruthy()

    rerender(
      <GlassTierProvider tier="fallback">
        <GlassAiSearchBar onSubmit={vi.fn()} parsedFilters={FILTERS} confidence={Number.NaN} />
      </GlassTierProvider>,
    )
    expect(screen.queryByText(/güven/)).toBeNull()
  })

  it('onFeedback verilirse 👍/👎 butonları görünür, basınca aria-pressed değişir ve callback çağrılır', () => {
    const onFeedback = vi.fn()
    renderBar({ parsedFilters: FILTERS, onFeedback })
    const up = screen.getByRole('button', { name: 'Faydalı' })
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(up.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(up)
    expect(onFeedback).toHaveBeenCalledWith('up')
    expect(up.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(down)
    expect(onFeedback).toHaveBeenCalledWith('down')
    expect(down.getAttribute('aria-pressed')).toBe('true')
    expect(up.getAttribute('aria-pressed')).toBe('false')
  })

  it('onFeedback verilmezse geri bildirim butonları render edilmez', () => {
    renderBar({ parsedFilters: FILTERS })
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Faydalı değil' })).toBeNull()
  })

  it('parsedFilters boş/verilmemişse filtre bloğu ve AI rozeti render edilmez', () => {
    renderBar()
    expect(screen.queryByLabelText('Yapay zekâ üretimi')).toBeNull()
  })
})
