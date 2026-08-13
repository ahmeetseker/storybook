import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { AiSparkleButton } from './AiSparkleButton'

// RippleGrid, WebGL'siz jsdom'da kendi try/catch'iyle sessizce kurulmaz;
// yine de mock'lanır ki ogl hiç yüklenmesin (test hızını korur).
vi.mock('./RippleGrid', () => ({
  default: () => null,
}))

describe('AiSparkleButton', () => {
  it('erişilebilir adla render olur ve tıklayınca patlama sınıfı alır', () => {
    vi.useFakeTimers()
    try {
      const onActivate = vi.fn()
      render(<AiSparkleButton onActivate={onActivate} />)
      const buton = screen.getByRole('button', { name: 'AI danışman' })
      fireEvent.click(buton)
      expect(buton.className).toMatch(/bursting/)
      // Yönlendirme patlamanın tepe anında (350ms) gelir
      expect(onActivate).not.toHaveBeenCalled()
      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(onActivate).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('reduced-motion tercihi varsa beklemeden yönlendirir', () => {
    const asil = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia
    try {
      const onActivate = vi.fn()
      render(<AiSparkleButton onActivate={onActivate} />)
      fireEvent.click(screen.getByRole('button', { name: 'AI danışman' }))
      expect(onActivate).toHaveBeenCalledTimes(1)
    } finally {
      window.matchMedia = asil
    }
  })
})
