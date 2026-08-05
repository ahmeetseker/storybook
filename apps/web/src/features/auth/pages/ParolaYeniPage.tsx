import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { ParolaGucu } from '../components/ParolaGucu'
import { useAuthSession } from '../AuthSessionProvider'
import { alanHataId, ilkHataliAlanaOdaklan } from '../domain/form-erisilebilirlik'
import { parolaHatasi } from '../domain/kayit-dogrulama'
import styles from './GirisPage.module.css'

const PAROLA_ID = 'parola-yeni'
const TEKRAR_ID = 'parola-yeni-tekrar'

/** Odak sırası GÖRSEL sırayı yansıtır (bkz. `form-erisilebilirlik.ts`). */
const ALAN_SIRASI = [
  { ad: 'parola', id: PAROLA_ID },
  { ad: 'tekrar', id: TEKRAR_ID },
] as const

/** `type` olmalı — bkz. `GirisParolaPage`: örtük indeks imzası. */
type Hatalar = {
  parola?: string
  tekrar?: string
}

/**
 * Yeni parolayı belirleme ekranı. Token arama parametresinden gelir.
 *
 * Token YOLDA değil sorguda taşınır (`?token=`): `/parola-sifirla/tamam` ve
 * `/parola-sifirla/gecersiz` kardeş statik rotalar olduğu için dinamik bir
 * `$token` segmenti onlarla aynı ad alanını paylaşırdı.
 *
 * Token'ın kendi geçerliliği SUNUCUDA denetlenir; buradaki tek kontrol
 * varlığıdır (rota `beforeLoad`'unda). Geçersiz/süresi dolmuş token
 * gönderimde anlaşılır ve kullanıcı `/parola-sifirla/gecersiz`'e taşınır.
 */
export function ParolaYeniPage() {
  const { adapters } = useAuthSession()
  const navigate = useNavigate()
  const { token } = useSearch({ strict: false }) as { token?: string }
  const [parola, setParola] = useState('')
  const [tekrar, setTekrar] = useState('')
  const [alanHatalari, setAlanHatalari] = useState<Hatalar>({})
  const [hata, setHata] = useState<string | undefined>()
  const [hataAnahtari, setHataAnahtari] = useState(0)
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setHataAnahtari((onceki) => onceki + 1)

    const hatalar: Hatalar = {}
    const parolaSorunu = parolaHatasi(parola)
    if (parolaSorunu) hatalar.parola = parolaSorunu
    else if (tekrar !== parola) hatalar.tekrar = 'Parolalar aynı değil.'

    setAlanHatalari(hatalar)
    if (Object.keys(hatalar).length > 0) {
      setHata('Formda düzeltilmesi gereken alanlar var.')
      ilkHataliAlanaOdaklan(ALAN_SIRASI, hatalar)
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.parolaSifirla(token ?? '', parola)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      // Token sorunları form içinde düzeltilemez — kullanıcı burada takılı
      // kalmamalı, yeni bağlantı isteyebileceği sayfaya taşınmalı.
      if (sonuc.kod === 'gecersiz-token' || sonuc.kod === 'token-suresi-doldu') {
        navigate({ to: '/parola-sifirla/gecersiz', replace: true })
        return
      }
      setHata(sonuc.mesaj)
      return
    }

    navigate({ to: '/parola-sifirla/tamam', replace: true })
  }

  return (
    <AuthFormPage
      baslik="Yeni parolanızı belirleyin"
      aciklama="Bu bağlantı tek kullanımlıktır; parolanızı belirledikten sonra geçersiz olur."
      hata={hata}
      hataAnahtari={hataAnahtari}
      onSubmit={gonder}
      gonderEtiketi="Parolayı kaydet"
      gonderiliyor={gonderiliyor}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor={PAROLA_ID}>
          Yeni parola
        </label>
        <input
          id={PAROLA_ID}
          className={styles.input}
          type="password"
          autoComplete="new-password"
          value={parola}
          aria-invalid={alanHatalari.parola ? true : undefined}
          aria-describedby={alanHatalari.parola ? alanHataId(PAROLA_ID) : undefined}
          onChange={(event) => setParola(event.target.value)}
        />
        {/* Sabit ipucu metninin yerini canlı gösterge aldı — kural listesi
            aynı bilgiyi taşır ve karşılanma durumunu da gösterir. Hata
            metni ayrı kalır: `aria-describedby` tek id'ye çözülmelidir. */}
        <ParolaGucu parola={parola} />
        {alanHatalari.parola ? (
          <p id={alanHataId(PAROLA_ID)} className={styles.alanHatasi}>
            {alanHatalari.parola}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={TEKRAR_ID}>
          Yeni parola (tekrar)
        </label>
        <input
          id={TEKRAR_ID}
          className={styles.input}
          type="password"
          autoComplete="new-password"
          value={tekrar}
          aria-invalid={alanHatalari.tekrar ? true : undefined}
          aria-describedby={alanHatalari.tekrar ? alanHataId(TEKRAR_ID) : undefined}
          onChange={(event) => setTekrar(event.target.value)}
        />
        {alanHatalari.tekrar ? (
          <p id={alanHataId(TEKRAR_ID)} className={styles.alanHatasi}>
            {alanHatalari.tekrar}
          </p>
        ) : null}
      </div>
    </AuthFormPage>
  )
}
