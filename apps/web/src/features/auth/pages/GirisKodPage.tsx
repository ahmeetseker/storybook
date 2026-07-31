import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import styles from './GirisPage.module.css'

/**
 * Tek kullanımlık kod ekranı.
 *
 * Kod alanı bilinçli olarak TEK `<input>`: altı ayrı kutulu desen
 * yapıştırmayı, ekran okuyucu deneyimini ve SMS otomatik doldurmayı bozar.
 */
export function GirisKodPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [kod, setKod] = useState('')
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.koduDogrula(kod)
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
      baslik="Kodu girin"
      aciklama="Telefonunuza gönderdiğimiz altı haneli kodu yazın."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Doğrula"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[{ etiket: 'Numarayı değiştirin', hedef: '/giris' }]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="giris-kod">
          Doğrulama kodu
        </label>
        <input
          id="giris-kod"
          className={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={kod}
          onChange={(event) => setKod(event.target.value)}
        />
        <p className={styles.hint}>Kod 3 dakika geçerlidir.</p>
      </div>
    </AuthFormPage>
  )
}
