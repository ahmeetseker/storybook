import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import type { ListingMediaItem } from './listing-create-domain'
import { ListingGroup, ListingStepIntro } from './ListingSection'
import styles from './ListingCreateWorkspace.module.css'

interface MediaStudioStepProps {
  value: ListingMediaItem[]
  errors: Record<string, string>
  onChange: (value: ListingMediaItem[]) => void
  createPreviewUrl?: (file: File) => string
  revokePreviewUrl?: (src: string) => void
}

const MIN_READY_MEDIA = 3
const MAX_MEDIA = 30

function moveItem(
  items: ListingMediaItem[],
  fromIndex: number,
  toIndex: number,
): ListingMediaItem[] {
  if (toIndex < 0 || toIndex >= items.length) return items
  const next = [...items]
  const [item] = next.splice(fromIndex, 1)
  if (!item) return items
  next.splice(toIndex, 0, item)
  return next
}

const statusLabels: Record<ListingMediaItem['status'], string> = {
  uploading: 'Yükleniyor',
  ready: 'Hazır',
  'low-quality': 'Kaliteyi kontrol edin',
  duplicate: 'Tekrar görsel',
  error: 'Yüklenemedi',
}

const allowedMediaTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

function mediaSignature(file: File): string {
  return `${file.name.toLocaleLowerCase('tr-TR')}:${file.size}:${file.lastModified}`
}

export function MediaStudioStep({
  value,
  errors,
  onChange,
  createPreviewUrl,
  revokePreviewUrl,
}: MediaStudioStepProps) {
  const inputId = useId()
  const helpId = `${inputId}-help`
  const errorId = `${inputId}-error`
  const reorderHelpId = `${inputId}-reorder`
  const itemSequence = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const ownedUrls = useRef(new Set<string>())
  const [localError, setLocalError] = useState('')
  const [announcement, setAnnouncement] = useState('Henüz fotoğraf eklenmedi')
  const [dragActive, setDragActive] = useState(false)
  const [replacementId, setReplacementId] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  useEffect(
    () => () => {
      ownedUrls.current.forEach((src) => URL.revokeObjectURL(src))
      ownedUrls.current.clear()
    },
    [],
  )

  const createMediaItem = (
    file: File,
    knownSignatures: Set<string>,
    previous?: Pick<ListingMediaItem, 'id' | 'isCover'>,
  ): ListingMediaItem => {
    const src = createPreviewUrl
      ? createPreviewUrl(file)
      : typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(file)
        : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E'
    if (!createPreviewUrl && src.startsWith('blob:')) ownedUrls.current.add(src)
    const signature = mediaSignature(file)
    const duplicate = knownSignatures.has(signature)
    const lowQuality = /(?:low[-_ ]?res|thumbnail)/i.test(file.name)
    const tooLarge = file.size > 20 * 1024 * 1024
    const status: ListingMediaItem['status'] = tooLarge
      ? 'error'
      : duplicate
        ? 'duplicate'
        : lowQuality
          ? 'low-quality'
          : 'ready'
    knownSignatures.add(signature)
    itemSequence.current += 1

    return {
      id:
        previous?.id ??
        (typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `media-${itemSequence.current}`),
      name: file.name,
      src,
      signature,
      status,
      isCover: Boolean(previous?.isCover && status === 'ready'),
      caption: '',
      qualityHints: tooLarge
        ? ['Dosya 20 MB sınırını aşıyor; daha küçük bir görsel seçin']
        : duplicate
          ? ['Bu dosya daha önce eklenmiş görünüyor']
          : lowQuality
            ? ['Daha yüksek çözünürlüklü özgün görsel kullanın']
            : [],
    }
  }

  const releasePreview = (src: string) => {
    if (revokePreviewUrl) {
      revokePreviewUrl(src)
      return
    }
    if (!src.startsWith('blob:')) return
    URL.revokeObjectURL(src)
    ownedUrls.current.delete(src)
  }

  const addFiles = (incoming: File[]) => {
    const accepted = incoming.filter((file) => allowedMediaTypes.has(file.type))
    const files = accepted.slice(0, Math.max(0, MAX_MEDIA - value.length))

    if (accepted.length !== incoming.length) {
      setLocalError('Yalnızca JPG, PNG veya WebP görseller eklenebilir')
    } else if (accepted.length > files.length) {
      setLocalError('Bir ilana en fazla 30 fotoğraf eklenebilir')
    } else {
      setLocalError('')
    }
    if (files.length === 0) return

    const knownSignatures = new Set(
      value
        .map((item) => item.signature)
        .filter((signature): signature is string => Boolean(signature)),
    )
    const added = files.map<ListingMediaItem>((file) =>
      createMediaItem(file, knownSignatures),
    )

    const next = [...value, ...added]
    const hasReadyCover = next.some(
      (item) => item.isCover && item.status === 'ready',
    )
    const firstReadyId = hasReadyCover
      ? null
      : next.find((item) => item.status === 'ready')?.id
    onChange(
      firstReadyId
        ? next.map((item) => ({
            ...item,
            isCover: item.id === firstReadyId,
          }))
        : next,
    )
    setAnnouncement(`${added.length} fotoğraf eklendi`)
  }

  const replaceFile = (id: string, file: File) => {
    if (!allowedMediaTypes.has(file.type)) {
      setLocalError('Yalnızca JPG, PNG veya WebP görseller eklenebilir')
      return
    }

    const targetIndex = value.findIndex((item) => item.id === id)
    const target = value[targetIndex]
    if (!target) return

    const knownSignatures = new Set(
      value
        .filter((item) => item.id !== id)
        .map((item) => item.signature)
        .filter((signature): signature is string => Boolean(signature)),
    )
    const replacement = createMediaItem(file, knownSignatures, target)
    releasePreview(target.src)

    const next = [...value]
    next[targetIndex] = replacement
    const hasReadyCover = next.some(
      (item) => item.status === 'ready' && item.isCover,
    )
    const firstReadyId = hasReadyCover
      ? null
      : next.find((item) => item.status === 'ready')?.id

    onChange(
      firstReadyId
        ? next.map((item) => ({
            ...item,
            isCover: item.id === firstReadyId,
          }))
        : next,
    )
    setLocalError('')
    setAnnouncement(`${target.name} yerine ${replacement.name} eklendi`)
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const targetId = replacementId
    setReplacementId(null)
    if (targetId && files[0]) replaceFile(targetId, files[0])
    else addFiles(files)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragActive(false)
    setReplacementId(null)
    addFiles(Array.from(event.dataTransfer.files))
  }

  const remove = (id: string) => {
    const removed = value.find((item) => item.id === id)
    if (!removed) return

    releasePreview(removed.src)

    const remaining = value.filter((item) => item.id !== id)
    const nextCover =
      removed.isCover
        ? remaining.find((item) => item.status === 'ready')
        : undefined
    onChange(
      nextCover
        ? remaining.map((item) => ({
            ...item,
            isCover: item.id === nextCover.id,
          }))
        : remaining,
    )
    setAnnouncement(`${removed.name} fotoğrafı kaldırıldı`)
  }

  const setCover = (id: string) => {
    const selected = value.find((item) => item.id === id)
    if (!selected || selected.status !== 'ready') return
    onChange(value.map((item) => ({ ...item, isCover: item.id === id })))
    setAnnouncement(`${selected.name} kapak fotoğrafı seçildi`)
  }

  const updateCaption = (id: string, caption: string) => {
    onChange(value.map((item) => (item.id === id ? { ...item, caption } : item)))
  }

  const move = (item: ListingMediaItem, fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return
    onChange(moveItem(value, fromIndex, toIndex))
    setAnnouncement(`${item.name} fotoğrafı ${toIndex + 1}. sıraya taşındı`)
  }

  const endReorder = () => {
    setDragIndex(null)
    setDropIndex(null)
  }

  const dropOnIndex = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      endReorder()
      return
    }
    const dragged = value[dragIndex]
    if (dragged) move(dragged, dragIndex, targetIndex)
    endReorder()
  }

  const readyCount = value.filter((item) => item.status === 'ready').length
  const hasCover = value.some((item) => item.isCover && item.status === 'ready')
  const missingReady = Math.max(0, MIN_READY_MEDIA - readyCount)

  return (
    <section className={styles.stepSection} aria-labelledby="media-step-title">
      <ListingStepIntro
        headingId="media-step-title"
        stepIndex={3}
        stepCount={5}
        title="Fotoğraf stüdyosu"
        description="Alıcıların mülkü hızlıca anlaması için aydınlık, güncel ve doğru sıralanmış fotoğraflar ekleyin."
        note={`En az ${MIN_READY_MEDIA} · En fazla ${MAX_MEDIA}`}
      />

      <ListingGroup
        id="media-upload"
        title="Fotoğraf yükleme"
        description="Dosyaları sürükleyip bırakın ya da seçin. JPG, PNG veya WebP kabul edilir."
        requirement="required"
        meta={
          <span className={styles.mediaCounter}>
            <strong>{readyCount}</strong>/{MAX_MEDIA} geçerli
          </span>
        }
      >
        <ul className={styles.mediaChecklist}>
          <li data-done={readyCount >= MIN_READY_MEDIA || undefined}>
            <span aria-hidden="true">{readyCount >= MIN_READY_MEDIA ? '✓' : '•'}</span>
            {readyCount >= MIN_READY_MEDIA
              ? `${MIN_READY_MEDIA} geçerli fotoğraf tamam`
              : `${missingReady} geçerli fotoğraf daha gerekli`}
          </li>
          <li data-done={hasCover || undefined}>
            <span aria-hidden="true">{hasCover ? '✓' : '•'}</span>
            {hasCover ? 'Kapak fotoğrafı seçildi' : 'Bir kapak fotoğrafı seçin'}
          </li>
        </ul>

        <label
          className={[
            styles.uploadZone,
            dragActive ? styles.uploadZoneDrag : '',
          ].filter(Boolean).join(' ')}
          htmlFor={inputId}
          onClick={(event) => {
            if (event.target !== inputRef.current) setReplacementId(null)
          }}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragActive(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            id={inputId}
            ref={inputRef}
            className={styles.visuallyHiddenInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={replacementId === null}
            onChange={handleInput}
            aria-label="Fotoğraf ekle"
            aria-invalid={Boolean(localError || errors.media || errors.cover) || undefined}
            aria-describedby={`${helpId} ${errorId}`}
          />
          <span className={styles.uploadMark} aria-hidden="true">
            +
          </span>
          <span className={styles.uploadCopy}>
            <strong>Fotoğraf ekle</strong>
            <small id={helpId}>
              Sürükleyip bırakın veya tıklayarak seçin · Sıralamayı sonradan
              değiştirebilirsiniz
            </small>
          </span>
        </label>

        <p id={errorId} className={styles.fieldError} aria-live="polite">
          {[localError, errors.media, errors.cover].filter(Boolean).join(' · ')}
        </p>
        <p className={styles.mediaAnnouncement} role="status" aria-live="polite">
          {announcement}
        </p>
      </ListingGroup>

      <ListingGroup
        id="media-order"
        title="Sıralama ve kapak"
        description="İlk fotoğraf kapak olur. Kareyi sürükleyerek ya da ok düğmeleriyle taşıyın."
        requirement="required"
      >
        {value.length > 0 ? (
          <>
            <p id={reorderHelpId} className={styles.mediaReorderHelp}>
              Fareyle: fotoğrafı tutup istediğiniz sıraya bırakın. Klavyeyle:
              karenin ← ve → düğmelerini kullanın.
            </p>
            <ol
              className={styles.mediaGrid}
              aria-label="Fotoğraf sırası"
              aria-describedby={reorderHelpId}
            >
              {value.map((item, index) => (
                <li
                  key={item.id}
                  className={styles.mediaCard}
                  data-cover={item.isCover || undefined}
                  data-dragging={dragIndex === index || undefined}
                  data-drop-target={
                    dropIndex === index && dragIndex !== index ? true : undefined
                  }
                  onDragOver={(event) => {
                    if (dragIndex === null) return
                    event.preventDefault()
                    setDropIndex(index)
                  }}
                  onDragLeave={() => {
                    setDropIndex((current) => (current === index ? null : current))
                  }}
                  onDrop={(event) => {
                    if (dragIndex === null) return
                    event.preventDefault()
                    dropOnIndex(index)
                  }}
                >
                  <div
                    className={styles.mediaVisual}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', item.id)
                      setDragIndex(index)
                    }}
                    onDragEnd={endReorder}
                  >
                    <img
                      src={item.src}
                      alt={`${item.name} önizlemesi`}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.mediaOrder}>{index + 1}</span>
                    {item.isCover ? (
                      <span className={styles.coverBadge}>Kapak fotoğrafı</span>
                    ) : null}
                  </div>
                  <div className={styles.mediaCardBody}>
                    <div className={styles.mediaCardHeading}>
                      <strong title={item.name}>{item.name}</strong>
                      <span data-status={item.status}>{statusLabels[item.status]}</span>
                    </div>
                    {item.qualityHints.length > 0 ? (
                      <ul className={styles.qualityHints}>
                        {item.qualityHints.map((hint) => <li key={hint}>{hint}</li>)}
                      </ul>
                    ) : null}
                    <label className={styles.compactField}>
                      <span>{item.name} açıklaması</span>
                      <input
                        className={styles.flatControl}
                        value={item.caption}
                        maxLength={80}
                        onChange={(event) => updateCaption(item.id, event.target.value)}
                        placeholder="Örn. Güney cephe"
                      />
                    </label>
                    <div className={styles.mediaActions}>
                      {item.status === 'ready' && !item.isCover ? (
                        <button
                          type="button"
                          className={styles.mediaCoverAction}
                          onClick={() => setCover(item.id)}
                          aria-label={`${item.name} fotoğrafını kapak yap`}
                        >
                          Kapak yap
                        </button>
                      ) : item.status === 'ready' ? (
                        <span className={styles.mediaCoverState}>Seçili kapak</span>
                      ) : (
                        <span className={styles.mediaCoverState} data-blocked="true">
                          Kapak için uygun değil
                        </span>
                      )}
                      <div className={styles.mediaIconActions}>
                        {item.status !== 'ready' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReplacementId(item.id)
                              inputRef.current?.click()
                            }}
                            aria-label={`${item.name} yerine yeni dosya seç`}
                          >
                            ↻
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => move(item, index, index - 1)}
                          aria-label={`${item.name} fotoğrafını sola taşı`}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          disabled={index === value.length - 1}
                          onClick={() => move(item, index, index + 1)}
                          aria-label={`${item.name} fotoğrafını sağa taşı`}
                        >
                          →
                        </button>
                        <button
                          type="button"
                          className={styles.removeMedia}
                          onClick={() => remove(item.id)}
                          aria-label={`${item.name} fotoğrafını kaldır`}
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className={styles.emptyMedia}>
            <p className={styles.emptyMediaTitle}>Önerilen fotoğraf sırası</p>
            <ol>
              <li><strong>01</strong><span>Dış cephe veya arsanın genel görünümü</span></li>
              <li><strong>02</strong><span>Ana yaşam alanı ya da parsel yaklaşımı</span></li>
              <li><strong>03</strong><span>Manzara, yol ve yakın çevre</span></li>
            </ol>
          </div>
        )}
      </ListingGroup>
    </section>
  )
}
