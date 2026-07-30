// AnaSayfa hero sözleşmesi — Arsam yerleşimi: eyebrow + vurgulu başlık + arama kartı + istatistikler
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnaSayfa } from './AnaSayfa'

describe('AnaSayfa hero (Arsam yerleşimi)', () => {
  it('eyebrow, vurgulu başlık, arama kartı ve istatistikleri render eder', () => {
    render(<AnaSayfa />)
    expect(screen.getByText(/Türkiye'nin Arsa Rehberi/i)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1 })).toHaveProperty(
      'textContent',
      'Hayal ettiğin arsa seni bekliyor.',
    )
    expect(screen.getByRole('radiogroup', { name: 'Kategori' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Konum' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Metrekare aralığı' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /İlanları Gör/ })).toBeTruthy()
    expect(screen.getByText('50.900+ ilan')).toBeTruthy()
    expect(
      screen.getAllByText(/Bu kontrol tapu niteliğini, takyidatı, imar bilgisini/).length,
    ).toBeGreaterThanOrEqual(1)
  })
})
