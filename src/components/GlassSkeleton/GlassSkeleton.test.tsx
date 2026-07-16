import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { GlassSkeleton } from './GlassSkeleton'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSkeleton = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSkeleton data-testid="sk" {...props} />
    </GlassTierProvider>,
  )

describe('GlassSkeleton', () => {
  it('kök aria-hidden="true" taşır (yükleme bilgisini çağıran bölge yönetir)', () => {
    const { getByTestId } = renderSkeleton()
    expect(getByTestId('sk').getAttribute('aria-hidden')).toBe('true')
  })

  it('lines verilince n satır render olur ve son satır %60 genişliktedir', () => {
    const { getByTestId } = renderSkeleton({ lines: 3 })
    const group = getByTestId('sk')
    const bars = Array.from(group.children) as HTMLElement[]
    expect(bars).toHaveLength(3)
    expect(bars[0].style.width).toBe('100%')
    expect(bars[2].style.width).toBe('60%')
  })

  it('width/height sayı ve % string olarak uygulanır', () => {
    const { getByTestId } = renderSkeleton({ variant: 'rect', width: '75%', height: 120 })
    const el = getByTestId('sk')
    expect(el.style.width).toBe('75%')
    expect(el.style.height).toBe('120px')
  })

  it('variant sınıfı uygulanır (circle)', () => {
    const { getByTestId } = renderSkeleton({ variant: 'circle' })
    expect(getByTestId('sk').className).toMatch(/circle/)
  })

  it('animate=false shimmer sınıfını kaldırır (default açık)', () => {
    const { getByTestId, unmount } = renderSkeleton()
    expect(getByTestId('sk').className).toMatch(/animate/)
    unmount()
    const { getByTestId: get2 } = renderSkeleton({ animate: false })
    expect(get2('sk').className).not.toMatch(/animate/)
  })

  it('rol taşımaz ve erişilebilir içerik üretmez', () => {
    const { container } = renderSkeleton({ lines: 2 })
    expect(container.querySelectorAll('[role]')).toHaveLength(0)
    expect(container.textContent).toBe('')
  })
})
