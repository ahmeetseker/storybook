// GlassPersonalNote — ilana özel gizli kullanıcı notu.
// İçerik katmanı FLAT (cam/backdrop-filter YOK). AI-first kontratı BURADA
// UYGULANMAZ: içerik yapay zekâ üretimi DEĞİL, tamamen kullanıcının kendi
// yazdığı özel bir metin — "✦ AI" rozeti/confidence/onFeedback/loading
// eksenleri bilinçli olarak eklenmedi (bkz. rules.md §12 "Açık kararlar").
import {
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import styles from './GlassPersonalNote.module.css'

export interface GlassPersonalNoteProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Controlled not metni — verilirse component controlled çalışır */
  value?: string
  /** Uncontrolled kullanımda başlangıç metni */
  defaultValue?: string
  /** "Kaydet" tıklandığında trimlenmiş metinle çağrılır (controlled/uncontrolled fark etmez) */
  onValueChange?: (value: string) => void
  /** "Kaydet" tıklandığında trimlenmiş metinle çağrılır — kalıcılaştırma (ör. API çağrısı) çağıranın sorumluluğunda */
  onSave?: (text: string) => void
  /** Textarea boşken görünen ipucu metni */
  placeholder?: string
  /** Maksimum karakter sayısı — sonlu değilse/0 veya negatifse varsayılana (500) düşer */
  maxLength?: number
}

const PRIVACY_TEXT = 'Yalnız sen görürsün'
const DEFAULT_MAX_LENGTH = 500
const NEAR_LIMIT_THRESHOLD = 20

function resolveMaxLength(maxLength: number | undefined): number {
  if (maxLength === undefined || !Number.isFinite(maxLength) || maxLength <= 0) {
    return DEFAULT_MAX_LENGTH
  }
  return Math.floor(maxLength)
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M13.4 3.3 16.7 6.6 7.3 16H4v-3.3L13.4 3.3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" width="12" height="12" fill="none" aria-hidden="true" focusable="false">
      <rect x="4.5" y="9" width="11" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 9V6.6a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Kullanıcının ilana özel gizli notu. Üç görsel durumu var: not yokken kalem
 * ikonlu "Not ekle" satırı, düzenlenirken flat textarea + Kaydet/Vazgeç,
 * kayıtlı notu varken not metni + "Düzenle" aksiyonu. "Yalnız sen görürsün"
 * gizlilik satırı üç durumda da sabit görünür. İçerik katmanı FLAT — cam
 * yüzey/backdrop-filter kullanılmaz.
 *
 * Düzenleme durumu tamamen iç state'tir (controlled değil) — bu yüzden odak
 * yönetimi basittir: `editing` yalnız BU component'in kendi buton
 * tıklamalarıyla değişir, dışarıdan asla programatik tetiklenmez, dolayısıyla
 * her geçiş "kullanıcı etkileşimi" sayılır ve odak taşınması güvenlidir
 * (bkz. rules.md §7).
 */
export function GlassPersonalNote({
  value,
  defaultValue = '',
  onValueChange,
  onSave,
  placeholder = 'Bu ilan hakkında not al — yalnız sen görürsün',
  maxLength,
  className,
  ...rest
}: GlassPersonalNoteProps) {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const committed = value ?? innerValue
  const hasNote = committed.trim().length > 0

  const safeMaxLength = resolveMaxLength(maxLength)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [liveMessage, setLiveMessage] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const prevEditingRef = useRef(editing)

  // `editing` yalnız startEdit/save/cancelEdit'in çağırdığı senkron `setEditing`
  // ile değişir — hepsi doğrudan kullanıcı tıklamasından/Escape'ten tetiklenir.
  // Bu yüzden `was === editing` kontrolü yalnız mount'ta erken çıkışı sağlar,
  // sonraki her geçişte odak taşınması güvenle yapılabilir (ChatDock'taki
  // `userTriggeredRef` bayrağına burada gerek yok — controlled bir `open`
  // prop'u olmadığından dışarıdan programatik bir geçiş yolu yok).
  useLayoutEffect(() => {
    const was = prevEditingRef.current
    prevEditingRef.current = editing
    if (was === editing) return
    if (editing) {
      textareaRef.current?.focus()
    } else {
      triggerRef.current?.focus()
    }
  }, [editing])

  const startEdit = () => {
    setDraft(committed)
    setLiveMessage('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const save = () => {
    const trimmed = draft.trim()
    if (value === undefined) setInnerValue(trimmed)
    onValueChange?.(trimmed)
    onSave?.(trimmed)
    setEditing(false)
    setLiveMessage('Not kaydedildi')
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    // Tarayıcı native `maxLength` ile yazmayı zaten sınırlar; programatik
    // yapıştırma/IME uçlarına karşı ek savunma olarak burada da kırpılır.
    setDraft(next.length > safeMaxLength ? next.slice(0, safeMaxLength) : next)
  }

  // Escape kapsayıcı textarea'nın onKeyDown'unda yakalanır — document
  // genelinde DEĞİL: yalnız textarea odaktayken çalışır, sayfadaki başka bir
  // Escape dinleyicisiyle çakışmaz. Kapanışı işledikten sonra
  // e.stopPropagation() çağrılır (bkz. GlassChatDock dersi). IME kompozisyonu
  // sürerken (isComposing/key==='Process') Escape adayı iptal etmek için
  // kullanılabildiğinden yok sayılır.
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.key === 'Process') return
    if (e.key === 'Escape') {
      e.stopPropagation()
      cancelEdit()
    }
  }

  const remaining = Math.max(0, safeMaxLength - draft.length)
  const nearLimit = remaining <= NEAR_LIMIT_THRESHOLD

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {/* AT'ye yalnızca "kaydedildi" onayı iletilir — her render'da mount
          edilir, sonradan mount edilen aria-live bölgeleri duyurulmaz. */}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {liveMessage}
      </span>

      {editing ? (
        <div className={styles.editor}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={draft}
            placeholder={placeholder}
            aria-label="Not metni"
            maxLength={safeMaxLength}
            rows={4}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <div className={styles.editorFooter}>
            <span className={styles.counter} data-near-limit={nearLimit || undefined}>
              {remaining} karakter kaldı
            </span>
            <div className={styles.editorActions}>
              <button type="button" className={styles.cancelButton} onClick={cancelEdit}>
                Vazgeç
              </button>
              <button type="button" className={styles.saveButton} onClick={save}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      ) : hasNote ? (
        <div className={styles.noteBlock}>
          <p className={styles.noteText}>{committed}</p>
          <button type="button" ref={triggerRef} className={styles.editButton} onClick={startEdit}>
            <PencilIcon />
            Düzenle
          </button>
        </div>
      ) : (
        <button type="button" ref={triggerRef} className={styles.addButton} onClick={startEdit}>
          <PencilIcon />
          Not ekle
        </button>
      )}

      <p className={styles.privacy}>
        <LockIcon />
        {PRIVACY_TEXT}
      </p>
    </div>
  )
}
