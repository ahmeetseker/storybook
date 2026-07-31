import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthSessionProvider, useAuthSession } from './AuthSessionProvider'
import type { AuthAdapters } from './data/auth-adapters'
import type { Oturum } from './domain/auth-types'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function sahteAdapters(baslangic: Oturum | null): AuthAdapters {
  let oturum = baslangic
  return {
    async girisBaslat() {
      return { durum: 'basarili', veri: { kanal: 'sms', maskeliKimlik: '555 *** 22 33' } }
    },
    async koduDogrula() {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili', veri: ORNEK_OTURUM }
    },
    async parolaIleGiris() {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili', veri: ORNEK_OTURUM }
    },
    oturumuGetir: () => oturum,
    cikisYap: () => {
      oturum = null
    },
  }
}

function Sonda() {
  const { oturum, girisYapildi, cikisYap } = useAuthSession()
  return (
    <div>
      <p>{girisYapildi ? `Oturum: ${oturum?.adSoyad}` : 'Oturum yok'}</p>
      <button type="button" onClick={cikisYap}>
        Çıkış yap
      </button>
    </div>
  )
}

describe('AuthSessionProvider', () => {
  it('adapter oturum döndürdüğünde oturumu yayınlar', () => {
    render(
      <AuthSessionProvider adapters={sahteAdapters(ORNEK_OTURUM)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    expect(screen.getByText('Oturum: Ayşe Kaya')).toBeTruthy()
  })

  it('oturum yokken girisYapildi false döner', () => {
    render(
      <AuthSessionProvider adapters={sahteAdapters(null)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    expect(screen.getByText('Oturum yok')).toBeTruthy()
  })

  it('çıkış yapınca oturumu düşürür', async () => {
    const kullanici = userEvent.setup()
    render(
      <AuthSessionProvider adapters={sahteAdapters(ORNEK_OTURUM)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    await kullanici.click(screen.getByRole('button', { name: 'Çıkış yap' }))
    await waitFor(() => expect(screen.getByText('Oturum yok')).toBeTruthy())
  })

  it('provider dışında kullanılırsa açık hata verir', () => {
    expect(() => render(<Sonda />)).toThrow(/AuthSessionProvider/)
  })
})
