import type { GenericListingDetail } from '../domain/listing-detail-types'
import { EvidenceList, EvidenceRow } from './EvidenceRow'
import styles from '../ListingDetailWorkspace.module.css'

export interface DeclaredFeaturesSectionProps {
  detail: GenericListingDetail
}

/**
 * Beyan edilen özellikler bölümü.
 *
 * Yansıtılmış ilanın tek kanıt bölümüdür ve iki şeyi birlikte söyler:
 * ilan sahibinin **ne beyan ettiğini** ve sayfanın sorduğu ama bu kayıtta
 * **cevabı olmayan** alanları. İkincisi tire veya boş hücre olarak değil,
 * nedeni ve kaynağıyla görünür — kaydın bulunmaması "yok" demek değildir.
 *
 * Bölüm içerik katmanındadır: düz yüzey kullanır, cam açmaz.
 */
export function DeclaredFeaturesSection({ detail }: DeclaredFeaturesSectionProps) {
  return (
    <section id="beyan" className={styles.section} aria-labelledby="beyan-baslik">
      <h2 id="beyan-baslik" className={styles.sectionTitle}>
        Beyan Edilen Özellikler
      </h2>

      <p className={styles.blockNote}>
        {`Bu bölümdeki değerler ilan sahibinin beyanıdır; ${detail.categoryLabel} kaydı için tapu, imar veya yapı belgesiyle karşılaştırılmamıştır.`}
      </p>

      <EvidenceList>
        {detail.declaredAttributes.map((attribute) => (
          <EvidenceRow key={attribute.id} label={attribute.label} value={attribute.value} />
        ))}
        {detail.highlights.value ? (
          <EvidenceRow label="Öne çıkanlar" value={detail.highlights} />
        ) : null}
      </EvidenceList>

      <h3 className={styles.subTitle}>Bu kayıtta cevabı olmayan alanlar</h3>
      <p className={styles.blockNote}>
        Aşağıdaki alanlar için sorgu yapılmamış veya kayıt yayımlanmamıştır. Kaydın bulunmaması,
        bilginin olumsuz olduğu anlamına gelmez.
      </p>

      <EvidenceList>
        {detail.openQuestions.map((question) => (
          <EvidenceRow
            key={question.id}
            label={question.label}
            value={question.value}
            note={question.note}
          />
        ))}
      </EvidenceList>
    </section>
  )
}
