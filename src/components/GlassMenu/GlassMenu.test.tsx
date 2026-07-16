import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassMenu, GlassMenuItem, GlassMenuSeparator } from './GlassMenu'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderMenu = (opts: { onSelect?: () => void; onDisabledSelect?: () => void } = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassMenu trigger={<button>İşlemler</button>}>
        <GlassMenuItem onSelect={opts.onSelect}>Düzenle</GlassMenuItem>
        <GlassMenuItem disabled onSelect={opts.onDisabledSelect}>
          Öne Çıkar
        </GlassMenuItem>
        <GlassMenuSeparator />
        <GlassMenuItem destructive>Sil</GlassMenuItem>
      </GlassMenu>
    </GlassTierProvider>,
  )

const trigger = () => screen.getByRole('button', { name: 'İşlemler' })

describe('GlassMenu', () => {
  it('kapalı başlar; trigger tıklanınca menu açılır, aria-haspopup/aria-expanded sözleşmesi çalışır', () => {
    renderMenu()
    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger())
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(screen.getAllByRole('menuitem').length).toBe(3)
    expect(screen.getByRole('separator')).toBeTruthy()
  })

  it('açılınca ilk item focus alır; item seçilince onSelect çağrılır ve menü kapanır', async () => {
    const onSelect = vi.fn()
    renderMenu({ onSelect })
    fireEvent.click(trigger())

    const item = screen.getByRole('menuitem', { name: 'Düzenle' })
    expect(document.activeElement).toBe(item)

    fireEvent.click(item)
    expect(onSelect).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    // seçim sonrası focus trigger'a döner
    expect(document.activeElement).toBe(trigger())
  })

  it('klavye: oklar gezinir (disabled atlanır), Home/End uçlara gider, Escape kapatıp trigger\'a döner', async () => {
    renderMenu()
    fireEvent.click(trigger())
    const menu = screen.getByRole('menu')
    const duzenle = screen.getByRole('menuitem', { name: 'Düzenle' })
    const sil = screen.getByRole('menuitem', { name: 'Sil' })

    // ArrowDown: disabled "Öne Çıkar" atlanır → Sil
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(sil)
    // roving tabIndex: aktif 0, diğeri -1
    expect(sil.tabIndex).toBe(0)
    expect(duzenle.tabIndex).toBe(-1)

    // ArrowDown sondayken başa sarar
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(duzenle)

    fireEvent.keyDown(menu, { key: 'End' })
    expect(document.activeElement).toBe(sil)
    fireEvent.keyDown(menu, { key: 'Home' })
    expect(document.activeElement).toBe(duzenle)

    fireEvent.keyDown(menu, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger())
  })

  it('trigger üzerinde ArrowDown menüyü açar ve ilk item\'a focus verir', () => {
    renderMenu()
    trigger().focus()
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Düzenle' }))
  })

  it('disabled item seçilemez: onSelect çağrılmaz, menü açık kalır', () => {
    const onDisabledSelect = vi.fn()
    renderMenu({ onDisabledSelect })
    fireEvent.click(trigger())

    const item = screen.getByRole('menuitem', { name: 'Öne Çıkar' }) as HTMLButtonElement
    expect(item.disabled).toBe(true)
    expect(item.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(item)
    expect(onDisabledSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('dış tıklama menüyü kapatır', async () => {
    renderMenu()
    fireEvent.click(trigger())
    expect(screen.getByRole('menu')).toBeTruthy()

    fireEvent.pointerDown(document.body)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })
})
