import { Fragment, type ComponentPropsWithoutRef, type MouseEvent } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { usePageTrail, type PageTrailItem } from './PageTrail'
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
  /**
   * Kabuğun sayfa kırıntı yolu (`PageTrailContext`) çizilsin mi. Kendi
   * breadcrumb'ını taşıyan sayfalar (ör. Emlak Endeksi'nin bölge yolu)
   * `false` vererek çift yol basılmasını önler.
   */
  breadcrumb?: boolean
}

const sizeClass: Record<PageContainerSize, string | undefined> = {
  narrow: styles.narrow,
  base: undefined,
  wide: styles.wide,
}

/**
 * Sade sol tıkta SPA gezinmesine devret; modifier'lı ve orta tıkta tarayıcıya
 * bırak (yeni sekme davranışı korunur) — `GlassSiteHeader.linkClick` sözleşmesi.
 */
function trailLinkClick(item: PageTrailItem) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (!item.onClick) return
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    item.onClick()
  }
}

/**
 * Sitenin sayfa container'ı — genişlik kademesi, kenar boşluğu ve yüzen
 * kabuk paylarının tek kaynağı. Aynı zamanda sayfanın container-query kabıdır
 * (`page`), böylece sayfa içi yerleşim viewport'a değil kendi ölçüsüne yanıt
 * verir.
 *
 * Varsayılan olarak `<main id="main-content">` üretir: kabuğun "İçeriğe geç"
 * bağlantısının hedefi budur ve her rotada tam olarak bir tane bulunur.
 *
 * Kabuk bir kırıntı yolu sağladıysa (`PageTrailContext`, en az iki seviye)
 * içerik başlamadan önce düz breadcrumb (`ui/breadcrumb`) olarak çizilir:
 * sayfalar breadcrumb'ı tek tek hatırlamaz, container hatırlar.
 */
export function PageContainer({
  size = 'base',
  shellInsets = true,
  breadcrumb = true,
  id = 'main-content',
  className,
  children,
  ...rest
}: PageContainerProps) {
  const trail = usePageTrail()
  // Tek seviyeli yol ('Anasayfa') gürültüdür — kırıntı ancak dönülecek bir
  // üst seviye varken anlam taşır.
  const showTrail = breadcrumb && trail.length >= 2

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
      {showTrail ? (
        <Breadcrumb aria-label="Sayfa yolu" className={styles.trail}>
          <BreadcrumbList>
            {trail.map((item, index) => {
              const last = index === trail.length - 1
              return (
                <Fragment key={`${item.label}-${index}`}>
                  <BreadcrumbItem>
                    {last ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href || item.onClick ? (
                      <BreadcrumbLink href={item.href} onClick={trailLinkClick(item)}>
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </BreadcrumbItem>
                  {!last ? <BreadcrumbSeparator /> : null}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}
      {children}
    </main>
  )
}
