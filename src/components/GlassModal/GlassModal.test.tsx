import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassModal, type GlassModalProps } from './GlassModal'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderModal = ({ children, ...props }: Partial<GlassModalProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassModal {...({ open: true, onClose: () => {}, title: 'İlanı kaldır', ...props } as GlassModalProps)}>
        {children ?? 'Bu işlem geri alınamaz.'}
      </GlassModal>
    </GlassTierProvider>,
  )

describe('GlassModal', () => {
  it('dialog rolüyle render olur, title accessible name olur ve aria-modal verilir', () => {
    renderModal()
    const dialog = screen.getByRole('dialog', { name: 'İlanı kaldır' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('open=false iken dialog render edilmez', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassModal open={false} onClose={() => {}} title="Gizli">
          içerik
        </GlassModal>
      </GlassTierProvider>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it("title yokken ariaLabel dialog'un accessible name'i olur", () => {
    renderModal({ title: undefined, ariaLabel: 'Fotoğraf önizleme' } as Partial<GlassModalProps>)
    expect(screen.getByRole('dialog', { name: 'Fotoğraf önizleme' })).toBeTruthy()
  })

  it('description aria-describedby ile bağlanır', () => {
    renderModal({ description: 'İlan arşive taşınır.' })
    const dialog = screen.getByRole('dialog')
    const descId = dialog.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId!)?.textContent).toBe('İlan arşive taşınır.')
  })

  it('Escape onClose çağırır; dismissible=false iken çağırmaz', () => {
    const onClose = vi.fn()
    const { unmount } = renderModal({ onClose })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    const onClose2 = vi.fn()
    renderModal({ onClose: onClose2, dismissible: false })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose2).not.toHaveBeenCalled()
  })

  it('backdrop tıklaması onClose çağırır, panel tıklaması çağırmaz', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(document.querySelector('[data-glass-backdrop]')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('açılınca ilk odaklanabilir öğe focus alır', () => {
    renderModal({ footer: <button type="button">Vazgeç</button> })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Vazgeç' }))
  })

  it('odaklanabilir öğe yoksa panelin kendisi focus alır', () => {
    renderModal({ children: 'yalnız metin' })
    expect(document.activeElement).toBe(screen.getByRole('dialog'))
  })

  it('Tab son elemandan ilkine sarar (focus trap)', () => {
    renderModal({
      footer: (
        <>
          <button type="button">Vazgeç</button>
          <button type="button">Kaldır</button>
        </>
      ),
    })
    const first = screen.getByRole('button', { name: 'Vazgeç' })
    const last = screen.getByRole('button', { name: 'Kaldır' })

    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('body scroll kilidi uygulanır ve kapanınca kalkar', () => {
    const { unmount } = renderModal()
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('kapanınca focus tetikleyiciye geri döner', () => {
    function Wrapper({ open }: { open: boolean }) {
      return (
        <GlassTierProvider tier="fallback">
          <button type="button">Tetikleyici</button>
          <GlassModal open={open} onClose={() => {}} title="Modal">
            <button type="button">İç buton</button>
          </GlassModal>
        </GlassTierProvider>
      )
    }
    const { rerender } = render(<Wrapper open={false} />)
    const trigger = screen.getByRole('button', { name: 'Tetikleyici' })
    trigger.focus()
    rerender(<Wrapper open />)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'İç buton' }))
    rerender(<Wrapper open={false} />)
    expect(document.activeElement).toBe(trigger)
  })
})
