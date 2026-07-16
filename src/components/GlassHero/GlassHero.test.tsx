import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassHero } from './GlassHero'

describe('GlassHero', () => {
  it('başlık default h2 render edilir', () => {
    render(<GlassHero title="Arsa yatırımının doğrulanmış adresi" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Arsa yatırımının doğrulanmış adresi' })).toBeDefined()
  })

  it('titleAs="h1" heading seviyesini değiştirir', () => {
    render(<GlassHero title="Başlık" titleAs="h1" />)
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  })

  it('search slotu yalnız search varyantında render olur', () => {
    const { rerender } = render(
      <GlassHero title="B" variant="search" search={<input aria-label="Arsa ara" />} />,
    )
    expect(screen.getByLabelText('Arsa ara')).toBeDefined()
    rerender(<GlassHero title="B" variant="centered" search={<input aria-label="Arsa ara" />} />)
    expect(screen.queryByLabelText('Arsa ara')).toBeNull()
  })

  it('split varyantında media paneli render olur', () => {
    render(<GlassHero title="B" variant="split" media={<div>istatistik paneli</div>} />)
    expect(screen.getByText('istatistik paneli')).toBeDefined()
  })

  it('showcase varyantında scrim ve dekoratif medya sarmalayıcısı vardır', () => {
    const { container } = render(
      <GlassHero title="B" variant="showcase" media={<img alt="" src="x.png" />} />,
    )
    expect(container.querySelector('[data-hero-scrim]')).not.toBeNull()
    const mediaWrap = container.querySelector('img')?.parentElement
    expect(mediaWrap?.getAttribute('aria-hidden')).toBe('true')
  })

  it('actions verilince render olur', () => {
    render(<GlassHero title="B" variant="centered" actions={<button>Hemen Başla</button>} />)
    expect(screen.getByRole('button', { name: 'Hemen Başla' })).toBeDefined()
  })

  it('variant data attribute olarak işaretlenir', () => {
    const { container } = render(<GlassHero title="B" variant="split" />)
    expect(container.querySelector('section')?.getAttribute('data-variant')).toBe('split')
  })
})
