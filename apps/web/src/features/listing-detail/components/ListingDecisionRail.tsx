import { useState } from 'react'
import { GlassAlert, GlassDetailActionBar } from '@repo/ui'

import type { ListingDetail } from '../domain/listing-detail-types'
import { criticalIssues, verificationScore } from '../domain/listing-detail-view-model'
import { contactClosedReason, formatArea, formatPrice, formatUnitPrice } from '../format'
import { STATE_LABEL, VERIFICATION_SECTION_ID } from './ListingIntro'
import { AGENCY_LICENCE_UNVERIFIED, INDIVIDUAL_TTBS_SCOPE_NOTE } from './seller-copy'
import styles from '../ListingDetailWorkspace.module.css'

export interface ListingDecisionRailProps {
  detail: ListingDetail
  /** Birim fiyatın hangi alana dayandığını söyleyen görünür cümle */
  priceNote: string
  /**
   * Mesaj akışı sayfa kabuğunda bağlanır. Verilmezse birincil eylem
   * `disabled` render edilir ve gerekçesi rayda görünür metin olarak durur —
   * etkin ama hiçbir şey yapmayan buton bırakılmaz.
   */
  onContact?: () => void
  /**
   * Kullanıcıyı satıcı bölümündeki numara kontrolüne götürür. Ray numarayı
   * kendisi açmaz — açılış sayfada tek bir yerde olur. Verilmezse ikincil
   * eylem `disabled` render edilir ve gerekçesi görünür kalır.
   */
  onGoToSeller?: () => void
}

/**
 * Bağlanmamış yeteneklerin görünür gerekçeleri.
 *
 * Kural (bkz. `rules.md` §4): işleyicisi olmayan eylem etkin render edilmez;
 * `disabled` durur ve nedeni aynı yüzeyde kelimeyle yazılır. Sessizce
 * kaybolmaz — kullanıcı yeteneğin var olduğunu ama henüz bağlanmadığını
 * görür.
 */
const CONTACT_NOT_CONNECTED =
  'Mesaj gönderme bu sürümde bağlı değil; mesajlaşma sonraki fazda açılacak.'
const SELLER_NAV_NOT_AVAILABLE =
  'Satıcı bilgilerine gitme kapalı: bu görünümde açılabilecek bir numara kontrolü yok.'

function sellerTypeLabel(type: ListingDetail['seller']['type']): string {
  return type === 'agency' ? 'Emlak ofisi' : 'Bireysel ilan sahibi'
}

/**
 * Karar kolonu: fiyat, doğrulama özeti, açık konular ve iletişim.
 *
 * Sayfanın en büyük **sayısı** buradadır; başlık künyesi fiyatı ikinci kez
 * yazmaz. Doğrulama vektörünün tamamı Özet bölümünde durur, burada yalnız
 * özeti (kaç kontrol olumlu, olumsuz olan hangisi) ve vektöre giden bağlantı
 * bulunur — bilgi kaybolmaz, yerini değiştirir.
 *
 * Sayfanın tek prominent CTA'sı buradadır ve yaşam döngüsü aktif değilken
 * iletişim eylemleri kapanır; gerekçe gizlenmez, kolonda metin olarak durur.
 * Kolon sayfanın cam yüzeylerinden birini açar (eylem çubuğu); içindeki fiyat,
 * özet ve satıcı blokları düz yüzeydir — cam üstüne cam yoktur.
 *
 * Ray numarayı açmaz: ikincil eylem kullanıcıyı satıcı bölümündeki tek
 * numara kontrolüne taşır. Böylece açılış mantığı tek yerde kalır ve rayda
 * hiçbir zaman işlevsiz bir buton bulunmaz: işleyicisi olmayan eylem
 * `disabled` durur, gerekçesi notta yazılıdır.
 */
export function ListingDecisionRail({
  detail,
  priceNote,
  onContact,
  onGoToSeller,
}: ListingDecisionRailProps) {
  const [saved, setSaved] = useState(false)
  const closedReason = contactClosedReason(detail.lifecycle)
  const contactClosed = closedReason !== undefined
  const { seller } = detail
  const score = verificationScore(detail.verification)
  const issues = criticalIssues(detail)
  const negatives = detail.verification.filter((row) => row.state === 'negative')
  const unknowns = detail.verification.filter((row) => row.state === 'unknown')

  // Gerekçeler sırayla birikir: önce bağlanmamış yetenekler, sonra bağlam.
  // İletişim kapalıyken neden zaten rayın üstündeki uyarıda yazılıdır.
  const notes: string[] = []
  if (!onContact) notes.push(CONTACT_NOT_CONNECTED)
  if (!onGoToSeller && !contactClosed) notes.push(SELLER_NAV_NOT_AVAILABLE)
  if (!contactClosed && seller.respondsInHours !== undefined) {
    notes.push(`Ortalama yanıt süresi ${seller.respondsInHours} saat.`)
  }

  return (
    <aside className={styles.rail} aria-label="Karar kolonu">
      <div className={styles.priceBlock}>
        <p className={styles.price}>{formatPrice(detail.price.amount)}</p>
        <dl className={styles.priceFacts}>
          <div>
            <dt>Birim fiyat</dt>
            <dd>{formatUnitPrice(detail.price.unitPrice)}</dd>
          </div>
          <div>
            <dt>Beyan edilen alan</dt>
            <dd>{formatArea(detail.price.declaredArea)}</dd>
          </div>
        </dl>
        <p className={styles.priceBasis}>{priceNote}</p>
      </div>

      <div className={styles.verificationSummary}>
        <h3 className={styles.railTitle}>Doğrulama</h3>
        <p className={styles.railFact}>
          {`${score.total} kontrolün ${score.positive} tanesi olumlu`}
        </p>
        {negatives.map((row) => (
          <p key={row.id} className={styles.railState} data-state="negative">
            <span className={styles.stateDot} aria-hidden="true" />
            {`${STATE_LABEL.negative}: ${row.title}`}
          </p>
        ))}
        {unknowns.length > 0 ? (
          <p className={styles.railState} data-state="unknown">
            <span className={styles.stateDot} aria-hidden="true" />
            {`${STATE_LABEL.unknown}: ${unknowns.length} kontrolün sonucu kayıtta yok`}
          </p>
        ) : null}
        <a className={styles.railLink} href={`#${VERIFICATION_SECTION_ID}`}>
          Doğrulama vektörünün tamamı
        </a>
      </div>

      <section className={styles.critical} aria-labelledby="kritik-baslik">
        <h3 id="kritik-baslik" className={styles.railTitle}>
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

      {closedReason ? (
        <GlassAlert severity="warning" title="İletişim kapalı">
          {closedReason}
        </GlassAlert>
      ) : null}

      <GlassDetailActionBar
        label="Karar ve iletişim"
        layout="rail"
        primary={{
          id: 'contact',
          label: 'Mesaj gönder',
          onSelect: () => onContact?.(),
          disabled: contactClosed || !onContact,
        }}
        secondary={{
          id: 'seller',
          label: 'Satıcı bilgilerine git',
          onSelect: () => onGoToSeller?.(),
          disabled: contactClosed || !onGoToSeller,
        }}
        utilities={[
          {
            id: 'save',
            label: saved ? 'Kayıtlı' : 'Kaydet',
            pressed: saved,
            onSelect: () => setSaved((value) => !value),
          },
        ]}
        note={notes.length > 0 ? notes.join(' ') : undefined}
      />

      <div className={styles.sellerSummary}>
        <p className={styles.sellerName}>{seller.name}</p>
        <p className={styles.sellerMeta}>{sellerTypeLabel(seller.type)}</p>
        {/* Yetki belgesi satırı yalnız kontrolün gerçekten uygulanabildiği
            yerde bir sonuç bildirir. Bireysel satıcı TTBS kapsamında
            değildir; orada "doğrulanamadı" demek hiç yapılmamış bir kontrolün
            başarısız olduğunu iddia etmek olurdu. Metinler satıcı bölümüyle
            tek kaynaktan gelir (`seller-copy.ts`). */}
        {seller.type === 'agency' ? (
          seller.licence?.value ? (
            <p className={styles.sellerMeta}>{`Yetki belgesi: ${seller.licence.value}`}</p>
          ) : (
            <p className={styles.sellerMeta}>{AGENCY_LICENCE_UNVERIFIED}</p>
          )
        ) : (
          <p className={styles.sellerMeta}>{INDIVIDUAL_TTBS_SCOPE_NOTE}</p>
        )}
        {seller.activeListings !== undefined ? (
          <p className={styles.sellerMeta}>{`${seller.activeListings} aktif ilan`}</p>
        ) : null}
      </div>
    </aside>
  )
}
