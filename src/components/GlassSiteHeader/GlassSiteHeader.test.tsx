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
      utility: <button>Dil</button>,
      secondaryAction: <button>Üye girişi</button>,
      action: <button>İlan ver</button>,
    })
    expect(screen.getByText('arsam.net')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Dil' })).toBeDefined()
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

describe('GlassSiteHeader — scroll morfu', () => {
  const setScroll = (value: number) => {
    Object.defineProperty(window, 'scrollY', { value, configurable: true })
    fireEvent.scroll(window)
  }

  it('scroll eşiği geçilince kök data-scrolled işaretlenir, dönünce kalkar', () => {
    renderHeader()
    const header = screen.getByRole('banner')
    expect(header.getAttribute('data-scrolled')).toBeNull()
    setScroll(200)
    expect(header.getAttribute('data-scrolled')).toBe('true')
    setScroll(0)
    expect(header.getAttribute('data-scrolled')).toBeNull()
  })

  it('scrollThreshold eşiği belirler', () => {
    renderHeader({ scrollThreshold: 400 })
    const header = screen.getByRole('banner')
    setScroll(200)
    expect(header.getAttribute('data-scrolled')).toBeNull()
    setScroll(500)
    expect(header.getAttribute('data-scrolled')).toBe('true')
    setScroll(0)
  })

  it('condensedAction verilince scroll sonrası üçlü aksiyonun yerine geçer', () => {
    renderHeader({
      utility: <button>Dil</button>,
      secondaryAction: <button>Üye girişi</button>,
      action: <button>İlan ver</button>,
      condensedAction: <button>Hemen başla</button>,
    })
    expect(screen.getByRole('button', { name: 'Üye girişi' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Hemen başla' })).toBeNull()

    setScroll(200)
    expect(screen.getByRole('button', { name: 'Hemen başla' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Üye girişi' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Dil' })).toBeNull()
    setScroll(0)
  })

  it('condensedAction verilmezse scroll sonrası üçlü aksiyon korunur', () => {
    renderHeader({
      secondaryAction: <button>Üye girişi</button>,
      action: <button>İlan ver</button>,
    })
    setScroll(200)
    expect(screen.getByRole('button', { name: 'Üye girişi' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'İlan ver' })).toBeDefined()
    setScroll(0)
  })
})

describe('GlassSiteHeader — mobil panel', () => {
  const openMenu = () => {
    const burger = screen.getByRole('button', { name: 'Menü' })
    fireEvent.click(burger)
    return burger
  }

  it('hamburger aria-expanded/aria-controls sözleşmesini taşır', () => {
    renderHeader()
    const burger = screen.getByRole('button', { name: 'Menü' })
    expect(burger.getAttribute('aria-expanded')).toBe('false')
    const panelId = burger.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(document.getElementById(panelId as string)).toBeNull()

    fireEvent.click(burger)
    expect(burger.getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById(panelId as string)).not.toBeNull()
  })

  it('panel açıkken kök data-menu-open işaretlenir', () => {
    renderHeader()
    openMenu()
    expect(screen.getByRole('banner').getAttribute('data-menu-open')).toBe('true')
  })

  it('Escape paneli kapatır ve focus hamburger’a döner', () => {
    renderHeader()
    const burger = openMenu()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(burger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(burger)
  })

  it('kapsül dışına pointerdown paneli kapatır', () => {
    renderHeader()
    const burger = openMenu()
    fireEvent.pointerDown(document.body)
    expect(burger.getAttribute('aria-expanded')).toBe('false')
  })

  it('kapsül içine pointerdown paneli kapatmaz', () => {
    renderHeader()
    const burger = openMenu()
    fireEvent.pointerDown(screen.getByText('arsam.net'))
    expect(burger.getAttribute('aria-expanded')).toBe('true')
  })

  it('panelden link seçimi onClick çağırır ve paneli kapatır', () => {
    const links = makeLinks()
    renderHeader({}, links)
    const burger = openMenu()
    const panelId = burger.getAttribute('aria-controls') as string
    const panel = document.getElementById(panelId) as HTMLElement
    // fireEvent kullan, ham dispatchEvent DEĞİL: dispatchEvent React'in act()
    // sarmalamasını atlar, state güncellemesi senkron akmaz ve testi geçirmek
    // için üretim koduna flushSync eklemek gerekir. Burada defaultPrevented
    // iddiası yok (o Task 1'in testinde), dolayısıyla fireEvent yeterli.
    fireEvent.click(panel.querySelector('a[href="#ofisler"]') as HTMLElement)
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
    expect(burger.getAttribute('aria-expanded')).toBe('false')
  })

  it('menuLabel hamburger’ın accessible name’ini belirler', () => {
    renderHeader({ menuLabel: 'Gezinme' })
    expect(screen.getByRole('button', { name: 'Gezinme' })).toBeDefined()
  })
})
