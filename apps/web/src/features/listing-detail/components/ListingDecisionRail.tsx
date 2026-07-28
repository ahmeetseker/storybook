import { useState } from 'react'
import { GlassAlert, GlassDetailActionBar } from '@repo/ui'

import type { ListingDetail } from '../domain/listing-detail-types'
import { contactClosedReason } from '../format'
import styles from '../ListingDetailWorkspace.module.css'

export interface ListingDecisionRailProps {
  detail: ListingDetail
  /** Mesaj akışı sayfa kabuğunda bağlanır; verilmezse eylem yalnız görünür kalır. */
  onContact?: () => void
  /**
   * Kullanıcıyı satıcı bölümündeki numara kontrolüne götürür. Ray numarayı
   * kendisi açmaz — açılış sayfada tek bir yerde olur. Verilmezse ikincil
   * eylem hiç render edilmez (işlevsiz buton gösterilmez).
   */
  onGoToSeller?: () => void
}

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
 * hiçbir zaman işlevsiz bir buton bulunmaz.
 */
export function ListingDecisionRail({ detail, onContact, onGoToSeller }: ListingDecisionRailProps) {
  const [saved, setSaved] = useState(false)
  const closedReason = contactClosedReason(detail.lifecycle)
  const contactClosed = closedReason !== undefined
  const { seller } = detail

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
          disabled: contactClosed,
        }}
        secondary={
          onGoToSeller
            ? {
                id: 'seller',
                label: 'Satıcı bilgilerine git',
                onSelect: onGoToSeller,
                disabled: contactClosed,
              }
            : undefined
        }
        utilities={[
          {
            id: 'save',
            label: saved ? 'Kayıtlı' : 'Kaydet',
            pressed: saved,
            onSelect: () => setSaved((value) => !value),
          },
        ]}
        note={
          contactClosed
            ? undefined
            : seller.respondsInHours
              ? `Ortalama yanıt süresi ${seller.respondsInHours} saat.`
              : undefined
        }
      />

      <div className={styles.sellerSummary}>
        <p className={styles.sellerName}>{seller.name}</p>
        <p className={styles.sellerMeta}>{sellerTypeLabel(seller.type)}</p>
        {seller.licence?.value ? (
          <p className={styles.sellerMeta}>{`Yetki belgesi: ${seller.licence.value}`}</p>
        ) : (
          <p className={styles.sellerMeta}>Yetki belgesi doğrulanamadı.</p>
        )}
        {seller.activeListings !== undefined ? (
          <p className={styles.sellerMeta}>{`${seller.activeListings} aktif ilan`}</p>
        ) : null}
      </div>
    </div>
  )
}
