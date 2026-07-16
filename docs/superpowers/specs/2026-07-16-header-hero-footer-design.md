# GlassHeader · GlassHero · GlassFooter — Enterprise Varyant Seti

**Tarih:** 2026-07-16
**Durum:** Onaylandı
**Amaç:** Site seviyesi header, hero ve footer alanları için production-ready kütüphane
component'leri. Her component birden fazla tasarım deseni (`variant` ekseni) taşır;
kullanıcı Storybook'taki karşılaştırma story'lerinden nihai deseni seçer.

## Karar ve gerekçeler

- **Tam kütüphane component'i:** CLAUDE.md konvansiyon setinin tamamı
  (`tsx + module.css + stories + test + rules.md + index`) + `src/index.ts` export +
  `ComponentCatalog` kaydı. Sayfa-demo kompozisyonu DEĞİL.
- **Yeni GlassHeader; GlassNavbar korunur:** GlassNavbar iOS tarzı kompakt araç çubuğu
  (geri + başlık + aksiyon) olarak kalır. GlassHeader site seviyesidir: logo, nav
  linkleri, CTA, mobil menü. Sorumluluklar ayrı.
- **Desen başına ayrı component yok:** tek component + `variant` ekseni
  (`EksenlerVeDurumlar.mdx` felsefesi). Birleşik variant yasak; hover/focus/active
  asla prop olmaz.
- **Cam zorunlu değil (kullanıcı kararı):** header dahil hiçbir alan cam olmak
  zorunda değil — site ile uyumlu, ağırlıklı flat görünüm esastır. Header'da
  `material?: 'glass' | 'flat'` ekseni sunulur, **default `flat`**; hero ve footer
  her zaman flat. Cam yalnız istenirse ve yalnız header kapsayıcısında (1 yüzey).
- **Zengin demo içerik (kullanıcı kararı):** karşılaştırma story'leri "içi dolu"
  görünmeli — gerçek ArsaPazar markası, tam nav seti, dolu sütunlar, sosyal
  linkler, rozetler. Boş/placeholder görünüm kabul edilmez.
- **Araştırma referansları:** tek satır bar (Stripe/Linear), yüzen kapsül nav
  (Apple.com), çift katlı utility+nav (IBM/SAP portal), iki katlı ortalanmış logo
  (editorial/lüks marka), minimal landing header'ı; marketplace arama hero'su,
  SaaS split hero, medya showcase hero, merkez CTA hero'su; çok sütunlu enterprise
  footer, slim app footer, CTA bantlı pazarlama footer'ı, ortalanmış kurumsal
  footer, bülten kayıtlı footer.

## Component sözleşmeleri

### 1. GlassHeader (`src/components/GlassHeader/`)

Katman: navigasyon. **Default `material="flat"`** (yüzey: `--lg-surface` + hairline alt
çizgi — site içeriğiyle uyumlu); `material="glass"` opsiyonel (o zaman sayfada 1 cam
yüzey harcar).

```ts
interface GlassHeaderLink {
  label: string
  onClick?: () => void
  href?: string
  active?: boolean          // aria-current="page"
}

interface GlassHeaderProps {
  logo: ReactNode            // marka alanı (metin veya görsel)
  links?: GlassHeaderLink[]
  actions?: ReactNode        // CTA butonları (GlassButton'ları çağıran verir)
  utility?: ReactNode        // yalnız variant="split": üst ince satır içeriği
  variant?: 'bar' | 'centered' | 'split' | 'capsule' | 'minimal'   // default 'bar'
  material?: 'glass' | 'flat'  // default 'flat'
  sticky?: boolean           // default true; position: sticky + scroll-edge
  tone?: 'light' | 'dark' | 'auto'
  /** Mobil menü başlığı — GlassDrawer'a geçer */
  menuLabel?: string         // default 'Menü'
}
```

Beş varyant (yerleşim ekseni — material'den bağımsız):

- `bar` (default): tek satır — logo sol, linkler orta, actions sağ (Stripe/Linear).
- `centered`: iki katlı — üstte ortalanmış logo (yanlarda utility/actions), altında
  ortalanmış nav satırı (editorial/lüks marka deseni).
- `split`: üstte ince utility satırı (`utility` slotu, her zaman flat) + altta ana
  nav (IBM/SAP portal deseni).
- `capsule`: sayfa içeriğinden boşlukla ayrık yüzen tek kapsül; logo, linkler ve
  actions kapsül içinde kompakt dizilir (Apple deseni; bu varyant material
  ekseninden en çok glass'la yaşar ama flat'te de çalışır).
- `minimal`: logo + actions + hamburger — linkler her genişlikte menüde
  (landing/kampanya deseni).
- **Mobil:** dar viewport'ta linkler hamburger butonuna çöker; menü mevcut
  `GlassDrawer` ile açılır (portal + focus trap + kapanışta tetikleyiciye focus
  dönüşü sözleşmesi hazır gelir). Hamburger `GlassIconButton` + zorunlu `label`.
- Landmark: `<header>` + `<nav aria-label="Site">`; aktif linkte `aria-current="page"`.
- Cam üstüne cam yok: glass material'de linkler kapsayıcı İÇİNDE düz buton/anchor.

### 2. GlassHero (`src/components/GlassHero/`)

Katman: **içerik → zemin flat**; yalnız içindeki kontroller (CTA, arama) cam olabilir.

```ts
interface GlassHeroProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode        // CTA'lar
  media?: ReactNode          // split: yan panel; showcase: arka plan görseli
  search?: ReactNode         // arama slotu (ör. GlassSearchField kompozisyonu)
  quickLinks?: ReactNode     // search variantında başlık altı hızlı linkler
  variant?: 'search' | 'split' | 'showcase' | 'centered'   // default 'search'
  align?: 'center' | 'start' // default: search→center, diğerleri→start
  /** Başlık elementi — heading seviyesini sayfa belirler */
  titleAs?: 'h1' | 'h2' | 'div'               // default 'h2'
}
```

- `search` (default): merkez başlık + subtitle + `search` slotu + `quickLinks`
  (marketplace deseni — ArsaPazar ana sayfa hero'sunun component'leşmişi).
- `split`: sol metin + actions, sağ `media` paneli (SaaS/kurumsal tanıtım).
- `showcase`: tam genişlik `media` arka planı + gradyan overlay + üstte içerik.
  Overlay için `src/index.css`'e yeni `--lg-scrim` token'ı eklenir (Kağıt/Grafit
  değerleriyle; tek kaynak kuralı) — component CSS'i yalnız token'ı tüketir.
- `centered`: merkez başlık + subtitle + iki CTA (klasik SaaS merkez hero'su);
  `search` slotu yok, `actions` zorunlu görünümde.
- Başlık elementi `titleAs` prop'u ile sayfa tarafından belirlenir (default `'h2'`).
- Büyük yüzey: cam yok → tier/refraction endişesi yok. Animasyon yalnız
  transform/opacity/filter; `prefers-reduced-motion`'da kapalı.

### 3. GlassFooter (`src/components/GlassFooter/`)

Katman: **içerik → flat + hairline üst çizgi; cam yok.**

```ts
interface GlassFooterColumn {
  title: string
  links: { label: string; onClick?: () => void; href?: string }[]
}

interface GlassFooterProps {
  columns?: GlassFooterColumn[]   // columns/cta/newsletter variantları
  legal: ReactNode                // telif + yasal linkler satırı
  cta?: ReactNode                 // yalnız variant="cta": üst bant içeriği
  brand?: ReactNode               // logo/marka alanı (centered'da zorunlu görünüm)
  social?: ReactNode              // sosyal ikon linkleri satırı
  newsletter?: ReactNode          // yalnız variant="newsletter": kayıt formu slotu
  variant?: 'columns' | 'slim' | 'cta' | 'centered' | 'newsletter'   // default 'columns'
  tone?: 'light' | 'dark' | 'auto'
}
```

Beş varyant:

- `columns` (default): marka bloğu + 3-5 sütun link grubu
  (`<nav aria-label="Alt bilgi">`) + sosyal satırı + legal satırı.
- `slim`: tek satır — legal + birkaç link (PublicShell'in mevcut inline footer deseni).
- `cta`: üstte vurgulu CTA bandı (flat, tint zemin) + columns içeriği + legal.
- `centered`: ortalanmış marka + tek satır nav linkleri + sosyal ikonlar + legal
  (kompakt kurumsal desen).
- `newsletter`: üstte bülten kayıt bloğu (`newsletter` slotu — başlık + e-posta
  girişi + buton, demo-grade) + columns içeriği + legal.
- Landmark: `<footer>`; sütun başlıkları heading değil `<span>` + liste yapısı
  (`<ul>`), erişilebilir isimler nav aria-label'dan.

## Story matrisi (ComponentSablonu.mdx şablonu + seçim story'si)

Her component'te `title: 'Components/GlassX'`, autodocs ve şablonun zorunlu story'leri
(Default, eksen başına bir story, durum örnekleri). Ek olarak **her dosyada bir
"VaryantKarsilastirma" story'si**: TÜM varyantlar alt alta (header 5, hero 4,
footer 5), her biri etiketli ve **içi dolu** gerçek ArsaPazar içeriğiyle — logo
"ArsaPazar", tam nav seti (Emlak · Vasıta değil; arsa platformu: İlanlar, Harita,
Kurumsal, Yardım...), CTA'lar, hero'da çalışan arama alanı görünümü, footer'da dolu
link sütunları (Kurumsal, Destek, Yasal, Keşfet), sosyal linkler ve EİDS/güven
rozetleri. Kullanıcı nihai deseni bu story'lerden seçer.

## Testler (vitest + testing-library)

- Landmark ve aria sözleşmeleri: `banner`/`navigation`/`contentinfo` rolleri,
  `aria-current`, hamburger `label`.
- Variant sınıf/yapı değişimi: her variant'ta beklenen yapısal fark (utility satırı
  yalnız split'te, cta bandı yalnız cta'da…).
- Mobil menü: hamburger tıklaması GlassDrawer'ı açar, kapanışta focus hamburger'a döner.
- Controlled değil — bu component'ler stateless sunum; tek iç state mobil menü açık/kapalı.

## Kapsam dışı

- PublicShell/sayfaların yeni header/footer'a geçirilmesi (varyant seçiminden sonra
  ayrı iş).
- GlassNavbar'da herhangi bir değişiklik.
- Megamenü/çok seviyeli dropdown navigasyon (v2 — gerekirse GlassMenu ile).
- Gerçek routing (`href` demo'da `#` veya onClick noop).

## Tasarım sistemi bağları

- Ağırlıklı flat görünüm; cam yalnız header `material="glass"` seçilirse ve yalnız
  header kapsayıcısında (1 yüzey). Hero/footer her zaman flat. Sayfa başına ≤ 6 cam korunur.
- Component CSS'inde raw px/hex yasak (token fallback hariç); radius chip/media/card/
  capsule ölçeğinden; kontrol yükseklikleri `--lg-control-*`; hedefler ≥ 44px.
- Focus halkası `outline: 2px solid var(--lg-accent)` yalnız `:focus-visible`.
- Breakpoint yerine yetenek sorguları; ancak nav çökmesi için container/viewport
  genişlik sorgusu zorunlu ihtiyaç — `@media (max-width: …)` yerine önce
  `@container` değerlendirilir, pratik değilse media query gerekçesi rules.md'ye yazılır.
- Tema: Kağıt/Grafit her story'de doğrulanır.

## Doğrulama

- `npm test`, `npx tsc -b`, `npm run lint`, `npm run build` yeşil (lint: baseline
  hariç yeni hata yok).
- Storybook görsel kontrol: üç component'in karşılaştırma story'leri Kağıt/Grafit +
  320px'te taşmasız.
