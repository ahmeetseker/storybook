import { AuthStatusPage } from '../components/AuthStatusPage'

/**
 * Kayıt sırasında e-posta adresi zaten kayıtlıysa gösterilir.
 *
 * Bilgi tonu bilinçli: bu bir hata değil, kullanıcının zaten hesabı var —
 * yapması gereken tek şey giriş yapmak.
 */
export function HesapVarPage() {
  return (
    <AuthStatusPage
      tone="info"
      baslik="Bu hesap zaten var"
      aciklama="Girdiğiniz e-posta adresiyle bir hesap bulunuyor. Giriş yaparak devam edebilirsiniz."
      birincilEylem={{ etiket: 'Giriş yapın', hedef: '/giris' }}
    />
  )
}
