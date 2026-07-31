import styles from './AuthStatusPage.module.css'

export interface AuthCallbackPageProps {
  durum: 'pending' | 'error'
  baslik: string
  hataMesaji?: string
}

/**
 * Dış sağlayıcıdan dönüşü karşılayan ekran. Bekleme durumu `role="status"`
 * ile duyurulur; hata durumunda kullanıcı burada takılı kalmaz, çağıran
 * sayfa ilgili durum rotasına yönlendirir.
 */
export function AuthCallbackPage({ durum, baslik, hataMesaji }: AuthCallbackPageProps) {
  if (durum === 'error') {
    return (
      <main id="main-content" className={styles.page} data-tone="error">
        <span className={styles.mark} aria-hidden="true">
          !
        </span>
        <h1 className={styles.title}>{baslik}</h1>
        <p className={styles.description} role="alert">
          {hataMesaji}
        </p>
      </main>
    )
  }

  return (
    <main id="main-content" className={styles.page} data-tone="info" role="status" aria-live="polite">
      <span className={styles.mark} aria-hidden="true">
        i
      </span>
      <h1 className={styles.title}>{baslik}</h1>
      <p className={styles.description}>Bu işlem birkaç saniye sürebilir.</p>
    </main>
  )
}
