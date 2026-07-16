import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassAvatar } from './GlassAvatar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderAvatar = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassAvatar {...props} />
    </GlassTierProvider>,
  )

describe('GlassAvatar', () => {
  it('src verilince img render olur ve alt name’den türetilir', () => {
    renderAvatar({ src: 'https://example.com/a.jpg', name: 'Ayşe Yılmaz' })
    const img = screen.getByRole('img', { name: 'Ayşe Yılmaz' })
    expect(img.tagName).toBe('IMG')
  })

  it('src yoksa baş harfleri Türkçe locale ile büyütür (irem yıldız → İY)', () => {
    renderAvatar({ name: 'irem yıldız' })
    const fallback = screen.getByRole('img', { name: 'irem yıldız' })
    expect(fallback.textContent).toBe('İY')
  })

  it('görsel yüklenemezse (onError) baş harf fallback’ine düşer', () => {
    renderAvatar({ src: 'https://example.com/bozuk.jpg', name: 'Mehmet Demir' })
    fireEvent.error(screen.getByRole('img', { name: 'Mehmet Demir' }))
    const fallback = screen.getByRole('img', { name: 'Mehmet Demir' })
    expect(fallback.tagName).toBe('SPAN')
    expect(fallback.textContent).toBe('MD')
  })

  it('tint verilmezse name’den deterministik pastel üretir (aynı isim → aynı zemin)', () => {
    const { unmount } = renderAvatar({ name: 'Ceren Aksoy' })
    const first = screen.getByRole('img', { name: 'Ceren Aksoy' }).style.backgroundColor
    unmount()
    renderAvatar({ name: 'Ceren Aksoy' })
    const second = screen.getByRole('img', { name: 'Ceren Aksoy' }).style.backgroundColor
    expect(first).not.toBe('')
    expect(second).toBe(first)
  })

  it('tint verilince baş harf zeminine uygulanır', () => {
    renderAvatar({ name: 'Deniz Şahin', tint: 'rgb(242, 200, 148)' })
    expect(screen.getByRole('img', { name: 'Deniz Şahin' }).style.backgroundColor).toBe('rgb(242, 200, 148)')
  })

  it('status verilince ekran okuyucu metni bulunur', () => {
    renderAvatar({ name: 'Ayşe Yılmaz', status: 'online' })
    expect(screen.getByText('çevrim içi')).toBeTruthy()
  })

  it('alt ve name yoksa fallback AT’den gizlenir (dekoratif)', () => {
    const { container } = renderAvatar({})
    expect(screen.queryByRole('img')).toBeNull()
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })
})
