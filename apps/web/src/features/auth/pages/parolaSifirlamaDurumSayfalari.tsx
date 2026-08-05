import { AuthStatusPage } from '../components/AuthStatusPage'

/**
 * Parola sıfırlama akışının üç durum sayfası. Üçü de `AuthStatusPage`'in
 * farklı içerikleridir; ayrı bileşen yazılmaz.
 */

/** Bağlantı istendikten sonra. Hesabın var olup olmadığını AÇIKLAMAZ. */
export function ParolaBaglantiGonderildiPage() {
  return (
    <AuthStatusPage
      tone="info"
      baslik="Bağlantıyı gönderdik"
      aciklama="Bu adrese kayıtlı bir hesap varsa parola sıfırlama bağlantısını gönderdik. E-posta kutunuzu kontrol edin; bağlantı 30 dakika geçerlidir."
      birincilEylem={{ etiket: 'Girişe dön', hedef: '/giris' }}
    />
  )
}

/** Parola başarıyla değiştirildikten sonra. Oturum AÇILMAZ, kullanıcı giriş yapar. */
export function ParolaSifirlandiPage() {
  return (
    <AuthStatusPage
      tone="success"
      baslik="Parolanız değişti"
      aciklama="Yeni parolanızla giriş yapabilirsiniz."
      birincilEylem={{ etiket: 'Giriş yapın', hedef: '/giris/parola' }}
    />
  )
}

/** Token tanınmadı veya süresi doldu. Tek çıkış yolu yeni bağlantı istemek. */
export function ParolaBaglantiGecersizPage() {
  return (
    <AuthStatusPage
      tone="error"
      baslik="Bağlantı geçersiz"
      aciklama="Bu parola sıfırlama bağlantısının süresi dolmuş veya daha önce kullanılmış. Yeni bir bağlantı isteyin."
      birincilEylem={{ etiket: 'Yeni bağlantı iste', hedef: '/parola-sifirla' }}
      ikincilBaglanti={{ etiket: 'Girişe dön', hedef: '/giris' }}
    />
  )
}
