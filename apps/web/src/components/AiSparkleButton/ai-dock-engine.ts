// AI danışman dock motoru — soruyu niyete yönlendirir, saf VERİ döndürür.
//
// Bilinçli katman ayrımı: bu modül React'e dokunmaz. Zengin içerik
// (`DockZengin`) bir veri sözleşmesidir; DS bileşenlerine çevirme işi
// `AiDockIcerik.tsx`'te yaşar. Böylece niyet yönlendirme, DOM'suz birim
// testleriyle doğrulanır.
//
// Yanıtlar TASLAK: gerçek AI akışı bağlanana dek alan diline uygun kural
// tabanlı üretim. Veri kaynakları gerçek mock'lar — ilanlar `LISTING_FIXTURES`,
// ofisler `OFFICE_FIXTURES`, randevular `appointment-store` (localStorage).
import type { GlassChatDockPendingState } from '@repo/ui'
import { parseAdvisorPrompt } from '../../features/advisor/domain/advisor-parser'
import { matchAdvisorListings } from '../../features/advisor/domain/advisor-matcher'
import { LISTING_FIXTURES, type ListingSummary } from '../../features/listings/data/listing-adapter'
import { OFFICE_FIXTURES } from '../../features/offices/data/office-adapter'
import type { OfficeSummary } from '../../features/offices/domain/office-types'
import {
  firstAvailableDay,
  toDateKey,
} from '../../features/appointments/data/appointment-availability'
import { createAppointment, listAppointments } from '../../features/appointments/data/appointment-store'
import type { Appointment } from '../../features/appointments/domain/appointment-types'

export interface DockBaglanti {
  /** withBase uygulanmamış uygulama içi yol (ör. `/favoriler`). */
  yol: string
  etiket: string
}

/** Mesaj balonuna gömülen zengin içerik — DS bileşenine çevirisi AiDockIcerik'te. */
export type DockZengin =
  | { tur: 'ilanlar'; ilanlar: ListingSummary[] }
  | { tur: 'grafik'; tip: 'bar' | 'line'; baslik: string; noktalar: { x: string; y: number }[]; sonek?: string }
  | { tur: 'egilim'; etiket: string; noktalar: number[]; trend: 'up' | 'down' | 'steady'; notu?: string }
  | { tur: 'randevu'; randevu: Appointment }
  | { tur: 'metrikler'; ogeler: { id: string; label: string; value: string; hint?: string }[] }

export interface DockYanit {
  /** Bekleme balonundaki orb durumu + görünür etiket. */
  durum: { durum: GlassChatDockPendingState; etiket: string }
  metin: string
  zengin?: DockZengin
  baglanti?: DockBaglanti
  /** "Yazıyor" nefesinin süresi — gerçek akışta ağ gecikmesi olacak. */
  gecikmeMs: number
}

const fiyat = (value: number) => `${value.toLocaleString('tr-TR')} TL`

const tarihUzun = (dateKey: string) =>
  new Date(`${dateKey}T12:00:00`).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })

/** Deterministik sözde-rastgele (id → 0..1) — Math.random yasak alanlarında tohum. */
const tohum = (id: string) => {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997
  return h / 997
}

const RANDEVU_DURUM_ETIKETI: Record<Appointment['status'], string> = {
  pending: 'onay bekliyor',
  confirmed: 'onaylandı',
  cancelled: 'iptal edildi',
}

function ofisBul(soru: string): OfficeSummary | undefined {
  const eslesen = OFFICE_FIXTURES.find((ofis) =>
    ofis.name
      .toLocaleLowerCase('tr-TR')
      .split(/\s+/)
      .some((kelime) => kelime.length > 3 && soru.includes(kelime)),
  )
  if (eslesen) return eslesen
  return [...OFFICE_FIXTURES].sort((a, b) => b.rating - a.rating)[0]
}

function randevuOlustur(soru: string): DockYanit {
  const ofis = ofisBul(soru)
  if (!ofis) {
    return {
      durum: { durum: 'connecting', etiket: 'Randevu oluşturuluyor…' },
      metin: 'Şu an ofis kaydına ulaşamadım — Ofisler sayfasından ofis seçerek randevu planlayabilirsiniz.',
      baglanti: { yol: '/ofisler', etiket: 'Ofisleri aç' },
      gecikmeMs: 1100,
    }
  }
  const uygunluk = firstAvailableDay(ofis.id, new Date())
  const uygunSlot = uygunluk?.slots.find((slot) => slot.available)
  if (!uygunluk || !uygunSlot) {
    return {
      durum: { durum: 'connecting', etiket: 'Randevu oluşturuluyor…' },
      metin: `${ofis.name} için önümüzdeki iki haftada uygun saat bulamadım. Ofisler sayfasından farklı bir ofis deneyebilirsiniz.`,
      baglanti: { yol: '/ofisler', etiket: 'Ofisleri aç' },
      gecikmeMs: 1100,
    }
  }
  const randevu = createAppointment({
    officeId: ofis.id,
    officeName: ofis.name,
    date: toDateKey(uygunluk.date),
    slot: uygunSlot.time,
    type: 'office',
    note: 'AI danışman sohbetinden oluşturuldu',
    autoConfirm: ofis.responseMinutes <= 30,
  })
  return {
    durum: { durum: 'connecting', etiket: 'Randevu oluşturuluyor…' },
    metin: `${ofis.name} ile ${tarihUzun(randevu.date)} günü saat ${randevu.slot} için ofis randevusu talebi oluşturdum. Durumunu Randevularım sayfasından izleyebilirsiniz.`,
    zengin: { tur: 'randevu', randevu },
    baglanti: { yol: '/hesabim/randevularim', etiket: 'Randevularım' },
    gecikmeMs: 1400,
  }
}

function randevuSorgula(): DockYanit {
  const randevular = listAppointments().filter((r) => r.status !== 'cancelled')
  if (randevular.length === 0) {
    return {
      durum: { durum: 'searching', etiket: 'Randevularınız kontrol ediliyor…' },
      metin:
        'Kayıtlı bir randevunuz görünmüyor. "Ofis adı + randevu oluştur" yazarsanız ilk uygun saate talep açabilirim; Ofisler sayfasından da planlayabilirsiniz.',
      baglanti: { yol: '/ofisler', etiket: 'Ofisleri aç' },
      gecikmeMs: 1000,
    }
  }
  const satirlar = randevular
    .slice(0, 3)
    .map((r) => `• ${r.officeName} — ${tarihUzun(r.date)} ${r.slot} (${RANDEVU_DURUM_ETIKETI[r.status]})`)
    .join('\n')
  return {
    durum: { durum: 'searching', etiket: 'Randevularınız kontrol ediliyor…' },
    metin: `${randevular.length} aktif randevunuz var:\n${satirlar}`,
    baglanti: { yol: '/hesabim/randevularim', etiket: 'Tümünü gör' },
    gecikmeMs: 1000,
  }
}

function harcamaOzeti(): DockYanit {
  // Taslak veri — gerçek akışta Ödemeler kayıtlarından toplanacak.
  const aylar = [
    { x: 'Mar', y: 0 },
    { x: 'Nis', y: 1450 },
    { x: 'May', y: 0 },
    { x: 'Haz', y: 2900 },
    { x: 'Tem', y: 1450 },
    { x: 'Ağu', y: 4350 },
  ]
  const toplam = aylar.reduce((acc, ay) => acc + ay.y, 0)
  return {
    durum: { durum: 'solving', etiket: 'Harcamalarınız hesaplanıyor…' },
    metin: `Son 6 ayda toplam ${fiyat(toplam)} harcama görünüyor; bu ay ${fiyat(4350)} ile en yüksek ay — kalemleri Ödemeler sayfasından inceleyebilirsiniz.`,
    zengin: { tur: 'grafik', tip: 'bar', baslik: 'Aylık harcama', noktalar: aylar, sonek: ' TL' },
    baglanti: { yol: '/hesabim/odemeler', etiket: 'Ödemeleri aç' },
    gecikmeMs: 1300,
  }
}

function favoriIndirim(): DockYanit {
  // FavoritesWorkspace ile aynı taslak kural: fixtures'ın 1. ve 4. kaydında fiyat düşüşü.
  const dusenler = [LISTING_FIXTURES[1], LISTING_FIXTURES[4]].filter(Boolean)
  if (dusenler.length === 0) {
    return {
      durum: { durum: 'searching', etiket: 'Favorileriniz taranıyor…' },
      metin: 'Favorilerinizde şu an fiyat düşüşü görünmüyor — değişiklik olursa buradan haber veririm.',
      baglanti: { yol: '/favoriler', etiket: 'Favorileri aç' },
      gecikmeMs: 1100,
    }
  }
  const oranlar = dusenler.map((ilan) => Math.round(4 + tohum(ilan.id) * 8))
  const satirlar = dusenler
    .map((ilan, i) => `• ${ilan.title}: %${oranlar[i]} düşüşle ${fiyat(ilan.price)}`)
    .join('\n')
  return {
    durum: { durum: 'searching', etiket: 'Favorileriniz taranıyor…' },
    metin: `Favorilerinizden ${dusenler.length} ilanda fiyat düşüşü var:\n${satirlar}\nKartlara dokunup ilana gidebilirsiniz.`,
    zengin: { tur: 'ilanlar', ilanlar: dusenler },
    baglanti: { yol: '/favoriler', etiket: 'Favorileri aç' },
    gecikmeMs: 1300,
  }
}

function endeksYorumu(): DockYanit {
  const seyir = [100, 101, 103, 104, 107, 109, 112, 114, 118, 121, 124, 128]
  return {
    durum: { durum: 'composing', etiket: 'Endeks verisi yorumlanıyor…' },
    metin:
      'Emlak Endeksi son 12 ayda arsa tarafında yaklaşık %28 birikimli artış gösteriyor; ivme özellikle son çeyrekte güçlendi. İmarlı parseller tarlaya göre daha hızlı değerleniyor. Bölge bazlı kırılımı Emlak Endeksi sayfasında görebilirsiniz.',
    zengin: { tur: 'egilim', etiket: 'Arsa endeksi, son 12 ay', noktalar: seyir, trend: 'up', notu: '12 ayda +%28' },
    baglanti: { yol: '/emlak-endeksi', etiket: 'Emlak Endeksini aç' },
    gecikmeMs: 1400,
  }
}

function yatirimAnalizi(soru: string): DockYanit {
  const oneri = parseAdvisorPrompt(soru)
  const eslesen = matchAdvisorListings(oneri.criteria, [...LISTING_FIXTURES])[0]?.listing
  const ilan = eslesen ?? LISTING_FIXTURES.find((l) => l.featured && l.transaction === 'sale') ?? LISTING_FIXTURES[0]
  const bolgeMedyani = Math.round(ilan.unitPrice * (0.88 + tohum(ilan.id) * 0.18))
  const fark = Math.round(((ilan.unitPrice - bolgeMedyani) / bolgeMedyani) * 100)
  const amortiYil = Math.round(8 + tohum(ilan.id) * 6)
  const uygun = fark <= 5
  const karar = uygun
    ? `m² fiyatı bölge medyanına ${fark >= 0 ? `%${fark} üstünde` : `%${Math.abs(fark)} altında`} — ${ilan.verified ? 'doğrulanmış künyesiyle birlikte ' : ''}alınabilir görünüyor.`
    : `m² fiyatı bölge medyanının %${fark} üstünde — pazarlıksız alımı önermem; benzer parsellerle karşılaştırmadan karar vermeyin.`
  return {
    durum: { durum: 'solving', etiket: 'Yatırım analizi hazırlanıyor…' },
    metin: `${ilan.title} (${ilan.city}, ${ilan.district}) için hızlı bakış: ${karar} Mevcut değerlenme hızıyla tahmini amorti süresi ~${amortiYil} yıl. Bu taslak bir yorumdur; kesin karar için ekspertiz şart.`,
    zengin: {
      tur: 'metrikler',
      ogeler: [
        { id: 'm2', label: 'İlan m² fiyatı', value: `${ilan.unitPrice.toLocaleString('tr-TR')} TL/m²` },
        { id: 'medyan', label: 'Bölge medyanı', value: `${bolgeMedyani.toLocaleString('tr-TR')} TL/m²`, hint: fark >= 0 ? `%${fark} üstünde` : `%${Math.abs(fark)} altında` },
        { id: 'amorti', label: 'Tahmini amorti', value: `~${amortiYil} yıl` },
      ],
    },
    baglanti: { yol: `/ilan/${ilan.id}`, etiket: 'İlanı aç' },
    gecikmeMs: 1600,
  }
}

function tarlaYorumu(): DockYanit {
  return {
    durum: { durum: 'breathing', etiket: 'Bölge verileri inceleniyor…' },
    metin:
      'Tarlada bölge seçerken üç şeye bakın: imar planı beklentisi (belediye dönem planları), yol cephesi ve sulama. Endeks verisinde yol cepheli tarlalar son yılda imarlı arsalara yakın değerlendi; iç parseller ise yatay seyretti. Belirli bir ilçe yazarsanız (ör. "Urla tarla") o bölgenin seyrini yorumlayayım.',
    baglanti: { yol: '/emlak-endeksi', etiket: 'Bölge endeksini aç' },
    gecikmeMs: 1300,
  }
}

function ofisOnerisi(): DockYanit {
  const ofis = [...OFFICE_FIXTURES].sort((a, b) => b.rating - a.rating)[0]
  if (!ofis) {
    return {
      durum: { durum: 'connecting', etiket: 'Ofisler eşleştiriliyor…' },
      metin: 'Ofis kayıtlarına şu an ulaşamadım — Ofisler sayfasını deneyebilirsiniz.',
      baglanti: { yol: '/ofisler', etiket: 'Ofisleri aç' },
      gecikmeMs: 1000,
    }
  }
  return {
    durum: { durum: 'connecting', etiket: 'Ofisler eşleştiriliyor…' },
    metin: `${ofis.name} profilinize iyi oturuyor: ${ofis.rating.toFixed(1)} puan (${ofis.reviewCount} değerlendirme), uzmanlık ${ofis.expertise.slice(0, 2).join(' + ')}, ortalama yanıt ${ofis.responseMinutes} dk. "${ofis.name} randevu oluştur" yazarsanız ilk uygun saate talep açarım.`,
    baglanti: { yol: '/ofisler', etiket: 'Tüm ofisler' },
    gecikmeMs: 1200,
  }
}

function ilanAra(soru: string): DockYanit | null {
  const oneri = parseAdvisorPrompt(soru)
  const kriterVar =
    oneri.criteria.city !== undefined ||
    oneri.criteria.propertyTypes.length > 0 ||
    oneri.criteria.budget.min !== undefined ||
    oneri.criteria.budget.max !== undefined ||
    oneri.criteria.area.min !== undefined ||
    oneri.criteria.area.max !== undefined
  // Çekimli biçimler bilinçli: "arıyorum/arayış" 'ara' kökünü içermez;
  // çıplak /ara/ ise "karar" gibi kelimelere takılırdı.
  const aramaFiili = /(ilan|arıyor|arayış|bul|göster|filtrele|listele)/.test(soru) || /(^|\s)ara(\s|$)/.test(soru)
  if (!kriterVar && !aramaFiili) return null
  const eslesmeler = matchAdvisorListings(oneri.criteria, [...LISTING_FIXTURES]).slice(0, 2)
  if (eslesmeler.length === 0) {
    return {
      durum: { durum: 'searching', etiket: 'İlanlar aranıyor…' },
      metin:
        'Bu kriterlere birebir uyan ilan bulamadım. Bütçeyi biraz esnetmeyi ya da komşu ilçeleri eklemeyi deneyebiliriz — kriterinizi yazın, tekrar tarayayım.',
      baglanti: { yol: '/arsa-ara', etiket: 'Aramayı sayfada aç' },
      gecikmeMs: 1400,
    }
  }
  return {
    durum: { durum: 'searching', etiket: 'İlanlar aranıyor…' },
    metin: `${oneri.summary} ${eslesmeler.length} güçlü eşleşme buldum — kartlara dokunup ilana gidebilirsiniz. Derin analiz için AI danışman sayfası hizmetinizde.`,
    zengin: { tur: 'ilanlar', ilanlar: eslesmeler.map((e) => e.listing) },
    baglanti: { yol: '/ai-danisman', etiket: 'AI danışmanda sürdür' },
    gecikmeMs: 1600,
  }
}

/** Gerçek akış bağlanana dek: soruya alan dilinde taslak yanıt üretir (eski davranış). */
export function taslakYanit(soru: string): string {
  const s = soru.toLocaleLowerCase('tr')
  if (s.includes('fiyat') || s.includes('bütçe') || s.includes('tl')) {
    return 'Bütçenize göre bölge önerisi çıkarabilirim. Örneğin Urla tarafında imarlı parseller şu an 6.000–12.500 TL/m² bandında. Emlak Endeksi sayfasında bölge bazlı seyri de görebilirsiniz; ayrıntılı analiz için AI danışman sayfasını açabilirim.'
  }
  if (s.includes('imar')) {
    return 'İmar durumu ilan kartlarında doğrulama rozetiyle birlikte gösterilir; konut imarlı, tarla ve turizm imarlı parselleri filtreleyebilirsiniz. Belirli bir parselin imar sorusunu yazarsanız kanıt kaynaklarıyla birlikte özetlerim.'
  }
  if (s.includes('urla') || s.includes('izmir')) {
    return 'Urla–İzmir hattında denize yakın, imarlı köşe parseller öne çıkıyor; medyan m² fiyatı son 12 ayda yükseliş eğiliminde. Kayıtlı arama kurarsanız yeni ilan düşünce sizi haberdar ederim.'
  }
  return 'Not aldım. Aradığınız bölgeyi, bütçenizi ve arsa tipini (konut imarlı / tarla / ticari) yazarsanız size uygun ilanları daraltabilirim. Derinlemesine analiz için AI danışman sayfası da hizmetinizde.'
}

/**
 * Soruyu niyete yönlendirir. Sıra bilinçli: dar/duyarlı niyetler (randevu
 * oluşturma, hesap verileri) genel arama ve serbest sohbetten ÖNCE denenir —
 * "Urla ofisine randevu oluştur" bir ilan araması değildir.
 */
export function dockYanit(soru: string): DockYanit {
  const s = soru.toLocaleLowerCase('tr-TR')

  if (/(randevu|görüşme)/.test(s) && /(oluştur|planla|ayarla|\bal\b|talep)/.test(s)) return randevuOlustur(s)
  if (/(randevu|görüşme)/.test(s)) return randevuSorgula()
  if (/(harcama|harcadım|ödeme|fatura)/.test(s)) return harcamaOzeti()
  if (/favori/.test(s)) return favoriIndirim()
  if (/(endeks|fiyat seyri|fiyatlar nasıl|m² fiyat|m2 fiyat)/.test(s)) return endeksYorumu()
  if (/(alınır mı|alinir mi|amorti|yatırım|değerlen|yorumla)/.test(s)) return yatirimAnalizi(s)
  if (/ofis/.test(s)) return ofisOnerisi()

  // "tarla bölgesel iyi mi" bir değerlendirme sorusudur, ilan araması değil —
  // parser 'tarla'yı kriter sayacağı için arama denemesinden ÖNCE ayrıştırılır.
  // Fiil seti ilanAra'dakiyle aynı: çıplak /ara/ "olarak" gibi kelimelere takılır.
  if (
    /tarla/.test(s) &&
    /(iyi mi|nasıl|mantıklı|olur mu|bölge)/.test(s) &&
    !/(ilan|arıyor|arayış|bul|göster|filtrele|listele)/.test(s) &&
    !/(^|\s)ara(\s|$)/.test(s)
  ) {
    return tarlaYorumu()
  }

  const arama = ilanAra(s)
  if (arama) return arama

  if (/tarla/.test(s)) return tarlaYorumu()

  return {
    durum: { durum: 'working', etiket: 'Düşünüyorum…' },
    metin: taslakYanit(soru),
    gecikmeMs: 1000,
  }
}
