import { useState } from 'react'
import { GlassAlert, GlassDetailActionBar } from '@repo/ui'

import type { ListingDetail } from '../domain/listing-detail-types'
import { contactClosedReason } from '../format'
import { AGENCY_LICENCE_UNVERIFIED, INDIVIDUAL_TTBS_SCOPE_NOTE } from './seller-copy'
import styles from '../ListingDetailWorkspace.module.css'

export interface ListingDecisionRailProps {
  detail: ListingDetail
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
 * Karar ve iletişim rayı.
 *
 * Sayfanın tek prominent CTA'sı buradadır ve yaşam döngüsü aktif değilken
 * iletişim eylemleri kapanır; gerekçe gizlenmez, rayın üstünde metin olarak
 * durur. Ray sayfanın cam yüzeylerinden biridir — içindeki satıcı özeti
 * cam açmaz (cam üstüne cam yok).
 *
 * Ray numarayı açmaz: ikincil eylem kullanıcıyı satıcı bölümündeki tek
 * numara kontrolüne taşır. Böylece açılış mantığı tek yerde kalır ve rayda
 * hiçbir zaman işlevsiz bir buton bulunmaz: işleyicisi olmayan eylem
 * `disabled` durur, gerekçesi notta yazılıdır.
 */
export function ListingDecisionRail({ detail, onContact, onGoToSeller }: ListingDecisionRailProps) {
  const [saved, setSaved] = useState(false)
  const closedReason = contactClosedReason(detail.lifecycle)
  const contactClosed = closedReason !== undefined
  const { seller } = detail

  // Gerekçeler sırayla birikir: önce bağlanmamış yetenekler, sonra bağlam.
  // İletişim kapalıyken neden zaten rayın üstündeki uyarıda yazılıdır.
  const notes: string[] = []
  if (!onContact) notes.push(CONTACT_NOT_CONNECTED)
  if (!onGoToSeller && !contactClosed) notes.push(SELLER_NAV_NOT_AVAILABLE)
  if (!contactClosed && seller.respondsInHours !== undefined) {
    notes.push(`Ortalama yanıt süresi ${seller.respondsInHours} saat.`)
  }

  return (
    <div className={styles.rail}>
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
    </div>
  )
}
