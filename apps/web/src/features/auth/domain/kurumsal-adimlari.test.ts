import { describe, expect, it } from 'vitest'
import {
  KURUMSAL_ADIMLARI,
  KURUMSAL_ALAN_SIRASI,
  kurumsalAdimHatalari,
  kurumsalHataliAdimIndeksi,
} from './kurumsal-adimlari'
import { kurumsalBasvuruyuDogrula } from './kayit-dogrulama'
import type { KurumsalAlanHatalari, KurumsalBasvuruBilgileri } from './auth-types'
import { gecerliKurumsalBasvuru } from '../test-utils'

const BOS_BASVURU: KurumsalBasvuruBilgileri = {
  isletmeTuru: 'limited',
  ticaretUnvani: '',
  vergiNumarasi: '',
  vergiDairesi: '',
  mersisNo: '',
  ticaretSicilNo: '',
  yetkiBelgesiNo: '',
  yetkiBelgesiBitis: '',
  sorumluDanismanAdSoyad: '',
  sorumluDanismanTckn: '',
  mykBelgeNo: '',
  mykBelgeBitis: '',
  il: '',
  ilce: '',
  acikAdres: '',
  postaKodu: '',
  ofisTelefonu: '',
  kepAdresi: '',
  webSitesi: '',
  yetkiliAdSoyad: '',
  yetkiliEPosta: '',
  yetkiliTelefon: '',
  kvkkOnayi: false,
  temsilBeyani: false,
  iysOnayi: false,
}

describe('kurumsal adım sözleşmesi', () => {
  it('dört bölümden oluşur', () => {
    expect(KURUMSAL_ADIMLARI.map((adim) => adim.anahtar)).toEqual([
      'isletme',
      'yetki',
      'ofis',
      'onay',
    ])
  })

  /**
   * En kritik değişmez: doğrulamanın ürettiği HER hata anahtarının bir
   * bölümde karşılığı olmalı. Yeni bir alan eklenip adım eşlemesine
   * yazılmazsa hatası hiçbir bölümde gösterilmez ve kullanıcı, sebebini
   * göremediği bir formu gönderemez hâle gelir.
   */
  it('doğrulamanın ürettiği her hata bir bölüme düşer', () => {
    const tumHatalar = kurumsalBasvuruyuDogrula(BOS_BASVURU)
    const eslenenler = new Set(KURUMSAL_ALAN_SIRASI.map((alan) => alan.ad))
    const eslesmeyen = Object.keys(tumHatalar).filter((ad) => !eslenenler.has(ad))
    expect(eslesmeyen, `bu alanlar hiçbir bölümde görünmüyor: ${eslesmeyen.join(', ')}`).toEqual([])
  })

  it('her alan yalnız TEK bölüme aittir', () => {
    const adlar = KURUMSAL_ALAN_SIRASI.map((alan) => alan.ad)
    expect(adlar.length).toBe(new Set(adlar).size)
  })

  it('süzgeç yalnız verilen bölümün hatalarını döndürür', () => {
    const tumHatalar = kurumsalBasvuruyuDogrula(BOS_BASVURU)
    const isletme = kurumsalAdimHatalari(tumHatalar, KURUMSAL_ADIMLARI[0])
    expect(isletme.ticaretUnvani).toBeTruthy()
    expect(isletme.yetkiBelgesiNo).toBeUndefined()
    expect(isletme.kvkkOnayi).toBeUndefined()
  })

  /**
   * Son bölümdeki tam doğrulamanın güvenlik ağı: kullanıcı bölüm bölüm
   * ilerlediği için buraya geçerli veriyle gelir, ama önceki bir bölümün
   * alanı sonradan bozulursa akış o bölüme geri taşınmalıdır.
   */
  it('ilk hatalı bölümün indeksini bulur', () => {
    expect(kurumsalHataliAdimIndeksi({})).toBe(-1)

    const sadeceOfis: KurumsalAlanHatalari = { postaKodu: 'Posta kodu 5 haneli olmalı.' }
    expect(kurumsalHataliAdimIndeksi(sadeceOfis)).toBe(2)

    const hemIsletmeHemOnay: KurumsalAlanHatalari = {
      ticaretUnvani: 'Ticaret ünvanını girin.',
      kvkkOnayi: 'Onaylayın.',
    }
    expect(kurumsalHataliAdimIndeksi(hemIsletmeHemOnay)).toBe(0)
  })

  it('geçerli başvuruda hiçbir bölüm hatalı değildir', () => {
    expect(kurumsalHataliAdimIndeksi(kurumsalBasvuruyuDogrula(gecerliKurumsalBasvuru))).toBe(-1)
  })
})
