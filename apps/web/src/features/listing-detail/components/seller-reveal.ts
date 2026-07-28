import type { ListingDetail } from '../domain/listing-detail-types'
import { contactClosedReason } from '../format'

/**
 * Numaranın açıldığı **tek** kontrolün kimliği.
 *
 * Sayfadaki başka bir eylem (ör. karar rayı) numarayı kendisi açmaz; bu
 * kimliğe sahip kontrole odak taşıyarak kullanıcıyı çalışan tek yere götürür.
 * Kimlik her zaman o an canlı olan öğededir: numara açılmadan önce butonda,
 * açıldıktan sonra `tel:` bağlantısında. Kontrol hiç yoksa (iletişim kapalı
 * veya `onRevealPhone` verilmemiş) bu kimlik DOM'da bulunmaz.
 */
export const SELLER_REVEAL_CONTROL_ID = 'satici-numara-kontrolu'

/**
 * Satıcı bölümünde numara kontrolünün render edilip edilmeyeceğini söyler.
 *
 * Karar rayı bu yüklemi kullanır: kontrol yoksa rayın "Satıcı bilgilerine git"
 * eylemi hiç render edilmez — render edilip işlevsiz kalmaz.
 */
export function hasSellerRevealControl(
  detail: ListingDetail,
  onRevealPhone?: () => Promise<string>,
): boolean {
  return onRevealPhone !== undefined && contactClosedReason(detail.lifecycle) === undefined
}
