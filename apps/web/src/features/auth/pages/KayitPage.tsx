import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import { kayitBilgileriniDogrula } from '../domain/kayit-dogrulama'
import { alanHataId, ilkHataliAlanaOdaklan, type OdakAlani } from '../domain/form-erisilebilirlik'
import type { HesapTipi, KayitAlanHatalari } from '../domain/auth-types'
import alanStilleri from './GirisPage.module.css'
import styles from './KayitPage.module.css'

/** Görsel alan sırası — başarısız gönderimde ilk hataya bu sırayla odaklanılır. */
const ALAN_SIRASI: readonly OdakAlani[] = [
  { ad: 'adSoyad', id: 'kayit-ad' },
  { ad: 'ePosta', id: 'kayit-eposta' },
  { ad: 'telefon', id: 'kayit-telefon' },
  { ad: 'parola', id: 'kayit-parola' },
  { ad: 'kvkkOnayi', id: 'kayit-kvkk' },
]

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
      ilkHataliAlanaOdaklan(ALAN_SIRASI, hatalar)
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.kayitYap(bilgiler)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      if (sonuc.kod === 'hesap-zaten-var') {
        // `/kayit/hesap-var` rotası artık var (Task 5) ve `donus`'u
        // tüketiyor (validateSearch) — bu yüzden `href` yerine tip-güvenli
        // `to`/`search` kullanılabiliyor. Var olan `donus`'u olduğu gibi
        // taşıyoruz (yeniden inşa etmiyoruz, yalnız aynen aktarıyoruz);
        // sanitizasyon zaten kullanıcı durum sayfasından "Giriş yapın"a
        // tıklayıp gerçek hedefe geçerken bir kez uygulanacak (bkz.
        // `AuthStatusPage`'in search passthrough'u).
        navigate({ to: '/kayit/hesap-var', search: { donus } })
        return
      }
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    if (sonuc.veri.hesapTipi === 'kurumsal') {
      // Bu dal `donus`'u taşımaz — kurumsal başvuru kendi akışını sürdürür,
      // orijinal dönüş hedefine (`/hesabim` vb.) geri dönmez. `/kayit/kurumsal`
      // artık `validateSearch` taşıdığından (Finding 5) `search` açıkça
      // `undefined` verilir — elle taşımamak kasıtlıdır, unutulmuş değil.
      navigate({ to: '/kayit/kurumsal', search: { donus: undefined } })
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
          aria-invalid={alanHatalari.adSoyad ? true : undefined}
          aria-describedby={alanHatalari.adSoyad ? alanHataId('kayit-ad') : undefined}
        />
        {alanHatalari.adSoyad ? (
          <p id={alanHataId('kayit-ad')} className={styles.alanHatasi}>
            {alanHatalari.adSoyad}
          </p>
        ) : null}
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
          aria-invalid={alanHatalari.ePosta ? true : undefined}
          aria-describedby={alanHatalari.ePosta ? alanHataId('kayit-eposta') : undefined}
        />
        {alanHatalari.ePosta ? (
          <p id={alanHataId('kayit-eposta')} className={styles.alanHatasi}>
            {alanHatalari.ePosta}
          </p>
        ) : null}
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
          aria-invalid={alanHatalari.telefon ? true : undefined}
          aria-describedby={alanHatalari.telefon ? alanHataId('kayit-telefon') : undefined}
        />
        {alanHatalari.telefon ? (
          <p id={alanHataId('kayit-telefon')} className={styles.alanHatasi}>
            {alanHatalari.telefon}
          </p>
        ) : null}
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
          aria-invalid={alanHatalari.parola ? true : undefined}
          aria-describedby={alanHatalari.parola ? alanHataId('kayit-parola') : undefined}
        />
        <p className={alanStilleri.hint}>En az 8 karakter, bir büyük harf ve bir rakam.</p>
        {alanHatalari.parola ? (
          <p id={alanHataId('kayit-parola')} className={styles.alanHatasi}>
            {alanHatalari.parola}
          </p>
        ) : null}
      </div>

      <div>
        <label className={styles.onayRow} htmlFor="kayit-kvkk">
          <input
            id="kayit-kvkk"
            type="checkbox"
            checked={kvkkOnayi}
            onChange={(event) => setKvkkOnayi(event.target.checked)}
            aria-invalid={alanHatalari.kvkkOnayi ? true : undefined}
            aria-describedby={alanHatalari.kvkkOnayi ? alanHataId('kayit-kvkk') : undefined}
          />
          <span>Aydınlatma metnini ve kullanım koşullarını okudum, onaylıyorum.</span>
        </label>
        {alanHatalari.kvkkOnayi ? (
          <p id={alanHataId('kayit-kvkk')} className={styles.alanHatasi}>
            {alanHatalari.kvkkOnayi}
          </p>
        ) : null}
      </div>
    </AuthFormPage>
  )
}
