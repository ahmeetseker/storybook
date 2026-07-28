/**
 * Kanıt defteri çekirdeği.
 *
 * Sayfadaki her önemli değer; kim söyledi, ne zaman geçerliydi, hangi kapsam
 * için geçerli ve sınırlaması ne sorularına cevap verir. Bu tipler yalnız
 * veriyi taşır — hangi rozetin çizileceği görünüm katmanının kararıdır.
 */

/** Değerin kanıt durumu. `verified` yalnız gösterilen ALANIN doğrulandığı hâldir. */
export type EvidenceStatus =
  | 'verified'
  | 'declared'
  | 'derived'
  | 'estimated'
  | 'unavailable'
  | 'conflicting'

/** Güncellik, kökenden bağımsızdır: resmî veri de bayatlayabilir. */
export type FreshnessStatus = 'current' | 'aging' | 'stale' | 'unknown'

/** Değerin nereden geldiği — "doğrulandı" tek rozetine indirgenmez. */
export type EvidenceSourceClass =
  | 'official'
  | 'verified_document'
  | 'advertiser_declared'
  | 'platform_derived'
  | 'model_estimate'
  | 'unknown'

/** `unavailable` tek bir "veri yok" değildir; nedeni ayrıca taşınır. */
export type UnavailableReason =
  | 'not_published'
  | 'provider_unavailable'
  | 'not_applicable'
  | 'permission_denied'
  | 'out_of_scope'

export interface EvidenceSource {
  id: string
  /** Kullanıcıya gösterilen sağlayıcı adı */
  name: string
  sourceClass: EvidenceSourceClass
  /** Kaynağın arkasındaki kurum (varsa) */
  authority?: string
  /** Resmî sorgu/kayıt bağlantısı (varsa) */
  url?: string
}

export interface EvidenceConflict {
  sourceId: string
  value: unknown
  effectiveAt?: string
}

/** Değerin hangi coğrafi/hukuki birim için geçerli olduğu */
export type EvidenceScope = 'property' | 'parcel' | 'building' | 'neighborhood' | 'district'

/**
 * Değerin zamanla bayatlayıp bayatlamadığı.
 *
 * - `time_sensitive`: doğruluğu iki sorgu arasında değişebilen değer — ilan
 *   sahibi beyanı, plan durumu, emsal kesiti, uydu görüntüsünden türetilmiş
 *   erişim bilgisi. Bunlarda geçen zaman gerçek bir belirsizliktir ve
 *   güncellik `freshnessFrom` ile takvimden hesaplanır.
 * - `durable`: takvimle değil, **olayla** değişen değer — kadastral kimlik
 *   (ada/parsel numarası yeniden ölçüm veya ifrazla değişir) ya da resmî
 *   olarak yürürlükte olan sürümlü bir yayın (ulusal tehlike haritası, yeni
 *   sürüm yayımlanana kadar geçerli kalır). Bunlara takvim eşiği uygulamak
 *   ters yönde bir aşırı iddiadır: sağlam resmî veriyi "Güncel değil" diye
 *   şüpheye düşürür.
 *
 * Varsayılan `time_sensitive`'dir: bir değerin dayanıklı olduğu **iddia
 * edilmelidir**, sessizce varsayılamaz. Alan boş bırakıldığında değer
 * takvimi izler.
 */
export type FreshnessPolicy = 'time_sensitive' | 'durable'

export interface EvidenceValue<T> {
  /** Değer yoksa alan hiç doldurulmaz — boş string veya 0 ile taklit edilmez */
  value?: T
  status: EvidenceStatus
  freshness: FreshnessStatus
  /**
   * Güncelliğin takvimden mi türetileceği. Verilmezse `time_sensitive`
   * kabul edilir — dayanıklılık açıkça beyan edilmelidir.
   */
  freshnessPolicy?: FreshnessPolicy
  source: EvidenceSource
  /** Verinin geçerli olduğu tarih (belge/kayıt tarihi) */
  effectiveAt?: string
  /** Sorgunun yapıldığı an */
  retrievedAt: string
  validUntil?: string
  scope: EvidenceScope
  /** Ör. "10 m hücre", "bölgesel" */
  geographicResolution?: string
  method?: string
  methodVersion?: string
  /** Yalnız kalibre edilmiş `derived`/`estimated` sonuçlarda anlamlıdır */
  confidence?: number
  knownLimitations?: string[]
  conflicts?: EvidenceConflict[]
  unavailableReason?: UnavailableReason
}

const SOURCE_CLASS_LABELS: Record<EvidenceSourceClass, string> = {
  official: 'Resmî kayıttan',
  verified_document: 'Doğrulanmış belgeden',
  advertiser_declared: 'İlan sahibi beyanı',
  platform_derived: 'ArsaPazar hesabı',
  model_estimate: 'Model tahmini',
  unknown: 'Doğrulanamadı',
}

/** Kaynak sınıfının görünür kullanıcı etiketi. */
export function sourceClassLabel(sourceClass: EvidenceSourceClass): string {
  return SOURCE_CLASS_LABELS[sourceClass]
}

export function hasConflict(value: EvidenceValue<unknown>): boolean {
  return (value.conflicts?.length ?? 0) > 0
}

export function isAnswered(value: EvidenceValue<unknown>): boolean {
  return value.value !== undefined && value.status !== 'unavailable'
}

/**
 * Değerin güncelliği takvimden hesaplanmalı mı?
 *
 * Varsayılan burada, tek yerde yaşar: `freshnessPolicy` yazılmamış her değer
 * zamana duyarlıdır. Dayanıklılık istisnadır ve gerekçesiyle işaretlenir.
 */
export function decaysOverTime(value: EvidenceValue<unknown>): boolean {
  return value.freshnessPolicy !== 'durable'
}

/**
 * Satırda gösterilecek tek etiket. Öncelik sırası bilinçlidir: çelişki
 * bastırılamaz, bayatlık kökenin önüne geçer, cevapsızlık gizlenmez.
 */
export function evidenceStatusLabel(value: EvidenceValue<unknown>): string {
  if (value.status === 'conflicting' || hasConflict(value)) return 'Kaynaklar çelişiyor'
  if (value.freshness === 'stale') return 'Güncel değil'
  if (!isAnswered(value)) return 'Doğrulanamadı'
  return sourceClassLabel(value.source.sourceClass)
}

const DAY_MS = 86_400_000
const AGING_AFTER_DAYS = 90
const STALE_AFTER_DAYS = 180

/**
 * Güncelliği belirler. Belge/kayıt tarihi (`effectiveAt`) varsa sorgu
 * tarihinden daha belirleyicidir: dün sorgulanmış sekiz aylık bir plan notu
 * güncel değildir.
 */
export function freshnessFrom(
  retrievedAt: string,
  now: string,
  effectiveAt?: string,
): FreshnessStatus {
  const reference = effectiveAt ?? retrievedAt
  const referenceMs = Date.parse(reference)
  const nowMs = Date.parse(now)
  if (Number.isNaN(referenceMs) || Number.isNaN(nowMs)) return 'unknown'

  const ageDays = (nowMs - referenceMs) / DAY_MS
  if (ageDays < 0) return 'unknown'
  if (ageDays <= AGING_AFTER_DAYS) return 'current'
  if (ageDays <= STALE_AFTER_DAYS) return 'aging'
  return 'stale'
}
