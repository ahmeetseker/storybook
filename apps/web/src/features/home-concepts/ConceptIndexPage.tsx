import { Link } from '@tanstack/react-router'
import { GlassBadge } from '@repo/ui'
import { homeConcepts } from './concepts'
import { HomeConceptFrame } from './shared/HomeConceptFrame'
import styles from './ConceptIndexPage.module.css'

export function ConceptIndexPage() {
  return (
    <HomeConceptFrame
      className={styles.page}
      showConceptNavigation={false}
      aria-labelledby="concept-index-title"
    >
      <div className={styles.layout}>
        <header className={styles.intro}>
          <p className={styles.context}>Ana sayfa yönleri</p>
          <h1 id="concept-index-title" className={styles.title}>
            Beş arsam.net deneyimini karşılaştırın
          </h1>
          <p className={styles.description}>
            Aynı ilan verisi ve aynı ürün kabuğu üzerinde hazırlanan yönleri
            açın. Keşif akışını, bilgi yoğunluğunu ve güven anlatısını doğrudan
            karşılaştırın.
          </p>
        </header>

        <ul className={styles.conceptList} aria-label="Ana sayfa konseptleri">
          {homeConcepts.map((concept) => (
            <li key={concept.id} className={styles.conceptItem}>
              <Link
                className={styles.conceptLink}
                to={concept.href}
                preload={false}
              >
                <span className={styles.identity}>
                  <span className={styles.titleLine}>
                    <span className={styles.conceptTitle}>{concept.title}</span>
                    <GlassBadge material="flat" size="sm">
                      {concept.emphasis}
                    </GlassBadge>
                  </span>
                </span>

                <span className={styles.summary}>{concept.summary}</span>

                <span className={styles.destination}>
                  <code className={styles.route}>{concept.href}</code>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HomeConceptFrame>
  )
}
