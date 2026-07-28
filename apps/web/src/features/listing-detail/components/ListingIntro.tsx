import type { SectionState } from '../data/listing-detail-adapter'
import { verificationScore } from '../domain/listing-detail-view-model'
import type { ListingDetail, VerificationRow } from '../domain/listing-detail-types'
import { ListingMediaStage } from './ListingMediaStage'
import styles from '../ListingDetailWorkspace.module.css'

export interface ListingIntroProps {
  detail: ListingDetail
  /** Harita sağlayıcısının durumu — kullanılamadığında medya sahnesi susmaz. */
  mapSection: SectionState<true>
}

/** Doğrulama vektörünün çapası — karar kolonundaki özet buraya bağlanır. */
export const VERIFICATION_SECTION_ID = 'dogrulama'

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
export const STATE_LABEL: Record<VerificationRow['state'], string> = {
  positive: 'Olumlu',
  negative: 'Olumsuz',
  unknown: 'Eksik',
}

/**
 * İlanın ilk görünümü: medya sahnesi ve doğrulama vektörü.
 *
 * Vektör dar bir kolona sıkışmaz — özetin altında kendi iki kolonlu ızgarasında
 * durur; karar kolonunda yalnız **derli toplu** özeti kalır (kaç kontrol
 * olumlu, olumsuz olan hangisi) ve o özet buraya bağlanır. Hiçbir satır
 * kaybolmaz, yalnız yer değiştirir.
 *
 * Bölüm içerik katmanındadır: düz akış, cam açmaz. Tek istisna medya
 * sahnesinin kare geçiş kontrolüdür (kontrol katmanı).
 */
export function ListingIntro({ detail, mapSection }: ListingIntroProps) {
  const score = verificationScore(detail.verification)

  return (
    <section id="ozet" className={styles.section} aria-labelledby="ozet-baslik">
      <h2 id="ozet-baslik" className={styles.sectionTitle}>
        Özet
      </h2>

      <ListingMediaStage media={detail.media} />

      {/* Yönlendirme yalnız Parsel bölümü gerçekten render edildiğinde
          yazılır: yansıtılmış ilanda böyle bir bölüm yoktur, kullanıcı
          olmayan bir yere gönderilmez. */}
      {detail.kind === 'land' && mapSection.state === 'unavailable' ? (
        <p className={styles.blockNote}>
          Konum ve parsel bilgisi Parsel bölümünde metin olarak yer alır.
        </p>
      ) : null}
      {detail.kind === 'generic' && mapSection.state === 'unavailable' ? (
        <p className={styles.blockNote}>{mapSection.reason}</p>
      ) : null}

      <div id={VERIFICATION_SECTION_ID} className={styles.verification}>
        <h3 className={styles.subTitle}>
          {`Doğrulama vektörü · ${score.total} kontrolün ${score.positive} tanesi olumlu`}
        </h3>
        <p className={styles.blockNote}>
          Bir kontrolün olumlu olması diğerlerini olumlu yapmaz; her satır yalnız kendi kapsamını
          bildirir.
        </p>
        <ul className={styles.verificationList}>
          {detail.verification.map((row) => (
            <li key={row.id} className={styles.verificationItem} data-state={row.state}>
              <p className={styles.rowState}>
                <span className={styles.stateDot} aria-hidden="true" />
                {STATE_LABEL[row.state]}
              </p>
              <p className={styles.rowTitle}>{row.title}</p>
              {row.scopeNote ? <p className={styles.rowScope}>{row.scopeNote}</p> : null}
              <p className={styles.rowSource}>{`Kaynak: ${row.source}`}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
