import type {
  ConversationSummary,
  MessageBase,
} from '../domain/message-types'

export type CanonicalFixtureMessage = MessageBase & {
  id: string
  clientMessageId?: string
  deliveryState: 'sent' | 'delivered' | 'read' | null
}

export interface MessagesFixtureData {
  conversations: readonly ConversationSummary[]
  messages: readonly CanonicalFixtureMessage[]
}

export function normalizeMessageSearch(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]/g, '')
}

const houseImage =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84'
const landImage =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=84'
const officeImage =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=84'

const seferihisarLongHistory: CanonicalFixtureMessage[] = Array.from(
  { length: 65 },
  (_, index) => {
    const sequence = index + 1
    const outgoing = sequence % 2 === 0

    return {
      id: `message-seferihisar-history-${sequence}`,
      conversationId: 'conversation-seferihisar-cem',
      sequence,
      senderId: outgoing ? 'current-user' : 'person-cem',
      kind: 'text',
      body: outgoing
        ? `Zeytinlik görüşmesi için yanıt ${sequence}.`
        : `Zeytinlik görüşmesi geçmiş mesajı ${sequence}.`,
      attachments: [],
      deliveryState: 'read',
      sentAt: new Date(
        Date.UTC(2026, 6, 13, 6, index * 10),
      ).toISOString(),
    }
  },
)

export const MESSAGE_FIXTURES: MessagesFixtureData = {
  conversations: [
    {
      id: 'conversation-urla-ayse',
      counterpart: { id: 'person-ayse', displayName: 'Ayşe Kaya' },
      listing: { id: 'listing-urla-1', title: 'Urla İskele’de Taş Ev', imageSrc: houseImage, imageAlt: 'Urla taş ev', priceLabel: '₺18.500.000', referenceLabel: 'İlan Urla 1001' },
      lastMessage: { kind: 'safety', body: 'Ödeme bilgilerinizi paylaşmayın.', sentAt: '2026-07-20T11:30:00.000Z', senderId: 'system' },
      unreadCount: 2,
      lastUserActivityAt: '2026-07-20T11:30:00.000Z',
      status: 'active',
    },
    {
      id: 'conversation-kordon-ayse',
      counterpart: { id: 'person-ayse', displayName: 'Ayşe Kaya' },
      listing: { id: 'listing-kordon-1', title: 'Kordon’da Deniz Manzaralı Daire', imageSrc: houseImage, imageAlt: 'Kordon daire', priceLabel: '₺14.750.000', referenceLabel: 'İlan Kordon 2001' },
      lastMessage: { kind: 'text', body: 'Tapu bilgilerini ilettim.', sentAt: '2026-07-19T15:00:00.000Z', senderId: 'person-ayse' },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-19T15:00:00.000Z',
      status: 'active',
    },
    {
      id: 'conversation-cesme-mert',
      counterpart: { id: 'person-mert', displayName: 'Mert Arslan' },
      listing: { id: 'listing-cesme-1', title: 'Çeşme Ilıca’da Yazlık', imageSrc: houseImage, imageAlt: 'Çeşme yazlık', priceLabel: '₺22.000.000', referenceLabel: 'İlan Çeşme 3102' },
      lastMessage: { kind: 'attachment', body: 'Planı ekledim.', sentAt: '2026-07-18T12:10:00.000Z', senderId: 'person-mert' },
      unreadCount: 1,
      lastUserActivityAt: '2026-07-18T12:10:00.000Z',
      status: 'active',
    },
    {
      id: 'conversation-guzelbahce-selin',
      counterpart: { id: 'person-selin', displayName: 'Selin Demir' },
      listing: { id: 'listing-guzelbahce-1', title: 'Güzelbahçe Yalı Dairesi', imageSrc: houseImage, imageAlt: 'Güzelbahçe yalı dairesi', priceLabel: '₺16.200.000', referenceLabel: 'İlan Güzelbahçe 4103' },
      lastMessage: { kind: 'text', body: 'Cumartesi uygun.', sentAt: '2026-07-17T09:00:00.000Z', senderId: 'person-selin' },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-17T09:00:00.000Z',
      status: 'active',
    },
    {
      id: 'conversation-urla-bora',
      counterpart: { id: 'person-bora', displayName: 'Bora Şahin' },
      listing: { id: 'listing-urla-2', title: 'Urla Sanat Sokağı Bahçeli Ev', imageSrc: houseImage, imageAlt: 'Urla bahçeli ev', priceLabel: '₺12.900.000', referenceLabel: 'İlan Urla 1002' },
      lastMessage: { kind: 'system', body: 'İlan fiyatı güncellendi.', sentAt: '2026-07-16T16:30:00.000Z', senderId: 'system' },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-16T16:30:00.000Z',
      status: 'active',
    },
    {
      id: 'conversation-izmir-elif',
      counterpart: { id: 'person-elif', displayName: 'Elif Yılmaz' },
      listing: { id: 'listing-alsancak-1', title: 'Alsancak’ta Ofis Katı', imageSrc: officeImage, imageAlt: 'Alsancak ofis', priceLabel: '₺8.400.000', referenceLabel: 'İlan İzmir 5201' },
      lastMessage: { kind: 'text', body: 'Teşekkür ederim.', sentAt: '2026-07-15T14:15:00.000Z', senderId: 'person-elif' },
      unreadCount: 3,
      lastUserActivityAt: '2026-07-15T14:15:00.000Z',
      status: 'active',
    },
    {
      id: 'conversation-seferihisar-cem',
      counterpart: { id: 'person-cem', displayName: 'Cem Akın' },
      listing: { id: 'listing-seferihisar-1', title: 'Seferihisar Zeytinlik', imageSrc: landImage, imageAlt: 'Seferihisar zeytinlik', priceLabel: '₺7.850.000', referenceLabel: 'İlan Seferihisar 6301' },
      lastMessage: { kind: 'text', body: 'İlan arşivlendi.', sentAt: '2026-07-14T10:00:00.000Z', senderId: 'person-cem' },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-14T10:00:00.000Z',
      status: 'archived',
    },
    {
      id: 'conversation-urla-deniz',
      counterpart: { id: 'person-deniz', displayName: 'Deniz Eren' },
      listing: { id: 'listing-urla-3', title: 'Urla Kuşçular Arsa', imageSrc: landImage, imageAlt: 'Urla arsa', priceLabel: '₺5.100.000', referenceLabel: 'İlan Urla 1003' },
      lastMessage: { kind: 'safety', body: 'Bu konuşma kısıtlandı.', sentAt: '2026-07-13T18:20:00.000Z', senderId: 'system' },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-13T18:20:00.000Z',
      status: 'blocked',
    },
    {
      id: 'conversation-izmir-ozge',
      counterpart: { id: 'person-ozge', displayName: 'Özge Çelik' },
      listing: { id: 'listing-bornova-1', title: 'Bornova Öğrenci Apartmanı', imageSrc: houseImage, imageAlt: 'Bornova apartman', priceLabel: '₺11.700.000', referenceLabel: 'İlan İzmir 7201', status: 'Yayından kaldırıldı' },
      lastMessage: { kind: 'system', body: 'İlan yayından kaldırıldı.', sentAt: '2026-07-12T13:30:00.000Z', senderId: 'system' },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-12T13:30:00.000Z',
      status: 'listing-closed',
    },
    {
      id: 'conversation-urla-fuat',
      counterpart: { id: 'person-fuat', displayName: 'Fuat Koç' },
      listing: { id: 'listing-urla-4', title: 'Urla Rüstem Mahallesi Villa', imageSrc: houseImage, imageAlt: 'Urla villa', priceLabel: '₺24.000.000', referenceLabel: 'İlan Urla 1004' },
      lastMessage: { kind: 'text', body: 'Detayları inceliyorum.', sentAt: '2026-07-11T11:00:00.000Z', senderId: 'person-fuat' },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-11T11:00:00.000Z',
      status: 'active',
    },
    {
      id: 'conversation-menemen-ece',
      counterpart: { id: 'person-ece', displayName: 'Ece Tunç' },
      listing: { id: 'listing-menemen-1', title: 'Menemen Sanayi Deposu', imageSrc: officeImage, imageAlt: 'Menemen depo', priceLabel: '₺9.250.000', referenceLabel: 'İlan Menemen 8201' },
      lastMessage: { kind: 'attachment', body: 'Ekspertiz raporu hazır.', sentAt: '2026-07-10T08:45:00.000Z', senderId: 'person-ece' },
      unreadCount: 1,
      lastUserActivityAt: '2026-07-10T08:45:00.000Z',
      status: 'active',
    },
    {
      id: 'conversation-karsiyaka-onur',
      counterpart: { id: 'person-onur', displayName: 'Onur Sönmez' },
      listing: { id: 'listing-karsiyaka-1', title: 'Karşıyaka Bostanlı Daire', imageSrc: houseImage, imageAlt: 'Karşıyaka daire', priceLabel: '₺10.300.000', referenceLabel: 'İlan Karşıyaka 9201' },
      lastMessage: { kind: 'text', body: 'Görüşme için dönüş bekliyorum.', sentAt: '2026-07-09T17:00:00.000Z', senderId: 'person-onur' },
      unreadCount: 0,
      lastUserActivityAt: '2026-07-09T17:00:00.000Z',
      status: 'active',
    },
  ],
  messages: [
    { id: 'message-urla-1', conversationId: 'conversation-urla-ayse', sequence: 1, senderId: 'person-ayse', kind: 'text', body: 'Evi yarın görebilir miyiz?', attachments: [], deliveryState: 'read', sentAt: '2026-07-20T09:00:00.000Z' },
    { id: 'message-urla-2', conversationId: 'conversation-urla-ayse', sequence: 2, senderId: 'system', kind: 'system', body: 'Güvenli mesajlaşma koruması etkin.', attachments: [], deliveryState: null, sentAt: '2026-07-20T09:01:00.000Z' },
    { id: 'message-urla-3', conversationId: 'conversation-urla-ayse', sequence: 3, senderId: 'person-ayse', kind: 'attachment', body: 'Konum krokisini ekledim.', attachments: [{ id: 'attachment-urla-1', name: 'kroki.pdf', mimeType: 'application/pdf', sizeBytes: 120400, state: 'ready', url: 'https://example.invalid/kroki.pdf' }], deliveryState: 'delivered', sentAt: '2026-07-20T10:15:00.000Z' },
    { id: 'message-urla-4', conversationId: 'conversation-urla-ayse', sequence: 4, senderId: 'system', kind: 'safety', body: 'Ödeme bilgilerinizi paylaşmayın.', attachments: [], deliveryState: null, sentAt: '2026-07-20T11:30:00.000Z' },
    { id: 'message-kordon-1', conversationId: 'conversation-kordon-ayse', sequence: 1, senderId: 'person-ayse', kind: 'text', body: 'Tapu bilgilerini ilettim.', attachments: [], deliveryState: 'read', sentAt: '2026-07-19T15:00:00.000Z' },
    { id: 'message-cesme-1', conversationId: 'conversation-cesme-mert', sequence: 1, senderId: 'person-mert', kind: 'attachment', body: 'Planı ekledim.', attachments: [{ id: 'attachment-cesme-1', name: 'plan.jpg', mimeType: 'image/jpeg', sizeBytes: 320400, state: 'uploading' }], deliveryState: 'sent', sentAt: '2026-07-18T12:10:00.000Z' },
    { id: 'message-guzelbahce-1', conversationId: 'conversation-guzelbahce-selin', sequence: 1, senderId: 'person-selin', kind: 'text', body: 'Cumartesi uygun.', attachments: [], deliveryState: 'read', sentAt: '2026-07-17T09:00:00.000Z' },
    { id: 'message-urla-bora-1', conversationId: 'conversation-urla-bora', sequence: 1, senderId: 'system', kind: 'system', body: 'İlan fiyatı güncellendi.', attachments: [], deliveryState: null, sentAt: '2026-07-16T16:30:00.000Z' },
    { id: 'message-izmir-elif-1', conversationId: 'conversation-izmir-elif', sequence: 1, senderId: 'person-elif', kind: 'attachment', body: 'Dosyayı ekledim.', attachments: [{ id: 'attachment-izmir-1', name: 'teklif.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sizeBytes: 48320, state: 'scanning' }], deliveryState: 'delivered', sentAt: '2026-07-15T14:15:00.000Z' },
    ...seferihisarLongHistory,
    { id: 'message-seferihisar-1', conversationId: 'conversation-seferihisar-cem', sequence: 66, senderId: 'person-cem', kind: 'text', body: 'İlan arşivlendi.', attachments: [], deliveryState: 'read', sentAt: '2026-07-14T10:00:00.000Z' },
    { id: 'message-urla-deniz-1', conversationId: 'conversation-urla-deniz', sequence: 1, senderId: 'system', kind: 'safety', body: 'Bu konuşma kısıtlandı.', attachments: [{ id: 'attachment-urla-3', name: 'belge.exe', mimeType: 'application/octet-stream', sizeBytes: 400, state: 'blocked', failureReason: 'Güvenlik denetimi' }], deliveryState: null, sentAt: '2026-07-13T18:20:00.000Z' },
    { id: 'message-bornova-1', conversationId: 'conversation-izmir-ozge', sequence: 1, senderId: 'system', kind: 'system', body: 'İlan yayından kaldırıldı.', attachments: [], deliveryState: null, sentAt: '2026-07-12T13:30:00.000Z' },
    { id: 'message-urla-fuat-1', conversationId: 'conversation-urla-fuat', sequence: 1, senderId: 'person-fuat', kind: 'attachment', body: 'Fotoğrafı seçtim.', attachments: [{ id: 'attachment-urla-4', name: 'bahce.jpg', mimeType: 'image/jpeg', sizeBytes: 92144, state: 'selected' }], deliveryState: 'sent', sentAt: '2026-07-11T11:00:00.000Z' },
    { id: 'message-menemen-1', conversationId: 'conversation-menemen-ece', sequence: 1, senderId: 'person-ece', kind: 'attachment', body: 'Ekspertiz raporu hazır.', attachments: [{ id: 'attachment-menemen-1', name: 'rapor.pdf', mimeType: 'application/pdf', sizeBytes: 24200, state: 'failed', failureReason: 'Dosya okunamadı' }], deliveryState: 'sent', sentAt: '2026-07-10T08:45:00.000Z' },
    { id: 'message-karsiyaka-1', conversationId: 'conversation-karsiyaka-onur', sequence: 1, senderId: 'person-onur', kind: 'text', body: 'Görüşme için dönüş bekliyorum.', attachments: [], deliveryState: 'delivered', sentAt: '2026-07-09T17:00:00.000Z' },
  ],
}
