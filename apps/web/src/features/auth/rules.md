---
name: Auth (features/auth)
category: navigasyon
status: hazır
lastReviewed: 2026-08-04
---

# Auth Kuralları

## 1. Amaç

`features/auth` iki katman sağlar: (1) oturum durumu ve rota koruması
(`AuthSessionProvider`, `useAuthSession`, `useKorumaliRota`), (2) giriş akışının
**üç yeniden kullanılabilir sayfa arketipi** (`AuthFormPage`, `AuthStatusPage`,
`AuthCallbackPage`) + adapter sözleşmesi (`AuthAdapters`) + güvenli dönüş yolu
yardımcı fonksiyonu (`guvenliDonusYolu`). Kayıt (Faz 2) ve parola sıfırlama
(İP-2, bkz. §16) tek tek yeni component yazmaz — bu üç arketipin üzerine
kurulur; parola sıfırlamanın beş sayfası da mevcut arketiplerden çıktı.
Sayfa-özel iş kuralı (validasyon, adapter çağrısı) `pages/*.tsx` içinde kalır;
arketipler yalnız iskelet ve semantik sağlar.

**Hangi arketip ne zaman:**

| Arketip | Kullanım | Örnek |
|---|---|---|
| `AuthFormPage` | Kullanıcıdan girdi istenen her ekran | Telefon/kod/parola girişi, ileride kayıt formu |
| `AuthStatusPage` | Form olmayan, tek mesajlı sonuç ekranı (info/success/error) | "Bağlantı gönderildi", "Bağlantı geçersiz", genel hata |
| `AuthCallbackPage` | Dış sağlayıcıdan (ör. Google) dönüşü karşılayan bekleme/hata ekranı | `/giris/google/callback` (İP-6'da bağlandı; 2026-07-31'den beri rotasız bekliyordu) |

`AuthShell` bunların hiçbiri değildir — sayfa değil, üst kabuktur (bkz. §2).

## 2. Semantik sözleşme

- **Landmark sözleşmesi:** her arketip kendi `<main id="main-content">`
  kökünü üretir; `AuthShell` (`components/AuthShell.tsx`) `main` SAĞLAMAZ,
  yalnız masthead/footer çerçevesi ve iki kolonlu düzeni çizer. Bu bilinçli
  bir bölünme: kabuk ve sayfa aynı anda `main` üretirse iç içe iki landmark
  oluşur.
- **Marka paneli erişilebilirlik ağacında YOKTUR.** `AuthBrandPanel`
  (kabuğun sağ kolonu) `aria-hidden="true"` taşır ve içinde `h*` KULLANMAZ.
  Gerekçe: panelin taşıdığı hiçbir bilgi formu doldurmak için gerekli değil;
  ağaçta bırakmak ekran okuyucu kullanıcısını giriş alanına ulaşmadan önce
  üç paragraf dinlemeye zorlardı — görsel kullanıcının bir bakışta atladığı
  şeyi. Başlık öğesi kullanılmamasının sebebi ayrıca dayanıklılık: gizli bir
  başlık ağacı, panel ileride görünür hâle getirilirse sayfanın `h1`'ini
  ikiye çıkarır. `AuthShell.test.tsx` ikisini de sınar.
- **Explicit `role`, elementin implicit rolünü ezer.** Bir HTML elementine
  konan `role` (`alert`, `status` vb.) o elementin varsayılan ARIA rolünün
  yerini alır — silinmez, üstüne eklenmez. `<main role="alert">` artık `main`
  landmark'ı olarak GÖRÜNMEZ, yalnız `alert` olarak görünür. Bu yüzden
  `role="alert"`/`role="status"` **asla köke** (`main`/`AuthFormPage`'in
  formu) konmaz; her zaman mesajı taşıyan `<p>`'ye konur. 2026-07-31 tarihli
  denetimde `AuthStatusPage`/`AuthCallbackPage` bu kuralı `main` üzerinde
  ihlal etmişti (bkz. Changelog). `AuthCallbackPage`'de bu ihlal 2026-08-04'e
  kadar SÜRDÜ ve fark edilmemesinin iki sebebi vardı: sayfa erişilebilirlik
  geçidindeki `TUM_SAYFALAR` dizisinde yoktu, üstelik `authArketipleri.test.tsx`
  bozuk şekli doğruluyordu (`getByRole('status')` main'in kendisiydi). İkisi de
  düzeltildi — yeni bir arketip eklerken geçit dizilerine EKLEMEYİ unutma,
  yoksa kural test edilmiyor demektir.
- Form hataları `AuthFormPage` içinde `role="alert"` ile duyurulur (kaynak:
  `hata` prop'u), durum sayfalarında `AuthStatusPage`'in `aciklama`
  paragrafı taşır.
- Linkler TanStack Router `Link` gerektirir; portal yoktur.

## 2b. Kabuk düzeni (bölünmüş auth)

`AuthShell` geniş ekranda iki kolondur: solda dekoratif marka paneli, sağda
form sütunu. Düzen KABUKTA durur, sayfalarda değil — `/giris`, `/kayit`,
`/kayit/kurumsal`, parola sıfırlama ve davet akışlarının tamamı aynı kabuğu
tükettiği için tek yerde tanımlanır ve her sayfa görünümü otomatik alır.

- **Kırılma noktası `64rem`.** Altında panel `display: none` — mobilde
  dekoratif bir blok formu ekranın altına iterdi, o yüzden yığılmaz,
  KALDIRILIR. Marka zaten masthead'de duruyor.
- **Panel yapışkandır** (`position: sticky` + `align-self: start`).
  `/kayit/kurumsal` gibi uzun formlarda sütun ekran boyunu kat kat aşıyor;
  panel grid hücresini doldursaydı binlerce piksellik bir degrade olur ve
  aşağı inildiğinde marka tamamen kaybolurdu. `align-self: start` olmadan
  grid öğesi hücreyi gerer ve `sticky` hiç çalışmaz.
- **Form sütunu KART DEĞİLDİR** (`--lg-bg` üzerinde durur). `KayitPage` ve
  `KayitKurumsalPage` kendi adım kartlarını (`--lg-surface` + hairline)
  çiziyor; sütuna da yüzey vermek kart içinde kart üretirdi. Bölünme zaten
  soldaki dolu panelle okunuyor.
- **Görsel sıra CSS `order` ile kurulur, DOM ile değil.** Kaynak sırası form
  → panel olarak kalır: "içeriğe atla" bağlantısından sonra klavye ve ekran
  okuyucu önce forma varmalı, dekoratif panelin rozetleri arkada kalmalı.
  `order` kuralı `64rem` sorgusunun İÇİNDEDİR — altında panel zaten yok.
- **Marka, içerik ve footer aynı ölçüyü paylaşır** (`.formIc`, `30rem`) —
  hepsi tek bir sol kenara hizalanır. Ölçü 26rem'den 30rem'e çıkarıldı:
  kurumsal başvurunun altı adımlık dış şeridi dar sütunda sıkışıyordu.
- **Panel cam DEĞİLDİR.** Dolu bir yüzeydir, `backdrop-filter` taşımaz ve
  sayfa başına 6 cam yüzey bütçesinden düşmez. YEDEK zemini (WebGL yoksa,
  bkz. §2c) `--lg-accent` üzerine iki kez `--lg-scrim` bindirilerek
  türetilir; böylece accent token'ı değiştiğinde
  kendiliğinden takip eder ve üstündeki metin için `--lg-on-scrim` token
  çiftinin kontrast sözleşmesi geçerli olur. Panele ayrı bir koyu renk
  TANIMLANMAZ.
- **Tipografi ölçeği aşmaz.** Referans tasarımların 50-70px başlıkları
  alınmadı: `--lg-text-display` (28px) bu sistemde marka/hero tavanıdır ve
  aşmak tip ölçeğini çatallardı. Kademelendirme `GlassHero`'daki desenin
  aynısıdır: `clamp(var(--lg-text-title), Nvw, var(--lg-text-display))`.
- **Panelin zemini animasyonlu bir grain-gradient shader'ıdır**
  (`AuthGrainGradient`, WebGL2 + `ogl`). Ayrıntı için §2c.

## 2c. Marka panelinin grain-gradient zemini

Panelin arka planı `AuthGrainGradient` component'idir: siyah → kor →
canlı accent → sıcak parlama rampası üzerinde yavaşça salınan iki yumuşak
kütle, bant sınırları piksel piksel bozularak "taranmış" bir doku üretir.

- **Kaynak ve lisans.** Fragment shader, Paper Design'ın açık kaynak
  `@paper-design/shaders` paketindeki `grain-gradient` uyarlamasıdır
  (Apache-2.0); atıf `AuthGrainGradient.tsx` başlığında durur. Paket
  bağımlılık olarak EKLENMEDİ — projede zaten `ogl` var
  (`src/demo/GradientBlinds.tsx`), ikinci bir WebGL çalışma zamanı taşımanın
  karşılığı yok. Yalnız kullanılan dal (`corners`) taşındı; rastgelelik
  önceden hesaplanmış bir gürültü dokusu yerine prosedürel `hash21`den
  gelir (panel için ek ikili varlık indirtmemek adına) ve sizing
  uniform'ları (fit/scale/offset/rotation) atıldı — panel her zaman kabı
  kaplar, kısa kenar `[-0.5, 0.5]` aralığına eşlenir.
- **Renk yine TEK kaynaktan gelir.** Shader rampası `--lg-accent`
  token'ından türetilir (`grain-rampasi.ts`): token'ın hex değeri okunur,
  OKLCH'e çevrilir ve rampa accent'in TONUNU koruyup ışıklık/kromayı kendi
  eğrisinden kurar. Accent doğrudan degrade olarak kullanılamaz — metin
  kontrastı için seçilmiş koyu bir amberdir (#7c3806) ve panel çamur rengi
  bir bloğa dönerdi. Gamut dışına taşan kroma KIRPILMAZ, ton korunarak
  azaltılır; kanal kırpmak turuncuyu sarıya kaydırırdı.
- **Rampa dekoratiftir, kontrast sözleşmesi taşımaz.** Metnin
  okunabilirliğini `.perde` katmanı sağlar: `--lg-scrim` panelin üst ve alt
  bandını koyulaştırır, orta bant açık kalır. Bu yüzden destek metni ve
  rozetler TEK grupta (`.taban`) toplanır — ayrı flex çocukları olsalardı
  `space-between` destek metnini perdenin dışına, panelin ortasına bırakırdı.
- **Animasyon CSS motion kuralının dışındadır** (yalnız
  transform/opacity/filter). Gerekçe: hareket DOM'da değil, kendi kendine
  yeten bir GPU yüzeyinde olur — düzen ya da boyama tetiklemez. Karşılığında
  döngü ÜÇ sebeple durur ve durduğunda tek kare çizilir:
  `prefers-reduced-motion`, sekmenin görünmezliği (`visibilitychange`) ve
  panelin görüntü alanı dışına çıkması (`IntersectionObserver` —
  `/kayit/kurumsal` sütunu ekranı kat kat aşıyor).
- **Yedek yol zorunludur.** WebGL2 kurulamazsa (eski tarayıcı, GPU engelli,
  bağlam kaybı, SSR ilk kare) component hiç DOM üretmez ve `.panel`in CSS
  degradesi görünür kalır. `prefers-reduced-transparency` altında canvas ve
  perde tamamen gizlenir, panel tek dolu accent zemine iner.
- **DPR 1.5'te kırpılır.** Grain doldurma maliyeti piksel başınadır;
  retinada 2x çizmek görsel kazanç sağlamaz. Grain CSS pikseline kilitlenir
  — cihaz pikseline bağlansaydı yüksek yoğunluklu ekranda dokusu görünmez
  hâle gelirdi.

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
| `cozum` (`OturumCozumu`) | `useAuthSession()` | Korumalı sayfa içeriği | `useKorumaliRota` yönlendirme |
| hidrasyon öncesi | `AuthFormPage` iç `useState` | Gönder butonu etkin | `disabled` |
| `gonderiliyor` | Sayfa-özel | Gönder butonu etkin | `loading` |
| `hata` | Sayfa-özel adapter sonucu | — | `role="alert"` |
| `hataAnahtari` | Sayfa-özel gönderim sayacı | — | `role="alert"` düğümünü `key` ile yeniden taktırır |
| `tone: error` | `AuthStatusPage`/`AuthCallbackPage` prop | — | Açıklama paragrafında `role="alert"` |

**Oturum boolean DEĞİL, üçlüdür** (`domain/auth-types.ts` → `OturumCozumu`):
`bilinmiyor` · `anonim` · `kimlikli`. `girisYapildi` hâlâ okunabilir ama
yalnız `kimlikli`'de `true` döner — `bilinmiyor` da `false` verir, bu yüzden
yönlendirme/koruma kararlarında ASLA `girisYapildi` kullanma, `cozum.durum`
kullan. Gerekçe için §14.

**Tekrarlanan hata duyurusu:** `setHata(undefined)` ve `setHata(ozet)` aynı
tick içinde çağrılırsa React ikisini toplar, DOM değişmez ve canlı bölge
sessiz kalır — kullanıcı ikinci kez "Devam et"e bastığında hiçbir şey
duymaz. Doğrulama yapan sayfalar bu yüzden her gönderimde artan bir
`hataAnahtari` geçirir; `AuthFormPage` onu `role="alert"` düğümünde `key`
olarak kullanır ve düğüm yeniden takılır.

## 7. Davranış

**Adapter sözleşmesi:** her sayfa `AuthAdapters` arayüzünü tüketir
(`girisBaslat`, `koduDogrula`, `parolaIleGiris`, `oturumuCoz`, `cikisYap`).
Sayfa component'leri porta yazılır; gerçek API bağlanırken onlara
dokunulmaz. Yeni bir giriş yöntemi eklerken adapter'a yeni bir metot eklemek
yerine mevcut `girisBaslat(yontem, kimlik)` imzasını genişletmeyi tercih et
— sayfa tarafında switch/case çoğaltma.

> **Düzeltme (2026-08-04):** Burada eskiden "gerçek API bağlanırken YALNIZ
> `data/auth-adapters.ts` değişir" yazıyordu. Bu doğru değildi: oturumun ilk
> okuması senkron (`oturumuGetir()`) olduğu sürece gerçek bir cookie/sunucu
> oturumu bağlanamıyordu, çünkü provider'ın `useState` lazy initializer'ı
> senkron bir değer bekliyordu. İP-1 bu okumayı router'ın `beforeLoad`'una
> taşıdı ve portu `oturumuCoz(): Promise<OturumCozumu>` yaptı. `oturumuGetir`
> **deprecated**'dir; yalnız fixture içi kullanım ve testler için duruyor,
> İP-5'te (gerçek HTTP adapter) kaldırılacak.

**Test sahtesi:** `AuthAdapters` mock'unu ELLE KURMA — `test-utils.ts`'teki
`sahteAuthAdapters()` kullan. Üç sayfa testi kendi kopyasını `as AuthAdapters`
cast'iyle kuruyordu; cast eksik metodu derleme zamanında gizlediği için
arayüze `oturumuCoz` eklendiğinde hepsi ÇALIŞMA ZAMANINDA patladı.
`sahteAuthAdapters` verilmeyen `oturumuCoz`u `oturumuGetir`den türetir.

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

Changelog: 2026-08-04 — İP-0 (borç kapatma) + İP-1 (oturum modeli & guard);
plan: `docs/auth-eksikler-plani-2026-08-04.md`.

*İP-0:* `AuthCallbackPage`'in `role="status"`'u `main`'den açıklama
paragrafına taşındı ve sayfa erişilebilirlik geçitlerine eklendi (bozuk
şekli doğrulayan assertion da düzeltildi). Doğrulama yapan sayfalara
`hataAnahtari` eklendi — tekrarlanan aynı hata artık yeniden duyuruluyor.
`AuthFormPage`'in `gonderEtiketi`/`aksiyonlar` ikilisi ayrık birleşime
çevrildi (adsız submit butonu artık derleme hatası). `AuthShell` skip-link
aldı; "Yardım" etiketi hedefiyle uyumlu olacak şekilde "Blog" oldu;
`/giris` meta açıklamasından var olmayan Google vaadi çıkarıldı; iki
`.srOnly` bloğu `--lg-stroke-hairline`'ı kutu ölçüsü olarak kullanmayı
bıraktı. **Magic link akışı silindi** (karar K1): iki rota, iki durum
sayfası, adapter'ın `baglanti` dalı ve `GirisYontemi`'ndeki `'baglanti'`.

*İP-1:* Oturum boolean'dan `OturumCozumu` üçlüsüne (`bilinmiyor` · `anonim`
· `kimlikli`) geçti. İlk okuma provider'ın `useState` lazy initializer'ından
router'ın `__root.beforeLoad`'una taşındı; port `oturumuCoz(): Promise<…>`
oldu (`oturumuGetir` deprecated). `RouterContext` artık `adapters` + `oturum`
taşıyor. Yeni `korumaliRotaGuard` `/hesabim`, `/kayit/profil`,
`/kayit/kurumsal`, `/hesap/dogrula` ve (ilk kez korunan) `/ilan-ver`
rotalarına bağlandı. `/hesabim` ve `/hesabim/mesajlar`'daki kopya inline
guard'lar silindi; `KorumaliSayfa`'daki `hidrasyonTamam` bayrağı üçlü durum
sayesinde gereksizleşti. `KayitProfilPage`'in formu `ProfilFormu` iç
bileşenine taşındı (oturumdan seed edilen alanlar guard'ın içinde kurulmalı).

*Kapsam dışı bırakıldı:* `Oturum.gecerlilikSonu` alanı İP-6'ya ertelendi —
bugün okuyucusu yok, eklemek altı test fixture'ını gereksizce değiştirirdi.
`/favoriler` korunmadı: anonim kullanıcının yerel favori tutup tutamayacağı
ürün kararı. KVKK/kullanım koşulları linkleri eklenemedi — `/kvkk` ve
`/kullanim-kosullari` sayfaları ve metinleri henüz yok.

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

**Kurumsal başvurunun zorunlu alanları işletme türüne bağlıdır.**
`isletmeTuru` (`sahis` · `limited` · `anonim` · `sube`) sonraki kuralları
belirler ve bu yüzden ilk bölümdedir:

- **Vergi numarası** tüzel kişide tam 10 hane; şahıs işletmesinde 10 hane
  (VKN) **veya** 11 hane (TCKN). Bu ayrım kozmetik değil: emlak ofislerinin
  büyük bölümü şahıs işletmesidir ve vergi levhasında TCKN taşır — yalnız
  10 haneyi kabul eden eski kural onları başvuru dışında bırakıyordu.
- **MERSİS / ticaret sicil / KEP** tüzel kişide zorunlu, şahısta isteğe
  bağlı; girilirse biçim yine aranır.
- **Sorumlu emlak danışmanı + MYK Seviye 5 belgesi** her türde zorunludur —
  yetki belgesi ancak Seviye 5 belgeli bir sorumlu danışman varsa düzenlenir,
  yani bu alanlar yetki belgesinin yasal ön koşuludur.
- **Belge geçerlilik tarihleri** (`yetkiBelgesiBitis`, `mykBelgeBitis`)
  bugünden ileri olmalıdır. Saklanmalarının sebebi form doğrulaması değil:
  süresi dolan işletmenin ilan yayınlama yetkisi düşer ve bu tarih olmadan
  platform bunu kendiliğinden uygulayamaz.
- **`il` serbest metin DEĞİLDİR** (`domain/iller.ts`): değer ilan aramasının
  il filtresini besler, yazım farkları filtreyi sessizce eksik sonuç
  döndürtürdü.
- **`iysOnayi` doğrulanmaz.** Ticari elektronik ileti izni açık rıza
  gerektirir; hizmetin koşulu yapılamaz. `kvkkOnayi` ve `temsilBeyani`
  zorunludur.

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

## 14. Korumalı sayfa deseni — İKİ katman

Oturum `sessionStorage`'dan okunur; sunucu onu göremez. Buradaki tuzak,
"oturum yok" ile "oturum henüz bilinmiyor"un boolean'da aynı değere (`false`)
çökmesiydi: sunucu `null` render ediyor, istemci hidrasyon anında dolu ağaç
üretiyor ve React "Hydration failed" veriyordu.

`OturumCozumu` üçlü durumu bunu modelin kendisinde çözer. Koruma iki
katmandan oluşur ve İKİSİ DE paylaşılan koddan gelir:

| Katman | Nerede | Ne zaman korur |
|---|---|---|
| `korumaliRotaGuard` | Rotanın `beforeLoad`'u (`domain/auth-guard.ts`) | Render'DAN ÖNCE — `anonim`'de `throw redirect`. İstemci navigasyonlarında ve (İP-5'ten sonra) SSR'da. |
| `KorumaliSayfa` | Sayfa ağacı (`components/KorumaliSayfa.tsx`) | Render SIRASINDA — yalnız `kimlikli`'de çocukları çizer; `useKorumaliRota`'yı TEK yerde çağırır. |

Her ikisi de `bilinmiyor` durumunda **yönlendirmez**. Bu kasıtlıdır: sunucu
oturumu göremediği için `bilinmiyor` döner; orada yönlendirmek oturumu OLAN
kullanıcıyı da dışarı atardı. Kesin cevap hidrasyondan sonra gelir.

Oturum gerektiren yeni bir sayfa eklerken:

1. Rotaya `beforeLoad: ({ context, location }) => korumaliRotaGuard(context.oturum, location.href)` ekle.
2. Sayfa içeriğini `<KorumaliSayfa>` ile sarmala.
3. Kendi `useKorumaliRota()` / `if (!girisYapildi) return null` kopyanı YAZMA.
   `/hesabim` ve `/hesabim/mesajlar` tam olarak bunu yapıyordu ve
   `hidrasyonTamam` bayrağını atladıkları için hidrasyon hatasını yeniden
   üretiyorlardı — İP-1'de ikisi de paylaşılan katmanlara taşındı.

**Oturumdan seed edilen form alanları `KorumaliSayfa`'nın İÇİNDE kurulmalı.**
`useState(oturum?.ePosta ?? '')` yalnız ilk render'da okunur; oturum artık
asenkron çözüldüğü için dış bileşende kurulan alanlar boş seed edilir ve bir
daha güncellenmez. `KayitProfilPage` bu yüzden formu ayrı bir iç bileşene
(`ProfilFormu`) taşır — o bileşen ancak `kimlikli` durumunda mount olur.

## 15. Çok adımlı kayıt (`/kayit` ve `/kayit/kurumsal`)

İki form da tek uzun sayfa değildir; dörder adımlı akışlardır. Adım
tanımları `domain/kayit-adimlari.ts` (bireysel) ve
`domain/kurumsal-adimlari.ts` (emlak ofisi) içinde; süzgeç mantığı ikisinin
paylaştığı `domain/adim-suzgeci.ts`'te; şerit
`components/KayitAdimSeridi.tsx`'te.

| # | Adım | Alanlar |
|---|---|---|
| 1 | Hesap tipi | `hesapTipi` (radyo kartları) |
| 2 | Kimlik | `adSoyad`, `ePosta` |
| 3 | İletişim ve güvenlik | `telefon`, `parola` |
| 4 | Onay | özet + `kvkkOnayi` |

`/kayit/kurumsal`'ın dört BÖLÜMÜ (§14'teki adlandırma ayrımına bakın):

| # | Bölüm | Alanlar |
|---|---|---|
| 1 | İşletme kimliği | `isletmeTuru` (radyo kartları), `ticaretUnvani`, `vergiNumarasi`, `vergiDairesi`, `mersisNo`, `ticaretSicilNo` |
| 2 | Yetki ve yeterlilik | `yetkiBelgesiNo`, `yetkiBelgesiBitis`, `sorumluDanismanAdSoyad`, `sorumluDanismanTckn`, `mykBelgeNo`, `mykBelgeBitis` |
| 3 | Ofis ve iletişim | `il`, `ilce`, `acikAdres`, `postaKodu`, `ofisTelefonu`, `kepAdresi`, `webSitesi`, `yetkili*` |
| 4 | Onay | özet + `kvkkOnayi`, `temsilBeyani`, `iysOnayi` |

Bölünmenin gerekçesi form uzunluğu değil, alanların FARKLI kaynaklardan
gelmesidir: 1. bölüm vergi levhası ve ticaret sicilinden, 2. bölüm yetki
belgesi ve MYK belgesinden, 3. bölüm ofisin kendisinden okunur. Kullanıcı
her bölümde tek bir belgeye bakar.

**Doğrulama tek kaynaktan gelir.** `kayitBilgileriniDogrula` DEĞİŞMEZ ve her
"Devam et"te TAM olarak çalışır; adım sözleşmesi yalnız sonucu SÜZER
(`adimHatalari(hatalar, adim)`). Kullanıcı henüz görmediği bir adımın
hatasını duymaz. Son adımda tam hata kümesine bakılır; bir hata kalmışsa
`hataliAdimIndeksi` ile o adıma geri dönülür. `alanHatalari` state'i her
zaman YALNIZ görünür adımın hatalarını taşır — bu yüzden
`ilkHataliAlanaOdaklan` tüm alan sırasıyla çağrılsa bile daima görünür
adımın ilk hatasına odaklanır. Adım eklerken/alan taşırken doğrulamaya
dokunma, yalnız `KAYIT_ADIMLARI` / `KURUMSAL_ADIMLARI` eşlemesini güncelle
(`kayit-adimlari.test.ts` ve `kurumsal-adimlari.test.ts` her doğrulama
alanının tam olarak bir adıma düştüğünü sınar — eşlemeye yazılmayan bir
alanın hatası hiçbir adımda gösterilmez ve kullanıcı, sebebini göremediği
bir formu gönderemez hâle gelir).

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
sayfa `AuthFormPage`'in `ustSerit` slotunu doldurur.

**İki numaralandırma bir arada.** `/kayit/kurumsal` dış şeritte tek bir
adımdır ("Adım 5 / 6") ama KENDİ içinde dört bölümlüdür. İki sayaç aynı
sayfada göründüğü için adları bilinçli olarak ayrıştırılmıştır: dış şerit
"Adım N / M", iç şerit "Bölüm N / 4" der. İkisine de "adım" denirse
kullanıcı 4 ile 6 arasında kaybolur. İç şerit `KayitAdimSeridi`'in ikinci
bir örneğidir (`etiket="Başvuru bölümleri"`), aynı gezinme kuralına tabidir:
yalnız TAMAMLANMIŞ bölüm tıklanabilir.

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

**Onay metinleri (WCAG 2.2, 2026-08-13).** Onay adımının andığı hukuki
metinler `components/HukukiMetinler.tsx`'te yaşar ve `GlassModal` ile
açılır. Sözleşme:

- Metin kontrolleri onay kutusunun `<label>`'ına GÖMÜLMEZ — etiket yalnız
  kutuyu adlandırır, kontroller bitişik durur (tıklama çakışması + ad
  şişmesi). Kontroller `<a>` değil `<button>`'dur (hedef dialog'dur, sayfa
  değil) ve `aria-haspopup="dialog"` taşır.
- Hedef ölçüsü `--lg-control-md` (WCAG 2.5.8); odak halkası `:focus-visible`
  ile `--lg-accent`.
- `/kayit` her iki metni, `/kayit/kurumsal` yalnız aydınlatma metnini
  gösterir (kutuları kullanım koşullarını anmaz).
- Parola alanına yapıştırma HİÇBİR yerde engellenmez (WCAG 3.3.8) —
  `AuthAccessibility.test.tsx`'teki WCAG 2.2 geçidi bunların hepsini sınar.

Changelog: 2026-08-13 — WCAG 2.2 denetimi: onay kutusu "okudum,
onaylıyorum" derken metinler hiçbir yere bağlanmıyordu. `components/
HukukiMetinler.tsx` (+ module.css) eklendi: KVKK aydınlatma metni ve
kullanım koşulları TASLAKLARI iki `GlassModal`'da; `KayitPage` ve
`KayitKurumsalPage` onay adımlarına düğmeler bağlandı. Erişilebilirlik
geçidine dört test eklendi (dialog açılışı, odak dönüşü, etikete gömülü
olmama, parola yapıştırma). DS component'lerine dokunulmadı.

## 16. Parola sıfırlama (İP-2)

Beş rota, hepsi `/parola-sifirla` önekinin altında:

| Rota | Bileşen | Rol |
|---|---|---|
| `/parola-sifirla` | `ParolaSifirlaPage` | E-posta ile bağlantı iste |
| `/parola-sifirla/gonderildi` | `AuthStatusPage` (info) | "Gönderdik" |
| `/parola-sifirla/yeni?token=…` | `ParolaYeniPage` | Yeni parolayı belirle |
| `/parola-sifirla/tamam` | `AuthStatusPage` (success) | Başarı |
| `/parola-sifirla/gecersiz` | `AuthStatusPage` (error) | Token geçersiz/süresi dolmuş |

Önek seçimi bilinçli: `authRoutePaths` ve `AUTH_ONEK_REDDI` `/parola-sifirla`'yı
zaten tanıyordu, bu yüzden beş sayfa da otomatik olarak `AuthShell` kabuğunu
alır ve hiçbiri `donus` hedefi olamaz — `config/routes.ts` veya
`auth-session.ts` değiştirilmedi.

**Token yolda değil SORGUDA taşınır** (`?token=`). `/tamam` ve `/gecersiz`
kardeş statik rotalar olduğu için dinamik bir `$token` segmenti onlarla aynı
ad alanını paylaşırdı; statik segment kazanır ama bu kırılgan bir dayanaktır.

**Üç kural:**

1. **Hesap varlığı sızdırılmaz.** `parolaSifirlamaIste` biçimi geçerli HER
   e-posta için başarı döner ve `/gonderildi` metni "kayıtlı bir hesap varsa"
   der. Kayıtlı olmayan adres için hata dönmek bu ucu hesap sayım aracına
   çevirirdi.
2. **Parola kuralı kayıtla ORTAK kaynaktan gelir.** `parolaHatasi()`
   (`domain/kayit-dogrulama.ts`) hem `KayitPage` hem `ParolaYeniPage` hem de
   fixture adapter tarafından tüketilir. Ayrışırsa kullanıcı kayıtta kabul
   edilen parolayı sıfırlamada reddedilmiş bulur.
3. **Token hatası formda gösterilmez.** `gecersiz-token` /
   `token-suresi-doldu` kullanıcının formda düzeltebileceği şeyler değildir;
   sayfa `/parola-sifirla/gecersiz`'e taşır. Token'sız gelen istek rotanın
   `beforeLoad`'unda aynı yere yönlendirilir — form hiç gösterilmez.

## 17. Giriş formlarında alan doğrulaması (İP-3)

`GirisPage`, `GirisKodPage`, `GirisParolaPage` artık kayıt formlarıyla aynı
alan-hatası sözleşmesini uygular: `aria-invalid`, `aria-describedby` →
çözülebilir hata `<p>`'si, ilk hatalı alana odak, artan `hataAnahtari`.
Öncesinde bu üç sayfada sıfır client doğrulaması vardı ve hatalı alan hiç
işaretlenmiyordu — kullanıcı yalnız sayfa üstünde bir özet görüyordu.

**Girişteki parola kuralı kayıttakiyle KASITLI olarak aynı değildir.**
`GirisParolaPage` yalnız "boş mu" denetler; eski parolalar bugünkü kuralı
sağlamayabilir ve girişte reddedilmemelidir. Kural yalnız parola BELİRLERKEN
uygulanır (kayıt, sıfırlama).

**Kodu tekrar gönderme** (`GirisKodPage`) akışın tek kurtarma yoludur:
60 saniyelik geri sayım boyunca buton kapalıdır, kalan süre ve "yeni kodu
gönderdik" bildirimi aynı `aria-live="polite"` bölgesinden okunur.
`cok-fazla-deneme` hatası butonu kalıcı kapatır — geri sayım dolsa bile
açılmaz. Geri sayım sunucuda ve istemcinin ilk render'ında aynı değerle
(`BEKLEME_SANIYE`) başlar; sayaç yalnız efekt içinde işler, hidrasyon uyuşur.

Changelog: 2026-08-04 — İP-2 (parola sıfırlama) + İP-3 (OTP kurtarma, hesap
askıda, giriş doğrulaması). Altı yeni rota: beş parola sıfırlama + 
`/hesap/askida`. Porta dört metot eklendi (`kodTekrarGonder`,
`parolaSifirlamaIste`, `parolaSifirla`); `AuthHataKodu`'na üç kod
(`gecersiz-token`, `token-suresi-doldu`, `cok-fazla-deneme`).
`kayit-dogrulama.ts` tek alanlık doğrulayıcılara ayrıldı (`ePostaHatasi`,
`telefonHatasi`, `parolaHatasi`, `kodHatasi`) — kayıt formu artık onları
birleştiriyor. `GirisParolaPage`'in "parola sıfırlama bağlantısı YOK" testi
tersine çevrildi; `HesapVarPage` ikincil bağlantı olarak sıfırlamaya
bağlandı. Kalan elle kurulan üç adapter mock'u `sahteAuthAdapters`'a taşındı.

## 18. Organizasyon, davet ve sosyal giriş (İP-6)

Sekiz yeni rota. Haritadaki son sayfalar burada kapandı.

| Rota | Bileşen | Koruma |
|---|---|---|
| `/giris/google/callback` | `GoogleCallbackPage` | — |
| `/oturum-suresi-doldu` | `AuthStatusPage` (info) | — |
| `/yetkisiz` | `AuthStatusPage` (error) | — |
| `/davet/$token` | `DavetPage` | guard + `KorumaliSayfa` |
| `/davet/gecersiz` | `AuthStatusPage` (error) | — |
| `/organizasyon-sec` | `OrganizasyonSecPage` | guard + `KorumaliSayfa` |
| `/parola-degistir` | `ParolaDegistirPage` | guard + `KorumaliSayfa` |
| `/e-posta-dogrula` | `EPostaDogrulaPage` | guard + `KorumaliSayfa` |

**Rol modeli GEÇİCİDİR.** `OrganizasyonRolu` (`sahip` · `yonetici` ·
`danisman`) asgari bir modeldir; ürün tarafında tam yetki matrisi tanımlı
değil. Sayfalar rolü yalnız **gösterir**, ona bakarak karar VERMEZ — yetki
kararı sunucunun işidir ve `yetkisiz` hata koduyla döner. Gerçek model
geldiğinde bu tip genişler, sayfalar değişmez.

**`Oturum.organizasyon` opsiyoneldir.** Bireysel hesaplarda ve henüz seçim
yapılmamışken yoktur; zorunlu yapmak altı test fixture'ını gereksizce
değiştirirdi.

**Dördüncü bir sayfa arketipi eklenmedi.** `DavetPage` ve
`OrganizasyonSecPage` form değil ama tek mesajdan da fazla — ikisi de kendi
`<main>`'ini kurup `.davetSayfasi` ölçüsünü paylaşır. Üçüncü bir sayfa aynı
şekli isterse arketipleştirilmeli; iki örnek için erken.

**Yükleme durumu ayrı rota DEĞİL.** Veri çeken üç sayfa (`DavetPage`,
`OrganizasyonSecPage`, `EPostaDogrulaPage`) bekleme ve hata durumlarını
`AuthStatusPage`/`AuthCallbackPage` ile aynı ağaçta çizer. Böylece tek
`main`/tek `h1` sözleşmesi her durumda korunur — erişilebilirlik geçidi bu
sayfaları yükleme durumunda da denetler.

**Google akışı iki parçadır:** yönlendirme `girisBaslat('google', …)` ile
başlar, dönüş `googleGirisiTamamla(kod)` ile karşılanır. Sağlayıcı hatası
(`?error=`) ile bizim hatamız AYRI ele alınır: ilki çoğunlukla kullanıcının
iptali olduğu için sessizce `/giris`'e dönülür, ikincisi gösterilir.

Changelog: 2026-08-04 — İP-6: haritadaki kalan sayfalar (magic link hariç,
K1) fixture adapter üzerine yazıldı. Sekiz rota, yedi yeni port metodu
(`googleGirisiTamamla`, `davetiGetir`, `davetiKabulEt`,
`organizasyonlariGetir`, `organizasyonSec`, `parolaDegistir`,
`ePostaDegisikliginiDogrula`), üç yeni hata kodu (`yetkisiz`,
`oturum-suresi-doldu`, `parola-yanlis`) ve `Organizasyon`/`DavetOzeti`
tipleri. `authRoutePaths`'e dört önek eklendi; `/davet/gecersiz` dönüş reddi
listesine girdi (`/davet/:token` KASITLI olarak girmedi — giriş sonrası meşru
hedef). `AuthCallbackPage` nihayet bir rotaya bağlandı. `/giris`'teki
`.divider` CSS'i sosyal giriş ayracı olarak kullanıma girdi ve meta
açıklaması yeniden Google'ı sayıyor. `AccountAction.to` birliğine
`/parola-degistir` eklendi; güvenlik sayfasındaki aksiyonsuz "parolanızı
değiştirin" tavsiyesi gerçek bağlantı oldu.

## 19. Parola gücü göstergesi (İP-7)

Parola belirlenen üç yerde (`/kayit` 2. adım, `/parola-sifirla/yeni`,
`/parola-degistir`) girdinin altında `components/ParolaGucu` durur.

**Güç ile geçerlilik AYRI kavramlardır.** `parolaHatasi` formun kabul
eşiğidir; gösterge "sağlanabilecek en iyi"nin ölçeğidir. Beş kademenin üçü
zorunlu (uzunluk · büyük harf · rakam), ikisi öneri (12+ karakter · sembol).
Asgariyi sağlayan parola 5 üzerinden 3 alır ve **"Orta"** görünür — kabul
edilen her parolaya "Güçlü" diyen ölçek hiçbir şey ölçmüyor demektir.

**Yüklemler tek yerde: `domain/parola-gucu.ts`.** `kayit-dogrulama.ts`
onları içeri alır (`parolaUzunlukTamam`, `parolaBuyukHarfTamam`,
`parolaRakamTamam`); hata METİNLERİ orada kalır. Ayrışırlarsa kullanıcı
yeşil tikli bir parolayla hata mesajı alırdı — `parola-gucu.test.ts` bunu
örnek kümesi üzerinde kilitler: **zorunluların tamamı sağlandı ⇔
`parolaHatasi` undefined**.

**"Önerilir" işareti zorunludur.** İşaretsiz bir liste, beşi de karşılanması
gereken kural gibi okunur ve kullanıcı gereksiz yere takılır.

**Erişilebilirlik sözleşmesi:**
- Ölçek `role="meter"` — `progressbar` DEĞİL: ilerleme çubuğu biten bir işi
  anlatır, buradaki değer bir ölçümdür.
- Görsel etiket/uyarı `aria-hidden`; bilgiyi `aria-valuetext` ve tek bir
  kibar canlı bölge taşır. Şeritten, renkten ve tiklerden ayrı ayrı duyuru
  çıksa aynı bilgi üç kez dinlenirdi.
- Kural listesi `aria-hidden` **değildir** — canlı bölge yalnız kullanıcı
  yazıp durduğunda konuşur, kurallar ise ilk açılışta okunabilir olmalı.
  Durum her satıra görsel-gizli metinle yazılır.
- Duyuru **700 ms** geciktirilir: her tuşta konuşan bir canlı bölge, parola
  yazan ekran okuyucu kullanıcısının kendi yazdığını duymasını engeller.
- Gösterge girdinin `aria-describedby`'ına **BAĞLANMAZ**. O nitelik alan
  hatasına ayrılmıştır ve erişilebilirlik geçidi tek bir id'ye çözülmesini
  bekler; iki id yazmak `getElementById`'ı null'a düşürüp geçidi kırar.

**Sık denenen kalıp listesi bir güvenlik denetimi değildir.** Türkçe
kullanıcıya göre seçilmiş bir uyarıdır (kulüp adları, `sifre`, `parola`,
klavye dizileri) ve puanı 1'e çeker. Gerçek sızıntı kontrolü — k-anonimlik
ile sızmış parola sorgusu — sunucu işidir, İP-4 API sözleşmesine bırakıldı.

**Renk tek başına anlam taşımaz:** ton (danger/warning/success) her zaman
bir metin etiketiyle ("Çok zayıf" … "Çok güçlü") ve tik/halka biçim farkıyla
birlikte gelir.

Changelog: 2026-08-04 — İP-7: `domain/parola-gucu.ts` + `components/
ParolaGucu`. `KayitPage`'teki statik üç maddelik liste ve iki sayfadaki
"En az 8 karakter, bir büyük harf ve bir rakam." ipucu metni kaldırıldı;
üçü de aynı canlı göstergeyle değişti. `KayitPage.module.css`'ten
`.parolaKurallari` silindi. `parolaHatasi` artık yüklemlerini
`parola-gucu.ts`'ten alıyor. Ayrıca İP-6'dan kalan bir açık kapandı:
`AuthAccessibility.test.tsx` `OturumSuresiDolduPage`, `DavetPage` ve
`OrganizasyonSecPage`'i import ediyor ama hiçbir diziye eklememişti —
yardımcı adapter'lar yazılıp kullanılmadan duruyordu, yani üç sayfa
geçitten hiç geçmiyordu. Üçü de `DURUM_SAYFALARI`'na eklendi.

## 20. Ülke kodlu telefon ve göster/gizle parola alanı

Kayıt formunun "İletişim ve güvenlik" adımı iki alanı da paylaşılan
component'lere devretti: `components/TelefonAlani` ve `components/ParolaAlani`.
İkisi de tek reçeteyi izler — çerçeve ve odak halkası SARMALAYICIDA
(`.grup`), içerideki kontroller çerçevesiz; alan kullanıcı için tek bir
kutudur, iki kontrol taşısa bile.

### 20.1 Telefon: ülke ayrı bir alandır

**Numara ile ülke AYRI saklanır.** `KayitBilgileri.telefon` numaranın
yalnız ULUSAL kısmıdır (`5321234567`), ülke `telefonUlke`'de ISO kodu olarak
durur. Tek metne gömülü ülke kodunu geri ayrıştırmak belirsizdir: `+1` ABD
mi Kanada mı, `+7` Rusya mı Kazakistan mı — ve doğrulama kuralı ülkeye
bağlı olduğu için bu belirsizlik doğrudan yanlış hata mesajına dönüşür.

**Kayıt defteri tek yerde: `domain/telefon-ulkeler.ts`.** Ülke eklemek tek
satırlık bir iştir; başka hiçbir yerde karşılığı yoktur. Liste Türkiye ile
başlar, gerisi ÇALIŞMA ZAMANINDA `localeCompare(…, 'tr')` ile sıralanır —
yeni ülkeyi doğru alfabetik yere elle yerleştirmek gerekmesin diye.

**Operatör ön ek tabloları bilinçli olarak YOK.** O veri sürekli değişir ve
eskidiğinde geçerli numaraları reddeder; asıl doğrulama zaten SMS kodudur.
Kural yalnız hane sayısıdır — Türkiye'de ayrıca hat türü deseni
(`^5\d{9}$`), çünkü hesap bir mobil hatta bağlanır.

**Hata metni ne düzeltileceğini söyler.** Kendi deseni olan ülke kendi
metnini verir (Türkiye: "5XX XXX XX XX biçiminde girin"); diğerlerinde
mesaj hane sayısını VE örnek numarayı taşır ("Almanya numarası 10–11 haneli
olmalı (örn. +49 151 234 567 89)"). "Geçersiz numara" demek kullanıcıya ne
yapacağını anlatmaz. `telefon-ulkeler.test.ts` her ülkenin örnek numarasının
kendi kuralından geçtiğini kilitler — hatalı veri satırı testte patlar.

**Kullanıcı numarasını nasıl yazarsa yazsın kabul edilir.**
`telefonuNormallestir` "0532 123 45 67", "+90 532 123 45 67" ve
"5321234567"yi aynı numaraya indirger; kanonik hâl alandan çıkarken (blur)
uygulanır ve adapter'a da o gider. Arama kodu kesme kuralı KORUMALIDIR:
Kazakistan'ın (+7) numaraları da 7 ile başlar, kör bir kesme geçerli
numaranın ilk hanesini yerdi.

**Seçim NATIVE `<select>`'tir.** Üzerine yalnız bir gösterim katmanı
çizilir; select şeffaflaşır ama YERİNDE durur. Böylece dokunmatikte
platformun kendi ülke listesi açılır, klavyede harfe basınca ülke adına
atlanır ve ekran okuyucu onu normal bir açılır liste olarak duyurur —
`appearance: none` ile kendi listemizi çizmek bunların hiçbirini vermezdi.
Kapalı hâlde ülke ADI değil bayrak + arama kodu görünür ("Birleşik Arap
Emirlikleri" alanın yarısını yer). Zorlanmış renk kiplerinde
(`forced-colors`) gösterim katmanı kalkar, select görünür olur — orada
`opacity: 0` kontrolü gerçekten kaybettirir.

**`autocomplete` bölünür:** numara `tel-national`, seçim
`tel-country-code`. Numara alanına `tel` yazmak, tarayıcının otomatik
doldurmasında ülke kodunu ikinci kez yazdırırdı.

`telefonHatasi(ham, ulkeKodu?)` varsayılanı Türkiye'dir: ülke seçimi
taşımayan çağıranlar (giriş sayfası, ofis/yetkili telefonları) eskisi gibi
davranır.

### 20.2 Parola: göster/gizle

Parolayı görebilmek bir kolaylık değil, hata oranı meselesidir — yazdığını
göremeyen kullanıcı yanlış yazdığını ancak reddedildiğinde anlar. Kayıtta
bu daha da ağır basar: parola ORADA belirlenir, yanlış yazılan bir parola
hesabın kilidini kapatır.

Sözleşme:
- Düğme `aria-pressed` taşır (basılı = parola görünür) ve `aria-controls`
  ile girdiye bağlıdır; erişilebilir adı duruma göre değişir ("Parolayı
  göster" / "Parolayı gizle"). Renk tek başına anlam taşımaz — ikon da
  değişir.
- Düğme **odak sırasındadır**. `tabIndex={-1}` ile sıradan çıkarmak onu
  klavye kullanıcısı için tümden erişilemez yapardı.
- `type` değişse de `autocomplete` sabit kalır: parola yöneticileri alanı
  `text`e dönüştüğünde de tanımaya devam eder. `autocapitalize`/
  `autocorrect`/`spellcheck` kapalıdır — metne dönen parolayı tarayıcının
  düzeltmesi sessizce değiştirebilir.
- Tarayıcının kendi gösterme düğmesi (`::-ms-reveal`) gizlenir; aynı işi
  yapan iki kontrol yan yana durmaz.
- Alan **gizli başlar** ve görünürlük yalnız kullanıcının açık isteğiyle,
  o adım boyunca açılır (component ayrıldığında sıfırlanır).
- Durum kibar bir canlı bölgeyle duyurulur: görme engelli kullanıcı da
  parolasının o an ekranda AÇIKTA olduğunu bilmelidir.

`ParolaGucu` göstergesi `ParolaAlani`'nın `children` yuvasına girer —
girdinin hemen ardında, alan hatasının önünde.

Changelog: 2026-08-04 — `domain/telefon-ulkeler.ts` (+ testi),
`components/TelefonAlani`, `components/ParolaAlani`. `KayitPage`'teki iki
ham `<input>` bu component'lerle değişti; `KayitBilgileri` `telefonUlke`
alanını kazandı ve özet adımı numarayı ülke koduyla gruplayarak gösteriyor
(`+90 532 123 45 67`). `telefonHatasi` artık ülke parametresi alıyor.
**Açık kalan:** `/giris` telefon alanı hâlâ tek `<input>` ve yalnız Türkiye
mobil hattı kabul ediyor — yurt dışı numarasıyla kaydolan kullanıcı SMS
ile giriş yapamaz (parola ile girebilir). Aynı component oraya taşınmalı,
ama `girisBaslat` adapter sözleşmesi kimliği tek string aldığından
E.164'e geçiş ayrı bir iştir.

Changelog: 2026-08-04 — Marka panelinin zemini animasyonlu grain-gradient
shader'ıyla değişti (`components/AuthGrainGradient.tsx`,
`components/grain-rampasi.ts` + testi; sözleşme §2c). Önceki `.isik`
katmanı (yalnız `transform` ile süzülen radial degrade) kaldırıldı —
referans tasarımın taranmış dokusunu üretmiyordu. `.perde` katmanı ve
`.taban` grubu bu değişikliğin gereğidir: shader'ın canlı bandı panelde
gezindiği için metin artık sabit bir koyu bandın üstünde durmalı.
