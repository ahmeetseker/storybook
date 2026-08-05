import { AuthStatusPage } from '../components/AuthStatusPage'

/**
 * Sınıflandırılamayan kimlik hatalarının düştüğü sayfa.
 *
 * 2026-08-04: Bu dosyada ayrıca magic link durum sayfaları
 * (`BaglantiGonderildiPage`, `BaglantiGecersizPage`) vardı. Rotaları
 * bağlıydı ama hiçbir sayfa `girisBaslat('baglanti')` çağırmadığından yalnız
 * URL yazarak erişilebiliyorlardı. Telefon+OTP birincil, parola ikincil
 * yöntem olduğu için üçüncü bir yöntem taşınmıyor — magic link akışı
 * tamamen kaldırıldı (karar K1, `docs/auth-eksikler-plani-2026-08-04.md`).
 */
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
