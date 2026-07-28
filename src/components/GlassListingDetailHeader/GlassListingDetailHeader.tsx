import type { HTMLAttributes, ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassListingDetailHeader.module.css'

export interface GlassListingMetaItem {
  id: string
  label: string
  value: string
}

export interface GlassListingDetailHeaderProps extends HTMLAttributes<HTMLElement> {
  /** İlanın tek görünür başlığı */
  title: string
  /** Sayfada tek h1 kuralı için ayarlanabilir; varsayılan 1 */
  headingLevel?: 1 | 2 | 3
  /**
   * Biçimlenmiş para değeri — component biçimlendirme yapmaz.
   *
   * İsteğe bağlıdır: fiyatı kendi karar kolonunda taşıyan sayfalarda başlık
   * yalnız künye bloğu olur. Verilmezse fiyat bloğu **hiç** render edilmez —
   * boş bir sütun bırakılmaz.
   */
  price?: string
  /** Birim fiyat, ör. "1.804 ₺/m²" */
  priceUnit?: string
  /** Fiyatın altında küçük açıklama (alan kaynağı, çelişki notu) */
  priceNote?: string
  meta?: GlassListingMetaItem[]
  /** İlan durumu — metinle taşınır, yalnız renkle değil */
  status?: { label: string; tone?: 'success' | 'warning' | 'danger' | 'neutral' }
  /** Rozet slotu (doğrulama özeti gibi) */
  badges?: ReactNode
  /** Kaydet/paylaş gibi utility kontroller */
  utilities?: ReactNode
  /** Varsayılan flat — başlık içerik katmanındadır */
  material?: 'glass' | 'flat'
  tone?: 'light' | 'dark' | 'auto'
}

/**
 * İlan detay sayfasının başlık bloğu: tek `h1`, yapılandırılmış meta ve
 * para semantiği. Fiyat biçimlendirmesi çağırana aittir; component yalnız
 * hiyerarşiyi ve hizayı kurar.
 */
export function GlassListingDetailHeader({
  title,
  headingLevel = 1,
  price,
  priceUnit,
  priceNote,
  meta,
  status,
  badges,
  utilities,
  material = 'flat',
  tone = 'auto',
  className,
  ...rest
}: GlassListingDetailHeaderProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3'

  return (
    <GlassSurface
      as="header"
      material={material}
      tone={tone}
      shape={20}
      thickness={0.4}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className={styles.head}>
        <div className={styles.titleBlock}>
          <Heading className={styles.title}>{title}</Heading>
          {status ? (
            <p className={styles.status} data-tone={status.tone ?? 'neutral'}>
              {status.label}
            </p>
          ) : null}
          {meta?.length ? (
            <dl className={styles.meta}>
              {meta.map((item) => (
                <div key={item.id} className={styles.metaItem}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {price ? (
          <div className={styles.priceBlock}>
            <p className={styles.price}>{price}</p>
            {priceUnit ? <p className={styles.priceUnit}>{priceUnit}</p> : null}
            {priceNote ? <p className={styles.priceNote}>{priceNote}</p> : null}
          </div>
        ) : null}
      </div>

      {badges ? <div className={styles.badges}>{badges}</div> : null}
      {utilities ? <div className={styles.utilities}>{utilities}</div> : null}
    </GlassSurface>
  )
}
