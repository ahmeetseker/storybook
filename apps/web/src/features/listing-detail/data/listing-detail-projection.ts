import type { ListingSummary } from '@/features/listings/data/listing-adapter'
import {
  attributeLabel,
  attributeValueLabel,
  CATEGORY_LABELS,
  placeLabel,
  TRANSACTION_LABELS,
} from '@/features/listings/data/listing-attributes'
import { getRepresentativeListingImage } from '@/features/listings/data/listing-photos'
import type { EvidenceValue, UnavailableReason } from '../domain/evidence'
import type {
  DeclaredAttribute,
  GenericListingDetail,
  ListingMediaItem,
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

/**
 * Medya dökümü.
 *
 * Kaydın kendi fotoğrafları yoktur; kapak karesi arama tarafıyla **aynı
 * kaynaktan** gelen temsili (stok) bir fotoğraftır ve görünüm katmanı bunu
 * görünür bir cümleyle söyler. İlanda bildirilen görsel sayısı beyan olarak
 * yazılır; sayı kadar sahte başlık üretilmez.
 */
function mediaFor(summary: ListingSummary): ListingMediaItem[] {
  return [
    {
      id: 'cover',
      kind: 'photo',
      label: `Kapak görseli · ilanda toplam ${summary.imageCount} görsel bildirildi`,
      representative: getRepresentativeListingImage(summary),
    },
  ]
}

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
 * - `image` / `imageCount` → medya dökümü
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
  }
}
