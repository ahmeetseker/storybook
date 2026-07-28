import { useCallback, useEffect, useRef, useState } from 'react'
import { GlassAgencyCard, GlassAlert, GlassButton, type GlassAgencyCardStat } from '@repo/ui'

import type { ListingDetail } from '../domain/listing-detail-types'
import { criticalIssues } from '../domain/listing-detail-view-model'
import { contactClosedReason, formatDateShort, formatNumber } from '../format'
import { EvidenceList, EvidenceRow } from './EvidenceRow'
import { SELLER_REVEAL_CONTROL_ID } from './seller-reveal'
import styles from '../ListingDetailWorkspace.module.css'

/**
 * Analitiğe giden olay adları.
 *
 * Union tipi bilinçlidir: numaranın kendisi (veya numarayı taşıyan herhangi
 * bir yük) bu kanaldan geçemez — çağıran taraf yalnız olayın gerçekleştiğini
 * öğrenir.
 */
export type SellerPhoneAnalyticsEvent =
  | 'seller_phone_reveal_requested'
  | 'seller_phone_reveal_succeeded'
  | 'seller_phone_reveal_failed'

export interface SellerSectionProps {
  detail: ListingDetail
  /**
   * Numarayı istek anında getirir. `phone` prop'u yoktur: numara sayfa
   * kaynağında bulunmaz, yalnız kullanıcı istediğinde bu çağrıdan gelir.
   * Verilmezse numara açma kontrolü hiç render edilmez (ölü buton yok).
   */
  onRevealPhone?: () => Promise<string>
  /** Kontrollü desen: numara açık mı */
  revealed?: boolean
  /** Kontrolsüz başlangıç değeri */
  defaultRevealed?: boolean
  onRevealedChange?: (revealed: boolean) => void
  /** Yalnız olay adı gider; numara asla analitiğe verilmez. */
  onAnalyticsEvent?: (event: SellerPhoneAnalyticsEvent) => void
}

/** TTBS'in kapsamı görünür metindir: faaliyet yetkisi ilan içeriğini doğrulamaz. */
const TTBS_SCOPE_NOTE =
  'TTBS, işletmenin faaliyet yetkisidir; ilan içeriğinin doğruluğunu göstermez.'

const REVEAL_FAILURE_TEXT =
  'Numara şu anda gösterilemiyor. Birkaç dakika sonra tekrar deneyin.'

function sellerTypeLabel(type: ListingDetail['seller']['type']): string {
  return type === 'agency' ? 'Emlak ofisi' : 'Bireysel ilan sahibi'
}

/** `tel:` hedefi yalnız rakam ve ülke kodu taşır (bkz. GlassAgencyCard aynı kural). */
function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

function sellerStats(seller: ListingDetail['seller']): GlassAgencyCardStat[] {
  const stats: GlassAgencyCardStat[] = []
  if (seller.activeListings !== undefined) {
    stats.push({ label: 'Aktif ilan', value: formatNumber(seller.activeListings) })
  }
  if (seller.respondsInHours !== undefined) {
    stats.push({ label: 'Ortalama yanıt', value: `${formatNumber(seller.respondsInHours)} saat` })
  }
  if (seller.memberSince) {
    stats.push({ label: 'Üyelik', value: formatDateShort(seller.memberSince) })
  }
  return stats
}

/**
 * Satıcı bölümü.
 *
 * İçerik katmanındadır — cam açmaz; kimlik kartı ve yetki belgesi künyesi düz
 * yüzeydedir. Numara açma kontrolü sayfanın kontrol katmanına ait tek cam
 * yüzeydir ve yalnız `onRevealPhone` verildiğinde render edilir.
 *
 * Numara sözleşmesi: `phone` prop'u yoktur, numara istek anında getirilir,
 * başarıda odak numaraya taşınır, başarısızlıkta gerekçe görünür ve kontrol
 * tekrar denenebilir kalır. Analitiğe numara değil yalnız olay adı gider.
 */
export function SellerSection({
  detail,
  onRevealPhone,
  revealed,
  defaultRevealed,
  onRevealedChange,
  onAnalyticsEvent,
}: SellerSectionProps) {
  const { seller } = detail
  const closedReason = contactClosedReason(detail.lifecycle)
  const contactClosed = closedReason !== undefined

  const [uncontrolledRevealed, setUncontrolledRevealed] = useState(defaultRevealed ?? false)
  const isRevealed = revealed ?? uncontrolledRevealed
  const [phone, setPhone] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  // Tek uçuş kilidi: aynı açılış için sağlayıcı bir kez çağrılır. Hata
  // durumunda kilit açılır — tekrar denemek yeni bir istek üretebilmelidir.
  const requestedRef = useRef(false)
  const shouldFocusRef = useRef(false)
  const linkRef = useRef<HTMLAnchorElement>(null)

  const commitRevealed = useCallback(
    (next: boolean) => {
      if (revealed === undefined) setUncontrolledRevealed(next)
      onRevealedChange?.(next)
    },
    [revealed, onRevealedChange],
  )

  const request = useCallback(
    async (focusAfter: boolean) => {
      if (!onRevealPhone || requestedRef.current) return
      requestedRef.current = true
      setStatus('loading')
      onAnalyticsEvent?.('seller_phone_reveal_requested')
      try {
        const value = await onRevealPhone()
        shouldFocusRef.current = focusAfter
        setPhone(value)
        setStatus('idle')
        onAnalyticsEvent?.('seller_phone_reveal_succeeded')
      } catch {
        requestedRef.current = false
        setStatus('error')
        commitRevealed(false)
        onAnalyticsEvent?.('seller_phone_reveal_failed')
      }
    },
    [onRevealPhone, onAnalyticsEvent, commitRevealed],
  )

  // `defaultRevealed`/kontrollü `revealed` ile açık başlayan görünüm de numarayı
  // istek anında getirir; bu yol odağı çalmaz (kullanıcı henüz basmadı).
  useEffect(() => {
    if (contactClosed || phone !== null || status === 'error') return
    if (isRevealed) void request(false)
  }, [contactClosed, isRevealed, phone, status, request])

  useEffect(() => {
    if (phone !== null && shouldFocusRef.current) {
      shouldFocusRef.current = false
      linkRef.current?.focus()
    }
  }, [phone])

  const handleReveal = () => {
    commitRevealed(true)
    void request(true)
  }

  const questions = criticalIssues(detail)
    .map((issue) => issue.action)
    .filter((action): action is string => Boolean(action))

  return (
    <section id="satici" className={styles.section} aria-labelledby="satici-baslik">
      <h2 id="satici-baslik" className={styles.sectionTitle}>
        Satıcı
      </h2>

      <GlassAgencyCard
        name={seller.name}
        tagline={sellerTypeLabel(seller.type)}
        stats={sellerStats(seller)}
        className={styles.sellerCard}
      />

      {seller.type === 'agency' ? (
        <div className={styles.sellerLicence}>
          {seller.licence ? (
            <EvidenceList>
              <EvidenceRow
                label="Yetki belgesi"
                value={seller.licence}
                fallbackText="Yetki belgesi kaydı bulunamadı — bu, belgenin olmadığı anlamına gelmez."
                note={TTBS_SCOPE_NOTE}
              />
            </EvidenceList>
          ) : (
            <>
              <p className={styles.blockNote}>
                Yetki belgesi kaydı bulunamadı. Kaydın bulunmaması belgenin olmadığı anlamına
                gelmez.
              </p>
              <p className={styles.blockNote}>{TTBS_SCOPE_NOTE}</p>
            </>
          )}
        </div>
      ) : (
        <p className={styles.blockNote}>
          Bireysel ilan sahipleri TTBS yetki belgesi kapsamında değildir. {TTBS_SCOPE_NOTE}
        </p>
      )}

      <div className={styles.reveal}>
        {contactClosed ? (
          <p className={styles.blockNote}>
            İlan yayında olmadığı için numara paylaşımı kapalı. Bu görünüm arşiv kaydıdır.
          </p>
        ) : phone !== null ? (
          <p className={styles.revealedPhone}>
            <a
              ref={linkRef}
              id={SELLER_REVEAL_CONTROL_ID}
              href={toTelHref(phone)}
              className={styles.phoneLink}
            >
              {phone}
            </a>
          </p>
        ) : onRevealPhone ? (
          <GlassButton
            id={SELLER_REVEAL_CONTROL_ID}
            onClick={handleReveal}
            loading={status === 'loading'}
            className={styles.revealButton}
          >
            Numarayı göster
          </GlassButton>
        ) : (
          <p className={styles.blockNote}>
            Numara yalnız istek anında sunucudan alınır; bu görünümde numara servisi bağlı değil.
          </p>
        )}

        {status === 'error' ? (
          <GlassAlert severity="warning" title="Numara alınamadı">
            {REVEAL_FAILURE_TEXT}
          </GlassAlert>
        ) : null}

        <p className={styles.blockNote}>
          Numara bu sayfada saklanmaz; yalnız siz istediğinizde getirilir.
        </p>
      </div>

      {questions.length > 0 ? (
        <div className={styles.sellerAsk}>
          <h3 className={styles.subTitle}>Görüşmede sorulacaklar</h3>
          <p className={styles.blockNote}>
            Özet bölümündeki açık konuların satıcıya yöneltilecek hâli. Bu adımları platform sizin
            adınıza atmaz.
          </p>
          <ul className={styles.askList}>
            {questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
