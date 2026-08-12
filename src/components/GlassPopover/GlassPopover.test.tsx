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

  it('material ekseni: varsayılan cam, flat verilirse opak yüzey', () => {
    const { unmount } = renderPopover({ defaultOpen: true })
    expect(screen.getByRole('dialog').getAttribute('data-material')).toBe('glass')
    unmount()
    renderPopover({ defaultOpen: true, material: 'flat' })
    expect(screen.getByRole('dialog').getAttribute('data-material')).toBe('flat')
  })

  // Viewport kıstırması: positioner soldan taşarsa --pop-shift-x ile içeri itilir.
  // jsdom layout yapmadığı için ölçüm getBoundingClientRect mock'uyla beslenir;
  // positioner, dialog'un iki üst sarmalayıcısıdır (positioner > motion.div > dialog).
  it('viewport kıstırması: soldan taşan panel --pop-shift-x ile içeri itilir', () => {
    const rect = { left: -120, right: 180, width: 300, top: 40, bottom: 240, height: 200, x: -120, y: 40, toJSON: () => ({}) }
    const spy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue(rect as DOMRect)
    try {
      renderPopover({ defaultOpen: true, align: 'end' })
      const positioner = screen.getByRole('dialog').parentElement!.parentElement!
      // gutter 16px: shift = 16 - (-120) = 136px
      expect(positioner.style.getPropertyValue('--pop-shift-x')).toBe('136px')
    } finally {
      spy.mockRestore()
    }
  })

  it('viewport kıstırması: sığan panelde shift yazılmaz (masaüstü davranışı değişmez)', () => {
    const rect = { left: 40, right: 340, width: 300, top: 40, bottom: 240, height: 200, x: 40, y: 40, toJSON: () => ({}) }
    const spy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue(rect as DOMRect)
    try {
      renderPopover({ defaultOpen: true, align: 'end' })
      const positioner = screen.getByRole('dialog').parentElement!.parentElement!
      expect(positioner.style.getPropertyValue('--pop-shift-x')).toBe('')
    } finally {
      spy.mockRestore()
    }
  })

  it('viewport kıstırması: layout\'suz ortamda (genişlik 0) dokunulmaz', () => {
    renderPopover({ defaultOpen: true, align: 'end' })
    const positioner = screen.getByRole('dialog').parentElement!.parentElement!
    expect(positioner.style.getPropertyValue('--pop-shift-x')).toBe('')
  })
})
