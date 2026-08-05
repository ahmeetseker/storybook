// GlassMarquee — sayfanın en altında, footer'ın hemen üstünde dönen tam
// genişlikte şerit. İçindekiler gerçek bağlantıdır (ilanlar, kampanyalar):
// bant dekor değil, hareket eden bir bağlantı rafıdır.
//
// Üç karar bu component'in şeklini belirledi:
//   1. Döngü kesintisiz olsun diye liste iki kez basılır; ikinci kopya
//      `aria-hidden` + `inert` — ekran okuyucu aynı ilanı iki kez okumaz,
//      klavye kopyaya takılmaz.
//   2. Hız içerik uzunluğundan bağımsızdır: bir grubun genişliği ölçülür,
//      süre = genişlik / hız. Uzun liste hızlanmaz, kısa liste yavaşlamaz.
//   3. Hareket duraklatılabilir (WCAG 2.2.2): görünür duraklat düğmesi +
//      hover ve focus-within'de otomatik duraklama. `prefers-reduced-motion`
//      altında hareket hiç başlamaz, şerit yatay kaydırılır.
import {
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import styles from './GlassMarquee.module.css'

export interface GlassMarqueeItem {
  id: string
  /** Şeritte görünen metin — ilan başlığı gibi tek satırlık ifade */
  label: ReactNode
  /** İkincil metin (fiyat, konum) — etiketten sonra sönük renkte */
  meta?: ReactNode
  /** Verilirse öğe gerçek bağlantı olur; verilmezse düz metin kalır */
  href?: string
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>['onClick']
}

export interface GlassMarqueeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: GlassMarqueeItem[]
  /** Şeridin erişilebilir adı — "Öne çıkan ilanlar" gibi */
  label: string
  /** Saniyedeki piksel — içerik uzunluğundan bağımsız sabit hız */
  speed?: number
  /** `start`: sağdan sola (varsayılan) · `end`: soldan sağa */
  direction?: 'start' | 'end'
  /** `accent`: marka amber bandı · `ink`: koyu mürekkep bandı */
  variant?: 'accent' | 'ink'
  size?: 'sm' | 'md'
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

function MarqueeItem({ item, duplicate }: { item: GlassMarqueeItem; duplicate?: boolean }) {
  const content = (
    <>
      <span className={styles.label}>{item.label}</span>
      {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
    </>
  )

  return (
    <li className={styles.item}>
      {item.href ? (
        <a
          className={styles.link}
          href={item.href}
          onClick={item.onClick}
          // Kopyadaki bağlantılar sekme sırasına girmez; `inert`'i tanımayan
          // tarayıcıda da odak kopyaya düşmesin diye ayrıca işaretlenir.
          tabIndex={duplicate ? -1 : undefined}
        >
          {content}
        </a>
      ) : (
        <span className={styles.link}>{content}</span>
      )}
    </li>
  )
}

export function GlassMarquee({
  items,
  label,
  speed = 60,
  direction = 'start',
  variant = 'accent',
  size = 'md',
  className,
  style,
  ...rest
}: GlassMarqueeProps) {
  const groupRef = useRef<HTMLUListElement>(null)
  const [duration, setDuration] = useState<number>()
  const [paused, setPaused] = useState(false)

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

  const rootClass = [styles.root, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rootClass}
      data-paused={paused ? 'true' : undefined}
      data-direction={direction}
      style={
        duration === undefined
          ? style
          : { ['--marquee-duration' as string]: `${duration}s`, ...style }
      }
      {...rest}
    >
      <div className={styles.viewport}>
        <div className={styles.track}>
          <ul className={styles.group} aria-label={label} ref={groupRef}>
            {items.map((item) => (
              <MarqueeItem key={item.id} item={item} />
            ))}
          </ul>
          <ul className={styles.group} aria-hidden inert>
            {items.map((item) => (
              <MarqueeItem key={`${item.id}-kopya`} item={item} duplicate />
            ))}
          </ul>
        </div>
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
    </div>
  )
}
