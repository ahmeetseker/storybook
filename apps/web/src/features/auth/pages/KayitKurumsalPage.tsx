import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { KorumaliSayfa } from '../components/KorumaliSayfa'
import { useAuthSession } from '../AuthSessionProvider'
import { kurumsalBasvuruyuDogrula } from '../domain/kayit-dogrulama'
import { alanHataId, ilkHataliAlanaOdaklan } from '../domain/form-erisilebilirlik'
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

/** Alanın DOM id'si — hem input hem hata `<p>`'si bunu paylaşır. */
const alanId = (ad: keyof KurumsalBasvuruBilgileri) => `kurumsal-${ad}`

/** Görsel alan sırası — başarısız gönderimde ilk hataya bu sırayla odaklanılır. */
const ALAN_SIRASI = [...ISLETME_ALANLARI, ...YETKILI_ALANLARI].map((alan) => ({
  ad: alan.ad,
  id: alanId(alan.ad),
}))

/**
 * Emlak ofisi başvurusu. Oturum gerektirir; başarılı gönderimde hesabın
 * EİDS durumu beklemeye çekilir ve kullanıcı doğrulama adımına gider.
 * Koruma (yönlendirme + hidrasyon-güvenli bekleme) `KorumaliSayfa` sağlar.
 */
export function KayitKurumsalPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()

  const [bilgiler, setBilgiler] = useState<KurumsalBasvuruBilgileri>(BOS_BASVURU)
  const [alanHatalari, setAlanHatalari] = useState<KurumsalAlanHatalari>({})
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

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
      ilkHataliAlanaOdaklan(ALAN_SIRASI, hatalar)
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
    // `/hesap/dogrula` artık `validateSearch` taşıdığından (Finding 5)
    // `search` açıkça verilir — bu geçiş zaten `donus` taşımıyordu.
    navigate({ to: '/hesap/dogrula', search: { donus: undefined } })
  }

  const alaniCiz = (alan: AlanTanimi) => {
    const hata = alanHatalari[alan.ad]
    const id = alanId(alan.ad)
    return (
      <div key={alan.ad} className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor={id}>
          {alan.etiket}
        </label>
        <input
          id={id}
          className={alanStilleri.input}
          type={alan.tip ?? 'text'}
          autoComplete={alan.autoComplete}
          value={bilgiler[alan.ad]}
          onChange={(event) => alanDegistir(alan.ad, event.target.value)}
          aria-invalid={hata ? true : undefined}
          aria-describedby={hata ? alanHataId(id) : undefined}
        />
        {alan.ipucu ? <p className={alanStilleri.hint}>{alan.ipucu}</p> : null}
        {hata ? (
          <p id={alanHataId(id)} className={styles.alanHatasi}>
            {hata}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <KorumaliSayfa>
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
    </KorumaliSayfa>
  )
}
