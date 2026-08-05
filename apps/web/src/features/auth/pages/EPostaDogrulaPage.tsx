import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthStatusPage } from '../components/AuthStatusPage'
import { useAuthSession } from '../AuthSessionProvider'

/**
 * Yeni e-posta adresini doğrulama ekranı.
 *
 * Kullanıcı bağlantıya tıklayıp geldiğinde doğrulama OTOMATİK koşar — ayrıca
 * bir "onayla" butonuna bastırmak, kullanıcının zaten e-postasındaki
 * bağlantıya tıklayarak verdiği onayı ikinci kez istemek olurdu.
 *
 * Üç durum tek sayfada: çalışıyor · başarılı · başarısız. Ayrı rotalara
 * bölünmedi çünkü ikisi de bu bağlantının doğrudan sonucudur ve kullanıcı
 * aralarında gezinmez.
 */
export function EPostaDogrulaPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { token } = useSearch({ strict: false }) as { token?: string }
  const [durum, setDurum] = useState<'calisiyor' | 'basarili' | 'hata'>('calisiyor')
  const [mesaj, setMesaj] = useState<string | undefined>()

  useEffect(() => {
    let iptal = false
    void adapters.ePostaDegisikliginiDogrula(token ?? '').then((sonuc) => {
      if (iptal) return
      if (sonuc.durum === 'hata') {
        setDurum('hata')
        setMesaj(sonuc.mesaj)
        return
      }
      setDurum('basarili')
      setMesaj(sonuc.veri.ePosta)
      oturumuTazele()
    })
    return () => {
      iptal = true
    }
  }, [adapters, token, oturumuTazele, navigate])

  if (durum === 'calisiyor') {
    return (
      <AuthStatusPage
        tone="info"
        baslik="E-posta adresinizi doğruluyoruz"
        aciklama="Bu işlem birkaç saniye sürebilir."
      />
    )
  }

  if (durum === 'hata') {
    return (
      <AuthStatusPage
        tone="error"
        baslik="Doğrulama tamamlanamadı"
        aciklama={mesaj ?? 'Bu doğrulama bağlantısı geçersiz veya süresi dolmuş.'}
        birincilEylem={{ etiket: 'Güvenlik ayarlarına dön', hedef: '/hesabim/guvenlik' }}
      />
    )
  }

  return (
    <AuthStatusPage
      tone="success"
      baslik="E-posta adresiniz doğrulandı"
      aciklama={`Hesabınız artık ${mesaj} adresini kullanıyor. Bundan sonraki bildirimler bu adrese gider.`}
      birincilEylem={{ etiket: 'Hesabıma git', hedef: '/hesabim' }}
    />
  )
}
