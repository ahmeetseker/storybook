import type { ListingDetail, VerificationRow } from '../domain/listing-detail-types'
import { formatDate } from '../format'
import styles from './ListingLedger.module.css'
import questionStyles from './ListingQuestions.module.css'

export interface ListingLedgerProps {
  detail: ListingDetail
}

const DOT_CLASS: Record<VerificationRow['state'], string> = {
  positive: questionStyles.dotOk,
  negative: questionStyles.dotWarn,
  unknown: questionStyles.dotNone,
}

/**
 * Durumun görünür karşılığı. Nokta rengi tek başına bilgi taşımaz (WCAG 1.4.1);
 * her satır durumunu kelimeyle de yazar. "Doğrulandı" bilinçli olarak
 * kullanılmaz: olumlu satırların hepsi bir doğrulama değildir (ör. platform
 * moderasyonu).
 */
const STATE_TEXT: Record<VerificationRow['state'], string> = {
  positive: 'Olumlu',
  negative: 'Olumsuz',
  unknown: 'Eksik',
}

/**
 * Doğrulama defteri — sorulardan SONRA gelir.
 *
 * Defter bir soru değildir; sayfanın zeminidir. Her satır neyi, hangi
 * kaynaktan, ne zaman doğruladığımızı söyler ve kapsam notu varsa onu da
 * taşır: bir kontrolün olumlu olması diğerlerini olumlu yapmaz.
 */
export function ListingLedger({ detail }: ListingLedgerProps) {
  return (
    <section className={styles.ledger} aria-labelledby="defter-baslik">
      <h2 id="defter-baslik" className={styles.title}>
        Neyi, ne zaman doğruladık
      </h2>
      <ul className={styles.rows}>
        {detail.verification.map((row) => (
          <li key={row.id} className={questionStyles.check}>
            <span className={`${questionStyles.dot} ${DOT_CLASS[row.state]}`} aria-hidden="true" />
            <span>
              <span className={styles.state}>{STATE_TEXT[row.state]}</span>{' '}
              <strong>{row.title}</strong>
              {row.scopeNote ? <> {row.scopeNote}</> : null}{' '}
              <span className={styles.source}>
                {row.source}
                {row.retrievedAt ? ` · ${formatDate(row.retrievedAt)}` : ''}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export interface ListingTallyProps {
  rows: VerificationRow[]
}

/**
 * Dosyanın durumu — üç sayı, kutu içinde değil ızgarada.
 *
 * Sayılar doğrulama vektöründen okunur; "eksik" bizim sorgulamadığımız
 * anlamına gelir, ilanın olumsuzluğu anlamına değil.
 */
export function ListingTally({ rows }: ListingTallyProps) {
  const positive = rows.filter((row) => row.state === 'positive').length
  const negative = rows.filter((row) => row.state === 'negative').length
  const unknown = rows.filter((row) => row.state === 'unknown').length

  return (
    <>
      <dl className={styles.tally}>
        <div>
          <dt>Olumlu</dt>
          <dd className={styles.ok}>{positive}</dd>
        </div>
        <div>
          <dt>Olumsuz</dt>
          <dd className={styles.warn}>{negative}</dd>
        </div>
        <div>
          <dt>Eksik</dt>
          <dd className={styles.muted}>{unknown}</dd>
        </div>
      </dl>
      <p className={questionStyles.note}>
        Eksik = bizim sorgulamadığımız kontrol, ilanın olumsuzluğu değil. Bir kontrolün
        olumlu olması diğerlerini olumlu yapmaz.
      </p>
    </>
  )
}
