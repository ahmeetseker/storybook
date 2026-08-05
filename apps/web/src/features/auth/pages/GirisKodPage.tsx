import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import { alanHataId } from '../domain/form-erisilebilirlik'
import { kodHatasi } from '../domain/kayit-dogrulama'
import styles from './GirisPage.module.css'

const ALAN_ID = 'giris-kod'

/** Tekrar gönderme arası bekleme. SMS maliyeti ve kötüye kullanım için. */
const BEKLEME_SANIYE = 60

/**
 * Tek kullanımlık kod ekranı.
 *
 * Kod alanı bilinçli olarak TEK `<input>`: altı ayrı kutulu desen
 * yapıştırmayı, ekran okuyucu deneyimini ve SMS otomatik doldurmayı bozar.
 *
 * "Kodu tekrar gönder" bu akışın TEK kurtarma yoludur. Önceden yalnız
 * "Numarayı değiştirin" vardı; SMS gelmeyen kullanıcı akışa baştan
 * başlamak zorunda kalıyordu.
 */
export function GirisKodPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [kod, setKod] = useState('')
  const [alanHatasi, setAlanHatasi] = useState<string | undefined>()
  const [hata, setHata] = useState<string | undefined>()
  const [hataAnahtari, setHataAnahtari] = useState(0)
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [bilgi, setBilgi] = useState<string | undefined>()
  const [tekrarKilitli, setTekrarKilitli] = useState(false)
  // Sayfaya gelindiğinde kod HENÜZ gönderilmiştir; geri sayım dolu başlar.
  // Sunucuda ve istemcinin ilk render'ında aynı değer olduğu için hidrasyon
  // uyuşur; sayaç yalnız efekt içinde (istemcide) işler.
  const [kalanSaniye, setKalanSaniye] = useState(BEKLEME_SANIYE)

  useEffect(() => {
    if (kalanSaniye <= 0) return
    const zamanlayici = setInterval(() => {
      setKalanSaniye((onceki) => (onceki <= 1 ? 0 : onceki - 1))
    }, 1000)
    return () => clearInterval(zamanlayici)
  }, [kalanSaniye])

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setBilgi(undefined)
    setHataAnahtari((onceki) => onceki + 1)

    const sorun = kodHatasi(kod)
    setAlanHatasi(sorun)
    if (sorun) {
      setHata(sorun)
      document.getElementById(ALAN_ID)?.focus()
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.koduDogrula(kod)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      if (sonuc.kod === 'hesap-askida') {
        navigate({ to: '/hesap/askida', replace: true })
        return
      }
      setHata(sonuc.mesaj)
      setAlanHatasi(sonuc.kod === 'gecersiz-kod' ? sonuc.mesaj : undefined)
      return
    }

    oturumuTazele()
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  const tekrarGonder = async () => {
    setHata(undefined)
    setBilgi(undefined)
    setHataAnahtari((onceki) => onceki + 1)

    const sonuc = await adapters.kodTekrarGonder()
    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      // Hız sınırına takıldıysak butonu yeniden açmanın anlamı yok.
      if (sonuc.kod === 'cok-fazla-deneme') setTekrarKilitli(true)
      return
    }

    setKod('')
    setAlanHatasi(undefined)
    setKalanSaniye(BEKLEME_SANIYE)
    setBilgi(`Yeni kodu ${sonuc.veri.maskeliKimlik} numarasına gönderdik.`)
  }

  const tekrarKapali = tekrarKilitli || kalanSaniye > 0

  return (
    <AuthFormPage
      baslik="Kodu girin"
      aciklama="Telefonunuza gönderdiğimiz altı haneli kodu yazın."
      hata={hata}
      hataAnahtari={hataAnahtari}
      onSubmit={gonder}
      gonderEtiketi="Doğrula"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[{ etiket: 'Numarayı değiştirin', hedef: '/giris' }]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor={ALAN_ID}>
          Doğrulama kodu
        </label>
        <input
          id={ALAN_ID}
          className={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={kod}
          aria-invalid={alanHatasi ? true : undefined}
          aria-describedby={alanHatasi ? alanHataId(ALAN_ID) : undefined}
          onChange={(event) => setKod(event.target.value)}
        />
        {alanHatasi ? (
          <p id={alanHataId(ALAN_ID)} className={styles.alanHatasi}>
            {alanHatasi}
          </p>
        ) : (
          <p className={styles.hint}>Kod 3 dakika geçerlidir.</p>
        )}

        <div className={styles.tekrarSatiri}>
          <button
            type="button"
            className={styles.tekrarButonu}
            disabled={tekrarKapali}
            onClick={tekrarGonder}
          >
            Kodu tekrar gönder
          </button>
          {/* Geri sayım ve "gönderdik" bildirimi AYNI canlı bölgeden okunur;
              ekran okuyucu kullanıcısı butonun neden kapalı olduğunu ve kodun
              yeniden gittiğini duyar. `polite`: her saniye araya girmez. */}
          <p className={styles.hint} aria-live="polite">
            {bilgi
              ? bilgi
              : kalanSaniye > 0
                ? `Yeniden göndermek için ${kalanSaniye} saniye bekleyin.`
                : ''}
          </p>
        </div>
      </div>
    </AuthFormPage>
  )
}
