import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { useGlassPress } from '../../motion/useGlassPress'
import styles from './GlassListingCard.module.css'

export type GlassListingCardVariant = 'compact' | 'details' | 'overlay' | 'propertyOverlay'

export interface GlassListingCardAmenity {
  /** Özelliğin kullanıcıya görünen kısa etiketi. */
  label: string
  /** Etiketin önünde gösterilen dekoratif ikon. */
  icon?: ReactNode
}

export interface GlassListingCardMetric {
  /** Kısa metrik değeri; örneğin `29 m²`. */
  value: string
  /** Değerin açıklaması; örneğin `Yaşam alanı`. */
  label: string
}

export interface GlassListingCardStatus {
  /** Kapsülde görünen kısa statü metni; örneğin `Fiyat düştü`. */
  label: string
  /** Renk ekseni: metin rengi semantic token'dan gelir, zemin hep opak yüzeydir. */
  tone?: 'neutral' | 'success' | 'warning'
}

export interface GlassListingCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /** Kartın ana görseli. */
  image: { src: string; alt?: string }
  /** İlan veya ürün başlığı. */
  title: string
  /** Önceden biçimlendirilmiş fiyat metni. */
  price: string
  /** Fiyatın ardından gösterilen dönem; örneğin `/Ay`. */
  priceSuffix?: string
  /** Konum etiketi. */
  location?: string
  /** Konum satırının karşı ucunda gösterilen değerlendirme sayısı. */
  reviewCount?: string
  /** Kartta gösterilecek kısa olanak listesi. */
  amenities?: readonly GlassListingCardAmenity[]
  /** Referans düzenlerinde sağ altta görünen eylem etiketi. */
  actionLabel?: string
  /** Fiyatın önüne gelen kısa etiket; örneğin `Liste:`. */
  pricePrefix?: string
  /** Konut kartında sağda gösterilen kısa metrikler. */
  metrics?: readonly GlassListingCardMetric[]
  /** İlanı yayınlayan kişi veya kurum. */
  seller?: string
  /** İlanın göreli veya biçimlendirilmiş yayın tarihi. */
  listedAt?: string
  /** Kompakt düzende görselin sol üst köşesinde gösterilen rozet. */
  badge?: ReactNode
  /**
   * Rozetin yerleşimi: `inset` köşeden boşluklu kapsül (varsayılan);
   * `corner` rozeti medya köşesine sıfır yerleştirir — `GlassRibbon` gibi
   * kendi konumunu kuran köşe bileşenleri için.
   */
  badgePlacement?: 'inset' | 'corner'
  /**
   * Görselin üstünde sol üstte dikey istiflenen statü kapsülleri
   * (`Fiyat düştü`, `Yetki bekliyor · Temsili` vb.). Zemin HER ZAMAN opak
   * yüzeydir — kontrast bilinmeyen fotoğrafa bırakılmaz. Doğrulama bir statü
   * DEĞİLDİR; o `badge` yuvasındaki köşe kurdelesiyle (GlassRibbon) anlatılır.
   * Köşe kurdelesiyle birlikte kullanıldığında kapsüller kurdele penceresinin
   * altından başlar, çakışmaz.
   */
  statuses?: readonly GlassListingCardStatus[]
  /** Yerleşim ekseni: mevcut kompakt kart, detaylı açık kart veya görsel üstü kart. */
  variant?: GlassListingCardVariant
  tone?: 'light' | 'dark' | 'auto'
  material?: 'glass' | 'flat'
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  )
}

/** İlan listelerinde kompakt, zengin ürün sunumlarında detaylı kart. */
export function GlassListingCard({
  image,
  title,
  price,
  priceSuffix,
  location,
  reviewCount,
  amenities,
  actionLabel = 'Detayları Gör',
  pricePrefix,
  metrics,
  seller,
  listedAt,
  badge,
  badgePlacement = 'inset',
  statuses,
  variant = 'compact',
  tone = 'auto',
  material,
  className,
  style,
  disabled,
  type = 'button',
  ...rest
}: GlassListingCardProps) {
  const press = useGlassPress({ disabled })
  const isRich = variant !== 'compact'
  const resolvedMaterial = material ?? (isRich ? 'flat' : undefined)

  return (
    <GlassSurface
      as={motion.button}
      shape={isRich ? 20 : 18}
      interactive
      tone={tone}
      material={resolvedMaterial}
      thickness={0.35}
      displacementScale={press.displacementScale}
      className={[styles.card, styles[variant], className].filter(Boolean).join(' ')}
      style={{ scale: press.transformScale, ...style } as CSSProperties}
      {...press.handlers}
      {...({ disabled, type, 'data-variant': variant, ...rest } as unknown as GlassSurfaceProps)}
    >
      <span className={styles.layout}>
      <span className={styles.media}>
        <img className={styles.image} src={image.src} alt={image.alt ?? ''} />
        {badge && (variant === 'compact' || variant === 'propertyOverlay')
          ? badgePlacement === 'corner'
            ? badge
            : <span className={styles.badge}>{badge}</span>
          : null}
        {statuses?.length ? (
          <span
            className={styles.statuses}
            // Köşe kurdelesi varken istif kurdele penceresinin altından başlar.
            data-with-ribbon={
              badge &&
              badgePlacement === 'corner' &&
              (variant === 'compact' || variant === 'propertyOverlay')
                ? 'true'
                : undefined
            }
          >
            {statuses.map((status) => (
              <span
                key={status.label}
                className={styles.status}
                data-tone={status.tone ?? 'neutral'}
              >
                {status.label}
              </span>
            ))}
          </span>
        ) : null}
        {variant === 'overlay' || variant === 'propertyOverlay' ? <span className={styles.scrim} aria-hidden="true" /> : null}
      </span>

      {variant === 'compact' ? (
        <span className={styles.body}>
          <span className={styles.title}>{title}</span>
          {location ? <span className={styles.location}>{location}</span> : null}
          <span className={styles.price}>{price}</span>
        </span>
      ) : variant === 'propertyOverlay' ? (
        <span className={styles.propertyContent}>
          <span className={styles.propertyMain}>
            <span className={styles.propertyIdentity}>
              <span className={styles.propertyPrice}>{pricePrefix ? `${pricePrefix} ` : null}{price}</span>
              <span className={styles.propertyAddress}>{title}</span>
              {location ? <span className={styles.propertyAddress}>{location}</span> : null}
            </span>
            {metrics?.length ? (
              <span className={styles.propertyMetrics} aria-label="İlan özellikleri">
                {metrics.map((metric) => (
                  <span className={styles.propertyMetric} key={`${metric.value}-${metric.label}`}>
                    <span>{metric.value}</span>
                    <span>{metric.label}</span>
                  </span>
                ))}
              </span>
            ) : null}
          </span>
          {(seller || listedAt) ? (
            <span className={styles.propertyFooter}>
              {seller ? <span><span className={styles.byLabel}>İlan sahibi </span><span className={styles.seller}>{seller}</span></span> : <span />}
              {listedAt ? <span>{listedAt}</span> : null}
            </span>
          ) : null}
        </span>
      ) : (
        <span className={styles.richContent}>
          {variant === 'details' && (location || reviewCount) ? (
            <span className={styles.metaRow}>
              {location ? <span className={styles.locationWithIcon}><LocationIcon />{location}</span> : <span />}
              {reviewCount ? <span>{reviewCount}</span> : null}
            </span>
          ) : null}

          <span className={styles.richTitle}>{title}</span>

          {amenities?.length ? (
            <span className={styles.amenities} aria-label="Olanaklar">
              {amenities.map((amenity) => (
                <span className={styles.amenity} key={amenity.label}>
                  {amenity.icon ? <span className={styles.amenityIcon} aria-hidden="true">{amenity.icon}</span> : null}
                  {amenity.label}
                </span>
              ))}
            </span>
          ) : null}

          {variant === 'overlay' && (location || reviewCount) ? (
            <span className={styles.metaRow}>
              {location ? <span className={styles.locationWithIcon}><LocationIcon />{location}</span> : <span />}
              {reviewCount ? <span>{reviewCount}</span> : null}
            </span>
          ) : null}

          <span className={styles.footer}>
            <span className={styles.richPrice}>{price}<span className={styles.priceSuffix}>{priceSuffix}</span></span>
            <span className={styles.action}>{actionLabel}</span>
          </span>
        </span>
      )}
      </span>
    </GlassSurface>
  )
}
