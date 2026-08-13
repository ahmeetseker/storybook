import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { AiChatLauncher, taslakYanit } from './AiChatLauncher'

vi.mock('./RippleGrid', () => ({
  default: () => null,
}))

const sohbetiAc = () => {
  fireEvent.click(screen.getByRole('button', { name: 'AI danışman' }))
  act(() => {
    vi.advanceTimersByTime(400) // patlama animasyonunun tepe anı
  })
}

describe('AiChatLauncher', () => {
  it('küreye tıklayınca sohbet paneli açılır, karşılama mesajı görünür', () => {
    vi.useFakeTimers()
    try {
      render(<AiChatLauncher />)
      expect(screen.queryByRole('dialog')).toBeNull()
      sohbetiAc()
      const panel = screen.getByRole('dialog', { name: 'AI danışman' })
      expect(within(panel).getByText(/Ben arsam.net AI danışmanı/)).toBeTruthy()
      // Küre başlatıcı panel açıkken gizlenir (aynı köşeyi paylaşırlar)
      expect(screen.queryByRole('button', { name: 'AI danışman' })).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('mesaj gönderince kullanıcı satırı + yazıyor göstergesi, ardından taslak yanıt gelir', () => {
    vi.useFakeTimers()
    try {
      render(<AiChatLauncher />)
      sohbetiAc()
      fireEvent.change(screen.getByRole('textbox', { name: 'Mesajınız' }), {
        target: { value: 'Urla tarafında denize yakın arsa bakıyorum' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Gönder' }))
      expect(screen.getByText('Urla tarafında denize yakın arsa bakıyorum')).toBeTruthy()
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText(/Urla–İzmir hattında/)).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })

  it('kapatınca panel gider, küre geri gelir', () => {
    vi.useFakeTimers()
    try {
      render(<AiChatLauncher />)
      sohbetiAc()
      fireEvent.click(screen.getByRole('button', { name: 'Kapat' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getByRole('button', { name: 'AI danışman' })).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })

  it('taslak yanıtlar alan diline göre dallanır', () => {
    expect(taslakYanit('bütçem 3 milyon TL')).toMatch(/Bütçenize göre/)
    expect(taslakYanit('imar durumu nedir')).toMatch(/İmar durumu/)
    expect(taslakYanit('ofisle görüşme ayarlar mısın')).toMatch(/randevu/i)
    expect(taslakYanit('merhaba')).toMatch(/Not aldım/)
  })
})
