import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassPagination } from './GlassPagination'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderPagination = (props: Partial<Parameters<typeof GlassPagination>[0]> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassPagination page={5} pageCount={20} onPageChange={() => {}} {...props} />
    </GlassTierProvider>,
  )

describe('GlassPagination', () => {
  it('navigation landmark adıyla render olur; aktif sayfa aria-current="page" alır', () => {
    renderPagination()
    expect(screen.getByRole('navigation', { name: 'Sayfalama' })).toBeTruthy()
    const active = screen.getByRole('button', { name: 'Sayfa 5' })
    expect(active.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Sayfa 4' }).getAttribute('aria-current')).toBeNull()
  })

  it('sayfa butonuna tıklayınca onPageChange doğru sayfayla çağrılır', () => {
    const onPageChange = vi.fn()
    renderPagination({ onPageChange })
    fireEvent.click(screen.getByRole('button', { name: 'Sayfa 6' }))
    expect(onPageChange).toHaveBeenCalledWith(6)
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('ellipsis mantığı: page=5/20, sibling=1 → 1 … 4 5 6 … 20', () => {
    renderPagination()
    const visible = [1, 4, 5, 6, 20]
    for (const p of visible) expect(screen.getByRole('button', { name: `Sayfa ${p}` })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Sayfa 2' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Sayfa 7' })).toBeNull()
    const nav = screen.getByRole('navigation')
    expect(nav.textContent?.match(/…/g)?.length).toBe(2)
  })

  it('uçlarda oklar disabled: ilk sayfada önceki, son sayfada sonraki', () => {
    const onPageChange = vi.fn()
    const { unmount } = renderPagination({ page: 1, onPageChange })
    const prev = screen.getByRole('button', { name: 'Önceki sayfa' }) as HTMLButtonElement
    expect(prev.disabled).toBe(true)
    fireEvent.click(prev)
    expect(onPageChange).not.toHaveBeenCalled()
    unmount()

    renderPagination({ page: 20 })
    expect((screen.getByRole('button', { name: 'Sonraki sayfa' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('disabled iken tüm butonlar devre dışıdır ve onPageChange çağrılmaz', () => {
    const onPageChange = vi.fn()
    renderPagination({ disabled: true, onPageChange })
    for (const btn of screen.getAllByRole('button')) {
      expect((btn as HTMLButtonElement).disabled).toBe(true)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Sayfa 6' }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('kompakt mod göstergesi ("X / Y") DOM\'da bulunur — mobilde CSS ile gösterilir', () => {
    renderPagination()
    expect(screen.getByText('5 / 20')).toBeTruthy()
  })

  it('kontroller tek flex satır kapsayıcısında yaşar — GlassSurface content sarmalayıcısı flex bağlamını kırmamalı', () => {
    renderPagination()
    const prev = screen.getByRole('button', { name: 'Önceki sayfa' })
    const next = screen.getByRole('button', { name: 'Sonraki sayfa' })
    expect(prev.parentElement).toBe(next.parentElement)
    expect(prev.parentElement?.className).toContain('row')
  })

  it('sayfa butonları klavye için gerçek <button> öğeleridir (native Enter/Space aktivasyonu)', () => {
    renderPagination()
    const btn = screen.getByRole('button', { name: 'Sayfa 6' })
    expect(btn.tagName).toBe('BUTTON')
    btn.focus()
    expect(document.activeElement).toBe(btn)
  })
})
