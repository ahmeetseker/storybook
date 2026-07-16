import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassTabs } from './GlassTabs'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const tabs = [
  { id: 'a', label: 'Açıklama', content: <p>Açıklama içeriği</p> },
  { id: 'b', label: 'Konum', content: <p>Konum içeriği</p> },
]

const renderTabs = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassTabs tabs={tabs} {...props} />
    </GlassTierProvider>,
  )

describe('GlassTabs', () => {
  it('ilk sekme varsayılan olarak açıktır', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Açıklama' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByText('Açıklama içeriği')).toBeDefined()
    expect(screen.queryByText('Konum içeriği')).toBeNull()
  })

  it('sekmeye tıklayınca içerik değişir ve onTabChange çağrılır', () => {
    const onTabChange = vi.fn()
    renderTabs({ onTabChange })
    fireEvent.click(screen.getByRole('tab', { name: 'Konum' }))
    expect(onTabChange).toHaveBeenCalledWith('b')
    expect(screen.getByText('Konum içeriği')).toBeDefined()
    expect(screen.queryByText('Açıklama içeriği')).toBeNull()
  })

  it('ok tuşları sekmeler arasında gezinir (sarmalı) ve Home/End uçlara gider', () => {
    const onTabChange = vi.fn()
    renderTabs({ onTabChange })
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(onTabChange).toHaveBeenLastCalledWith('b')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' }) // son sekmeden başa sarar
    expect(onTabChange).toHaveBeenLastCalledWith('a')
    fireEvent.keyDown(tablist, { key: 'End' })
    expect(onTabChange).toHaveBeenLastCalledWith('b')
    fireEvent.keyDown(tablist, { key: 'Home' })
    expect(onTabChange).toHaveBeenLastCalledWith('a')
  })

  it('controlled kullanımda activeId belirleyicidir', () => {
    renderTabs({ activeId: 'b' })
    expect(screen.getByText('Konum içeriği')).toBeDefined()
    fireEvent.click(screen.getByRole('tab', { name: 'Açıklama' }))
    // activeId sabit olduğu için içerik değişmez
    expect(screen.getByText('Konum içeriği')).toBeDefined()
  })

  it('defaultActiveId uncontrolled başlangıcı belirler', () => {
    renderTabs({ defaultActiveId: 'b' })
    expect(screen.getByText('Konum içeriği')).toBeDefined()
  })
})
