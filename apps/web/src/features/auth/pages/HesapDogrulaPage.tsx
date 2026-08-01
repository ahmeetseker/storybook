import { useState, type FormEvent } from 'react'
import { AuthFormPage } from '../components/AuthFormPage'
import { AuthStatusPage } from '../components/AuthStatusPage'
import { useAuthSession, useKorumaliRota } from '../AuthSessionProvider'
import styles from './GirisPage.module.css'

/**
 * Hesap seviyesinde EİDS yetki doğrulaması.
 *
 * Bu sayfa `Oturum.eidsDurumu`'nu kurar. İlan sihirbazındaki EİDS adımı
 * ilan-özeldir ve bu durumu okur — ikisi çakışmaz, burası onun ön koşuludur.
 */
export function HesapDogrulaPage() {
  useKorumaliRota()
  const { oturum, adapters, oturumuTazele, girisYapildi } = useAuthSession()
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  if (!girisYapildi || !oturum) return null

  if (oturum.eidsDurumu === 'dogrulandi') {
    return (
      <AuthStatusPage
        tone="success"
        baslik="EİDS doğrulaması tamam"
        aciklama="Hesabınız ilan yayınlamaya yetkili. İlan verme akışında ek doğrulama istenmeyecek."
        birincilEylem={{ etiket: 'Hesabıma dön', hedef: '/hesabim' }}
      />
    )
  }

  const baslat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.eidsDogrulamaBaslat()
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
  }

  const beklemede = oturum.eidsDurumu === 'beklemede'

  return (
    <AuthFormPage
      baslik="EİDS doğrulaması"
      aciklama="Taşınmaz ticareti yetkinizi doğrulayarak ilan yayınlamaya başlayın."
      hata={hata}
      onSubmit={baslat}
      gonderEtiketi="Doğrulamayı başlat"
      gonderiliyor={gonderiliyor}
    >
      <p className={styles.hint}>
        {beklemede
          ? 'Başvurunuz alındı; yetki belgesi kontrolü sürüyor. Doğrulamayı şimdi de başlatabilirsiniz.'
          : 'EİDS, ilan verme yetkisini kurar: kimliğinizin malik kaydında veya yetki belgesinde görünmesi kontrol edilir.'}
      </p>
    </AuthFormPage>
  )
}
