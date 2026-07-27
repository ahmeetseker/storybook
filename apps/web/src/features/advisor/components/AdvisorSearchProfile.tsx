import type {
  AdvisorCriterionRemoval,
  AdvisorFeature,
  AdvisorProposal,
  AdvisorPropertyType,
} from '../domain/advisor-types'
import styles from './AdvisorPanels.module.css'

export interface AdvisorSearchProfileProps {
  /** Kullanıcı sorgusundan yorumlanan arama profili. */
  proposal: AdvisorProposal
  /** Kriter düzenleme yüzeyi açılmak istendiğinde çağrılır. */
  onEditCriteria: () => void
  /** Tek bir kriter kaldırılmak istendiğinde çağrılır. */
  onRemoveCriterion: (removal: AdvisorCriterionRemoval) => void
}

interface CriterionRow {
  id: string
  label: string
  value: string
  removal?: AdvisorCriterionRemoval
}

const INTENT_LABELS = {
  buy: 'Satılık',
  rent: 'Kiralık',
  invest: 'Yatırım',
} as const

const PROPERTY_TYPE_LABELS: Record<AdvisorPropertyType, string> = {
  residential: 'Konut',
  land: 'Arsa',
  commercial: 'İş Yeri',
  building: 'Bina',
  timeshare: 'Devremülk',
  touristic: 'Turistik Tesis',
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

const formatCurrency = (value: number) =>
  `${value.toLocaleString('tr-TR')} TL`

const formatArea = (value: number) =>
  `${value.toLocaleString('tr-TR')} m²`

const formatPlace = (value: string) =>
  `${value.charAt(0).toLocaleUpperCase('tr-TR')}${value.slice(1)}`

function getCriterionRows(proposal: AdvisorProposal): CriterionRow[] {
  const { criteria } = proposal
  const rows: CriterionRow[] = [
    {
      id: 'intent',
      label: 'İşlem',
      value: INTENT_LABELS[criteria.intent],
    },
  ]

  if (criteria.city) {
    rows.push({
      id: 'city',
      label: 'Şehir',
      value: formatPlace(criteria.city),
      removal: { key: 'city' },
    })
  }
  if (criteria.district) {
    rows.push({
      id: 'district',
      label: 'İlçe',
      value: formatPlace(criteria.district),
      removal: { key: 'district' },
    })
  }
  if (criteria.propertyTypes.length > 0) {
    rows.push({
      id: 'propertyTypes',
      label: 'Emlak türü',
      value: criteria.propertyTypes.map((type) => PROPERTY_TYPE_LABELS[type]).join(', '),
      removal: { key: 'propertyTypes' },
    })
  }
  if (criteria.budget.min !== undefined) {
    rows.push({
      id: 'budgetMin',
      label: 'En düşük bütçe',
      value: formatCurrency(criteria.budget.min),
      removal: { key: 'budgetMin' },
    })
  }
  if (criteria.budget.max !== undefined) {
    rows.push({
      id: 'budgetMax',
      label: 'En yüksek bütçe',
      value: formatCurrency(criteria.budget.max),
      removal: { key: 'budgetMax' },
    })
  }
  if (criteria.area.min !== undefined) {
    rows.push({
      id: 'areaMin',
      label: 'En düşük alan',
      value: formatArea(criteria.area.min),
      removal: { key: 'areaMin' },
    })
  }
  if (criteria.area.max !== undefined) {
    rows.push({
      id: 'areaMax',
      label: 'En yüksek alan',
      value: formatArea(criteria.area.max),
      removal: { key: 'areaMax' },
    })
  }
  if (criteria.rooms) {
    rows.push({
      id: 'rooms',
      label: 'Oda sayısı',
      value: criteria.rooms,
      removal: { key: 'rooms' },
    })
  }

  criteria.mustHave.forEach((feature) => {
    rows.push({
      id: `mustHave-${feature}`,
      label: 'Zorunlu özellik',
      value: FEATURE_LABELS[feature],
      removal: { key: 'mustHave', feature },
    })
  })
  criteria.preferences.forEach((feature) => {
    rows.push({
      id: `preferences-${feature}`,
      label: 'Tercih',
      value: FEATURE_LABELS[feature],
      removal: { key: 'preferences', feature },
    })
  })

  return rows
}

export function AdvisorSearchProfile({
  proposal,
  onEditCriteria,
  onRemoveCriterion,
}: AdvisorSearchProfileProps) {
  const rows = getCriterionRows(proposal)

  return (
    <section
      className={styles.profile}
      aria-labelledby="advisor-profile-title"
      data-flow-section="profile"
    >
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="advisor-profile-title">Arama profili</h2>
          <p>%{proposal.interpretationConfidence} yorum güveni</p>
        </div>
      </div>

      <dl className={styles.criteriaList}>
        {rows.map((row) => {
          const accessibleName = `${row.label} — ${row.value}`
          return (
            <div key={row.id} className={styles.criterionRow}>
              <div className={styles.criterionCopy}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.textAction}
                  aria-label={`Kriteri düzenle: ${accessibleName}`}
                  onClick={onEditCriteria}
                >
                  Düzenle
                </button>
                {row.removal ? (
                  <button
                    type="button"
                    className={styles.textAction}
                    aria-label={`Kriteri kaldır: ${accessibleName}`}
                    onClick={() => onRemoveCriterion(row.removal!)}
                  >
                    Kaldır
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
