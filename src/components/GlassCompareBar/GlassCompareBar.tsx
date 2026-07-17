// GlassCompareBar — sayfa altında sabit karşılaştırma tepsisi. İçerik katmanı
// FLAT (cam/backdrop-filter yok, yalnız yüzey + hairline + gölge); "Karşılaştır"
// eylemi için gerçek kontrol katmanı olan `GlassButton` kullanılır (bkz.
// rules.md §2). Overlay sözleşmesine (Modal/Drawer/Toast) DAHİL DEĞİL: portal,
// focus trap, scroll kilidi yok — sayfa her zaman etkileşimli kalan kalıcı bir
// `role="region"`.
import { useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassButton } from '../GlassButton'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassCompareBar.module.css'

/** Tepside gösterilen tek ilan önizlemesi. */
export interface GlassCompareBarItem {
  /** Karşılaştırma listesindeki benzersiz kimlik — DOM id'sine YAZILMAZ, yalnız veri/callback anahtarı */
  id: string
  /** İlan başlığı — tek satırda kısaltılır (CSS ellipsis); tam metin `title` özniteliğinde korunur */
  title: string
  /** Dekoratif kapak görseli — verilmezse basit bir yer tutucu simge gösterilir */
  image?: string
}

export interface GlassCompareBarProps {
  /**
   * Karşılaştırmadaki ilanlar. Tepsi YALNIZ `items.length > 0` iken görünür —
   * ayrı bir `open` prop'u yok, görünürlük tamamen bu diziden türetilir.
   */
  items: GlassCompareBarItem[]
  /** Bir kartın kaldır (×) butonuna tıklanınca `id` ile çağrılır — component `items`'ı kendi FİLTRELEMEZ */
  onRemove: (id: string) => void
  /** "Karşılaştır" butonuna tıklanınca çağrılır; `items.length < 2` iken buton disabled olduğundan hiç tetiklenmez */
  onCompare: () => void
  /** Verilirse tepside "Temizle" metin aksiyonu görünür */
  onClear?: () => void
  /**
   * Önerilen üst sınır (varsayılan 4) — yalnız bilgilendirme/"Karşılaştır"ı
   * geçici olarak devre dışı bırakma amaçlıdır. Component `items` dizisini
   * ASLA kırpmaz/filtrelemez; sınırı aşmamak çağıranın sorumluluğudur (ör.
   * "karşılaştırmaya ekle" butonunu 4'te devre dışı bırakmak) — bkz. rules.md §5, §12.
   * Sonlu/pozitif olmayan değerler sessizce 4'e döner.
   */
  maxItems?: number
  className?: string
}

/** Görsel yoksa gösterilen basit ev simgesi — dekoratif, `aria-hidden`. */
function ThumbPlaceholder() {
  return (
    <span className={styles.thumbFallback} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
        <path
          d="M4 11.5 12 5l8 6.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 10.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/** `maxItems`'ı güvenli bir pozitif tamsayıya normalize eder; geçersizse varsayılan 4. */
function resolveMaxItems(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return 4
  return Math.floor(value)
}

/**
 * Sayfa altında sabit karşılaştırma tepsisi — favorilere eklenen ilanların
 * mini önizlemelerini gösterir, kaldırma ve toplu "Karşılaştır" eylemi sunar.
 * `items.length > 0` iken otomatik görünür, `translateY` ile süzülerek
 * girer/çıkar (`prefers-reduced-motion: reduce` iken anlık, animasyonsuz).
 */
export function GlassCompareBar({
  items,
  onRemove,
  onCompare,
  onClear,
  maxItems,
  className,
}: GlassCompareBarProps) {
  const uid = useId()
  const hintId = `${uid}-hint`
  const reduced = prefersReducedMotion()
  const effectiveMaxItems = resolveMaxItems(maxItems)

  // Kaldırma sonrası odak kurtarma (GlassCompareTable ile aynı desen): bir
  // kaldırma butonuna tıklanıp `onRemove` çağrıldıktan ve çağıran `items`'ı
  // filtreleyip yeniden render ettikten sonra, odak kalan ilk kartın kaldırma
  // butonuna taşınır — böylece odak tarayıcı `<body>`'ye düşüp kaybolmaz.
  // Son ilan da kaldırılırsa (`items.length` 0'a düşerse) tepsinin tamamı
  // unmount olur; bu durumda taşınacak bir hedef kalmaz (bkz. rules.md §7).
  const removeButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocusRecoveryRef = useRef(false)

  useEffect(() => {
    const currentIds = new Set(items.map((item) => item.id))
    const staleIds: string[] = []
    removeButtonRefs.current.forEach((_button, id) => {
      if (!currentIds.has(id)) staleIds.push(id)
    })
    staleIds.forEach((id) => removeButtonRefs.current.delete(id))

    if (!pendingFocusRecoveryRef.current) return
    pendingFocusRecoveryRef.current = false
    const firstRemaining = items[0]
    const target = firstRemaining ? removeButtonRefs.current.get(firstRemaining.id) : undefined
    target?.focus()
  }, [items])

  const count = items.length
  const belowMin = count < 2
  const aboveMax = count > effectiveMaxItems
  // "Karşılaştır" iki bağımsız nedenle devre dışı kalabilir; ipucu metni
  // bunlardan yalnız BİRİNİ (ilgili olanı) gösterir — hiçbir zaman renkle
  // sınırlı bir durum bildirimi değil, her zaman görünür metindir.
  const compareDisabled = belowMin || aboveMax
  const hintText = belowMin
    ? 'En az 2 ilan seç'
    : aboveMax
      ? `En fazla ${effectiveMaxItems} ilan karşılaştırılabilir`
      : null

  const spring = { type: 'spring', ...presets.springs.sidebar } as const
  const barMotion = reduced
    ? { initial: { y: 0 }, animate: { y: 0 }, exit: { y: 0 }, transition: { duration: 0 } }
    : { initial: { y: 96 }, animate: { y: 0 }, exit: { y: 96 }, transition: spring }

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          role="region"
          aria-label="Karşılaştırma tepsisi"
          className={[styles.root, className].filter(Boolean).join(' ')}
          {...barMotion}
        >
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                {item.image ? (
                  <img src={item.image} alt="" className={styles.thumb} />
                ) : (
                  <ThumbPlaceholder />
                )}
                <span className={styles.itemTitle} title={item.title}>
                  {item.title}
                </span>
                <button
                  type="button"
                  ref={(el) => {
                    if (el) removeButtonRefs.current.set(item.id, el)
                    else removeButtonRefs.current.delete(item.id)
                  }}
                  className={styles.remove}
                  aria-label={`Karşılaştırmadan çıkar: ${item.title}`}
                  onClick={() => {
                    pendingFocusRecoveryRef.current = true
                    onRemove(item.id)
                  }}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            {onClear ? (
              <button type="button" className={styles.clear} onClick={onClear}>
                Temizle
              </button>
            ) : null}
            <div className={styles.compareGroup}>
              <GlassButton
                prominent
                disabled={compareDisabled}
                aria-describedby={hintText ? hintId : undefined}
                onClick={onCompare}
              >
                Karşılaştır ({count})
              </GlassButton>
              {hintText ? (
                <span id={hintId} className={styles.hint} data-tone={aboveMax ? 'warning' : undefined}>
                  {aboveMax ? <span className={styles.hintDot} aria-hidden="true" /> : null}
                  {hintText}
                </span>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
