import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { loadListingDetail } from '../data/listing-detail-adapter'
import { ListingEvidenceBrief } from './ListingEvidenceBrief'

const NOW = '2026-07-27T09:00:00.000Z'

async function setup(scenario?: 'ai-unavailable') {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario, now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return render(<ListingEvidenceBrief brief={result.aiBrief} detail={result.detail} />)
}

describe('ListingEvidenceBrief', () => {
  it('her iddiayı ilgili bölüme bağlayan bir dayanak bağlantısı verir', async () => {
    await setup()
    const region = screen.getByRole('region', { name: /karar özeti/i })
    const links = within(region).getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(5)
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^#(parsel|imar|altyapi|arazi|piyasa|belgeler)$/)
    }
  })

  it('çıplak güven yüzdesi göstermez', async () => {
    const { container } = await setup()
    expect(container.textContent).not.toMatch(/%\s?\d{1,3}\s?güven/i)
  })

  it('bilinmeyenleri ve sonraki kontrolleri ayrı listeler', async () => {
    await setup()
    expect(screen.getByText('Bilinmeyenler')).toBeTruthy()
    expect(screen.getByText('Önerilen sonraki kontroller')).toBeTruthy()
    expect(screen.getByText(/TAKBİS takyidat kaydı/)).toBeTruthy()
  })

  it('model sürümünü ve kanıt kesitini görünür kılar', async () => {
    await setup()
    expect(screen.getByText(/model v2\.4/i)).toBeTruthy()
    expect(screen.getByText(/24 Tem 2026/)).toBeTruthy()
  })

  it('AI kullanılamadığında yapılandırılmış içeriği bozmadan gerekçe gösterir', async () => {
    await setup('ai-unavailable')
    expect(screen.getByText(/Karar özeti şu anda üretilemiyor/)).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('geri bildirim kategorilerini sunar', async () => {
    await setup()
    expect(screen.getByRole('button', { name: 'Yanlış bilgi bildir' })).toBeTruthy()
  })
})
