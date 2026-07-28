import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GlassDataProvenance } from './GlassDataProvenance'

const BASE = {
  fieldLabel: 'Yüzölçümü',
  sourceLabel: 'TKGM MEGSİS',
  sourceClass: 'official' as const,
  retrievedAt: '24 Tem 2026',
  scopeLabel: 'parsel',
}

describe('GlassDataProvenance', () => {
  it('tetikleyici kaynak sınıfının görünür etiketini taşır', () => {
    render(<GlassDataProvenance {...BASE} />)
    expect(screen.getByRole('button', { name: /Resmî kayıttan/ })).toBeTruthy()
  })

  it('kapalıyken ayrıntı içeriği DOM içinde render edilmez', () => {
    render(<GlassDataProvenance {...BASE} method="Doğrudan kayıt sorgusu" />)
    expect(screen.queryByText('Doğrudan kayıt sorgusu')).toBeNull()
  })

  it('tıklayınca ayrıntıyı açar ve aria-expanded günceller', async () => {
    const user = userEvent.setup()
    render(<GlassDataProvenance {...BASE} method="Doğrudan kayıt sorgusu" />)
    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    await user.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Doğrudan kayıt sorgusu')).toBeTruthy()
  })

  it('controlled kullanımda kendi state\'ini değiştirmez', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<GlassDataProvenance {...BASE} open={false} onOpenChange={onOpenChange} method="Sorgu" />)
    await user.click(screen.getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false')
  })

  it('bayat kaynakta güncellik etiketi kaynak sınıfının yerine geçer', () => {
    render(<GlassDataProvenance {...BASE} freshness="stale" />)
    expect(screen.getByRole('button', { name: /Güncel değil/ })).toBeTruthy()
  })

  it('çelişkili değerde iki kaynağı ve iki tarihi birlikte gösterir', async () => {
    const user = userEvent.setup()
    render(
      <GlassDataProvenance
        {...BASE}
        conflicts={[{ sourceLabel: 'İlan sahibi beyanı', value: '4.850 m²', effectiveAt: '12 Nis 2026' }]}
        currentValueLabel="4.712 m²"
      />,
    )
    await user.click(screen.getByRole('button', { name: /Kaynaklar çelişiyor/ }))
    expect(screen.getByText('4.850 m²')).toBeTruthy()
    expect(screen.getByText('4.712 m²')).toBeTruthy()
    expect(screen.getByText(/12 Nis 2026/)).toBeTruthy()
  })

  it('sınırlamaları liste olarak gösterir', async () => {
    const user = userEvent.setup()
    render(<GlassDataProvenance {...BASE} limitations={['Parsel bazlı hüküm vermez.']} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Parsel bazlı hüküm vermez.')).toBeTruthy()
  })

  it('yalnız düz yüzey üretir — cam bütçesini tüketmez', () => {
    const { container } = render(<GlassDataProvenance {...BASE} />)
    expect(container.querySelectorAll('[data-material="glass"]').length).toBe(0)
  })

  it('erişilebilir adı alan adını içerir', () => {
    render(<GlassDataProvenance {...BASE} />)
    expect(screen.getByRole('button', { name: /Yüzölçümü/ })).toBeTruthy()
  })
})
