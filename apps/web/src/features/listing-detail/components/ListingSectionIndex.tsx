import { GlassSurface } from '@repo/ui'

import { LISTING_SECTIONS } from './listing-sections'
import styles from '../ListingDetailWorkspace.module.css'

/**
 * Sticky bölüm indeksi.
 *
 * Sayfa düzeyinde tab değildir: bütün bölümler DOM'da kalır, buradaki
 * bağlantılar yalnız çapa gezinmesi yapar. Sayfanın cam yüzeylerinden biridir.
 */
export function ListingSectionIndex() {
  return (
    <GlassSurface
      as="nav"
      aria-label="Bölümler"
      shape="capsule"
      thickness={0.4}
      className={styles.sectionIndex}
    >
      <ul className={styles.sectionList}>
        {LISTING_SECTIONS.map((section) => (
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
