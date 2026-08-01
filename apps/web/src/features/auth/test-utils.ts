import { vi } from 'vitest'
import type { AuthAdapters } from './data/auth-adapters'

/**
 * Test-only sahte `AuthAdapters` üreticisi.
 *
 * `AuthAdapters` mock'u daha önce beş ayrı test dosyasında elle kuruluyordu
 * (`AuthAccessibility.test.tsx`, `auth-flow.test.tsx`,
 * `AuthSessionProvider.test.tsx`, `routes/hesabim.test.tsx`,
 * `routes/hesabim_.mesajlar.test.tsx`); arayüze her yeni yöntem eklendiğinde
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
