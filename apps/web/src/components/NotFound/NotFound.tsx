// 404 sahnesi: "4 🌍 4" — ortadaki sıfırın yerinde dönen bir küre.
//
// İki parça: `NotFoundView` saf görünüm (test edilebilir, router bilmez),
// `NotFound` ise root route'un `notFoundComponent`'ine takılan sarmalayıcı —
// geri dönüşü router geçmişinden çözer.
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useRouter } from '@tanstack/react-router'
import { GlassButton } from '@repo/ui'
import { Globe } from './Globe'
import styles from './NotFound.module.css'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
}

const globeVariants: Variants = {
  hidden: { scale: 0.85, opacity: 0, y: 10 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: 'easeOut' },
  },
  floating: {
    y: [-4, 4],
    transition: {
      duration: 5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}

const ArrowLeftIcon = (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
)

export interface NotFoundViewProps {
  title?: string
  description?: string
  backText?: string
  onBack: () => void
}

export function NotFoundView({
  title = 'Aradığınız sayfa uzayda kaybolmuş',
  description = 'Bu adres taşınmış ya da hiç var olmamış olabilir. Sizi güvenli bir yere geri götürelim.',
  backText = 'Geri dön',
  onBack,
}: NotFoundViewProps) {
  const reduced = useReducedMotion()

  return (
    <main id="main-content" className={styles.stage}>
      <motion.section
        className={styles.scene}
        initial={reduced ? false : 'hidden'}
        animate="visible"
        variants={fadeUp}
        aria-labelledby="not-found-title"
      >
        {/* "404" ekran okuyucuya tek parça okunur; görsel rakamlar dekoratif */}
        <p className={styles.srOnly}>Hata kodu 404 — sayfa bulunamadı.</p>

        <div className={styles.digits} aria-hidden="true">
          <motion.span className={styles.digit} variants={fadeUp}>
            4
          </motion.span>
          <motion.div
            className={styles.globeSlot}
            variants={globeVariants}
            animate={reduced ? 'visible' : ['visible', 'floating']}
          >
            <Globe />
            <div className={styles.globeShade} />
          </motion.div>
          <motion.span className={styles.digit} variants={fadeUp}>
            4
          </motion.span>
        </div>

        <motion.h1 id="not-found-title" className={styles.title} variants={fadeUp}>
          {title}
        </motion.h1>

        <motion.p className={styles.description} variants={fadeUp}>
          {description}
        </motion.p>

        <motion.div variants={fadeUp}>
          <GlassButton onClick={onBack}>
            {ArrowLeftIcon}
            {backText}
          </GlassButton>
        </motion.div>
      </motion.section>
    </main>
  )
}

export function NotFound() {
  const router = useRouter()

  const goBack = () => {
    // Doğrudan 404 URL'iyle gelindiyse geçmiş boştur — o zaman ana sayfa.
    if (router.history.canGoBack()) router.history.back()
    else void router.navigate({ to: '/' })
  }

  return <NotFoundView onBack={goBack} />
}
