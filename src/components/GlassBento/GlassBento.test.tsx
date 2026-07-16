import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassBento } from './GlassBento'

describe('GlassBento', () => {
  it('hücreleri grid içinde sırayla render eder', () => {
    const { container } = render(
      <GlassBento>
        <GlassBento.Stat value="12.400+" label="aktif ilan" />
        <GlassBento.Cell>serbest içerik</GlassBento.Cell>
      </GlassBento>,
    )
    expect(container.querySelectorAll('[data-bento-item]')).toHaveLength(2)
    expect(screen.getByText('12.400+')).toBeDefined()
    expect(screen.getByText('serbest içerik')).toBeDefined()
  })

  it('Feature 2×2 span alır, tıklanabilir buton olarak render olur', () => {
    const onClick = vi.fn()
    const { container } = render(
      <GlassBento>
        <GlassBento.Feature
          image="x.png"
          price="4.250.000 TL"
          title="İzmir Urla Köşe Parsel"
          meta="512 m²"
          badge="✓ EİDS"
          onClick={onClick}
        />
      </GlassBento>,
    )
    const item = container.querySelector('[data-bento-item]') as HTMLElement
    expect(item.style.gridColumn).toBe('span 2')
    expect(item.style.gridRow).toBe('span 2')
    fireEvent.click(screen.getByRole('button', { name: /İzmir Urla Köşe Parsel/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('Feature görseli dekoratiftir (boş alt)', () => {
    const { container } = render(
      <GlassBento>
        <GlassBento.Feature image="x.png" price="1 TL" title="t" />
      </GlassBento>,
    )
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('')
  })

  it('accent Stat vurgu hücresi sınıfını alır', () => {
    const { container } = render(
      <GlassBento>
        <GlassBento.Stat value="%98" label="eşleşme" tone="accent" />
      </GlassBento>,
    )
    expect((container.querySelector('[data-bento-stat]') as HTMLElement).className).toContain('cellAccent')
  })

  it('columns=3 sınıfı uygulanır', () => {
    const { container } = render(
      <GlassBento columns={3}>
        <GlassBento.Cell>x</GlassBento.Cell>
      </GlassBento>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('cols3')
  })
})
