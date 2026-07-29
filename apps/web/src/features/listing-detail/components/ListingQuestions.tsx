import { useId, useState, type ReactNode } from 'react'

import styles from './ListingQuestions.module.css'

export interface ListingQuestion {
  id: string
  /** Sorunun kendisi — alıcının kelimeleriyle */
  question: string
  /**
   * Kapalıyken de görünen cevap. Açmak cevabı değil, DAYANAĞINI getirir;
   * bu yüzden burası hiçbir zaman boş bırakılmaz.
   */
  answer: ReactNode
  /**
   * Cevaplanamayan soru. Uydurulmuş bir cevap yerine neden cevaplanamadığı
   * yazılır ve satır uyarı tonuna geçer.
   */
  unanswered?: boolean
  /** Açılınca gelen dayanak: kanıt satırları, harita, eksik listesi… */
  body?: ReactNode
  /** İlk ekranda açık gelen sorular — sayfanın taşıdığı iki ana soru */
  defaultOpen?: boolean
}

export interface ListingQuestionsProps {
  questions: ListingQuestion[]
}

/**
 * Soru omurgası — sayfanın içeriğini taşıyan yapı.
 *
 * Bölüm başlıkları ("İmar", "Piyasa") yerine alıcının gerçekten sorduğu
 * cümleler kullanılır. Her satır kapalıyken bile cevaplıdır: açmak cevabı
 * değil dayanağını açar. Bu, kanıt defterini sayfanın sonuna sürmeden
 * okunur kılan sözleşmedir (bkz. rules.md §2).
 *
 * Erişilebilirlik: kapalı gövde DOM'da kalır (`hidden` ile gizlenir), böylece
 * sayfa içi arama ve ekran okuyucu sırası bozulmaz; `aria-expanded` ve
 * `aria-controls` bağları her soru için kurulur.
 */
export function ListingQuestions({ questions }: ListingQuestionsProps) {
  const baseId = useId()
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, Boolean(q.defaultOpen)])),
  )

  return (
    <div className={styles.spine}>
      {questions.map((q) => {
        const bodyId = `${baseId}-${q.id}`
        const expanded = Boolean(open[q.id]) && Boolean(q.body)

        return (
          <div key={q.id} className={styles.qa}>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={expanded}
              aria-controls={q.body ? bodyId : undefined}
              disabled={!q.body}
              onClick={() => setOpen((current) => ({ ...current, [q.id]: !current[q.id] }))}
            >
              <span className={styles.copy}>
                <span className={styles.question}>{q.question}</span>
                <span
                  className={q.unanswered ? `${styles.answer} ${styles.warn}` : styles.answer}
                >
                  {q.answer}
                </span>
              </span>
              {q.body ? (
                <span className={styles.chevron} aria-hidden="true">
                  ▾
                </span>
              ) : null}
            </button>
            {q.body ? (
              <div className={styles.body} id={bodyId} hidden={!expanded}>
                {q.body}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
