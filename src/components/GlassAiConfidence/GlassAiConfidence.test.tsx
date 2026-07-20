import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassAiConfidence } from './GlassAiConfidence'

describe('GlassAiConfidence', () => {
  it('meter rolü + aria değer sözleşmesiyle render olur', () => {
    render(<GlassAiConfidence score={82} label="Yanıt güveni" />)
    const meter = screen.getByRole('meter', { name: 'Yanıt güveni' })
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-valuenow')).toBe('82')
  })

  it('skor [0,100] aralığına clamp edilir (128 → 100)', () => {
    render(<GlassAiConfidence score={128} label="Güven" />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100')
  })

  it('NaN/Infinity skor "ölçülmedi" fallback\'ine düşer, meter render edilmez', () => {
    const { unmount } = render(<GlassAiConfidence score={NaN} label="Bozuk" />)
    expect(screen.queryByRole('meter')).toBeNull()
    expect(screen.getByText('Ölçülmedi — sonucu doğrulayın.')).toBeTruthy()
    unmount()

    render(<GlassAiConfidence score={Infinity} label="Sonsuz" />)
    expect(screen.queryByRole('meter')).toBeNull()
  })

  it('skor verilmezse sessizce gizlenmez; açık fallback gösterilir', () => {
    render(<GlassAiConfidence label="Güven" />)
    expect(screen.queryByRole('meter')).toBeNull()
    const note = screen.getByRole('note')
    expect(note.textContent).toMatch(/Ölçülmedi/)
  })

  it('seviye metni renk dışında kanal olarak gösterilir', () => {
    const { unmount: u1 } = render(<GlassAiConfidence score={85} label="A" />)
    expect(screen.getByText(/Yüksek · %85/)).toBeTruthy()
    expect(screen.getByRole('meter').closest('[data-level="high"]')).toBeTruthy()
    u1()

    const { unmount: u2 } = render(<GlassAiConfidence score={55} label="B" />)
    expect(screen.getByText(/Orta · %55/)).toBeTruthy()
    u2()

    render(<GlassAiConfidence score={20} label="C" />)
    expect(screen.getByText(/Düşük · %20/)).toBeTruthy()
  })

  it('etken listesini yön metniyle (sr-only) gösterir', () => {
    render(
      <GlassAiConfidence
        score={70}
        label="Güven"
        factors={[
          { id: 'a', label: 'Tapu doğrulandı', impact: 'positive' },
          { id: 'b', label: 'İlan fotoğrafı eski', impact: 'negative' },
          { id: 'c', label: 'Fiyat emsalle uyumlu', impact: 'neutral' },
        ]}
      />,
    )
    expect(screen.getByRole('list', { name: 'Güven düzeyini etkileyen etkenler' })).toBeTruthy()
    expect(screen.getByText('Artırıyor:')).toBeTruthy()
    expect(screen.getByText('Azaltıyor:')).toBeTruthy()
    expect(screen.getByText('Nötr:')).toBeTruthy()
  })

  it('güvenin doğruluk garantisi olmadığı uyarısını kalıcı gösterir', () => {
    render(<GlassAiConfidence score={90} label="Güven" />)
    expect(screen.getByText('Güven skoru doğruluk garantisi değildir.')).toBeTruthy()
  })

  it('caller rest ile className birleşir, yönetilen attribute ezilmez', () => {
    render(<GlassAiConfidence score={50} label="Güven" data-testid="conf" />)
    expect(screen.getByTestId('conf')).toBeTruthy()
  })
})
