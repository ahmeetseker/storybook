import { beforeEach, describe, expect, it } from 'vitest'
import { varsayilanAuthAdapters } from './auth-adapters'
import type { KayitBilgileri } from '../domain/auth-types'
import { gecerliKurumsalBasvuru } from '../test-utils'

describe('varsayilanAuthAdapters', () => {
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('geçerli telefonla giriş başlatır ve kod gönderildi bilgisi döner', async () => {
    const sonuc = await varsayilanAuthAdapters.girisBaslat('telefon', '5551112233')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') {
      expect(sonuc.veri.kanal).toBe('sms')
      expect(sonuc.veri.maskeliKimlik).toBe('555 *** 22 33')
    }
  })

  it('geçersiz telefon numarasını reddeder', async () => {
    const sonuc = await varsayilanAuthAdapters.girisBaslat('telefon', '123')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-kimlik')
  })

  it('doğru kodla oturum açar', async () => {
    await varsayilanAuthAdapters.girisBaslat('telefon', '5551112233')
    const sonuc = await varsayilanAuthAdapters.koduDogrula('000000')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.telefon).toBe('5551112233')
    expect(varsayilanAuthAdapters.oturumuGetir()).not.toBeNull()
  })

  it('yanlış kodu reddeder ve oturum açmaz', async () => {
    await varsayilanAuthAdapters.girisBaslat('telefon', '5551112233')
    const sonuc = await varsayilanAuthAdapters.koduDogrula('999999')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-kod')
    expect(varsayilanAuthAdapters.oturumuGetir()).toBeNull()
  })

  it('giriş başlatılmadan kod doğrulanamaz', async () => {
    const sonuc = await varsayilanAuthAdapters.koduDogrula('000000')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('kod-suresi-doldu')
  })

  it('parolayla giriş yapar', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaIleGiris('demo@arsam.net', 'arsam1234')
    expect(sonuc.durum).toBe('basarili')
    expect(varsayilanAuthAdapters.oturumuGetir()).not.toBeNull()
  })

  it('yanlış parolayı reddeder', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaIleGiris('demo@arsam.net', 'yanlis')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-kimlik')
  })

  it('çıkışta oturumu temizler', async () => {
    await varsayilanAuthAdapters.parolaIleGiris('demo@arsam.net', 'arsam1234')
    varsayilanAuthAdapters.cikisYap()
    expect(varsayilanAuthAdapters.oturumuGetir()).toBeNull()
  })
})

const ORNEK_KAYIT: KayitBilgileri = {
  adSoyad: 'Yeni Kullanıcı',
  ePosta: 'yeni@arsam.net',
  telefon: '5559998877',
  telefonUlke: 'TR',
  parola: 'Arsam1234',
  hesapTipi: 'bireysel',
  kvkkOnayi: true,
}

describe('kayıt işlemleri', () => {
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('yeni hesap açar ve oturumu başlatır', async () => {
    const sonuc = await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') {
      expect(sonuc.veri.ePosta).toBe('yeni@arsam.net')
      expect(sonuc.veri.hesapTipi).toBe('bireysel')
      expect(sonuc.veri.eidsDurumu).toBe('yok')
    }
    expect(varsayilanAuthAdapters.oturumuGetir()).not.toBeNull()
  })

  it('zaten kayıtlı e-postayı reddeder', async () => {
    const sonuc = await varsayilanAuthAdapters.kayitYap({
      ...ORNEK_KAYIT,
      ePosta: 'demo@arsam.net',
    })
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('hesap-zaten-var')
    expect(varsayilanAuthAdapters.oturumuGetir()).toBeNull()
  })

  it('eksik alanla kayıt yapmaz', async () => {
    const sonuc = await varsayilanAuthAdapters.kayitYap({ ...ORNEK_KAYIT, adSoyad: '' })
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('eksik-alan')
  })

  it('kurumsal kayıtta hesap tipini korur', async () => {
    const sonuc = await varsayilanAuthAdapters.kayitYap({ ...ORNEK_KAYIT, hesapTipi: 'kurumsal' })
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.hesapTipi).toBe('kurumsal')
  })

  it('profil bilgilerini günceller', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.profilTamamla('Güncel İsim', 'guncel@arsam.net')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') {
      expect(sonuc.veri.adSoyad).toBe('Güncel İsim')
      expect(sonuc.veri.ePosta).toBe('guncel@arsam.net')
    }
  })

  it('oturum yokken profil güncellenemez', async () => {
    const sonuc = await varsayilanAuthAdapters.profilTamamla('Güncel İsim', 'guncel@arsam.net')
    expect(sonuc.durum).toBe('hata')
  })

  it('kurumsal başvuruyu alır ve EİDS durumunu beklemeye çeker', async () => {
    await varsayilanAuthAdapters.kayitYap({ ...ORNEK_KAYIT, hesapTipi: 'kurumsal' })
    const sonuc = await varsayilanAuthAdapters.kurumsalBasvuruGonder(gecerliKurumsalBasvuru)
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.eidsDurumu).toBe('beklemede')
  })

  it('EİDS doğrulamasını tamamlar', async () => {
    await varsayilanAuthAdapters.kayitYap({ ...ORNEK_KAYIT, hesapTipi: 'kurumsal' })
    const sonuc = await varsayilanAuthAdapters.eidsDogrulamaBaslat()
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.eidsDurumu).toBe('dogrulandi')
  })

  it('oturum yokken EİDS doğrulaması başlatılamaz', async () => {
    const sonuc = await varsayilanAuthAdapters.eidsDogrulamaBaslat()
    expect(sonuc.durum).toBe('hata')
  })
})

describe('parola sıfırlama (fixture)', () => {
  // Fixture adapter bir modül tekilidir; oturum testler arasında sızmasın.
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('geçersiz biçimli e-postayı reddeder', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaSifirlamaIste('bozuk')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-kimlik')
  })

  // Hesap sayımına (user enumeration) kapalı olmalı: kayıtlı olmayan bir
  // adres için hata dönmek, bu ucu "bu e-posta sistemde var mı?" sorgusuna
  // çevirirdi. Biçimi geçerli HER adres için başarı beklenir.
  it('kayıtlı olmayan adres için de başarı döner — hesap varlığını sızdırmaz', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaSifirlamaIste('hicyok@arsam.net')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.maskeliEPosta).toBe('hi***@arsam.net')
  })

  it('tanınmayan token gecersiz-token döner', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaSifirla('uydurma', 'Arsam1234')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-token')
  })

  it('süresi dolmuş token token-suresi-doldu döner', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaSifirla('demo-token-eski', 'Arsam1234')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('token-suresi-doldu')
  })

  it('geçerli token ama zayıf parola reddedilir — kayıtla aynı kural', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaSifirla('demo-token', 'kisa')
    expect(sonuc.durum).toBe('hata')
  })

  it('geçerli token ve kurala uyan parola kabul edilir', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaSifirla('demo-token', 'Arsam1234')
    expect(sonuc.durum).toBe('basarili')
  })
})

describe('kodu tekrar gönderme (fixture)', () => {
  // Fixture adapter bir modül tekilidir; oturum testler arasında sızmasın.
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('bekleyen kimlik yokken süre doldu hatası döner', async () => {
    const sonuc = await varsayilanAuthAdapters.kodTekrarGonder()
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('kod-suresi-doldu')
  })

  it('giriş başlatıldıktan sonra kodu yeniden gönderir', async () => {
    await varsayilanAuthAdapters.girisBaslat('telefon', '5551112233')
    const sonuc = await varsayilanAuthAdapters.kodTekrarGonder()
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.maskeliKimlik).toBe('555 *** 22 33')
  })

  it('sınırı aşan tekrar isteği cok-fazla-deneme döner', async () => {
    await varsayilanAuthAdapters.girisBaslat('telefon', '5551112233')
    await varsayilanAuthAdapters.kodTekrarGonder()
    await varsayilanAuthAdapters.kodTekrarGonder()
    await varsayilanAuthAdapters.kodTekrarGonder()
    const sonuc = await varsayilanAuthAdapters.kodTekrarGonder()
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('cok-fazla-deneme')
  })
})

describe('organizasyon ve davet (fixture)', () => {
  // Fixture adapter bir modül tekilidir; oturum testler arasında sızmasın.
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('tanınmayan davet tokenini reddeder', async () => {
    const sonuc = await varsayilanAuthAdapters.davetiGetir('uydurma')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-token')
  })

  it('geçerli davet özetini döndürür', async () => {
    const sonuc = await varsayilanAuthAdapters.davetiGetir('demo-davet')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.organizasyonAdi).toBeTruthy()
  })

  it('oturum yokken davet kabul edilemez', async () => {
    const sonuc = await varsayilanAuthAdapters.davetiKabulEt('demo-davet')
    expect(sonuc.durum).toBe('hata')
  })

  it('oturumluyken davet kabul edilince organizasyon atanır', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.davetiKabulEt('demo-davet')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') {
      expect(sonuc.veri.organizasyon?.ad).toBeTruthy()
      expect(sonuc.veri.hesapTipi).toBe('kurumsal')
    }
  })

  it('erişilmeyen organizasyon seçimi yetkisiz döner', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.organizasyonSec('org-yok')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('yetkisiz')
  })

  it('geçerli organizasyon seçimi oturuma yazılır', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.organizasyonSec('org-2')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.organizasyon?.id).toBe('org-2')
  })
})

describe('parola değiştirme ve e-posta doğrulama (fixture)', () => {
  // Fixture adapter bir modül tekilidir; oturum testler arasında sızmasın.
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('oturum yokken parola değiştirilemez', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaDegistir('arsam1234', 'Arsam5678')
    expect(sonuc.durum).toBe('hata')
  })

  it('mevcut parola yanlışsa parola-yanlis döner', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.parolaDegistir('yanlis', 'Arsam5678')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('parola-yanlis')
  })

  it('yeni parola kurala uymuyorsa reddedilir — kayıtla aynı kural', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.parolaDegistir('arsam1234', 'kisa')
    expect(sonuc.durum).toBe('hata')
  })

  it('doğru mevcut parola ve kurala uyan yeni parola kabul edilir', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.parolaDegistir('arsam1234', 'Arsam5678')
    expect(sonuc.durum).toBe('basarili')
  })

  it('geçerli token ile e-posta değişikliği oturuma yazılır', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.ePostaDegisikliginiDogrula('demo-eposta')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.ePosta).toBe('yeni@arsam.net')
  })

  it('geçersiz token reddedilir', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.ePostaDegisikliginiDogrula('bozuk')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-token')
  })
})

describe('Google girişi (fixture)', () => {
  // Fixture adapter bir modül tekilidir; oturum testler arasında sızmasın.
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('boş kod reddedilir', async () => {
    const sonuc = await varsayilanAuthAdapters.googleGirisiTamamla('')
    expect(sonuc.durum).toBe('hata')
  })

  it('kod ile oturum açılır', async () => {
    const sonuc = await varsayilanAuthAdapters.googleGirisiTamamla('demo-google-kod')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.ePosta).toContain('@')
  })
})
