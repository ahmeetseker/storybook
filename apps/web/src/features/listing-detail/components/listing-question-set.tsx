import { GlassAlert, GlassTable, type GlassTableColumn, type GlassTableRow } from '@repo/ui'

import { EvidenceList, EvidenceRow } from './EvidenceRow'
import type { ListingQuestion } from './ListingQuestions'
import { isAnswered } from '../domain/evidence'
import type {
  GenericListingDetail,
  LandListingDetail,
  ListingDetail,
} from '../domain/listing-detail-types'
import { criticalIssues, medianPosition, medianPositionPhrase } from '../domain/listing-detail-view-model'
import { formatArea, formatDate, formatNumber, formatPrice, formatUnitPrice } from '../format'
import styles from './ListingQuestions.module.css'

/** Kaydın bulunmaması yükün bulunmadığı anlamına gelmez — künyede yazılı kalır. */
const ENCUMBRANCE_LIMITATIONS = ['İpotek, haciz, şerh veya beyan bulunmadığı anlamına gelmez.']

/** Emsal kesiti gerçek bir tablodur; satırların hepsi ilan fiyatıdır. */
const COMPARABLE_COLUMNS: GlassTableColumn[] = [
  { key: 'record', label: 'Kayıt' },
  { key: 'unitPrice', label: 'Birim fiyat', align: 'end' },
  { key: 'source', label: 'Kaynak' },
]

/**
 * Sayfanın soru seti.
 *
 * Sıra sabittir ve pakete göre değişmez: alıcı önce ne yapabileceğini, sonra
 * fiyatı, sonra finansmanı, konumu, riski sorar; en sonda sayfanın kendi
 * eksiklerini itiraf eder. Cevabı olmayan soru listeden çıkarılmaz —
 * cevaplanamadığı yazılır, çünkü sorunun sorulmamış olması bilgi değildir.
 */
export function listingQuestions(
  detail: ListingDetail,
  mapSection: MapSectionState,
): ListingQuestion[] {
  return detail.kind === 'land'
    ? landQuestions(detail, mapSection)
    : projectedQuestions(detail)
}

/** Harita bölümünün durumu — hazır ya da gerekçeli olarak yok. */
export type MapSectionState = { state: 'ready' } | { state: 'unavailable'; reason: string }

function landQuestions(
  detail: LandListingDetail,
  mapSection: MapSectionState,
): ListingQuestion[] {
  const { planning, parcel, access, terrain, market, price } = detail
  const median = market.comparableMedianUnitPrice.value
  const position = median !== undefined ? medianPosition(price.unitPrice, median) : undefined

  return [
    {
      id: 'build',
      question: 'Buraya ne inşa edebilirim?',
      defaultOpen: true,
      answer: isAnswered(planning.landUse) ? (
        <>
          Kullanım kararı <strong>{planning.landUse.value}</strong>
          {isAnswered(planning.planStatus) ? <> · plan durumu {planning.planStatus.value}</> : null}.
          {/* Emsal, TAKS ve gabari bu kayıtta taşınmıyor; hesaplanmış bir
              inşaat hakkı yazmak uydurma olurdu. */}
          {' '}
          Yapılaşma hakkı (emsal, TAKS, gabari) bu kayıtta yok — imar çapından okunur.
        </>
      ) : (
        'Kullanım kararı bu kayıtta doğrulanmadı; ne inşa edilebileceği imar çapı olmadan söylenemez.'
      ),
      unanswered: !isAnswered(planning.landUse),
      body: (
        <EvidenceList>
          <EvidenceRow label="Kullanım kararı" value={planning.landUse} />
          <EvidenceRow
            label="Plan durumu"
            value={planning.planStatus}
            note={planNote(planning)}
          />
          <EvidenceRow label="Tapu niteliği" value={planning.titleDeedType} note={shareNote(planning)} />
        </EvidenceList>
      ),
    },
    {
      id: 'price',
      question: 'Fiyat makul mu?',
      answer: position ? (
        <>
          Bu ilan <strong>{medianPositionPhrase(position)}</strong> listelenmiş — ama bu ilan
          fiyatı, satış fiyatı değil.
        </>
      ) : (
        'Emsal kesiti bu kayıtta yok; fiyatın piyasaya göre yerini söyleyemiyoruz.'
      ),
      unanswered: !position,
      body: (
        <>
          <EvidenceList>
            <EvidenceRow
              label="Emsal medyan birim fiyatı"
              value={market.comparableMedianUnitPrice}
              formatValue={formatUnitPrice}
              note={`${formatNumber(market.comparableCount)} ilanlık kesit`}
            />
          </EvidenceList>
          <GlassTable
            columns={COMPARABLE_COLUMNS}
            rows={comparableRows(detail)}
            aria-label="Emsal karşılaştırması"
          />
          <p className={styles.note}>
            Bu satırlar yalnız ilan fiyatıdır; gerçekleşmiş satış kaydı değildir. İlan
            fiyatı bir talep, satış fiyatı bir sonuçtur — bu yüzden “ucuz” demiyoruz,
            “medyanın altında listelenmiş” diyoruz.
          </p>
          <p className={styles.note}>
            {market.valuation.kind === 'insufficient'
              ? `ArsaPazar fiyat tahmini üretilmedi. ${market.valuation.reason}`
              : `ArsaPazar fiyat tahmini ${formatPrice(market.valuation.low)} – ${formatPrice(market.valuation.high)} · model ${market.valuation.methodVersion}, ${formatNumber(market.valuation.sampleSize)} emsal.`}
          </p>
        </>
      ),
    },
    {
      id: 'finance',
      question: 'Kredi çıkar mı?',
      answer: isAnswered(planning.titleDeedType) ? (
        <>
          Tapu <strong>{planning.titleDeedType.value}</strong>
          {planning.shared.isShared ? ' — hisseli tapu kredide engel çıkarabilir' : ''}. Takyidat
          satırı aşağıda; kredi kararı bankanın kendi ekspertizine bağlıdır.
        </>
      ) : (
        'Tapu niteliği doğrulanmadan kredi uygunluğu hakkında bir şey söylenemez.'
      ),
      unanswered: !isAnswered(planning.titleDeedType),
      body: (
        <>
          <EvidenceList>
            <EvidenceRow label="Tapu niteliği" value={planning.titleDeedType} note={shareNote(planning)} />
            <EvidenceRow
              label="Takyidat"
              value={planning.encumbrance}
              fallbackText="Bilgi alınamadı — TAKBİS kaydı sunulmadı"
              limitationsOverride={ENCUMBRANCE_LIMITATIONS}
            />
          </EvidenceList>
          <p className={styles.note}>
            Kredi oranı ve limiti banka pratiğidir, bu sayfada taahhüt edilmez. Taksit
            hesabı için gerçek faiz ve vade gerekir; varsayım üzerine rakam üretmiyoruz.
          </p>
        </>
      ),
    },
    {
      id: 'location',
      question: 'Konum ne sunuyor?',
      defaultOpen: true,
      answer: isAnswered(access.legalRoadAccess) ? (
        <>
          Yasal yol hakkı: <strong>{access.legalRoadAccess.value}</strong>
          {isAnswered(parcel.locationPrecision) ? (
            <> · konum hassasiyeti {parcel.locationPrecision.value}</>
          ) : null}
          .
        </>
      ) : (
        'Yasal yol hakkı bu kayıtta doğrulanmadı — “yola yakın” olmak yol hakkı değildir.'
      ),
      unanswered: !isAnswered(access.legalRoadAccess),
      body: (
        <div className={styles.mapWrap}>
          {/* Konum çizimi yalnız gerçek koordinat varsa gelir. Bu kayıtta
              koordinat taşınmıyor; şematik bir harita çizmek konumu bildiğimiz
              izlenimi verirdi. Gerekçe görünür kalır. */}
          {mapSection.state === 'unavailable' ? (
            <GlassAlert severity="warning" title="Konum çizimi gösterilemiyor">
              {mapSection.reason}
            </GlassAlert>
          ) : null}
          <EvidenceList>
            <EvidenceRow label="Ada / parsel" value={parcel.blockParcel} />
            <EvidenceRow
              label="Kayıtlı yüzölçümü"
              value={parcel.area}
              formatValue={formatArea}
              note={`İlanda ${formatArea(detail.price.declaredArea)} beyan edildi; birim fiyat beyan edilen alana göre hesaplandı.`}
            />
            <EvidenceRow label="Yasal yol hakkı" value={access.legalRoadAccess} />
            <EvidenceRow label="Fiziksel erişim" value={access.physicalAccess} />
            <EvidenceRow label="Konum hassasiyeti" value={parcel.locationPrecision} />
            {parcel.distanceToSea ? (
              <EvidenceRow label="Denize uzaklık" value={parcel.distanceToSea} />
            ) : null}
            {access.utilities.map((utility) => (
              <EvidenceRow key={utility.id} label={utility.label} value={utility.value} />
            ))}
          </EvidenceList>
        </div>
      ),
    },
    {
      id: 'risk',
      question: 'Riski ne?',
      answer: terrain.hazards.length ? (
        <>
          {terrain.hazards
            .filter((hazard) => isAnswered(hazard.value))
            .slice(0, 2)
            .map((hazard) => `${hazard.label}: ${hazard.value.value}`)
            .join(' · ') || 'Tehlike satırları bu kayıtta cevapsız.'}
        </>
      ) : (
        'Tehlike verisi bu kayıtta yok.'
      ),
      unanswered: !terrain.hazards.some((hazard) => isAnswered(hazard.value)),
      body: (
        <>
          <EvidenceList>
            <EvidenceRow label="Eğim" value={terrain.slope} />
            {terrain.aspect ? <EvidenceRow label="Bakı" value={terrain.aspect} /> : null}
            {terrain.hazards.map((hazard) => (
              <EvidenceRow
                key={hazard.id}
                label={hazard.label}
                value={hazard.value}
                note={hazard.scopeNote}
              />
            ))}
          </EvidenceList>
          <p className={styles.note}>
            Tehlike haritaları plan bölgesi ölçeğindedir; parsel ölçeğinde kesin sonuç
            zemin etüdünden gelir.
          </p>
        </>
      ),
    },
    {
      id: 'liquidity',
      question: 'Ne kadar sürede satılır?',
      answer: 'Cevaplayamıyoruz — bu bölgede gerçekleşmiş işlem verimiz yok.',
      unanswered: true,
      body: (
        <p className={styles.note}>
          Elimizde yalnız aktif ilanların kesiti var; bu bir satış süresi değildir. Bir ilanın
          neden kaldırıldığını bilmiyoruz — satılmış da olabilir, satıcı vazgeçmiş de. Tek
          sayıya indirmek yanıltıcı olurdu.
        </p>
      ),
    },
    unknownsQuestion(detail),
  ]
}

function projectedQuestions(detail: GenericListingDetail): ListingQuestion[] {
  const answeredAttributes = detail.declaredAttributes.filter((item) => isAnswered(item.value))

  return [
    {
      id: 'what',
      question: 'Bu ilan ne sunuyor?',
      defaultOpen: true,
      answer: answeredAttributes.length ? (
        <>
          İlan sahibinin beyanına göre{' '}
          <strong>
            {answeredAttributes
              .slice(0, 3)
              .map((item) => `${item.label} ${item.value.value}`)
              .join(' · ')}
          </strong>
          . Bu satırlar doğrulanmış kayıt değildir.
        </>
      ) : (
        'Bu kayıtta beyan edilmiş özellik bulunmuyor.'
      ),
      unanswered: answeredAttributes.length === 0,
      body: (
        <EvidenceList>
          {detail.declaredAttributes.map((item) => (
            <EvidenceRow key={item.id} label={item.label} value={item.value} note={item.note} />
          ))}
        </EvidenceList>
      ),
    },
    {
      id: 'price',
      question: 'Fiyat makul mu?',
      answer:
        'Cevaplayamıyoruz — bu ilan için emsal kesiti derlenmedi, karşılaştırma yapamıyoruz.',
      unanswered: true,
      body: (
        <p className={styles.note}>
          Birim fiyat ilan sahibinin beyan ettiği alandan hesaplanır ({formatUnitPrice(detail.price.unitPrice)}
          {' · '}
          {formatArea(detail.price.declaredArea)}). Emsal medyanı olmadan bu sayının piyasadaki
          yerini söyleyemeyiz.
        </p>
      ),
    },
    {
      id: 'open',
      question: 'Sayfanın cevaplayamadığı sorular',
      answer: detail.openQuestions.length ? (
        <>
          <strong>{detail.openQuestions.length} alan</strong> bu kayıtta sorulmadı — eksik bizim,
          ilanın değil.
        </>
      ) : (
        'Bu kayıtta açık soru bulunmuyor.'
      ),
      unanswered: detail.openQuestions.length > 0,
      body: detail.openQuestions.length ? (
        <EvidenceList>
          {detail.openQuestions.map((item) => (
            <EvidenceRow key={item.id} label={item.label} value={item.value} note={item.note} />
          ))}
        </EvidenceList>
      ) : undefined,
    },
    unknownsQuestion(detail),
  ]
}

/** Sayfanın kendi eksiklerini itiraf ettiği kapanış sorusu — her pakette var. */
function unknownsQuestion(detail: ListingDetail): ListingQuestion {
  const issues = criticalIssues(detail)

  return {
    id: 'unknowns',
    question: 'Neyi bilmiyorum?',
    answer: issues.length ? (
      <>
        <strong>
          {issues.length} konu
        </strong>{' '}
        görüşmeden önce çözülmeli.
      </>
    ) : (
      'Bu kayıtta karar öncesi çözülmesi gereken açık konu görünmüyor.'
    ),
    unanswered: issues.length > 0,
    body: issues.length ? (
      <div>
        {issues.map((issue) => (
          <div key={issue.id} className={styles.check}>
            <span className={`${styles.dot} ${styles.dotWarn}`} aria-hidden="true" />
            <span>
              <strong>{issue.title}.</strong> {issue.detail}
              {issue.action ? <> Sonraki adım: {issue.action}.</> : null}
            </span>
          </div>
        ))}
      </div>
    ) : undefined,
  }
}

/** Emsal kesiti satırları — hepsi ilan fiyatıdır ve bu görünür biçimde yazılır. */
function comparableRows(detail: LandListingDetail): GlassTableRow[] {
  const rows: GlassTableRow[] = [
    {
      id: 'listing',
      record: 'Bu ilan',
      unitPrice: formatUnitPrice(detail.price.unitPrice),
      source: 'İlan sahibi beyanı',
    },
  ]
  const median = detail.market.comparableMedianUnitPrice.value
  if (median !== undefined) {
    rows.push({
      id: 'median',
      record: `Emsal medyanı · ${formatNumber(detail.market.comparableCount)} ilan`,
      unitPrice: formatUnitPrice(median),
      source: detail.market.comparableMedianUnitPrice.source.name,
    })
  }
  return rows
}

function shareNote(planning: LandListingDetail['planning']): string | undefined {
  if (!planning.shared.isShared) return undefined
  return planning.shared.share
    ? `Tapu hisseli — ilan ${planning.shared.share} pay için veriliyor.`
    : 'Tapu hisseli — ilan taşınmazın tamamı için değil, bir pay için veriliyor.'
}

function planNote(planning: LandListingDetail['planning']): string | undefined {
  const note = [
    planning.planNumber ? `Plan ${planning.planNumber}` : undefined,
    planning.planScale ? `ölçek ${planning.planScale}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')
  return note || undefined
}

/** Kanıt kesiti tarihi künyede tek yerden okunur. */
export function evidenceCutoffLine(detail: ListingDetail): string {
  return `Kanıt kesiti ${formatDate(detail.evidenceCutoff)}`
}
