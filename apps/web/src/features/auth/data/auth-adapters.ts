import type { AuthSonuc, GirisYontemi, Oturum } from '../domain/auth-types'

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
  koduDogrula(kod: string): Promise<AuthSonuc<Oturum>>
  parolaIleGiris(ePosta: string, parola: string): Promise<AuthSonuc<Oturum>>
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
        return {
          durum: 'basarili',
          veri: { kanal: 'sms', maskeliKimlik: telefonMaskele(kimlik) },
        }
      }

      if (yontem === 'baglanti') {
        if (!ePostaGecerli(kimlik)) {
          return {
            durum: 'hata',
            kod: 'gecersiz-kimlik',
            mesaj: 'Geçerli bir e-posta adresi girin.',
          }
        }
        bekleyenKimlik = kimlik.trim()
        return {
          durum: 'basarili',
          veri: { kanal: 'e-posta', maskeliKimlik: ePostaMaskele(kimlik) },
        }
      }

      return {
        durum: 'basarili',
        veri: { kanal: 'yonlendirme', maskeliKimlik: '' },
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

    oturumuGetir() {
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
    },

    cikisYap() {
      aktifOturum = null
      bekleyenKimlik = null
      oturumuYaz(null)
    },
  }
}

export const varsayilanAuthAdapters: AuthAdapters = authAdaptersOlustur()
