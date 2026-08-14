import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { AuthBrandPanel } from './AuthBrandPanel'
import styles from './AuthShell.module.css'

/**
 * Auth sayfalarının kabuğu. `MarketplaceShell` yerine kullanılır: oturumu
 * olmayan kullanıcıya favoriler/karşılaştırma/mesajlar gezinmesi sunmak
 * anlamsızdır ve cam yüzey bütçesini harcar.
 *
 * Geniş ekranda iki kolon: solda dekoratif marka paneli (`AuthBrandPanel`),
 * sağda form sütunu. Görsel sıra CSS `order` ile kurulur; buradaki kaynak
 * sırası form → panel olarak kalır ki klavye ve ekran okuyucu önce forma
 * varsın. Bölünmüş düzen KABUKTA durur, sayfalarda değil —
 * `/giris`, `/kayit`, `/kayit/kurumsal`, parola sıfırlama ve davet
 * akışlarının tamamı aynı kabuğu tükettiği için düzen tek yerde tanımlanır
 * ve sayfalar yalnız kendi formlarını bilir.
 *
 * Marka, üst şerit ve alt bağlantılar form sütununun İÇİNDEDİR: hepsi aynı
 * ölçüyü paylaşır, böylece marka/başlık/alan/footer tek bir sol kenara
 * hizalanır. Kabuk `main` üretmez — o sayfanın sorumluluğudur.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {/* `MarketplaceShell` ile parite: her iki kabukta da main'e atlama
          bağlantısı bulunur. Auth sayfalarında main'in önünde yalnız iki
          bağlantı var ama klavye kullanıcısı kabuk değiştiğinde deseni
          kaybetmemeli. `.skip-link` global sınıfı `styles/app.css`'te. */}
      <a className="skip-link" href="#main-content">
        İçeriğe atla
      </a>

      <div className={styles.duzen}>
        <div className={styles.formKolonu}>
          <div className={styles.formIc}>
            <header className={styles.masthead}>
              <Link to="/" className={styles.brand}>
                arsam.net
              </Link>
            </header>

            <div className={styles.content}>{children}</div>

            <footer className={styles.footer}>
              <Link to="/" className={styles.footerLink}>
                Ana sayfa
              </Link>
            </footer>
          </div>
        </div>

        <AuthBrandPanel />
      </div>
    </div>
  )
}
