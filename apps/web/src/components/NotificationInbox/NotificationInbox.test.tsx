import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NotificationInbox } from './NotificationInbox'

describe('NotificationInbox', () => {
  it('zil okunmamış sayısını taşır; tıklayınca panel açılır ve kayıtlar listelenir', () => {
    render(<NotificationInbox onViewAll={() => {}} />)
    const zil = screen.getByRole('button', { name: /Bildirimler \(2 okunmamış\)/ })
    fireEvent.click(zil)
    expect(screen.getByRole('dialog', { name: 'Bildirimler' })).toBeTruthy()
    expect(screen.getByText(/Kadıköy Anahtar Ofis mesajınıza yanıt verdi/)).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Okunmamış (2)' })).toBeTruthy()
  })

  it('Okunmamış sekmesi yalnız okunmamışları gösterir; kayda tıklamak okundu sayar', () => {
    render(<NotificationInbox onViewAll={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/ }))
    fireEvent.click(screen.getByRole('radio', { name: 'Okunmamış (2)' }))
    expect(screen.queryByText('İlanınız yayına alındı')).toBeNull()
    fireEvent.click(screen.getByText(/Kadıköy Anahtar Ofis/))
    // Kayıt okundu → okunmamış filtresinden düşer
    expect(screen.queryByText(/Kadıköy Anahtar Ofis/)).toBeNull()
    expect(screen.getByRole('radio', { name: 'Okunmamış (1)' })).toBeTruthy()
  })

  it('Tümünü okundu say rozeti ve düğmeyi kaldırır; boş durum metni görünür', () => {
    render(<NotificationInbox onViewAll={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Tümünü okundu say' }))
    expect(screen.queryByRole('button', { name: 'Tümünü okundu say' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Bildirimler' })).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: 'Okunmamış' }))
    expect(screen.getByText(/Hepsi okundu/)).toBeTruthy()
  })

  it('Tüm bildirimleri gör onViewAll çağırır ve paneli kapatır', async () => {
    const onViewAll = vi.fn()
    render(<NotificationInbox onViewAll={onViewAll} />)
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Tüm bildirimleri gör' }))
    expect(onViewAll).toHaveBeenCalledTimes(1)
    // Panel çıkış animasyonu (AnimatePresence) bitene dek DOM'da kalır
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Bildirimler' })).toBeNull()
    })
  })
})
