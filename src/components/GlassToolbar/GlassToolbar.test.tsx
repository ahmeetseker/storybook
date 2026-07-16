import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassToolbar, GlassToolbarGroup } from './GlassToolbar'
import { GlassIconButton } from '../GlassIconButton'
import { GlassButton } from '../GlassButton'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderToolbar = (primary?: React.ReactNode) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassToolbar label="İlan araçları" primary={primary}>
        <GlassToolbarGroup label="Düzenleme">
          <GlassIconButton size="sm" label="Düzenle">✎</GlassIconButton>
          <GlassIconButton size="sm" label="Paylaş">↗</GlassIconButton>
        </GlassToolbarGroup>
        <GlassToolbarGroup label="Yönetim">
          <GlassIconButton size="sm" label="Sil">🗑</GlassIconButton>
        </GlassToolbarGroup>
      </GlassToolbar>
    </GlassTierProvider>,
  )

describe('GlassToolbar', () => {
  it('toolbar rolü, aria-label ve group semantiğiyle render olur', () => {
    renderToolbar()
    expect(screen.getByRole('toolbar', { name: 'İlan araçları' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Düzenleme' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Yönetim' })).toBeTruthy()
  })

  it('ok tuşları kontroller arasında gezer ve sarar', () => {
    renderToolbar()
    const toolbar = screen.getByRole('toolbar')
    const edit = screen.getByRole('button', { name: 'Düzenle' })
    edit.focus()
    fireEvent.keyDown(toolbar, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Paylaş' }))
    fireEvent.keyDown(toolbar, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sil' }))
    fireEvent.keyDown(toolbar, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(edit)
  })

  it('Home/End ilk ve son kontrole gider', () => {
    renderToolbar()
    const toolbar = screen.getByRole('toolbar')
    screen.getByRole('button', { name: 'Paylaş' }).focus()
    fireEvent.keyDown(toolbar, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sil' }))
    fireEvent.keyDown(toolbar, { key: 'Home' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Düzenle' }))
  })

  it('roving tabindex: odaklanan kontrol tek tab durağı olur', () => {
    renderToolbar()
    const share = screen.getByRole('button', { name: 'Paylaş' })
    fireEvent.focus(share)
    expect(share.tabIndex).toBe(0)
    expect(screen.getByRole('button', { name: 'Düzenle' }).tabIndex).toBe(-1)
    expect(screen.getByRole('button', { name: 'Sil' }).tabIndex).toBe(-1)
  })

  it('primary slotu render edilir ve ok gezinmesine dahildir', () => {
    const onClick = vi.fn()
    renderToolbar(<GlassButton size="sm" prominent onClick={onClick}>Yayınla</GlassButton>)
    const publish = screen.getByRole('button', { name: 'Yayınla' })
    fireEvent.click(publish)
    expect(onClick).toHaveBeenCalled()
    const toolbar = screen.getByRole('toolbar')
    fireEvent.keyDown(toolbar, { key: 'End' })
    expect(document.activeElement).toBe(publish)
  })
})
