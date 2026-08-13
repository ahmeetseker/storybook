/**
 * Hesap bölümünün gezinme haritası — tek kaynak.
 *
 * Ray (`AccountNav`), üst şeritteki konum izi ve komut paleti aynı listeden
 * beslenir: yeni bir alt sayfa eklenince üç yer birden güncel kalır.
 */

/** Ray öğesinin kimliği; rota yolundan türetilen seçim de bu kimliği kullanır. */
export type AccountNavId =
  | 'ozet'
  | 'ilanlarim'
  | 'mesajlar'
  | 'bildirimler'
  | 'randevularim'
  | 'guvenlik'
  | 'hareketler'
  | 'kayitli-arama'
  | 'planim'
  | 'odemeler'
  | 'faturalarim'
  | 'ilan-ver'
  | 'favoriler'
  | 'karsilastir'
  | 'emlak'
  | 'ai-danisman'
  | 'site'

export interface AccountNavEntry {
  id: AccountNavId
  /** Ray etiketi */
  label: string
  /** Üst şeritteki konum izinde görünen başlık (kısa ve tekil) */
  title: string
  href: string
  /** Yol öneki eşleşmesi: alt yollar da bu öğeyi seçili yapar */
  matchPrefix?: boolean
  /**
   * Sayfa kabuğun kalan yüksekliğini tam kaplar ve kaydırmayı kendi içinde
   * yönetir (mesajlaşma gibi çalışma masası ekranları). Sayfa kaydırması olmaz.
   */
  fillsViewport?: boolean
}

export const accountNavEntries: readonly AccountNavEntry[] = [
  { id: 'ozet', label: 'Hesap özeti', title: 'Hesap özeti', href: '/hesabim' },
  { id: 'ilanlarim', label: 'İlanlarım', title: 'İlanlarım', href: '/hesabim/ilanlarim', matchPrefix: true },
  {
    id: 'mesajlar',
    label: 'Mesajlar',
    title: 'Mesajlar',
    href: '/hesabim/mesajlar',
    matchPrefix: true,
    fillsViewport: true,
  },
  { id: 'bildirimler', label: 'Bildirimler', title: 'Bildirimler', href: '/hesabim/bildirimler', matchPrefix: true },
  { id: 'randevularim', label: 'Randevularım', title: 'Randevularım', href: '/hesabim/randevularim', matchPrefix: true },
  { id: 'guvenlik', label: 'Güvenlik', title: 'Güvenlik ve doğrulama', href: '/hesabim/guvenlik', matchPrefix: true },
  { id: 'hareketler', label: 'Hesap hareketleri', title: 'Hesap hareketleri', href: '/hesabim/hareketler', matchPrefix: true },
  { id: 'kayitli-arama', label: 'Kayıtlı arama', title: 'Kayıtlı arama', href: '/hesabim/kayitli-arama', matchPrefix: true },
  { id: 'planim', label: 'Paketim', title: 'Paketim', href: '/hesabim/planim', matchPrefix: true },
  { id: 'odemeler', label: 'Ödemeler', title: 'Ödemeler', href: '/hesabim/odemeler', matchPrefix: true },
  { id: 'faturalarim', label: 'Faturalarım', title: 'Faturalarım', href: '/hesabim/faturalarim', matchPrefix: true },
  { id: 'ilan-ver', label: 'İlan ver', title: 'İlan ver', href: '/ilan-ver', matchPrefix: true },
  { id: 'favoriler', label: 'Favoriler', title: 'Favoriler', href: '/favoriler', matchPrefix: true },
  { id: 'karsilastir', label: 'Karşılaştırmalar', title: 'Karşılaştırmalar', href: '/karsilastir', matchPrefix: true },
  { id: 'emlak', label: 'Emlak ara', title: 'Emlak ara', href: '/emlak', matchPrefix: true },
  { id: 'ai-danisman', label: 'AI danışman', title: 'AI danışman', href: '/ai-danisman', matchPrefix: true },
  { id: 'site', label: 'Siteye dön', title: 'Anasayfa', href: '/' },
]

function normalize(pathname: string): string {
  return pathname !== '/' ? pathname.replace(/\/+$/, '') || '/' : '/'
}

/** Yola karşılık gelen ray öğesi; eşleşme yoksa `undefined`. */
export function accountNavEntryByPath(pathname: string): AccountNavEntry | undefined {
  const path = normalize(pathname)
  const exact = accountNavEntries.find((entry) => entry.href === path)
  if (exact) return exact

  return accountNavEntries
    .filter((entry) => entry.matchPrefix && path.startsWith(`${entry.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]
}

/** Seçili ray öğesinin kimliği (bilinmeyen yolda hiçbir öğe işaretlenmez). */
export function accountNavSelectedId(pathname: string): AccountNavId | undefined {
  return accountNavEntryByPath(pathname)?.id
}

/** Sayfa kabuğun kalan yüksekliğini kaplıyor mu (sayfa kaydırması kapalı)? */
export function accountSectionFillsViewport(pathname: string): boolean {
  return accountNavEntryByPath(pathname)?.fillsViewport ?? false
}

/** Üst şeritteki konum izinin son adımı. */
export function accountSectionTitle(pathname: string): string {
  return accountNavEntryByPath(pathname)?.title ?? 'Hesap özeti'
}
