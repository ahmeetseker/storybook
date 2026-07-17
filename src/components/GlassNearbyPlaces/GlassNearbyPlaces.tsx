import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import styles from './GlassNearbyPlaces.module.css'

/** Yakın çevredeki tek bir nokta (ör. market, durak, okul). */
export interface GlassNearbyPlace {
  /** Yerin adı (ör. "Migros") */
  name: string
  /** Mesafe metni — tabular hizalanır, format serbest (ör. "350 m", "1,2 km") */
  distance: string
  /** Opsiyonel ek not (ör. "8 dk yürüme") */
  note?: string
}

/** Bir kategori (ör. "Ulaşım") + o kategoriye ait yer listesi. */
export interface GlassNearbyCategory {
  /** Kategori kimliği — `variant="tabs"`'ta sekme id'si ve controlled state anahtarıdır */
  id: string
  /** Kategori adı (ör. "Ulaşım") — HEADING DEĞİL, yalnız görsel/erişilebilir grup etiketi */
  label: string
  /** Etiketin solunda dekoratif ikon (aria-hidden) */
  icon?: ReactNode
  places: GlassNearbyPlace[]
}

export interface GlassNearbyPlacesProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  categories: GlassNearbyCategory[]
  /** Görsel biçim: tüm kategoriler alt alta (`chips`) veya kategori sekmeleri (`tabs`) */
  variant?: 'chips' | 'tabs'
  /** Yalnız `variant="tabs"` için: controlled aktif kategori id'si */
  activeCategoryId?: string
  /** Yalnız `variant="tabs"` için: uncontrolled başlangıç kategorisi (varsayılan: ilk kategori) */
  defaultActiveCategoryId?: string
  /** Yalnız `variant="tabs"` için: aktif kategori değişince çağrılır */
  onActiveCategoryIdChange?: (id: string) => void
  /** Bileşeni adlandırır — sayfada birden çok örnek varsa verilmesi önerilir */
  'aria-label'?: string
}

const EMPTY_CATEGORY_TEXT = 'Bu kategoride yakın nokta eklenmemiş.'

function PlaceList({ places }: { places: GlassNearbyPlace[] }) {
  if (places.length === 0) {
    return (
      <ul className={styles.placeList}>
        <li className={styles.emptyRow}>{EMPTY_CATEGORY_TEXT}</li>
      </ul>
    )
  }
  return (
    <ul className={styles.placeList}>
      {places.map((place, i) => (
        <li key={`${place.name}-${i}`} className={styles.placeRow}>
          <span className={styles.placeInfo}>
            <span className={styles.placeName}>{place.name}</span>
            {place.note ? <span className={styles.placeNote}>{place.note}</span> : null}
          </span>
          <span className={styles.distanceChip}>{place.distance}</span>
        </li>
      ))}
    </ul>
  )
}

export function GlassNearbyPlaces({
  categories,
  variant = 'chips',
  activeCategoryId,
  defaultActiveCategoryId,
  onActiveCategoryIdChange,
  className,
  'aria-label': ariaLabel,
  ...rest
}: GlassNearbyPlacesProps) {
  const baseId = useId()
  const [innerActiveId, setInnerActiveId] = useState(defaultActiveCategoryId)

  // Controlled tespiti YALNIZ activeCategoryId üzerinden yapılır (GlassSegmentedControl/
  // GlassFloorPlanViewer ile aynı desen). Çözülen id herhangi bir kategoriyle eşleşmezse
  // (geçersiz controlled değer, silinmiş kategori, henüz seçim yapılmamış uncontrolled hal)
  // ilk kategoriye düşülür — hem sekme hem panel bu TEK çözümlenmiş kategoriyi baz alır,
  // aralarında tutarsızlık (panel A gösterirken hiçbir sekme seçili görünmemesi) oluşmaz.
  const isControlled = activeCategoryId !== undefined
  const requestedId = isControlled ? activeCategoryId : innerActiveId
  const activeCategory = categories.find((c) => c.id === requestedId) ?? categories[0]
  // Aynı dizi referansı üzerinden konum — DOM id'leri kategori id'sinin ham
  // değerinden değil bu index'ten türetilir (bkz. aşağıdaki DOM id notu).
  // categories boşsa activeCategory undefined olur, indexOf -1 döner —
  // aşağıdaki erken `return null`'dan ÖNCE hook'lar (useRef/useEffect) yine
  // de koşulsuz çağrılmış olur (Rules of Hooks).
  const activeIndex = categories.indexOf(activeCategory as GlassNearbyCategory)

  const selectCategory = (id: string) => {
    if (!isControlled) setInnerActiveId(id)
    onActiveCategoryIdChange?.(id)
  }

  // Odak taşıma yalnız kullanıcının ok tuşu/Home/End ile tetiklediği geçişte
  // olur ve gerçekte render'a yansıyan (resolved) activeIndex'i izleyen bir
  // efektle yapılır — controlled modda ebeveyn seçimi reddederse (prop
  // değişmezse) activeIndex değişmez, efekt tetiklenmez, odak sapması
  // oluşmaz (bkz. GlassRating InputRating ile aynı sınıf bug, burada
  // kontrolsüz `document.getElementById(next...).focus()` çağrısı yerine
  // yalnız gerçekleşen değişim odağı taşır).
  const focusPendingRef = useRef(false)
  useEffect(() => {
    if (!focusPendingRef.current) return
    focusPendingRef.current = false
    document.getElementById(`${baseId}-tab-${activeIndex}`)?.focus()
  }, [activeIndex, baseId])

  if (categories.length === 0) return null

  // Tablist deseni: roving tabindex. Yatay tablist olduğundan yalnız
  // ArrowLeft/ArrowRight + Home/End işlenir; ArrowUp/ArrowDown WAI-ARIA APG
  // yatay tablist deseninde tanımlı değildir ve sayfa kaydırmasını
  // engellememesi için preventDefault edilmeden bırakılır.
  const onTabsKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = categories.length
    let nextIndex = -1
    if (e.key === 'ArrowRight') nextIndex = (activeIndex + 1) % count
    else if (e.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + count) % count
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = count - 1
    if (nextIndex === -1) return
    e.preventDefault()
    focusPendingRef.current = true
    selectCategory(categories[nextIndex].id)
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  if (variant === 'tabs') {
    return (
      <section className={classes} aria-label={ariaLabel} {...rest}>
        <div role="tablist" aria-label="Kategori seçimi" className={styles.tabs} onKeyDown={onTabsKeyDown}>
          {categories.map((cat, i) => {
            const selected = i === activeIndex
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={[styles.tab, selected ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => selectCategory(cat.id)}
              >
                {cat.icon ? (
                  <span className={styles.categoryIcon} aria-hidden>
                    {cat.icon}
                  </span>
                ) : null}
                {cat.label}
              </button>
            )
          })}
        </div>
        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${activeIndex}`}
          className={styles.panel}
        >
          <PlaceList places={activeCategory.places} />
        </div>
      </section>
    )
  }

  return (
    <section className={classes} aria-label={ariaLabel} {...rest}>
      {categories.map((cat, i) => {
        // DOM id, kategorinin ham `id` alanından değil index'ten türetilir:
        // `id` yalnız veri anahtarı olarak kalır (boşluk/özel karakter içerebilir),
        // aksi halde ARIA IDREF (aria-labelledby/aria-controls) kırılırdı.
        const labelId = `${baseId}-label-${i}`
        return (
          <div key={cat.id} role="group" aria-labelledby={labelId} className={styles.categoryGroup}>
            <p id={labelId} className={styles.categoryLabel}>
              {cat.icon ? (
                <span className={styles.categoryIcon} aria-hidden>
                  {cat.icon}
                </span>
              ) : null}
              {cat.label}
            </p>
            <PlaceList places={cat.places} />
          </div>
        )
      })}
    </section>
  )
}
