import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassPopover, type GlassPopoverProps } from './GlassPopover'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderPopover = (props: Partial<GlassPopoverProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassPopover trigger={<button type="button">Fiyat Analizi</button>} title="Fiyat Analizi" {...props}>
        <span>Medyan fiyat: 1.240.000 TL</span>
      </GlassPopover>
    </GlassTierProvider>,
  )

describe('GlassPopover', () => {
  it('tetikleyici tıklaması dialog rolüyle paneli açar, tekrar tıklama kapatır', async () => {
    renderPopover()
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Fiyat Analizi' }))
    expect(screen.getByRole('dialog', { name: 'Fiyat Analizi' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Fiyat Analizi' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('non-modal sözleşme: aria-modal yok, tetikleyiciye aria-haspopup/aria-expanded yazılır', () => {
    renderPopover({ defaultOpen: true })
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBeNull()
    const trigger = screen.getByRole('button', { name: 'Fiyat Analizi' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('Escape paneli kapatır', async () => {
    renderPopover({ defaultOpen: true })
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('dış tıklama kapatır, panel içi tıklama kapatmaz', async () => {
    renderPopover({ defaultOpen: true })
    fireEvent.pointerDown(screen.getByText('Medyan fiyat: 1.240.000 TL'))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.pointerDown(document.body)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('controlled: open prop\'una uyar, kendi kendine kapanmaz, onOpenChange bildirir', () => {
    const onOpenChange = vi.fn()
    renderPopover({ open: true, onOpenChange })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('dialog')).toBeTruthy() // parent kapatmadıkça açık kalır
  })

  it('title verilmezse dialog isimsizdir ama role yine dialog olur', () => {
    renderPopover({ title: undefined, defaultOpen: true })
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-labelledby')).toBeNull()
  })
})
