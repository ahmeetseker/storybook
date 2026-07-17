// GlassInfiniteList — sonsuz kaydırma sarmalayıcısı.
// İçerik katmanı FLAT: cam/backdrop-filter yok, yalnız akış kontrolü. Component
// kendi listesini render ETMEZ — `children` olarak verilen mevcut listeyi
// sarmalar, dibe bir sentinel + her zaman görünür "Daha fazla yükle" butonu +
// aria-live durum satırı ekler (bkz. rules.md §2).
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import styles from './GlassInfiniteList.module.css'

export interface GlassInfiniteListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Mevcut liste içeriği — component listeyi kendisi çizmez, yalnız sarmalar */
  children: ReactNode
  /**
   * Daha fazla öğe istenince çağrılır — hem sentinel gözlemi (IntersectionObserver
   * varsa) hem de "Daha fazla yükle" butonu bu tek callback'i tetikler. Çağıran
   * `loading`'i true yapıp veriyi ekleyip `hasMore`'u güncellemekten sorumludur.
   */
  onLoadMore: () => void
  /** Yüklenecek daha fazla öğe var mı — false olunca sentinel/buton kaldırılır, `endText` görünür */
  hasMore: boolean
  /** Bir yükleme isteği sürüyor mu — true iken sentinel/buton `onLoadMore`'u TEKRAR tetiklemez (guard) */
  loading?: boolean
  /** `loading` iken alt durum satırında görünen metin */
  loadingText?: string
  /** `hasMore=false` iken alt durum satırında görünen metin */
  endText?: string
  /**
   * Sentinel'in dipten kaç px önce "yaklaşıyor" sayılacağı (IntersectionObserver
   * `rootMargin` alt kenarı). Sonlu değilse veya negatifse varsayılana düşer.
   */
  threshold?: number
}

const DEFAULT_THRESHOLD = 400

/** Sonlu değilse varsayılana düşer, negatifse 0'a kırpılır (rootMargin negatif olamaz). */
function resolveThreshold(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_THRESHOLD
  return Math.max(0, value)
}

export function GlassInfiniteList({
  children,
  onLoadMore,
  hasMore,
  loading = false,
  loadingText = 'Yükleniyor…',
  endText = 'Hepsi bu kadar',
  threshold = DEFAULT_THRESHOLD,
  className,
  ...rest
}: GlassInfiniteListProps) {
  const safeThreshold = resolveThreshold(threshold)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Observer callback'i her render'da yeniden kurulmaz (aşağıdaki effect yalnız
  // hasMore/safeThreshold değişince yeniden çalışır) — bu yüzden guard'ların
  // en güncel `loading`/`hasMore`/`onLoadMore`'u okuyabilmesi için ref'lerde
  // tutulur; aksi halde effect kurulduğu andaki bayat (stale) closure kullanılırdı.
  const loadingRef = useRef(loading)
  const hasMoreRef = useRef(hasMore)
  const onLoadMoreRef = useRef(onLoadMore)
  useEffect(() => {
    loadingRef.current = loading
  }, [loading])
  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  // IntersectionObserver: yalnız hasMore true iken (sentinel gerçekten DOM'da)
  // ve tarayıcı destekliyorsa kurulur. jsdom'da (unit test ortamı)
  // IntersectionObserver tanımsızdır — bu durumda observer HİÇ kurulmaz,
  // scroll dinleyicisi gibi bir yedek de EKLENMEZ; tek erişim yolu her zaman
  // render edilen "Daha fazla yükle" butonudur (klavye/AT erişimi için —
  // observer yalnız o butonu otomatikleştirir, bkz. rules.md §7).
  useEffect(() => {
    if (!hasMore) return
    if (typeof IntersectionObserver === 'undefined') return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        // Guard: gözlem tetiklendiği anda hâlâ yükleniyorsa veya arada
        // hasMore false olduysa (ör. çağıran son sayfayı bildirdi) yeniden
        // tetiklenmez.
        if (loadingRef.current || !hasMoreRef.current) return
        onLoadMoreRef.current()
      },
      { rootMargin: `0px 0px ${safeThreshold}px 0px` },
    )
    observer.observe(node)
    // Cleanup ZORUNLU: hasMore/threshold değişince veya unmount'ta eski
    // observer mutlaka koparılır, aksi halde birikimli gözlemci sızıntısı olur.
    return () => observer.disconnect()
  }, [hasMore, safeThreshold])

  const handleLoadMoreClick = () => {
    // Aynı guard buton tıklamasında da tekrarlanır: `disabled` özniteliği
    // normalde tıklamayı zaten engeller ama savunmacı olarak burada da
    // kontrol edilir (bkz. Dalga kontratı "guard'lı" gereksinimi).
    if (loading || !hasMore) return
    onLoadMore()
  }

  const statusText = loading ? loadingText : !hasMore ? endText : ''
  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {children}
      {hasMore ? (
        <div className={styles.loadMoreRow}>
          {/* Dipteki gözlem noktası — dekoratif, erişilebilir bir ada ihtiyacı yok. */}
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={handleLoadMoreClick}
            disabled={loading}
          >
            Daha fazla yükle
          </button>
        </div>
      ) : null}
      {/* aria-live bölgesi HER ZAMAN mount edilir — sonradan mount edilen canlı
          bölgeler ekran okuyucu tarafından duyurulmaz (bkz. Dalga kontratı). */}
      <p className={styles.status} role="status" aria-live="polite">
        {statusText}
      </p>
    </div>
  )
}
