import { beforeEach, describe, expect, it } from 'vitest'
import { dockYanit, taslakYanit } from './ai-dock-engine'
import { listAppointments, resetAppointmentStore } from '../../features/appointments/data/appointment-store'

beforeEach(() => {
  resetAppointmentStore()
})

describe('ai-dock-engine — niyet yönlendirme', () => {
  it('ilan araması: kriterli soru "searching" durumu ve ilan kartı verisi döner', () => {
    const yanit = dockYanit('İzmir tarafında imarlı arsa arıyorum, bütçem 5 milyon')
    expect(yanit.durum.durum).toBe('searching')
    expect(yanit.durum.etiket).toBe('İlanlar aranıyor…')
    // Eşleşme bulunduysa kartlar, bulunamadıysa arama sayfası bağlantısı döner —
    // iki durumda da kullanıcı bir sonraki adımı alır.
    if (yanit.zengin) {
      expect(yanit.zengin.tur).toBe('ilanlar')
      if (yanit.zengin.tur === 'ilanlar') {
        expect(yanit.zengin.ilanlar.length).toBeGreaterThan(0)
        expect(yanit.zengin.ilanlar.length).toBeLessThanOrEqual(2)
      }
    } else {
      expect(yanit.baglanti?.yol).toBe('/arsa-ara')
    }
  })

  it('harcama sorusu: bar grafik verisiyle "solving" durumu döner', () => {
    const yanit = dockYanit('Bu ay ne kadar harcama yaptım?')
    expect(yanit.durum.durum).toBe('solving')
    expect(yanit.zengin?.tur).toBe('grafik')
    if (yanit.zengin?.tur === 'grafik') {
      expect(yanit.zengin.tip).toBe('bar')
      expect(yanit.zengin.noktalar.length).toBe(6)
    }
    expect(yanit.baglanti?.yol).toBe('/hesabim/odemeler')
  })

  it('favori indirim sorusu: fiyatı düşen ilan kartları döner', () => {
    const yanit = dockYanit('Favori ilanlarımda indirim var mı?')
    expect(yanit.durum.etiket).toBe('Favorileriniz taranıyor…')
    expect(yanit.zengin?.tur).toBe('ilanlar')
    if (yanit.zengin?.tur === 'ilanlar') expect(yanit.zengin.ilanlar.length).toBe(2)
    expect(yanit.metin).toContain('fiyat düşüşü')
  })

  it('randevu sorgusu (kayıt yokken): yönlendirici yanıt + Ofisler bağlantısı', () => {
    const yanit = dockYanit('Randevum var mı?')
    expect(yanit.durum.durum).toBe('searching')
    expect(yanit.metin).toContain('Kayıtlı bir randevunuz görünmüyor')
    expect(yanit.baglanti?.yol).toBe('/ofisler')
  })

  it('randevu oluşturma: appointment-store\'a kayıt açar ve onay içeriği döner', () => {
    const yanit = dockYanit('Bana bir ofise randevu oluştur')
    expect(yanit.durum.durum).toBe('connecting')
    expect(yanit.zengin?.tur).toBe('randevu')
    const kayitlar = listAppointments()
    expect(kayitlar.length).toBe(1)
    expect(kayitlar[0].note).toBe('AI danışman sohbetinden oluşturuldu')
    expect(yanit.baglanti?.yol).toBe('/hesabim/randevularim')
  })

  it('randevu oluşturduktan sonra sorgu, kaydı listeler', () => {
    dockYanit('randevu oluştur')
    const yanit = dockYanit('randevum var mı')
    expect(yanit.metin).toContain('1 aktif randevunuz var')
  })

  it('emlak endeksi sorusu: sparkline eğilimiyle "composing" durumu döner', () => {
    const yanit = dockYanit('Emlak endeksi hakkında ne düşünüyorsun?')
    expect(yanit.durum.durum).toBe('composing')
    expect(yanit.zengin?.tur).toBe('egilim')
    if (yanit.zengin?.tur === 'egilim') expect(yanit.zengin.trend).toBe('up')
    expect(yanit.baglanti?.yol).toBe('/emlak-endeksi')
  })

  it('alınır mı / amorti sorusu: metrik şeridiyle yatırım analizi döner', () => {
    const yanit = dockYanit('Bu ev alınır mı, kaç yılda amorti eder?')
    expect(yanit.durum.durum).toBe('solving')
    expect(yanit.zengin?.tur).toBe('metrikler')
    if (yanit.zengin?.tur === 'metrikler') expect(yanit.zengin.ogeler.length).toBe(3)
    expect(yanit.metin).toContain('amorti')
  })

  it('tarla bölge değerlendirmesi: arama değil yorum döner', () => {
    const yanit = dockYanit('Tarla bölgesel olarak iyi mi sence?')
    expect(yanit.durum.durum).toBe('breathing')
    expect(yanit.zengin).toBeUndefined()
    expect(yanit.metin).toContain('imar planı beklentisi')
  })

  it('ofis önerisi: en yüksek puanlı ofisi anar, randevu ipucu verir', () => {
    const yanit = dockYanit('Bana uygun bir ofis önerir misin?')
    expect(yanit.durum.durum).toBe('connecting')
    expect(yanit.metin).toContain('randevu oluştur')
    expect(yanit.baglanti?.yol).toBe('/ofisler')
  })

  it('serbest sohbet: eski taslak yanıt "working" durumuyla döner', () => {
    const yanit = dockYanit('merhaba')
    expect(yanit.durum.durum).toBe('working')
    expect(yanit.metin).toBe(taslakYanit('merhaba'))
    expect(yanit.zengin).toBeUndefined()
  })
})
