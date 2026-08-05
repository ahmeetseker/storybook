// GlassSeoDiscovery — programatik SEO keşif rafı: sayfanın en altında, footer'ın
// hemen üstünde yaşayan iç bağlantı bloğu. Her kolon bir arama niyeti kümesi
// (yatırım · tarım · sahil · yazlık), her satır o kümenin uzun kuyruk açılış
// sayfası: "Balıkesir Ayvalık'ta zeytinlik sahibi olun".
//
// İki karar bu component'in şeklini belirledi:
//   1. Satırlar gerçek <a href> — bot da kullanıcı da aynı cümleyi okur. Router
//      tıklaması onClick ile üstüne binebilir ama href her zaman gerçek URL'dir.
//   2. Sıralama bilgi taşır ("en çok aranan"), o yüzden liste <ol>. Sağdaki iri
//      rakam bu sıranın görsel karşılığıdır ve dekoratiftir (aria-hidden) —
//      ekran okuyucu sırayı zaten listeden alır.
import type { AnchorHTMLAttributes, HTMLAttributes, MouseEvent } from 'react'
import styles from './GlassSeoDiscovery.module.css'

export interface GlassSeoDiscoveryLink {
  id: string
  /** Bağlantı metni — hedef sayfanın uzun kuyruk anahtar ifadesi (benzersiz olmalı) */
  label: string
  href: string
  /** İkincil satır — bölge, ilan sayısı gibi bağlam ("Ankara · 128 ilan") */
  meta?: string
  /** Dekoratif küçük görsel (alt=""); bilgi label/meta ile verilir */
  image?: string
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>['onClick']
}

export interface GlassSeoDiscoveryColumn {
  id: string
  /** Kümenin adı — "Yatırımlık arsa" (kısa, tek satır) */
  title: string
  links: GlassSeoDiscoveryLink[]
  /** Kümenin hub sayfası — kolonun altına "tümünü gör" satırı ekler */
  href?: string
  /** Hub bağlantısının metni; verilmezse "Tümünü gör" + küme adı okunur */
  hubLabel?: string
  onHubClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export interface GlassSeoDiscoveryProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  columns: GlassSeoDiscoveryColumn[]
  /**
   * `ranked` (varsayılan): kartlı satır — görsel + iki satır metin + hayalet sıra rakamı.
   * `plain`: çerçevesiz yoğun metin listesi — dar kolonlar ve ikincil sayfalar için.
   */
  variant?: 'ranked' | 'plain'
  /** Geniş ekrandaki kolon sayısı; dar ekranda 2'ye, telefonda 1'e iner */
  columnCount?: 3 | 4 | 5
  /** Kolon başlıklarının heading düzeyi — sayfanın hiyerarşisine göre seçilir */
  headingLevel?: 2 | 3 | 4
}

const HEADINGS = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export function GlassSeoDiscovery({
  columns,
  variant = 'ranked',
  columnCount = 4,
  headingLevel = 3,
  className,
  style,
  ...rest
}: GlassSeoDiscoveryProps) {
  const Heading = HEADINGS[headingLevel]
  // En uzun kolonun satır sayısı: raf tek ızgaradır, kolonlar satırlarını
  // subgrid ile paylaşır (bkz. CSS). Sayı veriden gelir, CSS'te sabitlenemez.
  const rowCount = columns.reduce((max, column) => Math.max(max, column.links.length), 0)
  const rootClass = [styles.root, variant === 'plain' ? styles.plain : undefined, className]
    .filter(Boolean)
    .join(' ')
  const gridClass = [styles.grid, styles[`cols${columnCount}` as keyof typeof styles]].join(' ')

  return (
    // Kırılımlar kabın genişliğine bakar (container query), viewport'a değil:
    // raf sayfa altında tam genişlikte de, dar bir yuvada da aynı kuralla iner.
    // Kap kendi genişliğini sorgulayamadığı için ızgara ayrı bir katmanda.
    <div
      className={rootClass}
      data-variant={variant}
      style={{ ['--seo-rows' as string]: rowCount, ...style }}
      {...rest}
    >
      <div className={gridClass}>
        {columns.map((column) => (
          <div className={styles.column} key={column.id}>
            <Heading className={styles.columnTitle}>{column.title}</Heading>
            <ol className={styles.list}>
              {column.links.map((link, index) => (
                <li key={link.id}>
                  <a className={styles.link} href={link.href} onClick={link.onClick}>
                    {variant === 'ranked' && link.image ? (
                      <span className={styles.thumb}>
                        <img src={link.image} alt="" loading="lazy" decoding="async" />
                      </span>
                    ) : null}
                    <span className={styles.body}>
                      <span className={styles.label}>{link.label}</span>
                      {link.meta ? <span className={styles.meta}>{link.meta}</span> : null}
                    </span>
                    {variant === 'ranked' ? (
                      <span className={styles.rank} aria-hidden>
                        {index + 1}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ol>
            {column.href ? (
              <a
                className={styles.hub}
                href={column.href}
                onClick={column.onHubClick}
                // Sayfada 4-5 hub bağlantısı yan yana durur; varsayılan metin
                // küme adıyla ayrışmazsa hepsi "Tümünü gör" olur. Görünür etiket
                // erişilebilir adın içinde kalır (WCAG 2.5.3).
                aria-label={column.hubLabel ? undefined : `Tümünü gör — ${column.title}`}
              >
                {column.hubLabel ?? 'Tümünü gör'}
                <span className={styles.hubArrow} aria-hidden>
                  →
                </span>
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
