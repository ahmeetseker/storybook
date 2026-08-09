import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassRibbon } from './GlassRibbon'

describe('GlassRibbon', () => {
  it('etiketiyle render olur', () => {
    render(<GlassRibbon label="Doğrulanmış" />)
    expect(screen.getByText('Doğrulanmış')).toBeDefined()
  })

  it('varsayılan eksenler accent + sm sınıflarını uygular', () => {
    render(<GlassRibbon label="Doğrulanmış" data-testid="ribbon" />)
    const holder = screen.getByTestId('ribbon')
    expect(holder.className).toMatch(/accent/)
    expect(holder.className).toMatch(/sm/)
  })

  it('ton ve boyut eksenleri sınıf olarak uygulanır', () => {
    render(<GlassRibbon label="Yeni ilan" tone="neutral" size="md" data-testid="ribbon" />)
    const holder = screen.getByTestId('ribbon')
    expect(holder.className).toMatch(/neutral/)
    expect(holder.className).toMatch(/md/)
  })

  it('note yalnız ekran okuyucu metni olarak eklenir', () => {
    render(<GlassRibbon label="Doğrulanmış" note="Temsili görsel" />)
    expect(screen.getByText('Temsili görsel')).toBeDefined()
  })

  it('note verilmezse ek metin düğümü oluşmaz', () => {
    render(<GlassRibbon label="Doğrulanmış" data-testid="ribbon" />)
    expect(screen.getByTestId('ribbon').childElementCount).toBe(1)
  })

  it('className köke geçer', () => {
    render(<GlassRibbon label="Doğrulanmış" className="ozel" data-testid="ribbon" />)
    expect(screen.getByTestId('ribbon').className).toMatch(/ozel/)
  })
})
