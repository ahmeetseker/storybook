import { useId, useMemo, useState, type HTMLAttributes, type KeyboardEvent } from 'react'
import styles from './GlassMediaGallery.module.css'

/** Galeri öğesinin medya türü. */
export type GlassMediaGalleryItemType = 'image' | 'video' | 'tour360' | 'floorPlan'

/** Tek bir medya öğesi (görsel, video, 360° tur veya kat planı). */
export interface GlassMediaGalleryItem {
  type: GlassMediaGalleryItemType
  src: string
  /** Görsel/kat planı için anlamlı alt metin; 360° turda iframe başlığına düşer. Boşsa dekoratif sayılır. */
  alt?: string
  /** Yalnız `video` — oynatılmadan önce gösterilecek kapak karesi. */
  poster?: string
  /** Yalnız `video` — altyazı/caption track'leri (`<track>`). Sesli video için
   * en az bir `kind: 'captions'` track sağlanması ÖNERİLİR (bkz. rules.md §8). */
  tracks?: { src: string; srclang: string; label: string; kind?: 'captions' | 'subtitles' }[]
  /** Bu ÖĞENİN kısa açıklaması; thumbnail erişilebilir adında ve sahne altyazısında
   * kullanılır. `GlassMediaGalleryProps.label` (kök bölge adı) ile KARIŞTIRMAYIN —
   * ikisi aynı isimde ama farklı kapsamdadır (öğe vs. kök bileşen). */
  label?: string
}

export interface GlassMediaGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GlassMediaGalleryItem[]
  /** `stage`: tek şerit + büyük sahne. `tabbed`: medya türüne göre ayrı sekmeler. */
  variant?: 'stage' | 'tabbed'
  /** Kök bölgenin erişilebilir adı (`role="region"`). `GlassMediaGalleryItem.label`
   * (öğe altyazısı/thumbnail adı) ile KARIŞTIRMAYIN — bu, tüm galeriyi adlandırır. */
  label?: string
}

const TYPE_META: Record<GlassMediaGalleryItemType, { badge?: string; tabLabel: string }> = {
  image: { tabLabel: 'Fotoğraflar' },
  video: { badge: '▶', tabLabel: 'Video' },
  floorPlan: { badge: 'PLAN', tabLabel: 'Kat Planı' },
  tour360: { badge: '360°', tabLabel: 'Sanal Tur' },
}

// Sekmeli varyantta sabit gösterim sırası (yalnız dolu türler görünür).
const TYPE_ORDER: GlassMediaGalleryItemType[] = ['image', 'video', 'floorPlan', 'tour360']

function MediaFrame({ item }: { item: GlassMediaGalleryItem }) {
  switch (item.type) {
    case 'video':
      return (
        <video
          className={`${styles.media} ${styles.mediaVideo}`}
          controls
          preload="metadata"
          poster={item.poster}
          aria-label={item.alt ?? item.label ?? 'İlan videosu'}
        >
          <source src={item.src} />
          {item.tracks?.map((track) => (
            <track key={track.src} src={track.src} srcLang={track.srclang} label={track.label} kind={track.kind ?? 'captions'} />
          ))}
          Tarayıcınız video oynatmayı desteklemiyor.
        </video>
      )
    case 'tour360':
      // item.src ilan sahibi girdisi olabilir (3. taraf tur URL'si) — sandbox yalnız
      // script çalıştırmaya izin verir; allow-same-origin BİLİNÇLİ OLARAK eklenmez
      // (allow-scripts + allow-same-origin birlikte sandbox izolasyonunu büyük ölçüde
      // etkisizleştirir, bkz. rules.md §7).
      return (
        <iframe
          className={`${styles.media} ${styles.mediaFrame}`}
          src={item.src}
          title={item.alt || item.label || '360° sanal tur'}
          sandbox="allow-scripts"
          loading="lazy"
        />
      )
    case 'floorPlan':
    case 'image':
    default:
      return <img className={`${styles.media} ${styles.mediaImage}`} src={item.src} alt={item.alt ?? ''} loading="lazy" />
  }
}

interface MediaStageBlockProps {
  items: GlassMediaGalleryItem[]
  activeIndex: number
  onSelect: (index: number) => void
  ariaLabel: string
}

function MediaStageBlock({ items, activeIndex, onSelect, ariaLabel }: MediaStageBlockProps) {
  const current = items[activeIndex]
  if (!current) return null

  return (
    <div className={styles.stageBlock}>
      <div className={styles.stage} role="group" aria-label={ariaLabel}>
        <div key={`${current.type}-${current.src}-${activeIndex}`} className={styles.frame}>
          <MediaFrame item={current} />
        </div>
        {items.length > 1 ? (
          <span className={styles.counter}>
            {activeIndex + 1} / {items.length}
          </span>
        ) : null}
      </div>
      {current.label ? <p className={styles.caption}>{current.label}</p> : null}
      {items.length > 1 ? (
        <div className={styles.thumbs}>
          {items.map((item, i) => {
            const meta = TYPE_META[item.type]
            const selected = i === activeIndex
            const thumbName = item.label || item.alt || meta.tabLabel
            return (
              <button
                key={`${item.src}-${i}`}
                type="button"
                className={[styles.thumb, selected ? styles.thumbActive : ''].filter(Boolean).join(' ')}
                onClick={() => onSelect(i)}
                aria-current={selected}
                aria-label={`${i + 1}. medyaya git: ${thumbName}`}
              >
                {item.type === 'video' && item.poster ? (
                  <img className={styles.thumbImage} src={item.poster} alt="" loading="lazy" />
                ) : item.type === 'image' || item.type === 'floorPlan' ? (
                  <img className={styles.thumbImage} src={item.src} alt="" loading="lazy" />
                ) : (
                  <span className={styles.thumbFallback} aria-hidden="true">
                    {meta.tabLabel}
                  </span>
                )}
                {meta.badge ? (
                  <span className={styles.typeBadge} aria-hidden="true">
                    {meta.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

interface VariantProps {
  items: GlassMediaGalleryItem[]
}

function StageVariant({ items }: VariantProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const clamped = Math.min(activeIndex, items.length - 1)
  return <MediaStageBlock items={items} activeIndex={clamped} onSelect={setActiveIndex} ariaLabel="İlan medya galerisi" />
}

function TabbedVariant({ items }: VariantProps) {
  const baseId = useId()
  const groups = useMemo(
    () => TYPE_ORDER.map((type) => ({ type, items: items.filter((item) => item.type === type) })).filter((g) => g.items.length > 0),
    [items],
  )
  const [activeType, setActiveType] = useState<GlassMediaGalleryItemType | undefined>(groups[0]?.type)
  const [indexByType, setIndexByType] = useState<Partial<Record<GlassMediaGalleryItemType, number>>>({})

  if (groups.length === 0) return null
  const currentGroup = groups.find((g) => g.type === activeType) ?? groups[0]
  const currentIndex = Math.min(indexByType[currentGroup.type] ?? 0, currentGroup.items.length - 1)

  // WAI-ARIA Tabs deseni: ok tuşlarıyla gezinme + roving tabindex (bkz. GlassFloorPlanViewer).
  const onTablistKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentGroupIndex = groups.findIndex((g) => g.type === currentGroup.type)
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentGroupIndex + 1) % groups.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentGroupIndex - 1 + groups.length) % groups.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = groups.length - 1
    if (nextIndex === -1) return
    e.preventDefault()
    const nextType = groups[nextIndex].type
    setActiveType(nextType)
    document.getElementById(`${baseId}-tab-${nextType}`)?.focus()
  }

  return (
    <>
      <div role="tablist" aria-label="Medya türleri" className={styles.tablist} onKeyDown={onTablistKeyDown}>
        {groups.map((g) => {
          const selected = g.type === currentGroup.type
          const meta = TYPE_META[g.type]
          return (
            <button
              key={g.type}
              type="button"
              role="tab"
              id={`${baseId}-tab-${g.type}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${g.type}`}
              tabIndex={selected ? 0 : -1}
              className={[styles.tab, selected ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveType(g.type)}
            >
              {meta.tabLabel}
              <span className={styles.tabCount}>{g.items.length}</span>
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${currentGroup.type}`}
        aria-labelledby={`${baseId}-tab-${currentGroup.type}`}
        className={styles.panel}
      >
        <MediaStageBlock
          items={currentGroup.items}
          activeIndex={currentIndex}
          onSelect={(index) => setIndexByType((prev) => ({ ...prev, [currentGroup.type]: index }))}
          ariaLabel={TYPE_META[currentGroup.type].tabLabel}
        />
      </div>
    </>
  )
}

export function GlassMediaGallery({ items, variant = 'stage', label = 'İlan medya galerisi', className, ...rest }: GlassMediaGalleryProps) {
  if (items.length === 0) return null

  return (
    <div role="region" aria-label={label} className={[styles.root, className].filter(Boolean).join(' ')} {...rest}>
      {variant === 'tabbed' ? <TabbedVariant items={items} /> : <StageVariant items={items} />}
    </div>
  )
}
