// GlassPhotoFeatureOverlay — görsel üstü AI özellik etiketleri.
// AI-first component: içerik katmanı FLAT (cam/backdrop-filter yok). Kendi nokta
// işaretlerini ve etiket balonlarını çizer; koordinat clamp/guard deseni GlassMap'ten
// bilinçli olarak taşınır (bkz. rules.md §1/§7).
import { useId, useRef, useState, type HTMLAttributes } from 'react'
import styles from './GlassPhotoFeatureOverlay.module.css'

/** Görselde AI tarafından tespit edilen tek bir özellik noktası. */
export interface GlassPhotoFeatureOverlayFeature {
  /** Veri anahtarı — DOM id'sine ASLA konmaz (bkz. rules.md §2), yalnız state/callback anahtarıdır */
  id: string
  /** Özelliğin görünür/erişilebilir adı (ör. "Ankastre mutfak") — noktanın accessible name'i budur */
  label: string
  /** Yatay konum, görselin soluna göre 0-1 normalize oran */
  x: number
  /** Dikey konum, görselin üstüne göre 0-1 normalize oran */
  y: number
  /** Tespit güveni, 0-100. Sonluysa balonda "%N" eki olarak görünür; aksi halde eklenmez */
  confidence?: number
}

export interface GlassPhotoFeatureOverlayProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Üzerine özellik noktaları yerleştirilecek görsel */
  image: { src: string; alt: string }
  /** Tespit edilen özellik noktaları */
  features: GlassPhotoFeatureOverlayFeature[]
  /** Controlled: tüm etiketlerin varsayılan görünürlüğü ("Etiketleri göster" butonunun durumu) */
  showLabels?: boolean
  /** Uncontrolled başlangıç durumu (varsayılan: false — yalnız noktalar görünür) */
  defaultShowLabels?: boolean
  /** "Etiketleri göster" butonuna basıldığında (yeni değerle) çağrılır */
  onShowLabelsChange?: (value: boolean) => void
  /** Görsel bölgeyi adlandırır (`role="group"`) — sayfada birden çok örnek varsa verilmesi önerilir */
  'aria-label'?: string
}

/** 0-1 normalize koordinat güvenliği — GlassMap.clampUnit ile aynı sözleşme:
 * finite değilse `null` (nokta hiç render EDİLMEZ), aksi halde [0,1]'e kenetlenir. */
function clampUnit(value: number): number | null {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null
}

/** `confidence` prop'unu normalize eder: sonlu değilse `null` (balon eki gizlenir). */
function resolveConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

/** Balon dikey yönü: üst kenara çok yakın noktalarda balon aşağı açılır (GlassMap.popupVertical ile aynı eşik). */
function balloonVertical(y: number): 'above' | 'below' {
  return y < 0.22 ? 'below' : 'above'
}

/** Balon yatay hizası: kenara yakın noktalarda balon kırpılmasın diye start/end'e kayar. */
function balloonAlign(x: number): 'start' | 'center' | 'end' {
  if (x < 0.18) return 'start'
  if (x > 0.82) return 'end'
  return 'center'
}

/**
 * AI-first içerik rozeti — Dalga kontratının "AI-first standardı" bölümünden birebir
 * kopya CSS (tüm AI component'lerinde aynı görünmeli; component'ler arası paylaşılmaz).
 */
function AiBadge() {
  return (
    <span className={styles.aiBadge} aria-label="Yapay zekâ üretimi">
      ✦ AI
    </span>
  )
}

/**
 * Görsel üstü AI özellik etiketleri — bir ilan fotoğrafında yapay zekânın tespit
 * ettiği özellikleri (ör. "Ankastre mutfak") nokta işaretleri + tıklanınca açılan
 * etiket balonlarıyla gösterir. "Etiketleri göster" butonu TÜM balonların varsayılan
 * görünürlüğünü değiştirir; her nokta kendi balonunu bu varsayılandan BAĞIMSIZ olarak
 * açıp kapatabilir (tek başına toggle). Zorunlu "✦ AI" rozeti görselin köşesinde
 * koşulsuz render edilir. İçerik katmanı FLAT — cam yüzey/backdrop-filter kullanılmaz.
 */
export function GlassPhotoFeatureOverlay({
  image,
  features,
  showLabels,
  defaultShowLabels = false,
  onShowLabelsChange,
  className,
  'aria-label': ariaLabel,
  ...rest
}: GlassPhotoFeatureOverlayProps) {
  const baseId = useId()
  const [innerShowLabels, setInnerShowLabels] = useState(defaultShowLabels)

  const isControlled = showLabels !== undefined
  const effectiveShowLabels = isControlled ? showLabels : innerShowLabels

  // Tek başına açılıp/kapanan noktaların id kümesi — "varsayılandan SAPMA" listesi.
  // Gerçek görünürlük = override varsa `!effectiveShowLabels`, yoksa `effectiveShowLabels`.
  const [overriddenIds, setOverriddenIds] = useState<Set<string>>(() => new Set())

  // İçerik imzası: global varsayılan (effectiveShowLabels) YA DA özellik listesinin kimliği
  // GERÇEKTEN değiştiğinde tekil sapmalar anlamsız kalır (bkz. GlassMatchScore'daki içerik
  // imzası deseni, aynı "render sırasında state ayarlama" tekniği — ekstra effect turu yok).
  // "Tümünü göster/gizle" butonuna basmak niyeti temiz bir global duruma dönmektir; önceki
  // tekil istisnalar (farklı bir fotoğrafa/veri setine geçilmesi dahil) taşınmaz.
  const signature = JSON.stringify([effectiveShowLabels, features.map((f) => f.id)])
  const prevSignatureRef = useRef(signature)
  if (prevSignatureRef.current !== signature) {
    prevSignatureRef.current = signature
    if (overriddenIds.size > 0) {
      setOverriddenIds(new Set())
    }
  }

  const toggleShowLabels = () => {
    const next = !effectiveShowLabels
    if (!isControlled) setInnerShowLabels(next)
    onShowLabelsChange?.(next)
  }

  const toggleFeature = (id: string) => {
    setOverriddenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      <div
        className={styles.stage}
        role="group"
        aria-label={ariaLabel ?? 'Görseldeki yapay zekâ tespitli özellikler'}
      >
        <div className={styles.imageClip}>
          <img className={styles.image} src={image.src} alt={image.alt} draggable={false} />
        </div>

        <span className={styles.badgeCorner}>
          <AiBadge />
        </span>

        {features.map((feature, index) => {
          // finite olmayan/aralık dışı koordinat: görsel dışında etkileşimli nokta
          // üretmemek için render EDİLMEZ (bkz. rules.md §7, GlassMap.clampUnit).
          const cx = clampUnit(feature.x)
          const cy = clampUnit(feature.y)
          if (cx === null || cy === null) return null

          const isOpen = overriddenIds.has(feature.id) ? !effectiveShowLabels : effectiveShowLabels
          const confidence = resolveConfidence(feature.confidence)
          // DOM id, ham veri id'sinden değil index'ten türetilir — `feature.id` yalnız
          // state/callback anahtarı olarak kalır (boşluk/özel karakter içerebilir).
          const confidenceId = `${baseId}-confidence-${index}`

          return (
            <span
              key={feature.id}
              className={styles.markerWrap}
              style={{ left: `${cx * 100}%`, top: `${cy * 100}%`, zIndex: isOpen ? 3 : 2 }}
            >
              <button
                type="button"
                className={styles.dot}
                aria-label={feature.label}
                aria-expanded={isOpen}
                aria-describedby={isOpen && confidence !== null ? confidenceId : undefined}
                onClick={() => toggleFeature(feature.id)}
                onKeyDown={(e) => {
                  // Kapsayıcı-scoped: yalnız bu düğmenin kendi olayı — document-genelinde
                  // dinleyici yok. IME kontrolü gerekmez (metin girişi yok, yalnız Escape).
                  if (e.key === 'Escape' && isOpen) {
                    e.stopPropagation()
                    toggleFeature(feature.id)
                  }
                }}
              />
              {isOpen ? (
                <span
                  className={styles.balloon}
                  data-vertical={balloonVertical(cy)}
                  data-align={balloonAlign(cx)}
                >
                  {/* Etiket metni butonun accessible name'iyle (aria-label) aynı — AT'ye
                      iki kez okutulmaması için aria-hidden. Görme engelli olmayan
                      kullanıcı için görünür kalır (yalnız erişilebilirlik ağacından gizli). */}
                  <span aria-hidden="true">{feature.label}</span>
                  {confidence !== null ? (
                    <span id={confidenceId} className={styles.balloonConfidence}>
                      %{confidence}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </span>
          )
        })}
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toggleButton}
          aria-pressed={effectiveShowLabels}
          onClick={toggleShowLabels}
        >
          Etiketleri göster
        </button>
        <span className={styles.count}>{features.length} özellik tespit edildi</span>
      </div>
    </div>
  )
}
