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

  it('aktif linkte aria-current="page" vardır, diğerlerinde yoktur', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'İlanlar' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Harita' }).getAttribute('aria-current')).toBeNull()
  })

  it('href olmayan link tıklaması onClick çağırır', () => {
    const links = renderHeader()
    fireEvent.click(screen.getByRole('link', { name: 'Harita' }))
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
  })

  it('hamburger menüyü açar; menü öğesi tıklanınca onClick çağrılır', () => {
    const links = renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Menü' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Harita' }))
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
  })

  it('utility bar varyantında render olmaz, split varyantında olur', () => {
    renderHeader({ utility: <span>Kurumsal Çözümler</span> })
    expect(screen.queryByText('Kurumsal Çözümler')).toBeNull()
  })

  it('split varyantında utility görünür', () => {
    renderHeader({ variant: 'split', utility: <span>Kurumsal Çözümler</span> })
    expect(screen.getByText('Kurumsal Çözümler')).toBeDefined()
  })

  it('minimal varyantta nav listesi yoktur, hamburger vardır', () => {
    renderHeader({ variant: 'minimal' })
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.getByRole('button', { name: 'Menü' })).toBeDefined()
  })

  it('variant ve material data attribute olarak işaretlenir', () => {
    renderHeader({ variant: 'capsule', material: 'glass' })
    const header = screen.getByRole('banner')
    expect(header.getAttribute('data-variant')).toBe('capsule')
    expect(header.getAttribute('data-material')).toBe('glass')
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

  it('material="glass" iken hamburger cam değil düz butondur', () => {
    renderHeader({ variant: 'minimal', material: 'glass' })
    const burger = screen.getByRole('button', { name: 'Menü' })
    // GlassSurface kökünü her zaman data-material="glass" ile işaretler (bkz.
    // GlassSurface.tsx); düz buton bu attribute'u hiç taşımaz — GlassIconButton
    // kullanılırsa burger elemanının kendisi GlassSurface kökü olurdu ve
    // data-material="glass" taşırdı.
    expect(burger.getAttribute('data-material')).not.toBe('glass')
    expect(burger.className).toContain('burgerFlatBtn')
  })
})
