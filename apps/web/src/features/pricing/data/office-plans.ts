import type { GlassPricingPlan } from '@repo/ui'

/**
 * Emlak ofisi paketleri — tek kaynak.
 *
 * Üç yüzey de buradan beslenir: genel paket sayfası (`/paketler`), hesap içi
 * plan sayfası (`/hesabim/planim`) ve ofis başvurusunun paket adımı. Aynı
 * rakamın üç yerde ayrı yazılması, birinin güncellenip diğerlerinin unutulması
 * demekti; fiyat bir pazarlama metni değil sözleşme verisidir.
 *
 * **Ölçek koltuktur, ilan değil.** Bir emlak ofisi büyüdükçe önce danışman
 * alır; ilan adedi bunun sonucudur. Bu yüzden paketler danışman koltuğuna göre
 * kademelenir ve ek koltuk gerçek bir kalem olarak fiyata girer.
 */

export type OfficePlanId = 'baslangic' | 'profesyonel' | 'kurumsal'

/** Yıllık ödemede uygulanan indirim — rozet metni bundan türetilir. */
export const YEARLY_DISCOUNT_RATIO = 0.2

export interface OfficePlanCopy {
  id: OfficePlanId
  /** Hesap sayfasında ve başvuruda geçen kısa ad */
  name: string
  /** Kompakt listede adın altındaki tür etiketi */
  kind: string
  description: string
  monthly: number
  yearly: number
  seats: {
    included: number
    max: number
    extraMonthly: number
    extraYearly: number
  }
  featuresTitle: string
  features: string[]
  prominent?: boolean
  badge?: string
}

export const OFFICE_PLANS: readonly OfficePlanCopy[] = [
  {
    id: 'baslangic',
    name: 'Ofis Başlangıç',
    kind: 'yeni açılan ofis',
    description:
      'Yetki belgesini yeni almış, iki kişilik çalışan ofis için. Portföyünüz doğrulanmış künyeyle yayına girer.',
    monthly: 1490,
    yearly: 14_300,
    seats: { included: 2, max: 5, extraMonthly: 390, extraYearly: 3740 },
    featuresTitle: 'Pakete dahil',
    features: [
      '25 aktif ilan',
      'EİDS yetki kontrolü ve ofis rozeti',
      'Ofis profil sayfası',
      'Ortak gelen kutusu',
      'Aylık performans özeti',
    ],
  },
  {
    id: 'profesyonel',
    name: 'Ofis Profesyonel',
    kind: 'büyüyen ofis',
    description:
      'Danışman kadrosu olan ofisler için. Vitrin kontenjanı, alıcı eşleşmesi ve danışman bazlı performans burada açılır.',
    monthly: 3900,
    yearly: 37_400,
    seats: { included: 6, max: 20, extraMonthly: 290, extraYearly: 2780 },
    prominent: true,
    badge: 'En çok seçilen',
    featuresTitle: 'Başlangıç’taki her şey, ayrıca',
    features: [
      '150 aktif ilan',
      'Ayda 10 vitrin kontenjanı',
      'Yapay zekâ ilan metni ve özeti',
      'Alıcı eşleşme skoru',
      'Değerleme ve bölge raporu',
      'Danışman bazlı performans panosu',
    ],
  },
  {
    id: 'kurumsal',
    name: 'Ofis Kurumsal',
    kind: 'çok şubeli ağ',
    description:
      'Şubeli ofisler ve portföy ekipleri için. Yetki katmanı, toplu aktarım ve kendi markanızla ofis sayfası.',
    monthly: 8900,
    yearly: 85_400,
    seats: { included: 20, max: 100, extraMonthly: 240, extraYearly: 2300 },
    featuresTitle: 'Profesyonel’deki her şey, ayrıca',
    features: [
      'Sınırsız ilan',
      'Şube ve yetki yönetimi',
      'API ve toplu ilan aktarımı',
      'Marka rengiyle özelleştirilmiş ofis sayfası',
      'Öncelikli destek ve müşteri temsilcisi',
    ],
  },
]

export function officePlanById(id: OfficePlanId): OfficePlanCopy {
  const plan = OFFICE_PLANS.find((item) => item.id === id)
  if (!plan) throw new Error(`Bilinmeyen paket: ${id}`)
  return plan
}

export interface OfficePlanActions {
  /** Birincil eylem etiketi — yüzeye göre değişir ("Paketi seç" / "Bu pakete geç") */
  actionLabel: string | ((plan: OfficePlanCopy) => string)
  onSelect?: (planId: OfficePlanId) => void
  secondaryActionLabel?: string | ((plan: OfficePlanCopy) => string)
  onSecondarySelect?: (planId: OfficePlanId) => void
  /** Verilen plan için eylem gizlenir — hesap sayfasında mevcut paket böyle işaretlenir */
  hideActionFor?: OfficePlanId
}

function resolveLabel(
  label: string | ((plan: OfficePlanCopy) => string),
  plan: OfficePlanCopy,
): string {
  return typeof label === 'function' ? label(plan) : label
}

/**
 * Paket verisini `GlassPricingTable`'ın beklediği şekle çevirir.
 *
 * Eylem etiketleri yüzeye göre değiştiği için içerikle birlikte SABİTLENMEZ:
 * genel sayfada "Paketi seç", hesapta "Bu pakete geç", başvuruda "Bu paketle
 * devam et" yazar; içerik aynı kalır.
 */
export function toPricingPlans(actions: OfficePlanActions): GlassPricingPlan[] {
  return OFFICE_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    kind: plan.kind,
    description: plan.description,
    price: { monthly: plan.monthly, yearly: plan.yearly },
    seats: {
      included: plan.seats.included,
      max: plan.seats.max,
      extraMonthly: plan.seats.extraMonthly,
      extraYearly: plan.seats.extraYearly,
    },
    action: {
      label:
        actions.hideActionFor === plan.id
          ? 'Mevcut paketiniz'
          : resolveLabel(actions.actionLabel, plan),
      onSelect: actions.hideActionFor === plan.id ? undefined : () => actions.onSelect?.(plan.id),
    },
    secondaryAction: actions.secondaryActionLabel
      ? {
          label: resolveLabel(actions.secondaryActionLabel, plan),
          onSelect: () => actions.onSecondarySelect?.(plan.id),
        }
      : undefined,
    featuresTitle: plan.featuresTitle,
    features: plan.features,
    prominent: plan.prominent,
    badge: plan.badge,
  }))
}

/** Varsayılan koltuk sayıları — paketin dahil ettiği kadar. */
export function defaultSeats(): Record<string, number> {
  return Object.fromEntries(OFFICE_PLANS.map((plan) => [plan.id, plan.seats.included]))
}
