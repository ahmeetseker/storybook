import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlassTierProvider } from '@repo/ui'
import type { ComponentProps } from 'react'
import { HomeFooter } from './HomeFooter'

function renderFooter(
  props: Partial<ComponentProps<typeof HomeFooter>> = {},
) {
  return render(
    <GlassTierProvider tier="fallback">
      <HomeFooter {...props} />
    </GlassTierProvider>,
  )
}

describe('HomeFooter', () => {
  it('marka anlatısını ve üç ürün bilgi grubunu birlikte gösterir', () => {
    renderFooter()

    const footer = screen.getByRole('contentinfo')
    expect(
      within(footer)
        .getByRole('link', { name: 'arsam.net' })
        .getAttribute('href'),
    ).toBe('/')
    expect(
      within(footer).getByText(
        'Arsayı konum, imar ve doğrulama verileriyle keşfet.',
      ),
    ).toBeDefined()

    for (const heading of [
      'Keşfet',
      'Karar araçları',
      'İlan ve hesap',
    ]) {
      expect(within(footer).getByText(heading)).toBeDefined()
    }
  })

  it('yalnız gerçek ürün rotalarını kullanır ve konsept bağlantısı göstermez', () => {
    renderFooter()

    const footer = screen.getByRole('contentinfo')
    const expectedLinks = new Map([
      ['Arsa ara', '/arsa-ara'],
      ['Bölgeler', '/bolgeler'],
      ['Emlak ofisleri', '/ofisler'],
      ['Blog', '/blog'],
      ['AI danışman', '/ai-danisman'],
      ['Karşılaştır', '/karsilastir'],
      ['Favoriler', '/favoriler'],
      ['İlan ver', '/ilan-ver'],
      ['Hesabım', '/hesabim'],
      ['Mesajlar', '/hesabim/mesajlar'],
    ])

    for (const [name, href] of expectedLinks) {
      expect(
        within(footer).getByRole('link', { name }).getAttribute('href'),
      ).toBe(href)
    }
    expect(
      within(footer).queryByRole('link', {
        name: 'Ana sayfa konseptleri',
      }),
    ).toBeNull()
    expect(footer.querySelector('a[href="#"]')).toBeNull()
  })

  it('slim varyantta yalnız gerçek kısa yolları kullanır', () => {
    renderFooter({ variant: 'slim' })

    const footer = screen.getByRole('contentinfo')
    expect(footer.getAttribute('data-variant')).toBe('slim')
    expect(within(footer).queryByRole('link', { name: 'Ana sayfa konseptleri' })).toBeNull()
    expect(within(footer).queryByText('Karar araçları')).toBeNull()
  })
})
