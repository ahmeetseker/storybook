import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassChatDock, type GlassChatDockMessage } from './GlassChatDock'

const baseMessages: GlassChatDockMessage[] = [
  { id: 'm1', role: 'user', text: 'Bu daire kaçıncı katta?' },
  { id: 'm2', role: 'ai', text: '7. katta, asansörlü binada.' },
]

describe('GlassChatDock — kapalı/açık geçişi', () => {
  it('varsayılan (kapalı) durumda yalnız "Soru sor" launcher butonu render edilir, panel yoktur', () => {
    render(<GlassChatDock messages={[]} onSend={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Soru sor' })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('launcher tıklanınca panel açılır (dialog rolü, title accessible name) ve input odak alır', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
    const dialog = screen.getByRole('dialog', { name: 'İlan Asistanı' })
    expect(dialog).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Mesajınız' }))
  })

  it('kapat butonu paneli kapatır ve odak launcher\'a geri döner', async () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
    // Launcher state değişimiyle senkron geri gelir (odak taşınır); panel'in
    // DOM'dan kalkması AnimatePresence exit animasyonuna bağlı — asenkron.
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Soru sor' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('Escape paneli kapatır ve odak launcher\'a geri döner', async () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Soru sor' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('controlled: dışarıdan open=true ile ilk render\'de odak input\'a taşınmaz (yalnız kullanıcı etkileşimiyle taşınır)', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} open onOpenChange={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: 'Mesajınız' }))
  })

  it('controlled: dışarıdan open false→true değişince de odak koşulsuz taşınmaz', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <GlassChatDock messages={baseMessages} onSend={vi.fn()} open={false} onOpenChange={onOpenChange} />,
    )
    rerender(<GlassChatDock messages={baseMessages} onSend={vi.fn()} open onOpenChange={onOpenChange} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: 'Mesajınız' }))
  })

  it('controlled modda launcher tıklaması onOpenChange(true) çağırır, kendi state\'ini değiştirmez', () => {
    const onOpenChange = vi.fn()
    render(<GlassChatDock messages={[]} onSend={vi.fn()} open={false} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    // open prop hâlâ false — dialog render edilmemeli (parent reddetti simülasyonu)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('defaultOpen ile uncontrolled başlangıçta panel açık render edilir', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} defaultOpen />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('controlled: parent launcher isteğini reddedip DAHA SONRA ilgisiz bir nedenle open=true yaparsa odak çalınmaz (regresyon: userTriggeredRef bayat kalmamalı)', async () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <GlassChatDock messages={baseMessages} onSend={vi.fn()} open={false} onOpenChange={onOpenChange} />,
    )
    // Kullanıcı launcher'a tıklar; parent isteği reddedip open'ı false'ta tutar (senkron kabul YOK)
    fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).toBeNull()

    // Kullanıcı bu arada sayfada başka bir alana odaklanır
    const elsewhere = document.createElement('input')
    document.body.appendChild(elsewhere)
    elsewhere.focus()
    expect(document.activeElement).toBe(elsewhere)

    // Reddedilen isteğin "kullanıcı tetikledi" bayrağı süresi dolsun (bkz. component: setTimeout 0 expiry)
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Daha sonra, tamamen ilgisiz/gecikmiş bir kabulle open=true olur
    rerender(<GlassChatDock messages={baseMessages} onSend={vi.fn()} open onOpenChange={onOpenChange} />)

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(document.activeElement).toBe(elsewhere)
    expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: 'Mesajınız' }))

    document.body.removeChild(elsewhere)
  })
})

describe('GlassChatDock — AI rozeti ve mesaj listesi', () => {
  it('"✦ AI" rozeti başlıkta her zaman render edilir, aria-label ile adlandırılır', () => {
    render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
  })

  it('mesaj listesi role="log" aria-live="polite" taşır', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} defaultOpen />)
    const log = screen.getByRole('log')
    expect(log.getAttribute('aria-live')).toBe('polite')
  })

  it('user ve ai mesajları metinleriyle render edilir; yalnız ai balonunun yanında mini ✦ vardır', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} defaultOpen />)
    expect(screen.getByText('Bu daire kaçıncı katta?')).toBeTruthy()
    expect(screen.getByText('7. katta, asansörlü binada.')).toBeTruthy()
  })

  it('pending mesaj metin yerine "yazıyor" göstergesi render eder', () => {
    render(
      <GlassChatDock
        messages={[...baseMessages, { id: 'm3', role: 'ai', text: '', pending: true }]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    expect(screen.getByText('yazıyor')).toBeTruthy()
  })

  it('kapalıyken mesaj listesi ve disclaimer DOM\'da yoktur', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} />)
    expect(screen.queryByRole('log')).toBeNull()
    expect(screen.queryByText('Yanıtlar yapay zekâ üretimidir, bağlayıcı değildir.')).toBeNull()
  })

  it('yeni mesaj eklendiğinde liste dibe kayar (scrollTop = scrollHeight)', () => {
    const { rerender } = render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} defaultOpen />)
    const log = screen.getByRole('log')
    Object.defineProperty(log, 'scrollHeight', { value: 800, configurable: true })
    rerender(
      <GlassChatDock
        messages={[...baseMessages, { id: 'm3', role: 'user', text: 'Peki krediye uygun mu?' }]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    expect(log.scrollTop).toBe(800)
  })
})

describe('GlassChatDock — composer', () => {
  it('metin girilmeden Gönder butonu disabled\'dır; metin girilince aktif olur', () => {
    render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen />)
    const send = screen.getByRole('button', { name: 'Gönder' })
    expect(send.hasAttribute('disabled')).toBe(true)
    fireEvent.change(screen.getByRole('textbox', { name: 'Mesajınız' }), { target: { value: 'Aidat ne kadar?' } })
    expect(send.hasAttribute('disabled')).toBe(false)
  })

  it('Enter tuşu onSend\'i trimlenmiş metinle çağırır ve alanı temizler', () => {
    const onSend = vi.fn()
    render(<GlassChatDock messages={[]} onSend={onSend} defaultOpen />)
    const input = screen.getByRole('textbox', { name: 'Mesajınız' }) as HTMLTextAreaElement
    fireEvent.change(input, { target: { value: '  Isınma tipi nedir?  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('Isınma tipi nedir?')
    expect(input.value).toBe('')
  })

  it('boş/yalnız boşluk metinle Enter onSend çağırmaz', () => {
    const onSend = vi.fn()
    render(<GlassChatDock messages={[]} onSend={onSend} defaultOpen />)
    const input = screen.getByRole('textbox', { name: 'Mesajınız' })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('Shift+Enter onSend çağırmaz (satır ekleme davranışı için preventDefault edilmez)', () => {
    const onSend = vi.fn()
    render(<GlassChatDock messages={[]} onSend={onSend} defaultOpen />)
    const input = screen.getByRole('textbox', { name: 'Mesajınız' })
    fireEvent.change(input, { target: { value: 'satır 1' } })
    const event = fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
    expect(event).toBe(true) // preventDefault çağrılmadı → event varsayılan akışına devam etti
  })

  it('IME kompozisyonu sürerken Enter onSend çağırmaz (kompozisyonu onaylar, taslağı erken göndermez)', () => {
    const onSend = vi.fn()
    render(<GlassChatDock messages={[]} onSend={onSend} defaultOpen />)
    const input = screen.getByRole('textbox', { name: 'Mesajınız' })
    fireEvent.change(input, { target: { value: '変換候補' } })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    expect(onSend).not.toHaveBeenCalled()
    // Kompozisyon bitince aynı Enter tuşu normal şekilde gönderir
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false })
    expect(onSend).toHaveBeenCalledWith('変換候補')
  })

  it('Gönder tıklaması onSend\'i çağırır', () => {
    const onSend = vi.fn()
    render(<GlassChatDock messages={[]} onSend={onSend} defaultOpen />)
    const input = screen.getByRole('textbox', { name: 'Mesajınız' })
    fireEvent.change(input, { target: { value: 'Kombi bakımlı mı?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gönder' }))
    expect(onSend).toHaveBeenCalledWith('Kombi bakımlı mı?')
  })
})

describe('GlassChatDock — içerik özelleştirme', () => {
  it('title/placeholder/disclaimer override edilebilir', () => {
    render(
      <GlassChatDock
        messages={[]}
        onSend={vi.fn()}
        defaultOpen
        title="Caddebostan Dairesi Asistanı"
        placeholder="Deniz manzarası hakkında sor…"
        disclaimer="Bu yanıtlar tapu/kadastro kaydı yerine geçmez."
      />,
    )
    expect(screen.getByRole('dialog', { name: 'Caddebostan Dairesi Asistanı' })).toBeTruthy()
    expect(screen.getByPlaceholderText('Deniz manzarası hakkında sor…')).toBeTruthy()
    expect(screen.getByText('Bu yanıtlar tapu/kadastro kaydı yerine geçmez.')).toBeTruthy()
  })

  it('disclaimer verilmezse varsayılan metin görünür', () => {
    render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen />)
    expect(screen.getByText('Yanıtlar yapay zekâ üretimidir, bağlayıcı değildir.')).toBeTruthy()
  })
})
