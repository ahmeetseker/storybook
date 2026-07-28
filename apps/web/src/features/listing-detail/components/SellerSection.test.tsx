import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { loadListingDetail } from '../data/listing-detail-adapter'
import { SellerSection } from './SellerSection'

const NOW = '2026-07-27T09:00:00.000Z'

async function detail() {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return result.detail
}

describe('SellerSection', () => {
  it('telefon numarası açılana kadar DOM içinde bulunmaz', async () => {
    const { container } = render(
      <SellerSection detail={await detail()} onRevealPhone={async () => '0 (252) 000 00 00'} />,
    )
    expect(container.textContent).not.toMatch(/\d{3}\s?\d{2}\s?\d{2}/)
  })

  it('numarayı yalnız istek anında getirir ve odağı numaraya taşır', async () => {
    const user = userEvent.setup()
    const onRevealPhone = vi.fn(async () => '0 (252) 000 00 00')
    render(<SellerSection detail={await detail()} onRevealPhone={onRevealPhone} />)
    await user.click(screen.getByRole('button', { name: 'Numarayı göster' }))
    expect(onRevealPhone).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /0 \(252\)/ })
      expect(document.activeElement).toBe(link)
    })
  })

  it('numara alınamazsa gerekçe gösterir ve butonu tekrar denenebilir bırakır', async () => {
    const user = userEvent.setup()
    render(
      <SellerSection
        detail={await detail()}
        onRevealPhone={async () => {
          throw new Error('rate-limited')
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Numarayı göster' }))
    expect(await screen.findByText(/Numara şu anda gösterilemiyor/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Numarayı göster' })).toBeTruthy()
  })

  it('TTBS yetkisini ilan içeriğinin doğrulaması gibi sunmaz', async () => {
    render(<SellerSection detail={await detail()} onRevealPhone={async () => '0'} />)
    expect(screen.getByText(/işletmenin faaliyet yetkisidir/i)).toBeTruthy()
  })

  it('analitiğe numarayı değil yalnız olay adını gönderir', async () => {
    const user = userEvent.setup()
    const onAnalyticsEvent = vi.fn()
    render(
      <SellerSection
        detail={await detail()}
        onRevealPhone={async () => '0 (252) 000 00 00'}
        onAnalyticsEvent={onAnalyticsEvent}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Numarayı göster' }))
    await screen.findByRole('link', { name: /0 \(252\)/ })
    expect(onAnalyticsEvent.mock.calls.flat()).toEqual([
      'seller_phone_reveal_requested',
      'seller_phone_reveal_succeeded',
    ])
    for (const call of onAnalyticsEvent.mock.calls) {
      expect(JSON.stringify(call)).not.toMatch(/252/)
    }
  })

  it('kontrollü desende açılışı dışarıdan bildirir', async () => {
    const user = userEvent.setup()
    const onRevealedChange = vi.fn()
    render(
      <SellerSection
        detail={await detail()}
        revealed={false}
        onRevealedChange={onRevealedChange}
        onRevealPhone={async () => '0 (252) 000 00 00'}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Numarayı göster' }))
    expect(onRevealedChange).toHaveBeenCalledWith(true)
  })

  it('iletişim kapalıyken numara açma kontrolü sunmaz', async () => {
    const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario: 'inactive', now: NOW })
    if (!result) throw new Error('fixture bulunamadı')
    render(<SellerSection detail={result.detail} onRevealPhone={async () => '0 (252) 000 00 00'} />)
    expect(screen.queryByRole('button', { name: 'Numarayı göster' })).toBeNull()
    expect(screen.getByText(/numara paylaşımı kapalı/i)).toBeTruthy()
  })
})
