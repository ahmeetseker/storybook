import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassListingRowCard } from './GlassListingRowCard'

const image = { src: '/villa.jpg', alt: 'Villa' }
const base = { image, title: 'Water Elysian, Villa', price: '₺2.200.000' }

describe('GlassListingRowCard', () => {
  it('article olarak render olur ve başlığından adlandırılır (kart tümü button değil)', () => {
    const { container } = render(<GlassListingRowCard {...base} headingAs="h2" />)
    const card = container.firstElementChild as HTMLElement
    expect(card.tagName).toBe('ARTICLE')
    const heading = screen.getByRole('heading', { name: 'Water Elysian, Villa', level: 2 })
    expect(card.getAttribute('aria-labelledby')).toBe(heading.id)
  })

  it('onOpen verilince başlık tetikleyici olur; href verilince bağlantıya döner', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    const { unmount } = render(<GlassListingRowCard {...base} onOpen={onOpen} />)
    await user.click(screen.getByRole('button', { name: 'Water Elysian, Villa' }))
    expect(onOpen).toHaveBeenCalledTimes(1)
    unmount()

    render(<GlassListingRowCard {...base} href="/ilan/1" onOpen={onOpen} />)
    expect(screen.getByRole('link', { name: 'Water Elysian, Villa' }).getAttribute('href')).toBe('/ilan/1')
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('tetikleyici verilmezse başlık statik metin kalır', () => {
    render(<GlassListingRowCard {...base} />)
    expect(screen.queryByRole('button', { name: 'Water Elysian, Villa' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Water Elysian, Villa' })).toBeNull()
  })

  it('favori uncontrolled modda kendi durumunu çevirir ve aria-pressed yansıtır', async () => {
    const onFavoriteChange = vi.fn()
    const user = userEvent.setup()
    render(<GlassListingRowCard {...base} defaultFavorite={false} onFavoriteChange={onFavoriteChange} />)

    const button = screen.getByRole('button', { name: 'Favorilere ekle' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    await user.click(button)
    expect(onFavoriteChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Favorilerden çıkar' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('controlled modda favori yalnız prop ile değişir', async () => {
    const onFavoriteChange = vi.fn()
    const user = userEvent.setup()
    render(<GlassListingRowCard {...base} favorite={false} onFavoriteChange={onFavoriteChange} />)

    await user.click(screen.getByRole('button', { name: 'Favorilere ekle' }))
    expect(onFavoriteChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Favorilere ekle' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('favori üç proptan biri verilmedikçe render edilmez', () => {
    render(<GlassListingRowCard {...base} />)
    expect(screen.queryByRole('button', { name: /Favori/ })).toBeNull()
  })

  it('menü tetikleyicisi yalnız onMenuOpen ile çizilir ve çalışır', async () => {
    const onMenuOpen = vi.fn()
    const user = userEvent.setup()
    const { unmount } = render(<GlassListingRowCard {...base} />)
    expect(screen.queryByRole('button', { name: 'Diğer işlemler' })).toBeNull()
    unmount()

    render(<GlassListingRowCard {...base} onMenuOpen={onMenuOpen} menuLabel="İlan işlemleri" />)
    await user.click(screen.getByRole('button', { name: 'İlan işlemleri' }))
    expect(onMenuOpen).toHaveBeenCalledTimes(1)
  })

  it('iletişim eylemleri href varsa link, yoksa buton olur; ikon-tek kontrol etiketlidir', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <GlassListingRowCard
        {...base}
        actions={[
          { id: 'call', label: 'Danışmanı ara', icon: <svg />, href: 'tel:+902321112233' },
          { id: 'chat', label: 'Mesaj yaz', icon: <svg />, onClick },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Danışmanı ara' }).getAttribute('href')).toBe('tel:+902321112233')
    await user.click(screen.getByRole('button', { name: 'Mesaj yaz' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('puan tek kez seslendirilir: görünen rakam aria-hidden, etiket GlassRating’ten gelir', () => {
    render(<GlassListingRowCard {...base} rating={4.9} />)
    expect(screen.getByRole('img', { name: '5 üzerinden 4,9 yıldız' })).toBeTruthy()
    expect(screen.getByText('4,9').getAttribute('aria-hidden')).toBe('true')
  })

  it('özellik rozetleri liste semantiğiyle çizilir', () => {
    render(<GlassListingRowCard {...base} features={[{ label: '4 Oda' }, { label: '3 Banyo' }]} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('görsel sayısı 1 veya tanımsızsa nokta göstergesi çizilmez', () => {
    const { container, unmount } = render(<GlassListingRowCard {...base} mediaCount={1} />)
    expect(container.querySelectorAll('[data-active]')).toHaveLength(0)
    unmount()

    const second = render(<GlassListingRowCard {...base} mediaCount={4} activeMediaIndex={2} />)
    expect(second.container.querySelectorAll('[data-active="true"]')).toHaveLength(1)
  })

  it('görsel yüklenemezse fallbackSrc gösterilir; yeni src yeniden denenir', () => {
    const withFallback = { src: '/uzak.jpg', alt: 'Villa', fallbackSrc: '/yerel.jpg' }
    const { rerender } = render(<GlassListingRowCard {...base} image={withFallback} />)

    const img = screen.getByAltText('Villa') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/uzak.jpg')
    fireEvent.error(img)
    expect((screen.getByAltText('Villa') as HTMLImageElement).getAttribute('src')).toBe('/yerel.jpg')

    // Kart listede geri dönüştürülüp yeni bir ilana bağlandığında yeni görsel
    // hiç denenmeden gerilemeye düşmemeli.
    rerender(<GlassListingRowCard {...base} image={{ ...withFallback, src: '/baska.jpg' }} />)
    expect((screen.getByAltText('Villa') as HTMLImageElement).getAttribute('src')).toBe('/baska.jpg')
  })

  it('fallbackSrc yoksa hata sonrası src değişmez', () => {
    render(<GlassListingRowCard {...base} />)
    const img = screen.getByAltText('Villa') as HTMLImageElement
    fireEvent.error(img)
    expect((screen.getByAltText('Villa') as HTMLImageElement).getAttribute('src')).toBe('/villa.jpg')
  })

  it('çağıranın verdiği aria-label kartın adını ezer', () => {
    const { container } = render(<GlassListingRowCard {...base} aria-label="Villa ilanı" />)
    const card = container.firstElementChild as HTMLElement
    expect(card.getAttribute('aria-label')).toBe('Villa ilanı')
    // aria-labelledby de basılsaydı sessizce üste çıkıp verilen adı yok sayardı
    expect(card.getAttribute('aria-labelledby')).toBeNull()
  })

  it('ikonsuz eylem etiketi metin olarak gösterir, aria-label tekrarlamaz', () => {
    render(<GlassListingRowCard {...base} actions={[{ id: 'cmp', label: 'Karşılaştır' }]} />)
    const button = screen.getByRole('button', { name: 'Karşılaştır' })
    expect(button.textContent).toBe('Karşılaştır')
    expect(button.getAttribute('aria-label')).toBeNull()
  })

  it('mediaCaption ve footerMeta verilince çizilir', () => {
    render(<GlassListingRowCard {...base} mediaCaption="8 fotoğraf" footerMeta="8.301 TL/m²" />)
    expect(screen.getByText('8 fotoğraf')).toBeTruthy()
    expect(screen.getByText('8.301 TL/m²')).toBeTruthy()
  })

  it('ayak yalnız içerik varken çizilir; alt görsel dekoratiftir', () => {
    render(<GlassListingRowCard {...base} agent={{ name: 'Zara Balogun' }} listedAt="1 gün önce" />)
    expect(screen.getByText('Zara Balogun')).toBeTruthy()
    expect(screen.getByAltText('Villa')).toBeTruthy()
  })
})
