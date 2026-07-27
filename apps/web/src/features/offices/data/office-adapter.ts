import type { OfficeSearchState } from '../domain/office-search-state'
import type {
  OfficeEvidenceSource,
  OfficeMatchEvidence,
  OfficeSummary,
} from '../domain/office-types'

export type {
  OfficeEvidenceSource,
  OfficeMatchEvidence,
  OfficeSummary,
} from '../domain/office-types'

export interface OfficeSearchResponse {
  items: OfficeSummary[]
  total: number
  page: number
  pageCount: number
  facets: {
    cities: FacetBucket[]
    expertise: FacetBucket[]
  }
}

export interface FacetBucket {
  value: string
  count: number
}

export interface OfficeSearchRequest {
  state: OfficeSearchState
  pageSize: number
}

function evidence(
  label: string,
  value: string,
  source: OfficeEvidenceSource,
): OfficeMatchEvidence {
  return { label, value, source }
}

const FIXTURES: OfficeSummary[] = [
  {
    id: 'urla-arsa-danismanlik',
    name: 'Urla Arsa Danışmanlık',
    city: 'izmir',
    districts: ['urla', 'çeşme', 'seferihisar'],
    tagline: 'Arsa satışı ve imar araştırmasında yerel ekip.',
    verified: true,
    verifiedBy: 'Yetki belgesi ve ofis profili',
    expertise: ['land', 'zoning', 'valuation'],
    languages: ['Türkçe', 'English'],
    activeListings: 42,
    consultants: 8,
    rating: 4.9,
    reviewCount: 128,
    responseMinutes: 18,
    lastActiveLabel: '8 dk önce aktifti',
    evidence: [
      evidence('Urla arsa portföyü', '42 aktif ilan', 'listing-data'),
      evidence('İmar danışmanlığı', 'Profilde doğrulandı', 'office-profile'),
      evidence('Müşteri değerlendirmesi', '128 doğrulanmış yorum', 'review'),
    ],
    intents: ['sell', 'buy', 'valuate'],
    propertyTypes: ['land'],
  },
  {
    id: 'egekent-konut',
    name: 'Egekent Konut Ofisi',
    city: 'izmir',
    districts: ['karşıyaka', 'bayraklı', 'bornova'],
    tagline: 'Şehir içi konut alım ve kiralamada veri odaklı eşleşme.',
    verified: true,
    verifiedBy: 'Yetki belgesi doğrulandı',
    expertise: ['residential', 'buy', 'rent'],
    languages: ['Türkçe', 'English', 'Deutsch'],
    activeListings: 67,
    consultants: 14,
    rating: 4.8,
    reviewCount: 204,
    responseMinutes: 11,
    lastActiveLabel: 'Şimdi aktif',
    evidence: [
      evidence('Konut portföyü', '67 aktif ilan', 'listing-data'),
      evidence('Son işlem', '34 doğrulanmış işlem', 'verified-transaction'),
    ],
    intents: ['buy', 'rent', 'sell'],
    propertyTypes: ['residential'],
  },
  {
    id: 'alsancak-ticari',
    name: 'Alsancak Ticari Gayrimenkul',
    city: 'izmir',
    districts: ['konak', 'bayraklı', 'bornova'],
    tagline: 'Ofis, mağaza ve yatırım gayrimenkullerinde kurumsal çözüm.',
    verified: true,
    verifiedBy: 'Ofis profili doğrulandı',
    expertise: ['commercial', 'investment', 'valuation'],
    languages: ['Türkçe', 'English'],
    activeListings: 31,
    consultants: 7,
    rating: 4.7,
    reviewCount: 87,
    responseMinutes: 26,
    lastActiveLabel: '22 dk önce aktifti',
    evidence: [
      evidence('Ticari portföy', '31 aktif ilan', 'listing-data'),
      evidence('Yatırım uzmanlığı', 'Profil beyanı', 'office-profile'),
    ],
    intents: ['buy', 'sell', 'rent', 'valuate'],
    propertyTypes: ['commercial', 'building'],
  },
  {
    id: 'cesme-mavi-rota',
    name: 'Mavi Rota Çeşme',
    city: 'izmir',
    districts: ['çeşme', 'alaçatı', 'urla'],
    tagline: 'Sezonluk konut ve turistik tesis uzmanlığı.',
    verified: false,
    expertise: ['touristic', 'rent', 'residential'],
    languages: ['Türkçe', 'English'],
    activeListings: 24,
    consultants: 5,
    rating: 4.5,
    reviewCount: 49,
    responseMinutes: 37,
    lastActiveLabel: '1 sa önce aktifti',
    evidence: [
      evidence('Sezonluk portföy', '24 aktif ilan', 'listing-data'),
      evidence('Kullanıcı yorumları', '49 yorum', 'review'),
    ],
    intents: ['rent', 'buy', 'sell'],
    propertyTypes: ['touristic', 'residential'],
  },
  {
    id: 'kadikoy-anahtar',
    name: 'Kadıköy Anahtar Ofis',
    city: 'istanbul',
    districts: ['kadıköy', 'üsküdar', 'ataşehir'],
    tagline: 'Anadolu Yakası konut piyasasında deneyimli danışmanlar.',
    verified: true,
    verifiedBy: 'Yetki belgesi doğrulandı',
    expertise: ['residential', 'rent', 'sell'],
    languages: ['Türkçe', 'English', 'Русский'],
    activeListings: 83,
    consultants: 19,
    rating: 4.8,
    reviewCount: 312,
    responseMinutes: 9,
    lastActiveLabel: 'Şimdi aktif',
    evidence: [
      evidence('Konut portföyü', '83 aktif ilan', 'listing-data'),
      evidence('Hizmet geçmişi', '312 yorum', 'review'),
    ],
    intents: ['buy', 'rent', 'sell'],
    propertyTypes: ['residential'],
  },
  {
    id: 'levent-kurumsal',
    name: 'Levent Kurumsal Emlak',
    city: 'istanbul',
    districts: ['beşiktaş', 'şişli', 'sarıyer'],
    tagline: 'Kurumsal kiralama ve ticari yatırımlarda uzman ekip.',
    verified: true,
    verifiedBy: 'Yetki belgesi ve işlem verisi',
    expertise: ['commercial', 'building', 'investment'],
    languages: ['Türkçe', 'English', 'Français'],
    activeListings: 46,
    consultants: 11,
    rating: 4.9,
    reviewCount: 151,
    responseMinutes: 14,
    lastActiveLabel: '4 dk önce aktifti',
    evidence: [
      evidence('Ticari işlem', '18 doğrulanmış işlem', 'verified-transaction'),
      evidence('Kurumsal portföy', '46 aktif ilan', 'listing-data'),
    ],
    intents: ['buy', 'rent', 'sell', 'valuate'],
    propertyTypes: ['commercial', 'building'],
  },
  {
    id: 'bosporus-yatirim',
    name: 'Bosporus Yatırım Ofisi',
    city: 'istanbul',
    districts: ['beyoğlu', 'fatih', 'eyüpsultan'],
    tagline: 'Yatırım amaçlı bina ve dönüşüm projeleri için danışmanlık.',
    verified: false,
    expertise: ['investment', 'building', 'valuation'],
    languages: ['Türkçe', 'English', 'العربية'],
    activeListings: 18,
    consultants: 6,
    rating: 4.4,
    reviewCount: 36,
    responseMinutes: 44,
    lastActiveLabel: '2 sa önce aktifti',
    evidence: [
      evidence('Yatırım portföyü', '18 aktif ilan', 'listing-data'),
      evidence('Profil bilgisi', 'Bina yatırımı uzmanlığı', 'office-profile'),
    ],
    intents: ['buy', 'sell', 'valuate'],
    propertyTypes: ['building', 'commercial'],
  },
  {
    id: 'beylikduzu-yasam',
    name: 'Beylikdüzü Yaşam Emlak',
    city: 'istanbul',
    districts: ['beylikdüzü', 'esenyurt', 'avcılar'],
    tagline: 'Yeni yaşam alanlarında alım, satım ve kiralama desteği.',
    verified: true,
    verifiedBy: 'Ofis profili doğrulandı',
    expertise: ['residential', 'buy', 'sell'],
    languages: ['Türkçe', 'English'],
    activeListings: 58,
    consultants: 12,
    rating: 4.6,
    reviewCount: 94,
    responseMinutes: 21,
    lastActiveLabel: '16 dk önce aktifti',
    evidence: [
      evidence('Bölge portföyü', '58 aktif ilan', 'listing-data'),
      evidence('Müşteri değerlendirmesi', '94 yorum', 'review'),
    ],
    intents: ['buy', 'rent', 'sell'],
    propertyTypes: ['residential'],
  },
  {
    id: 'cankaya-deger',
    name: 'Çankaya Değer Ofisi',
    city: 'ankara',
    districts: ['çankaya', 'yenimahalle', 'gölbaşı'],
    tagline: 'Konut değerleme ve satış stratejisinde uzman danışmanlık.',
    verified: true,
    verifiedBy: 'Yetki belgesi ve işlem verisi',
    expertise: ['valuation', 'residential', 'sell'],
    languages: ['Türkçe', 'English'],
    activeListings: 52,
    consultants: 10,
    rating: 4.8,
    reviewCount: 173,
    responseMinutes: 16,
    lastActiveLabel: '11 dk önce aktifti',
    evidence: [
      evidence('Değerleme işlemi', '29 doğrulanmış işlem', 'verified-transaction'),
      evidence('Konut portföyü', '52 aktif ilan', 'listing-data'),
    ],
    intents: ['sell', 'buy', 'valuate'],
    propertyTypes: ['residential'],
  },
  {
    id: 'golbasi-toprak',
    name: 'Gölbaşı Toprak Gayrimenkul',
    city: 'ankara',
    districts: ['gölbaşı', 'çankaya', 'pursaklar'],
    tagline: 'Tarla, arsa ve proje geliştirme süreçlerinde yerel uzman.',
    verified: true,
    verifiedBy: 'Yetki belgesi doğrulandı',
    expertise: ['land', 'zoning', 'investment'],
    languages: ['Türkçe'],
    activeListings: 39,
    consultants: 6,
    rating: 4.7,
    reviewCount: 76,
    responseMinutes: 28,
    lastActiveLabel: '35 dk önce aktifti',
    evidence: [
      evidence('Arsa portföyü', '39 aktif ilan', 'listing-data'),
      evidence('İmar danışmanlığı', 'Profilde doğrulandı', 'office-profile'),
    ],
    intents: ['buy', 'sell', 'valuate'],
    propertyTypes: ['land'],
  },
  {
    id: 'kizilay-kiralama',
    name: 'Kızılay Kiralama Merkezi',
    city: 'ankara',
    districts: ['çankaya', 'mamak', 'keçiören'],
    tagline: 'Kiralık konut ve ofiste hızlı yerel eşleşme.',
    verified: false,
    expertise: ['rent', 'residential', 'commercial'],
    languages: ['Türkçe', 'English'],
    activeListings: 71,
    consultants: 13,
    rating: 4.3,
    reviewCount: 68,
    responseMinutes: 33,
    lastActiveLabel: '48 dk önce aktifti',
    evidence: [
      evidence('Kiralık portföy', '71 aktif ilan', 'listing-data'),
      evidence('Kullanıcı yorumları', '68 yorum', 'review'),
    ],
    intents: ['rent'],
    propertyTypes: ['residential', 'commercial'],
  },
  {
    id: 'nilufer-yasam',
    name: 'Nilüfer Yaşam Ofisi',
    city: 'bursa',
    districts: ['nilüfer', 'osmangazi', 'mudanya'],
    tagline: 'Aile konutu ve yeni proje seçiminde danışmanlık.',
    verified: true,
    verifiedBy: 'Ofis profili doğrulandı',
    expertise: ['residential', 'buy', 'valuation'],
    languages: ['Türkçe', 'English'],
    activeListings: 48,
    consultants: 9,
    rating: 4.7,
    reviewCount: 115,
    responseMinutes: 19,
    lastActiveLabel: '14 dk önce aktifti',
    evidence: [
      evidence('Konut portföyü', '48 aktif ilan', 'listing-data'),
      evidence('Müşteri değerlendirmesi', '115 yorum', 'review'),
    ],
    intents: ['buy', 'rent', 'sell', 'valuate'],
    propertyTypes: ['residential'],
  },
  {
    id: 'mudanya-sahil',
    name: 'Mudanya Sahil Emlak',
    city: 'bursa',
    districts: ['mudanya', 'gemlik', 'nilüfer'],
    tagline: 'Sahil konutları ve yazlık portföylerinde yerel ekip.',
    verified: false,
    expertise: ['residential', 'touristic', 'rent'],
    languages: ['Türkçe'],
    activeListings: 22,
    consultants: 4,
    rating: 4.4,
    reviewCount: 41,
    responseMinutes: 41,
    lastActiveLabel: '3 sa önce aktifti',
    evidence: [
      evidence('Sahil portföyü', '22 aktif ilan', 'listing-data'),
      evidence('Profil bilgisi', 'Yerel uzmanlık', 'office-profile'),
    ],
    intents: ['buy', 'rent', 'sell'],
    propertyTypes: ['residential', 'touristic'],
  },
  {
    id: 'bodrum-nokta',
    name: 'Bodrum Nokta Danışmanlık',
    city: 'muğla',
    districts: ['bodrum', 'milas', 'datça'],
    tagline: 'Lüks konut, turizm ve devremülk portföylerinde uzmanlık.',
    verified: true,
    verifiedBy: 'Yetki belgesi ve işlem verisi',
    expertise: ['touristic', 'timeshare', 'residential'],
    languages: ['Türkçe', 'English', 'Deutsch'],
    activeListings: 55,
    consultants: 10,
    rating: 4.9,
    reviewCount: 188,
    responseMinutes: 13,
    lastActiveLabel: '6 dk önce aktifti',
    evidence: [
      evidence('Turizm portföyü', '55 aktif ilan', 'listing-data'),
      evidence('Son işlem', '21 doğrulanmış işlem', 'verified-transaction'),
    ],
    intents: ['buy', 'rent', 'sell', 'valuate'],
    propertyTypes: ['touristic', 'timeshare', 'residential'],
  },
  {
    id: 'fethiye-gelecek',
    name: 'Fethiye Gelecek Ofisi',
    city: 'muğla',
    districts: ['fethiye', 'sey dikemer', 'marmaris'],
    tagline: 'Yabancı alıcılar ve yazlık yatırımcılar için yerel rehber.',
    verified: true,
    verifiedBy: 'Ofis profili doğrulandı',
    expertise: ['touristic', 'investment', 'land'],
    languages: ['Türkçe', 'English', 'Русский'],
    activeListings: 37,
    consultants: 7,
    rating: 4.6,
    reviewCount: 82,
    responseMinutes: 24,
    lastActiveLabel: '28 dk önce aktifti',
    evidence: [
      evidence('Yatırım portföyü', '37 aktif ilan', 'listing-data'),
      evidence('Dil hizmeti', 'Üç dil profilinde doğrulandı', 'office-profile'),
    ],
    intents: ['buy', 'sell', 'rent'],
    propertyTypes: ['touristic', 'land', 'residential'],
  },
  {
    id: 'kaleici-turizm',
    name: 'Kaleiçi Turizm Gayrimenkul',
    city: 'antalya',
    districts: ['muratpaşa', 'konyaaltı', 'kaş'],
    tagline: 'Turistik tesis ve sezonluk kiralamada uçtan uca danışmanlık.',
    verified: true,
    verifiedBy: 'Yetki belgesi doğrulandı',
    expertise: ['touristic', 'commercial', 'rent'],
    languages: ['Türkçe', 'English', 'Deutsch'],
    activeListings: 44,
    consultants: 8,
    rating: 4.8,
    reviewCount: 139,
    responseMinutes: 17,
    lastActiveLabel: '9 dk önce aktifti',
    evidence: [
      evidence('Turistik tesis portföyü', '44 aktif ilan', 'listing-data'),
      evidence('Müşteri değerlendirmesi', '139 yorum', 'review'),
    ],
    intents: ['buy', 'rent', 'sell'],
    propertyTypes: ['touristic', 'commercial'],
  },
  {
    id: 'konyaalti-evim',
    name: 'Konyaaltı Evim Ofisi',
    city: 'antalya',
    districts: ['konyaaltı', 'kepez', 'döşemealtı'],
    tagline: 'Konut ve yatırım alımlarında şeffaf süreç yönetimi.',
    verified: false,
    expertise: ['residential', 'investment', 'buy'],
    languages: ['Türkçe', 'English'],
    activeListings: 63,
    consultants: 15,
    rating: 4.5,
    reviewCount: 73,
    responseMinutes: 35,
    lastActiveLabel: '1 sa önce aktifti',
    evidence: [
      evidence('Konut portföyü', '63 aktif ilan', 'listing-data'),
      evidence('Profil bilgisi', 'Yatırım danışmanlığı', 'office-profile'),
    ],
    intents: ['buy', 'rent', 'sell'],
    propertyTypes: ['residential'],
  },
  {
    id: 'eskisehir-anahtar',
    name: 'Eskişehir Anahtar Gayrimenkul',
    city: 'eskişehir',
    districts: ['tepebaşı', 'odunpazarı'],
    tagline: 'Öğrenci konutu ve merkez yatırım fırsatlarında deneyimli ekip.',
    verified: true,
    verifiedBy: 'Ofis profili doğrulandı',
    expertise: ['residential', 'rent', 'investment'],
    languages: ['Türkçe', 'English'],
    activeListings: 34,
    consultants: 6,
    rating: 4.7,
    reviewCount: 66,
    responseMinutes: 22,
    lastActiveLabel: '18 dk önce aktifti',
    evidence: [
      evidence('Kiralık portföy', '34 aktif ilan', 'listing-data'),
      evidence('Müşteri değerlendirmesi', '66 yorum', 'review'),
    ],
    intents: ['buy', 'rent', 'sell'],
    propertyTypes: ['residential'],
  },
]

export const OFFICE_FIXTURES: readonly OfficeSummary[] = FIXTURES

function normalized(value: string): string {
  return value.toLocaleLowerCase('tr-TR')
}

function matchesState(office: OfficeSummary, state: OfficeSearchState): boolean {
  const queryTarget = normalized(
    [
      office.name,
      office.city,
      ...office.districts,
      office.tagline,
      ...office.expertise,
      ...office.languages,
    ].join(' '),
  )

  if (state.query && !queryTarget.includes(normalized(state.query))) return false
  if (state.intent !== 'all' && !office.intents.includes(state.intent)) return false
  if (state.propertyType && !office.propertyTypes.includes(state.propertyType)) {
    return false
  }
  if (state.city && office.city !== state.city) return false
  if (state.district && !office.districts.includes(state.district)) return false
  if (
    state.expertise.length > 0 &&
    !state.expertise.every((item) => office.expertise.includes(item))
  ) {
    return false
  }
  if (state.verifiedOnly && !office.verified) return false
  if (state.maxResponseMinutes && office.responseMinutes > state.maxResponseMinutes) {
    return false
  }
  if (state.language && !office.languages.includes(state.language)) return false
  if (state.minConsultants && office.consultants < state.minConsultants) return false
  if (state.minActiveListings && office.activeListings < state.minActiveListings) return false
  if (state.transactionExperience && !office.intents.includes(state.transactionExperience)) return false

  return true
}

function matchPriority(office: OfficeSummary): number {
  return (
    (office.verified ? 1_000 : 0) +
    office.rating * 100 +
    office.activeListings -
    office.responseMinutes
  )
}

function sortOffices(items: OfficeSummary[], state: OfficeSearchState): OfficeSummary[] {
  return [...items].sort((left, right) => {
    if (state.sort === 'response') return left.responseMinutes - right.responseMinutes
    if (state.sort === 'portfolio') return right.activeListings - left.activeListings
    if (state.sort === 'rating') return right.rating - left.rating

    return matchPriority(right) - matchPriority(left)
  })
}

function createFacet(
  values: string[],
  itemValues: (office: OfficeSummary) => string[],
): FacetBucket[] {
  return values
    .map((value) => ({
      value,
      count: FIXTURES.filter((office) => itemValues(office).includes(value)).length,
    }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
}

function createFacets(items: OfficeSummary[]): OfficeSearchResponse['facets'] {
  const cities = Array.from(new Set(items.map((office) => office.city)))
  const expertise = Array.from(
    new Set(items.flatMap((office) => office.expertise)),
  )

  return {
    cities: createFacet(cities, (office) => [office.city]),
    expertise: createFacet(expertise, (office) => office.expertise),
  }
}

export async function searchOffices({
  state,
  pageSize,
}: OfficeSearchRequest): Promise<OfficeSearchResponse> {
  const filtered = FIXTURES.filter((office) => matchesState(office, state))
  const ordered = sortOffices(filtered, state)
  const safePageSize = Math.max(1, pageSize)
  const pageCount = Math.max(1, Math.ceil(ordered.length / safePageSize))
  const page = Math.min(Math.max(1, state.page), pageCount)
  const start = (page - 1) * safePageSize

  return {
    items: ordered.slice(start, start + safePageSize),
    total: ordered.length,
    page,
    pageCount,
    facets: createFacets(filtered),
  }
}
