import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type FormHTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { GlassButton } from '../GlassButton'
import styles from './GlassAiSearchBar.module.css'

/** AI'nin sorgudan çıkardığı tek bir filtre — input altında kaldırılabilir chip olarak görünür. */
export interface GlassAiSearchBarFilter {
  /** Kaldırma callback'inde geri verilen kimlik — DOM id'sine yazılmaz */
  id: string
  /** Filtre türü etiketi, ör. "Konum" */
  label: string
  /** Çıkarılan değer, ör. "İzmir, Urla" */
  value: string
}

export interface GlassAiSearchBarProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> {
  /** Controlled sorgu metni */
  value?: string
  /** Kontrolsüz başlangıç sorgu metni */
  defaultValue?: string
  /** Sorgu her değiştiğinde çağrılır (controlled desen: value + defaultValue + onValueChange) */
  onValueChange?: (value: string) => void
  /** Gönderim anında (Enter, gönder butonu veya öneri seçimi) güncel sorguyla çağrılır */
  onSubmit: (query: string) => void
  placeholder?: string
  /** Input odaklıyken altında görünen öneri listesi — düz buton listesi, listbox DEĞİL */
  suggestions?: string[]
  /** AI'nin sorgudan çıkardığı filtreler; input altında kaldırılabilir chip dizisi olarak görünür */
  parsedFilters?: GlassAiSearchBarFilter[]
  /** Bir filtre chip'inin kaldır butonuna basılınca filtrenin id'siyle çağrılır */
  onRemoveFilter?: (id: string) => void
  /** Gönderim sürerken: input devre dışı kalır + soluk "düşünüyor" göstergesi görünür */
  loading?: boolean
  /** parsedFilters için 0-100 güven skoru; verilirse rozetin yanında "%N güven" metni görünür */
  confidence?: number
  /** Verilirse parsedFilters başlığında 👍/👎 geri bildirim butonları görünür */
  onFeedback?: (value: 'up' | 'down') => void
}

/** confidence prop'unu normalize eder: sonlu değilse gizlenir (null), aksi halde [0,100]'e clamp + yuvarlanır. */
function clampConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.min(100, Math.max(0, Math.round(value)))
}

// Dekoratif ikonlar — accessible name her zaman aria-label/label prop'undan gelir.
function SparkleIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
      <path
        d="M8 1.5c.3 2.1 1 3.6 2.1 4.6 1.1 1 2.7 1.7 4.9 2-2.2.3-3.8 1-4.9 2-1.1 1-1.8 2.5-2.1 4.6-.3-2.1-1-3.6-2.1-4.6-1.1-1-2.7-1.7-4.9-2 2.2-.3 3.8-1 4.9-2 1.1-1 1.8-2.5 2.1-4.6z"
        fill="currentColor"
      />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
      <path
        d="M2 8h11.2M8.4 2.8L13.6 8l-5.2 5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Konuşmalı/doğal dil arama çubuğu (2030 AI-first arama). Kapsül ray içinde
 * serbest metin girişi + gönder butonu; odaklanınca altında öneri listesi,
 * gönderim sonrası altında AI'nin çıkardığı kaldırılabilir filtre chip'leri
 * görünür. İçerik katmanı düz (surface + hairline) — cam yalnız gömülü
 * GlassButton'da (kontrol katmanı).
 */
export function GlassAiSearchBar({
  value,
  defaultValue,
  onValueChange,
  onSubmit,
  placeholder = 'Örn. "Urla\'da deniz manzaralı 3+1 daire"',
  suggestions,
  parsedFilters,
  onRemoveFilter,
  loading = false,
  confidence,
  onFeedback,
  className,
  ...rest
}: GlassAiSearchBarProps) {
  const uid = useId()
  const thinkingId = `${uid}-thinking`
  const [inner, setInner] = useState(defaultValue ?? '')
  const controlled = value !== undefined
  const currentValue = controlled ? value : inner
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const confidenceValue = clampConfidence(confidence)
  const hasFilters = Boolean(parsedFilters && parsedFilters.length > 0)
  const showSuggestions = open && !loading && Boolean(suggestions && suggestions.length > 0)

  // loading açılınca önerilerin görünür kalmasına gerek yok — input zaten disabled olacak.
  useEffect(() => {
    if (loading) setOpen(false)
  }, [loading])

  const setValue = (next: string) => {
    if (!controlled) setInner(next)
    onValueChange?.(next)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    onSubmit(currentValue)
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
    }
  }

  const handleWrapBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setOpen(false)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    if (loading) return
    setValue(suggestion)
    setOpen(false)
    onSubmit(suggestion)
  }

  const handleFeedback = (next: 'up' | 'down') => {
    setFeedback(next)
    onFeedback?.(next)
  }

  return (
    <form
      {...rest}
      role="search"
      onSubmit={handleFormSubmit}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      <div className={styles.wrap} onBlur={handleWrapBlur}>
        <div className={styles.ray} data-disabled={loading || undefined}>
          <span className={styles.sparkle} aria-hidden="true">
            <SparkleIcon />
          </span>
          <input
            type="search"
            className={styles.input}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            disabled={loading}
            aria-label="Doğal dilde arama"
            aria-describedby={thinkingId}
            autoComplete="off"
          />
          <GlassButton
            type="submit"
            size="sm"
            loading={loading}
            disabled={loading}
            aria-label="Ara"
            className={styles.submit}
          >
            <SendIcon />
          </GlassButton>
        </div>

        {showSuggestions ? (
          <div className={styles.suggestions}>
            {suggestions!.map((suggestion, i) => (
              <button
                key={`${uid}-suggestion-${i}`}
                type="button"
                className={styles.suggestion}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p id={thinkingId} className={styles.thinking} aria-live="polite">
        {loading ? (
          <>
            <span className={styles.thinkingDot} aria-hidden="true" />
            Düşünüyor…
          </>
        ) : null}
      </p>

      {hasFilters ? (
        <div className={styles.filtersBlock} role="group" aria-label="Yapay zekânın ayrıştırdığı filtreler">
          <div className={styles.filtersHeader}>
            <span className={styles.aiBadge} aria-label="Yapay zekâ üretimi">
              ✦ AI
            </span>
            {confidenceValue !== null ? (
              <span className={styles.confidence}>%{confidenceValue} güven</span>
            ) : null}
            {onFeedback ? (
              <span className={styles.feedback}>
                <button
                  type="button"
                  className={styles.feedbackButton}
                  aria-label="Faydalı"
                  aria-pressed={feedback === 'up'}
                  onClick={() => handleFeedback('up')}
                >
                  <span aria-hidden="true">👍</span>
                </button>
                <button
                  type="button"
                  className={styles.feedbackButton}
                  aria-label="Faydalı değil"
                  aria-pressed={feedback === 'down'}
                  onClick={() => handleFeedback('down')}
                >
                  <span aria-hidden="true">👎</span>
                </button>
              </span>
            ) : null}
          </div>
          <ul className={styles.filters}>
            {parsedFilters!.map((filter) => (
              <li key={filter.id} className={styles.filterItem}>
                <span className={styles.filterChip} data-disabled={loading || undefined}>
                  <span className={styles.filterLabel}>{filter.label}:</span>{' '}
                  <span className={styles.filterValue}>{filter.value}</span>
                  {onRemoveFilter ? (
                    <button
                      type="button"
                      className={styles.filterRemove}
                      aria-label={`Filtreyi kaldır: ${filter.label}: ${filter.value}`}
                      disabled={loading}
                      onClick={() => onRemoveFilter(filter.id)}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  )
}
