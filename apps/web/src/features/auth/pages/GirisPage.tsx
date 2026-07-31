import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import styles from './GirisPage.module.css'

/** Giriş akışının tek kapısı — telefon birincil, diğer yöntemler bağlantı. */
export function GirisPage() {
  const { adapters } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [telefon, setTelefon] = useState('')
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.girisBaslat('telefon', telefon)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    navigate({ to: '/giris/kod', search: { donus: guvenliDonusYolu(donus) } })
  }

  return (
    <AuthFormPage
      baslik="Giriş yapın"
      aciklama="Telefon numaranıza tek kullanımlık bir kod göndereceğiz."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Kod gönder"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[
        { etiket: 'Parola ile giriş yapın', hedef: '/giris/parola' },
        // "Hesap oluşturun" → /kayit henüz yazılmadı (Faz 2). Ölü bağlantı
        // bırakmamak için kayıt akışı gelene kadar bu satır kaldırılmıştır.
      ]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="giris-telefon">
          Telefon numarası
        </label>
        <input
          id="giris-telefon"
          className={styles.input}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="5XX XXX XX XX"
          value={telefon}
          onChange={(event) => setTelefon(event.target.value)}
        />
        <p className={styles.hint}>Numaranız yalnız giriş doğrulaması için kullanılır.</p>
      </div>
    </AuthFormPage>
  )
}
