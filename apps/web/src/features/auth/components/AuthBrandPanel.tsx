import { AuthGrainGradient } from './AuthGrainGradient'
import styles from './AuthBrandPanel.module.css'

/**
 * Auth kabuğunun sağ kolonu — DEKORATİF marka paneli.
 *
 * `aria-hidden`: panelin taşıdığı hiçbir bilgi forma erişim için gerekli
 * değildir ve ekran okuyucu kullanıcısını giriş alanına ulaşmadan önce üç
 * paragraf dinlemeye zorlamak, görsel kullanıcının bir bakışta atladığı
 * şeyi ona okutmak olurdu. Aynı sebeple içindeki metinler `h*` DEĞİL:
 * gizlenmiş bir başlık ağacı, sayfanın başlık sırasını bozmasa da bakım
 * sırasında yanlışlıkla görünür hâle getirilirse `h1`'i ikiye çıkarır.
 *
 * Dar ekranda tamamen kaldırılır (`display: none`, bkz. module.css) —
 * mobilde formun üstüne yığmak, kullanıcıyı kaydırmadan giriş alanına
 * ulaşamaz hâle getirirdi.
 */
export function AuthBrandPanel() {
  return (
    <div className={styles.panel} aria-hidden="true">
      {/* Animasyonlu grain-gradient zemin (WebGL). Kurulamazsa hiç DOM
          üretmez ve `.panel`in CSS degradesi görünür kalır. */}
      <AuthGrainGradient className={styles.zemin} />

      {/* Perde: metnin altındaki bandı koyulaştırır. Shader'ın parlak bandı
          panelde gezindiği için `--lg-on-scrim` beyazının kontrast sözleşmesi
          ancak sabit bir koyu katman üstünde geçerli olur. */}
      <span className={styles.perde} />

      <div className={styles.icerik}>
        <p className={styles.slogan}>
          Doğrulanmış ofisler,
          <br />
          gerçek ilanlar
        </p>

        {/* Destek metni ve rozetler TEK grup: ayrı flex çocukları olsalardı
            `space-between` destek metnini panelin ortasına, yani perdenin
            koruduğu bandın dışına bırakırdı. */}
        <div className={styles.taban}>
          <p className={styles.destek}>
            arsam.net’te ilan yayınlayan her emlak ofisinin taşınmaz ticareti yetki belgesi ve
            EİDS yetki doğrulaması kontrol edilir.
          </p>

          <ul className={styles.rozetler}>
            <li className={styles.rozet}>EİDS yetki doğrulaması</li>
            <li className={styles.rozet}>Yetki belgesi kontrolü</li>
            <li className={styles.rozet}>Sorumlu danışman kaydı</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
