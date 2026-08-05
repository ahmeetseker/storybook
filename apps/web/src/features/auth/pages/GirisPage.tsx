import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import { alanHataId } from '../domain/form-erisilebilirlik'
import { telefonHatasi } from '../domain/kayit-dogrulama'
import styles from './GirisPage.module.css'

const ALAN_ID = 'giris-telefon'

/**
 * Google marka işareti.
 *
 * Renkler token DEĞİL ve olamaz: bunlar Google'ın marka kılavuzunun
 * dayattığı sabit değerlerdir; temayla değişirlerse işaret artık Google'ın
 * işareti olmaz. Tasarım sisteminin "raw hex yasak" kuralı component
 * CSS'ini bağlar — marka logosu o kuralın istisnasıdır ve bu yüzden
 * stylesheet'te değil, burada durur.
 *
 * `aria-hidden`: butonun erişilebilir adı zaten "Google ile devam edin"
 * metninden geliyor; işaret onu tekrar etmemeli.
 */
function GoogleIsareti() {
  return (
    <svg
      className={styles.googleIsaret}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EB4335"
      />
    </svg>
  )
}

/** Giriş akışının tek kapısı — telefon birincil, diğer yöntemler bağlantı. */
export function GirisPage() {
  const { adapters } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [telefon, setTelefon] = useState('')
  const [alanHatasi, setAlanHatasi] = useState<string | undefined>()
  const [hata, setHata] = useState<string | undefined>()
  const [hataAnahtari, setHataAnahtari] = useState(0)
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setHataAnahtari((onceki) => onceki + 1)

    // Biçim hatası için ağ turu atmaya gerek yok; alan da işaretlenmeli —
    // eskiden yalnız sayfa üstünde özet çıkıyor, hatalı alan belirsiz kalıyordu.
    const sorun = telefonHatasi(telefon)
    setAlanHatasi(sorun)
    if (sorun) {
      setHata(sorun)
      document.getElementById(ALAN_ID)?.focus()
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.girisBaslat('telefon', telefon)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      setAlanHatasi(sonuc.kod === 'gecersiz-kimlik' ? sonuc.mesaj : undefined)
      return
    }

    navigate({ to: '/giris/kod', search: { donus: guvenliDonusYolu(donus) } })
  }

  /**
   * Google akışı sağlayıcıya YÖNLENDİRME ile başlar; dönüş
   * `/giris/google/callback`'te karşılanır. Fixture aşamasında gerçek bir
   * dış adres yok, bu yüzden doğrudan callback rotasına gidilir — akışın
   * şekli aynı kalır, yalnız aradaki dış tur yoktur.
   */
  const googleIleGir = async () => {
    setHata(undefined)
    const sonuc = await adapters.girisBaslat('google', '')
    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }
    navigate({
      to: '/giris/google/callback',
      search: { code: 'demo-google-kod', error: undefined, donus: guvenliDonusYolu(donus) },
    })
  }

  return (
    <AuthFormPage
      baslik="Giriş yapın"
      aciklama="Telefon numaranıza tek kullanımlık bir kod göndereceğiz."
      hata={hata}
      hataAnahtari={hataAnahtari}
      onSubmit={gonder}
      gonderEtiketi="Kod gönder"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[
        { etiket: 'Parola ile giriş yapın', hedef: '/giris/parola' },
        { etiket: 'Hesap oluşturun', hedef: '/kayit' },
      ]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor={ALAN_ID}>
          Telefon numarası
        </label>
        <input
          id={ALAN_ID}
          className={styles.input}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="5XX XXX XX XX"
          value={telefon}
          aria-invalid={alanHatasi ? true : undefined}
          aria-describedby={alanHatasi ? alanHataId(ALAN_ID) : undefined}
          onChange={(event) => setTelefon(event.target.value)}
        />
        {alanHatasi ? (
          <p id={alanHataId(ALAN_ID)} className={styles.alanHatasi}>
            {alanHatasi}
          </p>
        ) : (
          <p className={styles.hint}>Numaranız yalnız giriş doğrulaması için kullanılır.</p>
        )}
      </div>

      {/* Ayraç CSS'i (`.divider`) 2026-07-31'den beri yazılıydı ve hiçbir
          yerden kullanılmıyordu — sosyal giriş için ayrılmıştı. Kullanıldığı
          yer burası. */}
      <p className={styles.divider} aria-hidden="true">
        veya
      </p>

      <button type="button" className={styles.googleButonu} onClick={googleIleGir}>
        <GoogleIsareti />
        Google ile devam edin
      </button>
    </AuthFormPage>
  )
}
