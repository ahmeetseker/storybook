import { AuthStatusPage } from '../components/AuthStatusPage'

/** E-posta bağlantısı gönderildikten sonra gösterilir. */
export function BaglantiGonderildiPage() {
  return (
    <AuthStatusPage
      tone="info"
      baslik="Bağlantıyı gönderdik"
      aciklama="E-posta kutunuzdaki giriş bağlantısına tıklayın. Bağlantı 15 dakika geçerlidir."
      ikincilBaglanti={{ etiket: 'Başka bir yöntemle girin', hedef: '/giris' }}
    />
  )
}

/** Magic link süresi dolduğunda veya bozuk olduğunda gösterilir. */
export function BaglantiGecersizPage() {
  return (
    <AuthStatusPage
      tone="error"
      baslik="Bağlantı geçersiz"
      aciklama="Bu giriş bağlantısının süresi dolmuş veya daha önce kullanılmış. Yeni bir bağlantı isteyin."
      birincilEylem={{ etiket: 'Yeni bağlantı iste', hedef: '/giris' }}
    />
  )
}

/** Sınıflandırılamayan kimlik hatalarının düştüğü sayfa. */
export function GirisHataPage() {
  return (
    <AuthStatusPage
      tone="error"
      baslik="Giriş tamamlanamadı"
      aciklama="Beklenmeyen bir sorun oluştu. Tekrar denediğinizde sorun sürerse bize yazın."
      birincilEylem={{ etiket: 'Girişe dön', hedef: '/giris' }}
    />
  )
}
