import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassHeader, type GlassHeaderLink } from './GlassHeader'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const makeLinks = (): GlassHeaderLink[] => [
  { label: 'İlanlar', onClick: vi.fn(), active: true },
  { label: 'Harita', onClick: vi.fn() },
]

const renderHeader = (props = {}, links = makeLinks()) => {
  render(
    <GlassTierProvider tier="fallback">
      <GlassHeader logo="ArsaPazar" links={links} {...props} />
    </GlassTierProvider>,
  )
  return links
}

describe('GlassHeader', () => {
  it('banner ve "Site" navigasyon landmarklarını render eder', () => {
    renderHeader()
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByRole('navigation', { name: 'Site' })).toBeDefined()
  })

  it('aktif linkte aria-current="page" ve kayan cam gösterge vardır', () => {
    renderHeader()
    const active = screen.getByRole('link', { name: 'İlanlar' })
    expect(active.getAttribute('aria-current')).toBe('page')
    expect(active.querySelector('[data-nav-glass]')).not.toBeNull()
    const passive = screen.getByRole('link', { name: 'Harita' })
    expect(passive.getAttribute('aria-current')).toBeNull()
    expect(passive.querySelector('[data-nav-glass]')).toBeNull()
  })

  it('href olmayan link tıklaması onClick çağırır', () => {
    const links = renderHeader()
    fireEvent.click(screen.getByRole('link', { name: 'Harita' }))
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
  })

  it('hamburger menüyü açar; href verilen öğe menüde gerçek link olur', () => {
    renderHeader({}, [
      { label: 'İlanlar', active: true },
      { label: 'Harita', href: '#harita' },
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Menü' }))
    const dialog = screen.getByRole('dialog')
    const item = within(dialog).getByRole('link', { name: 'Harita' })
    expect(item.getAttribute('href')).toBe('#harita')
    expect(within(dialog).getByRole('button', { name: 'İlanlar' })).toBeDefined()
  })

  it('dört varyant data-variant ile işaretlenir ve varyanta özgü içerik taşır', () => {
    const { unmount: u1 } = render(
      <GlassTierProvider tier="fallback">
        <GlassHeader logo="A" links={makeLinks()} variant="islands" />
      </GlassTierProvider>,
    )
    expect(screen.getByRole('banner').getAttribute('data-variant')).toBe('islands')
    u1()

    const { unmount: u2 } = render(
      <GlassTierProvider tier="fallback">
        <GlassHeader
          logo="A"
          variant="command"
          search={<input aria-label="Arsa ara" />}
          searchSummary="Urla · İmarlı · ≤3M"
        />
      </GlassTierProvider>,
    )
    expect(screen.getByRole('banner').getAttribute('data-variant')).toBe('command')
    expect(screen.getByLabelText('Arsa ara')).toBeDefined()
    u2()

    const { unmount: u3 } = render(
      <GlassTierProvider tier="fallback">
        <GlassHeader logo="A" links={makeLinks()} variant="masthead" meta="81 il · EİDS doğrulamalı" />
      </GlassTierProvider>,
    )
    expect(screen.getByRole('banner').getAttribute('data-variant')).toBe('masthead')
    expect(screen.getByText('81 il · EİDS doğrulamalı')).toBeDefined()
    u3()

    render(
      <GlassTierProvider tier="fallback">
        <GlassHeader logo="A" links={makeLinks()} variant="overlay" action={<button>İlan Ver</button>} />
      </GlassTierProvider>,
    )
    expect(screen.getByRole('banner').getAttribute('data-variant')).toBe('overlay')
  })

  it('meta yalnız masthead varyantında render olur', () => {
    renderHeader({ meta: '81 il · EİDS doğrulamalı' })
    expect(screen.queryByText('81 il · EİDS doğrulamalı')).toBeNull()
  })

  it('search slotu yalnız command varyantında render olur', () => {
    renderHeader({ search: <input aria-label="Arsa ara" /> })
    expect(screen.queryByLabelText('Arsa ara')).toBeNull()
  })

  it('action ve secondaryAction aksiyon alanında render olur', () => {
    renderHeader({
      action: <button>İlan Ver</button>,
      secondaryAction: <button>Giriş Yap</button>,
    })
    expect(screen.getByRole('button', { name: 'İlan Ver' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Giriş Yap' })).toBeDefined()
  })

  it('scroll eşiği geçilince kök data-scrolled işaretlenir', () => {
    renderHeader()
    const header = screen.getByRole('banner')
    expect(header.getAttribute('data-scrolled')).toBeNull()
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true })
    fireEvent.scroll(window)
    expect(header.getAttribute('data-scrolled')).toBe('true')
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    fireEvent.scroll(window)
    expect(header.getAttribute('data-scrolled')).toBeNull()
  })

  it('overlay: kompakt ray scroll öncesi inert, scroll sonrası etkileşilebilir', () => {
    const { container } = render(
      <GlassTierProvider tier="fallback">
        <GlassHeader logo="A" links={makeLinks()} variant="overlay" action={<button>İlan Ver</button>} />
      </GlassTierProvider>,
    )
    const ray = container.querySelector('[class*="overlayRay"]')
    expect(ray).not.toBeNull()
    expect(ray?.hasAttribute('inert')).toBe(true)
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true })
    fireEvent.scroll(window)
    expect(ray?.hasAttribute('inert')).toBe(false)
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    fireEvent.scroll(window)
  })

  it('links verilmezse nav ve hamburger render edilmez', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassHeader logo="ArsaPazar" />
      </GlassTierProvider>,
    )
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Menü' })).toBeNull()
  })
})
