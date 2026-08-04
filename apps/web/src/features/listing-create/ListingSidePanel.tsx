import {
  formatUnitPrice,
  getStepValidation,
  LISTING_STEPS,
  type ListingDraft,
  type ListingStepId,
} from './listing-create-domain'
import {
  familyLabels,
  locationChain,
  transactionLabels,
} from './listing-labels'
import styles from './ListingCreateWorkspace.module.css'

export interface ListingSidePanelProps {
  draft: ListingDraft
  activeStep: ListingStepId
}

interface StepHelp {
  eyebrow: string
  title: string
  description: string
  facts: string[]
}

/* Yardım metni adımın KARARINI açıklar; formdaki alan adlarını tekrar etmez. */
const helpByStep: Record<ListingStepId, StepHelp> = {
  property: {
    eyebrow: 'Doğru sınıflandırma',
    title: 'Kategori, alıcının sizi bulma yolu',
    description:
      'Mülk ailesi hem arama filtrelerini hem de sonraki adımlarda sorulacak zorunlu alanları belirler. Sonradan değiştirirseniz kategoriye özel alanlar sıfırlanır.',
    facts: [
      'Kategoriye özel alanlar otomatik açılır',
      'Yayınlama yetkisi EİDS kontrolünü belirler',
      'Yanlış kategori ilanı görünmez kılar',
    ],
  },
  location: {
    eyebrow: 'Mahremiyet kontrollü',
    title: 'Gerçek kayıt, güvenli gösterim',
    description:
      'Açık adres yalnız doğrulama ve konumlandırma için saklanır. İlan haritasında yaklaşık ya da tam konumu göstereceğinize siz karar verirsiniz.',
    facts: [
      'Taşınmaz numarası ilanda gösterilmez',
      'Yaklaşık konum mahremiyeti korur',
      'İl / ilçe / mahalle birbirine bağlıdır',
    ],
  },
  media: {
    eyebrow: 'Fotoğraf kalitesi',
    title: 'İlk üç kare kararı verdirir',
    description:
      'Kapak, genel görünüm ve çevre fotoğraflarını ilk sıralara taşıyın. Sıralamayı sürükleyerek ya da ok tuşlarıyla değiştirebilirsiniz.',
    facts: [
      'En az 3 geçerli fotoğraf gerekir',
      'Kapak tek fotoğraf olabilir',
      'Düşük çözünürlüklü kareler işaretlenir',
    ],
  },
  content: {
    eyebrow: 'Doğrulanabilir anlatım',
    title: 'Yalnız kanıtlayabildiğinizi yazın',
    description:
      'Başlığın ilk 50 karakteri arama sonucunda görünür. Kesinlik bildiren ifadeler otomatik olarak işaretlenir; AI metni siz uygulamadan forma yazılmaz.',
    facts: [
      'Başlık en fazla 70 karakter',
      'Birim fiyat alandan hesaplanır',
      'Beyanlar yayın için zorunludur',
    ],
  },
  verification: {
    eyebrow: 'Yayın kapısı',
    title: 'Önce yetki, sonra yayın',
    description:
      'EİDS demo kontrolü yalnız ilan verme yetkisini kurar. Rol veya taşınmaz numarası değişirse önceki sonuç geçersiz sayılır ve kontrol yenilenir.',
    facts: [
      'Beş adımın tamamı hazır olmalı',
      'Doğrulama sonucu taslağa kaydedilir',
      'Demo — gerçek kamu kaydı oluşmaz',
    ],
  },
}

function priceLabel(price: string): string {
  const number = Number(price.replace(/[^\d]/g, ''))
  return number > 0 ? `${number.toLocaleString('tr-TR')} TL` : 'Fiyat belirtilmedi'
}

/**
 * Geniş ekranda formun yanında duran bağlam sütunu: canlı ilan önizlemesi ve
 * aktif adımın yardımı. Dar ekranda formun altına iner (yerleşim CSS'te).
 */
export function ListingSidePanel({ draft, activeStep }: ListingSidePanelProps) {
  const { property, location, media, content } = draft
  const help = helpByStep[activeStep]
  const cover = media.find((item) => item.isCover) ?? media[0]
  const area = property.area || property.grossArea
  const readyCount = media.filter((item) => item.status === 'ready').length
  const completed = LISTING_STEPS.filter(
    (step) => getStepValidation(draft, step.id).valid,
  ).length
  const category =
    [
      property.family ? familyLabels[property.family] : '',
      property.transaction ? transactionLabels[property.transaction] : '',
    ]
      .filter(Boolean)
      .join(' · ') || 'Yeni ilan taslağı'
  /* `formatUnitPrice` boş fiyat/alan için NaN üretebiliyor; önizleme bunu
     kullanıcıya göstermez, hesabı ancak iki değer de girilince yapar. */
  const unitPrice =
    content.price.trim() && area.trim()
      ? formatUnitPrice(content.price, area)
      : '—'

  return (
    <aside className={styles.sidePanel} aria-label="İlan önizlemesi ve adım yardımı">
      <article className={styles.preview} aria-label="İlan önizlemesi">
        <div className={styles.previewMedia}>
          {cover ? (
            <img src={cover.src} alt="İlan kapak önizlemesi" />
          ) : (
            <span className={styles.previewMediaEmpty} aria-hidden="true">
              Kapak fotoğrafı eklenmedi
            </span>
          )}
          <span className={styles.previewTag}>Canlı önizleme</span>
        </div>
        <div className={styles.previewBody}>
          <p className={styles.previewCategory}>{category}</p>
          <h2 className={styles.previewTitle}>
            {content.title || 'İlan başlığınız burada görünecek'}
          </h2>
          <p className={styles.previewLocation}>
            {locationChain(location) || 'Konum bilgisi'}
          </p>
          <strong className={styles.previewPrice}>{priceLabel(content.price)}</strong>
          <p className={styles.previewUnitPrice}>
            {unitPrice === '—'
              ? 'Birim fiyat, alan ve fiyat girilince hesaplanır'
              : `${unitPrice} · ${area} m²`}
          </p>
          <div className={styles.previewFacts}>
            <span>{readyCount} fotoğraf</span>
            {content.highlights.slice(0, 2).map((highlight) => (
              <span key={highlight}>{highlight}</span>
            ))}
          </div>
          <p className={styles.previewDescription}>
            {content.description || 'Açıklamanızın ilk bölümü burada görüntülenir.'}
          </p>
        </div>
        <p className={styles.previewFoot}>
          {completed}/{LISTING_STEPS.length} adım hazır · Önizleme yayınlanan
          görünüme yakındır
        </p>
      </article>

      <section className={styles.helpCard} aria-label="Bu adım için yardım">
        <p className={styles.helpEyebrow}>{help.eyebrow}</p>
        <h2 className={styles.helpTitle}>{help.title}</h2>
        <p className={styles.helpText}>{help.description}</p>
        <ul className={styles.helpList}>
          {help.facts.map((fact) => (
            <li key={fact}>
              <span aria-hidden="true">✓</span>
              {fact}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
