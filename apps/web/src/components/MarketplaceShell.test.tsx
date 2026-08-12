import type { ReactNode } from 'react'
import {render, screen} from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MarketplaceShell } from './MarketplaceShell'
import { usePageTrail } from './PageTrail'

const routerState = vi.hoisted(() => ({
  pathname: '/ilan-ver',
  navigate: vi.fn(),
}))

// Oturum durumu test başına değiştirilir: satıcı eylemleri (İlan ver, zil)
// yalnız kimlikli oturumda çizilir.
const authState = vi.hoisted(() => ({ girisYapildi: false }))

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: routerState.navigate }),
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => string
  }) => select({ location: { pathname: routerState.pathname } }),
}))

vi.mock('@/features/auth', () => ({
  useAuthSession: () => authState,
}))

// Gerçek gelen kutusu kendi test dosyasında sınanır; kabuk yalnız
// "kimlikliyken zil var" sözleşmesini doğrular.
vi.mock('./NotificationInbox/NotificationInbox', () => ({
  NotificationInbox: () => <button type="button" aria-label="Bildirimler" />,
}))

vi.mock('@repo/ui', () => ({
  GlassButton: ({
    children,
    onClick,
    ...rest
  }: {
    children: ReactNode
    onClick?: () => void
  }) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
  GlassIconButton: ({
    children,
    label,
    onClick,
  }: {
    children: ReactNode
    label: string
    onClick?: () => void
  }) => (
    <button aria-label={label} onClick={onClick}>
      {children}
    </button>
  ),
  GlassSiteHeader: ({
    utility,
    secondaryAction,
    action,
  }: {
    utility?: ReactNode
    secondaryAction?: ReactNode
    action?: ReactNode
  }) => (
    <header data-testid="global-header">
      {utility}
      {secondaryAction}
      {action}
    </header>
  ),
  GlassFooter: () => <footer data-testid="global-footer" />,
}))

describe('MarketplaceShell odaklı ilan akışı', () => {
  it('hides the global header only on /ilan-ver', async () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      },
    })
    routerState.pathname = '/ilan-ver'
    const { rerender } = render(
      <MarketplaceShell>
        <main>İlan oluşturma çalışma alanı</main>
      </MarketplaceShell>,
    )

    expect(screen.getByText('İlan oluşturma çalışma alanı')).toBeTruthy()
    expect(screen.queryByTestId('global-header')).toBeNull()
    // Footer da gizlenir: sihirbazın altına site haritası koymak akıştan
    // çıkmayı kolaylaştırır.
    expect(screen.queryByTestId('global-footer')).toBeNull()

    routerState.pathname = '/emlak'
    rerender(
      <MarketplaceShell>
        <main>Arama çalışma alanı</main>
      </MarketplaceShell>,
    )

    expect(screen.getByTestId('global-header')).toBeTruthy()
    expect(screen.getByTestId('global-footer')).toBeTruthy()
    expect(screen.queryByTestId('global-search')).toBeNull()
  })
})

describe('MarketplaceShell footer', () => {
  // Footer sayfaların değil kabuğun işidir: bir sayfa onu unutamaz.
  it.each(['/', '/emlak', '/paketler', '/ofisler', '/bolgeler', '/ilan/arsa-214-7'])(
    'rota %s iken footer çizilir',
    (pathname) => {
      routerState.pathname = pathname

      render(
        <MarketplaceShell>
          <main>Rota içeriği</main>
        </MarketplaceShell>,
      )

      expect(screen.getByTestId('global-footer')).toBeTruthy()
    },
  )

  it.each(['/ilan-ver', '/hesabim', '/hesabim/planim', '/hesabim/mesajlar'])(
    'odaklı akış %s iken footer çizilmez',
    (pathname) => {
      routerState.pathname = pathname

      render(
        <MarketplaceShell>
          <main>Rota içeriği</main>
        </MarketplaceShell>,
      )

      expect(screen.queryByTestId('global-footer')).toBeNull()
    },
  )
})

describe('MarketplaceShell hesap eylemi', () => {
  it.each([['/emlak', 'Üye girişi']])('rota %s iken %s etiketini gösterir', (pathname, label) => {
    routerState.pathname = pathname

    render(
      <MarketplaceShell>
        <main>Rota içeriği</main>
      </MarketplaceShell>,
    )

    expect(screen.getByRole('button', { name: label })).toBeTruthy()
  })

  // Hesap panosu kendi kabuğunu kurar: iki gezinme katmanı üst üste binmesin
  // diye pazar yeri header'ı bu rotada hiç render edilmez.
  it.each(['/hesabim', '/hesabim/mesajlar', '/hesabim/ilanlarim'])(
    'rota %s iken pazar yeri kabuğunu çizmez',
    async (pathname) => {
      routerState.pathname = pathname

      render(
        <MarketplaceShell>
          <main>Hesap panosu</main>
        </MarketplaceShell>,
      )

      expect(screen.queryByTestId('global-header')).toBeNull()
      expect(screen.queryByTestId('global-footer')).toBeNull()
      expect(screen.getByRole('link', { name: 'İçeriğe geç' })).toBeTruthy()
    },
  )
})

describe('MarketplaceShell kırıntı yolu kanalı', () => {
  // Kabuk yolu üretir, `PageContainer` çizer; burada yalnız kanal sınanır.
  function TrailProbe() {
    const trail = usePageTrail()
    return <output data-testid="trail">{trail.map((item) => item.label).join(' > ')}</output>
  }

  it.each([
    ['/emlak', 'Anasayfa > Emlak ara'],
    ['/paketler', 'Anasayfa > Paketler'],
    ['/favoriler', 'Anasayfa > Favoriler'],
  ])('rota %s iken statusTrail`den yolu sağlar', (pathname, beklenen) => {
    routerState.pathname = pathname

    render(
      <MarketplaceShell>
        <TrailProbe />
      </MarketplaceShell>,
    )

    expect(screen.getByTestId('trail').textContent).toBe(beklenen)
  })

  it.each(['/ilan-ver', '/hesabim', '/hesabim/mesajlar'])(
    'odaklı akış %s iken yol sağlanmaz — sayfa kendi üst şeridini kurar',
    (pathname) => {
      routerState.pathname = pathname

      render(
        <MarketplaceShell>
          <TrailProbe />
        </MarketplaceShell>,
      )

      expect(screen.getByTestId('trail').textContent).toBe('')
    },
  )

  it('ilan detayında yol boştur — sayfa kendi kategori yolunu taşır', () => {
    routerState.pathname = '/ilan/arsa-214-7'

    render(
      <MarketplaceShell>
        <TrailProbe />
      </MarketplaceShell>,
    )

    expect(screen.getByTestId('trail').textContent).toBe('')
  })
})

describe('MarketplaceShell header aksiyonları', () => {
  // Not: jsdom her zaman scrollY = 0'da kalır, bu yüzden bu testler yalnız
  // rest durumunu kanıtlar. Satıcı eylemleri (İlan ver, bildirim zili)
  // yalnız kimlikli oturumda çizilir — anonim ziyaretçi önce giriş yapar.
  it('anonim ziyarette yalnız Üye girişi görünür; İlan ver ve zil çizilmez', () => {
    routerState.pathname = '/emlak'
    authState.girisYapildi = false

    render(
      <MarketplaceShell>
        <main>Rota içeriği</main>
      </MarketplaceShell>,
    )

    const header = screen.getByTestId('global-header')
    expect(header.querySelector('#shell-account-action')?.textContent).toBe('Üye girişi')
    expect(screen.queryByRole('button', { name: 'İlan ver' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Bildirimler' })).toBeNull()
  })

  it('kimlikli oturumda Hesabım + bildirim zili + İlan ver render edilir', () => {
    routerState.pathname = '/emlak'
    authState.girisYapildi = true
    try {
      render(
        <MarketplaceShell>
          <main>Rota içeriği</main>
        </MarketplaceShell>,
      )

      const header = screen.getByTestId('global-header')
      expect(header.querySelector('#shell-account-action')?.textContent).toBe('Hesabım')
      expect(screen.getByRole('button', { name: 'İlan ver' })).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Bildirimler' })).toBeTruthy()
    } finally {
      authState.girisYapildi = false
    }
  })
})
