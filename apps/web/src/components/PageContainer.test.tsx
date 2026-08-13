import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { PageContainer } from './PageContainer'
import { PageTrailContext, type PageTrailItem } from './PageTrail'
import styles from './PageContainer.module.css'

function renderWithTrail(trail: readonly PageTrailItem[], ui: ReactNode) {
  return render(<PageTrailContext.Provider value={trail}>{ui}</PageTrailContext.Provider>)
}

describe('PageContainer', () => {
  it('kabuğun skip-link hedefi olan tek main landmark`ını üretir', () => {
    render(<PageContainer>İçerik</PageContainer>)

    const main = screen.getByRole('main')
    expect(main.id).toBe('main-content')
    expect(main.textContent).toBe('İçerik')
  })

  it('genişlik tek standarttır — kademe sınıfı yoktur, yalnız container sınıfı basılır', () => {
    // Eski narrow/base/wide kademeleri sayfalar arası yatay kayma ürettiği
    // için kaldırıldı; ölçünün tek kaynağı `--lg-container-page` formülüdür.
    render(<PageContainer>içerik</PageContainer>)
    const main = screen.getByRole('main')
    expect(main.className).toContain(styles.container)
    expect(main.className.split(' ')).toHaveLength(2) // container + shellInsets
  })

  it('kabuk payını varsayılan olarak ayırır, kabuksuz akışta bırakır', () => {
    const { rerender } = render(<PageContainer>kabuklu</PageContainer>)
    expect(screen.getByRole('main').className).toContain(styles.shellInsets)

    rerender(<PageContainer shellInsets={false}>kabuksuz</PageContainer>)
    expect(screen.getByRole('main').className).not.toContain(styles.shellInsets)
  })

  it('sayfaya özel className ve nitelikleri korur', () => {
    render(
      <PageContainer className="ozel" aria-busy id="ozel-hedef">
        içerik
      </PageContainer>,
    )

    const main = screen.getByRole('main')
    expect(main.className).toContain('ozel')
    expect(main.className).toContain(styles.container)
    expect(main.id).toBe('ozel-hedef')
    expect(main.getAttribute('aria-busy')).toBe('true')
  })
})

describe('PageContainer kırıntı yolu', () => {
  const trail: PageTrailItem[] = [
    { label: 'Anasayfa', href: '/', onClick: vi.fn() },
    { label: 'Emlak ara' },
  ]

  it('kabuk yol sağladığında içerikten önce breadcrumb çizer', () => {
    renderWithTrail(trail, <PageContainer>İçerik</PageContainer>)

    const nav = screen.getByRole('navigation', { name: 'Sayfa yolu' })
    const main = screen.getByRole('main')
    expect(main.contains(nav)).toBe(true)
    expect(screen.getByRole('link', { name: 'Anasayfa' }).getAttribute('href')).toBe('/')
    expect(screen.getByText('Emlak ara').getAttribute('aria-current')).toBe('page')
  })

  it('sade sol tık SPA gezinmesine devreder; modifier tık tarayıcıda kalır', () => {
    const onClick = vi.fn()
    renderWithTrail(
      [{ label: 'Anasayfa', href: '/', onClick }, { label: 'Emlak ara' }],
      <PageContainer>İçerik</PageContainer>,
    )

    const link = screen.getByRole('link', { name: 'Anasayfa' })
    fireEvent.click(link)
    expect(onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(link, { metaKey: true })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('tek seviyeli yol çizilmez — dönülecek üst seviye yok', () => {
    renderWithTrail([{ label: 'Anasayfa' }], <PageContainer>İçerik</PageContainer>)

    expect(screen.queryByRole('navigation', { name: 'Sayfa yolu' })).toBeNull()
  })

  it('kabuk dışında (boş context) hiçbir şey çizmez', () => {
    render(<PageContainer>İçerik</PageContainer>)

    expect(screen.queryByRole('navigation', { name: 'Sayfa yolu' })).toBeNull()
  })

  it('breadcrumb={false} kabuk yolunu kapatır — kendi yolunu taşıyan sayfalar için', () => {
    renderWithTrail(trail, <PageContainer breadcrumb={false}>İçerik</PageContainer>)

    expect(screen.queryByRole('navigation', { name: 'Sayfa yolu' })).toBeNull()
  })
})
