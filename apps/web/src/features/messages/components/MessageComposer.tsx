import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { GlassIconButton, GlassTextarea } from '@repo/ui'
import type { UploadAttachmentOperation } from '../domain/message-types'

const ACCEPTED_ATTACHMENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const MAX_ATTACHMENTS = 10
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

/**
 * Composer'ın bu istemci oturumunda hazır tuttuğu gönderim verisi.
 * `attachments` yalnızca stage edilmiş tarayıcı `File` nesneleridir; base64 ya da
 * sunucuya yüklenmiş ek kimliği içermez. Entegrasyon katmanı bunları uygun akışla yükler.
 */
export interface ComposerSubmission {
  body: string
  attachments: File[]
}

export interface MessageComposerProps {
  value: string
  onValueChange: (value: string) => void
  /**
   * Workspace gönderimi kendi kuyruğuna kabul ettiğinde `true`/`void`,
   * kurtarılabilir bir hata oluştuğunda `false` döndürür. Promise sonuçlanana
   * kadar kontrollü gövde ve yerel ekler korunur.
   */
  onSend: (
    input: ComposerSubmission,
  ) => void | boolean | Promise<void | boolean>
  disabled?: boolean
  readOnly?: boolean
  disabledReason?: string
  attachmentCapability?: UploadAttachmentOperation
  maxLength: number
}

interface StagedAttachment {
  id: string
  file: File
  previewUrl?: string
  error?: string
}

function previewUrlFor(file: File): string | undefined {
  if (!file.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') {
    return undefined
  }
  return URL.createObjectURL(file)
}

/** Kontrollü mesaj gövdesini ve henüz upload edilmemiş yerel ekleri gönderime hazırlar. */
export function MessageComposer({
  value,
  onValueChange,
  onSend,
  disabled = false,
  readOnly = false,
  disabledReason,
  attachmentCapability,
  maxLength,
}: MessageComposerProps) {
  const reasonId = useId()
  const inputId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isComposingRef = useRef(false)
  const submittingRef = useRef(false)
  const attachmentSequenceRef = useRef(0)
  const previewUrlsRef = useRef(new Set<string>())
  const [attachments, setAttachments] = useState<StagedAttachment[]>([])
  const [submitting, setSubmitting] = useState(false)
  const hasAttachmentCapability = Boolean(attachmentCapability)
  const unavailable = disabled || readOnly
  const interactionUnavailable = unavailable || submitting

  const releasePreview = (previewUrl: string | undefined) => {
    if (!previewUrl || !previewUrlsRef.current.delete(previewUrl)) return
    URL.revokeObjectURL(previewUrl)
  }

  const releaseAllPreviews = () => {
    previewUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl))
    previewUrlsRef.current.clear()
  }

  useEffect(() => releaseAllPreviews, [])

  useEffect(() => {
    if (hasAttachmentCapability) return
    releaseAllPreviews()
    setAttachments([])
  }, [hasAttachmentCapability])

  const focusTextarea = () => {
    formRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus()
  }

  const submit = async () => {
    const body = value.trim()
    if (interactionUnavailable || submittingRef.current || !body) return

    submittingRef.current = true
    setSubmitting(true)
    let accepted = false
    try {
      const result = onSend({
        body: value,
        attachments: hasAttachmentCapability
          ? attachments.flatMap((attachment) =>
              attachment.error ? [] : [attachment.file],
            )
          : [],
      })
      const outcome =
        result &&
        typeof (result as PromiseLike<void | boolean>).then === 'function'
          ? await result
          : result
      accepted = outcome !== false
    } catch {
      accepted = false
    } finally {
      if (accepted) {
        releaseAllPreviews()
        setAttachments([])
        onValueChange('')
      }
      submittingRef.current = false
      setSubmitting(false)
      queueMicrotask(focusTextarea)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !isComposingRef.current &&
      !event.nativeEvent.isComposing &&
      !unavailable
    ) {
      event.preventDefault()
      void submit()
    }
  }

  const addFiles = (files: File[]) => {
    if (interactionUnavailable || !hasAttachmentCapability) return

    let acceptedCount = attachments.filter((attachment) => !attachment.error).length
    const next = files.map((file): StagedAttachment => {
      let error: string | undefined
      if (!ACCEPTED_ATTACHMENT_TYPES.has(file.type)) {
        error = 'Bu dosya türü desteklenmiyor.'
      } else if (file.size > MAX_ATTACHMENT_BYTES) {
        error = 'Dosya en fazla 10 MB olabilir.'
      } else if (acceptedCount >= MAX_ATTACHMENTS) {
        error = 'En fazla 10 dosya ekleyebilirsiniz.'
      } else {
        acceptedCount += 1
      }

      const previewUrl = error ? undefined : previewUrlFor(file)
      if (previewUrl) previewUrlsRef.current.add(previewUrl)
      attachmentSequenceRef.current += 1
      return {
        id: `${file.name}:${file.size}:${file.lastModified}:${attachmentSequenceRef.current}`,
        file,
        previewUrl,
        error,
      }
    })
    setAttachments((current) => [...current, ...next])
  }

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(Array.from(event.target.files))
    event.target.value = ''
  }

  const removeAttachment = (id: string) => {
    if (interactionUnavailable || !hasAttachmentCapability) return
    const attachment = attachments.find((item) => item.id === id)
    releasePreview(attachment?.previewUrl)
    setAttachments((current) => current.filter((item) => item.id !== id))
  }

  const canSend = !interactionUnavailable && Boolean(value.trim())

  return (
    <form
      ref={formRef}
      className="messageComposer"
      aria-label="Mesaj yaz"
      aria-busy={submitting || undefined}
      onSubmit={handleSubmit}
    >
      {disabledReason ? (
        <p id={reasonId} className="messageComposer__disabledReason">
          {disabledReason}
        </p>
      ) : null}

      {hasAttachmentCapability && attachments.length > 0 ? (
        <ul className="messageComposer__attachments" aria-label="Ekler">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="messageComposer__attachment">
              {attachment.previewUrl ? (
                <img
                  src={attachment.previewUrl}
                  alt={`${attachment.file.name} önizlemesi`}
                  className="messageComposer__attachmentPreview"
                />
              ) : null}
              <span>{attachment.file.name}</span>
              {attachment.error ? (
                <span role="alert" aria-label={attachment.file.name}>
                  {attachment.error}
                </span>
              ) : (
                <span>Gönderime hazır</span>
              )}
              <GlassIconButton
                label={`${attachment.file.name} dosyasını kaldır`}
                type="button"
                disabled={interactionUnavailable}
                onClick={() => removeAttachment(attachment.id)}
              >
                <span aria-hidden="true">×</span>
              </GlassIconButton>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="messageComposer__bar">
        {hasAttachmentCapability ? (
          <span className="messageComposer__attachmentControl">
            <input
              ref={fileInputRef}
              id={inputId}
              className="messageComposer__attachmentInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              disabled={interactionUnavailable}
              aria-label="Mesaja dosya ekle"
              onChange={handleFiles}
            />
            <GlassIconButton
              label="Dosya ekle"
              type="button"
              disabled={interactionUnavailable}
              onClick={() => fileInputRef.current?.click()}
            >
              <PaperclipIcon />
            </GlassIconButton>
          </span>
        ) : null}

        <GlassTextarea
          className="messageComposer__field"
          // GlassSurface radius'u inline gelir; kapsül biçimi yalnız buradan verilebilir
          style={{ borderRadius: 'var(--lg-radius-card)' }}
          aria-label="Mesaj"
          aria-describedby={disabledReason ? reasonId : undefined}
          autoResize
          maxLength={maxLength}
          minRows={1}
          maxRows={6}
          placeholder="Mesaj yazın"
          value={value}
          disabled={disabled || submitting}
          readOnly={readOnly}
          onChange={(event) => {
            if (!interactionUnavailable) onValueChange(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposingRef.current = true
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false
          }}
        />

        <GlassIconButton
          className="messageComposer__send"
          label="Mesajı gönder"
          type="submit"
          disabled={!canSend}
        >
          <SendIcon />
        </GlassIconButton>
      </div>
    </form>
  )
}

/** Ek düğmesinin ataç glyph'i — anlam `label` ile taşınır. */
function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M20 11.5 12.4 19a5 5 0 0 1-7.1-7.1l7.6-7.6a3.3 3.3 0 1 1 4.7 4.7l-7.6 7.6a1.7 1.7 0 0 1-2.4-2.4l6.9-6.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Gönder düğmesinin kağıt uçak glyph'i — anlam `label` ile taşınır. */
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M4.3 11.6 19.4 4.6a.6.6 0 0 1 .8.8l-7 15.1a.6.6 0 0 1-1.1-.1l-2-5.6-5.6-2a.6.6 0 0 1-.2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m10.9 13.1 4.6-4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
