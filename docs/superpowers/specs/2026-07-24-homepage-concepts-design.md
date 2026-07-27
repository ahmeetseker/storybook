# arsam.net Ana Sayfa Konseptleri Tasarım Spec'i

## Amaç

Mevcut `GlassIslandHeader` ve `GlassDock` kabuğu içinde, Storybook'ta
geliştirilen aynı `@repo/ui` bileşenlerini kullanan beş farklı ana sayfa
konsepti hazırlanacak. Konseptler gerçek TanStack Start rotalarında SSR HTML
üretecek ve kullanıcı `/konseptler` ekranından aralarında geçiş yapabilecek.

Bu çalışma görsel ve ürün yönü seçmek içindir. Kazanan konsept daha sonra `/`
rotasına bağlanacak. Konsept rotaları arama motorlarında indekslenmeyecek.

## Tasarım Okuması

Ürün, arsa alıcısı ve satıcısı için güven odaklı, AI-first ve yüksek işlev
yoğunluklu bir pazaryeridir. Görsel dil Sahibinden'in bilgi zenginliğini
korur, fakat arayüz daha sakin, açıklanabilir ve premium görünür.

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 4`
- `VISUAL_DENSITY: 6`
- Tema: mevcut Kağıt ve Grafit token temaları
- Vurgu: mevcut amber `--lg-accent`
- Tipografi: mevcut Manrope Variable

## Ortak Mimari

`apps/web/src/routes/__root.tsx` içindeki `MarketplaceShell`, Header ve Dock'u
tek kez render etmeye devam eder. Konsept sayfaları yalnız
`<main id="main-content">` gövdesini üretir.

Storybook bileşenleri yalnız `@repo/ui` girişinden import edilir. Bileşen
kopyası veya concept-local Glass component yazılmaz. Sayfa yerleşimleri CSS
Modules ile feature klasöründe tutulur.

```txt
apps/web/src/features/home-concepts/
  concepts.ts
  concepts.test.ts
  fixtures.ts
  ConceptIndexPage.tsx
  ConceptIndexPage.module.css
  shared/
    HomeConceptFrame.tsx
    HomeConceptFrame.module.css
    HomeFooter.tsx
  ai-discovery/
    AiDiscoveryHome.tsx
    AiDiscoveryHome.module.css
  marketplace/
    MarketplaceShowcaseHome.tsx
    MarketplaceShowcaseHome.module.css
  map-first/
    MapFirstHome.tsx
    MapFirstHome.module.css
  trust-first/
    TrustFirstHome.tsx
    TrustFirstHome.module.css
  ai-advisor/
    AiAdvisorHome.tsx
    AiAdvisorHome.module.css
```

Statik TanStack rotaları:

- `/konseptler`
- `/konseptler/ai-kesif`
- `/konseptler/pazar-vitrini`
- `/konseptler/harita-kesfi`
- `/konseptler/guven-merkezi`
- `/konseptler/ai-danisman`

`routeTree.gen.ts` elle değiştirilmez. Route generator tarafından güncellenir.

## Konseptler

### 1. AI Keşif

Ana adaydır. Kullanıcı doğal dille ihtiyacını yazar, AI ayrıştırdığı bağlamı
gösterir ve güven verileriyle birlikte öne çıkan arsalara ulaşır.

Akış:

1. `GlassHero variant="search"` ve `GlassAiSearchBar`
2. `GlassBento` içinde öne çıkan ilan, bölge görünümü ve doğrulama bilgisi
3. `GlassMatchScore` ile kişiye uygun öneri
4. `GlassVitrin variant="banded"` ile ilan akışı
5. `GlassAgencyCard variant="inline"` ile doğrulanmış ofisler
6. `GlassFooter variant="columns"`

### 2. Pazar Vitrini

Sahibinden referansına en yakın, yoğun ve hızlı taranabilen seçenektir.

Akış:

1. Kompakt `GlassHero` ve `GlassAiSearchBar`
2. Gerçek bağlantılardan oluşan kategori rayı
3. `GlassVitrin variant="banded"` ile öne çıkan ilanlar
4. `GlassVitrin variant="ruled"` ile daha geniş katalog
5. `GlassMetricStrip` ve `GlassSavedSearchCard`
6. `GlassFooter variant="slim"`

### 3. Harita Keşfi

Konum ve bölge üzerinden arsa keşfini merkeze alır.

Akış:

1. `GlassHero variant="split"` içinde AI arama ve `GlassMap variant="panel"`
2. Bölge bağlantıları ve bölgesel sayılar
3. `GlassCarousel` içinde `GlassListingCard material="flat"`
4. Karşılaştırmaya geçiş
5. Doğrulanmış ofisler
6. `GlassFooter variant="newsletter"`

`GlassMap` bu prototipte mevcut stilize haritadır. Gerçek MapLibre
entegrasyonu bu çalışmanın kapsamı dışındadır.

### 4. Güven Merkezi

Markanın EİDS, tapu, imar ve açıklanabilir AI farklılaşmasını öne çıkarır.

Akış:

1. `GlassHero variant="centered"` ve arama aksiyonu
2. `GlassMetricStrip`
3. `GlassTrustSignalPanel` ve `GlassAiEvidenceList`
4. Yalnız doğrulanmış ilanlardan `GlassCarousel`
5. `GlassAgencyCard variant="inline"`
6. Satıcı doğrulama CTA'sı ve `GlassFooter variant="cta"`

### 5. AI Danışman

İhtiyaç toplama, öneri üretme ve karşılaştırmaya geçişi ana sayfada görünür
kılar.

Akış:

1. `GlassHero variant="split"` içinde doğal dil araması ve
   `GlassAiAgentActivity`
2. Üç öneri için `GlassListingCard` ve `GlassMatchScore`
3. `GlassAiSummaryCard` ve `GlassAiEvidenceList`
4. Karşılaştırma CTA'sı
5. `GlassVitrin variant="micro"`
6. `GlassFooter variant="columns"`

Sabit `GlassChatDock`, mevcut alt Dock ile çakışacağı için kullanılmaz.

## İçerik ve Görseller

Beş konsept aynı deterministik ilan fixture'ını kullanır. Böylece kullanıcı
tasarım yönünü karşılaştırır, veri farkını değil. İlk turda repo içindeki
deterministik arsa görselleri kullanılır. Görsellerin en-boy oranı markup
içinde korunur ve alt metinleri açıklayıcıdır.

Prototip sayılarda sahte başarı iddiası yapılmaz. Örnek sayılar görünür biçimde
"demo veri" bağlamında sunulur.

## Tasarım Sistemi Sınırları

- Cam yalnız navigasyon ve kontrol katmanında kullanılır.
- Header ve Dock dahil sayfa başına en fazla altı cam yüzey bulunur.
- İçerik kartları flat kullanılır.
- `GlassListingCard` her kullanımda `material="flat"` alır.
- Cam üstüne cam yerleştirilmez.
- Sayfa CSS'i `--lg-*` tokenlarını tüketir.
- Her sayfada tek görünür `h1` ve tek `main` bulunur.
- Masaüstünde navigasyon tek satır kalır.
- Çok sütunlu her bölüm 768px altında tek sütuna veya kontrollü yatay raya
  dönüşür.

## Etkileşim ve Motion

`GlassHero` giriş hareketi yalnız ilk yüklemede hiyerarşiyi anlatır.
Componentlerin mevcut hover, focus ve press davranışları korunur. Yeni sürekli
animasyon eklenmez. `prefers-reduced-motion` mevcut component sözleşmeleriyle
uygulanır.

Arama gönderimleri prototipte `/arsa-ara`, ilan ve karşılaştırma aksiyonları
ilgili mevcut ürün rotalarına gider. Bağlantı semantiğinin mümkün olduğu her
yerde gerçek `href` kullanılır.

## SEO

Konsept rotaları:

- `robots: noindex, nofollow`
- canonical üretmez
- SSR HTML içinde başlık ve açıklama taşır

Kazanan tasarım `/` rotasına taşındığında:

- `home.indexable` açılır
- root seviyesindeki genel `noindex` kaldırılır
- Organization, WebSite SearchAction ve uygun liste schema'ları eklenir
- public ilan kartlarına native `href` sözleşmesi tamamlanır

Bu SEO geçişi ayrı teslimattır.

## Kabul Kriterleri

- `/konseptler` tam beş konsepti gerçek linklerle listeler.
- Altı rotanın tamamı SSR'da doğru `h1` üretir.
- Her konsept mevcut Header ve Dock ile birlikte çalışır.
- Her konsept en az dört farklı Storybook component ailesi kullanır.
- Desktop ve 390px mobil görünümde yatay taşma oluşmaz.
- Açık ve koyu tema okunabilir kalır.
- Axe taramasında critical veya serious ihlal bulunmaz.
- JavaScript kapalıyken index ve en az bir konsept okunabilir HTML üretir.
- Mevcut shell E2E testleri gerilemez.

