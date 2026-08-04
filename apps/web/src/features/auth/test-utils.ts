import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import type { AuthAdapters } from './data/auth-adapters'

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
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    kayitYap: vi.fn(),
    profilTamamla: vi.fn(),
    kurumsalBasvuruGonder: vi.fn(),
    eidsDogrulamaBaslat: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
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
