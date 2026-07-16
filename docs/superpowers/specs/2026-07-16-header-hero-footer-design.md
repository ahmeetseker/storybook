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

### 1. GlassHeader v2 (`src/components/GlassHeader/`)

> **v2 revizyonu (2026-07-16, kullanıcı kararı):** v1'in beş varyantı "aynı
> anatominin yeniden dizilişi, jenerik" bulundu ve TAMAMEN değiştirildi. v2 seti
> web araştırması + Codex danışması sonucu seçilen, anatomileri gerçekten farklı
> dört konsepttir. Cam artık bir `material` ekseni DEĞİL — her varyantta tek
> küçük "liquid glass" state göstergesidir (seçili öğe vurgusu). `material` ve
> `utility` prop'ları kaldırıldı; ikili CTA kalıbı (ghost+dolu) bilinçli terk
> edildi: tek birincil `action` + sade metin `secondaryAction`.

Katman: navigasyon. Yüzeyler flat/saydam; cam yalnız aktif-öğe göstergesinde
(sidebar `layoutId` highlight deseninin cam versiyonu — `backdrop-filter: blur(8px)`
+ iç kenar ışıması, küçük alan).

```ts
interface GlassHeaderLink {
  label: string
  onClick?: () => void
  href?: string
  active?: boolean          // aria-current="page"
}

interface GlassHeaderProps {
  logo: ReactNode            // wordmark — harf-kutusu logo kalıbı kullanılmaz
  links?: GlassHeaderLink[]
  /** Tek birincil CTA (örn. "İlan Ver") */
  action?: ReactNode
  /** İkincil sade metin aksiyonu (örn. "Giriş Yap") — buton değil link görünümü */
  secondaryAction?: ReactNode
  /** masthead: wordmark karşısındaki otorite satırı (örn. "81 il · EİDS doğrulamalı") */
  meta?: ReactNode
  /** command: arama rayı slotu */
  search?: ReactNode
  /** command: scroll'da kapanmış özet içeriği (örn. "Urla · İmarlı · ≤3M") */
  searchSummary?: ReactNode
  variant?: 'islands' | 'command' | 'masthead' | 'overlay'   // default 'islands'
  sticky?: boolean           // default true (masthead'de yalnız indeks rayı sticky)
  menuLabel?: string         // default 'Menü'  (tone ekseni bilinçli yok — overlay metni --lg-on-scrim)
}
```

Dört varyant (anatomi ekseni):

- `islands` (default) — **Üç Ada / Yüzen Lens** (Linear/Stripe): kutusuz wordmark
  solda; YALNIZ nav ortada ince flat kapsülde (`--lg-surface` + hairline); sağda
  `secondaryAction` (metin) + tek `action` + profil/menü. Cam dokunuşu: seçili
  linkin arkasında link genişliğinde **kayan cam pill** (motion `layoutId`,
  `presets.springs.sidebar`). Scroll'da (data-scrolled) dikey padding küçülür,
  nav kapsülü hafif gölgelenir — "raya kenetlenme".
- `command` — **Arama Omurgası** (Airbnb/Zillow): merkez menü değil `search`
  slotu (Konum · İmar · Bütçe rayı); sağda aksiyonlar. Scroll'da ray
  `searchSummary` özetine kapanır (CSS transition), `:focus-within` yeniden
  açar. Cam dokunuşu: aktif arama segmentinin arkasında dar odak merceği
  (slot içi — demo'da story gösterir; component yalnız kapanma mekaniğini verir).
- `masthead` — **Kadastral Masthead** (The Modern House): sticky OLMAYAN kimlik
  satırı (büyük tracking'li wordmark + karşıda `meta`) + altında yalnız kendisi
  sticky 42px indeks nav rayı (üst+alt hairline). Cam dokunuşu: aktif bölümün
  altında kayan 24px **refraktif çizgi** (layoutId, 3px yükseklik + blur).
- `overlay` — **Galeri Eşiği** (Christie's): ilk fold'da yüzeysiz saydam şerit
  (hero görselinin ÜZERİNE `position: absolute`; metinler `--lg-on-scrim`);
  scroll eşiği geçilince yukarıdan süzülen kompakt opak ray (`position: fixed`,
  transform/opacity geçişi). Cam dokunuşu: aktif linkin yanında küçük cam boncuk.
  Not: Codex'in dikey köşe nav detayı v1 kapsamı dışında (rules.md Açık Kararlar).

Ortak sözleşme:

- Scroll durumu `useScrolled(threshold)` iç hook'u ile (passive scroll listener →
  kök `data-scrolled` attribute; görsel geçişler CSS transition'da, JS ölçüm yok).
- **Mobil:** dar viewport'ta linkler hamburger menüye çöker (GlassDrawer, v1
  sözleşmesi aynen: href'liler link, href'sizler buton).
- Landmark: `<header>` + `<nav aria-label="Site">`; aktif linkte
  `aria-current="page"`; kayan cam gösterge `aria-hidden` + reduced-motion'da
  `duration: 0`.
- Tipografi: nav 14px/500 `-0.01em`; wordmark sıkı tracking; kompakt yükseklikler
  (islands 52px ray, masthead indeksi 42px).
- Tek vurgu: amber yalnız aktif metin/focus/CTA'da; gri aktif-pill kalıbı yok.

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
