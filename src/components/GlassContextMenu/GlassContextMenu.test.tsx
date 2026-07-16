import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassContextMenu, type GlassContextMenuItem } from './GlassContextMenu'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderMenu = (items?: GlassContextMenuItem[]) => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onDisabled = vi.fn()
  render(
    <GlassTierProvider tier="fallback">
      <GlassContextMenu
        items={
          items ?? [
            { label: 'İlanı Düzenle', onSelect: onEdit },
            { label: 'Karşılaştırmaya Ekle', disabled: true, onSelect: onDisabled },
            { label: 'İlanı Sil', destructive: true, separatorBefore: true, onSelect: onDelete },
          ]
        }
      >
        <div>İlan kartı</div>
      </GlassContextMenu>
    </GlassTierProvider>,
  )
  return { onEdit, onDelete, onDisabled }
}

const openMenu = () => fireEvent.contextMenu(screen.getByText('İlan kartı'), { clientX: 120, clientY: 80 })

describe('GlassContextMenu', () => {
  it('sağ tıklama menu rolüyle paneli açar, ilk aktif öğe focus alır', () => {
    renderMenu()
    expect(screen.queryByRole('menu')).toBeNull()
    openMenu()
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'İlanı Düzenle' }))
  })

  it('öğe seçimi onSelect çağırır ve menüyü kapatır', async () => {
    const { onEdit } = renderMenu()
    openMenu()
    fireEvent.click(screen.getByRole('menuitem', { name: 'İlanı Düzenle' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('disabled öğe aria-disabled taşır, seçilemez; ok tuşları onu atlar', () => {
    const { onDisabled } = renderMenu()
    openMenu()
    const disabledItem = screen.getByRole('menuitem', { name: 'Karşılaştırmaya Ekle' })
    expect(disabledItem.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(disabledItem)
    expect(onDisabled).not.toHaveBeenCalled()

    // ArrowDown: Düzenle → (disabled atlanır) → Sil
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'İlanı Sil' }))
  })

  it('ok tuşları sarmalı gezinir (son öğeden ilkine)', () => {
    renderMenu()
    openMenu()
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'İlanı Düzenle' }))
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'İlanı Sil' }))
  })

  it('Escape ve dış tıklama menüyü kapatır', async () => {
    renderMenu()
    openMenu()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())

    openMenu()
    expect(screen.getByRole('menu')).toBeTruthy()
    fireEvent.pointerDown(document.body)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('separator render edilir, destructive öğe sınıf alır, menü dikey yönelimlidir', () => {
    renderMenu()
    openMenu()
    expect(screen.getByRole('separator')).toBeTruthy()
    expect(screen.getByRole('menu').getAttribute('aria-orientation')).toBe('vertical')
    expect(screen.getByRole('menuitem', { name: 'İlanı Sil' }).className).toMatch(/destructive/)
  })
})
