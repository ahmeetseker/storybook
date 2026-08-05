import { describe, expect, it } from 'vitest'
import {
  TELEFON_ULKELERI,
  telefonUlkesi,
  telefonuBicimlendir,
  telefonuNormallestir,
  telefonuUluslararasiGoster,
  ulkeTelefonHatasi,
} from './telefon-ulkeler'

describe('ülke kayıt defteri', () => {
  it('Türkiye listenin başındadır, gerisi Türkçe alfabetik sıradadır', () => {
    expect(TELEFON_ULKELERI[0].kod).toBe('TR')
    const gerisi = TELEFON_ULKELERI.slice(1).map((ulke) => ulke.ad)
    expect(gerisi).toEqual([...gerisi].sort((a, b) => a.localeCompare(b, 'tr')))
  })

  it('ülke kodları benzersizdir', () => {
    const kodlar = TELEFON_ULKELERI.map((ulke) => ulke.kod)
    expect(new Set(kodlar).size).toBe(kodlar.length)
  })

  it('her ülkenin örnek numarası kendi kuralından geçer', () => {
    for (const ulke of TELEFON_ULKELERI) {
      expect(ulkeTelefonHatasi(ulke.ornek, ulke.kod), `${ulke.ad} örneği kendi kuralını geçmiyor`).toBeUndefined()
    }
  })

  it('tanınmayan kod Türkiye’ye düşer', () => {
    expect(telefonUlkesi('ZZ').kod).toBe('TR')
  })
})

describe('normalleştirme', () => {
  it('aynı numaranın her yazımını tek biçime indirger', () => {
    for (const yazim of ['5321234567', '0532 123 45 67', '+90 532 123 45 67', '0090-532-1234567']) {
      expect(telefonuNormallestir(yazim, 'TR'), yazim).toBe('5321234567')
    }
  })

  it('kendi arama koduyla başlayan ulusal numarayı kesmez', () => {
    // Kazakistan'ın arama kodu +7 ve numaraları da 7 ile başlar; kör bir
    // "arama kodunu at" kuralı geçerli numaranın ilk hanesini yerdi.
    expect(telefonuNormallestir('7011234567', 'KZ')).toBe('7011234567')
    expect(telefonuNormallestir('+77011234567', 'KZ')).toBe('7011234567')
  })

  it('tek başına yazılan sıfırı silmez — kullanıcı numarayı yazmaya yeni başlamıştır', () => {
    expect(telefonuNormallestir('0', 'TR')).toBe('0')
  })
})

describe('biçimlendirme', () => {
  it('Türkiye numarasını 3-3-2-2 gruplar', () => {
    expect(telefonuBicimlendir('5321234567', 'TR')).toBe('532 123 45 67')
    expect(telefonuUluslararasiGoster('05321234567', 'TR')).toBe('+90 532 123 45 67')
  })

  it('grup tanımı olmayan ülkede üçerli böler', () => {
    expect(telefonuBicimlendir('15123456789', 'DE')).toBe('151 234 567 89')
  })

  it('boş değer boş kalır — özet satırı "+90" diye yalnız kod göstermez', () => {
    expect(telefonuBicimlendir('', 'TR')).toBe('')
    expect(telefonuUluslararasiGoster('', 'TR')).toBe('')
  })
})

describe('doğrulama', () => {
  it('Türkiye’de yalnız mobil hattı kabul eder ve kendi metnini verir', () => {
    expect(ulkeTelefonHatasi('5321234567', 'TR')).toBeUndefined()
    expect(ulkeTelefonHatasi('2321234567', 'TR')).toBe(
      'Telefon numarasını 5XX XXX XX XX biçiminde girin.',
    )
  })

  it('diğer ülkelerde hane sayısını sınar ve hata metninde örnek numara verir', () => {
    expect(ulkeTelefonHatasi('15123456789', 'DE')).toBeUndefined()
    const hata = ulkeTelefonHatasi('123', 'DE')
    expect(hata).toContain('Almanya')
    expect(hata).toContain('+49 151 234 567 89')
  })

  it('bir ülkenin numarası başka ülkede geçerli sayılmaz', () => {
    expect(ulkeTelefonHatasi('15123456789', 'TR')).toBeTruthy()
    expect(ulkeTelefonHatasi('5321234567', 'DK')).toBeTruthy()
  })
})
