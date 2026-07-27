import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import {
  GlassIslandHeader,
  type GlassIslandHeaderPage,
  type GlassIslandHeaderSubItem,
} from './GlassIslandHeader'

const pages: GlassIslandHeaderPage[] = [
  { key: 'search', label: 'Arsa ara', icon: <span>🔍</span> },
  { key: 'offices', label: 'Ofisler', icon: <span>🏢</span> },
  { key: 'blog', label: 'Blog', icon: <span>📖</span> },
]

const subNav: Record<string, GlassIslandHeaderSubItem[]> = {
  search: [
    { key: 'list', label: 'Liste' },
    { key: 'map', label: 'Harita' },
  ],
}

function renderHeader(props: Partial<React.ComponentProps<typeof GlassIslandHeader>> = {}) {
  return render(
    <GlassIslandHeader
      brandIcon={<span>✦</span>}
      brandLabel="arsam.net"
      pages={pages}
      subNav={subNav}
      activeKey="search"
      {...props}
    />,
  )
}

describe('GlassIslandHeader — kapalı hap', () => {
  it('kapalıyken hap butonu (aria-haspopup, aria-expanded=false) render edilir, panel yoktur', () => {
    renderHeader()
    const pill = screen.getByRole('button', { name: 'Hızlı gezinme' })
    expect(pill.getAttribute('aria-expanded')).toBe('false')
    expect(pill.getAttribute('aria-haspopup')).toBe('dialog')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('durum chip\'i aktif sayfanın etiketini "Şu an:" öneki ile duyurur', () => {
    renderHeader()
    expect(screen.getByLabelText('Şu an: Arsa ara')).toBeTruthy()
  })

  it('statusLabel durum chip\'ini geçersiz kılar', () => {
    renderHeader({ statusLabel: 'Urla · zeytinlik' })
    expect(screen.getByLabelText('Şu an: Urla · zeytinlik')).toBeTruthy()
  })

  it('zil yalnız onNotificationsClick verilince render edilir ve okunmamış sayısını duyurur', () => {
    const onNotificationsClick = vi.fn()
    renderHeader({ onNotificationsClick, notificationCount: 3 })
    const trigger = screen.getByRole('button', { name: 'Hızlı gezinme' })
    const bell = screen.getByRole('button', { name: 'Bildirimler, 3 okunmamış' })
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.contains(bell)).toBe(false)
    fireEvent.click(bell)
    expect(onNotificationsClick).toHaveBeenCalledTimes(1)
  })

  it('zil tıklaması paneli AÇMAZ (stopPropagation)', () => {
    renderHeader({ onNotificationsClick: vi.fn() })
    fireEvent.click(screen.getByRole('button', { name: 'Bildirimler' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('onNotificationsClick verilmezse zil render edilmez', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: /Bildirimler/ })).toBeNull()
  })

  it('brandHref markayı gerçek bağlantı yapar; iç rota onRoute ile SPA router\'a delege edilir', () => {
    const onRoute = vi.fn()
    renderHeader({ brandHref: '/', onRoute })
    const brand = screen.getByRole('link', { name: 'arsam.net' })
    expect(brand.getAttribute('href')).toBe('/')
    fireEvent.click(brand)
    expect(onRoute).toHaveBeenCalledWith('/')
  })

  it('statusTrail salt-okunur yolu statusLabel yerine duyurur', () => {
    renderHeader({
      statusLabel: 'Yok sayılır',
      statusTrail: ['Emlak', 'Arsa', 'Urla'],
      statusVisibility: 'always',
      showClock: false,
    })
    expect(screen.getByLabelText('Şu an: Emlak › Arsa › Urla')).toBeTruthy()
    expect(screen.queryByLabelText('Şu an: Yok sayılır')).toBeNull()
  })

  it('uzun statusTrail ara basamakları üç noktayla sıkıştırır ama tam yolu duyurur', () => {
    renderHeader({
      statusTrail: ['Anasayfa', 'Hesabım', 'İlan yönetimi', 'Yayındaki ilanlar'],
      statusVisibility: 'always',
      showClock: false,
    })

    const status = screen.getByLabelText(
      'Şu an: Anasayfa › Hesabım › İlan yönetimi › Yayındaki ilanlar',
    )
    expect(within(status).getByText('Anasayfa')).toBeTruthy()
    expect(within(status).getByText('…')).toBeTruthy()
    expect(within(status).getByText('Yayındaki ilanlar')).toBeTruthy()
    expect(within(status).queryByText('Hesabım')).toBeNull()
    expect(within(status).queryByText('İlan yönetimi')).toBeNull()
  })

  it('statusVisibility=hidden durum chip\'ini DOM\'dan kaldırır', () => {
    renderHeader({ statusVisibility: 'hidden' })
    expect(screen.queryByLabelText('Şu an: Arsa ara')).toBeNull()
  })

  it('hover ve focus-within birbirini bastırmadan durum chip’ini açık tutar', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: query === '(hover: hover) and (pointer: fine)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia

    try {
      renderHeader({ statusVisibility: 'auto' })
      const trigger = screen.getByRole('button', { name: 'Hızlı gezinme' })
      const pill = trigger.parentElement!
      const statusReveal = screen.getByLabelText('Şu an: Arsa ara').parentElement!

      fireEvent.focus(trigger)
      fireEvent.mouseLeave(pill)
      expect(statusReveal.getAttribute('data-visible')).toBe('true')

      fireEvent.mouseEnter(pill)
      fireEvent.focusOut(pill, { relatedTarget: document.body })
      expect(statusReveal.getAttribute('data-visible')).toBe('true')

      fireEvent.mouseLeave(pill)
      expect(statusReveal.getAttribute('data-visible')).toBe('false')
    } finally {
      window.matchMedia = original
    }
  })

  it('initialTime + timeZone SSR ile aynı deterministik saat metnini üretir', () => {
    renderHeader({
      statusVisibility: 'always',
      initialTime: '2026-07-24T09:56:00.000Z',
      timeZone: 'Europe/Istanbul',
    })
    expect(screen.getByText('12:56')).toBeTruthy()
  })

  it('initialTime verilmezse server HTML deterministik saat placeholder\'ı üretir', () => {
    const html = renderToString(
      <GlassIslandHeader
        brandIcon={<span>✦</span>}
        brandLabel="arsam.net"
        pages={pages}
        statusVisibility="always"
      />,
    )
    expect(html).toContain('--:--')
  })
})

describe('GlassIslandHeader — panel açma/kapama', () => {
  it('panel açıkken arka sayfa scroll’unu kilitler ve kapanınca stilleri geri yükler', async () => {
    const previousBodyOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'scroll'

    try {
      renderHeader({ defaultOpen: true })
      expect(document.body.style.overflow).toBe('hidden')
      expect(document.documentElement.style.overflow).toBe('hidden')

      fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
      await waitFor(() => expect(document.body.style.overflow).toBe('auto'))
      expect(document.documentElement.style.overflow).toBe('scroll')
    } finally {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousRootOverflow
    }
  })

  it('hap tıklaması paneli açar: dialog rolü, görünür başlığa bağlı accessible name', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Hızlı gezinme' }))
    expect(screen.getByRole('dialog', { name: 'Nereye gitmek istersin?' })).toBeTruthy()
  })

  it('açılışta modal dialog odağı içeri alır ve Shift+Tab son hedefe sarar', async () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Hızlı gezinme' }))

    const dialog = screen.getByRole('dialog', {
      name: 'Nereye gitmek istersin?',
    })
    const close = screen.getByRole('button', { name: 'Kapat' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(close))

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(focusable[focusable.length - 1])
  })

  it('kapat butonu paneli kapatır ve odak hapa döner', async () => {
    renderHeader({ defaultOpen: true })
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Hızlı gezinme' }))
  })

  it('Escape (panel içi bir hedefte) paneli kapatır ve odak hapa döner', async () => {
    renderHeader({ defaultOpen: true })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Kapat' }), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Hızlı gezinme' }))
  })

  it('document genelinde Escape paneli KAPATMAZ (yalnız başlık içi hedeflerde çalışır)', () => {
    renderHeader({ defaultOpen: true })
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('controlled: hap tıklaması yalnız onOpenChange çağırır, parent reddederse açılmaz', () => {
    const onOpenChange = vi.fn()
    renderHeader({ open: false, onOpenChange })
    fireEvent.click(screen.getByRole('button', { name: 'Hızlı gezinme' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('controlled: programatik kapanışta odak panel içindeyse hapa taşınır', async () => {
    const { rerender } = render(
      <GlassIslandHeader brandIcon={<span>✦</span>} brandLabel="arsam.net" pages={pages} open />,
    )
    const close = screen.getByRole('button', { name: 'Kapat' })
    close.focus()
    rerender(
      <GlassIslandHeader brandIcon={<span>✦</span>} brandLabel="arsam.net" pages={pages} open={false} />,
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Hızlı gezinme' })),
    )
  })

  it('controlled parent kapanışı reddederse odak modal içinde kalır ve dışarıdan Tab odağı geri alır', async () => {
    const onOpenChange = vi.fn()
    renderHeader({ open: true, onOpenChange })

    const close = screen.getByRole('button', { name: 'Kapat' })
    await waitFor(() => expect(document.activeElement).toBe(close))
    fireEvent.click(close)

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(document.activeElement).toBe(close)

    const trigger = screen.getByRole('button', { name: 'Hızlı gezinme' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
  })
})

describe('GlassIslandHeader — gezinme akışı', () => {
  it('href verilen doğrudan sayfa gerçek linktir; onNavigate ve onRoute birlikte çağrılır', async () => {
    const onNavigate = vi.fn()
    const onRoute = vi.fn()
    renderHeader({
      defaultOpen: true,
      pages: [
        ...pages,
        { key: 'about', label: 'Hakkımızda', href: '/hakkimizda', icon: <span>i</span> },
      ],
      onNavigate,
      onRoute,
    })
    const link = screen.getByRole('link', { name: 'Hakkımızda' })
    expect(link.getAttribute('href')).toBe('/hakkimizda')
    fireEvent.click(link)
    expect(onNavigate).toHaveBeenCalledWith('about')
    expect(onRoute).toHaveBeenCalledWith('/hakkimizda')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('alt navigasyonu olmayan sayfa kartı doğrudan onNavigate çağırır ve paneli kapatır', async () => {
    const onNavigate = vi.fn()
    renderHeader({ defaultOpen: true, onNavigate })
    fireEvent.click(screen.getByRole('button', { name: 'Blog' }))
    expect(onNavigate).toHaveBeenCalledWith('blog')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('alt navigasyonu olan sayfa kartı paneli KAPATMAZ, alt görünümü açar', async () => {
    const onNavigate = vi.fn()
    renderHeader({ defaultOpen: true, onNavigate })
    fireEvent.click(screen.getByRole('button', { name: 'Arsa ara' }))
    expect(onNavigate).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeTruthy()
    // Görünüm geçişi AnimatePresence mode="wait" — kart ızgarası çıkışı
    // bittikten sonra alt görünüm mount edilir (asenkron).
    expect(await screen.findByRole('button', { name: 'Liste' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Harita' })).toBeTruthy()
  })

  it('alt öğe seçimi onNavigate(pageKey, subKey) çağırır ve paneli kapatır', async () => {
    const onNavigate = vi.fn()
    renderHeader({ defaultOpen: true, onNavigate })
    fireEvent.click(screen.getByRole('button', { name: 'Arsa ara' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Harita' }))
    expect(onNavigate).toHaveBeenCalledWith('search', 'map')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('href verilen alt öğe gerçek linktir ve onRoute ile delege edilir', async () => {
    const onNavigate = vi.fn()
    const onRoute = vi.fn()
    renderHeader({
      defaultOpen: true,
      subNav: {
        search: [{ key: 'map', label: 'Harita', href: '/arsa/harita' }],
      },
      onNavigate,
      onRoute,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Arsa ara' }))
    const link = await screen.findByRole('link', { name: 'Harita' })
    fireEvent.click(link)
    expect(onNavigate).toHaveBeenCalledWith('search', 'map')
    expect(onRoute).toHaveBeenCalledWith('/arsa/harita')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('alt görünümdeyken başka bir sayfaya (alt navigasyonsuz) geçiş doğrudan gezinir', async () => {
    const onNavigate = vi.fn()
    renderHeader({ defaultOpen: true, onNavigate })
    fireEvent.click(screen.getByRole('button', { name: 'Arsa ara' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Blog' }))
    expect(onNavigate).toHaveBeenCalledWith('blog')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('panel yeniden açıldığında kart ızgarasından başlar (alt görünüm sıfırlanır)', async () => {
    renderHeader()
    const pill = screen.getByRole('button', { name: 'Hızlı gezinme' })
    fireEvent.click(pill)
    fireEvent.click(screen.getByRole('button', { name: 'Arsa ara' }))
    expect(await screen.findByRole('button', { name: 'Liste' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(pill)
    expect(await screen.findByRole('button', { name: 'Arsa ara' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Liste' })).toBeNull()
  })
})

describe('GlassIslandHeader — slotlar', () => {
  it('extras ve search slotları yalnız panel açıkken render edilir', () => {
    const { rerender } = render(
      <GlassIslandHeader
        brandIcon={<span>✦</span>}
        brandLabel="arsam.net"
        pages={pages}
        extras={<span>EXTRAS-SLOT</span>}
        search={<span>SEARCH-SLOT</span>}
      />,
    )
    expect(screen.queryByText('EXTRAS-SLOT')).toBeNull()
    expect(screen.queryByText('SEARCH-SLOT')).toBeNull()
    rerender(
      <GlassIslandHeader
        brandIcon={<span>✦</span>}
        brandLabel="arsam.net"
        pages={pages}
        extras={<span>EXTRAS-SLOT</span>}
        search={<span>SEARCH-SLOT</span>}
        open
      />,
    )
    expect(screen.getByText('EXTRAS-SLOT')).toBeTruthy()
    expect(screen.getByText('SEARCH-SLOT')).toBeTruthy()
  })
})
