import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { alanHataId } from '../domain/form-erisilebilirlik'
import { ePostaHatasi } from '../domain/kayit-dogrulama'
import styles from './GirisPage.module.css'

const ALAN_ID = 'parola-sifirla-eposta'

/**
 * Parola sıfırlama bağlantısı isteme ekranı (haritadaki "Parolamı unuttum").
 *
 * Sonuç HER ZAMAN `/parola-sifirla/gonderildi`'dir — adres kayıtlı olsun ya
 * da olmasın. Adapter de aynı sözleşmeyi uygular; aksi hâlde bu ekran "bu
 * e-posta sistemde var mı?" sorgusuna dönüşürdü.
 */
export function ParolaSifirlaPage() {
  const { adapters } = useAuthSession()
  const navigate = useNavigate()
  const [ePosta, setEPosta] = useState('')
  const [alanHatasi, setAlanHatasi] = useState<string | undefined>()
  const [hata, setHata] = useState<string | undefined>()
  const [hataAnahtari, setHataAnahtari] = useState(0)
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setHataAnahtari((onceki) => onceki + 1)

    const sorun = ePostaHatasi(ePosta)
    setAlanHatasi(sorun)
    if (sorun) {
      setHata('Formda düzeltilmesi gereken bir alan var.')
      document.getElementById(ALAN_ID)?.focus()
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.parolaSifirlamaIste(ePosta)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    navigate({ to: '/parola-sifirla/gonderildi', replace: true })
  }

  return (
    <AuthFormPage
      baslik="Parolanızı sıfırlayın"
      aciklama="Hesabınızın e-posta adresini girin; sıfırlama bağlantısını gönderelim."
      hata={hata}
      hataAnahtari={hataAnahtari}
      onSubmit={gonder}
      gonderEtiketi="Bağlantı gönder"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[
        { etiket: 'Parolanızı hatırladınız mı? Giriş yapın', hedef: '/giris/parola' },
      ]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor={ALAN_ID}>
          E-posta
        </label>
        <input
          id={ALAN_ID}
          className={styles.input}
          type="email"
          autoComplete="email"
          value={ePosta}
          aria-invalid={alanHatasi ? true : undefined}
          aria-describedby={alanHatasi ? alanHataId(ALAN_ID) : undefined}
          onChange={(event) => setEPosta(event.target.value)}
        />
        {alanHatasi ? (
          <p id={alanHataId(ALAN_ID)} className={styles.alanHatasi}>
            {alanHatasi}
          </p>
        ) : null}
      </div>
    </AuthFormPage>
  )
}
