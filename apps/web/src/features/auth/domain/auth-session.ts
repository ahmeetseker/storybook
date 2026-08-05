/**
 * Giriş sonrası dönülecek yolların auth/durum rotalarına düşmesini engeller.
 *
 * İki liste kasıtlı olarak ayrı tutulur:
 *
 * - `AUTH_ONEK_REDDI`: bu öneklerin KENDİSİ ve TÜM çocukları reddedilir —
 *   `/giris`, `/parola-sifirla` vb. tamamen oturumsuz kullanıcıya hitap eden
 *   akışlardır; hiçbir alt sayfaları dönüş hedefi olamaz.
 * - `AUTH_TAM_YOL_REDDI`: yalnız TAM eşleşen yol reddedilir — `/kayit` ve
 *   `/hesap` altında Faz 2 ile birlikte OTURUM GEREKTİREN sayfalar
 *   (`/kayit/profil`, `/kayit/kurumsal`, `/hesap/dogrula`) eklendi; bunlar
 *   giriş sonrası dönüş hedefi olarak GEÇERLİDİR ("giriş sonrası geldiği
 *   yere döner" — spec §4.3). Yalnız formun/durumun kendisi (`/kayit`) ve
 *   durum sayfaları (`/kayit/hesap-var`, `/hesap/askida`) reddedilir — bunlara
 *   dönmek ya döngü kurar ya da anlamsızdır. Faz 3/4 bu öneklerin altına yeni
 *   sayfa eklerken hangi listeye gireceğine (oturum gerektirir mi, döngü
 *   riski var mı) göre karar verilmeli.
 */
const AUTH_ONEK_REDDI = ['/giris', '/parola-sifirla', '/oturum-suresi-doldu', '/yetkisiz']
/*
 * `/davet/:token` ve `/e-posta-dogrula` KASITLI olarak burada YOK: ikisi de
 * oturum gerektirir, yani "giriş yap, sonra geldiğin yere dön" akışının
 * meşru hedefleridir. Yalnız kendi durum sayfaları (`/davet/gecersiz`)
 * reddedilir — oraya dönmek anlamsızdır.
 */
const AUTH_TAM_YOL_REDDI = [
  '/kayit',
  '/kayit/hesap-var',
  '/hesap/askida',
  '/davet/gecersiz',
]

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
  if (AUTH_ONEK_REDDI.some((onek) => yol === onek || yol.startsWith(`${onek}/`))) {
    return '/'
  }
  if (AUTH_TAM_YOL_REDDI.includes(yol)) {
    return '/'
  }
  return yol
}
