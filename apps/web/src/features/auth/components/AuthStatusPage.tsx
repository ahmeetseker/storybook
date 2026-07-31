import { Link } from '@tanstack/react-router'
import styles from './AuthStatusPage.module.css'
import type { AuthIkincilBaglanti } from './AuthFormPage'

export type AuthStatusTone = 'info' | 'success' | 'error'

export interface AuthStatusPageProps {
  tone: AuthStatusTone
  baslik: string
  aciklama: string
  birincilEylem?: { etiket: string; hedef: string }
  ikincilBaglanti?: AuthIkincilBaglanti
}

const TON_ISARETI: Record<AuthStatusTone, string> = {
  info: 'i',
  success: '✓',
  error: '!',
}

/**
 * Auth akışındaki tüm durum sayfalarının tek kaynağı. Sekiz rota bu
 * bileşenin farklı içerikleridir; her durum için ayrı sayfa dosyası yazılmaz.
 */
export function AuthStatusPage({
  tone,
  baslik,
  aciklama,
  birincilEylem,
  ikincilBaglanti,
}: AuthStatusPageProps) {
  return (
    <main
      id="main-content"
      className={styles.page}
      data-tone={tone}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <span className={styles.mark} aria-hidden="true">
        {TON_ISARETI[tone]}
      </span>
      <h1 className={styles.title}>{baslik}</h1>
      <p className={styles.description}>{aciklama}</p>

      {birincilEylem || ikincilBaglanti ? (
        <div className={styles.actions}>
          {birincilEylem ? (
            <Link to={birincilEylem.hedef} className={styles.primaryLink}>
              {birincilEylem.etiket}
            </Link>
          ) : null}
          {ikincilBaglanti ? (
            <Link to={ikincilBaglanti.hedef} className={styles.link}>
              {ikincilBaglanti.etiket}
            </Link>
          ) : null}
        </div>
      ) : null}
    </main>
  )
}
