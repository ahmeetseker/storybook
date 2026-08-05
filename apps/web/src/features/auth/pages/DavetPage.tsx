import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { GlassButton } from '@repo/ui'
import { AuthStatusPage } from '../components/AuthStatusPage'
import { useAuthSession } from '../AuthSessionProvider'
import type { DavetOzeti, OrganizasyonRolu } from '../domain/auth-types'
import styles from './GirisPage.module.css'

const ROL_ETIKETI: Record<OrganizasyonRolu, string> = {
  sahip: 'Sahip',
  yonetici: 'Yönetici',
  danisman: 'Danışman',
}

/**
 * Davet kabul ekranı.
 *
 * Davet özeti kabul etmeden ÖNCE gösterilir: kullanıcı hangi organizasyona,
 * kimin daveti üzerine ve hangi rolle katılacağını bilmeden onay vermemeli.
 * Bu yüzden port'ta `davetiGetir` (okuma) ve `davetiKabulEt` (yazma) ayrı.
 *
 * Oturum gerekir — `KorumaliSayfa` ile sarmalanır (rota dosyasında). Giriş
 * yapmamış kullanıcı `/giris?donus=/davet/<token>`'a gider ve giriş sonrası
 * buraya döner; `/davet/:token` bilinçli olarak `donus` reddi listesinde YOK.
 */
export function DavetPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { token } = useParams({ strict: false }) as { token?: string }
  const [ozet, setOzet] = useState<DavetOzeti | undefined>()
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState<string | undefined>()
  const [kabulEdiliyor, setKabulEdiliyor] = useState(false)

  useEffect(() => {
    let iptal = false
    void adapters.davetiGetir(token ?? '').then((sonuc) => {
      if (iptal) return
      setYukleniyor(false)
      if (sonuc.durum === 'hata') {
        navigate({ to: '/davet/gecersiz', replace: true })
        return
      }
      setOzet(sonuc.veri)
    })
    return () => {
      iptal = true
    }
  }, [adapters, token, navigate])

  const kabulEt = async () => {
    setHata(undefined)
    setKabulEdiliyor(true)
    const sonuc = await adapters.davetiKabulEt(token ?? '')
    setKabulEdiliyor(false)

    if (sonuc.durum === 'hata') {
      if (sonuc.kod === 'gecersiz-token') {
        navigate({ to: '/davet/gecersiz', replace: true })
        return
      }
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    navigate({ to: '/hesabim', replace: true })
  }

  if (yukleniyor || !ozet) {
    // Yükleme durumu ayrı bir sayfa değil; `AuthStatusPage` bilgi tonuyla
    // aynı iskeleti verir ve tek `main`/`h1` sözleşmesini korur.
    return (
      <AuthStatusPage
        tone="info"
        baslik="Daveti hazırlıyoruz"
        aciklama="Bu işlem birkaç saniye sürebilir."
      />
    )
  }

  return (
    <main id="main-content" className={styles.davetSayfasi}>
      <h1 className={styles.davetBaslik}>Davetiniz var</h1>
      <p className={styles.davetAciklama}>
        <strong>{ozet.davetEden}</strong>, sizi <strong>{ozet.organizasyonAdi}</strong>{' '}
        organizasyonuna <strong>{ROL_ETIKETI[ozet.rol]}</strong> olarak davet etti.
      </p>

      <dl className={styles.davetOzet}>
        <div className={styles.davetSatir}>
          <dt className={styles.davetEtiket}>Organizasyon</dt>
          <dd className={styles.davetDeger}>{ozet.organizasyonAdi}</dd>
        </div>
        <div className={styles.davetSatir}>
          <dt className={styles.davetEtiket}>Rolünüz</dt>
          <dd className={styles.davetDeger}>{ROL_ETIKETI[ozet.rol]}</dd>
        </div>
        <div className={styles.davetSatir}>
          <dt className={styles.davetEtiket}>Davet eden</dt>
          <dd className={styles.davetDeger}>{ozet.davetEden}</dd>
        </div>
      </dl>

      {hata ? (
        <p className={styles.alanHatasi} role="alert">
          {hata}
        </p>
      ) : null}

      <GlassButton
        type="button"
        prominent
        size="md"
        loading={kabulEdiliyor}
        disabled={kabulEdiliyor}
        onClick={kabulEt}
      >
        Daveti kabul et
      </GlassButton>
    </main>
  )
}
