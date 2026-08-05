import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassFooter, type GlassFooterColumn } from './GlassFooter'

const columns: GlassFooterColumn[] = [
  { title: 'Kurumsal', links: [{ label: 'Hakkımızda', onClick: vi.fn() }, { label: 'Kariyer' }] },
  { title: 'Destek', links: [{ label: 'Yardım Merkezi' }] },
]

describe('GlassFooter', () => {
  it('contentinfo landmark ve "Alt bilgi" navigasyonu render edilir', () => {
    render(<GlassFooter columns={columns} legal="© 2026 ArsaPazar" />)
    expect(screen.getByRole('contentinfo')).toBeDefined()
    expect(screen.getByRole('navigation', { name: 'Alt bilgi' })).toBeDefined()
    expect(screen.getByText('Kurumsal')).toBeDefined()
  })

  it('href olmayan link tıklaması onClick çağırır', () => {
    render(<GlassFooter columns={columns} legal="©" />)
    fireEvent.click(screen.getByRole('link', { name: 'Hakkımızda' }))
    expect(columns[0].links[0].onClick).toHaveBeenCalled()
  })

  it('slim varyantı sütun başlıklarını atar, linkleri tek satıra düzleştirir', () => {
    render(<GlassFooter variant="slim" columns={columns} legal="© 2026" />)
    expect(screen.queryByText('Kurumsal')).toBeNull()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('cta bandı yalnız cta varyantında render olur', () => {
    const { container, rerender } = render(
      <GlassFooter variant="cta" columns={columns} legal="©" cta={<span>Arsanı bugün listele</span>} />,
    )
    expect(container.querySelector('[data-footer-cta]')).not.toBeNull()
    rerender(<GlassFooter variant="columns" columns={columns} legal="©" cta={<span>Arsanı bugün listele</span>} />)
    expect(container.querySelector('[data-footer-cta]')).toBeNull()
  })

  it('newsletter slotu yalnız newsletter varyantında render olur', () => {
    const { container, rerender } = render(
      <GlassFooter variant="newsletter" columns={columns} legal="©" newsletter={<input aria-label="E-posta" />} />,
    )
    expect(container.querySelector('[data-footer-newsletter]')).not.toBeNull()
    rerender(<GlassFooter variant="columns" columns={columns} legal="©" newsletter={<input aria-label="E-posta" />} />)
    expect(container.querySelector('[data-footer-newsletter]')).toBeNull()
  })

  it('centered varyantı marka + satır linkleri + legal gösterir', () => {
    render(<GlassFooter variant="centered" columns={columns} legal="© 2026" brand="ArsaPazar" social={<a href="#x">X</a>} />)
    expect(screen.getByText('ArsaPazar')).toBeDefined()
    expect(screen.getByText('© 2026')).toBeDefined()
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(4)
  })

  it('vitrin kolonu mini kartları bağlantı olarak sunar, görsel dekoratiftir', () => {
    const { container } = render(
      <GlassFooter
        columns={columns}
        legal="©"
        highlights={{
          title: 'Son eklenen ilanlar',
          items: [
            {
              id: '1',
              label: 'İzmir Urla İmarlı Köşe Parsel',
              meta: '4.250.000 TL',
              previousMeta: '4.900.000 TL',
              image: 'urla.jpg',
              href: '/ilan/1',
            },
          ],
        }}
      />,
    )
    const link = screen.getByRole('link', { name: /İzmir Urla İmarlı Köşe Parsel/ })
    expect(link.getAttribute('href')).toBe('/ilan/1')
    expect(screen.getByText('Son eklenen ilanlar')).toBeDefined()
    expect(screen.getByText('4.900.000 TL').tagName).toBe('S')
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('')
  })

  it('sosyal bağlantılar erişilebilir adla render olur, ikon dekoratif kalır', () => {
    render(
      <GlassFooter
        columns={columns}
        legal="©"
        socialLinks={[
          { id: 'x', label: 'X', href: 'https://x.com/arsam', icon: <svg /> },
          { id: 'ig', label: 'Instagram', href: 'https://instagram.com/arsam', icon: <svg /> },
        ]}
      />,
    )
    expect(
      screen.getByRole('link', { name: 'Instagram' }).getAttribute('href'),
    ).toBe('https://instagram.com/arsam')
    expect(screen.getByRole('link', { name: 'X' })).toBeDefined()
  })

  it('socialLinks verilince serbest social slotunun yerini alır', () => {
    render(
      <GlassFooter
        columns={columns}
        legal="©"
        social={<a href="#eski">Eski sosyal blok</a>}
        socialLinks={[{ id: 'x', label: 'X', href: 'https://x.com/arsam', icon: <svg /> }]}
      />,
    )
    expect(screen.queryByText('Eski sosyal blok')).toBeNull()
    expect(screen.getByRole('link', { name: 'X' })).toBeDefined()
  })

  it('variant data attribute olarak işaretlenir', () => {
    render(<GlassFooter variant="slim" legal="©" />)
    expect(screen.getByRole('contentinfo').getAttribute('data-variant')).toBe('slim')
  })
})
