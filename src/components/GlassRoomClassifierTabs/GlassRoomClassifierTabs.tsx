// AI-first içerik katmanı component'i (Dalga kontratı §"AI-first standardı").
// Galeri fotoğraflarını AI'nın odaya göre sınıflandırdığı bir SEÇİM kontrolüdür —
// panel/görsel ızgara render ETMEZ (o galerinin sorumluluğu, çağıran kompoze eder).
// Bu yüzden `aria-controls` HİÇ verilmez: bu component hangi panel DOM id'sinin
// var olacağını bilemez, var olmayan/yanlış bir id'ye işaret etmek gerçek bir
// ARIA IDREF ihlali olurdu (bkz. rules.md §2). Klavye/roving-tabindex iskeleti
// GlassNearbyPlaces `variant="tabs"` ile birebir aynı desendir.
import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react'
import styles from './GlassRoomClassifierTabs.module.css'

/** AI tarafından odaya göre sınıflandırılmış tek bir grup (ör. "Mutfak" → 12 fotoğraf). */
export interface GlassRoomClassifierRoom {
  /** Oda/mekân kimliği — controlled state anahtarıdır, DOM id türetiminde KULLANILMAZ (bkz. aşağıdaki not) */
  id: string
  /** Oda adı (ör. "Mutfak", "Yatak Odası 1", "Balkon") */
  label: string
  /** Bu odaya sınıflandırılan fotoğraf adedi; sonlu olmayan/negatif değerler 0'a düşürülür */
  count: number
}

export interface GlassRoomClassifierTabsProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** AI sınıflandırmasının ürettiği oda grupları — boş dizi hiçbir şey render etmez */
  rooms: GlassRoomClassifierRoom[]
  /** Controlled aktif oda id'si */
  activeRoomId?: string
  /** Uncontrolled başlangıç odası (varsayılan: ilk oda) */
  defaultActiveRoomId?: string
  /** Aktif oda değişince çağrılır (tıklama + ok tuşu/Home/End) */
  onActiveRoomIdChange?: (id: string) => void
  /**
   * AI-first standardı: verilirse "✦ AI" rozetinin yanında "%N güven" metni
   * görünür etiket olarak eklenir. 0-100 dışına clamp edilir; sonlu değilse
   * (`NaN`/`Infinity`) hiç render edilmez (rozet yine görünür kalır).
   */
  confidence?: number
  /**
   * true olduğunda sekmeler yerine soluk, animasyonsuz-kapatılabilir bir
   * placeholder gösterilir (kendi flat skeleton'u). Zorunlu "✦ AI" rozeti bu
   * durumda da görünür kalır — AI-first standardı yükleme durumunu istisna
   * tutmaz. `role="status"` metni ekranokuyucuya durumu iletir.
   */
  loading?: boolean
  /** Tablist'in dışındaki `<section>` köküne verilir; sayfada birden çok örnek varsa önerilir */
  'aria-label'?: string
}

const LOADING_TAB_WIDTHS = ['72px', '96px', '60px', '84px']

/** `confidence` prop'unu normalize eder: sonlu değilse `null` (rozet metni gizlenir). */
function resolveConfidence(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

/** `count`'u güvenli tam sayıya indirger: sonlu değilse/negatifse 0. */
function resolveCount(count: number): number {
  if (!Number.isFinite(count)) return 0
  return Math.max(0, Math.round(count))
}

/**
 * AI-first içerik rozeti — Dalga kontratının "AI-first standardı" bölümüne
 * göre tüm AI component'lerinde AYNI görünmeli (kopya CSS kabul, ortak
 * component'e çıkarılmaz — component'ler birbirinden bağımsız kalır; bkz.
 * `GlassAiSummaryCard`/`GlassMatchScore` ile birebir aynı `.aiBadge` bloğu).
 */
function AiBadge({ confidence }: { confidence: number | null }) {
  return (
    <span className={styles.aiRow}>
      <span className={styles.aiBadge} aria-label="Yapay zekâ üretimi">
        ✦ AI
      </span>
      {confidence !== null ? <span className={styles.confidence}>%{confidence} güven</span> : null}
    </span>
  )
}

/** Başlık satırı: zorunlu "AI sınıflandırması" etiketi + AI rozeti — özelleştirilemez (kontrat: her zaman aynı). */
function Header({ confidence }: { confidence: number | null }) {
  return (
    <div className={styles.header}>
      <span className={styles.title}>AI sınıflandırması</span>
      <AiBadge confidence={confidence} />
    </div>
  )
}

/**
 * Galeri fotoğraflarını AI'nın odaya göre sınıflandırdığı yatay kaydırılabilir
 * sekme çipleri: her çip oda adı + fotoğraf adedi rozeti taşır. Yalnız SEÇİM
 * kontrolüdür — galeri ızgarasını/panelini render etmez, `aria-controls`
 * vermez (bkz. dosya başı not + rules.md §2). WAI-ARIA tablist + roving
 * tabindex + ok tuşu (yalnız yatay: `ArrowLeft`/`ArrowRight`/`Home`/`End`)
 * deseni `GlassNearbyPlaces` `variant="tabs"` ile birebir aynıdır.
 */
export function GlassRoomClassifierTabs({
  rooms,
  activeRoomId,
  defaultActiveRoomId,
  onActiveRoomIdChange,
  confidence,
  loading = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: GlassRoomClassifierTabsProps) {
  const baseId = useId()
  const [innerActiveId, setInnerActiveId] = useState(defaultActiveRoomId)

  // Controlled tespiti YALNIZ activeRoomId üzerinden yapılır (GlassNearbyPlaces
  // ile aynı desen). Çözülen id herhangi bir odayla eşleşmezse (geçersiz
  // controlled değer, silinmiş oda, henüz seçim yapılmamış uncontrolled hal)
  // ilk odaya düşülür.
  const isControlled = activeRoomId !== undefined
  const requestedId = isControlled ? activeRoomId : innerActiveId
  const activeRoom = rooms.find((r) => r.id === requestedId) ?? rooms[0]
  // DOM id'leri bu index'ten türetilir (bkz. aşağıdaki DOM id notu) — rooms
  // boşsa activeRoom undefined olur, indexOf -1 döner; aşağıdaki erken
  // return'lerden ÖNCE hook'lar (useRef/useEffect) yine de koşulsuz çağrılmış
  // olur (Rules of Hooks, bkz. GlassNearbyPlaces ile aynı sıralama).
  const activeIndex = rooms.indexOf(activeRoom as GlassRoomClassifierRoom)

  const selectRoom = (id: string) => {
    if (!isControlled) setInnerActiveId(id)
    onActiveRoomIdChange?.(id)
  }

  // Odak taşıma yalnız kullanıcının ok tuşu/Home/End ile tetiklediği geçişte
  // olur ve gerçekte render'a yansıyan (resolved) activeIndex'i izleyen bir
  // efektle yapılır — controlled modda ebeveyn seçimi reddederse (prop
  // değişmezse) activeIndex değişmez, efekt tetiklenmez, odak sapması
  // oluşmaz (GlassNearbyPlaces/GlassRating ile aynı sınıf düzeltme).
  const focusPendingRef = useRef(false)
  useEffect(() => {
    if (!focusPendingRef.current) return
    focusPendingRef.current = false
    document.getElementById(`${baseId}-tab-${activeIndex}`)?.focus()
  }, [activeIndex, baseId])

  const resolvedConfidence = resolveConfidence(confidence)
  const classes = [styles.root, className].filter(Boolean).join(' ')

  if (loading) {
    return (
      <section className={classes} aria-label={ariaLabel} aria-busy="true" data-loading="true" {...rest}>
        <Header confidence={null} />
        <div className={styles.tabs} aria-hidden="true">
          {LOADING_TAB_WIDTHS.map((width, i) => (
            <span key={i} className={styles.skeletonTab} style={{ width }} />
          ))}
        </div>
        <span className={styles.srOnly} role="status">
          Fotoğraflar odalara ayrılıyor
        </span>
      </section>
    )
  }

  if (rooms.length === 0) return null

  // Tablist deseni: roving tabindex. Yatay tablist olduğundan yalnız
  // ArrowLeft/ArrowRight/Home/End işlenir; ArrowUp/ArrowDown WAI-ARIA APG
  // yatay tablist deseninde tanımlı değildir ve sayfa kaydırmasını
  // engellememesi için preventDefault edilmeden bırakılır.
  const onTabsKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = rooms.length
    let nextIndex = -1
    if (e.key === 'ArrowRight') nextIndex = (activeIndex + 1) % count
    else if (e.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + count) % count
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = count - 1
    if (nextIndex === -1) return
    e.preventDefault()
    focusPendingRef.current = true
    selectRoom(rooms[nextIndex].id)
  }

  return (
    <section className={classes} aria-label={ariaLabel} {...rest}>
      <Header confidence={resolvedConfidence} />
      <div role="tablist" aria-label="Oda filtresi" className={styles.tabs} onKeyDown={onTabsKeyDown}>
        {rooms.map((room, i) => {
          const selected = i === activeIndex
          const safeCount = resolveCount(room.count)
          return (
            <button
              key={room.id}
              type="button"
              role="tab"
              // DOM id, odanın ham `id` alanından değil index'ten türetilir:
              // `id` yalnız veri anahtarı/controlled state değeri olarak kalır
              // (boşluk/özel karakter içerebilir), bu component `aria-controls`
              // vermediğinden IDREF kırılma riski yoktur ama id yine de bu
              // component dışına açık bir DOM sözleşmesi taşıdığından
              // öngörülebilir tutulur.
              id={`${baseId}-tab-${i}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={[styles.tab, selected ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => selectRoom(room.id)}
            >
              <span className={styles.tabLabel}>{room.label}</span>{' '}
              <span className={styles.countBadge}>{safeCount}</span>{' '}
              <span className={styles.srOnly}>fotoğraf</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
