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
| `ustSerit` | `AuthFormPage` | `ReactNode?` | Hayır | Başlığın ÜSTÜNDE duran şerit (çok adımlı ilerleme göstergesi) |
| `aksiyonlar` | `AuthFormPage` | `(durum) => ReactNode` | Hayır | Varsayılan tek gönder butonunun yerine geçer; `{ hidrasyonTamam }` verilir (bkz. §15) |
| `adimlar`/`aktifIndeks`/`onAdimSec` | `KayitAdimSeridi` | — | Hayır | İlerleme şeridi; yalnız TAMAMLANAN adım tıklanabilir |
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
  `hesabim.test.tsx`, `hesabim.mesajlar.test.tsx`).
- `donus`, ikincil bağlantılardan geçerken kaybolmaz (href assertion).
- `guvenliDonusYolu`: açık yönlendirme payload'ları (protokol-bağıl,
  ters-bölü kaçışı, kodlanmış varyantlar, auth rotalarına dönüş) ana sayfaya
  düşer.
- Ölü bağlantı yok: henüz yazılmamış hedefe (`/parola-sifirla`) giden link
  render edilmediğini kanıtlayan `queryByRole('link', ...)` === `null` testi.
  (`/kayit` Faz 2 ile birlikte yazıldı ve `GirisPage`'deki "Hesap oluşturun"
  bağlantısı geri eklendi — artık bu listede değil.)

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

Changelog: 2026-08-01 — Faz 2 (kayıt) bağlandı: `/giris`'teki "Hesap
oluşturun" bağlantısı geri eklendi, beş yeni rota `auth-routes.test.tsx`
smoke testine katıldı, erişilebilirlik geçidi genişletildi, uçtan uca
`kayit-flow.test.tsx` eklendi. Bkz. §13.

Changelog: 2026-08-01 — Faz 2'nin final incelemesinde altı bulgu
giderildi: `guvenliDonusYolu` oturum gerektiren `/kayit/*`/`/hesap/*`
sayfalarını artık dönüş hedefi olarak kabul ediyor (Finding 1);
`components/KorumaliSayfa.tsx` ile hidrasyon uyuşmazlığı tek yerden
çözüldü (Finding 2, bkz. §14); `KayitPage`/`KayitKurumsalPage` alan
hataları `aria-invalid`/`aria-describedby` taşıyor ve başarısız gönderimde
ilk hatalı alana odaklanıyor (Finding 3, `domain/form-erisilebilirlik.ts`);
son tip-güvensiz `navigate` çağrısı düzeltildi (Finding 4); `kayit_.
kurumsal.tsx`/`hesap.dogrula.tsx` diğer auth rotalarıyla aynı
`validateSearch`'ü aldı (Finding 5).

Changelog: 2026-08-02 — `/kayit` tek uzun formdan dört adımlı akışa
çevrildi (bkz. §15): `domain/kayit-adimlari.ts` (adım/alan eşlemesi + hata
süzgeci), `components/KayitAdimSeridi.tsx` (ilerleme şeridi + adım sayacı),
`AuthFormPage`'e `ustSerit` ve `aksiyonlar` slotları eklendi. Doğrulama
mantığı (`kayitBilgileriniDogrula`) ve gönderim/yönlendirme dalları
değişmedi. `/kayit/profil` ve `/kayit/kurumsal` aynı şeridi devam eden adım
olarak gösteriyor. Testler adım adım gezinen `kayitAdimlariniDoldur`
(`test-utils.ts`) yardımcısına taşındı.

## 13. Kayıt sözleşmesi (Faz 2)

**Beş yeni sayfa:**

| Sayfa | Rota | Oturum gerekir mi |
|---|---|---|
| `KayitPage` | `/kayit` | Hayır — hesabı bu sayfa açar |
| `KayitProfilPage` | `/kayit/profil` | Evet (*) |
| `KayitKurumsalPage` | `/kayit/kurumsal` | Evet |
| `HesapVarPage` (`kayitDurumSayfalari.tsx`) | `/kayit/hesap-var` | Hayır — durum sayfası |
| `HesapDogrulaPage` | `/hesap/dogrula` | Evet |

Oturum gerektiren üçü kendi içeriklerini `components/KorumaliSayfa.tsx`
sarmalayıcısına sarar; bu sarmalayıcı `useKorumaliRota` çağrısını VE
hidrasyon-güvenli bekleme bayrağını tek yerde toplar (bkz. §14) — sayfalar
kendi `useKorumaliRota`/`girisYapildi` kopyalarını çağırmaz. Oturumsuzken
`KorumaliSayfa` `null` döner — bunları test ederken (`AuthAccessibility.
test.tsx` gibi) **oturumlu** bir sahte adapter (`test-utils.ts` →
`sahteAuthAdapters({ oturumuGetir: () => oturum })`) kullanılmazsa test
hiçbir şey sınamaz, render boş kalır.

(*) `/kayit/profil` teknik olarak deep-link edilebilir ve oturumlu bir
kullanıcı doğrudan adresi ziyaret ederse çalışır, ama şu an HİÇBİR akıştan
ona giden bir link yok — `kayitYap` her zaman tam bir profil döndürür
(`adSoyad`/`ePosta` doludur), bu yüzden Faz 2 akışı bu sayfaya hiç uğramaz.
İleride "eksik profil" senaryosu eklenirse (ör. telefonla hızlı kayıt) bu
not kaldırılır ve sayfaya giden gerçek bir bağlantı eklenir.

**Alan doğrulaması:** `domain/kayit-dogrulama.ts`
(`kayitBilgileriniDogrula`, `kurumsalBasvuruyuDogrula`) yalnız anında
kullanıcı geri bildirimi içindir — **sunucu doğrulamasının yerine geçmez**.
Gerçek backend geldiğinde adapter'ın döndürdüğü hata kodları (`eksik-alan`,
`hesap-zaten-var`, `eids-reddedildi`) nihai karardır; istemci doğrulaması
yalnız gecikmeyi azaltır.

**Hesap tipi dallanması:** `KayitPage`'in İLK ADIMINDAKİ `fieldset`/`legend`
ile gruplanmış radio (bireysel/kurumsal) akışı belirler. Bireysel → `kayitYap`
başarılı olunca doğrudan `donus` hedefine (`guvenliDonusYolu` ile). Kurumsal
→ `kayitYap` sonrası `/kayit/kurumsal`'a (bu geçiş `donus`'u taşımaz —
kurumsal başvuru kendi akışını sürdürür); başvuru başarılı olunca
`/hesap/dogrula`'ya.

**EİDS kapsam ayrımı:** `/hesap/dogrula` **hesap seviyesinde** yetki
doğrulaması kurar (`Oturum.eidsDurumu`) — kurumsal hesabın taşınmaz ticareti
yetkisini bir kez doğrular. `listing-create` içindeki EİDS adımı **ilan
özeldir** ve bu durumu okur ama ayrı bir akıştır; ikisi çakışmaz, hesap
seviyesi doğrulama ilan akışının ön koşuludur.

**Faz 3 notu:** `/parola-sifirla` geldiğinde `HesapVarPage`'e ("Bu hesap
zaten var") parola sıfırlamaya giden bir ikincil bağlantı eklenmeli —
şu an kullanıcının tek seçeneği "Giriş yapın".

## 14. Korumalı sayfa hidrasyon deseni

Oturum `sessionStorage`'dan okunur — sunucu bunu göremez. Bir sayfa
`girisYapildi`'e göre doğrudan dallanırsa (`if (!girisYapildi) return null`),
sunucu HER ZAMAN `null` render eder ama istemci hidrasyon ANINDA (henüz
`useEffect` çalışmadan — `AuthSessionProvider`'ın `useState(() =>
adapters.oturumuGetir())` lazy initializer'ı `sessionStorage`'ı senkron
okur) oturumluysa dolu ağaç üretir. Bu, React'in "Hydration failed"
hatasına yol açar: sunucu ve istemcinin hidrasyon eşleştirmesi yapılan İLK
render'ı farklıdır, React sunucu ağacını atıp yeniden render eder.

Çözüm `components/KorumaliSayfa.tsx`: `AuthFormPage`'in gönder butonunda
kullandığı `hidrasyonTamam` deseniyle aynı — bayrak sunucuda VE istemcide
ilk render'da `false` başlar, yalnız mount SONRASI `useEffect` `true` yapar.
Bu bayrak `false` olduğu sürece hem sunucu hem istemci AYNI şeyi (`null`)
render eder; mount sonrası gerçek `girisYapildi` değeriyle sıradan bir
istemci re-render'ı (hidrasyon değil) tetiklenir. `useKorumaliRota` da bu
sarmalayıcı içinde TEK yerde çağrılır.

Oturum gerektiren yeni bir sayfa eklerken içeriği `<KorumaliSayfa>` ile
sarmala; kendi `useKorumaliRota()`/`if (!girisYapildi) return null` kopyanı
yazma — aynı hidrasyon hatasını yeniden üretirsin.

## 15. Çok adımlı kayıt (`/kayit`)

`/kayit` tek uzun form değildir; dört adımlı bir akıştır. Adım tanımları
`domain/kayit-adimlari.ts`'te; şerit `components/KayitAdimSeridi.tsx`'te.

| # | Adım | Alanlar |
|---|---|---|
| 1 | Hesap tipi | `hesapTipi` (radyo kartları) |
| 2 | Kimlik | `adSoyad`, `ePosta` |
| 3 | İletişim ve güvenlik | `telefon`, `parola` |
| 4 | Onay | özet + `kvkkOnayi` |

**Doğrulama tek kaynaktan gelir.** `kayitBilgileriniDogrula` DEĞİŞMEZ ve her
"Devam et"te TAM olarak çalışır; adım sözleşmesi yalnız sonucu SÜZER
(`adimHatalari(hatalar, adim)`). Kullanıcı henüz görmediği bir adımın
hatasını duymaz. Son adımda tam hata kümesine bakılır; bir hata kalmışsa
`hataliAdimIndeksi` ile o adıma geri dönülür. `alanHatalari` state'i her
zaman YALNIZ görünür adımın hatalarını taşır — bu yüzden
`ilkHataliAlanaOdaklan` tüm alan sırasıyla çağrılsa bile daima görünür
adımın ilk hatasına odaklanır. Adım eklerken/alan taşırken doğrulamaya
dokunma, yalnız `KAYIT_ADIMLARI` eşlemesini güncelle
(`kayit-adimlari.test.ts` her doğrulama alanının tam olarak bir adıma
düştüğünü sınar).

**Odak ve duyuru.** Adım değişimi ve hata odağı ancak yeni adım DOM'a
yazıldıktan sonra uygulanabilir; bu yüzden odak render sırasında değil bir
"bilet" state'i üzerinden `useEffect`'te taşınır (adım başlığı `h2`
`tabIndex={-1}`, hata durumunda ilk hatalı alan). "Adım N / M: …" satırı
`aria-live="polite"` taşır — duyuruyu yapan odak değil bu satırdır.

**Gezinme.** İleri gitmek yalnız doğrulamadan geçen "Devam et" ile olur;
şeritte SADECE tamamlanan adımlar butona dönüşür (ileri adım tıklanamaz,
devre dışı buton da yazılmaz — düz metin kalır). "Geri" ilk adımda pasiftir
ve girilen değerleri korur.

**Şerit devam sayfalarında sürer.** `kayitSeridi(dal)` dalın tam listesini
üretir: `/kayit` 4 adım, `/kayit/profil` 5 adım (5. adım aktif),
`/kayit/kurumsal` 6 adım (5. adım aktif, 6. adım `/hesap/dogrula`). Bu iki
sayfanın form mantığı değişmedi; yalnız `AuthFormPage`'in `ustSerit`
slotunu doldururlar.

**`aksiyonlar` slotu ve hidrasyon.** Çok adımlı akış varsayılan tek gönder
butonunu `aksiyonlar` ile değiştirir. Slot `{ hidrasyonTamam }` alır ve
BUNU KULLANMAK ZORUNDADIR: hidrasyon öncesi tıklama native form gönderimine
düşer ve `donus` sessizce kaybolur (bkz. `AuthFormPage` içindeki uzun not).

**Görsel sözleşme.** Adım kartı FLAT'tır ve hesap panosundaki bölüm kartıyla
aynı ölçüyü taşır (`--lg-surface`, hairline, `--lg-radius-card`,
`--lg-space-5`) — sınıf ithal edilmez, `KayitPage.module.css` kendi
eşdeğerini yazar. Cam yalnız kontrol katmanındadır (gezinme `GlassButton`'ları).
Adım geçişi `motion/react` ile yalnız `opacity` + `x`; `useReducedMotion()`
doğruysa geçiş kapanır. Şeritteki durum renkten bağımsız da okunur
(✓ işareti, sıra numarası, `aria-current="step"`, görsel-gizli durum metni).
