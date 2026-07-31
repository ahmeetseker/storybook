import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthFormPage } from './AuthFormPage'
import { AuthStatusPage } from './AuthStatusPage'
import { AuthCallbackPage } from './AuthCallbackPage'

describe('AuthFormPage', () => {
  it('başlığı tek h1 olarak çizer', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    const basliklar = screen.getAllByRole('heading', { level: 1 })
    expect(basliklar).toHaveLength(1)
    expect(basliklar[0].textContent).toBe('Giriş yapın')
  })

  it('gönderimde onSubmit çağırır', async () => {
    const kullanici = userEvent.setup()
    const gonder = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={gonder} gonderEtiketi="Devam et">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    expect(gonder).toHaveBeenCalledTimes(1)
  })

  it('hatayı alert olarak duyurur', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et" hata="Kod hatalı.">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    expect(screen.getByRole('alert').textContent).toBe('Kod hatalı.')
  })

  it('gönderilirken butonu devre dışı bırakır', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et" gonderiliyor>
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    expect(screen.getByRole('button', { name: 'Devam et' })).toHaveProperty('disabled', true)
  })
})

describe('AuthStatusPage', () => {
  it('başlık ve açıklamayı çizer', () => {
    render(<AuthStatusPage tone="success" baslik="Parolanız değişti" aciklama="Yeni parolanızla giriş yapabilirsiniz." />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Parolanız değişti')
    expect(screen.getByText('Yeni parolanızla giriş yapabilirsiniz.')).toBeTruthy()
  })

  it('hata tonunda içeriği alert olarak duyurur', () => {
    render(<AuthStatusPage tone="error" baslik="Bağlantı geçersiz" aciklama="Yeni bağlantı isteyin." />)
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('bilgi tonunda alert kullanmaz', () => {
    render(<AuthStatusPage tone="info" baslik="Bağlantı gönderildi" aciklama="E-postanızı kontrol edin." />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('verilen tonu data özniteliğiyle yayınlar', () => {
    const { container } = render(<AuthStatusPage tone="success" baslik="Tamam" aciklama="Bitti." />)
    expect(container.querySelector('[data-tone="success"]')).toBeTruthy()
  })
})

describe('AuthCallbackPage', () => {
  it('bekleme durumunu status olarak duyurur', () => {
    render(<AuthCallbackPage durum="pending" baslik="Doğrulanıyor" />)
    expect(screen.getByRole('status').textContent).toContain('Doğrulanıyor')
  })

  it('hata durumunda mesajı alert olarak duyurur', () => {
    render(<AuthCallbackPage durum="error" baslik="Doğrulanamadı" hataMesaji="Bağlantının süresi dolmuş." />)
    expect(screen.getByRole('alert').textContent).toContain('Bağlantının süresi dolmuş.')
  })
})
