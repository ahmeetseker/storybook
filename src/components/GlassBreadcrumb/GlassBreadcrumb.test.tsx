import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassBreadcrumb } from './GlassBreadcrumb'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

describe('GlassBreadcrumb', () => {
  it('ara öğeler tıklanabilir, son öğe sayfa olarak işaretlenir', () => {
    const onClick = vi.fn()
    render(
      <GlassTierProvider tier="fallback">
        <GlassBreadcrumb
          items={[{ label: 'Vasıta', onClick }, { label: 'Otomobil', onClick: vi.fn() }, { label: 'Golf' }]}
        />
      </GlassTierProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Vasıta' }))
    expect(onClick).toHaveBeenCalledTimes(1)

    const current = screen.getByText('Golf')
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.tagName).toBe('SPAN')
  })

  it('navigation landmark olarak render olur', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassBreadcrumb items={[{ label: 'Emlak' }]} />
      </GlassTierProvider>,
    )
    expect(screen.getByRole('navigation', { name: 'Kategori yolu' })).toBeDefined()
  })

  it('href verilen ara öğe gerçek link olur; sade sol tık SPA gezinmesine devreder', () => {
    const onClick = vi.fn()
    render(
      <GlassTierProvider tier="fallback">
        <GlassBreadcrumb items={[{ label: 'Anasayfa', href: '/', onClick }, { label: 'Emlak ara' }]} />
      </GlassTierProvider>,
    )

    const link = screen.getByRole('link', { name: 'Anasayfa' })
    expect(link.getAttribute('href')).toBe('/')

    fireEvent.click(link)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('modifier tık tarayıcıya bırakılır — onClick çağrılmaz', () => {
    const onClick = vi.fn()
    render(
      <GlassTierProvider tier="fallback">
        <GlassBreadcrumb items={[{ label: 'Anasayfa', href: '/', onClick }, { label: 'Emlak ara' }]} />
      </GlassTierProvider>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Anasayfa' }), { metaKey: true })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('son öğe href verilse bile link olmaz', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassBreadcrumb items={[{ label: 'Emlak', href: '/emlak' }, { label: 'Satılık Daire', href: '/emlak/satilik' }]} />
      </GlassTierProvider>,
    )

    const current = screen.getByText('Satılık Daire')
    expect(current.tagName).toBe('SPAN')
    expect(current.getAttribute('aria-current')).toBe('page')
  })

  describe('maxItems daraltması', () => {
    const seviyeler = [
      { label: 'Anasayfa', href: '/' },
      { label: 'İkinci El', href: '/ikinci-el' },
      { label: 'Mobilya', href: '/mobilya' },
      { label: 'Koltuk', href: '/koltuk' },
      { label: 'Üçlü Kanepe' },
    ]

    it('aşan ara seviyeler gizlenir, uçlar görünür kalır', () => {
      render(
        <GlassTierProvider tier="fallback">
          <GlassBreadcrumb items={seviyeler} maxItems={3} />
        </GlassTierProvider>,
      )

      expect(screen.getByRole('link', { name: 'Anasayfa' })).toBeDefined()
      expect(screen.getByText('Üçlü Kanepe')).toBeDefined()
      expect(screen.queryByText('İkinci El')).toBeNull()
      expect(screen.queryByText('Mobilya')).toBeNull()
      expect(screen.queryByText('Koltuk')).toBeNull()
      expect(screen.getByRole('button', { name: 'Gizlenen 3 seviyeyi göster' })).toBeDefined()
    })

    it('"…" tıklanınca yol yerinde açılır ve odak ilk açılan öğeye taşınır', () => {
      render(
        <GlassTierProvider tier="fallback">
          <GlassBreadcrumb items={seviyeler} maxItems={3} />
        </GlassTierProvider>,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Gizlenen 3 seviyeyi göster' }))

      expect(screen.queryByRole('button', { name: 'Gizlenen 3 seviyeyi göster' })).toBeNull()
      const acilan = screen.getByRole('link', { name: 'İkinci El' })
      expect(screen.getByRole('link', { name: 'Mobilya' })).toBeDefined()
      expect(document.activeElement).toBe(acilan)
    })

    it('öğe sayısı tavanı aşmıyorsa daraltma devreye girmez', () => {
      render(
        <GlassTierProvider tier="fallback">
          <GlassBreadcrumb items={seviyeler.slice(0, 3)} maxItems={3} />
        </GlassTierProvider>,
      )

      expect(screen.queryByRole('button', { name: /seviyeyi göster/ })).toBeNull()
      expect(screen.getByRole('link', { name: 'İkinci El' })).toBeDefined()
    })
  })
})
