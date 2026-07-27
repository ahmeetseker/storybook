import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import type { AccountListingPreview, RawAccountDashboard } from '../domain/account-types'

import { normalizeAccountDashboard } from './account-dashboard-adapter'

function listingPreview(
  listingIndex: number,
  state: AccountListingPreview['state'],
  updatedAt: string,
  updatedLabel: string,
  issue?: string,
): AccountListingPreview {
  const listing = LISTING_FIXTURES[listingIndex]

  return {
    id: listing.id,
    title: listing.title,
    state,
    imageSrc: listing.image.src,
    imageAlt: listing.image.alt,
    priceLabel: `${listing.price.toLocaleString('tr-TR')} TL`,
    referenceLabel: `İlan no: ${listing.id}`,
    updatedAt,
    updatedLabel,
    issue,
    stats: [
      { id: 'views', label: 'Görüntülenme', value: '248' },
      { id: 'favorites', label: 'Favori', value: '16' },
    ],
  }
}

const defaultRaw: RawAccountDashboard = {
  viewer: {
    id: 'account-mehmet-yilmaz',
    displayName: 'Mehmet Yılmaz',
    role: 'hybrid',
  },
  verification: {
    email: 'verified',
    phone: 'verified',
    eids: 'pending',
  },
  security: {
    lastSuccessfulLogin: {
      occurredAt: '2026-07-27T08:15:00.000Z',
      deviceLabel: 'Safari · macOS',
      approximateLocation: 'İzmir, Türkiye',
    },
    dataUpdatedAt: '2026-07-27T08:15:00.000Z',
  },
  listings: [
    listingPreview(0, 'live', '2026-07-27T08:00:00.000Z', 'Bugün güncellendi'),
    listingPreview(
      3,
      'changes',
      '2026-07-26T14:30:00.000Z',
      'Dün güncellendi',
      'İlan açıklamasında düzeltme bekleniyor.',
    ),
  ],
  unreadMessageCount: 3,
  activeAlarmCount: 2,
  priceDropFavoriteCount: 1,
  attentionCandidates: [
    {
      id: 'favorite-price-drop',
      kind: 'favorite',
      severity: 'high',
      occurredAt: '2026-07-27T07:30:00.000Z',
      title: 'Favorinizde fiyat düştü',
      reason: 'Takip ettiğiniz ilanda fiyat güncellendi.',
      action: { kind: 'route', label: 'Favorileri aç', to: '/favoriler' },
      explanationSource: 'rule',
    },
    {
      id: 'listing-changes',
      kind: 'listing',
      severity: 'high',
      occurredAt: '2026-07-26T14:30:00.000Z',
      title: 'İlanınızda düzenleme gerekiyor',
      reason: 'Yayın öncesi bir alanın güncellenmesi isteniyor.',
      action: { kind: 'route', label: 'İlan ver sayfasına git', to: '/ilan-ver' },
      explanationSource: 'rule',
    },
    {
      id: 'search-opportunity',
      kind: 'alarm',
      severity: 'normal',
      occurredAt: '2026-07-25T10:00:00.000Z',
      title: 'Aramanızla eşleşen yeni ilanlar var',
      reason: 'Kaydedilmiş kriterlerinize uygun ilanlar eklendi.',
      action: { kind: 'route', label: 'İlanları incele', to: '/emlak' },
      explanationSource: 'ai',
    },
  ],
  activities: [
    {
      id: 'activity-login',
      occurredAt: '2026-07-27T08:15:00.000Z',
      dateLabel: 'Bugün, 08:15',
      title: 'Hesabınıza giriş yapıldı',
      description: 'Safari · macOS · İzmir',
      tone: 'success',
    },
    {
      id: 'activity-listing',
      occurredAt: '2026-07-26T14:30:00.000Z',
      dateLabel: 'Dün, 14:30',
      title: 'İlanınız için düzenleme istendi',
      description: 'Açıklama alanını güncelleyebilirsiniz.',
      tone: 'warning',
    },
    {
      id: 'activity-alarm',
      occurredAt: '2026-07-25T10:00:00.000Z',
      dateLabel: '25 Temmuz, 10:00',
      title: 'Arama alarmınız çalıştı',
      description: 'Yeni eşleşmeler bulundu.',
      tone: 'default',
    },
  ],
  savedSearch: {
    id: 'saved-search-urla-cesme-land',
    title: 'Urla ve Çeşme yatırım arsaları',
    criteriaLabel: 'İzmir · Urla ve Çeşme · Arsa',
    newMatchCount: 4,
    updatedAt: '2026-07-27T07:00:00.000Z',
  },
}

const buyerRaw: RawAccountDashboard = {
  ...defaultRaw,
  viewer: { ...defaultRaw.viewer, id: 'account-ayse-demir', displayName: 'Ayşe Demir', role: 'buyer' },
  verification: { email: 'verified', phone: 'verified' },
  listings: [],
}

const newAccountRaw: RawAccountDashboard = {
  viewer: { id: 'account-new', displayName: 'Yeni kullanıcı', role: 'buyer' },
  verification: {},
  listings: [],
}

const partialErrorRaw: RawAccountDashboard = {
  ...defaultRaw,
  listings: [],
  sectionErrors: [
    { section: 'listings', message: 'İlanlar şu anda yüklenemedi.' },
  ],
}

const restrictedRaw: RawAccountDashboard = {
  ...defaultRaw,
  viewer: { ...defaultRaw.viewer, id: 'account-restricted', displayName: 'Mehmet Yılmaz' },
  sectionErrors: [
    { section: 'identity', message: 'Hesap bilgilerinize erişim kısıtlandı.' },
  ],
}

export const ACCOUNT_FIXTURES = {
  default: normalizeAccountDashboard(defaultRaw),
  buyer: normalizeAccountDashboard(buyerRaw),
  newAccount: normalizeAccountDashboard(newAccountRaw),
  partialError: normalizeAccountDashboard(partialErrorRaw),
  restricted: normalizeAccountDashboard(restrictedRaw),
  sessionExpired: normalizeAccountDashboard(defaultRaw),
} as const
