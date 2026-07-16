import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassProgress, type GlassProgressProps } from './GlassProgress'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderProgress = (props: GlassProgressProps = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassProgress label="Yükleme durumu" {...props} />
    </GlassTierProvider>,
  )

describe('GlassProgress', () => {
  it('progressbar rolü ve aria değer sözleşmesiyle render olur', () => {
    renderProgress({ value: 40 })
    const bar = screen.getByRole('progressbar', { name: 'Yükleme durumu' })
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
  })

  it('indeterminate: aria-valuenow verilmez, data-indeterminate işaretlenir', () => {
    renderProgress()
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBeNull()
    expect(bar.hasAttribute('data-indeterminate')).toBe(true)
  })

  it('value max’a göre yüzdelenir ve sınırlar dışına taşamaz', () => {
    const { container, unmount } = renderProgress({ value: 30, max: 60 })
    const fill = container.querySelector('[class*="fill"]') as HTMLElement
    expect(fill.style.width).toBe('50%')
    unmount()

    renderProgress({ value: 150, max: 100 })
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })

  it('circle varyantı SVG stroke-dasharray ile çizilir', () => {
    const { container } = renderProgress({ variant: 'circle', value: 50 })
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(2)
    const fill = circles[1]
    const dash = Number(fill.getAttribute('stroke-dasharray'))
    const offset = Number(fill.getAttribute('stroke-dashoffset'))
    expect(offset).toBeCloseTo(dash / 2, 3) // %50 → çevrenin yarısı boş
  })

  it('showValue determinate’ta % metni gösterir, indeterminate’ta göstermez', () => {
    const { unmount } = renderProgress({ value: 62, showValue: true })
    expect(screen.getByText('62%')).toBeTruthy()
    unmount()

    renderProgress({ showValue: true })
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('tint CSS değişkeni olarak uygulanır', () => {
    renderProgress({ value: 10, tint: 'var(--lg-success)' })
    expect(screen.getByRole('progressbar').style.getPropertyValue('--glass-tint')).toBe('var(--lg-success)')
  })
})
