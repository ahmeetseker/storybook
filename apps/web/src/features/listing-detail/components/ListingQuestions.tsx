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
 * Kontrolün yeri: chevron sorunun SOLUNDA durur ve kapalıyken 90° yatar
 * (Finder'ın açılır üçgeni). Geniş yerleşimde satırın en sağındaki bir ikon
 * etkilediği başlıktan yüzlerce piksel uzağa düşer; kontrol etkilediği şeyin
 * yanında durmadığında eşleme zayıflar (bkz. rules.md §2). Açılan gövde de
 * chevron kolonu kadar içeri alınır, böylece sorunun metniyle aynı eksene
 * oturur ve kime ait olduğu hizadan okunur.
 *
 * Erişilebilirlik: kapalı gövde DOM'da kalır — `display: none` yerine
 * `grid-template-rows: 0fr` ile kapanır, `inert` ile de odak sırasından ve
 * erişilebilirlik ağacından çıkar. Böylece açılış her an kesilip geri
 * çevrilebilir; `aria-expanded` ve `aria-controls` bağları her soru için
 * kurulur.
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
          <div key={q.id} className={styles.qa} data-open={expanded || undefined}>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={expanded}
              aria-controls={q.body ? bodyId : undefined}
              disabled={!q.body}
              onClick={() => setOpen((current) => ({ ...current, [q.id]: !current[q.id] }))}
            >
              {q.body ? (
                <svg
                  className={styles.chevron}
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M2.5 4.5 6 8l3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
              <span className={styles.copy}>
                <span className={styles.question}>{q.question}</span>
                <span
                  className={q.unanswered ? `${styles.answer} ${styles.warn}` : styles.answer}
                >
                  {q.answer}
                </span>
              </span>
            </button>
            {q.body ? (
              <div className={styles.body} id={bodyId}>
                <div className={styles.bodyInner} inert={!expanded}>
                  <div className={styles.bodyPad}>{q.body}</div>
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
