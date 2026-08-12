import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { GlassToastProvider } from '@repo/ui'
import { searchOffices } from './data/office-adapter'
import { parseOfficePrompt, matchOffices } from './domain/office-ai'
import { parseOfficeSearch } from './domain/office-search-state'
import type { OfficeActionDraft, OfficeAiProposal } from './domain/office-types'
import { OfficeDirectoryView } from './OfficeDirectoryView'
import { officeThreadCount, resetOfficeMessageStore } from '@/features/messages/data/office-message-store'

// View, randevu modalı için useGlassToast kullanıyor; gerçek kompozisyonda
// (ofisler.tsx) olduğu gibi GlassToastProvider ile sarmalanmalı.
function renderView(ui: ReactElement) {
  return render(<GlassToastProvider>{ui}</GlassToastProvider>)
}

async function buildProps(overrides: Partial<ComponentProps<typeof OfficeDirectoryView>> = {}) {
  const state = parseOfficeSearch({})
  const response = await searchOffices({ state, pageSize: 18 })
  const { brief, filters, confidence } = parseOfficePrompt('İzmir Urla’da arsa satışı için imar uzmanı arıyorum')
  const aiProposal: OfficeAiProposal = {
    brief,
    filters,
    confidence,
    summary: 'Urla’da arsa satışı ve imar danışmanlığı için ofisleri eşleştirdim.',
  }

  return {
    state,
    response,
    matches: matchOffices(brief, response.items),
    status: 'success' as const,
    aiProposal,
    compareIds: [],
    onStateChange: vi.fn(),
    onAiSearch: vi.fn(),
    onSelectOffice: vi.fn(),
    onToggleCompare: vi.fn(),
    onStartAction: vi.fn(),
    onApplyProposal: vi.fn(),
    onDismissProposal: vi.fn(),
    onConfirmAction: vi.fn(),
    onCloseAction: vi.fn(),
    ...overrides,
  }
}

describe('OfficeDirectoryView', () => {
  it('shows the AI prompt and the four intent choices', async () => {
    renderView(<OfficeDirectoryView {...(await buildProps())} />)

    expect(screen.getByRole('search', { name: /ofisleri yapay zekâ ile ara/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ev almak istiyorum' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ev kiralamak istiyorum' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Mülkümü satmak istiyorum' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Arsa veya ticari mülk için uzman arıyorum' })).toBeTruthy()
  })

  it('keeps an AI proposal separate until the user applies it', async () => {
    const props = await buildProps()
    renderView(<OfficeDirectoryView {...props} />)

    expect(screen.getByText('AI eşleşme önerisi')).toBeTruthy()
    expect(props.onStateChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Öneriyi uygula' }))
    expect(props.onApplyProposal).toHaveBeenCalledOnce()
    expect(props.onStateChange).not.toHaveBeenCalled()
  })

  it('keeps AI composer typing local until the user submits a proposal', async () => {
    const props = await buildProps({ aiProposal: undefined })
    renderView(<OfficeDirectoryView {...props} />)

    const prompt = 'İzmir Urla’da arsa satışı için imar uzmanı arıyorum'
    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: prompt } })

    expect((input as HTMLInputElement).value).toBe(prompt)
    expect(props.onStateChange).not.toHaveBeenCalled()
    expect(props.onAiSearch).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: `${props.response!.total} ofis bulundu` })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Ara' }))
    expect(props.onAiSearch).toHaveBeenCalledWith(prompt)
    expect(props.onStateChange).not.toHaveBeenCalled()
  })

  it('forwards a reviewed proposal-filter removal using its domain key', async () => {
    const onRemoveProposalFilter = vi.fn()
    const props = await buildProps({ onRemoveProposalFilter })
    renderView(<OfficeDirectoryView {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Filtreyi kaldır: Amaç: Satış' }))
    expect(onRemoveProposalFilter).toHaveBeenCalledWith('intent::sell')
    expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Doğal dilde arama' }))
  })

  it('opens the evidence insight panel when an office is selected', async () => {
    const props = await buildProps()
    renderView(<OfficeDirectoryView {...props} />)

    fireEvent.click(screen.getByRole('button', { name: /Urla Arsa Danışmanlık içgörülerini aç/i }))
    expect(props.onSelectOffice).toHaveBeenCalledWith('urla-arsa-danismanlik')

    renderView(<OfficeDirectoryView {...props} selectedOfficeId="urla-arsa-danismanlik" />)
    expect(screen.getByRole('heading', { name: 'Neden bu ofis?' })).toBeTruthy()
    expect(screen.getByText('Kanıt kaynakları')).toBeTruthy()
  })

  it('allows up to three offices to be selected for comparison', async () => {
    const props = await buildProps()
    renderView(<OfficeDirectoryView {...props} />)

    const compareButtons = screen.getAllByRole('button', { name: 'Karşılaştır' })
    fireEvent.click(compareButtons[0]!)
    fireEvent.click(compareButtons[1]!)
    fireEvent.click(compareButtons[2]!)

    expect(props.onToggleCompare).toHaveBeenCalledTimes(3)
  })

  it('opens a keyboard-reachable comparison destination with the required office metrics', async () => {
    const props = await buildProps()
    const compareIds = props.response!.items.slice(0, 3).map((office) => office.id)
    renderView(<OfficeDirectoryView {...props} compareIds={compareIds} />)

    const launcher = screen.getByRole('button', { name: 'Karşılaştır (3)' })
    expect(screen.getAllByRole('button', { name: 'Karşılaştır' }).some((button) => (button as HTMLButtonElement).disabled)).toBe(true)
    launcher.focus()
    await userEvent.setup().keyboard('{Enter}')

    expect(screen.getByRole('dialog', { name: 'Ofis karşılaştırması' })).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Seçili emlak ofisleri karşılaştırması' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'AI eşleşme' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'Ortalama yanıt' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'Doğrulama' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'Aktif portföy' })).toBeTruthy()
  })

  it('shows a fixture-grounded evidence source on every result card', async () => {
    const props = await buildProps()
    renderView(<OfficeDirectoryView {...props} />)

    expect(screen.getAllByText(/(İlan verisi|Ofis profili|Doğrulanmış işlem|Kullanıcı değerlendirmesi) ·/).length).toBe(props.response!.items.length)
  })

  it('does not confirm an action until the consent drawer confirmation is pressed', async () => {
    const actionDraft: OfficeActionDraft = {
      officeId: 'urla-arsa-danismanlik',
      action: 'meeting',
      summary: 'Urla Arsa Danışmanlık ile görüşme talebi',
      fields: [{ label: 'Amaç', value: 'Arsa satışı' }],
    }
    const props = await buildProps({ actionDraft })
    renderView(<OfficeDirectoryView {...props} />)

    const dialog = screen.getByRole('dialog', { name: 'Görüşme talebini onayla' })
    expect(dialog.textContent).toContain('Alıcı: Urla Arsa Danışmanlık')
    expect(dialog.textContent).toContain('Bu bilgileri seçtiğiniz ofise iletmek istediğinizi onaylıyor musunuz?')
    expect(props.onConfirmAction).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Gönderimi onayla' }))
    expect(props.onConfirmAction).toHaveBeenCalledOnce()
  })

  it.each([
    ['loading', 'Ofisler hazırlanıyor'],
    ['error', 'Ofisler yüklenemedi'],
  ] as const)('shows the %s state', async (status, heading) => {
    renderView(<OfficeDirectoryView {...(await buildProps({ status, response: undefined }))} />)
    expect(screen.getByText(heading)).toBeTruthy()
  })

  it('shows an empty result state without inventing an office', async () => {
    const props = await buildProps()
    renderView(<OfficeDirectoryView {...props} response={{ ...props.response!, items: [], total: 0 }} />)
    expect(screen.getByText('Bu filtrelerle eşleşen ofis bulunamadı')).toBeTruthy()
  })

  it('exposes enterprise location and sorting filters through controlled state changes', async () => {
    const props = await buildProps()
    renderView(<OfficeDirectoryView {...props} />)

    fireEvent.click(screen.getByRole('combobox', { name: 'Şehir' }))
    fireEvent.click(screen.getByRole('option', { name: 'İzmir' }))
    expect(props.onStateChange).toHaveBeenCalledWith(expect.objectContaining({ city: 'izmir', district: undefined }), { history: 'replace' })

    fireEvent.click(screen.getByRole('combobox', { name: 'Sıralama' }))
    fireEvent.click(screen.getByRole('option', { name: 'En hızlı yanıt' }))
    expect(props.onStateChange).toHaveBeenCalledWith(expect.objectContaining({ sort: 'response' }), { history: 'replace' })
  })

  it('opens the mobile filters drawer and offers error recovery without clearing the brief', async () => {
    const props = await buildProps({ status: 'error', response: undefined, onRetry: vi.fn() })
    renderView(<OfficeDirectoryView {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Filtreleri aç' }))
    expect(screen.getByRole('dialog', { name: 'Ofis filtreleri' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }))
    expect(props.onRetry).toHaveBeenCalledOnce()
  })

  it('prepopulates specialist property filters without silently changing intent to buy', async () => {
    const props = await buildProps()
    renderView(<OfficeDirectoryView {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Arsa veya ticari mülk için uzman arıyorum' }))
    expect(props.onStateChange).toHaveBeenCalledWith(expect.objectContaining({ propertyType: 'land', expertise: ['land'], intent: 'all' }), { history: 'push' })
  })

  it('Görüşme talep et randevu modalını açar; onStartAction çağrılmaz', async () => {
    const user = userEvent.setup()
    const onStartAction = vi.fn()
    const props = await buildProps({ onStartAction })
    renderView(<OfficeDirectoryView {...props} />)

    const kart = screen.getAllByRole('article')[0]!
    await user.click(within(kart).getByRole('button', { name: /görüşme talep et/i }))

    expect(screen.getByRole('dialog', { name: /görüşme planla/i })).toBeTruthy()
    expect(onStartAction).not.toHaveBeenCalled()
  })

  it('kartta müsaitlik önizleme satırı görünür', async () => {
    const props = await buildProps()
    renderView(<OfficeDirectoryView {...props} />)

    expect(screen.getAllByText(/boş saat/i).length).toBeGreaterThan(0)
  })

  it('Mesaj yazma çekmecesini açar; boşken gönderilmez, yazınca ofis sohbeti oluşur', async () => {
    resetOfficeMessageStore()
    const user = userEvent.setup()
    const onStartAction = vi.fn()
    const props = await buildProps({ onStartAction })
    renderView(<OfficeDirectoryView {...props} />)

    const kart = screen.getAllByRole('article')[0]!
    await user.click(within(kart).getByRole('button', { name: 'Mesaj' }))

    // Serbest metin yazılabilen gerçek bir çekmece açılır; taslak akışı devreye girmez.
    expect(onStartAction).not.toHaveBeenCalled()
    const dialog = screen.getByRole('dialog', { name: /ofise mesaj/i })
    const gonder = within(dialog).getByRole('button', { name: /mesajı gönder/i })
    expect(gonder).toHaveProperty('disabled', true)

    await user.type(
      within(dialog).getByRole('textbox', { name: /mesajınız/i }),
      'Arsa portföyünüzü görüşmek istiyorum.',
    )
    await user.click(within(dialog).getByRole('button', { name: /mesajı gönder/i }))

    expect(officeThreadCount()).toBe(1)
  })
})
