import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassScoreMeter } from './GlassScoreMeter'

describe('GlassScoreMeter', () => {
  it('meter rolü ve aria değer sözleşmesiyle render olur', () => {
    render(<GlassScoreMeter value={72} label="Yürünebilirlik" />)
    const meter = screen.getByRole('meter', { name: 'Yürünebilirlik' })
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-valuenow')).toBe('72')
  })

  it('değer [0, 100] aralığına clamp edilir', () => {
    const { unmount } = render(<GlassScoreMeter value={140} label="Ulaşım" />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100')
    unmount()

    render(<GlassScoreMeter value={-15} label="Sessizlik" />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('0')
  })

  it('description verilince ring/bar varyantında aria-describedby ile bağlanır', () => {
    render(
      <GlassScoreMeter value={80} label="Okullar" description="Yürüme mesafesinde 3 okul" variant="ring" />,
    )
    const meter = screen.getByRole('meter')
    const descId = meter.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId as string)?.textContent).toBe('Yürüme mesafesinde 3 okul')
  })

  it('badge varyantında description görüntülenmez ve aria-describedby verilmez', () => {
    render(
      <GlassScoreMeter value={55} label="Ulaşım" description="Yok sayılmalı" variant="badge" />,
    )
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-describedby')).toBeNull()
    expect(screen.queryByText('Yok sayılmalı')).toBeNull()
  })

  it('otomatik renk eşiği value’a göre data-tone belirler', () => {
    const { unmount: u1 } = render(<GlassScoreMeter value={85} label="A" />)
    expect(screen.getByRole('meter').dataset.tone).toBe('success')
    u1()

    const { unmount: u2 } = render(<GlassScoreMeter value={55} label="B" />)
    expect(screen.getByRole('meter').dataset.tone).toBe('accent')
    u2()

    render(<GlassScoreMeter value={20} label="C" />)
    expect(screen.getByRole('meter').dataset.tone).toBe('danger')
  })

  it('tone prop otomatik eşiği geçersiz kılar', () => {
    render(<GlassScoreMeter value={90} label="D" tone="danger" />)
    expect(screen.getByRole('meter').dataset.tone).toBe('danger')
  })

  it('ring varyantı SVG halka + merkezde sayıyı render eder', () => {
    const { container } = render(<GlassScoreMeter value={50} label="Yürünebilirlik" variant="ring" />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(2)
    const fill = circles[1]
    const dash = Number(fill.getAttribute('stroke-dasharray'))
    const offset = Number(fill.getAttribute('stroke-dashoffset'))
    expect(offset).toBeCloseTo(dash / 2, 3) // %50 → çevrenin yarısı boş
    expect(screen.getByText('50')).toBeTruthy()
  })

  it('bar varyantı dolgu genişliğini value yüzdesiyle çizer', () => {
    const { container } = render(<GlassScoreMeter value={35} label="Ulaşım" variant="bar" />)
    const fill = container.querySelector('[class*="barFill"]') as HTMLElement
    expect(fill.style.width).toBe('35%')
  })

  it('badge varyantı sayı ve etiketi tek satırda render eder', () => {
    render(<GlassScoreMeter value={64} label="Sessizlik" variant="badge" />)
    expect(screen.getByText('64')).toBeTruthy()
    expect(screen.getByText('Sessizlik')).toBeTruthy()
  })
})
