import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import type {
  AccountBilling,
  AccountInsights,
  AccountListingPreview,
  AccountTrendPoint,
  RawAccountDashboard,
} from '../domain/account-types'

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


/** Günlük seri üretici — sabit tarih tabanı, testlerde belirlenimci kalsın diye. */
function gunlukSeri(
  values: number[],
  { bitis = '2026-07-27' }: { bitis?: string } = {},
): AccountTrendPoint[] {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const son = new Date(`${bitis}T00:00:00.000Z`)

  return values.map((value, index) => {
    const gun = new Date(son)
    gun.setUTCDate(son.getUTCDate() - (values.length - 1 - index))
    return {
      label: `${gun.getUTCDate()} ${aylar[gun.getUTCMonth()]}`,
      occurredAt: gun.toISOString(),
      value,
    }
  })
}

/** Aylık seri — harcama grafiği için (ay başları). */
function aylikSeri(values: Array<[string, string, number]>): AccountTrendPoint[] {
  return values.map(([label, occurredAt, value]) => ({ label, occurredAt, value }))
}

const defaultInsights: AccountInsights = {
  periodLabel: 'Son 14 gün',
  listingViews: gunlukSeri([38, 44, 41, 57, 63, 52, 71, 84, 78, 96, 108, 94, 121, 137]),
  messages: gunlukSeri([1, 0, 2, 1, 3, 2, 4, 3, 2, 5, 4, 6, 5, 7]),
  favorites: gunlukSeri([2, 3, 1, 4, 5, 3, 6, 5, 4, 7, 8, 6, 9, 11]),
  spendByMonth: aylikSeri([
    ['Şub', '2026-02-01T00:00:00.000Z', 0],
    ['Mar', '2026-03-01T00:00:00.000Z', 349],
    ['Nis', '2026-04-01T00:00:00.000Z', 0],
    ['May', '2026-05-01T00:00:00.000Z', 129],
    ['Haz', '2026-06-01T00:00:00.000Z', 749],
    ['Tem', '2026-07-01T00:00:00.000Z', 1098],
  ]),
  summary: {
    totalViews: 1084,
    viewsChangePct: 32,
    totalMessages: 45,
    messagesChangePct: 18,
    contactRatePct: 4.2,
  },
}

const defaultBilling: AccountBilling = {
  methods: [
    {
      id: 'pm-visa-6411',
      kind: 'card',
      label: 'Visa · 6411',
      expiryLabel: '10/2028',
      isDefault: true,
    },
    {
      id: 'pm-havale',
      kind: 'transfer',
      label: 'Havale / EFT — Ziraat Bankası',
      isDefault: false,
    },
  ],
  payments: [
    {
      id: 'pay-2026-0712',
      occurredAt: '2026-07-12T09:20:00.000Z',
      dateLabel: '12 Temmuz 2026',
      description: 'Öne çıkan dopingi — Urla imarlı köşe parsel (2 hafta)',
      amount: 349,
      amountLabel: '349,00 TL',
      status: 'paid',
      methodLabel: 'Visa · 6411',
      invoiceId: 'F-2026-0412',
    },
    {
      id: 'pay-2026-0705',
      occurredAt: '2026-07-05T14:05:00.000Z',
      dateLabel: '5 Temmuz 2026',
      description: 'Vitrin dopingi — Gölbaşı yatırımlık tarla (2 hafta)',
      amount: 749,
      amountLabel: '749,00 TL',
      status: 'paid',
      methodLabel: 'Visa · 6411',
      invoiceId: 'F-2026-0398',
    },
    {
      id: 'pay-2026-0728',
      occurredAt: '2026-07-28T06:45:00.000Z',
      dateLabel: '28 Temmuz 2026',
      description: 'Ek ilan hakkı (1 ilan)',
      amount: 129,
      amountLabel: '129,00 TL',
      status: 'pending',
      methodLabel: 'Havale / EFT — Ziraat Bankası',
    },
    {
      id: 'pay-2026-0620',
      occurredAt: '2026-06-20T11:30:00.000Z',
      dateLabel: '20 Haziran 2026',
      description: 'Öne çıkan dopingi — süresi dolan ilan',
      amount: 349,
      amountLabel: '349,00 TL',
      status: 'refunded',
      methodLabel: 'Visa · 6411',
      invoiceId: 'F-2026-0361',
    },
    {
      id: 'pay-2026-0518',
      occurredAt: '2026-05-18T08:10:00.000Z',
      dateLabel: '18 Mayıs 2026',
      description: 'Ek ilan hakkı (1 ilan)',
      amount: 129,
      amountLabel: '129,00 TL',
      status: 'failed',
      methodLabel: 'Visa · 6411',
    },
  ],
  invoices: [
    {
      id: 'F-2026-0412',
      issuedAt: '2026-07-12T09:25:00.000Z',
      dateLabel: '12 Temmuz 2026',
      periodLabel: 'Temmuz 2026',
      description: 'Öne çıkan dopingi — Urla imarlı köşe parsel',
      total: 349,
      totalLabel: '349,00 TL',
      taxLabel: 'KDV %20 dahil · 58,17 TL',
      status: 'issued',
      downloadHref: '#fatura-F-2026-0412',
    },
    {
      id: 'F-2026-0398',
      issuedAt: '2026-07-05T14:10:00.000Z',
      dateLabel: '5 Temmuz 2026',
      periodLabel: 'Temmuz 2026',
      description: 'Vitrin dopingi — Gölbaşı yatırımlık tarla',
      total: 749,
      totalLabel: '749,00 TL',
      taxLabel: 'KDV %20 dahil · 124,83 TL',
      status: 'issued',
      downloadHref: '#fatura-F-2026-0398',
    },
    {
      id: 'F-2026-0431',
      issuedAt: '2026-07-28T06:50:00.000Z',
      dateLabel: '28 Temmuz 2026',
      periodLabel: 'Temmuz 2026',
      description: 'Ek ilan hakkı (1 ilan)',
      total: 129,
      totalLabel: '129,00 TL',
      taxLabel: 'KDV %20 dahil · 21,50 TL',
      status: 'pending',
    },
    {
      id: 'F-2026-0361',
      issuedAt: '2026-06-20T11:35:00.000Z',
      dateLabel: '20 Haziran 2026',
      periodLabel: 'Haziran 2026',
      description: 'Öne çıkan dopingi — iade edildi',
      total: 349,
      totalLabel: '349,00 TL',
      taxLabel: 'KDV %20 dahil · 58,17 TL',
      status: 'cancelled',
      downloadHref: '#fatura-F-2026-0361',
    },
  ],
  profile: {
    title: 'Mehmet Yılmaz (Bireysel)',
    taxOffice: 'Konak Vergi Dairesi',
    taxNumber: '1234567890',
    address: 'Alsancak Mah. 1470 Sk. No:12 D:4, Konak / İzmir',
  },
  summary: {
    periodLabel: 'Temmuz 2026',
    paidTotalLabel: '1.098,00 TL',
    pendingTotalLabel: '129,00 TL',
    pendingCount: 1,
  },
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
  insights: defaultInsights,
  billing: defaultBilling,
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
