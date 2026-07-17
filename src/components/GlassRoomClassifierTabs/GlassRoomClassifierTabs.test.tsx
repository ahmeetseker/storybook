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
    const firstTab = screen.getByRole('radio', { name: /Mutfak/ })
    expect(firstTab.getAttribute('aria-checked')).toBe('true')
    expect(firstTab.getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('radio', { name: /Salon/ }).getAttribute('tabindex')).toBe('-1')
  })

  it('sekmeye tıklama seçimi değiştirir ve onActiveRoomIdChange doğru id ile çağrılır', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ onActiveRoomIdChange })
    fireEvent.click(screen.getByRole('radio', { name: /Salon/ }))
    expect(onActiveRoomIdChange).toHaveBeenCalledWith('salon')
    expect(screen.getByRole('radio', { name: /Salon/ }).getAttribute('aria-checked')).toBe('true')
  })

  it('controlled activeRoomId belirleyicidir — tıklama görünümü değiştirmez, yalnız callback çağrılır', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ activeRoomId: 'mutfak', onActiveRoomIdChange })
    fireEvent.click(screen.getByRole('radio', { name: /Salon/ }))
    expect(onActiveRoomIdChange).toHaveBeenCalledWith('salon')
    expect(screen.getByRole('radio', { name: /Mutfak/ }).getAttribute('aria-checked')).toBe('true')
  })

  it('ok tuşları roving tabindex ile sarmalı gezinir ve seçimi taşır', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ onActiveRoomIdChange })
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('salon')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('yatak-odasi')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    // sondan başa sarar
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('mutfak')
    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('yatak-odasi')
  })

  it('Home/End ilk ve son odaya gider', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ defaultActiveRoomId: 'salon', onActiveRoomIdChange })
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'End' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('yatak-odasi')
    fireEvent.keyDown(group, { key: 'Home' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('mutfak')
  })

  it('ArrowUp/ArrowDown radiogroup üzerinde işlenmez — seçim değişmez, preventDefault çağrılmaz', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ onActiveRoomIdChange })
    const group = screen.getByRole('radiogroup')
    const downNotPrevented = fireEvent.keyDown(group, { key: 'ArrowDown' })
    const upNotPrevented = fireEvent.keyDown(group, { key: 'ArrowUp' })
    expect(onActiveRoomIdChange).not.toHaveBeenCalled()
    expect(downNotPrevented).toBe(true)
    expect(upNotPrevented).toBe(true)
    expect(screen.getByRole('radio', { name: /Mutfak/ }).getAttribute('aria-checked')).toBe('true')
  })

  it('controlled modda ok tuşuyla geçiş isteği reddedilirse odak talep edilen sekmeye sapmaz', () => {
    const onActiveRoomIdChange = vi.fn()
    renderTabs({ activeRoomId: 'mutfak', onActiveRoomIdChange })
    const group = screen.getByRole('radiogroup')
    const firstTab = screen.getByRole('radio', { name: /Mutfak/ })
    firstTab.focus()
    expect(document.activeElement).toBe(firstTab)

    fireEvent.keyDown(group, { key: 'ArrowRight' })

    expect(onActiveRoomIdChange).toHaveBeenCalledWith('salon')
    // prop değişmediği için seçili sekme Mutfak'ta kalır
    expect(firstTab.getAttribute('aria-checked')).toBe('true')
    // odak, talep edilen (reddedilen) Salon sekmesine sapmaz — Mutfak'ta kalır
    expect(document.activeElement).toBe(firstTab)
  })

  it('reddedilen controlled seçim sonrası ilgisiz bir gerçek güncelleme geldiğinde odak yanlış sekmeye sıçramaz', () => {
    const onActiveRoomIdChange = vi.fn()
    const { rerender } = render(
      <GlassRoomClassifierTabs rooms={rooms} activeRoomId="mutfak" onActiveRoomIdChange={onActiveRoomIdChange} />,
    )
    const firstTab = screen.getByRole('radio', { name: /Mutfak/ })
    firstTab.focus()
    const group = screen.getByRole('radiogroup')

    // ArrowRight "salon" ister ama ebeveyn prop'u güncellemez (reddedilir) —
    // bu talep boşa askıda kalan bir focusPendingRef bırakabilirdi.
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('salon')

    // Kullanıcı odağı başka bir yere taşır (örn. sayfadaki farklı bir kontrol)
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)

    // Ebeveyn, klavye akışıyla TAMAMEN ilgisiz bir sebeple activeRoomId'yi
    // günceller (reddedilmiş "salon" isteğiyle alakasız bir odaya geçiş).
    rerender(
      <GlassRoomClassifierTabs
        rooms={rooms}
        activeRoomId="yatak-odasi"
        onActiveRoomIdChange={onActiveRoomIdChange}
      />,
    )

    // Eski/reddedilmiş isteğin bıraktığı askıda bayrak yüzünden odak
    // yanlışlıkla yeni aktif sekmeye sıçramamalı.
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it('zaten seçili sekmede Home/End sonrası ilgisiz bir controlled güncelleme odağı çalmaz', () => {
    const onActiveRoomIdChange = vi.fn()
    const { rerender } = render(
      <GlassRoomClassifierTabs rooms={rooms} activeRoomId="mutfak" onActiveRoomIdChange={onActiveRoomIdChange} />,
    )
    const group = screen.getByRole('radiogroup')

    // İlk sekme zaten aktif — Home yine ilk sekmeyi ister (değişiklik üretmez)
    fireEvent.keyDown(group, { key: 'Home' })
    expect(onActiveRoomIdChange).toHaveBeenLastCalledWith('mutfak')

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)

    // Klavye akışıyla ilgisiz bir sebeple ebeveyn activeRoomId'yi günceller
    rerender(
      <GlassRoomClassifierTabs
        rooms={rooms}
        activeRoomId="yatak-odasi"
        onActiveRoomIdChange={onActiveRoomIdChange}
      />,
    )

    // Home no-op'unun bıraktığı bir bayrak yüzünden odak çalınmamalı
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it('radiogroup semantiği kullanılır, aria-controls hiç taşınmaz ve tablist/tab/tabpanel hiç render edilmez', () => {
    renderTabs()
    expect(screen.getByRole('radiogroup')).toBeTruthy()
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio.hasAttribute('aria-controls')).toBe(false)
    }
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.queryByRole('tablist')).toBeNull()
    expect(screen.queryByRole('tabpanel')).toBeNull()
  })

  it('DOM id\'leri oda id\'sinin ham değerinden değil index\'ten türetilir', () => {
    const spacedRooms: GlassRoomClassifierRoom[] = [
      { id: 'çamaşır odası', label: 'Çamaşır Odası', count: 3 },
      { id: 'ebeveyn banyosu', label: 'Ebeveyn Banyosu', count: 5 },
    ]
    render(<GlassRoomClassifierTabs rooms={spacedRooms} />)
    const firstTab = screen.getByRole('radio', { name: /Çamaşır Odası/ })
    expect(firstTab.id).not.toMatch(/\s/)
  })

  it('boş rooms dizisi hiçbir şey render etmez', () => {
    const { container } = renderTabs({ rooms: [] })
    expect(container.firstChild).toBeNull()
  })

  it('loading=true iken AI rozeti görünür kalır, sekmeler render edilmez ve durum duyurulur', () => {
    renderTabs({ loading: true })
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.queryAllByRole('radio').length).toBe(0)
    expect(screen.getByRole('status').textContent).toBe('Fotoğraflar odalara ayrılıyor')
  })

  it('loading tamamlanınca canlı bölge mount kalır ve hazır durumunu farklı bir metinle duyurur', () => {
    const { rerender } = render(<GlassRoomClassifierTabs rooms={rooms} loading />)
    expect(screen.getByRole('status').textContent).toBe('Fotoğraflar odalara ayrılıyor')
    rerender(<GlassRoomClassifierTabs rooms={rooms} loading={false} />)
    const status = screen.getByRole('status')
    expect(status.textContent).not.toBe('Fotoğraflar odalara ayrılıyor')
    expect(status.textContent).toMatch(/oda/)
  })

  it('loading olmayan varsayılan durumda da role="status" mount edilir', () => {
    renderTabs()
    expect(screen.getByRole('status')).toBeTruthy()
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
    expect(screen.getByRole('radio', { name: /Balkon 0 fotoğraf/ })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Teras 0 fotoğraf/ })).toBeTruthy()
  })

  it('children prop tipte kabul edilmez (derleme zamanı sözleşmesi) ve verilse dahi render edilmez', () => {
    // @ts-expect-error children bu component'in public API'sinde yok — tip
    // seviyesinde omit edilmiştir (Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'children'>).
    renderTabs({ children: <p>görünmemeli</p> })
    expect(screen.queryByText('görünmemeli')).toBeNull()
  })
})
