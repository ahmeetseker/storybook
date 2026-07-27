import type { KeyboardEvent } from 'react'
import { GlassAiSearchBar } from '@repo/ui'
import type { AdvisorStatus } from '../domain/advisor-reducer'
import styles from './AdvisorPanels.module.css'

export interface AdvisorComposerProps {
  /** Düzenlenebilir doğal dil sorgusu. */
  query: string
  /** Arama yüzeyinin güncel analiz durumu. */
  status: AdvisorStatus
  /** Sorgu metni değiştiğinde çağrılır. */
  onQueryChange: (query: string) => void
  /** Güncel sorgu gönderildiğinde çağrılır. */
  onSubmit: (query: string) => void
  /** Sürmekte olan analiz durdurulmak istendiğinde çağrılır. */
  onCancel?: () => void
}

export function AdvisorComposer({
  query,
  status,
  onQueryChange,
  onSubmit,
  onCancel,
}: AdvisorComposerProps) {
  const analyzing = status === 'analyzing'

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (
      event.key === 'Enter' &&
      (event.nativeEvent as globalThis.KeyboardEvent).isComposing
    ) {
      event.preventDefault()
    }
  }

  return (
    <div className={styles.composer}>
      <p className={styles.composerLabel}>
        Ne aradığınızı doğal biçimde yazın
      </p>
      <GlassAiSearchBar
        value={query}
        onValueChange={onQueryChange}
        onSubmit={onSubmit}
        announcementMode="external"
        aria-busy={analyzing || undefined}
        placeholder="Örn. Urla’da 5 milyon TL altında imarlı arsa"
        onKeyDown={handleKeyDown}
      />
      {analyzing && onCancel ? (
        <button
          type="button"
          className={styles.textAction}
          onClick={onCancel}
        >
          Analizi durdur
        </button>
      ) : null}
    </div>
  )
}
