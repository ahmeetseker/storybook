import {
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { CodexBadge } from '../controls'
import {
  MediaArtwork,
  MediaState,
  type CodexMediaItem,
  type CodexMediaStatus,
} from './CodexMediaPrimitives'
import { clamp, classNames, useControllableValue } from './CodexMediaUtils'
import styles from './CodexMedia.module.css'

export type CodexPhotoFeatureTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
export type CodexPhotoFeatureStatus = CodexMediaStatus | 'analyzing'

export interface CodexPhotoFeature {
  id: string
  label: string
  description: string
  x: number
  y: number
  tone?: CodexPhotoFeatureTone
  confidence?: number
  source?: 'ai' | 'expert' | 'listing'
}

export interface CodexPhotoFeatureOverlayProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  media: CodexMediaItem
  features: readonly CodexPhotoFeature[]
  label?: string
  description?: string
  status?: CodexPhotoFeatureStatus
  selectedId?: string
  defaultSelectedId?: string
  onFeatureSelect?: (feature: CodexPhotoFeature) => void
  showConfidence?: boolean
  analysisNotice?: string
  onRetry?: () => void
}

const sourceLabels: Record<NonNullable<CodexPhotoFeature['source']>, string> = {
  ai: 'AI önerisi',
  expert: 'Uzman notu',
  listing: 'İlan açıklaması',
}

/** Fotoğraf üstü açıklamayı, eşleşen bulgu listesi ve güven bilgisinden koparmadan sunar. */
export function CodexPhotoFeatureOverlay({
  media,
  features,
  label = 'Görsel açıklama',
  description = 'İşaretleri seçerek fotoğraftaki özellikleri ve kaynak bilgisini inceleyin.',
  status = 'ready',
  selectedId,
  defaultSelectedId,
  onFeatureSelect,
  showConfidence = true,
  analysisNotice = 'AI tarafından önerilen işaretler kesin tespit değildir; karar vermeden önce fotoğrafı ve ilan belgelerini doğrulayın.',
  onRetry,
  className,
  ...rest
}: CodexPhotoFeatureOverlayProps) {
  const fallbackId = defaultSelectedId ?? features[0]?.id ?? ''
  const [internalSelectedId, setSelectedId] = useControllableValue(selectedId, fallbackId)
  const requestedIndex = features.findIndex((feature) => feature.id === internalSelectedId)
  const selectedIndex = requestedIndex >= 0 ? requestedIndex : 0
  const selectedFeature = features[selectedIndex]
  const markerRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listRefs = useRef<Array<HTMLButtonElement | null>>([])
  const titleId = useId()
  const descriptionId = useId()

  const selectFeature = (index: number, focus: 'marker' | 'list' | false = false) => {
    const feature = features[index]
    if (!feature) return
    setSelectedId(feature.id)
    onFeatureSelect?.(feature)
    if (focus === 'marker') markerRefs.current[index]?.focus()
    if (focus === 'list') listRefs.current[index]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number, target: 'marker' | 'list') => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % features.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + features.length) % features.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = features.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    selectFeature(nextIndex, target)
  }

  const isBlockingState = status === 'loading' || status === 'analyzing' || status === 'error'

  return (
    <section
      {...rest}
      className={classNames(styles.photoOverlay, className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={status === 'loading' || status === 'analyzing' || undefined}
    >
      <header className={styles.photoOverlayHeader}>
        <div>
          <h2 id={titleId}>{label}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        {status === 'ready' ? <CodexBadge tone={features.length ? 'info' : 'neutral'}>{features.length} işaret</CodexBadge> : null}
      </header>

      {isBlockingState ? (
        <MediaState
          status={status === 'error' ? 'error' : 'loading'}
          loadingLabel={status === 'analyzing' ? 'Görsel analiz ediliyor' : 'Görsel yükleniyor'}
          onRetry={onRetry}
          errorTitle="Görsel açıklama hazırlanamadı"
          errorMessage="Otomatik işaretler kullanılamıyor. Fotoğrafı işaretsiz olarak elle inceleyin."
        />
      ) : (
        <div className={styles.photoOverlayLayout}>
          <div className={styles.annotatedPhoto}>
            <MediaArtwork item={media} eager />
            {features.map((feature, index) => (
              <button
                key={feature.id}
                ref={(node) => { markerRefs.current[index] = node }}
                type="button"
                className={styles.featureMarker}
                data-tone={feature.tone ?? 'neutral'}
                data-selected={index === selectedIndex || undefined}
                style={{ '--feature-x': `${clamp(feature.x)}%`, '--feature-y': `${clamp(feature.y)}%` } as CSSProperties}
                aria-label={`${index + 1}. işaret: ${feature.label}`}
                aria-pressed={index === selectedIndex}
                onClick={() => selectFeature(index)}
                onKeyDown={(event) => handleKeyDown(event, index, 'marker')}
              >
                <span aria-hidden>{index + 1}</span>
              </button>
            ))}
            {selectedFeature ? (
              <div className={styles.featureCallout} data-tone={selectedFeature.tone ?? 'neutral'} aria-hidden>
                <span>{selectedIndex + 1}</span>
                <strong>{selectedFeature.label}</strong>
              </div>
            ) : null}
          </div>

          <aside className={styles.featurePanel} aria-label="Görsel işaretleri">
            {status === 'empty' || !features.length ? (
              <MediaState
                status="empty"
                compact
                emptyTitle="Açıklanacak özellik bulunamadı"
                emptyMessage="Fotoğrafta otomatik olarak işaretlenebilecek güvenilir bir özellik yok. Görseli elle inceleyin."
              />
            ) : (
              <div className={styles.featureList} role="list" aria-label="Fotoğraf özellikleri">
                {features.map((feature, index) => {
                  const selected = index === selectedIndex
                  const confidence = feature.confidence === undefined ? undefined : clamp(feature.confidence)
                  return (
                    <div key={feature.id} role="listitem" className={styles.featureItem} data-selected={selected || undefined}>
                      <button
                        ref={(node) => { listRefs.current[index] = node }}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => selectFeature(index)}
                        onKeyDown={(event) => handleKeyDown(event, index, 'list')}
                      >
                        <span className={styles.featureIndex} data-tone={feature.tone ?? 'neutral'} aria-hidden>{index + 1}</span>
                        <span className={styles.featureCopy}>
                          <span><strong>{feature.label}</strong>{feature.source ? <CodexBadge tone="neutral">{sourceLabels[feature.source]}</CodexBadge> : null}</span>
                          <span>{feature.description}</span>
                          {showConfidence && confidence !== undefined ? (
                            <span className={styles.featureConfidence}>
                              <span>Güven %{confidence}</span>
                              <span role="meter" aria-label={`${feature.label} güveni`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={confidence}>
                                <span style={{ '--confidence': `${confidence}%` } as CSSProperties} />
                              </span>
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </aside>
        </div>
      )}

      {analysisNotice && status !== 'error' ? <p className={styles.analysisNotice}><span aria-hidden>i</span>{analysisNotice}</p> : null}
    </section>
  )
}
