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
- **Araştırma referansları:** tek satır bar (Stripe/Linear), yüzen kapsül nav
  (Apple.com), çift katlı utility+nav (IBM/SAP portal); marketplace arama hero'su,
  SaaS split hero, medya showcase hero; çok sütunlu enterprise footer, slim app
  footer, CTA bantlı pazarlama footer'ı.

## Component sözleşmeleri

### 1. GlassHeader (`src/components/GlassHeader/`)

Katman: **navigasyon → cam kullanabilir** (sayfada 1 cam yüzey harcar).

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
  variant?: 'bar' | 'capsule' | 'split'   // default 'bar'
  sticky?: boolean           // default true; position: sticky + scroll-edge
  tone?: 'light' | 'dark' | 'auto'
  /** Mobil menü başlığı — GlassDrawer'a geçer */
  menuLabel?: string         // default 'Menü'
}
```

- `bar` (default): tek cam şerit — logo sol, linkler orta, actions sağ.
- `capsule`: sayfa içeriğinden boşlukla ayrık yüzen tek cam kapsül; logo, linkler ve
  actions hepsi kapsülün içinde kompakt dizilir.
- `split`: üstte ince **flat** utility satırı (`utility` slotu) + altta cam ana nav.
- **Mobil:** dar viewport'ta (yetenek sorgusu: genişlik + `pointer: coarse`) linkler
  hamburger butonuna çöker; menü mevcut `GlassDrawer` ile açılır (portal + focus trap +
  kapanışta tetikleyiciye focus dönüşü sözleşmesi hazır gelir). Hamburger
  `GlassIconButton` + zorunlu `label`.
- Landmark: `<header>` + `<nav aria-label="Site">`; aktif linkte `aria-current="page"`.
- Cam üstüne cam yok: linkler kapsül İÇİNDE düz buton/anchor; yalnız kapsayıcı camdır.

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
  variant?: 'search' | 'split' | 'showcase'   // default 'search'
  align?: 'center' | 'start' // default: search→center, diğerleri→start
  /** Başlık elementi — heading seviyesini sayfa belirler */
  titleAs?: 'h1' | 'h2' | 'div'               // default 'h2'
  tone?: 'light' | 'dark' | 'auto'
}
```

- `search` (default): merkez başlık + subtitle + `search` slotu + `quickLinks`
  (marketplace deseni — ArsaPazar ana sayfa hero'sunun component'leşmişi).
- `split`: sol metin + actions, sağ `media` paneli (SaaS/kurumsal tanıtım).
- `showcase`: tam genişlik `media` arka planı + gradyan overlay + üstte içerik.
  Overlay için `src/index.css`'e yeni `--lg-scrim` token'ı eklenir (Kağıt/Grafit
  değerleriyle; tek kaynak kuralı) — component CSS'i yalnız token'ı tüketir.
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
  columns?: GlassFooterColumn[]   // columns/cta variantları
  legal: ReactNode                // telif + yasal linkler satırı
  cta?: ReactNode                 // yalnız variant="cta": üst bant içeriği
  variant?: 'columns' | 'slim' | 'cta'   // default 'columns'
  tone?: 'light' | 'dark' | 'auto'
}
```

- `columns` (default): 3-5 sütun link grubu (`<nav aria-label="Alt bilgi">`) + legal satırı.
- `slim`: tek satır — legal + birkaç link (PublicShell'in mevcut inline footer deseni).
- `cta`: üstte vurgulu CTA bandı (flat, tint zemin) + columns içeriği + legal.
- Landmark: `<footer>`; sütun başlıkları heading değil `<span>` + liste yapısı
  (`<ul>`), erişilebilir isimler nav aria-label'dan.

## Story matrisi (ComponentSablonu.mdx şablonu + seçim story'si)

Her component'te `title: 'Components/GlassX'`, autodocs ve şablonun zorunlu story'leri
(Default, eksen başına bir story, durum örnekleri). Ek olarak **her dosyada bir
"VaryantKarsilastirma" story'si**: üç variant alt alta, gerçek ArsaPazar içeriğiyle
(logo "ArsaPazar", gerçek nav linkleri, hero'da arama alanı, footer'da gerçek link
grupları) — kullanıcı nihai deseni bu story'den seçer.

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

- Cam yalnız header'da (1 yüzey); hero/footer flat. Sayfa başına ≤ 6 cam korunur.
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
