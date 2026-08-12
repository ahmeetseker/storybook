import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { NotFoundView } from './NotFound'

// cobe WebGL ister; jsdom'da gerçek küre kurulamaz — sahte globe yeter.
vi.mock('cobe', () => ({
  default: vi.fn(() => ({ destroy: vi.fn(), update: vi.fn() })),
}))

describe('NotFoundView', () => {
  it('başlık, açıklama ve ekran okuyucu 404 metniyle render olur', () => {
    render(<NotFoundView onBack={() => {}} />)
    expect(screen.getByRole('heading', { name: /uzayda kaybolmuş/i })).toBeTruthy()
    expect(screen.getByText(/taşınmış ya da hiç var olmamış/i)).toBeTruthy()
    expect(screen.getByText(/hata kodu 404/i)).toBeTruthy()
  })

  it('geri dön butonu onBack çağırır', () => {
    const onBack = vi.fn()
    render(<NotFoundView onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /geri dön/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('küre canvas dekoratif (aria-hidden) kalır ve metinler özelleştirilebilir', () => {
    const { container } = render(
      <NotFoundView title="Kayıp sayfa" description="Burada bir şey yok." backText="Ana sayfa" onBack={() => {}} />,
    )
    expect(container.querySelector('canvas')).toBeTruthy()
    expect(container.querySelector('canvas')?.closest('[aria-hidden="true"]')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Kayıp sayfa' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /ana sayfa/i })).toBeTruthy()
  })
})
