import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { motion } from 'motion/react'
import { GlassButton } from '../GlassButton'
import { GlassSegmentedControl } from '../GlassSegmentedControl'
import { useElementSize } from '../GlassSurface/useElementSize'
import { prefersReducedMotion } from '../../core/tier'
import styles from './GlassPricingTable.module.css'

/** Faturalama dönemi — component'in tek fiyat ekseni. */
export type GlassPricingPeriod = 'monthly' | 'yearly'

/**
 * Yerleşim ekseni.
 * - `auto` (varsayılan): konteyner genişliği ölçülür, eşiğin altında `compact`.
 * - `grid`: kart ızgarası (kolon sayısını CSS konteyner sorgusu seçer).
 * - `compact`: seçilebilir plan listesi — yalnız seçili plan açılır.
 */
export type GlassPricingLayout = 'auto' | 'grid' | 'compact'

/** Koltuk (kullanıcı) tabanlı fiyatlama; verilmezse plan tek kullanıcılıktır. */
export interface GlassPricingSeats {
  /** Taban fiyata dahil kullanıcı adedi */
  included: number
  /** Seçilebilecek en yüksek adet; `included` ile eşitse kontrol çizilmez */
  max?: number
  /** Aylık dönemde ek kullanıcı başına tutar */
  extraMonthly?: number
  /** Yıllık dönemde ek kullanıcı başına tutar */
  extraYearly?: number
}

export interface GlassPricingAction {
  label: string
  onSelect?: (planId: string) => void
}

export interface GlassPricingPlan {
  id: string
  name: string
  /** Kısa tür etiketi — kompakt modda adın altında görünür ("danışman") */
  kind?: string
  description: string
  /** Dönem başına taban tutar (kuruşsuz) */
  price: { monthly: number; yearly: number }
  seats?: GlassPricingSeats
  action: GlassPricingAction
  secondaryAction?: GlassPricingAction
  /** Özellik listesi başlığı — "Bireysel'deki her şey, ayrıca" */
  featuresTitle: string
  features: string[]
  /** Vurgulanan plan — sayfada EN FAZLA bir tane; ikincisi hiyerarşiyi düzler */
  prominent?: boolean
  badge?: string
}

export interface GlassPricingTableProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  plans: GlassPricingPlan[]

  /* — dönem ekseni (controlled deseni) — */
  period?: GlassPricingPeriod
  defaultPeriod?: GlassPricingPeriod
  onPeriodChange?: (period: GlassPricingPeriod) => void

  /* — seçili plan; yalnız kompakt yerleşimde görünür etkisi vardır — */
  selectedPlanId?: string
  defaultSelectedPlanId?: string
  onSelectedPlanChange?: (planId: string) => void

  /* — kullanıcı adedi: plan id → adet — */
  seats?: Record<string, number>
  defaultSeats?: Record<string, number>
  onSeatsChange?: (planId: string, count: number) => void

  layout?: GlassPricingLayout
  /** Para birimi sembolü — rakamın soluna yazılır */
  currency?: string
  /** `Intl.NumberFormat` yerelleştirmesi */
  locale?: string
  /** Yıllık segmentteki indirim rozeti; verilmezse ilk plandan hesaplanır */
  yearlyDiscountLabel?: string
  /** Fiyat rulosu — uzun listelerde veya testte kapatılabilir */
  animatePrice?: boolean
  /** Kompakt moddaki tek eylemin etiketi; `{plan}` seçili plan adıyla değişir */
  compactActionLabel?: string
  footnote?: ReactNode
}

/** `grid` → `compact` eşiği (px). CSS konteyner sorgusuyla aynı değer. */
const COMPACT_MAX_WIDTH = 620

const PERIOD_OPTIONS: GlassPricingPeriod[] = ['monthly', 'yearly']

function seatCount(plan: GlassPricingPlan, seats: Record<string, number>) {
  const included = plan.seats?.included ?? 1
  return seats[plan.id] ?? included
}

function seatMax(plan: GlassPricingPlan) {
  return plan.seats?.max ?? plan.seats?.included ?? 1
}

/** Ek kullanıcı ücretlendirilebiliyor mu — adet kontrolü buna göre çizilir. */
function isSeatAdjustable(plan: GlassPricingPlan) {
  if (!plan.seats) return false
  const extra = (plan.seats.extraMonthly ?? 0) + (plan.seats.extraYearly ?? 0)
  return extra > 0 && seatMax(plan) > plan.seats.included
}

function totalPrice(plan: GlassPricingPlan, period: GlassPricingPeriod, count: number) {
  const base = period === 'yearly' ? plan.price.yearly : plan.price.monthly
  if (!plan.seats) return base
  const extra = period === 'yearly' ? plan.seats.extraYearly : plan.seats.extraMonthly
  const over = Math.max(0, count - plan.seats.included)
  return base + (extra ?? 0) * over
}

/**
 * Rakam rulosu — basamaklar dikey bir şeritte kayar (odometre).
 *
 * Slot anahtarları SAĞDAN sayılır: 249 → 2.390 geçişinde birler basamağı
 * birler basamağından devralır, yani rulo gerçekten "sayar". Genişlik değişimi
 * `motion` layout animasyonuna bırakılır; `/ay` eki zıplamaz.
 */
function PriceOdometer({
  value,
  currency,
  locale,
  animate,
}: {
  value: number
  currency: string
  locale: string
  animate: boolean
}) {
  const format = useMemo(() => new Intl.NumberFormat(locale), [locale])
  const chars = format.format(value).split('')
  const lastIndex = chars.length - 1

  return (
    <span className={styles.price} aria-hidden>
      <span className={styles.currency}>{currency}</span>
      <motion.span className={styles.slots} layout={animate ? 'position' : false}>
        {chars.map((char, index) => {
          const fromRight = lastIndex - index
          const digit = Number(char)
          if (Number.isNaN(digit)) {
            return (
              <span key={`s${fromRight}`} className={`${styles.slot} ${styles.separator}`}>
                {char}
              </span>
            )
          }
          return (
            <span key={`d${fromRight}`} className={styles.slot}>
              <span
                className={styles.reel}
                style={{
                  // Şeridi hedef basamağa taşır; gecikme soldan sağa artar.
                  transform: `translateY(${-digit}em)`,
                  transitionDelay: animate ? `${index * 46}ms` : '0ms',
                  transitionDuration: animate ? undefined : '0ms',
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          )
        })}
      </motion.span>
    </span>
  )
}

function TickIcon() {
  return (
    <svg className={styles.tick} viewBox="0 0 20 20" aria-hidden focusable="false">
      <circle cx="10" cy="10" r="9" />
      <path d="M6.2 10.4 L8.8 13 L13.8 7.4" />
    </svg>
  )
}

function FeatureList({ plan, staggered }: { plan: GlassPricingPlan; staggered: boolean }) {
  return (
    <div className={styles.features}>
      <h4 className={styles.featuresTitle}>{plan.featuresTitle}</h4>
      <ul className={styles.featureList}>
        {plan.features.map((feature, index) => (
          <li
            key={feature}
            className={styles.feature}
            style={staggered ? { ['--lg-pricing-stagger' as string]: `${60 + index * 45}ms` } : undefined}
          >
            <TickIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GlassPricingTable({
  plans,
  period,
  defaultPeriod = 'monthly',
  onPeriodChange,
  selectedPlanId,
  defaultSelectedPlanId,
  onSelectedPlanChange,
  seats,
  defaultSeats,
  onSeatsChange,
  layout = 'auto',
  currency = '₺',
  locale = 'tr-TR',
  yearlyDiscountLabel,
  animatePrice = true,
  compactActionLabel = '{plan} ile devam et',
  footnote,
  className,
  ...rest
}: GlassPricingTableProps) {
  const baseId = useId()
  const reduced = prefersReducedMotion()
  const animate = animatePrice && !reduced

  const [innerPeriod, setInnerPeriod] = useState<GlassPricingPeriod>(defaultPeriod)
  const currentPeriod = period ?? innerPeriod

  const firstProminent = plans.find((p) => p.prominent)?.id
  const [innerSelected, setInnerSelected] = useState<string>(
    defaultSelectedPlanId ?? firstProminent ?? plans[0]?.id ?? '',
  )
  const currentSelected = selectedPlanId ?? innerSelected

  const [innerSeats, setInnerSeats] = useState<Record<string, number>>(defaultSeats ?? {})
  const currentSeats = seats ?? innerSeats

  /* Yerleşim: `auto` ise konteyner genişliği karar verir. Bu bir GÖRÜNÜM
     değil ETKİLEŞİM kararıdır (kompaktta planlar radiogroup olur), bu yüzden
     CSS konteyner sorgusu yetmez — ölçüm gerekir. */
  const { ref: sizeRef, size } = useElementSize<HTMLDivElement>()
  const resolvedLayout: Exclude<GlassPricingLayout, 'auto'> =
    layout === 'auto' ? (size && size.width < COMPACT_MAX_WIDTH ? 'compact' : 'grid') : layout
  const compact = resolvedLayout === 'compact'

  const selectPeriod = (next: string) => {
    const value = next as GlassPricingPeriod
    if (period === undefined) setInnerPeriod(value)
    onPeriodChange?.(value)
  }

  const selectPlan = useCallback(
    (planId: string) => {
      if (selectedPlanId === undefined) setInnerSelected(planId)
      onSelectedPlanChange?.(planId)
    },
    [selectedPlanId, onSelectedPlanChange],
  )

  const stepSeats = (plan: GlassPricingPlan, delta: number) => {
    const included = plan.seats?.included ?? 1
    const next = Math.min(seatMax(plan), Math.max(included, seatCount(plan, currentSeats) + delta))
    if (next === seatCount(plan, currentSeats)) return
    if (seats === undefined) setInnerSeats((prev) => ({ ...prev, [plan.id]: next }))
    onSeatsChange?.(plan.id, next)
  }

  // Yıllık indirim rozeti verilmediyse ilk plandan hesaplanır.
  const discountLabel = useMemo(() => {
    if (yearlyDiscountLabel !== undefined) return yearlyDiscountLabel
    const sample = plans[0]
    if (!sample || sample.price.monthly <= 0) return undefined
    const ratio = 1 - sample.price.yearly / (sample.price.monthly * 12)
    if (ratio <= 0.005) return undefined
    return `%${Math.round(ratio * 100)} indirim`
  }, [plans, yearlyDiscountLabel])

  const periodOptions = PERIOD_OPTIONS.map((value) => ({
    value,
    label: value === 'monthly' ? 'Aylık' : 'Yıllık',
  }))

  const savingsOf = (plan: GlassPricingPlan) => {
    const count = seatCount(plan, currentSeats)
    return totalPrice(plan, 'monthly', count) * 12 - totalPrice(plan, 'yearly', count)
  }

  const money = (value: number) => `${currency}${new Intl.NumberFormat(locale).format(value)}`
  const periodSuffix = currentPeriod === 'yearly' ? '/yıl' : '/ay'

  /* Kompakt liste: radiogroup + roving tabindex (GlassSegmentedControl deseni) */
  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key)) return
    const index = plans.findIndex((p) => p.id === currentSelected)
    if (index === -1) return
    event.preventDefault()
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % plans.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + plans.length) % plans.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = plans.length - 1
    const target = plans[next]
    selectPlan(target.id)
    document.getElementById(`${baseId}-plan-${target.id}`)?.focus()
  }

  // Seçili plan listeden çıkarsa (plans değişti) ilk plana düş.
  // `selectPlan` her render'da yeniden kurulur; effect'i ona bağlamak sonsuz
  // döngü riski taşır, bu yüzden çağrı bir ref üzerinden yapılır.
  const selectRef = useRef(selectPlan)
  selectRef.current = selectPlan
  useEffect(() => {
    if (plans.length === 0) return
    // Seçim geçerliyse hiçbir şey yapılmaz; geçersizse ilk plana düşülür ve
    // bir sonraki render'da bu koşul sağlanacağı için effect kendini durdurur.
    if (plans.some((plan) => plan.id === currentSelected)) return
    selectRef.current(plans[0].id)
  }, [plans, currentSelected])

  const selectedPlan = plans.find((p) => p.id === currentSelected) ?? plans[0]

  const rootClass = [styles.root, compact ? styles.isCompact : styles.isGrid, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={sizeRef} className={rootClass} data-layout={resolvedLayout} {...rest}>
      <div className={styles.controls}>
        <GlassSegmentedControl
          options={periodOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          value={currentPeriod}
          onChange={selectPeriod}
          label="Faturalama dönemi"
          className={styles.periodSwitch}
        />
        {discountLabel ? (
          <span className={styles.discount} data-active={currentPeriod === 'yearly'}>
            {discountLabel}
          </span>
        ) : null}
      </div>

      {compact ? (
        <>
          <div
            className={styles.planList}
            role="radiogroup"
            aria-label="Plan seçimi"
            onKeyDown={onListKeyDown}
          >
            {plans.map((plan) => {
              const isSelected = plan.id === currentSelected
              const count = seatCount(plan, currentSeats)
              const included = plan.seats?.included ?? 1
              const adjustable = isSeatAdjustable(plan)
              const bodyId = `${baseId}-body-${plan.id}`

              return (
                <div key={plan.id} className={styles.planRow} data-selected={isSelected}>
                  <button
                    type="button"
                    role="radio"
                    id={`${baseId}-plan-${plan.id}`}
                    aria-checked={isSelected}
                    aria-controls={bodyId}
                    tabIndex={isSelected ? 0 : -1}
                    className={styles.planHit}
                    onClick={() => selectPlan(plan.id)}
                  >
                    <span className={styles.dot} aria-hidden>
                      <i />
                    </span>
                    <span className={styles.planIdentity}>
                      <b className={styles.planName}>{plan.name}</b>
                      <span className={styles.planSub}>
                        {plan.kind ? <small>{plan.kind}</small> : null}
                        {plan.badge ? <span className={styles.badge}>{plan.badge}</span> : null}
                      </span>
                    </span>
                    <span className={styles.planPrice}>
                      <PriceOdometer
                        value={totalPrice(plan, currentPeriod, count)}
                        currency={currency}
                        locale={locale}
                        animate={animate}
                      />
                      <small className={styles.periodSuffix}>{periodSuffix}</small>
                      <span className={styles.savings} data-visible={currentPeriod === 'yearly'}>
                        {currentPeriod === 'yearly' ? `Yılda ${money(savingsOf(plan))} tasarruf` : ' '}
                      </span>
                    </span>
                  </button>

                  {/* Kapalı gövde DOM'da kalır (0fr→1fr geçişi için) ama inert'tir
                      — klavye ve AT gezinmesinden çıkar (GlassFeatureGroup deseni). */}
                  <div
                    id={bodyId}
                    className={styles.planBody}
                    data-open={isSelected}
                    inert={!isSelected ? true : undefined}
                  >
                    <div>
                      <div className={styles.planBodyInner}>
                        <FeatureList plan={plan} staggered />
                        <div className={styles.seats}>
                          <span className={styles.seatsLabel}>
                            <b>{adjustable ? 'Kullanıcı sayısı' : 'Tek kullanıcı'}</b>
                            <small>
                              {adjustable
                                ? count > included
                                  ? `${included} dahil · ${count - included} ek kullanıcı`
                                  : `${included} kullanıcı dahil`
                                : 'Ekip için üst plana geçin'}
                            </small>
                          </span>
                          {adjustable ? (
                            <span className={styles.stepper}>
                              <button
                                type="button"
                                onClick={() => stepSeats(plan, -1)}
                                disabled={count <= included}
                                aria-label={`${plan.name} kullanıcı sayısını azalt`}
                              >
                                <svg viewBox="0 0 16 16" aria-hidden focusable="false">
                                  <path d="M3.5 8h9" />
                                </svg>
                              </button>
                              <output aria-live="polite">{count}</output>
                              <button
                                type="button"
                                onClick={() => stepSeats(plan, 1)}
                                disabled={count >= seatMax(plan)}
                                aria-label={`${plan.name} kullanıcı sayısını artır`}
                              >
                                <svg viewBox="0 0 16 16" aria-hidden focusable="false">
                                  <path d="M8 3.5v9M3.5 8h9" />
                                </svg>
                              </button>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedPlan ? (
            <GlassButton
              prominent
              size="lg"
              className={styles.compactAction}
              onClick={() => selectedPlan.action.onSelect?.(selectedPlan.id)}
            >
              {compactActionLabel.replace('{plan}', selectedPlan.name)}
            </GlassButton>
          ) : null}
        </>
      ) : (
        <div className={styles.grid}>
          {plans.map((plan) => {
            const count = seatCount(plan, currentSeats)
            const included = plan.seats?.included ?? 1

            return (
              <article
                key={plan.id}
                className={styles.card}
                data-prominent={plan.prominent ? true : undefined}
              >
                <div className={styles.cardMain}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.cardTitle}>{plan.name}</h3>
                    {plan.badge ? <span className={styles.badge}>{plan.badge}</span> : null}
                  </div>
                  <p className={styles.cardDescription}>{plan.description}</p>

                  <div className={styles.priceBlock}>
                    <div className={styles.priceRow}>
                      <PriceOdometer
                        value={totalPrice(plan, currentPeriod, count)}
                        currency={currency}
                        locale={locale}
                        animate={animate}
                      />
                      <span className={styles.period}>{periodSuffix}</span>
                      {/* Adet varsayılandan farklıysa gerekçesi fiyatın yanında durur:
                          kompaktta değiştirilen sayı burada sessiz bir fark üretmesin. */}
                      {count > included ? (
                        <span className={styles.seatCaption}>{`· ${count} kullanıcı`}</span>
                      ) : null}
                    </div>
                    <span className={styles.savings} data-visible={currentPeriod === 'yearly'}>
                      {currentPeriod === 'yearly' ? `Yılda ${money(savingsOf(plan))} tasarruf` : ' '}
                    </span>
                  </div>

                  <div className={styles.actions}>
                    <GlassButton
                      prominent
                      size="lg"
                      className={styles.action}
                      onClick={() => plan.action.onSelect?.(plan.id)}
                    >
                      {plan.action.label}
                    </GlassButton>
                    {plan.secondaryAction ? (
                      <GlassButton
                        material="flat"
                        size="lg"
                        className={styles.action}
                        onClick={() => plan.secondaryAction?.onSelect?.(plan.id)}
                      >
                        {plan.secondaryAction.label}
                      </GlassButton>
                    ) : null}
                  </div>
                </div>

                <FeatureList plan={plan} staggered={false} />
              </article>
            )
          })}
        </div>
      )}

      {/* Fiyat rulosu aria-hidden; değişimi burada metin olarak duyurulur. */}
      <p className={styles.liveRegion} aria-live="polite">
        {plans
          .map((plan) => {
            const count = seatCount(plan, currentSeats)
            const suffix = currentPeriod === 'yearly' ? 'yıllık' : 'aylık'
            const seatText = plan.seats && count > 1 ? `, ${count} kullanıcı` : ''
            return `${plan.name}: ${money(totalPrice(plan, currentPeriod, count))} ${suffix}${seatText}`
          })
          .join('. ')}
      </p>

      {footnote ? <div className={styles.footnote}>{footnote}</div> : null}
    </div>
  )
}
