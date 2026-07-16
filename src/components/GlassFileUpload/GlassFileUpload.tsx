import { useRef, useState, type ChangeEvent, type DragEvent, type HTMLAttributes } from 'react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import styles from './GlassFileUpload.module.css'

export interface GlassFileUploadProps extends HTMLAttributes<HTMLDivElement> {
  /** Native input accept değeri (örn. "image/*,.pdf") */
  accept?: string
  multiple?: boolean
  /** Byte cinsinden üst sınır; aşan dosya reddedilir ve hata listelenir */
  maxSize?: number
  /** Geçerli listenin her değişiminde TÜM geçerli dosyalarla çağrılır */
  onFiles?: (files: File[]) => void
  disabled?: boolean
  label?: string
  description?: string
  tone?: 'light' | 'dark' | 'auto'
}

/** İnsan okunur boyut: <1 MB → KB, üstü MB (Türkçe ondalık virgül) */
function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function GlassFileUpload({
  accept,
  multiple = false,
  maxSize,
  onFiles,
  disabled = false,
  label = 'Dosya seçin veya sürükleyin',
  description,
  tone = 'auto',
  className,
  ...rest
}: GlassFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  const addFiles = (incoming: File[]) => {
    const rejected: string[] = []
    const accepted: File[] = []
    for (const file of incoming) {
      if (maxSize !== undefined && file.size > maxSize) {
        rejected.push(`${file.name} çok büyük (${formatSize(file.size)}; sınır ${formatSize(maxSize)})`)
      } else {
        accepted.push(file)
      }
    }
    setErrors(rejected)
    if (accepted.length === 0) return
    const next = multiple ? [...files, ...accepted] : [accepted[0]]
    setFiles(next)
    onFiles?.(next)
  }

  const removeAt = (index: number) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    onFiles?.(next)
  }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    // Aynı dosya tekrar seçilebilsin diye input sıfırlanır
    e.target.value = ''
  }

  const onDragOver = (e: DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setDragging(true)
  }

  const onDrop = (e: DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer?.files?.length) addFiles(Array.from(e.dataTransfer.files))
  }

  const zoneClasses = [styles.zone, dragging ? styles.zoneDrag : ''].filter(Boolean).join(' ')

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} {...rest}>
      <input
        ref={inputRef}
        type="file"
        className={styles.input}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        onChange={onInputChange}
      />

      <GlassSurface
        as="button"
        shape={20}
        tone={tone}
        thickness={0.3}
        interactive={!disabled}
        className={zoneClasses}
        {...({
          type: 'button',
          disabled,
          'data-drag': dragging || undefined,
          onClick: () => inputRef.current?.click(),
          onDragEnter: onDragOver,
          onDragOver,
          onDragLeave: () => setDragging(false),
          onDrop,
        } as unknown as GlassSurfaceProps)}
      >
        <span className={styles.zoneIcon} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V4m0 0-4 4m4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <span className={styles.label}>{label}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </GlassSurface>

      {errors.length > 0 ? (
        <ul role="alert" className={styles.errors}>
          {errors.map((message, i) => (
            <li key={i} className={styles.error}>
              {message}
            </li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className={styles.files}>
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className={styles.file}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatSize(file.size)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`${file.name} dosyasını kaldır`}
                onClick={() => removeAt(i)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
