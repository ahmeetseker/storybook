import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassAlert, type GlassAlertProps } from './GlassAlert'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderAlert = (props: Partial<GlassAlertProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassAlert {...props}>{props.children ?? 'İlanınız yayına alındı.'}</GlassAlert>
    </GlassTierProvider>,
  )

describe('GlassAlert', () => {
  it('info ve success için role="status" verilir (polite — akışı kesmez)', () => {
    renderAlert({ severity: 'info' })
    expect(screen.getByRole('status').textContent).toContain('İlanınız yayına alındı.')

    renderAlert({ severity: 'success', children: 'Onaylandı.' })
    expect(screen.getAllByRole('status').length).toBe(2)
  })

  it('warning ve danger için role="alert" verilir (assertive)', () => {
    renderAlert({ severity: 'warning' })
    expect(screen.getByRole('alert')).toBeTruthy()

    renderAlert({ severity: 'danger', children: 'Ödeme reddedildi.' })
    expect(screen.getAllByRole('alert').length).toBe(2)
  })

  it('title ve gövde birlikte render olur', () => {
    renderAlert({ severity: 'success', title: 'Yayında', children: 'İlan onaylandı.' })
    expect(screen.getByText('Yayında')).toBeTruthy()
    expect(screen.getByText('İlan onaylandı.')).toBeTruthy()
  })

  it('onDismiss verilince "Kapat" butonu görünür ve tıklayınca çağrılır (klavye dahil)', () => {
    const onDismiss = vi.fn()
    renderAlert({ onDismiss })
    const btn = screen.getByRole('button', { name: 'Kapat' })
    fireEvent.click(btn)
    expect(onDismiss).toHaveBeenCalledTimes(1)
    // Native button: Enter/Space aktivasyonu click olarak gelir — focus edilebilir olmalı
    btn.focus()
    expect(document.activeElement).toBe(btn)
  })

  it('onDismiss verilmezse kapatma butonu render edilmez', () => {
    renderAlert()
    expect(screen.queryByRole('button', { name: 'Kapat' })).toBeNull()
  })

  it('özel icon severity ikonunun yerine geçer', () => {
    renderAlert({ icon: <span data-testid="ozel-ikon" /> })
    expect(screen.getByTestId('ozel-ikon')).toBeTruthy()
    expect(screen.getByRole('status').querySelector('svg')).toBeNull()
  })

  it('severity sınıfı uygulanır ve action alanı render olur', () => {
    renderAlert({ severity: 'danger', action: <button type="button">Tekrar Dene</button> })
    expect(screen.getByRole('alert').className).toMatch(/danger/)
    expect(screen.getByRole('button', { name: 'Tekrar Dene' })).toBeTruthy()
  })
})
