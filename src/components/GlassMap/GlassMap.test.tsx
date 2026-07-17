import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassMap, type GlassMapPin } from './GlassMap'

const pins: GlassMapPin[] = [
  { id: 'p1', x: 0.2, y: 0.3, price: '4.250.000 TL' },
  { id: 'p2', x: 0.5, y: 0.5, price: '1.850.000 TL' },
  { id: 'p3', x: 0.8, y: 0.6, count: 12 },
]

describe('GlassMap', () => {
  it('fiyat ve cluster pinlerini gerçek buton olarak render eder', () => {
    render(<GlassMap pins={pins} />)
    expect(screen.getByRole('button', { name: '4.250.000 TL' })).toBeDefined()
    expect(screen.getByRole('button', { name: '1.850.000 TL' })).toBeDefined()
    expect(screen.getByRole('button', { name: '12 ilan' })).toBeDefined()
  })

  it('pine tıklamak seçer (uncontrolled) ve popup içeriğini gösterir', () => {
    render(<GlassMap pins={pins} popupContent={(id) => `Detay: ${id}`} />)
    const pin = screen.getByRole('button', { name: '4.250.000 TL' })
    expect(pin.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(pin)
    expect(pin.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Detay: p1')).toBeDefined()
  })

  it('seçili pine tekrar tıklamak seçimi kaldırır', () => {
    render(<GlassMap pins={pins} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="p1" />)
    const pin = screen.getByRole('button', { name: '4.250.000 TL' })
    expect(pin.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(pin)
    expect(pin.getAttribute('aria-pressed')).toBe('false')
    expect(screen.queryByText('Detay: p1')).toBeNull()
  })

  it('controlled: selectedId dışarıdan yönetilir, tıklama onPinSelect döner', () => {
    const onPinSelect = vi.fn()
    const { rerender } = render(<GlassMap pins={pins} selectedId="p2" onPinSelect={onPinSelect} />)
    const p1 = screen.getByRole('button', { name: '4.250.000 TL' })
    const p2 = screen.getByRole('button', { name: '1.850.000 TL' })
    expect(p2.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(p1)
    expect(onPinSelect).toHaveBeenCalledWith('p1')
    // dışarıdan prop güncellenmeden iç görsel durum değişmez (controlled)
    expect(p1.getAttribute('aria-pressed')).toBe('false')
    rerender(<GlassMap pins={pins} selectedId="p1" onPinSelect={onPinSelect} />)
    expect(p1.getAttribute('aria-pressed')).toBe('true')
  })

  it('katman toggle: varsayılan yol, Uydu tıklanınca data-layer değişir ve onLayerChange çağrılır', () => {
    const onLayerChange = vi.fn()
    const { container } = render(<GlassMap pins={pins} onLayerChange={onLayerChange} />)
    expect(container.querySelector('[data-layer="yol"]')).not.toBeNull()
    fireEvent.click(screen.getByRole('radio', { name: 'Uydu' }))
    expect(onLayerChange).toHaveBeenCalledWith('uydu')
    expect(container.querySelector('[data-layer="uydu"]')).not.toBeNull()
  })

  it('privacyCircle verilince svg circle render eder', () => {
    const { container } = render(<GlassMap pins={[]} privacyCircle={{ x: 0.5, y: 0.5, r: 0.2 }} />)
    expect(container.querySelector('circle')).not.toBeNull()
  })

  it('Escape tuşu seçimi kaldırır', () => {
    render(<GlassMap pins={pins} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="p1" />)
    const pin = screen.getByRole('button', { name: '4.250.000 TL' })
    fireEvent.keyDown(pin, { key: 'Escape' })
    expect(pin.getAttribute('aria-pressed')).toBe('false')
  })

  it('ok tuşu ile pinler arasında klavye gezinmesi yapılır', () => {
    render(<GlassMap pins={pins} />)
    const p1 = screen.getByRole('button', { name: '4.250.000 TL' })
    const p2 = screen.getByRole('button', { name: '1.850.000 TL' })
    p1.focus()
    fireEvent.keyDown(p1, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(p2)
  })

  it('aynı seed her render için deterministik sokak dokusu üretir (Math.random kullanılmaz)', () => {
    const a = render(<GlassMap pins={[]} seed="sabit-42" />)
    const roadsA = a.container.querySelectorAll('svg line').length
    const blocksA = a.container.querySelectorAll('svg rect').length
    a.unmount()
    const b = render(<GlassMap pins={[]} seed="sabit-42" />)
    const roadsB = b.container.querySelectorAll('svg line').length
    const blocksB = b.container.querySelectorAll('svg rect').length
    expect(roadsA).toBe(roadsB)
    expect(blocksA).toBe(blocksB)
    expect(roadsA).toBeGreaterThan(0)
  })

  it('panel varyantı data-variant ile işaretlenir', () => {
    const { container } = render(<GlassMap pins={pins} variant="panel" />)
    expect(container.querySelector('[data-variant="panel"]')).not.toBeNull()
  })

  it('katman toggle radiogroup deseni: roving tabindex + ok tuşuyla Yol/Uydu arası odak taşır', () => {
    render(<GlassMap pins={[]} />)
    const yol = screen.getByRole('radio', { name: 'Yol' })
    const uydu = screen.getByRole('radio', { name: 'Uydu' })
    // yalnız seçili segment Tab durağı
    expect(yol.getAttribute('tabindex')).toBe('0')
    expect(uydu.getAttribute('tabindex')).toBe('-1')
    yol.focus()
    fireEvent.keyDown(yol, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(uydu)
    expect(uydu.getAttribute('aria-checked')).toBe('true')
    expect(uydu.getAttribute('tabindex')).toBe('0')
    expect(yol.getAttribute('tabindex')).toBe('-1')
    fireEvent.keyDown(uydu, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(yol)
    expect(yol.getAttribute('aria-checked')).toBe('true')
  })

  it('üst kenara yakın pinde popup aşağı açılır, sol/sağ kenarda kenara hizalanır (kırpılıp kaybolmaz)', () => {
    const top: GlassMapPin = { id: 'top', x: 0.5, y: 0.05, price: '3.000.000 TL' }
    const left: GlassMapPin = { id: 'left', x: 0.05, y: 0.5, price: '2.000.000 TL' }
    const right: GlassMapPin = { id: 'right', x: 0.95, y: 0.5, price: '5.000.000 TL' }

    const topRender = render(
      <GlassMap pins={[top]} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="top" />,
    )
    const topPopup = topRender.container.querySelector('[data-vertical]')
    expect(topPopup?.getAttribute('data-vertical')).toBe('below')
    expect(topPopup?.getAttribute('data-align')).toBe('center')
    expect(topRender.getByText('Detay: top')).toBeDefined()
    topRender.unmount()

    const leftRender = render(
      <GlassMap pins={[left]} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="left" />,
    )
    expect(leftRender.container.querySelector('[data-align]')?.getAttribute('data-align')).toBe('start')
    leftRender.unmount()

    const rightRender = render(
      <GlassMap pins={[right]} popupContent={(id) => `Detay: ${id}`} defaultSelectedId="right" />,
    )
    expect(rightRender.container.querySelector('[data-align]')?.getAttribute('data-align')).toBe('end')
  })
})
