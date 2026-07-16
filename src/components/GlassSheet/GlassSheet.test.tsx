import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassSheet, type GlassSheetProps } from './GlassSheet'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSheet = ({ children, ...props }: Partial<GlassSheetProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSheet {...({ open: true, onClose: () => {}, title: 'Filtreler', ...props } as GlassSheetProps)}>
        {children ?? 'Filtre içeriği'}
      </GlassSheet>
    </GlassTierProvider>,
  )

describe('GlassSheet', () => {
  it('dialog rolüyle render olur, title accessible name olur ve aria-modal verilir', () => {
    renderSheet()
    const dialog = screen.getByRole('dialog', { name: 'Filtreler' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('open=false iken dialog render edilmez', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSheet open={false} onClose={() => {}} title="Gizli">
          içerik
        </GlassSheet>
      </GlassTierProvider>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('ilk durakta açılır; defaultDetent büyük durağı seçebilir', () => {
    const { unmount } = renderSheet({ detents: [0.4, 0.9] })
    expect((screen.getByRole('dialog') as HTMLElement).style.height).toBe('40dvh')
    unmount()

    renderSheet({ detents: [0.4, 0.9], defaultDetent: 1 })
    expect((screen.getByRole('dialog') as HTMLElement).style.height).toBe('90dvh')
  })

  it('tutamaç klavyesi: ArrowUp büyük durağa geçer ve onDetentChange çağrılır', () => {
    const onDetentChange = vi.fn()
    renderSheet({ detents: [0.4, 0.9], onDetentChange })
    const grabber = screen.getByRole('button', { name: 'Panel boyutu' })
    fireEvent.keyDown(grabber, { key: 'ArrowUp' })
    expect(onDetentChange).toHaveBeenCalledWith(1)
    expect((screen.getByRole('dialog') as HTMLElement).style.height).toBe('90dvh')
  })

  it('en küçük duraktayken ArrowDown onClose çağırır; dismissible=false iken çağırmaz', () => {
    const onClose = vi.fn()
    const { unmount } = renderSheet({ onClose })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Panel boyutu' }), { key: 'ArrowDown' })
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    const onClose2 = vi.fn()
    renderSheet({ onClose: onClose2, dismissible: false })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Panel boyutu' }), { key: 'ArrowDown' })
    expect(onClose2).not.toHaveBeenCalled()
  })

  it('Escape onClose çağırır; dismissible=false iken çağırmaz', () => {
    const onClose = vi.fn()
    const { unmount } = renderSheet({ onClose })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    const onClose2 = vi.fn()
    renderSheet({ onClose: onClose2, dismissible: false })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose2).not.toHaveBeenCalled()
  })

  it('backdrop tıklaması dismissible iken kapatır', () => {
    const onClose = vi.fn()
    renderSheet({ onClose })
    fireEvent.click(document.querySelector('[data-glass-backdrop]')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sürükleme: yukarı çekip bırakınca en yakın durağa oturur', () => {
    const onDetentChange = vi.fn()
    renderSheet({ detents: [0.4, 0.9], onDetentChange })
    const grabber = screen.getByRole('button', { name: 'Panel boyutu' })
    // jsdom: innerHeight 768 → 0.4 = 307px başlangıç; 350px yukarı çek → 657px ≈ 0.9 durağı (691px)
    fireEvent.pointerDown(grabber, { clientY: 500, pointerId: 1 })
    fireEvent.pointerMove(grabber, { clientY: 150, pointerId: 1 })
    fireEvent.pointerUp(grabber, { pointerId: 1 })
    expect(onDetentChange).toHaveBeenCalledWith(1)
  })

  it('sürükleme: en küçük durağın 80px altına çekince kapanır', () => {
    const onClose = vi.fn()
    renderSheet({ onClose, detents: [0.4, 0.9] })
    const grabber = screen.getByRole('button', { name: 'Panel boyutu' })
    fireEvent.pointerDown(grabber, { clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(grabber, { clientY: 500, pointerId: 1 })
    fireEvent.pointerUp(grabber, { pointerId: 1 })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('body scroll kilitlenir ve kapanınca geri açılır', () => {
    const { unmount } = renderSheet()
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
