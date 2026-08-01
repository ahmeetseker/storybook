import { beforeEach, describe, expect, it } from 'vitest'
import { varsayilanAuthAdapters } from './auth-adapters'
import type { KayitBilgileri, KurumsalBasvuruBilgileri } from '../domain/auth-types'

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
    const sonuc = await varsayilanAuthAdapters.kurumsalBasvuruGonder({
      ticaretUnvani: 'Arsam Gayrimenkul Ltd. Şti.',
      vergiNumarasi: '1234567890',
      vergiDairesi: 'Konak',
      il: 'İzmir',
      ilce: 'Konak',
      yetkiBelgesiNo: 'YB-2026-0042',
      yetkiliAdSoyad: 'Ayşe Kaya',
      yetkiliEPosta: 'ayse@arsam.net',
      yetkiliTelefon: '5551112233',
    })
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
