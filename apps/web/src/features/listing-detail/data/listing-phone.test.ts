import { afterEach, describe, expect, it, vi } from 'vitest'
import { LISTING_PHONE_ENDPOINT, revealListingPhone } from './listing-phone'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('revealListingPhone', () => {
  it('numarayı yalnız çağrıldığında uç noktadan getirir', async () => {
    const requested: unknown[] = []
    vi.stubGlobal('fetch', async (input: unknown) => {
      requested.push(input)
      return new Response(JSON.stringify({ phone: '0 (252) 000 00 00' }), { status: 200 })
    })

    await expect(revealListingPhone('arsa-214-7')).resolves.toBe('0 (252) 000 00 00')
    expect(requested).toEqual([LISTING_PHONE_ENDPOINT('arsa-214-7')])
  })

  it('uç nokta hata dönerse gerekçeli bir hata fırlatır', async () => {
    vi.stubGlobal('fetch', async () => new Response('', { status: 503 }))
    await expect(revealListingPhone('arsa-214-7')).rejects.toThrow(/phone-reveal-failed:503/)
  })

  it('yük numara taşımıyorsa boş değeri numara gibi sunmaz', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({}), { status: 200 }))
    await expect(revealListingPhone('arsa-214-7')).rejects.toThrow(/phone-reveal-empty/)
  })
})
