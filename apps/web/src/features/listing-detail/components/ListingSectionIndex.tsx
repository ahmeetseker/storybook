import { GlassSurface } from '@repo/ui'

import { LISTING_SECTIONS, type ListingSectionLink } from './listing-sections'
import styles from '../ListingDetailWorkspace.module.css'

export interface ListingSectionIndexProps {
  /**
   * Gerçekten render edilen bölümler. Verilmezse arsa defterinin tam sırası
   * kullanılır. İndeks hiçbir zaman DOM'da bulunmayan bir çapaya bağlanmaz —
   * liste çağıran tarafından, sayfanın kurduğu bölümlerle birlikte gelir.
   */
  sections?: readonly ListingSectionLink[]
}

/**
 * Sticky bölüm indeksi.
 *
 * Sayfa düzeyinde tab değildir: bütün bölümler DOM'da kalır, buradaki
 * bağlantılar yalnız çapa gezinmesi yapar. Sayfanın cam yüzeylerinden biridir.
 */
export function ListingSectionIndex({ sections = LISTING_SECTIONS }: ListingSectionIndexProps) {
  return (
    <GlassSurface
      as="nav"
      aria-label="Bölümler"
      shape="capsule"
      thickness={0.4}
      className={styles.sectionIndex}
    >
      <ul className={styles.sectionList}>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className={styles.sectionLink}>
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </GlassSurface>
  )
}
