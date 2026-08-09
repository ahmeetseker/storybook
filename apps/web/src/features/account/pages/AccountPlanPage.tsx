import { useState } from 'react'
import { GlassPricingTable } from '@repo/ui'

import {
  OFFICE_PLANS,
  defaultSeats,
  officePlanById,
  toPricingPlans,
  type OfficePlanId,
} from '@/features/pricing/data/office-plans'
import type { AccountDashboardData } from '../domain/account-types'

import styles from './AccountPages.module.css'

const moneyFormatter = new Intl.NumberFormat('tr-TR')

export interface AccountPlanPageProps {
  /** Hesap panelinin normalize edilmiş verisi — fatura dönemi buradan okunur. */
  data: AccountDashboardData
  /**
   * Ofisin yürürlükteki paketi.
   *
   * Abonelik henüz `AccountDashboardData` içinde taşınmıyor: fatura ucu
   * ödemeleri ve faturaları döndürüyor, planı değil. Bu yüzden geçici olarak
   * prop'tan gelir ve rota sabit veriyle besler; uç nokta açıldığında burası
   * `data.subscription`a bağlanır ve prop düşer.
   */
  currentPlanId?: OfficePlanId
  /** Yürürlükteki koltuk adedi; verilmezse paketin dahil ettiği kadar. */
  currentSeats?: number
  onPlanChange?: (planId: OfficePlanId, seats: number) => void
}

/**
 * "Paketim" alt sayfası: yürürlükteki paketin künyesi + yükseltme/düşürme.
 *
 * Mevcut paketin eylemi bilinçli olarak PASİF metindir ("Mevcut paketiniz"):
 * bir kullanıcının zaten sahip olduğu şeyi satın alabiliyormuş gibi görünen
 * bir buton, faturalama ekranlarında en pahalı yanlış anlamadır.
 *
 * Sayfa yalnız içeriği döndürür — `main`/kapsayıcı kabuktan gelir.
 */
export function AccountPlanPage({
  data,
  currentPlanId = 'profesyonel',
  currentSeats,
  onPlanChange,
}: AccountPlanPageProps) {
  const current = officePlanById(currentPlanId)
  const seatsInUse = currentSeats ?? current.seats.included

  const [seats, setSeats] = useState<Record<string, number>>(() => ({
    ...defaultSeats(),
    [currentPlanId]: seatsInUse,
  }))

  const plans = toPricingPlans({
    actionLabel: (plan) =>
      OFFICE_PLANS.findIndex((item) => item.id === plan.id) >
      OFFICE_PLANS.findIndex((item) => item.id === currentPlanId)
        ? 'Bu pakete yükselt'
        : 'Bu pakete geç',
    hideActionFor: currentPlanId,
    onSelect: (planId) => onPlanChange?.(planId, seats[planId] ?? current.seats.included),
  })

  const lastPayment = data.billing?.payments?.[0]?.dateLabel

  return (
    <>
      <h1 className={styles.pageTitle}>Paketim</h1>

      <dl className={styles.planSummary}>
        <div>
          <dt>Yürürlükteki paket</dt>
          <dd>{current.name}</dd>
        </div>
        <div>
          <dt>Danışman koltuğu</dt>
          <dd>
            {seatsInUse} koltuk
            {seatsInUse > current.seats.included
              ? ` (${current.seats.included} dahil + ${seatsInUse - current.seats.included} ek)`
              : ' (pakete dahil)'}
          </dd>
        </div>
        <div>
          <dt>Aylık tutar</dt>
          <dd>
            ₺
            {moneyFormatter.format(
              current.monthly +
                current.seats.extraMonthly * Math.max(0, seatsInUse - current.seats.included),
            )}
          </dd>
        </div>
        {lastPayment ? (
          <div>
            <dt>Son işlem</dt>
            <dd>{lastPayment}</dd>
          </div>
        ) : null}
      </dl>

      <section className={styles.planTable} aria-labelledby="paket-degistir">
        <h2 id="paket-degistir">Paket değiştir</h2>
        <p className={styles.planIntro}>
          Yükseltme anında geçerli olur, kalan süreniz yeni pakete oranlanarak işlenir. Düşürme
          bir sonraki fatura döneminde başlar.
        </p>
        <GlassPricingTable
          plans={plans}
          seats={seats}
          onSeatsChange={(planId, count) => setSeats((prev) => ({ ...prev, [planId]: count }))}
        />
      </section>
    </>
  )
}
