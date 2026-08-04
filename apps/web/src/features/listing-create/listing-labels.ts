/* İnsan okunur etiketlerin tek kaynağı.

   Aynı il/ilçe/mülk sözlüğü daha önce dört ayrı dosyada kopyalanmıştı; canlı
   önizleme panelinin de aynı sözlüğe ihtiyacı olduğu için tek yere alındı. */

import type { PropertyFamily, TransactionType } from './listing-create-domain'

export const cityLabels: Record<string, string> = {
  izmir: 'İzmir',
  istanbul: 'İstanbul',
  ankara: 'Ankara',
}

export const districtLabels: Record<string, string> = {
  urla: 'Urla',
  çeşme: 'Çeşme',
  seferihisar: 'Seferihisar',
  kadıköy: 'Kadıköy',
  beşiktaş: 'Beşiktaş',
  sarıyer: 'Sarıyer',
  gölbaşı: 'Gölbaşı',
  çankaya: 'Çankaya',
}

export const neighborhoodLabels: Record<string, string> = {
  iskele: 'İskele',
  çeşmealtı: 'Çeşmealtı',
  zeytinalanı: 'Zeytinalanı',
  alaçatı: 'Alaçatı',
  ılıca: 'Ilıca',
  sığacık: 'Sığacık',
  camikebir: 'Camikebir',
  hıdırlık: 'Hıdırlık',
  caddebostan: 'Caddebostan',
  moda: 'Moda',
  etiler: 'Etiler',
  levent: 'Levent',
  bebek: 'Bebek',
  zekeriyaköy: 'Zekeriyaköy',
  tarabya: 'Tarabya',
  istinye: 'İstinye',
  incek: 'İncek',
  çukurambar: 'Çukurambar',
  oran: 'Oran',
  ayrancı: 'Ayrancı',
}

export const familyLabels: Record<Exclude<PropertyFamily, ''>, string> = {
  land: 'Arsa / Arazi',
  residential: 'Konut',
  commercial: 'İş yeri',
  building: 'Bina',
}

export const transactionLabels: Record<Exclude<TransactionType, ''>, string> = {
  sale: 'Satılık',
  rent: 'Kiralık',
}

/** İl · İlçe · Mahalle zinciri; boş halkalar sessizce atlanır. */
export function locationChain(location: {
  city: string
  district: string
  neighborhood: string
}): string {
  return [
    cityLabels[location.city],
    districtLabels[location.district],
    neighborhoodLabels[location.neighborhood] ?? location.neighborhood,
  ]
    .filter(Boolean)
    .join(' · ')
}
