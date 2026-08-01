import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession, useKorumaliRota } from '../AuthSessionProvider'
import { kurumsalBasvuruyuDogrula } from '../domain/kayit-dogrulama'
import type { KurumsalAlanHatalari, KurumsalBasvuruBilgileri } from '../domain/auth-types'
import alanStilleri from './GirisPage.module.css'
import styles from './KayitPage.module.css'

const BOS_BASVURU: KurumsalBasvuruBilgileri = {
  ticaretUnvani: '',
  vergiNumarasi: '',
  vergiDairesi: '',
  il: '',
  ilce: '',
  yetkiBelgesiNo: '',
  yetkiliAdSoyad: '',
  yetkiliEPosta: '',
  yetkiliTelefon: '',
}

interface AlanTanimi {
  ad: keyof KurumsalBasvuruBilgileri
  etiket: string
  tip?: string
  autoComplete?: string
  ipucu?: string
}

const ISLETME_ALANLARI: readonly AlanTanimi[] = [
  {
    ad: 'ticaretUnvani',
    etiket: 'Ticaret ünvanı',
    autoComplete: 'organization',
    ipucu: 'Vergi levhasındaki şekliyle.',
  },
  { ad: 'vergiNumarasi', etiket: 'Vergi numarası', autoComplete: 'off' },
  { ad: 'vergiDairesi', etiket: 'Vergi dairesi', autoComplete: 'off' },
  { ad: 'il', etiket: 'İl', autoComplete: 'address-level1' },
  { ad: 'ilce', etiket: 'İlçe', autoComplete: 'address-level2' },
  {
    ad: 'yetkiBelgesiNo',
    etiket: 'Yetki belgesi numarası',
    autoComplete: 'off',
    ipucu: 'Taşınmaz ticareti yetki belgesi.',
  },
]

const YETKILI_ALANLARI: readonly AlanTanimi[] = [
  { ad: 'yetkiliAdSoyad', etiket: 'Yetkili ad soyad', autoComplete: 'name' },
  { ad: 'yetkiliEPosta', etiket: 'Yetkili e-posta', tip: 'email', autoComplete: 'email' },
  { ad: 'yetkiliTelefon', etiket: 'Yetkili telefon', tip: 'tel', autoComplete: 'tel' },
]

/**
 * Emlak ofisi başvurusu. Oturum gerektirir; başarılı gönderimde hesabın
 * EİDS durumu beklemeye çekilir ve kullanıcı doğrulama adımına gider.
 */
export function KayitKurumsalPage() {
  useKorumaliRota()
  const { adapters, oturumuTazele, girisYapildi } = useAuthSession()
  const navigate = useNavigate()

  const [bilgiler, setBilgiler] = useState<KurumsalBasvuruBilgileri>(BOS_BASVURU)
  const [alanHatalari, setAlanHatalari] = useState<KurumsalAlanHatalari>({})
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  if (!girisYapildi) return null

  const alanDegistir = (ad: keyof KurumsalBasvuruBilgileri, deger: string) => {
    setBilgiler((onceki) => ({ ...onceki, [ad]: deger }))
  }

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)

    const hatalar = kurumsalBasvuruyuDogrula(bilgiler)
    setAlanHatalari(hatalar)
    if (Object.keys(hatalar).length > 0) {
      setHata('Formda düzeltilmesi gereken alanlar var.')
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.kurumsalBasvuruGonder(bilgiler)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    navigate({ to: '/hesap/dogrula' })
  }

  const alaniCiz = (alan: AlanTanimi) => (
    <div key={alan.ad} className={alanStilleri.field}>
      <label className={alanStilleri.label} htmlFor={`kurumsal-${alan.ad}`}>
        {alan.etiket}
      </label>
      <input
        id={`kurumsal-${alan.ad}`}
        className={alanStilleri.input}
        type={alan.tip ?? 'text'}
        autoComplete={alan.autoComplete}
        value={bilgiler[alan.ad]}
        onChange={(event) => alanDegistir(alan.ad, event.target.value)}
      />
      {alan.ipucu ? <p className={alanStilleri.hint}>{alan.ipucu}</p> : null}
      {alanHatalari[alan.ad] ? (
        <p className={styles.alanHatasi}>{alanHatalari[alan.ad]}</p>
      ) : null}
    </div>
  )

  return (
    <AuthFormPage
      baslik="Emlak ofisi başvurusu"
      aciklama="İlan yayınlayabilmek için işletme bilgilerinizi ve yetki belgenizi iletin."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Başvuruyu gönder"
      gonderiliyor={gonderiliyor}
    >
      <h2 className={styles.grupBasligi}>İşletme bilgileri</h2>
      {ISLETME_ALANLARI.map(alaniCiz)}

      <h2 className={styles.grupBasligi}>Yetkili kişi</h2>
      {YETKILI_ALANLARI.map(alaniCiz)}
    </AuthFormPage>
  )
}
