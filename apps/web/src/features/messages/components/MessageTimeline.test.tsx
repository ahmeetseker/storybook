import { act, render, screen, fireEvent, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getMessageRenderKey, MessageTimeline as MessageTimelineComponent, type MessageTimelineProps } from './MessageTimeline'
import type { MarketplaceMessage } from '../domain/message-types'
import { getMessageRenderKey as getDomainMessageRenderKey } from '../domain/message-reconciliation'

const CURRENT_USER_ID = 'user-1'

function MessageTimeline({
  conversationId = 'conversation-1',
  ...props
}: Omit<MessageTimelineProps, 'conversationId'> & { conversationId?: string }) {
  return <MessageTimelineComponent conversationId={conversationId} {...props} />
}

function message(
  id: string,
  overrides: Partial<MarketplaceMessage> = {},
): MarketplaceMessage {
  return {
    id,
    conversationId: 'conversation-1',
    sequence: Number(id.replace(/\D/g, '')) || 1,
    senderId: 'counterpart-1',
    kind: 'text',
    body: `Mesaj ${id}`,
    attachments: [],
    deliveryState: 'sent',
    sentAt: '2026-07-20T09:00:00.000Z',
    ...overrides,
  } as MarketplaceMessage
}

function setScrollMetrics(
  element: HTMLElement,
  { height = 480, scrollHeight = 3000, scrollTop = 0 } = {},
) {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: height },
    scrollHeight: { configurable: true, value: scrollHeight },
    scrollTop: { configurable: true, writable: true, value: scrollTop },
  })
}

const measuredHeights = new Map<string, number>()

function setMeasuredHeight(rowKey: string, height: number) {
  measuredHeights.set(rowKey, height)
}

function rectangle(height: number) {
  return {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: height,
    width: 100,
    height,
    toJSON: () => ({}),
  } as DOMRect
}

class DeterministicResizeObserver {
  static instances = new Set<DeterministicResizeObserver>()
  private readonly targets = new Set<Element>()

  constructor(private readonly callback: ResizeObserverCallback) {
    DeterministicResizeObserver.instances.add(this)
  }

  observe = vi.fn((target: Element) => this.targets.add(target))
  unobserve = vi.fn((target: Element) => this.targets.delete(target))
  disconnect = vi.fn(() => {
    this.targets.clear()
    DeterministicResizeObserver.instances.delete(this)
  })

  static flush() {
    for (const observer of DeterministicResizeObserver.instances) {
      const entries = [...observer.targets].map((target) => ({
        target,
        contentRect: target.getBoundingClientRect(),
      })) as ResizeObserverEntry[]
      observer.callback(entries, observer as unknown as ResizeObserver)
    }
  }
}

beforeEach(() => {
  measuredHeights.clear()
  vi.stubGlobal('ResizeObserver', DeterministicResizeObserver)
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect(this: HTMLElement) {
    return rectangle(measuredHeights.get(this.dataset.rowKey ?? '') ?? 0)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  DeterministicResizeObserver.instances.clear()
  vi.unstubAllGlobals()
})

describe('MessageTimeline', () => {
  it('adlandırılmış log içinde konuşmacı ve yön metnini, gün ayırıcısını ve düz notları sunar', () => {
    render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[
          message('incoming', { body: 'Merhaba', senderId: 'counterpart-1' }),
          message('outgoing', { body: 'Merhaba Ayşe', senderId: CURRENT_USER_ID }),
          message('system', { kind: 'system', senderId: 'system', body: 'İlan güncellendi.', deliveryState: null }),
          message('safety', { kind: 'safety', senderId: 'system', body: 'Ödeme bilgisi paylaşmayın.', deliveryState: null }),
        ]}
      />,
    )

    const log = screen.getByRole('log', { name: 'Ayşe Kaya ile mesajlar' })
    expect(log.getAttribute('aria-live')).toBe('off')
    expect(within(log).getByText('Ayşe Kaya · Gelen mesaj')).toBeTruthy()
    expect(within(log).getByText('Siz · Giden mesaj')).toBeTruthy()
    expect(within(log).getByText('20 Temmuz 2026')).toBeTruthy()
    expect(within(log).getByText('İlan güncellendi.')).toBeTruthy()
    expect(within(log).getByText('Ödeme bilgisi paylaşmayın.')).toBeTruthy()
  })

  it('yalnız son giden mesaj grubunun teslim bilgisini gösterir', () => {
    render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[
          message('one', { senderId: CURRENT_USER_ID, body: 'Bir', deliveryState: 'sent' }),
          message('two', { senderId: CURRENT_USER_ID, body: 'İki', deliveryState: 'read' }),
          message('three', { body: 'Üç' }),
          message('four', { senderId: CURRENT_USER_ID, body: 'Dört', deliveryState: 'delivered' }),
        ]}
      />,
    )

    expect(screen.getByText('İletildi')).toBeTruthy()
    expect(screen.queryByText('Okundu')).toBeNull()
    expect(screen.queryByText('Gönderildi')).toBeNull()
  })

  it('başarısız giden mesaj için tekrar deneme ve kopyalama eylemlerini çağırır', () => {
    const failed = message('failed', {
      clientMessageId: 'local-failed',
      senderId: CURRENT_USER_ID,
      body: 'Tekrar dene',
      deliveryState: 'failed',
    })
    const onRetry = vi.fn()
    const onCopy = vi.fn()
    render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[failed]}
        onRetry={onRetry}
        onCopy={onCopy}
      />,
    )

    expect(screen.getByText('Gönderilemedi')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }))
    fireEvent.click(screen.getByRole('button', { name: 'Kopyala' }))
    expect(onRetry).toHaveBeenCalledWith(failed)
    expect(onCopy).toHaveBeenCalledWith(failed)
  })

  it('geçmiş prepend edildiğinde canlı bölgeye eski mesajları yazmaz', () => {
    const latest = message('latest', { body: 'En yeni' })
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[latest]} />,
    )
    const announcement = screen.getByRole('status')
    expect(announcement.textContent).toBe('')

    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[message('older', { body: 'Eski mesaj', sentAt: '2026-07-19T09:00:00.000Z' }), latest]}
      />,
    )

    expect(announcement.textContent).toBe('')
  })

  it('kullanıcı dipteyken yeni gelen mesajı izler', () => {
    const first = message('first')
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first]} />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 600 })
    fireEvent.scroll(log)

    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[first, message('inbound', { body: 'Yeni gelen mesaj' })]}
      />,
    )

    expect(log.scrollTop).toBe(log.scrollHeight)
    expect(screen.getByRole('status').textContent).toContain('1 yeni mesaj')
  })

  it('kullanıcı geçmişteyken append ile scroll konumunu değiştirmez ve yeni mesaj eylemi sunar', () => {
    const first = message('first')
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first]} />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 120 })
    fireEvent.scroll(log)

    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[first, message('inbound', { body: 'Yeni gelen mesaj' })]}
      />,
    )

    expect(log.scrollTop).toBe(120)
    fireEvent.click(screen.getByRole('button', { name: '1 yeni mesajı göster' }))
    expect(log.scrollTop).toBe(log.scrollHeight)
  })

  it('kullanıcı dipten ayrılınca latest kontrolü gösterir ve görünmeyen yeni mesaj sayısını önceliklendirir', () => {
    const first = message('first')
    const { rerender } = render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[first]}
      />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, {
      height: 400,
      scrollHeight: 1000,
      scrollTop: 120,
    })
    fireEvent.scroll(log)

    const latestButton = screen.getByRole('button', {
      name: 'En yeni mesaja dön',
    })
    fireEvent.click(latestButton)
    expect(log.scrollTop).toBe(log.scrollHeight)
    expect(
      screen.queryByRole('button', { name: 'En yeni mesaja dön' }),
    ).toBeNull()

    log.scrollTop = 120
    fireEvent.scroll(log)
    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[
          first,
          message('inbound', { body: 'Yeni gelen mesaj' }),
        ]}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'En yeni mesaja dön' }),
    ).toBeNull()
    expect(
      screen.getByRole('button', { name: '1 yeni mesajı göster' }),
    ).toBeTruthy()
  })

  it('daha eski mesajlar için erişilebilir fallback eylemi sunar', () => {
    const onLoadOlder = vi.fn()
    render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[]}
        hasOlder
        onLoadOlder={onLoadOlder}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Daha eski mesajları yükle' }))
    expect(onLoadOlder).toHaveBeenCalledTimes(1)
  })

  it('geçmiş prepend edilince ilk görünür satırın konumunu scrollTop delta ile korur', () => {
    const first = message('first', { body: 'İlk', sentAt: '2026-07-20T09:00:00.000Z' })
    const second = message('second', { body: 'İkinci', sentAt: '2026-07-20T09:01:00.000Z' })
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first, second]} />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 150 })
    fireEvent.scroll(log)

    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[message('older', { body: 'Eski', sentAt: '2026-07-19T09:00:00.000Z' }), first, second]}
      />,
    )

    expect(log.scrollTop).toBe(278)
  })

  it('aynı gün içinde prepend edilirken day separator yerine ilk ortak mesajın göreli konumunu korur', () => {
    const first = message('first', { sentAt: '2026-07-20T09:00:00.000Z' })
    const second = message('second', { sentAt: '2026-07-20T09:01:00.000Z' })
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first, second]} />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 20 })
    fireEvent.scroll(log)

    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[message('older-same-day', { sentAt: '2026-07-20T08:00:00.000Z' }), first, second]}
      />,
    )

    expect(log.scrollTop).toBe(108)
  })

  it('yüklenirken daha eski mesaj fallback eylemini erişilebilir etiketle devre dışı bırakır', () => {
    render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[]}
        hasOlder
        loadingOlder
        onLoadOlder={vi.fn()}
      />,
    )

    expect((screen.getByRole('button', { name: 'Daha eski mesajlar yükleniyor' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('reduced motion etkin olduğunda latest jump anlık scroll davranışı ister', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const first = message('first')
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first]} />,
    )
    const log = screen.getByRole('log')
    const scrollTo = vi.fn()
    Object.defineProperty(log, 'scrollTo', { configurable: true, value: scrollTo })
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 600 })
    fireEvent.scroll(log)

    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[first, message('inbound', { body: 'Yeni gelen mesaj' })]}
      />,
    )

    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'auto' })
  })

  it('clientMessageId mevcut olduğunda sanal satır anahtarını onunla sabit tutar', () => {
    const optimistic = message('server-id', {
      clientMessageId: 'client-id',
      senderId: CURRENT_USER_ID,
    })
    render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[optimistic]} />,
    )

    expect(document.querySelector('[data-message-key="client-id"]')).toBeTruthy()
  })

  it('binlerce mesajda DOM satır sayısını pencere sınırında tutar ve seçili satırı pinler', () => {
    const messages = Array.from({ length: 2000 }, (_, index) =>
      message(`m-${index}`, {
        sequence: index + 1,
        body: `Mesaj ${index}`,
        senderId: index % 2 === 0 ? CURRENT_USER_ID : 'counterpart-1',
        sentAt: `2026-07-${String((index % 28) + 1).padStart(2, '0')}T09:00:00.000Z`,
      }),
    )
    render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={messages}
        selectedMessageKey="m-0"
      />,
    )

    expect(document.querySelectorAll('[data-virtual-row]').length).toBeLessThanOrEqual(80)
    expect(document.querySelector('[data-message-key="m-0"]')).toBeTruthy()
  })

  it('odaklanan satırı pencere kayınca DOM içinde pinler', () => {
    const messages = Array.from({ length: 200 }, (_, index) =>
      message(`m-${index}`, {
        sequence: index + 1,
        senderId: index === 0 ? CURRENT_USER_ID : 'counterpart-1',
        deliveryState: index === 0 ? 'failed' : 'sent',
      }),
    )
    const { rerender } = render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={messages}
        selectedMessageKey="m-0"
      />,
    )
    fireEvent.focus(screen.getByRole('button', { name: 'Tekrar dene' }))
    rerender(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={messages} />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 20000, scrollTop: 19600 })
    fireEvent.scroll(log)

    expect(document.querySelector('[data-message-key="m-0"]')).toBeTruthy()
  })

  it('prepend maxPages tail düşürse de ilk görünür ortak anchorun göreli konumunu korur', () => {
    const first = message('first', { sentAt: '2026-07-20T09:00:00.000Z' })
    const visible = message('visible', { sentAt: '2026-07-20T09:01:00.000Z' })
    const droppedTail = message('dropped-tail', { sentAt: '2026-07-20T09:02:00.000Z' })
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first, visible, droppedTail]} />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 150 })
    fireEvent.scroll(log)

    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[message('prepended', { sentAt: '2026-07-19T09:00:00.000Z' }), first, visible]}
      />,
    )

    expect(log.scrollTop).toBe(278)
  })

  it('normal motion smooth latest scrollunda scrollTop veya virtual offseti anında zorlamaz', () => {
    const first = message('first')
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first]} />,
    )
    const log = screen.getByRole('log')
    const scrollTo = vi.fn()
    Object.defineProperty(log, 'scrollTo', { configurable: true, value: scrollTo })
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 600 })
    fireEvent.scroll(log)

    rerender(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[first, message('inbound', { body: 'Yeni gelen mesaj' })]}
      />,
    )

    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' })
    expect(log.scrollTop).toBe(600)
  })

  it('ölçülen satır viewportun üstünde büyüdüğünde scroll delta ile görünür içeriği korur', () => {
    setMeasuredHeight('message:above', 100)
    const above = message('above')
    const current = message('current', { sentAt: '2026-07-20T09:01:00.000Z' })
    render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[above, current]} />,
    )
    act(() => DeterministicResizeObserver.flush())
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 200 })

    setMeasuredHeight('message:above', 150)
    act(() => DeterministicResizeObserver.flush())

    expect(log.scrollTop).toBe(250)
  })

  it('düşen ölçüm cache anahtarını prune eder ve aynı anahtarı yeniden ekleyince yeniden ölçer', () => {
    const first = message('reused', { sentAt: '2026-07-20T09:00:00.000Z' })
    const second = message('second', { sentAt: '2026-07-20T09:01:00.000Z' })
    setMeasuredHeight('message:reused', 200)
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first, second]} />,
    )
    act(() => DeterministicResizeObserver.flush())

    rerender(<MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[second]} />)
    rerender(<MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first, second]} />)

    const secondRow = document.querySelector('[data-row-key="message:second"]') as HTMLElement
    expect(secondRow.style.transform).toBe('translateY(128px)')
    act(() => DeterministicResizeObserver.flush())
    expect(secondRow.style.transform).toBe('translateY(240px)')
  })

  it('ölçüm cacheini pencere geçişlerinde bounded tutar ve erken satırı yeniden ziyaret edince tekrar ölçer', () => {
    const messages = Array.from({ length: 420 }, (_, index) => message(`cache-${index}`, { sequence: index + 1 }))
    setMeasuredHeight('message:cache-0', 100)
    for (let index = 1; index < messages.length; index += 1) {
      setMeasuredHeight(`message:cache-${index}`, 90)
    }
    render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={messages} />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 50000, scrollTop: 0 })
    act(() => DeterministicResizeObserver.flush())

    for (const scrollTop of [8000, 16000, 24000, 32000, 38000]) {
      log.scrollTop = scrollTop
      fireEvent.scroll(log)
      act(() => DeterministicResizeObserver.flush())
    }

    setMeasuredHeight('message:cache-0', 200)
    log.scrollTop = 0
    fireEvent.scroll(log)
    const nextRow = document.querySelector('[data-row-key="message:cache-1"]') as HTMLElement
    expect(nextRow.style.transform).toBe('translateY(128px)')
    act(() => DeterministicResizeObserver.flush())
    expect(nextRow.style.transform).toBe('translateY(240px)')
  })

  it('iki ardışık tekil inbound append için polite canlı çocuk düğümünü yeniden oluşturur', () => {
    const first = message('first')
    const { rerender } = render(
      <MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first]} />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 120 })
    fireEvent.scroll(log)
    const inboundOne = message('inbound-one', { body: 'İlk yeni mesaj' })
    rerender(<MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first, inboundOne]} />)
    const firstAnnouncementChild = screen.getByRole('status').firstElementChild
    expect(firstAnnouncementChild?.textContent).toBe('1 yeni mesaj')

    const inboundTwo = message('inbound-two', { body: 'İkinci yeni mesaj' })
    rerender(<MessageTimeline currentUserId={CURRENT_USER_ID} counterpartName="Ayşe Kaya" messages={[first, inboundOne, inboundTwo]} />)
    const secondAnnouncementChild = screen.getByRole('status').firstElementChild
    expect(secondAnnouncementChild?.textContent).toBe('1 yeni mesaj')
    expect(secondAnnouncementChild).not.toBe(firstAnnouncementChild)
  })

  it('render anahtarını clientMessageId önceliğiyle çözer ve duplicate sınır girdilerini tekilleştirir', () => {
    const pending = {
      ...message('pending-server-placeholder', { clientMessageId: 'client-1', body: 'Pending kopya', deliveryState: 'pending' }),
      id: undefined,
    } as MarketplaceMessage
    const canonical = message('canonical-1', { clientMessageId: 'client-1', body: 'Canonical mesaj', deliveryState: 'sent' })
    const firstDuplicate = message('duplicate-id', { body: 'İlk payload' })
    const laterDuplicate = message('duplicate-id', { body: 'Son payload' })

    expect(getMessageRenderKey(canonical)).toBe('client-1')
    render(
      <MessageTimeline
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[canonical, pending, firstDuplicate, message('between', { body: 'Aradaki payload' }), laterDuplicate]}
      />,
    )

    expect(screen.queryByText('Pending kopya')).toBeNull()
    expect(screen.getByText('Canonical mesaj')).toBeTruthy()
    expect(screen.queryByText('İlk payload')).toBeNull()
    expect(screen.getByText('Son payload')).toBeTruthy()
    expect(document.querySelectorAll('[data-message-key="client-1"]')).toHaveLength(1)
    const texts = [...screen.getByRole('log').querySelectorAll('article > p:nth-child(2)')].map((node) => node.textContent)
    expect(texts).toEqual(['Canonical mesaj', 'Aradaki payload', 'Son payload'])
  })

  it('ilk mountta latest konumuna auto ile anlık yerleşir', () => {
    const scrollTo = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo })

    render(
      <MessageTimeline
        conversationId="conversation-a"
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[message('first')]}
      />,
    )

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }))
  })

  it('aynı gün ve ortak mesaj anahtarlı konuşma değişiminde state taşımadan auto lateste resetler', () => {
    const overlap = message('overlap', { body: 'A ortak mesaj' })
    const { rerender } = render(
      <MessageTimeline
        conversationId="conversation-a"
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[overlap]}
      />,
    )
    const log = screen.getByRole('log')
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 120 })
    fireEvent.scroll(log)
    rerender(
      <MessageTimeline
        conversationId="conversation-a"
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[overlap, message('a-inbound', { body: 'A yeni mesaj' })]}
      />,
    )
    expect(screen.getByRole('button', { name: '1 yeni mesajı göster' })).toBeTruthy()

    const scrollTo = vi.fn()
    Object.defineProperty(log, 'scrollTo', { configurable: true, value: scrollTo })
    rerender(
      <MessageTimeline
        conversationId="conversation-b"
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[message('overlap', { body: 'B ortak mesaj' }), message('b-latest', { body: 'B son mesaj' })]}
      />,
    )

    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'auto' })
    expect(scrollTo).toHaveBeenCalledTimes(1)
    expect(log.scrollTop).toBe(1000)
    expect(screen.queryByRole('button', { name: '1 yeni mesajı göster' })).toBeNull()
    expect(screen.getByRole('status').textContent).toBe('')
    expect(screen.getByText('B son mesaj')).toBeTruthy()
  })

  it('older controlünü log virtual koordinat akışının dışında tutar ve kaldırılınca anchoru korur', () => {
    const first = message('first')
    const second = message('second', { sentAt: '2026-07-20T09:01:00.000Z' })
    const { rerender } = render(
      <MessageTimeline
        conversationId="conversation-a"
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[first, second]}
        hasOlder
        onLoadOlder={vi.fn()}
      />,
    )
    const log = screen.getByRole('log')
    const olderButton = screen.getByRole('button', { name: 'Daha eski mesajları yükle' })
    expect(log.contains(olderButton)).toBe(false)
    setScrollMetrics(log, { height: 400, scrollHeight: 1000, scrollTop: 150 })
    fireEvent.scroll(log)

    rerender(
      <MessageTimeline
        conversationId="conversation-a"
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[first, second]}
      />,
    )

    expect(log.scrollTop).toBe(150)
  })

  it('canonical acki pendingin ilk duplicate slotunda in-place değiştirir', () => {
    const pending = { ...message('temporary', { clientMessageId: 'client-slot', body: 'Pending', deliveryState: 'pending' }), id: undefined } as MarketplaceMessage
    const middle = message('middle', { body: 'Aradaki mesaj' })
    const acknowledged = message('canonical', { clientMessageId: 'client-slot', body: 'Ack mesajı', deliveryState: 'sent' })
    render(
      <MessageTimeline
        conversationId="conversation-a"
        currentUserId={CURRENT_USER_ID}
        counterpartName="Ayşe Kaya"
        messages={[pending, middle, acknowledged]}
      />,
    )

    const texts = [...screen.getByRole('log').querySelectorAll('article > p:nth-child(2)')].map((node) => node.textContent)
    expect(texts).toEqual(['Ack mesajı', 'Aradaki mesaj'])
  })

  it('render key için domain kaynağını re-export eder ve üçüncü fallback üretmez', () => {
    const malformed = { ...message('malformed'), id: undefined, clientMessageId: undefined } as unknown as MarketplaceMessage

    expect(getMessageRenderKey(malformed)).toBe(getDomainMessageRenderKey(malformed))
    expect(getMessageRenderKey(malformed)).toBeUndefined()
  })
})
