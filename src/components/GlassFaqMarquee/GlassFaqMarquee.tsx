// GlassFaqMarquee — SSS kartlarının yatay raflar halinde kesintisiz aktığı
// vitrin bölümü. Satırlar farklı hız ve yönde döner; kartlar okunabilir
// kalsın diye hareket imleçte, odakta ve görünür düğmeyle durur.
//
// Döngü sözleşmesi GlassMarquee'den devralındı (bkz. oradaki üç karar):
//   1. Kesintisiz döngü için her satır iki kez basılır; kopya `aria-hidden` +
//      `inert` — ekran okuyucu aynı soruyu iki kez okumaz.
//   2. Hız içerik uzunluğundan bağımsızdır: grup genişliği ölçülür,
//      süre = genişlik / hız (saniyede piksel).
//   3. Hareket duraklatılabilir (WCAG 2.2.2): görünür duraklat düğmesi +
//      hover ve focus-within'de otomatik duraklama. `prefers-reduced-motion`
//      altında satırlar hiç dönmez, yatay kaydırılabilir raflara iner.
import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import styles from './GlassFaqMarquee.module.css'

export interface GlassFaqMarqueeItem {
  id: string
  /** Kart başlığı — soru cümlesi */
  question: ReactNode
  /** Kart gövdesi — cevap metni */
  answer: ReactNode
}

export interface GlassFaqMarqueeRow {
  id: string
  items: GlassFaqMarqueeItem[]
  /** Saniyedeki piksel — içerik uzunluğundan bağımsız sabit hız */
  speed?: number
  /** `start`: sağdan sola (varsayılan) · `end`: soldan sağa */
  direction?: 'start' | 'end'
}

export interface GlassFaqMarqueeProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Bölüm başlığı — verilirse `<h2>` basılır ve bölge onunla adlandırılır */
  title?: ReactNode
  /** Başlık altı açıklama satırı */
  subtitle?: ReactNode
  rows: GlassFaqMarqueeRow[]
  /** Başlık verilmediğinde bölgenin erişilebilir adı */
  label?: string
}

const PauseIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden>
    <rect x="3" y="2.5" width="3.5" height="11" rx="1" />
    <rect x="9.5" y="2.5" width="3.5" height="11" rx="1" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden>
    <path d="M4 2.8 13 8l-9 5.2V2.8Z" />
  </svg>
)

function FaqCards({ items, duplicate }: { items: GlassFaqMarqueeItem[]; duplicate?: boolean }) {
  return (
    <>
      {items.map((item) => (
        <li key={duplicate ? `${item.id}-kopya` : item.id} className={styles.card}>
          <h3 className={styles.question}>{item.question}</h3>
          <p className={styles.answer}>{item.answer}</p>
        </li>
      ))}
    </>
  )
}

function FaqRow({ row }: { row: GlassFaqMarqueeRow }) {
  const { items, speed = 40, direction = 'start' } = row
  const groupRef = useRef<HTMLUListElement>(null)
  const [duration, setDuration] = useState<number>()

  // Hız sabit kalsın diye süre ölçülen genişlikten türetilir; içerik veya kap
  // değişince (yazı tipi geç yüklenir, ekran döner) yeniden hesaplanır.
  useEffect(() => {
    const node = groupRef.current
    if (!node) return
    const update = () => {
      const width = node.getBoundingClientRect().width
      setDuration(width > 0 ? width / speed : undefined)
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [speed, items])

  return (
    <div
      className={styles.row}
      data-direction={direction}
      style={
        duration === undefined
          ? undefined
          : { ['--faq-duration' as string]: `${duration}s` }
      }
    >
      <div className={styles.track}>
        <ul className={styles.group} ref={groupRef}>
          <FaqCards items={items} />
        </ul>
        <ul className={styles.group} aria-hidden inert>
          <FaqCards items={items} duplicate />
        </ul>
      </div>
    </div>
  )
}

export function GlassFaqMarquee({
  title,
  subtitle,
  rows,
  label,
  className,
  ...rest
}: GlassFaqMarqueeProps) {
  const headingId = useId()
  const [paused, setPaused] = useState(false)

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <section
      className={rootClass}
      data-paused={paused ? 'true' : undefined}
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : label}
      {...rest}
    >
      {title ? (
        <header className={styles.header}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>
      ) : null}

      <div className={styles.rows}>
        {rows.map((row) => (
          <FaqRow key={row.id} row={row} />
        ))}
      </div>

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? 'Şeridi sürdür' : 'Şeridi duraklat'}
        title={paused ? 'Şeridi sürdür' : 'Şeridi duraklat'}
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
      </button>
    </section>
  )
}
