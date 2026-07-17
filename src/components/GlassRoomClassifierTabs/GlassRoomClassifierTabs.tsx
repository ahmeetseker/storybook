// AI-first içerik katmanı component'i (Dalga kontratı §"AI-first standardı").
// Galeri fotoğraflarını AI'nın odaya göre sınıflandırdığı bir SEÇİM kontrolüdür —
// panel/görsel ızgara render ETMEZ (o galerinin sorumluluğu, çağıran kompoze eder).
// Bu yüzden ARIA rolü kasıtlı olarak `tablist`/`tab` DEĞİL, `radiogroup`/`radio`'dur:
// WAI-ARIA APG Tabs deseni her `tab`'ın gerçek/var olan bir `tabpanel`'i
// kontrol etmesini şart koşar; bu component paneli hiç render etmediğinden ve
// panel DOM id'sini bilemediğinden `aria-controls` vermek kırık bir IDREF
// olurdu (bkz. rules.md §2). Davranış zaten tek-seçimli bir FİLTRE olduğundan
// (bkz. yukarı) `radiogroup`/`radio` semantik olarak doğru eşleme — panel
// ilişkisi gerektirmez. Klavye/roving-tabindex iskeleti (ok tuşu ile
// gezinme+seçim) `GlassNearbyPlaces` `variant="tabs"` ile aynı mekaniği
// paylaşır, yalnız rol adları farklıdır.
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

export interface GlassRoomClassifierTabsProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
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
  /** Radiogroup'un dışındaki `<section>` köküne verilir; sayfada birden çok örnek varsa önerilir */
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
 * vermez (bkz. dosya başı not + rules.md §2). WAI-ARIA `radiogroup`/`radio` +
 * roving tabindex + ok tuşu (yalnız yatay: `ArrowLeft`/`ArrowRight`/`Home`/
 * `End`) deseni `GlassNearbyPlaces` `variant="tabs"` ile aynı iskelettir,
 * yalnız rol adları farklıdır (panelsiz tek-seçim filtre → radio, gerçek
 * panelli tab → tab).
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
  //
  // `focusPendingRef` YALNIZ "bir odak talebi var mı" bayrağı değil,
  // `focusRequestIdRef` ile BİRLİKTE hangi oda talep edildiğini de taşır.
  // Efekt, bayrağı her koşulda (eşleşse de eşleşmese de) tüketip sıfırlar;
  // yalnız çözülen `activeRoom` gerçekten talep edilen id'yle eşleşiyorsa
  // focus() çağrılır. Bu, iki farklı "reddedilen/değişiklik üretmeyen"
  // yolunu da kapsar:
  //  1) Controlled modda ebeveyn seçimi reddederse (prop değişmez) →
  //     activeIndex değişmez, efekt bu döngüde hiç tetiklenmez; bayrak
  //     bir SONRAKİ (tamamen ilgisiz bir sebeple activeIndex değiştiren)
  //     render'a kadar askıda kalabilir — efekt o zaman çalıştığında
  //     requestId artık çözülen odayla eşleşmediğinden focus() ÇAĞRILMAZ,
  //     yalnız bayrak temizlenir (bkz. aşağıdaki "reddedilen seçim" testi).
  //  2) Zaten seçili sekmede Home/End'e basılırsa (nextIndex === activeIndex,
  //     değişiklik üretmez) → bayrak hiç set edilmez (aşağıda erken temizlik).
  const focusPendingRef = useRef(false)
  const focusRequestIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!focusPendingRef.current) return
    focusPendingRef.current = false
    const requestedId = focusRequestIdRef.current
    focusRequestIdRef.current = null
    if (requestedId !== null && requestedId === activeRoom?.id) {
      document.getElementById(`${baseId}-tab-${activeIndex}`)?.focus()
    }
  }, [activeIndex, baseId, activeRoom])

  const resolvedConfidence = resolveConfidence(confidence)
  const classes = [styles.root, className].filter(Boolean).join(' ')

  // Canlı bölge (`role="status"`) her iki durumda da (loading VE hazır)
  // AYNI DOM konumunda, SÜREKLİ mount kalır — yalnız metni değişir. Yükleme
  // bittiğinde node'u tamamen kaldırıp yerine farklı bir ağaç koymak (eski
  // implementasyon) ekran okuyucuların "tamamlandı" geçişini güvenilir
  // duyurmasını engelliyordu (bkz. rules.md §2 "durum geçişi duyurusu").
  const statusMessage = loading
    ? 'Fotoğraflar odalara ayrılıyor'
    : `Fotoğraflar odalara ayrıldı, ${rooms.length} oda bulundu`

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
          {statusMessage}
        </span>
      </section>
    )
  }

  if (rooms.length === 0) return null

  // Radiogroup deseni: roving tabindex. Yatay olduğundan yalnız
  // ArrowLeft/ArrowRight/Home/End işlenir; ArrowUp/ArrowDown WAI-ARIA APG
  // radiogroup deseninde yatay eksende tanımlı değildir ve sayfa
  // kaydırmasını engellememesi için preventDefault edilmeden bırakılır.
  const onTabsKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = rooms.length
    let nextIndex = -1
    if (e.key === 'ArrowRight') nextIndex = (activeIndex + 1) % count
    else if (e.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + count) % count
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = count - 1
    if (nextIndex === -1) return
    e.preventDefault()
    if (nextIndex === activeIndex) {
      // Zaten seçili sekmede Home/End: değişiklik üretmeyen bir seçim
      // yolu — odak talebi YOK, bayrak hiç askıda bırakılmaz.
      focusPendingRef.current = false
      focusRequestIdRef.current = null
      selectRoom(rooms[nextIndex].id)
      return
    }
    focusPendingRef.current = true
    focusRequestIdRef.current = rooms[nextIndex].id
    selectRoom(rooms[nextIndex].id)
  }

  return (
    <section className={classes} aria-label={ariaLabel} {...rest}>
      <Header confidence={resolvedConfidence} />
      <div
        role="radiogroup"
        aria-label="Oda filtresi"
        className={styles.tabs}
        onKeyDown={onTabsKeyDown}
      >
        {rooms.map((room, i) => {
          const selected = i === activeIndex
          const safeCount = resolveCount(room.count)
          return (
            <button
              key={room.id}
              type="button"
              role="radio"
              // DOM id, odanın ham `id` alanından değil index'ten türetilir:
              // `id` yalnız veri anahtarı/controlled state değeri olarak kalır
              // (boşluk/özel karakter içerebilir), bu component `aria-controls`
              // vermediğinden IDREF kırılma riski yoktur ama id yine de bu
              // component dışına açık bir DOM sözleşmesi taşıdığından
              // öngörülebilir tutulur.
              id={`${baseId}-tab-${i}`}
              aria-checked={selected}
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
      <span className={styles.srOnly} role="status">
        {statusMessage}
      </span>
    </section>
  )
}
