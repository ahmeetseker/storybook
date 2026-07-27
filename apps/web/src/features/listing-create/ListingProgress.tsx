import { GlassSelect } from '@repo/ui'
import styles from './ListingCreateWorkspace.module.css'
import {
  LISTING_STEPS,
  getStepValidation,
  type ListingDraft,
  type ListingStepId,
} from './listing-create-domain'

interface ListingProgressProps {
  draft: ListingDraft
  activeStep: ListingStepId
  maxVisitedIndex?: number
  onStepChange: (step: ListingStepId) => void
}

export function ListingProgress({
  draft,
  activeStep,
  maxVisitedIndex,
  onStepChange,
}: ListingProgressProps) {
  const activeIndex = LISTING_STEPS.findIndex((step) => step.id === activeStep)
  const reachableIndex = Math.max(activeIndex, maxVisitedIndex ?? activeIndex)
  const activeDefinition = LISTING_STEPS[activeIndex]

  return (
    <nav className={styles.progressNav} aria-label="İlan oluşturma adımları">
      <div className={styles.progressCompact}>
        <span>Adım {activeIndex + 1}/{LISTING_STEPS.length}</span>
        <GlassSelect
          size="md"
          aria-label="Aktif ilan oluşturma adımı"
          options={LISTING_STEPS.map((step, index) => {
            const valid = getStepValidation(draft, step.id).valid
            return {
              value: step.id,
              label: `${index + 1}. ${step.shortLabel}`,
              disabled: index > reachableIndex && !valid,
            }
          })}
          value={activeStep}
          onChange={(step) => onStepChange(step as ListingStepId)}
        />
        <progress
          max={LISTING_STEPS.length}
          value={activeIndex + 1}
          aria-label={`${activeDefinition?.label ?? 'İlan'}: ${activeIndex + 1}/${LISTING_STEPS.length}`}
        />
      </div>
      <ol className={styles.progressList}>
        {LISTING_STEPS.map((step, index) => {
          const valid = getStepValidation(draft, step.id).valid
          const enabled = index <= reachableIndex || valid
          const active = step.id === activeStep
          return (
            <li key={step.id} className={styles.progressItem}>
              <button
                type="button"
                className={styles.progressButton}
                data-active={active || undefined}
                data-complete={valid || undefined}
                aria-current={active ? 'step' : undefined}
                disabled={!enabled}
                onClick={() => onStepChange(step.id)}
              >
                <span className={styles.progressIndex} aria-hidden="true">
                  {valid ? '✓' : index + 1}
                </span>
                <span className={styles.progressCopy}>
                  <strong>{step.label}</strong>
                  <small>{valid ? 'Tamamlandı' : step.description}</small>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
