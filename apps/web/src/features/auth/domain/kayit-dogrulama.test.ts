import { describe, expect, it } from 'vitest'
import { kayitBilgileriniDogrula, kurumsalBasvuruyuDogrula } from './kayit-dogrulama'
import type { KayitBilgileri, KurumsalBasvuruBilgileri } from './auth-types'
import { gecerliKurumsalBasvuru } from '../test-utils'

const gecerliKayit: KayitBilgileri = {
  adSoyad: 'Mehmet Yılmaz',
  ePosta: 'mehmet@arsam.net',
  telefon: '5551112233',
  telefonUlke: 'TR',
  parola: 'Arsam1234',
  hesapTipi: 'bireysel',
  kvkkOnayi: true,
}

const gecerliKurumsal: KurumsalBasvuruBilgileri = gecerliKurumsalBasvuru

describe('kayitBilgileriniDogrula', () => {
  it('geçerli bilgilerde hata döndürmez', () => {
    expect(kayitBilgileriniDogrula(gecerliKayit)).toEqual({})
  })

  it('boş ad soyadı yakalar', () => {
    const hatalar = kayitBilgileriniDogrula({ ...gecerliKayit, adSoyad: '  ' })
    expect(hatalar.adSoyad).toBeTruthy()
  })

  it('geçersiz e-postayı yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, ePosta: 'mehmet' }).ePosta).toBeTruthy()
  })

  it('geçersiz telefonu yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, telefon: '123' }).telefon).toBeTruthy()
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, telefon: '4551112233' }).telefon).toBeTruthy()
  })

  it('kısa parolayı yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, parola: 'Ar1' }).parola).toBeTruthy()
  })

  it('büyük harf veya rakam içermeyen parolayı yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, parola: 'arsamarsam' }).parola).toBeTruthy()
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, parola: 'ARSAMARSAM' }).parola).toBeTruthy()
  })

  it('KVKK onayı verilmediyse yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, kvkkOnayi: false }).kvkkOnayi).toBeTruthy()
  })

  it('hata mesajları Türkçedir ve alanı adlandırır', () => {
    const hatalar = kayitBilgileriniDogrula({ ...gecerliKayit, ePosta: '' })
    expect(hatalar.ePosta).toMatch(/e-posta/i)
  })
})

describe('kurumsalBasvuruyuDogrula', () => {
  it('geçerli başvuruda hata döndürmez', () => {
    expect(kurumsalBasvuruyuDogrula(gecerliKurumsal)).toEqual({})
  })

  it('zorunlu alanların boşluğunu yakalar', () => {
    const hatalar = kurumsalBasvuruyuDogrula({
      ...gecerliKurumsal,
      ticaretUnvani: '',
      vergiDairesi: '   ',
      yetkiBelgesiNo: '',
    })
    expect(hatalar.ticaretUnvani).toBeTruthy()
    expect(hatalar.vergiDairesi).toBeTruthy()
    expect(hatalar.yetkiBelgesiNo).toBeTruthy()
  })

  const sahis = { ...gecerliKurumsal, isletmeTuru: 'sahis' as const }

  it('şahıs işletmesinde vergi kimlik (10) ve TCKN (11) uzunluklarının ikisini de kabul eder', () => {
    // Emlak ofislerinin büyük bölümü şahıs işletmesidir ve vergi levhasında
    // TCKN taşır; 11 hane reddedilirse bu işletmeler başvuru yapamaz.
    expect(kurumsalBasvuruyuDogrula({ ...sahis, vergiNumarasi: '1234567890' }).vergiNumarasi).toBeUndefined()
    expect(kurumsalBasvuruyuDogrula({ ...sahis, vergiNumarasi: '12345678901' }).vergiNumarasi).toBeUndefined()
  })

  it('tüzel kişide vergi kimlik numarasını 10 haneye sabitler', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, vergiNumarasi: '12345678901' }).vergiNumarasi).toBeTruthy()
  })

  it('10 ve 11 dışındaki uzunlukları ve rakam olmayanı reddeder', () => {
    expect(kurumsalBasvuruyuDogrula({ ...sahis, vergiNumarasi: '123' }).vergiNumarasi).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...sahis, vergiNumarasi: '123456789012' }).vergiNumarasi).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...sahis, vergiNumarasi: 'abcdefghij' }).vergiNumarasi).toBeTruthy()
  })

  it('zorunlu onayları ister, ticari ileti iznini istemez', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, kvkkOnayi: false }).kvkkOnayi).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, temsilBeyani: false }).temsilBeyani).toBeTruthy()
    // Açık rıza gerektiren izin hizmetin koşulu yapılamaz.
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, iysOnayi: false })).toEqual({})
  })

  it('MERSİS ve ticaret sicilini yalnız tüzel kişide zorunlu tutar', () => {
    const bosKayit = { mersisNo: '', ticaretSicilNo: '' }
    expect(kurumsalBasvuruyuDogrula({ ...sahis, ...bosKayit })).toEqual({})

    const tuzelHatalari = kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, ...bosKayit })
    expect(tuzelHatalari.mersisNo).toBeTruthy()
    expect(tuzelHatalari.ticaretSicilNo).toBeTruthy()
  })

  it('şahıs işletmesinde MERSİS girilirse yine 16 hane ister', () => {
    expect(kurumsalBasvuruyuDogrula({ ...sahis, mersisNo: '123' }).mersisNo).toBeTruthy()
  })

  it('geçmiş tarihli yetki ve MYK belgelerini reddeder', () => {
    const gecmis = kurumsalBasvuruyuDogrula({
      ...gecerliKurumsal,
      yetkiBelgesiBitis: '2020-01-01',
      mykBelgeBitis: '2020-01-01',
    })
    expect(gecmis.yetkiBelgesiBitis).toBeTruthy()
    expect(gecmis.mykBelgeBitis).toBeTruthy()
  })

  it('sorumlu emlak danışmanı ve MYK belgesi olmadan geçirmez', () => {
    const hatalar = kurumsalBasvuruyuDogrula({
      ...gecerliKurumsal,
      sorumluDanismanAdSoyad: '',
      sorumluDanismanTckn: '',
      mykBelgeNo: '',
    })
    expect(hatalar.sorumluDanismanAdSoyad).toBeTruthy()
    expect(hatalar.sorumluDanismanTckn).toBeTruthy()
    expect(hatalar.mykBelgeNo).toBeTruthy()
  })

  it('ili serbest metin olarak kabul etmez, listeye karşı sınar', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, il: 'izmir' }).il).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, il: 'Bilinmeyen' }).il).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, il: 'İzmir' }).il).toBeUndefined()
  })

  it('ofis telefonunda sabit hattı kabul eder, yetkili telefonunda etmez', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, ofisTelefonu: '2321234567' }).ofisTelefonu).toBeUndefined()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, ofisTelefonu: '1231234567' }).ofisTelefonu).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, yetkiliTelefon: '2321234567' }).yetkiliTelefon).toBeTruthy()
  })

  it('KEP adresini tüzel kişide zorunlu, şahısta isteğe bağlı tutar', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, kepAdresi: '' }).kepAdresi).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...sahis, kepAdresi: '' }).kepAdresi).toBeUndefined()
    // Doluysa şahısta da biçim aranır.
    expect(kurumsalBasvuruyuDogrula({ ...sahis, kepAdresi: 'kep' }).kepAdresi).toBeTruthy()
  })

  it('web sitesini isteğe bağlı tutar ama biçimini arar', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, webSitesi: '' }).webSitesi).toBeUndefined()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, webSitesi: 'arsam.net' }).webSitesi).toBeTruthy()
  })

  it('yetkili e-postasını ve telefonunu doğrular', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, yetkiliEPosta: 'ayse' }).yetkiliEPosta).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, yetkiliTelefon: '123' }).yetkiliTelefon).toBeTruthy()
  })
})
