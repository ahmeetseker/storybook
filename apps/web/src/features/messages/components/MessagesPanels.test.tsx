import { StrictMode, useState } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MessageComposer,
  type ComposerSubmission,
} from './MessageComposer'
import { ConversationRail } from './ConversationRail'
import { MessageThread } from './MessageThread'
import { MessageDrawers, type MessageOverlayState } from './MessageDrawers'
import { MESSAGE_FIXTURES } from '../data/message-fixtures'
import type { ConversationFilter, ConversationSummary, UploadAttachmentOperation } from '../domain/message-types'

const MAX_LENGTH = 240

function ComposerHarness({
  disabled = false,
  readOnly = false,
  disabledReason,
  attachmentCapability,
  onSend = vi.fn<
    (input: ComposerSubmission) =>
      | void
      | boolean
      | Promise<void | boolean>
  >(),
}: {
  disabled?: boolean
  readOnly?: boolean
  disabledReason?: string
  attachmentCapability?: UploadAttachmentOperation
  onSend?: (
    input: ComposerSubmission,
  ) => void | boolean | Promise<void | boolean>
}) {
  const [value, setValue] = useState('')

  return (
    <MessageComposer
      value={value}
      onValueChange={setValue}
      onSend={onSend}
      disabled={disabled}
      readOnly={readOnly}
      disabledReason={disabledReason}
      attachmentCapability={attachmentCapability}
      maxLength={MAX_LENGTH}
    />
  )
}

function uploadCapability(): UploadAttachmentOperation {
  return async () => ({
    id: 'not-called',
    name: 'not-called',
    mimeType: 'image/jpeg',
    sizeBytes: 1,
    state: 'ready',
  })
}

describe('MessageComposer', () => {
  beforeEach(() => {
    if (typeof URL.createObjectURL !== 'function') {
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        value: () => 'blob:preview',
      })
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        value: () => undefined,
      })
    }
    vi.spyOn(URL, 'createObjectURL').mockImplementation((file) =>
      `blob:${file instanceof File ? file.name : 'preview'}`,
    )
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('boş veya yalnız boşluk içeren gövdeyi göndermez', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    render(<ComposerHarness onSend={onSend} />)

    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))
    await user.type(screen.getByRole('textbox', { name: 'Mesaj' }), '   ')
    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))

    expect(onSend).not.toHaveBeenCalled()
  })

  it('Enter ile düz gövdeyi gönderir ve textarea odağını korur', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    render(<ComposerHarness onSend={onSend} />)
    const textarea = screen.getByRole('textbox', { name: 'Mesaj' })

    await user.type(textarea, 'Merhaba')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledWith({ body: 'Merhaba', attachments: [] })
    expect(document.activeElement).toBe(textarea)
  })

  it('Shift+Enter ile yeni satır ekler ve gönderim yapmaz', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    render(<ComposerHarness onSend={onSend} />)
    const textarea = screen.getByRole('textbox', { name: 'Mesaj' })

    await user.type(textarea, 'Birinci satır')
    await user.keyboard('{Shift>}{Enter}{/Shift}İkinci satır')

    expect((textarea as HTMLTextAreaElement).value).toBe('Birinci satır\nİkinci satır')
    expect(onSend).not.toHaveBeenCalled()
  })

  it('IME composition sürerken Enter ile gönderim yapmaz', () => {
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    render(<ComposerHarness onSend={onSend} />)
    const textarea = screen.getByRole('textbox', { name: 'Mesaj' })

    fireEvent.change(textarea, { target: { value: 'İzmir' } })
    fireEvent.compositionStart(textarea)
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })
    fireEvent.compositionEnd(textarea)

    expect(onSend).not.toHaveBeenCalled()
  })

  it('native IME composition durumu true iken Enter ile gönderim yapmaz', () => {
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    render(<ComposerHarness onSend={onSend} />)
    const textarea = screen.getByRole('textbox', { name: 'Mesaj' })

    fireEvent.change(textarea, { target: { value: 'İzmir' } })
    fireEvent.keyDown(textarea, {
      key: 'Enter',
      code: 'Enter',
      isComposing: true,
    })

    expect(onSend).not.toHaveBeenCalled()
  })

  it('disabled reason’ı görünür kılar ve textarea ile ilişkilendirir', () => {
    render(
      <ComposerHarness
        disabled
        disabledReason="Bu konuşmaya artık mesaj gönderemezsiniz."
      />,
    )

    const reason = screen.getByText('Bu konuşmaya artık mesaj gönderemezsiniz.')
    const textarea = screen.getByRole('textbox', { name: 'Mesaj' })
    expect(reason.id).not.toBe('')
    expect(textarea.getAttribute('aria-describedby')).toBe(reason.id)
  })

  it('disabled composer hiçbir eylem üretmez', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    render(<ComposerHarness disabled onSend={onSend} attachmentCapability={uploadCapability()} />)

    expect((screen.getByRole('textbox', { name: 'Mesaj' }) as HTMLTextAreaElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Mesajı gönder' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Dosya ekle' }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))

    expect(onSend).not.toHaveBeenCalled()
  })

  it('read-only textarea odağa açıktır ama gönderme, ekleme ve kaldırma eylemi üretmez', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    const capability = uploadCapability()
    const { rerender } = render(
      <ComposerHarness onSend={onSend} attachmentCapability={capability} />,
    )
    const image = new File(['jpeg'], 'plan.jpg', { type: 'image/jpeg' })

    await user.type(screen.getByRole('textbox', { name: 'Mesaj' }), 'Korunan metin')
    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), image)
    rerender(
      <ComposerHarness
        readOnly
        onSend={onSend}
        attachmentCapability={capability}
      />,
    )

    const textarea = screen.getByRole('textbox', { name: 'Mesaj' }) as HTMLTextAreaElement
    textarea.focus()
    expect(textarea.readOnly).toBe(true)
    expect(textarea.disabled).toBe(false)
    expect(document.activeElement).toBe(textarea)
    expect((screen.getByRole('button', { name: 'Mesajı gönder' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Dosya ekle' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'plan.jpg dosyasını kaldır' }) as HTMLButtonElement).disabled).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))
    await user.click(screen.getByRole('button', { name: 'plan.jpg dosyasını kaldır' }))

    expect(onSend).not.toHaveBeenCalled()
    expect(screen.getByText('plan.jpg')).toBeTruthy()
  })

  it('upload capability olmadığında attachment kontrolünü render etmez', () => {
    render(<ComposerHarness />)

    expect(screen.queryByRole('button', { name: 'Dosya ekle' })).toBeNull()
    expect(screen.queryByLabelText('Mesaja dosya ekle')).toBeNull()
  })

  it('capability kaldırıldığında staged satırları gizler, previewyi temizler ve payload eklerini gate eder', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    const capability = uploadCapability()
    const { rerender } = render(
      <ComposerHarness onSend={onSend} attachmentCapability={capability} />,
    )
    const image = new File(['jpeg'], 'plan.jpg', { type: 'image/jpeg' })

    await user.type(screen.getByRole('textbox', { name: 'Mesaj' }), 'Ekli mesaj')
    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), image)
    rerender(<ComposerHarness onSend={onSend} />)

    expect(screen.queryByLabelText('Mesaja dosya ekle')).toBeNull()
    expect(screen.queryByText('plan.jpg')).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:plan.jpg')
    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))
    expect(onSend).toHaveBeenCalledWith({ body: 'Ekli mesaj', attachments: [] })
  })

  it('capability varken desteklenen dosyaları gönderime hazır olarak stage eder', async () => {
    const user = userEvent.setup()
    const capability = vi.fn(uploadCapability())
    render(<ComposerHarness attachmentCapability={capability} />)
    const files = [
      new File(['jpeg'], 'plan.jpg', { type: 'image/jpeg' }),
      new File(['png'], 'kroki.png', { type: 'image/png' }),
      new File(['webp'], 'cephe.webp', { type: 'image/webp' }),
      new File(['pdf'], 'tapu.pdf', { type: 'application/pdf' }),
    ]

    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), files)

    for (const file of files) {
      expect(screen.getByText(file.name)).toBeTruthy()
    }
    expect(screen.getAllByText('Gönderime hazır')).toHaveLength(4)
    expect(capability).not.toHaveBeenCalled()
  })

  it('reddedilen tür ve limit için ilgili attachment satırında hata gösterir', async () => {
    const user = userEvent.setup()
    render(<ComposerHarness attachmentCapability={uploadCapability()} />)
    const unsupported = new File(['gif'], 'animasyon.gif', { type: 'image/gif' })
    const tooLarge = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      'çok-büyük.pdf',
      { type: 'application/pdf' },
    )

    const input = screen.getByLabelText('Mesaja dosya ekle') as HTMLInputElement
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [unsupported, tooLarge],
    })
    fireEvent.change(input)

    expect(screen.getByRole('alert', { name: 'animasyon.gif' }).textContent).toBe('Bu dosya türü desteklenmiyor.')
    expect(screen.getByRole('alert', { name: 'çok-büyük.pdf' }).textContent).toBe('Dosya en fazla 10 MB olabilir.')
  })

  it('10 dosya sınırını aşan her attachment satırında count limiti hatası gösterir', () => {
    render(<ComposerHarness attachmentCapability={uploadCapability()} />)
    const files = Array.from({ length: 12 }, (_, index) =>
      new File([`${index}`], `belge-${index + 1}.pdf`, { type: 'application/pdf' }),
    )
    const input = screen.getByLabelText('Mesaja dosya ekle') as HTMLInputElement
    Object.defineProperty(input, 'files', { configurable: true, value: files })

    fireEvent.change(input)

    expect(screen.getAllByText('Gönderime hazır')).toHaveLength(10)
    expect(screen.getByRole('alert', { name: 'belge-11.pdf' }).textContent).toBe(
      'En fazla 10 dosya ekleyebilirsiniz.',
    )
    expect(screen.getByRole('alert', { name: 'belge-12.pdf' }).textContent).toBe(
      'En fazla 10 dosya ekleyebilirsiniz.',
    )
  })

  it('image preview URL’lerini kaldırma, başarılı gönderim ve unmount sırasında revoke eder', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    const { unmount } = render(
      <ComposerHarness onSend={onSend} attachmentCapability={uploadCapability()} />,
    )
    const image = new File(['jpeg'], 'plan.jpg', { type: 'image/jpeg' })

    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), image)
    await user.click(screen.getByRole('button', { name: 'plan.jpg dosyasını kaldır' }))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:plan.jpg')

    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), image)
    await user.type(screen.getByRole('textbox', { name: 'Mesaj' }), 'Ekli mesaj')
    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))
    expect(onSend).toHaveBeenLastCalledWith({ body: 'Ekli mesaj', attachments: [image] })
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)

    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), image)
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3)
  })

  it('StrictMode altında commit edilmiş her image preview URLsini tam bir kez revoke eder', async () => {
    const user = userEvent.setup()
    const urls = ['blob:strict-1', 'blob:strict-2']
    let urlIndex = 0
    vi.mocked(URL.createObjectURL).mockImplementation(() => urls[urlIndex++] ?? 'blob:unexpected')
    const { unmount } = render(
      <StrictMode>
        <ComposerHarness attachmentCapability={uploadCapability()} />
      </StrictMode>,
    )
    const files = [
      new File(['first'], 'birinci.jpg', { type: 'image/jpeg' }),
      new File(['second'], 'ikinci.jpg', { type: 'image/jpeg' }),
    ]

    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), files)
    await user.click(screen.getByRole('button', { name: 'birinci.jpg dosyasını kaldır' }))
    unmount()

    expect(URL.createObjectURL).toHaveBeenCalledTimes(2)
    expect(vi.mocked(URL.revokeObjectURL).mock.calls.map(([url]) => url)).toEqual(urls)
  })

  it('gönderim payload’ında yalnız stage edilmiş File nesnelerini taşır', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn<(input: ComposerSubmission) => void>()
    render(<ComposerHarness onSend={onSend} attachmentCapability={uploadCapability()} />)
    const file = new File(['PDF içeriği'], 'tapu.pdf', { type: 'application/pdf' })

    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), file)
    await user.type(screen.getByRole('textbox', { name: 'Mesaj' }), 'Belge ektedir')
    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))

    const payload = onSend.mock.calls[0]?.[0]
    expect(payload?.attachments).toEqual([file])
    expect(payload?.attachments[0]).toBeInstanceOf(File)
    expect(JSON.stringify(payload)).not.toContain('base64')
  })

  it('async workspace kabulüne kadar gövde ve ekleri korur; redde yalnız kabul sonrası temizler', async () => {
    const user = userEvent.setup()
    const firstAcceptance = deferred<boolean>()
    const image = new File(['jpeg'], 'korunan-plan.jpg', {
      type: 'image/jpeg',
    })
    const onSend = vi
      .fn<
        (
          input: ComposerSubmission,
        ) => void | boolean | Promise<void | boolean>
      >()
      .mockImplementationOnce(() => firstAcceptance.promise)
      .mockResolvedValueOnce(true)
    render(
      <ComposerHarness
        onSend={onSend}
        attachmentCapability={uploadCapability()}
      />,
    )
    const textarea = screen.getByRole('textbox', {
      name: 'Mesaj',
    }) as HTMLTextAreaElement

    await user.type(textarea, 'Yükleme tamamlanana kadar koru')
    await user.upload(screen.getByLabelText('Mesaja dosya ekle'), image)
    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))

    expect(textarea.value).toBe('Yükleme tamamlanana kadar koru')
    expect(screen.getByText('korunan-plan.jpg')).toBeTruthy()
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()

    await act(async () => firstAcceptance.resolve(false))
    await waitFor(() =>
      expect(
        (screen.getByRole('button', {
          name: 'Mesajı gönder',
        }) as HTMLButtonElement).disabled,
      ).toBe(false),
    )
    expect(textarea.value).toBe('Yükleme tamamlanana kadar koru')
    expect(screen.getByText('korunan-plan.jpg')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Mesajı gönder' }))
    await waitFor(() => expect(textarea.value).toBe(''))
    expect(screen.queryByText('korunan-plan.jpg')).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      'blob:korunan-plan.jpg',
    )
  })
})

function RailHarness({
  conversations = MESSAGE_FIXTURES.conversations.slice(0, 2),
  activeConversationId = conversations[0]?.id,
  totalCount = conversations.length,
  onConversationChange = vi.fn(),
  scrollOffset,
  onScrollOffsetChange,
}: {
  conversations?: readonly ConversationSummary[]
  activeConversationId?: string
  totalCount?: number
  onConversationChange?: (id: string) => void
  scrollOffset?: number
  onScrollOffsetChange?: (offset: number) => void
}) {
  const [filter, setFilter] = useState<ConversationFilter>('all')
  const [query, setQuery] = useState('')

  return (
    <ConversationRail
      conversations={conversations}
      totalCount={totalCount}
      filter={filter}
      query={query}
      activeConversationId={activeConversationId}
      hasNextPage
      loadingMore={false}
      onFilterChange={setFilter}
      onQueryChange={setQuery}
      onConversationChange={onConversationChange}
      onLoadMore={vi.fn()}
      scrollOffset={scrollOffset}
      onScrollOffsetChange={onScrollOffsetChange}
    />
  )
}

function makeConversations(count: number): ConversationSummary[] {
  const source = MESSAGE_FIXTURES.conversations[0]!
  return Array.from({ length: count }, (_, index) => ({
    ...source,
    id: `conversation-${index + 1}`,
    counterpart: {
      ...source.counterpart,
      id: `person-${index + 1}`,
      displayName: `Kişi ${index + 1}`,
    },
    listing: {
      ...source.listing,
      id: `listing-${index + 1}`,
      title: `İlan ${index + 1}`,
      referenceLabel: `Referans ${index + 1}`,
    },
  }))
}

describe('ConversationRail', () => {
  it('konuşmaları link temelli erişilebilir bir listede, okunmamış bilgisiyle gösterir', () => {
    const conversations = MESSAGE_FIXTURES.conversations.slice(0, 2)
    render(<RailHarness conversations={conversations} />)

    const nav = screen.getByRole('navigation', { name: 'Konuşmalar' })
    const list = nav.querySelector('ul')
    const rows = list?.querySelectorAll(':scope > li')
    const active = screen.getByRole('link', { name: /Ayşe Kaya.*Urla İskele’de Taş Ev/i })

    expect(list).toBeTruthy()
    expect(rows).toHaveLength(2)
    expect(rows?.[0]?.getAttribute('aria-setsize')).toBe('2')
    expect(rows?.[1]?.getAttribute('aria-posinset')).toBe('2')
    expect(nav.querySelector('[role="listbox"], [role="option"]')).toBeNull()
    expect(active.getAttribute('aria-current')).toBe('page')
    expect(active.getAttribute('href')).toBe('?konusma=conversation-urla-ayse')
    expect(screen.getByText('2 okunmamış')).toBeTruthy()
    expect(screen.getByText('Ödeme bilgilerinizi paylaşmayın.')).toBeTruthy()
    expect(screen.getByText('İlan Urla 1001')).toBeTruthy()
    expect(screen.getByText('20 Temmuz 2026')).toBeTruthy()
  })

  it('search ve filtreyi controlled olarak değiştirir, sonuç durumunu ve yükleme eylemini sunar', async () => {
    const user = userEvent.setup()
    render(<RailHarness />)

    await user.type(screen.getByRole('searchbox', { name: 'Konuşmalarda ara' }), 'urla')
    await user.click(screen.getByRole('radio', { name: 'Okunmamış' }))

    expect((screen.getByRole('searchbox', { name: 'Konuşmalarda ara' }) as HTMLInputElement).value).toBe('urla')
    expect(screen.getByRole('radio', { name: 'Okunmamış' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('2 sonuç bulundu')
    expect(screen.getByRole('button', { name: 'Daha fazla konuşma yükle' })).toBeTruthy()
  })

  it('odaktaki aktif satır listeden çıkınca sonraki satıra odağı taşır', () => {
    const conversations = MESSAGE_FIXTURES.conversations.slice(0, 2)
    const { rerender } = render(<RailHarness conversations={conversations} />)
    const active = screen.getByRole('link', { name: /Urla İskele’de Taş Ev/i })
    active.focus()

    rerender(<RailHarness conversations={[conversations[1]!]} activeConversationId="conversation-urla-ayse" />)

    expect(document.activeElement).toBe(screen.getByRole('link', { name: /Kordon’da Deniz Manzaralı Daire/i }))
  })

  it('odaktaki aktif olmayan satır çıkınca mantıksal komşuya, liste boşalınca başlığa odaklanır', () => {
    const conversations = MESSAGE_FIXTURES.conversations.slice(0, 3)
    const { rerender } = render(
      <RailHarness conversations={conversations} activeConversationId={conversations[0]?.id} />,
    )
    screen.getByRole('link', { name: /Kordon’da Deniz Manzaralı Daire/i }).focus()

    rerender(
      <RailHarness
        conversations={[conversations[0]!, conversations[2]!]}
        activeConversationId={conversations[0]?.id}
      />,
    )
    expect(document.activeElement).toBe(screen.getByRole('link', { name: /Çeşme Ilıca’da Yazlık/i }))

    screen.getByRole('link', { name: /Çeşme Ilıca’da Yazlık/i }).focus()
    rerender(<RailHarness conversations={[]} activeConversationId={conversations[0]?.id} />)
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Konuşmalar' }))
  })

  it('odak rail dışına çıktıktan sonra eski satırı pinlemez ve satır kaldırılırken dış odağı çalmaz', () => {
    const conversations = makeConversations(100)
    const { rerender } = render(
      <>
        <button type="button">Thread composer</button>
        <RailHarness
          conversations={conversations}
          activeConversationId="conversation-100"
        />
      </>,
    )
    const nav = screen.getByRole('navigation', { name: 'Konuşmalar' })
    const firstLink = nav.querySelector<HTMLAnchorElement>('a[href="?konusma=conversation-1"]')!
    const outside = screen.getByRole('button', { name: 'Thread composer' })
    firstLink.focus()
    outside.focus()

    const scrollArea = nav.querySelector<HTMLElement>('.conversationRail__scrollArea')!
    scrollArea.scrollTop = 5_200
    fireEvent.scroll(scrollArea)
    expect(nav.querySelector('a[href="?konusma=conversation-1"]')).toBeNull()

    rerender(
      <>
        <button type="button">Thread composer</button>
        <RailHarness
          conversations={conversations.slice(1)}
          activeConversationId="conversation-100"
        />
      </>,
    )
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Thread composer' }))
  })

  it('ölçümlü sanal pencerede DOMu sınırlar, overscan ile görünür satırları ve active/focus pinlerini korur', () => {
    const conversations = makeConversations(100)
    render(
      <RailHarness
        conversations={conversations}
        totalCount={250}
        activeConversationId="conversation-100"
      />,
    )
    const nav = screen.getByRole('navigation', { name: 'Konuşmalar' })
    const scrollArea = nav.querySelector<HTMLElement>('.conversationRail__scrollArea')!
    const initialRows = nav.querySelectorAll('ul > li')

    expect(initialRows.length).toBeLessThanOrEqual(34)
    expect(screen.getByRole('link', { name: /Kişi 100.*İlan 100/i })).toBeTruthy()
    expect(initialRows[0]?.getAttribute('aria-setsize')).toBe('250')
    expect(screen.getByRole('link', { name: /Kişi 100.*İlan 100/i }).closest('li')?.getAttribute('aria-posinset')).toBe('100')

    const focused = nav.querySelector<HTMLAnchorElement>('a[href="?konusma=conversation-1"]')!
    focused.focus()
    scrollArea.scrollTop = 5_200
    fireEvent.scroll(scrollArea)

    expect(nav.querySelector('a[href="?konusma=conversation-1"]')).toBe(focused)
    expect(screen.getByRole('link', { name: /Kişi 100.*İlan 100/i })).toBeTruthy()
    expect(nav.querySelectorAll('ul > li').length).toBeLessThanOrEqual(34)
    expect(screen.getByRole('link', { name: /Kişi 50.*İlan 50/i })).toBeTruthy()
  })

  it('ResizeObserver ölçümünü toplam sanal yüksekliğe yansıtır', async () => {
    const observers: Array<{
      callback: ResizeObserverCallback
      elements: Set<Element>
    }> = []
    const OriginalResizeObserver = globalThis.ResizeObserver
    class TestResizeObserver {
      callback: ResizeObserverCallback
      elements = new Set<Element>()
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        observers.push(this)
      }
      observe(element: Element) { this.elements.add(element) }
      unobserve(element: Element) { this.elements.delete(element) }
      disconnect() { return undefined }
    }
    Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: TestResizeObserver })
    try {
      render(<RailHarness conversations={makeConversations(20)} />)
      const list = screen.getByRole('navigation', { name: 'Konuşmalar' }).querySelector<HTMLUListElement>('ul')!
      const row = list.querySelector<HTMLElement>('li')!
      const initialHeight = list.style.height
      const rowObserver = observers.find((observer) => observer.elements.has(row))
      expect(rowObserver).toBeTruthy()

      act(() => {
        rowObserver?.callback([
          { target: row, contentRect: { height: 180 } } as unknown as ResizeObserverEntry,
        ], {} as ResizeObserver)
      })

      await waitFor(() => expect(list.style.height).not.toBe(initialHeight))
    } finally {
      Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: OriginalResizeObserver })
    }
  })

  it('modified ve orta tıklarda native link semantiğini korur; yalnız düz primary tıkta controlled callback çağırır', () => {
    const onConversationChange = vi.fn()
    render(<RailHarness onConversationChange={onConversationChange} />)
    const link = screen.getByRole('link', { name: /Urla İskele’de Taş Ev/i })

    for (const init of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      let componentPreventedDefault: boolean | undefined
      const stopNavigation = (event: MouseEvent) => {
        componentPreventedDefault = event.defaultPrevented
        event.preventDefault()
      }
      document.addEventListener('click', stopNavigation, { once: true })
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init })
      link.dispatchEvent(event)
      expect(componentPreventedDefault).toBe(false)
    }
    expect(onConversationChange).not.toHaveBeenCalled()

    const primary = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    link.dispatchEvent(primary)
    expect(primary.defaultPrevented).toBe(true)
    expect(onConversationChange).toHaveBeenCalledWith('conversation-urla-ayse')
  })

  it('scroll offsetini geri yükler ve kullanıcı scrollunu workspacee bildirir', () => {
    const onScrollOffsetChange = vi.fn()
    const { rerender } = render(
      <RailHarness scrollOffset={240} onScrollOffsetChange={onScrollOffsetChange} />,
    )
    const scrollArea = screen.getByRole('navigation', { name: 'Konuşmalar' })
      .querySelector<HTMLElement>('.conversationRail__scrollArea')!
    expect(scrollArea.scrollTop).toBe(240)

    scrollArea.scrollTop = 360
    fireEvent.scroll(scrollArea)
    expect(onScrollOffsetChange).toHaveBeenLastCalledWith(360)

    rerender(<RailHarness scrollOffset={120} onScrollOffsetChange={onScrollOffsetChange} />)
    expect(scrollArea.scrollTop).toBe(120)
  })
})

const activeConversation = MESSAGE_FIXTURES.conversations[0]!
const closedConversation = MESSAGE_FIXTURES.conversations.find((conversation) => conversation.status === 'listing-closed')!
const archivedConversation = MESSAGE_FIXTURES.conversations.find((conversation) => conversation.status === 'archived')!
const blockedConversation = MESSAGE_FIXTURES.conversations.find((conversation) => conversation.status === 'blocked')!

function renderThread(overrides: Partial<Parameters<typeof MessageThread>[0]> = {}) {
  return render(
    <MessageThread
      conversation={activeConversation}
      state="ready"
      messages={MESSAGE_FIXTURES.messages.filter((message) => message.conversationId === activeConversation.id)}
      currentUserId="current-user"
      draft=""
      onDraftChange={vi.fn()}
      onSend={vi.fn()}
      maxLength={240}
      {...overrides}
    />,
  )
}

describe('MessageThread', () => {
  it('katılımcı ve ilan bağlamını gösterir; ilan navigasyonunu yalnız callback varken sunar', () => {
    const { rerender } = renderThread()

    expect(screen.getByRole('heading', { name: 'Ayşe Kaya' })).toBeTruthy()
    expect(screen.getByText('Urla İskele’de Taş Ev')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'İlana git' })).toBeNull()

    const onOpenListing = vi.fn()
    rerender(
      <MessageThread
        conversation={activeConversation}
        state="ready"
        messages={[]}
        currentUserId="current-user"
        draft=""
        onDraftChange={vi.fn()}
        onSend={vi.fn()}
        maxLength={240}
        onOpenListing={onOpenListing}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'İlana git' }))
    expect(onOpenListing).toHaveBeenCalledWith(activeConversation.listing.id)
  })

  it('seçim yok, loading ve hata durumlarını thread içinde yerel gösterir', () => {
    const { rerender } = renderThread({ conversation: undefined })
    expect(screen.getByText('Bir konuşma seçin')).toBeTruthy()

    rerender(<MessageThread state="loading" />)
    expect(screen.getByText('Mesajlar yükleniyor')).toBeTruthy()

    rerender(<MessageThread state="error" error="Mesajlar alınamadı." />)
    expect(screen.getByRole('alert').textContent).toBe('Mesajlar alınamadı.')
  })

  it.each([
    [closedConversation, 'Bu ilan yayından kaldırıldığı için yeni mesaj gönderemezsiniz.', false],
    [archivedConversation, 'Bu konuşma arşivlendiği için yeni mesaj gönderemezsiniz.', false],
    [blockedConversation, 'Bu kişi engellendiği için yeni mesaj gönderemezsiniz.', true],
  ] as const)('okunabilir geçmişi korur ve %s durumunda composerı kilitler', (conversation, reason, disabled) => {
    renderThread({ conversation, messages: [], state: 'ready' })

    expect(screen.getByText(reason)).toBeTruthy()
    const input = screen.getByRole('textbox', { name: 'Mesaj' }) as HTMLTextAreaElement
    expect(input.disabled).toBe(disabled)
    expect(input.readOnly).toBe(!disabled)
  })

  it('send operation yokken composerı görünür gerekçeyle disabled tutar', () => {
    renderThread({ onSend: undefined })

    expect(screen.getByText('Mesaj gönderme şu anda kullanılamıyor.')).toBeTruthy()
    expect((screen.getByRole('textbox', { name: 'Mesaj' }) as HTMLTextAreaElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Mesajı gönder' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('hasOlder false kısa threadde latest kontrolünü tek timeline layout slotu içinde tutar', () => {
    renderThread()
    const thread = screen.getByRole('region', {
      name: 'Ayşe Kaya ile konuşma',
    })
    const log = screen.getByRole('log', {
      name: 'Ayşe Kaya ile mesajlar',
    })
    Object.defineProperties(log, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: {
        configurable: true,
        writable: true,
        value: 120,
      },
    })
    fireEvent.scroll(log)

    const latestButton = screen.getByRole('button', {
      name: 'En yeni mesaja dön',
    })
    const timelineViewport = latestButton.closest(
      '.messageTimeline__viewport',
    )
    expect(timelineViewport).toBeTruthy()
    expect(timelineViewport?.parentElement).toBe(thread)
    expect(thread.children).toHaveLength(3)
    expect(
      Array.from(thread.children).map((element) => element.className),
    ).toEqual([
      'messageThread__header',
      'messageTimeline__viewport',
      'messageComposer',
    ])
  })
})

function DrawersHarness({
  initialState,
  onReportMessage,
  onBlockParticipant,
  reportMessage = MESSAGE_FIXTURES.messages[0],
}: {
  initialState: Exclude<MessageOverlayState, undefined>
  onReportMessage?: Parameters<typeof MessageDrawers>[0]['onReportMessage']
  onBlockParticipant?: Parameters<typeof MessageDrawers>[0]['onBlockParticipant']
  reportMessage?: Parameters<typeof MessageDrawers>[0]['reportMessage']
}) {
  const [state, setState] = useState<MessageOverlayState>(initialState)
  return (
    <>
      <p>Thread korunuyor</p>
      <button type="button">Açan kontrol</button>
      <MessageDrawers
        state={state}
        conversation={activeConversation}
        reportMessage={reportMessage}
        onStateChange={setState}
        onReportMessage={onReportMessage}
        onBlockParticipant={onBlockParticipant}
      />
    </>
  )
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve
    reject = nextReject
  })
  return { promise, resolve, reject }
}

function SwitchingDrawersHarness({
  onReportMessage,
  onBlockParticipant,
}: {
  onReportMessage: NonNullable<Parameters<typeof MessageDrawers>[0]['onReportMessage']>
  onBlockParticipant: NonNullable<Parameters<typeof MessageDrawers>[0]['onBlockParticipant']>
}) {
  const [state, setState] = useState<MessageOverlayState>({
    kind: 'report',
    conversationId: activeConversation.id,
    messageId: 'message-urla-1',
  })
  return (
    <>
      <button
        type="button"
        onClick={() => setState({
          kind: 'block',
          conversationId: activeConversation.id,
          participantId: activeConversation.counterpart.id,
        })}
      >
        Engellemeyi aç
      </button>
      <button
        type="button"
        onClick={() => setState({
          kind: 'report',
          conversationId: activeConversation.id,
          messageId: 'message-urla-1',
        })}
      >
        Raporu yeniden aç
      </button>
      <MessageDrawers
        state={state}
        conversation={activeConversation}
        reportMessage={MESSAGE_FIXTURES.messages[0]}
        onStateChange={setState}
        onReportMessage={onReportMessage}
        onBlockParticipant={onBlockParticipant}
      />
    </>
  )
}

function ListingDrawerTriggerHarness() {
  const [state, setState] = useState<MessageOverlayState>()
  return (
    <>
      <button
        type="button"
        onClick={() => setState({ kind: 'listing', conversationId: activeConversation.id })}
      >
        İlan drawerını aç
      </button>
      <MessageDrawers
        state={state}
        conversation={activeConversation}
        onStateChange={setState}
      />
    </>
  )
}

describe('MessageDrawers', () => {
  it('listing drawerı konuşmanın gerçek ilan bağlamından kurar', () => {
    render(<DrawersHarness initialState={{ kind: 'listing', conversationId: activeConversation.id }} />)

    expect(screen.getByRole('dialog', { name: 'İlan ayrıntıları' })).toBeTruthy()
    expect(screen.getByText(activeConversation.listing.title)).toBeTruthy()
    expect(screen.getByText(activeConversation.listing.referenceLabel)).toBeTruthy()
  })

  it('report capability olmadığında rapor kontrolünü render etmez', () => {
    render(<DrawersHarness initialState={{ kind: 'report', conversationId: activeConversation.id, messageId: 'message-urla-1' }} />)

    expect(screen.queryByRole('dialog', { name: 'Mesajı bildir' })).toBeNull()
  })

  it('report message bağlamı state messageId ile eşleşmezse drawerı ve actionı güvenle reddeder', () => {
    const onReport = vi.fn(async () => undefined)
    render(
      <DrawersHarness
        initialState={{ kind: 'report', conversationId: activeConversation.id, messageId: 'stale-message' }}
        onReportMessage={onReport}
      />,
    )

    expect(screen.queryByRole('dialog', { name: 'Mesajı bildir' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Mesajı bildir' })).toBeNull()
    expect(onReport).not.toHaveBeenCalled()
  })

  it('block participant aktif konuşmanın counterpart kimliğiyle eşleşmezse drawerı reddeder', () => {
    const onBlock = vi.fn(async () => activeConversation)
    render(
      <DrawersHarness
        initialState={{ kind: 'block', conversationId: activeConversation.id, participantId: 'stale-participant' }}
        onBlockParticipant={onBlock}
      />,
    )

    expect(screen.queryByRole('dialog', { name: 'Kişiyi engelle' })).toBeNull()
    expect(onBlock).not.toHaveBeenCalled()
  })

  it('rapor ve engelleme eylemlerini ayırır; callback hatasında drawerı açık tutar', async () => {
    const user = userEvent.setup()
    const failedReport = vi.fn(async () => { throw new Error('Rapor şu anda gönderilemedi.') })
    render(
      <DrawersHarness
        initialState={{ kind: 'report', conversationId: activeConversation.id, messageId: 'message-urla-1' }}
        onReportMessage={failedReport}
      />,
    )

    expect(screen.getByText('Evi yarın görebilir miyiz?')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Mesajı bildir' }))

    expect((await screen.findByRole('alert')).textContent).toBe('Rapor şu anda gönderilemedi.')
    expect(screen.getByRole('dialog', { name: 'Mesajı bildir' })).toBeTruthy()
    expect(screen.getByText('Thread korunuyor')).toBeTruthy()
  })

  it('block capability varken ayrı bir drawer ve action kullanır', async () => {
    const user = userEvent.setup()
    const onBlock = vi.fn<(input: { conversationId: string; participantId: string; blocked: boolean }) => Promise<typeof activeConversation>>(
      async () => activeConversation,
    )
    render(
      <DrawersHarness
        initialState={{ kind: 'block', conversationId: activeConversation.id, participantId: activeConversation.counterpart.id }}
        onBlockParticipant={onBlock}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Kişiyi engelle' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Kişiyi engelle' }))
    expect(onBlock).toHaveBeenCalledWith({
      conversationId: activeConversation.id,
      participantId: activeConversation.counterpart.id,
      blocked: true,
    })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Kişiyi engelle' })).toBeNull())
  })

  it('aynı committe çift aktivasyonu tek operationa indirger ve eski success yeni drawerı kapatmaz', async () => {
    const pendingReport = deferred<void>()
    const onReport = vi.fn(() => pendingReport.promise)
    const onBlock = vi.fn(async () => activeConversation)
    render(<SwitchingDrawersHarness onReportMessage={onReport} onBlockParticipant={onBlock} />)
    const submit = screen.getByRole('button', { name: 'Mesajı bildir' })

    fireEvent.click(submit)
    fireEvent.click(submit)
    expect(onReport).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Engellemeyi aç' }))
    expect(screen.getByRole('dialog', { name: 'Kişiyi engelle' })).toBeTruthy()
    await act(async () => pendingReport.resolve())

    expect(screen.getByRole('dialog', { name: 'Kişiyi engelle' })).toBeTruthy()
  })

  it('eski request failureını yeni drawer içinde göstermez veya yeni submitting stateini bozmaz', async () => {
    const pendingReport = deferred<void>()
    const pendingBlock = deferred<ConversationSummary>()
    const onReport = vi.fn(() => pendingReport.promise)
    const onBlock = vi.fn(() => pendingBlock.promise)
    render(<SwitchingDrawersHarness onReportMessage={onReport} onBlockParticipant={onBlock} />)

    fireEvent.click(screen.getByRole('button', { name: 'Mesajı bildir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Engellemeyi aç' }))
    fireEvent.click(screen.getByRole('button', { name: 'Kişiyi engelle' }))
    await act(async () => pendingReport.reject(new Error('Eski rapor hatası')))

    expect(screen.queryByText('Eski rapor hatası')).toBeNull()
    expect(screen.getByRole('button', { name: 'Kişiyi engelle' }).getAttribute('aria-busy')).toBe('true')
    await act(async () => pendingBlock.resolve(activeConversation))
  })

  it('unmount sonrası tamamlanan request controlled state callbackini çağırmaz', async () => {
    const pendingReport = deferred<void>()
    const onStateChange = vi.fn()
    const { unmount } = render(
      <MessageDrawers
        state={{ kind: 'report', conversationId: activeConversation.id, messageId: 'message-urla-1' }}
        conversation={activeConversation}
        reportMessage={MESSAGE_FIXTURES.messages[0]}
        onStateChange={onStateChange}
        onReportMessage={() => pendingReport.promise}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı bildir' }))
    unmount()

    await act(async () => pendingReport.resolve())
    expect(onStateChange).not.toHaveBeenCalled()
  })

  it('A-B-A state geçişinde ilk drawer requestinin yeni aynı-kimli drawerı kapatmasına izin vermez', async () => {
    const pendingReport = deferred<void>()
    const onReport = vi.fn(() => pendingReport.promise)
    render(
      <SwitchingDrawersHarness
        onReportMessage={onReport}
        onBlockParticipant={async () => activeConversation}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı bildir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Engellemeyi aç' }))
    fireEvent.click(screen.getByRole('button', { name: 'Raporu yeniden aç' }))

    await act(async () => pendingReport.resolve())
    expect(screen.getByRole('dialog', { name: 'Mesajı bildir' })).toBeTruthy()
  })

  it('StrictMode effect yeniden kurulumu sonrası başarılı operation controlled drawerı kapatır', async () => {
    render(
      <StrictMode>
        <DrawersHarness
          initialState={{ kind: 'report', conversationId: activeConversation.id, messageId: 'message-urla-1' }}
          onReportMessage={async () => undefined}
        />
      </StrictMode>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mesajı bildir' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Mesajı bildir' })).toBeNull())
  })

  it('shared GlassDrawer Escape sözleşmesiyle kapanır ve odağı açan kontrole döndürür', async () => {
    const user = userEvent.setup()
    render(<ListingDrawerTriggerHarness />)
    const trigger = screen.getByRole('button', { name: 'İlan drawerını aç' })

    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'İlan ayrıntıları' })).toBeTruthy()
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'İlan ayrıntıları' })).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })
})
