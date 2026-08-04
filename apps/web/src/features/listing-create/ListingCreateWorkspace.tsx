import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { withBase } from '@/config/base-path'
import {
  createListingAdapters,
  type ListingAdapterScenario,
} from './listing-create-adapters'
import {
  LISTING_STEPS,
  applyAiProposal,
  canPublish,
  createEmptyDraft,
  getCompletion,
  getStepValidation,
  type AiListingProposal,
  type ListingDraft,
  type ListingStepId,
  type ListingVerification,
} from './listing-create-domain'
import {
  clearStoredDraft,
  readStoredDraft,
  writeStoredDraft,
} from './listing-draft-storage'
import { locationChain } from './listing-labels'
import { ContentPricingStep } from './ContentPricingStep'
import { ListingActionBar } from './ListingActionBar'
import { ListingCreateHeader } from './ListingCreateHeader'
import { ListingEntryChoice, type ListingResumeOffer } from './ListingEntryChoice'
import { ListingProgress } from './ListingProgress'
import { ListingSidePanel } from './ListingSidePanel'
import { LocationStep } from './LocationStep'
import { MediaStudioStep } from './MediaStudioStep'
import { PropertyStep } from './PropertyStep'
import { VerificationReviewStep } from './VerificationReviewStep'
import { PageContainer } from '@/components/PageContainer'
import styles from './ListingCreateWorkspace.module.css'

export interface ListingCreateWorkspaceProps {
  adapterDelayMs?: number
  adapterScenario?: Omit<ListingAdapterScenario, 'delayMs'>
  initialDraft?: ListingDraft
}

function emptyVerification(): ListingVerification {
  return {
    status: 'idle',
    verifiedRole: null,
    verifiedPropertyNumber: null,
    propertyReference: '',
    errorCode: null,
  }
}

function stepIndex(step: ListingStepId): number {
  return LISTING_STEPS.findIndex((item) => item.id === step)
}

const errorTargetByStep: Record<
  ListingStepId,
  Record<string, string>
> = {
  property: {
    transaction: 'property-transaction',
    family: 'property-family',
    subtype: 'property-subtype',
    publisherRole: 'property-publisher-role',
    area: 'property-area',
    zoning: 'property-zoning',
    deedType: 'property-deed',
    rooms: 'property-rooms',
    grossArea: 'property-gross-area',
    netArea: 'property-net-area',
    buildingAge: 'property-age',
    usageStatus: 'property-usage-status',
    floorCount: 'property-floor-count',
    independentUnitCount: 'property-independent-unit-count',
  },
  location: {
    city: 'location-city',
    district: 'location-district',
    neighborhood: 'location-neighborhood',
    propertyNumber: 'location-property-number',
    coordinates: 'location-map',
    parcel: 'location-island',
    buildingNumber: 'location-building',
  },
  media: {
    media: 'media-step-title',
    cover: 'media-step-title',
  },
  content: {
    price: 'content-price',
    title: 'content-title',
    description: 'content-description',
    riskAccepted: 'risk-accepted',
    legalConsent: 'legal-consent',
  },
  verification: {
    verification: 'eids-card-title',
  },
}

/** Devam teklifi kartındaki tanıtıcı satır. */
function resumeSummary(draft: ListingDraft): string {
  return (
    draft.content.title.trim() ||
    locationChain(draft.location) ||
    draft.meta.name
  )
}

export function ListingCreateWorkspace({
  adapterDelayMs = 450,
  adapterScenario,
  initialDraft,
}: ListingCreateWorkspaceProps) {
  /* Kalıcılık yalnız gerçek rotada çalışır: Story ve testler `initialDraft`
     verdiğinde sekme deposuna ne yazılır ne de okunur. */
  const persistEnabled = useRef(initialDraft === undefined)
  const [draft, setDraft] = useState<ListingDraft>(
    () => initialDraft ?? createEmptyDraft(),
  )
  const [storedDraft, setStoredDraft] = useState(() =>
    persistEnabled.current ? readStoredDraft() : null,
  )
  const [maxVisitedIndex, setMaxVisitedIndex] = useState(() =>
    stepIndex(initialDraft?.meta.activeStep ?? 'property'),
  )
  const [stepErrors, setStepErrors] = useState<
    Partial<Record<ListingStepId, Record<string, string>>>
  >({})
  const [saveRetryToken, setSaveRetryToken] = useState(0)
  const [stepAnnouncement, setStepAnnouncement] = useState('')
  const adapters = useMemo(
    () => createListingAdapters({ ...adapterScenario, delayMs: adapterDelayMs }),
    [adapterDelayMs, adapterScenario],
  )
  const verificationRequest = useRef(0)
  const saveRequest = useRef(0)
  const mediaUrls = useRef(new Set<string>())
  const publishedRef = useRef<HTMLElement>(null)
  const stepFocusPending = useRef(false)
  const saveSnapshot = useMemo<ListingDraft>(
    () => ({
      entryMode: draft.entryMode,
      property: draft.property,
      location: draft.location,
      media: draft.media,
      content: draft.content,
      verification: draft.verification,
      meta: {
        id: draft.meta.id,
        name: draft.meta.name,
        activeStep: draft.meta.activeStep,
        saveStatus: 'saving',
        savedAt: null,
        aiProposalApplied: draft.meta.aiProposalApplied,
        returnToReview: draft.meta.returnToReview,
        published: draft.meta.published,
      },
    }),
    [
      draft.content,
      draft.entryMode,
      draft.location,
      draft.media,
      draft.meta.activeStep,
      draft.meta.aiProposalApplied,
      draft.meta.id,
      draft.meta.name,
      draft.meta.published,
      draft.meta.returnToReview,
      draft.property,
      draft.verification,
    ],
  )

  const createPreviewUrl = useCallback((file: File) => {
    const src =
      typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(file)
        : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E'
    if (src.startsWith('blob:')) mediaUrls.current.add(src)
    return src
  }, [])

  const revokePreviewUrl = useCallback((src: string) => {
    if (!mediaUrls.current.has(src)) return
    URL.revokeObjectURL(src)
    mediaUrls.current.delete(src)
  }, [])

  useEffect(
    () => () => {
      mediaUrls.current.forEach((src) => URL.revokeObjectURL(src))
      mediaUrls.current.clear()
    },
    [],
  )

  /* Sekme deposu: fotoğraflar hariç taslak, adım değiştikçe tazelenir. */
  useEffect(() => {
    if (!persistEnabled.current || !draft.entryMode) return
    if (draft.meta.published) {
      clearStoredDraft()
      return
    }
    writeStoredDraft(draft)
  }, [draft])

  useEffect(() => {
    if (
      !draft.entryMode ||
      draft.meta.published ||
      !stepFocusPending.current
    ) {
      return
    }

    stepFocusPending.current = false
    const frame = window.requestAnimationFrame(() => {
      const heading = document.getElementById(`${draft.meta.activeStep}-step-title`)
      heading?.focus()
      heading?.scrollIntoView?.({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [draft.entryMode, draft.meta.activeStep, draft.meta.published])

  /* Adım değişimi ekran okuyucuya ayrıca duyurulur: odak başlığa gitse de
     "kaçıncı adımdayım" bilgisi başlıkta yazmaz. */
  useEffect(() => {
    if (!draft.entryMode || draft.meta.published) {
      setStepAnnouncement('')
      return
    }
    const index = stepIndex(draft.meta.activeStep)
    const definition = LISTING_STEPS[index]
    if (!definition) return
    setStepAnnouncement(
      `Adım ${index + 1} / ${LISTING_STEPS.length}: ${definition.label}`,
    )
  }, [draft.entryMode, draft.meta.activeStep, draft.meta.published])

  useEffect(() => {
    if (!saveSnapshot.entryMode || saveSnapshot.meta.published) return

    const request = ++saveRequest.current
    setDraft((current) =>
      current.meta.saveStatus === 'saving'
        ? current
        : {
            ...current,
            meta: { ...current.meta, saveStatus: 'saving' },
          },
    )
    const timeout = window.setTimeout(async () => {
      try {
        const result = await adapters.saveDraft(saveSnapshot)
        if (request !== saveRequest.current) return
        setDraft((current) => ({
          ...current,
          meta: {
            ...current.meta,
            saveStatus: 'saved',
            savedAt: result.savedAt,
          },
        }))
      } catch {
        if (request !== saveRequest.current) return
        setDraft((current) => ({
          ...current,
          meta: { ...current.meta, saveStatus: 'error' },
        }))
      }
    }, 320)

    return () => window.clearTimeout(timeout)
  }, [
    adapters,
    saveRetryToken,
    saveSnapshot,
  ])

  const clearStepErrors = (step: ListingStepId) => {
    setStepErrors((current) => ({ ...current, [step]: {} }))
  }

  const reconcileStepErrors = (step: ListingStepId, nextDraft: ListingDraft) => {
    if (Object.keys(stepErrors[step] ?? {}).length === 0) return
    setStepErrors((current) => ({
      ...current,
      [step]: getStepValidation(nextDraft, step).errors,
    }))
  }

  const startManual = () => {
    stepFocusPending.current = true
    setStoredDraft(null)
    setDraft((current) => ({
      ...current,
      entryMode: 'manual',
      meta: { ...current.meta, activeStep: 'property' },
    }))
    setMaxVisitedIndex(0)
  }

  const applyProposal = (proposal: AiListingProposal) => {
    stepFocusPending.current = true
    setStoredDraft(null)
    setDraft((current) => {
      const next = applyAiProposal(current, proposal)
      return {
        ...next,
        meta: { ...next.meta, activeStep: 'property' },
      }
    })
    setMaxVisitedIndex(0)
  }

  const resumeStoredDraft = () => {
    if (!storedDraft) return
    stepFocusPending.current = true
    setDraft(storedDraft.draft)
    setMaxVisitedIndex(stepIndex(storedDraft.draft.meta.activeStep))
    setStoredDraft(null)
  }

  const discardStoredDraft = () => {
    clearStoredDraft()
    setStoredDraft(null)
  }

  const setActiveStep = (activeStep: ListingStepId) => {
    stepFocusPending.current = true
    setDraft((current) => ({
      ...current,
      meta: { ...current.meta, activeStep },
    }))
  }

  const editFromReview = (activeStep: ListingStepId) => {
    stepFocusPending.current = true
    setDraft((current) => ({
      ...current,
      meta: { ...current.meta, activeStep, returnToReview: true },
    }))
  }

  const focusFirstError = () => {
    window.requestAnimationFrame(() => {
      const invalidControl = document.querySelector<HTMLElement>(
        'input[aria-invalid="true"]:not(:disabled), button[aria-invalid="true"]:not(:disabled), select[aria-invalid="true"]:not(:disabled), textarea[aria-invalid="true"]:not(:disabled)',
      )
      const invalidRegion = document.querySelector<HTMLElement>(
        '[aria-invalid="true"][tabindex]',
      )
      ;(invalidControl ?? invalidRegion)?.focus()
    })
  }

  const continueFlow = () => {
    const activeStep = draft.meta.activeStep
    const validation = getStepValidation(draft, activeStep)
    if (!validation.valid) {
      setStepErrors((current) => ({ ...current, [activeStep]: validation.errors }))
      focusFirstError()
      return
    }

    clearStepErrors(activeStep)
    if (activeStep === 'verification') {
      if (!canPublish(draft) || draft.meta.published) return
      setDraft((current) => ({
        ...current,
        meta: { ...current.meta, published: true, saveStatus: 'saved' },
      }))
      window.setTimeout(() => publishedRef.current?.focus(), 0)
      return
    }

    if (draft.meta.returnToReview) {
      stepFocusPending.current = true
      setDraft((current) => ({
        ...current,
        meta: {
          ...current.meta,
          activeStep: 'verification',
          returnToReview: false,
        },
      }))
      setMaxVisitedIndex(4)
      return
    }

    const nextIndex = stepIndex(activeStep) + 1
    const nextStep = LISTING_STEPS[nextIndex]?.id
    if (!nextStep) return
    stepFocusPending.current = true
    setDraft((current) => ({
      ...current,
      meta: { ...current.meta, activeStep: nextStep },
    }))
    setMaxVisitedIndex((current) => Math.max(current, nextIndex))
  }

  const goBack = () => {
    const previousStep = LISTING_STEPS[stepIndex(draft.meta.activeStep) - 1]?.id
    if (previousStep) setActiveStep(previousStep)
  }

  const verifyEids = async () => {
    const role = draft.property.publisherRole
    const propertyNumber = draft.location.propertyNumber
    if (!role || !propertyNumber) {
      setStepErrors((current) => ({
        ...current,
        verification: {
          verification: 'İlan veren rolü ve taşınmaz numarası gerekli',
        },
      }))
      return
    }

    const request = ++verificationRequest.current
    setDraft((current) => ({
      ...current,
      verification: { ...emptyVerification(), status: 'checking' },
    }))
    const result = await adapters.verifyEids({ role, propertyNumber })
    if (request !== verificationRequest.current) return

    setDraft((current) => {
      if (
        current.property.publisherRole !== role ||
        current.location.propertyNumber !== propertyNumber
      ) {
        return { ...current, verification: emptyVerification() }
      }
      return {
        ...current,
        verification: result,
        meta: { ...current.meta, saveStatus: 'saving' },
      }
    })
    clearStepErrors('verification')
  }

  const activeStep = draft.meta.activeStep
  const activeErrors = stepErrors[activeStep] ?? {}
  const errorEntries = Object.entries(activeErrors)
  const activeIndex = stepIndex(activeStep)
  const activeDefinition = LISTING_STEPS[activeIndex]
  const completion = getCompletion(draft)
  const primaryLabel =
    activeStep === 'verification'
      ? 'İlanı yayınla'
      : draft.meta.returnToReview
        ? 'Kaydet ve son kontrole dön'
        : 'Devam et'

  const resumeOffer: ListingResumeOffer | null = storedDraft
    ? {
        stepId: storedDraft.draft.meta.activeStep,
        stepLabel:
          LISTING_STEPS[stepIndex(storedDraft.draft.meta.activeStep)]?.label ??
          'Mülk bilgileri',
        stepIndex: stepIndex(storedDraft.draft.meta.activeStep) + 1,
        summary: resumeSummary(storedDraft.draft),
        droppedMediaCount: storedDraft.droppedMediaCount,
      }
    : null

  const stepContent = () => {
    if (activeStep === 'property') {
      return (
        <PropertyStep
          value={draft.property}
          errors={activeErrors}
          onChange={(property) => {
            const identityChanged =
              property.publisherRole !== draft.property.publisherRole
            const nextDraft: ListingDraft = {
              ...draft,
              property,
              verification: identityChanged
                ? emptyVerification()
                : draft.verification,
            }
            setDraft(nextDraft)
            reconcileStepErrors('property', nextDraft)
          }}
        />
      )
    }
    if (activeStep === 'location') {
      return (
        <LocationStep
          value={draft.location}
          propertyFamily={draft.property.family}
          errors={activeErrors}
          onChange={(location) => {
            const identityChanged =
              location.propertyNumber !== draft.location.propertyNumber
            const nextDraft: ListingDraft = {
              ...draft,
              location,
              verification: identityChanged
                ? emptyVerification()
                : draft.verification,
            }
            setDraft(nextDraft)
            reconcileStepErrors('location', nextDraft)
          }}
        />
      )
    }
    if (activeStep === 'media') {
      return (
        <MediaStudioStep
          value={draft.media}
          errors={activeErrors}
          createPreviewUrl={createPreviewUrl}
          revokePreviewUrl={revokePreviewUrl}
          onChange={(media) => {
            const nextDraft: ListingDraft = { ...draft, media }
            setDraft(nextDraft)
            reconcileStepErrors('media', nextDraft)
          }}
        />
      )
    }
    if (activeStep === 'content') {
      return (
        <ContentPricingStep
          value={draft.content}
          property={draft.property}
          location={draft.location}
          media={draft.media}
          errors={activeErrors}
          onChange={(content) => {
            const nextDraft: ListingDraft = { ...draft, content }
            setDraft(nextDraft)
            reconcileStepErrors('content', nextDraft)
          }}
        />
      )
    }
    return (
      <VerificationReviewStep
        draft={draft}
        errors={activeErrors}
        onVerify={verifyEids}
        onEdit={editFromReview}
      />
    )
  }

  if (!draft.entryMode) {
    return (
      <PageContainer shellInsets={false} className={styles.page}>
        <ListingCreateHeader meta={draft.meta} />
        <ListingEntryChoice
          adapters={adapters}
          onManualStart={startManual}
          onApplyProposal={applyProposal}
          resume={resumeOffer}
          onResume={resumeStoredDraft}
          onDiscardResume={discardStoredDraft}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer shellInsets={false} className={styles.page}>
      <ListingCreateHeader
        meta={draft.meta}
        completion={draft.meta.published ? undefined : completion}
      />
      <div className={styles.shell}>
        {draft.meta.published ? (
          <section
            ref={publishedRef}
            className={styles.publishedState}
            tabIndex={-1}
            role="status"
            aria-label="Yayın durumu"
          >
            <span className={styles.publishedMark} aria-hidden="true">✓</span>
            <p className={styles.kicker}>Tüm kontroller tamamlandı</p>
            <h1>İlanınız yayına hazır</h1>
            <p>
              Demo yayın akışı başarıyla tamamlandı. Gerçek bir ilan veya kamu
              doğrulama kaydı oluşturulmadı.
            </p>
            <div className={styles.publishedActions}>
              <a className={styles.primaryFlatAction} href={withBase('/')}>Ana sayfaya dön</a>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    meta: { ...current.meta, published: false },
                  }))
                }
              >
                Son kontrole dön
              </button>
            </div>
          </section>
        ) : (
          <>
            <p className={styles.srOnly} role="status" aria-live="polite">
              {stepAnnouncement}
            </p>

            <ListingProgress
              draft={draft}
              activeStep={activeStep}
              maxVisitedIndex={maxVisitedIndex}
              onStepChange={setActiveStep}
            />

            <div className={styles.workspaceGrid}>
              <div className={styles.stepColumn}>
                {errorEntries.length > 0 ? (
                  <section
                    className={styles.errorSummary}
                    role="alert"
                    aria-labelledby="listing-step-error-title"
                  >
                    <h2 id="listing-step-error-title">
                      Bu adımda düzeltilmesi gereken alanlar
                    </h2>
                    <p>
                      {errorEntries.length} alan eksik ya da hatalı. Bilgileriniz
                      silinmedi; bağlantıya dokunup ilgili alana gidin.
                    </p>
                    <ol>
                      {errorEntries.map(([key, message]) => (
                        <li key={key}>
                          <a
                            href={`#${
                              errorTargetByStep[activeStep][key] ??
                              `${activeStep}-step-title`
                            }`}
                          >
                            {message}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}

                {draft.meta.aiProposalApplied && activeStep === 'property' ? (
                  <p className={styles.appliedNotice} role="status">
                    <span aria-hidden="true">✦</span>
                    AI önerisi uygulandı; doğruluğunu kontrol ederek ilerleyin.
                  </p>
                ) : null}

                {stepContent()}
              </div>

              <ListingSidePanel draft={draft} activeStep={activeStep} />
            </div>

            <ListingActionBar
              backDisabled={activeIndex === 0}
              primaryLabel={primaryLabel}
              stepSummary={`Adım ${activeIndex + 1}/${LISTING_STEPS.length} · ${
                activeDefinition?.label ?? ''
              }`}
              saveError={draft.meta.saveStatus === 'error'}
              saving={draft.meta.saveStatus === 'saving'}
              primaryDisabled={
                activeStep === 'verification' &&
                (!canPublish(draft) ||
                  draft.verification.status === 'checking' ||
                  draft.meta.saveStatus !== 'saved')
              }
              onBack={goBack}
              onPrimary={continueFlow}
              onRetrySave={() => setSaveRetryToken((current) => current + 1)}
            />
          </>
        )}
      </div>
    </PageContainer>
  )
}
