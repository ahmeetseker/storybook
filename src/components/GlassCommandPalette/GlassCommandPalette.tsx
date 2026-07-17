// GlassCommandPalette — sayfa geneli komut paleti (⌘K). İçerik katmanı FLAT
// (cam/backdrop-filter yok). GlassModal KULLANILMAZ — kendi hafif overlay'ini
// kurar: portal YOK (sayfa içi `position: fixed`), backdrop tıklaması ve
// Escape kapatır, focus trap YOK (bkz. rules.md §2, §7). `open` controlled
// ZORUNLU — `defaultOpen`/uncontrolled kullanım yok (spec kararı, çağıran
// ⌘K kısayolunu kendi dinleyicisiyle yönetir).
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassCommandPalette.module.css'

/** Tek bir komut satırı. */
export interface GlassCommandPaletteCommand {
  /** Kararlı kimlik — yalnız React `key` için kullanılır, DOM `id`'sine YAZILMAZ (bkz. rules.md §2) */
  id: string
  /** Görünür etiket — filtre bu alan üzerinde çalışır */
  label: string
  /** Sağda görünen kısayol/ipucu metni (ör. "⌘K") — dekoratif, filtreye dahil değil */
  hint?: string
  /** Komutun ait olduğu grup adı — verilirse komutlar bu ada göre kümelenip başlık altında gösterilir */
  group?: string
  /** Komut seçildiğinde (tıklama veya Enter) çağrılır */
  onSelect: () => void
}

export interface GlassCommandPaletteProps {
  /** Controlled açık/kapalı durumu — ZORUNLU, uncontrolled kullanım yok */
  open: boolean
  /** Backdrop tıklaması, Escape veya bir komut seçimi sonrası çağrılır. Tetikleyiciye odak dönüşü ÇAĞIRANIN işidir (bkz. rules.md §7) */
  onClose: () => void
  commands: GlassCommandPaletteCommand[]
  placeholder?: string
  /** Filtre sonucu boşken gösterilir */
  emptyText?: string
  className?: string
}

/** Dekoratif mercek ikonu — accessible name arama input'unun sabit aria-label'ından gelir. */
function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" className={styles.searchIcon}>
      <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

interface IndexedCommand {
  command: GlassCommandPaletteCommand
  /** Grup sınırlarını aşan, tüm filtrelenmiş listedeki düz (flat) konum — klavye gezinmesi bunu kullanır */
  index: number
}

interface CommandBucket {
  /** Boş string → grupsuz komutlar; bu bucket'ta grup başlığı render edilmez */
  group: string
  items: IndexedCommand[]
}

/** Türkçe locale'e duyarlı, büyük/küçük harf duyarsız "içerir" karşılaştırması (ör. "İ"/"i", "I"/"ı"). */
function includesLabel(label: string, query: string): boolean {
  return label.toLocaleLowerCase('tr').includes(query)
}

export function GlassCommandPalette({
  open,
  onClose,
  commands,
  placeholder = 'Komut ara…',
  emptyText = 'Sonuç bulunamadı.',
  className,
}: GlassCommandPaletteProps) {
  const uid = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const reduced = prefersReducedMotion()

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const commandDomId = (index: number) => `${uid}-cmd-${index}`

  // Grup sırası HER ZAMAN orijinal `commands` dizisindeki ilk-görülme sırasına
  // göre sabitlenir (filtrelenmiş alt kümeye göre DEĞİL) — böylece kullanıcı
  // yazarken gruplar filtre sırasında yer değiştirmez, yalnız içi boşalan
  // gruplar (eşleşme kalmayınca) tamamen kaybolur. Grupsuz komutlar (`group`
  // yok) tek bir "" bucket'ında toplanır ve başlıksız render edilir.
  const buckets = useMemo<CommandBucket[]>(() => {
    const trimmed = query.trim()
    const q = trimmed ? trimmed.toLocaleLowerCase('tr') : ''

    const byGroup = new Map<string, GlassCommandPaletteCommand[]>()
    for (const command of commands) {
      if (q && !includesLabel(command.label, q)) continue
      const key = command.group ?? ''
      const arr = byGroup.get(key)
      if (arr) arr.push(command)
      else byGroup.set(key, [command])
    }

    const order: string[] = []
    const seen = new Set<string>()
    for (const command of commands) {
      const key = command.group ?? ''
      if (!seen.has(key)) {
        seen.add(key)
        order.push(key)
      }
    }

    let flatIndex = 0
    const result: CommandBucket[] = []
    for (const key of order) {
      const items = byGroup.get(key)
      if (!items || items.length === 0) continue
      result.push({
        group: key,
        items: items.map((command) => ({ command, index: flatIndex++ })),
      })
    }
    return result
  }, [commands, query])

  const flatItems = useMemo(() => buckets.flatMap((bucket) => bucket.items.map((i) => i.command)), [buckets])

  // Açılış: `open` GERÇEKTEN false→true geçtiğinde (ilk mount'ta true başlaması
  // dahil — `prevOpenRef` başlangıcı bilinçli olarak `false`) arama/aktif index
  // sıfırlanır ve input'a odaklanılır. Bu, ChatDock'un "yalnız kullanıcı
  // tetiklediyse odak taşı" davranışından BİLİNÇLİ OLARAK farklıdır: palet
  // GlassModal ailesiyle aynı "açılan her diyalog input'a odaklanır" sözleşmesini
  // taşır (spec: "açılınca input'a odak" koşulsuz) — kapanışta tetikleyiciye
  // odak dönüşü ise ÇAĞIRANIN işi, component bunu YAPMAZ (bkz. rules.md §7).
  const prevOpenRef = useRef(false)
  useEffect(() => {
    const was = prevOpenRef.current
    prevOpenRef.current = open
    if (open && !was) {
      setQuery('')
      setActiveIndex(0)
      inputRef.current?.focus()
    }
  }, [open])

  // Yazarken sonuç kümesi daralır/genişler — aktif işaretçi her sorgu
  // değişiminde ilk sonuca döner (Spotlight/⌘K kalıbı).
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Savunma amaçlı kelepçe: `commands` prop'u dışarıdan değişip liste
  // kısalırsa (query sabitken) aktif index sınır dışına taşmaz.
  useEffect(() => {
    setActiveIndex((i) => (flatItems.length === 0 ? 0 : Math.min(i, flatItems.length - 1)))
  }, [flatItems.length])

  // Aktif öğe klavyeyle gezilirken sonuç listesinin görünür alanında kalır.
  useEffect(() => {
    if (!open) return
    document.getElementById(commandDomId(activeIndex))?.scrollIntoView?.({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex])

  const selectCommand = (command: GlassCommandPaletteCommand) => {
    command.onSelect()
    onClose()
  }

  // Backdrop'a tıklama: yalnız tıklanan öğe backdrop'un KENDİSİYSE kapatır
  // (event bubbling ile panel içinden gelen bir tıklama backdrop'u tetiklemez
  // — panelde ayrı bir stopPropagation'a ihtiyaç yok, `target === currentTarget`
  // kontrolü yeterli ve test edilmesi daha kolay).
  const handleBackdropClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Klavye dinleyicisi panel kapsayıcısının onKeyDown'unda (document genelinde
  // DEĞİL) — böylece yalnız palet açıkken VE odak palet içindeyken tetiklenir,
  // sayfadaki başka bir Escape/ok-tuşu dinleyicisiyle çakışmaz (bkz. rules.md
  // §7, GlassChatDock/GlassPopover ile aynı desen). IME kompozisyonu sürerken
  // (`isComposing`/`key==='Process'`) hiçbir tuş işlenmez — adayı onaylayan/
  // iptal eden Enter/Escape paleti yanlışlıkla kapatmaz/seçmez.
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing || e.key === 'Process') return
    switch (e.key) {
      case 'Escape':
        e.stopPropagation()
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (flatItems.length === 0 ? 0 : (i + 1) % flatItems.length))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (flatItems.length === 0 ? 0 : (i - 1 + flatItems.length) % flatItems.length))
        break
      case 'Enter': {
        e.preventDefault()
        const command = flatItems[activeIndex]
        if (command) selectCommand(command)
        break
      }
      default:
        break
    }
  }

  const backdropMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.16, ease: 'easeOut' as const } }

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : {
        initial: { opacity: 0, y: -8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.98 },
        transition: { duration: 0.18, ease: [0.32, 0.72, 0, 1] as const },
      }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={[styles.backdrop, className].filter(Boolean).join(' ')}
          onClick={handleBackdropClick}
          {...backdropMotion}
        >
          {/* Non-modal-benzeri diyalog: `aria-modal` YOK, focus trap YOK — GlassModal'ın
              taşıdığı portal/trap/scroll-kilidi sözleşmesine bilinçli olarak dahil değil
              (bkz. rules.md §2, §7). Backdrop'un kendisi tıklamayı kapatma sinyaline
              çevirir, panel bunun üstüne binmez. */}
          <motion.div
            role="dialog"
            aria-label="Komut paleti"
            className={styles.panel}
            onKeyDown={handleKeyDown}
            {...panelMotion}
          >
            <div className={styles.searchRow}>
              <SearchIcon />
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label="Komut ara"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Kontrat: aria-live bölgeleri sonradan DOM'a eklenmemeli — panel + status
                TEK birim olarak `open` ile birlikte mount/unmount olur, bu düğüm panelin
                geri kalanıyla AYNI ANDA render edilir, ayrı bir adımda eklenmez
                (bkz. rules.md §2, dalga1-kontrat.md). */}
            <div role="status" className={styles.srOnly}>
              {flatItems.length} sonuç bulundu
            </div>

            <div className={styles.results}>
              {flatItems.length === 0 ? (
                <p className={styles.empty}>{emptyText}</p>
              ) : (
                buckets.map((bucket, bucketIndex) => {
                  // DOM id ham `group` metninden DEĞİL, index'ten türetilir — grup adı
                  // boşluk/özel karakter içerebilir, ARIA IDREF kırılmasın diye.
                  const groupLabelId = bucket.group ? `${uid}-group-${bucketIndex}` : undefined
                  return (
                    <div
                      key={bucket.group || `_ungrouped_${bucketIndex}`}
                      role={bucket.group ? 'group' : undefined}
                      aria-labelledby={groupLabelId}
                      className={styles.group}
                    >
                      {bucket.group ? (
                        // Grup başlığı HEADING DEĞİL (spec) — yalnız görsel/erişilebilir
                        // grup etiketi (GlassNearbyPlaces .categoryLabel ile aynı karar).
                        <p id={groupLabelId} className={styles.groupLabel}>
                          {bucket.group}
                        </p>
                      ) : null}
                      {bucket.items.map(({ command, index }) => (
                        // Basit desen (spec kararı): role="option"/aria-activedescendant +
                        // role="listbox" YOK — gerçek `<button>` listesi, roving tabindex
                        // DEĞİL (odak input'ta kalır), aktif öğe yalnız `activeIndex` state'i
                        // + görsel `data-active` vurgusuyla işaretlenir. Ekran okuyucu
                        // kullanıcıları için bu, standart Tab+Enter/Space ile her butonu
                        // tek tek etkinleştirme imkânı sağlar — activedescendant'a bağımlı
                        // değil (bkz. rules.md §7 gerekçesi).
                        <button
                          key={command.id}
                          type="button"
                          id={commandDomId(index)}
                          className={styles.command}
                          data-active={index === activeIndex || undefined}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => selectCommand(command)}
                        >
                          <span className={styles.commandLabel}>{command.label}</span>
                          {command.hint ? <span className={styles.commandHint}>{command.hint}</span> : null}
                        </button>
                      ))}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
