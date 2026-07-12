import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassGallery } from './GlassGallery'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const images = [
  { src: 'data:image/svg+xml,a', alt: 'Ön görünüm' },
  { src: 'data:image/svg+xml,b', alt: 'Yan görünüm' },
  { src: 'data:image/svg+xml,c', alt: 'Arka görünüm' },
]

const renderGallery = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassGallery images={images} {...props} />
    </GlassTierProvider>,
  )

describe('GlassGallery', () => {
  it('ilk görseli ve sayacı gösterir', () => {
    renderGallery()
    expect(screen.getByAltText('Ön görünüm')).toBeDefined()
    expect(screen.getByText('1 / 3')).toBeDefined()
  })

  it('sonraki butonu görseli değiştirir ve onIndexChange çağrılır', () => {
    const onIndexChange = vi.fn()
    renderGallery({ onIndexChange })
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki görsel' }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
    expect(screen.getByAltText('Yan görünüm')).toBeDefined()
    expect(screen.getByText('2 / 3')).toBeDefined()
  })

  it('önceki butonu ilk görseldeyken sona sarar', () => {
    renderGallery()
    fireEvent.click(screen.getByRole('button', { name: 'Önceki görsel' }))
    expect(screen.getByText('3 / 3')).toBeDefined()
  })

  it('ana görsele tıklayınca lightbox açılır, Escape ile kapanır', () => {
    renderGallery()
    fireEvent.click(screen.getByRole('button', { name: /Görseli büyüt/ }))
    expect(screen.getByRole('dialog')).toBeDefined()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('lightbox açıkken ok tuşları gezinir', () => {
    renderGallery()
    fireEvent.click(screen.getByRole('button', { name: /Görseli büyüt/ }))
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toContain('2 / 3')
  })

  it('thumbnail tıklaması ilgili görsele atlar', () => {
    renderGallery()
    fireEvent.click(screen.getByRole('button', { name: '3. görsele git: Arka görünüm' }))
    expect(screen.getByText('3 / 3')).toBeDefined()
  })

  it('görsel yoksa hiçbir şey render etmez', () => {
    const { container } = render(
      <GlassTierProvider tier="fallback">
        <GlassGallery images={[]} />
      </GlassTierProvider>,
    )
    expect(container.firstChild).toBeNull()
  })
})
