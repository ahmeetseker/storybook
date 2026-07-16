import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassDrawer, type GlassDrawerProps } from './GlassDrawer'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderDrawer = ({ children, ...props }: Partial<GlassDrawerProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassDrawer {...({ open: true, onClose: () => {}, title: 'Arama filtreleri', ...props } as GlassDrawerProps)}>
        {children ?? 'Filtre içeriği'}
      </GlassDrawer>
    </GlassTierProvider>,
  )

describe('GlassDrawer', () => {
  it('dialog rolüyle render olur, title accessible name olur ve aria-modal verilir', () => {
    renderDrawer()
    const dialog = screen.getByRole('dialog', { name: 'Arama filtreleri' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('open=false iken dialog render edilmez', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassDrawer open={false} onClose={() => {}} title="Gizli">
          içerik
        </GlassDrawer>
      </GlassTierProvider>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it("title yokken ariaLabel dialog'un accessible name'i olur", () => {
    renderDrawer({ title: undefined, ariaLabel: 'Filtre paneli' } as Partial<GlassDrawerProps>)
    expect(screen.getByRole('dialog', { name: 'Filtre paneli' })).toBeTruthy()
  })

  it('side ve size sınıfları panele uygulanır (default right/md)', () => {
    const { unmount } = renderDrawer()
    expect(screen.getByRole('dialog').className).toMatch(/right/)
    unmount()

    renderDrawer({ side: 'bottom', size: 'lg' })
    const panel = screen.getByRole('dialog')
    expect(panel.className).toMatch(/bottom/)
    expect(panel.className).toMatch(/lg/)
  })

  it('Escape onClose çağırır; dismissible=false iken çağırmaz', () => {
    const onClose = vi.fn()
    const { unmount } = renderDrawer({ onClose })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    const onClose2 = vi.fn()
    renderDrawer({ onClose: onClose2, dismissible: false })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose2).not.toHaveBeenCalled()
  })

  it('backdrop tıklaması onClose çağırır', () => {
    const onClose = vi.fn()
    renderDrawer({ onClose })
    fireEvent.click(document.querySelector('[data-glass-backdrop]')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('açılınca ilk odaklanabilir öğe focus alır ve body scroll kilitlenir', () => {
    const { unmount } = renderDrawer({ footer: <button type="button">Uygula</button> })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Uygula' }))
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('Tab son elemandan ilkine sarar (focus trap)', () => {
    renderDrawer({
      footer: (
        <>
          <button type="button">Temizle</button>
          <button type="button">Uygula</button>
        </>
      ),
    })
    const first = screen.getByRole('button', { name: 'Temizle' })
    const last = screen.getByRole('button', { name: 'Uygula' })
    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })
})
