import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import { kayitBilgileriniDogrula } from '../domain/kayit-dogrulama'
import type { HesapTipi, KayitAlanHatalari } from '../domain/auth-types'
import alanStilleri from './GirisPage.module.css'
import styles from './KayitPage.module.css'

/**
 * Kayıt sayfası. Hesap tipi ilk alandır: emlak ofisi seçilirse kayıt
 * sonrası kurumsal başvuruya, bireysel seçilirse dönüş hedefine gidilir.
 */
export function KayitPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }

  const [hesapTipi, setHesapTipi] = useState<HesapTipi>('bireysel')
  const [adSoyad, setAdSoyad] = useState('')
  const [ePosta, setEPosta] = useState('')
  const [telefon, setTelefon] = useState('')
  const [parola, setParola] = useState('')
  const [kvkkOnayi, setKvkkOnayi] = useState(false)
  const [alanHatalari, setAlanHatalari] = useState<KayitAlanHatalari>({})
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)

    const bilgiler = { adSoyad, ePosta, telefon, parola, hesapTipi, kvkkOnayi }
    const hatalar = kayitBilgileriniDogrula(bilgiler)
    setAlanHatalari(hatalar)
    if (Object.keys(hatalar).length > 0) {
      setHata('Formda düzeltilmesi gereken alanlar var.')
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.kayitYap(bilgiler)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      if (sonuc.kod === 'hesap-zaten-var') {
        // `/kayit/hesap-var` rotası henüz yok (Task 5); `to` ile literal tip
        // kontrolü bu yüzden derlemeyi kırar. Aynı problem daha önce
        // useKorumaliRota'da çıktı ve tip susturma kullanılmadan `href`'e
        // geçilerek çözüldü (bkz. commit b5507d0) — burada da aynı desen
        // uygulanıyor. Hedef sayfa `donus`'u tüketmiyor (rotası
        // validateSearch tanımlamıyor), bu yüzden taşınmıyor.
        navigate({ href: '/kayit/hesap-var' })
        return
      }
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    if (sonuc.veri.hesapTipi === 'kurumsal') {
      // `/kayit/kurumsal` rotası henüz yok (Task 4) — yukarıdaki notla aynı
      // gerekçeyle `href` kullanılıyor.
      navigate({ href: '/kayit/kurumsal' })
      return
    }
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  return (
    <AuthFormPage
      baslik="Hesap oluşturun"
      aciklama="İlanlarınızı yönetmek, favori ve arama alarmlarınıza ulaşmak için hesap açın."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Hesap oluştur"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[{ etiket: 'Zaten hesabınız var mı? Giriş yapın', hedef: '/giris' }]}
    >
      <fieldset className={styles.tipSecimi}>
        <legend className={alanStilleri.label}>Hesap tipi</legend>

        <label className={styles.tipSecenek}>
          <input
            type="radio"
            name="hesap-tipi"
            value="bireysel"
            checked={hesapTipi === 'bireysel'}
            onChange={() => setHesapTipi('bireysel')}
          />
          <span className={styles.tipMetin}>
            <span className={styles.tipBaslik}>Bireysel</span>
            <span className={styles.tipAciklama}>Kendi mülkünüzü satmak veya kiralamak için.</span>
          </span>
        </label>

        <label className={styles.tipSecenek}>
          <input
            type="radio"
            name="hesap-tipi"
            value="kurumsal"
            checked={hesapTipi === 'kurumsal'}
            onChange={() => setHesapTipi('kurumsal')}
          />
          <span className={styles.tipMetin}>
            <span className={styles.tipBaslik}>Emlak ofisi</span>
            <span className={styles.tipAciklama}>
              Yetki belgeniz ve EİDS doğrulamanızla ilan yayınlamak için.
            </span>
          </span>
        </label>
      </fieldset>

      <div className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor="kayit-ad">
          Ad soyad
        </label>
        <input
          id="kayit-ad"
          className={alanStilleri.input}
          type="text"
          autoComplete="name"
          value={adSoyad}
          onChange={(event) => setAdSoyad(event.target.value)}
        />
        {alanHatalari.adSoyad ? <p className={styles.alanHatasi}>{alanHatalari.adSoyad}</p> : null}
      </div>

      <div className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor="kayit-eposta">
          E-posta
        </label>
        <input
          id="kayit-eposta"
          className={alanStilleri.input}
          type="email"
          autoComplete="email"
          value={ePosta}
          onChange={(event) => setEPosta(event.target.value)}
        />
        {alanHatalari.ePosta ? <p className={styles.alanHatasi}>{alanHatalari.ePosta}</p> : null}
      </div>

      <div className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor="kayit-telefon">
          Telefon
        </label>
        <input
          id="kayit-telefon"
          className={alanStilleri.input}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="5XX XXX XX XX"
          value={telefon}
          onChange={(event) => setTelefon(event.target.value)}
        />
        {alanHatalari.telefon ? <p className={styles.alanHatasi}>{alanHatalari.telefon}</p> : null}
      </div>

      <div className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor="kayit-parola">
          Parola
        </label>
        <input
          id="kayit-parola"
          className={alanStilleri.input}
          type="password"
          autoComplete="new-password"
          value={parola}
          onChange={(event) => setParola(event.target.value)}
        />
        <p className={alanStilleri.hint}>En az 8 karakter, bir büyük harf ve bir rakam.</p>
        {alanHatalari.parola ? <p className={styles.alanHatasi}>{alanHatalari.parola}</p> : null}
      </div>

      <div>
        <label className={styles.onayRow}>
          <input
            type="checkbox"
            checked={kvkkOnayi}
            onChange={(event) => setKvkkOnayi(event.target.checked)}
          />
          <span>Aydınlatma metnini ve kullanım koşullarını okudum, onaylıyorum.</span>
        </label>
        {alanHatalari.kvkkOnayi ? (
          <p className={styles.alanHatasi}>{alanHatalari.kvkkOnayi}</p>
        ) : null}
      </div>
    </AuthFormPage>
  )
}
