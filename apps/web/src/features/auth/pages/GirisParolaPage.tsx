import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import { alanHataId, ilkHataliAlanaOdaklan } from '../domain/form-erisilebilirlik'
import { ePostaHatasi } from '../domain/kayit-dogrulama'
import styles from './GirisPage.module.css'

const EPOSTA_ID = 'giris-eposta'
const PAROLA_ID = 'giris-parola'

/** Odak sırası GÖRSEL sırayı yansıtır (bkz. `form-erisilebilirlik.ts`). */
const ALAN_SIRASI = [
  { ad: 'ePosta', id: EPOSTA_ID },
  { ad: 'parola', id: PAROLA_ID },
] as const

/**
 * `type` (interface DEĞİL) olması gerekiyor: `ilkHataliAlanaOdaklan`
 * `Record<string, string | undefined>` bekliyor ve TypeScript örtük indeks
 * imzasını yalnız tip takma adlarına verir, interface'lere vermez.
 */
type Hatalar = {
  ePosta?: string
  parola?: string
}

export function GirisParolaPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [ePosta, setEPosta] = useState('')
  const [parola, setParola] = useState('')
  const [alanHatalari, setAlanHatalari] = useState<Hatalar>({})
  const [hata, setHata] = useState<string | undefined>()
  const [hataAnahtari, setHataAnahtari] = useState(0)
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setHataAnahtari((onceki) => onceki + 1)

    // Yalnız BİÇİM denetlenir. Parolanın doğruluğu sunucunun işi ve buradaki
    // kural kayıt formundaki parola kuralıyla KASITLI olarak aynı değil:
    // eski parolalar bugünkü kuralı sağlamayabilir, girişte reddedilmemeli.
    const hatalar: Hatalar = {}
    const ePostaSorunu = ePostaHatasi(ePosta)
    if (ePostaSorunu) hatalar.ePosta = ePostaSorunu
    if (parola.length === 0) hatalar.parola = 'Parolanızı girin.'

    setAlanHatalari(hatalar)
    if (Object.keys(hatalar).length > 0) {
      setHata('Formda düzeltilmesi gereken alanlar var.')
      ilkHataliAlanaOdaklan(ALAN_SIRASI, hatalar)
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.parolaIleGiris(ePosta, parola)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      if (sonuc.kod === 'hesap-askida') {
        navigate({ to: '/hesap/askida', replace: true })
        return
      }
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
      hataAnahtari={hataAnahtari}
      onSubmit={gonder}
      gonderEtiketi="Giriş yap"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[
        { etiket: 'Parolanızı mı unuttunuz?', hedef: '/parola-sifirla' },
        { etiket: 'Telefonla giriş yapın', hedef: '/giris' },
      ]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor={EPOSTA_ID}>
          E-posta
        </label>
        <input
          id={EPOSTA_ID}
          className={styles.input}
          type="email"
          autoComplete="email"
          value={ePosta}
          aria-invalid={alanHatalari.ePosta ? true : undefined}
          aria-describedby={alanHatalari.ePosta ? alanHataId(EPOSTA_ID) : undefined}
          onChange={(event) => setEPosta(event.target.value)}
        />
        {alanHatalari.ePosta ? (
          <p id={alanHataId(EPOSTA_ID)} className={styles.alanHatasi}>
            {alanHatalari.ePosta}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={PAROLA_ID}>
          Parola
        </label>
        <input
          id={PAROLA_ID}
          className={styles.input}
          type="password"
          autoComplete="current-password"
          value={parola}
          aria-invalid={alanHatalari.parola ? true : undefined}
          aria-describedby={alanHatalari.parola ? alanHataId(PAROLA_ID) : undefined}
          onChange={(event) => setParola(event.target.value)}
        />
        {alanHatalari.parola ? (
          <p id={alanHataId(PAROLA_ID)} className={styles.alanHatasi}>
            {alanHatalari.parola}
          </p>
        ) : null}
      </div>
    </AuthFormPage>
  )
}
