import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { KayitAdimSayaci, KayitAdimSeridi } from '../components/KayitAdimSeridi'
import { KorumaliSayfa } from '../components/KorumaliSayfa'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import { kayitSeridi } from '../domain/kayit-adimlari'
import styles from './GirisPage.module.css'

/** Bireysel dalın şeridi: dört kayıt adımı + profil. Bu sayfa son adımdır. */
const SERIT = kayitSeridi('profil')
const AKTIF_INDEKS = SERIT.length - 1

/**
 * Kayıt sonrası eksik profil alanlarını tamamlar. Oturum gerektirir;
 * koruma (yönlendirme + hidrasyon-güvenli bekleme) `KorumaliSayfa` sağlar.
 */
export function KayitProfilPage() {
  const { oturum, adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }

  const [adSoyad, setAdSoyad] = useState(oturum?.adSoyad ?? '')
  const [ePosta, setEPosta] = useState(oturum?.ePosta ?? '')
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.profilTamamla(adSoyad, ePosta)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  return (
    <KorumaliSayfa>
      <AuthFormPage
        baslik="Profilinizi tamamlayın"
        aciklama="Bu bilgiler ilanlarınızda ve mesajlarınızda görünür."
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
        onSubmit={gonder}
        gonderEtiketi="Kaydet ve devam et"
        gonderiliyor={gonderiliyor}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="profil-ad">
            Ad soyad
          </label>
          <input
            id="profil-ad"
            className={styles.input}
            type="text"
            autoComplete="name"
            value={adSoyad}
            onChange={(event) => setAdSoyad(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="profil-eposta">
            E-posta
          </label>
          <input
            id="profil-eposta"
            className={styles.input}
            type="email"
            autoComplete="email"
            value={ePosta}
            onChange={(event) => setEPosta(event.target.value)}
          />
        </div>
      </AuthFormPage>
    </KorumaliSayfa>
  )
}
