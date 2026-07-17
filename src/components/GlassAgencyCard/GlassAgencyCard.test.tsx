import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { GlassAgencyCard } from './GlassAgencyCard'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderCard = (props: Partial<ComponentProps<typeof GlassAgencyCard>> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassAgencyCard name="Kaya Emlak Gayrimenkul" {...props} />
    </GlassTierProvider>,
  )

describe('GlassAgencyCard', () => {
  it('kurum adını gösterir, logo yoksa baş harf fallback\'i çıkar', () => {
    renderCard()
    expect(screen.getByText('Kaya Emlak Gayrimenkul')).toBeDefined()
    // GlassAvatar baş harf fallback'i: ilk + son kelimenin baş harfi
    expect(screen.getByText('KG')).toBeDefined()
  })

  it('logoSrc verilince img render edilir, baş harf fallback\'i çıkmaz', () => {
    const { container } = renderCard({ logoSrc: 'data:image/svg+xml,%3Csvg/%3E' })
    // Logo dekoratiftir (alt=""), bu yüzden "img" rolü AT'den gizlenir — DOM üzerinden doğrulanır
    expect(container.querySelector('img[src^="data:image/svg+xml"]')).not.toBeNull()
    expect(screen.queryByText('KG')).toBeNull()
  })

  it('verified true iken "Doğrulanmış Kurumsal" rozeti görünür metin olarak render edilir', () => {
    renderCard({ verified: true })
    expect(screen.getByText('Doğrulanmış Kurumsal')).toBeDefined()
  })

  it('verified false iken rozet hiç render edilmez', () => {
    renderCard({ verified: false })
    expect(screen.queryByText('Doğrulanmış Kurumsal')).toBeNull()
  })

  it('stats verilince etiket + değer çiftlerini tabular gösterir', () => {
    renderCard({
      stats: [
        { label: 'Aktif İlan', value: '48' },
        { label: 'Danışman', value: '12' },
      ],
    })
    expect(screen.getByText('48')).toBeDefined()
    expect(screen.getByText('Aktif İlan')).toBeDefined()
    expect(screen.getByText('12')).toBeDefined()
    expect(screen.getByText('Danışman')).toBeDefined()
  })

  it('stats DOM sırası HTML dl içerik modeline uyar: her grupta dt, dd\'den önce gelir', () => {
    const { container } = renderCard({
      stats: [
        { label: 'Aktif İlan', value: '48' },
        { label: 'Danışman', value: '12' },
      ],
    })
    const groups = container.querySelectorAll('dl > div')
    expect(groups.length).toBe(2)
    groups.forEach((group) => {
      const children = Array.from(group.children)
      expect(children.map((el) => el.tagName)).toEqual(['DT', 'DD'])
    })
  })

  it('phone verilince tel: linki render edilir (rakam dışı karakterler ayıklanır)', () => {
    renderCard({ phone: '0 (216) 348 22 11' })
    const link = screen.getByRole('link', { name: '0 (216) 348 22 11' })
    expect(link.getAttribute('href')).toBe('tel:02163482211')
  })

  it('onViewListings verilince "Aktif İlan" stat değeriyle dinamik metin üretir ve tıklamada çalışır', () => {
    const onViewListings = vi.fn()
    renderCard({
      onViewListings,
      stats: [{ label: 'Aktif İlan', value: '48' }],
    })
    const button = screen.getByRole('button', { name: '48 ilanı görüntüle' })
    fireEvent.click(button)
    expect(onViewListings).toHaveBeenCalledTimes(1)
  })

  it('onViewListings verilir ama uygun stat yoksa jenerik metne düşer', () => {
    renderCard({ onViewListings: vi.fn() })
    expect(screen.getByRole('button', { name: 'İlanları görüntüle' })).toBeDefined()
  })

  it('onMessage verilince "Mesaj Gönder" tıklamada çalışır; verilmezse hiç render edilmez', () => {
    const onMessage = vi.fn()
    const { rerender } = renderCard({ onMessage })
    fireEvent.click(screen.getByRole('button', { name: 'Mesaj Gönder' }))
    expect(onMessage).toHaveBeenCalledTimes(1)

    rerender(
      <GlassTierProvider tier="fallback">
        <GlassAgencyCard name="Kaya Emlak Gayrimenkul" />
      </GlassTierProvider>,
    )
    expect(screen.queryByRole('button', { name: 'Mesaj Gönder' })).toBeNull()
  })

  it('variant panel/inline data-variant attribute\'üne yansır', () => {
    const { container, unmount } = renderCard({ variant: 'inline' })
    expect(container.querySelector('[data-variant="inline"]')).not.toBeNull()
    unmount()

    const { container: panelContainer } = renderCard({ variant: 'panel' })
    expect(panelContainer.querySelector('[data-variant="panel"]')).not.toBeNull()
  })

  it('tagline verilince görünür, verilmezse render edilmez', () => {
    const { rerender, container } = renderCard({ tagline: 'İstanbul Anadolu Yakası Yetkili Bayi' })
    expect(within(container).getByText('İstanbul Anadolu Yakası Yetkili Bayi')).toBeDefined()

    rerender(
      <GlassTierProvider tier="fallback">
        <GlassAgencyCard name="Kaya Emlak Gayrimenkul" />
      </GlassTierProvider>,
    )
    expect(within(container).queryByText('İstanbul Anadolu Yakası Yetkili Bayi')).toBeNull()
  })
})
