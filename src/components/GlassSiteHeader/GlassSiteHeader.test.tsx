import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassSiteHeader, type GlassSiteHeaderLink } from './GlassSiteHeader'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const makeLinks = (): GlassSiteHeaderLink[] => [
  { label: 'Arama', href: '#arama', onClick: vi.fn(), active: true },
  { label: 'Ofisler', href: '#ofisler', onClick: vi.fn() },
]

const renderHeader = (props = {}, links = makeLinks()) => {
  render(
    <GlassTierProvider tier="fallback">
      <GlassSiteHeader logo="arsam.net" links={links} {...props} />
    </GlassTierProvider>,
  )
  return links
}

describe('GlassSiteHeader — semantik ve slotlar', () => {
  it('banner ve "Site" navigasyon landmarklarını render eder', () => {
    renderHeader()
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByRole('navigation', { name: 'Site' })).toBeDefined()
  })

  it('aktif linkte aria-current="page" ve kayan cam gösterge vardır', () => {
    renderHeader()
    const active = screen.getByRole('link', { name: 'Arama' })
    expect(active.getAttribute('aria-current')).toBe('page')
    expect(active.querySelector('[data-nav-glass]')).not.toBeNull()
    const passive = screen.getByRole('link', { name: 'Ofisler' })
    expect(passive.getAttribute('aria-current')).toBeNull()
    expect(passive.querySelector('[data-nav-glass]')).toBeNull()
  })

  it('sade sol tıkta onClick çağrılır ve varsayılan gezinme engellenir', () => {
    const links = renderHeader()
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    screen.getByRole('link', { name: 'Ofisler' }).dispatchEvent(event)
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it('meta/ctrl tıkta onClick çağrılmaz — tarayıcı yeni sekmeyi açar', () => {
    const links = renderHeader()
    fireEvent.click(screen.getByRole('link', { name: 'Ofisler' }), { metaKey: true })
    expect(links[1].onClick).not.toHaveBeenCalled()
  })

  it('logo, utility, secondaryAction ve action slotları render olur', () => {
    renderHeader({
      logo: <span>arsam.net</span>,
      utility: <button>Tema</button>,
      secondaryAction: <button>Üye girişi</button>,
      action: <button>İlan ver</button>,
    })
    expect(screen.getByText('arsam.net')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Tema' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Üye girişi' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'İlan ver' })).toBeDefined()
  })

  it('links boşken nav ve hamburger render edilmez', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSiteHeader logo="arsam.net" />
      </GlassTierProvider>,
    )
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Menü' })).toBeNull()
  })
})
