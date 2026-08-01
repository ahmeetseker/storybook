import { useState, type FormEvent } from 'react'
import { AuthFormPage } from '../components/AuthFormPage'
import { AuthStatusPage } from '../components/AuthStatusPage'
import { KorumaliSayfa } from '../components/KorumaliSayfa'
import { useAuthSession } from '../AuthSessionProvider'
import styles from './GirisPage.module.css'

/**
 * Hesap seviyesinde EİDS yetki doğrulaması.
 *
 * Bu sayfa `Oturum.eidsDurumu`'nu kurar. İlan sihirbazındaki EİDS adımı
 * ilan-özeldir ve bu durumu okur — ikisi çakışmaz, burası onun ön koşuludur.
 * Koruma (yönlendirme + hidrasyon-güvenli bekleme) `KorumaliSayfa` sağlar.
 */
export function HesapDogrulaPage() {
  const { oturum, adapters, oturumuTazele } = useAuthSession()
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

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

  const beklemede = oturum?.eidsDurumu === 'beklemede'

  return (
    <KorumaliSayfa>
      {oturum?.eidsDurumu === 'dogrulandi' ? (
        <AuthStatusPage
          tone="success"
          baslik="EİDS doğrulaması tamam"
          aciklama="Hesabınız ilan yayınlamaya yetkili. İlan verme akışında ek doğrulama istenmeyecek."
          birincilEylem={{ etiket: 'Hesabıma dön', hedef: '/hesabim' }}
        />
      ) : (
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
      )}
    </KorumaliSayfa>
  )
}
