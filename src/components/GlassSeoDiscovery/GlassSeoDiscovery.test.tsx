import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassSeoDiscovery, type GlassSeoDiscoveryColumn } from './GlassSeoDiscovery'

const kolonlar = (): GlassSeoDiscoveryColumn[] => [
  {
    id: 'yatirim',
    title: 'Yatırımlık arsa',
    href: '/bolgeler/yatirimlik-arsa',
    links: [
      {
        id: 'y1',
        label: 'Ankara yatırımlık arsa fırsatları',
        meta: 'Ankara · 128 ilan',
        href: '/emlak?category=land&city=ankara',
        image: 'ankara.jpg',
      },
      {
        id: 'y2',
        label: 'Eskişehir yol cepheli yatırımlık tarla',
        href: '/emlak?category=land&city=eskişehir',
        image: 'eskisehir.jpg',
      },
    ],
  },
  {
    id: 'tarim',
    title: 'Tarım ve zeytinlik',
    links: [
      {
        id: 't1',
        label: "Balıkesir Ayvalık'ta zeytinlik sahibi olun",
        href: '/emlak?category=land&city=balıkesir',
      },
    ],
  },
]

describe('GlassSeoDiscovery', () => {
  it('her satırı gerçek bağlantı olarak render eder (bot da kullanıcı da aynı metni okur)', () => {
    render(<GlassSeoDiscovery columns={kolonlar()} />)
    const link = screen.getByRole('link', { name: /Ankara yatırımlık arsa fırsatları/ })
    expect(link.getAttribute('href')).toBe('/emlak?category=land&city=ankara')
    expect(screen.getByRole('link', { name: /zeytinlik sahibi olun/ })).toBeDefined()
  })

  it('sıralama <ol> ile taşınır; iri rakam dekoratiftir', () => {
    const { container } = render(<GlassSeoDiscovery columns={kolonlar()} />)
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(2)
    expect(within(lists[0]).getAllByRole('listitem')).toHaveLength(2)
    const rank = container.querySelector('[class*="rank"]')
    expect(rank?.textContent).toBe('1')
    expect(rank?.getAttribute('aria-hidden')).toBe('true')
  })

  it('kolon başlıkları headingLevel ile sayfa hiyerarşisine oturur', () => {
    const { unmount } = render(<GlassSeoDiscovery columns={kolonlar()} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Yatırımlık arsa' })).toBeDefined()
    unmount()
    render(<GlassSeoDiscovery columns={kolonlar()} headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Tarım ve zeytinlik' })).toBeDefined()
  })

  it('hub bağlantısı yalnız href verilen kolonda çıkar ve küme adıyla ayrışır', () => {
    render(<GlassSeoDiscovery columns={kolonlar()} />)
    // Ok işareti aria-hidden olduğu için erişilebilir ada girmez.
    const hub = screen.getByRole('link', { name: 'Tümünü gör — Yatırımlık arsa' })
    expect(hub.getAttribute('href')).toBe('/bolgeler/yatirimlik-arsa')
    expect(screen.queryByRole('link', { name: /Tümünü gör — Tarım/ })).toBeNull()
  })

  it('görseller dekoratiftir ve tembel yüklenir', () => {
    const { container } = render(<GlassSeoDiscovery columns={kolonlar()} />)
    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(2)
    for (const image of images) {
      expect(image.getAttribute('alt')).toBe('')
      expect(image.getAttribute('loading')).toBe('lazy')
    }
  })

  it('plain varyantı görseli ve rakamı düşürür, metin bağlantısı kalır', () => {
    const { container } = render(<GlassSeoDiscovery columns={kolonlar()} variant="plain" />)
    expect(container.querySelector('[data-variant="plain"]')).not.toBeNull()
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(container.querySelector('[class*="rank"]')).toBeNull()
    expect(screen.getByRole('link', { name: /Ankara yatırımlık arsa fırsatları/ })).toBeDefined()
  })

  it('onClick router gezinmesi için bağlantının üstüne binebilir', () => {
    const onClick = vi.fn()
    const columns = kolonlar()
    columns[0].links[0].onClick = onClick
    render(<GlassSeoDiscovery columns={columns} />)
    fireEvent.click(screen.getByRole('link', { name: /Ankara yatırımlık arsa fırsatları/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
