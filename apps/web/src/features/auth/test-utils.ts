import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import type { AuthAdapters } from './data/auth-adapters'
import type { IsletmeTuru, KurumsalBasvuruBilgileri } from './domain/auth-types'

/**
 * Test-only sahte `AuthAdapters` üreticisi.
 *
 * `AuthAdapters` mock'u daha önce beş ayrı test dosyasında elle kuruluyordu
 * (`AuthAccessibility.test.tsx`, `auth-flow.test.tsx`,
 * `AuthSessionProvider.test.tsx`, `routes/hesabim.test.tsx`,
 * `routes/hesabim.mesajlar.test.tsx`); arayüze her yeni yöntem eklendiğinde
 * hepsi birden typecheck'ten düşüyordu. Bu yardımcı dokuz yöntemin tamamı
 * için makul varsayılan `vi.fn()` stub'ları sağlar — arayüz genişlediğinde
 * tek değişecek yer burasıdır.
 *
 * `vi.fn()` kullandığı için yalnız vitest ortamında çalışır — **üretim
 * kodundan import edilmez**.
 */
export function sahteAuthAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  const adapters = {
    girisBaslat: vi.fn(),
    kodTekrarGonder: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    parolaSifirlamaIste: vi.fn(),
    parolaSifirla: vi.fn(),
    googleGirisiTamamla: vi.fn(),
    davetiGetir: vi.fn(),
    davetiKabulEt: vi.fn(),
    organizasyonlariGetir: vi.fn(),
    organizasyonSec: vi.fn(),
    parolaDegistir: vi.fn(),
    ePostaDegisikliginiDogrula: vi.fn(),
    kayitYap: vi.fn(),
    profilTamamla: vi.fn(),
    kurumsalBasvuruGonder: vi.fn(),
    eidsDogrulamaBaslat: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters

  // `oturumuCoz` açıkça verilmediyse `oturumuGetir`den TÜRETİLİR. Testlerin
  // neredeyse tamamı yalnız "oturum var / yok" senaryosu kuruyor; her birinin
  // ayrıca üçlü durum nesnesi yazmasına gerek yok. `bilinmiyor` durumunu
  // sınamak isteyen test `oturumuCoz`u açıkça geçer.
  if (!overrides.oturumuCoz) {
    adapters.oturumuCoz = async () => {
      const oturum = adapters.oturumuGetir()
      return oturum ? { durum: 'kimlikli', oturum } : { durum: 'anonim' }
    }
  }

  return adapters
}

type Kullanici = ReturnType<typeof userEvent.setup>

export interface KayitDoldurmaSecenekleri {
  hesapTipi?: 'bireysel' | 'kurumsal'
  adSoyad?: string
  ePosta?: string
  telefon?: string
  parola?: string
  /** `false` ise onay kutusu işaretlenmez — son adımda takılı kalınır. */
  kvkkOnayi?: boolean
}

/**
 * Çok adımlı kayıt formunu adım adım doldurur ve SON ADIMDA bırakır
 * (gönderime basmaz — gönderim dalları teste özeldir).
 *
 * `/kayit` tek uzun form olmaktan çıkıp dört adıma bölündüğünde her test
 * "doldur → gönder" yerine "doldur → devam et → …" yazmak zorunda kaldı;
 * bu yardımcı o gezinmeyi tek yere topluyor. Her "Devam et" o adımın
 * doğrulamasından geçer, yani yardımcının kendisi de akışın kanıtıdır.
 */
export async function kayitAdimlariniDoldur(
  kullanici: Kullanici,
  secenekler: KayitDoldurmaSecenekleri = {},
): Promise<void> {
  const {
    hesapTipi = 'bireysel',
    adSoyad = 'Yeni Kullanıcı',
    ePosta = 'yeni@arsam.net',
    telefon = '5559998877',
    parola = 'Arsam1234',
    kvkkOnayi = true,
  } = secenekler

  // 1. Hesap tipi
  await screen.findByLabelText(/bireysel/i)
  if (hesapTipi === 'kurumsal') await kullanici.click(screen.getByLabelText(/emlak ofisi/i))
  await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))

  // 2. Kimlik
  await screen.findByLabelText('Ad soyad')
  if (adSoyad) await kullanici.type(screen.getByLabelText('Ad soyad'), adSoyad)
  if (ePosta) await kullanici.type(screen.getByLabelText('E-posta'), ePosta)
  await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))

  // 3. İletişim ve güvenlik
  await screen.findByLabelText('Telefon')
  if (telefon) await kullanici.type(screen.getByLabelText('Telefon'), telefon)
  if (parola) await kullanici.type(screen.getByLabelText('Parola'), parola)
  await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))

  // 4. Onay
  await screen.findByLabelText(/aydınlatma metnini/i)
  if (kvkkOnayi) await kullanici.click(screen.getByLabelText(/aydınlatma metnini/i))
}

/**
 * Geçerli bir emlak ofisi başvurusu — domain ve adapter testlerinin ortak
 * temeli. Tek tek alan kurmak yerine buradan türetilir (`{...x, alan: ''}`),
 * böylece `KurumsalBasvuruBilgileri` genişlediğinde tek yer güncellenir.
 *
 * Tarihler bilinçli olarak uzak gelecekte: doğrulama "bugünden ileri"
 * istediği için sabit yakın tarih zamanla kendiliğinden geçersizleşirdi.
 */
export const gecerliKurumsalBasvuru: KurumsalBasvuruBilgileri = {
  isletmeTuru: 'limited',
  ticaretUnvani: 'Arsam Gayrimenkul Ltd. Şti.',
  vergiNumarasi: '1234567890',
  vergiDairesi: 'Konak',
  mersisNo: '1234567890123456',
  ticaretSicilNo: '123456',
  yetkiBelgesiNo: 'YB-2026-0042',
  yetkiBelgesiBitis: '2030-12-31',
  sorumluDanismanAdSoyad: 'Ayşe Kaya',
  sorumluDanismanTckn: '12345678901',
  mykBelgeNo: 'MYK-5-0042',
  mykBelgeBitis: '2030-12-31',
  il: 'İzmir',
  ilce: 'Konak',
  acikAdres: 'Mithatpaşa Caddesi No 12 Daire 3',
  postaKodu: '35260',
  ofisTelefonu: '2321234567',
  kepAdresi: 'arsam@hs01.kep.tr',
  webSitesi: 'https://arsam.net',
  yetkiliAdSoyad: 'Ayşe Kaya',
  yetkiliEPosta: 'ayse@arsam.net',
  yetkiliTelefon: '5551112233',
  kvkkOnayi: true,
  temsilBeyani: true,
  iysOnayi: false,
}

/**
 * `KayitKurumsalPage`'in dört bölümünü geçerli değerlerle doldurur ve son
 * bölümde BEKLER — gönderim çağıranın işidir (bazı testler göndermeden
 * önce bir alanı bozmak ister).
 *
 * Şahıs işletmesi seçilirse MERSİS / ticaret sicil / KEP alanları isteğe
 * bağlıdır ve doldurulmaz; varsayılan tüzel kişidir çünkü zorunlu alan
 * kümesi o dalda daha geniştir.
 */
export async function kurumsalBolumleriniDoldur(
  kullanici: ReturnType<typeof userEvent.setup>,
  secenekler: { isletmeTuru?: IsletmeTuru } = {},
) {
  const { isletmeTuru = 'limited' } = secenekler
  const veri = { ...gecerliKurumsalBasvuru, isletmeTuru }
  const tuzel = isletmeTuru !== 'sahis'
  const devam = () => kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
  const yaz = async (etiket: string, deger: string) => {
    const alan = screen.getByLabelText(etiket)
    await kullanici.clear(alan)
    await kullanici.type(alan, deger)
  }

  // 1. İşletme kimliği
  await screen.findByLabelText('Ticaret ünvanı')
  await kullanici.click(screen.getByLabelText(new RegExp(ISLETME_TURU_ETIKETI[isletmeTuru], 'i')))
  await yaz('Ticaret ünvanı', veri.ticaretUnvani)
  await yaz('Vergi kimlik no / TCKN', veri.vergiNumarasi)
  await yaz('Vergi dairesi', veri.vergiDairesi)
  if (tuzel) {
    await yaz('MERSİS numarası', veri.mersisNo)
    await yaz('Ticaret sicil numarası', veri.ticaretSicilNo)
  }
  await devam()

  // 2. Yetki ve yeterlilik
  await screen.findByLabelText('Yetki belgesi numarası')
  await yaz('Yetki belgesi numarası', veri.yetkiBelgesiNo)
  await yaz('Yetki belgesi geçerlilik bitişi', veri.yetkiBelgesiBitis)
  await yaz('Sorumlu emlak danışmanı', veri.sorumluDanismanAdSoyad)
  await yaz('Sorumlu danışman T.C. kimlik no', veri.sorumluDanismanTckn)
  await yaz('MYK Seviye 5 belge numarası', veri.mykBelgeNo)
  await yaz('MYK belgesi geçerlilik bitişi', veri.mykBelgeBitis)
  await devam()

  // 3. Ofis ve iletişim
  await screen.findByLabelText('İl')
  await kullanici.selectOptions(screen.getByLabelText('İl'), veri.il)
  await yaz('İlçe', veri.ilce)
  await yaz('Açık adres', veri.acikAdres)
  await yaz('Posta kodu', veri.postaKodu)
  await yaz('Ofis telefonu', veri.ofisTelefonu)
  if (tuzel) await yaz('KEP adresi', veri.kepAdresi)
  await yaz('Yetkili ad soyad', veri.yetkiliAdSoyad)
  await yaz('Yetkili e-posta', veri.yetkiliEPosta)
  await yaz('Yetkili telefon', veri.yetkiliTelefon)
  await devam()

  // 4. Onay
  await screen.findByLabelText(/aydınlatma metnini/i)
  await kullanici.click(screen.getByLabelText(/aydınlatma metnini/i))
  await kullanici.click(screen.getByLabelText(/temsile yetkili/i))
}

const ISLETME_TURU_ETIKETI: Record<IsletmeTuru, string> = {
  sahis: 'şahıs işletmesi',
  limited: 'limited şirket',
  anonim: 'anonim şirket',
  sube: 'şube',
}
