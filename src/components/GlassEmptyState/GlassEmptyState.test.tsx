import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassEmptyState } from './GlassEmptyState'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderState = (props: Partial<Parameters<typeof GlassEmptyState>[0]> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassEmptyState title="Sonuç bulunamadı" {...props} />
    </GlassTierProvider>,
  )

describe('GlassEmptyState', () => {
  it('title ve description render olur', () => {
    renderState({ description: 'Filtreleri gevşetmeyi dene.' })
    expect(screen.getByText('Sonuç bulunamadı')).toBeTruthy()
    expect(screen.getByText('Filtreleri gevşetmeyi dene.')).toBeTruthy()
  })

  it('icon dekoratiftir (aria-hidden) ve yalnız verilince render olur', () => {
    const { container, rerender } = renderState({ icon: <svg data-testid="ico" /> })
    const iconWrap = container.querySelector('[aria-hidden="true"]')
    expect(iconWrap).toBeTruthy()
    expect(iconWrap!.querySelector('[data-testid="ico"]')).toBeTruthy()
    rerender(
      <GlassTierProvider tier="fallback">
        <GlassEmptyState title="Sonuç bulunamadı" />
      </GlassTierProvider>,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('action slot’u render olur ve tıklanabilir', () => {
    const onClick = vi.fn()
    renderState({
      action: (
        <button type="button" onClick={onClick}>
          Tekrar Dene
        </button>
      ),
    })
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar Dene' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('error varyantı data-variant verir ama role="alert" VERMEZ (statik içerik)', () => {
    const { container } = renderState({ variant: 'error' })
    expect(container.querySelector('[data-variant="error"]')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('boyut sınıfı uygulanır ve rest attribute’lar root’a geçer', () => {
    const { container } = renderState({ size: 'sm', 'aria-label': 'Boş liste' } as never)
    const root = container.querySelector('[data-variant="empty"]') as HTMLElement
    expect(root.className).toMatch(/sm/)
    expect(root.getAttribute('aria-label')).toBe('Boş liste')
  })
})
