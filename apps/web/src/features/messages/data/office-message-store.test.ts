import { beforeEach, describe, expect, it } from 'vitest'
import {
  __rehydrateForTests,
  officeThreadCount,
  resetOfficeMessageStore,
  sendOfficeMessage,
  withOfficeConversations,
} from './office-message-store'
import { MESSAGE_FIXTURES } from './message-fixtures'

const OFIS = { officeId: 'kadikoy-anahtar', officeName: 'Kadıköy Anahtar Ofis', district: 'kadıköy' }

beforeEach(() => resetOfficeMessageStore())

describe('ofis mesaj store', () => {
  it('ilk mesaj ofisle yeni bir sohbet oluşturur ve fixture birleşiminde görünür', () => {
    sendOfficeMessage({ ...OFIS, body: 'Urla tarafında arsa arıyorum.' })
    const merged = withOfficeConversations(MESSAGE_FIXTURES)
    const conversation = merged.conversations.find((c) => c.counterpart.displayName === 'Kadıköy Anahtar Ofis')
    expect(conversation).toBeDefined()
    expect(conversation!.lastMessage?.body).toBe('Urla tarafında arsa arıyorum.')
    const messages = merged.messages.filter((m) => m.conversationId === conversation!.id)
    expect(messages).toHaveLength(1)
    expect(messages[0].senderId).toBe('current-user')
    expect(messages[0].kind).toBe('text')
  })

  it('aynı ofise ikinci mesaj yeni sohbet açmaz, mevcut sohbete eklenir', () => {
    sendOfficeMessage({ ...OFIS, body: 'İlk mesaj' })
    sendOfficeMessage({ ...OFIS, body: 'İkinci mesaj' })
    expect(officeThreadCount()).toBe(1)
    const merged = withOfficeConversations(MESSAGE_FIXTURES)
    const conversation = merged.conversations.find((c) => c.counterpart.displayName === 'Kadıköy Anahtar Ofis')!
    const messages = merged.messages.filter((m) => m.conversationId === conversation.id)
    expect(messages.map((m) => m.body)).toEqual(['İlk mesaj', 'İkinci mesaj'])
    expect(messages[1].sequence).toBe(2)
    expect(conversation.lastMessage?.body).toBe('İkinci mesaj')
  })

  it('farklı ofisler ayrı sohbetler açar', () => {
    sendOfficeMessage({ ...OFIS, body: 'a' })
    sendOfficeMessage({ officeId: 'egekent-konut', officeName: 'Egekent Konut Ofisi', body: 'b' })
    expect(officeThreadCount()).toBe(2)
  })

  it('kayıtlar sessionStorage üzerinden yeniden yüklemeye dayanır', () => {
    sendOfficeMessage({ ...OFIS, body: 'Kalıcı mı?' })
    // Yeniden yükleme simülasyonu: bellek durumu sıfırlanır, depodan okunur.
    __rehydrateForTests()
    expect(officeThreadCount()).toBe(1)
    const merged = withOfficeConversations(MESSAGE_FIXTURES)
    expect(merged.conversations.some((c) => c.lastMessage?.body === 'Kalıcı mı?')).toBe(true)
  })

  it('bozuk veya sürümü eski JSON boş listeye düşer, çökmez', () => {
    window.sessionStorage.setItem('arsam:ofis-mesajlari', 'not-json{{')
    __rehydrateForTests()
    expect(officeThreadCount()).toBe(0)
    window.sessionStorage.setItem('arsam:ofis-mesajlari', JSON.stringify({ version: 999, threads: [] }))
    __rehydrateForTests()
    expect(officeThreadCount()).toBe(0)
  })

  it('boş/whitespace gövde gönderilmez', () => {
    expect(() => sendOfficeMessage({ ...OFIS, body: '   ' })).toThrow()
    expect(officeThreadCount()).toBe(0)
  })
})
