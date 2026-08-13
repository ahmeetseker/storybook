import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { AccountNotificationsPage } from './AccountNotificationsPage'

describe('AccountNotificationsPage', () => {
  it('kayıtları gün kovalarına gruplar (Bugün / Dün / Daha eski)', () => {
    render(<AccountNotificationsPage />)
    const bugun = screen.getByRole('region', { name: 'Bugün' })
    expect(within(bugun).getByText(/Kadıköy Anahtar Ofis/)).toBeTruthy()
    const dun = screen.getByRole('region', { name: 'Dün' })
    expect(within(dun).getByText('İlanınız yayına alındı')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Daha eski' })).toBeTruthy()
  })

  it('Okunmamış filtresi yalnız okunmamışları bırakır; boş gruplar çizilmez', () => {
    render(<AccountNotificationsPage />)
    fireEvent.click(screen.getByRole('radio', { name: 'Okunmamış (2)' }))
    expect(screen.queryByRole('region', { name: 'Dün' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Bugün' })).toBeTruthy()
  })

  it('kayda tıklamak okundu sayar; Tümünü okundu say hepsini temizler', () => {
    render(<AccountNotificationsPage />)
    fireEvent.click(screen.getByText(/Kadıköy Anahtar Ofis/))
    expect(screen.getByRole('radio', { name: 'Okunmamış (1)' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Tümünü okundu say' }))
    expect(screen.queryByRole('button', { name: 'Tümünü okundu say' })).toBeNull()
    fireEvent.click(screen.getByRole('radio', { name: 'Okunmamış' }))
    expect(screen.getByText(/Hepsi okundu/)).toBeTruthy()
  })
})
