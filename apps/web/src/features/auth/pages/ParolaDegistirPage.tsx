import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { KorumaliSayfa } from '../components/KorumaliSayfa'
import { ParolaGucu } from '../components/ParolaGucu'
import { useAuthSession } from '../AuthSessionProvider'
import { alanHataId, ilkHataliAlanaOdaklan } from '../domain/form-erisilebilirlik'
import { parolaHatasi } from '../domain/kayit-dogrulama'
import styles from './GirisPage.module.css'

const MEVCUT_ID = 'parola-degistir-mevcut'
const YENI_ID = 'parola-degistir-yeni'
const TEKRAR_ID = 'parola-degistir-tekrar'

/** Odak sırası GÖRSEL sırayı yansıtır (bkz. `form-erisilebilirlik.ts`). */
const ALAN_SIRASI = [
  { ad: 'mevcut', id: MEVCUT_ID },
  { ad: 'yeni', id: YENI_ID },
  { ad: 'tekrar', id: TEKRAR_ID },
] as const

/** `type` olmalı — örtük indeks imzası (bkz. `GirisParolaPage`). */
type Hatalar = {
  mevcut?: string
  yeni?: string
  tekrar?: string
}

/**
 * Oturum açıkken parola değiştirme.
 *
 * Parola sıfırlamadan farkı MEVCUT parolanın istenmesi: oturumu ele geçiren
 * birinin parolayı sessizce değiştirip kalıcı erişim kurmasını engeller.
 */
export function ParolaDegistirPage() {
  return (
    <KorumaliSayfa>
      <ParolaDegistirFormu />
    </KorumaliSayfa>
  )
}

function ParolaDegistirFormu() {
  const { adapters } = useAuthSession()
  const navigate = useNavigate()
  const [mevcut, setMevcut] = useState('')
  const [yeni, setYeni] = useState('')
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
    if (mevcut.length === 0) hatalar.mevcut = 'Mevcut parolanızı girin.'
    const yeniSorunu = parolaHatasi(yeni)
    if (yeniSorunu) hatalar.yeni = yeniSorunu
    else if (tekrar !== yeni) hatalar.tekrar = 'Parolalar aynı değil.'

    setAlanHatalari(hatalar)
    if (Object.keys(hatalar).length > 0) {
      setHata('Formda düzeltilmesi gereken alanlar var.')
      ilkHataliAlanaOdaklan(ALAN_SIRASI, hatalar)
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.parolaDegistir(mevcut, yeni)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      // Yanlış mevcut parola ALAN seviyesinde işaretlenir; kullanıcı hangi
      // alanı düzelteceğini sayfa özetinden çıkarmak zorunda kalmasın.
      if (sonuc.kod === 'parola-yanlis') {
        setAlanHatalari({ mevcut: sonuc.mesaj })
        document.getElementById(MEVCUT_ID)?.focus()
      }
      return
    }

    navigate({ to: '/hesabim/guvenlik', replace: true })
  }

  const alan = (
    id: string,
    etiket: string,
    deger: string,
    ayarla: (yeniDeger: string) => void,
    hataMetni: string | undefined,
    autoComplete: string,
    /**
     * Güç göstergesi yalnız YENİ parolada anlamlıdır: mevcut parola
     * değerlendirilmez (kullanıcı onu değiştiremez) ve tekrar alanında
     * ikinci bir ölçek aynı bilgiyi tekrar eder.
     */
    gucGoster = false,
  ) => (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {etiket}
      </label>
      <input
        id={id}
        className={styles.input}
        type="password"
        autoComplete={autoComplete}
        value={deger}
        aria-invalid={hataMetni ? true : undefined}
        aria-describedby={hataMetni ? alanHataId(id) : undefined}
        onChange={(event) => ayarla(event.target.value)}
      />
      {gucGoster ? <ParolaGucu parola={deger} /> : null}
      {hataMetni ? (
        <p id={alanHataId(id)} className={styles.alanHatasi}>
          {hataMetni}
        </p>
      ) : null}
    </div>
  )

  return (
    <AuthFormPage
      baslik="Parolanızı değiştirin"
      aciklama="Güvenliğiniz için mevcut parolanızı da girmeniz gerekir."
      hata={hata}
      hataAnahtari={hataAnahtari}
      onSubmit={gonder}
      gonderEtiketi="Parolayı değiştir"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[{ etiket: 'Güvenlik ayarlarına dön', hedef: '/hesabim/guvenlik' }]}
    >
      {alan(MEVCUT_ID, 'Mevcut parola', mevcut, setMevcut, alanHatalari.mevcut, 'current-password')}
      {alan(YENI_ID, 'Yeni parola', yeni, setYeni, alanHatalari.yeni, 'new-password', true)}
      {alan(
        TEKRAR_ID,
        'Yeni parola (tekrar)',
        tekrar,
        setTekrar,
        alanHatalari.tekrar,
        'new-password',
      )}
    </AuthFormPage>
  )
}
