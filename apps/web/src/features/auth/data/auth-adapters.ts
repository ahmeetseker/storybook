import {
  kayitBilgileriniDogrula,
  kurumsalBasvuruyuDogrula,
  parolaHatasi,
} from '../domain/kayit-dogrulama'
import type {
  AuthSonuc,
  DavetOzeti,
  GirisYontemi,
  KayitBilgileri,
  KurumsalBasvuruBilgileri,
  Organizasyon,
  Oturum,
  OturumCozumu,
} from '../domain/auth-types'

export interface GirisBaslatmaSonucu {
  /** Kodun/bağlantının hangi kanaldan gittiği — kullanıcıya gösterilir. */
  kanal: 'sms' | 'e-posta' | 'yonlendirme'
  /** Kullanıcıya gösterilecek maskelenmiş kimlik: "555 *** 22 33". */
  maskeliKimlik: string
}

export interface AuthAdapters {
  girisBaslat(
    yontem: GirisYontemi,
    kimlik: string,
  ): Promise<AuthSonuc<GirisBaslatmaSonucu>>
  /**
   * Bekleyen kimliğe kodu YENİDEN gönderir.
   *
   * `girisBaslat`'tan ayrı bir metot çünkü çağıran kimliği yeniden bilmek
   * zorunda değildir (kod ekranında telefon alanı yoktur) ve hız sınırı bu
   * uca özeldir: tekrar gönderme, ilk gönderimden farklı bir kotayı tüketir.
   */
  kodTekrarGonder(): Promise<AuthSonuc<GirisBaslatmaSonucu>>
  koduDogrula(kod: string): Promise<AuthSonuc<Oturum>>
  /**
   * Parola sıfırlama bağlantısı ister.
   *
   * Hesabın VAR OLUP OLMADIĞINI sızdırmaz: biçimi geçerli her e-posta için
   * başarı döner. Aksi hâlde bu uç bir hesap sayım aracına dönüşürdü.
   */
  parolaSifirlamaIste(ePosta: string): Promise<AuthSonuc<{ maskeliEPosta: string }>>
  /** Bağlantıdaki token ile yeni parolayı kaydeder. Oturum AÇMAZ. */
  parolaSifirla(token: string, yeniParola: string): Promise<AuthSonuc<null>>
  /**
   * Dış sağlayıcıdan dönen yetkilendirme kodunu oturuma çevirir.
   *
   * Sağlayıcıya YÖNLENDİRME `girisBaslat('google', …)` ile başlar; bu metot
   * yalnız geri dönüşü karşılar. İkisi ayrı çünkü callback rotası kimlik
   * bilgisini değil yalnız sağlayıcının verdiği kodu bilir.
   */
  googleGirisiTamamla(kod: string): Promise<AuthSonuc<Oturum>>
  /** Davet bağlantısının arkasındaki özeti okur — kabul ETMEZ. */
  davetiGetir(token: string): Promise<AuthSonuc<DavetOzeti>>
  /** Daveti kabul eder ve kullanıcıyı organizasyona bağlar. */
  davetiKabulEt(token: string): Promise<AuthSonuc<Oturum>>
  /** Oturumdaki kullanıcının erişebildiği organizasyonlar. */
  organizasyonlariGetir(): Promise<AuthSonuc<readonly Organizasyon[]>>
  /** Aktif organizasyonu değiştirir. */
  organizasyonSec(organizasyonId: string): Promise<AuthSonuc<Oturum>>
  /** Oturum açıkken parola değiştirir; mevcut parola doğrulanır. */
  parolaDegistir(mevcutParola: string, yeniParola: string): Promise<AuthSonuc<null>>
  /** E-posta değişikliğini bağlantıdaki token ile onaylar. */
  ePostaDegisikliginiDogrula(token: string): Promise<AuthSonuc<Oturum>>
  parolaIleGiris(ePosta: string, parola: string): Promise<AuthSonuc<Oturum>>
  /** Yeni hesap açar ve oturumu başlatır. */
  kayitYap(bilgiler: KayitBilgileri): Promise<AuthSonuc<Oturum>>
  /** Kayıt sonrası eksik profil alanlarını tamamlar. */
  profilTamamla(adSoyad: string, ePosta: string): Promise<AuthSonuc<Oturum>>
  /** Emlak ofisi başvurusunu iletir; EİDS durumunu beklemeye çeker. */
  kurumsalBasvuruGonder(bilgiler: KurumsalBasvuruBilgileri): Promise<AuthSonuc<Oturum>>
  /** Hesap seviyesinde EİDS yetki doğrulamasını yürütür. */
  eidsDogrulamaBaslat(): Promise<AuthSonuc<Oturum>>
  /**
   * Oturumun YETKİLİ çözümü. `beforeLoad` ve `AuthSessionProvider` yalnız
   * bunu kullanır.
   *
   * Async olması zorunlu: gerçek kimlik sağlayıcı geldiğinde (İP-5) oturum
   * imzalı httpOnly cookie'den, sunucuda çözülecek. Senkron bir imza o
   * noktada provider'ın `useState` lazy initializer'ını kırardı — bu yüzden
   * ilk okuma bugünden itibaren router'ın `beforeLoad`'una taşındı.
   *
   * Sunucuda (SSR/prerender) fixture uygulaması `bilinmiyor` döner; oturum
   * `sessionStorage`'da olduğu için sunucu onu göremez.
   */
  oturumuCoz(): Promise<OturumCozumu>
  /**
   * Son bilinen oturumun senkron okuması.
   *
   * @deprecated Yalnız fixture içi kullanım ve testler için. Render yolunda
   * KULLANMAYIN — `oturumuCoz()` yetkili kaynaktır. İP-5'te gerçek adapter
   * geldiğinde bu yöntem arayüzden kaldırılacak.
   */
  oturumuGetir(): Oturum | null
  cikisYap(): void
}

const DEMO_OTURUM: Oturum = {
  kullaniciId: 'demo-1',
  adSoyad: 'Mehmet Yılmaz',
  telefon: '5551112233',
  ePosta: 'demo@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'beklemede',
}

/** Fixture aşamasında kabul edilen tek doğrulama kodu. */
const DEMO_KOD = '000000'
const DEMO_PAROLA = 'arsam1234'
/** Fixture aşamasında kabul edilen tek parola sıfırlama token'ı. */
const DEMO_SIFIRLAMA_TOKENI = 'demo-token'
/** Fixture davet token'ı — `/davet/demo-davet` çalışır, diğerleri geçersizdir. */
const DEMO_DAVET_TOKENI = 'demo-davet'
/** Fixture e-posta değişikliği onay token'ı. */
const DEMO_EPOSTA_TOKENI = 'demo-eposta'
const DEMO_DAVET: DavetOzeti = {
  organizasyonAdi: 'Yılmaz Gayrimenkul',
  davetEden: 'Mehmet Yılmaz',
  rol: 'danisman',
}
const DEMO_ORGANIZASYONLAR: readonly Organizasyon[] = [
  { id: 'org-1', ad: 'Yılmaz Gayrimenkul', rol: 'sahip' },
  { id: 'org-2', ad: 'Ege Arsa Ofisi', rol: 'yonetici' },
  { id: 'org-3', ad: 'Başkent Emlak', rol: 'danisman' },
]
/** Aynı token'ın süresi dolmuş hâlini denemek için — `/parola-sifirla/gecersiz` akışı. */
const DEMO_SURESI_DOLMUS_TOKEN = 'demo-token-eski'
/** Fixture hız sınırı: bu kadar tekrar gönderimden sonra `cok-fazla-deneme`. */
const TEKRAR_GONDERME_SINIRI = 3
const OTURUM_ANAHTARI = 'arsam.oturum'

const telefonGecerli = (ham: string) => /^5\d{9}$/.test(ham.replace(/\s/g, ''))
const ePostaGecerli = (ham: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ham.trim())

function telefonMaskele(ham: string): string {
  const t = ham.replace(/\s/g, '')
  return `${t.slice(0, 3)} *** ${t.slice(6, 8)} ${t.slice(8, 10)}`
}

function ePostaMaskele(ham: string): string {
  const [ad, alan] = ham.trim().split('@')
  return `${ad.slice(0, 2)}***@${alan}`
}

function oturumuYaz(oturum: Oturum | null) {
  if (typeof sessionStorage === 'undefined') return
  if (oturum) sessionStorage.setItem(OTURUM_ANAHTARI, JSON.stringify(oturum))
  else sessionStorage.removeItem(OTURUM_ANAHTARI)
}

/**
 * Fixture uygulaması — gerçek kimlik sağlayıcı bağlanana kadar geçerlidir.
 * Gerçek API geldiğinde YALNIZ bu dosya değişir; sayfalar `AuthAdapters`
 * arayüzünü tükettiği için dokunulmaz.
 */
function authAdaptersOlustur(): AuthAdapters {
  let bekleyenKimlik: string | null = null
  let aktifOturum: Oturum | null = null
  /** Aynı kimlik için kaç kez tekrar kod istendiği — fixture hız sınırı. */
  let tekrarGondermeSayisi = 0

  /** Aktif oturumu döndürür; bellekte yoksa sessionStorage'dan okur. */
  function mevcutOturum(): Oturum | null {
    if (aktifOturum) return aktifOturum
    if (typeof sessionStorage === 'undefined') return null
    const ham = sessionStorage.getItem(OTURUM_ANAHTARI)
    if (!ham) return null
    try {
      aktifOturum = JSON.parse(ham) as Oturum
      return aktifOturum
    } catch {
      sessionStorage.removeItem(OTURUM_ANAHTARI)
      return null
    }
  }

  return {
    async girisBaslat(yontem, kimlik) {
      if (yontem === 'telefon') {
        if (!telefonGecerli(kimlik)) {
          return {
            durum: 'hata',
            kod: 'gecersiz-kimlik',
            mesaj: 'Telefon numarasını 5XX XXX XX XX biçiminde girin.',
          }
        }
        bekleyenKimlik = kimlik.replace(/\s/g, '')
        tekrarGondermeSayisi = 0
        return {
          durum: 'basarili',
          veri: { kanal: 'sms', maskeliKimlik: telefonMaskele(kimlik) },
        }
      }

      return {
        durum: 'basarili',
        veri: { kanal: 'yonlendirme', maskeliKimlik: '' },
      }
    },

    async kodTekrarGonder() {
      if (!bekleyenKimlik) {
        return {
          durum: 'hata',
          kod: 'kod-suresi-doldu',
          mesaj: 'Oturum isteği bulunamadı. Numaranızı yeniden girin.',
        }
      }
      if (tekrarGondermeSayisi >= TEKRAR_GONDERME_SINIRI) {
        return {
          durum: 'hata',
          kod: 'cok-fazla-deneme',
          mesaj: 'Çok fazla kod istediniz. Bir süre sonra tekrar deneyin.',
        }
      }
      tekrarGondermeSayisi += 1
      return {
        durum: 'basarili',
        veri: { kanal: 'sms', maskeliKimlik: telefonMaskele(bekleyenKimlik) },
      }
    },

    async koduDogrula(kod) {
      if (!bekleyenKimlik) {
        return {
          durum: 'hata',
          kod: 'kod-suresi-doldu',
          mesaj: 'Kodun süresi doldu. Yeni kod isteyin.',
        }
      }
      if (kod.trim() !== DEMO_KOD) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kod',
          mesaj: 'Kod hatalı. Tekrar deneyin.',
        }
      }
      aktifOturum = { ...DEMO_OTURUM, telefon: bekleyenKimlik }
      bekleyenKimlik = null
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async parolaIleGiris(ePosta, parola) {
      if (!ePostaGecerli(ePosta) || parola !== DEMO_PAROLA) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'E-posta veya parola hatalı.',
        }
      }
      aktifOturum = { ...DEMO_OTURUM, ePosta: ePosta.trim() }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async kayitYap(bilgiler) {
      const alanHatalari = kayitBilgileriniDogrula(bilgiler)
      if (Object.keys(alanHatalari).length > 0) {
        return {
          durum: 'hata',
          kod: 'eksik-alan',
          mesaj: 'Formda düzeltilmesi gereken alanlar var.',
        }
      }
      // Fixture: yalnız demo hesabı "zaten kayıtlı" sayılır.
      if (bilgiler.ePosta.trim().toLowerCase() === DEMO_OTURUM.ePosta) {
        return {
          durum: 'hata',
          kod: 'hesap-zaten-var',
          mesaj: 'Bu e-posta adresiyle bir hesap zaten var.',
        }
      }
      aktifOturum = {
        kullaniciId: `uye-${bilgiler.ePosta.trim().toLowerCase()}`,
        adSoyad: bilgiler.adSoyad.trim(),
        telefon: bilgiler.telefon.replace(/\s/g, ''),
        ePosta: bilgiler.ePosta.trim(),
        hesapTipi: bilgiler.hesapTipi,
        eidsDurumu: 'yok',
      }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async profilTamamla(adSoyad, ePosta) {
      const oturum = mevcutOturum()
      if (!oturum) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'Oturum bulunamadı. Yeniden giriş yapın.',
        }
      }
      if (!adSoyad.trim() || !ePosta.trim()) {
        return { durum: 'hata', kod: 'eksik-alan', mesaj: 'Ad soyad ve e-posta zorunludur.' }
      }
      aktifOturum = { ...oturum, adSoyad: adSoyad.trim(), ePosta: ePosta.trim() }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async kurumsalBasvuruGonder(bilgiler) {
      const oturum = mevcutOturum()
      if (!oturum) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'Oturum bulunamadı. Yeniden giriş yapın.',
        }
      }
      const alanHatalari = kurumsalBasvuruyuDogrula(bilgiler)
      if (Object.keys(alanHatalari).length > 0) {
        return {
          durum: 'hata',
          kod: 'eksik-alan',
          mesaj: 'Formda düzeltilmesi gereken alanlar var.',
        }
      }
      aktifOturum = { ...oturum, hesapTipi: 'kurumsal', eidsDurumu: 'beklemede' }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async eidsDogrulamaBaslat() {
      const oturum = mevcutOturum()
      if (!oturum) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'Oturum bulunamadı. Yeniden giriş yapın.',
        }
      }
      aktifOturum = { ...oturum, eidsDurumu: 'dogrulandi' }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async parolaSifirlamaIste(ePosta) {
      if (!ePostaGecerli(ePosta)) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'Geçerli bir e-posta adresi girin.',
        }
      }
      // Hesabın var olup olmadığına BAKILMAZ. Var olmayan adres için hata
      // dönmek, bu ucu "bu e-posta kayıtlı mı?" sorgusuna çevirirdi.
      return {
        durum: 'basarili',
        veri: { maskeliEPosta: ePostaMaskele(ePosta) },
      }
    },

    async parolaSifirla(token, yeniParola) {
      if (token === DEMO_SURESI_DOLMUS_TOKEN) {
        return {
          durum: 'hata',
          kod: 'token-suresi-doldu',
          mesaj: 'Bu bağlantının süresi dolmuş. Yeni bir bağlantı isteyin.',
        }
      }
      if (token !== DEMO_SIFIRLAMA_TOKENI) {
        return {
          durum: 'hata',
          kod: 'gecersiz-token',
          mesaj: 'Bu bağlantı geçersiz. Yeni bir bağlantı isteyin.',
        }
      }
      // Parola kuralı kayıt formuyla AYNI kaynaktan gelir; ayrışırsa kullanıcı
      // kayıtta kabul edilen parolayı burada reddedilmiş bulur.
      const parolaSorunu = parolaHatasi(yeniParola)
      if (parolaSorunu) {
        return { durum: 'hata', kod: 'eksik-alan', mesaj: parolaSorunu }
      }
      return { durum: 'basarili', veri: null }
    },

    async googleGirisiTamamla(kod) {
      if (!kod.trim()) {
        return {
          durum: 'hata',
          kod: 'gecersiz-token',
          mesaj: 'Google girişi tamamlanamadı. Tekrar deneyin.',
        }
      }
      aktifOturum = { ...DEMO_OTURUM, ePosta: 'demo@gmail.com' }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async davetiGetir(token) {
      if (token !== DEMO_DAVET_TOKENI) {
        return {
          durum: 'hata',
          kod: 'gecersiz-token',
          mesaj: 'Bu davet bağlantısı geçersiz veya süresi dolmuş.',
        }
      }
      return { durum: 'basarili', veri: DEMO_DAVET }
    },

    async davetiKabulEt(token) {
      if (token !== DEMO_DAVET_TOKENI) {
        return {
          durum: 'hata',
          kod: 'gecersiz-token',
          mesaj: 'Bu davet bağlantısı geçersiz veya süresi dolmuş.',
        }
      }
      const oturum = mevcutOturum()
      if (!oturum) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'Daveti kabul etmek için giriş yapın.',
        }
      }
      aktifOturum = {
        ...oturum,
        hesapTipi: 'kurumsal',
        organizasyon: { id: 'org-1', ad: DEMO_DAVET.organizasyonAdi, rol: DEMO_DAVET.rol },
      }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async organizasyonlariGetir() {
      if (!mevcutOturum()) {
        return { durum: 'hata', kod: 'gecersiz-kimlik', mesaj: 'Oturum bulunamadı.' }
      }
      return { durum: 'basarili', veri: DEMO_ORGANIZASYONLAR }
    },

    async organizasyonSec(organizasyonId) {
      const oturum = mevcutOturum()
      if (!oturum) {
        return { durum: 'hata', kod: 'gecersiz-kimlik', mesaj: 'Oturum bulunamadı.' }
      }
      const secilen = DEMO_ORGANIZASYONLAR.find((org) => org.id === organizasyonId)
      if (!secilen) {
        return { durum: 'hata', kod: 'yetkisiz', mesaj: 'Bu organizasyona erişiminiz yok.' }
      }
      aktifOturum = { ...oturum, organizasyon: secilen }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async parolaDegistir(mevcutParola, yeniParola) {
      if (!mevcutOturum()) {
        return { durum: 'hata', kod: 'gecersiz-kimlik', mesaj: 'Oturum bulunamadı.' }
      }
      if (mevcutParola !== DEMO_PAROLA) {
        return { durum: 'hata', kod: 'parola-yanlis', mesaj: 'Mevcut parolanız hatalı.' }
      }
      // Kayıt/sıfırlama ile AYNI kural kaynağı.
      const parolaSorunu = parolaHatasi(yeniParola)
      if (parolaSorunu) {
        return { durum: 'hata', kod: 'eksik-alan', mesaj: parolaSorunu }
      }
      return { durum: 'basarili', veri: null }
    },

    async ePostaDegisikliginiDogrula(token) {
      if (token !== DEMO_EPOSTA_TOKENI) {
        return {
          durum: 'hata',
          kod: 'gecersiz-token',
          mesaj: 'Bu doğrulama bağlantısı geçersiz veya süresi dolmuş.',
        }
      }
      const oturum = mevcutOturum()
      if (!oturum) {
        return { durum: 'hata', kod: 'gecersiz-kimlik', mesaj: 'Doğrulama için giriş yapın.' }
      }
      aktifOturum = { ...oturum, ePosta: 'yeni@arsam.net' }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async oturumuCoz(): Promise<OturumCozumu> {
      // Sunucuda (SSR ve statik prerender) `sessionStorage` yoktur; oturum
      // orada GÖRÜLEMEZ, "yok" ile karıştırılmamalı. `bilinmiyor` dönmek hem
      // guard'ın oturumlu kullanıcıyı yanlışlıkla dışarı atmasını engeller hem
      // de istemcinin ilk render'ıyla aynı ağacı üretip hidrasyonu korur.
      if (typeof sessionStorage === 'undefined') return { durum: 'bilinmiyor' }
      const oturum = mevcutOturum()
      return oturum ? { durum: 'kimlikli', oturum } : { durum: 'anonim' }
    },

    oturumuGetir() {
      return mevcutOturum()
    },

    cikisYap() {
      aktifOturum = null
      bekleyenKimlik = null
      oturumuYaz(null)
    },
  }
}

export const varsayilanAuthAdapters: AuthAdapters = authAdaptersOlustur()
