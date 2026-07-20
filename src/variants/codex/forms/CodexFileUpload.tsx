import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import styles from './CodexForms.module.css'
import { FieldError, FieldHeader } from './formInternals'
import { classNames, mergeIds, useControllableValue, useStableId } from './formUtils'

export type CodexFileRejectionReason = 'type' | 'size' | 'count'

export interface CodexFileRejection {
  file: File
  reason: CodexFileRejectionReason
  message: string
}

export interface CodexFileUploadProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children' | 'defaultValue' | 'onChange' | 'type' | 'value'> {
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  files?: readonly File[]
  defaultFiles?: readonly File[]
  onFilesChange?: (files: File[]) => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onRejected?: (rejections: CodexFileRejection[]) => void
  maxSize?: number
  maxFiles?: number
  loading?: boolean
  dropLabel?: string
  browseLabel?: string
  loadingLabel?: string
  removeLabel?: (file: File) => string
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 15V4m0 0L8 8m4-4 4 4" />
      <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
    </svg>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(bytes / 1024)} KB`
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(bytes / 1024 ** 2)} MB`
}

function acceptsFile(file: File, accept: string | undefined) {
  if (!accept) return true

  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      const fileName = file.name.toLowerCase()
      const fileType = file.type.toLowerCase()
      if (token.startsWith('.')) return fileName.endsWith(token)
      if (token.endsWith('/*')) return fileType.startsWith(token.slice(0, -1))
      return fileType === token
    })
}

function fileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export const CodexFileUpload = forwardRef<HTMLInputElement, CodexFileUploadProps>(function CodexFileUpload(
  {
    label,
    description,
    error,
    files,
    defaultFiles = [],
    onFilesChange,
    onChange,
    onRejected,
    maxSize,
    maxFiles,
    loading = false,
    dropLabel = 'Dosyaları buraya sürükleyin',
    browseLabel = 'veya cihazdan seçin',
    loadingLabel = 'Dosyalar işleniyor',
    removeLabel = (file) => `${file.name} dosyasını kaldır`,
    id,
    className,
    accept,
    multiple = false,
    disabled = false,
    required = false,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const controlId = useStableId(id, 'cx-upload')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string>()
  const [resolvedFiles, setFiles] = useControllableValue<readonly File[]>(
    files,
    defaultFiles,
    (nextFiles) => onFilesChange?.([...nextFiles]),
  )
  const labelId = `${controlId}-label`
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`
  const resolvedError = error ?? validationError
  const isInvalid = Boolean(resolvedError)
  const unavailable = disabled || loading
  const resolvedMaxFiles = maxFiles ?? (multiple ? Number.POSITIVE_INFINITY : 1)

  if (resolvedMaxFiles < 1) throw new Error('CodexFileUpload: maxFiles en az 1 olmalıdır.')
  if (maxSize !== undefined && maxSize < 1) {
    throw new Error('CodexFileUpload: maxSize en az 1 bayt olmalıdır.')
  }

  const setRef = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  const syncNativeFiles = (nextFiles: readonly File[]) => {
    if (!inputRef.current || typeof DataTransfer === 'undefined') return
    const transfer = new DataTransfer()
    nextFiles.forEach((file) => transfer.items.add(file))
    inputRef.current.files = transfer.files
  }

  const commitFiles = (incomingFiles: readonly File[]) => {
    const rejections: CodexFileRejection[] = []
    const accepted: File[] = []

    incomingFiles.forEach((file) => {
      if (!acceptsFile(file, accept)) {
        rejections.push({
          file,
          reason: 'type',
          message: `${file.name}: bu dosya türü desteklenmiyor.`,
        })
      } else if (maxSize !== undefined && file.size > maxSize) {
        rejections.push({
          file,
          reason: 'size',
          message: `${file.name}: dosya boyutu ${formatBytes(maxSize)} sınırını aşıyor.`,
        })
      } else {
        accepted.push(file)
      }
    })

    const candidates = multiple
      ? [...resolvedFiles, ...accepted].filter(
          (file, index, list) => list.findIndex((candidate) => fileIdentity(candidate) === fileIdentity(file)) === index,
        )
      : accepted
    const nextFiles = candidates.slice(0, resolvedMaxFiles)

    candidates.slice(resolvedMaxFiles).forEach((file) => {
      rejections.push({
        file,
        reason: 'count',
        message: `${file.name}: en fazla ${resolvedMaxFiles} dosya eklenebilir.`,
      })
    })

    if (accepted.length > 0) {
      setFiles(nextFiles)
      syncNativeFiles(nextFiles)
    }

    const firstError = rejections[0]?.message
    setValidationError(firstError)
    if (rejections.length > 0) onRejected?.(rejections)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (!unavailable) commitFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <div
      className={classNames(styles.uploadField, loading && styles.isBusy, className)}
      data-invalid={isInvalid || undefined}
      data-loading={loading || undefined}
    >
      <FieldHeader
        controlId={controlId}
        label={label}
        labelId={labelId}
        description={description}
        descriptionId={description ? descriptionId : undefined}
        required={required}
      />
      <label
        className={styles.uploadDropzone}
        htmlFor={controlId}
        data-invalid={isInvalid || undefined}
        data-disabled={unavailable || undefined}
        data-dragging={isDragging || undefined}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!unavailable) setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          {...rest}
          ref={setRef}
          id={controlId}
          className={styles.uploadInput}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={unavailable}
          required={required && resolvedFiles.length === 0}
          aria-labelledby={labelId}
          aria-busy={loading || undefined}
          aria-invalid={isInvalid || undefined}
          aria-describedby={mergeIds(
            ariaDescribedBy,
            description ? descriptionId : undefined,
            resolvedError ? errorId : undefined,
          )}
          onChange={(event) => {
            commitFiles(Array.from(event.currentTarget.files ?? []))
            onChange?.(event)
          }}
        />
        <span className={styles.uploadContent} aria-hidden>
          <span className={styles.uploadIcon}><UploadIcon /></span>
          <span className={styles.uploadTitle}>{loading ? loadingLabel : dropLabel}</span>
          {!loading ? <span className={styles.uploadAction}>{browseLabel}</span> : null}
          <span className={styles.uploadMeta}>
            {accept ? `Kabul edilen türler: ${accept}` : 'Belge veya görsel dosyaları'}
            {maxSize ? ` · Dosya başına en fazla ${formatBytes(maxSize)}` : null}
          </span>
        </span>
      </label>
      {resolvedFiles.length > 0 ? (
        <ul className={styles.uploadFiles} aria-label="Seçilen dosyalar">
          {resolvedFiles.map((file) => (
            <li className={styles.uploadFile} key={fileIdentity(file)}>
              <span className={styles.fileCopy}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatBytes(file.size)}</span>
              </span>
              <button
                type="button"
                className={styles.uploadRemove}
                aria-label={removeLabel(file)}
                disabled={unavailable}
                onClick={() => {
                  const nextFiles = resolvedFiles.filter((candidate) => fileIdentity(candidate) !== fileIdentity(file))
                  setFiles(nextFiles)
                  syncNativeFiles(nextFiles)
                  setValidationError(undefined)
                }}
              >
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <FieldError id={errorId}>{resolvedError}</FieldError>
    </div>
  )
})
