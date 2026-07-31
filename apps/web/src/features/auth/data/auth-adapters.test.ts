import { beforeEach, describe, expect, it } from 'vitest'
import { varsayilanAuthAdapters } from './auth-adapters'

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
