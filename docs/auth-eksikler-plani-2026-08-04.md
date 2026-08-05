# Auth Eksikleri — Uygulama Planı

**Tarih:** 2026-08-04 · **Girdi:** `docs/auth-hazirlik-raporu-2026-08-04.md`
**Kapsam:** 12 eksik sayfa + sunucu/oturum katmanı + mevcut kodun 10 kusuru

> **Durum (2026-08-04):** **İP-0 · İP-1 · İP-2 · İP-3 · İP-6 tamamlandı.**
> 308 auth testi yeşil (26 dosya), typecheck ve lint temiz, hem SSR hem
> statik prerender build'i geçiyor. Ayrıntı: §6 (İP-0/1), §7 (İP-2/3),
> §8 (İP-6).
>
> Haritadaki 21 sayfanın karşılanma durumu: **VAR 19 · KAPSAM DIŞI 2**
> (başlangıç: VAR 5 · KISMEN 4 · YOK 12). Kapsam dışı ikisi magic link
> sayfaları — karar K1 ile silindi.
>
> **Frontend tarafında haritadan kalan sayfa yok.** Sıradaki iş sunucu
> katmanı: İP-4 (API sözleşmesi) → İP-5 (cookie + BFF).

Numaralandırma: kod içindeki mevcut "Faz" yorumları korunuyor (`Faz 3 = parola sıfırlama`, `auth-session.ts:12`, `rules.md:206`). Yeni iş paketleri **İP-n** ile adlandırıldı; hangi Faz'a karşılık geldiği her başlıkta yazılı.

---

## 0. Önce çözülen mimari soru: statik build ile sunucu oturumu çelişmiyor

İlk raporda "`WEB_STATIC=1` prerender modu sunucu tarafı oturumla mimari olarak uyumsuz, önce ayrıştırılmalı" demiştim. `vite.config.ts:57-63`'ü okuyunca bunun **gereksiz olduğu** ortaya çıktı — statik build zaten SPA fallback'i (`/404.html`) üretiyor. Yani prerender edilmemiş adresler client'ta çalışmaya devam ediyor.

Bu, üçlü oturum durumuyla birleşince tek kod yolu veriyor:

```ts
export type OturumCozumu =
  | { durum: 'bilinmiyor' }              // prerender anı — henüz bilinemez
  | { durum: 'anonim' }
  | { durum: 'kimlikli'; oturum: Oturum }
```

| Mod | `beforeLoad` nerede koşar | Sonuç |
|---|---|---|
| Sunucu (SSR) | Her istekte sunucuda, cookie okunur | `anonim` \| `kimlikli` → guard **gerçek 302** atar, flash yok |
| Statik, ilk yükleme | Build anında (prerender) | `bilinmiyor` → dehydrate edilir, hidrasyonda **aynı** değer → uyuşmazlık yok |
| Statik, sonraki gezinme | Client'ta | `anonim` \| `kimlikli` → guard normal çalışır |

Kritik nokta: bugünkü hidrasyon hatasının kaynağı, `girisYapildi`'nin boolean olması — `bilinmiyor` ile `anonim` aynı değere (`false`) çöküyor. Sunucu `null` render ediyor, client `sessionStorage`'ı okuyup dolu shell render ediyor. Üçlü durum bu ikisini ayırdığı anda `KorumaliSayfa`'daki `hidrasyonTamam` bayrağı da, `hesabim.tsx`'teki kopya kalıp da gereksizleşiyor.

**Sonuç: statik/sunucu ayrımı bir karar noktası değil, mevcut mimari ikisini de taşıyor.** İleride sadeleştirmek istenirse `/hesabim*`'i prerender filtresinden çıkarmak yeterli — plan buna bağımlı değil.

---

## 1. Karar bekleyen 3 madde

Bunlar farklı iş yükleri doğurur; planda önerilen dal varsayıldı, işaretlenerek ilerlendi.

### K1 — Magic link: bağla mı, sil mi? → **Önerim: sil**

Bugün 3 ölü route (`/giris/baglanti-gonderildi`, `/giris/baglanti/gecersiz`), bir adapter dalı (`auth-adapters.ts:110-123`) ve `GirisYontemi`'nde kullanılmayan bir `'baglanti'` üyesi var — hiçbiri koddan çağrılmıyor, yalnız URL yazarak erişiliyor.

Gerekçe: telefon+OTP zaten birincil yöntem, parola ikincil. Üçüncü bir yöntem (e-posta magic link) hem seçim yükü hem de parola sıfırlama e-postasıyla neredeyse aynı altyapı. Silmek `GirisYontemi`'ni `'telefon' | 'parola' | 'google'`'a indirir. İstenirse sonradan ~1 günde geri gelir; bugünkü hâli erişilebilir ölü kod.

*Karşı dal seçilirse:* İP-3'e "magic link giriş noktası + `/auth/magic-link/callback`" eklenir (+M).

### K2 — Davet (12, 13) ve organizasyon seçimi (21) → **Önerim: ertele, dikişi ayır**

Bunlar auth sayfası değil, **çok kullanıcılı organizasyon özelliği**. `/kayit/kurumsal` emlak ofisi kavramını başlatıyor ama bir ofisin birden çok danışmanı olup olmadığı, rol modeli, ofis değiştirme — hiçbiri tanımlı değil. Rol modeli olmadan `/select-organization` yazmak spekülasyon olur.

Aynı sebeple **`/yetkisiz` (15) da bugün yazılamaz**: uygulamada rol/yetki kavramı yok, dolayısıyla "giriş yapmış ama yetkisiz" durumu hiç oluşmuyor. Yol `authRoutePaths:246`'da rezerve; tetikleyicisi gelince yazılacak.

### K3 — Google OAuth (5) → **Önerim: İP-7'de yap, kopyayı bugün düzelt**

`routes/giris.tsx:10` meta description'ı bugün olmayan bir özelliği vaat ediyor. Kopya düzeltmesi İP-0'da (dakikalar). Butonun kendisi gerçek OAuth altyapısı ister → İP-6'dan sonra. Hazırlık zaten yapılmış: `.divider` CSS'i yazılı (`GirisPage.module.css:34-48`) ve `AuthCallbackPage` bekliyor.

---

## 2. Sıralı iş paketleri

Sıra bağımlılığa göre. **İP-1 bittikten sonra** altyapı (İP-4/5/6) ve sayfa (İP-2/3/7) hatları paralel yürüyebilir — `AuthAdapters` portu ikisini birbirinden ayırıyor.

| İP | Ad | Boyut | Bağımlılık | Backend gerekir mi |
|---|---|---|---|---|
| 0 | Borç kapatma | S | — | hayır |
| 1 | Oturum modeli & guard | M | İP-0 | hayır |
| 2 | Parola sıfırlama (Faz 3) | M | İP-1 | hayır (fixture) |
| 3 | OTP kurtarma + `/hesap/askida` | S | İP-1 | hayır (fixture) |
| 4 | API sözleşmesi | S | — | — |
| 5 | Cookie oturumu + BFF | L | İP-1, İP-4 | **evet** |
| 6 | Süre, yenileme, rate-limit | M | İP-5 | **evet** |
| 7 | Google OAuth | M | İP-5 | **evet** |
| 8 | Hesap içi güvenlik (19, 20) | M | İP-5 | **evet** |
| 9 | E2E + a11y kapıları | M | İP-1 (kısmi) | hayır |

---

### İP-0 — Borç kapatma · S · backend'siz

Rapordaki 10 kusurun bağımsız olanları. Bunlar önce çünkü biri **bozuk davranışı test ediyor** ve sonraki işlerde ayağa dolanır.

| Dosya | İş |
|---|---|
| `components/AuthCallbackPage.tsx:30` | `role="status"`/`aria-live`'ı `<main>`'den `<p>`'ye taşı |
| `components/authArketipleri.test.tsx:159-162` | Bozuk şekli doğrulayan assertion'ı düzelt |
| `AuthAccessibility.test.tsx:99` | `AuthCallbackPage`'i `TUM_SAYFALAR`'a ekle (bu sayfa hiç landmark kapısından geçmiyor) |
| `KayitPage.tsx:129/137`, `KayitKurumsalPage.tsx:95/100` | Hata kabını her zaman render et, metni değiştir (batch'lenen `setHata` aynı hatayı ikinci kez duyurmuyor) |
| `routes/giris.tsx:10` | Meta description'dan Google vaadini çıkar |
| `AuthShell.tsx` | Skip-link ekle (`MarketplaceShell.tsx:120` ile parite); "Yardım" → `/blog` etiketini düzelt |
| `AuthFormPage.tsx:23` | `gonderEtiketi` \| `aksiyonlar` ayrık birleşim → adsız submit butonu derleme hatası olsun |
| `KayitPage.tsx:397` | KVKK metnine gerçek link — **`/kvkk` ve `/kullanim-kosullari` route'ları yok, içerikle birlikte açılmalı** |
| `KayitAdimSeridi.module.css:124`, `KayitPage.module.css:243` | `.srOnly`'yi ortak utility'ye taşı; boyut için `--lg-stroke-hairline` kullanımını bırak |
| `KayitAdimSeridi.module.css:18` | `--serit-nokta: 28px` → `--lg-*` token'ı ekle veya gerekçeyi rules.md'ye taşı |

K1 kabul edilirse burada ayrıca: 2 route dosyası, `girisDurumSayfalari.tsx`'ten 2 sayfa, `girisBaslat`'ın `'baglanti'` dalı ve `GirisYontemi`'nden `'baglanti'` silinir.

**Kabul:** 190 auth testi yeşil kalır (+ yeni landmark testi); `npx tsc -b` temiz; hiçbir CSS modülünde raw px kalmaz.

---

### İP-1 — Oturum modeli & guard · M · backend'siz — **planın belkemiği**

Tek başına 3 canlı kusuru kapatıyor (hidrasyon uyuşmazlığı ×2, korumasız `/ilan-ver` ve `/favoriler`) ve sunucu katmanının önünü açıyor.

**1. Tipler** (`domain/auth-types.ts`)
```ts
export type OturumCozumu =
  | { durum: 'bilinmiyor' } | { durum: 'anonim' } | { durum: 'kimlikli'; oturum: Oturum }
```
`Oturum`'a `gecerlilikSonu: string` (ISO) eklenir — İP-6'nın hazırlığı, bugün fixture sabit değer döner. **Rol alanı eklenmez** (K2).

**2. Port** (`data/auth-adapters.ts`)
`oturumuGetir(): Oturum | null` → `oturumuCoz(): Promise<OturumCozumu>`. Fixture implementasyonu prerender'da (`typeof window === 'undefined'`) `{durum:'bilinmiyor'}`, client'ta sessionStorage'dan çözer.

> Bu, raporda "sert engel" dediğim senkron imza. Çözüm imzayı async yapmak *değil*, ilk okumayı provider'dan router'a taşımak — `beforeLoad` async olabildiği için `useState` lazy initializer'ına gerek kalmıyor.

**3. Router context** (`router-context.ts`, `router.tsx`)
```ts
export interface RouterContext { queryClient: QueryClient; adapters: AuthAdapters; oturum: OturumCozumu }
```
`adapters` da context'e girer — test enjeksiyon dikişi (`test-utils.ts:sahteAuthAdapters`) korunur.

**4. Kök çözüm** (`routes/__root.tsx`)
`beforeLoad` içinde `oturum: await context.adapters.oturumuCoz()`.

**5. Guard yardımcısı** (`domain/auth-guard.ts`, yeni)
```ts
export function korumaliRota({ context, location }) {
  if (context.oturum.durum === 'anonim') {
    throw redirect({ to: '/giris', search: { donus: guvenliDonusYolu(location.href) } })
  }
  // 'bilinmiyor' → prerender; render sürer, client tarafı çözer
}
```
Mevcut `guvenliDonusYolu` olduğu gibi kullanılır — o kod zaten doğru ve testli.

**6. Uygulama**
`beforeLoad: korumaliRota` şu route'lara: `/hesabim` (layout — 8 çocuk otomatik), `/kayit/profil`, `/kayit/kurumsal`, `/hesap/dogrula`, `/ilan-ver`, `/favoriler`.

> `/favoriler` için açık soru: anonim kullanıcı yerel favori tutabilmeli mi? Tutabilmeliyse guard yerine "anonim → localStorage, kimlikli → sunucu" ikili modu gerekir. Plan guard'ı varsayıyor; aksi hâlde İP-1'den çıkarılıp ürün kararına bırakılır.

**7. Temizlik**
`hesabim.tsx:16,29` ve `hesabim.mesajlar.tsx:89,99`'daki kopya inline guard'lar silinir (rules.md §14 ihlali). `KorumaliSayfa` üçlü duruma göre sadeleşir: `bilinmiyor` → iskelet, `anonim` → `null`, `kimlikli` → children. `hidrasyonTamam` state'i kalkar.

**8. rules.md** §6 (state modeli) ve §14 (hidrasyon deseni) yeniden yazılır — §14 artık "guard kullan, kopya yazma" yerine "guard `beforeLoad`'da, `KorumaliSayfa` yalnız iskelet için" olur.

**Kabul:**
- Anonim kullanıcı `/hesabim`'e SSR'da girdiğinde **302** alır, 200+client-bounce değil
- Kimlikli kullanıcı `/hesabim`'i yenilediğinde hidrasyon uyarısı çıkmaz (test: SSR çıktısı ile client ilk render'ı aynı)
- `donus` sanitizasyon testleri guard üzerinden de geçer
- `/ilan-ver` ve `/favoriler` artık korumalı

---

### İP-2 — Parola sıfırlama · M · fixture ile tamamlanabilir *(kodun "Faz 3"ü — harita #9, #10, #11)*

| Route | Arketip | Sayfa |
|---|---|---|
| `/parola-sifirla` | `AuthFormPage` | E-posta iste |
| `/parola-sifirla/$token` | `AuthFormPage` | Yeni parola (`new-password`, mevcut parola kuralları) |
| `/parola-sifirla/tamam` | `AuthStatusPage` | Başarı + girişe dön |
| `/parola-sifirla/gecersiz` | `AuthStatusPage` | Token geçersiz/süresi dolmuş (haritada yok ama zorunlu) |

Adapter: `parolaSifirlamaIste(ePosta)`, `parolaSifirla(token, yeniParola)`.
`AuthHataKodu`'na: `'gecersiz-token'`, `'token-suresi-doldu'`.
`GirisParolaPage.tsx:42-44`'teki kaldırılmış "Parolanızı mı unuttunuz?" satırı geri gelir.
Parola kuralları `kayit-dogrulama.ts:29-33`'ten yeniden kullanılır — kopyalanmaz.

Yol zaten hazır: `authRoutePaths:244` ve `AUTH_ONEK_REDDI` (`auth-session.ts:19`) `/parola-sifirla`'yı tanıyor. `rules.md:287` `HesapVarPage`'in bu sayfa gelince güncelleneceğini not etmiş — o da yapılır.

**Kabul:** 4 sayfa `AuthAccessibility.test.tsx` kapılarından geçer (tek `h1`, tek `main`, label, autocomplete, `aria-invalid`/`describedby`); token'sız/bozuk token akışı testli.

---

### İP-3 — OTP kurtarma + hesap askıda · S · fixture ile *(haritada yok / harita #16)*

**Bu, kullanıcıya en çok zarar veren eksik.** Telefon+OTP birincil giriş yöntemi ve `GirisKodPage.tsx:63` "Kod 3 dakika geçerlidir" diyor ama tekrar gönderme yolu yok. SMS gelmezse tek çıkış "Numarayı değiştirin" — yani akışa baştan başlamak.

- `GirisKodPage`'e "Kodu tekrar gönder" + geri sayım (60 sn) + deneme sayacı
- `AuthHataKodu`'na `'cok-fazla-deneme'`; UI'da kalan süre gösterimi
- `/hesap/askida` (`AuthStatusPage`, ~18 satır) — **`'hesap-askida'` kodu `auth-types.ts:23`'te zaten var ve `AUTH_TAM_YOL_REDDI` bu yolu tanıyor**, sadece varış sayfası yok
- Adapter: `kodTekrarGonder()`

Ayrıca giriş sayfalarının doğrulama açığı burada kapatılır: `GirisPage.tsx:49`, `GirisKodPage.tsx:52`, `GirisParolaPage.tsx:66`, `KayitProfilPage` — client doğrulaması + `aria-invalid`/`aria-describedby`, `kayit-dogrulama.ts`'teki telefon/e-posta kurallarını kullanarak. Bugün bu 4 sayfada sıfır doğrulama var ve hatalı alan hiç işaretlenmiyor.

**Kabul:** Geri sayım bitmeden buton disabled; `aria-live` ile kalan süre duyurulur; rate-limit hatası `role="alert"` ile gelir; giriş formları kayıt formlarıyla aynı alan-hatası sözleşmesine uyar.

---

### İP-4 — API sözleşmesi · S · kod yok, doküman

`docs/auth-api-sozlesmesi.md`. Backend bu repoda yok; sözleşme yazılmadan İP-5 spekülasyon olur. Hata gövdesi `AuthSonuc`/`AuthHataKodu` ile **birebir** eşlenir.

| Endpoint | Gövde | Yanıt |
|---|---|---|
| `POST /api/auth/giris-baslat` | `{yontem, kimlik}` | `{kanal, maskeliKimlik}` |
| `POST /api/auth/kod-dogrula` | `{kod}` | `Set-Cookie` + `{oturum}` |
| `POST /api/auth/kod-tekrar` | — | `202` \| `cok-fazla-deneme` |
| `POST /api/auth/parola-giris` | `{ePosta, parola}` | `Set-Cookie` + `{oturum}` |
| `POST /api/auth/kayit` | `KayitBilgileri` | `Set-Cookie` + `{oturum}` |
| `POST /api/auth/cikis` | — | cookie temizlenir |
| `GET /api/auth/oturum` | — | `{oturum}` \| `401` |
| `POST /api/auth/parola-sifirlama-iste` | `{ePosta}` | `202` (kullanıcı sayımı sızdırmaz) |
| `POST /api/auth/parola-sifirla` | `{token, yeniParola}` | `200` |
| `POST /api/auth/parola-degistir` | `{mevcut, yeni}` | `200` (oturum ister) |
| `POST /api/auth/eposta-degistir` | `{yeniEPosta}` | `202` |
| `POST /api/auth/eposta-dogrula` | `{token}` | `200` |
| `POST /api/auth/kurumsal-basvuru` | `KurumsalBasvuruBilgileri` | `202` |
| `POST /api/auth/eids-dogrula` | `{...}` | `202` |

Eklenecek hata kodları: `'cok-fazla-deneme'`, `'gecersiz-token'`, `'token-suresi-doldu'`, `'oturum-gerekli'`, `'parola-yanlis'`.

---

### İP-5 — Cookie oturumu + BFF · L · **backend gerekir**

Planın en büyük parçası.

**Cookie:** `arsam_oturum`, `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age`. İçerik **imzalı opak oturum kimliği** — JWT değil. Gerekçe: iptal edilebilirlik (çıkış-her-yerden, hesap askıya alma) payload'lı token'da mümkün değil, `'hesap-askida'` kodu ise zaten sözleşmede.

**Sunucu:** Kurulu `@tanstack/react-start` 1.168.32 `createServerFn`, `createMiddleware` **ve `createCsrfMiddleware`**'i dışa aktarıyor (`dist/esm/index.js:5` — doğrulandı). Yani el yazımı bir middleware katmanına gerek yok; framework'ün kendi primitifleri kullanılır. `routes/health.ts:4-18`'deki `server: { handlers }` kalıbı da çalışır durumda ve düz REST uçları için şablon olarak kalır.

**Adapter:** `HttpAuthAdapters` — `AuthAdapters` portunun `fetch` tabanlı implementasyonu. Fixture/HTTP seçimi env ile; fixture **silinmez**, statik demo ve testler onu kullanmaya devam eder. Port sayesinde hiçbir sayfa değişmez.

**CSRF:** `createCsrfMiddleware` + `SameSite=Lax` + tüm mutasyonlar POST. Origin kontrolünü elle yazmadan önce bu middleware'in neyi kapsadığı okunmalı.

**Sırlar:** `AUTH_COOKIE_SECRET`, `AUTH_API_URL` — `env.d.ts`'e tip, README'ye kurulum notu.

**Kabul:** `document.cookie`'den oturum okunamaz; sessionStorage'a hiçbir kimlik yazılmaz; DevTools'tan oturum uydurulamaz; SSR'da anonim `/hesabim` isteği 302 döner; 190 auth testi fixture adapter ile yeşil kalır.

---

### İP-6 — Süre, yenileme, rate-limit · M · backend gerekir *(harita #14)*

- Cookie TTL + kayan yenileme (sliding renewal)
- `Oturum.gecerlilikSonu` gerçek değer alır
- `/oturum-suresi-doldu` sayfası (`AuthStatusPage`) — **tetikleyicisi ancak burada doğduğu için İP-3'te değil burada**; yol `authRoutePaths:245` ve `AUTH_ONEK_REDDI`'de rezerve
- Süre dolunca guard `/giris` yerine buraya yönlendirir, `donus` korunur
- Sunucu tarafı rate-limit: `giris-baslat`, `kod-dogrula`, `parola-giris`, `parola-sifirlama-iste`
- Bugün yanlış anlamda kullanılan `'kod-suresi-doldu'` (`auth-adapters.ts:132` — sayfa yenilenince dönüyor, gerçek süre dolumunda değil) düzeltilir

---

### İP-7 — Google OAuth · M · backend gerekir *(harita #5)*

- `/giris`'e ayraç + Google butonu — `.divider` CSS'i (`GirisPage.module.css:34-48`) bugün yazılı ve kullanılmıyor, hazır
- `/auth/google/callback` route'u → `AuthCallbackPage` (İP-0'da düzeltilmiş hâli) bağlanır
- `girisBaslat`'ın `'google'` dalı gerçek yönlendirme döndürür (`auth-adapters.ts:125-128` bugün boş)
- `routes/giris.tsx:10` meta description'ı **artık doğru** olur
- rules.md:27'deki "henüz hiçbir rotaya bağlı değil" notu güncellenir

---

### İP-8 — Hesap içi güvenlik · M · backend gerekir *(harita #19, #20)*

`/hesabim/guvenlik` bugün yalnız özet metni gösteriyor (`AccountSecurityPage.tsx:212` "parolanızı değiştirin" — aksiyonsuz bir tavsiye).

- Parola değiştir formu (mevcut + yeni + tekrar; `current-password`/`new-password`)
- E-posta değiştir → `/e-posta-dogrula/$token` + `/e-posta-dogrula/gecersiz`
- Oturum/cihaz listesi fixture'dan gerçek veriye; "diğer oturumları kapat"

**Not:** Bu sayfalar `features/account` altında ama auth sözleşmesine tabi — `AuthFormPage` yerine hesap kabuğu kullanılır, alan-hatası ve odak sözleşmesi (`form-erisilebilirlik.ts`) paylaşılır.

---

### İP-9 — E2E + a11y kapıları · M · İP-1'den sonra kısmen

Bugün auth'un **e2e kapsamı sıfır** — 5 spec'in hiçbiri `/giris`/`/kayit`'a uğramıyor.

- `apps/web/e2e/auth.spec.ts`: telefon+OTP girişi, parola girişi, kayıt (4 adım), hatalı kod, korumalı route'a anonim erişim → `/giris?donus=`, giriş sonrası `donus`'a dönüş
- `account.spec.ts:55,92,153` düzeltilir — bugün `/hesabim`'e **giriş yapmadan** gidiyor; İP-1 sonrası bu testler kırılacak, oturum kurma adımı (storageState veya fixture cookie) eklenmeli
- Axe taraması auth sayfalarına
- No-JS SSR testi: `/giris` formu render oluyor mu

---

## 3. Bağımlılık haritası

```
İP-0 ──▶ İP-1 ──┬──▶ İP-2 (parola sıfırlama)
                ├──▶ İP-3 (OTP kurtarma)
                ├──▶ İP-9 (e2e)
                └──▶ İP-5 ──┬──▶ İP-6 (süre/rate-limit)
İP-4 ───────────────────────┼──▶ İP-7 (Google)
(sözleşme, paralel)         └──▶ İP-8 (hesap içi)
```

İP-1 bittikten sonra tek kişi sırayla, iki kişi **sayfa hattı (2→3→9)** ve **altyapı hattı (4→5→6)** olarak paralel gidebilir. Ayrımı mümkün kılan şey `AuthAdapters` portu — sayfalar porta yazılır, sunucu portu doldurur.

---

## 4. Kapsam dışı / ertelenen

| Madde | Neden |
|---|---|
| Davet akışı (12, 13) | Organizasyon/rol modeli yok — K2 |
| Organizasyon seçimi (21) | Aynı — K2 |
| `/yetkisiz` (15) | Rol kavramı olmadığı için tetikleyicisi yok; yol rezerve kalır |
| Magic link (2, 3, 4) | K1 — silinmesi öneriliyor |
| i18n | Ürün TR-only; gerekirse ayrı iş, ~12 dosyada hardcoded metin |
| Captcha | Rate-limit (İP-6) yeterli olabilir; gerekirse `AuthFormPage`'e slot |
| "Beni hatırla" | İP-5'te cookie TTL kararıyla birlikte ele alınır |
| `features/listing-detail`'deki 8 kırık test | Auth dışı, ama suite'i kırmızı tutuyor — ayrıca ele alınmalı |

---

## 5. İlk hamle önerisi

**İP-0 + İP-1 tek blokta.** Birlikte ~1-2 günlük iş, backend beklemiyor, üç canlı kusuru (hidrasyon uyuşmazlığı, korumasız `/ilan-ver` ve `/favoriler`, bozuk-davranışı-doğrulayan test) kapatıyor ve diğer her şeyin önünü açıyor. Sonuç bugünkü fixture adapter'la tamamen test edilebilir.

---

## 6. Uygulama sonucu — İP-0 + İP-1 (2026-08-04)

### Doğrulama

| Kontrol | Sonuç |
|---|---|
| `npx vitest run apps/web/src/features/auth` | ✅ 23 dosya / **192 test** |
| `npm test` (tümü) | ⚠️ 8 fail / 2082 geçti — 8'i de `listing-detail`, **değişiklik öncesinde de kırıktı** |
| `npm run typecheck` | ✅ temiz |
| `npm run lint` | ✅ 0 hata (auth'ta yeni uyarı yok) |
| `npx vite build` (SSR) | ✅ |
| `WEB_STATIC=1 npx vite build` (prerender) | ✅ exit 0 |

Prerender çıktısı §0'daki mimari iddiayı **kanıtladı**: `/hesabim`, `/ilan-ver` ve `/kayit/profil` guard'lı olmalarına rağmen statik HTML üretiyor, `/giris`'e yönlendirilmiyor — çünkü sunucuda oturum `bilinmiyor` ve guard o durumda geçiş veriyor. Guard `bilinmiyor`'u `anonim` gibi ele alsaydı bu sayfaların statik HTML'i yanlış olurdu.

### Ne değişti

**İP-0** — `AuthCallbackPage` landmark hatası + bozuk şekli doğrulayan assertion düzeltildi ve sayfa erişilebilirlik geçitlerine eklendi · `hataAnahtari` ile tekrarlanan hata yeniden duyuruluyor · `AuthFormPage` gönderim propları ayrık birleşim (adsız submit artık `TS2322`) · `AuthShell` skip-link + "Yardım"→"Blog" · `/giris` meta'sından Google vaadi çıktı · `.srOnly` hairline token misuse'u bitti · **magic link silindi** (2 rota, 2 sayfa, adapter dalı, tip üyesi).

**İP-1** — `OturumCozumu` üçlü durumu · ilk okuma `__root.beforeLoad`'a taşındı, port `oturumuCoz(): Promise<…>` · `RouterContext`'e `adapters` + `oturum` · yeni `korumaliRotaGuard` beş rotaya bağlandı (`/ilan-ver` ilk kez korunuyor) · `/hesabim` ve `/hesabim/mesajlar`'daki kopya guard'lar silindi · `KorumaliSayfa`'dan `hidrasyonTamam` kalktı.

### Planda olup yapılmayanlar

1. **`Oturum.gecerlilikSonu` İP-6'ya ertelendi.** Bugün okuyucusu yok; zorunlu alan olarak eklemek altı test fixture'ını değiştirirdi. İP-6'da expiry'nin gerçek tüketicisiyle birlikte gelecek.
2. **`/favoriler` korunmadı.** Anonim kullanıcının yerel favori tutup tutamayacağı ürün kararı — guard eklemek erişimi geri alır, yanlışsa geri alması pahalı. Karar verilene kadar açık.
3. **KVKK/kullanım koşulları linkleri eklenemedi.** `/kvkk` ve `/kullanim-kosullari` rotaları ve hukuk metinleri yok; uydurma metinle sayfa açmak doğru olmazdı. **İçerik gerekiyor.**
4. **`oturumuGetir` silinmedi**, `@deprecated` işaretlendi. 17 test çağrı yeri var ve fixture `oturumuCoz`u ondan türetiyor; gerçek HTTP adapter'la (İP-5) birlikte kaldırılacak.

### Yol boyunca çıkan, planda olmayan bulgular

- **Üç sayfa testi `AuthAdapters` mock'unu `as AuthAdapters` cast'iyle elle kuruyordu.** Cast eksik metodu derleme zamanında gizlediği için arayüze `oturumuCoz` eklenince üçü de çalışma zamanında patladı. Hepsi `test-utils.ts`'teki `sahteAuthAdapters`'a taşındı; kural rules.md §7'ye yazıldı.
- **Oturumdan seed edilen form alanları guard'ın içinde kurulmalı.** `KayitProfilPage` alanlarını `useState(oturum?.ePosta ?? '')` ile dış bileşende kuruyordu; oturum asenkron çözülünce boş seed edilip bir daha güncellenmiyordu. Form `ProfilFormu` iç bileşenine taşındı. Bu, guard deseninin yazılı olmayan bir kuralıydı — artık rules.md §14'te.
- **`.srOnly` deseni repo genelinde ~35 dosyada kopyalanmış.** Auth'taki iki kopya `--lg-stroke-hairline`'ı kutu ölçüsü olarak kullanıyordu (Glass kütüphanesindeki 33 kopya düz `1px` kullanıyor). Auth repo normuna çekildi; **ortak utility'ye çıkarma repo geneli bir iş, bu kapsamda yapılmadı.**
- **`GlassToast.tsx:172` prerender'da `document is not defined` hatası veriyor** (`document.body`'ye portal). Auth'la ilgisiz, önceden var, `failOnError: false` sayesinde build'i kırmıyor — ama statik dağıtımda toast'lı sayfaların SSR'ı sessizce düşüyor. Ayrıca ele alınmalı.

### Sıradaki

Plan sırası aynen geçerli: **İP-2 (parola sıfırlama)** ve **İP-3 (OTP kurtarma)** artık backend beklemeden yapılabilir; **İP-4 (API sözleşmesi)** paralel yürüyebilir.

---

## 7. Uygulama sonucu — İP-2 + İP-3 (2026-08-04)

### Doğrulama

| Kontrol | Sonuç |
|---|---|
| `npx vitest run apps/web/src/features/auth` | ✅ 24 dosya / **240 test** (İP-1 sonrası 192'ydi) |
| `npm test` (tümü) | ⚠️ 8 fail / 2130 geçti — 8'i de `listing-detail`, değişiklik öncesinde de kırıktı |
| `npm run typecheck` | ✅ temiz |
| `npm run lint` | ✅ 0 hata |
| `npx vite build` (SSR) | ✅ |
| `WEB_STATIC=1 npx vite build` | ✅ exit 0; altı yeni rotanın hepsi prerender edildi |

### Eklenen sayfalar

| Harita # | Sayfa | Rota |
|---|---|---|
| 9 | Parolamı unuttum | `/parola-sifirla` |
| — | Bağlantı gönderildi (haritada yok, akış gerektiriyor) | `/parola-sifirla/gonderildi` |
| 10 | Parola sıfırlama | `/parola-sifirla/yeni?token=…` |
| 11 | Parola sıfırlama başarılı | `/parola-sifirla/tamam` |
| — | Bağlantı geçersiz (haritada yok, akış gerektiriyor) | `/parola-sifirla/gecersiz` |
| 16 | Hesap pasif/askıya alınmış | `/hesap/askida` |

Altısı da mevcut arketiplerden çıktı — yeni bir sayfa arketipi yazılmadı.
`/parola-sifirla` öneki `authRoutePaths` ve `AUTH_ONEK_REDDI`'de zaten
rezerveydi, bu yüzden `config/routes.ts` ve `auth-session.ts`
**değiştirilmedi**: beş sayfa da otomatik olarak `AuthShell` kabuğunu aldı ve
hiçbiri `donus` hedefi olamıyor. Rezervasyonun karşılığını verdiği yer burası.

### Davranış değişiklikleri

- **`GirisKodPage`'e "Kodu tekrar gönder" + 60 sn geri sayım.** Akışın tek
  kurtarma yoluydu ve yoktu; SMS gelmeyen kullanıcı baştan başlamak
  zorundaydı. `cok-fazla-deneme` butonu kalıcı kapatır.
- **Üç giriş sayfasına alan doğrulaması** (`aria-invalid` +
  `aria-describedby` + ilk hatalı alana odak). Öncesinde sıfır client
  doğrulaması vardı ve hatalı alan hiç işaretlenmiyordu.
- **`GirisParolaPage`'e "Parolanızı mı unuttunuz?" geri geldi**; onun
  yokluğunu doğrulayan test tersine çevrildi.
- **`HesapVarPage`'e ikincil bağlantı olarak parola sıfırlama** eklendi
  (rules.md'nin "Faz 3 notu"nun istediği şey).
- **`hesap-askida` hata kodu artık bir yere gidiyor:** giriş akışları bu kodu
  aldıklarında `/hesap/askida`'ya taşıyor. Kod ve red listesi vardı, varış
  sayfası yoktu.

### Tasarım kararları

1. **Token yolda değil sorguda** (`?token=`). `/tamam` ve `/gecersiz` kardeş
   statik rotalar; dinamik `$token` segmenti onlarla aynı ad alanını
   paylaşırdı. Statik segment kazanır ama bu kırılgan bir dayanak.
2. **Hesap sayımına kapalı.** `parolaSifirlamaIste` biçimi geçerli her adres
   için başarı döner; `/gonderildi` metni "kayıtlı bir hesap varsa" der.
   Adapter testi bunu sabitler.
3. **Parola kuralı tek kaynaktan.** `kayit-dogrulama.ts` tek alanlık
   doğrulayıcılara ayrıldı (`ePostaHatasi`, `telefonHatasi`, `parolaHatasi`,
   `kodHatasi`); kayıt formu artık onları birleştiriyor. Aynı fonksiyon
   `ParolaYeniPage` ve fixture adapter tarafından da tüketiliyor.
4. **Girişteki parola kuralı kayıttakiyle KASITLI olarak aynı değil.**
   `GirisParolaPage` yalnız "boş mu" denetler — eski parolalar bugünkü kuralı
   sağlamayabilir ve girişte reddedilmemeli.
5. **Token hatası formda gösterilmez.** Kullanıcının düzeltebileceği bir şey
   değil; sayfa `/parola-sifirla/gecersiz`'e taşır. Token'sız istek rotanın
   `beforeLoad`'unda aynı yere gider — form hiç çizilmez.

### Yol boyunca çıkan

- **Kalan üç elle kurulan adapter mock'u** (`auth-flow`,
  `AuthSessionProvider`, `hesabim*`) porta üç metot eklenince yine patladı —
  hepsi `sahteAuthAdapters`'a taşındı. Artık auth testlerinde elle kurulan
  mock KALMADI.
- **`interface` yerine `type`** gerekiyordu: `ilkHataliAlanaOdaklan`
  `Record<string, string | undefined>` bekliyor ve TypeScript örtük indeks
  imzasını yalnız tip takma adlarına veriyor.
- **`ePostaMaskele` geri geldi.** İP-0f'te ölü kod olduğu için silinmişti;
  `parolaSifirlamaIste`'nin maskeli e-posta döndürmesiyle gerçek tüketicisi
  oldu.

### Haritaya göre kalan 9 sayfa

`/auth/google/callback` (5), davet ikilisi (12, 13), oturum süresi doldu
(14), yetkisiz (15), parola değiştir (19), e-posta doğrula (20), organizasyon
seçimi (21) ve magic link doğrulama (3 — K1 ile kapsam dışı).

Bunların **hiçbiri backend'siz tamamlanamaz** (14 expiry, 19/20 gerçek
mutasyon, 5 OAuth altyapısı) ya da ürün kararı bekliyor (12/13/21, ve 15 için
rol modeli). Sıradaki adım artık **İP-4 (API sözleşmesi) → İP-5 (cookie +
BFF)**.

---

## 8. Uygulama sonucu — İP-6 (2026-08-04)

Kalan sayfaların "backend'siz yapılamaz" değerlendirmesi **yanlıştı**. Auth
katmanının tamamı zaten `AuthAdapters` portu + fixture uygulaması üzerine
kurulu; kalan sekiz sayfa da aynı desenle yazıldı. Backend geldiğinde portu
doldurur, sayfalar değişmez.

### Doğrulama

| Kontrol | Sonuç |
|---|---|
| `npx vitest run apps/web/src/features/auth` | ✅ 26 dosya / **308 test** (İP-3 sonrası 240'tı) |
| Erişilebilirlik geçidi | ✅ **56 test** (başlangıçta 36) |
| `npm test` (tümü) | ⚠️ 8 fail / 2198 geçti — 8'i de `listing-detail`, önceden de kırıktı |
| `npm run typecheck` | ✅ temiz |
| `npm run lint` | ✅ 0 hata |
| SSR + statik build | ✅ exit 0; yeni sayfaların hepsi HTML üretti |

### Eklenen sayfalar

| Harita # | Sayfa | Rota |
|---|---|---|
| 5 | Google ile giriş işleniyor | `/giris/google/callback` |
| 12 | Daveti kabul et | `/davet/$token` |
| 13 | Davet geçersiz | `/davet/gecersiz` |
| 14 | Oturum süresi doldu | `/oturum-suresi-doldu` |
| 15 | Yetkisiz erişim | `/yetkisiz` |
| 19 | Parola değiştir | `/parola-degistir` |
| 20 | Yeni e-posta doğrula | `/e-posta-dogrula` |
| 21 | Organizasyon seçimi | `/organizasyon-sec` |

### Tasarım kararları

1. **Rol modeli GEÇİCİ ve asgari.** `OrganizasyonRolu` üç kademe
   (`sahip`/`yonetici`/`danisman`). Sayfalar rolü yalnız **gösterir**, karar
   vermez — yetki kararı sunucunun, `yetkisiz` koduyla döner. Bu, K2'de
   "rol modeli yok, yazılamaz" dediğim engeli kaldırıyor: karar vermeyen bir
   model spekülasyon değil, yalnız görüntüleme sözleşmesi.
2. **`/yetkisiz` artık tetiklenebilir.** Rol kavramı doğduğu için "giriş
   yapmış ama yetkisiz" durumu gerçek oldu; `organizasyonSec` erişilmeyen bir
   organizasyon için bu koda düşüyor.
3. **`/davet/:token` dönüş reddi listesinde DEĞİL.** Daveti kabul etmek oturum
   ister; oturumsuz kullanıcı `/giris?donus=/davet/xyz`'e gider ve geri döner.
   Yalnız `/davet/gecersiz` reddedilir — oraya dönmek anlamsız.
4. **Dördüncü arketip eklenmedi.** `DavetPage` ve `OrganizasyonSecPage` form
   değil ama tek mesajdan fazla; ikisi kendi `<main>`'ini kurup ortak ölçüyü
   paylaşıyor. Üçüncü bir örnek çıkarsa arketipleştirilmeli.
5. **Yükleme durumu ayrı rota değil.** Veri çeken üç sayfa bekleme/hata
   durumlarını aynı ağaçta çiziyor; tek `main`/tek `h1` sözleşmesi her
   durumda korunuyor ve a11y geçidi bu sayfaları yükleme hâlinde de
   denetliyor.
6. **`Oturum.organizasyon` opsiyonel.** Zorunlu yapmak altı fixture'ı
   gereksizce değiştirirdi.

### Yol boyunca çıkan

- **İki token uydurmuşum** (`--lg-fill-secondary`, `--lg-text-title-2`);
  yazdığım CSS'i `src/index.css`'e karşı doğrulayan bir kontrol koştum ve
  ikisini de gerçek token'larla değiştirdim (`--lg-bg`, `--lg-text-title`).
  Bu kontrol yeni CSS yazan her işte tekrarlanmalı.
- **`auth-adapters.test.ts`'te `beforeEach(cikisYap)` ilk `describe`'ın
  İÇİNDEYDİ.** Sonradan eklenen üst düzey bloklar temizliği almıyordu ve
  fixture tekilinin oturumu testler arasında sızıyordu. Beş bloğa da eklendi.
- **`AccountAction.to` birliği dardı** (`/ilan-ver | /favoriler | /emlak`).
  `/parola-degistir` eklendi — darlık kasıtlı, yeni hedef bilinçli karar
  olsun diye; serbest string'e çevrilmedi.
- **`listing-create` bir kez kırmızı düştü** ama tek başına iki kez temiz
  geçti — zamanlamaya bağlı flake, değişikliklerle ilgisi yok. `listing-detail`
  8 hatası ise gerçek ve önceden var.

### Frontend tarafında kalan yok

Haritadaki 21 sayfanın 19'u karşılandı; kalan ikisi magic link akışı ve
K1 kararıyla bilinçli olarak silindi. **Bundan sonrası sunucu işi:** fixture
adapter gerçek davranışı taklit ediyor ama hiçbir ağ çağrısı yapmıyor,
oturum hâlâ `sessionStorage`'da ve guard'lar SSR'da `bilinmiyor` görüyor.
Sıradaki adım İP-4 (API sözleşmesi) → İP-5 (cookie + BFF) → İP-6' (süre,
yenileme, rate-limit).
