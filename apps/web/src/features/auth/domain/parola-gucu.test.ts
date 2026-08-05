import { describe, expect, it } from 'vitest'
import { PAROLA_KURALLARI, PUAN_ETIKETLERI, parolaGucunuOlc } from './parola-gucu'
import { parolaHatasi } from './kayit-dogrulama'

const kural = (parola: string, id: string) =>
  parolaGucunuOlc(parola).kurallar.find((k) => k.id === id)

describe('parolaGucunuOlc', () => {
  it('boş parolada puan 0, etiket ve duyuru boştur', () => {
    const durum = parolaGucunuOlc('')
    expect(durum.puan).toBe(0)
    expect(durum.etiket).toBe('')
    expect(durum.duyuru).toBe('')
    expect(durum.tahminEdilebilir).toBe(false)
  })

  it('her kural için ayrı bir kademe sunar', () => {
    expect(parolaGucunuOlc('').enYuksek).toBe(PAROLA_KURALLARI.length)
  })

  it('puan etiketleri kademe sayısıyla hizalıdır', () => {
    // Kural eklendiğinde etiket eklemeyi unutmak, en yüksek puanda etiketi
    // boşaltırdı — bu kontrol o sessiz kaymayı yakalar.
    expect(PUAN_ETIKETLERI).toHaveLength(PAROLA_KURALLARI.length + 1)
    expect(PUAN_ETIKETLERI[PAROLA_KURALLARI.length]).not.toBe('')
  })

  it('Türkçe büyük harfi büyük harf sayar', () => {
    expect(kural('İstasyon1', 'buyukHarf')?.saglandi).toBe(true)
    expect(kural('şğüöçı1aa', 'buyukHarf')?.saglandi).toBe(false)
  })

  it('asgari kuralları sağlayan parola beş üzerinden üç alır', () => {
    const durum = parolaGucunuOlc('Kavakli7')
    expect(durum.puan).toBe(3)
    expect(durum.etiket).toBe('Orta')
  })

  it('uzunluk ve sembol eklendikçe puan yükselir', () => {
    expect(parolaGucunuOlc('Kavaklidere7').puan).toBe(4)
    expect(parolaGucunuOlc('Kavaklidere7!').puan).toBe(5)
    expect(parolaGucunuOlc('Kavaklidere7!').etiket).toBe('Çok güçlü')
  })

  it('sık denenen kalıbı yakalar ve puanı 1e çeker', () => {
    // Beş kuralın dördünü sağlıyor ama sızıntı listelerinin başında.
    const durum = parolaGucunuOlc('Parola123!')
    expect(durum.tahminEdilebilir).toBe(true)
    expect(durum.puan).toBe(1)
    expect(durum.duyuru).toContain('sık denenen bir kalıp')
  })

  it('klavye dizisini ve karakter tekrarını tahmin edilebilir sayar', () => {
    expect(parolaGucunuOlc('Qwerty12').tahminEdilebilir).toBe(true)
    expect(parolaGucunuOlc('Aaaa1bcx').tahminEdilebilir).toBe(true)
    expect(parolaGucunuOlc('Kavakli7').tahminEdilebilir).toBe(false)
  })

  it('duyuru eksik zorunlu ve önerilen kuralları ayrı ayrı sayar', () => {
    const duyuru = parolaGucunuOlc('kavakli').duyuru
    expect(duyuru).toContain('Zorunlu, eksik:')
    expect(duyuru).toContain('En az bir büyük harf')
    expect(duyuru).toContain('Önerilen, eksik:')
  })

  it('zorunluların tamamı sağlandığında duyuru bunu söyler', () => {
    expect(parolaGucunuOlc('Kavakli7').duyuru).toContain('Zorunlu kuralların tamamı sağlandı')
  })
})

describe('güç ölçeği ile kabul eşiği ayrışmaz', () => {
  const ORNEKLER = [
    '',
    'a',
    'kisa1',
    'kavaklidere',
    'KAVAKLIDERE',
    'Kavakli7',
    'kavakli7',
    'Kavaklı7',
    'İstasyon1',
    'Kavaklidere7!',
    'Parola123!',
    '12345678',
  ]

  it.each(ORNEKLER)('%s: zorunlu kuralların tamamı sağlandıysa form da kabul eder', (parola) => {
    const zorunlularTamam = parolaGucunuOlc(parola).kurallar
      .filter((k) => k.zorunlu)
      .every((k) => k.saglandi)
    expect(parolaHatasi(parola) === undefined).toBe(zorunlularTamam)
  })
})
