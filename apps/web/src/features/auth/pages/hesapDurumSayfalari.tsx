import { AuthStatusPage } from '../components/AuthStatusPage'

/**
 * Hesap askıya alınmış veya pasifleştirilmiş.
 *
 * `AuthHataKodu` içindeki `'hesap-askida'` kodu bu sayfadan önce de vardı ve
 * `auth-session.ts` `/hesap/askida` yolunu dönüş hedefi olarak zaten
 * reddediyordu — eksik olan yalnız varış sayfasıydı. Giriş akışları bu kodu
 * aldıklarında artık buraya taşıyor.
 *
 * Burada "tekrar dene" YOKTUR: kullanıcının kendi başına çözebileceği bir
 * durum değil, tek yol destekle iletişim.
 */
export function HesapAskidaPage() {
  return (
    <AuthStatusPage
      tone="error"
      baslik="Hesabınız askıya alınmış"
      aciklama="Bu hesap şu anda kullanıma kapalı. Nedenini öğrenmek ve itiraz etmek için destek ekibimize yazın."
      birincilEylem={{ etiket: 'Ana sayfaya dön', hedef: '/' }}
    />
  )
}

/**
 * Oturum süresi dolduğunda gelinen sayfa.
 *
 * `/giris`'ten AYRI olması gerekiyor: "atıldınız" ile "hiç giriş
 * yapmamıştınız" farklı durumlar ve kullanıcı ilkinde ne olduğunu bilmeli.
 * `donus` parametresi korunur — tekrar giriş yapınca kaldığı yere döner.
 *
 * Tetikleyicisi gerçek anlamda İP-5/İP-6 ile (cookie TTL) doğacak; bugün
 * fixture `oturum-suresi-doldu` kodunu döndürdüğünde buraya gelinir.
 */
export function OturumSuresiDolduPage() {
  return (
    <AuthStatusPage
      tone="info"
      baslik="Oturumunuzun süresi doldu"
      aciklama="Güvenliğiniz için bir süre işlem yapılmayan oturumlar kapatılır. Kaldığınız yerden devam etmek için tekrar giriş yapın."
      birincilEylem={{ etiket: 'Tekrar giriş yapın', hedef: '/giris' }}
    />
  )
}

/**
 * Oturum VAR ama bu kaynak için yetki YOK.
 *
 * `/giris`'e yönlendirmek yanlış olurdu: kullanıcı zaten giriş yapmış,
 * tekrar giriş yapması bir şey değiştirmez. Doğru çıkış yolu geri dönmek
 * veya yetkiyi verebilecek kişiye başvurmaktır.
 */
export function YetkisizPage() {
  return (
    <AuthStatusPage
      tone="error"
      baslik="Bu sayfaya erişim yetkiniz yok"
      aciklama="Hesabınız bu içeriği görüntülemek için yetkilendirilmemiş. Yetki gerektiğini düşünüyorsanız organizasyon yöneticinizle görüşün."
      birincilEylem={{ etiket: 'Ana sayfaya dön', hedef: '/' }}
      ikincilBaglanti={{ etiket: 'Hesabıma git', hedef: '/hesabim' }}
    />
  )
}
