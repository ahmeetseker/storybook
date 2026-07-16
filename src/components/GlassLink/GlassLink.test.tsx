import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassLink } from './GlassLink'

describe('GlassLink', () => {
  it('link rolüyle render olur ve href taşır', () => {
    render(<GlassLink href="/ilanlar/123">İlana git</GlassLink>)
    const link = screen.getByRole('link', { name: 'İlana git' })
    expect(link.getAttribute('href')).toBe('/ilanlar/123')
    expect(link.tagName).toBe('A')
  })

  it('tıklama onClick çağırır (Enter native olarak click üretir — gerçek <a>)', () => {
    const onClick = vi.fn()
    render(
      <GlassLink href="#" onClick={onClick}>
        Satıcıya sor
      </GlassLink>,
    )
    fireEvent.click(screen.getByRole('link'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('external: target=_blank + rel güvenliği otomatik, sr-only "(yeni sekme)" isme dahil, ikon aria-hidden', () => {
    render(
      <GlassLink href="https://example.com" external>
        Piyasa analizi
      </GlassLink>,
    )
    const link = screen.getByRole('link', { name: /Piyasa analizi.*\(yeni sekme\)/ })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
    const icon = link.querySelector('[aria-hidden]')
    expect(icon?.textContent).toBe('↗')
  })

  it('external, çağıranın verdiği rel değerini korur', () => {
    render(
      <GlassLink href="https://example.com" external rel="nofollow">
        Sponsorlu ilan
      </GlassLink>,
    )
    const rel = screen.getByRole('link').getAttribute('rel')
    expect(rel).toContain('nofollow')
    expect(rel).toContain('noopener noreferrer')
  })

  it('disabled: href/target kaldırılır, aria-disabled verilir, onClick çağrılmaz', () => {
    const onClick = vi.fn()
    render(
      <GlassLink href="/x" external disabled onClick={onClick}>
        Kaldırılan ilan
      </GlassLink>,
    )
    // href'siz <a> link rolü almaz — metinden bul
    const link = screen.getByText('Kaldırılan ilan').closest('a') as HTMLAnchorElement
    expect(screen.queryByRole('link')).toBeNull()
    expect(link.getAttribute('href')).toBeNull()
    expect(link.getAttribute('target')).toBeNull()
    expect(link.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(link)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('standalone varyantı chevron içerir (aria-hidden), inline içermez', () => {
    const { rerender } = render(
      <GlassLink href="#" variant="standalone">
        Diğer ilanlar
      </GlassLink>,
    )
    expect(screen.getByRole('link').textContent).toContain('›')
    expect(screen.getByRole('link', { name: 'Diğer ilanlar' })).toBeTruthy()

    rerender(<GlassLink href="#">Diğer ilanlar</GlassLink>)
    expect(screen.getByRole('link').textContent).not.toContain('›')
  })
})
