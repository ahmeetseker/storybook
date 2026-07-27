import type { AdvisorStatus } from '../domain/advisor-reducer'
import { AdvisorComposer } from './AdvisorComposer'
import styles from './AdvisorPanels.module.css'

export interface AdvisorWelcomeProps {
  /** Düzenlenebilir doğal dil sorgusu. */
  query: string
  /** İlk kullanım yüzeyinin güncel analiz durumu. */
  status?: AdvisorStatus
  /** Sorgu metni değiştiğinde çağrılır. */
  onQueryChange: (query: string) => void
  /** Sorgu veya örnek gönderildiğinde çağrılır. */
  onSubmit: (query: string) => void
  /** Sürmekte olan analiz durdurulmak istendiğinde çağrılır. */
  onCancel?: () => void
}

const EXAMPLES = [
  'Urla’da 5 milyon TL altında imarlı arsa',
  'Kadıköy’de metroya yakın kiralık 2+1',
  'Bursa’da aile yaşamına uygun satılık ev',
] as const

export function AdvisorWelcome({
  query,
  status = 'idle',
  onQueryChange,
  onSubmit,
  onCancel,
}: AdvisorWelcomeProps) {
  return (
    <section className={styles.welcome} aria-labelledby="advisor-welcome-title">
      <div className={styles.welcomeIntro}>
        <p className={styles.eyebrow}>AI EMLAK DANIŞMANI</p>
        <h1 id="advisor-welcome-title">
          Size uygun ilanı birlikte netleştirelim.
        </h1>
        <p className={styles.welcomeExplanation}>
          İhtiyacınızı anlatın; danışman kriterleri düzenler, ilanları
          gerekçeleriyle sıralar ve karar alanını sade tutar.
        </p>
      </div>

      <AdvisorComposer
        query={query}
        status={status}
        onQueryChange={onQueryChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />

      <div className={styles.examples} aria-label="Örnek aramalar">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className={styles.exampleAction}
            data-advisor-example
            onClick={() => onSubmit(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </section>
  )
}
