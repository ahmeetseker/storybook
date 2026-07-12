import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassSellerCard } from './GlassSellerCard'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderCard = (props = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSellerCard name="Mehmet Yılmaz" phone="0 (532) 123 45 67" {...props} />
    </GlassTierProvider>,
  )

describe('GlassSellerCard', () => {
  it('isim ve maskeli telefonu gösterir, numara görünmez', () => {
    renderCard()
    expect(screen.getByText('Mehmet Yılmaz')).toBeDefined()
    expect(screen.queryByText('0 (532) 123 45 67')).toBeNull()
    expect(screen.getByText(/•/)).toBeDefined()
  })

  it('"Telefonu Göster" numarayı açar ve onPhoneReveal çağrılır', () => {
    const onPhoneReveal = vi.fn()
    renderCard({ onPhoneReveal })
    fireEvent.click(screen.getByRole('button', { name: 'Telefonu Göster' }))
    expect(onPhoneReveal).toHaveBeenCalledTimes(1)
    const link = screen.getByRole('link', { name: '0 (532) 123 45 67' })
    expect(link.getAttribute('href')).toBe('tel:05321234567')
  })

  it('onMessage verilince "Mesaj Gönder" çalışır', () => {
    const onMessage = vi.fn()
    renderCard({ onMessage })
    fireEvent.click(screen.getByRole('button', { name: 'Mesaj Gönder' }))
    expect(onMessage).toHaveBeenCalledTimes(1)
  })

  it('verified rozetini erişilebilir şekilde gösterir', () => {
    renderCard({ verified: true })
    expect(screen.getByRole('img', { name: 'Doğrulanmış hesap' })).toBeDefined()
  })

  it('avatar yoksa baş harfleri gösterir', () => {
    renderCard()
    expect(screen.getByText('MY')).toBeDefined()
  })
})
