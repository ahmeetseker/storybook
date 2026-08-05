# Auth Katmanı Hazırlık Raporu

**Tarih:** 2026-08-04 · **Branch:** `feature/glass-sidebar` · **Kapsam:** `apps/web/src/features/auth/**`, `apps/web/src/routes/giris*|kayit*|hesap*`
**Referans:** `~/Downloads/metaframer-auth-sayfa-haritasi.html` — "Auth Sayfa Haritası", 21 sayfa
**Yöntem:** 4 paralel agent (route kapsamı · middleware/oturum · UI/form kalitesi · test & build sağlığı), bulgular dosya okumasıyla doğrulandı.

---

## Kısa cevap

| Soru | Cevap |
|---|---|
| Haritadaki sayfaların hepsi var mı? | **Hayır.** 21 sayfadan 5'i tam, 4'ü kısmen, **12'si yok**. |
| Sayfalar çalışır vaziyette mi? | **Evet — ama fixture adapter üzerinde.** 190 test yeşil, typecheck temiz. Hiçbir ağ çağrısı yok. |
| Middleware dahil yazılmış mı? | **Hayır. Middleware katmanı hiç yok.** 0 `createMiddleware`, 0 `createServerFn`, 0 cookie, 0 `beforeLoad` auth guard. |
| Frontend altyapısı hazır mı? | **Evet, büyük ölçüde.** Arketip soyutlaması (shell/form/status), doğrulama, erişilebilirlik ve adapter portu gerçek ve sağlam. Eksik olan backend ve 12 sayfa. |

**Tek cümlelik özet:** Frontend iskeleti üretim kalitesine yakın; auth'un *kendisi* (sunucu, oturum, koruma) henüz yazılmamış — şu an bir demo state machine.

---

## 1. Sayfa kapsamı — 21 sayfalık haritaya karşı

Repo Türkçe slug kullanıyor; eşleştirme **anlama göre** yapıldı.

| # | Sayfa | Repo route | Durum |
|---|---|---|---|
| 1 | Giriş | `/giris` | ✅ VAR |
| 2 | Magic link gönderildi | `/giris/baglanti-gonderildi` | ⚠️ KISMEN — route var, koddan erişilmiyor |
| 3 | Magic link doğrulanıyor | — (`AuthCallbackPage` rotasız) | ⚠️ KISMEN — component var, bağlı değil |
| 4 | Magic link geçersiz | `/giris/baglanti/gecersiz` | ⚠️ KISMEN — route var, koddan erişilmiyor |
| 5 | Google ile giriş işleniyor | — | ❌ YOK |
| 6 | Kayıt | `/kayit` | ✅ VAR (4 adımlı) |
| 7 | Profil tamamlama | `/kayit/profil` | ✅ VAR (korumalı) |
| 8 | Parola ile giriş | `/giris/parola` | ✅ VAR |
| 9 | Parolamı unuttum | — | ❌ YOK |
| 10 | Parola sıfırlama | — | ❌ YOK |
| 11 | Parola sıfırlama başarılı | — | ❌ YOK |
| 12 | Daveti kabul et | — | ❌ YOK |
| 13 | Davet geçersiz | — | ❌ YOK |
| 14 | Oturum süresi doldu | — | ❌ YOK |
| 15 | Yetkisiz erişim | — | ❌ YOK |
| 16 | Hesap askıya alınmış | — | ❌ YOK |
| 17 | Kullanıcı zaten kayıtlı | `/kayit/hesap-var` | ✅ VAR (tam bağlı) |
| 18 | Genel auth hata sayfası | `/giris/hata` | ⚠️ KISMEN — koddan yönlendirme yok |
| 19 | Parola değiştir | — | ❌ YOK (`/hesabim/guvenlik` sadece metin) |
| 20 | Yeni e-posta doğrula | — | ❌ YOK |
| 21 | Organizasyon seçimi | — | ❌ YOK |

**Sayım:** VAR 5 · KISMEN 4 · YOK 12

### Haritada olmayan, repo'da olan (ürüne özgü, doğru eklemeler)
- `/giris/kod` — SMS OTP ekranı; **bu ürünün birincil giriş yöntemi**
- `/kayit/kurumsal` — emlak ofisi başvurusu (vergi no, yetki belgesi)
- `/hesap/dogrula` — EİDS yetki doğrulaması
- `/hesabim/guvenlik` — hesap içi güvenlik özeti (fixture)

### Ölü uçlar
`girisDurumSayfalari.tsx`'teki üç sayfanın (2, 4, 18) rotası var ama **hiçbirine kod içinden gidilmiyor** — yalnızca URL yazarak erişilebilir. Magic-link akışı adapter'da yazılmış (`girisBaslat('baglanti')`) ama hiçbir sayfa çağırmıyor.

`config/routes.ts` `authRoutePaths` ve `auth-session.ts` red listesi `/parola-sifirla`, `/oturum-suresi-doldu`, `/yetkisiz`, `/hesap/askida` yollarını **önceden tanıyor** — sayfalar yazılmamış ama shell seçimi ve open-redirect koruması hazır. İyi bir hazırlık.

---

## 2. Middleware / oturum katmanı — yok

Bu bölüm raporun en kritik kısmı.

**Sunucu tarafında auth adına hiçbir şey yok:**
- `grep createMiddleware|createServerFn|useServerFn|getCookie|setCookie` → `apps/web/src` içinde **sıfır eşleşme**
- Uygulamadaki tek sunucu handler'ı: `routes/health.ts` (`{status:'ok'}`)
- `nitro()` plugin kayıtlı ama `nitro.config.ts` / `server/` dizini / middleware yok
- Router context yalnız `{ queryClient }` — bir guard'ın okuyacağı `session` alanı yok

**Oturum nerede duruyor:** `sessionStorage['arsam.oturum']` içinde **düz JSON kullanıcı profili** (`auth-adapters.ts:48,63-67`). Token yok — "oturum"un kendisi profil nesnesi. httpOnly değil, imzalı değil, cookie değil. DevTools'tan `sessionStorage.setItem('arsam.oturum', '{...}')` yazan herkes istediği kişi olarak giriş yapmış olur. Sekme kapanınca oturum biter (localStorage değil, sessionStorage).

**Route koruması gerçek bir guard değil:** `KorumaliSayfa` (`components/KorumaliSayfa.tsx:32-44`) hidrasyondan *sonra* `useEffect` içinde `navigate()` çağırıyor ve o ana kadar `null` render ediyor. SSR sayfayı 200 ile döner, sonra client tarafında sekerek `/giris`'e atar. JS kapalıyken hiçbir engel yok.

| Route | Koruma |
|---|---|
| `/hesabim` + 8 alt sayfa | `hesabim.tsx:16,29` — inline `useKorumaliRota()` + `if (!girisYapildi) return null` |
| `/hesabim/mesajlar` | aynı kalıbı ikinci kez kopyalıyor (`hesabim.mesajlar.tsx:89,99`) |
| `/kayit/profil`, `/kayit/kurumsal`, `/hesap/dogrula` | `<KorumaliSayfa>` sarmalayıcı |
| `/ilan-ver`, `/favoriler` | **hiç koruma yok** |

⚠️ `hesabim.tsx:29` ve `hesabim.mesajlar.tsx:99` `hidrasyonTamam` bayrağı olmadan `return null` yapıyor — bu tam olarak `rules.md §14`'ün yasakladığı kopya kalıp. Giriş yapmış kullanıcı `/hesabim`'i yenilediğinde SSR `null`, client tam shell → **hidrasyon uyuşmazlığı**.

**Adapter'lar tamamen fixture** (`auth-adapters.ts:36-47`, dosya bunu kendi yorumunda söylüyor):
```ts
const DEMO_OTURUM: Oturum = { kullaniciId: 'demo-1', adSoyad: 'Mehmet Yılmaz', ... }
const DEMO_KOD = '000000'
const DEMO_PAROLA = 'arsam1234'
```
Dosyada tek bir `fetch` yok. SMS kodu hiçbir yere gönderilmiyor — closure'da tutulup `'000000'` ile karşılaştırılıyor. `google` yöntemi `{kanal:'yonlendirme'}` dönüp hiçbir şey yapmıyor. EİDS doğrulaması bir spread operatörü (`eidsDurumu: 'dogrulandi'`).

**Süre/refresh/CSRF:** hiçbiri yok. `Oturum` tipinde `expiresAt`/`iat` alanı bile yok.

**Gerçekten sağlam olan tek güvenlik kodu:** `guvenliDonusYolu` (`domain/auth-session.ts:34-48`) — `?donus=` parametresi için open-redirect sanitizer'ı (`//host`, `\`, `%2f%2f`, `%5c`, auth-prefix döngüsü reddediliyor), testli ve doğru. Korunmalı.

---

## 3. Backend'e geçiş — hazır dikişler ve engeller

**Hazır olanlar (olduğu gibi kullanılabilir):**
- `AuthAdapters` interface'i (`auth-adapters.ts:17-34`) — 9 metot, tüm sayfalar yalnız bu port üzerinden konuşuyor (8 çağrı noktası, hiçbiri portu delmiyor). Gerçek bir seam.
- `AuthSonuc<T>` + `AuthHataKodu` hata taksonomisi (`domain/auth-types.ts:19-31`) — UI zaten bunlara dallanıyor
- Adapter injection: `AuthSessionProvider({ adapters })` + `test-utils.ts` sahte adapter'lar → implementasyon değişimi tek satır
- `routes/health.ts` `server: { handlers }` mekanizmasının bu Start sürümünde çalıştığını kanıtlıyor — gerçek endpoint'ler için şablon

**Engeller (hepsi yük taşıyor):**
1. **`oturumuGetir(): Oturum | null` senkron.** Sert engel. Gerçek cookie/sunucu oturumu async okuma gerektirir; bu imzayı değiştirmek `AuthSessionProvider.tsx:33`'teki lazy initializer'ı ve `KorumaliSayfa`'daki hidrasyon dansını kırar. → **"gerçek API gelince yalnız bu dosya değişir" iddiası (`rules.md §7`) doğru değil.**
2. Router context'te oturum yok — `RouterContext`'e `session` eklenmeli, `__root` `beforeLoad`'unda SSR'da doldurulmalı
3. Hiçbir route'ta `beforeLoad` auth guard'ı yok
4. Cookie katmanı yok (httpOnly, imzalama, SameSite/CSRF)
5. Mutasyonlar server function olmalı; `kayit-dogrulama.ts` yalnız client tarafı
6. `Oturum`'da token/expiry modeli yok; `/oturum-suresi-doldu` sadece boşta duran bir string
7. **`WEB_STATIC=1` prerender modu** (`vite.config.ts:17,45-56`) sunucu tarafı oturumla mimari olarak uyumsuz — önce ayrıştırılmalı
8. `/hesabim` arkasındaki veri de fixture (`ACCOUNT_FIXTURES`) — sunucuda korumak şu an korunacak bir şey bulamaz

---

## 4. Frontend kalitesi — güçlü

**Arketipler gerçek ve yük taşıyor:** `AuthShell` (kabuk seçimi `__root.tsx:51`'de `isAuthPath` ile), `AuthFormPage` (main + h1 + form + `role="alert"`), `AuthStatusPage` (8 route = tek component), `KayitAdimSeridi`. Yeni bir status sayfası 18 satır, basit bir form sayfası 67 satır.

**Öne çıkanlar:**
- Hidrasyon öncesi submit disable'ı (`AuthFormPage.tsx:59-62`) + SSR testi — çoğu ekibin kaçırdığı bir hata sınıfı
- `autocomplete` her yerde ve **doğru**: `current-password` vs `new-password` ayrımı, `one-time-code`, `organization`/`address-level1`
- Odak yönetimi: `ilkHataliAlanaOdaklan` **görsel** alan sırasını kullanıyor, doğrulama sırasını değil (`form-erisilebilirlik.ts:22-28`)
- `:focus-visible` halkası 13 yerin hepsinde token'lı, hiç `:focus` kullanılmamış
- Adım filtreleme (`kayit-adimlari.ts:80,97`) — kullanıcı görmediği adımın hatasını duymuyor
- **Tasarım sistemi uyumu neredeyse kusursuz:** 6 auth CSS modülündeki tüm `--lg-*` token'ları `src/index.css`'te çözülüyor, hex/rgb yok

**Doğrulama iki katmanlı:**
- ✅ `KayitPage`, `KayitKurumsalPage` — tam doğrulama, `aria-invalid`/`aria-describedby`, actionable Türkçe hata metni
- ❌ `GirisPage`, `GirisParolaPage`, `GirisKodPage`, `KayitProfilPage` — **sıfır client doğrulaması**, alan hiç işaretlenmiyor, yalnız sayfa düzeyi banner

**Test durumu:** 22 dosya / **190 test, hepsi yeşil** (5.07s). `AuthAccessibility.test.tsx` tek başına 36 case. Typecheck temiz, lint'te auth'a dokunan 2 kozmetik uyarı.

---

## 5. Somut kusurlar (öncelik sırasıyla)

| # | Dosya | Sorun |
|---|---|---|
| 1 | `components/AuthCallbackPage.tsx:30` | `role="status"` **`<main>` üzerinde** → main landmark yok oluyor. `rules.md:39-45` bu dosyayı adıyla uyarıyor; `authArketipleri.test.tsx:159-162` **bozuk hâli test ediyor** |
| 2 | `KayitPage.tsx:129/137`, `KayitKurumsalPage.tsx:95/100` | `setHata(undefined)` + `setHata(ozet)` aynı tick'te batch'leniyor → aynı hata ikinci kez **ekran okuyucuya duyurulmuyor** |
| 3 | `routes/hesabim.tsx:29`, `hesabim.mesajlar.tsx:99` | `hidrasyonTamam` bayrağı yok → hidrasyon uyuşmazlığı (rules.md §14 ihlali) |
| 4 | `routes/giris.tsx:10` | Meta description **"…veya Google ile giriş yapın"** diyor; Google butonu yok |
| 5 | `GirisKodPage.tsx` | "Kod 3 dakika geçerlidir" yazıyor ama **"tekrar gönder" butonu ve geri sayım yok** — SMS gelmezse kullanıcı sıkışıyor |
| 6 | `KayitPage.tsx:397` | KVKK onayı "Aydınlatma metnini … okudum" — **link yok**, okunamıyor |
| 7 | `AuthFormPage.tsx:23` | `gonderEtiketi?` opsiyonel + koşulsuz render → adsız submit butonu derleme hatası vermiyor |
| 8 | `AuthShell.tsx:27-29` | "Yardım" etiketli link `/blog`'a gidiyor; ayrıca skip-link yok (`MarketplaceShell`'de var) |
| 9 | `KayitAdimSeridi.module.css:18` | `--serit-nokta: 28px` — tek raw px (gerekçesi yorumda yazılı) |
| 10 | `KayitAdimSeridi/KayitPage.module.css` | `.srOnly` iki modülde kopyalanmış, boyut için `--lg-stroke-hairline` kullanılıyor (token amaç dışı) |

**Üretim için eksikler:** rate-limit/kilitleme UI'ı, parola göster/gizle, canlı parola gücü göstergesi, "beni hatırla" (sekme kapanınca oturum bitiyor ve UI bunu söylemiyor), captcha yuvası, i18n (tüm metin hardcoded Türkçe), **parola kurtarma yolu yok** (Faz 3'e ertelenmiş, bilinçli).

---

## 6. Test & build sağlığı

| Kontrol | Sonuç |
|---|---|
| `npx vitest run apps/web/src/features/auth` | ✅ **22 dosya / 190 test geçti** (5.07s) |
| `npm test` (tümü) | ⚠️ **8 fail / 2078 geçti** (218 dosya, 31s) — hepsi `features/listing-detail`, auth'la ilgisiz |
| `npm run typecheck` | ✅ Temiz (exit 0) |
| `npm run lint` | ✅ 0 hata, 36 uyarı (auth'ta 2 kozmetik `only-export-components`) |
| E2E (`apps/web/e2e/`) | ❌ **Auth kapsamı sıfır.** 5 spec / 25 test; `giris\|kayit\|login\|register\|parola` grep'i hiç eşleşmiyor. `account.spec.ts` `/hesabim`'e giriş yapmadan gidiyor |

Listing-detail hataları tek kök nedene bağlı: sayfa boş `<main>` render ediyor (`Unable to find … role "navigation" and name "Bölümler"`).

---

## 7. Önerilen sıra

**Faz A — mevcut kodun borcunu kapat (küçük, hızlı)**
1. `AuthCallbackPage` role/main düzelt + testi düzelt + `TUM_SAYFALAR`'a ekle
2. `hesabim.tsx` / `hesabim.mesajlar.tsx` → `KorumaliSayfa` kullanacak şekilde birleştir (hidrasyon hatasını da kapatır)
3. `giris.tsx` meta description'ı düzelt
4. Giriş sayfalarına client doğrulaması + `aria-invalid`/`aria-describedby`
5. `GirisKodPage`'e tekrar gönder + geri sayım
6. KVKK metnine gerçek linkler

**Faz B — sunucu katmanı (asıl iş)**
1. `WEB_STATIC` prerender ile SSR-oturum çakışmasını karara bağla
2. `RouterContext`'e `session` ekle; `__root` `beforeLoad`'unda SSR'da doldur
3. httpOnly imzalı cookie + `createServerFn` ile gerçek endpoint'ler
4. `oturumuGetir`'i async'e çevir (provider + `KorumaliSayfa` birlikte değişir — tek dosya değil)
5. Korumalı route'lara `beforeLoad` guard'ı; `/ilan-ver`, `/favoriler` dahil
6. `Oturum`'a expiry + refresh; `/oturum-suresi-doldu` sayfasını yaz

**Faz C — eksik 12 sayfa**
Öncelik: parola sıfırlama üçlüsü (9/10/11) → durum sayfaları (14/15/16/18 bağlantıları) → e-posta değişikliği (20) → davet akışı (12/13) → organizasyon seçimi (21, ürün kararı gerekir) → Google OAuth (5).

---

## Not: çalışma ağacında beklenmedik değişiklik

Oturum başında `git status` temizdi. İnceleme sırasında 7 dosya değişmiş olarak göründü (**14 ekleme / 352 silme**):
`e2e/shell.spec.ts` (−207), `components/MarketplaceShell.tsx` (−74), `styles/app.css` (−35), `config/routes.ts` (−26), `MarketplaceShell.test.tsx`, `routes.test.ts`, `features/account/rules.md`.

Bu değişiklikleri **bu inceleme yapmadı** — agent'lar salt-okunur çalıştı. Muhtemelen paralel çalışan başka bir oturum/işten geliyor. Auth dosyalarına dokunmuyor ve yukarıdaki test sayıları bu değişiklikler sonrası tekrar doğrulandı. **Commit etmeden önce gözden geçirin.**
