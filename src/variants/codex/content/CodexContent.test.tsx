import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  CodexEmptyState,
  CodexFilterPanel,
  CodexHeader,
  CodexListingCard,
  CodexNotice,
  CodexStat,
  CodexSurface,
} from './index'
import { CodexButton } from '../controls'

describe('Codex content', () => {
  it('Surface istenen semantik elementi ve HTML attribute’larını forward eder', () => {
    render(
      <CodexSurface as="article" aria-label="İlan özeti" data-testid="surface">
        İçerik
      </CodexSurface>,
    )

    const surface = screen.getByRole('article', { name: 'İlan özeti' })
    expect(surface.tagName).toBe('ARTICLE')
    expect(surface.textContent).toBe('İçerik')
    expect(surface.getAttribute('data-testid')).toBe('surface')
  })

  it('ListingCard article, adlandırılmış medya ve iki ayrı erişilebilir aksiyon üretir', () => {
    const onOpen = vi.fn()
    const onFavoriteChange = vi.fn()
    render(
      <CodexListingCard
        title="Denize yakın imarlı parsel"
        price="4.250.000 TL"
        location="İzmir, Urla"
        mediaLabel="Urla parsel görünümü"
        favorite={false}
        onOpen={onOpen}
        onFavoriteChange={onFavoriteChange}
      />,
    )

    const article = screen.getByRole('article')
    expect(within(article).getByRole('img', { name: 'Urla parsel görünümü' })).toBeTruthy()

    const favorite = within(article).getByRole('button', { name: 'Favorilere ekle' })
    expect(favorite.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(favorite)
    expect(onFavoriteChange).toHaveBeenCalledWith(true)

    fireEvent.click(within(article).getByRole('button', { name: 'Denize yakın imarlı parsel' }))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('ListingCard callback yokken false affordance üretmez ve heading seviyesi seçilebilir', () => {
    const { container } = render(
      <CodexListingCard
        title="Statik parsel özeti"
        price="2.100.000 TL"
        location="İzmir, Seferihisar"
        headingAs="h2"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Statik parsel özeti', level: 2 })).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('[data-interactive="true"]')).toBeNull()
  })

  it('Notice bilgi tonunda status, tehlike tonunda alert canlı bölgesi kullanır', () => {
    const { rerender } = render(
      <CodexNotice tone="info" title="Ölçütler uygulandı">Dört ölçüt bulundu.</CodexNotice>,
    )
    expect(screen.getByRole('status').textContent).toContain('Ölçütler uygulandı')

    rerender(
      <CodexNotice tone="danger" title="İşlem tamamlanamadı">Tekrar deneyin.</CodexNotice>,
    )
    expect(screen.getByRole('alert').textContent).toContain('Tekrar deneyin.')
  })

  it('Header skip link, adlandırılmış ana navigasyon ve current page ilişkisini kurar', () => {
    const onSearch = vi.fn()
    render(
      <CodexHeader
        links={[
          { label: 'Ara', active: true, onClick: onSearch },
          { label: 'Harita', href: '#map' },
        ]}
        actions={<CodexButton>İlan ver</CodexButton>}
      />,
    )

    expect(screen.getByRole('link', { name: 'İçeriğe geç' }).getAttribute('href')).toBe('#main-content')
    expect(screen.getByRole('link', { name: 'Parsel ana sayfa' }).getAttribute('href')).toBe('/')
    const nav = screen.getByRole('navigation', { name: 'Ana navigasyon' })
    const active = within(nav).getByRole('button', { name: 'Ara' })
    expect(active.getAttribute('aria-current')).toBe('page')
    fireEvent.click(active)
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(within(nav).getByRole('link', { name: 'Harita' }).getAttribute('href')).toBe('#map')
    expect(screen.getByRole('button', { name: 'İlan ver' })).toBeTruthy()
  })

  it('EmptyState başlık, açıklama ve çözüm aksiyonunu birlikte sunar', () => {
    render(
      <CodexEmptyState
        title="Henüz kayıt yok"
        description="Aramanızı kaydederek yeni ilanlardan haberdar olun."
        headingAs="h2"
        action={<CodexButton>Aramayı kaydet</CodexButton>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Henüz kayıt yok', level: 2 })).toBeTruthy()
    expect(screen.getByText(/yeni ilanlardan haberdar olun/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Aramayı kaydet' })).toBeTruthy()
  })

  it('FilterPanel adlandırılmış complementary landmark ve reset aksiyonu sağlar', () => {
    const onReset = vi.fn()
    render(
      <CodexFilterPanel title="Aramayı daralt" resultCount="128 ilan" onReset={onReset}>
        <label>
          Konum
          <input />
        </label>
      </CodexFilterPanel>,
    )

    const panel = screen.getByRole('complementary', { name: 'Aramayı daralt' })
    expect(within(panel).getByText('128 ilan')).toBeTruthy()
    expect(within(panel).getByRole('textbox', { name: 'Konum' })).toBeTruthy()
    fireEvent.click(within(panel).getByRole('button', { name: 'Temizle' }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('Stat değişim yönünü renk dışında görünür ikon ve AT metniyle taşır', () => {
    const { container } = render(<CodexStat label="Ortalama m²" value="8.301 TL" change="%4,2" direction="up" />)
    expect(screen.getByText('Ortalama m²')).toBeTruthy()
    expect(screen.getByText('8.301 TL')).toBeTruthy()
    const trend = container.querySelector('[data-direction="up"]')
    expect(trend?.textContent).toContain('Yükseliş:')
    expect(trend?.textContent).toContain('%4,2')
    expect(trend?.querySelector('[aria-hidden]')?.textContent).toBe('↗')
  })
})
