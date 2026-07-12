# İlan Detay Component Seti — Tasarım

Tarih: 2026-07-12 · Durum: Onaylandı

## Amaç

liquid-glass-ui kütüphanesine, sahibinden.com tarzı bir ilan detay sayfasını kurmaya yetecek
generic (domain'den bağımsız) component seti eklemek ve hepsini birleştiren tam sayfa demo
story'si sunmak.

## Kararlar

- **Görsel dil:** Liquid Glass — tüm parçalar `GlassSurface` üzerine kurulur, mevcut
  `thickness`/`tone`/`shape` ölçekleri kullanılır.
- **Konumlanma:** Generic `Glass*` component'leri (`src/components/`), ilan detay sayfası ise
  `src/demo/ListingDetailDemo.tsx` altında bunları birleştiren örnek.
- **Dosya düzeni:** Her component kendi klasöründe: `X.tsx` + `X.module.css` + `X.stories.tsx`
  + `X.test.tsx` + `index.ts`; `src/index.ts`'ten export edilir.

## Component'ler

| Component | Görev | Ana props |
|---|---|---|
| `GlassBadge` | Kapsül rozet (Acil, Yeni…) | `tint`, `children` |
| `GlassBreadcrumb` | Kategori yolu | `items: {label, onClick?}[]` |
| `GlassIconButton` | Yuvarlak ikon butonu (favori/paylaş/şikayet) | `label` (a11y), `active`, `tint` |
| `GlassGallery` | Ana görsel + thumbnail şeridi + oklar + lightbox | `images: {src, alt}[]`, `onIndexChange` |
| `GlassPriceHeader` | Başlık, fiyat, meta satırı, rozetler, aksiyonlar | `title`, `price`, `meta`, `badges`, `actions` |
| `GlassSpecTable` | Özellik tablosu | `items: {label, value}[]`, `columns` |
| `GlassTabs` | İçerik sekmeleri (GlassTabBar navigasyon içindir) | `tabs: {id, label, content}[]` |
| `GlassSellerCard` | Satıcı bilgisi, maskeli telefon, mesaj | `name`, `phone`, `onMessage`, `verified` |
| `GlassLocationCard` | Stilize harita placeholder'ı + adres | `address`, `onOpenMap` |
| `GlassListingCard` | Benzer ilan kartı | `image`, `title`, `price`, `location`, `badge` |
| `GlassCarousel` | Yatay kaydırma şeridi + ok butonları | `children` |

## Demo

`src/demo/ListingDetailDemo.tsx` + `ListingDetailDemo.stories.tsx` (`Demo/İlan Detay`):
üstte `GlassNavbar` + `GlassBreadcrumb`; solda `GlassGallery` + `GlassTabs`
(Açıklama / Özellikler / Konum); sağda `GlassPriceHeader` + `GlassSellerCard`;
altta `GlassCarousel` içinde `GlassListingCard`'lar. Örnek veri: otomobil ilanı.

## Detay kararları

- Demo görselleri SVG data-URI (dış bağımlılık yok, testler offline çalışır).
- Lightbox: dialog semantiği, Escape ile kapanır, ok tuşlarıyla gezinilir.
- Telefon gösterme: kart içi state; `onPhoneReveal` callback'i ile haber verir.
- Story'ler mevcut `DemoBackground` dekoratörüyle çalışır, Türkçe örnek içerik.
- Testler: render + temel etkileşim (sekme değişimi, lightbox, telefon gösterme) —
  vitest + @testing-library/react.

## Kapsam dışı

- Gerçek harita entegrasyonu, gerçek mesajlaşma/favori backend'i.
- sahibinden.com'un birebir görsel kopyası (yerleşim benzer, dil Liquid Glass).
