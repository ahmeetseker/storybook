// Yoğun ana sayfa vitrini — sahibinden kapasitesinde (50-60 ilan), modern disiplinle.
// Beş yerleşim varyantı (kullanıcı mock seti L-P):
//   micro  (L): 4:3 mini kartlar, fiyat önde          ruled (M): sıfır boşluk, hairline hücreler
//   mosaic (N): kare görsel duvarı, fiyat chip'te      list  (O): çok kolonlu mikro satırlar
//   banded (P): üstte doping bandı + micro ızgara
// Kartların tamamı tıklanabilir buton; görseller dekoratif (bilgi metinle verilir).
import type { HTMLAttributes } from 'react'
import styles from './GlassVitrin.module.css'

export interface GlassVitrinItem {
  id: string
  /** Görsel URL — dekoratif (alt=""); bilgi price/title ile verilir */
  image: string
  price: string
  title: string
  location?: string
  /** EİDS doğrulama mini rozeti */
  eids?: boolean
  /** banded: üst premium banda girer (doping/vitrin ilanı) */
  featured?: boolean
  onClick?: () => void
}

export interface GlassVitrinProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: GlassVitrinItem[]
  variant?: 'micro' | 'ruled' | 'mosaic' | 'list' | 'banded'
  /** micro/ruled/banded ızgara sütunu (geniş ekran); mosaic +1 kullanır */
  columns?: 7 | 8 | 9 | 10
  /** banded: bandın kart sayısı (featured işaretliler önceliklidir) */
  bandCount?: number
}

const Eids = () => (
  <span className={styles.eids} aria-hidden>
    ✓
  </span>
)

function MicroCard({ item, ruled }: { item: GlassVitrinItem; ruled?: boolean }) {
  return (
    <button type="button" className={ruled ? styles.ruledCard : styles.microCard} onClick={item.onClick}>
      <span className={styles.ph}>
        <img src={item.image} alt="" loading="lazy" />
        {item.eids ? <Eids /> : null}
      </span>
      <span className={styles.price}>{item.price}</span>
      <span className={styles.name}>{item.title}</span>
    </button>
  )
}

function MosaicCard({ item }: { item: GlassVitrinItem }) {
  return (
    <button type="button" className={styles.mosaicCard} onClick={item.onClick}>
      <span className={styles.ph}>
        <img src={item.image} alt="" loading="lazy" />
        {item.eids ? <Eids /> : null}
      </span>
      <span className={styles.hovName}>
        {item.title}
        {item.location ? ` · ${item.location}` : ''}
      </span>
      <span className={styles.chip}>{item.price}</span>
      <span className={styles.srOnly}>{item.title}</span>
    </button>
  )
}

function ListRow({ item }: { item: GlassVitrinItem }) {
  return (
    <button type="button" className={styles.listRow} onClick={item.onClick}>
      <span className={styles.ph}>
        <img src={item.image} alt="" loading="lazy" />
        {item.eids ? <Eids /> : null}
      </span>
      <span className={styles.listMid}>
        <span className={styles.name}>{item.title}</span>
        {item.location ? <span className={styles.loc}>{item.location}</span> : null}
      </span>
      <span className={styles.price}>{item.price}</span>
    </button>
  )
}

function BandCard({ item }: { item: GlassVitrinItem }) {
  return (
    <button type="button" className={styles.bandCard} onClick={item.onClick}>
      <span className={styles.ph}>
        <img src={item.image} alt="" loading="lazy" />
      </span>
      <span className={styles.bandRozet} aria-hidden>
        VİTRİN
      </span>
      <span className={styles.bandCap}>
        <span className={styles.price}>{item.price}</span>
        <span className={styles.name}>
          {item.title}
          {item.location ? ` · ${item.location}` : ''}
        </span>
      </span>
    </button>
  )
}

export function GlassVitrin({
  items,
  variant = 'micro',
  columns = 9,
  bandCount = 5,
  className,
  ...rest
}: GlassVitrinProps) {
  const rootClass = (grid: string) =>
    [grid, styles[`cols${columns}` as keyof typeof styles], className].filter(Boolean).join(' ')

  if (variant === 'list') {
    return (
      <div className={[styles.listGrid, className].filter(Boolean).join(' ')} data-variant={variant} {...rest}>
        {items.map((item) => (
          <ListRow key={item.id} item={item} />
        ))}
      </div>
    )
  }

  if (variant === 'mosaic') {
    return (
      <div className={rootClass(styles.mosaicGrid)} data-variant={variant} {...rest}>
        {items.map((item) => (
          <MosaicCard key={item.id} item={item} />
        ))}
      </div>
    )
  }

  if (variant === 'banded') {
    const featured = items.filter((i) => i.featured)
    const band = (featured.length ? featured : items).slice(0, bandCount)
    const bandIds = new Set(band.map((i) => i.id))
    const rest_ = items.filter((i) => !bandIds.has(i.id))
    return (
      <div className={className} data-variant={variant} {...rest}>
        <div className={styles.band} data-vitrin-band>
          {band.map((item) => (
            <BandCard key={item.id} item={item} />
          ))}
        </div>
        <div className={rootClass(styles.microGrid)}>
          {rest_.map((item) => (
            <MicroCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'ruled') {
    return (
      <div className={rootClass(styles.ruledGrid)} data-variant={variant} {...rest}>
        {items.map((item) => (
          <MicroCard key={item.id} item={item} ruled />
        ))}
      </div>
    )
  }

  return (
    <div className={rootClass(styles.microGrid)} data-variant={variant} {...rest}>
      {items.map((item) => (
        <MicroCard key={item.id} item={item} />
      ))}
    </div>
  )
}
