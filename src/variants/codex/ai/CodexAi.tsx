import {
  useId,
  useState,
  type FormEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { CodexBadge, CodexButton } from '../controls'
import styles from './CodexAi.module.css'

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value))
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M10 2.5v3M10 14.5v3M2.5 10h3M14.5 10h3M4.7 4.7l2.1 2.1M13.2 13.2l2.1 2.1M15.3 4.7l-2.1 2.1M6.8 13.2l-2.1 2.1" />
      <circle cx="10" cy="10" r="2.2" />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="m7.2 10.8 4.9-4.9a2.5 2.5 0 0 1 3.5 3.5l-6.4 6.4a4 4 0 0 1-5.7-5.7l6.1-6.1" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M10 2.5 16 5v4.3c0 3.7-2.4 6.3-6 8.2-3.6-1.9-6-4.5-6-8.2V5l6-2.5Z" />
      <path d="m7.2 10 1.7 1.7 3.9-4" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M3 6.5h3l1.1-2h5.8l1.1 2h3v9H3v-9Z" />
      <circle cx="10" cy="11" r="3" />
    </svg>
  )
}

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="7" y="2.5" width="6" height="10" rx="3" />
      <path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5M7.5 17.5h5" />
    </svg>
  )
}

function StatusMark({ status }: { status: string }) {
  const glyph = status === 'success' || status === 'approved' || status === 'resolved'
    ? '✓'
    : status === 'error' || status === 'rejected' || status === 'blocking'
      ? '×'
      : status === 'warning' || status === 'needsApproval'
        ? '!'
        : status === 'running' || status === 'streaming' || status === 'analyzing' || status === 'processing'
          ? '…'
          : '•'

  return <span className={styles.statusMark} data-tone={status} aria-hidden>{glyph}</span>
}

function PrivacyNote({ children }: { children: ReactNode }) {
  return (
    <p className={styles.privacyNote}>
      <span className={styles.inlineIcon}><ShieldIcon /></span>
      <span>{children}</span>
    </p>
  )
}

export interface CodexAiPromptComposerProps
  extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onChange'> {
  label?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  submitLabel?: string
  contextLabel?: string
  suggestions?: string[]
  maxLength?: number
  loading?: boolean
  disabled?: boolean
  error?: string
  privacyNotice?: ReactNode
  attachmentLabel?: string
  voiceControl?: ReactNode
  onValueChange?: (value: string) => void
  onSubmit?: (prompt: string) => void
  onAttach?: () => void
  onSuggestionSelect?: (suggestion: string) => void
}

/** Kaynak ve gizlilik sözleşmesini soru gönderilmeden önce görünür tutan AI istem alanı. */
export function CodexAiPromptComposer({
  label = 'AI asistana sor',
  value,
  defaultValue = '',
  placeholder = 'Örn. Urla’da 5 milyon TL altındaki müstakil tapulu arsaları karşılaştır',
  submitLabel = 'Yanıt oluştur',
  contextLabel,
  suggestions = [],
  maxLength = 1200,
  loading = false,
  disabled = false,
  error,
  privacyNotice = 'Kişisel bilgi, tapu belgesi veya açık adres paylaşmayın. Gönderdiğiniz içerik AI yanıtını üretmek için işlenir.',
  attachmentLabel = 'Bağlam dosyası ekle',
  voiceControl,
  onValueChange,
  onSubmit,
  onAttach,
  onSuggestionSelect,
  className,
  ...rest
}: CodexAiPromptComposerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const resolvedValue = value ?? internalValue
  const textareaId = useId()
  const descriptionId = useId()
  const errorId = useId()
  const unavailable = disabled || loading

  const updateValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const prompt = resolvedValue.trim()
    if (!prompt || unavailable) return
    onSubmit?.(prompt)
  }

  return (
    <form
      {...rest}
      className={classNames(styles.composer, className)}
      aria-busy={loading || undefined}
      onSubmit={submit}
    >
      <div className={styles.composerHeading}>
        <label htmlFor={textareaId}>{label}</label>
        {contextLabel ? <CodexBadge tone="info">{contextLabel}</CodexBadge> : null}
      </div>

      {suggestions.length ? (
        <div className={styles.suggestionGroup} aria-label="Önerilen sorular">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={styles.suggestion}
              disabled={unavailable}
              onClick={() => {
                updateValue(suggestion)
                onSuggestionSelect?.(suggestion)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.promptField} data-invalid={Boolean(error) || undefined} data-disabled={disabled || undefined}>
        <textarea
          id={textareaId}
          value={resolvedValue}
          maxLength={maxLength}
          rows={3}
          placeholder={placeholder}
          disabled={unavailable}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={[descriptionId, error ? errorId : null].filter(Boolean).join(' ')}
          onChange={(event) => updateValue(event.currentTarget.value)}
        />
        <div className={styles.composerToolbar}>
          <div className={styles.composerTools}>
            {onAttach ? (
              <button
                type="button"
                className={styles.toolButton}
                aria-label={attachmentLabel}
                title={attachmentLabel}
                disabled={unavailable}
                onClick={onAttach}
              >
                <PaperclipIcon />
              </button>
            ) : null}
            {voiceControl}
            <span className={styles.characterCount} aria-live="polite">
              {resolvedValue.length}/{maxLength}
            </span>
          </div>
          <CodexButton
            type="submit"
            size="sm"
            loading={loading}
            disabled={disabled || resolvedValue.trim().length === 0}
            prefix={<SparkIcon />}
          >
            {submitLabel}
          </CodexButton>
        </div>
      </div>

      <div id={descriptionId}><PrivacyNote>{privacyNotice}</PrivacyNote></div>
      {error ? <p id={errorId} className={styles.fieldError} role="alert"><span aria-hidden>!</span>{error}</p> : null}
    </form>
  )
}

export type CodexAiEvidenceKind = 'official' | 'listing' | 'market' | 'document' | 'user'

export interface CodexAiEvidence {
  id: string
  title: string
  source: string
  kind?: CodexAiEvidenceKind
  url?: string
  excerpt?: string
  updatedAt?: string
  verified?: boolean
  relevance?: number
}

export interface CodexAiEvidenceListProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  evidence: CodexAiEvidence[]
  emptyMessage?: string
  compact?: boolean
  onEvidenceOpen?: (evidence: CodexAiEvidence) => void
}

const evidenceKindLabels: Record<CodexAiEvidenceKind, string> = {
  official: 'Resmî kayıt',
  listing: 'İlan verisi',
  market: 'Piyasa verisi',
  document: 'Belge',
  user: 'Kullanıcı girdisi',
}

export function CodexAiEvidenceList({
  title = 'Dayanaklar',
  evidence,
  emptyMessage = 'Bu yanıt için gösterilebilir bir dayanak bulunamadı. Sonucu karar vermeden önce doğrulayın.',
  compact = false,
  onEvidenceOpen,
  className,
  ...rest
}: CodexAiEvidenceListProps) {
  const titleId = useId()

  return (
    <section
      {...rest}
      className={classNames(styles.evidence, compact && styles.compact, className)}
      aria-labelledby={titleId}
    >
      <div className={styles.sectionHeading}>
        <h3 id={titleId}>{title}</h3>
        <span>{evidence.length} kaynak</span>
      </div>
      {evidence.length ? (
        <ol className={styles.evidenceList}>
          {evidence.map((item, index) => {
            const kindLabel = evidenceKindLabels[item.kind ?? 'document']
            const content = (
              <>
                <span className={styles.evidenceIndex} aria-hidden>{index + 1}</span>
                <span className={styles.evidenceBody}>
                  <span className={styles.evidenceTitle}>{item.title}</span>
                  <span className={styles.evidenceMeta}>
                    {item.source} · {kindLabel}{item.updatedAt ? ` · ${item.updatedAt}` : ''}
                  </span>
                  {item.excerpt && !compact ? <span className={styles.evidenceExcerpt}>{item.excerpt}</span> : null}
                </span>
                <span className={styles.evidenceState}>
                  {item.verified ? <CodexBadge tone="success">Doğrulandı</CodexBadge> : <CodexBadge tone="warning">Doğrulanmalı</CodexBadge>}
                  {item.relevance !== undefined ? <span>İlgi %{clamp(item.relevance)}</span> : null}
                </span>
              </>
            )

            return (
              <li key={item.id}>
                {item.url ? (
                  <a href={item.url} className={styles.evidenceItem} onClick={() => onEvidenceOpen?.(item)}>
                    {content}
                  </a>
                ) : onEvidenceOpen ? (
                  <button type="button" className={styles.evidenceItem} onClick={() => onEvidenceOpen(item)}>
                    {content}
                  </button>
                ) : (
                  <div className={styles.evidenceItem}>{content}</div>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        <p className={styles.inlineEmpty} role="status">{emptyMessage}</p>
      )}
    </section>
  )
}

export type CodexAiConfidenceLevel = 'low' | 'medium' | 'high'

export interface CodexAiConfidenceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  score: number
  label?: string
  description?: ReactNode
  factors?: string[]
  compact?: boolean
}

function confidenceLevel(score: number): CodexAiConfidenceLevel {
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

const confidenceLabels: Record<CodexAiConfidenceLevel, string> = {
  low: 'Düşük güven',
  medium: 'Orta güven',
  high: 'Yüksek güven',
}

export function CodexAiConfidence({
  score,
  label = 'Yanıt güveni',
  description,
  factors = [],
  compact = false,
  className,
  ...rest
}: CodexAiConfidenceProps) {
  const normalized = clamp(Math.round(score))
  const level = confidenceLevel(normalized)
  const labelId = useId()

  return (
    <div
      {...rest}
      className={classNames(styles.confidence, compact && styles.confidenceCompact, className)}
      data-level={level}
    >
      <div className={styles.confidenceHeader}>
        <span id={labelId}>{label}</span>
        <strong>{confidenceLabels[level]} · %{normalized}</strong>
      </div>
      <div
        className={styles.confidenceMeter}
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
        aria-valuetext={`${confidenceLabels[level]}, yüzde ${normalized}`}
      >
        <span style={{ inlineSize: `${normalized}%` }} />
      </div>
      {description && !compact ? <p>{description}</p> : null}
      {factors.length && !compact ? (
        <ul className={styles.factorList} aria-label="Güven düzeyini etkileyen etkenler">
          {factors.map((factor) => <li key={factor}>{factor}</li>)}
        </ul>
      ) : null}
    </div>
  )
}

export type CodexAiAnswerStatus = 'loading' | 'streaming' | 'success' | 'warning' | 'error' | 'empty'
export type CodexAiHumanReview = 'none' | 'required' | 'approved' | 'rejected'

export interface CodexAiAnswerProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  status?: CodexAiAnswerStatus
  modelLabel?: string
  generatedAt?: string
  confidence?: number
  evidence?: CodexAiEvidence[]
  humanReview?: CodexAiHumanReview
  privacyNote?: ReactNode
  fallbackMessage?: string
  onRetry?: () => void
  onApprove?: () => void
  onReject?: () => void
}

const answerStatusLabels: Record<CodexAiAnswerStatus, string> = {
  loading: 'Kaynaklar taranıyor',
  streaming: 'Yanıt oluşturuluyor',
  success: 'Yanıt hazır',
  warning: 'Kontrol gerekli',
  error: 'Yanıt oluşturulamadı',
  empty: 'Henüz yanıt yok',
}

const reviewLabels: Record<CodexAiHumanReview, string> = {
  none: 'İnsan tarafından incelenmedi',
  required: 'İnsan onayı gerekli',
  approved: 'İnsan tarafından onaylandı',
  rejected: 'İnsan tarafından reddedildi',
}

export function CodexAiAnswer({
  title = 'AI yanıtı',
  status = 'success',
  modelLabel = 'Parsel AI',
  generatedAt,
  confidence,
  evidence = [],
  humanReview = 'none',
  privacyNote = 'Bu yanıt karar desteğidir; tapu, belediye ve yetkili kurum kayıtlarının yerini almaz.',
  fallbackMessage = 'Kaynaklara şu anda erişilemiyor. Filtreleri elle uygulayabilir veya daha sonra yeniden deneyebilirsiniz.',
  onRetry,
  onApprove,
  onReject,
  children,
  className,
  ...rest
}: CodexAiAnswerProps) {
  const titleId = useId()
  const liveRole = status === 'error' ? 'alert' : 'status'
  const tone = status === 'success' ? 'success' : status === 'error' ? 'danger' : status === 'warning' ? 'warning' : 'info'

  return (
    <article
      {...rest}
      className={classNames(styles.answer, className)}
      data-status={status}
      aria-labelledby={titleId}
      aria-busy={status === 'loading' || status === 'streaming' || undefined}
    >
      <header className={styles.answerHeader}>
        <div className={styles.answerIdentity}>
          <span className={styles.aiGlyph}><SparkIcon /></span>
          <div>
            <h2 id={titleId}>{title}</h2>
            <p>{modelLabel}{generatedAt ? ` · ${generatedAt}` : ''}</p>
          </div>
        </div>
        <CodexBadge tone={tone} dot>{answerStatusLabels[status]}</CodexBadge>
      </header>

      <div className={styles.answerLive} role={liveRole} aria-live={status === 'error' ? 'assertive' : 'polite'}>
        {status === 'loading' ? (
          <div className={styles.answerSkeleton} aria-label="Yanıt yükleniyor">
            <span /><span /><span />
          </div>
        ) : status === 'error' ? (
          <div className={styles.answerFallback}>
            <StatusMark status="error" />
            <div><strong>Güvenli geri dönüş</strong><p>{fallbackMessage}</p></div>
            {onRetry ? <CodexButton variant="secondary" size="sm" onClick={onRetry}>Yeniden dene</CodexButton> : null}
          </div>
        ) : status === 'empty' ? (
          <div className={styles.answerFallback}>
            <StatusMark status="empty" />
            <div><strong>Soru bekleniyor</strong><p>İlan, bölge veya fiyat hakkında bir soru sorarak başlayın.</p></div>
          </div>
        ) : (
          <div className={styles.answerContent}>
            {children}
            {status === 'streaming' ? <span className={styles.streamCursor} aria-label="Yanıt devam ediyor" /> : null}
          </div>
        )}
      </div>

      {status !== 'loading' && status !== 'error' && status !== 'empty' ? (
        confidence !== undefined ? (
          <CodexAiConfidence
            score={confidence}
            description="Güven düzeyi, kaynak güncelliği, örnek sayısı ve kayıtlar arası tutarlılığa göre hesaplandı."
          />
        ) : status === 'success' || status === 'warning' ? (
          <div className={styles.confidence} role="status">
            <div className={styles.confidenceHeader}><span>Yanıt güveni</span><strong>Ölçülmedi</strong></div>
            <p>Güven skoru sağlanmadı. Sonucu karar vermeden önce dayanaklardan ve yetkili kayıtlardan doğrulayın.</p>
          </div>
        ) : null
      ) : null}

      {evidence.length || status === 'success' || status === 'warning' ? (
        <CodexAiEvidenceList evidence={evidence} compact={status === 'streaming'} />
      ) : null}

      {humanReview !== 'none' || status === 'success' || status === 'warning' ? (
        <section className={styles.reviewBar} data-review={humanReview} aria-label="İnsan incelemesi">
          <StatusMark status={humanReview === 'required' ? 'needsApproval' : humanReview} />
          <div>
            <strong>{reviewLabels[humanReview]}</strong>
            <p>{humanReview === 'required'
              ? 'Yayınlama veya teklif verme öncesinde bu çıkarımları ve dayanakları kontrol edin.'
              : humanReview === 'none'
                ? 'Bu içerik yalnız AI tarafından üretildi; yetkili kayıtlar üzerinden bağımsız doğrulama gerekir.'
                : 'Karar ve inceleme durumu denetim kaydına işlendi.'}</p>
          </div>
          {humanReview === 'required' && (onApprove || onReject) ? (
            <div className={styles.inlineActions}>
              {onReject ? <CodexButton variant="quiet" size="sm" onClick={onReject}>Reddet</CodexButton> : null}
              {onApprove ? <CodexButton size="sm" onClick={onApprove}>Kontrol ettim</CodexButton> : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <footer className={styles.answerFooter}><PrivacyNote>{privacyNote}</PrivacyNote></footer>
    </article>
  )
}

export interface CodexAiSmartFilterItem {
  id: string
  label: string
  value: string
  confidence?: number
  reason?: string
  applied?: boolean
  locked?: boolean
  warning?: string
}

export type CodexAiSmartFilterStatus = 'ready' | 'loading' | 'error' | 'empty'

export interface CodexAiSmartFilterProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: string
  description?: string
  filters: CodexAiSmartFilterItem[]
  status?: CodexAiSmartFilterStatus
  errorMessage?: string
  onFilterChange?: (id: string, applied: boolean) => void
  onRemove?: (id: string) => void
  onApply?: () => void
  onRetry?: () => void
}

export function CodexAiSmartFilter({
  title = 'AI tarafından çıkarılan filtreler',
  description = 'Sorunuzdan anlaşılan ölçütleri sonuçlara uygulamadan önce kontrol edin.',
  filters,
  status = 'ready',
  errorMessage = 'Sorudaki filtreler çıkarılamadı. Filtreleri elle seçebilir veya yeniden deneyebilirsiniz.',
  onFilterChange,
  onRemove,
  onApply,
  onRetry,
  className,
  ...rest
}: CodexAiSmartFilterProps) {
  const titleId = useId()

  return (
    <section {...rest} className={classNames(styles.smartFilter, className)} aria-labelledby={titleId} aria-busy={status === 'loading' || undefined}>
      <div className={styles.smartFilterHeader}>
        <div><h2 id={titleId}>{title}</h2><p>{description}</p></div>
        <CodexBadge tone="accent">AI önerisi</CodexBadge>
      </div>

      {status === 'loading' ? (
        <div className={styles.filterSkeleton} role="status" aria-label="Filtreler çıkarılıyor"><span /><span /><span /></div>
      ) : status === 'error' ? (
        <div className={styles.inlineError} role="alert"><StatusMark status="error" /><p>{errorMessage}</p>{onRetry ? <CodexButton size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</CodexButton> : null}</div>
      ) : status === 'empty' || filters.length === 0 ? (
        <p className={styles.inlineEmpty} role="status">Soruda uygulanabilir bir filtre bulunamadı. İlçe, bütçe, metrekare veya tapu tipi eklemeyi deneyin.</p>
      ) : (
        <fieldset className={styles.filterFieldset}>
          <legend className={styles.visuallyHidden}>Uygulanacak AI filtreleri</legend>
          {filters.map((filter) => {
            const checked = filter.applied ?? true
            const checkId = `${titleId}-${filter.id}`
            return (
              <div key={filter.id} className={styles.filterRow} data-warning={Boolean(filter.warning) || undefined}>
                <input
                  id={checkId}
                  type="checkbox"
                  checked={checked}
                  disabled={filter.locked}
                  onChange={(event) => onFilterChange?.(filter.id, event.currentTarget.checked)}
                />
                <label htmlFor={checkId}>
                  <span className={styles.filterLabel}>{filter.label}</span>
                  <strong>{filter.value}</strong>
                  {filter.reason ? <span className={styles.filterReason}>{filter.reason}</span> : null}
                  {filter.warning ? <span className={styles.filterWarning}><span aria-hidden>!</span>{filter.warning}</span> : null}
                </label>
                <div className={styles.filterMeta}>
                  {filter.confidence !== undefined ? <span aria-label={`Güven yüzde ${clamp(filter.confidence)}`}>%{clamp(filter.confidence)}</span> : null}
                  {onRemove && !filter.locked ? <button type="button" onClick={() => onRemove(filter.id)} aria-label={`${filter.label} filtresini kaldır`}>Kaldır</button> : null}
                </div>
              </div>
            )
          })}
        </fieldset>
      )}

      {status === 'ready' && filters.length && onApply ? (
        <div className={styles.smartFilterFooter}>
          <p><ShieldIcon /> Filtreleri siz onaylamadan arama değişmez.</p>
          <CodexButton size="sm" onClick={onApply}>Seçili filtreleri uygula</CodexButton>
        </div>
      ) : null}
    </section>
  )
}

export type CodexAiRiskSeverity = 'low' | 'medium' | 'high' | 'blocking'
export type CodexAiRiskStatus = 'open' | 'resolved' | 'accepted'
export type CodexAiRiskDecision = 'pending' | 'approved' | 'rejected'

export interface CodexAiRiskItem {
  id: string
  title: string
  description: string
  severity: CodexAiRiskSeverity
  status?: CodexAiRiskStatus
  evidenceIds?: string[]
  recommendation?: string
}

export interface CodexAiRiskReviewProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: string
  summary?: string
  risks: CodexAiRiskItem[]
  decision?: CodexAiRiskDecision
  reviewer?: string
  onInspect?: (risk: CodexAiRiskItem) => void
  onResolve?: (risk: CodexAiRiskItem) => void
  onDecisionChange?: (decision: Exclude<CodexAiRiskDecision, 'pending'>) => void
}

const riskSeverityLabels: Record<CodexAiRiskSeverity, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  blocking: 'Kritik',
}

const riskStatusLabels: Record<CodexAiRiskStatus, string> = {
  open: 'Açık',
  resolved: 'Çözüldü',
  accepted: 'Risk kabul edildi',
}

export function CodexAiRiskReview({
  title = 'AI risk incelemesi',
  summary = 'İlan metni, görseller ve doğrulanmış kayıtlar arasındaki olası tutarsızlıklar.',
  risks,
  decision = 'pending',
  reviewer,
  onInspect,
  onResolve,
  onDecisionChange,
  className,
  ...rest
}: CodexAiRiskReviewProps) {
  const titleId = useId()
  const openRisks = risks.filter((risk) => (risk.status ?? 'open') === 'open')
  const severeRisks = openRisks.filter((risk) => risk.severity === 'high' || risk.severity === 'blocking')

  return (
    <section {...rest} className={classNames(styles.riskReview, className)} aria-labelledby={titleId} data-decision={decision}>
      <header className={styles.riskHeader}>
        <div><h2 id={titleId}>{title}</h2><p>{summary}</p></div>
        <div className={styles.riskSummary} aria-label={`${openRisks.length} açık risk, ${severeRisks.length} yüksek veya kritik risk`}>
          <strong>{openRisks.length}</strong><span>açık risk</span>
          <strong>{severeRisks.length}</strong><span>yüksek/kritik</span>
        </div>
      </header>

      {risks.length ? (
        <ul className={styles.riskList}>
          {risks.map((risk) => {
            const status = risk.status ?? 'open'
            return (
              <li key={risk.id} data-severity={risk.severity} data-status={status}>
                <StatusMark status={status === 'open' ? risk.severity : status} />
                <div className={styles.riskBody}>
                  <div className={styles.riskTitleRow}>
                    <h3>{risk.title}</h3>
                    <CodexBadge tone={risk.severity === 'blocking' || risk.severity === 'high' ? 'danger' : risk.severity === 'medium' ? 'warning' : 'neutral'}>
                      {riskSeverityLabels[risk.severity]}
                    </CodexBadge>
                    <span className={styles.riskStatus}>{riskStatusLabels[status]}</span>
                  </div>
                  <p>{risk.description}</p>
                  {risk.recommendation ? <p className={styles.recommendation}><strong>Öneri:</strong> {risk.recommendation}</p> : null}
                  {risk.evidenceIds?.length ? <span className={styles.linkedEvidence}>{risk.evidenceIds.length} dayanakla bağlantılı</span> : null}
                </div>
                {(onInspect || (onResolve && status === 'open')) ? (
                  <div className={styles.rowActions}>
                    {onInspect ? <CodexButton variant="quiet" size="sm" onClick={() => onInspect(risk)}>İncele</CodexButton> : null}
                    {onResolve && status === 'open' ? <CodexButton variant="secondary" size="sm" onClick={() => onResolve(risk)}>Çözüldü işaretle</CodexButton> : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : <p className={styles.inlineEmpty} role="status">İncelenecek risk bulunamadı. Yine de resmî kayıtları kontrol edin.</p>}

      <footer className={styles.decisionBar}>
        <div>
          <span className={styles.decisionLabel}>İnsan kararı</span>
          <strong>{decision === 'pending' ? 'Onay bekliyor' : decision === 'approved' ? 'İncelendi ve onaylandı' : 'Reddedildi'}</strong>
          {reviewer ? <span>İnceleyen: {reviewer}</span> : null}
        </div>
        {decision === 'pending' && onDecisionChange ? (
          <div className={styles.inlineActions}>
            <CodexButton variant="quiet" size="sm" onClick={() => onDecisionChange('rejected')}>Reddet</CodexButton>
            <CodexButton size="sm" disabled={severeRisks.length > 0} onClick={() => onDecisionChange('approved')}>İncelemeyi onayla</CodexButton>
          </div>
        ) : <CodexBadge tone={decision === 'approved' ? 'success' : decision === 'rejected' ? 'danger' : 'warning'}>{decision === 'pending' ? 'Bekliyor' : decision === 'approved' ? 'Onaylandı' : 'Reddedildi'}</CodexBadge>}
      </footer>
    </section>
  )
}

export type CodexAiVisionStatus = 'analyzing' | 'ready' | 'error' | 'empty'
export type CodexAiVisionFindingSeverity = 'info' | 'warning' | 'danger'

export interface CodexAiVisionFinding {
  id: string
  label: string
  detail: string
  confidence: number
  severity?: CodexAiVisionFindingSeverity
  region?: { x: number; y: number }
}

export interface CodexAiVisionInspectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: string
  photoLabel?: string
  status?: CodexAiVisionStatus
  findings?: CodexAiVisionFinding[]
  selectedFindingId?: string
  defaultSelectedFindingId?: string
  errorMessage?: string
  onFindingSelect?: (finding: CodexAiVisionFinding) => void
  onRetry?: () => void
  onRequestHumanReview?: () => void
}

export function CodexAiVisionInspection({
  title = 'Görsel inceleme',
  photoLabel = 'İlan fotoğrafı için semantik analiz alanı',
  status = 'ready',
  findings = [],
  selectedFindingId,
  defaultSelectedFindingId,
  errorMessage = 'Görsel analiz tamamlanamadı. Fotoğrafı elle inceleyin veya farklı bir görselle yeniden deneyin.',
  onFindingSelect,
  onRetry,
  onRequestHumanReview,
  className,
  ...rest
}: CodexAiVisionInspectionProps) {
  const [internalSelected, setInternalSelected] = useState(defaultSelectedFindingId ?? findings[0]?.id)
  const resolvedSelected = selectedFindingId ?? internalSelected
  const titleId = useId()

  const selectFinding = (finding: CodexAiVisionFinding) => {
    if (selectedFindingId === undefined) setInternalSelected(finding.id)
    onFindingSelect?.(finding)
  }

  return (
    <section {...rest} className={classNames(styles.vision, className)} aria-labelledby={titleId} aria-busy={status === 'analyzing' || undefined}>
      <header className={styles.visionHeader}>
        <div><h2 id={titleId}>{title}</h2><p>Fotoğraftaki bulgular karar desteğidir; ekspertiz veya resmî yapı incelemesi değildir.</p></div>
        <CodexBadge tone={status === 'ready' ? 'success' : status === 'error' ? 'danger' : 'info'}>{status === 'ready' ? 'Analiz hazır' : status === 'analyzing' ? 'Analiz ediliyor' : status === 'error' ? 'Analiz hatası' : 'Görsel yok'}</CodexBadge>
      </header>

      <div className={styles.visionLayout}>
        <figure className={styles.mediaFigure}>
          <div className={styles.mediaPlaceholder} role="img" aria-label={photoLabel} data-status={status}>
            <div className={styles.mediaLabel}><CameraIcon /><span>{status === 'empty' ? 'Görsel bekleniyor' : 'İlan görseli analiz alanı'}</span></div>
            {status === 'analyzing' ? <span className={styles.scanLine} aria-hidden /> : null}
            {status === 'ready' ? findings.map((finding, index) => (
              <button
                key={finding.id}
                type="button"
                className={styles.findingMarker}
                style={{ insetInlineStart: `${clamp(finding.region?.x ?? 18 + index * 22, 5, 90)}%`, insetBlockStart: `${clamp(finding.region?.y ?? 20 + index * 17, 7, 86)}%` }}
                aria-label={`${index + 1}. bulgu: ${finding.label}`}
                aria-pressed={resolvedSelected === finding.id}
                onClick={() => selectFinding(finding)}
              >
                {index + 1}
              </button>
            )) : null}
          </div>
          <figcaption>{photoLabel}. İşaretler aşağıdaki bulgu listesiyle eşleşir.</figcaption>
        </figure>

        <div className={styles.findingsPanel}>
          {status === 'analyzing' ? (
            <div className={styles.visionProgress} role="status"><StatusMark status="analyzing" /><div><strong>Görsel taranıyor</strong><p>Yapı öğeleri, hasar izleri ve ilan metniyle tutarlılık kontrol ediliyor.</p></div></div>
          ) : status === 'error' ? (
            <div className={styles.visionProgress} role="alert"><StatusMark status="error" /><div><strong>Analiz güvenle tamamlanamadı</strong><p>{errorMessage}</p></div>{onRetry ? <CodexButton variant="secondary" size="sm" onClick={onRetry}>Yeniden dene</CodexButton> : null}</div>
          ) : status === 'empty' || findings.length === 0 ? (
            <p className={styles.inlineEmpty} role="status">Bulguları görmek için ilan fotoğrafı ekleyin. EXIF ve yüz gibi hassas veriler işlenmeden önce kaldırılmalıdır.</p>
          ) : (
            <ol className={styles.findingList} aria-label="Görsel analiz bulguları">
              {findings.map((finding, index) => (
                <li key={finding.id}>
                  <button type="button" aria-pressed={resolvedSelected === finding.id} onClick={() => selectFinding(finding)}>
                    <span className={styles.findingNumber}>{index + 1}</span>
                    <span className={styles.findingCopy}><strong>{finding.label}</strong><span>{finding.detail}</span></span>
                    <span className={styles.findingConfidence} data-severity={finding.severity ?? 'info'}>Güven %{clamp(finding.confidence)}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <footer className={styles.visionFooter}>
        <PrivacyNote>Yüklemeden önce yüz, plaka, belge numarası ve açık adres gibi kişisel verileri maskeleyin.</PrivacyNote>
        {onRequestHumanReview ? <CodexButton variant="secondary" size="sm" onClick={onRequestHumanReview}>Uzman incelemesi iste</CodexButton> : null}
      </footer>
    </section>
  )
}

export type CodexAiActivityStatus = 'queued' | 'running' | 'success' | 'warning' | 'error' | 'needsApproval'

export interface CodexAiActivityItem {
  id: string
  label: string
  description?: string
  tool?: string
  time?: string
  status: CodexAiActivityStatus
  detail?: string
}

export interface CodexAiAgentActivityProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: string
  items: CodexAiActivityItem[]
  live?: boolean
  onInspect?: (item: CodexAiActivityItem) => void
  onApprove?: (item: CodexAiActivityItem) => void
  onReject?: (item: CodexAiActivityItem) => void
  onCancel?: () => void
}

const activityStatusLabels: Record<CodexAiActivityStatus, string> = {
  queued: 'Sırada',
  running: 'Çalışıyor',
  success: 'Tamamlandı',
  warning: 'Uyarı',
  error: 'Hata',
  needsApproval: 'Onay gerekli',
}

export function CodexAiAgentActivity({
  title = 'AI ajan etkinliği',
  items,
  live = false,
  onInspect,
  onApprove,
  onReject,
  onCancel,
  className,
  ...rest
}: CodexAiAgentActivityProps) {
  const titleId = useId()
  const active = items.some((item) => item.status === 'running' || item.status === 'queued')

  return (
    <section {...rest} className={classNames(styles.activity, className)} aria-labelledby={titleId} aria-busy={active || undefined}>
      <header className={styles.activityHeader}>
        <div><h2 id={titleId}>{title}</h2><p>Ajanın kullandığı araçlar ve karar bekleyen adımlar denetim kaydı olarak gösterilir.</p></div>
        {active && onCancel ? <CodexButton variant="quiet" size="sm" onClick={onCancel}>Çalışmayı durdur</CodexButton> : null}
      </header>
      {items.length ? (
        <ol className={styles.activityList} role="log" aria-live={live ? 'polite' : 'off'} aria-label="Ajan işlem günlüğü">
          {items.map((item) => (
            <li key={item.id} data-status={item.status}>
              <StatusMark status={item.status} />
              <div className={styles.activityBody}>
                <div className={styles.activityTitle}><strong>{item.label}</strong><span>{activityStatusLabels[item.status]}</span></div>
                {item.description ? <p>{item.description}</p> : null}
                <div className={styles.activityMeta}>{item.tool ? <span>Araç: {item.tool}</span> : null}{item.time ? <time>{item.time}</time> : null}</div>
                {item.detail ? <details><summary>Teknik ayrıntı</summary><p>{item.detail}</p></details> : null}
              </div>
              <div className={styles.rowActions}>
                {onInspect ? <CodexButton variant="quiet" size="sm" onClick={() => onInspect(item)}>İncele</CodexButton> : null}
                {item.status === 'needsApproval' && onReject ? <CodexButton variant="quiet" size="sm" onClick={() => onReject(item)}>Reddet</CodexButton> : null}
                {item.status === 'needsApproval' && onApprove ? <CodexButton size="sm" onClick={() => onApprove(item)}>İzin ver</CodexButton> : null}
              </div>
            </li>
          ))}
        </ol>
      ) : <p className={styles.inlineEmpty} role="status">Henüz bir ajan işlemi başlatılmadı. İlk işlem başladığında araç çağrıları burada görünecek.</p>}
      <PrivacyNote>Ajan, siz açıkça izin vermeden ilan yayınlamaz, mesaj göndermez veya teklif oluşturmaz.</PrivacyNote>
    </section>
  )
}

export type CodexAiMessageRole = 'user' | 'assistant' | 'system'
export type CodexAiMessageStatus = 'sent' | 'streaming' | 'error'

export interface CodexAiConversationMessage {
  id: string
  role: CodexAiMessageRole
  content: ReactNode
  timestamp?: string
  status?: CodexAiMessageStatus
  evidence?: CodexAiEvidence[]
  reviewed?: boolean
}

export interface CodexAiConversationProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: string
  messages: CodexAiConversationMessage[]
  composer?: ReactNode
  loading?: boolean
  onRetryMessage?: (message: CodexAiConversationMessage) => void
}

const roleLabels: Record<CodexAiMessageRole, string> = {
  user: 'Siz',
  assistant: 'Parsel AI',
  system: 'Sistem',
}

export function CodexAiConversation({
  title = 'AI görüşmesi',
  messages,
  composer,
  loading = false,
  onRetryMessage,
  className,
  ...rest
}: CodexAiConversationProps) {
  const titleId = useId()

  return (
    <section {...rest} className={classNames(styles.conversation, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.conversationHeader}>
        <div><h2 id={titleId}>{title}</h2><p>Yanıtlar kaynaklarıyla birlikte saklanır; hassas bilgi paylaşmayın.</p></div>
        <CodexBadge tone="info" dot>{loading ? 'Yanıtlıyor' : 'Hazır'}</CodexBadge>
      </header>
      {messages.length ? (
        <ol className={styles.messageList} role="log" aria-live="polite" aria-label="AI görüşme mesajları">
          {messages.map((message) => {
            const status = message.status ?? 'sent'
            return (
              <li key={message.id} className={styles.message} data-role={message.role} data-status={status}>
                <div className={styles.messageMeta}>
                  <strong>{roleLabels[message.role]}</strong>
                  {message.reviewed ? <span>İnsan tarafından kontrol edildi</span> : null}
                  {message.timestamp ? <time>{message.timestamp}</time> : null}
                </div>
                <div className={styles.messageContent}>
                  {message.content}
                  {status === 'streaming' ? <span className={styles.streamCursor} aria-label="Yanıt devam ediyor" /> : null}
                </div>
                {status === 'error' ? (
                  <div className={styles.messageError} role="alert">
                    <span>Mesaj tamamlanamadı. Önceki içerik korunuyor.</span>
                    {onRetryMessage ? <button type="button" onClick={() => onRetryMessage(message)}>Yeniden dene</button> : null}
                  </div>
                ) : null}
                {message.evidence?.length ? <CodexAiEvidenceList title="Bu yanıttaki dayanaklar" evidence={message.evidence} compact /> : null}
              </li>
            )
          })}
        </ol>
      ) : (
        <div className={styles.conversationEmpty} role="status"><SparkIcon /><strong>Henüz mesaj yok</strong><p>Bir bölge, ilan veya yatırım ölçütü hakkında soru sorarak başlayın.</p></div>
      )}
      {composer ? <div className={styles.conversationComposer}>{composer}</div> : null}
    </section>
  )
}

export type CodexAiVoiceStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error'

export interface CodexAiVoiceControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  status?: CodexAiVoiceStatus
  transcript?: string
  language?: string
  errorMessage?: string
  compact?: boolean
  onStart?: () => void
  onStop?: () => void
  onCancel?: () => void
  onTranscriptAccept?: (transcript: string) => void
}

const voiceStatusLabels: Record<CodexAiVoiceStatus, string> = {
  idle: 'Sesle soru sor',
  listening: 'Dinleniyor',
  processing: 'Konuşma yazıya çevriliyor',
  success: 'Metin hazır',
  error: 'Ses algılanamadı',
}

export function CodexAiVoiceControl({
  status = 'idle',
  transcript = '',
  language = 'Türkçe (TR)',
  errorMessage = 'Mikrofona erişilemedi. Tarayıcı iznini kontrol edin veya sorunuzu yazarak devam edin.',
  compact = false,
  onStart,
  onStop,
  onCancel,
  onTranscriptAccept,
  className,
  ...rest
}: CodexAiVoiceControlProps) {
  const active = status === 'listening' || status === 'processing'
  const liveRole = status === 'error' ? 'alert' : transcript ? undefined : 'status'

  if (compact) {
    return (
      <button
        type="button"
        className={styles.voiceCompact}
        aria-label={status === 'listening' ? 'Ses kaydını durdur' : voiceStatusLabels[status]}
        aria-pressed={status === 'listening'}
        disabled={status === 'processing'}
        onClick={status === 'listening' ? onStop : onStart}
      >
        <MicrophoneIcon />
      </button>
    )
  }

  return (
    <div {...rest} className={classNames(styles.voice, className)} data-status={status} aria-busy={active || undefined}>
      <div className={styles.voicePrimary}>
        <button
          type="button"
          className={styles.voiceButton}
          aria-label={status === 'listening' ? 'Ses kaydını durdur' : 'Ses kaydını başlat'}
          aria-pressed={status === 'listening'}
          disabled={status === 'processing'}
          onClick={status === 'listening' ? onStop : onStart}
        >
          <MicrophoneIcon />
        </button>
        <div><strong>{voiceStatusLabels[status]}</strong><span>{language}</span></div>
        {active && onCancel ? <CodexButton variant="quiet" size="sm" onClick={onCancel}>İptal</CodexButton> : null}
      </div>
      <div className={styles.voiceLive} role={liveRole} aria-live={status === 'error' ? 'assertive' : 'polite'}>
        {status === 'error' ? <p>{errorMessage}</p> : transcript ? <output aria-label="Algılanan konuşma">“{transcript}”</output> : <p>Mikrofon yalnız siz başlattığınızda dinler. Ses kaydı saklanmaz.</p>}
      </div>
      {status === 'success' && transcript && onTranscriptAccept ? <CodexButton size="sm" onClick={() => onTranscriptAccept(transcript)}>Metni kullan</CodexButton> : null}
    </div>
  )
}
