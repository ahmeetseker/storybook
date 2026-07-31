import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import styles from './GirisPage.module.css'

export function GirisParolaPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [ePosta, setEPosta] = useState('')
  const [parola, setParola] = useState('')
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.parolaIleGiris(ePosta, parola)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  return (
    <AuthFormPage
      baslik="Parola ile giriş"
      aciklama="E-posta adresiniz ve parolanızla giriş yapın."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Giriş yap"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[
        // "Parolanızı mı unuttunuz?" → /parola-sifirla henüz yazılmadı
        // (Faz 3). Ölü bağlantı bırakmamak için parola sıfırlama akışı
        // gelene kadar bu satır kaldırılmıştır.
        { etiket: 'Telefonla giriş yapın', hedef: '/giris' },
      ]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="giris-eposta">
          E-posta
        </label>
        <input
          id="giris-eposta"
          className={styles.input}
          type="email"
          autoComplete="email"
          value={ePosta}
          onChange={(event) => setEPosta(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="giris-parola">
          Parola
        </label>
        <input
          id="giris-parola"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          value={parola}
          onChange={(event) => setParola(event.target.value)}
        />
      </div>
    </AuthFormPage>
  )
}
