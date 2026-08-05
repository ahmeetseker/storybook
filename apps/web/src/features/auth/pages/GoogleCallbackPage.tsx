import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthCallbackPage } from '../components/AuthCallbackPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'

/**
 * Google'dan dönüşü karşılayan rota.
 *
 * `AuthCallbackPage` arketipi 2026-07-31'den beri yazılıydı ama hiçbir
 * rotaya bağlı değildi; bağlandığı yer burası.
 *
 * Sağlayıcı hatası (`?error=`) ile bizim tarafımızdaki hata ayrı ele alınır:
 * ilki kullanıcının iptal etmesi olabilir ve sessizce girişe dönmek doğru
 * davranıştır, ikincisi gerçek bir arızadır ve gösterilmelidir.
 */
export function GoogleCallbackPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { code, error, donus } = useSearch({ strict: false }) as {
    code?: string
    error?: string
    donus?: string
  }
  const [hataMesaji, setHataMesaji] = useState<string | undefined>()

  useEffect(() => {
    // Kullanıcı Google ekranında "iptal" dediyse hata göstermeye gerek yok —
    // girişe döner ve başka bir yöntem seçer.
    if (error) {
      navigate({ to: '/giris', search: { donus: undefined }, replace: true })
      return
    }

    let iptal = false
    void adapters.googleGirisiTamamla(code ?? '').then((sonuc) => {
      if (iptal) return
      if (sonuc.durum === 'hata') {
        if (sonuc.kod === 'hesap-askida') {
          navigate({ to: '/hesap/askida', replace: true })
          return
        }
        setHataMesaji(sonuc.mesaj)
        return
      }
      oturumuTazele()
      navigate({ to: guvenliDonusYolu(donus), replace: true })
    })
    return () => {
      iptal = true
    }
  }, [adapters, code, error, donus, navigate, oturumuTazele])

  if (hataMesaji) {
    return (
      <AuthCallbackPage durum="error" baslik="Google ile giriş tamamlanamadı" hataMesaji={hataMesaji} />
    )
  }

  return <AuthCallbackPage durum="pending" baslik="Google ile giriş yapılıyor" />
}
