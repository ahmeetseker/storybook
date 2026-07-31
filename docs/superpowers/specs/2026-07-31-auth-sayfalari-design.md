# Tasarım — Kimlik doğrulama sayfaları (apps/web)

**Tarih:** 31 Temmuz 2026 · **Dal:** `feature/glass-sidebar`
**Girdi:** Kullanıcının sunduğu jenerik SaaS auth route haritası (21 sayfa) + Arsam ürün gerçekleri
**Kapsam:** `apps/web` — gerçek uygulama. Storybook katmanındaki eski auth sayfaları (`src/pages/Giris.tsx` vb.) bu spec'in kapsamı dışında; emeklilikleri ayrı bir iştir.

---

## 1. Neden

`apps/web`'de **hiç kimlik doğrulama yok.** `config/routes.ts`'te tek bir giriş/kayıt/oturum rotası, kodda tek bir session yönetimi yok. `/hesabim` doğrudan açılıyor ve kullanıcı bilgisi `ACCOUNT_FIXTURES.default` sabitinden geliyor. İlan verme, favoriler, mesajlar — hepsi kimliksiz çalışıyor.

Storybook katmanında dört auth sayfası var (`Giris`, `Kayit`, `SifreSifirla`, `HesapDogrula`) ama bunlar `PublicShell` ile çalışan, tamamı inline-style'lı vitrin sayfaları; gerçek uygulamaya bağlı değiller ve UI/UX denetiminde "CSS lint'ten yapısal olarak muaf gölge stil sistemi" olarak işaretlenen katmanda duruyorlar.

## 2. Kararlar ve gerekçeleri

| Karar | Seçim | Gerekçe |
|---|---|---|
| Hedef katman | `apps/web` | Ürün oraya gidiyor; gerçek uygulamada auth hiç yok |
| Rota dili | **Türkçe** | Mevcut rotaların tamamı Türkçe (`/emlak`, `/ilan-ver`, `/hesabim`); `/login` karışım olurdu |
| Kapsam yaklaşımı | **B — haritaya birebir sadakat** | Kullanıcı seçimi. Her durum derin linklenebilir ve analitikte ayrı ölçülür |
| B'nin riski nasıl kapatılıyor | **21 rota, 3 arketip** | Tek-cümlelik sayfa dosyaları yazılmaz; durum sayfaları tek bileşenden prop'la türer |
| Kimlik yöntemleri | Telefon+SMS OTP · e-posta+parola · magic link · Google | Kullanıcı dördünü de seçti |
| Kurumsal | Hesap tipi seçimi + EİDS | Üründe karşılığı var (ilan sihirbazı rolleri, `HesapDogrula`) |
| Ekip daveti / organizasyon seçimi | **Kapsam dışı** | Üründe çok kiracılık kavramı yok. Haritadaki `/invite/:token` ve `/select-organization` düşürüldü |
| Oturum altyapısı | Adapter deseni + context | Backend yok; `listing-create-adapters.ts` ile aynı desen |

**Harita ile ayrışmalar.** Verilen harita jenerik SaaS için yazılmıştı. Üç yerde Arsam'a uyarlandı: (1) telefon/SMS OTP eklendi — Türkiye emlak pazaryerlerinin fiili standardı ve `/hesabim`'da zaten "Telefon: doğrulandı" rozeti var; (2) EİDS doğrulaması eklendi — ilan verme akışının çekirdeği; (3) davet ve organizasyon seçimi çıkarıldı.

## 3. Route haritası

**21 rota: 10 form · 8 durum · 3 callback.**

### Giriş ve yöntemler

| Sayfa | Rota | Arketip |
|---|---|---|
| Giriş (yöntem seçimi) | `/giris` | Form |
| Telefon kodu doğrulama | `/giris/kod` | Form |
| Parola ile giriş | `/giris/parola` | Form |
| Bağlantı gönderildi | `/giris/baglanti-gonderildi` | Durum (info) |
| Bağlantı doğrulanıyor | `/giris/baglanti/dogrula` | Callback |
| Bağlantı geçersiz veya süresi dolmuş | `/giris/baglanti/gecersiz` | Durum (error) |
| Google ile giriş işleniyor | `/giris/google/dogrula` | Callback |
| Genel kimlik hatası | `/giris/hata` | Durum (error) |

### Kayıt ve hesap kurulumu

| Sayfa | Rota | Arketip |
|---|---|---|
| Kayıt (bireysel / emlak ofisi) | `/kayit` | Form |
| Profil bilgilerini tamamla | `/kayit/profil` | Form |
| Kurumsal başvuru | `/kayit/kurumsal` | Form |
| Bu hesap zaten var | `/kayit/hesap-var` | Durum (info) |
| EİDS doğrulama | `/hesap/dogrula` | Form |

### Parola

| Sayfa | Rota | Arketip |
|---|---|---|
| Parolamı unuttum | `/parola-sifirla` | Form |
| Yeni parola belirle | `/parola-sifirla/yeni` | Form |
| Sıfırlama başarılı | `/parola-sifirla/tamam` | Durum (success) |
| Parola değiştir (oturum içi) | `/hesabim/parola` | Form |

### Erişim ve hesap durumu

| Sayfa | Rota | Arketip |
|---|---|---|
| Oturum süresi doldu | `/oturum-suresi-doldu` | Durum (info) |
| Yetkisiz erişim | `/yetkisiz` | Durum (error) |
| Hesap askıya alınmış | `/hesap/askida` | Durum (error) |
| Yeni e-posta adresini doğrula | `/hesabim/e-posta-dogrula` | Callback |

### Rota yapısındaki iki karar

**`/hesabim/*` korumalı, geri kalanı açık.** `/hesabim/parola` ve `/hesabim/e-posta-dogrula` kök seviyede değil (haritada `/change-password` kökteydi), çünkü bunlar oturum *gerektiren* sayfalar. Kök seviyedeki auth rotaları oturumu *olmayan* kullanıcı içindir. Ayrım, rota korumasını tek kuralla yazılabilir yapar.

**Callback'ler `/giris` altında,** ayrı bir `/auth` kökünde değil — uygulamada başka hiçbir yerde İngilizce rota segmenti yok.

## 4. Mimari

### 4.1 Üç arketip

**`AuthFormPage`** — başlık, açıklama, form alanları (children), tek birincil eylem, ikincil bağlantı satırı, hata bölgesi. Alan seti dışarıdan gelir; sayfa yalnız kompozisyon yapar.

**`AuthStatusPage`** — `tone: 'info' | 'success' | 'error'` ekseni. Prop'ları: `tone`, ikon, başlık, açıklama, birincil eylem, ikincil bağlantı. Sekiz durum sayfasının tamamı bu bileşenin farklı içerikleridir; ayrı sayfa dosyası yazılmaz.

**`AuthCallbackPage`** — dış sağlayıcıdan dönüşü işler. Üç durumu var:
- `pending` → spinner + "Doğrulanıyor" (`role="status"`)
- `success` → hedefe yönlendir
- `error` → ilgili `AuthStatusPage` rotasına yönlendir

Zaman aşımı (10 sn) da hata dalına düşer. Kullanıcı burada asla takılı kalmaz.

### 4.2 Kabuk

Auth sayfaları **`MarketplaceShell` kullanmaz.** O kabuk yüzen ada header + 10 ikonlu dock taşır; oturumu olmayan kullanıcıya "Favorilerim", "Karşılaştır", "Mesajlar" göstermek anlamsızdır ve sayfa başına 6 cam yüzey bütçesinin üçte birini harcar.

**`AuthShell`:** logo (ana sayfaya döner) + ortalanmış içerik sütunu + altta yasal bağlantılar. Cam yüzey yok — düz yüzey, `PageContainer size="narrow"` içinde.

### 4.3 Oturum modeli

Backend yok. Projede kurulu **adapter desenini** izler (`listing-create-adapters.ts` ile birebir aynı yaklaşım):

```
auth-adapters.ts
  girisBaslat(yontem, kimlik)   → kod gönderimi / link gönderimi / OAuth yönlendirmesi
  koduDogrula(kod)              → oturum | hata
  oturumuGetir()                → oturum | null
  cikisYap()                    → void
```

Bu turda in-memory + `sessionStorage` ile fixture döner. Gerçek API geldiğinde **yalnız bu dosya** değişir; hiçbir sayfa dokunulmaz.

Oturum durumu bir React context'te tutulur ve `/hesabim/*` rotalarını korur. Oturumsuz kullanıcı `/hesabim`'a gelirse `/giris?donus=/hesabim`'a yönlendirilir; giriş sonrası **geldiği yere döner**. `donus` parametresi olmadan giriş yapan kullanıcı ana sayfaya gider.

`donus` parametresi yalnız **uygulama içi mutlak yol** kabul eder (`/` ile başlayan, `//` ile başlamayan). Dış URL'ler yok sayılır — açık yönlendirme açığı bırakılmaz.

## 5. Tasarım sistemi sözleşmesi

UI/UX denetiminde (`docs/ui-ux-denetim-2026-07-30.md`) bulunan kusurları yeni sayfalarda tekrarlamamak için bağlayıcı:

- **Ölü buton yok.** Backend'e bağlanamayan her eylem `disabled` + görünür gerekçe ile çıkar. Uygulamada şu an 12+ ölü buton var; bunlara 21 sayfa daha eklenmez.
- **Placeholder sayfa yok.** Yazılmayan sayfa rotaya bağlanmaz. (`/blog` bu kuralın ihlal edildiği mevcut örnek.)
- **`--lg-text-display` (28px) kullanılmaz.** Sayfa başlığı `--lg-text-title` (22px), bölüm başlığı `--lg-text-headline` (17px). Ölçek Dalgası 1'in kuralı.
- Kontrol yükseklikleri `--lg-control-*`'tan gelir; dekoratif öğede veya layout ölçüsü olarak kullanılmaz.
- Raw px/hex yok — yalnız `--lg-*` tokenları.
- Breakpoint yerine `pointer: coarse` / `hover: hover` yetenek sorguları.
- Her component `CLAUDE.md` konvansiyonunu izler: `.tsx` + `.module.css` + `.stories.tsx` + `.test.tsx` + `rules.md` + `index.ts`.

## 6. Erişilebilirlik

- Her sayfada tek `<h1>` ve `<main>` landmark.
- Hata bölgeleri `role="alert"`; ilerleme duyuruları `aria-live="polite"`.
- **OTP alanı tek `<input>`** — altı ayrı kutu değil. Altı kutulu desen yapıştırmayı, ekran okuyucu deneyimini ve SMS otomatik doldurmayı bozar. `inputmode="numeric"` + `autocomplete="one-time-code"` + `maxlength="6"` tek alanda hepsini doğru yapar.
- `autocomplete` öznitelikleri zorunlu: `tel` · `one-time-code` · `email` · `current-password` · `new-password`. Eksikse şifre yöneticileri ve SMS otomatik doldurma çalışmaz.
- Focus halkası yalnız `:focus-visible`, `outline: var(--lg-focus-ring-width) solid var(--lg-accent)`.
- Dokunmatikte min 44px hedef (`@media (pointer: coarse)`).
- Rota değişiminde `<main>`'e focus taşınır — SPA gezinmesi ekran okuyucuya duyurulur. (Uygulamada şu an hiç focus yönetimi yok; auth bunu doğru kuran ilk alan olur.)

## 7. Test yaklaşımı

**Domain:** `auth-adapters` ve oturum reducer'ı için birim testleri — yöntem seçimi, kod doğrulama, oturum yaşam döngüsü, `donus` parametresi doğrulaması (dış URL reddi dahil).

**Sayfa:** her sayfa için render + doğrulama testi (vitest + testing-library).

**Akış (entegrasyon):** üç kritik yol —
1. Giriş → OTP → `donus` parametresine yönlendirme
2. Korumalı rotaya oturumsuz erişim → `/giris?donus=…` → giriş → geri dönüş
3. Süresi dolmuş magic link → hata durum sayfası

**Erişilebilirlik geçidi:** `AuthAccessibility.test.tsx` — projede `ListingDetailAccessibility.test.tsx` deseni var, aynısı kurulur. Sayfa içi bağlantı hedefleri, `autocomplete` öznitelikleri, heading hiyerarşisi ve landmark'lar denetlenir.

## 8. Uygulama sırası

**Faz 0 — Temel.** `auth-adapters.ts`, oturum context'i + `/hesabim/*` koruması, `AuthShell`, üç arketip bileşeni, `donus` parametresi doğrulaması. Faz 0 bitmeden hiçbir sayfa yazılmaz — arketipler hazır olmadan sayfa yazmak, B yaklaşımının kaçınmak istediği tekrar riskini geri getirir.

**Faz 1 — Giriş yolu.** `/giris`, `/giris/kod`, `/giris/parola`, `/giris/baglanti-gonderildi`, `/giris/baglanti/gecersiz`, `/giris/hata`.

**Faz 2 — Kayıt yolu.** `/kayit`, `/kayit/profil`, `/kayit/kurumsal`, `/kayit/hesap-var`, `/hesap/dogrula`.

**Faz 3 — Parola ve erişim durumları.** `/parola-sifirla`, `/parola-sifirla/yeni`, `/parola-sifirla/tamam`, `/oturum-suresi-doldu`, `/yetkisiz`, `/hesap/askida`.

**Faz 4 — Oturum içi ve callback'ler.** `/hesabim/parola`, `/hesabim/e-posta-dogrula`, `/giris/baglanti/dogrula`, `/giris/google/dogrula`.

Callback'ler sona bırakılır: gerçek sağlayıcı bağlanmadan yalnız ekran akışı olarak kurulacakları için, önce sağlam bir yönlendirme hedefi kümesinin var olması gerekir.

## 9. Bu spec'in kapsamadıkları

- Gerçek kimlik sağlayıcı entegrasyonu (SMS gateway, e-posta gönderimi, Google OAuth istemcisi) — adapter arayüzü hazır bırakılır, bağlanması ayrı iştir.
- Storybook katmanındaki eski auth sayfalarının (`src/pages/Giris.tsx` vb.) emekliye ayrılması.
- Ekip daveti ve organizasyon seçimi — üründe karşılığı yok.
- Oturum güvenliği (token yenileme, CSRF, oran sınırlama) — backend kararıdır.
- Mevcut `/hesabim` sayfasının fixture kullanıcıdan gerçek oturuma geçirilmesi — Faz 0'ın koruması kurulduktan sonra ayrı bir adım.
