import type { GlassSeoDiscoveryColumn } from '@repo/ui'
import { landImages } from '../fixtures'

// Footer üstü SEO rafının içeriği: arama niyetine göre dört küme, küme başına
// beş uzun kuyruk açılış sayfası. Bağlantı metni hedef sayfanın anahtar
// ifadesidir ("Balıkesir Ayvalık'ta zeytinlik sahibi olun"), kısaltılmış
// etiketi değil — kullanıcı da arama motoru da aynı cümleyi okur.
//
// href'ler bugün gerçek arama URL'lerine (`/emlak`) gider. Uzun kuyruk açılış
// sayfaları (`/emlak/ankara-yatirimlik-arsa` gibi) üretime alındığında yalnız
// bu dosyadaki href'ler değişir; raf ve sıralama aynı kalır.
// Not: `/arsa-ara` bilinçli olarak kullanılmaz — o yol `/emlak`'e 301 atar,
// hem kullanıcı hem bot bir adım fazla yürür.

interface SeoLinkSeed {
  id: string
  label: string
  meta: string
  href: string
}

interface SeoColumnSeed {
  id: string
  title: string
  hubLabel: string
  href: string
  links: SeoLinkSeed[]
}

const seoColumnSeeds: SeoColumnSeed[] = [
  {
    id: 'yatirim',
    title: 'Yatırımlık arsa',
    hubLabel: 'Tüm yatırımlık arsa sayfaları',
    href: '/emlak?category=land&sort=newest',
    links: [
      {
        id: 'ankara-yatirimlik',
        label: 'Ankara yatırımlık arsa fırsatları',
        meta: 'Ankara · 128 ilan',
        href: '/emlak?category=land&city=ankara&sort=unit-price',
      },
      {
        id: 'eskisehir-yol-cepheli',
        label: 'Eskişehir yol cepheli yatırımlık tarla',
        meta: 'Eskişehir · 64 ilan',
        href: '/emlak?category=land&city=eskişehir',
      },
      {
        id: 'silivri-imarli',
        label: 'İstanbul Silivri imarlı yatırım arsası',
        meta: 'İstanbul · 52 ilan',
        href: '/emlak?category=land&city=istanbul&district=silivri',
      },
      {
        id: 'konya-ucuz-arsa',
        label: 'Konya Karatay ucuz yatırımlık arsa',
        meta: 'Konya · 47 ilan',
        href: '/emlak?category=land&city=konya&district=karatay',
      },
      {
        id: 'kayseri-sanayi',
        label: 'Kayseri sanayi imarlı parsel',
        meta: 'Kayseri · 31 ilan',
        href: '/emlak?category=land&city=kayseri',
      },
    ],
  },
  {
    id: 'tarim',
    title: 'Tarım ve zeytinlik',
    hubLabel: 'Tüm tarım arazisi sayfaları',
    href: '/emlak?category=land&q=tarla',
    links: [
      {
        id: 'ege-zeytinlik',
        label: "Ege'de satılık zeytinlik",
        meta: 'İzmir, Muğla, Balıkesir · 96 ilan',
        href: '/emlak?category=land&q=zeytinlik',
      },
      {
        id: 'ayvalik-zeytinlik',
        label: "Balıkesir Ayvalık'ta zeytinlik sahibi olun",
        meta: 'Balıkesir · 38 ilan',
        href: '/emlak?category=land&city=balıkesir&district=ayvalık',
      },
      {
        id: 'malatya-kayisi',
        label: "Malatya'da satılık kayısı bahçesi",
        meta: 'Malatya · 24 ilan',
        href: '/emlak?category=land&city=malatya&q=kayısı',
      },
      {
        id: 'manisa-bag',
        label: "Manisa'da sulanabilir bağ arazisi",
        meta: 'Manisa · 41 ilan',
        href: '/emlak?category=land&city=manisa&q=bağ',
      },
      {
        id: 'antalya-sera',
        label: "Antalya'da seracılığa uygun tarla",
        meta: 'Antalya · 29 ilan',
        href: '/emlak?category=land&city=antalya&q=sera',
      },
    ],
  },
  {
    id: 'sahil',
    title: 'Deniz ve manzara',
    hubLabel: 'Tüm sahil bölgesi sayfaları',
    href: '/bolgeler',
    links: [
      {
        id: 'datca-manzara',
        label: 'Muğla Datça deniz manzaralı arsa',
        meta: 'Muğla · 57 ilan',
        href: '/emlak?category=land&city=muğla&district=datça',
      },
      {
        id: 'cesme-villa-imarli',
        label: "İzmir Çeşme'de villa imarlı arsa",
        meta: 'İzmir · 44 ilan',
        href: '/emlak?category=land&city=izmir&district=çeşme',
      },
      {
        id: 'kas-denize-yakin',
        label: "Antalya Kaş'ta denize yürüme mesafesi arsa",
        meta: 'Antalya · 22 ilan',
        href: '/emlak?category=land&city=antalya&district=kaş',
      },
      {
        id: 'assos-tas-ev',
        label: 'Çanakkale Assos taş ev yapılabilir arsa',
        meta: 'Çanakkale · 18 ilan',
        href: '/emlak?category=land&city=çanakkale&q=assos',
      },
      {
        id: 'edremit-bag-evi',
        label: "Balıkesir Edremit'te dağ manzaralı bağ evi arsası",
        meta: 'Balıkesir · 26 ilan',
        href: '/emlak?category=land&city=balıkesir&district=edremit',
      },
    ],
  },
  {
    id: 'yazlik',
    title: 'Hobi ve yazlık',
    hubLabel: 'Tüm hobi bahçesi sayfaları',
    href: '/emlak?category=land&q=hobi',
    links: [
      {
        id: 'catalca-hobi',
        label: "İstanbul Çatalca'da hobi bahçesi",
        meta: 'İstanbul · 33 ilan',
        href: '/emlak?category=land&city=istanbul&district=çatalca',
      },
      {
        id: 'sarkoy-yazlik',
        label: "Tekirdağ Şarköy'de yazlık arsa",
        meta: 'Tekirdağ · 39 ilan',
        href: '/emlak?category=land&city=tekirdağ&district=şarköy',
      },
      {
        id: 'iznik-gol-kenari',
        label: "Bursa İznik'te göl kenarı bahçe",
        meta: 'Bursa · 21 ilan',
        href: '/emlak?category=land&city=bursa&district=iznik',
      },
      {
        id: 'kandira-koy-evi',
        label: "Kocaeli Kandıra'da köy evi arsası",
        meta: 'Kocaeli · 17 ilan',
        href: '/emlak?category=land&city=kocaeli&district=kandıra',
      },
      {
        id: 'golbasi-mustakil',
        label: "Ankara Gölbaşı'nda müstakil ev arsası",
        meta: 'Ankara · 35 ilan',
        href: '/emlak?category=land&city=ankara&district=gölbaşı',
      },
    ],
  },
]

/**
 * Rafın kolonlarını üretir. Görseller dekoratiftir; her satır kendi sırasına
 * göre sabit bir arazi fotoğrafı alır (kolonlar arası tekrar kabul edilir —
 * bilgi metinde, görsel yalnız tarama ritmi için).
 */
export function buildSeoDiscoveryColumns(
  toHref: (href: string) => string,
): GlassSeoDiscoveryColumn[] {
  return seoColumnSeeds.map((column, columnIndex) => ({
    id: column.id,
    title: column.title,
    hubLabel: column.hubLabel,
    href: toHref(column.href),
    links: column.links.map((link, linkIndex) => ({
      id: link.id,
      label: link.label,
      meta: link.meta,
      href: toHref(link.href),
      image: landImages[(columnIndex * 2 + linkIndex) % landImages.length],
    })),
  }))
}

/** Rafın toplam bağlantı sayısı — blok başına 20-40 sınırının denetimi için. */
export const seoDiscoveryLinkCount = seoColumnSeeds.reduce(
  (total, column) => total + column.links.length + (column.href ? 1 : 0),
  0,
)
