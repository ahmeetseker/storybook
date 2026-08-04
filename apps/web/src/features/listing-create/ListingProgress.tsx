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

/**
 * Adım göstergesi. Geniş kapta bağlantı çizgili yatay stepper: her adım
 * tamamlandı / aktif / bekliyor / kilitli durumunu hem disk hem de metinle
 * söyler. Dar kapta sayaç + adım seçici + ölçere iner; kilitli adımlar
 * seçicide de kapalıdır.
 */
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
        <span className={styles.progressCompactCount}>
          Adım {activeIndex + 1}/{LISTING_STEPS.length}
        </span>
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
          const state = active
            ? 'active'
            : valid
              ? 'complete'
              : enabled
                ? 'pending'
                : 'locked'
          const status = active
            ? 'Şu an buradasınız'
            : valid
              ? 'Tamamlandı'
              : enabled
                ? 'Bekliyor'
                : 'Kilitli'

          return (
            <li key={step.id} className={styles.progressItem} data-state={state}>
              <button
                type="button"
                className={styles.progressButton}
                data-state={state}
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
                  <small>{status}</small>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
