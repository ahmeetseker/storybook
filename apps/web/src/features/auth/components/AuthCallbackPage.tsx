import styles from './AuthStatusPage.module.css'

export interface AuthCallbackPageProps {
  durum: 'pending' | 'error'
  baslik: string
  hataMesaji?: string
}

/**
 * Dış sağlayıcıdan dönüşü karşılayan ekran. Hata durumunda kullanıcı burada
 * takılı kalmaz, çağıran sayfa ilgili durum rotasına yönlendirir.
 *
 * Canlı bölge (`role="status"` / `role="alert"`) HER ZAMAN açıklama
 * paragrafındadır, `<main>`'de değil: açık `role` örtük olanı ezer ve
 * `<main role="status">` landmark'ı tamamen yok eder. `AuthStatusPage` de
 * aynı sözleşmeyi uygular.
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
    <main id="main-content" className={styles.page} data-tone="info">
      <span className={styles.mark} aria-hidden="true">
        i
      </span>
      <h1 className={styles.title}>{baslik}</h1>
      <p className={styles.description} role="status">
        Bu işlem birkaç saniye sürebilir.
      </p>
    </main>
  )
}
