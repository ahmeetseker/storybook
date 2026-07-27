---
name: AccountWorkspace
category: içerik
status: hazır
lastReviewed: 2026-07-27
---

# AccountWorkspace Kuralları

## 1. Amaç

Hesap kimliğini, öncelikli gündemi ve temel operasyon özetlerini sakin,
aksiyon-öncelikli bir `/hesabim` çalışma alanında birleştirir. Ayrıntılı ilan
yönetimi, mesajlaşma veya güvenlik ayarı yerine geçmez; gerçek rotalara
yönlendirir.

## 2. Semantik sözleşme

- Her mod aynı tek `<main id="main-content">` kökünü üretir.
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
sunmaz. Açık karar yoktur.

Changelog: 2026-07-27 — Enterprise hesap genel bakış sözleşmesi oluşturuldu.
