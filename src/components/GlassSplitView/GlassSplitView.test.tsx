import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassSplitView } from './GlassSplitView'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSplit = (props: Partial<Parameters<typeof GlassSplitView>[0]> = {}, content = 'İçerik A') =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSplitView sidebar={<div>Yan Panel</div>} {...props}>
        <div>{content}</div>
      </GlassSplitView>
    </GlassTierProvider>,
  )

describe('GlassSplitView', () => {
  it('sidebar ve içerik render olur', () => {
    const { container } = renderSplit()
    expect(screen.getByText('Yan Panel')).toBeTruthy()
    expect(screen.getByText('İçerik A')).toBeTruthy()
    expect(container.querySelector('[data-sidebar-slot]')!.hasAttribute('inert')).toBe(false)
  })

  it('kontrollü mod: sidebarOpen=false sidebar bölmesini gizler', () => {
    const { container } = renderSplit({ sidebarOpen: false })
    const slot = container.querySelector('[data-sidebar-slot]')!
    expect(slot.getAttribute('aria-hidden')).toBe('true')
    expect(slot.hasAttribute('inert')).toBe(true)
  })

  it('toggle butonu kontrolsüz modda açar/kapar ve onSidebarOpenChange bildirir', () => {
    const onChange = vi.fn()
    const { container } = renderSplit({ toggle: true, defaultOpen: true, onSidebarOpenChange: onChange })
    const btn = screen.getByRole('button', { name: 'Kenar çubuğunu gizle' })
    fireEvent.click(btn)
    expect(onChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('button', { name: 'Kenar çubuğunu göster' })).toBeTruthy()
    expect(container.querySelector('[data-sidebar-slot]')!.getAttribute('aria-hidden')).toBe('true')
  })

  it('contentKey değişince içerik geçiş yapar', async () => {
    const { rerender } = render(
      <GlassTierProvider tier="fallback">
        <GlassSplitView sidebar={<div>Yan Panel</div>} contentKey="a">
          <div>İçerik A</div>
        </GlassSplitView>
      </GlassTierProvider>,
    )
    rerender(
      <GlassTierProvider tier="fallback">
        <GlassSplitView sidebar={<div>Yan Panel</div>} contentKey="b">
          <div>İçerik B</div>
        </GlassSplitView>
      </GlassTierProvider>,
    )
    expect(await screen.findByText('İçerik B')).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('İçerik A')).toBeNull())
  })

  it('sidebarWidth={360} sidebarInner genişliğini doğru ayarlar', () => {
    const { container } = renderSplit({ sidebarWidth: 360 })
    const sidebarSlot = container.querySelector('[data-sidebar-slot]')
    const sidebarInner = sidebarSlot?.querySelector('[class*="sidebarInner"]') as HTMLDivElement | null
    expect(sidebarInner?.style.width).toBe('360px')
  })
})
