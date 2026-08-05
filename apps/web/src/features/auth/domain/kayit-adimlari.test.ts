import { describe, expect, it } from 'vitest'
import { kayitBilgileriniDogrula } from './kayit-dogrulama'
import {
  KAYIT_ADIMLARI,
  TUM_ALAN_SIRASI,
  adimHatalari,
  hataliAdimIndeksi,
  kayitSeridi,
} from './kayit-adimlari'
import type { KayitBilgileri } from './auth-types'

const BOS_BILGILER: KayitBilgileri = {
  adSoyad: '',
  ePosta: '',
  telefon: '',
  telefonUlke: 'TR',
  parola: '',
  hesapTipi: 'bireysel',
  kvkkOnayi: false,
}

const GECERLI_BILGILER: KayitBilgileri = {
  adSoyad: 'Ayşe Kaya',
  ePosta: 'ayse@arsam.net',
  telefon: '5551112233',
  telefonUlke: 'TR',
  parola: 'Arsam1234',
  hesapTipi: 'bireysel',
  kvkkOnayi: true,
}

describe('kayıt adım sözleşmesi', () => {
  it('doğrulamanın ürettiği her alan tam olarak bir adıma düşer', () => {
    const hatalar = kayitBilgileriniDogrula(BOS_BILGILER)
    const adimAlanlari = KAYIT_ADIMLARI.flatMap((adim) => adim.alanlar.map((alan) => alan.ad))
    for (const ad of Object.keys(hatalar)) {
      expect(adimAlanlari.filter((alan) => alan === ad), `${ad} adımlara eşlenmemiş`).toHaveLength(1)
    }
  })

  it('adım süzgeci yalnız o adımın alanlarının hatasını döndürür', () => {
    const hatalar = kayitBilgileriniDogrula(BOS_BILGILER)
    const kimlik = adimHatalari(hatalar, KAYIT_ADIMLARI[1])
    expect(Object.keys(kimlik).sort()).toEqual(['adSoyad', 'ePosta'])

    const iletisim = adimHatalari(hatalar, KAYIT_ADIMLARI[2])
    expect(Object.keys(iletisim).sort()).toEqual(['parola', 'telefon'])

    const onay = adimHatalari(hatalar, KAYIT_ADIMLARI[3])
    expect(Object.keys(onay)).toEqual(['kvkkOnayi'])
  })

  it('hesap tipi adımı doğrulamadan hata almaz — radyo her zaman doludur', () => {
    const hatalar = kayitBilgileriniDogrula(BOS_BILGILER)
    expect(adimHatalari(hatalar, KAYIT_ADIMLARI[0])).toEqual({})
  })

  it('ilk hatalı adımın indeksi görsel sıraya göre bulunur', () => {
    expect(hataliAdimIndeksi(kayitBilgileriniDogrula(BOS_BILGILER))).toBe(1)
    expect(
      hataliAdimIndeksi(kayitBilgileriniDogrula({ ...GECERLI_BILGILER, parola: 'kisa' })),
    ).toBe(2)
    expect(
      hataliAdimIndeksi(kayitBilgileriniDogrula({ ...GECERLI_BILGILER, kvkkOnayi: false })),
    ).toBe(3)
    expect(hataliAdimIndeksi(kayitBilgileriniDogrula(GECERLI_BILGILER))).toBe(-1)
  })

  it('alan sırası sayfadaki görsel sırayı yansıtır', () => {
    expect(TUM_ALAN_SIRASI.map((alan) => alan.ad)).toEqual([
      'hesapTipi',
      'adSoyad',
      'ePosta',
      'telefon',
      'parola',
      'kvkkOnayi',
    ])
  })

  it('şerit dala göre uzar: /kayit dört, profil beş, kurumsal altı adım', () => {
    expect(kayitSeridi()).toHaveLength(4)
    expect(kayitSeridi('profil')).toHaveLength(5)
    expect(kayitSeridi('kurumsal')).toHaveLength(6)
    expect(kayitSeridi('kurumsal')[4].baslik).toBe('Emlak ofisi bilgileri')
    expect(kayitSeridi('kurumsal')[5].baslik).toBe('EİDS doğrulaması')
  })
})
