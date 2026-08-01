# Auth Faz 2 — Kayıt Yolu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kayıt akışını tamamlamak — hesap tipi seçimiyle kayıt, profil tamamlama, kurumsal başvuru, "hesap zaten var" durumu ve hesap seviyesinde EİDS doğrulaması.

**Architecture:** Faz 0+1'de kurulan temel üzerine biner: `AuthFormPage`/`AuthStatusPage` arketipleri, `AuthShell`, `AuthSessionProvider` ve `auth-adapters.ts` arayüzü. Bu faz adapter'a kayıt işlemlerini ekler ve beş sayfa üretir; yeni yerleşim veya kabuk kodu yazılmaz.

**Tech Stack:** React 19, TanStack Router (file-based routes), CSS Modules, vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-07-31-auth-sayfalari-design.md` (§3 route haritası, §8 Faz 2)
**Önceki faz:** `docs/superpowers/plans/2026-07-31-auth-faz0-1-giris-akisi.md` — tamamlandı
**Feature sözleşmesi:** `apps/web/src/features/auth/rules.md` — **her task başlamadan okunur**

## Global Constraints

- **Token tek kaynak:** `src/index.css`. Tipografi `--lg-text-badge` 11 / `-caption` 12 / `-footnote` 13 / `-body` 15 / `-headline` 17 / `-title` 22 / `-display` 28. Spacing `--lg-space-1..10` = 4/8/12/16/20/24/32/40/48/64. Radius chip 10 / media 14 / card 20 / capsule 999. Kontrol yükseklikleri `--lg-control-sm/md` 44, `-lg` 48, `-xl` 56.
- **`--lg-text-display` (28px) KULLANILMAZ.** Sayfa başlığı `--lg-text-title` (22px), bölüm başlığı `--lg-text-headline` (17px).
- **Raw px/hex yasak** — yalnız `var(--lg-*)`.
- **`--lg-control-*` yalnız etkileşimli kontrol yüksekliğidir** — dekoratif öğede veya layout ölçüsü olarak kullanılmaz.
- **Dokunma hedefi 44px yalnız `@media (pointer: coarse)` altında zorunlu.** Breakpoint yerine `pointer: coarse` / `hover: hover`.
- **Focus halkası yalnız `:focus-visible`.**
- **Ölü buton/bağlantı yok.** Var olmayan bir rotaya bağlantı verilmez; bağlanamayan eylem `disabled` + görünür gerekçe ile çıkar.
- **Dil:** Kullanıcıya görünen her metin Türkçe. Kod tanımlayıcıları İngilizce.
- **Doğrulama komutları:** `npm run typecheck` · `npm run lint` · `npm test`. **`npx tsc -b` KULLANILMAZ** — kök tsconfig `apps/web`'i referans grafında taşımaz, yazılan kodu hiç kapsamaz.
- **Test baseline:** `npm test` şu an ~**18 kırık** (hepsi `apps/web/src/features/listing-detail/`). **Bu sayı sabit değildir** — bu repo'nun suite'i kararsızdır ve aynı commit'te bile farklı sayılar verebilir (`listing-create/ListingCreateWorkspace.test.tsx` ve `messages/MessagesWorkspace.test.tsx` bilinen flake'ler). Kural: **sayıyı değil, kimliği izleyin.** Kırık testler `listing-detail/` dışına çıkıyorsa, o dosyayı **tek başına** çalıştırıp gerçekten kırık mı flake mi olduğunu doğrulayın; tek başına geçiyorsa regresyon değildir, raporda belirtin. Kendi yazdığınız testler her koşuda geçmelidir.
- **Dev sunucu `http://127.0.0.1:3000` üzerinde zaten ayakta.** Yeniden başlatmayın, `npm run dev` çalıştırmayın (port dolu, hata verir).
- **Commit:** Türkçe conventional commit, mesaj sonunda `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`. Push YOK.

### Faz 1'de öğrenilen dört tuzak — tekrarlamayın

1. **Rota dosyası adlandırma.** `kayit.profil.tsx` gibi noktalı ad, rotayı `/kayit`'in **çocuğu** yapar; `KayitPage`'de `<Outlet/>` olmadığı için sayfa tarayıcıda hiç render edilmez — ve **unit testler bunu yakalamaz** (kendi düz route tree'lerini kurarlar). `/kayit` altındaki kardeşler `_` sonekiyle yazılır: `kayit_.profil.tsx`. Repo örnekleri: `giris_.kod.tsx`, `hesabim_.mesajlar.tsx`. **Rota oluşturan her task sayfayı tarayıcıda açıp doğru bileşenin geldiğini doğrular.** Ayrıca `apps/web/src/features/auth/auth-routes.test.tsx` gerçek `routeTree`'yi sınayan smoke testtir — yeni rotalar oraya eklenir (Task 7).
2. **`<main id="main-content">` sayfanın sorumluluğu**, kabuğun değil. `AuthShell` `main` üretmez; `AuthFormPage`/`AuthStatusPage` üretir. Sayfa bileşenleri kendi `main`'ini **açmaz**.
3. **`role="alert"` landmark'a konmaz** — açıklama paragrafına konur, yoksa `main` landmark'ı ARIA ağacından silinir.
4. **`donus` her zaman `guvenliDonusYolu`'ndan geçer** ve ikincil bağlantılar onu `search={(onceki) => onceki}` ile taşır.

---

## Dosya Yapısı

```
apps/web/src/features/auth/
├── domain/
│   ├── auth-types.ts              — Modify: kayıt tipleri (Task 1)
│   └── kayit-dogrulama.ts         — Create: alan doğrulama kuralları (Task 1)
│   └── kayit-dogrulama.test.ts    — Create
├── data/
│   ├── auth-adapters.ts           — Modify: kayıt işlemleri (Task 1)
│   └── auth-adapters.test.ts      — Modify: yeni işlemlerin testleri
├── pages/
│   ├── KayitPage.tsx              — Create (Task 2)
│   ├── KayitProfilPage.tsx        — Create (Task 3)
│   ├── KayitKurumsalPage.tsx      — Create (Task 4)
│   ├── kayitDurumSayfalari.tsx    — Create (Task 5)
│   ├── HesapDogrulaPage.tsx       — Create (Task 6)
│   └── *.test.tsx
├── auth-routes.test.tsx           — Modify: yeni rotalar (Task 7)
├── AuthAccessibility.test.tsx     — Modify: yeni sayfalar (Task 7)
├── kayit-flow.test.tsx            — Create: kayıt akışı entegrasyonu (Task 7)
├── rules.md                       — Modify: kayıt sözleşmesi (Task 7)
└── index.ts                       — Modify: yeni export'lar

apps/web/src/routes/
├── kayit.tsx · kayit_.profil.tsx · kayit_.kurumsal.tsx · kayit_.hesap-var.tsx
└── hesap.dogrula.tsx
```

---

## Task 1: Kayıt tipleri, doğrulama kuralları ve adapter genişletmesi

**Files:**
- Modify: `apps/web/src/features/auth/domain/auth-types.ts`
- Create: `apps/web/src/features/auth/domain/kayit-dogrulama.ts`
- Create: `apps/web/src/features/auth/domain/kayit-dogrulama.test.ts`
- Modify: `apps/web/src/features/auth/data/auth-adapters.ts`
- Modify: `apps/web/src/features/auth/data/auth-adapters.test.ts`
- Modify: `apps/web/src/features/auth/index.ts`

**Interfaces:**
- Consumes: mevcut `Oturum`, `HesapTipi`, `EidsDurumu`, `AuthSonuc`, `AuthHataKodu`, `AuthAdapters`
- Produces:
  - `interface KayitBilgileri { adSoyad: string; ePosta: string; telefon: string; parola: string; hesapTipi: HesapTipi; kvkkOnayi: boolean }`
  - `interface KurumsalBasvuruBilgileri { ticaretUnvani: string; vergiNumarasi: string; vergiDairesi: string; il: string; ilce: string; yetkiBelgesiNo: string; yetkiliAdSoyad: string; yetkiliEPosta: string; yetkiliTelefon: string }`
  - `type KayitAlanHatalari = Partial<Record<keyof KayitBilgileri, string>>`
  - `type KurumsalAlanHatalari = Partial<Record<keyof KurumsalBasvuruBilgileri, string>>`
  - `function kayitBilgileriniDogrula(bilgiler: KayitBilgileri): KayitAlanHatalari`
  - `function kurumsalBasvuruyuDogrula(bilgiler: KurumsalBasvuruBilgileri): KurumsalAlanHatalari`
  - `AuthAdapters`'a eklenenler: `kayitYap(bilgiler)`, `profilTamamla(adSoyad, ePosta)`, `kurumsalBasvuruGonder(bilgiler)`, `eidsDogrulamaBaslat()`
  - `AuthHataKodu`'na eklenen: `'hesap-zaten-var'` · `'eksik-alan'` · `'eids-reddedildi'`

- [ ] **Step 1: Doğrulama kuralları için failing test yaz**

`apps/web/src/features/auth/domain/kayit-dogrulama.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { kayitBilgileriniDogrula, kurumsalBasvuruyuDogrula } from './kayit-dogrulama'
import type { KayitBilgileri, KurumsalBasvuruBilgileri } from './auth-types'

const gecerliKayit: KayitBilgileri = {
  adSoyad: 'Mehmet Yılmaz',
  ePosta: 'mehmet@arsam.net',
  telefon: '5551112233',
  parola: 'Arsam1234',
  hesapTipi: 'bireysel',
  kvkkOnayi: true,
}

const gecerliKurumsal: KurumsalBasvuruBilgileri = {
  ticaretUnvani: 'Arsam Gayrimenkul Ltd. Şti.',
  vergiNumarasi: '1234567890',
  vergiDairesi: 'Konak',
  il: 'İzmir',
  ilce: 'Konak',
  yetkiBelgesiNo: 'YB-2026-0042',
  yetkiliAdSoyad: 'Ayşe Kaya',
  yetkiliEPosta: 'ayse@arsam.net',
  yetkiliTelefon: '5551112233',
}

describe('kayitBilgileriniDogrula', () => {
  it('geçerli bilgilerde hata döndürmez', () => {
    expect(kayitBilgileriniDogrula(gecerliKayit)).toEqual({})
  })

  it('boş ad soyadı yakalar', () => {
    const hatalar = kayitBilgileriniDogrula({ ...gecerliKayit, adSoyad: '  ' })
    expect(hatalar.adSoyad).toBeTruthy()
  })

  it('geçersiz e-postayı yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, ePosta: 'mehmet' }).ePosta).toBeTruthy()
  })

  it('geçersiz telefonu yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, telefon: '123' }).telefon).toBeTruthy()
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, telefon: '4551112233' }).telefon).toBeTruthy()
  })

  it('kısa parolayı yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, parola: 'Ar1' }).parola).toBeTruthy()
  })

  it('büyük harf veya rakam içermeyen parolayı yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, parola: 'arsamarsam' }).parola).toBeTruthy()
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, parola: 'ARSAMARSAM' }).parola).toBeTruthy()
  })

  it('KVKK onayı verilmediyse yakalar', () => {
    expect(kayitBilgileriniDogrula({ ...gecerliKayit, kvkkOnayi: false }).kvkkOnayi).toBeTruthy()
  })

  it('hata mesajları Türkçedir ve alanı adlandırır', () => {
    const hatalar = kayitBilgileriniDogrula({ ...gecerliKayit, ePosta: '' })
    expect(hatalar.ePosta).toMatch(/e-posta/i)
  })
})

describe('kurumsalBasvuruyuDogrula', () => {
  it('geçerli başvuruda hata döndürmez', () => {
    expect(kurumsalBasvuruyuDogrula(gecerliKurumsal)).toEqual({})
  })

  it('zorunlu alanların boşluğunu yakalar', () => {
    const hatalar = kurumsalBasvuruyuDogrula({
      ...gecerliKurumsal,
      ticaretUnvani: '',
      vergiDairesi: '   ',
      yetkiBelgesiNo: '',
    })
    expect(hatalar.ticaretUnvani).toBeTruthy()
    expect(hatalar.vergiDairesi).toBeTruthy()
    expect(hatalar.yetkiBelgesiNo).toBeTruthy()
  })

  it('vergi numarasının 10 haneli rakam olmasını ister', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, vergiNumarasi: '123' }).vergiNumarasi).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, vergiNumarasi: 'abcdefghij' }).vergiNumarasi).toBeTruthy()
  })

  it('yetkili e-postasını ve telefonunu doğrular', () => {
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, yetkiliEPosta: 'ayse' }).yetkiliEPosta).toBeTruthy()
    expect(kurumsalBasvuruyuDogrula({ ...gecerliKurumsal, yetkiliTelefon: '123' }).yetkiliTelefon).toBeTruthy()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/domain/kayit-dogrulama.test.ts`
Expected: FAIL — `Failed to resolve import "./kayit-dogrulama"`

- [ ] **Step 3: `auth-types.ts`'e kayıt tiplerini ekle**

Mevcut dosyanın sonuna ekleyin (mevcut içeriği değiştirmeyin), ve `AuthHataKodu` birleşimine üç kod ekleyin:

```ts
export type AuthHataKodu =
  | 'gecersiz-kimlik'
  | 'gecersiz-kod'
  | 'kod-suresi-doldu'
  | 'hesap-askida'
  | 'ag-hatasi'
  | 'hesap-zaten-var'
  | 'eksik-alan'
  | 'eids-reddedildi'

/** Kayıt formunun topladığı bilgiler. */
export interface KayitBilgileri {
  adSoyad: string
  ePosta: string
  telefon: string
  parola: string
  hesapTipi: HesapTipi
  /** KVKK aydınlatma metni ve kullanım koşulları onayı — zorunlu. */
  kvkkOnayi: boolean
}

/** Emlak ofisi başvurusunun topladığı bilgiler. */
export interface KurumsalBasvuruBilgileri {
  ticaretUnvani: string
  vergiNumarasi: string
  vergiDairesi: string
  il: string
  ilce: string
  /** Taşınmaz ticareti yetki belgesi numarası. */
  yetkiBelgesiNo: string
  yetkiliAdSoyad: string
  yetkiliEPosta: string
  yetkiliTelefon: string
}

export type KayitAlanHatalari = Partial<Record<keyof KayitBilgileri, string>>
export type KurumsalAlanHatalari = Partial<Record<keyof KurumsalBasvuruBilgileri, string>>
```

- [ ] **Step 4: `kayit-dogrulama.ts` yaz**

```ts
import type {
  KayitAlanHatalari,
  KayitBilgileri,
  KurumsalAlanHatalari,
  KurumsalBasvuruBilgileri,
} from './auth-types'

const ePostaGecerli = (ham: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ham.trim())
const telefonGecerli = (ham: string) => /^5\d{9}$/.test(ham.replace(/\s/g, ''))
const dolu = (ham: string) => ham.trim().length > 0

/**
 * Kayıt formunun alan doğrulaması.
 *
 * Sunucu doğrulamasının yerine geçmez; kullanıcıya anında geri bildirim
 * vermek içindir. Gerçek doğrulama backend geldiğinde adapter'ın
 * döndürdüğü hata kodlarıyla yapılır.
 */
export function kayitBilgileriniDogrula(bilgiler: KayitBilgileri): KayitAlanHatalari {
  const hatalar: KayitAlanHatalari = {}

  if (!dolu(bilgiler.adSoyad)) hatalar.adSoyad = 'Ad ve soyadınızı girin.'
  if (!ePostaGecerli(bilgiler.ePosta)) hatalar.ePosta = 'Geçerli bir e-posta adresi girin.'
  if (!telefonGecerli(bilgiler.telefon)) {
    hatalar.telefon = 'Telefon numarasını 5XX XXX XX XX biçiminde girin.'
  }

  const parola = bilgiler.parola
  if (parola.length < 8) {
    hatalar.parola = 'Parola en az 8 karakter olmalı.'
  } else if (!/[A-ZÇĞİÖŞÜ]/.test(parola) || !/\d/.test(parola)) {
    hatalar.parola = 'Parola en az bir büyük harf ve bir rakam içermeli.'
  }

  if (!bilgiler.kvkkOnayi) {
    hatalar.kvkkOnayi = 'Devam etmek için aydınlatma metnini onaylayın.'
  }

  return hatalar
}

/** Emlak ofisi başvurusunun alan doğrulaması. */
export function kurumsalBasvuruyuDogrula(
  bilgiler: KurumsalBasvuruBilgileri,
): KurumsalAlanHatalari {
  const hatalar: KurumsalAlanHatalari = {}

  if (!dolu(bilgiler.ticaretUnvani)) hatalar.ticaretUnvani = 'Ticaret ünvanını girin.'
  if (!/^\d{10}$/.test(bilgiler.vergiNumarasi.trim())) {
    hatalar.vergiNumarasi = 'Vergi numarası 10 haneli olmalı.'
  }
  if (!dolu(bilgiler.vergiDairesi)) hatalar.vergiDairesi = 'Vergi dairesini girin.'
  if (!dolu(bilgiler.il)) hatalar.il = 'İl seçin.'
  if (!dolu(bilgiler.ilce)) hatalar.ilce = 'İlçe girin.'
  if (!dolu(bilgiler.yetkiBelgesiNo)) {
    hatalar.yetkiBelgesiNo = 'Taşınmaz ticareti yetki belgesi numarasını girin.'
  }
  if (!dolu(bilgiler.yetkiliAdSoyad)) hatalar.yetkiliAdSoyad = 'Yetkilinin adını soyadını girin.'
  if (!ePostaGecerli(bilgiler.yetkiliEPosta)) {
    hatalar.yetkiliEPosta = 'Geçerli bir e-posta adresi girin.'
  }
  if (!telefonGecerli(bilgiler.yetkiliTelefon)) {
    hatalar.yetkiliTelefon = 'Telefon numarasını 5XX XXX XX XX biçiminde girin.'
  }

  return hatalar
}
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/domain/kayit-dogrulama.test.ts`
Expected: PASS — 13/13

- [ ] **Step 6: Adapter genişletmesi için failing test yaz**

`apps/web/src/features/auth/data/auth-adapters.test.ts` dosyasının sonuna ekleyin (mevcut testleri değiştirmeyin; dosyanın mevcut import satırına `KayitBilgileri` ve `KurumsalBasvuruBilgileri` tiplerini ekleyin):

```ts
const ORNEK_KAYIT: KayitBilgileri = {
  adSoyad: 'Yeni Kullanıcı',
  ePosta: 'yeni@arsam.net',
  telefon: '5559998877',
  parola: 'Arsam1234',
  hesapTipi: 'bireysel',
  kvkkOnayi: true,
}

describe('kayıt işlemleri', () => {
  beforeEach(() => {
    varsayilanAuthAdapters.cikisYap()
  })

  it('yeni hesap açar ve oturumu başlatır', async () => {
    const sonuc = await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') {
      expect(sonuc.veri.ePosta).toBe('yeni@arsam.net')
      expect(sonuc.veri.hesapTipi).toBe('bireysel')
      expect(sonuc.veri.eidsDurumu).toBe('yok')
    }
    expect(varsayilanAuthAdapters.oturumuGetir()).not.toBeNull()
  })

  it('zaten kayıtlı e-postayı reddeder', async () => {
    const sonuc = await varsayilanAuthAdapters.kayitYap({
      ...ORNEK_KAYIT,
      ePosta: 'demo@arsam.net',
    })
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('hesap-zaten-var')
    expect(varsayilanAuthAdapters.oturumuGetir()).toBeNull()
  })

  it('eksik alanla kayıt yapmaz', async () => {
    const sonuc = await varsayilanAuthAdapters.kayitYap({ ...ORNEK_KAYIT, adSoyad: '' })
    expect(sonuc.durum).toBe('hata')
    if (sonuc.durum === 'hata') expect(sonuc.kod).toBe('eksik-alan')
  })

  it('kurumsal kayıtta hesap tipini korur', async () => {
    const sonuc = await varsayilanAuthAdapters.kayitYap({ ...ORNEK_KAYIT, hesapTipi: 'kurumsal' })
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.hesapTipi).toBe('kurumsal')
  })

  it('profil bilgilerini günceller', async () => {
    await varsayilanAuthAdapters.kayitYap(ORNEK_KAYIT)
    const sonuc = await varsayilanAuthAdapters.profilTamamla('Güncel İsim', 'guncel@arsam.net')
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') {
      expect(sonuc.veri.adSoyad).toBe('Güncel İsim')
      expect(sonuc.veri.ePosta).toBe('guncel@arsam.net')
    }
  })

  it('oturum yokken profil güncellenemez', async () => {
    const sonuc = await varsayilanAuthAdapters.profilTamamla('Güncel İsim', 'guncel@arsam.net')
    expect(sonuc.durum).toBe('hata')
  })

  it('kurumsal başvuruyu alır ve EİDS durumunu beklemeye çeker', async () => {
    await varsayilanAuthAdapters.kayitYap({ ...ORNEK_KAYIT, hesapTipi: 'kurumsal' })
    const sonuc = await varsayilanAuthAdapters.kurumsalBasvuruGonder({
      ticaretUnvani: 'Arsam Gayrimenkul Ltd. Şti.',
      vergiNumarasi: '1234567890',
      vergiDairesi: 'Konak',
      il: 'İzmir',
      ilce: 'Konak',
      yetkiBelgesiNo: 'YB-2026-0042',
      yetkiliAdSoyad: 'Ayşe Kaya',
      yetkiliEPosta: 'ayse@arsam.net',
      yetkiliTelefon: '5551112233',
    })
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.eidsDurumu).toBe('beklemede')
  })

  it('EİDS doğrulamasını tamamlar', async () => {
    await varsayilanAuthAdapters.kayitYap({ ...ORNEK_KAYIT, hesapTipi: 'kurumsal' })
    const sonuc = await varsayilanAuthAdapters.eidsDogrulamaBaslat()
    expect(sonuc.durum).toBe('basarili')
    if (sonuc.durum === 'basarili') expect(sonuc.veri.eidsDurumu).toBe('dogrulandi')
  })

  it('oturum yokken EİDS doğrulaması başlatılamaz', async () => {
    const sonuc = await varsayilanAuthAdapters.eidsDogrulamaBaslat()
    expect(sonuc.durum).toBe('hata')
  })
})
```

- [ ] **Step 7: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/data/auth-adapters.test.ts`
Expected: FAIL — `kayitYap is not a function`

- [ ] **Step 8: `auth-adapters.ts`'i genişlet**

`AuthAdapters` arayüzüne dört imza ekleyin (mevcut beşini değiştirmeyin):

```ts
export interface AuthAdapters {
  girisBaslat(
    yontem: GirisYontemi,
    kimlik: string,
  ): Promise<AuthSonuc<GirisBaslatmaSonucu>>
  koduDogrula(kod: string): Promise<AuthSonuc<Oturum>>
  parolaIleGiris(ePosta: string, parola: string): Promise<AuthSonuc<Oturum>>
  /** Yeni hesap açar ve oturumu başlatır. */
  kayitYap(bilgiler: KayitBilgileri): Promise<AuthSonuc<Oturum>>
  /** Kayıt sonrası eksik profil alanlarını tamamlar. */
  profilTamamla(adSoyad: string, ePosta: string): Promise<AuthSonuc<Oturum>>
  /** Emlak ofisi başvurusunu iletir; EİDS durumunu beklemeye çeker. */
  kurumsalBasvuruGonder(bilgiler: KurumsalBasvuruBilgileri): Promise<AuthSonuc<Oturum>>
  /** Hesap seviyesinde EİDS yetki doğrulamasını yürütür. */
  eidsDogrulamaBaslat(): Promise<AuthSonuc<Oturum>>
  oturumuGetir(): Oturum | null
  cikisYap(): void
}
```

Fixture uygulamasına dört yöntemi ekleyin. `authAdaptersOlustur` içindeki `return { ... }` nesnesine, mevcut yöntemlerden sonra:

```ts
    async kayitYap(bilgiler) {
      const alanHatalari = kayitBilgileriniDogrula(bilgiler)
      if (Object.keys(alanHatalari).length > 0) {
        return {
          durum: 'hata',
          kod: 'eksik-alan',
          mesaj: 'Formda düzeltilmesi gereken alanlar var.',
        }
      }
      // Fixture: yalnız demo hesabı "zaten kayıtlı" sayılır.
      if (bilgiler.ePosta.trim().toLowerCase() === DEMO_OTURUM.ePosta) {
        return {
          durum: 'hata',
          kod: 'hesap-zaten-var',
          mesaj: 'Bu e-posta adresiyle bir hesap zaten var.',
        }
      }
      aktifOturum = {
        kullaniciId: `uye-${bilgiler.ePosta.trim().toLowerCase()}`,
        adSoyad: bilgiler.adSoyad.trim(),
        telefon: bilgiler.telefon.replace(/\s/g, ''),
        ePosta: bilgiler.ePosta.trim(),
        hesapTipi: bilgiler.hesapTipi,
        eidsDurumu: 'yok',
      }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async profilTamamla(adSoyad, ePosta) {
      const oturum = this.oturumuGetir()
      if (!oturum) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'Oturum bulunamadı. Yeniden giriş yapın.',
        }
      }
      if (!adSoyad.trim() || !ePosta.trim()) {
        return { durum: 'hata', kod: 'eksik-alan', mesaj: 'Ad soyad ve e-posta zorunludur.' }
      }
      aktifOturum = { ...oturum, adSoyad: adSoyad.trim(), ePosta: ePosta.trim() }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async kurumsalBasvuruGonder(bilgiler) {
      const oturum = this.oturumuGetir()
      if (!oturum) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'Oturum bulunamadı. Yeniden giriş yapın.',
        }
      }
      const alanHatalari = kurumsalBasvuruyuDogrula(bilgiler)
      if (Object.keys(alanHatalari).length > 0) {
        return {
          durum: 'hata',
          kod: 'eksik-alan',
          mesaj: 'Formda düzeltilmesi gereken alanlar var.',
        }
      }
      aktifOturum = { ...oturum, hesapTipi: 'kurumsal', eidsDurumu: 'beklemede' }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },

    async eidsDogrulamaBaslat() {
      const oturum = this.oturumuGetir()
      if (!oturum) {
        return {
          durum: 'hata',
          kod: 'gecersiz-kimlik',
          mesaj: 'Oturum bulunamadı. Yeniden giriş yapın.',
        }
      }
      aktifOturum = { ...oturum, eidsDurumu: 'dogrulandi' }
      oturumuYaz(aktifOturum)
      return { durum: 'basarili', veri: aktifOturum }
    },
```

**Dikkat:** yukarıdaki gövdelerde `this.oturumuGetir()` kullanılıyor. Nesne literalinde `this` bağlamı kırılgandır — bunun yerine dosyadaki mevcut `aktifOturum`/`sessionStorage` okuma mantığını yerel bir yardımcı fonksiyona (`mevcutOturum()`) çıkarıp hem `oturumuGetir` hem bu dört yöntem onu çağırsın. `this` kullanmayın.

Gerekli import'ları dosya başına ekleyin:
```ts
import { kayitBilgileriniDogrula, kurumsalBasvuruyuDogrula } from '../domain/kayit-dogrulama'
import type { KayitBilgileri, KurumsalBasvuruBilgileri } from '../domain/auth-types'
```

- [ ] **Step 9: Testleri çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/`
Expected: PASS — mevcut auth testleri + 13 doğrulama + 9 adapter testi

- [ ] **Step 10: `index.ts`'e yeni yüzeyi ekle**

```ts
export { kayitBilgileriniDogrula, kurumsalBasvuruyuDogrula } from './domain/kayit-dogrulama'
export type {
  KayitBilgileri,
  KurumsalBasvuruBilgileri,
  KayitAlanHatalari,
  KurumsalAlanHatalari,
} from './domain/auth-types'
```
(mevcut export'ları koruyun)

- [ ] **Step 11: Tam doğrulama ve commit**

```bash
npm run typecheck && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth
git commit -m "$(cat <<'EOF'
feat(auth): kayıt tipleri, alan doğrulaması ve adapter genişletmesi

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `/kayit` — hesap tipi seçimi ve kayıt formu

**Files:**
- Create: `apps/web/src/features/auth/pages/KayitPage.tsx`
- Create: `apps/web/src/features/auth/pages/KayitPage.module.css`
- Create: `apps/web/src/features/auth/pages/KayitPage.test.tsx`
- Create: `apps/web/src/routes/kayit.tsx`

**Interfaces:**
- Consumes: `AuthFormPage`, `useAuthSession`, `kayitBilgileriniDogrula`, `guvenliDonusYolu`, `GirisPage.module.css` (alan stilleri)
- Produces: `KayitPage`; `/kayit` rotası `donus` parametresini kabul eder

**Tasarım kararı:** hesap tipi seçimi sayfanın **ilk alanı**dır (Satılık/Kiralık kartlarının aksine sola hizalı, kompakt radio satırları — `--lg-control-*` dekoratif kullanılmaz). Kurumsal seçilirse kayıt sonrası `/kayit/kurumsal`'a, bireysel seçilirse `donus` hedefine gidilir.

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/KayitPage.test.tsx`:

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
import { KayitPage } from './KayitPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Yeni Kullanıcı',
  telefon: '5559998877',
  ePosta: 'yeni@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'yok',
}

function sahteAdapters(overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    kayitYap: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    profilTamamla: vi.fn(),
    kurumsalBasvuruGonder: vi.fn(),
    eidsDogrulamaBaslat: vi.fn(),
    oturumuGetir: () => null,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function kayitRouter(adapters: AuthAdapters, yol = '/kayit') {
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
      path: '/kayit',
      validateSearch: arama,
      component: KayitPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/kurumsal',
      component: () => <h1>Kurumsal başvuru</h1>,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/hesap-var',
      component: () => <h1>Bu hesap zaten var</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: [yol] }),
  })
}

async function formuDoldur(kullanici: ReturnType<typeof userEvent.setup>) {
  await kullanici.type(screen.getByLabelText('Ad soyad'), 'Yeni Kullanıcı')
  await kullanici.type(screen.getByLabelText('E-posta'), 'yeni@arsam.net')
  await kullanici.type(screen.getByLabelText('Telefon'), '5559998877')
  await kullanici.type(screen.getByLabelText('Parola'), 'Arsam1234')
  await kullanici.click(screen.getByLabelText(/aydınlatma metnini/i))
}

describe('KayitPage', () => {
  it('hesap tipi seçeneklerini sunar, bireysel varsayılandır', async () => {
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    const bireysel = await screen.findByLabelText(/bireysel/i)
    expect((bireysel as HTMLInputElement).checked).toBe(true)
    expect(screen.getByLabelText(/emlak ofisi/i)).toBeTruthy()
  })

  it('alanları doğru autocomplete ile sunar', async () => {
    render(<RouterProvider router={kayitRouter(sahteAdapters())} />)
    expect((await screen.findByLabelText('Ad soyad')).getAttribute('autocomplete')).toBe('name')
    expect(screen.getByLabelText('E-posta').getAttribute('autocomplete')).toBe('email')
    expect(screen.getByLabelText('Telefon').getAttribute('autocomplete')).toBe('tel')
    expect(screen.getByLabelText('Parola').getAttribute('autocomplete')).toBe('new-password')
  })

  it('eksik alanla gönderimde adapter çağrılmaz ve hata gösterilir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await kullanici.click(await screen.findByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.kayitYap).not.toHaveBeenCalled()
  })

  it('KVKK onayı verilmeden gönderilemez', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await kullanici.type(screen.getByLabelText('Ad soyad'), 'Yeni Kullanıcı')
    await kullanici.type(screen.getByLabelText('E-posta'), 'yeni@arsam.net')
    await kullanici.type(screen.getByLabelText('Telefon'), '5559998877')
    await kullanici.type(screen.getByLabelText('Parola'), 'Arsam1234')
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.kayitYap).not.toHaveBeenCalled()
  })

  it('geçerli formu adapter’a iletir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters()
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await formuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() =>
      expect(adapters.kayitYap).toHaveBeenCalledWith(
        expect.objectContaining({
          adSoyad: 'Yeni Kullanıcı',
          ePosta: 'yeni@arsam.net',
          telefon: '5559998877',
          hesapTipi: 'bireysel',
          kvkkOnayi: true,
        }),
      ),
    )
  })

  it('hesap zaten varsa durum sayfasına yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      kayitYap: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'hesap-zaten-var' as const,
        mesaj: 'Bu e-posta adresiyle bir hesap zaten var.',
      })),
    })
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await formuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Bu hesap zaten var' })).toBeTruthy(),
    )
  })

  it('emlak ofisi seçiliyse kurumsal başvuruya yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters({
      kayitYap: vi.fn(async () => ({
        durum: 'basarili' as const,
        veri: { ...ORNEK_OTURUM, hesapTipi: 'kurumsal' as const },
      })),
    })
    render(<RouterProvider router={kayitRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await kullanici.click(screen.getByLabelText(/emlak ofisi/i))
    await formuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Kurumsal başvuru' })).toBeTruthy(),
    )
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/KayitPage.test.tsx`
Expected: FAIL — `Failed to resolve import "./KayitPage"`

- [ ] **Step 3: `KayitPage.module.css` yaz**

```css
/* Hesap tipi seçimi — sola hizalı, kompakt radio satırları.
   Dokunma hedefi yalnız coarse pointer'da 44px'e çıkar; fare
   ortamında satır yüksekliği içerikten gelir. */
.tipSecimi {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-2);
}

.tipSecenek {
  display: flex;
  align-items: flex-start;
  gap: var(--lg-space-3);
  padding: var(--lg-space-3);
  border: var(--lg-stroke-hairline) solid var(--lg-hairline);
  border-radius: var(--lg-radius-chip);
  cursor: pointer;
}

.tipSecenek:has(input:focus-visible) {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: var(--lg-focus-ring-offset);
}

.tipSecenek input {
  margin: var(--lg-space-1) 0 0;
}

.tipMetin {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-1);
}

.tipBaslik {
  font-size: var(--lg-text-body);
  font-weight: 600;
}

.tipAciklama {
  font-size: var(--lg-text-caption);
  color: var(--lg-label-secondary);
}

.onayRow {
  display: flex;
  align-items: flex-start;
  gap: var(--lg-space-3);
  font-size: var(--lg-text-footnote);
}

.onayRow input {
  margin: var(--lg-space-1) 0 0;
}

.alanHatasi {
  margin: var(--lg-space-1) 0 0;
  font-size: var(--lg-text-caption);
  color: var(--lg-danger);
}

@media (pointer: coarse) {
  .tipSecenek,
  .onayRow {
    min-height: var(--lg-control-md);
  }
}
```

- [ ] **Step 4: `KayitPage.tsx` yaz**

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import { kayitBilgileriniDogrula } from '../domain/kayit-dogrulama'
import type { HesapTipi, KayitAlanHatalari } from '../domain/auth-types'
import alanStilleri from './GirisPage.module.css'
import styles from './KayitPage.module.css'

/**
 * Kayıt sayfası. Hesap tipi ilk alandır: emlak ofisi seçilirse kayıt
 * sonrası kurumsal başvuruya, bireysel seçilirse dönüş hedefine gidilir.
 */
export function KayitPage() {
  const { adapters, oturumuTazele } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }

  const [hesapTipi, setHesapTipi] = useState<HesapTipi>('bireysel')
  const [adSoyad, setAdSoyad] = useState('')
  const [ePosta, setEPosta] = useState('')
  const [telefon, setTelefon] = useState('')
  const [parola, setParola] = useState('')
  const [kvkkOnayi, setKvkkOnayi] = useState(false)
  const [alanHatalari, setAlanHatalari] = useState<KayitAlanHatalari>({})
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)

    const bilgiler = { adSoyad, ePosta, telefon, parola, hesapTipi, kvkkOnayi }
    const hatalar = kayitBilgileriniDogrula(bilgiler)
    setAlanHatalari(hatalar)
    if (Object.keys(hatalar).length > 0) {
      setHata('Formda düzeltilmesi gereken alanlar var.')
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.kayitYap(bilgiler)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      if (sonuc.kod === 'hesap-zaten-var') {
        navigate({ to: '/kayit/hesap-var', search: (onceki) => onceki })
        return
      }
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    if (sonuc.veri.hesapTipi === 'kurumsal') {
      navigate({ to: '/kayit/kurumsal', search: (onceki) => onceki })
      return
    }
    navigate({ to: guvenliDonusYolu(donus), replace: true })
  }

  return (
    <AuthFormPage
      baslik="Hesap oluşturun"
      aciklama="İlanlarınızı yönetmek, favori ve arama alarmlarınıza ulaşmak için hesap açın."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Hesap oluştur"
      gonderiliyor={gonderiliyor}
      ikincilBaglantilar={[{ etiket: 'Zaten hesabınız var mı? Giriş yapın', hedef: '/giris' }]}
    >
      <fieldset className={styles.tipSecimi}>
        <legend className={alanStilleri.label}>Hesap tipi</legend>

        <label className={styles.tipSecenek}>
          <input
            type="radio"
            name="hesap-tipi"
            value="bireysel"
            checked={hesapTipi === 'bireysel'}
            onChange={() => setHesapTipi('bireysel')}
          />
          <span className={styles.tipMetin}>
            <span className={styles.tipBaslik}>Bireysel</span>
            <span className={styles.tipAciklama}>Kendi mülkünüzü satmak veya kiralamak için.</span>
          </span>
        </label>

        <label className={styles.tipSecenek}>
          <input
            type="radio"
            name="hesap-tipi"
            value="kurumsal"
            checked={hesapTipi === 'kurumsal'}
            onChange={() => setHesapTipi('kurumsal')}
          />
          <span className={styles.tipMetin}>
            <span className={styles.tipBaslik}>Emlak ofisi</span>
            <span className={styles.tipAciklama}>
              Yetki belgeniz ve EİDS doğrulamanızla ilan yayınlamak için.
            </span>
          </span>
        </label>
      </fieldset>

      <div className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor="kayit-ad">
          Ad soyad
        </label>
        <input
          id="kayit-ad"
          className={alanStilleri.input}
          type="text"
          autoComplete="name"
          value={adSoyad}
          onChange={(event) => setAdSoyad(event.target.value)}
        />
        {alanHatalari.adSoyad ? <p className={styles.alanHatasi}>{alanHatalari.adSoyad}</p> : null}
      </div>

      <div className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor="kayit-eposta">
          E-posta
        </label>
        <input
          id="kayit-eposta"
          className={alanStilleri.input}
          type="email"
          autoComplete="email"
          value={ePosta}
          onChange={(event) => setEPosta(event.target.value)}
        />
        {alanHatalari.ePosta ? <p className={styles.alanHatasi}>{alanHatalari.ePosta}</p> : null}
      </div>

      <div className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor="kayit-telefon">
          Telefon
        </label>
        <input
          id="kayit-telefon"
          className={alanStilleri.input}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="5XX XXX XX XX"
          value={telefon}
          onChange={(event) => setTelefon(event.target.value)}
        />
        {alanHatalari.telefon ? <p className={styles.alanHatasi}>{alanHatalari.telefon}</p> : null}
      </div>

      <div className={alanStilleri.field}>
        <label className={alanStilleri.label} htmlFor="kayit-parola">
          Parola
        </label>
        <input
          id="kayit-parola"
          className={alanStilleri.input}
          type="password"
          autoComplete="new-password"
          value={parola}
          onChange={(event) => setParola(event.target.value)}
        />
        <p className={alanStilleri.hint}>En az 8 karakter, bir büyük harf ve bir rakam.</p>
        {alanHatalari.parola ? <p className={styles.alanHatasi}>{alanHatalari.parola}</p> : null}
      </div>

      <div>
        <label className={styles.onayRow}>
          <input
            type="checkbox"
            checked={kvkkOnayi}
            onChange={(event) => setKvkkOnayi(event.target.checked)}
          />
          <span>Aydınlatma metnini ve kullanım koşullarını okudum, onaylıyorum.</span>
        </label>
        {alanHatalari.kvkkOnayi ? (
          <p className={styles.alanHatasi}>{alanHatalari.kvkkOnayi}</p>
        ) : null}
      </div>
    </AuthFormPage>
  )
}
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/KayitPage.test.tsx`
Expected: PASS — 7/7

- [ ] **Step 6: Rota dosyasını oluştur**

`apps/web/src/routes/kayit.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { KayitPage } from '@/features/auth/pages/KayitPage'

export const Route = createFileRoute('/kayit')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Hesap oluşturun | arsam.net' },
      {
        name: 'description',
        content: 'arsam.net’te bireysel veya emlak ofisi hesabı açın.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KayitPage,
})
```

- [ ] **Step 7: Tarayıcıda doğrula**

Dev sunucu ayakta. Playwright ile `/kayit`'i 1440×900 ve 390×844'te açın ve doğrulayın: `h1` = "Hesap oluşturun" (**doğru bileşen**), `main` sayısı 1, taşma 0, `h1` 22px, radio ve onay kutusu satırları dokunmatik bağlamda ≥44px, alanların `autocomplete` değerleri doğru.

- [ ] **Step 8: Tam doğrulama ve commit**

```bash
npm run typecheck && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes/kayit.tsx apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): /kayit hesap tipi seçimi ve kayıt formu

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `/kayit/profil` — profil bilgilerini tamamla

**Files:**
- Create: `apps/web/src/features/auth/pages/KayitProfilPage.tsx`
- Create: `apps/web/src/features/auth/pages/KayitProfilPage.test.tsx`
- Create: `apps/web/src/routes/kayit_.profil.tsx`

**Interfaces:**
- Consumes: `AuthFormPage`, `useAuthSession`, `useKorumaliRota`, `guvenliDonusYolu`, `GirisPage.module.css`
- Produces: `KayitProfilPage`

**Tasarım kararı:** bu sayfa **oturum gerektirir** (kayıt sonrası eksik alanları tamamlar). `useKorumaliRota` ile korunur — oturumsuz kullanıcı `/giris`'e gider. Mevcut oturumdaki değerlerle ön doldurulur.

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/KayitProfilPage.test.tsx`:

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
import { KayitProfilPage } from './KayitProfilPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Yeni Kullanıcı',
  telefon: '5559998877',
  ePosta: 'yeni@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'yok',
}

function sahteAdapters(oturum: Oturum | null, overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    kayitYap: vi.fn(),
    profilTamamla: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    kurumsalBasvuruGonder: vi.fn(),
    eidsDogrulamaBaslat: vi.fn(),
    oturumuGetir: () => oturum,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function profilRouter(adapters: AuthAdapters) {
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
      path: '/kayit/profil',
      validateSearch: arama,
      component: KayitProfilPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: () => <h1>Giriş yapın</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: ['/kayit/profil'] }),
  })
}

describe('KayitProfilPage', () => {
  it('oturumsuz kullanıcıyı girişe yönlendirir', async () => {
    render(<RouterProvider router={profilRouter(sahteAdapters(null))} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('mevcut oturum değerleriyle ön doldurur', async () => {
    render(<RouterProvider router={profilRouter(sahteAdapters(ORNEK_OTURUM))} />)
    const ad = (await screen.findByLabelText('Ad soyad')) as HTMLInputElement
    expect(ad.value).toBe('Yeni Kullanıcı')
    expect((screen.getByLabelText('E-posta') as HTMLInputElement).value).toBe('yeni@arsam.net')
  })

  it('güncellemeyi adapter’a iletir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={profilRouter(adapters)} />)
    const ad = await screen.findByLabelText('Ad soyad')
    await kullanici.clear(ad)
    await kullanici.type(ad, 'Güncel İsim')
    await kullanici.click(screen.getByRole('button', { name: 'Kaydet ve devam et' }))
    await waitFor(() =>
      expect(adapters.profilTamamla).toHaveBeenCalledWith('Güncel İsim', 'yeni@arsam.net'),
    )
  })

  it('adapter hatasını alert olarak gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM, {
      profilTamamla: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'eksik-alan' as const,
        mesaj: 'Ad soyad ve e-posta zorunludur.',
      })),
    })
    render(<RouterProvider router={profilRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await kullanici.click(screen.getByRole('button', { name: 'Kaydet ve devam et' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('zorunludur'),
    )
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/KayitProfilPage.test.tsx`
Expected: FAIL — modül çözülemiyor

- [ ] **Step 3: `KayitProfilPage.tsx` yaz**

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession, useKorumaliRota } from '../AuthSessionProvider'
import { guvenliDonusYolu } from '../domain/auth-session'
import styles from './GirisPage.module.css'

/**
 * Kayıt sonrası eksik profil alanlarını tamamlar. Oturum gerektirir;
 * oturumsuz kullanıcı `useKorumaliRota` ile girişe gönderilir.
 */
export function KayitProfilPage() {
  useKorumaliRota()
  const { oturum, adapters, oturumuTazele, girisYapildi } = useAuthSession()
  const navigate = useNavigate()
  const { donus } = useSearch({ strict: false }) as { donus?: string }

  const [adSoyad, setAdSoyad] = useState(oturum?.adSoyad ?? '')
  const [ePosta, setEPosta] = useState(oturum?.ePosta ?? '')
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  if (!girisYapildi) return null

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.profilTamamla(adSoyad, ePosta)
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
      baslik="Profilinizi tamamlayın"
      aciklama="Bu bilgiler ilanlarınızda ve mesajlarınızda görünür."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Kaydet ve devam et"
      gonderiliyor={gonderiliyor}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="profil-ad">
          Ad soyad
        </label>
        <input
          id="profil-ad"
          className={styles.input}
          type="text"
          autoComplete="name"
          value={adSoyad}
          onChange={(event) => setAdSoyad(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="profil-eposta">
          E-posta
        </label>
        <input
          id="profil-eposta"
          className={styles.input}
          type="email"
          autoComplete="email"
          value={ePosta}
          onChange={(event) => setEPosta(event.target.value)}
        />
      </div>
    </AuthFormPage>
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/KayitProfilPage.test.tsx`
Expected: PASS — 4/4

- [ ] **Step 5: Rota dosyasını oluştur**

`apps/web/src/routes/kayit_.profil.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { KayitProfilPage } from '@/features/auth/pages/KayitProfilPage'

export const Route = createFileRoute('/kayit_/profil')({
  validateSearch: (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Profilinizi tamamlayın | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KayitProfilPage,
})
```

- [ ] **Step 6: Tarayıcıda doğrula ve commit**

`/kayit/profil`'i açın: oturumsuzken `/giris?donus=...`'a gitmeli. Sonra bir oturum açıp (`/giris` → `5551112233` → `000000`) tekrar açın: `h1` = "Profilinizi tamamlayın", `main` 1, taşma 0, `h1` 22px.

```bash
npm run typecheck && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes/kayit_.profil.tsx apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): /kayit/profil profil tamamlama sayfası

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `/kayit/kurumsal` — emlak ofisi başvurusu

**Files:**
- Create: `apps/web/src/features/auth/pages/KayitKurumsalPage.tsx`
- Create: `apps/web/src/features/auth/pages/KayitKurumsalPage.test.tsx`
- Create: `apps/web/src/routes/kayit_.kurumsal.tsx`

**Interfaces:**
- Consumes: `AuthFormPage`, `useAuthSession`, `useKorumaliRota`, `kurumsalBasvuruyuDogrula`, `GirisPage.module.css`, `KayitPage.module.css` (`.alanHatasi`)
- Produces: `KayitKurumsalPage`

**Tasarım kararı:** oturum gerektirir. Dokuz alan mantıksal gruplara ayrılır: **İşletme bilgileri** (ticaret ünvanı, vergi numarası, vergi dairesi, il, ilçe, yetki belgesi) ve **Yetkili kişi** (ad soyad, e-posta, telefon). Grup başlıkları `--lg-text-headline` (17px) — `--lg-text-display` yasak. Başarılı gönderimde `/hesap/dogrula`'ya gider (EİDS sırası).

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/KayitKurumsalPage.test.tsx`:

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
import { KayitKurumsalPage } from './KayitKurumsalPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'kurumsal',
  eidsDurumu: 'yok',
}

function sahteAdapters(oturum: Oturum | null, overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    kayitYap: vi.fn(),
    profilTamamla: vi.fn(),
    kurumsalBasvuruGonder: vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: { ...ORNEK_OTURUM, eidsDurumu: 'beklemede' as const },
    })),
    eidsDogrulamaBaslat: vi.fn(),
    oturumuGetir: () => oturum,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function kurumsalRouter(adapters: AuthAdapters) {
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
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/kurumsal',
      validateSearch: arama,
      component: KayitKurumsalPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/hesap/dogrula',
      component: () => <h1>EİDS doğrulaması</h1>,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: () => <h1>Giriş yapın</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: ['/kayit/kurumsal'] }),
  })
}

async function basvuruyuDoldur(kullanici: ReturnType<typeof userEvent.setup>) {
  await kullanici.type(screen.getByLabelText('Ticaret ünvanı'), 'Arsam Gayrimenkul Ltd. Şti.')
  await kullanici.type(screen.getByLabelText('Vergi numarası'), '1234567890')
  await kullanici.type(screen.getByLabelText('Vergi dairesi'), 'Konak')
  await kullanici.type(screen.getByLabelText('İl'), 'İzmir')
  await kullanici.type(screen.getByLabelText('İlçe'), 'Konak')
  await kullanici.type(screen.getByLabelText('Yetki belgesi numarası'), 'YB-2026-0042')
  await kullanici.type(screen.getByLabelText('Yetkili ad soyad'), 'Ayşe Kaya')
  await kullanici.type(screen.getByLabelText('Yetkili e-posta'), 'ayse@arsam.net')
  await kullanici.type(screen.getByLabelText('Yetkili telefon'), '5551112233')
}

describe('KayitKurumsalPage', () => {
  it('oturumsuz kullanıcıyı girişe yönlendirir', async () => {
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(null))} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('işletme ve yetkili gruplarını başlıklarıyla sunar', async () => {
    render(<RouterProvider router={kurumsalRouter(sahteAdapters(ORNEK_OTURUM))} />)
    expect(await screen.findByText('İşletme bilgileri')).toBeTruthy()
    expect(screen.getByText('Yetkili kişi')).toBeTruthy()
  })

  it('eksik alanla gönderimde adapter çağrılmaz', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await kullanici.click(await screen.findByRole('button', { name: 'Başvuruyu gönder' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(adapters.kurumsalBasvuruGonder).not.toHaveBeenCalled()
  })

  it('geçersiz vergi numarasını alan hatası olarak gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await screen.findByLabelText('Vergi numarası')
    await kullanici.type(screen.getByLabelText('Vergi numarası'), '123')
    await kullanici.click(screen.getByRole('button', { name: 'Başvuruyu gönder' }))
    await waitFor(() => expect(screen.getByText('Vergi numarası 10 haneli olmalı.')).toBeTruthy())
    expect(adapters.kurumsalBasvuruGonder).not.toHaveBeenCalled()
  })

  it('geçerli başvuruyu iletir ve EİDS adımına yönlendirir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(ORNEK_OTURUM)
    render(<RouterProvider router={kurumsalRouter(adapters)} />)
    await screen.findByLabelText('Ticaret ünvanı')
    await basvuruyuDoldur(kullanici)
    await kullanici.click(screen.getByRole('button', { name: 'Başvuruyu gönder' }))
    await waitFor(() => expect(adapters.kurumsalBasvuruGonder).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'EİDS doğrulaması' })).toBeTruthy(),
    )
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/KayitKurumsalPage.test.tsx`
Expected: FAIL — modül çözülemiyor

- [ ] **Step 3: `KayitKurumsalPage.tsx` yaz**

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthFormPage } from '../components/AuthFormPage'
import { useAuthSession, useKorumaliRota } from '../AuthSessionProvider'
import { kurumsalBasvuruyuDogrula } from '../domain/kayit-dogrulama'
import type { KurumsalAlanHatalari, KurumsalBasvuruBilgileri } from '../domain/auth-types'
import alanStilleri from './GirisPage.module.css'
import styles from './KayitPage.module.css'

const BOS_BASVURU: KurumsalBasvuruBilgileri = {
  ticaretUnvani: '',
  vergiNumarasi: '',
  vergiDairesi: '',
  il: '',
  ilce: '',
  yetkiBelgesiNo: '',
  yetkiliAdSoyad: '',
  yetkiliEPosta: '',
  yetkiliTelefon: '',
}

interface AlanTanimi {
  ad: keyof KurumsalBasvuruBilgileri
  etiket: string
  tip?: string
  autoComplete?: string
  ipucu?: string
}

const ISLETME_ALANLARI: readonly AlanTanimi[] = [
  { ad: 'ticaretUnvani', etiket: 'Ticaret ünvanı', ipucu: 'Vergi levhasındaki şekliyle.' },
  { ad: 'vergiNumarasi', etiket: 'Vergi numarası' },
  { ad: 'vergiDairesi', etiket: 'Vergi dairesi' },
  { ad: 'il', etiket: 'İl' },
  { ad: 'ilce', etiket: 'İlçe' },
  { ad: 'yetkiBelgesiNo', etiket: 'Yetki belgesi numarası', ipucu: 'Taşınmaz ticareti yetki belgesi.' },
]

const YETKILI_ALANLARI: readonly AlanTanimi[] = [
  { ad: 'yetkiliAdSoyad', etiket: 'Yetkili ad soyad', autoComplete: 'name' },
  { ad: 'yetkiliEPosta', etiket: 'Yetkili e-posta', tip: 'email', autoComplete: 'email' },
  { ad: 'yetkiliTelefon', etiket: 'Yetkili telefon', tip: 'tel', autoComplete: 'tel' },
]

/**
 * Emlak ofisi başvurusu. Oturum gerektirir; başarılı gönderimde hesabın
 * EİDS durumu beklemeye çekilir ve kullanıcı doğrulama adımına gider.
 */
export function KayitKurumsalPage() {
  useKorumaliRota()
  const { adapters, oturumuTazele, girisYapildi } = useAuthSession()
  const navigate = useNavigate()

  const [bilgiler, setBilgiler] = useState<KurumsalBasvuruBilgileri>(BOS_BASVURU)
  const [alanHatalari, setAlanHatalari] = useState<KurumsalAlanHatalari>({})
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  if (!girisYapildi) return null

  const alanDegistir = (ad: keyof KurumsalBasvuruBilgileri, deger: string) => {
    setBilgiler((onceki) => ({ ...onceki, [ad]: deger }))
  }

  const gonder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)

    const hatalar = kurumsalBasvuruyuDogrula(bilgiler)
    setAlanHatalari(hatalar)
    if (Object.keys(hatalar).length > 0) {
      setHata('Formda düzeltilmesi gereken alanlar var.')
      return
    }

    setGonderiliyor(true)
    const sonuc = await adapters.kurumsalBasvuruGonder(bilgiler)
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
    navigate({ to: '/hesap/dogrula' })
  }

  const alaniCiz = (alan: AlanTanimi) => (
    <div key={alan.ad} className={alanStilleri.field}>
      <label className={alanStilleri.label} htmlFor={`kurumsal-${alan.ad}`}>
        {alan.etiket}
      </label>
      <input
        id={`kurumsal-${alan.ad}`}
        className={alanStilleri.input}
        type={alan.tip ?? 'text'}
        autoComplete={alan.autoComplete}
        value={bilgiler[alan.ad]}
        onChange={(event) => alanDegistir(alan.ad, event.target.value)}
      />
      {alan.ipucu ? <p className={alanStilleri.hint}>{alan.ipucu}</p> : null}
      {alanHatalari[alan.ad] ? (
        <p className={styles.alanHatasi}>{alanHatalari[alan.ad]}</p>
      ) : null}
    </div>
  )

  return (
    <AuthFormPage
      baslik="Emlak ofisi başvurusu"
      aciklama="İlan yayınlayabilmek için işletme bilgilerinizi ve yetki belgenizi iletin."
      hata={hata}
      onSubmit={gonder}
      gonderEtiketi="Başvuruyu gönder"
      gonderiliyor={gonderiliyor}
    >
      <h2 className={styles.grupBasligi}>İşletme bilgileri</h2>
      {ISLETME_ALANLARI.map(alaniCiz)}

      <h2 className={styles.grupBasligi}>Yetkili kişi</h2>
      {YETKILI_ALANLARI.map(alaniCiz)}
    </AuthFormPage>
  )
}
```

- [ ] **Step 4: `KayitPage.module.css`'e grup başlığı sınıfı ekle**

```css
/* Form grubu başlığı — sayfa başlığının (title) bir altı. */
.grupBasligi {
  margin: var(--lg-space-2) 0 0;
  font-size: var(--lg-text-headline);
  font-weight: 600;
}
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/KayitKurumsalPage.test.tsx`
Expected: PASS — 5/5

- [ ] **Step 6: Rota dosyasını oluştur**

`apps/web/src/routes/kayit_.kurumsal.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { KayitKurumsalPage } from '@/features/auth/pages/KayitKurumsalPage'

export const Route = createFileRoute('/kayit_/kurumsal')({
  head: () => ({
    meta: [
      { title: 'Emlak ofisi başvurusu | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KayitKurumsalPage,
})
```

- [ ] **Step 7: Tarayıcıda doğrula ve commit**

Oturum açıp `/kayit/kurumsal`'ı açın: `h1` = "Emlak ofisi başvurusu", iki grup başlığı 17px, `main` 1, taşma 0, alan yükseklikleri ≥44px. Oturumsuzken `/giris`'e gitmeli.

```bash
npm run typecheck && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes/kayit_.kurumsal.tsx apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): /kayit/kurumsal emlak ofisi başvurusu

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `/kayit/hesap-var` — durum sayfası

**Files:**
- Create: `apps/web/src/features/auth/pages/kayitDurumSayfalari.tsx`
- Create: `apps/web/src/features/auth/pages/kayitDurumSayfalari.test.tsx`
- Create: `apps/web/src/routes/kayit_.hesap-var.tsx`

**Interfaces:**
- Consumes: `AuthStatusPage`
- Produces: `HesapVarPage`

Bu task yine `AuthStatusPage`'in tek kaynak olduğunu doğrular: bir rota, bir içerik tanımı, **sıfır yerleşim veya CSS kodu**. Yeni CSS yazma ihtiyacı duyarsanız durun ve sorun.

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/kayitDurumSayfalari.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { HesapVarPage } from './kayitDurumSayfalari'

function durumRouter(Component: () => ReactElement) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const rotalar = [
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: Component }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      component: () => <h1>Giriş yapın</h1>,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/parola-sifirla',
      component: () => <h1>Parola sıfırlama</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

describe('HesapVarPage', () => {
  it('bilgi tonunda çizilir — alert kullanmaz', async () => {
    render(<RouterProvider router={durumRouter(HesapVarPage)} />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('tek main landmark üretir', async () => {
    const { container } = render(<RouterProvider router={durumRouter(HesapVarPage)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(container.querySelectorAll('main')).toHaveLength(1)
  })

  it('girişe dönüş yolu sunar', async () => {
    render(<RouterProvider router={durumRouter(HesapVarPage)} />)
    const baglanti = await screen.findByRole('link', { name: /giriş/i })
    expect(baglanti.getAttribute('href')).toBe('/giris')
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/kayitDurumSayfalari.test.tsx`
Expected: FAIL — modül çözülemiyor

- [ ] **Step 3: `kayitDurumSayfalari.tsx` yaz**

```tsx
import { AuthStatusPage } from '../components/AuthStatusPage'

/**
 * Kayıt sırasında e-posta adresi zaten kayıtlıysa gösterilir.
 *
 * Bilgi tonu bilinçli: bu bir hata değil, kullanıcının zaten hesabı var —
 * yapması gereken tek şey giriş yapmak.
 */
export function HesapVarPage() {
  return (
    <AuthStatusPage
      tone="info"
      baslik="Bu hesap zaten var"
      aciklama="Girdiğiniz e-posta adresiyle bir hesap bulunuyor. Giriş yaparak devam edebilirsiniz."
      birincilEylem={{ etiket: 'Giriş yapın', hedef: '/giris' }}
    />
  )
}
```

**Not:** Faz 3'te `/parola-sifirla` geldiğinde bu sayfaya "Parolanızı mı unuttunuz?" ikincil bağlantısı eklenmelidir — şimdi eklemeyin, rota yok ve **ölü bağlantı yasak**.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/kayitDurumSayfalari.test.tsx`
Expected: PASS — 3/3

- [ ] **Step 5: Rota dosyasını oluştur**

`apps/web/src/routes/kayit_.hesap-var.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { HesapVarPage } from '@/features/auth/pages/kayitDurumSayfalari'

export const Route = createFileRoute('/kayit_/hesap-var')({
  head: () => ({
    meta: [
      { title: 'Bu hesap zaten var | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: HesapVarPage,
})
```

- [ ] **Step 6: Tarayıcıda doğrula ve commit**

`/kayit/hesap-var`: `h1` = "Bu hesap zaten var", `role="alert"` **yok** (bilgi tonu), `main` 1, taşma 0.

```bash
npm run typecheck && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes/kayit_.hesap-var.tsx apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): /kayit/hesap-var durum sayfası

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `/hesap/dogrula` — EİDS doğrulaması

**Files:**
- Create: `apps/web/src/features/auth/pages/HesapDogrulaPage.tsx`
- Create: `apps/web/src/features/auth/pages/HesapDogrulaPage.test.tsx`
- Create: `apps/web/src/routes/hesap.dogrula.tsx`

**Interfaces:**
- Consumes: `AuthFormPage`, `AuthStatusPage`, `useAuthSession`, `useKorumaliRota`
- Produces: `HesapDogrulaPage`

**Tasarım kararı — kapsam netleştirmesi:** bu sayfa **hesap seviyesinde** EİDS yetkisi kurar ve `Oturum.eidsDurumu`'nu `dogrulandi` yapar. İlan sihirbazındaki EİDS adımı (`listing-create/VerificationReviewStep.tsx`) ilan-özel kalır ve bu durumu **okur** — ikisi çakışmaz, bu sayfa onun ön koşuludur.

Sayfa oturumun mevcut `eidsDurumu`'na göre üç görünüm sunar:
- `dogrulandi` → `AuthStatusPage` (success), "Zaten doğrulanmış"
- `yok` veya `beklemede` → `AuthFormPage`, tek eylem: doğrulamayı başlat

- [ ] **Step 1: Failing test yaz**

`apps/web/src/features/auth/pages/HesapDogrulaPage.test.tsx`:

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
import type { EidsDurumu, Oturum } from '../domain/auth-types'
import { HesapDogrulaPage } from './HesapDogrulaPage'

function oturumOlustur(eidsDurumu: EidsDurumu): Oturum {
  return {
    kullaniciId: 'uye-1',
    adSoyad: 'Ayşe Kaya',
    telefon: '5551112233',
    ePosta: 'ayse@arsam.net',
    hesapTipi: 'kurumsal',
    eidsDurumu,
  }
}

function sahteAdapters(oturum: Oturum | null, overrides: Partial<AuthAdapters> = {}): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    kayitYap: vi.fn(),
    profilTamamla: vi.fn(),
    kurumsalBasvuruGonder: vi.fn(),
    eidsDogrulamaBaslat: vi.fn(async () => ({
      durum: 'basarili' as const,
      veri: oturumOlustur('dogrulandi'),
    })),
    oturumuGetir: () => oturum,
    cikisYap: vi.fn(),
    ...overrides,
  } as AuthAdapters
}

function dogrulaRouter(adapters: AuthAdapters) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const rotalar = [
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/hesap/dogrula',
      component: HesapDogrulaPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: (search: Record<string, unknown>) => ({
        donus: typeof search.donus === 'string' ? search.donus : undefined,
      }),
      component: () => <h1>Giriş yapın</h1>,
    }),
    createRoute({ getParentRoute: () => rootRoute, path: '/hesabim', component: () => <h1>Hesabım</h1> }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: ['/hesap/dogrula'] }),
  })
}

describe('HesapDogrulaPage', () => {
  it('oturumsuz kullanıcıyı girişe yönlendirir', async () => {
    render(<RouterProvider router={dogrulaRouter(sahteAdapters(null))} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('doğrulanmamış hesapta başlatma eylemini sunar', async () => {
    render(<RouterProvider router={dogrulaRouter(sahteAdapters(oturumOlustur('yok')))} />)
    expect(await screen.findByRole('button', { name: 'Doğrulamayı başlat' })).toBeTruthy()
  })

  it('beklemedeki hesapta durumu açıklar', async () => {
    render(<RouterProvider router={dogrulaRouter(sahteAdapters(oturumOlustur('beklemede')))} />)
    expect(await screen.findByText(/başvurunuz alındı/i)).toBeTruthy()
  })

  it('zaten doğrulanmış hesapta başarı durumu gösterir ve form sunmaz', async () => {
    render(<RouterProvider router={dogrulaRouter(sahteAdapters(oturumOlustur('dogrulandi')))} />)
    expect(await screen.findByRole('heading', { name: 'EİDS doğrulaması tamam' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Doğrulamayı başlat' })).toBeNull()
  })

  it('doğrulamayı başlatır ve adapter’ı çağırır', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(oturumOlustur('yok'))
    render(<RouterProvider router={dogrulaRouter(adapters)} />)
    await kullanici.click(await screen.findByRole('button', { name: 'Doğrulamayı başlat' }))
    await waitFor(() => expect(adapters.eidsDogrulamaBaslat).toHaveBeenCalled())
  })

  it('adapter hatasını alert olarak gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAdapters(oturumOlustur('yok'), {
      eidsDogrulamaBaslat: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'eids-reddedildi' as const,
        mesaj: 'EİDS kaydınız bulunamadı.',
      })),
    })
    render(<RouterProvider router={dogrulaRouter(adapters)} />)
    await kullanici.click(await screen.findByRole('button', { name: 'Doğrulamayı başlat' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('EİDS kaydınız bulunamadı.'),
    )
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/HesapDogrulaPage.test.tsx`
Expected: FAIL — modül çözülemiyor

- [ ] **Step 3: `HesapDogrulaPage.tsx` yaz**

```tsx
import { useState, type FormEvent } from 'react'
import { AuthFormPage } from '../components/AuthFormPage'
import { AuthStatusPage } from '../components/AuthStatusPage'
import { useAuthSession, useKorumaliRota } from '../AuthSessionProvider'
import styles from './GirisPage.module.css'

/**
 * Hesap seviyesinde EİDS yetki doğrulaması.
 *
 * Bu sayfa `Oturum.eidsDurumu`'nu kurar. İlan sihirbazındaki EİDS adımı
 * ilan-özeldir ve bu durumu okur — ikisi çakışmaz, burası onun ön koşuludur.
 */
export function HesapDogrulaPage() {
  useKorumaliRota()
  const { oturum, adapters, oturumuTazele, girisYapildi } = useAuthSession()
  const [hata, setHata] = useState<string | undefined>()
  const [gonderiliyor, setGonderiliyor] = useState(false)

  if (!girisYapildi || !oturum) return null

  if (oturum.eidsDurumu === 'dogrulandi') {
    return (
      <AuthStatusPage
        tone="success"
        baslik="EİDS doğrulaması tamam"
        aciklama="Hesabınız ilan yayınlamaya yetkili. İlan verme akışında ek doğrulama istenmeyecek."
        birincilEylem={{ etiket: 'Hesabıma dön', hedef: '/hesabim' }}
      />
    )
  }

  const baslat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHata(undefined)
    setGonderiliyor(true)
    const sonuc = await adapters.eidsDogrulamaBaslat()
    setGonderiliyor(false)

    if (sonuc.durum === 'hata') {
      setHata(sonuc.mesaj)
      return
    }

    oturumuTazele()
  }

  const beklemede = oturum.eidsDurumu === 'beklemede'

  return (
    <AuthFormPage
      baslik="EİDS doğrulaması"
      aciklama="Taşınmaz ticareti yetkinizi doğrulayarak ilan yayınlamaya başlayın."
      hata={hata}
      onSubmit={baslat}
      gonderEtiketi="Doğrulamayı başlat"
      gonderiliyor={gonderiliyor}
    >
      <p className={styles.hint}>
        {beklemede
          ? 'Başvurunuz alındı; yetki belgesi kontrolü sürüyor. Doğrulamayı şimdi de başlatabilirsiniz.'
          : 'EİDS, ilan verme yetkisini kurar: kimliğinizin malik kaydında veya yetki belgesinde görünmesi kontrol edilir.'}
      </p>
    </AuthFormPage>
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run apps/web/src/features/auth/pages/HesapDogrulaPage.test.tsx`
Expected: PASS — 6/6

- [ ] **Step 5: Rota dosyasını oluştur ve yolunu doğrula**

`apps/web/src/routes/hesap.dogrula.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { HesapDogrulaPage } from '@/features/auth/pages/HesapDogrulaPage'

export const Route = createFileRoute('/hesap/dogrula')({
  head: () => ({
    meta: [
      { title: 'EİDS doğrulaması | arsam.net' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: HesapDogrulaPage,
})
```

**Doğrulayın:** `/hesap` diye bir rota **yok**, bu yüzden noktalı ad burada güvenlidir. Yine de `routeTree.gen.ts`'i okuyup `fullPath`'in `/hesap/dogrula` olduğunu ve rotanın root'un çocuğu olarak kaydedildiğini teyit edin. Değilse **durun ve sorun** — dosya adını tahminle değiştirmeyin.

- [ ] **Step 6: Tarayıcıda doğrula ve commit**

Oturum açıp `/hesap/dogrula`'yı açın: `h1` = "EİDS doğrulaması", "Doğrulamayı başlat" butonu var. Butona basın: sayfa başarı durumuna geçmeli (`h1` = "EİDS doğrulaması tamam"). Oturumsuzken `/giris`'e gitmeli.

```bash
npm run typecheck && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth apps/web/src/routes/hesap.dogrula.tsx apps/web/src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(auth): /hesap/dogrula EİDS yetki doğrulaması

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Bağlantıları geri bağla, akış ve geçitleri genişlet

**Files:**
- Modify: `apps/web/src/features/auth/pages/GirisPage.tsx` (kayıt bağlantısını geri ekle)
- Modify: `apps/web/src/features/auth/pages/GirisPage.test.tsx`
- Modify: `apps/web/src/features/auth/auth-routes.test.tsx` (beş yeni rota)
- Modify: `apps/web/src/features/auth/AuthAccessibility.test.tsx` (yeni sayfalar)
- Create: `apps/web/src/features/auth/kayit-flow.test.tsx`
- Modify: `apps/web/src/features/auth/rules.md`

**Interfaces:**
- Consumes: bu plandaki her şey
- Produces: yok (bağlama ve doğrulama task'ı)

- [ ] **Step 1: `/giris`'e kayıt bağlantısını geri ekle**

Faz 1'de bu bağlantı kaldırılmıştı çünkü `/kayit` 404 veriyordu (ölü bağlantı yasağı). Artık rota var. `GirisPage.tsx`'teki `ikincilBaglantilar` dizisine geri ekleyin ve kaldırma gerekçesini anlatan Türkçe yorumu silin:

```tsx
      ikincilBaglantilar={[
        { etiket: 'Parola ile giriş yapın', hedef: '/giris/parola' },
        { etiket: 'Hesap oluşturun', hedef: '/kayit' },
      ]}
```

`GirisPage.test.tsx`'te kayıt bağlantısının **var olduğunu** sınayan bir test ekleyin (Faz 1'de yokluğunu sınayan bir test varsa onu güncelleyin, silmeyin):

```tsx
  it('kayıt sayfasına bağlantı sunar', async () => {
    render(<RouterProvider router={girisRouter(sahteAdapters())} />)
    const baglanti = await screen.findByRole('link', { name: /hesap oluştur/i })
    expect(baglanti.getAttribute('href')).toContain('/kayit')
  })
```

Test router'ına `/kayit` rotası eklemeniz gerekebilir.

- [ ] **Step 2: Testi çalıştır**

Run: `npx vitest run apps/web/src/features/auth/pages/GirisPage.test.tsx`
Expected: PASS

- [ ] **Step 3: Rota smoke testini genişlet**

`apps/web/src/features/auth/auth-routes.test.tsx` gerçek `routeTree`'yi sınıyor. Beş yeni yolu ekleyin: `/kayit`, `/kayit/profil`, `/kayit/kurumsal`, `/kayit/hesap-var`, `/hesap/dogrula`. Mevcut dosyanın desenini izleyin (yolun kayıtlı olduğunu, `fullPath`'inin beklenen değer olduğunu ve root'un çocuğu olduğunu doğruluyor).

**Kırmızı yanma kanıtı zorunlu:** beklenen yollardan birini geçici olarak yanlış bir değere çevirip testin başarısız olduğunu görün, sonra geri alın. Kanıtı raporunuza yazın.

- [ ] **Step 4: Erişilebilirlik geçidini genişlet**

`apps/web/src/features/auth/AuthAccessibility.test.tsx` şu an Faz 1 sayfalarını kapsıyor. Yeni sayfaları ekleyin: `KayitPage`, `KayitProfilPage`, `KayitKurumsalPage`, `HesapVarPage`, `HesapDogrulaPage`.

Her sayfa için mevcut kontroller geçerli olmalı: tek `h1`, tek `main`, her form alanının `<label for>` bağlantısı ve `autocomplete` özniteliği.

**Dikkat:** oturum gerektiren sayfalar (`KayitProfilPage`, `KayitKurumsalPage`, `HesapDogrulaPage`) oturumlu bir sahte adapter ile render edilmeli, yoksa `null` döner ve test anlamsızlaşır.

**Ek kontrol:** `KayitPage`'in radio grubunun `<fieldset>` + `<legend>` ile gruplandığını doğrulayın — ekran okuyucu için seçim grubunun adı budur.

- [ ] **Step 5: Kayıt akışı entegrasyon testi yaz**

`apps/web/src/features/auth/kayit-flow.test.tsx` — gerçek adapter (`varsayilanAuthAdapters`) yerine akış boyunca durum taşıyan bir sahte adapter kullanın (Faz 1'in `auth-flow.test.tsx`'indeki `akisAdapters` desenini izleyin). İki yolu sınayın:

1. **Bireysel kayıt:** `/kayit` → formu doldur (bireysel) → gönder → `donus` hedefine iner, oturum açılmıştır.
2. **Kurumsal kayıt:** `/kayit` → emlak ofisi seç → formu doldur → gönder → `/kayit/kurumsal`'a iner → başvuruyu doldur → gönder → `/hesap/dogrula`'ya iner → "Doğrulamayı başlat" → başarı durumu görünür.

Bu ikinci yol, Faz 2'nin tamamını uçtan uca kanıtlar.

- [ ] **Step 6: `rules.md`'yi güncelle**

`apps/web/src/features/auth/rules.md`'ye kayıt sözleşmesini ekleyin:
- Beş yeni sayfa ve hangisinin oturum gerektirdiği
- Alan doğrulamasının nerede yaşadığı (`kayit-dogrulama.ts`) ve neden sunucu doğrulamasının yerine geçmediği
- Hesap tipi seçiminin akışı nasıl dallandırdığı (kurumsal → `/kayit/kurumsal` → `/hesap/dogrula`)
- EİDS kapsam ayrımı: hesap seviyesi (`/hesap/dogrula`) vs ilan-özel (`listing-create`)
- Faz 3'te `/parola-sifirla` gelince `HesapVarPage`'e ikincil bağlantı eklenmesi gerektiği notu

- [ ] **Step 7: Tarayıcıda uçtan uca doğrula**

Dev sunucu ayakta. Playwright ile:

1. `/giris` → "Hesap oluşturun" bağlantısı `/kayit`'e gidiyor, **404 değil**.
2. `/kayit` → bireysel form → gönder → oturum açılıyor.
3. `/kayit` → emlak ofisi → gönder → `/kayit/kurumsal` → başvuru → `/hesap/dogrula` → başlat → başarı.
4. Beş yeni rotanın her biri 1440×900 ve 390×844'te: taşma 0, `main` 1, `h1` 22px, dokunmatikte hedefler ≥44px.
5. Oturumsuz `/kayit/profil`, `/kayit/kurumsal`, `/hesap/dogrula` → `/giris?donus=...`'a yönleniyor.

Sonuçları raporunuza yazın.

- [ ] **Step 8: Tam doğrulama ve commit**

```bash
npm run typecheck && npm run lint && npm test
```

```bash
git add apps/web/src/features/auth
git commit -m "$(cat <<'EOF'
feat(auth): kayıt bağlantısı, akış testi ve geçit genişletmeleri

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Bu planın kapsamadıkları

- **Faz 3** — parola akışı (`/parola-sifirla`, `/parola-sifirla/yeni`, `/parola-sifirla/tamam`, `/hesabim/parola`) ve erişim durumları (`/oturum-suresi-doldu`, `/yetkisiz`, `/hesap/askida`).
- **Faz 4** — callback'ler (`/giris/baglanti/dogrula`, `/giris/google/dogrula`, `/hesabim/e-posta-dogrula`).
- Gerçek kimlik sağlayıcı entegrasyonu (SMS, e-posta, Google OAuth) ve gerçek EİDS servisi — adapter arayüzü hazır, bağlanması ayrı iştir.
- Çıkış (logout) arayüzü — `cikisYap` hazır ama hiçbir yerden çağrılmıyor; Faz 1'in son incelemesinde işaretlendi, ayrı bir iş.
