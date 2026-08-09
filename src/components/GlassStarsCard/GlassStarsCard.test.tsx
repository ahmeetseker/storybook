import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  GlassStarsCard,
  GlassStarsCardDescription,
  GlassStarsCardTitle,
} from './GlassStarsCard'

const glows = (container: HTMLElement) => container.querySelectorAll('[class*="glow"]')

describe('GlassStarsCard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('içeriği ve başlık/açıklama alt bileşenlerini çizer', () => {
    render(
      <GlassStarsCard>
        <GlassStarsCardTitle>Arsam AI Bölge Raporu</GlassStarsCardTitle>
        <GlassStarsCardDescription>Kısa açıklama</GlassStarsCardDescription>
      </GlassStarsCard>,
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Arsam AI Bölge Raporu' }),
    ).toBeDefined()
    expect(screen.getByText('Kısa açıklama')).toBeDefined()
  })

  it('as="article" kök elementi article yapar ve className birleşir', () => {
    render(
      <GlassStarsCard as="article" className="ozel" data-testid="kart">
        içerik
      </GlassStarsCard>,
    )
    const kart = screen.getByTestId('kart')
    expect(kart.tagName).toBe('ARTICLE')
    expect(kart.className).toContain('ozel')
  })

  it('yıldız matrisi dekoratiftir (aria-hidden) ve kartın tamamını dolduran 216 hücre içerir', () => {
    const { container } = render(<GlassStarsCard>içerik</GlassStarsCard>)
    const alan = container.querySelector('[aria-hidden="true"]')
    expect(alan).not.toBeNull()
    expect(alan!.childElementCount).toBe(216)
  })

  it('imleç karta gelince tüm yıldızlar parıltı halesi alır', () => {
    const { container } = render(
      <GlassStarsCard data-testid="kart">içerik</GlassStarsCard>,
    )
    expect(glows(container).length).toBe(0)
    fireEvent.mouseEnter(screen.getByTestId('kart'))
    expect(glows(container).length).toBe(216)
  })

  it('içerideki bir aksiyona odaklanınca da matris tutuşur (klavye eşdeğeri)', () => {
    const { container } = render(
      <GlassStarsCard>
        <button type="button">Bölgeyi incele</button>
      </GlassStarsCard>,
    )
    fireEvent.focus(screen.getByRole('button', { name: 'Bölgeyi incele' }))
    expect(glows(container).length).toBe(216)
  })

  it('boşta her 3 saniyede rastgele yıldızlar kırpışır', () => {
    vi.useFakeTimers()
    const { container } = render(<GlassStarsCard>içerik</GlassStarsCard>)
    expect(glows(container).length).toBe(0)
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    const adet = glows(container).length
    expect(adet).toBeGreaterThan(0)
    expect(adet).toBeLessThanOrEqual(5)
  })
})
