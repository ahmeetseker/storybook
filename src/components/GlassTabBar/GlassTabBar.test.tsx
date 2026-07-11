import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassTabBar } from './GlassTabBar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBar = (props: Partial<Parameters<typeof GlassTabBar>[0]> = {}) => {
  const onSelect = vi.fn()
  const utils = render(
    <GlassTierProvider tier="fallback">
      <GlassTabBar selected="library" onSelect={onSelect} {...props}>
        <GlassTabBar.Item id="play" icon={<span />} label="Şimdi Çal" />
        <GlassTabBar.Item id="library" icon={<span />} label="Kitaplık" />
        <GlassTabBar.Item id="search" icon={<span />} label="Ara" />
      </GlassTabBar>
    </GlassTierProvider>,
  )
  return { onSelect, ...utils }
}

describe('GlassTabBar', () => {
  it('tablist ve tab rolleriyle render olur, seçili öğe aria-selected alır', () => {
    renderBar()
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical')
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Kitaplık' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Ara' }).getAttribute('aria-selected')).toBe('false')
  })

  it('tıklama onSelect çağırır', () => {
    const { onSelect } = renderBar()
    fireEvent.click(screen.getByRole('tab', { name: 'Ara' }))
    expect(onSelect).toHaveBeenCalledWith('search')
  })

  it('pointer girişinde genişler, çıkışında daralır', () => {
    const { container } = renderBar()
    const bar = container.querySelector('[data-expanded]')!
    expect(bar.getAttribute('data-expanded')).toBe('false')
    fireEvent.pointerEnter(bar)
    expect(bar.getAttribute('data-expanded')).toBe('true')
    fireEvent.pointerLeave(bar)
    expect(bar.getAttribute('data-expanded')).toBe('false')
  })

  it('ArrowDown bir sonraki sekmeyi seçer, ArrowUp öncekini', () => {
    const { onSelect } = renderBar()
    const tabs = screen.getAllByRole('tab')
    tabs[1].focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown' })
    expect(onSelect).toHaveBeenCalledWith('search')
    tabs[1].focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowUp' })
    expect(onSelect).toHaveBeenCalledWith('play')
  })

  it('Item, GlassTabBar dışında kullanılırsa anlamlı hata fırlatır', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<GlassTabBar.Item id="x" icon={<span />} label="X" />)).toThrow(
      /GlassTabBar içinde/,
    )
    vi.mocked(console.error).mockRestore()
  })
})
