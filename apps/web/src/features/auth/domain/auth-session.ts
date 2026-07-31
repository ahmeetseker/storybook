/** Giriş sonrası dönülecek yolların auth rotalarına düşmesini engeller. */
const AUTH_YOL_ONEKLERI = ['/giris', '/kayit', '/parola-sifirla', '/oturum-suresi-doldu', '/yetkisiz', '/hesap']

/**
 * `donus` parametresini güvenli bir uygulama içi yola indirger.
 *
 * Yalnız tek `/` ile başlayan mutlak uygulama yolları kabul edilir. Dış
 * adresler, protokol-bağıl yollar (`//host`), ters bölü ile kaçış
 * (`/\host` — WHATWG URL çözümlemesinde özel şemalarda `/` sayılır ve
 * `//host` gibi davranır) ve bunların kodlanmış varyantları (`%2F%2F`,
 * `%5C`) ana sayfaya düşer — açık yönlendirme açığı bırakılmaz. Auth
 * rotaları da segment sınırına uyarak reddedilir (`/giris` ve `/giris/…`
 * ama `/girisimci` değil); aksi halde giriş sonrası kullanıcı girişe geri
 * dönerdi.
 */
export function guvenliDonusYolu(ham: string | null | undefined): string {
  if (!ham) return '/'
  const yol = ham.trim()
  if (!yol.startsWith('/')) return '/'
  if (yol.startsWith('//')) return '/'
  if (yol.includes('\\')) return '/'
  const kucukYol = yol.toLowerCase()
  if (kucukYol.includes('%2f%2f') || kucukYol.includes('%5c')) return '/'
  if (AUTH_YOL_ONEKLERI.some((onek) => yol === onek || yol.startsWith(`${onek}/`))) {
    return '/'
  }
  return yol
}
