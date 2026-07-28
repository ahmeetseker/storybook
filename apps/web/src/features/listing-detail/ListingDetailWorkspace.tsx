import {
  GlassBreadcrumb,
  GlassListingDetailHeader,
  GlassMetricStrip,
  type GlassBreadcrumbItem,
  type GlassListingMetaItem,
} from '@repo/ui'

import { DeclaredFeaturesSection } from './components/DeclaredFeaturesSection'
import { DocumentsSection } from './components/DocumentsSection'
import { HazardSection } from './components/HazardSection'
import { InfrastructureSection } from './components/InfrastructureSection'
import { ListingDecisionRail } from './components/ListingDecisionRail'
import { ListingEvidenceBrief } from './components/ListingEvidenceBrief'
import { ListingIntro } from './components/ListingIntro'
import { ListingSectionIndex } from './components/ListingSectionIndex'
import { MarketSection } from './components/MarketSection'
import { ParcelSection } from './components/ParcelSection'
import { PlanningAndLegalSection } from './components/PlanningAndLegalSection'
import { SellerSection, type SellerPhoneAnalyticsEvent } from './components/SellerSection'
import { sectionsFor } from './components/listing-sections'
import { hasSellerRevealControl, SELLER_REVEAL_CONTROL_ID } from './components/seller-reveal'
import type { ListingDetailResult } from './data/listing-detail-adapter'
import { hasConflict } from './domain/evidence'
import type { ListingDetail } from './domain/listing-detail-types'
import { metricStripItems } from './domain/listing-detail-view-model'
import { formatArea, formatDate, formatPrice, formatUnitPrice, lifecycleStatus } from './format'
import styles from './ListingDetailWorkspace.module.css'

export interface ListingDetailWorkspaceProps {
  result: ListingDetailResult
  /**
   * Satıcı numarasını istek anında getirir. Sayfa kabuğunda bağlanır;
   * verilmezse satıcı bölümü numara açma kontrolünü hiç render etmez —
   * çalışmayan bir buton gösterilmez.
   */
  onRevealPhone?: () => Promise<string>
  /**
   * Mesaj akışını bağlar. Verilmezse karar rayının birincil eylemi `disabled`
   * render edilir ve gerekçesi rayda görünür kalır (`rules.md` §4).
   */
  onContact?: () => void
  /**
   * "Yanlış bilgi bildir" akışını bağlar. Verilmezse kontrol `disabled`
   * render edilir ve gerekçesi altında yazılır (`rules.md` §4).
   */
  onReportIssue?: () => void
  /** Numara açma olayları (yalnız olay adı; numara asla gönderilmez) */
  onAnalyticsEvent?: (event: SellerPhoneAnalyticsEvent) => void
}

function breadcrumbItems(detail: ListingDetail): GlassBreadcrumbItem[] {
  const root = detail.kind === 'land' ? 'Arsa ilanları' : `${detail.categoryLabel} ilanları`
  return [
    { label: root },
    { label: detail.location.city },
    { label: detail.location.district },
    // Mahalle bilinmiyorsa yol kısalır; boş bir basamak veya ilçe tekrarı
    // uydurulmaz.
    ...(detail.location.neighbourhood ? [{ label: detail.location.neighbourhood }] : []),
    { label: `İlan ${detail.listingNumber}` },
  ]
}

/** Konum satırı yalnız kayıtta bulunan basamakları yazar. */
function locationText(detail: ListingDetail): string {
  const place = `${detail.location.district} / ${detail.location.city}`
  return detail.location.neighbourhood ? `${detail.location.neighbourhood}, ${place}` : place
}

function headerMeta(detail: ListingDetail): GlassListingMetaItem[] {
  const items: GlassListingMetaItem[] = [
    { id: 'location', label: 'Konum', value: locationText(detail) },
  ]

  if (detail.kind === 'generic') {
    items.push({
      id: 'category',
      label: 'Kategori',
      value: `${detail.categoryLabel} · ${detail.transactionLabel}`,
    })
  }

  items.push(
    { id: 'listing-number', label: 'İlan numarası', value: detail.listingNumber },
    { id: 'published', label: 'Yayın tarihi', value: formatDate(detail.publishedAt) },
    {
      id: 'updated',
      label: 'Son güncelleme',
      // Güncelleme kaydı yoksa yayın tarihi "son güncelleme" diye tekrar
      // edilmez: olmayan bir olay bildirilmiş olurdu.
      value: detail.updatedAt
        ? formatDate(detail.updatedAt)
        : 'Bu kayıtta güncelleme tarihi yok',
    },
    { id: 'cutoff', label: 'Kanıt kesiti', value: formatDate(detail.evidenceCutoff) },
  )

  return items
}

/** Birim fiyatın hangi alana dayandığı gizlenmez; çelişki varsa aynı cümlede söylenir. */
function priceNote(detail: ListingDetail): string {
  const declared = formatArea(detail.price.declaredArea)
  if (detail.kind === 'land') {
    const recorded = detail.parcel.area.value
    if (hasConflict(detail.parcel.area) && recorded !== undefined) {
      return `Birim fiyat beyan edilen ${declared} alana göre; kayıtlı yüzölçümü ${formatArea(recorded)}.`
    }
  }
  return `Birim fiyat beyan edilen ${declared} alana göre hesaplandı.`
}

/**
 * Kullanıcıyı satıcı bölümündeki numara kontrolüne taşır.
 *
 * Numara burada açılmaz — açılış sözleşmesi tek bir yerde, `SellerSection`
 * içinde yaşar. Bu yalnız gezinmedir: kontrolü görünür alana getirir ve odağı
 * ona verir. `prefers-reduced-motion` altında kaydırma anidir.
 */
function goToSellerRevealControl(): void {
  const target = document.getElementById(SELLER_REVEAL_CONTROL_ID)
  if (!target) return

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  // jsdom `scrollIntoView`'ı uygulamaz; odak taşıma kaydırmadan bağımsız çalışır.
  target.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
  target.focus()
}

/**
 * İlan detayının Yön A yerleşimi.
 *
 * Cam bütçesi sayfa başına altı yüzeydir; bu çalışma alanı üçünü açar
 * (kategori yolu, bölüm indeksi, karar rayı). Başlık, gösterge şeridi ve
 * bütün kanıt bölümleri içerik katmanındadır — düz yüzey kullanır.
 *
 * Bölümler DOM'da kalır: indeks bir tab seti değil, çapa gezinmesidir.
 */
export function ListingDetailWorkspace({
  result,
  onRevealPhone,
  onContact,
  onReportIssue,
  onAnalyticsEvent,
}: ListingDetailWorkspaceProps) {
  const { detail, sections, aiBrief } = result

  return (
    // `.page` yalnız sorgu kabıdır: `.shell` kendi kabı olsaydı kendi dolgusunu
    // `@container` ile daraltamazdı (bkz. ListingDetailWorkspace.module.css).
    <div className={styles.page}>
      <main className={styles.shell}>
        <GlassBreadcrumb items={breadcrumbItems(detail)} className={styles.crumbs} />

        <GlassListingDetailHeader
          title={detail.title}
          price={formatPrice(detail.price.amount)}
          priceUnit={formatUnitPrice(detail.price.unitPrice)}
          priceNote={priceNote(detail)}
          status={lifecycleStatus(detail.lifecycle)}
          meta={headerMeta(detail)}
        />

        <ListingIntro detail={detail} mapSection={sections.map} />
        <ListingSectionIndex sections={sectionsFor(detail)} />

        <div className={styles.body}>
          <div className={styles.flow}>
            <ListingEvidenceBrief brief={aiBrief} detail={detail} onReportIssue={onReportIssue} />
            <GlassMetricStrip
              items={metricStripItems(detail)}
              label="Temel göstergeler"
              className={styles.metrics}
            />
            {/* Arsa kanıt paketi yalnız defteri olan ilanda açılır; yansıtılmış
                ilanda o bölümler render edilmez, boş kabuk olarak da durmaz. */}
            {detail.kind === 'land' ? (
              <>
                <ParcelSection detail={detail} mapSection={sections.map} />
                <PlanningAndLegalSection detail={detail} />
                <InfrastructureSection detail={detail} />
                <HazardSection detail={detail} />
                <MarketSection detail={detail} />
              </>
            ) : (
              <DeclaredFeaturesSection detail={detail} />
            )}
            <DocumentsSection detail={detail} />
          </div>
          <ListingDecisionRail
            detail={detail}
            onContact={onContact}
            onGoToSeller={
              hasSellerRevealControl(detail, onRevealPhone) ? goToSellerRevealControl : undefined
            }
          />
        </div>

        <SellerSection
          detail={detail}
          onRevealPhone={onRevealPhone}
          onAnalyticsEvent={onAnalyticsEvent}
        />
      </main>
    </div>
  )
}
