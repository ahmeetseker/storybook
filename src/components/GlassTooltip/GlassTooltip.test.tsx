import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassTooltip, type GlassTooltipProps } from './GlassTooltip'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderTip = (props: Partial<GlassTooltipProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassTooltip content="Benzer ilanlara göre %8 düşük" delay={0} {...props}>
        <button type="button">Fiyat analizi</button>
      </GlassTooltip>
    </GlassTierProvider>,
  )

afterEach(() => {
  vi.useRealTimers()
})

describe('GlassTooltip', () => {
  it('başlangıçta panel yok, tetikleyici görünür', () => {
    renderTip()
    expect(screen.getByRole('button', { name: 'Fiyat analizi' })).toBeTruthy()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('hover, delay süresi dolunca açar (öncesinde açmaz)', () => {
    // rAF fake'lenmez: motion'ın global frameloop'u sahte rAF'ta asılı kalıp
    // sonraki testlerin exit animasyonlarını donduruyor
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { container } = renderTip({ delay: 300 })
    const wrapper = container.firstElementChild as HTMLElement
    fireEvent.mouseOver(wrapper)
    expect(screen.queryByRole('tooltip')).toBeNull()
    act(() => vi.advanceTimersByTime(299))
    expect(screen.queryByRole('tooltip')).toBeNull()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('tooltip').textContent).toBe('Benzer ilanlara göre %8 düşük')
  })

  it('focus anında açar ve tetikleyiciye aria-describedby yazılır', () => {
    renderTip()
    const trigger = screen.getByRole('button')
    fireEvent.focus(trigger)
    const tip = screen.getByRole('tooltip')
    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id)
  })

  it('Escape kapatır ve aria-describedby kaldırılır (klavye)', async () => {
    renderTip()
    const trigger = screen.getByRole('button')
    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    expect(trigger.getAttribute('aria-describedby')).toBeNull()
  })

  it('odak dışarı çıkınca (blur) anında kapanır', async () => {
    renderTip()
    const trigger = screen.getByRole('button')
    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()
    fireEvent.blur(trigger)
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('coarse pointer (dokunmatik) cihazda hiç açılmaz', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: query === '(pointer: coarse)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia
    try {
      const { container } = renderTip()
      fireEvent.mouseOver(container.firstElementChild as HTMLElement)
      fireEvent.focus(screen.getByRole('button'))
      expect(screen.queryByRole('tooltip')).toBeNull()
    } finally {
      window.matchMedia = original
    }
  })
})
