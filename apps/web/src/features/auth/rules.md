---
name: Auth (features/auth)
category: navigasyon
status: hazır
lastReviewed: 2026-08-01
---

# Auth Kuralları

## 1. Amaç

`features/auth` iki katman sağlar: (1) oturum durumu ve rota koruması
(`AuthSessionProvider`, `useAuthSession`, `useKorumaliRota`), (2) giriş akışının
**üç yeniden kullanılabilir sayfa arketipi** (`AuthFormPage`, `AuthStatusPage`,
`AuthCallbackPage`) + adapter sözleşmesi (`AuthAdapters`) + güvenli dönüş yolu
yardımcı fonksiyonu (`guvenliDonusYolu`). Faz 2 (kayıt) ve Faz 3 (parola
sıfırlama) tek tek yeni component yazmaz — bu üç arketipin üzerine kurulur.
Sayfa-özel iş kuralı (validasyon, adapter çağrısı) `pages/*.tsx` içinde kalır;
arketipler yalnız iskelet ve semantik sağlar.

**Hangi arketip ne zaman:**

| Arketip | Kullanım | Örnek |
|---|---|---|
| `AuthFormPage` | Kullanıcıdan girdi istenen her ekran | Telefon/kod/parola girişi, ileride kayıt formu |
| `AuthStatusPage` | Form olmayan, tek mesajlı sonuç ekranı (info/success/error) | "Bağlantı gönderildi", "Bağlantı geçersiz", genel hata |
| `AuthCallbackPage` | Dış sağlayıcıdan (ör. Google) dönüşü karşılayan bekleme/hata ekranı | OAuth callback — henüz hiçbir rotaya bağlı değil, Faz sonrası içindir |

`AuthShell` bunların hiçbiri değildir — sayfa değil, üst kabuktur (bkz. §2).

## 2. Semantik sözleşme

- **Landmark sözleşmesi:** her arketip kendi `<main id="main-content">`
  kökünü üretir; `AuthShell` (`components/AuthShell.tsx`) `main` SAĞLAMAZ,
  yalnız masthead/footer çerçevesi çizer. Bu bilinçli bir bölünme: kabuk ve
  sayfa aynı anda `main` üretirse iç içe iki landmark oluşur.
- **Explicit `role`, elementin implicit rolünü ezer.** Bir HTML elementine
  konan `role` (`alert`, `status` vb.) o elementin varsayılan ARIA rolünün
  yerini alır — silinmez, üstüne eklenmez. `<main role="alert">` artık `main`
  landmark'ı olarak GÖRÜNMEZ, yalnız `alert` olarak görünür. Bu yüzden
  `role="alert"`/`role="status"` **asla köke** (`main`/`AuthFormPage`'in
  formu) konmaz; her zaman mesajı taşıyan `<p>`'ye konur. 2026-07-31 tarihli
  denetimde `AuthStatusPage`/`AuthCallbackPage` bu kuralı `main` üzerinde
  ihlal etmişti (bkz. Changelog) — bir daha eklenirken bu satır kontrol
  edilmeli.
- Form hataları `AuthFormPage` içinde `role="alert"` ile duyurulur (kaynak:
  `hata` prop'u), durum sayfalarında `AuthStatusPage`'in `aciklama`
  paragrafı taşır.
- Linkler TanStack Router `Link` gerektirir; portal yoktur.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | Arketip | Kurallar |
|---|---|---|---|
| Header (başlık + açıklama) | Evet | Form, Status, Callback | Tek `h1` |
| Form alanları | Evet | Form | `children` — her input `id` + `label[for]` + `autocomplete` taşır |
| Gönder butonu | Evet | Form | Hidrasyon tamamlanana kadar `disabled` (bkz. §7) |
| İkincil bağlantılar | Gerektikçe | Form, Status | Bağlanamayan rota için satır TAMAMEN kaldırılır, disabled link yazılmaz |
| Ton işareti + mesaj | Evet | Status, Callback | `data-tone`, `role="alert"` yalnız mesaj paragrafında |

## 4. Public API

| Ad | Bileşen | Type | Controlled | Açıklama |
|---|---|---|---|---|
| `ikincilBaglantilar` | `AuthFormPage` | `AuthIkincilBaglanti[]` | Hayır | `{ etiket, hedef }`; render eden `Link` mevcut search'ü (`donus` dahil) otomatik taşır (§ güvenlik) |
| `hata` | `AuthFormPage` | `string?` | Hayır | Verilirse `role="alert"` ile duyurulur |
| `tone` | `AuthStatusPage` | `'info'\|'success'\|'error'` | Hayır | `error` mesaj paragrafını alert yapar |
| `AuthAdapters` | `data/auth-adapters.ts` | interface | — | Bkz. §7 adapter sözleşmesi |
| `useKorumaliRota()` | `AuthSessionProvider.tsx` | hook | — | Oturumsuz erişimde `/giris?donus=...`'a yönlendirir |
| `guvenliDonusYolu(ham)` | `domain/auth-session.ts` | fn | — | Bkz. §7 güvenlik kuralı |

## 5. Seçenek eksenleri

`material`, `tone`(*), `size`, `variant`, `thickness`, `tint`, `prominent`
eksenleri N/A — bu bir sayfa/akış katmanıdır, görsel component değil.
(*) `AuthStatusPage`'teki `tone` görsel variant değil, durum/veri eksenidir —
`GlassX` component'lerindeki `tone` ile karıştırılmamalı. Hover/focus/active
prop olamaz.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| `girisYapildi` | `useAuthSession()` | Korumalı sayfa içeriği | `useKorumaliRota` yönlendirme |
| hidrasyon öncesi | `AuthFormPage` iç `useState` | Gönder butonu etkin | `disabled` |
| `gonderiliyor` | Sayfa-özel | Gönder butonu etkin | `loading` |
| `hata` | Sayfa-özel adapter sonucu | — | `role="alert"` |
| `tone: error` | `AuthStatusPage`/`AuthCallbackPage` prop | — | Açıklama paragrafında `role="alert"` |

## 7. Davranış

**Adapter sözleşmesi:** her sayfa `AuthAdapters` arayüzünü tüketir
(`girisBaslat`, `koduDogrula`, `parolaIleGiris`, `oturumuGetir`, `cikisYap`).
Gerçek API bağlanırken YALNIZ `data/auth-adapters.ts` değişir; sayfa
component'lerine dokunulmaz. Yeni bir giriş yöntemi eklerken adapter'a yeni
bir metot eklemek yerine mevcut `girisBaslat(yontem, kimlik)` imzasını
genişletmeyi tercih et — sayfa tarafında switch/case çoğaltma.

**`donus` güvenlik kuralı:** `donus` arama parametresi asla doğrudan
`navigate`/`Link`'e yazılmaz.
- Yeni bir hedef **üretiyorsan** (ör. giriş sonrası son yönlendirme, ya da
  `useKorumaliRota`'nın kendi ürettiği `/giris?donus=...`), değeri
  `guvenliDonusYolu(ham)` ile geçir. Açık yönlendirme (open redirect),
  protokol-bağıl yol (`//host`), ters bölü kaçışı ve auth rotalarına dönüş
  (`/giris`, `/kayit`, ...) bu fonksiyonda reddedilir.
- Var olan `donus` değerini **olduğu gibi bir sonraki auth sayfasına
  taşıyorsan** (ör. `/giris` → `/giris/parola` yöntem değişimi),
  `guvenliDonusYolu` GEREKMEZ — bu bir yeniden inşa değil, saf aktarımdır;
  sanitizasyon zaten navigasyonun sonunda (gerçek hedefe geçerken) bir kez
  uygulanır. Aktarım mekanizması: `AuthFormPage`'in ikincil bağlantıları
  `search={(onceki) => onceki}` ile TanStack Router'ın mevcut search'ünü
  aynen ileri taşır — elle `donus` okuyup yeniden yazmaz.
- Sonuç: `AuthFormPage` üzerinden render edilen HER ikincil bağlantı,
  hangi sayfaya gidiyor olursa olsun `donus`'u kaybetmeden taşır. Bunu bozan
  hatalar (Finding 1, 2026-07-31 denetimi) canlı tarayıcıda "hesabım →
  giriş → yöntem değiştir → giriş → yanlış yere düş" olarak ortaya çıkar;
  unit test bunu YALNIZ `href` assertion'ıyla yakalar (bkz. `GirisPage.test.tsx`
  — "yöntem değiştirilirken donus parametresi kaybolmaz").

**Rota dosyası adlandırma tuzağı:** TanStack Router file-based routing'de
noktalı ad (`giris.kod.tsx`) rotayı `/giris`'in ÇOCUĞU yapar; ebeveyn
bileşende `<Outlet/>` yoksa yanlış sayfa render edilir. `/giris` altındaki
kardeş rotalar bu yüzden `_` sonekiyle yazılır: `giris_.kod.tsx`,
`giris_.parola.tsx`, `giris_.hata.tsx` — repo örneği zaten `routes/`
altında. **Unit testler bunu yakalamaz** (kendi düz route tree'lerini
kurarlar, gerçek `routeTree.gen.ts`'i kullanmazlar) — yalnız gerçek
tarayıcıda `/giris/kod` gibi bir adresi açıp doğru `h1`'i görmek yakalar.
Yeni bir `/giris/*` kardeşi eklerken bu adımı atlama.

**Ölü buton yasağı:** bağlanamayan rota (henüz yazılmamış sayfa) için
`disabled` link YAZILMAZ — link satırı tamamen kaldırılır ve kaldırma
noktasına hangi faz'da geri geleceğini belirten Türkçe yorum bırakılır
(bkz. `GirisPage.tsx`, `GirisParolaPage.tsx`).

## 8. İçerik kuralları

- Kullanıcıya görünen her metin Türkçe; hata mesajları adapter'dan gelir ve
  aynen gösterilir (yeniden yazılmaz).
- İkincil bağlantı etiketleri eylem fiiliyle başlar ("Parola ile giriş
  yapın", "Numarayı değiştirin").
- Kod alanı bilinçli olarak tek `<input>` — altı kutulu desen ekran okuyucu
  ve SMS otomatik doldurmayı bozduğu için kullanılmaz.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| Sayfa | background/color | `--lg-bg`, `--lg-label` | Tema |
| Form/Status yüzeyi | radius | `--lg-radius-card` | N/A |
| Kontrol | height | `--lg-control-md` | Coarse pointer 44px |
| Hata/alert | renk | `--lg-danger`/`--lg-label` (tema token'ı) | N/A |
| Focus | outline | `--lg-focus-ring-width`, `--lg-focus-ring-offset` | Yalnız `:focus-visible` |

Raw px/hex borcu yoktur.

## 10. Storybook kapsamı

Bu bir sayfa/akış katmanı olduğu için ayrı bir `GlassX.stories.tsx` yoktur;
kapsam `pages/*.tsx` içindeki sayfa component'lerinin kendi story
dosyalarında (varsa) veya route-seviyesi görsel denetimde karşılanır. Yeni
bir arketip tüketicisi eklerken en az: Default, hata durumu, mobil (390px)
ve erişilebilirlik (`AuthAccessibility.test.tsx`e yeni satır) kapsanmalı.

## 11. Test kabul kriterleri

- Her form sayfası: tek `h1`, her input `label`+`autocomplete` taşır, kod
  alanı tek input (`AuthAccessibility.test.tsx`).
- Her auth sayfası (form + durum): tam olarak bir `main` landmark taşır;
  hata tonunda `alert` her zaman `main` değil, açıklama paragrafı üzerinde.
- `useKorumaliRota` kullanan her `/hesabim/*` rotası: oturumsuzken
  `/giris?donus=...`'a yönlendirdiğini kanıtlayan bir test taşır (bkz.
  `hesabim.test.tsx`, `hesabim_.mesajlar.test.tsx`).
- `donus`, ikincil bağlantılardan geçerken kaybolmaz (href assertion).
- `guvenliDonusYolu`: açık yönlendirme payload'ları (protokol-bağıl,
  ters-bölü kaçışı, kodlanmış varyantlar, auth rotalarına dönüş) ana sayfaya
  düşer.
- Ölü bağlantı yok: henüz yazılmamış hedefe (`/kayit`, `/parola-sifirla`)
  giden link render edilmediğini kanıtlayan `queryByRole('link', ...)` ===
  `null` testi.

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

**Do**

- Yeni bir auth ekranı eklerken önce §1'deki üç arketipten hangisinin
  uyduğuna karar ver; dördüncüsünü yazma.
- İkincil bağlantı listesini `AuthFormPage`'e bırak — search aktarımı orada
  merkezi.
- `donus`'u yalnız `guvenliDonusYolu` üzerinden hedefe çevir.

**Don't**

- `role="alert"`/`role="status"`'ü `main`'e koyma — açıklama paragrafına koy.
- Bağlanamayan rotaya link bırakma; `disabled` link de yazma, satırı kaldır.
- `giris_.*` dışında `/giris` kardeşi için noktalı rota dosyası adı kullanma.
- `donus`'u elle string birleştirerek yeniden inşa etme — mevcut değeri
  `search={(onceki) => onceki}` ile taşı, yeni değeri `guvenliDonusYolu` ile
  üret.

Bilinen kısıt: `AuthCallbackPage` (OAuth dönüş ekranı) henüz hiçbir rotaya
bağlı değil — Faz sonrası Google girişiyle birlikte gelir; o zamana kadar
yalnız component testleriyle korunur. Açık karar: kayıt (Faz 2) ve parola
sıfırlama (Faz 3) `AuthFormPage` üzerine kurulacak, yeni arketip
gerekmeyecek.

Changelog: 2026-08-01 — Faz 0/1 giriş akışının final incelemesinde eksik
`rules.md` tamamlandı; `donus` aktarım mekanizması, rota adlandırma tuzağı ve
landmark sözleşmesi belgelendi (Finding 5).
