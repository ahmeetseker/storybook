import { describe, expect, it } from 'vitest'
import { parseListingSearch } from '../domain/search-state'
import {
  countListings,
  listingDistribution,
  parseNaturalLanguage,
  searchListings,
} from './listing-adapter'

describe('listing mock adapter', () => {
  it('filters land listings by transaction, city, price, area and zoning', async () => {
    const response = await searchListings({
      state: parseListingSearch({
        type: 'sale',
        category: 'land',
        city: 'izmir',
        salePriceMax: '5000000',
        areaMin: '400',
        f_zoning: 'residential',
      }),
      pageSize: 24,
    })

    expect(response.total).toBeGreaterThan(0)
    expect(response.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'land',
          transaction: 'sale',
          city: 'izmir',
          verified: true,
        }),
      ]),
    )
    expect(
      response.items.every(
        (item) =>
          item.category === 'land' &&
          item.city === 'izmir' &&
          item.price <= 5_000_000 &&
          item.area >= 400 &&
          item.attributes.zoning === 'residential',
      ),
    ).toBe(true)
  })

  it('returns facet counts and stable 24-item pagination', async () => {
    const first = await searchListings({
      state: parseListingSearch({}),
      pageSize: 24,
    })
    const second = await searchListings({
      state: parseListingSearch({ page: '2' }),
      pageSize: 24,
    })

    expect(first.total).toBeGreaterThan(24)
    expect(first.items).toHaveLength(24)
    expect(second.items).toHaveLength(24)
    expect(second.items[0]?.id).not.toBe(first.items[0]?.id)
    expect(first.facets.category).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'land', count: expect.any(Number) }),
        expect.objectContaining({
          value: 'residential',
          count: expect.any(Number),
        }),
      ]),
    )
  })

  it('parses natural language into proposals without mutating search state', async () => {
    const proposal = await parseNaturalLanguage(
      'İzmir Urla’da 5 milyon altı, 500 metrekare konut imarlı arsa',
    )

    expect(proposal.confidence).toBeGreaterThan(70)
    expect(proposal.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'city', value: 'izmir' }),
        expect.objectContaining({ key: 'category', value: 'land' }),
        expect.objectContaining({ key: 'salePriceMax', value: 5_000_000 }),
        expect.objectContaining({ key: 'areaMin', value: 500 }),
      ]),
    )
  })

  // Filtre paneli ancak sonucu gerçekten daraltıyorsa dürüsttür. Eski matcher
  // özelliği taşımayan ilanı da geçiriyordu; işaretli filtre hiçbir şey
  // yapmıyordu (yalancı kontrol).
  it('katalog filtresi sonucu gerçekten daraltır', async () => {
    const all = await searchListings({
      state: parseListingSearch({ category: 'residential' }),
      pageSize: 200,
    })
    const filtered = await searchListings({
      state: parseListingSearch({ category: 'residential', f_heating: 'natural-gas' }),
      pageSize: 200,
    })
    expect(filtered.total).toBeGreaterThan(0)
    expect(filtered.total).toBeLessThan(all.total)
    for (const item of filtered.items) {
      expect(item.facets.heating).toContain('natural-gas')
    }
  })

  it('çoklu seçim VEYA olarak çalışır: seçenek eklemek sonucu genişletir', async () => {
    const single = await searchListings({
      state: parseListingSearch({ category: 'residential', f_heating: 'natural-gas' }),
      pageSize: 200,
    })
    const pair = await searchListings({
      state: parseListingSearch({ category: 'residential', f_heating: 'natural-gas,central' }),
      pageSize: 200,
    })
    expect(pair.total).toBeGreaterThan(single.total)
  })

  it('sayısal aralık filtresi ölçüye göre süzer', async () => {
    const response = await searchListings({
      state: parseListingSearch({ category: 'residential', 'r_building-ageMax': '10' }),
      pageSize: 200,
    })
    expect(response.total).toBeGreaterThan(0)
    for (const item of response.items) {
      expect(item.metrics['building-age']).toBeLessThanOrEqual(10)
    }
  })

  // Ölçüsü olmayan ilan, aralık seçildiğinde elenmelidir: aksi halde
  // "en fazla 10 yıl" diyen kullanıcıya yaşı bilinmeyen bina gösterilirdi.
  it('ölçüsü olmayan ilan aralık filtresinde elenir', async () => {
    const response = await searchListings({
      state: parseListingSearch({ category: 'land', 'r_building-ageMax': '10' }),
      pageSize: 200,
    })
    // Arsada bina yaşı ölçüsü hiç üretilmez.
    expect(response.total).toBe(0)
  })

  // "Bu alanda ara": haritadan seçilen kadraj gerçek bir filtredir. Buton
  // eskiden hiçbir şey yapmıyordu (ölü kontrol).
  it('harita alanı filtresi kadrajın dışındaki ilanları eler', async () => {
    const all = await searchListings({
      state: parseListingSearch({}),
      pageSize: 300,
    })
    // İzmir çevresine dar bir kadraj.
    const response = await searchListings({
      state: parseListingSearch({ bbox: '38.2,26.2,38.6,27.3' }),
      pageSize: 300,
    })
    expect(response.total).toBeGreaterThan(0)
    expect(response.total).toBeLessThan(all.total)
    for (const item of response.items) {
      expect(item.coordinates.lat).toBeGreaterThanOrEqual(38.2)
      expect(item.coordinates.lat).toBeLessThanOrEqual(38.6)
      expect(item.coordinates.lng).toBeGreaterThanOrEqual(26.2)
      expect(item.coordinates.lng).toBeLessThanOrEqual(27.3)
    }
  })

  it('mahalle filtresi ilçenin altında daraltır', async () => {
    const response = await searchListings({
      state: parseListingSearch({ neighbourhood: 'merkez' }),
      pageSize: 300,
    })
    expect(response.total).toBeGreaterThan(0)
    for (const item of response.items) {
      expect(item.neighbourhood).toBe('merkez')
    }
  })
})

// Karar yaprağının alt eylemi taslak durumun sonucunu ağ turu beklemeden
// sayar; sayfalama uygulanmaz.
describe('countListings', () => {
  it('sayfalamasız toplam sonucu döndürür', async () => {
    const state = parseListingSearch({ category: 'land' })
    const response = await searchListings({ state, pageSize: 5 })

    expect(response.items).toHaveLength(5)
    expect(countListings(state)).toBe(response.total)
  })

  it('kriter eklendikçe daralır', () => {
    const all = countListings(parseListingSearch({}))
    const narrowed = countListings(parseListingSearch({ category: 'land', verified: '1' }))

    expect(narrowed).toBeGreaterThan(0)
    expect(narrowed).toBeLessThan(all)
  })
})

describe('listingDistribution', () => {
  // Histogram PAZARIN kesitidir: kullanıcının seçimiyle çökerse "bütçem
  // piyasada nereye düşüyor" sorusu cevapsız kalır.
  it('kullanıcının kendi aralığı ölçeği daraltmaz', () => {
    const open = listingDistribution(parseListingSearch({}), 'price')
    const bounded = listingDistribution(
      parseListingSearch({ salePriceMin: '5000000', salePriceMax: '6000000' }),
      'price',
    )

    expect(bounded.min).toBe(open.min)
    expect(bounded.max).toBe(open.max)
  })

  // Az gözlemden çizilen sütunlar dağılımı değil tek tek ilanları gösterir.
  // Mahalle kırılımı bir avuç ilana iner: burada ray çalışır, sütun çizilmez.
  it('gözlem azsa sütun çizmez ama ölçeği korur', () => {
    const state = parseListingSearch({ category: 'land', neighbourhood: 'merkez' })
    const sparse = listingDistribution(state, 'area')

    expect(countListings(state)).toBeLessThan(16)
    expect(sparse.bins).toHaveLength(0)
    expect(sparse.max).toBeGreaterThan(sparse.min)
  })

  // Kategori kırılımı histogram için yeterli yoğunluktadır: dağılıma dayanan
  // yaprak, "Tüm Emlak" dışındaki kategorilerde de sütunlarını çizebilmeli.
  it('her kategoride sütun çizilecek yoğunluk vardır', () => {
    for (const category of ['residential', 'land', 'commercial', 'building'] as const) {
      const distribution = listingDistribution(
        parseListingSearch({ category, type: 'sale' }),
        'price',
      )
      expect(distribution.bins.length).toBeGreaterThanOrEqual(16)
    }
  })

  it('yeterli gözlemde sütunları toplam gözleme eşitler', () => {
    const state = parseListingSearch({ type: 'sale' })
    const distribution = listingDistribution(state, 'price')

    expect(distribution.bins.length).toBeGreaterThanOrEqual(16)
    expect(distribution.bins.reduce((sum, count) => sum + count, 0)).toBe(
      countListings(state),
    )
  })

  // Karışık popülasyon histogram çizdirmez: satılık+kiralık tek fiyat
  // ekseninde, daire+arsa tek m² ekseninde toplanamaz. Kesit daralınca açılır.
  it('karışık popülasyonda sütun çizmez, kesit daralınca çizer', () => {
    const mixedPrice = listingDistribution(parseListingSearch({}), 'price')
    expect(mixedPrice.bins).toHaveLength(0)
    expect(mixedPrice.max).toBeGreaterThan(mixedPrice.min)

    const mixedArea = listingDistribution(parseListingSearch({}), 'area')
    expect(mixedArea.bins).toHaveLength(0)

    expect(
      listingDistribution(parseListingSearch({ type: 'sale' }), 'price').bins.length,
    ).toBeGreaterThanOrEqual(16)
    expect(
      listingDistribution(parseListingSearch({ category: 'land' }), 'area').bins.length,
    ).toBeGreaterThanOrEqual(16)
  })

  // Ölçeğin başında var olmayan bir aralık gösterilmemeli.
  it('alt ucu sıfıra çökertmez', () => {
    for (const axis of ['price', 'area'] as const) {
      expect(listingDistribution(parseListingSearch({}), axis).min).toBeGreaterThan(0)
    }
  })

})
