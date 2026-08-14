// Yatay (satır) ilan kartı — solda medya, sağda künye + iletişim ayağı.
// İçerik katmanı: cam DEĞİL, düz yüzey (--lg-surface + --lg-hairline). Kartın
// tamamı button YAPILMAZ: kart içinde favori, "diğer işlemler" ve iletişim
// butonları gerçek kontrollerdir; bunlar bir button'un içine yuvalanamaz
// (bkz. GlassListingCard'ın bilinen kısıtı, rules.md §1).
import { useId, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { GlassAvatar } from '../GlassAvatar'
import { GlassRating } from '../GlassRating'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassListingRowCard.module.css'

/** Kartın orta bandındaki tek satırlık özellik rozeti (ör. "4 Oda"). */
export interface GlassListingRowCardFeature {
  /** Kullanıcıya görünen kısa etiket. */
  label: string
  /** Etiketin önündeki dekoratif ikon. */
  icon?: ReactNode
}

/** İlanı yayınlayan danışman/satıcı künyesi. */
export interface GlassListingRowCardAgent {
  /** Danışmanın adı. */
  name: string
  /** Avatar görseli; verilmezse GlassAvatar baş harf fallback'ine düşer. */
  avatarSrc?: string
}

/** Ayaktaki eylem. `icon` verilirse ikon-tek çizilir, `label` erişilebilir addır;
 *  verilmezse `label` metin olarak görünür. */
export interface GlassListingRowCardAction {
  /** React anahtarı ve test hedefi. */
  id: string
  /** Eylemin adı; ikonsuz eylemde görünen metin de budur. */
  label: string
  /** Verilirse buton ikon-tek olur (etiket yalnız `aria-label`'da kalır). */
  icon?: ReactNode
  /** Verilirse eylem `<a>` olur (ör. `tel:`, `mailto:`). */
  href?: string
  /** `href` yokken eylem `<button>` olur. */
  onClick?: () => void
}

export interface GlassListingRowCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Kartın ana görseli. `fallbackSrc` verilirse `src` yüklenemediğinde ona düşer. */
  image: { src: string; alt?: string; fallbackSrc?: string }
  /**
   * Kaydırılabilir galeri kareleri. 2+ kare verildiğinde medya scroll-snap
   * şeridine döner: parmakla/tekerle gezilir, nokta göstergesi aktif kareyi
   * izler (aktif nokta kapsüle uzar). Tek kare/boş dizi `image` davranışına
   * eşdeğerdir. İlk kare `image` ile aynı olmalıdır (kapak sözleşmesi).
   */
  images?: ReadonlyArray<{ src: string; alt?: string; fallbackSrc?: string }>
  /**
   * Medya yerleşimi.
   * - `wide` (varsayılan): görsel geniş kolon; dar kapta üste sarar.
   * - `thumb`: kart HER genişlikte yataydır — görsel `--row-thumb-w`
   *   genişliğinde sol sütun, gövde sıkı tek kolon (bkz. rules.md changelog,
   *   2026-08-08 «Liste yatay» kararı).
   */
  media?: 'wide' | 'thumb'
  /** İlan başlığı — kartın erişilebilir adı da buradan türer. */
  title: string
  /** Önceden biçimlendirilmiş fiyat metni. */
  price: string
  /** Fiyatın ardından gösterilen dönem; örneğin `/yıl`. */
  priceSuffix?: string
  /** Görselin sol üstündeki rozet (ör. GlassBadge). */
  badge?: ReactNode
  /**
   * `inset` rozeti köşeden içeride kapsül olarak yerleştirir (varsayılan);
   * `corner` rozeti medya köşesine sıfır bırakır — `GlassRibbon` gibi köşeye
   * kilitli şeritler için (GlassListingCard ile aynı sözleşme).
   */
  badgePlacement?: 'inset' | 'corner'
  /** 0–5 arası puan; verilirse yıldız satırı çizilir. */
  rating?: number
  /** Konum etiketi. */
  location?: string
  /** Orta banttaki kısa özellik rozetleri. */
  features?: readonly GlassListingRowCardFeature[]
  /** Tek satırlık doğrulama/bilgi notu (ör. "Danışman 12 Haziran'da gezdi"). */
  note?: { text: string; icon?: ReactNode }
  /** İlan sahibi künyesi. */
  agent?: GlassListingRowCardAgent
  /** İlanın göreli veya biçimlendirilmiş yayın tarihi. */
  listedAt?: string
  /** Ayağın sağındaki iletişim eylemi kümesi. */
  actions?: readonly GlassListingRowCardAction[]
  /** Görsel sayısı; 1'den büyükse dekoratif nokta göstergesi çizilir. */
  mediaCount?: number
  /** Nokta göstergesinde dolu görünen sıra (0 tabanlı). */
  activeMediaIndex?: number
  /** Medyanın sağ altındaki küçük etiket (ör. "8 fotoğraf"); nokta göstergesinin alternatifidir. */
  mediaCaption?: ReactNode
  /** Ayakta, eylemlerden önce duran ikincil metrik (ör. birim fiyat). */
  footerMeta?: ReactNode
  /** Verilirse başlık erişilebilir bir tetikleyiciye dönüşür. */
  onOpen?: () => void
  /** `onOpen` yerine bağlantı hedefi; ikisi birlikte verilirse `href` kazanır. */
  href?: string
  /** Favori durumu (controlled). */
  favorite?: boolean
  /** Favori başlangıç durumu (uncontrolled). */
  defaultFavorite?: boolean
  /** Favori değiştiğinde çalışır; üçünden biri verilmedikçe kalp render edilmez. */
  onFavoriteChange?: (favorite: boolean) => void
  /** Verilirse sağ üstte "diğer işlemler" tetikleyicisi çizilir. */
  onMenuOpen?: () => void
  /** "Diğer işlemler" butonunun erişilebilir adı. */
  menuLabel?: string
  /** Başlığın heading seviyesi. */
  headingAs?: 'h2' | 'h3' | 'h4'
  /** Yoğunluk ekseni: `sm` daha ince satır, `md` varsayılan. */
  size?: 'sm' | 'md'
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden focusable="false">
      <path d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      focusable="false"
    >
      <path
        d="M12 20.2 4.9 13.3a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.7 0l.4.4.4-.4a4.8 4.8 0 0 1 6.7 0 4.6 4.6 0 0 1 0 6.6Z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
    </svg>
  )
}

/** Puanı Türkçe ondalık ayracıyla yazar — GlassRating ile aynı biçim. */
function formatRating(value: number): string {
  return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

/**
 * Yatay ilan kartı — liste ve arama sonuçlarında `GlassListingCard`'ın dikey
 * varyantlarının yerine kullanılır. Kart bir `<article>`'dır ve başlığından
 * `aria-labelledby` ile adlandırılır; içindeki favori, menü ve iletişim
 * kontrolleri bağımsız odak hedefleridir.
 */
export function GlassListingRowCard({
  image,
  images,
  media = 'wide',
  title,
  price,
  priceSuffix,
  badge,
  badgePlacement = 'inset',
  rating,
  location,
  features,
  note,
  agent,
  listedAt,
  actions,
  mediaCount,
  activeMediaIndex = 0,
  mediaCaption,
  footerMeta,
  onOpen,
  href,
  favorite,
  defaultFavorite,
  onFavoriteChange,
  onMenuOpen,
  menuLabel = 'Diğer işlemler',
  headingAs: Heading = 'h3',
  size = 'md',
  className,
  'aria-label': ariaLabel,
  ...rest
}: GlassListingRowCardProps) {
  const titleId = useId()
  // Başarısız kaynağın KENDİSİ tutulur, boolean değil: kart listede geri
  // dönüştürüldüğünde (yeni ilan, yeni src) bayrak açık kalır ve yeni görsel
  // hiç denenmeden gerilemeye düşerdi.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [innerFavorite, setInnerFavorite] = useState(defaultFavorite ?? false)
  const isFavorite = favorite !== undefined ? favorite : innerFavorite
  const hasFavorite =
    favorite !== undefined || defaultFavorite !== undefined || onFavoriteChange !== undefined

  const toggleFavorite = () => {
    const next = !isFavorite
    if (favorite === undefined) setInnerFavorite(next)
    onFavoriteChange?.(next)
  }

  // Galeri şeridi: aktif kare scroll konumundan türetilir — ayrı bir state
  // makinesi yok, nokta göstergesi kaydırmanın aynası. Kontrollü
  // `activeMediaIndex` yalnız şeritsiz (tek görsel + dots) kullanımda anlamlı.
  const strip = images && images.length > 1 ? images : null
  const [stripIndex, setStripIndex] = useState(0)
  const onStripScroll = (event: { currentTarget: HTMLElement }) => {
    const el = event.currentTarget
    setStripIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
  }
  const onStripKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const el = event.currentTarget
    el.scrollBy({ left: event.key === 'ArrowLeft' ? -el.clientWidth : el.clientWidth })
  }

  const dotCount = strip ? strip.length : mediaCount && mediaCount > 1 ? mediaCount : 0
  const activeDot = strip ? stripIndex : activeMediaIndex
  const dots = dotCount > 1 ? Array.from({ length: dotCount }) : null
  const hasFooter = Boolean(agent || listedAt || footerMeta || actions?.length)

  return (
    <article
      {...rest}
      data-size={size}
      data-media={media}
      // Kartın adı varsayılan olarak başlıktır. Çağıran `aria-label` verdiyse
      // O kazanır: `aria-labelledby` da basılsaydı ikisi yarışır ve
      // `aria-labelledby` sessizce üste çıkıp verilen adı yok sayardı.
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : titleId}
      className={[styles.card, className].filter(Boolean).join(' ')}
    >
      <div className={styles.media}>
        {strip ? (
          // Şerit klavyeyle de gezilir: sol/sağ ok kare kare kaydırır.
          // roving-tab yok — tek durak, ok tuşları içeride çalışır.
          <div
            className={styles.strip}
            role="group"
            aria-label={`Görseller, ${strip.length} kare`}
            tabIndex={0}
            onScroll={onStripScroll}
            onKeyDown={onStripKeyDown}
          >
            {strip.map((frame, index) => (
              <img
                key={`${frame.src}-${index}`}
                className={styles.image}
                src={frame.fallbackSrc && failedSrc === frame.src ? frame.fallbackSrc : frame.src}
                alt={frame.alt ?? ''}
                loading={index === 0 ? undefined : 'lazy'}
                onError={() => setFailedSrc(frame.src)}
              />
            ))}
          </div>
        ) : (
          <img
            className={styles.image}
            src={image.fallbackSrc && failedSrc === image.src ? image.fallbackSrc : image.src}
            alt={image.alt ?? ''}
            onError={() => setFailedSrc(image.src)}
          />
        )}
        {badge
          ? badgePlacement === 'corner'
            ? badge
            : <span className={styles.badge}>{badge}</span>
          : null}
        {hasFavorite ? (
          <button
            type="button"
            className={styles.favorite}
            aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            aria-pressed={isFavorite}
            data-favorite={isFavorite ? 'true' : 'false'}
            onClick={toggleFavorite}
          >
            <HeartIcon filled={isFavorite} />
          </button>
        ) : null}
        {dots ? (
          <span className={styles.dots} aria-hidden>
            {dots.map((_, index) => (
              <span key={index} className={styles.dot} data-active={index === activeDot ? 'true' : undefined} />
            ))}
          </span>
        ) : null}
        {mediaCaption ? <span className={styles.mediaCaption}>{mediaCaption}</span> : null}
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <div className={styles.identity}>
            <p className={styles.price}>
              {price}
              {priceSuffix ? <span className={styles.priceSuffix}>{priceSuffix}</span> : null}
            </p>
            <Heading id={titleId} className={styles.title}>
              {href ? (
                <a className={styles.titleAction} href={href}>
                  {title}
                </a>
              ) : onOpen ? (
                <button type="button" className={styles.titleAction} onClick={onOpen}>
                  {title}
                </button>
              ) : (
                title
              )}
            </Heading>
            {rating !== undefined ? (
              <p className={styles.rating}>
                <span aria-hidden>{formatRating(rating)}</span>
                <GlassRating variant="display" value={rating} className={styles.stars} />
              </p>
            ) : null}
          </div>
          {onMenuOpen ? (
            <button type="button" className={styles.menu} aria-label={menuLabel} onClick={onMenuOpen}>
              <MoreIcon />
            </button>
          ) : null}
        </div>

        {location ? (
          <p className={styles.location}>
            <LocationIcon />
            <span className={styles.locationText}>{location}</span>
          </p>
        ) : null}

        {features?.length ? (
          // Tek sıra yatay kayan şerit (CSS): taşan çipe klavyeyle erişim
          // için odaklanabilir — odaklıyken ok tuşları native kaydırır
          // (galeri şeridiyle aynı sözleşme, roving-tab yok).
          <ul className={styles.features} tabIndex={0} aria-label="İlan özellikleri">
            {features.map((feature) => (
              <li className={styles.feature} key={feature.label}>
                {feature.icon ? (
                  <span className={styles.featureIcon} aria-hidden>
                    {feature.icon}
                  </span>
                ) : null}
                {feature.label}
              </li>
            ))}
          </ul>
        ) : null}

        {note ? (
          <p className={styles.note}>
            {note.icon ? (
              <span className={styles.noteIcon} aria-hidden>
                {note.icon}
              </span>
            ) : null}
            {note.text}
          </p>
        ) : null}

        {hasFooter ? (
          <div className={styles.footer}>
            <div className={styles.agent}>
              {agent ? <GlassAvatar src={agent.avatarSrc} name={agent.name} alt="" size="sm" /> : null}
              <div className={styles.agentText}>
                {agent ? <span className={styles.agentName}>{agent.name}</span> : null}
                {listedAt ? (
                  <span className={styles.listedAt}>
                    <ClockIcon />
                    {listedAt}
                  </span>
                ) : null}
              </div>
            </div>
            <div className={styles.footerEnd}>
              {footerMeta ? <span className={styles.footerMeta}>{footerMeta}</span> : null}
              {actions?.length ? (
                // Dolu eylem her zaman cam materyalde çizilir (GlassButton'ın
                // prominent kuralıyla aynı ses) — kapsül GlassSurface'ten gelir,
                // dolgu yine --lg-action-prominent token'ıdır.
                <GlassSurface shape="capsule" thickness={0.35} className={styles.actions}>
                  {actions.map((action) => {
                    // İkonlu eylemde etiket yalnız erişilebilir addır; ikonsuz
                    // eylemde etiketin kendisi görünür metindir, bu yüzden
                    // aria-label tekrarlanmaz.
                    const content = action.icon ? (
                      <span aria-hidden>{action.icon}</span>
                    ) : (
                      action.label
                    )
                    const labelProps = action.icon
                      ? { 'aria-label': action.label, title: action.label }
                      : {}
                    return action.href ? (
                      <a
                        key={action.id}
                        className={styles.action}
                        data-text={action.icon ? undefined : 'true'}
                        href={action.href}
                        {...labelProps}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        key={action.id}
                        type="button"
                        className={styles.action}
                        data-text={action.icon ? undefined : 'true'}
                        onClick={action.onClick}
                        {...labelProps}
                      >
                        {content}
                      </button>
                    )
                  })}
                </GlassSurface>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}
