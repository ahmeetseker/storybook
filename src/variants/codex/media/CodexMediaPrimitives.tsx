import type { ReactNode } from 'react'
import { CodexButton } from '../controls'
import { classNames } from './CodexMediaUtils'
import styles from './CodexMedia.module.css'

export type CodexMediaStatus = 'ready' | 'loading' | 'empty' | 'error'
export type CodexMediaTone = 'forest' | 'coast' | 'earth' | 'city' | 'interior' | 'blueprint'
export type CodexMediaKind = 'image' | 'video' | 'panorama' | 'floorplan'

export interface CodexMediaItem {
  id: string
  type?: CodexMediaKind
  src?: string
  thumbnailSrc?: string
  alt: string
  caption?: string
  eyebrow?: string
  duration?: string
  tone?: CodexMediaTone
}

export function ArrowIcon({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {direction === 'previous'
        ? <path d="m14.5 5-7 7 7 7" />
        : <path d="m9.5 5 7 7-7 7" />}
    </svg>
  )
}

export function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
}

export function MinusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M5 12h14" /></svg>
}

export function RotateIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 8V4m0 0h-4m4 0-3.2 3.2a7 7 0 1 0 1.1 8.5" /></svg>
}

export function LocationIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>
}

export function MediaKindIcon({ kind }: { kind: CodexMediaKind }) {
  if (kind === 'video') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3V9Z" /></svg>
  }
  if (kind === 'panorama') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 8c5-3 13-3 18 0v8c-5 3-13 3-18 0V8Z" /><path d="m8 13 2-2 3 3 2-2 3 3" /></svg>
  }
  if (kind === 'floorplan') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16v16H4V4Zm6 0v8H4m10 8v-5h6m-6-3h6" /></svg>
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m4 17 5-4 3 3 3-2 5 4" /></svg>
}

export interface MediaArtworkProps {
  item: CodexMediaItem
  thumbnail?: boolean
  eager?: boolean
}

export function MediaArtwork({ item, thumbnail = false, eager = false }: MediaArtworkProps) {
  const kind = item.type ?? 'image'
  const source = thumbnail ? (item.thumbnailSrc ?? item.src) : item.src

  if (source && kind === 'video' && !thumbnail) {
    return (
      <video
        className={styles.mediaAsset}
        src={source}
        aria-label={item.alt}
        controls
        playsInline
        preload="metadata"
      />
    )
  }

  if (source) {
    return (
      <img
        className={styles.mediaAsset}
        src={source}
        alt={thumbnail ? '' : item.alt}
        loading={eager ? 'eager' : 'lazy'}
      />
    )
  }

  return (
    <div
      className={classNames(styles.mediaPlaceholder, styles[`tone_${item.tone ?? 'forest'}`], styles[`kind_${kind}`])}
      role={thumbnail ? undefined : 'img'}
      aria-label={thumbnail ? undefined : item.alt}
      aria-hidden={thumbnail || undefined}
    >
      <span className={styles.placeholderHorizon} />
      <span className={styles.placeholderPlot} />
      <span className={styles.placeholderRoad} />
      <span className={styles.placeholderBuilding} />
      <span className={styles.placeholderKind}><MediaKindIcon kind={kind} /></span>
    </div>
  )
}

interface MediaStateProps {
  status: Exclude<CodexMediaStatus, 'ready'>
  loadingLabel?: string
  emptyTitle?: string
  emptyMessage?: string
  errorTitle?: string
  errorMessage?: string
  retryLabel?: string
  onRetry?: () => void
  compact?: boolean
}

export function MediaState({
  status,
  loadingLabel = 'Medya yükleniyor',
  emptyTitle = 'Henüz medya eklenmedi',
  emptyMessage = 'İlanı daha iyi anlatmak için fotoğraf veya plan ekleyin.',
  errorTitle = 'Medya görüntülenemedi',
  errorMessage = 'Bağlantınızı kontrol edip yeniden deneyin.',
  retryLabel = 'Yeniden dene',
  onRetry,
  compact = false,
}: MediaStateProps) {
  if (status === 'loading') {
    return (
      <div className={classNames(styles.mediaState, compact && styles.mediaStateCompact)} role="status" aria-label={loadingLabel} aria-busy="true">
        <span className={styles.skeletonVisual} aria-hidden />
        <span className={styles.skeletonLine} aria-hidden />
        <span className={styles.visuallyHidden}>{loadingLabel}</span>
      </div>
    )
  }

  const isError = status === 'error'
  return (
    <div className={classNames(styles.mediaState, compact && styles.mediaStateCompact)} role={isError ? 'alert' : 'status'}>
      <span className={styles.stateGlyph} aria-hidden>{isError ? '!' : '+'}</span>
      <strong>{isError ? errorTitle : emptyTitle}</strong>
      <p>{isError ? errorMessage : emptyMessage}</p>
      {isError && onRetry ? <CodexButton size="sm" variant="secondary" onClick={onRetry}>{retryLabel}</CodexButton> : null}
    </div>
  )
}

export function LiveMessage({ children }: { children: ReactNode }) {
  return <span className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">{children}</span>
}
