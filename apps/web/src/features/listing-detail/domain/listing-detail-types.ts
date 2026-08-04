import type {
  PropertyCategory,
  TransactionType,
} from '@/features/listings/domain/search-state'
import type { EvidenceValue } from './evidence'

/** İlan kategorisi — arama tarafındaki sözlükle aynı kaynaktan gelir. */
export type ListingCategory = Exclude<PropertyCategory, 'all'>
export type ListingTransaction = TransactionType

/** İlan yaşam döngüsü — aktif olmayan ilan sessizce aramaya yönlendirilmez. */
export type ListingLifecycle = 'active' | 'expired' | 'sold' | 'withdrawn' | 'moderated'

/** Doğrulama vektörü satırları; biri olumlu olsa diğerleri olumlu olmaz. */
export type VerificationRowId =
  | 'advertiser_identity'
  | 'listing_authorisation'
  | 'agency_licence'
  | 'parcel_match'
  | 'planning_document'
  | 'platform_moderation'
  | 'media_provenance'

export interface VerificationRow {
  id: VerificationRowId
  /** Tam cümle — "Doğrulandı" tek başına kullanılmaz */
  title: string
  /** Kontrolün neyi KAPSAMADIĞINI söyleyen zorunlu açıklama (EİDS satırında zorunlu) */
  scopeNote?: string
  state: 'positive' | 'negative' | 'unknown'
  /** Görünür kaynak adı */
  source: string
  retrievedAt?: string
  validUntil?: string
}

export interface ListingLocation {
  city: string
  district: string
  /**
   * Mahalle bilinmiyorsa alan hiç doldurulmaz.
   *
   * Arama kaydı yalnız il ve ilçe taşır; boş string veya ilçe adının tekrarı
   * mahalle bilgisi yerine geçmez. Görünüm katmanı yokluğu kelimeyle yazar.
   */
  neighbourhood?: string
}

/**
 * Haritada gösterilecek YAKLAŞIK **coğrafi** konum.
 *
 * Parselin tam merkezi taşınmaz: ilan sahibinin mahremiyeti için nokta
 * `radiusMeters` yarıçaplı bir alanın merkezidir ve görünüm katmanı bunu
 * kelimeyle yazar.
 */
export interface ListingGeographicGeo {
  kind: 'geographic'
  lat: number
  lng: number
  radiusMeters: number
  /** Konumun nereden geldiği — kanıt künyesinde görünür */
  sourceLabel: string
}

/**
 * Coğrafi OLMAYAN, yalnız şematik bir yerleşim.
 *
 * `x`/`y` 0-1 normalize düzlem koordinatıdır ve arama kaydının kendi şematik
 * yerleşiminden (`ListingSummary.map`) gelir: enlem/boylam **değildir**, bir
 * yere karşılık gelmez ve mesafe/yarıçap iddiası taşımaz. Bu yüzden
 * `radiusMeters` alanı yoktur — mahremiyet dairesi ancak gerçek bir koordinat
 * gizlenirken anlamlıdır. Görünüm katmanı çizimin şematik olduğunu ve kayıtta
 * coğrafi koordinat bulunmadığını **görünür metinle** yazar.
 */
export interface ListingSchematicGeo {
  kind: 'schematic'
  x: number
  y: number
  /** Yerleşimin nereden geldiği — kanıt künyesinde görünür */
  sourceLabel: string
}

/**
 * Konum çiziminin iki varyantı.
 *
 * Ayrık birleşim bilinçlidir: şematik yerleşimi coğrafi koordinat gibi
 * sunabilecek tek bir düz tip (opsiyonel `lat`/`lng`) görünüm katmanında iki
 * ayrı iddiayı aynı şeye benzetirdi. Geo hiç yoksa harita çizilmez (yaklaşık
 * bile olsa uydurulmaz), yalnız idari konum metni kalır.
 */
export type ListingApproximateGeo = ListingGeographicGeo | ListingSchematicGeo

/** Çevredeki ilgi noktası — mesafe kuş uçuşudur ve öyle etiketlenir. */
export interface ListingNearbyPlace {
  id: string
  label: string
  kind: 'transit' | 'school' | 'health' | 'shopping' | 'landmark' | 'coast'
  distanceMeters: number
}

/**
 * Yazışmadaki bir kişi.
 *
 * Fotoğraf **taşınmaz**: avatar baş harflerden çizilir ve zemin tonu rolü
 * söyler. Tam ad da taşınmaz — görünen kimlik kısaltmalıdır ("Kerem Ö.").
 * `id` yetki kararının tek dayanağıdır: "kendi yazdığı" karşılaştırması
 * görünen ada değil buna bakar.
 */
export interface ListingQnaAuthor {
  id: string
  label: string
  /** Avatarda görünen baş harfler (ör. "KÖ") */
  initials: string
  role: 'buyer' | 'seller'
}

/**
 * Bir yanıtın görünürlüğü.
 *
 * - `public` — herkese açık (varsayılan).
 * - `hidden` — **ilan sahibinin tercihi**. Geri alınabilir. Başkalarında
 *   hiçbir iz bırakmaz: satır tamamen çizilmez (04.08.2026 kararı).
 * - `masked` — **platform kuralı**. Telefon/e-posta herkese açık alanda
 *   yayımlanmaz. Tercih olmadığı için ilan sahibine "göster" seçeneği hiç
 *   açılmaz; ikisi aynı menüde toplanmaz.
 *
 * İkisinde de yanıtı **yazan** ve ilan sahibi içeriği okumaya devam eder —
 * kendi yazdığının yayında olup olmadığını bilemeyen bir kullanıcı bırakılmaz.
 */
export type ListingQnaVisibility = 'public' | 'hidden' | 'masked'

/** Yazışmadaki tek bir yanıt. Alıcılar da yanıt yazabilir, yalnız satıcı değil. */
export interface ListingQnaReply {
  id: string
  author: ListingQnaAuthor
  answeredAt: string
  body: string
  /** Verilmezse `public` sayılır. */
  visibility?: ListingQnaVisibility
}

/**
 * Alıcı sorusu ve altındaki yazışma.
 *
 * Yanıtsız soru da görünür kalır: yanıt yokluğu bilgidir, gizlenmez. Ama
 * yanıtı gizlenmiş soru "yanıtsız" diye **etiketlenmez** — boş bırakmak bir
 * şey söylememektir, yanlış söylemek değil.
 */
export interface ListingQnaEntry {
  id: string
  askedAt: string
  author: ListingQnaAuthor
  question: string
  /** Kronolojik yazışma; boş dizi "henüz yanıtlanmadı" demektir. */
  replies: ListingQnaReply[]
  /** Sık sorulan olarak öne çıkarılmış */
  pinned?: boolean
}

/**
 * Bölümü görüntüleyen kişi.
 *
 * Yetki bu üründe rolden değil **sahiplikten** türer: kendi yazdığını
 * silersin, başkasınınkini bildirirsin. `isOwner` yalnız iki fazladan yetki
 * verir — kendi yanıtını gizleme ve gizlenmiş içeriği okuma.
 */
export interface ListingQnaViewer {
  /** Kapalıysa yazma alanı ve işlem menüleri hiç çizilmez. */
  signedIn: boolean
  /** Oturum açıkken kendi kimliği; `ListingQnaAuthor.id` ile eşleşir. */
  id?: string
  label?: string
  initials?: string
  /** Görüntüleyen bu ilanın sahibi mi */
  isOwner?: boolean
}

export interface ListingQna {
  entries: ListingQnaEntry[]
  /** Satıcının tipik yanıt süresi (ör. "Genelde 4 saat içinde yanıtlıyor") */
  responseLabel?: string
  /**
   * Soru sorma kapalıysa nedeni. Kapalıyken form çizilmez — tıklanınca
   * hiçbir şey yapmayan buton bırakılmaz. **Oturum kapalılığıyla
   * karıştırılmaz**: bu kanalın kendisinin kapalı olmasıdır ve giriş yapmak
   * bunu açmaz.
   */
  askDisabledReason?: string
}

export interface ListingPrice {
  amount: number
  currency: 'TRY'
  /** İlanda beyan edilen alan — birim fiyat bunun üzerinden hesaplanır */
  declaredArea: number
  unitPrice: number
}

/**
 * Medya kaleminin gösterilebilir karesi.
 *
 * **Taşınmazın kendi fotoğrafı değildir.** Ürün verisinde gerçek ilan
 * görselleri bulunmadığı için kategoriyi temsil eden stok kare gösterilir;
 * kaynak tek yerdedir (`features/listings/data/listing-photos.ts`) ve
 * gösteren yüzey `REPRESENTATIVE_IMAGE_NOTE` cümlesini görünür yazar.
 * Fotoğraf olmayan kalemler (plan PDF'i, parsel görünümü) bu alanı **hiç
 * taşımaz** — onlara temsili bir fotoğraf iliştirmek yanlış olurdu.
 */
export interface ListingMediaPreview {
  src: string
  fallbackSrc: string
  alt: string
}

export interface ListingMediaItem {
  id: string
  kind: 'photo' | 'video' | 'plan' | 'parcel' | 'drone'
  label: string
  capturedAt?: string
  /** AI ile üretilmiş veya maddi biçimde düzenlenmiş medya görünür etiketlenir */
  aiEdited?: boolean
  /** Varsa temsili kare; yoksa kalem yalnız döküm satırı olarak görünür */
  representative?: ListingMediaPreview
}

export interface ListingDocument {
  id: string
  label: string
  state: 'available' | 'missing'
  critical: boolean
  issuedAt?: string
  authority?: string
}

export interface ListingSeller {
  name: string
  type: 'agency' | 'individual'
  licence?: EvidenceValue<string>
  respondsInHours?: number
  activeListings?: number
  memberSince?: string
}

export interface UtilityEvidence {
  id: string
  label: string
  /** Boolean yerine kapsamlı durum: parselde / sınırda / yolda / yok */
  value: EvidenceValue<string>
}

export interface HazardIndicator {
  id: string
  /** "Bölgesel deprem tehlike göstergesi" gibi — risk hükmü değil */
  label: string
  value: EvidenceValue<string>
  /** Zorunlu kapsam/sınırlama açıklaması */
  scopeNote: string
}

export type ValuationOutcome =
  | { kind: 'range'; low: number; high: number; methodVersion: string; sampleSize: number }
  | { kind: 'insufficient'; reason: string }

export interface ListingDetailBase {
  id: string
  title: string
  lifecycle: ListingLifecycle
  listingNumber: string
  publishedAt: string
  /**
   * Kayıtta bir güncelleme tarihi varsa. Yoksa alan doldurulmaz: yayın
   * tarihini "son güncelleme" diye tekrarlamak olmayan bir olayı bildirir.
   */
  updatedAt?: string
  /** Tüm kanıtların ortak sorgu kesiti */
  evidenceCutoff: string
  location: ListingLocation
  price: ListingPrice
  verification: VerificationRow[]
  documents: ListingDocument[]
  seller: ListingSeller
  media: ListingMediaItem[]
  /**
   * İlan kaydında **bildirilen** görsel sayısı.
   *
   * `media` dizisinin uzunluğu değildir: kayıtta gösterilebilir dosya
   * bulunmasa da ilan sahibinin bildirdiği sayı bilgidir. Sayı kadar sahte
   * kare üretilmez; yalnız sayı olarak yazılır. Bildirilmemişse alan hiç
   * doldurulmaz.
   */
  declaredMediaCount?: number
  /** Yaklaşık konum — yoksa harita bölümü çizilmez */
  geo?: ListingApproximateGeo
  /** Çevredeki ilgi noktaları — boşsa liste yerine yokluk cümlesi yazılır */
  nearby?: ListingNearbyPlace[]
  /** Alıcı soruları ve yanıtları — yoksa bölüm boş durumla çizilir */
  qna?: ListingQna
}

export interface LandListingDetail extends ListingDetailBase {
  kind: 'land'
  parcel: {
    blockParcel: EvidenceValue<string>
    /** Kayıttaki yüzölçümü; beyanla çelişebilir */
    area: EvidenceValue<number>
    locationPrecision: EvidenceValue<string>
    distanceToSea?: EvidenceValue<string>
  }
  planning: {
    titleDeedType: EvidenceValue<string>
    shared: { isShared: boolean; share?: string }
    planStatus: EvidenceValue<string>
    landUse: EvidenceValue<string>
    encumbrance: EvidenceValue<string>
    planNumber?: string
    planScale?: string
  }
  access: {
    /** Yasal yol hakkı — "yola yakın" bu değildir */
    legalRoadAccess: EvidenceValue<string>
    physicalAccess: EvidenceValue<string>
    utilities: UtilityEvidence[]
  }
  terrain: {
    slope: EvidenceValue<string>
    aspect?: EvidenceValue<string>
    hazards: HazardIndicator[]
  }
  market: {
    comparableMedianUnitPrice: EvidenceValue<number>
    comparableCount: number
    valuation: ValuationOutcome
  }
}

/**
 * Beyana dayalı tek satır: etiket, değer ve (varsa) değerin nereden
 * geleceğini söyleyen görünür not. Cevapsız satırda `value` doldurulmaz;
 * künye nedeni yazar.
 */
export interface DeclaredAttribute {
  id: string
  label: string
  value: EvidenceValue<string>
  /** Değerin altında duran görünür açıklama — açılır katman değildir */
  note?: string
}

/**
 * Arama kaydından **yansıtılmış** ilan detayı.
 *
 * Kanıt defteri derlenmemiş ilanların paketi budur: yalnız arama özetinin
 * gerçekten taşıdığı alanlar bulunur — kategori, işlem türü, fiyat/alan,
 * ilan sahibi beyanları ve ilan kaydının kendi zaman damgaları. Parsel,
 * imar, erişim, arazi ve emsal paketleri burada **yoktur**; olmayan bir
 * kanıt isteğe bağlı alan olarak taşınmaz, çünkü `undefined` bir parsel ile
 * "sorgulanmamış" bir parsel görünüm katmanında aynı şeye benzerdi.
 */
export interface GenericListingDetail extends ListingDetailBase {
  kind: 'generic'
  category: ListingCategory
  categoryLabel: string
  transaction: ListingTransaction
  transactionLabel: string
  /** İlan sahibinin beyan ettiği özellikler — doğrulanmış kayıt değildir */
  declaredAttributes: DeclaredAttribute[]
  /**
   * Sayfanın her ilan için sorduğu ama arama kaydının cevaplayamadığı
   * alanlar. Boş bırakılmaz: her biri nedeni ve kaynağıyla görünür.
   */
  openQuestions: DeclaredAttribute[]
  /** İlan sahibinin öne çıkardığı maddeler — tek beyan satırı olarak taşınır */
  highlights: EvidenceValue<string>
  /** Emsal kesiti ve kanıt defteri olmadığı için değerleme çekinir */
  valuation: ValuationOutcome
}

/** Kategori paketleri bu union üzerinden büyür (Faz 4). */
export type ListingDetail = LandListingDetail | GenericListingDetail
