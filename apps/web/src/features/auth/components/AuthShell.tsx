import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import styles from './AuthShell.module.css'

/**
 * Auth sayfalarının kabuğu. `MarketplaceShell` yerine kullanılır: oturumu
 * olmayan kullanıcıya favoriler/karşılaştırma/mesajlar gezinmesi sunmak
 * anlamsızdır ve cam yüzey bütçesini harcar.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.masthead}>
        <Link to="/" className={styles.brand}>
          arsam.net
        </Link>
      </header>

      <div className={styles.content}>
        <div className={styles.inner}>{children}</div>
      </div>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLink}>
          Ana sayfa
        </Link>
        <Link to="/blog" className={styles.footerLink}>
          Yardım
        </Link>
      </footer>
    </div>
  )
}
