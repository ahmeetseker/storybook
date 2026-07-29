import type { ComponentPropsWithoutRef } from 'react'
import styles from './PageContainer.module.css'

/** İçerik genişliği kademesi — sayfanın rolüne göre seçilir. */
export type PageContainerSize = 'narrow' | 'base' | 'wide'

export interface PageContainerProps extends ComponentPropsWithoutRef<'main'> {
  /**
   * Genişlik kademesi:
   * - `narrow` (72rem) — okuma ve tek kolonlu karar akışları
   * - `base` (88rem) — liste, dizin ve hesap ekranları (varsayılan)
   * - `wide` (104rem) — panelli çalışma masaları, harita
   */
  size?: PageContainerSize
  /**
   * Yüzen kabuk (header + dock) için dikey pay ayrılsın mı. Kabuğu kendisi
   * gizleyen odaklı akışlarda (ör. ilan verme sihirbazı) `false` verilir.
   */
  shellInsets?: boolean
}

const sizeClass: Record<PageContainerSize, string | undefined> = {
  narrow: styles.narrow,
  base: undefined,
  wide: styles.wide,
}

/**
 * Sitenin sayfa container'ı — genişlik kademesi, kenar boşluğu ve yüzen
 * kabuk paylarının tek kaynağı. Aynı zamanda sayfanın container-query kabıdır
 * (`page`), böylece sayfa içi yerleşim viewport'a değil kendi ölçüsüne yanıt
 * verir.
 *
 * Varsayılan olarak `<main id="main-content">` üretir: kabuğun "İçeriğe geç"
 * bağlantısının hedefi budur ve her rotada tam olarak bir tane bulunur.
 */
export function PageContainer({
  size = 'base',
  shellInsets = true,
  id = 'main-content',
  className,
  children,
  ...rest
}: PageContainerProps) {
  const classNames = [
    styles.container,
    sizeClass[size],
    shellInsets ? styles.shellInsets : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main id={id} className={classNames} {...rest}>
      {children}
    </main>
  )
}
