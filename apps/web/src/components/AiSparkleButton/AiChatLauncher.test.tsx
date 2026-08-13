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

  it('mesaj gönderince kullanıcı satırı + niyete uygun durum etiketi, ardından yanıt gelir', () => {
    vi.useFakeTimers()
    try {
      render(<AiChatLauncher />)
      sohbetiAc()
      fireEvent.change(screen.getByRole('textbox', { name: 'Mesajınız' }), {
        target: { value: 'merhaba' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Gönder' }))
      expect(screen.getByText('merhaba')).toBeTruthy()
      // Serbest sohbet niyeti: "Düşünüyorum…" durum etiketi görünür
      expect(screen.getByText('Düşünüyorum…')).toBeTruthy()
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText(/Not aldım/)).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })

  it('favori indirim sorusu: durum etiketi + tıklanabilir ilan kartları render edilir', () => {
    vi.useFakeTimers()
    try {
      render(<AiChatLauncher />)
      sohbetiAc()
      fireEvent.change(screen.getByRole('textbox', { name: 'Mesajınız' }), {
        target: { value: 'Favori ilanlarımda indirim var mı?' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Gönder' }))
      expect(screen.getByText('Favorileriniz taranıyor…')).toBeTruthy()
      act(() => {
        vi.advanceTimersByTime(1300)
      })
      expect(screen.getByText(/fiyat düşüşü/)).toBeTruthy()
      // İki fiyatı düşen favori, kompakt ilan kartı olarak balona gömülür
      const panel = screen.getByRole('dialog', { name: 'AI danışman' })
      const kartlar = within(panel)
        .getAllByRole('button')
        .filter((b) => b.textContent?.includes('TL'))
      expect(kartlar.length).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('randevu sorgusu: kayıt yokken yönlendirici yanıt ve Ofisler bağlantısı gelir', () => {
    vi.useFakeTimers()
    try {
      render(<AiChatLauncher />)
      sohbetiAc()
      fireEvent.change(screen.getByRole('textbox', { name: 'Mesajınız' }), {
        target: { value: 'Randevum var mı?' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Gönder' }))
      expect(screen.getByText('Randevularınız kontrol ediliyor…')).toBeTruthy()
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText(/Kayıtlı bir randevunuz görünmüyor/)).toBeTruthy()
      expect(screen.getByRole('link', { name: 'Ofisleri aç →' })).toBeTruthy()
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

  it('taslak yanıtlar alan diline göre dallanır (randevu/ofis artık niyet motorunda ele alınır)', () => {
    expect(taslakYanit('bütçem 3 milyon TL')).toMatch(/Bütçenize göre/)
    expect(taslakYanit('imar durumu nedir')).toMatch(/İmar durumu/)
    expect(taslakYanit('merhaba')).toMatch(/Not aldım/)
  })
})
