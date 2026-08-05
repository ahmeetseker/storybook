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
  it('marka anlatısını, iletişim bilgilerini ve üç ürün bilgi grubunu birlikte gösterir', () => {
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

    // İletişim satırları gerçek protokol bağlantısıdır.
    expect(
      within(footer)
        .getByRole('link', { name: /0 850 000 00 00/ })
        .getAttribute('href'),
    ).toBe('tel:+908500000000')
    expect(
      within(footer)
        .getByRole('link', { name: /destek@arsam.net/ })
        .getAttribute('href'),
    ).toBe('mailto:destek@arsam.net')

    for (const heading of ['Keşfet', 'Karar araçları', 'İlan ve hesap']) {
      expect(within(footer).getByText(heading)).toBeDefined()
    }
  })

  it('son eklenen ilanlar kolonu ve sosyal bağlantılar alt barda görünür', () => {
    renderFooter()

    const footer = screen.getByRole('contentinfo')
    const highlights = within(footer).getByRole('list', {
      name: 'Son eklenen ilanlar',
    })
    const listingLinks = within(highlights).getAllByRole('link')
    expect(listingLinks).toHaveLength(4)
    expect(listingLinks[0].getAttribute('href')).toMatch(/^\/ilan\/\d+$/)

    for (const social of ['Facebook', 'Instagram', 'X', 'YouTube', 'LinkedIn']) {
      expect(within(footer).getByRole('link', { name: social })).toBeDefined()
    }
  })

  it('yalnız gerçek ürün rotalarını kullanır, konsept bağlantısı taşımaz', () => {
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
    for (const removed of ['Ana sayfa konseptleri', 'Güven merkezi']) {
      expect(
        within(footer).queryByRole('link', { name: removed }),
      ).toBeNull()
    }
    expect(footer.querySelector('a[href="#"]')).toBeNull()
  })

  it('slim varyantta yalnız kısa link setini gösterir', () => {
    renderFooter({ variant: 'slim' })

    const footer = screen.getByRole('contentinfo')
    expect(footer.getAttribute('data-variant')).toBe('slim')
    expect(
      within(footer).getByRole('link', { name: 'Arsa ara' }).getAttribute('href'),
    ).toBe('/arsa-ara')
    expect(
      within(footer).queryByRole('link', { name: 'Ana sayfa konseptleri' }),
    ).toBeNull()
    expect(within(footer).queryByText('Karar araçları')).toBeNull()
  })
})
