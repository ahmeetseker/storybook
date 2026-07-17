import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  GlassRoomClassifierTabs,
  type GlassRoomClassifierRoom,
  type GlassRoomClassifierTabsProps,
} from './GlassRoomClassifierTabs'

const rooms: GlassRoomClassifierRoom[] = [
  { id: 'mutfak', label: 'Mutfak', count: 12 },
  { id: 'salon', label: 'Salon', count: 18 },
  { id: 'yatak-odasi', label: 'Yatak Odası', count: 7 },
]

const renderTabs = (props: Partial<GlassRoomClassifierTabsProps> = {}) =>
  render(<GlassRoomClassifierTabs rooms={rooms} {...props} />)

describe('GlassRoomClassifierTabs', () => {
  it('AI sınıflandırması başlığı ve "✦ AI" rozeti her zaman render edilir', () => {
    renderTabs()
    expect(screen.getByText('AI sınıflandırması')).toBeTruthy()
    const badge = screen.getByLabelText('Yapay zekâ üretimi')
    expect(badge.textContent).toBe('✦ AI')
  })

  it('confidence geçerliyse "%N güven" metni eklenir, sonlu değilse hiç render edilmez', () => {
    const { rerender } = renderTabs({ confidence: 87 })
    expect(screen.getByText('%87 güven')).toBeTruthy()
    rerender(<GlassRoomClassifierTabs rooms={rooms} confidence={Number.NaN} />)
    expect(screen.queryByText(/güven/)).toBeNull()
  })

  it('ilk oda varsayılan seçilidir ve roving tabindex uygulanır', () => {
    renderTabs()
    const firstTab = screen.getByRole('tab', { name: /Mutfak/ })
    expect(firstTab.getAttribute('aria-selected')).toBe('true')
    expect(firstTab.getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('tab', { name: /Salon/ }).getAttribute('tabindex')).toBe('-1')
  })

  it('sekmeye tıklama seçimi değiştirir ve onActiveRoomIdChange doğru id ile çağrılır', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ onActiveRoomIdChange })
    fireEvent.click(screen.getByRole('tab', { name: /Salon/ }))
    expect(onActiveRoomIdChange).toHaveBeenCalledWith('salon')
    expect(screen.getByRole('tab', { name: /Salon/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('controlled activeRoomId belirleyicidir — tıklama görünümü değiştirmez, yalnız callback çağrılır', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ activeRoomId: 'mutfak', onActiveRoomIdChange })
    fireEvent.click(screen.getByRole('tab', { name: /Salon/ }))
    expect(onActiveRoomIdChange).toHaveBeenCalledWith('salon')
    expect(screen.getByRole('tab', { name: /Mutfak/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('ok tuşları roving tabindex ile sarmalı gezinir ve seçimi taşır', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ onActiveRoomIdChange })
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('salon')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('yatak-odasi')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    // sondan başa sarar
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('mutfak')
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('yatak-odasi')
  })

  it('Home/End ilk ve son odaya gider', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ defaultActiveRoomId: 'salon', onActiveRoomIdChange })
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'End' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('yatak-odasi')
    fireEvent.keyDown(tablist, { key: 'Home' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('mutfak')
  })

  it('ArrowUp/ArrowDown tablist üzerinde işlenmez — seçim değişmez, preventDefault çağrılmaz', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ onActiveRoomIdChange })
    const tablist = screen.getByRole('tablist')
    const downNotPrevented = fireEvent.keyDown(tablist, { key: 'ArrowDown' })
    const upNotPrevented = fireEvent.keyDown(tablist, { key: 'ArrowUp' })
    expect(onActiveRoomIdChange).not.toHaveBeenCalled()
    expect(downNotPrevented).toBe(true)
    expect(upNotPrevented).toBe(true)
    expect(screen.getByRole('tab', { name: /Mutfak/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('controlled modda ok tuşuyla geçiş isteği reddedilirse odak talep edilen sekmeye sapmaz', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ activeRoomId: 'mutfak', onActiveRoomIdChange })
    const tablist = screen.getByRole('tablist')
    const firstTab = screen.getByRole('tab', { name: /Mutfak/ })
    firstTab.focus()
    expect(document.activeElement).toBe(firstTab)

    fireEvent.keyDown(tablist, { key: 'ArrowRight' })

    expect(onActiveRoomIdChange).toHaveBeenCalledWith('salon')
    // prop değişmediği için seçili sekme Mutfak'ta kalır
    expect(firstTab.getAttribute('aria-selected')).toBe('true')
    // odak, talep edilen (reddedilen) Salon sekmesine sapmaz — Mutfak'ta kalır
    expect(document.activeElement).toBe(firstTab)
  })

  it('sekmeler aria-controls hiç taşımaz — panel bu component tarafından render edilmez', () => {
    renderTabs()
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab.hasAttribute('aria-controls')).toBe(false)
    }
    expect(screen.queryByRole('tabpanel')).toBeNull()
  })

  it('DOM id\'leri oda id\'sinin ham değerinden değil index\'ten türetilir', () => {
    const spacedRooms: GlassRoomClassifierRoom[] = [
      { id: 'çamaşır odası', label: 'Çamaşır Odası', count: 3 },
      { id: 'ebeveyn banyosu', label: 'Ebeveyn Banyosu', count: 5 },
    ]
    render(<GlassRoomClassifierTabs rooms={spacedRooms} />)
    const firstTab = screen.getByRole('tab', { name: /Çamaşır Odası/ })
    expect(firstTab.id).not.toMatch(/\s/)
  })

  it('boş rooms dizisi hiçbir şey render etmez', () => {
    const { container } = renderTabs({ rooms: [] })
    expect(container.firstChild).toBeNull()
  })

  it('loading=true iken AI rozeti görünür kalır, sekmeler render edilmez ve durum duyurulur', () => {
    renderTabs({ loading: true })
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.queryAllByRole('tab').length).toBe(0)
    expect(screen.getByRole('status').textContent).toBe('Fotoğraflar odalara ayrılıyor')
  })

  it('geçersiz/negatif count 0\'a düşürülür ve fotoğraf adedi erişilebilir metinle iletilir', () => {
    render(
      <GlassRoomClassifierTabs
        rooms={[
          { id: 'balkon', label: 'Balkon', count: Number.NaN },
          { id: 'teras', label: 'Teras', count: -5 },
        ]}
      />,
    )
    expect(screen.getByRole('tab', { name: /Balkon 0 fotoğraf/ })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Teras 0 fotoğraf/ })).toBeTruthy()
  })
})
