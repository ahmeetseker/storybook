// Tonlu vurgu kartı — noktalı gradyan zemin, yer imi (bookmark) rozetli köşe,
// büyük metrik ve kapsül aksiyon. İçerik katmanı: cam DEĞİL, tint'ten türeyen
// düz gradyan yüzey (bkz. rules.md §1). Doğrulanmış ofis vitrini gibi "öne
// çıkan kurum/özet" anlatıları için; liste satırı gereken yerde GlassAgencyCard.
import {
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import styles from './GlassHighlightCard.module.css'

export interface GlassHighlightCardMetric {
  /** Kısa metrik adı, ör. "Aktif İlan", "Uzmanlık" */
  label: string
  /** Hazır biçimli değer, ör. "48", "12 bölge" — sayı formatı çağıranındır */
  value: string
}

export interface GlassHighlightCardProps
  extends Omit<
    HTMLAttributes<HTMLElement>,
    // motion.section'ın kendi pan/animasyon handler imzalarıyla çakışan DOM handler'ları
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
  > {
  /** Kart başlığı — section'ın accessible name'i de buradan türer */
  title: string
  /** Başlık altı kısa açıklama; verilmezse render edilmez */
  description?: string
  /** En çok 2 metrik önerilir; ilki büyük puntoyla vurgulanır */
  metrics?: GlassHighlightCardMetric[]
  /** Kapsül aksiyonun etiketi; verilmezse aksiyon hiç render edilmez */
  actionLabel?: string
  /** Aksiyon tıklaması — `actionHref` yoksa `<button>` olarak çizilir */
  onAction?: () => void
  /** Verilirse aksiyon `<a>` olur (ör. `tel:` bağlantısı); `onAction` ile birlikte kullanılabilir */
  actionHref?: string
  /** Yer imi rozetindeki ikon; verilmezse doğrulama tiki çizilir */
  icon?: ReactNode
  /** Rozetin erişilebilir adı; verilmezse rozet dekoratiftir (aria-hidden) */
  iconLabel?: string
  /** Kartın baz rengi (CSS renk değeri); gradyan ve rozet rengi bundan türer. Default: `var(--lg-accent)` */
  tint?: string
  /** Verilirse başlık, tüm kartı kaplayan (stretched) bir link olur; aksiyon üstte bağımsız kalır */
  href?: string
  /** Sade sol tıkta SPA gezinmesi — modifier'lı/orta tık tarayıcıya bırakılır (GlassBreadcrumb sözleşmesi) */
  onNavigate?: () => void
}

/**
 * Sade sol tıkta SPA gezinmesine devret; modifier'lı ve orta tıkta tarayıcıya
 * bırak (yeni sekme davranışı korunur) — GlassSiteHeader/GlassBreadcrumb ile
 * aynı sözleşme.
 */
function linkClick(onNavigate?: () => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate) return
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onNavigate()
  }
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

const BadgeCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" className={styles.badgeIcon}>
    <path
      d="M6.5 12.2l3.6 3.6L17.5 8"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * Tonlu vurgu kartı. Görünüm ekseni yalnız `tint`tir — hover/focus prop olmaz,
 * giriş animasyonu viewport'a girişte bir kez oynar ve `prefers-reduced-motion`
 * açıkken tamamen kapanır (kart animasyonsuz, son halinde durur).
 */
export function GlassHighlightCard({
  title,
  description,
  metrics,
  actionLabel,
  onAction,
  actionHref,
  icon,
  iconLabel,
  tint,
  href,
  onNavigate,
  className,
  style,
  ...rest
}: GlassHighlightCardProps) {
  const titleId = useId()
  const reducedMotion = useReducedMotion()
  const hasMetrics = Boolean(metrics && metrics.length > 0)
  const hasAction = Boolean(actionLabel && (onAction || actionHref))

  const actionContent = actionHref ? (
    <motion.a
      variants={itemVariants}
      href={actionHref}
      onClick={onAction}
      className={styles.action}
    >
      {actionLabel}
    </motion.a>
  ) : (
    <motion.button
      variants={itemVariants}
      type="button"
      onClick={onAction}
      className={styles.action}
    >
      {actionLabel}
    </motion.button>
  )

  return (
    <motion.section
      aria-labelledby={titleId}
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={tint ? ({ ...style, '--hl-tint': tint } as CSSProperties) : style}
      variants={cardVariants}
      initial={reducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...rest}
    >
      <span
        className={styles.bookmark}
        {...(iconLabel ? { role: 'img', 'aria-label': iconLabel } : { 'aria-hidden': true })}
      >
        <span className={styles.bookmarkIcon}>{icon ?? <BadgeCheckIcon />}</span>
      </span>

      <div className={styles.body}>
        <div className={styles.intro}>
          <motion.h3 variants={itemVariants} id={titleId} className={styles.title}>
            {href ? (
              <a href={href} onClick={linkClick(onNavigate)} className={styles.titleLink}>
                {title}
              </a>
            ) : (
              title
            )}
          </motion.h3>
          {description ? (
            <motion.p variants={itemVariants} className={styles.description}>
              {description}
            </motion.p>
          ) : null}
        </div>

        <motion.div variants={itemVariants} className={styles.divider} aria-hidden />

        <div className={styles.footer}>
          {hasMetrics ? (
            <motion.dl variants={itemVariants} className={styles.metrics}>
              {/* DOM sırası dt→dd (HTML sözleşmesi); görsel sıra CSS ile ters çevrilir. */}
              {metrics!.map((metric, i) => (
                <div className={styles.metric} key={`${metric.label}-${i}`}>
                  <dt className={styles.metricLabel}>{metric.label}</dt>
                  <dd className={styles.metricValue}>{metric.value}</dd>
                </div>
              ))}
            </motion.dl>
          ) : null}
          {hasAction ? actionContent : null}
        </div>
      </div>
    </motion.section>
  )
}
