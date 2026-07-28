import { GlassMediaGallery, type GlassMediaGalleryItem, type GlassMediaGalleryItemType } from '@repo/ui'

import type { SectionState } from '../data/listing-detail-adapter'
import { criticalIssues, verificationScore } from '../domain/listing-detail-view-model'
import type {
  ListingDetail,
  ListingMediaItem,
  VerificationRow,
} from '../domain/listing-detail-types'
import { formatArea, formatDate, formatUnitPrice } from '../format'
import styles from '../ListingDetailWorkspace.module.css'

export interface ListingIntroProps {
  detail: ListingDetail
  /** Harita sağlayıcısının durumu — kullanılamadığında medya sahnesi susmaz. */
  mapSection: SectionState<true>
}

/**
 * Durum yalnız renkle taşınmaz: her satırın işareti kelimeyle de yazılır.
 *
 * Kelimeler bilinçli olarak **nötr sonuç** bildirir, doğrulama iddiası değil.
 * Vektörün olumlu satırlarının hepsi doğrulama değildir — ör. "Platform
 * moderasyonu tamamlandı" bir içerik doğrulaması değil, yasak içerik/yinelenen
 * ilan kontrolüdür. Her satırın neyi kapsadığı zaten `title` ve `scopeNote`
 * içinde yazılıdır; buradaki kelime yalnız kontrolün sonucunu söyler.
 * "Çelişkili" yalnız gerçekten çelişki bildirilen yerde kullanılır
 * (kanıt künyesindeki `Kaynaklar çelişiyor` rozeti).
 */
const STATE_LABEL: Record<VerificationRow['state'], string> = {
  positive: 'Olumlu',
  negative: 'Olumsuz',
  unknown: 'Eksik',
}

const GALLERY_TYPE: Record<ListingMediaItem['kind'], GlassMediaGalleryItemType> = {
  photo: 'image',
  drone: 'image',
  parcel: 'image',
  plan: 'floorPlan',
  video: 'video',
}

function galleryItems(media: ListingMediaItem[]): GlassMediaGalleryItem[] {
  return media
    .filter((item): item is ListingMediaItem & { src: string } => Boolean(item.src))
    .map((item) => ({
      type: GALLERY_TYPE[item.kind],
      src: item.src,
      alt: item.label,
      label: item.aiEdited ? `${item.label} · yapay zekâ ile düzenlendi` : item.label,
    }))
}

/** Medya dosyası taşımayan kayıtlarda sahne boş kalmaz: döküm metin olarak durur. */
function MediaInventory({ media }: { media: ListingMediaItem[] }) {
  return (
    <div className={styles.mediaInventory}>
      <p className={styles.mediaInventoryNote}>
        Görsel dosyaları bu kayıtta bulunmuyor. İlanda listelenen medya:
      </p>
      <ul className={styles.mediaInventoryList}>
        {media.map((item) => (
          <li key={item.id}>
            <span className={styles.mediaInventoryLabel}>{item.label}</span>
            <span className={styles.mediaInventoryMeta}>
              {item.capturedAt ? `Çekim: ${formatDate(item.capturedAt)}` : 'Çekim tarihi bildirilmedi'}
              {item.aiEdited ? ' · yapay zekâ ile düzenlendi' : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * İlanın ilk görünümü: medya sahnesi + karar özeti kolonu.
 *
 * Karar özeti kolonu birim fiyatın dayanağını, doğrulama vektörünü ve
 * görüşmeden önce çözülmesi gereken konuları taşır; hiçbiri accordion
 * arkasına saklanmaz. Kolon içerik katmanındadır — cam açmaz.
 */
export function ListingIntro({ detail, mapSection }: ListingIntroProps) {
  const items = galleryItems(detail.media)
  const score = verificationScore(detail.verification)
  const issues = criticalIssues(detail)

  return (
    <section id="ozet" className={styles.intro} aria-labelledby="ozet-baslik">
      <h2 id="ozet-baslik" className={styles.sectionTitle}>
        Özet
      </h2>

      <div className={styles.mediaStage}>
        {items.length > 0 ? (
          <GlassMediaGallery items={items} variant="stage" label="İlan medyası" />
        ) : (
          <MediaInventory media={detail.media} />
        )}
        {mapSection.state === 'unavailable' ? (
          <p className={styles.mediaInventoryMeta}>
            Konum ve parsel bilgisi Parsel bölümünde metin olarak yer alır.
          </p>
        ) : null}
      </div>

      <div className={styles.decision}>
        <p className={styles.introUnitPrice}>
          <strong>{formatUnitPrice(detail.price.unitPrice)}</strong>
          <span className={styles.introPriceBasis}>
            {`Beyan edilen ${formatArea(detail.price.declaredArea)} alan üzerinden hesaplandı.`}
          </span>
        </p>

        <div className={styles.verification}>
          <h3 className={styles.subTitle}>
            {`Doğrulama vektörü · ${score.total} kontrolün ${score.positive} tanesi olumlu`}
          </h3>
          <ul className={styles.verificationList}>
            {detail.verification.map((row) => (
              <li key={row.id} className={styles.verificationItem} data-state={row.state}>
                <p className={styles.rowTitle}>{row.title}</p>
                <p className={styles.rowState}>{STATE_LABEL[row.state]}</p>
                {row.scopeNote ? <p className={styles.rowScope}>{row.scopeNote}</p> : null}
                <p className={styles.rowSource}>{`Kaynak: ${row.source}`}</p>
              </li>
            ))}
          </ul>
        </div>

        <section className={styles.critical} aria-labelledby="kritik-baslik">
          <h3 id="kritik-baslik" className={styles.subTitle}>
            Görüşmeden önce çözülmesi gerekenler
          </h3>
          {issues.length === 0 ? (
            <p className={styles.issueDetail}>
              Bu ilanda karar öncesi çözülmesi gereken bir konu bulunmadı.
            </p>
          ) : (
            <ul className={styles.criticalList}>
              {issues.map((issue) => (
                <li key={issue.id} className={styles.criticalItem}>
                  <p className={styles.issueTitle}>{issue.title}</p>
                  <p className={styles.issueDetail}>{issue.detail}</p>
                  {issue.action ? (
                    <p className={styles.issueAction}>
                      <span className={styles.issueActionLabel}>Sonraki adım:</span> {issue.action}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}
