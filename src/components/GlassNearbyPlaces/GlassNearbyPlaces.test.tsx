import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassNearbyPlaces, type GlassNearbyCategory, type GlassNearbyPlacesProps } from './GlassNearbyPlaces'

const categories: GlassNearbyCategory[] = [
  {
    id: 'ulasim',
    label: 'Ulaşım',
    places: [
      { name: 'Metrobüs Durağı', distance: '350 m', note: '4 dk yürüme' },
      { name: 'Otobüs Durağı', distance: '120 m', note: '2 dk yürüme' },
    ],
  },
  {
    id: 'egitim',
    label: 'Eğitim',
    places: [{ name: 'Atatürk İlkokulu', distance: '450 m' }],
  },
  {
    id: 'saglik',
    label: 'Sağlık',
    places: [],
  },
]

const renderPlaces = (props: Partial<GlassNearbyPlacesProps> = {}) =>
  render(<GlassNearbyPlaces categories={categories} {...props} />)

describe('GlassNearbyPlaces', () => {
  it('chips varyantında her kategori grubu heading DEĞİL, aria-labelledby ile adlandırılmış role="group" olarak render olur', () => {
    renderPlaces({ variant: 'chips' })
    expect(screen.queryAllByRole('heading').length).toBe(0)
    const group = screen.getByRole('group', { name: 'Ulaşım' })
    expect(group).toBeTruthy()
    expect(screen.getByText('Metrobüs Durağı')).toBeTruthy()
    expect(screen.getByText('350 m')).toBeTruthy()
    expect(screen.getByText('4 dk yürüme')).toBeTruthy()
  })

  it('chips varyantında boş kategori bilgilendirici bir satırla gösterilir, hata fırlatmaz', () => {
    renderPlaces({ variant: 'chips' })
    expect(screen.getByRole('group', { name: 'Sağlık' })).toBeTruthy()
    expect(screen.getByText('Bu kategoride yakın nokta eklenmemiş.')).toBeTruthy()
  })

  it('boş categories dizisi hiçbir şey render etmez', () => {
    const { container } = renderPlaces({ categories: [] })
    expect(container.firstChild).toBeNull()
  })

  it('tabs varyantında ilk kategori varsayılan seçilidir ve ilgili panel gösterilir', () => {
    renderPlaces({ variant: 'tabs' })
    const firstTab = screen.getByRole('tab', { name: 'Ulaşım' })
    expect(firstTab.getAttribute('aria-selected')).toBe('true')
    expect(firstTab.getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('tab', { name: 'Eğitim' }).getAttribute('tabindex')).toBe('-1')
    expect(within(screen.getByRole('tabpanel')).getByText('Metrobüs Durağı')).toBeTruthy()
  })

  it('tabs varyantında sekmeye tıklama seçimi değiştirir ve onActiveCategoryIdChange doğru id ile çağrılır', () => {
    const onActiveCategoryIdChange = vi.fn()
    renderPlaces({ variant: 'tabs', onActiveCategoryIdChange })
    fireEvent.click(screen.getByRole('tab', { name: 'Eğitim' }))
    expect(onActiveCategoryIdChange).toHaveBeenCalledWith('egitim')
    expect(screen.getByRole('tab', { name: 'Eğitim' }).getAttribute('aria-selected')).toBe('true')
    expect(within(screen.getByRole('tabpanel')).getByText('Atatürk İlkokulu')).toBeTruthy()
  })

  it('controlled activeCategoryId belirleyicidir — tıklama görünümü değiştirmez, yalnız callback çağrılır', () => {
    const onActiveCategoryIdChange = vi.fn()
    renderPlaces({ variant: 'tabs', activeCategoryId: 'ulasim', onActiveCategoryIdChange })
    fireEvent.click(screen.getByRole('tab', { name: 'Eğitim' }))
    expect(onActiveCategoryIdChange).toHaveBeenCalledWith('egitim')
    expect(screen.getByRole('tab', { name: 'Ulaşım' }).getAttribute('aria-selected')).toBe('true')
    expect(within(screen.getByRole('tabpanel')).getByText('Metrobüs Durağı')).toBeTruthy()
  })

  it('ok tuşları roving tabindex ile sarmalı gezinir ve seçimi taşır', () => {
    const onActiveCategoryIdChange = vi.fn()
    renderPlaces({ variant: 'tabs', onActiveCategoryIdChange })
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(onActiveCategoryIdChange).toHaveBeenLastCalledWith('egitim')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(onActiveCategoryIdChange).toHaveBeenLastCalledWith('saglik')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    // sondan başa sarar
    expect(onActiveCategoryIdChange).toHaveBeenLastCalledWith('ulasim')
  })

  it('Home/End ilk ve son kategoriye gider', () => {
    const onActiveCategoryIdChange = vi.fn()
    renderPlaces({ variant: 'tabs', defaultActiveCategoryId: 'egitim', onActiveCategoryIdChange })
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'End' })
    expect(onActiveCategoryIdChange).toHaveBeenLastCalledWith('saglik')
    fireEvent.keyDown(tablist, { key: 'Home' })
    expect(onActiveCategoryIdChange).toHaveBeenLastCalledWith('ulasim')
  })

  it('tabpanel aktif sekmeye aria-labelledby ile bağlıdır', () => {
    renderPlaces({ variant: 'tabs', defaultActiveCategoryId: 'egitim' })
    const tab = screen.getByRole('tab', { name: 'Eğitim' })
    const panel = screen.getByRole('tabpanel')
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id)
  })

  it('ArrowUp/ArrowDown tablist üzerinde işlenmez — seçim değişmez ve preventDefault çağrılmaz', () => {
    const onActiveCategoryIdChange = vi.fn()
    renderPlaces({ variant: 'tabs', onActiveCategoryIdChange })
    const tablist = screen.getByRole('tablist')
    const downNotPrevented = fireEvent.keyDown(tablist, { key: 'ArrowDown' })
    const upNotPrevented = fireEvent.keyDown(tablist, { key: 'ArrowUp' })
    expect(onActiveCategoryIdChange).not.toHaveBeenCalled()
    // fireEvent, event.preventDefault() çağrılmadıysa true döner (sayfa kaydırması serbest kalır)
    expect(downNotPrevented).toBe(true)
    expect(upNotPrevented).toBe(true)
    expect(screen.getByRole('tab', { name: 'Ulaşım' }).getAttribute('aria-selected')).toBe('true')
  })

  it('controlled modda ok tuşuyla geçiş isteği ebeveyn tarafından reddedilirse odak talep edilen sekmeye sapmaz', () => {
    const onActiveCategoryIdChange = vi.fn()
    // activeCategoryId sabit kalır — ebeveyn state güncellemediği (isteği reddettiği) senaryoyu simüle eder
    renderPlaces({ variant: 'tabs', activeCategoryId: 'ulasim', onActiveCategoryIdChange })
    const tablist = screen.getByRole('tablist')
    const firstTab = screen.getByRole('tab', { name: 'Ulaşım' })
    firstTab.focus()
    expect(document.activeElement).toBe(firstTab)

    fireEvent.keyDown(tablist, { key: 'ArrowRight' })

    expect(onActiveCategoryIdChange).toHaveBeenCalledWith('egitim')
    // prop değişmediği için seçili sekme ve panel Ulaşım'da kalır
    expect(firstTab.getAttribute('aria-selected')).toBe('true')
    expect(within(screen.getByRole('tabpanel')).getByText('Metrobüs Durağı')).toBeTruthy()
    // odak, talep edilen (reddedilen) Eğitim sekmesine sapmaz — Ulaşım'da kalır
    expect(document.activeElement).toBe(firstTab)
  })

  it('boşluklu kategori id\'si DOM id/ARIA IDREF eşleşmesini kırmaz', () => {
    const spacedCategories: GlassNearbyCategory[] = [
      { id: 'toplu tasima', label: 'Toplu Taşıma', places: [{ name: 'Metro', distance: '200 m' }] },
      { id: 'saglik ocagi', label: 'Sağlık Ocağı', places: [{ name: 'Aile Sağlığı Merkezi', distance: '500 m' }] },
    ]
    const onActiveCategoryIdChange = vi.fn()
    render(
      <GlassNearbyPlaces
        categories={spacedCategories}
        variant="tabs"
        onActiveCategoryIdChange={onActiveCategoryIdChange}
      />,
    )
    const firstTab = screen.getByRole('tab', { name: 'Toplu Taşıma' })
    const panel = screen.getByRole('tabpanel')
    // Kategori id'sinde boşluk olsa da üretilen DOM id boşluk içermez
    expect(firstTab.id).not.toMatch(/\s/)
    expect(panel.getAttribute('aria-labelledby')).toBe(firstTab.id)

    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'End' })
    expect(onActiveCategoryIdChange).toHaveBeenCalledWith('saglik ocagi')
  })
})
