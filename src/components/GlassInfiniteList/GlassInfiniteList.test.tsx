import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassInfiniteList } from './GlassInfiniteList'

// Bu dosyada IntersectionObserver KASITLI olarak mock'lanmaz — jsdom'da zaten
// tanımsızdır, component bu durumda otomatik olarak "yalnız buton" yoluna
// düşer (bkz. GlassInfiniteList.tsx). Testler yalnız bu buton yolunu ve
// guard'ları doğrular.

const renderList = (props: Partial<ComponentProps<typeof GlassInfiniteList>> = {}) =>
  render(
    <GlassInfiniteList onLoadMore={vi.fn()} hasMore {...props}>
      <ul>
        <li>İlan 1</li>
        <li>İlan 2</li>
      </ul>
    </GlassInfiniteList>,
  )

describe('GlassInfiniteList', () => {
  it('children\'ı olduğu gibi render eder', () => {
    renderList()
    expect(screen.getByText('İlan 1')).toBeTruthy()
    expect(screen.getByText('İlan 2')).toBeTruthy()
  })

  it('hasMore=true iken "Daha fazla yükle" butonu görünür ve tıklama onLoadMore\'u tetikler', () => {
    const onLoadMore = vi.fn()
    renderList({ onLoadMore })
    const button = screen.getByRole('button', { name: 'Daha fazla yükle' })
    fireEvent.click(button)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('loading=true iken buton disabled olur ve tıklama guard\'ı onLoadMore\'u tetiklemez', () => {
    const onLoadMore = vi.fn()
    renderList({ onLoadMore, loading: true })
    const button = screen.getByRole('button', { name: 'Daha fazla yükle' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('hasMore=false iken buton hiç render edilmez', () => {
    renderList({ hasMore: false })
    expect(screen.queryByRole('button', { name: 'Daha fazla yükle' })).toBeNull()
  })

  it('loading=true iken durum satırı varsayılan loadingText\'i gösterir', () => {
    renderList({ loading: true })
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('Yükleniyor…')
  })

  it('hasMore=false iken durum satırı varsayılan endText\'i gösterir', () => {
    renderList({ hasMore: false })
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('Hepsi bu kadar')
  })

  it('hasMore=true ve loading=false iken durum satırı boştur ama HER ZAMAN mount edilir', () => {
    renderList()
    const status = screen.getByRole('status')
    expect(status).toBeTruthy()
    expect(status.getAttribute('aria-live')).toBe('polite')
    expect(status.textContent).toBe('')
  })

  it('loadingText/endText özelleştirilebilir', () => {
    const { rerender } = renderList({ loading: true, loadingText: 'Daha fazla ilan getiriliyor…' })
    expect(screen.getByRole('status').textContent).toBe('Daha fazla ilan getiriliyor…')

    rerender(
      <GlassInfiniteList onLoadMore={vi.fn()} hasMore={false} endText="Tüm ilanlar listelendi">
        <ul>
          <li>İlan 1</li>
        </ul>
      </GlassInfiniteList>,
    )
    expect(screen.getByRole('status').textContent).toBe('Tüm ilanlar listelendi')
  })

  it('loading false\'a dönünce ve hasMore true kalınca buton yeniden etkinleşir', () => {
    const onLoadMore = vi.fn()
    const { rerender } = renderList({ onLoadMore, loading: true })
    expect((screen.getByRole('button', { name: 'Daha fazla yükle' }) as HTMLButtonElement).disabled).toBe(true)

    rerender(
      <GlassInfiniteList onLoadMore={onLoadMore} hasMore loading={false}>
        <ul>
          <li>İlan 1</li>
          <li>İlan 2</li>
        </ul>
      </GlassInfiniteList>,
    )
    const button = screen.getByRole('button', { name: 'Daha fazla yükle' }) as HTMLButtonElement
    expect(button.disabled).toBe(false)
    fireEvent.click(button)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('sonlu olmayan/negatif threshold değerleriyle bile hatasız render edilir', () => {
    expect(() => renderList({ threshold: Number.NaN })).not.toThrow()
    expect(() => renderList({ threshold: -100 })).not.toThrow()
  })
})
