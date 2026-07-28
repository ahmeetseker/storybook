import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type FormHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { GlassButton } from '../GlassButton'
import styles from './GlassAiComposer.module.css'

/** Kompozitörün altındaki bağlam ekleme butonu — tıklama parent'a devredilir (harita/dosya seçici parent'ın işi). */
export interface GlassAiComposerTool {
  /** Callback'te geri verilen kimlik — DOM id'sine yazılmaz */
  id: string
  /** Buton metni; ikon-tek buton değildir, accessible name bu metinden gelir */
  label: string
  /** Dekoratif ikon — aria-hidden ile render edilir */
  icon?: ReactNode
  disabled?: boolean
}

/** Brief'e eklenmiş bağlam parçası — textarea üstünde kaldırılabilir chip olarak görünür. */
export interface GlassAiComposerAttachment {
  /** Kaldırma callback'inde geri verilen kimlik */
  id: string
  /** Chip metni, ör. "Urla, 4 km²" */
  label: string
  /** Tür etiketi, ör. "Harita alanı" — kaldır butonunun erişilebilir adında kullanılır */
  kind?: string
  /** Dekoratif ikon */
  icon?: ReactNode
}

/** Cevabın altındaki takip önerisi. */
export interface GlassAiComposerAnswerChip {
  id: string
  label: string
}

/** AI'nin brief'e verdiği tek seferlik yapılandırılmış cevap. */
export interface GlassAiComposerAnswer {
  /** Özet metin — tek paragraf, markdown yorumlanmaz */
  text: string
  /** Takip önerileri; tıklama onAnswerChipSelect ile bildirilir */
  chips?: GlassAiComposerAnswerChip[]
  /** Atıf satırı, ör. "27 ilan · 3 bölge verisi" */
  sources?: string
}

export interface GlassAiComposerProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> {
  /** Controlled brief metni */
  value?: string
  /** Kontrolsüz başlangıç metni */
  defaultValue?: string
  /** Metin her değiştiğinde çağrılır (controlled desen: value + defaultValue + onValueChange) */
  onValueChange?: (value: string) => void
  /** Enter veya gönder butonuyla gönderimde çağrılır; boş/yalnız boşluk metin çağırmaz */
  onSubmit: (value: string) => void
  placeholder?: string
  /** Textarea'nın accessible name'i — placeholder'dan bağımsızdır */
  label?: string
  /** lg: hero/tam yerleşim (3 satır) · md: dar alan (1 satır). Anatomi iki ölçekte aynıdır. */
  size?: 'md' | 'lg'
  /** Bağlam ekleme butonları; boşsa araç çubuğunda yalnız gönder butonu kalır */
  tools?: GlassAiComposerTool[]
  /** Bir araç butonuna basılınca aracın id'siyle çağrılır */
  onToolSelect?: (id: string) => void
  /** Eklenmiş bağlam parçaları — textarea üstünde kaldırılabilir chip dizisi */
  attachments?: GlassAiComposerAttachment[]
  /** Bir ekin kaldır butonuna basılınca ekin id'siyle çağrılır */
  onRemoveAttachment?: (id: string) => void
  /** Cevap hazırlanırken: giriş devre dışı kalır + "düşünüyor" göstergesi görünür */
  loading?: boolean
  /** loading sırasında gösterilen metin */
  loadingLabel?: string
  /** Gönderim sonucu; verildiğinde kompozitörün altında düz cevap kartı olarak görünür */
  answer?: GlassAiComposerAnswer | null
  /** Cevabın takip önerisi chip'ine basılınca chip id'siyle çağrılır */
  onAnswerChipSelect?: (id: string) => void
  /** Duyuru sahipliği: standalone kullanımda internal, parent live-region varsa external */
  announcementMode?: 'internal' | 'external'
}

// Dekoratif ikonlar — accessible name her zaman metinden/aria-label'dan gelir.
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

/** Ekin kaldır butonunun erişilebilir adı — aynı etiketli iki ek AT'de ayırt edilebilsin diye tür de dahildir. */
function removeLabel(attachment: GlassAiComposerAttachment): string {
  return attachment.kind
    ? `Eki kaldır: ${attachment.kind}: ${attachment.label}`
    : `Eki kaldır: ${attachment.label}`
}

/**
 * Konuşmalı brief kompozitörü — tek satırlık arama yerine uzun cümleyle ne
 * arandığını anlatmak, isteğe bağlı bağlam (harita alanı, görsel, ses) eklemek
 * ve karşılığında liste değil özet + takip önerisi + atıf almak için.
 *
 * Tek seferlik akıştır: bir brief, bir cevap. Çok turlu sohbet `GlassChatDock`'un,
 * tek satırlık filtre çıkarma `GlassAiSearchBar`'ın işidir.
 *
 * Kabuk düz yüzeydir (surface + hairline) — cam yalnız gömülü gönder
 * butonundadır (kontrol katmanı).
 */
export function GlassAiComposer({
  value,
  defaultValue,
  onValueChange,
  onSubmit,
  placeholder = 'Aradığını anlat — "Ailemle taşınacağız, okula yakın, bahçeli, 6 milyona kadar…"',
  label = 'Aradığını anlat',
  size = 'lg',
  tools,
  onToolSelect,
  attachments,
  onRemoveAttachment,
  loading = false,
  loadingLabel = 'Yanıt hazırlanıyor…',
  answer,
  onAnswerChipSelect,
  announcementMode = 'internal',
  className,
  ...rest
}: GlassAiComposerProps) {
  const uid = useId()
  const statusId = `${uid}-status`
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [inner, setInner] = useState(defaultValue ?? '')
  const controlled = value !== undefined
  const currentValue = controlled ? value : inner

  const hasTools = Boolean(tools && tools.length > 0)
  const hasAttachments = Boolean(attachments && attachments.length > 0)
  const canSubmit = currentValue.trim().length > 0 && !loading

  // Auto-grow: yükseklik önce sıfırlanır ki metin kısalınca da küçülsün.
  // Maksimum yükseklik CSS'te (max-height) tanımlı; aşınca iç scroll devreye girer.
  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  // Değer veya ölçek değişince (ölçek max-height'ı değiştirir) yeniden ölç.
  useLayoutEffect(() => {
    resize()
  }, [currentValue, size, resize])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    if (!controlled) setInner(next)
    onValueChange?.(next)
  }

  const submit = () => {
    const trimmed = currentValue.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed)
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    // IME kompozisyonu sürerken (ör. CJK/uzantılı Latin giriş) Enter, adayı
    // onaylamak için basılır — henüz tamamlanmamış taslağı erken göndermemek
    // için bu durumda yok sayılır (keyCode 229: bazı tarayıcılarda isComposing
    // bayrağı Enter'ın composition-end olayıyla aynı anda false olabildiğinden
    // ek güvenlik kontrolü).
    if (
      e.nativeEvent.isComposing ||
      e.key === 'Process' ||
      (e as unknown as { keyCode?: number }).keyCode === 229
    ) {
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
    // Shift+Enter: varsayılan davranış korunur — textarea'ya satır ekler
  }

  const classes = [styles.root, styles[size], className].filter(Boolean).join(' ')

  return (
    <form
      className={classes}
      aria-label="AI ile arama"
      onSubmit={handleFormSubmit}
      data-size={size}
      {...rest}
    >
      <div className={styles.shell} data-disabled={loading ? '' : undefined}>
        {hasAttachments && (
          <ul className={styles.attachments}>
            {attachments!.map((a) => (
              <li key={a.id} className={styles.attachmentItem}>
                <span className={styles.attachment}>
                  {a.icon && (
                    <span className={styles.attachmentIcon} aria-hidden="true">
                      {a.icon}
                    </span>
                  )}
                  <span className={styles.attachmentLabel}>{a.label}</span>
                  <button
                    type="button"
                    className={styles.attachmentRemove}
                    aria-label={removeLabel(a)}
                    disabled={loading}
                    onClick={() => onRemoveAttachment?.(a.id)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          rows={1}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={label}
          aria-describedby={statusId}
          disabled={loading}
        />

        <div className={styles.toolbar}>
          {hasTools && (
            <div className={styles.tools}>
              {tools!.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={styles.tool}
                  disabled={loading || t.disabled}
                  onClick={() => onToolSelect?.(t.id)}
                >
                  {t.icon && (
                    <span className={styles.toolIcon} aria-hidden="true">
                      {t.icon}
                    </span>
                  )}
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <GlassButton
            type="submit"
            className={styles.submit}
            aria-label="Gönder"
            disabled={!canSubmit}
            loading={loading}
          >
            <SendIcon />
          </GlassButton>
        </div>
      </div>

      {/* Tek canlı durum bölgesi — her zaman mount; boşken :empty ile katlanır,
          layout'a boşluk eklemez. Hem "düşünüyor" hem cevap buradan duyurulur,
          böylece cevap kartında ikinci bir role="status" gerekmez. */}
      <div
        id={statusId}
        className={styles.status}
        {...(announcementMode === 'internal' ? { 'aria-live': 'polite' as const } : {})}
      >
        {loading && (
          <p className={styles.thinking}>
            <span className={styles.thinkingDot} aria-hidden="true" />
            {loadingLabel}
          </p>
        )}
        {!loading && answer && (
          <div className={styles.answer}>
            <p className={styles.answerText}>{answer.text}</p>
            {answer.chips && answer.chips.length > 0 && (
              <div className={styles.answerChips}>
                {answer.chips.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={styles.answerChip}
                    onClick={() => onAnswerChipSelect?.(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {answer.sources && <p className={styles.answerSources}>{answer.sources}</p>}
          </div>
        )}
      </div>
    </form>
  )
}
