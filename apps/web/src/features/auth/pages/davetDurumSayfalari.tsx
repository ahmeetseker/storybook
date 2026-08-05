import { AuthStatusPage } from '../components/AuthStatusPage'

/**
 * Davet bağlantısı tanınmadı, süresi doldu veya daha önce kullanıldı.
 *
 * Burada "tekrar dene" YOKTUR: kullanıcı davet token'ını kendisi
 * üretemez, tek çıkış yolu davet edenden yeni bağlantı istemektir.
 */
export function DavetGecersizPage() {
  return (
    <AuthStatusPage
      tone="error"
      baslik="Davet geçersiz"
      aciklama="Bu davet bağlantısının süresi dolmuş veya daha önce kullanılmış. Sizi davet eden kişiden yeni bir bağlantı isteyin."
      birincilEylem={{ etiket: 'Ana sayfaya dön', hedef: '/' }}
      ikincilBaglanti={{ etiket: 'Hesabıma git', hedef: '/hesabim' }}
    />
  )
}
