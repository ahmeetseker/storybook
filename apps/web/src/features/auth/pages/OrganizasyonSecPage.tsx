import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthStatusPage } from '../components/AuthStatusPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import type { Organizasyon, OrganizasyonRolu } from '../domain/auth-types'
import styles from './GirisPage.module.css'

const ROL_ETIKETI: Record<OrganizasyonRolu, string> = {
  sahip: 'Sahip',
  yonetici: 'Yönetici',
  danisman: 'Danışman',
}

/**
 * Birden çok organizasyona erişimi olan kullanıcının aktif organizasyonu
 * seçtiği ekran.
 *
 * Liste `<ul>` + gerçek `<button>` ile kurulur, radio grubuyla DEĞİL: burada
 * "seç ve gönder" iki adımı yok, tıklama doğrudan eylemdir. Klavye
 * kullanıcısı Tab ile gezip Enter'a basar.
 */
export function OrganizasyonSecPage() {
  const { adapters, oturum, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [organizasyonlar, setOrganizasyonlar] = useState<readonly Organizasyon[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState<string | undefined>()
  const [secilen, setSecilen] = useState<string | undefined>()

  useEffect(() => {
    let iptal = false
    void adapters.organizasyonlariGetir().then((sonuc) => {
      if (iptal) return
      setYukleniyor(false)
      if (sonuc.durum === 'hata') {
        setHata(sonuc.mesaj)
        return
      }
      setOrganizasyonlar(sonuc.veri)
    })
    return () => {
      iptal = true
    }
  }, [adapters])

  const sec = async (organizasyonId: string) => {
    setHata(undefined)
    setSecilen(organizasyonId)
    const sonuc = await adapters.organizasyonSec(organizasyonId)

    if (sonuc.durum === 'hata') {
      setSecilen(undefined)
      if (sonuc.kod === 'yetkisiz') {
        navigate({ to: '/yetkisiz', replace: true })
        return
      }
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  if (yukleniyor) {
    return (
      <AuthStatusPage
        tone="info"
        baslik="Organizasyonlarınızı getiriyoruz"
        aciklama="Bu işlem birkaç saniye sürebilir."
      />
    )
  }

  if (organizasyonlar.length === 0) {
    return (
      <AuthStatusPage
        tone="info"
        baslik="Henüz bir organizasyonunuz yok"
        aciklama="Bir emlak ofisine bağlı değilsiniz. Ofis başvurusu yapabilir veya bireysel olarak devam edebilirsiniz."
        birincilEylem={{ etiket: 'Ofis başvurusu yapın', hedef: '/kayit/kurumsal' }}
        ikincilBaglanti={{ etiket: 'Hesabıma git', hedef: '/hesabim' }}
      />
    )
  }

  return (
    <main id="main-content" className={styles.davetSayfasi}>
      <h1 className={styles.davetBaslik}>Organizasyon seçin</h1>
      <p className={styles.davetAciklama}>
        {oturum?.adSoyad ? `${oturum.adSoyad}, ` : ''}hangi organizasyon adına çalışacaksınız?
        Seçiminizi daha sonra değiştirebilirsiniz.
      </p>

      {hata ? (
        <p className={styles.alanHatasi} role="alert">
          {hata}
        </p>
      ) : null}

      <ul className={styles.orgListesi}>
        {organizasyonlar.map((org) => (
          <li key={org.id}>
            <button
              type="button"
              className={styles.orgSecenek}
              disabled={secilen !== undefined}
              aria-current={oturum?.organizasyon?.id === org.id ? 'true' : undefined}
              onClick={() => sec(org.id)}
            >
              <span className={styles.orgAd}>{org.ad}</span>
              <span className={styles.orgRol}>{ROL_ETIKETI[org.rol]}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
