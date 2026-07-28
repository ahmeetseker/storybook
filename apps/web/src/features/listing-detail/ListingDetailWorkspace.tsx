import {
  GlassBreadcrumb,
  GlassListingDetailHeader,
  GlassMetricStrip,
  type GlassBreadcrumbItem,
  type GlassListingMetaItem,
} from '@repo/ui'

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
import { SellerSection } from './components/SellerSection'
import type { ListingDetailResult } from './data/listing-detail-adapter'
import { hasConflict } from './domain/evidence'
import type { ListingDetail } from './domain/listing-detail-types'
import { metricStripItems } from './domain/listing-detail-view-model'
import { formatArea, formatDate, formatPrice, formatUnitPrice, lifecycleStatus } from './format'
import styles from './ListingDetailWorkspace.module.css'

export interface ListingDetailWorkspaceProps {
  result: ListingDetailResult
}

function breadcrumbItems(detail: ListingDetail): GlassBreadcrumbItem[] {
  return [
    { label: 'Arsa ilanları' },
    { label: detail.location.city },
    { label: detail.location.district },
    { label: detail.location.neighbourhood },
    { label: `İlan ${detail.listingNumber}` },
  ]
}

function headerMeta(detail: ListingDetail): GlassListingMetaItem[] {
  return [
    {
      id: 'location',
      label: 'Konum',
      value: `${detail.location.neighbourhood}, ${detail.location.district} / ${detail.location.city}`,
    },
    { id: 'listing-number', label: 'İlan numarası', value: detail.listingNumber },
    { id: 'published', label: 'Yayın tarihi', value: formatDate(detail.publishedAt) },
    { id: 'updated', label: 'Son güncelleme', value: formatDate(detail.updatedAt) },
    { id: 'cutoff', label: 'Kanıt kesiti', value: formatDate(detail.evidenceCutoff) },
  ]
}

/** Birim fiyatın hangi alana dayandığı gizlenmez; çelişki varsa aynı cümlede söylenir. */
function priceNote(detail: ListingDetail): string {
  const declared = formatArea(detail.price.declaredArea)
  const recorded = detail.parcel.area.value
  if (hasConflict(detail.parcel.area) && recorded !== undefined) {
    return `Birim fiyat beyan edilen ${declared} alana göre; kayıtlı yüzölçümü ${formatArea(recorded)}.`
  }
  return `Birim fiyat beyan edilen ${declared} alana göre hesaplandı.`
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
export function ListingDetailWorkspace({ result }: ListingDetailWorkspaceProps) {
  const { detail, sections, aiBrief } = result

  return (
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
      <ListingSectionIndex />

      <div className={styles.body}>
        <div className={styles.flow}>
          <ListingEvidenceBrief brief={aiBrief} detail={detail} />
          <GlassMetricStrip
            items={metricStripItems(detail)}
            label="Temel göstergeler"
            className={styles.metrics}
          />
          <ParcelSection detail={detail} mapSection={sections.map} />
          <PlanningAndLegalSection detail={detail} />
          <InfrastructureSection detail={detail} />
          <HazardSection detail={detail} />
          <MarketSection detail={detail} />
          <DocumentsSection detail={detail} />
        </div>
        <ListingDecisionRail detail={detail} />
      </div>

      <SellerSection />
    </main>
  )
}
