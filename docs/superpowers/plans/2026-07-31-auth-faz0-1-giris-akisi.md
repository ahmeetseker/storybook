# Auth Faz 0 + Faz 1 — Temel ve Giriş Akışı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/web`'e kimlik doğrulama temelini (adapter, oturum context'i, kabuk, üç arketip, rota koruması) ve çalışan giriş yolunu (`/giris`, `/giris/kod`, `/giris/parola` + üç durum sayfası) eklemek.

**Architecture:** Oturum işlemleri `auth-adapters.ts` arayüzünün arkasında toplanır (backend gelince yalnız o dosya değişir). Oturum durumu React context'te tutulur ve `/hesabim/*` rotalarını korur. Sayfalar üç arketipten türer: `AuthFormPage`, `AuthStatusPage`, `AuthCallbackPage` — sekiz durum sayfası tek bileşenden prop'la üretilir. Auth rotaları `MarketplaceShell` yerine dar `AuthShell` kullanır; anahtarlama `__root.tsx`'te pathname'e göre yapılır.

**Tech Stack:** React 19, TanStack Router (file-based routes), TanStack Query, CSS Modules, vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-07-31-auth-sayfalari-design.md`

## Global Constraints

- **Token tek kaynak:** `src/index.css`. Tipografi `--lg-text-badge` 11 / `-caption` 12 / `-footnote` 13 / `-body` 15 / `-headline` 17 / `-title` 22 / `-display` 28. Spacing `--lg-space-1..10` = 4/8/12/16/20/24/32/40/48/64. Radius chip 10 / media 14 / card 20 / capsule 999. Kontrol yükseklikleri `--lg-control-sm/md` 44, `-lg` 48, `-xl` 56.
- **`--lg-text-display` (28px) KULLANILMAZ.** Sayfa başlığı `--lg-text-title` (22px), bölüm başlığı `--lg-text-headline` (17px).
- **Raw px/hex yasak.** Yalnız `var(--lg-*)`. Fallback yazılacaksa gerçek token değeriyle birebir aynı olmalı.
- **`--lg-control-*` yalnız etkileşimli kontrol yüksekliğidir** — dekoratif öğede veya layout ölçüsü olarak kullanılmaz.
- **Dokunma hedefi 44px yalnız `@media (pointer: coarse)` altında zorunlu.** Breakpoint yerine `pointer: coarse` / `hover: hover` yetenek sorguları.
- **Focus halkası yalnız `:focus-visible`:** `outline: var(--lg-focus-ring-width) solid var(--lg-accent); outline-offset: var(--lg-focus-ring-offset)`.
- **Ölü buton yok.** Bağlanamayan her eylem `disabled` + görünür gerekçe ile çıkar.
- **Placeholder sayfa yok.** Yazılmayan sayfa rotaya bağlanmaz.
- **Dil:** Kullanıcıya görünen her metin Türkçe. Kod tanımlayıcıları İngilizce.
- **Test baseline:** `npm test` şu an 1733 testin **18'i kırık** (hepsi `apps/web/src/features/listing-detail/`). Bu sayı artmamalıdır.
- **Doğrulama komutları:** `npx tsc -b` · `npm run lint` · `npm test`. Üçü de her task'ın sonunda çalışır.
- **Dev sunucu `http://127.0.0.1:3000` üzerinde zaten ayakta.** Yeniden başlatmayın, `npm run dev` çalıştırmayın (port dolu, hata verir).
- **Commit:** Türkçe conventional commit, mesaj sonunda `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`. Push YOK.

---

## Dosya Yapısı

```
apps/web/src/features/auth/
├── domain/
│   ├── auth-types.ts              — paylaşılan tipler (Task 1)
│   ├── auth-session.ts            — donus doğrulaması + oturum reducer (Task 1, 2)
│   └── auth-session.test.ts
├── data/
│   ├── auth-adapters.ts           — oturum işlemleri arayüzü + fixture uygulaması (Task 1)
│   └── auth-adapters.test.ts
├── AuthSessionProvider.tsx        — context + hook (Task 2)
├── AuthSessionProvider.test.tsx
├── components/
│   ├── AuthShell.tsx / .module.css        (Task 3)
│   ├── AuthFormPage.tsx / .module.css     (Task 4)
│   ├── AuthStatusPage.tsx / .module.css   (Task 4)
│   ├── AuthCallbackPage.tsx               (Task 4)
│   └── *.test.tsx
├── pages/
│   ├── GirisPage.tsx / .module.css        (Task 5)
│   ├── GirisKodPage.tsx                   (Task 6)
│   ├── GirisParolaPage.tsx                (Task 7)
│   ├── girisDurumSayfalari.tsx            (Task 8)
│   └── *.test.tsx
├── auth-flow.test.tsx             — akış entegrasyon testleri (Task 9)
├── AuthAccessibility.test.tsx     — erişilebilirlik geçidi (Task 9)
└── index.ts                       — re-export

apps/web/src/routes/
├── giris.tsx · giris.kod.tsx · giris.parola.tsx
├── giris.baglanti-gonderildi.tsx · giris.baglanti.gecersiz.tsx · giris.hata.tsx
└── __root.tsx (Modify — kabuk anahtarlama, Task 3)

apps/web/src/config/routes.ts (Modify — authRoutePaths, Task 3)
```

---

## Task 1: Auth domain tipleri ve adapter

**Files:**
- Create: `apps/web/src/features/auth/domain/auth-types.ts`
- Create: `apps/web/src/features/auth/domain/auth-session.ts`
- Create: `apps/web/src/features/auth/domain/auth-session.test.ts`
- Create: `apps/web/src/features/auth/data/auth-adapters.ts`
- Create: `apps/web/src/features/auth/data/auth-adapters.test.ts`

**Interfaces:**
- Consumes: hiçbir şey (ilk task)
- Produces:
  - `type GirisYontemi = 'telefon' | 'parola' | 'baglanti' | 'google'`
  - `type HesapTipi = 'bireysel' | 'kurumsal'`
  - `interface Oturum { kullaniciId: string; adSoyad: string; telefon: string; ePosta: string; hesapTipi: HesapTipi; eidsDurumu: 'yok' | 'beklemede' | 'dogrulandi' }`
  - `type AuthSonuc<T> = { durum: 'basarili'; veri: T } | { durum: 'hata'; kod: AuthHataKodu; mesaj: string }`
  - `type AuthHataKodu = 'gecersiz-kimlik' | 'gecersiz-kod' | 'kod-suresi-doldu' | 'hesap-askida' | 'ag-hatasi'`
  - `function guvenliDonusYolu(ham: string | null | undefined): string` — spec §4.3
  - `interface AuthAdapters { girisBaslat(...); koduDogrula(...); parolaIleGiris(...); oturumuGetir(); cikisYap() }`
  - `const varsayilanAuthAdapters: AuthAdapters`

- [ ] **Step 1: `guvenliDonusYolu` için failing test yaz**

`apps/web/src/features/auth/domain/auth-session.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { guvenliDonusYolu } from './auth-session'

describe('guvenliDonusYolu', () => {
  it('uygulama içi mutlak yolu olduğu gibi döndürür', () => {
    expect(guvenliDonusYolu('/hesabim')).toBe('/hesabim')
    expect(guvenliDonusYolu('/hesabim/mesajlar')).toBe('/hesabim/mesajlar')
  })

  it('sorgu ve fragment taşıyan yolu korur', () => {
    expect(guvenliDonusYolu('/emlak?sehir=izmir')).toBe('/emlak?sehir=izmir')
  })

  it('boş, null veya undefined girdide ana sayfaya düşer', () => {
    expect(guvenliDonusYolu(null)).toBe('/')
    expect(guvenliDonusYolu(undefined)).toBe('/')
    expect(guvenliDonusYolu('')).toBe('/')
    expect(guvenliDonusYolu('   ')).toBe('/')
  })

  it('protokol-bağıl dış adresi reddeder (açık yönlendirme koruması)', () => {
    expect(guvenliDonusYolu('//kotu-site.example')).toBe('/')
    expect(guvenliDonusYolu('///kotu-site.example')).toBe('/')
  })

  it('mutlak dış URL reddeder', () => {
    expect(guvenliDonusYolu('https://kotu-site.example')).toBe('/')
    expect(guvenliDonusYolu('http://kotu-site.example/yol')).toBe('/')
  })

  it('şema enjeksiyonunu reddeder', () => {
    expect(guvenliDonusYolu('javascript:alert(1)')).toBe('/')
    expect(guvenliDonusYolu('data:text/html,x')).toBe('/')
  })

  it('göreli yolu reddeder — yalnız mutlak uygulama yolu kabul edilir', () => {
    expect(guvenliDonusYolu('hesabim')).toBe('/')
    expect(guvenliDonusYolu('../hesabim')).toBe('/')
  })

  it('geri dönüş hedefi olarak auth rotasını reddeder — döngü kurulmaz', () => {
    expect(guvenliDonusYolu('/giris')).toBe('/')
    expect(guvenliDonusYolu('/giris/kod')).toBe('/')
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/domain/auth-session.test.ts`
Expected: FAIL — `Failed to resolve import "./auth-session"`

- [ ] **Step 3: `auth-types.ts` dosyasını yaz**

```ts
/** Kullanıcının kimliğini kanıtlamak için seçtiği yol. */
export type GirisYontemi = 'telefon' | 'parola' | 'baglanti' | 'google'

/** Hesabın bireysel mi emlak ofisi mi olduğu — kayıt akışında belirlenir. */
export type HesapTipi = 'bireysel' | 'kurumsal'

/** EİDS (Emlak İlan Doğrulama Sistemi) durumu. */
export type EidsDurumu = 'yok' | 'beklemede' | 'dogrulandi'

export interface Oturum {
  kullaniciId: string
  adSoyad: string
  telefon: string
  ePosta: string
  hesapTipi: HesapTipi
  eidsDurumu: EidsDurumu
}

export type AuthHataKodu =
  | 'gecersiz-kimlik'
  | 'gecersiz-kod'
  | 'kod-suresi-doldu'
  | 'hesap-askida'
  | 'ag-hatasi'

export type AuthSonuc<T> =
  | { durum: 'basarili'; veri: T }
  | { durum: 'hata'; kod: AuthHataKodu; mesaj: string }
```

- [ ] **Step 4: `auth-session.ts` içinde `guvenliDonusYolu` yaz**

```ts
/** Giriş sonrası dönülecek yolların auth rotalarına düşmesini engeller. */
const AUTH_YOL_ONEKLERI = ['/giris', '/kayit', '/parola-sifirla', '/oturum-suresi-doldu', '/yetkisiz', '/hesap/']

/**
 * `donus` parametresini güvenli bir uygulama içi yola indirger.
 *
 * Yalnız tek `/` ile başlayan mutlak uygulama yolları kabul edilir. Dış
 * adresler, protokol-bağıl yollar (`//host`) ve şema enjeksiyonları ana
 * sayfaya düşer — açık yönlendirme açığı bırakılmaz. Auth rotaları da
 * reddedilir; aksi halde giriş sonrası kullanıcı girişe geri dönerdi.
 */
export function guvenliDonusYolu(ham: string | null | undefined): string {
  if (!ham) return '/'
  const yol = ham.trim()
  if (!yol.startsWith('/')) return '/'
  if (yol.startsWith('//')) return '/'
  if (AUTH_YOL_ONEKLERI.some((onek) => yol === onek || yol.startsWith(`${onek}/`) || yol.startsWith(onek))) {
    return '/'
  }
  return yol
}
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/domain/auth-session.test.ts`
Expected: PASS — 8/8

- [ ] **Step 6: Adapter için failing test yaz**

`apps/web/src/features/auth/data/auth-adapters.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { varsayilanAuthAdapters } from './auth-adapters'

describe('varsayilanAuthAdapters', () => {
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('geçerli telefonla giriş başlatır ve kod gönderildi bilgisi döner', async () => {
    const sonuc = await varsayilanAuthAdapters.girisBaslat('telefon', '5551112233')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') {
      expect(sonuc.veri.kanal).toBe('sms')
      expect(sonuc.veri.maskeliKimlik).toBe('555 *** 22 33')
    }
  })

  it('geçersiz telefon numarasını reddeder', async () => {
    const sonuc = await varsayilanAuthAdapters.girisBaslat('telefon', '123')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-kimlik')
  })

  it('doğru kodla oturum açar', async () => {
    await varsayilanAuthAdapters.girisBaslat('telefon', '5551112233')
    const sonuc = await varsayilanAuthAdapters.koduDogrula('000000')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.telefon).toBe('5551112233')
    expect(varsayilanAuthAdapters.oturumuGetir()).not.toBeNull()
  })

  it('yanlış kodu reddeder ve oturum açmaz', async () => {
    await varsayilanAuthAdapters.girisBaslat('telefon', '5551112233')
    const sonuc = await varsayilanAuthAdapters.koduDogrula('999999')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-kod')
    expect(varsayilanAuthAdapters.oturumuGetir()).toBeNull()
  })

  it('giriş başlatılmadan kod doğrulanamaz', async () => {
    const sonuc = await varsayilanAuthAdapters.koduDogrula('000000')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('kod-suresi-doldu')
  })

  it('parolayla giriş yapar', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaIleGiris('demo@arsam.net', 'arsam1234')
    expect(sonuc.durum).toBe('basarili')
    expect(varsayilanAuthAdapters.oturumuGetir()).not.toBeNull()
  })

  it('yanlış parolayı reddeder', async () => {
    const sonuc = await varsayilanAuthAdapters.parolaIleGiris('demo@arsam.net', 'yanlis')
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('gecersiz-kimlik')
  })

  it('çıkışta oturumu temizler', async () => {
    await varsayilanAuthAdapters.parolaIleGiris('demo@arsam.net', 'arsam1234')
    varsayilanAuthAdapters.cikisYap()
    expect(varsayilanAuthAdapters.oturumuGetir()).toBeNull()
  })
})
```

- [ ] **Step 7: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/data/auth-adapters.test.ts`
Expected: FAIL — `Failed to resolve import "./auth-adapters"`

- [ ] **Step 8: `auth-adapters.ts` yaz**

```ts
import type { AuthSonuc, GirisYontemi, Oturum } from '../domain/auth-types'

export interface GirisBaslatmaSonucu {
  /** Kodun/bağlantının hangi kanaldan gittiği — kullanıcıya gösterilir. */
  kanal: 'sms' | 'e-posta' | 'yonlendirme'
  /** Kullanıcıya gösterilecek maskelenmiş kimlik: "555 *** 22 33". */
  maskeliKimlik: string
}

export interface AuthAdapters {
  girisBaslat(
    yontem: GirisYontemi,
    kimlik: string,
  ): Promise<AuthSonuc<GirisBaslatmaSonucu>>
  koduDogrula(kod: string): Promise<AuthSonuc<Oturum>>
  parolaIleGiris(ePosta: string, parola: string): Promise<AuthSonuc<Oturum>>
  oturumuGetir(): Oturum | null
  cikisYap(): void
}

const DEMO_OTURUM: Oturum = {
  kullaniciId: 'demo-1',
  adSoyad: 'Mehmet Yılmaz',
  telefon: '5551112233',
  ePosta: 'demo@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'beklemede',
}

/** Fixture aşamasında kabul edilen tek doğrulama kodu. */
const DEMO_KOD = '000000'
const DEMO_PAROLA = 'arsam1234'
const OTURUM_ANAHTARI = 'arsam.oturum'

const telefonGecerli = (ham: string) => /^5\d{9}$/.test(ham.replace(/\s/g, ''))
const ePostaGecerli = (ham: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ham.trim())

function telefonMaskele(ham: string): string {
  const t = ham.replace(/\s/g, '')
  return `${t.slice(0, 3)} *** ${t.slice(6, 8)} ${t.slice(8, 10)}`
}

function ePostaMaskele(ham: string): string {
  const [ad, alan] = ham.trim().split('@')
  return `${ad.slice(0, 2)}***@${alan}`
}

function oturumuYaz(oturum: Oturum | null) {
  if (typeof sessionStorage === 'undefined') return
  if (oturum) sessionStorage.setItem(OTURUM_ANAHTARI, JSON.stringify(oturum))
  else sessionStorage.removeItem(OTURUM_ANAHTARI)
}

/**
 * Fixture uygulaması — gerçek kimlik sağlayıcı bağlanana kadar geçerlidir.
 * Gerçek API geldiğinde YALNIZ bu dosya değişir; sayfalar `AuthAdapters`
 * arayüzünü tükettiği için dokunulmaz.
 */
function authAdaptersOlustur(): AuthAdapters {
  let bekleyenKimlik: string | null = null
  let aktifOturum: Oturum | null = null

  return {
    async girisBaslat(yontem, kimlik) {
      if (yontem === 'telefon') {
        if (!telefonGecerli(kimlik)) {
          return {
            durum: 'hata',
            kod: 'gecersiz-kimlik',
            mesaj: 'Telefon numarasını 5XX XXX XX XX biçiminde girin.',
          }
        }
        bekleyenKimlik = kimlik.replace(/\s/g, '')
        return {
          durum: 'basarili',
          veri: { kanal: 'sms', maskeliKimlik: telefonMaskele(kimlik) },
        }
      }

      if (yontem === 'baglanti') {
        if (!ePostaGecerli(kimlik)) {
          return {
            durum: 'hata',
            kod: 'gecersiz-kimlik',
            mesaj: 'Geçerli bir e-posta adresi girin.',
          }
        }
        bekleyenKimlik = kimlik.trim()
        return {
          durum: 'basarili',
          veri: { kanal: 'e-posta', maskeliKimlik: ePostaMaskele(kimlik) },
        }
      }

      return {
        durum: 'basarili',
        veri: { kanal: 'yonlendirme', maskeliKimlik: '' },
      }
    },

    async koduDogrula(kod) {
      if (!bekleyenKimlik) {
        return {
          durum: 'hata',
          kod: 'kod-suresi-doldu',
          mesaj: 'Kodun süresi doldu. Yeni kod isteyin.',
        }
      }
      if (kod.trim() !== DEMO_KOD) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kod',
          mesaj: 'Kod hatalı. Tekrar deneyin.',
        }
      }
      aktifOturum = { ...DEMO_OTURUM, telefon: bekleyenKimlik }
      bekleyenKimlik = null
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async parolaIleGiris(ePosta, parola) {
      if (!ePostaGecerli(ePosta) || parola !== DEMO_PAROLA) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'E-posta veya parola hatalı.',
        }
      }
      aktifOturum = { ...DEMO_OTURUM, ePosta: ePosta.trim() }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    oturumuGetir() {
      if (aktifOturum) return aktifOturum
      if (typeof sessionStorage === 'undefined') return null
      const ham = sessionStorage.getItem(OTURUM_ANAHTARI)
      if (!ham) return null
      try {
        aktifOturum = JSON.parse(ham) as Oturum
        return aktifOturum
      } catch {
        sessionStorage.removeItem(OTURUM_ANAHTARI)
        return null
      }
    },

    cikisYap() {
      aktifOturum = null
      bekleyenKimlik = null
      oturumuYaz(null)
    },
  }
}

export const varsayilanAuthAdapters: AuthAdapters = authAdaptersOlustur()
```

- [ ] **Step 9: Testleri çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/`
Expected: PASS — 16/16 (8 session + 8 adapter)

- [ ] **Step 10: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```
Expected: tsc 0 hata, lint 0 hata, test 18 kırık (baseline korunuyor).

```bash
git add apps/web/src/features/auth
git commit -m "$(cat <<'EOF'
feat(auth): domain tipleri, güvenli dönüş yolu ve oturum adapter'ı

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Oturum context'i ve korumalı rota

**Files:**
- Create: `apps/web/src/features/auth/AuthSessionProvider.tsx`
- Create: `apps/web/src/features/auth/AuthSessionProvider.test.tsx`
- Create: `apps/web/src/features/auth/index.ts`

**Interfaces:**
- Consumes: Task 1'den `AuthAdapters`, `varsayilanAuthAdapters`, `Oturum`, `guvenliDonusYolu`
- Produces:
  - `<AuthSessionProvider adapters?={AuthAdapters}>` — test için adapter enjekte edilebilir
  - `useAuthSession(): { oturum: Oturum | null; girisYapildi: boolean; adapters: AuthAdapters; oturumuTazele(): void; cikisYap(): void }`
  - `useKorumaliRota(): void` — oturumsuzsa `/giris?donus=<mevcut yol>`'a yönlendirir

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/AuthSessionProvider.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthSessionProvider, useAuthSession } from './AuthSessionProvider'
import type { AuthAdapters } from './data/auth-adapters'
import type { Oturum } from './domain/auth-types'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function sahteAdapters(baslangic: Oturum | null): AuthAdapters {
  let oturum = baslangic
  return {
    async girisBaslat() {
      return { durum: 'basarili', veri: { kanal: 'sms', maskeliKimlik: '555 *** 22 33' } }
    },
    async koduDogrula() {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili', veri: ORNEK_OTURUM }
    },
    async parolaIleGiris() {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili', veri: ORNEK_OTURUM }
    },
    oturumuGetir: () => oturum,
    cikisYap: () => {
      oturum = null
    },
  }
}

function Sonda() {
  const { oturum, girisYapildi, cikisYap } = useAuthSession()
  return (
    <div>
      <p>{girisYapildi ? `Oturum: ${oturum?.adSoyad}` : 'Oturum yok'}</p>
      <button type="button" onClick={cikisYap}>
        Çıkış yap
      </button>
    </div>
  )
}

describe('AuthSessionProvider', () => {
  it('adapter oturum döndürdüğünde oturumu yayınlar', () => {
    render(
      <AuthSessionProvider adapters={sahteAdapters(ORNEK_OTURUM)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    expect(screen.getByText('Oturum: Ayşe Kaya')).toBeTruthy()
  })

  it('oturum yokken girisYapildi false döner', () => {
    render(
      <AuthSessionProvider adapters={sahteAdapters(null)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    expect(screen.getByText('Oturum yok')).toBeTruthy()
  })

  it('çıkış yapınca oturumu düşürür', async () => {
    const kullanici = userEvent.setup()
    render(
      <AuthSessionProvider adapters={sahteAdapters(ORNEK_OTURUM)}>
        <Sonda />
      </AuthSessionProvider>,
    )
    await kullanici.click(screen.getByRole('button', { name: 'Çıkış yap' }))
    await waitFor(() => expect(screen.getByText('Oturum yok')).toBeTruthy())
  })

  it('provider dışında kullanılırsa açık hata verir', () => {
    expect(() => render(<Sonda />)).toThrow(/AuthSessionProvider/)
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/AuthSessionProvider.test.tsx`
Expected: FAIL — `Failed to resolve import "./AuthSessionProvider"`

- [ ] **Step 3: `AuthSessionProvider.tsx` yaz**

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { varsayilanAuthAdapters, type AuthAdapters } from './data/auth-adapters'
import type { Oturum } from './domain/auth-types'

interface AuthSessionDegeri {
  oturum: Oturum | null
  girisYapildi: boolean
  adapters: AuthAdapters
  /** Adapter'daki oturumu yeniden okur — giriş sonrası çağrılır. */
  oturumuTazele(): void
  cikisYap(): void
}

const AuthSessionContext = createContext<AuthSessionDegeri | null>(null)

export function AuthSessionProvider({
  children,
  adapters = varsayilanAuthAdapters,
}: {
  children: ReactNode
  adapters?: AuthAdapters
}) {
  const [oturum, setOturum] = useState<Oturum | null>(() => adapters.oturumuGetir())

  const oturumuTazele = useCallback(() => {
    setOturum(adapters.oturumuGetir())
  }, [adapters])

  const cikisYap = useCallback(() => {
    adapters.cikisYap()
    setOturum(null)
  }, [adapters])

  const deger = useMemo<AuthSessionDegeri>(
    () => ({
      oturum,
      girisYapildi: oturum !== null,
      adapters,
      oturumuTazele,
      cikisYap,
    }),
    [oturum, adapters, oturumuTazele, cikisYap],
  )

  return <AuthSessionContext.Provider value={deger}>{children}</AuthSessionContext.Provider>
}

export function useAuthSession(): AuthSessionDegeri {
  const deger = useContext(AuthSessionContext)
  if (!deger) {
    throw new Error('useAuthSession yalnız AuthSessionProvider içinde kullanılabilir.')
  }
  return deger
}

/**
 * Korumalı sayfalarda çağrılır. Oturum yoksa kullanıcıyı `/giris`'e
 * yönlendirir ve geldiği yolu `donus` parametresinde taşır — giriş sonrası
 * aynı yere döner.
 */
export function useKorumaliRota(): void {
  const { girisYapildi } = useAuthSession()
  const navigate = useNavigate()
  const yol = useRouterState({
    select: (state) => `${state.location.pathname}${state.location.searchStr}`,
  })

  useEffect(() => {
    if (girisYapildi) return
    navigate({
      to: '/giris',
      search: { donus: yol },
      replace: true,
    })
  }, [girisYapildi, navigate, yol])
}
```

- [ ] **Step 4: `index.ts` yaz**

```ts
export { AuthSessionProvider, useAuthSession, useKorumaliRota } from './AuthSessionProvider'
export { varsayilanAuthAdapters, type AuthAdapters } from './data/auth-adapters'
export { guvenliDonusYolu } from './domain/auth-session'
export type { Oturum, GirisYontemi, HesapTipi, AuthHataKodu, AuthSonuc } from './domain/auth-types'
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/AuthSessionProvider.test.tsx`
Expected: PASS — 4/4

**Not:** `useKorumaliRota` router bağlamı gerektirdiği için burada test edilmez; Task 9'un akış testinde gerçek router ile doğrulanır.

- [ ] **Step 6: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth
git commit -m "$(cat <<'EOF'
feat(auth): oturum context'i ve korumalı rota kancası

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: AuthShell ve kabuk anahtarlama

**Files:**
- Create: `apps/web/src/features/auth/components/AuthShell.tsx`
- Create: `apps/web/src/features/auth/components/AuthShell.module.css`
- Create: `apps/web/src/features/auth/components/AuthShell.test.tsx`
- Modify: `apps/web/src/config/routes.ts` (dosya sonuna ekleme)
- Modify: `apps/web/src/routes/__root.tsx` (`RootComponent` içinde kabuk anahtarlama + provider)

**Interfaces:**
- Consumes: Task 2'den `AuthSessionProvider`
- Produces:
  - `<AuthShell>{children}</AuthShell>`
  - `authRoutePaths: readonly string[]` ve `isAuthPath(pathname: string): boolean` (`config/routes.ts`'ten)

- [ ] **Step 1: `isAuthPath` için failing test yaz**

`apps/web/src/config/routes.test.ts` dosyasına ekleyin (dosya zaten var):

```ts
import { isAuthPath } from './routes'

describe('isAuthPath', () => {
  it('auth rotalarını tanır', () => {
    expect(isAuthPath('/giris')).toBe(true)
    expect(isAuthPath('/giris/kod')).toBe(true)
    expect(isAuthPath('/kayit')).toBe(true)
    expect(isAuthPath('/parola-sifirla')).toBe(true)
    expect(isAuthPath('/oturum-suresi-doldu')).toBe(true)
    expect(isAuthPath('/yetkisiz')).toBe(true)
    expect(isAuthPath('/hesap/dogrula')).toBe(true)
  })

  it('pazaryeri rotalarını auth saymaz', () => {
    expect(isAuthPath('/')).toBe(false)
    expect(isAuthPath('/emlak')).toBe(false)
    expect(isAuthPath('/hesabim')).toBe(false)
    expect(isAuthPath('/hesabim/parola')).toBe(false)
  })

  it('sondaki eğik çizgiyi yok sayar', () => {
    expect(isAuthPath('/giris/')).toBe(true)
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/config/routes.test.ts`
Expected: FAIL — `isAuthPath is not exported`

- [ ] **Step 3: `config/routes.ts` sonuna ekle**

```ts
/**
 * Kimlik doğrulama rotaları — `MarketplaceShell` yerine `AuthShell` kullanır.
 *
 * `/hesabim/*` bu listede DEĞİLDİR: oturum gerektiren sayfalar pazaryeri
 * kabuğunda kalır. Buradaki rotalar oturumu olmayan kullanıcı içindir.
 */
export const authRoutePaths = [
  '/giris',
  '/kayit',
  '/parola-sifirla',
  '/oturum-suresi-doldu',
  '/yetkisiz',
  '/hesap',
] as const

export function isAuthPath(pathname: string): boolean {
  const yol = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return authRoutePaths.some((onek) => yol === onek || yol.startsWith(`${onek}/`))
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/config/routes.test.ts`
Expected: PASS

- [ ] **Step 5: `AuthShell.module.css` yaz**

```css
/* Auth kabuğu — oturumu olmayan kullanıcı için dar, odaklanmış yüzey.
   Cam yok: gezinme sunmayan bu katmanda cam yüzey bütçesi harcanmaz. */
.shell {
  min-block-size: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: var(--lg-space-6);
  padding-block: var(--lg-space-6);
  padding-inline: var(--lg-container-gutter);
  background: var(--lg-bg);
  color: var(--lg-label);
}

.masthead {
  display: flex;
  justify-content: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--lg-space-2);
  min-height: var(--lg-control-md);
  padding-inline: var(--lg-space-3);
  border-radius: var(--lg-radius-capsule);
  font-size: var(--lg-text-headline);
  font-weight: 700;
  letter-spacing: -0.022em;
  color: var(--lg-label);
  text-decoration: none;
}

.brand:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: var(--lg-focus-ring-offset);
}

.content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.inner {
  inline-size: 100%;
  max-inline-size: 26rem;
}

.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--lg-space-2) var(--lg-space-4);
  font-size: var(--lg-text-caption);
  color: var(--lg-label-secondary);
}

.footerLink {
  color: inherit;
  text-decoration: none;
  min-height: var(--lg-control-md);
  display: inline-flex;
  align-items: center;
}

.footerLink:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: var(--lg-focus-ring-offset);
}

@media (hover: hover) {
  .brand:hover,
  .footerLink:hover {
    color: var(--lg-accent);
  }
}
```

- [ ] **Step 6: `AuthShell.tsx` yaz**

```tsx
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import styles from './AuthShell.module.css'

/**
 * Auth sayfalarının kabuğu. `MarketplaceShell` yerine kullanılır: oturumu
 * olmayan kullanıcıya favoriler/karşılaştırma/mesajlar gezinmesi sunmak
 * anlamsızdır ve cam yüzey bütçesini harcar.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.masthead}>
        <Link to="/" className={styles.brand}>
          arsam.net
        </Link>
      </header>

      <main id="main-content" className={styles.content}>
        <div className={styles.inner}>{children}</div>
      </main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLink}>
          Ana sayfa
        </Link>
        <Link to="/blog" className={styles.footerLink}>
          Yardım
        </Link>
      </footer>
    </div>
  )
}
```

- [ ] **Step 7: `AuthShell.test.tsx` yaz ve çalıştır**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthShell } from './AuthShell'

function shellIleRouter() {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
      <AuthShell>
        <h1>Giriş</h1>
      </AuthShell>
    ),
  })
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

describe('AuthShell', () => {
  it('içeriği main landmark içinde gösterir', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    const main = await screen.findByRole('main')
    expect(main.querySelector('h1')?.textContent).toBe('Giriş')
  })

  it('içeriğe geç bağlantısının hedefi olan main-content kimliğini taşır', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    const main = await screen.findByRole('main')
    expect(main.id).toBe('main-content')
  })

  it('markayı ana sayfaya bağlar', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    const marka = await screen.findByRole('link', { name: 'arsam.net' })
    expect(marka.getAttribute('href')).toBe('/')
  })
})
```

Run: `npx vitest run apps/web/src/features/auth/components/AuthShell.test.tsx`
Expected: PASS — 3/3

- [ ] **Step 8: `__root.tsx`'te kabuk anahtarlamayı bağla**

`RootComponent` içindeki mevcut gövdeyi şununla değiştirin (import'ları dosya başına ekleyin: `useRouterState` `@tanstack/react-router`'dan, `isAuthPath` `@/config/routes`'tan, `AuthSessionProvider` `@/features/auth`'tan, `AuthShell` `@/features/auth/components/AuthShell`'den):

```tsx
function RootComponent() {
  const { initialTime } = Route.useLoaderData()
  const { queryClient } = Route.useRouteContext()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const authSayfasi = isAuthPath(pathname)

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          {authSayfasi ? (
            <AuthShell>
              <Outlet />
            </AuthShell>
          ) : (
            <MarketplaceShell initialTime={initialTime}>
              <Outlet />
            </MarketplaceShell>
          )}
        </AuthSessionProvider>
      </QueryClientProvider>
    </RootDocument>
  )
}
```

- [ ] **Step 9: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```
Expected: baseline 18 kırık korunuyor. `MarketplaceShell.test.tsx` ve `PageContainer.test.tsx` geçmeli — geçmiyorsa provider sarmalaması bir testin beklentisini bozmuştur, düzeltin.

```bash
git add apps/web/src/features/auth apps/web/src/config/routes.ts apps/web/src/config/routes.test.ts apps/web/src/routes/__root.tsx
git commit -m "$(cat <<'EOF'
feat(auth): AuthShell ve rota tabanlı kabuk anahtarlama

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Üç arketip bileşeni

**Files:**
- Create: `apps/web/src/features/auth/components/AuthFormPage.tsx` + `.module.css`
- Create: `apps/web/src/features/auth/components/AuthStatusPage.tsx` + `.module.css`
- Create: `apps/web/src/features/auth/components/AuthCallbackPage.tsx`
- Create: `apps/web/src/features/auth/components/authArketipleri.test.tsx`

**Interfaces:**
- Consumes: Task 3'ten `AuthShell` (kabuk zaten root'ta; arketipler yalnız içeriği çizer)
- Produces:
  - `<AuthFormPage baslik açiklama? hata? onSubmit gonderEtiketi gonderiliyor? ikincilBaglantilar?>{alanlar}</AuthFormPage>`
  - `<AuthStatusPage tone baslik açiklama birincilEylem? ikincilBaglanti?>` — `tone: 'info' | 'success' | 'error'`
  - `<AuthCallbackPage durum baslik hataMesaji?>` — `durum: 'pending' | 'error'`

- [ ] **Step 1: Arketipler için failing test yaz**

`apps/web/src/features/auth/components/authArketipleri.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthFormPage } from './AuthFormPage'
import { AuthStatusPage } from './AuthStatusPage'
import { AuthCallbackPage } from './AuthCallbackPage'

describe('AuthFormPage', () => {
  it('başlığı tek h1 olarak çizer', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    const basliklar = screen.getAllByRole('heading', { level: 1 })
    expect(basliklar).toHaveLength(1)
    expect(basliklar[0].textContent).toBe('Giriş yapın')
  })

  it('gönderimde onSubmit çağırır', async () => {
    const kullanici = userEvent.setup()
    const gonder = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={gonder} gonderEtiketi="Devam et">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    await kullanici.click(screen.getByRole('button', { name: 'Devam et' }))
    expect(gonder).toHaveBeenCalledTimes(1)
  })

  it('hatayı alert olarak duyurur', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et" hata="Kod hatalı.">
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    expect(screen.getByRole('alert').textContent).toBe('Kod hatalı.')
  })

  it('gönderilirken butonu devre dışı bırakır', () => {
    render(
      <AuthFormPage baslik="Giriş yapın" onSubmit={vi.fn()} gonderEtiketi="Devam et" gonderiliyor>
        <input aria-label="Telefon" />
      </AuthFormPage>,
    )
    expect(screen.getByRole('button', { name: 'Devam et' })).toHaveProperty('disabled', true)
  })
})

describe('AuthStatusPage', () => {
  it('başlık ve açıklamayı çizer', () => {
    render(<AuthStatusPage tone="success" baslik="Parolanız değişti" aciklama="Yeni parolanızla giriş yapabilirsiniz." />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Parolanız değişti')
    expect(screen.getByText('Yeni parolanızla giriş yapabilirsiniz.')).toBeTruthy()
  })

  it('hata tonunda içeriği alert olarak duyurur', () => {
    render(<AuthStatusPage tone="error" baslik="Bağlantı geçersiz" aciklama="Yeni bağlantı isteyin." />)
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('bilgi tonunda alert kullanmaz', () => {
    render(<AuthStatusPage tone="info" baslik="Bağlantı gönderildi" aciklama="E-postanızı kontrol edin." />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('verilen tonu data özniteliğiyle yayınlar', () => {
    const { container } = render(<AuthStatusPage tone="success" baslik="Tamam" aciklama="Bitti." />)
    expect(container.querySelector('[data-tone="success"]')).toBeTruthy()
  })
})

describe('AuthCallbackPage', () => {
  it('bekleme durumunu status olarak duyurur', () => {
    render(<AuthCallbackPage durum="pending" baslik="Doğrulanıyor" />)
    expect(screen.getByRole('status').textContent).toContain('Doğrulanıyor')
  })

  it('hata durumunda mesajı alert olarak duyurur', () => {
    render(<AuthCallbackPage durum="error" baslik="Doğrulanamadı" hataMesaji="Bağlantının süresi dolmuş." />)
    expect(screen.getByRole('alert').textContent).toContain('Bağlantının süresi dolmuş.')
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/components/authArketipleri.test.tsx`
Expected: FAIL — modüller çözülemiyor

- [ ] **Step 3: `AuthFormPage.module.css` yaz**

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-5);
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-2);
}

/* Sayfa başlığı title ölçeğinde — display (28px) marka/hero ölçüsüdür. */
.title {
  margin: 0;
  font-size: var(--lg-text-title);
  font-weight: 700;
  letter-spacing: -0.022em;
}

.description {
  margin: 0;
  font-size: var(--lg-text-footnote);
  color: var(--lg-label-secondary);
  max-inline-size: var(--lg-measure);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-4);
}

.fields {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-4);
}

.error {
  margin: 0;
  padding: var(--lg-space-3);
  border: var(--lg-stroke-hairline) solid var(--lg-danger);
  border-radius: var(--lg-radius-chip);
  font-size: var(--lg-text-footnote);
  color: var(--lg-danger);
}

.error:empty {
  display: none;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--lg-space-2) var(--lg-space-4);
  font-size: var(--lg-text-footnote);
}

.link {
  display: inline-flex;
  align-items: center;
  min-height: var(--lg-control-md);
  color: var(--lg-accent);
  font-weight: 600;
  text-decoration: none;
}

.link:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: var(--lg-focus-ring-offset);
}
```

- [ ] **Step 4: `AuthFormPage.tsx` yaz**

```tsx
import type { FormEvent, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { GlassButton } from '@repo/ui'
import styles from './AuthFormPage.module.css'

export interface AuthIkincilBaglanti {
  etiket: string
  hedef: string
}

export interface AuthFormPageProps {
  baslik: string
  aciklama?: string
  /** Sunucudan veya doğrulamadan gelen hata — role="alert" ile duyurulur. */
  hata?: string
  onSubmit(event: FormEvent<HTMLFormElement>): void
  gonderEtiketi: string
  gonderiliyor?: boolean
  ikincilBaglantilar?: readonly AuthIkincilBaglanti[]
  children: ReactNode
}

/** Auth akışındaki form sayfalarının ortak iskeleti. */
export function AuthFormPage({
  baslik,
  aciklama,
  hata,
  onSubmit,
  gonderEtiketi,
  gonderiliyor = false,
  ikincilBaglantilar = [],
  children,
}: AuthFormPageProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{baslik}</h1>
        {aciklama ? <p className={styles.description}>{aciklama}</p> : null}
      </header>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.fields}>{children}</div>

        {hata ? (
          <p className={styles.error} role="alert">
            {hata}
          </p>
        ) : null}

        <GlassButton
          type="submit"
          prominent
          size="md"
          loading={gonderiliyor}
          disabled={gonderiliyor}
        >
          {gonderEtiketi}
        </GlassButton>
      </form>

      {ikincilBaglantilar.length > 0 ? (
        <nav className={styles.links} aria-label="Diğer seçenekler">
          {ikincilBaglantilar.map((baglanti) => (
            <Link key={baglanti.hedef} to={baglanti.hedef} className={styles.link}>
              {baglanti.etiket}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 5: `AuthStatusPage.module.css` yaz**

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-4);
  text-align: start;
}

.mark {
  inline-size: var(--lg-space-8);
  block-size: var(--lg-space-8);
  border-radius: var(--lg-radius-capsule);
  display: grid;
  place-items: center;
  font-size: var(--lg-text-headline);
}

.page[data-tone='info'] .mark {
  background: color-mix(in srgb, var(--lg-accent) 14%, transparent);
  color: var(--lg-accent);
}

.page[data-tone='success'] .mark {
  background: color-mix(in srgb, var(--lg-success) 16%, transparent);
  color: var(--lg-success);
}

.page[data-tone='error'] .mark {
  background: color-mix(in srgb, var(--lg-danger) 14%, transparent);
  color: var(--lg-danger);
}

.title {
  margin: 0;
  font-size: var(--lg-text-title);
  font-weight: 700;
  letter-spacing: -0.022em;
}

.description {
  margin: 0;
  font-size: var(--lg-text-footnote);
  color: var(--lg-label-secondary);
  max-inline-size: var(--lg-measure);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--lg-space-3);
  margin-block-start: var(--lg-space-2);
}

.link {
  display: inline-flex;
  align-items: center;
  min-height: var(--lg-control-md);
  color: var(--lg-accent);
  font-size: var(--lg-text-footnote);
  font-weight: 600;
  text-decoration: none;
}

.link:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: var(--lg-focus-ring-offset);
}
```

- [ ] **Step 6: `AuthStatusPage.tsx` yaz**

```tsx
import { Link } from '@tanstack/react-router'
import styles from './AuthStatusPage.module.css'
import type { AuthIkincilBaglanti } from './AuthFormPage'

export type AuthStatusTone = 'info' | 'success' | 'error'

export interface AuthStatusPageProps {
  tone: AuthStatusTone
  baslik: string
  aciklama: string
  birincilEylem?: { etiket: string; hedef: string }
  ikincilBaglanti?: AuthIkincilBaglanti
}

const TON_ISARETI: Record<AuthStatusTone, string> = {
  info: 'i',
  success: '✓',
  error: '!',
}

/**
 * Auth akışındaki tüm durum sayfalarının tek kaynağı. Sekiz rota bu
 * bileşenin farklı içerikleridir; her durum için ayrı sayfa dosyası yazılmaz.
 */
export function AuthStatusPage({
  tone,
  baslik,
  aciklama,
  birincilEylem,
  ikincilBaglanti,
}: AuthStatusPageProps) {
  return (
    <div
      className={styles.page}
      data-tone={tone}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <span className={styles.mark} aria-hidden="true">
        {TON_ISARETI[tone]}
      </span>
      <h1 className={styles.title}>{baslik}</h1>
      <p className={styles.description}>{aciklama}</p>

      {birincilEylem || ikincilBaglanti ? (
        <div className={styles.actions}>
          {birincilEylem ? (
            <Link to={birincilEylem.hedef} className={styles.primaryLink}>
              {birincilEylem.etiket}
            </Link>
          ) : null}
          {ikincilBaglanti ? (
            <Link to={ikincilBaglanti.hedef} className={styles.link}>
              {ikincilBaglanti.etiket}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
```

**Not:** `GlassButton`'ın `asChild` prop'u **yoktur** (doğrulandı — API'si `size · tint · prominent · tone · loading` + `ButtonHTMLAttributes`). Bu yüzden birincil eylem bir `<button>` değil, birincil görünümlü bir `<Link>`'tir: durum sayfalarının birincil eylemi her zaman bir gezinmedir, form gönderimi değil. `GlassButton` import etmeyin.

`.primaryLink` sınıfını `AuthStatusPage.module.css`'e ekleyin:

```css
.primaryLink {
  display: inline-flex;
  align-items: center;
  min-height: var(--lg-control-md);
  padding-inline: var(--lg-space-5);
  border-radius: var(--lg-radius-capsule);
  background: var(--lg-accent);
  color: var(--lg-accent-contrast);
  font-size: var(--lg-text-body);
  font-weight: 600;
  text-decoration: none;
}

.primaryLink:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: var(--lg-focus-ring-offset);
}
```

- [ ] **Step 7: `AuthCallbackPage.tsx` yaz**

```tsx
import styles from './AuthStatusPage.module.css'

export interface AuthCallbackPageProps {
  durum: 'pending' | 'error'
  baslik: string
  hataMesaji?: string
}

/**
 * Dış sağlayıcıdan dönüşü karşılayan ekran. Bekleme durumu `role="status"`
 * ile duyurulur; hata durumunda kullanıcı burada takılı kalmaz, çağıran
 * sayfa ilgili durum rotasına yönlendirir.
 */
export function AuthCallbackPage({ durum, baslik, hataMesaji }: AuthCallbackPageProps) {
  if (durum === 'error') {
    return (
      <div className={styles.page} data-tone="error" role="alert">
        <span className={styles.mark} aria-hidden="true">
          !
        </span>
        <h1 className={styles.title}>{baslik}</h1>
        <p className={styles.description}>{hataMesaji}</p>
      </div>
    )
  }

  return (
    <div className={styles.page} data-tone="info" role="status" aria-live="polite">
      <span className={styles.mark} aria-hidden="true">
        i
      </span>
      <h1 className={styles.title}>{baslik}</h1>
      <p className={styles.description}>Bu işlem birkaç saniye sürebilir.</p>
    </div>
  )
}
```

- [ ] **Step 8: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/components/authArketipleri.test.tsx`
Expected: PASS — 10/10

- [ ] **Step 9: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth/components
git commit -m "$(cat <<'EOF'
feat(auth): form, durum ve callback arketip bileşenleri

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `/giris` — yöntem seçimi sayfası

**Files:**
- Create: `apps/web/src/features/auth/pages/GirisPage.tsx`
- Create: `apps/web/src/features/auth/pages/GirisPage.module.css`
- Create: `apps/web/src/features/auth/pages/GirisPage.test.tsx`
- Create: `apps/web/src/routes/giris.tsx`

**Interfaces:**
- Consumes: `AuthFormPage`, `useAuthSession`, `guvenliDonusYolu`
- Produces: `GirisPage` bileşeni; `/giris` rotası `donus` arama parametresini kabul eder

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/GirisPage.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthSessionProvider } from '../AuthSessionProvider'
import type { AuthAdapters } from '../data/auth-adapters'
import { GirisPage } from './GirisPage'

function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: { kanal: 'sms' as const, maskeliKimlik: '555 *** 22 33' },
    })),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function girisRouter(adapters: AuthAdapters, baslangicYolu = '/giris') {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const girisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: GirisPage,
  })
  const kodRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris/kod',
    component: () => <h1>Kod ekranı</h1>,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([girisRoute, kodRoute]),
    history: createMemoryHistory({ initialEntries: [baslangicYolu] }),
  })
}

describe('GirisPage', () => {
  it('telefon alanını doğru autocomplete ile sunar', async () => {
    render(<RouterProvider router={girisRouter(sahteAdapters())} />)
    const alan = await screen.findByLabelText('Telefon numarası')
    expect(alan.getAttribute('autocomplete')).toBe('tel')
    expect(alan.getAttribute('inputmode')).toBe('numeric')
  })

  it('geçerli telefonla giriş başlatır ve kod ekranına gider', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={girisRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Telefon numarası'), '5551112233')
    await kullanici.click(screen.getByRole('button', { name: 'Kod gönder' }))
    await waitFor(() => expect(adapters.girisBaslat).toHaveBeenCalledWith('telefon', '5551112233'))
  })

  it('adapter hatasını alert olarak gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      girisBaslat: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'gecersiz-kimlik' as const,
        mesaj: 'Telefon numarasını 5XX XXX XX XX biçiminde girin.',
      })),
    })
    render(<RouterProvider router={girisRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Telefon numarası'), '123')
    await kullanici.click(screen.getByRole('button', { name: 'Kod gönder' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('5XX XXX XX XX'),
    )
  })

  it('diğer yöntemlere bağlantı sunar', async () => {
    render(<RouterProvider router={girisRouter(sahteAdapters())} />)
    expect(await screen.findByRole('link', { name: /parola/i })).toBeTruthy()
  })
})
```

**Not:** `Outlet` import'unu `@tanstack/react-router`'dan eklemeyi unutmayın.

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/GirisPage.test.tsx`
Expected: FAIL — `Failed to resolve import "./GirisPage"`

- [ ] **Step 3: `GirisPage.module.css` yaz**

```css
.field {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-2);
}

.label {
  font-size: var(--lg-text-footnote);
  font-weight: 600;
}

.input {
  min-height: var(--lg-control-md);
  padding-inline: var(--lg-space-3);
  border: var(--lg-stroke-hairline) solid var(--lg-hairline);
  border-radius: var(--lg-radius-chip);
  background: var(--lg-surface);
  color: var(--lg-label);
  font: inherit;
  font-size: var(--lg-text-body);
}

.input:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: var(--lg-focus-ring-offset);
}

.hint {
  margin: 0;
  font-size: var(--lg-text-caption);
  color: var(--lg-label-secondary);
}

.divider {
  display: flex;
  align-items: center;
  gap: var(--lg-space-3);
  font-size: var(--lg-text-caption);
  color: var(--lg-label-secondary);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  block-size: var(--lg-stroke-hairline);
  background: var(--lg-hairline);
}
```

- [ ] **Step 4: `GirisPage.tsx` yaz**

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import styles from './GirisPage.module.css'

/** Giriş akışının tek kapısı — telefon birincil, diğer yöntemler bağlantı. */
export function GirisPage() {
  const { adapters } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [telefon, setTelefon] = useState('')
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.girisBaslat('telefon', telefon)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    navigate({
      to: '/giris/kod',
      search: { donus: guvenliDonusYolu(donus) },
    })
  }

  return (
    <AuthFormPage
      baslik="Giriş yapın"
      aciklama="Telefon numaranıza tek kullanımlık bir kod göndereceğiz."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Kod gönder"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[
        { etiket: 'Parola ile giriş yapın', hedef: '/giris/parola' },
        { etiket: 'Hesap oluşturun', hedef: '/kayit' },
      ]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="giris-telefon">
          Telefon numarası
        </label>
        <input
          id="giris-telefon"
          className={styles.input}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="5XX XXX XX XX"
          value={telefon}
          onChange={(event) => setTelefon(event.target.value)}
        />
        <p className={styles.hint}>Numaranız yalnız giriş doğrulaması için kullanılır.</p>
      </div>
    </AuthFormPage>
  )
}
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/GirisPage.test.tsx`
Expected: PASS — 4/4

- [ ] **Step 6: Rota dosyasını oluştur**

`apps/web/src/routes/giris.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { GirisPage } from '@/features/auth/pages/GirisPage'

export const Route = createFileRoute('/giris')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Giriş yapın | arsam.net' },
      { name: 'description', content: 'arsam.net hesabınıza telefon, parola veya Google ile giriş yapın.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GirisPage,
})
```

- [ ] **Step 7: Tarayıcıda doğrula**

Dev sunucu zaten ayakta. `curl -sf http://127.0.0.1:3000/health` ile teyit edin, sonra Playwright ile `/giris` ekran görüntüsü alın (1440×900 ve 390×844). Playwright'ı mutlak yolla ve CommonJS default import ile çağırın:

```js
import pw from '/Users/ahmet/Desktop/storybook/node_modules/@playwright/test/index.js'
const { chromium } = pw
```

Script ve görüntüleri `/private/tmp/claude-501/-Users-ahmet-Desktop-storybook/6c18a21d-eb9f-4647-ab48-bf6b4bfd4183/scratchpad/` altına yazın. Kontrol edin: `AuthShell` devrede mi (dock ve ada header görünmemeli), yatay taşma 0 mı, telefon alanı ve buton 44px mi.

- [ ] **Step 8: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes/giris.tsx apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): /giris yöntem seçimi sayfası

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `/giris/kod` — telefon kodu doğrulama

**Files:**
- Create: `apps/web/src/features/auth/pages/GirisKodPage.tsx`
- Create: `apps/web/src/features/auth/pages/GirisKodPage.test.tsx`
- Create: `apps/web/src/routes/giris.kod.tsx`

**Interfaces:**
- Consumes: `AuthFormPage`, `useAuthSession`, `guvenliDonusYolu`, `GirisPage.module.css` (aynı alan stilleri)
- Produces: `GirisKodPage`; başarılı doğrulamada `guvenliDonusYolu(donus)` hedefine yönlendirir

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/GirisKodPage.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthSessionProvider } from '../AuthSessionProvider'
import type { AuthAdapters } from '../data/auth-adapters'
import type { Oturum } from '../domain/auth-types'
import { GirisKodPage } from './GirisKodPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    parolaIleGiris: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function kodRouter(adapters: AuthAdapters, yol = '/giris/kod?donus=%2Fhesabim') {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const kodRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris/kod',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: GirisKodPage,
  })
  const hesabimRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/hesabim',
    component: () => <h1>Hesabım</h1>,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([kodRoute, hesabimRoute]),
    history: createMemoryHistory({ initialEntries: [yol] }),
  })
}

describe('GirisKodPage', () => {
  it('kod alanını tek input olarak ve one-time-code autocomplete ile sunar', async () => {
    render(<RouterProvider router={kodRouter(sahteAdapters())} />)
    const alan = await screen.findByLabelText('Doğrulama kodu')
    expect(alan.getAttribute('autocomplete')).toBe('one-time-code')
    expect(alan.getAttribute('inputmode')).toBe('numeric')
    expect(alan.getAttribute('maxlength')).toBe('6')
  })

  it('doğru kodla oturum açar ve donus hedefine gider', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kodRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '000000')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))
    await waitFor(() => expect(adapters.koduDogrula).toHaveBeenCalledWith('000000'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Hesabım' })).toBeTruthy())
  })

  it('yanlış kodda hatayı alert olarak gösterir ve yönlendirmez', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      koduDogrula: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'gecersiz-kod' as const,
        mesaj: 'Kod hatalı. Tekrar deneyin.',
      })),
    })
    render(<RouterProvider router={kodRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '999999')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Kod hatalı'))
    expect(screen.queryByRole('heading', { name: 'Hesabım' })).toBeNull()
  })

  it('dış dönüş adresini reddedip ana sayfaya yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(
      <RouterProvider
        router={kodRouter(adapters, '/giris/kod?donus=https%3A%2F%2Fkotu-site.example')}
      />,
    )
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '000000')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))
    await waitFor(() => expect(adapters.koduDogrula).toHaveBeenCalled())
    expect(screen.queryByRole('heading', { name: 'Hesabım' })).toBeNull()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/GirisKodPage.test.tsx`
Expected: FAIL — modül çözülemiyor

- [ ] **Step 3: `GirisKodPage.tsx` yaz**

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import styles from './GirisPage.module.css'

/**
 * Tek kullanımlık kod ekranı.
 *
 * Kod alanı bilinçli olarak TEK `<input>`: altı ayrı kutulu desen
 * yapıştırmayı, ekran okuyucu deneyimini ve SMS otomatik doldurmayı bozar.
 */
export function GirisKodPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [kod, setKod] = useState('')
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.koduDogrula(kod)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  return (
    <AuthFormPage
      baslik="Kodu girin"
      aciklama="Telefonunuza gönderdiğimiz altı haneli kodu yazın."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Doğrula"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[{ etiket: 'Numarayı değiştirin', hedef: '/giris' }]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="giris-kod">
          Doğrulama kodu
        </label>
        <input
          id="giris-kod"
          className={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={kod}
          onChange={(event) => setKod(event.target.value)}
        />
        <p className={styles.hint}>Kod 3 dakika geçerlidir.</p>
      </div>
    </AuthFormPage>
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/GirisKodPage.test.tsx`
Expected: PASS — 4/4

- [ ] **Step 5: Rota dosyasını oluştur**

`apps/web/src/routes/giris.kod.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { GirisKodPage } from '@/features/auth/pages/GirisKodPage'

export const Route = createFileRoute('/giris/kod')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Kodu girin | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GirisKodPage,
})
```

- [ ] **Step 6: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes/giris.kod.tsx apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): /giris/kod tek kullanımlık kod doğrulama sayfası

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `/giris/parola` — parola ile giriş

**Files:**
- Create: `apps/web/src/features/auth/pages/GirisParolaPage.tsx`
- Create: `apps/web/src/features/auth/pages/GirisParolaPage.test.tsx`
- Create: `apps/web/src/routes/giris.parola.tsx`

**Interfaces:**
- Consumes: `AuthFormPage`, `useAuthSession`, `guvenliDonusYolu`, `GirisPage.module.css`
- Produces: `GirisParolaPage`

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/GirisParolaPage.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthSessionProvider } from '../AuthSessionProvider'
import type { AuthAdapters } from '../data/auth-adapters'
import type { Oturum } from '../domain/auth-types'
import { GirisParolaPage } from './GirisParolaPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function parolaRouter(adapters: AuthAdapters) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const parolaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris/parola',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: GirisParolaPage,
  })
  const anaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <h1>Ana sayfa</h1>,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([parolaRoute, anaRoute]),
    history: createMemoryHistory({ initialEntries: ['/giris/parola'] }),
  })
}

describe('GirisParolaPage', () => {
  it('e-posta ve parola alanlarını doğru autocomplete ile sunar', async () => {
    render(<RouterProvider router={parolaRouter(sahteAdapters())} />)
    expect((await screen.findByLabelText('E-posta')).getAttribute('autocomplete')).toBe('email')
    expect(screen.getByLabelText('Parola').getAttribute('autocomplete')).toBe('current-password')
  })

  it('doğru bilgilerle oturum açar', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={parolaRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('E-posta'), 'demo@arsam.net')
    await kullanici.type(screen.getByLabelText('Parola'), 'arsam1234')
    await kullanici.click(screen.getByRole('button', { name: 'Giriş yap' }))
    await waitFor(() =>
      expect(adapters.parolaIleGiris).toHaveBeenCalledWith('demo@arsam.net', 'arsam1234'),
    )
  })

  it('hatalı bilgide alert gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      parolaIleGiris: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'gecersiz-kimlik' as const,
        mesaj: 'E-posta veya parola hatalı.',
      })),
    })
    render(<RouterProvider router={parolaRouter(adapters)} />)
    await kullanici.type(await screen.findByLabelText('E-posta'), 'demo@arsam.net')
    await kullanici.type(screen.getByLabelText('Parola'), 'yanlis')
    await kullanici.click(screen.getByRole('button', { name: 'Giriş yap' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('E-posta veya parola hatalı.'),
    )
  })

  it('parola sıfırlama bağlantısı sunar', async () => {
    render(<RouterProvider router={parolaRouter(sahteAdapters())} />)
    expect(await screen.findByRole('link', { name: /parolanızı mı unuttunuz/i })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/GirisParolaPage.test.tsx`
Expected: FAIL — modül çözülemiyor

- [ ] **Step 3: `GirisParolaPage.tsx` yaz**

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import styles from './GirisPage.module.css'

export function GirisParolaPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }
  const [ePosta, setEPosta] = useState('')
  const [parola, setParola] = useState('')
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.parolaIleGiris(ePosta, parola)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  return (
    <AuthFormPage
      baslik="Parola ile giriş"
      aciklama="E-posta adresiniz ve parolanızla giriş yapın."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Giriş yap"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[
        { etiket: 'Parolanızı mı unuttunuz?', hedef: '/parola-sifirla' },
        { etiket: 'Telefonla giriş yapın', hedef: '/giris' },
      ]}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="giris-eposta">
          E-posta
        </label>
        <input
          id="giris-eposta"
          className={styles.input}
          type="email"
          autoComplete="email"
          value={ePosta}
          onChange={(event) => setEPosta(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="giris-parola">
          Parola
        </label>
        <input
          id="giris-parola"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          value={parola}
          onChange={(event) => setParola(event.target.value)}
        />
      </div>
    </AuthFormPage>
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/GirisParolaPage.test.tsx`
Expected: PASS — 4/4

- [ ] **Step 5: Rota dosyasını oluştur**

`apps/web/src/routes/giris.parola.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { GirisParolaPage } from '@/features/auth/pages/GirisParolaPage'

export const Route = createFileRoute('/giris/parola')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Parola ile giriş | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GirisParolaPage,
})
```

- [ ] **Step 6: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes/giris.parola.tsx apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): /giris/parola sayfası

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Üç durum sayfası

**Files:**
- Create: `apps/web/src/features/auth/pages/girisDurumSayfalari.tsx`
- Create: `apps/web/src/features/auth/pages/girisDurumSayfalari.test.tsx`
- Create: `apps/web/src/routes/giris.baglanti-gonderildi.tsx`
- Create: `apps/web/src/routes/giris.baglanti.gecersiz.tsx`
- Create: `apps/web/src/routes/giris.hata.tsx`

**Interfaces:**
- Consumes: Task 4'ten `AuthStatusPage`
- Produces: `BaglantiGonderildiPage`, `BaglantiGecersizPage`, `GirisHataPage`

Bu task, `AuthStatusPage`'in tek kaynak olduğunu kanıtlar: üç rota, üç küçük içerik tanımı, sıfır yeni yerleşim kodu.

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/girisDurumSayfalari.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import {
  BaglantiGecersizPage,
  BaglantiGonderildiPage,
  GirisHataPage,
} from './girisDurumSayfalari'

function durumRouter(Component: () => JSX.Element) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const durumRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Component,
  })
  const girisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris',
    component: () => <h1>Giriş</h1>,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([durumRoute, girisRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

describe('giriş durum sayfaları', () => {
  it('bağlantı gönderildi bilgi tonunda çizilir ve alert kullanmaz', async () => {
    render(<RouterProvider router={durumRouter(BaglantiGonderildiPage)} />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('geçersiz bağlantı hata tonunda alert olarak duyurulur', async () => {
    render(<RouterProvider router={durumRouter(BaglantiGecersizPage)} />)
    expect(await screen.findByRole('alert')).toBeTruthy()
  })

  it('genel hata sayfası girişe dönüş yolu sunar', async () => {
    render(<RouterProvider router={durumRouter(GirisHataPage)} />)
    const baglanti = await screen.findByRole('link', { name: /giriş/i })
    expect(baglanti.getAttribute('href')).toBe('/giris')
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/girisDurumSayfalari.test.tsx`
Expected: FAIL — modül çözülemiyor

- [ ] **Step 3: `girisDurumSayfalari.tsx` yaz**

```tsx
import { AuthStatusPage } from '../components/AuthStatusPage'

/** E-posta bağlantısı gönderildikten sonra gösterilir. */
export function BaglantiGonderildiPage() {
  return (
    <AuthStatusPage
      tone="info"
      baslik="Bağlantıyı gönderdik"
      aciklama="E-posta kutunuzdaki giriş bağlantısına tıklayın. Bağlantı 15 dakika geçerlidir."
      ikincilBaglanti={{ etiket: 'Başka bir yöntemle girin', hedef: '/giris' }}
    />
  )
}

/** Magic link süresi dolduğunda veya bozuk olduğunda gösterilir. */
export function BaglantiGecersizPage() {
  return (
    <AuthStatusPage
      tone="error"
      baslik="Bağlantı geçersiz"
      aciklama="Bu giriş bağlantısının süresi dolmuş veya daha önce kullanılmış. Yeni bir bağlantı isteyin."
      birincilEylem={{ etiket: 'Yeni bağlantı iste', hedef: '/giris' }}
    />
  )
}

/** Sınıflandırılamayan kimlik hatalarının düştüğü sayfa. */
export function GirisHataPage() {
  return (
    <AuthStatusPage
      tone="error"
      baslik="Giriş tamamlanamadı"
      aciklama="Beklenmeyen bir sorun oluştu. Tekrar denediğinizde sorun sürerse bize yazın."
      birincilEylem={{ etiket: 'Girişe dön', hedef: '/giris' }}
    />
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/girisDurumSayfalari.test.tsx`
Expected: PASS — 3/3

- [ ] **Step 5: Üç rota dosyasını oluştur**

`apps/web/src/routes/giris.baglanti-gonderildi.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { BaglantiGonderildiPage } from '@/features/auth/pages/girisDurumSayfalari'

export const Route = createFileRoute('/giris/baglanti-gonderildi')({
  head: () => ({
    meta: [
      { title: 'Bağlantı gönderildi | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: BaglantiGonderildiPage,
})
```

`apps/web/src/routes/giris.baglanti.gecersiz.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { BaglantiGecersizPage } from '@/features/auth/pages/girisDurumSayfalari'

export const Route = createFileRoute('/giris/baglanti/gecersiz')({
  head: () => ({
    meta: [
      { title: 'Bağlantı geçersiz | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: BaglantiGecersizPage,
})
```

`apps/web/src/routes/giris.hata.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { GirisHataPage } from '@/features/auth/pages/girisDurumSayfalari'

export const Route = createFileRoute('/giris/hata')({
  head: () => ({
    meta: [
      { title: 'Giriş tamamlanamadı | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: GirisHataPage,
})
```

- [ ] **Step 6: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): giriş akışının üç durum sayfası

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Akış entegrasyonu ve erişilebilirlik geçidi

**Files:**
- Create: `apps/web/src/features/auth/auth-flow.test.tsx`
- Create: `apps/web/src/features/auth/AuthAccessibility.test.tsx`
- Modify: `apps/web/src/routes/hesabim.tsx` (korumayı bağla)

**Interfaces:**
- Consumes: bu plandaki her şey
- Produces: yok (doğrulama task'ı)

- [ ] **Step 1: `/hesabim` rotasına korumayı bağla**

`apps/web/src/routes/hesabim.tsx` içindeki `component`'i sarmalayın — mevcut bileşen adını koruyun, yalnız koruma ekleyin:

```tsx
import { useKorumaliRota } from '@/features/auth'

function KorumaliHesabim() {
  useKorumaliRota()
  const { girisYapildi } = useAuthSession()
  if (!girisYapildi) return null
  return <AccountWorkspace />
}
```

`useAuthSession` import'unu `@/features/auth`'tan ekleyin ve `Route`'un `component` alanını `KorumaliHesabim` yapın.

- [ ] **Step 2: Akış testini yaz**

`apps/web/src/features/auth/auth-flow.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthSessionProvider, useAuthSession, useKorumaliRota } from './AuthSessionProvider'
import type { AuthAdapters } from './data/auth-adapters'
import type { Oturum } from './domain/auth-types'
import { GirisPage } from './pages/GirisPage'
import { GirisKodPage } from './pages/GirisKodPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function akisAdapters(): AuthAdapters {
  let oturum: Oturum | null = null
  return {
    girisBaslat: vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: { kanal: 'sms' as const, maskeliKimlik: '555 *** 22 33' },
    })),
    koduDogrula: vi.fn(async () => {
      oturum = ORNEK_OTURUM
      return { durum: 'basarili' as const, veri: ORNEK_OTURUM }
    }),
    parolaIleGiris: vi.fn(),
    oturumuGetir: () => oturum,
    cikisYap: () => {
      oturum = null
    },
  } as AuthAdapters
}

function KorumaliHesabim() {
  useKorumaliRota()
  const { girisYapildi } = useAuthSession()
  if (!girisYapildi) return null
  return <h1>Hesabım</h1>
}

function akisRouter(adapters: AuthAdapters, baslangic: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const arama = (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  })
  const rotalar = [
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <h1>Ana sayfa</h1> }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: GirisPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris/kod',
      validateSearch: arama,
      component: GirisKodPage,
    }),
    createRoute({ getParentRoute: () => rootRoute, path: '/hesabim', component: KorumaliHesabim }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: [baslangic] }),
  })
}

describe('auth akışı', () => {
  it('oturumsuz kullanıcıyı korumalı rotadan girişe yönlendirir', async () => {
    render(<RouterProvider router={akisRouter(akisAdapters(), '/hesabim')} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('giriş → kod → korumalı sayfaya dönüş yolunu tamamlar', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={akisRouter(akisAdapters(), '/hesabim')} />)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
    await kullanici.type(screen.getByLabelText('Telefon numarası'), '5551112233')
    await kullanici.click(screen.getByRole('button', { name: 'Kod gönder' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Kodu girin' })).toBeTruthy())
    await kullanici.type(screen.getByLabelText('Doğrulama kodu'), '000000')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Hesabım' })).toBeTruthy())
  })

  it('dönüş parametresi olmadan giriş yapan kullanıcı ana sayfaya gider', async () => {
    const kullanici = userEvent.setup()
    render(<RouterProvider router={akisRouter(akisAdapters(), '/giris')} />)

    await kullanici.type(await screen.findByLabelText('Telefon numarası'), '5551112233')
    await kullanici.click(screen.getByRole('button', { name: 'Kod gönder' }))
    await kullanici.type(await screen.findByLabelText('Doğrulama kodu'), '000000')
    await kullanici.click(screen.getByRole('button', { name: 'Doğrula' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Ana sayfa' })).toBeTruthy())
  })
})
```

- [ ] **Step 3: Akış testini çalıştır**

Run: `npx vitest run apps/web/src/features/auth/auth-flow.test.tsx`
Expected: PASS — 3/3

- [ ] **Step 4: Erişilebilirlik geçidi testini yaz**

`apps/web/src/features/auth/AuthAccessibility.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthSessionProvider } from './AuthSessionProvider'
import type { AuthAdapters } from './data/auth-adapters'
import { GirisPage } from './pages/GirisPage'
import { GirisKodPage } from './pages/GirisKodPage'
import { GirisParolaPage } from './pages/GirisParolaPage'

function bosAdapters(): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
  } as AuthAdapters
}

function sayfaRouter(Component: () => JSX.Element) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={bosAdapters()}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const sayfa = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: Component,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([sayfa]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

const SAYFALAR: ReadonlyArray<[string, () => JSX.Element]> = [
  ['GirisPage', GirisPage],
  ['GirisKodPage', GirisKodPage],
  ['GirisParolaPage', GirisParolaPage],
]

describe('auth erişilebilirlik geçidi', () => {
  it.each(SAYFALAR)('%s tek h1 taşır', async (_ad, Component) => {
    render(<RouterProvider router={sayfaRouter(Component)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it.each(SAYFALAR)('%s içindeki her form alanı erişilebilir isim taşır', async (_ad, Component) => {
    const { container } = render(<RouterProvider router={sayfaRouter(Component)} />)
    await screen.findByRole('heading', { level: 1 })
    const alanlar = Array.from(container.querySelectorAll('input'))
    expect(alanlar.length).toBeGreaterThan(0)
    for (const alan of alanlar) {
      const id = alan.getAttribute('id')
      expect(id, 'her input id taşımalı').toBeTruthy()
      expect(container.querySelector(`label[for="${id}"]`), `${id} için label bulunamadı`).toBeTruthy()
    }
  })

  it.each(SAYFALAR)('%s içindeki her form alanı autocomplete taşır', async (_ad, Component) => {
    const { container } = render(<RouterProvider router={sayfaRouter(Component)} />)
    await screen.findByRole('heading', { level: 1 })
    for (const alan of Array.from(container.querySelectorAll('input'))) {
      expect(
        alan.getAttribute('autocomplete'),
        `${alan.getAttribute('id')} autocomplete taşımıyor`,
      ).toBeTruthy()
    }
  })

  it('kod alanı tek input olarak sunulur — altı kutulu desen kullanılmaz', async () => {
    const { container } = render(<RouterProvider router={sayfaRouter(GirisKodPage)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(container.querySelectorAll('input')).toHaveLength(1)
  })
})
```

- [ ] **Step 5: Erişilebilirlik testini çalıştır**

Run: `npx vitest run apps/web/src/features/auth/AuthAccessibility.test.tsx`
Expected: PASS — 10/10

- [ ] **Step 6: Tarayıcıda uçtan uca doğrula**

Dev sunucu zaten ayakta (`curl -sf http://127.0.0.1:3000/health`). Playwright ile (mutlak yol + CommonJS default import, script'ler scratchpad'e):

1. `/hesabim`'a oturumsuz git → `/giris?donus=/hesabim`'a yönlendiğini doğrula.
2. `/giris`, `/giris/kod`, `/giris/parola`, `/giris/baglanti-gonderildi`, `/giris/baglanti/gecersiz`, `/giris/hata` — altısında da 1440×900 ve 390×844 ekran görüntüsü al.
3. Her sayfada doğrula: yatay taşma (`scrollWidth - innerWidth`) **0**; `AuthShell` devrede (dock ve ada header YOK); `h1` hesaplanmış `font-size` **22px** (display 28px kullanılmamış); interaktif öğeler dokunmatik bağlamda (`hasTouch: true`) ≥44px.

Bulguları raporunuza yazın. Herhangi biri tutmuyorsa düzeltin.

- [ ] **Step 7: Tam doğrulama ve commit**

```bash
npx tsc -b && npm run lint && npm test
```
Expected: baseline 18 kırık korunuyor, auth testlerinin tamamı geçiyor.

```bash
git add apps/web/src/features/auth apps/web/src/routes/hesabim.tsx
git commit -m "$(cat <<'EOF'
feat(auth): akış entegrasyonu, erişilebilirlik geçidi ve /hesabim koruması

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Bu planın kapsamadıkları

Spec'in Faz 2-4'ü ayrı planlara bırakıldı: kayıt yolu (`/kayit`, `/kayit/profil`, `/kayit/kurumsal`, `/kayit/hesap-var`, `/hesap/dogrula`), parola akışı (`/parola-sifirla` üçlüsü, `/hesabim/parola`), erişim durumları (`/oturum-suresi-doldu`, `/yetkisiz`, `/hesap/askida`) ve callback'ler (`/giris/baglanti/dogrula`, `/giris/google/dogrula`, `/hesabim/e-posta-dogrula`).

`AuthStatusPage` ve `AuthFormPage` bu planda kurulduğu için, kalan 13 sayfanın çoğu içerik tanımından ibaret olacak.
