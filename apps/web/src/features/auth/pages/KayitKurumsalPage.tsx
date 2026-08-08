import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { GlassButton, GlassCheckbox, GlassPricingTable } from '@repo/ui'
import {
  OFFICE_PLANS,
  officePlanById,
  toPricingPlans,
  type OfficePlanId,
} from '@/features/pricing/data/office-plans'
import { AuthFormPage } from '../components/AuthFormPage'
import { KayitAdimSayaci, KayitAdimSeridi } from '../components/KayitAdimSeridi'
import { KorumaliSayfa } from '../components/KorumaliSayfa'
import { useAuthSession } from '../AuthSessionProvider'
import { kurumsalBasvuruyuDogrula, tuzelKisiMi } from '../domain/kayit-dogrulama'
import { kayitSeridi } from '../domain/kayit-adimlari'
import {
  KURUMSAL_ADIMLARI,
  KURUMSAL_ALAN_SIRASI,
  kurumsalAdimHatalari,
  kurumsalAlanId,
  kurumsalHataliAdimIndeksi,
} from '../domain/kurumsal-adimlari'
import { ILLER } from '../domain/iller'
import { alanHataId, ilkHataliAlanaOdaklan } from '../domain/form-erisilebilirlik'
import type {
  IsletmeTuru,
  KurumsalAlanHatalari,
  KurumsalBasvuruBilgileri,
} from '../domain/auth-types'
import alanStilleri from './GirisPage.module.css'
import styles from './KayitPage.module.css'

/**
 * Kurumsal dalın DIŞ şeridi: dört kayıt adımı + ofis bilgileri + EİDS.
 * Bu sayfa o şeridin beşinci adımıdır; altıncı adım `/hesap/dogrula`.
 *
 * Sayfanın KENDİ dört bölümü ayrı bir şeritte gösterilir — ikisi farklı
 * şeyleri ölçtüğü için sayaçlar da farklı adlandırılır ("Adım 5 / 6" vs
 * "Bölüm 2 / 4"), yoksa kullanıcı iki numaralandırma arasında kaybolur.
 */
const SERIT = kayitSeridi('kurumsal')
const AKTIF_INDEKS = SERIT.length - 2
const SON_BOLUM = KURUMSAL_ADIMLARI.length - 1

const BOLUM_SERIDI = KURUMSAL_ADIMLARI.map(({ anahtar, baslik, kisaEtiket }) => ({
  anahtar,
  baslik,
  kisaEtiket,
}))

/**
 * Paket bölümünün tablosu — modül seviyesinde kurulur.
 *
 * Eylem etiketleri burada işlevsizdir: seçim satırın kendisiyle yapılır,
 * alttaki buton yalnız seçili paketi tekrarlar. Formun ilerlemesi "Devam et"
 * ile olur, tablodan değil — iki ayrı ilerletme düğmesi olsaydı hangisinin
 * başvuruyu taşıdığı belirsizleşirdi.
 */
const PAKET_TABLOSU = toPricingPlans({ actionLabel: 'Seçili' })

/** Varsayılan paket: vurgulanan plan, yoksa listenin ilki. */
const VARSAYILAN_PAKET: OfficePlanId =
  (OFFICE_PLANS.find((plan) => plan.prominent) ?? OFFICE_PLANS[0]).id

/** `/paketler` sayfasından gelen `?paket=` değeri — tanınmıyorsa yok sayılır. */
function paketKimligiCoz(ham: unknown): OfficePlanId {
  return OFFICE_PLANS.some((plan) => plan.id === ham) ? (ham as OfficePlanId) : VARSAYILAN_PAKET
}

const BOS_BASVURU: KurumsalBasvuruBilgileri = {
  isletmeTuru: 'sahis',
  ticaretUnvani: '',
  vergiNumarasi: '',
  vergiDairesi: '',
  mersisNo: '',
  ticaretSicilNo: '',
  yetkiBelgesiNo: '',
  yetkiBelgesiBitis: '',
  sorumluDanismanAdSoyad: '',
  sorumluDanismanTckn: '',
  mykBelgeNo: '',
  mykBelgeBitis: '',
  il: '',
  ilce: '',
  acikAdres: '',
  postaKodu: '',
  ofisTelefonu: '',
  kepAdresi: '',
  webSitesi: '',
  yetkiliAdSoyad: '',
  yetkiliEPosta: '',
  yetkiliTelefon: '',
  paketId: VARSAYILAN_PAKET,
  paketKoltuk: officePlanById(VARSAYILAN_PAKET).seats.included,
  kvkkOnayi: false,
  temsilBeyani: false,
  iysOnayi: false,
}

/**
 * Yalnız METİN taşıyan alan adları — onay kutuları (boolean) metin girdisi
 * üreten yardımcıların dışında kalmalı, aksi halde `value` olarak bir
 * boolean geçilirdi.
 */
type MetinAlanAdi = {
  [K in keyof KurumsalBasvuruBilgileri]: KurumsalBasvuruBilgileri[K] extends string ? K : never
}[keyof KurumsalBasvuruBilgileri]

type OnayAlanAdi = {
  [K in keyof KurumsalBasvuruBilgileri]: KurumsalBasvuruBilgileri[K] extends boolean ? K : never
}[keyof KurumsalBasvuruBilgileri]

interface AlanTanimi {
  ad: MetinAlanAdi
  etiket: string
  tip?: string
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'tel'
  ipucu?: string
  /** Uzun serbest metin — `<textarea>` olarak çizilir. */
  cokSatirli?: boolean
}

const ISLETME_TURLERI: readonly { deger: IsletmeTuru; baslik: string; aciklama: string }[] = [
  {
    deger: 'sahis',
    baslik: 'Şahıs işletmesi',
    aciklama: 'Vergi levhası kendi adınıza; MERSİS ve ticaret sicil kaydı olmayabilir.',
  },
  { deger: 'limited', baslik: 'Limited şirket', aciklama: 'Ltd. Şti. olarak kayıtlı tüzel kişi.' },
  { deger: 'anonim', baslik: 'Anonim şirket', aciklama: 'A.Ş. olarak kayıtlı tüzel kişi.' },
  {
    deger: 'sube',
    baslik: 'Şube',
    aciklama: 'Merkezi başka bir ilde olan işletmenin bu ildeki şubesi.',
  },
]

/**
 * Alan tanımları işletme türüne göre üretilir: zorunluluk türe bağlı olan
 * alanların İPUCU metni de türe göre değişmeli, yoksa şahıs işletmesi
 * doldurması gerekmeyen bir alanı zorunlu sanır.
 */
function isletmeAlanlari(tur: IsletmeTuru): readonly AlanTanimi[] {
  const tuzel = tuzelKisiMi(tur)
  return [
    {
      ad: 'ticaretUnvani',
      etiket: 'Ticaret ünvanı',
      autoComplete: 'organization',
      ipucu: 'Yetki belgesindeki şekliyle — ilanlarınızda bu unvan gösterilir.',
    },
    {
      ad: 'vergiNumarasi',
      etiket: 'Vergi kimlik no / TCKN',
      autoComplete: 'off',
      inputMode: 'numeric',
      ipucu: tuzel
        ? '10 haneli vergi kimlik numarası.'
        : 'Vergi levhanızda hangisi yazıyorsa: 10 haneli vergi kimlik no veya 11 haneli TCKN.',
    },
    { ad: 'vergiDairesi', etiket: 'Vergi dairesi', autoComplete: 'off' },
    {
      ad: 'mersisNo',
      etiket: 'MERSİS numarası',
      autoComplete: 'off',
      inputMode: 'numeric',
      ipucu: tuzel ? '16 hane.' : 'İsteğe bağlı — kaydınız varsa 16 haneli numarayı girin.',
    },
    {
      ad: 'ticaretSicilNo',
      etiket: 'Ticaret sicil numarası',
      autoComplete: 'off',
      ipucu: tuzel ? undefined : 'İsteğe bağlı — şahıs işletmesinde sicil kaydı olmayabilir.',
    },
  ]
}

const YETKI_ALANLARI: readonly AlanTanimi[] = [
  {
    ad: 'yetkiBelgesiNo',
    etiket: 'Yetki belgesi numarası',
    autoComplete: 'off',
    ipucu: 'Ticaret İl Müdürlüğünden aldığınız taşınmaz ticareti yetki belgesi.',
  },
  {
    ad: 'yetkiBelgesiBitis',
    etiket: 'Yetki belgesi geçerlilik bitişi',
    tip: 'date',
    ipucu: 'Belge süresi dolduğunda ilan yayınlama yetkiniz askıya alınır.',
  },
  {
    ad: 'sorumluDanismanAdSoyad',
    etiket: 'Sorumlu emlak danışmanı',
    autoComplete: 'off',
    ipucu: 'Yetki belgesinde sorumlu danışman olarak görünen kişi.',
  },
  {
    ad: 'sorumluDanismanTckn',
    etiket: 'Sorumlu danışman T.C. kimlik no',
    autoComplete: 'off',
    inputMode: 'numeric',
  },
  {
    ad: 'mykBelgeNo',
    etiket: 'MYK Seviye 5 belge numarası',
    autoComplete: 'off',
    ipucu: 'Yetki belgesi ancak Seviye 5 belgeli bir sorumlu danışman varsa düzenlenir.',
  },
  { ad: 'mykBelgeBitis', etiket: 'MYK belgesi geçerlilik bitişi', tip: 'date' },
]

function ofisAlanlari(tur: IsletmeTuru): readonly AlanTanimi[] {
  return [
    { ad: 'ilce', etiket: 'İlçe', autoComplete: 'address-level2' },
    {
      ad: 'acikAdres',
      etiket: 'Açık adres',
      autoComplete: 'street-address',
      cokSatirli: true,
      ipucu: 'Yetki belgesindeki işyeri adresiyle aynı olmalı.',
    },
    { ad: 'postaKodu', etiket: 'Posta kodu', autoComplete: 'postal-code', inputMode: 'numeric' },
    {
      ad: 'ofisTelefonu',
      etiket: 'Ofis telefonu',
      tip: 'tel',
      autoComplete: 'tel',
      inputMode: 'tel',
      ipucu: 'Sabit veya mobil, başında sıfır olmadan 10 hane.',
    },
    {
      ad: 'kepAdresi',
      etiket: 'KEP adresi',
      tip: 'email',
      autoComplete: 'off',
      ipucu: tuzelKisiMi(tur)
        ? 'Kayıtlı elektronik posta adresi.'
        : 'İsteğe bağlı — kayıtlı elektronik posta adresiniz varsa girin.',
    },
    {
      ad: 'webSitesi',
      etiket: 'Web sitesi',
      tip: 'url',
      autoComplete: 'url',
      ipucu: 'İsteğe bağlı — https:// ile başlamalı.',
    },
    { ad: 'yetkiliAdSoyad', etiket: 'Yetkili ad soyad', autoComplete: 'name' },
    { ad: 'yetkiliEPosta', etiket: 'Yetkili e-posta', tip: 'email', autoComplete: 'email' },
    {
      ad: 'yetkiliTelefon',
      etiket: 'Yetkili telefon',
      tip: 'tel',
      autoComplete: 'tel',
      inputMode: 'tel',
      ipucu: 'Cep telefonu — 5XX XXX XX XX.',
    },
  ]
}

/**
 * Odak isteği. Bölüm değişimi ve doğrulama hatası odağı FARKLI yerlere
 * taşır ama ikisi de ancak yeni bölüm DOM'a yazıldıktan sonra çalışabilir;
 * bu yüzden odak render sırasında değil bir bilet üzerinden effect'te
 * uygulanır (bkz. `KayitPage`, aynı desen).
 */
interface OdakIstegi {
  bilet: number
  hatalar?: KurumsalAlanHatalari
}

/** Bölüm geçişi: yalnız transform + opacity (tasarım sistemi motion kuralı). */
const GECIS = { duration: 0.24, ease: [0.32, 0.72, 0, 1] } as const
const KAYMA = 16

/**
 * Emlak ofisi başvurusu — dört bölümlü akış.
 *
 * Oturum gerektirir; başarılı gönderimde hesabın EİDS durumu beklemeye
 * çekilir ve kullanıcı doğrulama adımına gider. Koruma (yönlendirme +
 * hidrasyon-güvenli bekleme) `KorumaliSayfa` sağlar.
 *
 * Doğrulama tek kaynaktan gelir (`kurumsalBasvuruyuDogrula`); bölüm
 * sözleşmesi yalnız o kaynağın döndürdüğü hataları SÜZER
 * (`domain/kurumsal-adimlari.ts`). Son bölümde tam doğrulama koşar ve bir
 * hata kalmışsa akış o hatanın bölümüne geri taşınır.
 */
export function KayitKurumsalPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const hareketAzalt = useReducedMotion()

  // `/paketler` sayfasından gelen seçim başlangıç değeridir, kilit değil:
  // kullanıcı paket bölümünde fikrini değiştirebilir.
  const arama = useSearch({ strict: false }) as { paket?: unknown }
  const [bilgiler, setBilgiler] = useState<KurumsalBasvuruBilgileri>(() => {
    const paketId = paketKimligiCoz(arama.paket)
    return { ...BOS_BASVURU, paketId, paketKoltuk: officePlanById(paketId).seats.included }
  })
  const [bolumIndeksi, setBolumIndeksi] = useState(0)
  const [yon, setYon] = useState<1 | -1>(1)
  const [alanHatalari, setAlanHatalari] = useState<KurumsalAlanHatalari>({})
  const [hata, setHata] = useState<string | undefined>()
  /** Her gönderim denemesinde artar — aynı hata metni tekrar duyurulsun diye. */
  const [hataAnahtari, setHataAnahtari] = useState(0)
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [odak, setOdak] = useState<OdakIstegi>({ bilet: 0 })

  const baslikRef = useRef<HTMLHeadingElement>(null)

  const bolum = KURUMSAL_ADIMLARI[bolumIndeksi]
  const sonBolumde = bolumIndeksi === SON_BOLUM
  const tuzel = tuzelKisiMi(bilgiler.isletmeTuru)
  const secilenPaket = officePlanById(bilgiler.paketId)

  useEffect(() => {
    // Bilet 0: ilk render. Sayfa açılışında odak çalınmaz.
    if (odak.bilet === 0) return
    if (odak.hatalar) {
      // `alanHatalari` her zaman YALNIZ görünür bölümün hatalarını taşır;
      // bu yüzden tüm alan sırasındaki ilk hata, görünür bölümün ilk hatasıdır.
      ilkHataliAlanaOdaklan(KURUMSAL_ALAN_SIRASI, odak.hatalar)
      return
    }
    baslikRef.current?.focus()
  }, [odak])

  const metinDegistir = (ad: MetinAlanAdi, deger: string) => {
    setBilgiler((onceki) => ({ ...onceki, [ad]: deger }))
  }

  const onayDegistir = (ad: OnayAlanAdi, deger: boolean) => {
    setBilgiler((onceki) => ({ ...onceki, [ad]: deger }))
  }

  const bolumeTasi = (hedef: number) => {
    setYon(hedef < bolumIndeksi ? -1 : 1)
    setBolumIndeksi(hedef)
    setAlanHatalari({})
    setHata(undefined)
    setOdak((onceki) => ({ bilet: onceki.bilet + 1 }))
  }

  /** Doğrulama hatasında: hataları göster, ilgili bölüme taşı, ilk alana odaklan. */
  const hatalariGoster = (
    tumHatalar: KurumsalAlanHatalari,
    hedefIndeks: number,
    ozet: string,
  ) => {
    const gorunur = kurumsalAdimHatalari(tumHatalar, KURUMSAL_ADIMLARI[hedefIndeks])
    if (hedefIndeks !== bolumIndeksi) {
      setYon(hedefIndeks < bolumIndeksi ? -1 : 1)
      setBolumIndeksi(hedefIndeks)
    }
    setAlanHatalari(gorunur)
    setHata(ozet)
    setOdak((onceki) => ({ bilet: onceki.bilet + 1, hatalar: gorunur }))
  }

  const geriGit = () => {
    if (bolumIndeksi === 0) return
    bolumeTasi(bolumIndeksi - 1)
  }

  /**
   * Form gönderimi. Son bölüme kadar "Devam et" görevini görür: yalnız
   * bulunulan bölümün alanları doğrulanır. Son bölümde tam doğrulama koşar
   * ve adapter çağrılır.
   */
  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setHataAnahtari((onceki) => onceki + 1)

    const tumHatalar = kurumsalBasvuruyuDogrula(bilgiler)

    if (!sonBolumde) {
      const buBolum = kurumsalAdimHatalari(tumHatalar, bolum)
      if (Object.keys(buBolum).length > 0) {
        hatalariGoster(tumHatalar, bolumIndeksi, 'Bu bölümde düzeltilmesi gereken alanlar var.')
        return
      }
      bolumeTasi(bolumIndeksi + 1)
      return
    }

    if (Object.keys(tumHatalar).length > 0) {
      // Güvenlik ağı: bölüm bölüm ilerleyen kullanıcı buraya geçerli
      // verilerle gelir, ama tam doğrulama yine de son sözü söyler.
      hatalariGoster(
        tumHatalar,
        Math.max(kurumsalHataliAdimIndeksi(tumHatalar), 0),
        'Formda düzeltilmesi gereken alanlar var.',
      )
      return
    }

    setAlanHatalari({})
    setGonderiliyor(true)
    const sonuc = await adapters.kurumsalBasvuruGonder(bilgiler)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    // `/hesap/dogrula` `validateSearch` taşıdığından `search` açıkça verilir —
    // bu geçiş zaten `donus` taşımıyordu.
    navigate({ to: '/hesap/dogrula', search: { donus: undefined } })
  }

  const alanHatasiNotu = (ad: keyof KurumsalBasvuruBilgileri, id: string): ReactNode =>
    alanHatalari[ad] ? (
      <p id={alanHataId(id)} className={styles.alanHatasi}>
        {alanHatalari[ad]}
      </p>
    ) : null

  const metinAlani = (tanim: AlanTanimi) => {
    const id = kurumsalAlanId(tanim.ad)
    const hataVar = Boolean(alanHatalari[tanim.ad])
    const ortak = {
      id,
      className: alanStilleri.input,
      value: bilgiler[tanim.ad],
      'aria-invalid': hataVar ? (true as const) : undefined,
      'aria-describedby': hataVar ? alanHataId(id) : undefined,
    }
    return (
      <div key={tanim.ad} className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor={id}>
          {tanim.etiket}
        </label>
        {tanim.cokSatirli ? (
          <textarea
            {...ortak}
            className={`${alanStilleri.input} ${alanStilleri.textarea}`}
            rows={3}
            autoComplete={tanim.autoComplete}
            onChange={(event) => metinDegistir(tanim.ad, event.target.value)}
          />
        ) : (
          <input
            {...ortak}
            type={tanim.tip ?? 'text'}
            inputMode={tanim.inputMode}
            autoComplete={tanim.autoComplete}
            onChange={(event) => metinDegistir(tanim.ad, event.target.value)}
          />
        )}
        {tanim.ipucu ? <p className={alanStilleri.hint}>{tanim.ipucu}</p> : null}
        {alanHatasiNotu(tanim.ad, id)}
      </div>
    )
  }

  const onayKutusu = (ad: OnayAlanAdi, metin: ReactNode) => {
    const id = kurumsalAlanId(ad)
    const hataVar = Boolean(alanHatalari[ad])
    return (
      <div>
        <GlassCheckbox
          className={styles.onayRow}
          id={id}
          checked={bilgiler[ad]}
          onChange={(event) => onayDegistir(ad, event.target.checked)}
          aria-invalid={hataVar ? true : undefined}
          aria-describedby={hataVar ? alanHataId(id) : undefined}
          label={metin}
        />
        {alanHatasiNotu(ad, id)}
      </div>
    )
  }

  const isletmeBolumu = () => (
    <>
      <fieldset className={styles.tipSecimi}>
        <legend className={styles.srOnly}>İşletme türünü seçin</legend>
        {ISLETME_TURLERI.map((secenek) => {
          const id = `kurumsal-tur-${secenek.deger}`
          return (
            <label
              key={secenek.deger}
              className={styles.tipSecenek}
              htmlFor={id}
              data-secili={bilgiler.isletmeTuru === secenek.deger || undefined}
            >
              <input
                id={id}
                type="radio"
                name="isletme-turu"
                value={secenek.deger}
                checked={bilgiler.isletmeTuru === secenek.deger}
                onChange={() =>
                  setBilgiler((onceki) => ({ ...onceki, isletmeTuru: secenek.deger }))
                }
              />
              <span className={styles.tipMetin}>
                <span className={styles.tipBaslik}>{secenek.baslik}</span>
                <span className={styles.tipAciklama}>{secenek.aciklama}</span>
              </span>
            </label>
          )
        })}
      </fieldset>
      {isletmeAlanlari(bilgiler.isletmeTuru).map(metinAlani)}
    </>
  )

  const ofisBolumu = () => {
    const ilId = kurumsalAlanId('il')
    const ilHatasi = Boolean(alanHatalari.il)
    return (
      <>
        <div className={alanStilleri.field}>
          <label className={alanStilleri.label} htmlFor={ilId}>
            İl
          </label>
          {/* Serbest metin değil: il değeri ilan aramasının filtresini besler
              ve yazım farkları filtreyi sessizce eksik sonuç döndürtürdü. */}
          <select
            id={ilId}
            className={`${alanStilleri.input} ${alanStilleri.select}`}
            value={bilgiler.il}
            autoComplete="address-level1"
            onChange={(event) => metinDegistir('il', event.target.value)}
            aria-invalid={ilHatasi ? true : undefined}
            aria-describedby={ilHatasi ? alanHataId(ilId) : undefined}
          >
            <option value="">Seçin</option>
            {ILLER.map((il) => (
              <option key={il} value={il}>
                {il}
              </option>
            ))}
          </select>
          {alanHatasiNotu('il', ilId)}
        </div>
        {ofisAlanlari(bilgiler.isletmeTuru).map(metinAlani)}
      </>
    )
  }

  const ozetSatiri = (baslik: string, deger: ReactNode) => (
    <div key={baslik} className={styles.ozetSatir}>
      <dt className={styles.ozetEtiket}>{baslik}</dt>
      <dd className={styles.ozetDeger}>{deger || '—'}</dd>
    </div>
  )

  const ozetGrubu = (hedefIndeks: number, satirlar: ReactNode) => {
    const hedef = KURUMSAL_ADIMLARI[hedefIndeks]
    return (
      <div className={styles.ozetGrup}>
        <div className={styles.ozetBaslikSatiri}>
          <h3 className={styles.ozetBaslik}>{hedef.baslik}</h3>
          <button
            type="button"
            className={styles.ozetDuzenle}
            aria-label={`Düzenle: ${hedef.baslik}`}
            onClick={() => bolumeTasi(hedefIndeks)}
          >
            Düzenle
          </button>
        </div>
        <dl className={styles.ozetListe}>{satirlar}</dl>
      </div>
    )
  }

  const onayBolumu = () => (
    <>
      <div className={styles.ozet}>
        {ozetGrubu(
          0,
          <>
            {ozetSatiri(
              'İşletme türü',
              ISLETME_TURLERI.find((secenek) => secenek.deger === bilgiler.isletmeTuru)?.baslik,
            )}
            {ozetSatiri('Ticaret ünvanı', bilgiler.ticaretUnvani)}
            {ozetSatiri('Vergi kimlik no / TCKN', bilgiler.vergiNumarasi)}
            {ozetSatiri('Vergi dairesi', bilgiler.vergiDairesi)}
            {tuzel ? ozetSatiri('MERSİS numarası', bilgiler.mersisNo) : null}
            {tuzel ? ozetSatiri('Ticaret sicil no', bilgiler.ticaretSicilNo) : null}
          </>,
        )}
        {ozetGrubu(
          1,
          <>
            {ozetSatiri('Yetki belgesi no', bilgiler.yetkiBelgesiNo)}
            {ozetSatiri('Yetki belgesi bitişi', bilgiler.yetkiBelgesiBitis)}
            {ozetSatiri('Sorumlu emlak danışmanı', bilgiler.sorumluDanismanAdSoyad)}
            {ozetSatiri('MYK Seviye 5 belge no', bilgiler.mykBelgeNo)}
          </>,
        )}
        {ozetGrubu(
          2,
          <>
            {ozetSatiri('Adres', `${bilgiler.acikAdres} ${bilgiler.ilce} / ${bilgiler.il}`.trim())}
            {ozetSatiri('Ofis telefonu', bilgiler.ofisTelefonu)}
            {ozetSatiri('Yetkili', bilgiler.yetkiliAdSoyad)}
            {ozetSatiri('Yetkili e-posta', bilgiler.yetkiliEPosta)}
          </>,
        )}
        {ozetGrubu(
          3,
          <>
            {ozetSatiri('Paket', secilenPaket.name)}
            {ozetSatiri('Danışman koltuğu', `${bilgiler.paketKoltuk} koltuk`)}
          </>,
        )}
      </div>

      {onayKutusu(
        'kvkkOnayi',
        'İşletme ve yetkili kişi verilerinin işlenmesine ilişkin aydınlatma metnini okudum, onaylıyorum.',
      )}
      {onayKutusu(
        'temsilBeyani',
        'İşletmeyi temsile yetkili olduğumu ve verdiğim bilgilerin doğru olduğunu beyan ederim.',
      )}
      {onayKutusu(
        'iysOnayi',
        'Kampanya ve duyurular için ticari elektronik ileti almak istiyorum (isteğe bağlı).',
      )}
    </>
  )

  /**
   * Paket bölümü. Tablo dar bir form kartının içinde durduğu için `compact`
   * yerleşime düşer: üç kart yan yana sığmaz, seçim listesi ise formun geri
   * kalanıyla aynı ritimde okunur. Seçim ve koltuk adedi doğrudan başvuru
   * verisine yazılır — ayrı bir yerel durum tutulmaz, "Geri" ile dönüldüğünde
   * seçim korunur.
   */
  const paketBolumu = () => (
    <div className={styles.paketBolumu}>
      <GlassPricingTable
        plans={PAKET_TABLOSU}
        selectedPlanId={bilgiler.paketId}
        onSelectedPlanChange={(id) =>
          setBilgiler((onceki) => ({
            ...onceki,
            paketId: id as OfficePlanId,
            // Paket değişince koltuk adedi yeni paketin tabanına çekilir:
            // 2 koltuklu pakette seçilen 4 koltuk, 20 koltuk dahil eden pakete
            // geçince anlamını yitirir.
            paketKoltuk: officePlanById(id as OfficePlanId).seats.included,
          }))
        }
        seats={{ [bilgiler.paketId]: bilgiler.paketKoltuk }}
        onSeatsChange={(_planId, adet) =>
          setBilgiler((onceki) => ({ ...onceki, paketKoltuk: adet }))
        }
        layout="compact"
        compactActionLabel="{plan} seçildi"
      />
      <p className={styles.paketNotu}>
        Ödeme şimdi alınmaz. Başvurunuz onaylandığında seçtiğiniz paket için ilk fatura
        oluşturulur; o ana kadar paketi ve koltuk adedini değiştirebilirsiniz.
      </p>
    </div>
  )

  const bolumIcerigi = () => {
    switch (bolum.anahtar) {
      case 'isletme':
        return isletmeBolumu()
      case 'yetki':
        return YETKI_ALANLARI.map(metinAlani)
      case 'ofis':
        return ofisBolumu()
      case 'paket':
        return paketBolumu()
      case 'onay':
        return onayBolumu()
    }
  }

  return (
    <KorumaliSayfa>
      <AuthFormPage
        baslik="Emlak ofisi başvurusu"
        aciklama="İlan yayınlayabilmek için işletme bilgilerinizi ve yetki belgenizi iletin."
        ustSerit={
          <KayitAdimSeridi
            adimlar={SERIT}
            aktifIndeks={AKTIF_INDEKS}
            sayac={
              <KayitAdimSayaci
                aktifIndeks={AKTIF_INDEKS}
                toplam={SERIT.length}
                baslik={SERIT[AKTIF_INDEKS].baslik}
              />
            }
          />
        }
        hata={hata}
        hataAnahtari={hataAnahtari}
        onSubmit={gonder}
        gonderiliyor={gonderiliyor}
        aksiyonlar={({ hidrasyonTamam }) => (
          <div className={styles.gezinme}>
            <div className={styles.gezinmeButonlari}>
              <GlassButton
                type="button"
                size="md"
                disabled={bolumIndeksi === 0 || gonderiliyor || !hidrasyonTamam}
                onClick={geriGit}
              >
                Geri
              </GlassButton>
              <GlassButton
                type="submit"
                prominent
                size="md"
                loading={gonderiliyor}
                disabled={!hidrasyonTamam || gonderiliyor}
              >
                {sonBolumde ? 'Başvuruyu gönder' : 'Devam et'}
              </GlassButton>
            </div>
            {/* Dış şerit "Adım N / M" der; bu sayfanın içi "Bölüm" sayar —
                iki numaralandırmanın karışmaması için ad bilinçli farklı. */}
            <p className={styles.bolumSayaci} aria-live="polite">
              {`Bölüm ${bolumIndeksi + 1} / ${KURUMSAL_ADIMLARI.length}: ${bolum.baslik}`}
            </p>
          </div>
        )}
      >
        <KayitAdimSeridi
          adimlar={BOLUM_SERIDI}
          aktifIndeks={bolumIndeksi}
          onAdimSec={bolumeTasi}
          etiket="Başvuru bölümleri"
        />

        <motion.section
          key={bolum.anahtar}
          className={styles.adimKarti}
          initial={hareketAzalt ? false : { opacity: 0, x: yon * KAYMA }}
          animate={{ opacity: 1, x: 0 }}
          transition={hareketAzalt ? { duration: 0 } : GECIS}
        >
          <div className={styles.adimBaslikBlogu}>
            <h2 className={styles.adimBaslik} ref={baslikRef} tabIndex={-1}>
              {bolum.baslik}
            </h2>
            <p className={styles.adimAciklama}>{bolum.aciklama}</p>
          </div>

          {bolumIcerigi()}
        </motion.section>
      </AuthFormPage>
    </KorumaliSayfa>
  )
}
