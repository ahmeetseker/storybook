import type { AdvisorStatus } from '../domain/advisor-reducer'
import type {
  AdvisorCriterionRemoval,
  AdvisorFeature,
  AdvisorMatch,
  AdvisorProposal,
  AdvisorPropertyType,
} from '../domain/advisor-types'
import { AdvisorListingCard } from './AdvisorListingCard'
import styles from './AdvisorPanels.module.css'

export interface AdvisorResultsProps {
  /** Sonuç alanının güncel durumu. */
  status: AdvisorStatus
  /** Mevcut sorgu yorumu. */
  proposal?: AdvisorProposal
  /** Sıralanmış ilan eşleşmeleri. */
  matches: AdvisorMatch[]
  /** Favorideki ilan kimlikleri. */
  favoriteIds: readonly string[]
  /** Karşılaştırmadaki ilan kimlikleri. */
  compareIds: readonly string[]
  /** Son analiz hatasının kullanıcıya gösterilecek açıklaması. */
  error?: string
  /** Başarısız analiz yeniden denenmek istendiğinde çağrılır. */
  onRetry: () => void
  /** Kriter düzenleme yüzeyi açılmak istendiğinde çağrılır. */
  onEditCriteria: () => void
  /** Tek bir kriter kaldırılmak istendiğinde çağrılır. */
  onRemoveCriterion: (removal: AdvisorCriterionRemoval) => void
  /** İlan ayrıntısı açılmak istendiğinde ilan kimliğiyle çağrılır. */
  onOpenListing: (listingId: string) => void
  /** Favori durumu değiştirilmek istendiğinde ilan kimliğiyle çağrılır. */
  onToggleFavorite: (listingId: string) => void
  /** Karşılaştırma durumu değiştirilmek istendiğinde ilan kimliğiyle çağrılır. */
  onToggleCompare: (listingId: string) => void
  /** Öneri gerekçesi istenen ilan kimliğiyle çağrılır. */
  onExplainListing: (listingId: string) => void
  /** Benzerleri istenen ilan kimliğiyle çağrılır. */
  onShowSimilar: (listingId: string) => void
}

const FEATURE_LABELS: Record<AdvisorFeature, string> = {
  zoning: 'Konut imarlı',
  'detached-deed': 'Müstakil tapu',
  sea: 'Denize yakın',
  road: 'Yola cepheli',
  transport: 'Ulaşıma yakın',
  'quiet-life': 'Sakin yaşam',
  'family-life': 'Aile yaşamına uygun',
  'rental-yield': 'Kira getirisi',
}

const PROPERTY_TYPE_LABELS: Record<AdvisorPropertyType, string> = {
  residential: 'Konut',
  land: 'Arsa',
  commercial: 'İş Yeri',
  building: 'Bina',
  timeshare: 'Devremülk',
  touristic: 'Turistik Tesis',
}

function getPrimaryConstraint(
  proposal: AdvisorProposal,
): { label: string; removal: AdvisorCriterionRemoval } | undefined {
  const [requiredFeature] = proposal.criteria.mustHave
  if (requiredFeature) {
    return {
      label: `Zorunlu özellik — ${FEATURE_LABELS[requiredFeature]}`,
      removal: { key: 'mustHave', feature: requiredFeature },
    }
  }
  if (proposal.criteria.district) {
    const district = proposal.criteria.district
    const value = `${district.charAt(0).toLocaleUpperCase('tr-TR')}${district.slice(1)}`
    return { label: `İlçe — ${value}`, removal: { key: 'district' } }
  }
  if (proposal.criteria.city) {
    const city = proposal.criteria.city
    const value = `${city.charAt(0).toLocaleUpperCase('tr-TR')}${city.slice(1)}`
    return { label: `Şehir — ${value}`, removal: { key: 'city' } }
  }
  if (proposal.criteria.propertyTypes.length > 0) {
    return {
      label: `Emlak türü — ${proposal.criteria.propertyTypes
        .map((type) => PROPERTY_TYPE_LABELS[type])
        .join(', ')}`,
      removal: { key: 'propertyTypes' },
    }
  }
  if (proposal.criteria.budget.max !== undefined) {
    return {
      label: `En yüksek bütçe — ${proposal.criteria.budget.max.toLocaleString('tr-TR')} TL`,
      removal: { key: 'budgetMax' },
    }
  }
  if (proposal.criteria.budget.min !== undefined) {
    return {
      label: `En düşük bütçe — ${proposal.criteria.budget.min.toLocaleString('tr-TR')} TL`,
      removal: { key: 'budgetMin' },
    }
  }
  if (proposal.criteria.area.min !== undefined) {
    return {
      label: `En düşük alan — ${proposal.criteria.area.min.toLocaleString('tr-TR')} m²`,
      removal: { key: 'areaMin' },
    }
  }
  if (proposal.criteria.area.max !== undefined) {
    return {
      label: `En yüksek alan — ${proposal.criteria.area.max.toLocaleString('tr-TR')} m²`,
      removal: { key: 'areaMax' },
    }
  }
  if (proposal.criteria.rooms) {
    return {
      label: `Oda sayısı — ${proposal.criteria.rooms}`,
      removal: { key: 'rooms' },
    }
  }
  const [preference] = proposal.criteria.preferences
  if (preference) {
    return {
      label: `Tercih — ${FEATURE_LABELS[preference]}`,
      removal: { key: 'preferences', feature: preference },
    }
  }
  return undefined
}

function ResultSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={styles.resultSkeleton}
      data-advisor-skeleton
      data-featured={featured || undefined}
      aria-hidden="true"
    >
      <div
        className={styles.skeletonMedia}
        data-skeleton-section="media"
      />
      <div className={styles.skeletonBody}>
        <div
          className={styles.skeletonIdentity}
          data-skeleton-section="identity"
        >
          <span className={styles.skeletonLine} data-size="short" />
          <span className={styles.skeletonLine} data-size="long" />
          <span className={styles.skeletonLine} data-size="medium" />
        </div>
        <div
          className={styles.skeletonMetrics}
          data-skeleton-section="metrics"
        >
          <span />
          <span />
          <span />
        </div>
        <div
          className={styles.skeletonMatch}
          data-skeleton-section="match"
        >
          <span className={styles.skeletonLine} data-size="short" />
          <span className={styles.skeletonLine} data-size="long" />
        </div>
        <div
          className={styles.skeletonHighlights}
          data-skeleton-section="highlights"
        >
          <span />
          <span />
          <span />
        </div>
        <div
          className={styles.skeletonActions}
          data-skeleton-section="actions"
        >
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </article>
  )
}

export function AdvisorResults({
  status,
  proposal,
  matches,
  favoriteIds,
  compareIds,
  error,
  onRetry,
  onEditCriteria,
  onRemoveCriterion,
  onOpenListing,
  onToggleFavorite,
  onToggleCompare,
  onExplainListing,
  onShowSimilar,
}: AdvisorResultsProps) {
  if (status === 'idle') return null

  if (status === 'analyzing') {
    return (
      <section
        className={styles.results}
        data-advisor-results-state="analyzing"
        aria-hidden="true"
      >
        <h2>İlanlar değerlendiriliyor</h2>
        <p className={styles.supportingText}>
          Eşleşmeler karar verileriyle birlikte hazırlanıyor.
        </p>
        <div className={styles.skeletonGrid}>
          <ResultSkeleton featured />
          <ResultSkeleton />
          <ResultSkeleton />
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className={styles.inlineState} role="alert">
        <h2>Sonuçlar getirilemedi</h2>
        <p>{error ?? 'Beklenmeyen bir sorun oluştu.'}</p>
        <div className={styles.inlineActions}>
          <button type="button" className={styles.flatAction} onClick={onRetry}>
            Yeniden dene
          </button>
          <button
            type="button"
            className={styles.textAction}
            onClick={onEditCriteria}
          >
            Kriterleri düzenle
          </button>
        </div>
      </section>
    )
  }

  if (status === 'empty') {
    const constraint = proposal ? getPrimaryConstraint(proposal) : undefined
    return (
      <section className={styles.inlineState} aria-labelledby="advisor-empty-title">
        <h2 id="advisor-empty-title">Bu ölçütlerle eşleşme bulunamadı</h2>
        <p>
          En etkili kısıtlardan birini kaldırarak arama alanını genişletebilirsiniz.
        </p>
        <div className={styles.inlineActions}>
          {constraint ? (
            <button
              type="button"
              className={styles.flatAction}
              aria-label={`Kriteri kaldır: ${constraint.label}`}
              onClick={() => onRemoveCriterion(constraint.removal)}
            >
              Bu kriteri kaldır
            </button>
          ) : null}
          <button
            type="button"
            className={styles.textAction}
            onClick={onEditCriteria}
          >
            Kriterleri düzenle
          </button>
        </div>
      </section>
    )
  }

  const [featured, ...alternatives] = matches
  if (!featured) {
    return (
      <section className={styles.inlineState} aria-labelledby="advisor-empty-title">
        <h2 id="advisor-empty-title">Henüz gösterilecek ilan yok</h2>
        <button
          type="button"
          className={styles.textAction}
          onClick={onEditCriteria}
        >
          Kriterleri düzenle
        </button>
      </section>
    )
  }

  const renderCard = (match: AdvisorMatch, featuredCard: boolean) => {
    const listingId = match.listing.id
    return (
      <AdvisorListingCard
        key={listingId}
        match={match}
        featured={featuredCard}
        favorite={favoriteIds.includes(listingId)}
        compared={compareIds.includes(listingId)}
        onOpen={() => onOpenListing(listingId)}
        onFavorite={() => onToggleFavorite(listingId)}
        onCompare={() => onToggleCompare(listingId)}
        onExplain={() => onExplainListing(listingId)}
        onSimilar={() => onShowSimilar(listingId)}
      />
    )
  }

  return (
    <section className={styles.results} aria-label="İlan önerileri">
      <section
        className={styles.resultGroup}
        data-flow-section="featured"
      >
        <h2>Öne çıkan ilan</h2>
        {renderCard(featured, true)}
      </section>
      {alternatives.length > 0 ? (
        <section
          className={styles.resultGroup}
          data-flow-section="alternatives"
        >
          <h2>Güçlü alternatifler</h2>
          <div className={styles.alternativeGrid}>
            {alternatives.map((match) => renderCard(match, false))}
          </div>
        </section>
      ) : null}
    </section>
  )
}
