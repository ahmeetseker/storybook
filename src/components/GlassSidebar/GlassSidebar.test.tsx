import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassSidebar } from './GlassSidebar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSidebar = (props: Partial<Parameters<typeof GlassSidebar>[0]> = {}) => {
  const onSelect = vi.fn()
  const utils = render(
    <GlassTierProvider tier="fallback">
      <GlassSidebar selected="all" onSelect={onSelect} {...props}>
        <GlassSidebar.Header title="Library" subtitle="All Music" />
        <GlassSidebar.Item id="recent">Recently Added</GlassSidebar.Item>
        <GlassSidebar.Group label="Playlists" defaultOpen>
          <GlassSidebar.Item id="all">All Playlists</GlassSidebar.Item>
          <GlassSidebar.Item id="indie">Indie Anthems</GlassSidebar.Item>
        </GlassSidebar.Group>
      </GlassSidebar>
    </GlassTierProvider>,
  )
  return { onSelect, ...utils }
}

describe('GlassSidebar', () => {
  it('nav olarak render olur, başlık ve öğeler görünür', () => {
    renderSidebar()
    expect(screen.getByRole('navigation')).toBeTruthy()
    expect(screen.getByText('Library')).toBeTruthy()
    expect(screen.getByText('Recently Added')).toBeTruthy()
  })

  it('öğe tıklaması onSelect çağırır', () => {
    const { onSelect } = renderSidebar()
    fireEvent.click(screen.getByRole('button', { name: 'Indie Anthems' }))
    expect(onSelect).toHaveBeenCalledWith('indie')
  })

  it('seçili öğe aria-current alır, bilinmeyen selected highlight üretmez', () => {
    renderSidebar()
    expect(screen.getByRole('button', { name: 'All Playlists' }).getAttribute('aria-current')).toBe('page')

    renderSidebar({ selected: 'bilinmeyen-id' })
    const currents = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-current') === 'page')
    expect(currents).toHaveLength(1) // yalnızca ilk render'daki; ikinci render'da yok
  })

  it('Group başlığı aria-expanded günceller ve öğeleri gizler', async () => {
    renderSidebar()
    const groupBtn = screen.getByRole('button', { name: /^Playlists$/ })
    expect(groupBtn.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(groupBtn)
    expect(groupBtn.getAttribute('aria-expanded')).toBe('false')
    await waitFor(() => expect(screen.queryByText('All Playlists')).toBeNull())
  })

  it('iç içe Group dev uyarısı üretir', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <GlassTierProvider tier="fallback">
        <GlassSidebar>
          <GlassSidebar.Group label="Dış">
            <GlassSidebar.Group label="İç">
              <GlassSidebar.Item id="x">X</GlassSidebar.Item>
            </GlassSidebar.Group>
          </GlassSidebar.Group>
        </GlassSidebar>
      </GlassTierProvider>,
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('iç içe Group'))
    warn.mockRestore()
  })

  it('Item, GlassSidebar dışında kullanılırsa anlamlı hata fırlatır', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<GlassSidebar.Item id="x">X</GlassSidebar.Item>)).toThrow(/GlassSidebar içinde/)
    vi.mocked(console.error).mockRestore()
  })
})
