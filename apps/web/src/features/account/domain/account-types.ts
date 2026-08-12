export const ACCOUNT_LISTING_STATES = [
  'draft',
  'review',
  'live',
  'changes',
  'paused',
  'expired',
] as const

export type AccountListingState = (typeof ACCOUNT_LISTING_STATES)[number]
export type AccountRole = 'buyer' | 'seller' | 'hybrid'
export type VerificationState =
  | 'verified'
  | 'pending'
  | 'missing'
  | 'not-applicable'
  | 'unavailable'
export type AccountWorkspaceMode =
  | 'loading'
  | 'ready'
  | 'new-account'
  | 'restricted'
  | 'session-expired'

export interface AccountAction {
  kind: 'route'
  label: string
  /**
   * Hesap alanından çıkan aksiyon rotaları. Liste kasıtlı olarak dar: yeni
   * bir hedef eklemek bilinçli bir karar olmalı, serbest string değil.
   * `/parola-degistir` 2026-08-04'te eklendi (güvenlik sayfasından).
   * `/ofisler` 2026-08-12'de eklendi (randevularım boş durumundan).
   */
  to: '/ilan-ver' | '/favoriler' | '/emlak' | '/parola-degistir' | '/ofisler'
}

export interface AccountMetricItem {
  id: 'live-listings' | 'action-listings' | 'unread-messages' | 'active-alarms'
  label: string
  value: string
  hint: string
}

export interface AccountIdentity {
  id: string
  displayName: string
  role: AccountRole
  organizationLabel?: string
  avatarUrl?: string
}

export interface AccountVerification {
  email: VerificationState
  phone: VerificationState
  eids: VerificationState
}

export interface AccountSecuritySummary {
  lastSuccessfulLogin?: {
    occurredAt: string
    deviceLabel: string
    approximateLocation?: string
  }
  dataUpdatedAt?: string
}

export type AccountSectionKey =
  | 'identity'
  | 'metrics'
  | 'listings'
  | 'security'
  | 'activity'
  | 'saved-search'
  | 'insights'
  | 'payments'
  | 'invoices'

export interface AccountSectionError {
  section: AccountSectionKey
  message: string
}

export interface AccountListingPreview {
  id: string
  title: string
  state: AccountListingState
  imageSrc?: string
  imageAlt: string
  priceLabel?: string
  referenceLabel: string
  updatedAt: string
  updatedLabel: string
  issue?: string
  stats: Array<{ id: string; label: string; value: string }>
}

export interface AccountActivity {
  id: string
  occurredAt: string
  dateLabel: string
  title: string
  description?: string
  tone: 'default' | 'success' | 'warning' | 'danger'
}

export interface AccountSavedSearchSummary {
  id: string
  title: string
  criteriaLabel: string
  newMatchCount: number
  updatedAt: string
}

export interface AccountAttentionItem {
  id: string
  kind: 'verification' | 'listing' | 'message' | 'favorite' | 'alarm'
  severity: 'critical' | 'high' | 'normal'
  occurredAt: string
  title: string
  reason: string
  action: AccountAction
  explanationSource: 'rule' | 'ai'
}

export interface AccountDashboardData {
  identity: AccountIdentity
  verification: AccountVerification
  security: AccountSecuritySummary
  listings: AccountListingPreview[]
  unreadMessageCount: number
  activeAlarmCount: number
  priceDropFavoriteCount: number
  attentionCandidates: AccountAttentionItem[]
  activities: AccountActivity[]
  savedSearch?: AccountSavedSearchSummary
  /** Performans serileri — yoksa özet sayfasındaki grafik bölümü çizilmez */
  insights?: AccountInsights
  /** Ödeme yöntemleri, işlemler ve faturalar — yoksa ilgili sayfalar boş durum gösterir */
  billing?: AccountBilling
  sectionErrors: AccountSectionError[]
}


/* ---------------------------------------------------------------------------
   Performans serileri — hesap özetindeki grafikleri besler.
   Nokta sırası kaynaktan gelir; görsel katman yeniden sıralamaz.
--------------------------------------------------------------------------- */

export interface AccountTrendPoint {
  /** Kısa dönem etiketi (ör. "21 Tem", "Haz") — grafik ekseninde görünür */
  label: string
  /** ISO tarih; sıralama ve erişilebilir özet için */
  occurredAt: string
  value: number
}

export interface AccountInsightSummary {
  totalViews: number
  /** Önceki döneme göre yüzde değişim (negatif olabilir) */
  viewsChangePct: number
  totalMessages: number
  messagesChangePct: number
  /** Görüntülenme → mesaj dönüşümü, yüzde */
  contactRatePct: number
}

export interface AccountInsights {
  /** Serilerin kapsadığı dönem (ör. "Son 14 gün") */
  periodLabel: string
  listingViews: AccountTrendPoint[]
  messages: AccountTrendPoint[]
  favorites: AccountTrendPoint[]
  /** Aylık doping/hizmet harcaması (TL) */
  spendByMonth: AccountTrendPoint[]
  summary: AccountInsightSummary
}

/* ---------------------------------------------------------------------------
   Ödemeler ve faturalar
--------------------------------------------------------------------------- */

export type AccountPaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'
export type AccountInvoiceStatus = 'issued' | 'pending' | 'cancelled'

export interface AccountPaymentMethod {
  id: string
  kind: 'card' | 'transfer'
  /** Maskeli görünen ad (ör. "Visa · 6411") — tam kart numarası ASLA taşınmaz */
  label: string
  expiryLabel?: string
  isDefault: boolean
}

export interface AccountPayment {
  id: string
  occurredAt: string
  dateLabel: string
  description: string
  amount: number
  amountLabel: string
  status: AccountPaymentStatus
  methodLabel: string
  /** İlişkili faturanın kimliği (varsa) */
  invoiceId?: string
}

export interface AccountInvoice {
  /** Fatura numarası (ör. "F-2026-0412") */
  id: string
  issuedAt: string
  dateLabel: string
  periodLabel: string
  description: string
  total: number
  totalLabel: string
  taxLabel: string
  status: AccountInvoiceStatus
  /** Belge bağlantısı; yoksa indirme sunulmaz */
  downloadHref?: string
}

export interface AccountBillingProfile {
  title: string
  taxOffice?: string
  taxNumber?: string
  address?: string
}

export interface AccountBillingSummary {
  periodLabel: string
  paidTotalLabel: string
  pendingTotalLabel: string
  pendingCount: number
}

export interface AccountBilling {
  methods: AccountPaymentMethod[]
  payments: AccountPayment[]
  invoices: AccountInvoice[]
  profile?: AccountBillingProfile
  summary: AccountBillingSummary
}

export interface AccountWorkspaceProps {
  data: AccountDashboardData
  mode?: AccountWorkspaceMode
}

export type RawAccountListingState = AccountListingState | 'rejected' | 'sold' | 'eids-pending'

export interface RawAccountDashboard {
  viewer: AccountIdentity
  verification: {
    email?: VerificationState
    phone?: VerificationState
    eids?: VerificationState
  }
  security?: AccountSecuritySummary
  listings: Array<Omit<AccountListingPreview, 'state'> & { state: RawAccountListingState }>
  unreadMessageCount?: number
  activeAlarmCount?: number
  priceDropFavoriteCount?: number
  attentionCandidates?: AccountAttentionItem[]
  activities?: AccountActivity[]
  savedSearch?: AccountSavedSearchSummary
  insights?: AccountInsights
  billing?: AccountBilling
  sectionErrors?: AccountSectionError[]
}
