import { getCategoryStockPhoto } from '@/features/listings/data/listing-photos'
import type { EvidenceValue } from '../domain/evidence'
import type {
  LandListingDetail,
  ListingMediaPreview,
  VerificationRow,
} from '../domain/listing-detail-types'

const CUTOFF = '2026-07-24T09:12:00.000Z'

/**
 * Arsa kategorisinin temsili karesi — kaynak arama tarafıyla ortaktır.
 * Bu defterde gerçek ilan fotoğrafı yoktur; kare taşınmazın kendisini
 * göstermez ve bu görünüm katmanında yazılı olarak söylenir.
 */
function landPhoto(index: number, alt: string): ListingMediaPreview {
  return getCategoryStockPhoto('land', index, alt)
}

/**
 * Not: buradaki `freshness` değerleri yalnız **varsayılandır**. Tek doğru
 * kaynak tarihlerdir; `loadListingDetail` her kanıt değerinin güncelliğini
 * `now`'a göre `freshnessFrom` ile yeniden hesaplar ve bu alanları ezer.
 * Elle yazılan bir bayrak bir yıl sonra da "güncel" demeye devam ederdi.
 *
 * Tek istisna `freshnessPolicy: 'durable'` işaretli değerlerdir: onlar
 * takvimle değil olayla değişir, burada yazan güncellik korunur. İşaret
 * gerekçesiyle birlikte konur; varsayılan her zaman zamana duyarlıdır.
 */

/** EİDS satırında kapsam notu zorunludur — metin repo genelinde tek kaynaktır. */
export const EIDS_SCOPE_NOTE =
  'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.'

function official<T>(value: T, over: Partial<EvidenceValue<T>> = {}): EvidenceValue<T> {
  return {
    value,
    status: 'verified',
    freshness: 'current',
    source: { id: 'megsis', name: 'TKGM MEGSİS', sourceClass: 'official', authority: 'Tapu ve Kadastro Genel Müdürlüğü' },
    retrievedAt: CUTOFF,
    scope: 'parcel',
    ...over,
  }
}

function declared<T>(value: T, over: Partial<EvidenceValue<T>> = {}): EvidenceValue<T> {
  return {
    value,
    status: 'declared',
    freshness: 'current',
    source: { id: 'advertiser', name: 'İlan sahibi', sourceClass: 'advertiser_declared' },
    retrievedAt: '2026-04-12T00:00:00.000Z',
    effectiveAt: '2026-04-12T00:00:00.000Z',
    scope: 'property',
    ...over,
  }
}

function derived<T>(value: T, over: Partial<EvidenceValue<T>> = {}): EvidenceValue<T> {
  return {
    value,
    status: 'derived',
    freshness: 'current',
    source: { id: 'platform', name: 'ArsaPazar türevi', sourceClass: 'platform_derived' },
    retrievedAt: CUTOFF,
    scope: 'parcel',
    ...over,
  }
}

function unavailable<T>(sourceName: string, reason: EvidenceValue<T>['unavailableReason']): EvidenceValue<T> {
  return {
    status: 'unavailable',
    unavailableReason: reason,
    freshness: 'unknown',
    source: { id: sourceName.toLowerCase(), name: sourceName, sourceClass: 'unknown' },
    retrievedAt: CUTOFF,
    scope: 'property',
  }
}

const VERIFICATION: VerificationRow[] = [
  {
    id: 'advertiser_identity',
    title: 'İlan veren kimliği doğrulandı',
    state: 'positive',
    source: 'ArsaPazar kimlik kontrolü',
    retrievedAt: '2026-04-11T00:00:00.000Z',
  },
  {
    id: 'listing_authorisation',
    title: 'İlan verme yetkisi EİDS ile doğrulandı',
    scopeNote: EIDS_SCOPE_NOTE,
    state: 'positive',
    source: 'Ticaret Bakanlığı EİDS',
    retrievedAt: CUTOFF,
  },
  {
    id: 'agency_licence',
    title: 'Emlak işletmesinin TTBS yetki belgesi geçerli',
    state: 'positive',
    source: 'TTBS 4820/1173',
    validUntil: '2026-12-31T00:00:00.000Z',
  },
  {
    id: 'parcel_match',
    title: 'İlan yüzölçümü parsel kaydıyla eşleşmedi',
    scopeNote: 'Beyan 4.850 m² · MEGSİS 4.712 m² · fark 138 m²',
    state: 'negative',
    source: 'TKGM MEGSİS',
    retrievedAt: CUTOFF,
  },
  {
    id: 'planning_document',
    title: 'İmar durum belgesi platforma sunulmadı',
    scopeNote: 'Plan durumu yalnız e-Plan sorgusundan biliniyor.',
    state: 'unknown',
    source: '—',
  },
  {
    id: 'platform_moderation',
    title: 'Platform moderasyonu tamamlandı',
    scopeNote: 'Kapsam: yasak içerik ve yinelenen ilan kontrolü. İçerik doğruluğu kapsam dışıdır.',
    state: 'positive',
    source: 'ArsaPazar moderasyon',
    retrievedAt: '2026-04-14T00:00:00.000Z',
  },
  {
    id: 'media_provenance',
    title: '24 fotoğrafın 3ünde düzenleme izi bulundu',
    scopeNote: 'Content Credentials bulunamadı; bu, görsellerin sahte olduğu anlamına gelmez.',
    state: 'unknown',
    source: 'ArsaPazar medya taraması',
    retrievedAt: '2026-04-14T00:00:00.000Z',
  },
]

export const OREN_LAND_LISTING: LandListingDetail = {
  kind: 'land',
  id: 'arsa-214-7',
  title: "Ören'de 4.850 m² tarla — denize 1,4 km, imar planı askıda",
  lifecycle: 'active',
  listingNumber: '2026-114-8207',
  publishedAt: '2026-04-12T00:00:00.000Z',
  updatedAt: '2026-07-21T00:00:00.000Z',
  evidenceCutoff: CUTOFF,
  location: { city: 'Muğla', district: 'Milas', neighbourhood: 'Ören' },
  price: { amount: 8_750_000, currency: 'TRY', declaredArea: 4850, unitPrice: 1804 },
  verification: VERIFICATION,
  parcel: {
    // Kadastral kimlik takvimle bayatlamaz: "214 ada / 7 parsel" 2026'da 2019'daki
    // kadar doğrudur. Numara yalnız yeniden ölçüm, ifraz veya tevhitle — yani bir
    // olayla — değişir. Tescil tarihine 90/180 günlük eşik uygulamak parselin
    // kimliğini şüpheli göstermek olurdu.
    blockParcel: official('214 ada / 7 parsel', {
      effectiveAt: '2019-02-03T00:00:00.000Z',
      freshnessPolicy: 'durable',
    }),
    area: official(4712, {
      status: 'conflicting',
      conflicts: [{ sourceId: 'advertiser', value: 4850, effectiveAt: '2026-04-12T00:00:00.000Z' }],
      knownLimitations: ['Birim fiyat beyan edilen alana göre hesaplandı.'],
    }),
    locationPrecision: derived('Pin parsel geometrisinin içinde · ±5 m', {
      method: 'Geometri içi nokta testi',
      geographicResolution: '±5 m',
    }),
    distanceToSea: derived('1,4 km kuş uçuşu', {
      method: 'Kıyı çizgisine en kısa mesafe',
      knownLimitations: ['Araçla ulaşım mesafesi yol ağı nedeniyle daha uzundur.'],
    }),
  },
  planning: {
    titleDeedType: declared('Tarla'),
    shared: { isShared: true, share: '2/4' },
    planStatus: {
      value: '1/1000 Uygulama İmar Planı — askıda, itirazlar değerlendiriliyor',
      status: 'verified',
      freshness: 'current',
      source: { id: 'eplan', name: 'Milas Belediyesi · e-Plan', sourceClass: 'official' },
      retrievedAt: CUTOFF,
      scope: 'parcel',
      knownLimitations: ['Askıdaki plan kesinleşmiş hak doğurmaz; itiraz, revizyon veya iptalle değişebilir.'],
    },
    landUse: {
      value: 'Turizm Tesis Alanı (öneri) · TAKS 0,20 · KAKS 0,40 · maks. 2 kat',
      status: 'declared',
      // Belge tarihi kesitten ~8 ay eski: `freshnessFrom` eşiğine (180 gün)
      // göre bayat. Güncellik kökenden bağımsızdır — plan notu resmî belge
      // olsa da "Güncel değil" etiketiyle görünür.
      freshness: 'stale',
      source: { id: 'plan-note', name: 'Plan notu belgesi', sourceClass: 'verified_document' },
      retrievedAt: CUTOFF,
      effectiveAt: '2025-11-19T00:00:00.000Z',
      scope: 'neighborhood',
      knownLimitations: ['Kapsam plan bölgesidir, parsel bazlı değildir.'],
    },
    encumbrance: unavailable('TAKBİS', 'not_published'),
    planNumber: 'MİL-2026/14',
    planScale: '1/1000',
  },
  access: {
    legalRoadAccess: unavailable('Kadastro Müdürlüğü', 'not_published'),
    physicalAccess: derived('Stabilize yol — asfalt bağlantıya ~340 m', {
      source: { id: 'imagery', name: 'Uydu görüntüsü yorumu', sourceClass: 'platform_derived' },
      effectiveAt: '2026-06-12T00:00:00.000Z',
      geographicResolution: '±25 m',
    }),
    utilities: [
      { id: 'electricity', label: 'Elektrik', value: derived('Yolda — parselde bağlantı yok, ~180 m', { geographicResolution: '±25 m' }) },
      { id: 'water', label: 'Su', value: declared('Köy şebekesi yolda — parselde abonelik yok') },
      { id: 'sewage', label: 'Kanalizasyon', value: declared('Yok — fosseptik gerekli') },
    ],
  },
  terrain: {
    slope: derived('Ortalama %12 · min %4 · maks %19', {
      method: '10 m çözünürlüklü sayısal yükseklik modeli',
      geographicResolution: '10 m hücre',
      knownLimitations: ['Parsel içi mikro topografya ve zemin yapısı için jeoteknik etüt gerekir.'],
    }),
    aspect: derived('Güney-güneybatı · kot 84–142 m'),
    hazards: [
      {
        id: 'earthquake',
        label: 'Bölgesel deprem tehlike göstergesi',
        scopeNote: 'Tehlike risk değildir. Risk için maruziyet, kırılganlık ve yerel zemin koşulları ayrıca incelenir.',
        value: {
          value: 'PGA 0,32 g — 50 yılda %10 aşılma olasılığı',
          status: 'verified',
          freshness: 'current',
          // Haritanın 2018 sürümü yürürlükteki ulusal standarttır; yeni bir
          // sürüm yayımlanana kadar geçerliliğini korur. Yayın tarihine takvim
          // eşiği uygulamak "resmî deprem tehlike değeri güncel olmayabilir"
          // demek olurdu — dayanağı olmayan, ters yönde bir iddia.
          freshnessPolicy: 'durable',
          source: { id: 'afad', name: 'AFAD Türkiye Deprem Tehlike Haritası', sourceClass: 'official' },
          retrievedAt: CUTOFF,
          effectiveAt: '2018-01-18T00:00:00.000Z',
          scope: 'district',
          geographicResolution: 'bölgesel',
        },
      },
      {
        id: 'wildfire',
        label: 'Orman yangını duyarlılık göstergesi',
        scopeNote: 'Kapsam orman işletme şefliği ölçeğindedir; parsel bazlı hüküm vermez.',
        value: {
          value: 'Yüksek sınıf — çevrede kızılçam örtüsü',
          status: 'verified',
          freshness: 'current',
          source: { id: 'ogm', name: 'OGM duyarlılık sınıfı', sourceClass: 'official' },
          retrievedAt: CUTOFF,
          scope: 'district',
        },
      },
      {
        id: 'flood',
        label: 'Taşkın göstergesi',
        scopeNote: 'Katmanın bulunmaması taşkın tehlikesi olmadığı anlamına gelmez.',
        value: unavailable('Havza taşkın haritası', 'not_published'),
      },
    ],
  },
  market: {
    comparableMedianUnitPrice: derived(1980, {
      source: { id: 'market', name: 'ArsaPazar emsal kesiti', sourceClass: 'platform_derived' },
      method: '3 km yarıçap · son 12 ay · 2 aykırı değer çıkarıldı',
      knownLimitations: ['Yalnız ilan fiyatıdır; gerçekleşmiş işlem ve ekspertiz kapsam dışıdır.'],
    }),
    comparableCount: 14,
    valuation: {
      kind: 'insufficient',
      reason: 'Bölgede gerçekleşmiş işlem verisi yok ve emsal örneklemi modelin eşiğinin altında.',
    },
  },
  documents: [
    { id: 'deed-copy', label: 'Tapu kaydı örneği', state: 'available', critical: false, issuedAt: '2026-04-12T00:00:00.000Z' },
    { id: 'survey-sketch', label: 'Aplikasyon krokisi', state: 'available', critical: false, issuedAt: '2026-05-04T00:00:00.000Z', authority: 'LİHKAB' },
    { id: 'zoning-status', label: 'İmar durum belgesi', state: 'missing', critical: true, authority: 'Milas Belediyesi İmar Müdürlüğü' },
    { id: 'road-access', label: 'Yol erişim / irtifak belgesi', state: 'missing', critical: true, authority: 'Kadastro Müdürlüğü' },
    { id: 'encumbrance', label: 'Güncel takyidat kaydı', state: 'missing', critical: true, authority: 'TAKBİS' },
  ],
  seller: {
    name: 'Ören Emlak',
    type: 'agency',
    licence: official('TTBS 4820/1173', {
      source: { id: 'ttbs', name: 'Ticaret Bakanlığı TTBS', sourceClass: 'official' },
      validUntil: '2026-12-31T00:00:00.000Z',
      scope: 'property',
    }),
    respondsInHours: 4,
    activeListings: 42,
    memberSince: '2023-05-01T00:00:00.000Z',
  },
  // Fotoğraf ve drone kalemleri temsili (stok) kare taşır; kaynak arama
  // tarafıyla aynıdır ve görünüm katmanı bunu görünür bir cümleyle söyler.
  // Parsel görünümü ve plan notu **fotoğraf değildir** — onlara temsili bir
  // kare iliştirilmez, döküm satırı olarak durur.
  media: [
    { id: 'parcel', kind: 'parcel', label: 'Parsel görünümü', capturedAt: CUTOFF },
    {
      id: 'photo-1',
      kind: 'photo',
      label: 'Parselden deniz yönü',
      capturedAt: '2026-04-08T00:00:00.000Z',
      representative: landPhoto(0, 'Arsa ilanı için temsili fotoğraf — parselden deniz yönü'),
    },
    {
      id: 'photo-2',
      kind: 'photo',
      label: 'Stabilize yol girişi',
      capturedAt: '2026-04-08T00:00:00.000Z',
      representative: landPhoto(1, 'Arsa ilanı için temsili fotoğraf — stabilize yol girişi'),
    },
    {
      id: 'drone-1',
      kind: 'drone',
      label: 'Drone çekimi',
      capturedAt: '2026-04-08T00:00:00.000Z',
      representative: landPhoto(2, 'Arsa ilanı için temsili fotoğraf — havadan görünüm'),
    },
    { id: 'plan-note', kind: 'plan', label: 'Plan notu (PDF)', capturedAt: '2025-11-19T00:00:00.000Z' },
  ],
}
