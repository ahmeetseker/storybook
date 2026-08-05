import { describe, expect, it } from 'vitest'
import { korumaliRotaGuard } from './auth-guard'
import type { Oturum } from './auth-types'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'yok',
}

/**
 * `redirect()` seçenekleri `options` altında taşıyan bir nesne fırlatır:
 * `{ options: { to, search, statusCode } }`. Test onu yakalayıp içine bakar.
 */
interface YakalananYonlendirme {
  options?: { to?: string; search?: { donus?: string }; statusCode?: number }
}

function yakala(fn: () => void): YakalananYonlendirme | null {
  try {
    fn()
    return null
  } catch (hata) {
    return hata as YakalananYonlendirme
  }
}

describe('korumaliRotaGuard', () => {
  it('anonim oturumda /girise yönlendirir ve geldiği yolu donusta taşır', () => {
    const yonlendirme = yakala(() =>
      korumaliRotaGuard({ durum: 'anonim' }, '/hesabim/mesajlar'),
    )
    expect(yonlendirme, 'anonim oturumda yönlendirme bekleniyordu').toBeTruthy()
    expect(yonlendirme?.options?.to).toBe('/giris')
    expect(yonlendirme?.options?.search?.donus).toBe('/hesabim/mesajlar')
  })

  it('kimlikli oturumda geçişe izin verir', () => {
    expect(
      yakala(() => korumaliRotaGuard({ durum: 'kimlikli', oturum: ORNEK_OTURUM }, '/hesabim')),
    ).toBeNull()
  })

  // Bu, guardın en kolay yanlış yazılan kuralı: `bilinmiyor`u `anonim` gibi
  // ele almak, sunucuda render edilirken oturumu OLAN kullanıcıyı da dışarı
  // atardı — çünkü sunucu `sessionStorage`'ı göremez.
  it('bilinmiyor durumunda yönlendirmez', () => {
    expect(yakala(() => korumaliRotaGuard({ durum: 'bilinmiyor' }, '/hesabim'))).toBeNull()
  })

  it('donus hedefini sanitize eder — protokol-bağıl dış adres ana sayfaya düşer', () => {
    const yonlendirme = yakala(() => korumaliRotaGuard({ durum: 'anonim' }, '//kotu.example'))
    expect(yonlendirme?.options?.search?.donus).toBe('/')
  })

  it('donus hedefi olarak auth rotasını kabul etmez — giriş döngüsü kurulmaz', () => {
    const yonlendirme = yakala(() => korumaliRotaGuard({ durum: 'anonim' }, '/giris/kod'))
    expect(yonlendirme?.options?.search?.donus).toBe('/')
  })
})
