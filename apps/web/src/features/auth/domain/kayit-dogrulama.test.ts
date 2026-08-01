import { describe, expect, it } from 'vitest'
import { kayitBilgileriniDogrula, kurumsalBasvuruyuDogrula } from './kayit-dogrulama'
import type { KayitBilgileri, KurumsalBasvuruBilgileri } from './auth-types'

const gecerliKayit: KayitBilgileri = {
  adSoyad: 'Mehmet Yılmaz',
  ePosta: 'mehmet@arsam.net',
  telefon: '5551112233',
  parola: 'Arsam1234',
  hesapTipi: 'bireysel',
  kvkkOnayi: true,
}

const gecerliKurumsal: KurumsalBasvuruBilgileri = {
  ticaretUnvani: 'Arsam Gayrimenkul Ltd. Şti.',
  vergiNumarasi: '1234567890',
  vergiDairesi: 'Konak',
  il: 'İzmir',
  ilce: 'Konak',
  yetkiBelgesiNo: 'YB-2026-0042',
  yetkiliAdSoyad: 'Ayşe Kaya',
  yetkiliEPosta: 'ayse@arsam.net',
  yetkiliTelefon: '5551112233',
}

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

  it('vergi numarasının 10 haneli rakam olmasını ister', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, vergiNumarasi: '123' }).vergiNumarasi).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, vergiNumarasi: 'abcdefghij' }).vergiNumarasi).toBeTruthy()
  })

  it('yetkili e-postasını ve telefonunu doğrular', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, yetkiliEPosta: 'ayse' }).yetkiliEPosta).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, yetkiliTelefon: '123' }).yetkiliTelefon).toBeTruthy()
  })
})
