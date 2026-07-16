import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassList, GlassListItem } from './GlassList'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const wrap = (ui: ReactNode) => render(<GlassTierProvider tier="fallback">{ui}</GlassTierProvider>)

describe('GlassList', () => {
  it('role="list" ile render olur ve header listeyi adlandırır', () => {
    wrap(
      <GlassList header="İlan Bilgileri" footer="Satıcı beyanı">
        <GlassListItem title="Marka" detail="Volkswagen" />
        <GlassListItem title="Yıl" detail="2019" />
      </GlassList>,
    )
    const list = screen.getByRole('list', { name: 'İlan Bilgileri' })
    expect(list.tagName).toBe('UL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Satıcı beyanı')).toBeTruthy()
    expect(screen.getByText('Volkswagen')).toBeTruthy()
  })

  it('onClick verilmeyen satır buton İÇERMEZ (statik içerik)', () => {
    wrap(
      <GlassList>
        <GlassListItem title="Kilometre" detail="118.000 km" subtitle="Beyan" />
      </GlassList>,
    )
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Beyan')).toBeTruthy()
  })

  it('onClick verilen satır tam genişlik <button> olur, tıklama ve klavye odağı çalışır', () => {
    const onClick = vi.fn()
    wrap(
      <GlassList>
        <GlassListItem title="İlanlarım" chevron onClick={onClick} />
      </GlassList>,
    )
    const btn = screen.getByRole('button', { name: 'İlanlarım' })
    expect(btn.getAttribute('type')).toBe('button')
    btn.focus()
    expect(document.activeElement).toBe(btn) // klavyeyle erişilebilir native buton
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled satır tıklanamaz', () => {
    const onClick = vi.fn()
    wrap(
      <GlassList>
        <GlassListItem title="Aramalarım" onClick={onClick} disabled />
      </GlassList>,
    )
    const btn = screen.getByRole('button') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('destructive satırın row sınıfı işaretlenir', () => {
    wrap(
      <GlassList>
        <GlassListItem title="İlanı Kaldır" destructive onClick={() => {}} />
      </GlassList>,
    )
    expect(screen.getByRole('button', { name: 'İlanı Kaldır' }).className).toMatch(/destructive/)
  })

  it('ikon dekoratiftir (aria-hidden) ve accessible name’e karışmaz', () => {
    wrap(
      <GlassList>
        <GlassListItem icon={<span data-testid="satir-ikonu">IK</span>} title="İlanlarım" subtitle="3 aktif" onClick={() => {}} />
      </GlassList>,
    )
    // isim ikonu içermez ama title+subtitle içerir
    const btn = screen.getByRole('button', { name: /İlanlarım/ })
    expect(btn.textContent).toContain('3 aktif')
    const icon = screen.getByTestId('satir-ikonu').parentElement!
    expect(icon.getAttribute('aria-hidden')).toBe('true')
  })
})
