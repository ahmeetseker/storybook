import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FavoritesWorkspace } from './FavoritesWorkspace'

describe('FavoritesWorkspace', () => {
  it('renders saved listings and portfolio summary', () => {
    render(<FavoritesWorkspace />)
    expect(screen.getByRole('heading', { name: 'Favorilerinizi karar listesine dönüştürün.' })).toBeTruthy()
    expect(screen.getByText('toplam favori')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Favori ilanlar' })).toBeTruthy()
  })

  // Kart dili /emlak ızgarasıyla AYNI (GlassListingCard poster kartı,
  // 2026-08-13): doğrulama kurdele, diğer statüler opak kapsül; favorilere
  // özgü işlevler kartın altındaki aksiyon şeridinde korunur.
  it('ilan kartları /emlak ızgarasıyla aynı poster dilini kullanır', () => {
    render(<FavoritesWorkspace />)
    const grid = screen.getByRole('region', { name: 'Favori ilanlar' })

    expect(within(grid).getAllByText('Doğrulanmış').length).toBeGreaterThan(0)
    expect(within(grid).getAllByText('İnceleniyor')[0].getAttribute('data-tone')).toBe('warning')

    expect(within(grid).getAllByRole('button', { name: 'Not ekle' }).length).toBeGreaterThan(0)
    expect(within(grid).getAllByText('Yalnız sen görürsün').length).toBeGreaterThan(0)
    expect(within(grid).getAllByRole('button', { name: 'Karşılaştır' }).length).toBeGreaterThan(0)
    expect(within(grid).getAllByRole('button', { name: 'Favoriden çıkar' }).length).toBeGreaterThan(0)
  })

  it('filters price drops and opens listing detail', () => {
    render(<FavoritesWorkspace />)
    fireEvent.click(screen.getByRole('button', { name: 'Fiyatı değişen' }))
    const drops = screen.getAllByText('Fiyat düştü')
    expect(drops.length).toBeGreaterThan(0)
    // Statü kapsülü standardı: olumlu ton, opak kapsül.
    expect(drops[0].getAttribute('data-tone')).toBe('success')
    fireEvent.click(screen.getAllByRole('button', { name: /Urla’da/ })[0])
    expect(screen.getByRole('heading', { name: 'Favori ilan detayı' })).toBeTruthy()
  })

  // Kalp /emlak ızgara kartıyla aynı favori dili: burada her kart zaten
  // favoridir (basılı durum), tıklamak favoriden çıkarır.
  it('kalp butonu favoriden çıkarır', () => {
    render(<FavoritesWorkspace />)
    const grid = screen.getByRole('region', { name: 'Favori ilanlar' })
    const before = within(grid).getAllByRole('article').length
    const hearts = within(grid).getAllByRole('button', { name: 'Favorilerden çıkar' })
    expect(hearts[0].getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(hearts[0])
    expect(within(grid).getAllByRole('article').length).toBe(before - 1)
  })
})
