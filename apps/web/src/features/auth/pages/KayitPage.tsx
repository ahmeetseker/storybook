import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { GlassButton, GlassCheckbox } from '@repo/ui'
import { AuthFormPage } from '../components/AuthFormPage'
import { HukukiMetinDugmeleri } from '../components/HukukiMetinler'
import { KayitAdimSayaci, KayitAdimSeridi } from '../components/KayitAdimSeridi'
import { ParolaAlani } from '../components/ParolaAlani'
import { ParolaGucu } from '../components/ParolaGucu'
import { TelefonAlani } from '../components/TelefonAlani'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import { kayitBilgileriniDogrula } from '../domain/kayit-dogrulama'
import {
  KAYIT_ADIMLARI,
  TUM_ALAN_SIRASI,
  adimHatalari,
  hataliAdimIndeksi,
  kayitSeridi,
} from '../domain/kayit-adimlari'
import { alanHataId, ilkHataliAlanaOdaklan } from '../domain/form-erisilebilirlik'
import {
  VARSAYILAN_TELEFON_ULKESI,
  telefonuNormallestir,
  telefonuUluslararasiGoster,
  type TelefonUlkeKodu,
} from '../domain/telefon-ulkeler'
import type { HesapTipi, KayitAlanHatalari, KayitBilgileri } from '../domain/auth-types'
import alanStilleri from './GirisPage.module.css'
import styles from './KayitPage.module.css'

const SERIT = kayitSeridi()
const SON_INDEKS = KAYIT_ADIMLARI.length - 1

/**
 * Odak isteği. Adım değişimi ve doğrulama hatası odağı FARKLI yerlere
 * taşır ama ikisi de ancak yeni adım DOM'a yazıldıktan sonra çalışabilir —
 * bu yüzden odak, render sırasında değil, bir bilet üzerinden effect'te
 * uygulanır. `hatalar` doluysa `ilkHataliAlanaOdaklan` deseni işler,
 * boşsa odak adım başlığına gider.
 */
interface OdakIstegi {
  bilet: number
  hatalar?: KayitAlanHatalari
}

/** Adım geçişi: yalnız transform + opacity (tasarım sistemi motion kuralı). */
const GECIS = { duration: 0.24, ease: [0.32, 0.72, 0, 1] } as const
const KAYMA = 16

/**
 * Kayıt sayfası — dört adımlı akış.
 *
 * Doğrulama tek kaynaktan gelir (`kayitBilgileriniDogrula`); adım sözleşmesi
 * yalnız bu kaynağın döndürdüğü hataları SÜZER (`domain/kayit-adimlari.ts`).
 * Kullanıcı henüz görmediği bir adımın hatasını duymaz; son adımda tam
 * doğrulama çalışır ve bir hata kalmışsa akış o hatanın adımına geri taşınır.
 *
 * Hesap tipi ilk adımdır: emlak ofisi seçilirse kayıt sonrası kurumsal
 * başvuruya, bireysel seçilirse dönüş hedefine gidilir.
 */
export function KayitPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const hareketAzalt = useReducedMotion()

  const [adimIndeksi, setAdimIndeksi] = useState(0)
  const [yon, setYon] = useState<1 | -1>(1)
  const [hesapTipi, setHesapTipi] = useState<HesapTipi>('bireysel')
  const [adSoyad, setAdSoyad] = useState('')
  const [ePosta, setEPosta] = useState('')
  const [telefonUlke, setTelefonUlke] = useState<TelefonUlkeKodu>(VARSAYILAN_TELEFON_ULKESI)
  const [telefon, setTelefon] = useState('')
  const [parola, setParola] = useState('')
  const [kvkkOnayi, setKvkkOnayi] = useState(false)
  const [alanHatalari, setAlanHatalari] = useState<KayitAlanHatalari>({})
  const [hata, setHata] = useState<string | undefined>()
  /** Her gönderim denemesinde artar — aynı hata metni tekrar duyurulsun diye. */
  const [hataAnahtari, setHataAnahtari] = useState(0)
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [odak, setOdak] = useState<OdakIstegi>({ bilet: 0 })

  const baslikRef = useRef<HTMLHeadingElement>(null)

  const adim = KAYIT_ADIMLARI[adimIndeksi]
  const sonAdimda = adimIndeksi === SON_INDEKS

  useEffect(() => {
    // Bilet 0: ilk render. Sayfa açılışında odak çalınmaz.
    if (odak.bilet === 0) return
    if (odak.hatalar) {
      // `alanHatalari` her zaman YALNIZ görünür adımın hatalarını taşır;
      // bu yüzden tüm alan sırasındaki ilk hata, görünür adımın ilk hatasıdır.
      ilkHataliAlanaOdaklan(TUM_ALAN_SIRASI, odak.hatalar)
      return
    }
    baslikRef.current?.focus()
  }, [odak])

  const bilgileriTopla = (): KayitBilgileri => ({
    adSoyad,
    ePosta,
    // Adapter'a KANONİK numara gider: kullanıcı "0532…", "+90 532…" ya da
    // boşluklu yazmış olabilir; kayıt tek biçim tanır.
    telefon: telefonuNormallestir(telefon, telefonUlke),
    telefonUlke,
    parola,
    hesapTipi,
    kvkkOnayi,
  })

  const adimaTasi = (hedef: number) => {
    setYon(hedef < adimIndeksi ? -1 : 1)
    setAdimIndeksi(hedef)
    setAlanHatalari({})
    setHata(undefined)
    setOdak((onceki) => ({ bilet: onceki.bilet + 1 }))
  }

  /** Doğrulama hatasında: hataları göster, ilgili adıma taşı, ilk alana odaklan. */
  const hatalariGoster = (tumHatalar: KayitAlanHatalari, hedefIndeks: number, ozet: string) => {
    const gorunur = adimHatalari(tumHatalar, KAYIT_ADIMLARI[hedefIndeks])
    if (hedefIndeks !== adimIndeksi) {
      setYon(hedefIndeks < adimIndeksi ? -1 : 1)
      setAdimIndeksi(hedefIndeks)
    }
    setAlanHatalari(gorunur)
    setHata(ozet)
    setOdak((onceki) => ({ bilet: onceki.bilet + 1, hatalar: gorunur }))
  }

  const geriGit = () => {
    if (adimIndeksi === 0) return
    adimaTasi(adimIndeksi - 1)
  }

  /**
   * Form gönderimi. Son adıma kadar "Devam et" görevini görür: yalnız
   * bulunulan adımın alanları doğrulanır. Son adımda tam doğrulama koşar
   * ve adapter çağrılır.
   */
  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setHataAnahtari((onceki) => onceki + 1)

    const bilgiler = bilgileriTopla()
    const tumHatalar = kayitBilgileriniDogrula(bilgiler)

    if (!sonAdimda) {
      const buAdim = adimHatalari(tumHatalar, adim)
      if (Object.keys(buAdim).length > 0) {
        hatalariGoster(tumHatalar, adimIndeksi, 'Bu adımda düzeltilmesi gereken alanlar var.')
        return
      }
      adimaTasi(adimIndeksi + 1)
      return
    }

    if (Object.keys(tumHatalar).length > 0) {
      // Güvenlik ağı: adım adım ilerleyen kullanıcı buraya geçerli verilerle
      // gelir, ama tam doğrulama yine de son sözü söyler — hata kalmışsa
      // akış o hatanın adımına geri taşınır (yeni bir alan eklendiğinde de
      // sessizce yutulmasın diye).
      hatalariGoster(
        tumHatalar,
        Math.max(hataliAdimIndeksi(tumHatalar), 0),
        'Formda düzeltilmesi gereken alanlar var.',
      )
      return
    }

    setAlanHatalari({})
    setGonderiliyor(true)
    const sonuc = await adapters.kayitYap(bilgiler)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      if (sonuc.kod === 'hesap-zaten-var') {
        // `/kayit/hesap-var` rotası `donus`'u tüketiyor (validateSearch) — bu
        // yüzden `href` yerine tip-güvenli `to`/`search` kullanılabiliyor. Var
        // olan `donus`'u olduğu gibi taşıyoruz (yeniden inşa etmiyoruz, yalnız
        // aynen aktarıyoruz); sanitizasyon zaten kullanıcı durum sayfasından
        // "Giriş yapın"a tıklayıp gerçek hedefe geçerken bir kez uygulanacak
        // (bkz. `AuthStatusPage`'in search passthrough'u).
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
      // `validateSearch` taşıdığından `search` açıkça `undefined` verilir —
      // elle taşımamak kasıtlıdır, unutulmuş değil.
      navigate({ to: '/kayit/kurumsal', search: { donus: undefined, paket: undefined } })
      return
    }
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  const alanHatasi = (ad: keyof KayitBilgileri, id: string): ReactNode =>
    alanHatalari[ad] ? (
      <p id={alanHataId(id)} className={styles.alanHatasi}>
        {alanHatalari[ad]}
      </p>
    ) : null

  const hesapTipiAdimi = () => (
    <fieldset className={styles.tipSecimi}>
      {/* Kart başlığı (h2) grubun adını zaten söylüyor; legend ekran okuyucu
          için radyo grubunu adlandırır, görsel olarak tekrar etmez. */}
      <legend className={styles.srOnly}>Hesap tipini seçin</legend>

      {/* `htmlFor` sarmalayan etikette de bulunur: erişilebilirlik geçidi
          (AuthAccessibility.test.tsx) `id` taşıyan her girdi için açık bir
          `label[for]` arar; sarmalama tek başına örtük isim verse de açık
          bağ ikisini birden karşılar. */}
      <label
        className={styles.tipSecenek}
        htmlFor="kayit-tip-bireysel"
        data-secili={hesapTipi === 'bireysel' || undefined}
      >
        <input
          id="kayit-tip-bireysel"
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

      <label
        className={styles.tipSecenek}
        htmlFor="kayit-tip-kurumsal"
        data-secili={hesapTipi === 'kurumsal' || undefined}
      >
        <input
          id="kayit-tip-kurumsal"
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
  )

  const kimlikAdimi = () => (
    <>
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
        {alanHatasi('adSoyad', 'kayit-ad')}
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
        {alanHatasi('ePosta', 'kayit-eposta')}
      </div>
    </>
  )

  const iletisimAdimi = () => (
    <>
      <TelefonAlani
        id="kayit-telefon"
        ulkeKodu={telefonUlke}
        onUlkeKoduChange={setTelefonUlke}
        deger={telefon}
        onDegerChange={setTelefon}
        hata={alanHatalari.telefon}
        ipucu="Numaranız alıcılarla iletişim ve giriş doğrulaması için kullanılır."
      />

      <ParolaAlani
        id="kayit-parola"
        etiket="Parola"
        deger={parola}
        onDegerChange={setParola}
        autoComplete="new-password"
        hata={alanHatalari.parola}
      >
        {/* Statik kural listesinin yerini canlı gösterge aldı: kurallar aynı
            kaynaktan (`domain/parola-gucu.ts`) gelir ve artık yazarken
            karşılanıp karşılanmadıklarını da söyler. */}
        <ParolaGucu parola={parola} />
      </ParolaAlani>
    </>
  )

  const ozetSatiri = (baslik: string, deger: ReactNode) => (
    <div className={styles.ozetSatir}>
      <dt className={styles.ozetEtiket}>{baslik}</dt>
      <dd className={styles.ozetDeger}>{deger}</dd>
    </div>
  )

  const ozetGrubu = (hedefIndeks: number, icerik: ReactNode) => {
    const hedef = KAYIT_ADIMLARI[hedefIndeks]
    return (
      <div className={styles.ozetGrup}>
        <div className={styles.ozetBaslikSatiri}>
          <h3 className={styles.ozetBaslik}>{hedef.baslik}</h3>
          <button
            type="button"
            className={styles.ozetDuzenle}
            aria-label={`Düzenle: ${hedef.baslik}`}
            onClick={() => adimaTasi(hedefIndeks)}
          >
            Düzenle
          </button>
        </div>
        <dl className={styles.ozetListe}>{icerik}</dl>
      </div>
    )
  }

  const onayAdimi = () => (
    <>
      <div className={styles.ozet}>
        {ozetGrubu(
          0,
          ozetSatiri('Seçilen tip', hesapTipi === 'kurumsal' ? 'Emlak ofisi' : 'Bireysel'),
        )}
        {ozetGrubu(
          1,
          <>
            {ozetSatiri('Ad soyad', adSoyad)}
            {ozetSatiri('E-posta', ePosta)}
          </>,
        )}
        {ozetGrubu(
          2,
          <>
            {/* Özette ülke kodu da görünür: kullanıcı numarasını ulusal
                biçimde yazdı, ama onaylayacağı şey numaranın TAMAMI. */}
            {ozetSatiri('Telefon', telefonuUluslararasiGoster(telefon, telefonUlke))}
            {ozetSatiri(
              'Parola',
              <>
                <span aria-hidden="true">••••••••</span>
                <span className={styles.srOnly}>Parola belirlendi</span>
              </>,
            )}
          </>,
        )}
      </div>

      {/* Onay kutusunun andığı metinler gerçekten OKUNABİLİR (WCAG 2.4.4):
          düğmeler kutunun etiketine gömülmez, hemen ÜSTÜNDE durur — okuma ve
          klavye sırası "metinleri aç → oku → onayla" olur. Gerekçe ve dialog
          davranışı: components/HukukiMetinler.tsx. */}
      <div className={styles.onayBlogu}>
        <HukukiMetinDugmeleri />
        <GlassCheckbox
          className={styles.onayRow}
          id="kayit-kvkk"
          checked={kvkkOnayi}
          onChange={(event) => setKvkkOnayi(event.target.checked)}
          aria-invalid={alanHatalari.kvkkOnayi ? true : undefined}
          aria-describedby={alanHatalari.kvkkOnayi ? alanHataId('kayit-kvkk') : undefined}
          label="Aydınlatma metnini ve kullanım koşullarını okudum, onaylıyorum."
        />
        {alanHatasi('kvkkOnayi', 'kayit-kvkk')}
      </div>
    </>
  )

  const adimIcerigi = () => {
    switch (adim.anahtar) {
      case 'hesapTipi':
        return hesapTipiAdimi()
      case 'kimlik':
        return kimlikAdimi()
      case 'iletisim':
        return iletisimAdimi()
      case 'onay':
        return onayAdimi()
    }
  }

  return (
    <AuthFormPage
      baslik="Hesap oluşturun"
      aciklama="İlanlarınızı yönetmek, favori ve arama alarmlarınıza ulaşmak için hesap açın."
      ustSerit={
        <KayitAdimSeridi adimlar={SERIT} aktifIndeks={adimIndeksi} onAdimSec={adimaTasi} />
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
              disabled={adimIndeksi === 0 || gonderiliyor || !hidrasyonTamam}
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
              {sonAdimda ? 'Kaydı tamamla' : 'Devam et'}
            </GlassButton>
          </div>
          <KayitAdimSayaci
            aktifIndeks={adimIndeksi}
            toplam={KAYIT_ADIMLARI.length}
            baslik={adim.baslik}
            canli
          />
        </div>
      )}
      ikincilBaglantilar={[{ etiket: 'Zaten hesabınız var mı? Giriş yapın', hedef: '/giris' }]}
    >
      <motion.section
        key={adim.anahtar}
        className={styles.adimKarti}
        initial={hareketAzalt ? false : { opacity: 0, x: yon * KAYMA }}
        animate={{ opacity: 1, x: 0 }}
        transition={hareketAzalt ? { duration: 0 } : GECIS}
      >
        <div className={styles.adimBaslikBlogu}>
          <h2 className={styles.adimBaslik} ref={baslikRef} tabIndex={-1}>
            {adim.baslik}
          </h2>
          <p className={styles.adimAciklama}>{adim.aciklama}</p>
        </div>

        {adimIcerigi()}
      </motion.section>
    </AuthFormPage>
  )
}
