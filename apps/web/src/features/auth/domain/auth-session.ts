/** Giriş sonrası dönülecek yolların auth rotalarına düşmesini engeller. */
const AUTH_YOL_ONEKLERI = ['/giris', '/kayit', '/parola-sifirla', '/oturum-suresi-doldu', '/yetkisiz', '/hesap/']

/**
 * `donus` parametresini güvenli bir uygulama içi yola indirger.
 *
 * Yalnız tek `/` ile başlayan mutlak uygulama yolları kabul edilir. Dış
 * adresler, protokol-bağıl yollar (`//host`) ve şema enjeksiyonları ana
 * sayfaya düşer — açık yönlendirme açığı bırakılmaz. Auth rotaları da
 * reddedilir; aksi halde giriş sonrası kullanıcı girişe geri dönerdi.
 */
export function guvenliDonusYolu(ham: string | null | undefined): string {
  if (!ham) return '/'
  const yol = ham.trim()
  if (!yol.startsWith('/')) return '/'
  if (yol.startsWith('//')) return '/'
  if (AUTH_YOL_ONEKLERI.some((onek) => yol === onek || yol.startsWith(`${onek}/`) || yol.startsWith(onek))) {
    return '/'
  }
  return yol
}
