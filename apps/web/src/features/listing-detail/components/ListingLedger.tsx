import type { ListingDetail, VerificationRow } from '../domain/listing-detail-types'
import { formatDate } from '../format'
import workspaceStyles from '../ListingDetailWorkspace.module.css'
import { EvidenceState } from './EvidenceState'
import { VERIFICATION_SECTION_ID } from './ListingIntro'
import styles from './ListingLedger.module.css'
import questionStyles from './ListingQuestions.module.css'

export interface ListingLedgerProps {
  detail: ListingDetail
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
 *
 * Satırlar bandın ortak kanıt ızgarasındadır (`.evidenceRow`) — Belgeler
 * bölümüyle aynı üç sütun. Daha önce satır düz bir cümleydi ve kaynak künyesi
 * cümlenin içinde kayboluyordu; artık kendi sütununda, sağa hizalı durur.
 */
export function ListingLedger({ detail }: ListingLedgerProps) {
  return (
    // Karar kartındaki "Doğrulama vektörünün tamamı" bağlantısının hedefi:
    // vektörün tamamı burada durur, kartta yalnız özeti kalır.
    <section
      id={VERIFICATION_SECTION_ID}
      className={styles.ledger}
      aria-labelledby="defter-baslik"
    >
      <h2 id="defter-baslik" className={styles.title}>
        Neyi, ne zaman doğruladık
      </h2>
      <ul className={workspaceStyles.evidenceGrid}>
        {detail.verification.map((row) => {
          const state = (
            <EvidenceState tone={row.state} className={workspaceStyles.evidenceState}>
              {STATE_TEXT[row.state]}
            </EvidenceState>
          )

          return (
            <li key={row.id} className={workspaceStyles.evidenceRow} data-state={row.state}>
              {/* Kimlik sütunu: satırlar arasında değişen tek şey budur. */}
              <p className={workspaceStyles.evidenceLabel}>{row.title}</p>
              {/* Kapsam notu yoksa sarmalayıcı da yoktur: tek çocuklu bir
                  kutu, durum kelimesini iki ayrı düğümde tekrar ederdi. */}
              {row.scopeNote ? (
                <div className={workspaceStyles.evidenceValue}>
                  {state}
                  <p className={workspaceStyles.evidenceScope}>{row.scopeNote}</p>
                </div>
              ) : (
                state
              )}
              <p className={workspaceStyles.evidenceSource}>
                {row.source}
                {row.retrievedAt ? (
                  <>
                    <br />
                    {formatDate(row.retrievedAt)}
                  </>
                ) : null}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export interface ListingTallyProps {
  rows: VerificationRow[]
}

/**
 * Dosyanın durumu — bölümlü ölçer, üç sayı, kutu içinde değil ızgarada.
 *
 * Ölçer sayıların GÖRSEL karşılığıdır, ikinci bir bilgi kanalı değil: her
 * kontrol bir segmenttir, rengi durumunu söyler. Bilgiyi altındaki üç sayı
 * taşır, bu yüzden ölçer `aria-hidden`'dır — ekran okuyucuya aynı şey iki kez
 * okunmaz.
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
      {rows.length > 0 ? (
        <ul className={styles.meter} aria-hidden="true">
          {rows.map((row) => (
            <li key={row.id} data-state={row.state} />
          ))}
        </ul>
      ) : null}
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
