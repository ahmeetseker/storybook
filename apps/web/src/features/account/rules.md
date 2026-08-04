---
name: AccountWorkspace
category: içerik
status: hazır
lastReviewed: 2026-08-02
---

# AccountWorkspace Kuralları

## 1. Amaç

Hesap kimliğini, öncelikli gündemi ve temel operasyon özetlerini sakin,
aksiyon-öncelikli bir `/hesabim` çalışma alanında birleştirir. Ayrıntılı ilan
yönetimi, mesajlaşma veya güvenlik ayarı yerine geçmez; gerçek rotalara
yönlendirir.

**Kendi kabuğunu kuran BÖLÜM.** `/hesabim` tek bir sayfa değil, kalıcı kabuklu
bir alt uygulamadır. Kabuk (`AccountAppShell`) **layout rotasındadır**
(`routes/hesabim.tsx`); alt sayfalar onun `Outlet`'inde açılır:

| Rota | Sayfa |
|---|---|
| `/hesabim` | Hesap özeti (`AccountWorkspace`) |
| `/hesabim/ilanlarim` | İlanlarım |
| `/hesabim/mesajlar` | Mesajlar (`MessagesWorkspace`) |
| `/hesabim/guvenlik` | Güvenlik ve doğrulama |
| `/hesabim/hareketler` | Hesap hareketleri |
| `/hesabim/kayitli-arama` | Kayıtlı arama |
| `/hesabim/odemeler` | Ödemeler (yöntemler + işlem geçmişi) |
| `/hesabim/faturalarim` | Faturalarım (dönem gruplu faturalar + fatura bilgileri) |

Rota değişince kabuk yeniden kurulmaz: ray, üst şerit ve daraltma durumu
korunur, yalnız içerik alanı değişir. Her sayfa kendi `main`'ini
(`PageContainer`, `shellInsets={false}`) üretir; kabuk `main` üretmez —
pazar yeri kabuğu gizli olduğu için yüzen header/dock payı da ayrılmaz.

**Tam yükseklik modu.** Gezinme haritasında `fillsViewport: true` işaretli
sayfalar (şu an yalnız Mesajlar) kabuğun kalan yüksekliğini kaplar: kabuk
kökü `data-account-shell="fill"` alır, sayfa kaydırması kapanır ve kaydırma
sayfanın kendi panellerine (konuşma rayı, mesaj listesi) devredilir. Bu modda
sayfa başlığı da kompaktlaşır — konum izi zaten üst şeritte aynı bilgiyi
veriyor.

Gezinme haritasının tek kaynağı `domain/account-navigation.ts`'tir — ray,
konum izi ve komut paleti aynı listeden beslenir.

Pazar yeri kabuğu (GlassSiteHeader + GlassDock) bu bölümde render EDİLMEZ
(`MarketplaceShell` istisna listesi: `create-listing`, `account`, `messages`).
Gezinme iki katmandan gelir:

| Katman | Geniş kapsayıcı (> 64rem) | Dar kapsayıcı |
|---|---|---|
| `AccountNav` (GlassSidebar, flat + `density="compact"`) | Sol yapışkan ray; üst şeritten daraltılıp ikon-only moda geçer | Gizli — "Hesap menüsünü aç" düğmesiyle `GlassDrawer` |
| Üst şerit (`AccountTopbar`) | Ray daraltma + konum izi + ⌘K arama + tema | Hamburger + güncel adım + arama ikonu + tema |

Site header'ı gizlendiği için tema anahtarı ve siteye dönüş yolu (ray
alt bölgesindeki "Siteye dön") bu kabuğun sorumluluğundadır.

## 2. Semantik sözleşme

- Her mod aynı tek `<main id="main-content">` kökünü üretir.
- Kabuk parçaları içerik değildir: ray `nav[aria-label="Hesap bölümleri"]`,
  üst şerit `header`, konum izi `nav[aria-label="Konum"]`. Hiçbiri başlık
  (`h1`–`h6`) üretmez — sayfanın tek `h1`'i kimlik bölümündedir.
- Ray daraltıldığında etiketler yalnız GÖRSEL olarak gizlenir; erişilebilir ad
  ve `aria-current` korunur.
- Bölümlerin görselleri `components/AccountSections.module.css` dosyasındadır;
  `AccountWorkspace.module.css` yalnız kabuk, ızgara ve durum ekranlarını
  tanımlar.
- Hazır ve yeni hesap modlarında tek `h1` vardır; bölüm başlıkları `h2`, kart ve
  gündem başlıkları `h3` kullanır.
- `session-expired` hiçbir kişisel veri veya hazır bölüm çizmez.
- Linkler TanStack Router `Link` bağlamı gerektirir; portal kullanılmaz.
- DOM sırası ile mobil görsel sıra aynıdır.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Identity | Evet | Avatar, ad, rol, doğrulama, primary action | İlk bölüm, tek primary |
| Attention | Hayır | En fazla üç gündem maddesi | Boşsa çizilmez |
| Metrics | Evet | Dört hesap göstergesi | Flat içerik |
| Listings + Security | Evet | 8:4 kolon grubu | Dar container'da aynı sırayla tek kolon |
| Activity + Saved search | Activity evet | 8:4 kolon grubu | Kayıtlı arama yoksa sağ bölüm çizilmez |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `data` | prop | `AccountDashboardData` | Yok | Evet | Normalize hesap verisi |
| `mode` | prop | `AccountWorkspaceMode` | Domain resolver | Evet | Çalışma alanı modu |

Ref hedefi ve event sözleşmesi: N/A — component imperative ref veya event
üretmez; alt linkler router navigasyonu yapar.

## 5. Seçenek eksenleri

Görsel variant ekseni yoktur. Tema token bağlamından gelir. `mode`, görsel
variant değil veri/erişim state'idir. Hover, focus ve active prop olamaz.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| `session-expired` | `mode` | Tüm kişisel ve hazır içerik | Tek h1 |
| `restricted` | `mode` | Hazır bölümler | Tek h1 |
| `loading` | `mode` | Kişisel ve hazır içerik | `main[aria-busy=true]` |
| `new-account` | `mode` / resolver | Dolu liste içerikleri | Role uygun boş durum |
| `ready` | `mode` / resolver | — | Semantik başlık sırası |
| section error | `sectionErrors` | Yalnız eşleşen bölüm | Yerel alert |

Öncelik domain resolver sözleşmesidir:
`session-expired > restricted > loading > new-account > ready`.

## 7. Davranış

- Tek primary action role göre yalnız gerçek `/emlak` veya `/ilan-ver` rotasına
  gider.
- Route'u olmayan kontrol çizilmez; `AccountAction` yalnız `kind: 'route'`
  kabul eder.
- Attention listesi domain ve component sınırında en fazla üç öğedir.
- Section error yalnız kendi section anahtarıyla eşleşir; sağlam bölümler
  render edilmeye devam eder.
- `identity` section error'ı ad, avatar, doğrulama durumları ve primary
  aksiyonu bastırır; yalnız adlandırılmış kimlik bölgesi içindeki yerel alert
  görünür.
- Klavye sırası DOM sırasını izler; layout görsel yeniden sıralama kullanmaz.

## 8. İçerik kuralları

- Durumlar yalnız renkle anlatılmaz; doğrulama ve ilan state'leri görünür Türkçe
  metin taşır.
- Uzun ad, kurum ve açıklamalar sarılır; anlamlı metin kesilmez.
- Desteklenmeyen listing state burada eşlenmez veya yeniden adlandırılmaz;
  adapter katmanında elenir.
- Oturum süresi dolduğunda ad, metrik, ilan, etkinlik ve kayıtlı arama görünmez.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| Page | renk / zemin | `--lg-label`, `--lg-bg` | Tema |
| Sections | zemin / border / radius | `--lg-surface`, `--lg-hairline`, `--lg-stroke-hairline`, `--lg-radius-card` | Reduced transparency |
| Layout | gap / padding | `--lg-space-*` | Dar container |
| Type | boyut / renk | `--lg-text-*`, `--lg-label-secondary`, `--lg-accent` | Tema |
| Controls | min hedef | `--lg-control-md` | Coarse pointer |

Raw değer borcu yoktur. Brief tarafından tanımlanan `88rem`, `64rem` ve `40rem`
yerleşim/container ölçüleri token seçeneği değil sayfa geometrisidir. Outer
padding ile Dock + safe-area rezervi container'ın sorgulanabilir child'ı olan
frame'de yaşar; state yüzeyi genişliği ayrı geometri üretmeden
`calc(88rem / 2)` ile ana eksenden türetilir.

## 10. Storybook kapsamı

`Default`, `AliciHesabi`, `IslemGerekiyor`, `YeniHesap`, `Loading`,
`PartialError`, `Restricted`, `UzunIcerik`, `Mobile390`, `Tablet768`, `Kagit`,
`Grafit`, `Erisilebilirlik`, `SessionExpired` senaryoları vardır. `SessionExpired`
yalnız demo state'tir; üretimdeki `/hesabim` rotası bu modu üretmez.

## 11. Test kabul kriterleri

- Unit: tek main/h1/primary/local glass, mod izolasyonu, heading sırası, loading,
  role empty state, yerel error, attention sınırı ve route tipi.
- Interaction: primary bağlantı gerçek router context içinde klavyeyle odaklanır.
- Visual: 88rem eksen, 8:4 kolon grupları, 390 ve 768 container görünümleri,
  Kağıt/Grafit.
- A11y: tek main, sıralı başlıklar, metinsel statüler, `aria-busy`, focus-visible.

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

**Do**

- Tek primary ve tek local glass yüzeyi koru.
- Section error'ları yerel tut.
- Mobilde DOM sırasını aynen koru.

**Don't**

- Gerçek route olmadan button, switch veya sahte kontrol ekleme.
- Cam üstüne cam ya da flat içerik bölümlerinde cam kullanma.
- Desteklenmeyen listing state'i semantik olarak eşleme.
- Session expired görünümünde kişisel veri çizme.

Bilinen kısıt: Workspace ayrıntılı hesap ayarı veya veri yenileme davranışı
sunmaz. Ray daraltma tercihi kalıcı değildir (oturum içi state).

Açık karar: `/hesabim/mesajlar` henüz bu kabuğun içine alınmadı — o rotada
pazar yeri header'ı ve dock'u görünmeye devam ediyor; hesap bölümünün tamamı
tek kabuğa taşınacak mı, karar bekliyor.

Changelog:
- 2026-08-03 — Hesap özetine performans bölümü (`AccountInsightsPanel`:
  görüntülenme/mesaj/favori/harcama grafikleri) eklendi; Ödemeler ve
  Faturalarım sayfaları açıldı. Veri sözleşmesi `AccountInsights` +
  `AccountBilling` ile genişletildi (ikisi de opsiyonel; yoksa ilgili bölüm
  boş durum çizer). Ödemelerden faturaya `#fatura-<no>` çapasıyla geçilir.
- 2026-08-03 — Hesap alanı kalıcı kabuklu alt uygulamaya dönüştü: kabuk layout
  rotasına (`AccountAppShell`) taşındı, bölümler ayrı sayfa oldu
  (`ilanlarim` · `guvenlik` · `hareketler` · `kayitli-arama`), Mesajlar da
  kabuğun içine alındı (`/hesabim/mesajlar`), gezinme haritası
  `domain/account-navigation.ts`'te tek kaynağa indi.
- 2026-08-02 — `/hesabim` kendi kabuğunu kuran panoya dönüştü: pazar yeri
  header/dock gizlendi, sol ray (`AccountNav`, kompakt + daraltılabilir), üst
  şerit (konum izi + ⌘K komut paleti + tema), bölüm görselleri
  `AccountSections.module.css`'e ayrıldı.
- 2026-07-27 — Enterprise hesap genel bakış sözleşmesi oluşturuldu.
