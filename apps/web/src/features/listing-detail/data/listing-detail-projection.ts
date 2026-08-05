import type { ListingSummary } from '@/features/listings/data/listing-adapter'
import {
  attributeLabel,
  attributeValueLabel,
  CATEGORY_LABELS,
  placeLabel,
  TRANSACTION_LABELS,
} from '@/features/listings/data/listing-attributes'
import {
  getCategoryStockPhoto,
  getRepresentativeListingImage,
  stockPhotoCount,
} from '@/features/listings/data/listing-photos'
import type { EvidenceValue, UnavailableReason } from '../domain/evidence'
import type {
  DeclaredAttribute,
  GenericListingDetail,
  ListingMediaItem,
  ListingQna,
  ListingQnaAuthor,
  ListingQnaEntry,
  VerificationRow,
} from '../domain/listing-detail-types'
import { EIDS_SCOPE_NOTE } from './listing-detail-fixtures'

/**
 * Arama sonucundan ilan detayına yansıtma.
 *
 * Arama kaydı (`ListingSummary`) bir kanıt defteri değildir: tapu, imar,
 * parsel, tehlike ve emsal bilgisi **taşımaz**. Bu modül yalnız gerçekten
 * var olanı taşır ve sayfanın sorduğu diğer her şeyi cevapsız — ama nedeni
 * yazılı — bırakır. Referans defterin (`OREN_LAND_LISTING`) hiçbir değeri
 * buraya kopyalanmaz.
 *
 * Determinizm: zaman yalnız `now` parametresinden girer; `Math.random()` ve
 * argümansız `new Date()` kullanılmaz. Aynı `now` her zaman aynı tarihleri
 * üretir.
 */

const DAY_MS = 86_400_000

/** İlan sahibi beyanının ortak künyesi. */
function declared(value: string, declaredAt: string): EvidenceValue<string> {
  return {
    value,
    status: 'declared',
    freshness: 'current',
    source: { id: 'advertiser', name: 'İlan sahibi', sourceClass: 'advertiser_declared' },
    retrievedAt: declaredAt,
    effectiveAt: declaredAt,
    scope: 'property',
    knownLimitations: [
      'İlan sahibinin beyanıdır; platform bu değeri resmî bir kayıtla karşılaştırmadı.',
    ],
  }
}

/** Sorusu sorulan ama cevabı olmayan alanın künyesi. */
function unanswered(
  sourceId: string,
  sourceName: string,
  reason: UnavailableReason,
  retrievedAt: string,
): EvidenceValue<string> {
  return {
    status: 'unavailable',
    unavailableReason: reason,
    freshness: 'unknown',
    source: { id: sourceId, name: sourceName, sourceClass: 'unknown' },
    retrievedAt,
    scope: 'property',
  }
}

/**
 * EİDS satırı — `verified` bayrağının **tek** karşılığı.
 *
 * Olumlu hâl repo genelinde tek izinli cümledir ve kapsam notuyla birlikte
 * gelir. Olumsuz hâl bir olumsuzluk değil, bilinmezliktir: sorgunun kayıtta
 * bulunmaması yetkinin olmadığı anlamına gelmez ve bu cümle görünür metindir.
 * Bayrak hiçbir koşulda tapu, içerik veya fiyat iddiasına genişletilmez.
 */
function eidsRow(verified: boolean, retrievedAt: string): VerificationRow {
  if (verified) {
    return {
      id: 'listing_authorisation',
      title: 'İlan verme yetkisi EİDS ile doğrulandı',
      scopeNote: EIDS_SCOPE_NOTE,
      state: 'positive',
      source: 'Ticaret Bakanlığı EİDS',
      retrievedAt,
    }
  }
  return {
    id: 'listing_authorisation',
    title: 'İlan verme yetkisi için EİDS sorgusu bu kayıtta bulunmuyor',
    scopeNote:
      'Sorgunun bulunmaması yetkinin olmadığı anlamına gelmez; yalnız bu ilan için yapılmış bir EİDS sorgusu kayıtlı değildir.',
    state: 'unknown',
    source: '—',
  }
}

/** Emlak ofisi ilanında yetki belgesi satırı — gerçek bir değer yoksa bilinmezdir. */
function agencyLicenceRow(): VerificationRow {
  return {
    id: 'agency_licence',
    title: 'Emlak işletmesinin TTBS yetki belgesi bu kayıtta doğrulanmadı',
    scopeNote:
      'Yetki belgesi numarası ilan kaydında yer almıyor. TTBS, işletmenin faaliyet yetkisidir; ilan içeriğinin doğruluğunu göstermez.',
    state: 'unknown',
    source: '—',
  }
}

/**
 * Sayfanın her ilan için sorduğu, arama kaydının cevaplayamadığı alanlar.
 *
 * Bunlar boş hücre veya tire olarak değil, nedeni ve kaynağıyla birlikte
 * görünür: kaydın bulunmaması "yok" demek değildir, "sorulmadı/yayımlanmadı"
 * demektir.
 */
function openQuestionsFor(retrievedAt: string): DeclaredAttribute[] {
  return [
    {
      id: 'neighbourhood',
      label: 'Mahalle',
      value: unanswered('listing-record', 'İlan kaydı', 'not_published', retrievedAt),
      note: 'Arama kaydı yalnız il ve ilçe taşır; mahalle bilgisi ilan sahibinden istenir.',
    },
    {
      id: 'title-deed',
      label: 'Tapu ve takyidat kaydı',
      value: unanswered('takbis', 'TAKBİS', 'not_published', retrievedAt),
      note: 'Tapu Müdürlüğünden alınacak güncel takyidat belgesiyle görülür. Kaydın bulunmaması takyidat olmadığı anlamına gelmez.',
    },
    {
      id: 'planning',
      label: 'İmar durumu',
      value: unanswered('belediye-imar', 'Belediye imar kaydı', 'not_published', retrievedAt),
      note: 'Parsel/bağımsız bölüm bazlı imar durum belgesi ilgili belediyeden istenir.',
    },
    {
      id: 'comparables',
      label: 'Emsal kesiti',
      value: unanswered('market', 'ArsaPazar emsal kesiti', 'out_of_scope', retrievedAt),
      note: 'Bu ilan için emsal kesiti derlenmedi; sayfada fiyat karşılaştırması yapılmaz.',
    },
  ]
}

/** Bento ızgarasının aldığı en fazla kare (kapak dahil). */
const MAX_REPRESENTATIVE_FRAMES = 4

/**
 * Bütün temsili karelerin **ortak** etiketi.
 *
 * Kare başına ayrı bir başlık ("Salon", "Parselden deniz yönü") uydurulmaz:
 * bu kayıtta hangi karenin neyi gösterdiğine dair bir bilgi yoktur ve
 * kategoriyi temsil eden stok kareye içerik iddiası yazmak sahte bir künye
 * olurdu. Aynı nedenle `capturedAt` da verilmez — çekim tarihi bilinmiyor.
 */
const REPRESENTATIVE_FRAME_LABEL = 'Temsili görsel'

/**
 * Medya dökümü.
 *
 * Kaydın kendi fotoğrafları yoktur; gösterilen kareler arama tarafıyla **aynı
 * havuzdan** gelen temsili (stok) fotoğraflardır ve görünüm katmanı bunu
 * görünür bir cümleyle söyler.
 *
 * Kareler **çoğaltılır** (ilk kare arama kartındaki kapakla aynıdır, kalanlar
 * kategori havuzundan sırayla gelir) çünkü hero tek kareyle bir ızgara
 * kuramıyordu. Çoğaltılan şey yalnız **kare**dir: hepsi aynı nötr etiketi
 * taşır, çekim tarihi taşımaz ve hiçbirine içerik açıklaması yazılmaz.
 * Uydurma yasağı burada kare sayısına değil, **künyeye** uygulanır — bir
 * fotoğrafın neyi gösterdiğini bilmediğimiz halde söylemek iddia üretmek
 * olurdu; kaç kare gösterildiği ise sayfada zaten görünür yazılıdır.
 *
 * İlanda bildirilen görsel sayısı bu diziye girmez: o bir beyandır ve
 * `declaredMediaCount` alanında, sahnede künye satırı olarak durur.
 */
function mediaFor(summary: ListingSummary): ListingMediaItem[] {
  const frames = Math.max(
    1,
    Math.min(
      summary.imageCount,
      stockPhotoCount(summary.category),
      MAX_REPRESENTATIVE_FRAMES,
    ),
  )

  return Array.from({ length: frames }, (_, index) => ({
    id: `representative-${index + 1}`,
    kind: 'photo' as const,
    label: REPRESENTATIVE_FRAME_LABEL,
    // İlk kare arama kartı ve karşılaştırma ile aynı kaynaktan gelir; kalanlar
    // aynı kategori havuzunun sonraki kareleridir.
    representative:
      index === 0
        ? getRepresentativeListingImage(summary)
        : getCategoryStockPhoto(
            summary.category,
            index,
            `${summary.title} için temsili ilan fotoğrafı`,
          ),
  }))
}

/**
 * Şematik yerleşimin görünür kaynağı.
 *
 * Arama kaydının `map: {x, y}` alanı bir liste/harita çiziminin yerleşimidir;
 * enlem/boylam değildir. Bu yüzden yansıtılmış ilanın konum çizimi coğrafi
 * değil **şematik** varyanttır ve kaynağını adıyla söyler.
 */
const SCHEMATIC_GEO_SOURCE = 'Arama kaydının şematik yerleşimi'

/**
 * Yansıtılan koordinatın kaynağı ve mahremiyet yarıçapı.
 *
 * Koordinat ilçe merkezinden türetilmiştir; parselin tam yeri DEĞİLDİR. 750 m
 * yarıçap bu belirsizliği hem dürüstçe bildirir hem de ilan sahibinin tam
 * adresini açık etmez.
 */
const APPROXIMATE_GEO_SOURCE = 'Arama kaydının ilçe düzeyindeki konumu'
const APPROXIMATE_GEO_RADIUS_METERS = 750

const VALUATION_REASON =
  'Bu ilan için emsal kesiti ve gerçekleşmiş işlem verisi derlenmedi; ArsaPazar fiyat tahmini üretilmedi.'

/**
 * Arama özetini ilan detayına yansıtır.
 *
 * Alan eşlemesi:
 * - fiyat ve alan → ilan sahibi beyanı; birim fiyat arama kaydının kendi
 *   türetimidir (ikisinden hesaplanır), burada ikinci kez hesaplanmaz
 * - `attributes` / `highlights` → beyan satırları
 * - `verified` → yalnız EİDS satırı
 * - `owner` / `sellerName` → satıcı bloğu (yetki belgesi değeri yoktur)
 * - `publishedDays` + `now` → yayın tarihi; güncelleme kaydı yoktur
 * - `image` / `imageCount` → medya dökümü + `declaredMediaCount` (beyan)
 * - `map` → **şematik** geo (`kind: 'schematic'`); coğrafi koordinat değildir
 */
export function projectListingDetail(
  summary: ListingSummary,
  now: string,
): GenericListingDetail {
  const publishedAt = new Date(Date.parse(now) - summary.publishedDays * DAY_MS).toISOString()

  const verification: VerificationRow[] = [eidsRow(summary.verified, now)]
  if (summary.owner === 'agency') verification.push(agencyLicenceRow())

  return {
    kind: 'generic',
    id: summary.id,
    title: summary.title,
    lifecycle: 'active',
    // İlan kaydının kendi anahtarı; ayrı bir ilan numarası kayıtta yoktur.
    listingNumber: summary.id,
    publishedAt,
    evidenceCutoff: now,
    location: { city: placeLabel(summary.city), district: placeLabel(summary.district) },
    price: {
      amount: summary.price,
      currency: 'TRY',
      declaredArea: summary.area,
      // Türetim tek yerde yaşar: arama kaydı birim fiyatı zaten hesaplayıp
      // taşır. Burada yeniden hesaplamak iki kopya türetim demek olurdu.
      unitPrice: summary.unitPrice,
    },
    category: summary.category,
    categoryLabel: CATEGORY_LABELS[summary.category],
    transaction: summary.transaction,
    transactionLabel: TRANSACTION_LABELS[summary.transaction],
    verification,
    declaredAttributes: Object.entries(summary.attributes).map(([key, value]) => ({
      id: key,
      label: attributeLabel(key),
      value: declared(attributeValueLabel(key, value), publishedAt),
    })),
    openQuestions: openQuestionsFor(now),
    highlights: declared(summary.highlights.join(' · '), publishedAt),
    valuation: { kind: 'insufficient', reason: VALUATION_REASON },
    // Belge kaydı yoktur; boşluk "eksik belge" damgasıyla değil, gerekçesiyle
    // yazılır (bkz. DocumentsSection).
    documents: [],
    seller: {
      name: summary.sellerName,
      type: summary.owner === 'agency' ? 'agency' : 'individual',
    },
    media: mediaFor(summary),
    // Dosya sayısı değil, ilanda BİLDİRİLEN sayı. Sahne bunu kare olarak
    // değil, sayı olarak gösterir.
    declaredMediaCount: summary.imageCount,
    // Arama kaydı artık gerçek bir koordinat taşıyor (`coordinates`), bu yüzden
    // geo COĞRAFİ olarak yansıtılır. Koordinat ilçe merkezinden türetilmiş
    // YAKLAŞIK bir noktadır — parselin tam yeri değildir; bu yüzden mahremiyet
    // yarıçapıyla birlikte taşınır ve görünüm katmanı yarıçapı kelimeyle yazar.
    // Kayıtta koordinat bulunmayan bir sürümde yeniden şematik yansıtmaya
    // dönülmelidir (bkz. `SCHEMATIC_GEO_SOURCE`).
    geo: {
      kind: 'geographic',
      lat: summary.coordinates.lat,
      lng: summary.coordinates.lng,
      radiusMeters: APPROXIMATE_GEO_RADIUS_METERS,
      sourceLabel: APPROXIMATE_GEO_SOURCE,
    },
    qna: projectQna(summary, now),
  }
}

/* ── Soru-cevap projeksiyonu ────────────────────────────────────────────
   Soru-cevap bir KANIT KAYNAĞI değildir: alıcıların yazdığı içeriktir ve
   TAKBİS/kadastro sorgusu yapılmamış olmasıyla ilgisi yoktur. Bu yüzden
   yansıtılmış ilanın "kanıt dosyası yok" bildirimi soru-cevabı kapsamaz —
   yazışma her ilanda olabilir.

   Üretim `summary.id`'den deterministiktir: aynı ilan her yüklemede aynı
   yazışmayı gösterir, SSR ve hydration çıktıları ayrışmaz. `Math.random`
   ve `Date.now` burada kullanılmaz. */

/** Basit, kararlı dizgi hash'i — `GlassAvatar`'ın pastel seçimiyle aynı fikir. */
function seedOf(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

/** Türkçe locale ile baş harfler; tek kelimelik adda ikinci harf uydurulmaz. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return `${first}${last}`.toLocaleUpperCase('tr')
}

const QNA_ASKERS: ReadonlyArray<string> = [
  'K. Ö.',
  'M. K.',
  'S. Y.',
  'B. E.',
  'A. D.',
  'Ö. A.',
  'T. G.',
  'N. Ç.',
]

/**
 * Soru havuzu — kategoriden bağımsız, her taşınmazda sorulabilecek sorular.
 * Yanıtlar ilan sahibinin **beyanıdır**; doğrulanmış kayıt değildir ve
 * bölümün altındaki uyarı bunu zaten yazar.
 */
const QNA_POOL: ReadonlyArray<{ question: string; answer?: string }> = [
  {
    question: 'Fiyatta pazarlık payı var mı?',
    answer: 'Ciddi alıcıyla görüşürüm; rakam konusunda bir miktar esneklik var.',
  },
  {
    question: 'Tapu durumu nedir, hisseli mi?',
    answer: 'Tapu müstakil. Belgeleri görüşmede gösterebilirim.',
  },
  {
    question: 'Yerinde görmek için ne zaman uygun olursunuz?',
    answer: 'Hafta içi öğleden sonra ve cumartesi sabah müsaitim.',
  },
  { question: 'Krediye uygun mu, ekspertiz yapıldı mı?' },
  {
    question: 'Ulaşım nasıl, yola cephesi var mı?',
    answer: 'Asfalt yola cephesi var; toplu taşıma durağı yürüme mesafesinde.',
  },
  { question: 'İlan hâlâ güncel mi?', answer: 'Evet, satılık.' },
  { question: 'Aynı bölgede başka portföyünüz var mı?' },
]

/**
 * İlanın kendi kimliğinden türetilen yazışma.
 *
 * Her ilanda soru olması gerekmez: tohumun beşe bölümünden kalanı sıfırsa
 * kayıt soru taşımaz ve bölüm kendi boş durumunu yazar. Boş durum gerçek bir
 * hâldir, kaçınılacak bir şey değil.
 */
function projectQna(summary: ListingSummary, now: string): ListingQna | undefined {
  const seed = seedOf(summary.id)
  if (seed % 5 === 0) return undefined

  const seller: ListingQnaAuthor = {
    id: `seller-${summary.id}`,
    label: summary.sellerName,
    initials: initialsOf(summary.sellerName),
    role: 'seller',
  }

  const count = 2 + (seed % 3)
  const base = Date.parse(now)
  const entries: ListingQnaEntry[] = []

  for (let index = 0; index < count; index += 1) {
    const pick = QNA_POOL[(seed + index * 3) % QNA_POOL.length]
    if (!pick) continue
    const askerLabel = QNA_ASKERS[(seed + index * 5) % QNA_ASKERS.length] ?? 'Alıcı'
    const askedAt = new Date(base - (index + 2) * 3 * DAY_MS).toISOString()

    const author: ListingQnaAuthor = {
      id: `buyer-${summary.id}-${index}`,
      label: askerLabel,
      initials: askerLabel.replace(/[^\p{L}]/gu, '').toLocaleUpperCase('tr'),
      role: 'buyer',
    }

    const replies: ListingQnaEntry['replies'] = []
    if (pick.answer) {
      replies.push({
        id: `${summary.id}-q${index}-a0`,
        author: seller,
        answeredAt: new Date(base - ((index + 2) * 3 - 1) * DAY_MS).toISOString(),
        body: pick.answer,
      })
    }

    /* İlk soruda üç repliklik bir alışveriş: katlama ("Tüm cevapları gör")
       ancak birden çok GÖRÜNEN yanıt varken devreye girer. Sonuncusu
       maskelidir — kişisel iletişim bilgisi herkese açık alanda yayımlanmaz
       ve yükten de çıkarılır (bkz. adapter `redactQna`). */
    if (index === 0 && pick.answer) {
      replies.push({
        id: `${summary.id}-q${index}-a1`,
        author,
        answeredAt: new Date(base - ((index + 2) * 3 - 1) * DAY_MS + 3_600_000).toISOString(),
        body: 'Teşekkürler, telefonla konuşmak benim için daha kolay olur.',
      })
      replies.push({
        id: `${summary.id}-q${index}-a2`,
        author: seller,
        answeredAt: new Date(base - ((index + 2) * 3 - 1) * DAY_MS + 7_200_000).toISOString(),
        body: '0555 000 00 00',
        visibility: 'masked',
      })
    }

    entries.push({
      id: `${summary.id}-q${index}`,
      askedAt,
      author,
      question: pick.question,
      replies,
      pinned: index === 0,
    })
  }

  return {
    entries,
    responseLabel:
      seed % 2 === 0 ? 'İlan sahibi soruları genelde gün içinde yanıtlıyor.' : undefined,
  }
}
