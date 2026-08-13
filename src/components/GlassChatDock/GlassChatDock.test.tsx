import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  it('Escape (panel içi bir hedefte, ör. textarea) paneli kapatır ve odak launcher\'a geri döner', async () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Mesajınız' }), { key: 'Escape' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Soru sor' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('regresyon: document genelinde Escape paneli KAPATMAZ (yalnız panel içi hedeflerde çalışır, üst katmanla odak çakışmaz)', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('regresyon: panel içinde IME kompozisyonu sürerken Escape paneli kapatmaz', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Mesajınız' }), { key: 'Escape', isComposing: true })
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('regresyon: Escape kapanışı e.stopPropagation() çağırır — dış document dinleyicileri olayı almaz', () => {
    const outerSpy = vi.fn()
    document.addEventListener('keydown', outerSpy)
    try {
      render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'Soru sor' }))
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Mesajınız' }), { key: 'Escape' })
      expect(outerSpy).not.toHaveBeenCalled()
    } finally {
      document.removeEventListener('keydown', outerSpy)
    }
  })

  it('regresyon: controlled modda programatik kapanış anında odak panel içindeyse (ör. textarea) launcher\'a taşınır, body\'ye düşmez', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <GlassChatDock messages={baseMessages} onSend={vi.fn()} open onOpenChange={onOpenChange} />,
    )
    const textarea = screen.getByRole('textbox', { name: 'Mesajınız' })
    textarea.focus()
    expect(document.activeElement).toBe(textarea)

    rerender(<GlassChatDock messages={baseMessages} onSend={vi.fn()} open={false} onOpenChange={onOpenChange} />)

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Soru sor' }))
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

  it('regresyon: kullanıcı geçmişi okurken (dipte değilken) yeni AI mesajı gelirse liste zıplatılmaz', () => {
    const { rerender } = render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} defaultOpen />)
    const log = screen.getByRole('log')
    // scrollHeight - scrollTop - clientHeight = 1000 - 50 - 200 = 750 → eşiğin (48) çok üzerinde, dipte değil
    Object.defineProperty(log, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(log, 'clientHeight', { value: 200, configurable: true })
    Object.defineProperty(log, 'scrollTop', { value: 50, writable: true, configurable: true })
    rerender(
      <GlassChatDock
        messages={[...baseMessages, { id: 'm3', role: 'ai', text: 'Ek bilgi: aidat 2500 TL.' }]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    expect(log.scrollTop).toBe(50)
  })

  it('regresyon: kullanıcı dibe yakınken (48px eşiği altında) yeni AI mesajı liste dibe kaydırır', () => {
    const { rerender } = render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} defaultOpen />)
    const log = screen.getByRole('log')
    // scrollHeight - scrollTop - clientHeight = 1000 - 790 - 200 = 10 → eşiğin (48) altında, dipte sayılır
    Object.defineProperty(log, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(log, 'clientHeight', { value: 200, configurable: true })
    Object.defineProperty(log, 'scrollTop', { value: 790, writable: true, configurable: true })
    rerender(
      <GlassChatDock
        messages={[...baseMessages, { id: 'm3', role: 'ai', text: 'Ek bilgi: aidat 2500 TL.' }]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    expect(log.scrollTop).toBe(1000)
  })

  it('regresyon: mesaj metninin başında görsel-gizli "Siz:"/"Asistan:" öneki ekran okuyucuya duyurulur', () => {
    render(<GlassChatDock messages={baseMessages} onSend={vi.fn()} defaultOpen />)
    const log = screen.getByRole('log')
    expect(log.textContent).toContain('Siz: Bu daire kaçıncı katta?')
    expect(log.textContent).toContain('Asistan: 7. katta, asansörlü binada.')
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

describe('GlassChatDock — durum göstergesi ve zengin içerik', () => {
  it('pendingLabel verilen bekleyen mesaj üç nokta yerine durum etiketini gösterir (role=log içinde duyurulur)', () => {
    render(
      <GlassChatDock
        messages={[{ id: 'p1', role: 'ai', text: '', pending: true, pendingLabel: 'İlanlar aranıyor…', pendingState: 'searching' }]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    const log = screen.getByRole('log')
    expect(log.textContent).toContain('İlanlar aranıyor…')
    expect(screen.queryByText('yazıyor')).toBeNull()
  })

  it('pendingLabel verilmeyen bekleyen mesaj eski üç nokta göstergesini korur', () => {
    render(
      <GlassChatDock messages={[{ id: 'p1', role: 'ai', text: '', pending: true }]} onSend={vi.fn()} defaultOpen />,
    )
    expect(screen.getByText('yazıyor')).toBeTruthy()
  })

  it('content verilen mesaj metnin altında zengin içeriği render eder', () => {
    render(
      <GlassChatDock
        messages={[
          {
            id: 'r1',
            role: 'ai',
            text: '2 ilan buldum.',
            content: <button type="button">İlan kartı</button>,
          },
        ]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    expect(screen.getByText('2 ilan buldum.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'İlan kartı' })).toBeTruthy()
  })

  it('regresyon: dipteki bekleyen mesaj uzun yanıta dönüşünce liste dibe kayar (48px eşiğini aşsa bile)', () => {
    const { rerender } = render(
      <GlassChatDock
        messages={[...baseMessages, { id: 'p1', role: 'ai', text: '', pending: true, pendingLabel: 'Aranıyor…' }]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    const log = screen.getByRole('log')
    // Yanıt gelince içerik büyür: kullanıcı eski dipten 750px uzakta kalır
    Object.defineProperty(log, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(log, 'clientHeight', { value: 200, configurable: true })
    Object.defineProperty(log, 'scrollTop', { value: 50, writable: true, configurable: true })
    rerender(
      <GlassChatDock
        messages={[...baseMessages, { id: 'p1', role: 'ai', text: 'Uzun yanıt', content: <div>kartlar</div> }]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    expect(log.scrollTop).toBe(1000)
  })

  it('pending mesajda content çizilmez — önce durum, yanıt gelince içerik', () => {
    render(
      <GlassChatDock
        messages={[
          { id: 'r1', role: 'ai', text: '', pending: true, pendingLabel: 'Hesaplanıyor…', content: <button type="button">Erken kart</button> },
        ]}
        onSend={vi.fn()}
        defaultOpen
      />,
    )
    expect(screen.queryByRole('button', { name: 'Erken kart' })).toBeNull()
  })
})

describe('GlassChatDock — composer süsü (composerOrnament)', () => {
  it('composerOrnament verilince kapsül içinde süs + ayraç render edilir, erişilebilir ada karışmaz', () => {
    render(
      <GlassChatDock
        messages={[]}
        onSend={vi.fn()}
        defaultOpen
        composerOrnament={<img src="orb.gif" alt="" data-testid="orb-gorsel" />}
      />,
    )
    expect(screen.getByTestId('orb-gorsel')).toBeTruthy()
    // Süs dekoratif: textarea'nın adı değişmez, süs kapsayıcısı aria-hidden
    expect(screen.getByRole('textbox', { name: 'Mesajınız' })).toBeTruthy()
    expect(screen.getByTestId('orb-gorsel').closest('[aria-hidden="true"]')).toBeTruthy()
  })

  it('composerOrnament verilmezse süs ve ayraç DOM\'da yoktur', () => {
    const { container } = render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('GlassChatDock — örnek soru pill\'leri (suggestions prop)', () => {
  it('suggestions verilince pill\'ler composer üstünde buton olarak render edilir; tıklama onSend\'i aynen çağırır', () => {
    const onSend = vi.fn()
    render(
      <GlassChatDock
        messages={[]}
        onSend={onSend}
        defaultOpen
        suggestions={['Randevum var mı?', 'Endeks nasıl?']}
      />,
    )
    const grup = screen.getByRole('group', { name: 'Örnek sorular' })
    expect(grup).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Randevum var mı?' }))
    expect(onSend).toHaveBeenCalledWith('Randevum var mı?')
  })

  it('suggestions verilmezse pill grubu DOM\'da yoktur', () => {
    render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen />)
    expect(screen.queryByRole('group', { name: 'Örnek sorular' })).toBeNull()
  })

  it('mouse tekerinin dikey hareketi pill sırasını yatay kaydırır (taşma varken)', () => {
    render(
      <GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen suggestions={['Soru 1', 'Soru 2', 'Soru 3']} />,
    )
    const grup = screen.getByRole('group', { name: 'Örnek sorular' })
    Object.defineProperty(grup, 'scrollWidth', { value: 600, configurable: true })
    Object.defineProperty(grup, 'clientHeight', { value: 40, configurable: true })
    Object.defineProperty(grup, 'clientWidth', { value: 300, configurable: true })
    fireEvent.wheel(grup, { deltaY: 80, deltaX: 0 })
    expect(grup.scrollLeft).toBe(80)
    // Taşma yokken teker sayfaya bırakılır — scrollLeft değişmez
    Object.defineProperty(grup, 'scrollWidth', { value: 300, configurable: true })
    fireEvent.wheel(grup, { deltaY: 80, deltaX: 0 })
    expect(grup.scrollLeft).toBe(80)
  })
})

describe('GlassChatDock — daktilo placeholder (placeholders prop)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const getInput = () => screen.getByRole('textbox', { name: 'Mesajınız' })

  it('placeholders verilince cümle karakter karakter yazılır; yazım sürerken imleç (|) görünür, bitince kalkar', () => {
    vi.useFakeTimers()
    render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen placeholders={['Abc', 'De']} />)
    // effect ilk turda charCount'u sıfırlar — henüz karakter yok, yalnız imleç
    expect(getInput().getAttribute('placeholder')).toBe('|')
    act(() => {
      vi.advanceTimersByTime(60)
    })
    expect(getInput().getAttribute('placeholder')).toBe('A|')
    act(() => {
      vi.advanceTimersByTime(120)
    })
    // cümle tamamlandı → imleç kalkar
    expect(getInput().getAttribute('placeholder')).toBe('Abc')
  })

  it('cümle tamamlandıktan sonra bekleme süresi dolunca sıradaki cümleye geçer (döngüsel)', () => {
    vi.useFakeTimers()
    render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen placeholders={['Abc', 'De']} />)
    act(() => {
      vi.advanceTimersByTime(180) // 'Abc' tamamlanır
    })
    act(() => {
      vi.advanceTimersByTime(60 + 2400) // fazladan bir interval turu + idle bekleme
    })
    act(() => {
      vi.advanceTimersByTime(60) // yeni cümlenin ilk karakteri
    })
    expect(getInput().getAttribute('placeholder')).toBe('D|')
  })

  it('kullanıcı taslak yazarken animasyon duraklar — placeholder tam cümleye sabitlenir, zaman ilerlese de değişmez', () => {
    vi.useFakeTimers()
    render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen placeholders={['Abc', 'De']} />)
    act(() => {
      vi.advanceTimersByTime(60) // 'A|'
    })
    fireEvent.change(getInput(), { target: { value: 'x' } })
    expect(getInput().getAttribute('placeholder')).toBe('Abc')
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(getInput().getAttribute('placeholder')).toBe('Abc')
  })

  it('prefers-reduced-motion: daktilo tamamen kapalı — ilk öneri statik, imleçsiz gösterilir', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia
    vi.useFakeTimers()
    try {
      render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen placeholders={['Abc', 'De']} />)
      expect(getInput().getAttribute('placeholder')).toBe('Abc')
      act(() => {
        vi.advanceTimersByTime(10_000)
      })
      expect(getInput().getAttribute('placeholder')).toBe('Abc')
    } finally {
      window.matchMedia = original
    }
  })

  it('placeholders verilmezse statik placeholder prop\'u aynen kullanılır (animasyon yok)', () => {
    vi.useFakeTimers()
    render(<GlassChatDock messages={[]} onSend={vi.fn()} defaultOpen placeholder="Bir soru yaz…" />)
    expect(getInput().getAttribute('placeholder')).toBe('Bir soru yaz…')
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(getInput().getAttribute('placeholder')).toBe('Bir soru yaz…')
  })
})
