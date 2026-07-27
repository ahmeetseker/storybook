import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  GlassButton,
  GlassDrawer,
  GlassSelect,
  type GlassSelectOption,
} from '@repo/ui'
import { getRepresentativeListingImage } from '../../listings/data/listing-photos'
import type {
  AdvisorHistoryEntry,
  AdvisorOverlay,
} from '../domain/advisor-reducer'
import type {
  AdvisorCriteria,
  AdvisorFeature,
  AdvisorMatch,
  AdvisorPropertyType,
  AdvisorProposal,
} from '../domain/advisor-types'
import styles from './AdvisorPanels.module.css'

export interface AdvisorDrawersProps {
  /** Reducer tarafından kontrol edilen tek açık overlay. */
  overlay?: AdvisorOverlay
  /** Düzenlenecek güncel arama önerisi. */
  proposal?: AdvisorProposal
  /** Güven yüzeyinde açıklanacak güncel eşleşmeler. */
  matches: readonly AdvisorMatch[]
  /** İlan drawer'ında gösterilecek seçili eşleşme. */
  selectedMatch?: AdvisorMatch
  /** Danışmanla paylaşım kapsamında gösterilecek ilan kimlikleri. */
  compareIds: readonly string[]
  /** Oturum içinde kaydedilen karar ve izin kayıtları. */
  history: readonly AdvisorHistoryEntry[]
  /** Güncel yerel paylaşım onayı durumu. */
  consentStatus: 'idle' | 'approved' | 'rejected'
  /** Herhangi bir drawer kapatılmak istendiğinde çağrılır. */
  onClose: () => void
  /** Kopyalanmış kriter taslağı uygulanmak istendiğinde çağrılır. */
  onApplyCriteria: (proposal: AdvisorProposal) => void
  /** İnsan danışman paylaşım önizlemesi onaylandığında çağrılır. */
  onApproveConsent: () => void
  /** İnsan danışman paylaşım önizlemesinden vazgeçildiğinde çağrılır. */
  onRejectConsent: () => void
}

const INTENT_OPTIONS: GlassSelectOption[] = [
  { value: 'buy', label: 'Satın alma' },
  { value: 'rent', label: 'Kiralama' },
  { value: 'invest', label: 'Yatırım' },
]

const CITY_OPTIONS: GlassSelectOption[] = [
  { value: '', label: 'Tüm şehirler' },
  { value: 'izmir', label: 'İzmir' },
  { value: 'istanbul', label: 'İstanbul' },
  { value: 'ankara', label: 'Ankara' },
  { value: 'bursa', label: 'Bursa' },
  { value: 'antalya', label: 'Antalya' },
  { value: 'muğla', label: 'Muğla' },
]

const EMPTY_DISTRICT_OPTION: GlassSelectOption = {
  value: '',
  label: 'Tüm ilçeler',
}

const DISTRICT_OPTIONS_BY_CITY: Record<string, GlassSelectOption[]> = {
  izmir: [
    { value: 'urla', label: 'Urla' },
    { value: 'çeşme', label: 'Çeşme' },
    { value: 'bayraklı', label: 'Bayraklı' },
    { value: 'konak', label: 'Konak' },
  ],
  istanbul: [
    { value: 'kadıköy', label: 'Kadıköy' },
    { value: 'ataşehir', label: 'Ataşehir' },
  ],
  ankara: [
    { value: 'gölbaşı', label: 'Gölbaşı' },
    { value: 'çankaya', label: 'Çankaya' },
  ],
  bursa: [{ value: 'nilüfer', label: 'Nilüfer' }],
  antalya: [{ value: 'kaş', label: 'Kaş' }],
  muğla: [{ value: 'bodrum', label: 'Bodrum' }],
}

const PROPERTY_TYPE_OPTIONS: Array<{
  value: AdvisorPropertyType
  label: string
}> = [
  { value: 'land', label: 'Arsa' },
  { value: 'residential', label: 'Konut' },
  { value: 'commercial', label: 'İş yeri' },
  { value: 'building', label: 'Bina' },
  { value: 'timeshare', label: 'Devremülk' },
  { value: 'touristic', label: 'Turistik tesis' },
]

const STRUCTURAL_OPTIONS: Array<{
  value: AdvisorFeature
  label: string
}> = [
  { value: 'zoning', label: 'Konut imarı' },
  { value: 'detached-deed', label: 'Müstakil tapu' },
  { value: 'road', label: 'Yol cephesi' },
]

const PREFERENCE_OPTIONS: Array<{
  value: AdvisorFeature
  label: string
}> = [
  { value: 'sea', label: 'Denize yakınlık' },
  { value: 'transport', label: 'Ulaşıma yakınlık' },
  { value: 'quiet-life', label: 'Sakin yaşam' },
  { value: 'family-life', label: 'Aile yaşamı' },
  { value: 'rental-yield', label: 'Kira getirisi' },
]

const FEATURE_OPTIONS = [...STRUCTURAL_OPTIONS, ...PREFERENCE_OPTIONS]

const EVIDENCE_STATUS_LABELS = {
  verified: 'Doğrulandı',
  review: 'İnceleme gerekiyor',
  missing: 'Bilgi sağlanmadı',
} as const

const INTENT_LABELS: Record<AdvisorCriteria['intent'], string> = {
  buy: 'Satın alma',
  rent: 'Kiralama',
  invest: 'Yatırım',
}

const PROPERTY_TYPE_LABELS = Object.fromEntries(
  PROPERTY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<AdvisorPropertyType, string>

const FEATURE_LABELS = Object.fromEntries(
  FEATURE_OPTIONS.map((option) => [
    option.value,
    option.label,
  ]),
) as Record<AdvisorFeature, string>

type NumericCriteriaField =
  | 'budgetMin'
  | 'budgetMax'
  | 'areaMin'
  | 'areaMax'

type CriteriaErrorField = NumericCriteriaField | 'district'

type CriteriaErrors = Partial<Record<CriteriaErrorField, string>>

function getDistrictOptions(city?: string): GlassSelectOption[] {
  const cityOptions = city
    ? DISTRICT_OPTIONS_BY_CITY[city] ?? []
    : Object.values(DISTRICT_OPTIONS_BY_CITY).flat()
  return [EMPTY_DISTRICT_OPTION, ...cityOptions]
}

function validateCriteria(criteria: AdvisorCriteria): CriteriaErrors {
  const errors: CriteriaErrors = {}
  const negativeMessage = 'Değer sıfırdan küçük olamaz.'

  if (
    criteria.city &&
    criteria.district &&
    !getDistrictOptions(criteria.city).some(
      (option) => option.value === criteria.district,
    )
  ) {
    errors.district = 'Seçilen ilçe şehirle uyumlu değil.'
  }

  if (criteria.budget.min !== undefined && criteria.budget.min < 0) {
    errors.budgetMin = negativeMessage
  }
  if (criteria.budget.max !== undefined && criteria.budget.max < 0) {
    errors.budgetMax = negativeMessage
  }
  if (criteria.area.min !== undefined && criteria.area.min < 0) {
    errors.areaMin = negativeMessage
  }
  if (criteria.area.max !== undefined && criteria.area.max < 0) {
    errors.areaMax = negativeMessage
  }

  if (
    errors.budgetMin === undefined &&
    errors.budgetMax === undefined &&
    criteria.budget.min !== undefined &&
    criteria.budget.max !== undefined &&
    criteria.budget.min > criteria.budget.max
  ) {
    const message = 'Minimum bütçe maksimum bütçeyi aşamaz.'
    errors.budgetMin = message
    errors.budgetMax = message
  }

  if (
    errors.areaMin === undefined &&
    errors.areaMax === undefined &&
    criteria.area.min !== undefined &&
    criteria.area.max !== undefined &&
    criteria.area.min > criteria.area.max
  ) {
    const message = 'Minimum alan maksimum alanı aşamaz.'
    errors.areaMin = message
    errors.areaMax = message
  }

  return errors
}

function cloneProposal(proposal: AdvisorProposal): AdvisorProposal {
  return {
    ...proposal,
    criteria: {
      ...proposal.criteria,
      propertyTypes: [...proposal.criteria.propertyTypes],
      budget: { ...proposal.criteria.budget },
      area: { ...proposal.criteria.area },
      mustHave: [...proposal.criteria.mustHave],
      preferences: [...proposal.criteria.preferences],
    },
    clarification: proposal.clarification
      ? { ...proposal.clarification }
      : undefined,
  }
}

function numericValue(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toggleValue<T extends string>(
  values: readonly T[],
  value: T,
  checked: boolean,
): T[] {
  if (checked) return values.includes(value) ? [...values] : [...values, value]
  return values.filter((item) => item !== value)
}

function formatMetric(value: number, unit: string): string {
  return `${value.toLocaleString('tr-TR')} ${unit}`
}

function titleCase(value: string): string {
  return value.slice(0, 1).toLocaleUpperCase('tr-TR') + value.slice(1)
}

function criteriaSummary(
  criteria: AdvisorCriteria,
): Array<{ label: string; value: string }> {
  const items: Array<{ label: string; value: string } | undefined> = [
    { label: 'İşlem amacı', value: INTENT_LABELS[criteria.intent] },
    criteria.city
      ? { label: 'Şehir', value: titleCase(criteria.city) }
      : undefined,
    criteria.district
      ? { label: 'İlçe', value: titleCase(criteria.district) }
      : undefined,
    criteria.propertyTypes.length > 0
      ? {
          label: 'Emlak türleri',
          value: criteria.propertyTypes
            .map((type) => PROPERTY_TYPE_LABELS[type])
            .join(', '),
        }
      : undefined,
    criteria.budget.min !== undefined
      ? {
          label: 'Minimum bütçe',
          value: formatMetric(criteria.budget.min, 'TL'),
        }
      : undefined,
    criteria.budget.max !== undefined
      ? {
          label: 'Maksimum bütçe',
          value: formatMetric(criteria.budget.max, 'TL'),
        }
      : undefined,
    criteria.area.min !== undefined
      ? {
          label: 'Minimum alan',
          value: formatMetric(criteria.area.min, 'm²'),
        }
      : undefined,
    criteria.area.max !== undefined
      ? {
          label: 'Maksimum alan',
          value: formatMetric(criteria.area.max, 'm²'),
        }
      : undefined,
    criteria.rooms
      ? { label: 'Oda sayısı', value: criteria.rooms }
      : undefined,
    criteria.mustHave.length > 0
      ? {
          label: 'Zorunlu özellikler',
          value: criteria.mustHave
            .map((feature) => FEATURE_LABELS[feature])
            .join(', '),
        }
      : undefined,
    criteria.preferences.length > 0
      ? {
          label: 'Tercihler',
          value: criteria.preferences
            .map((feature) => FEATURE_LABELS[feature])
            .join(', '),
        }
      : undefined,
  ]

  return items.filter(
    (item): item is { label: string; value: string } => item !== undefined,
  )
}

function CloseAction({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className={styles.closeAction}
      onClick={onClose}
    >
      Kapat
    </button>
  )
}

function CriteriaFields({
  draft,
  errors,
  onChange,
}: {
  draft: AdvisorProposal
  errors: CriteriaErrors
  onChange: (criteria: AdvisorCriteria) => void
}) {
  const { criteria } = draft
  const districtOptions = getDistrictOptions(criteria.city)
  const patchCriteria = (patch: Partial<AdvisorCriteria>) =>
    onChange({ ...criteria, ...patch })
  const numericError = (
    field: NumericCriteriaField,
    errorId: string,
  ) => ({
    'aria-invalid': Boolean(errors[field]) || undefined,
    'aria-describedby': errors[field] ? errorId : undefined,
  })

  return (
    <div className={styles.drawerStack}>
      <div className={styles.drawerField}>
        <span className={styles.fieldLabel}>İşlem amacı</span>
        <GlassSelect
          material="flat"
          aria-label="İşlem amacı"
          options={INTENT_OPTIONS}
          value={criteria.intent}
          onChange={(intent) =>
            patchCriteria({ intent: intent as AdvisorCriteria['intent'] })
          }
        />
      </div>

      <div className={styles.drawerFieldGrid}>
        <div className={styles.drawerField}>
          <span className={styles.fieldLabel}>Şehir</span>
          <GlassSelect
            material="flat"
            aria-label="Şehir"
            options={CITY_OPTIONS}
            value={criteria.city ?? ''}
            onChange={(city) => {
              const nextCity = city || undefined
              const nextDistrictOptions = getDistrictOptions(nextCity)
              const districtIsCompatible = nextDistrictOptions.some(
                (option) => option.value === criteria.district,
              )
              patchCriteria({
                city: nextCity,
                district: districtIsCompatible
                  ? criteria.district
                  : undefined,
              })
            }}
          />
        </div>
        <div className={styles.drawerField}>
          <span className={styles.fieldLabel}>İlçe</span>
          <GlassSelect
            material="flat"
            aria-label="İlçe"
            aria-describedby={
              errors.district
                ? 'advisor-criteria-district-error'
                : undefined
            }
            invalid={Boolean(errors.district)}
            options={districtOptions}
            value={criteria.district ?? ''}
            onChange={(district) =>
              patchCriteria({ district: district || undefined })
            }
          />
          {errors.district ? (
            <p
              id="advisor-criteria-district-error"
              className={styles.fieldError}
            >
              {errors.district}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.drawerFieldGrid}>
        <label className={styles.drawerField}>
          <span className={styles.fieldLabel}>Minimum bütçe</span>
          <input
            {...numericError(
              'budgetMin',
              'advisor-criteria-budget-min-error',
            )}
            className={styles.drawerInput}
            type="number"
            min="0"
            inputMode="numeric"
            value={criteria.budget.min ?? ''}
            onChange={(event) =>
              patchCriteria({
                budget: {
                  ...criteria.budget,
                  min: numericValue(event.currentTarget.value),
                },
              })
            }
          />
          {errors.budgetMin ? (
            <p
              id="advisor-criteria-budget-min-error"
              className={styles.fieldError}
            >
              {errors.budgetMin}
            </p>
          ) : null}
        </label>
        <label className={styles.drawerField}>
          <span className={styles.fieldLabel}>Maksimum bütçe</span>
          <input
            {...numericError(
              'budgetMax',
              'advisor-criteria-budget-max-error',
            )}
            className={styles.drawerInput}
            type="number"
            min="0"
            inputMode="numeric"
            value={criteria.budget.max ?? ''}
            onChange={(event) =>
              patchCriteria({
                budget: {
                  ...criteria.budget,
                  max: numericValue(event.currentTarget.value),
                },
              })
            }
          />
          {errors.budgetMax ? (
            <p
              id="advisor-criteria-budget-max-error"
              className={styles.fieldError}
            >
              {errors.budgetMax}
            </p>
          ) : null}
        </label>
      </div>

      <div className={styles.drawerFieldGrid}>
        <label className={styles.drawerField}>
          <span className={styles.fieldLabel}>Minimum alan</span>
          <input
            {...numericError(
              'areaMin',
              'advisor-criteria-area-min-error',
            )}
            className={styles.drawerInput}
            type="number"
            min="0"
            inputMode="numeric"
            value={criteria.area.min ?? ''}
            onChange={(event) =>
              patchCriteria({
                area: {
                  ...criteria.area,
                  min: numericValue(event.currentTarget.value),
                },
              })
            }
          />
          {errors.areaMin ? (
            <p
              id="advisor-criteria-area-min-error"
              className={styles.fieldError}
            >
              {errors.areaMin}
            </p>
          ) : null}
        </label>
        <label className={styles.drawerField}>
          <span className={styles.fieldLabel}>Maksimum alan</span>
          <input
            {...numericError(
              'areaMax',
              'advisor-criteria-area-max-error',
            )}
            className={styles.drawerInput}
            type="number"
            min="0"
            inputMode="numeric"
            value={criteria.area.max ?? ''}
            onChange={(event) =>
              patchCriteria({
                area: {
                  ...criteria.area,
                  max: numericValue(event.currentTarget.value),
                },
              })
            }
          />
          {errors.areaMax ? (
            <p
              id="advisor-criteria-area-max-error"
              className={styles.fieldError}
            >
              {errors.areaMax}
            </p>
          ) : null}
        </label>
      </div>

      <label className={styles.drawerField}>
        <span className={styles.fieldLabel}>Oda sayısı</span>
        <input
          className={styles.drawerInput}
          value={criteria.rooms ?? ''}
          onChange={(event) =>
            patchCriteria({ rooms: event.currentTarget.value || undefined })
          }
        />
      </label>

      <fieldset className={styles.drawerFieldset}>
        <legend>Emlak türleri</legend>
        <div className={styles.checkboxGrid}>
          {PROPERTY_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={criteria.propertyTypes.includes(option.value)}
                onChange={(event) =>
                  patchCriteria({
                    propertyTypes: toggleValue(
                      criteria.propertyTypes,
                      option.value,
                      event.currentTarget.checked,
                    ),
                  })
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.drawerFieldset}>
        <legend>Zorunlu özellikler</legend>
        <div className={styles.checkboxGrid}>
          {FEATURE_OPTIONS.map((option) => (
            <label key={option.value} className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={criteria.mustHave.includes(option.value)}
                onChange={(event) =>
                  patchCriteria({
                    mustHave: toggleValue(
                      criteria.mustHave,
                      option.value,
                      event.currentTarget.checked,
                    ),
                    preferences: event.currentTarget.checked
                      ? criteria.preferences.filter(
                          (feature) => feature !== option.value,
                        )
                      : [...criteria.preferences],
                  })
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.drawerFieldset}>
        <legend>Tercihler</legend>
        <div className={styles.checkboxGrid}>
          {FEATURE_OPTIONS.map((option) => (
            <label key={option.value} className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={criteria.preferences.includes(option.value)}
                onChange={(event) =>
                  patchCriteria({
                    mustHave: event.currentTarget.checked
                      ? criteria.mustHave.filter(
                          (feature) => feature !== option.value,
                        )
                      : [...criteria.mustHave],
                    preferences: toggleValue(
                      criteria.preferences,
                      option.value,
                      event.currentTarget.checked,
                    ),
                  })
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function EvidenceList({
  matches,
}: {
  matches: readonly AdvisorMatch[]
}) {
  const evidence = matches.flatMap((match) =>
    match.evidence.map((item) => ({
      ...item,
      listingTitle: match.listing.title,
    })),
  )
  const missingEvidence = matches
    .filter((match) => match.missingData.length > 0)
    .map((match) => ({
      listingId: match.listing.id,
      listingTitle: match.listing.title,
      details: [...new Set(match.missingData)],
    }))

  return (
    <div className={styles.drawerStack}>
      <p className={styles.demoNotice}>Temsili demo verisi</p>
      <p className={styles.drawerSupporting}>
        Doğrulama, inceleme ve eksik veri ayrı durumlar olarak gösterilir.
        Eksik veya incelemedeki bilgi doğrulanmış sayılmaz.
      </p>
      <ul className={styles.evidenceList}>
        {evidence.map((item) => (
          <li key={`${item.listingTitle}-${item.id}`}>
            <p className={styles.evidenceListingTitle}>
              {item.listingTitle}
            </p>
            <div className={styles.evidenceHeading}>
              <strong>{item.source}</strong>
              <span data-evidence-status={item.status}>
                {EVIDENCE_STATUS_LABELS[item.status]}
              </span>
            </div>
            <p>{item.title}</p>
            <small>{item.detail}</small>
          </li>
        ))}
        {missingEvidence.map((item) => (
          <li key={`missing-${item.listingId}`}>
            <p className={styles.evidenceListingTitle}>
              {item.listingTitle}
            </p>
            <div className={styles.evidenceHeading}>
              <strong>Eksik ilan alanları</strong>
              <span data-evidence-status="missing">Bilgi sağlanmadı</span>
            </div>
            <p>{item.details.join(' ')}</p>
          </li>
        ))}
      </ul>
      {missingEvidence.length === 0 ? (
        <p className={styles.drawerSupporting}>
          Kayıtlı eksik alan yok.
        </p>
      ) : null}
    </div>
  )
}

export function AdvisorDrawers({
  overlay,
  proposal,
  matches,
  selectedMatch,
  compareIds,
  history,
  consentStatus,
  onClose,
  onApplyCriteria,
  onApproveConsent,
  onRejectConsent,
}: AdvisorDrawersProps) {
  const [draft, setDraft] = useState<AdvisorProposal | undefined>(
    proposal ? cloneProposal(proposal) : undefined,
  )
  const [failedListingImage, setFailedListingImage] = useState<{
    listingId: string
    fallbackSrc: string
  } | null>(null)
  const actionLockRef = useRef(false)

  useEffect(() => {
    if (overlay !== undefined) actionLockRef.current = false
  }, [overlay])

  useEffect(() => {
    if (overlay === 'criteria' && proposal) {
      setDraft(cloneProposal(proposal))
    }
  }, [overlay, proposal])

  const runActionOnce = (action: () => void) => {
    if (actionLockRef.current) return
    actionLockRef.current = true
    action()
  }

  const selectedImage = selectedMatch
    ? getRepresentativeListingImage(selectedMatch.listing)
    : undefined
  const listingUsesFallback =
    selectedMatch !== undefined &&
    selectedImage !== undefined &&
    failedListingImage?.listingId === selectedMatch.listing.id &&
    failedListingImage.fallbackSrc === selectedImage.fallbackSrc
  const selectedImageSrc = listingUsesFallback
    ? selectedImage?.fallbackSrc
    : selectedImage?.src
  const consentLabel = {
    idle: 'Henüz onay verilmedi.',
    approved: 'Onay bu demo oturumunda kaydedildi.',
    rejected: 'Paylaşım reddedildi.',
  }[consentStatus]
  const selectedItems = compareIds.map((listingId) => ({
    listingId,
    match: matches.find((match) => match.listing.id === listingId),
  }))
  const criteriaErrors = draft
    ? validateCriteria(draft.criteria)
    : {}
  const hasCriteriaErrors = Object.keys(criteriaErrors).length > 0
  const drawerTitle = {
    criteria: 'Arama kriterlerini düzenle',
    listing: selectedMatch
      ? `${selectedMatch.listing.title} ilan detayı`
      : 'İlan detayı',
    trust: 'Güven ve kaynaklar',
    history: 'Karar ve izin geçmişi',
    advisorConsent: 'İnsan danışmanla paylaşım',
  }[overlay ?? 'criteria']
  const drawerDescription = {
    criteria:
      'Değişiklikler mevcut doğal dil sorgusunu yeniden ayrıştırmadan sonuçlara uygulanır.',
    listing: undefined,
    trust: 'Eşleşmelerde kullanılan ilan kaynakları ve veri boşlukları.',
    history: 'Yalnızca bu demo oturumunda oluşan yerel olaylar.',
    advisorConsent:
      'Herhangi bir dış paylaşım öncesinde kapsamı inceleyip açıkça onaylayın.',
  }[overlay ?? 'criteria']
  let drawerFooter: ReactNode = <CloseAction onClose={onClose} />

  if (overlay === 'criteria') {
    drawerFooter = (
      <>
        <CloseAction onClose={onClose} />
        <GlassButton
          prominent
          disabled={!draft || hasCriteriaErrors}
          onClick={() => {
            if (draft) {
              runActionOnce(() =>
                onApplyCriteria(cloneProposal(draft)),
              )
            }
          }}
        >
          Kriterleri uygula
        </GlassButton>
      </>
    )
  } else if (overlay === 'advisorConsent') {
    drawerFooter = (
      <>
        <CloseAction onClose={onClose} />
        <button
          type="button"
          className={styles.textAction}
          onClick={() => runActionOnce(onRejectConsent)}
        >
          Vazgeç
        </button>
        <GlassButton
          prominent
          onClick={() => runActionOnce(onApproveConsent)}
        >
          Onayla
        </GlassButton>
      </>
    )
  }

  return (
    <GlassDrawer
      open={overlay !== undefined}
      onClose={onClose}
      title={drawerTitle}
      description={drawerDescription}
      size={
        overlay === 'history' || overlay === 'advisorConsent'
          ? 'md'
          : 'lg'
      }
      footer={drawerFooter}
    >
      {overlay === 'criteria' ? (
        draft ? (
          <CriteriaFields
            draft={draft}
            errors={criteriaErrors}
            onChange={(criteria) =>
              setDraft((current) =>
                current ? { ...current, criteria } : current,
              )
            }
          />
        ) : (
          <p className={styles.drawerSupporting}>
            Düzenlenecek arama kriteri bulunamadı.
          </p>
        )
      ) : overlay === 'listing' ? (
        selectedMatch && selectedImage ? (
          <div className={styles.drawerStack}>
            <figure className={styles.listingFigure}>
              <img
                src={selectedImageSrc}
                alt={selectedImage.alt}
                onError={() => {
                  if (!listingUsesFallback) {
                    setFailedListingImage({
                      listingId: selectedMatch.listing.id,
                      fallbackSrc: selectedImage.fallbackSrc,
                    })
                  }
                }}
              />
              <figcaption>Temsili demo verisi</figcaption>
            </figure>
            <dl className={styles.drawerMetrics}>
              <div>
                <dt>Fiyat</dt>
                <dd>{formatMetric(selectedMatch.listing.price, 'TL')}</dd>
              </div>
              <div>
                <dt>Alan</dt>
                <dd>{formatMetric(selectedMatch.listing.area, 'm²')}</dd>
              </div>
              <div>
                <dt>m² fiyatı</dt>
                <dd>{formatMetric(selectedMatch.listing.unitPrice, 'TL/m²')}</dd>
              </div>
            </dl>
            <section className={styles.drawerSection}>
              <h3>Kriter eşleşmesi</h3>
              {selectedMatch.criteria.length > 0 ? (
                <ul className={styles.detailList}>
                  {selectedMatch.criteria.map((criterion) => (
                    <li key={criterion.key}>
                      <strong>{criterion.label}</strong>
                      <span>
                        {criterion.matched ? 'Eşleşiyor' : 'Eşleşmiyor'}
                      </span>
                      <p>{criterion.detail}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.drawerSupporting}>
                  Ek özellik kriteri seçilmedi.
                </p>
              )}
            </section>
            <section className={styles.drawerSection}>
              <h3>Kanıtlar</h3>
              <EvidenceList matches={[selectedMatch]} />
            </section>
          </div>
        ) : (
          <p className={styles.drawerSupporting}>İlan seçimi bulunamadı.</p>
        )
      ) : overlay === 'trust' ? (
        <EvidenceList matches={matches} />
      ) : overlay === 'history' ? (
        history.length > 0 ? (
          <ol className={styles.historyList}>
            {history.map((entry) => (
              <li key={entry.id} data-history-status={entry.status}>
                <strong>{entry.title}</strong>
                <p>{entry.detail}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.drawerSupporting}>
            Bu demo oturumunda henüz karar kaydı yok.
          </p>
        )
      ) : overlay === 'advisorConsent' ? (
        <div className={styles.drawerStack}>
          <p className={styles.demoNotice}>Temsili demo verisi</p>
          <section className={styles.drawerSection}>
            <h3>Paylaşılacak arama</h3>
            {proposal ? (
              <>
                <p className={styles.sharedQuery}>{proposal.query}</p>
                <dl className={styles.shareSummary}>
                  {criteriaSummary(proposal.criteria).map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className={styles.drawerSupporting}>
                Paylaşılacak arama kriteri bulunamadı.
              </p>
            )}
          </section>
          <section className={styles.drawerSection}>
            <h3>Paylaşılacak ilanlar</h3>
            {selectedItems.length > 0 ? (
              <ul className={styles.consentList}>
                {selectedItems.map((item) => (
                  <li key={item.listingId}>
                    {item.match ? (
                      item.match.listing.title
                    ) : (
                      <>
                        İlan kimliği {item.listingId} güncel sonuçlarda
                        bulunamadı.
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.drawerSupporting}>Seçili ilan yok.</p>
            )}
          </section>
          <p className={styles.drawerSupporting}>
            İletişim bilgisi veya hesap verisi paylaşılmaz.
          </p>
          <p className={styles.drawerSupporting}>{consentLabel}</p>
          <p className={styles.drawerSupporting}>
            Onay yalnız bu prototipte yerel geçmişe kaydedilir; dışarıya veri
            gönderilmez.
          </p>
        </div>
      ) : null}
    </GlassDrawer>
  )
}
