import { describe, expect, it } from 'vitest'
import {
  ANY,
  applyDecision,
  curatedField,
  applyDecisionRange,
  decisionActiveCount,
  decisionFields,
  decisionRange,
  decisionValue,
  toggleDecision,
} from './decision-sheet'
import { DEFAULT_LISTING_SEARCH_STATE, type ListingSearchState } from './search-state'

const base: ListingSearchState = DEFAULT_LISTING_SEARCH_STATE

const withState = (patch: Partial<ListingSearchState>): ListingSearchState => ({
  ...base,
  ...patch,
})

const field = (state: ListingSearchState, id: string) => {
  const found = decisionFields(state).find((item) => item.id === id)
  if (!found) throw new Error(`${id} alanı yaprakta yok`)
  return found
}

/** Katalog kriterinin özel kontrol karşılığı; yoksa test kırılır. */
const curated = (key: string, state: ListingSearchState) => {
  const found = curatedField(key, state.category)
  if (!found) throw new Error(`${key} için özel kontrol yok`)
  return found
}

describe('decisionFields', () => {
  // Temel blok yalnız katalogda karşılığı OLMAYAN kararları taşır: kategoriye
  // özgü kriterler artık akışta kendi bölümlerinde yaşıyor (Kademeli Akış).
  it('temel blok her kategoride aynı dört kararı sorar', () => {
    for (const category of ['all', 'residential', 'land', 'commercial', 'building'] as const) {
      const ids = decisionFields(withState({ category })).map((item) => item.id)
      expect(ids).toEqual(['category', 'transaction', 'price', 'area'])
    }
  })

  // Emlak türü kataloğun kapısıdır: "Tüm Emlak"ta yalnız her kategoride ortak
  // kriterler anlamlıdır, tür seçilince katalog açılır. Bu karar yaprakta
  // yoksa kullanıcı jenerik görünümde sıkışır.
  it('emlak türünü her zaman ilk karar olarak sorar', () => {
    for (const category of ['all', 'residential', 'land'] as const) {
      const fields = decisionFields(withState({ category }))
      expect(fields[0].id).toBe('category')
      expect(fields[0].control).toBe('category')
      expect(fields[0].options?.map((o) => o.value)).toContain('land')
    }
  })

  it('emlak türü seçimi kategoriye özgü seçimleri temizler', () => {
    const state = withState({ category: 'residential', categoryFilters: { rooms: ['2+1'] } })
    const next = applyDecision(field(state, 'category'), state, 'land')

    expect(next.category).toBe('land')
    expect(next.categoryFilters).toEqual({})
  })

  // Arsada oda/banyo her zaman sıfır sonuç üretir; kriter kategoriye uymuyorsa
  // özel kontrol de üretilmez ve akışta hiç çizilmez.
  it('kategoriye uymayan kriter için özel kontrol üretmez', () => {
    expect(curatedField('rooms', 'land')).toBeUndefined()
    expect(curatedField('bathrooms', 'land')).toBeUndefined()
    expect(curatedField('rooms', 'residential')).toBeDefined()
  })

  // Bir alan, seçime göre BAŞKA bir alana dönüşmez: kullanıcı "Hepsi"ye
  // dokununca tutar filtresi kaybolup yerini metrekareye bırakıyordu ve
  // altındaki her şey yer değiştiriyordu.
  it('tutar alanı her işlem türü seçiminde yerinde kalır', () => {
    for (const transactions of [['sale'], ['rent'], ['sale', 'rent']] as const) {
      const ids = decisionFields(withState({ transactions: [...transactions] })).map((f) => f.id)
      expect(ids[1]).toBe('transaction')
      expect(ids[2]).toBe('price')
    }
  })

  it('tutar başlığı işlem türüne uyar', () => {
    const label = (transactions: ListingSearchState['transactions']) =>
      decisionFields(withState({ transactions })).find((f) => f.id === 'price')?.label

    expect(label(['rent'])).toBe('Aylık kira')
    expect(label(['sale'])).toBe('Satılık fiyatı')
    expect(label(['sale', 'rent'])).toBe('Fiyat')
  })

  // Oda katalogda 11 seçenek; yaprakta beş segmente iner ama daraltma gerçek
  // kalır — "4+" alttaki tüm ham değerleri kapsar.
  it('oda sayısını beş segmente gruplar', () => {
    const rooms = curated('rooms', withState({ category: 'residential' }))
    expect(rooms.control).toBe('segment')
    expect(rooms.options).toHaveLength(5)
    expect(rooms.options?.at(-1)?.values).toContain('6+ ve üzeri')
  })

  // Beş segmente sığmayan liste gizlenmez, çip olarak sarmalanır.
  it('uzun seçenek listelerini çipe düşürür', () => {
    const zoning = curated('zoning', withState({ category: 'land' }))
    expect(zoning.control).toBe('chips')
    expect((zoning.options?.length ?? 0)).toBeGreaterThan(4)
  })
})

describe('applyDecision', () => {
  it('oda grubunu katalogdaki ham değerlere çevirir', () => {
    const state = withState({ category: 'residential' })
    const next = applyDecision(curated('rooms', state), state, '2+1')
    expect(next.categoryFilters.rooms).toEqual(['2+0', '2+1'])
    expect(next.page).toBe(1)
  })

  it('"Hepsi" seçimi kriteri tamamen kaldırır', () => {
    const state = withState({ category: 'residential', categoryFilters: { rooms: ['2+1'] } })
    const next = applyDecision(curated('rooms', state), state, ANY)
    expect(next.categoryFilters.rooms).toBeUndefined()
  })

  it('banyoyu "en az N" olarak yazar', () => {
    const state = withState({ category: 'residential' })
    const next = applyDecision(curated('bathrooms', state), state, '3')
    expect(next.categoryRanges.bathrooms).toEqual({ min: 3 })
    expect(decisionValue(curated('bathrooms', next), next)).toBe('3')
  })

  // İşlem türü değişince öteki tutar sınırı görünmez bir filtre olarak kalırdı;
  // kiralığa geçen kullanıcı sebepsiz boş sonuç görürdü.
  it('işlem türü değişince öteki tutar sınırını siler', () => {
    const state = withState({
      transactions: ['sale', 'rent'],
      salePrice: { min: 1_000_000 },
      rentPrice: { max: 30_000 },
    })
    const next = applyDecision(field(state, 'transaction'), state, 'rent')
    expect(next.transactions).toEqual(['rent'])
    expect(next.salePrice).toBeUndefined()
    expect(next.rentPrice).toEqual({ max: 30_000 })
  })

  it('çip düzeninde tek değeri açıp kapatır', () => {
    const state = withState({ category: 'land' })
    const zoning = curated('zoning', state)
    const on = toggleDecision(zoning, state, 'residential')
    expect(on.categoryFilters.zoning).toEqual(['residential'])
    const off = toggleDecision(zoning, on, 'residential')
    expect(off.categoryFilters.zoning).toBeUndefined()
  })
})

describe('applyDecisionRange', () => {
  const bounds = { min: 3_000, max: 120_000 }

  it('daraltılmış aralığı duruma yazar', () => {
    const state = withState({ transactions: ['rent'] })
    const next = applyDecisionRange(field(state, 'price'), state, [8_500, 74_000], bounds)
    expect(next.rentPrice).toEqual({ min: 8_500, max: 74_000 })
  })

  // "Tüm aralık" bir filtre değildir: çip olarak görünmemeli, sonucu
  // daraltmamalı.
  it('uçlara oturan aralıkta sınırı siler', () => {
    const state = withState({ transactions: ['rent'], rentPrice: { min: 8_500 } })
    const next = applyDecisionRange(field(state, 'price'), state, [3_000, 120_000], bounds)
    expect(next.rentPrice).toBeUndefined()
  })

  it('sınır yokken kolları eksenin uçlarına oturtur', () => {
    const state = withState({ transactions: ['rent'] })
    expect(decisionRange(field(state, 'price'), state, bounds)).toEqual([3_000, 120_000])
  })

  // İşlem türü seçilmemişken tek tutar sorusu her iki türe de uygulanmalı;
  // aksi halde kullanıcı sınırı çeker ama kiralıklar hiç elenmezdi.
  it('işlem türü seçilmemişken sınırı her iki türe yazar', () => {
    const state = withState({ transactions: ['sale', 'rent'] })
    const next = applyDecisionRange(field(state, 'price'), state, [8_500, 74_000], bounds)

    expect(next.salePrice).toEqual({ min: 8_500, max: 74_000 })
    expect(next.rentPrice).toEqual({ min: 8_500, max: 74_000 })
  })
})

describe('decisionActiveCount', () => {
  it('yalnız gerçekten verilen kararları sayar', () => {
    // Hiçbir karar verilmemiş başlangıç: tür "Hepsi", işlem "Hepsi", sınır yok.
    expect(decisionActiveCount(withState({}))).toBe(0)
    // Tür seçmek başlı başına bir karardır — kataloğu açan karar.
    expect(decisionActiveCount(withState({ category: 'residential' }))).toBe(1)

    const state = withState({
      category: 'residential',
      transactions: ['rent'],
      rentPrice: { min: 8_500, max: 74_000 },
      categoryFilters: { rooms: ['2+0', '2+1'] },
    })
    // Temel blok sayılır: emlak türü + işlem türü + tutar. Oda artık akışta
    // kendi bölümünde yaşar, temel bloğun sayacına girmez.
    expect(decisionActiveCount(state)).toBe(3)
  })
})
