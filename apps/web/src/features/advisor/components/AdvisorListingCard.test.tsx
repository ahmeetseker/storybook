import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import { getRepresentativeListingImage } from '../../listings/data/listing-photos'
import type { AdvisorMatch } from '../domain/advisor-types'
import { AdvisorListingCard } from './AdvisorListingCard'

const match: AdvisorMatch = {
  listing: LISTING_FIXTURES[0],
  score: 92,
  reasons: ['Konut imarı tercihinizle eşleşiyor.'],
  criteria: [
    {
      key: 'zoning',
      label: 'Konut imarlı',
      kind: 'required',
      matched: true,
      detail: 'İlan bilgisinde mevcut.',
    },
  ],
  evidence: [],
  missingData: [],
}

const defaultProps = {
  match,
  featured: false,
  favorite: false,
  compared: false,
  onOpen: vi.fn(),
  onFavorite: vi.fn(),
  onCompare: vi.fn(),
  onExplain: vi.fn(),
  onSimilar: vi.fn(),
}

describe('AdvisorListingCard', () => {
  it('renders one coherent listing article with decision data', () => {
    render(<AdvisorListingCard {...defaultProps} featured />)

    expect(
      screen.getByRole('article', { name: match.listing.title }),
    ).toBeTruthy()
    expect(screen.getByText('Temsili fotoğraf')).toBeTruthy()
    expect(
      screen.getByText(`${match.listing.imageCount} fotoğraf`),
    ).toBeTruthy()
    expect(screen.getByText('EİDS doğrulandı')).toBeTruthy()
    expect(screen.getByText('4.250.000 TL')).toBeTruthy()
    expect(screen.getByText('512 m²')).toBeTruthy()
    expect(screen.getByText('8.301 TL/m²')).toBeTruthy()
    expect(screen.getByText('%92 eşleşme')).toBeTruthy()
    expect(screen.getByText(match.reasons[0])).toBeTruthy()
  })

  it('renders at most three listing highlights', () => {
    const extendedMatch: AdvisorMatch = {
      ...match,
      listing: {
        ...match.listing,
        highlights: ['Bir', 'İki', 'Üç', 'Dört'],
      },
    }

    render(<AdvisorListingCard {...defaultProps} match={extendedMatch} />)

    const highlights = screen.getByRole('list', {
      name: 'Öne çıkan özellikler',
    })
    expect(highlights.children).toHaveLength(3)
    expect(screen.queryByText('Dört')).toBeNull()
  })

  it('wires all five listing actions', () => {
    const onOpen = vi.fn()
    const onFavorite = vi.fn()
    const onCompare = vi.fn()
    const onExplain = vi.fn()
    const onSimilar = vi.fn()

    render(
      <AdvisorListingCard
        {...defaultProps}
        onOpen={onOpen}
        onFavorite={onFavorite}
        onCompare={onCompare}
        onExplain={onExplain}
        onSimilar={onSimilar}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: match.listing.title }))
    fireEvent.click(screen.getByRole('button', { name: 'İlanı incele' }))
    fireEvent.click(screen.getByRole('button', { name: 'Favoriye ekle' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Karşılaştırmaya ekle' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Neden önerildi?' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Benzer ilanları göster' }),
    )

    expect(onOpen).toHaveBeenCalledTimes(2)
    expect(onFavorite).toHaveBeenCalledOnce()
    expect(onCompare).toHaveBeenCalledOnce()
    expect(onExplain).toHaveBeenCalledOnce()
    expect(onSimilar).toHaveBeenCalledOnce()
  })

  it('exposes persistent favorite and compare states', () => {
    const { rerender } = render(<AdvisorListingCard {...defaultProps} />)

    expect(
      screen
        .getByRole('button', { name: 'Favoriye ekle' })
        .getAttribute('aria-pressed'),
    ).toBe('false')
    expect(
      screen
        .getByRole('button', { name: 'Karşılaştırmaya ekle' })
        .getAttribute('aria-pressed'),
    ).toBe('false')

    rerender(
      <AdvisorListingCard {...defaultProps} favorite compared />,
    )

    expect(
      screen
        .getByRole('button', { name: 'Favoriden çıkar' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(
      screen
        .getByRole('button', { name: 'Karşılaştırmadan çıkar' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
  })

  it('falls back once when representative photography cannot load', () => {
    render(<AdvisorListingCard {...defaultProps} />)

    const image = screen.getByAltText(/temsili ilan fotoğrafı/i)
    fireEvent.error(image)
    expect(image.getAttribute('src')).toBe(match.listing.image.src)
    fireEvent.error(image)
    expect(image.getAttribute('src')).toBe(match.listing.image.src)
  })

  it('resets a failed image when rerendered with another listing in the same category', () => {
    const nextMatch: AdvisorMatch = {
      ...match,
      listing: LISTING_FIXTURES[6],
    }
    const { rerender } = render(<AdvisorListingCard {...defaultProps} />)
    const firstImage = screen.getByAltText(/temsili ilan fotoğrafı/i)

    fireEvent.error(firstImage)
    expect(firstImage.getAttribute('src')).toBe(match.listing.image.src)

    rerender(<AdvisorListingCard {...defaultProps} match={nextMatch} />)

    const nextImage = screen.getByAltText(
      `${nextMatch.listing.title} için temsili ilan fotoğrafı`,
    )
    // Temsili fotoğraf ilan başına dağıtılır (aynı kategorideki iki ilan aynı
    // kareyi paylaşmaz), o yüzden beklenen kaynak yeni ilanın kendisinden
    // türetilir. Buradaki sözleşme: önceki ilanın yedeğine TAKILI KALMAMAK.
    expect(nextImage.getAttribute('src')).toBe(
      getRepresentativeListingImage(nextMatch.listing).src,
    )
    expect(nextImage.getAttribute('src')).not.toBe(match.listing.image.src)

    fireEvent.error(nextImage)
    expect(nextImage.getAttribute('src')).toBe(nextMatch.listing.image.src)
  })

  it('exposes distinct verified and review-required verification states', () => {
    const { rerender } = render(<AdvisorListingCard {...defaultProps} />)

    expect(
      screen.getByText('EİDS doğrulandı').getAttribute('data-state'),
    ).toBe('verified')

    rerender(
      <AdvisorListingCard
        {...defaultProps}
        match={{
          ...match,
          listing: { ...match.listing, verified: false },
        }}
      />,
    )

    expect(
      screen
        .getByText('Belge incelemesi gerekiyor')
        .getAttribute('data-state'),
    ).toBe('review')
  })
})
